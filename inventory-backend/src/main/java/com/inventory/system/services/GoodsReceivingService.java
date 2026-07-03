package com.inventory.system.services;

import com.inventory.system.entities.*;
import com.inventory.system.dto.ExcelImportResult;
import com.inventory.system.dto.GoodsReceivingDTO;
import com.inventory.system.dto.GoodsReceivingItemDTO;
import com.inventory.system.exceptions.ResourceNotFoundException;
import com.inventory.system.repositories.*;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GoodsReceivingService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private GoodsReceivingRepository goodsReceivingRepository;

    @Autowired
    private GoodsReceivingItemRepository goodsReceivingItemRepository;

    @Autowired
    private InventoryStockRepository stockRepository;

    public List<GoodsReceivingDTO> getAllReceivingLogs() {
        return goodsReceivingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GoodsReceivingDTO getReceivingById(Long id) {
        GoodsReceiving gr = goodsReceivingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goods Receiving log not found with ID: " + id));
        return convertToDTO(gr);
    }

    @Transactional
    public ExcelImportResult importGoodsFromExcel(MultipartFile file, Long supplierId, String referenceNumber, String receivedBy, String notes) throws Exception {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + supplierId));

        // Optional check: Reference number should be unique
        goodsReceivingRepository.findByReferenceNumber(referenceNumber).ifPresent(existing -> {
            throw new IllegalArgumentException("Reference number already exists: " + referenceNumber);
        });

        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int totalRows = 0;

        GoodsReceiving receiptHeader = new GoodsReceiving();
        receiptHeader.setSupplier(supplier);
        receiptHeader.setReferenceNumber(referenceNumber);
        receiptHeader.setReceivedBy(receivedBy != null ? receivedBy : "Staff");
        receiptHeader.setNotes(notes);
        receiptHeader.setStatus("PENDING");
        receiptHeader.setReceiveDate(LocalDateTime.now());
        
        receiptHeader = goodsReceivingRepository.save(receiptHeader);

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.rowIterator();

            // Skip header row
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                totalRows++;
                
                try {
                    Cell partNumCell = row.getCell(0);
                    Cell qtyCell = row.getCell(1);
                    Cell costCell = row.getCell(2);

                    if (partNumCell == null || qtyCell == null || costCell == null) {
                        errors.add("Row " + (row.getRowNum() + 1) + ": Missing required column values.");
                        continue;
                    }

                    String partNumber = getCellValueAsString(partNumCell).trim();
                    if (partNumber.isEmpty()) {
                        errors.add("Row " + (row.getRowNum() + 1) + ": Part number is empty.");
                        continue;
                    }

                    Optional<Item> itemOpt = itemRepository.findByPartNumber(partNumber);
                    if (itemOpt.isEmpty()) {
                        errors.add("Row " + (row.getRowNum() + 1) + ": Part number '" + partNumber + "' does not exist in catalog.");
                        continue;
                    }
                    Item item = itemOpt.get();

                    double quantityDouble = getCellValueAsDouble(qtyCell);
                    int quantity = (int) quantityDouble;
                    if (quantity <= 0) {
                        errors.add("Row " + (row.getRowNum() + 1) + ": Quantity must be greater than zero. Found: " + quantity);
                        continue;
                    }

                    double costPrice = getCellValueAsDouble(costCell);
                    if (costPrice < 0) {
                        errors.add("Row " + (row.getRowNum() + 1) + ": Cost price cannot be negative. Found: " + costPrice);
                        continue;
                    }

                    // Save receipt detail with default verificationStatus "ARRIVED"
                    GoodsReceivingItem receivingItem = new GoodsReceivingItem();
                    receivingItem.setGoodsReceiving(receiptHeader);
                    receivingItem.setItem(item);
                    receivingItem.setQuantityReceived(quantity);
                    receivingItem.setCostPrice(costPrice);
                    receivingItem.setVerificationStatus("ARRIVED");
                    goodsReceivingItemRepository.save(receivingItem);

                    successCount++;
                } catch (Exception e) {
                    errors.add("Row " + (row.getRowNum() + 1) + ": Unexpected format error: " + e.getMessage());
                }
            }
        }

        ExcelImportResult result = new ExcelImportResult();
        result.setReferenceNumber(referenceNumber);
        result.setSupplierId(supplierId);
        result.setSuccessCount(successCount);
        result.setTotalCount(totalRows);
        result.setErrors(errors);

        return result;
    }

    @Transactional
    public GoodsReceivingItemDTO verifyGoodsReceivingItem(Long receivingItemId, String status) {
        GoodsReceivingItem item = goodsReceivingItemRepository.findById(receivingItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Goods Receiving Item not found with ID: " + receivingItemId));

        if (!"PENDING".equals(item.getGoodsReceiving().getStatus())) {
            throw new IllegalStateException("Cannot verify items in a batch that is already " + item.getGoodsReceiving().getStatus());
        }

        String statusUpper = status.toUpperCase();
        if (!Arrays.asList("ARRIVED", "MISSING", "DAMAGED").contains(statusUpper)) {
            throw new IllegalArgumentException("Invalid verification status. Must be ARRIVED, MISSING, or DAMAGED.");
        }

        item.setVerificationStatus(statusUpper);
        GoodsReceivingItem saved = goodsReceivingItemRepository.save(item);
        return convertToItemDTO(saved);
    }

    @Transactional
    public GoodsReceivingDTO decideGoodsReceivingBatch(Long receivingId, String decision) {
        GoodsReceiving receipt = goodsReceivingRepository.findById(receivingId)
                .orElseThrow(() -> new ResourceNotFoundException("Goods Receiving log not found with ID: " + receivingId));

        if (!"PENDING".equals(receipt.getStatus())) {
            throw new IllegalStateException("Goods Receiving batch is not pending decision. Current status: " + receipt.getStatus());
        }

        String decisionUpper = decision.toUpperCase();
        if ("VERIFY".equals(decisionUpper) || "VERIFIED".equals(decisionUpper)) {
            receipt.setStatus("VERIFIED");
            
            // Fetch all items and update stock only for those marked "ARRIVED"
            List<GoodsReceivingItem> items = goodsReceivingItemRepository.findByGoodsReceivingReceivingId(receivingId);
            for (GoodsReceivingItem gi : items) {
                if ("ARRIVED".equals(gi.getVerificationStatus())) {
                    Optional<InventoryStock> stockOpt = stockRepository.findById(gi.getItem().getItemId());
                    if (stockOpt.isPresent()) {
                        InventoryStock stock = stockOpt.get();
                        stock.setCurrentQuantity(stock.getCurrentQuantity() + gi.getQuantityReceived());
                        stockRepository.save(stock);
                    } else {
                        InventoryStock stock = new InventoryStock();
                        stock.setItemId(gi.getItem().getItemId());
                        stock.setItem(gi.getItem());
                        stock.setCurrentQuantity(gi.getQuantityReceived());
                        stock.setMinimumStockLevel(10);
                        stockRepository.save(stock);
                    }
                }
            }
        } else if ("REJECT".equals(decisionUpper) || "REJECTED".equals(decisionUpper)) {
            receipt.setStatus("REJECTED");
        } else {
            throw new IllegalArgumentException("Invalid decision. Must be VERIFIED (VERIFY) or REJECTED (REJECT).");
        }

        GoodsReceiving saved = goodsReceivingRepository.save(receipt);
        return convertToDTO(saved);
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

        List<GoodsReceivingItem> entities = goodsReceivingItemRepository.findByGoodsReceivingReceivingId(gr.getReceivingId());
        List<GoodsReceivingItemDTO> itemDTOs = entities.stream()
                .map(this::convertToItemDTO)
                .collect(Collectors.toList());
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

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        CellType cellType = cell.getCellType();
        if (cellType == CellType.STRING) {
            return cell.getStringCellValue();
        } else if (cellType == CellType.NUMERIC) {
            return String.valueOf((long) cell.getNumericCellValue());
        } else if (cellType == CellType.BOOLEAN) {
            return String.valueOf(cell.getBooleanCellValue());
        }
        return "";
    }

    private double getCellValueAsDouble(Cell cell) {
        if (cell == null) return 0;
        CellType cellType = cell.getCellType();
        if (cellType == CellType.NUMERIC) {
            return cell.getNumericCellValue();
        } else if (cellType == CellType.STRING) {
            try {
                return Double.parseDouble(cell.getStringCellValue().trim());
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        return 0;
    }
}
