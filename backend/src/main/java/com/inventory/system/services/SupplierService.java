package com.inventory.system.services;

import com.inventory.system.dto.SupplierDTO;
import com.inventory.system.dto.SupplierItemDTO;
import com.inventory.system.entities.Item;
import com.inventory.system.entities.Supplier;
import com.inventory.system.entities.SupplierItem;
import com.inventory.system.exceptions.ResourceNotFoundException;
import com.inventory.system.repositories.ItemRepository;
import com.inventory.system.repositories.SupplierItemRepository;
import com.inventory.system.repositories.SupplierRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SupplierService {

  @Autowired private SupplierRepository supplierRepository;

  @Autowired private SupplierItemRepository supplierItemRepository;

  @Autowired private ItemRepository itemRepository;

  public List<SupplierDTO> getAllSuppliers() {
    return supplierRepository.findAll().stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
  }

  public SupplierDTO getSupplierById(Long id) {
    Supplier supplier =
        supplierRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));
    return convertToDTO(supplier);
  }

  @Transactional
  public SupplierDTO createSupplier(SupplierDTO dto) {
    Supplier supplier = convertToEntity(dto);
    Supplier savedSupplier = supplierRepository.save(supplier);

    if (dto.getSupplierItems() != null) {
      for (SupplierItemDTO itemDto : dto.getSupplierItems()) {
        linkItemInternal(savedSupplier, itemDto);
      }
    }

    return convertToDTO(savedSupplier);
  }

  @Transactional
  public SupplierDTO updateSupplier(Long id, SupplierDTO dto) {
    Supplier existing =
        supplierRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));

    existing.setCompanyName(dto.getCompanyName());
    existing.setCompanyEmail(dto.getCompanyEmail());
    existing.setContactNumber(dto.getContactNumber());
    existing.setFax(dto.getFax());
    existing.setCountry(dto.getCountry());
    existing.setBankDetails(dto.getBankDetails());
    existing.setContactPerson(dto.getContactPerson());
    existing.setContactPersonNumber(dto.getContactPersonNumber());
    existing.setPersonEmail(dto.getPersonEmail());

    Supplier savedSupplier = supplierRepository.save(existing);
    return convertToDTO(savedSupplier);
  }

  @Transactional
  public void deleteSupplier(Long id) {
    if (!supplierRepository.existsById(id)) {
      throw new ResourceNotFoundException("Supplier not found with ID: " + id);
    }
    supplierRepository.deleteById(id);
  }

  @Transactional
  public SupplierItemDTO linkItem(Long supplierId, SupplierItemDTO itemDTO) {
    Supplier supplier =
        supplierRepository
            .findById(supplierId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Supplier not found with ID: " + supplierId));
    return linkItemInternal(supplier, itemDTO);
  }

  private SupplierItemDTO linkItemInternal(Supplier supplier, SupplierItemDTO itemDTO) {
    Item item =
        itemRepository
            .findById(itemDTO.getItemId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Item not found with ID: " + itemDTO.getItemId()));

    SupplierItem supplierItem =
        supplierItemRepository
            .findBySupplierSupplierIdAndItemItemId(supplier.getSupplierId(), item.getItemId())
            .orElse(new SupplierItem());

    supplierItem.setSupplier(supplier);
    supplierItem.setItem(item);
    supplierItem.setSupplierPartNumber(itemDTO.getSupplierPartNumber());
    supplierItem.setSupplierPrice(itemDTO.getSupplierPrice());
    supplierItem.setSupplyQuantity(
        itemDTO.getSupplyQuantity() != null ? itemDTO.getSupplyQuantity() : 0);

    SupplierItem saved = supplierItemRepository.save(supplierItem);
    return convertToSupplierItemDTO(saved);
  }

  @Transactional
  public void unlinkItem(Long supplierId, Long itemId) {
    SupplierItem supplierItem =
        supplierItemRepository
            .findBySupplierSupplierIdAndItemItemId(supplierId, itemId)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Catalog link not found for supplier "
                            + supplierId
                            + " and item "
                            + itemId));
    supplierItemRepository.delete(supplierItem);
  }

  private SupplierDTO convertToDTO(Supplier supplier) {
    SupplierDTO dto = new SupplierDTO();
    dto.setSupplierId(supplier.getSupplierId());
    dto.setCompanyName(supplier.getCompanyName());
    dto.setCompanyEmail(supplier.getCompanyEmail());
    dto.setContactNumber(supplier.getContactNumber());
    dto.setFax(supplier.getFax());
    dto.setCountry(supplier.getCountry());
    dto.setBankDetails(supplier.getBankDetails());
    dto.setContactPerson(supplier.getContactPerson());
    dto.setContactPersonNumber(supplier.getContactPersonNumber());
    dto.setPersonEmail(supplier.getPersonEmail());

    List<SupplierItemDTO> itemDTOs =
        supplierItemRepository.findBySupplierSupplierId(supplier.getSupplierId()).stream()
            .map(this::convertToSupplierItemDTO)
            .collect(Collectors.toList());
    dto.setSupplierItems(itemDTOs);

    return dto;
  }

  private SupplierItemDTO convertToSupplierItemDTO(SupplierItem entity) {
    SupplierItemDTO dto = new SupplierItemDTO();
    dto.setSupplierItemId(entity.getSupplierItemId());
    dto.setItemId(entity.getItem().getItemId());
    dto.setBrand(entity.getItem().getBrand());
    dto.setModel(entity.getItem().getModel());
    dto.setSupplierPartNumber(entity.getSupplierPartNumber());
    dto.setSupplierPrice(entity.getSupplierPrice());
    dto.setSupplyQuantity(entity.getSupplyQuantity());
    return dto;
  }

  private Supplier convertToEntity(SupplierDTO dto) {
    Supplier supplier = new Supplier();
    supplier.setSupplierId(null);
    supplier.setCompanyName(dto.getCompanyName());
    supplier.setCompanyEmail(dto.getCompanyEmail());
    supplier.setContactNumber(dto.getContactNumber());
    supplier.setFax(dto.getFax());
    supplier.setCountry(dto.getCountry());
    supplier.setBankDetails(dto.getBankDetails());
    supplier.setContactPerson(dto.getContactPerson());
    supplier.setContactPersonNumber(dto.getContactPersonNumber());
    supplier.setPersonEmail(dto.getPersonEmail());
    return supplier;
  }
}
