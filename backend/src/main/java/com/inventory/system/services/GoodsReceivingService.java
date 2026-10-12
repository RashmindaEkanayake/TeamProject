package com.inventory.system.services;

import com.inventory.system.dto.*;
import com.inventory.system.entities.*;
import com.inventory.system.exceptions.ResourceNotFoundException;
import com.inventory.system.repositories.*;
import java.math.*;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GoodsReceivingService {
  private final SupplierRepository supplierRepository;
  private final ItemRepository itemRepository;
  private final GoodsReceivingRepository goodsReceivingRepository;
  private final GoodsReceivingItemRepository goodsReceivingItemRepository;
  private final StockService stocks;
  @jakarta.persistence.PersistenceContext private jakarta.persistence.EntityManager em;

  public List<GoodsReceivingDTO> getAllReceivingLogs() {
    return goodsReceivingRepository.findAll().stream().map(this::convertToDTO).toList();
  }

  public GoodsReceivingDTO getReceivingById(Long id) {
    return convertToDTO(
        goodsReceivingRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Receiving not found")));
  }

  @Transactional(rollbackFor = Exception.class)
  public ExcelImportResult importGoodsFromExcel(
      MultipartFile file, Long supplierId, String reference, String actor, String notes) {
    if (file == null || file.isEmpty())
      throw new IllegalArgumentException("Choose a non-empty Excel file");
    if (reference == null || reference.isBlank() || reference.length() > 255)
      throw new IllegalArgumentException("Reference is required (maximum 255 characters)");
    if (notes != null && notes.length() > 255)
      throw new IllegalArgumentException("Notes must be 255 characters or less");
    reference = reference.trim();
    Supplier supplier =
        supplierRepository
            .findById(supplierId)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
    if (goodsReceivingRepository.findByReferenceNumber(reference).isPresent())
      throw new IllegalArgumentException("Reference already exists");
    List<String> errors = new ArrayList<>();
    List<GoodsReceivingItem> parsed = new ArrayList<>();
    Set<String> seen = new HashSet<>();
    int total = 0;
    try (java.io.InputStream input = file.getInputStream();
        Workbook book = WorkbookFactory.create(input)) {
      if (book.getNumberOfSheets() == 0)
        throw new IllegalArgumentException("Workbook has no sheet");
      Sheet sheet = book.getSheetAt(0);
      DataFormatter formatter = new DataFormatter();
      Row header = sheet.getRow(0);
      if (header == null
          || !"partNumber".equalsIgnoreCase(formatter.formatCellValue(header.getCell(0)).trim())
          || !"quantity".equalsIgnoreCase(formatter.formatCellValue(header.getCell(1)).trim())
          || !"costPrice".equalsIgnoreCase(formatter.formatCellValue(header.getCell(2)).trim()))
        throw new IllegalArgumentException("First row must be: partNumber, quantity, costPrice");
      if (sheet.getLastRowNum() > 10000)
        throw new IllegalArgumentException("Maximum 10,000 rows per import");
      for (int n = 1; n <= sheet.getLastRowNum(); n++) {
        Row row = sheet.getRow(n);
        if (row == null) continue;
        if (java.util.stream.IntStream.range(0, 3)
            .allMatch(c -> formatter.formatCellValue(row.getCell(c)).isBlank())) continue;
        total++;
        try {
          Cell part = row.getCell(0);
          if (part == null
              || part.getCellType() != CellType.STRING
              || part.getStringCellValue().isBlank())
            throw new IllegalArgumentException(
                "Part number must be non-empty text (preserves leading zeros)");
          String number = part.getStringCellValue().trim();
          if (!seen.add(number.toLowerCase(Locale.ROOT)))
            throw new IllegalArgumentException("Duplicate product: " + number);
          Item item =
              itemRepository
                  .findByPartNumber(number)
                  .orElseThrow(() -> new IllegalArgumentException("Unknown product: " + number));
          int quantity = decimal(row.getCell(1), "Quantity").intValueExact();
          if (quantity <= 0)
            throw new IllegalArgumentException("Quantity must be a positive whole number");
          BigDecimal cost = Money.value(decimal(row.getCell(2), "Cost price"));
          GoodsReceivingItem gi = new GoodsReceivingItem();
          gi.setItem(item);
          gi.setQuantityReceived(quantity);
          gi.setCostPrice(cost);
          gi.setVerificationStatus("UNVERIFIED");
          parsed.add(gi);
        } catch (Exception ex) {
          errors.add(
              "Row "
                  + (n + 1)
                  + ": "
                  + (ex instanceof ArithmeticException
                      ? "Quantity must be a whole number within range"
                      : ex.getMessage()));
        }
      }
    } catch (IllegalArgumentException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new IllegalArgumentException(
          "Unreadable Excel file. Upload a valid .xlsx or .xls workbook");
    }
    if (total == 0) errors.add("Workbook contains no data rows");
    // Atomic validation: one invalid row means no header or item is inserted.
    if (!errors.isEmpty()) return new ExcelImportResult(reference, supplierId, 0, total, errors);
    GoodsReceiving receipt = new GoodsReceiving();
    receipt.setSupplier(supplier);
    receipt.setReferenceNumber(reference);
    receipt.setReceivedBy(actor);
    receipt.setNotes(notes);
    receipt.setStatus("PENDING");
    receipt.setReceiveDate(LocalDateTime.now());
    for (GoodsReceivingItem gi : parsed) {
      gi.setGoodsReceiving(receipt);
      receipt.getItems().add(gi);
    }
    goodsReceivingRepository.save(receipt);
    return new ExcelImportResult(reference, supplierId, parsed.size(), total, List.of());
  }

  private BigDecimal decimal(Cell c, String label) {
    if (c == null) throw new IllegalArgumentException(label + " is required");
    if (c.getCellType() == CellType.NUMERIC) return BigDecimal.valueOf(c.getNumericCellValue());
    if (c.getCellType() == CellType.STRING) {
      try {
        return new BigDecimal(c.getStringCellValue().trim());
      } catch (NumberFormatException ex) {
        throw new IllegalArgumentException(label + " must be numeric");
      }
    }
    throw new IllegalArgumentException(label + " must be numeric (formulas are not accepted)");
  }

  @Transactional
  public GoodsReceivingItemDTO verifyGoodsReceivingItem(Long id, String status) {
    GoodsReceivingItem gi =
        goodsReceivingItemRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Receiving item not found"));
    GoodsReceiving receipt =
        goodsReceivingRepository
            .findLockedById(gi.getGoodsReceiving().getReceivingId())
            .orElseThrow();
    em.refresh(receipt);
    if (!"PENDING".equals(receipt.getStatus()))
      throw new IllegalStateException("Batch already decided");
    if (status == null
        || !List.of("ARRIVED", "MISSING", "DAMAGED").contains(status.toUpperCase(Locale.ROOT)))
      throw new IllegalArgumentException("Select ARRIVED, MISSING or DAMAGED");
    gi.setVerificationStatus(status.toUpperCase(Locale.ROOT));
    return convertToItemDTO(goodsReceivingItemRepository.save(gi));
  }

  @Transactional
  public GoodsReceivingDTO decideGoodsReceivingBatch(Long id, String decision) {
    GoodsReceiving receipt =
        goodsReceivingRepository
            .findLockedById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Receiving not found"));
    if (!"PENDING".equals(receipt.getStatus()))
      throw new IllegalStateException("Batch already decided");
    List<GoodsReceivingItem> items =
        goodsReceivingItemRepository.findByGoodsReceivingReceivingId(id);
    if ("VERIFY".equalsIgnoreCase(decision)) {
      if (items.isEmpty()
          || items.stream().anyMatch(i -> "UNVERIFIED".equals(i.getVerificationStatus())))
        throw new IllegalArgumentException("Verify every item before finalizing");
      for (GoodsReceivingItem gi :
          items.stream().sorted(Comparator.comparing(i -> i.getItem().getItemId())).toList())
        if ("ARRIVED".equals(gi.getVerificationStatus()))
          stocks.change(
              gi.getItem().getItemId(),
              gi.getQuantityReceived(),
              "RECEIVING",
              receipt.getReferenceNumber(),
              receipt.getReceivedBy());
      receipt.setStatus("VERIFIED");
    } else if ("REJECT".equalsIgnoreCase(decision)) receipt.setStatus("REJECTED");
    else throw new IllegalArgumentException("Decision must be VERIFY or REJECT");
    return convertToDTO(goodsReceivingRepository.save(receipt));
  }

  private GoodsReceivingDTO convertToDTO(GoodsReceiving gr) {
    GoodsReceivingDTO dto = new GoodsReceivingDTO();
    dto.setReceivingId(gr.getReceivingId());
    dto.setSupplierId(gr.getSupplier().getSupplierId());
    dto.setSupplierName(gr.getSupplier().getCompanyName());
    dto.setReceiveDate(gr.getReceiveDate());
    dto.setReferenceNumber(gr.getReferenceNumber());
    dto.setReceivedBy(gr.getReceivedBy());
    dto.setNotes(gr.getNotes());
    dto.setStatus(gr.getStatus());

    List<GoodsReceivingItem> entities =
        goodsReceivingItemRepository.findByGoodsReceivingReceivingId(gr.getReceivingId());
    List<GoodsReceivingItemDTO> itemDTOs =
        entities.stream().map(this::convertToItemDTO).collect(Collectors.toList());
    dto.setItems(itemDTOs);

    return dto;
  }

  private GoodsReceivingItemDTO convertToItemDTO(GoodsReceivingItem entity) {
    GoodsReceivingItemDTO dto = new GoodsReceivingItemDTO();
    dto.setReceivingItemId(entity.getReceivingItemId());
    dto.setItemId(entity.getItem().getItemId());
    dto.setBrand(entity.getItem().getBrand());
    dto.setModel(entity.getItem().getModel());
    dto.setPartNumber(entity.getItem().getPartNumber());
    dto.setQuantityReceived(entity.getQuantityReceived());
    dto.setCostPrice(entity.getCostPrice());
    dto.setVerificationStatus(entity.getVerificationStatus());
    return dto;
  }
}
