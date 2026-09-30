package com.inventory.system.services;

import com.inventory.system.dto.ItemDTO;
import com.inventory.system.entities.Item;
import com.inventory.system.entities.InventoryStock;
import com.inventory.system.exceptions.ResourceNotFoundException;
import com.inventory.system.repositories.ItemRepository;
import com.inventory.system.repositories.InventoryStockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private InventoryStockRepository inventoryStockRepository;

    public List<ItemDTO> getAllItems() {
        return itemRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ItemDTO getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));
        return convertToDTO(item);
    }

    @Transactional
    public ItemDTO createItem(ItemDTO dto) {
        itemRepository.findByPartNumber(dto.getPartNumber()).ifPresent(existing -> {
            throw new IllegalArgumentException("Part number already exists: " + dto.getPartNumber());
        });

        Item item = convertToEntity(dto);
        Item savedItem = itemRepository.save(item);

        InventoryStock stock = new InventoryStock();
        stock.setItemId(savedItem.getItemId());
        stock.setItem(savedItem);
        stock.setCurrentQuantity(dto.getQuantity() != null ? dto.getQuantity() : 0);
        stock.setMinimumStockLevel(10); // default minimum stock level
        stock.setLastUpdated(LocalDateTime.now());
        inventoryStockRepository.save(stock);

        return convertToDTO(savedItem);
    }

    @Transactional
    public ItemDTO updateItem(Long id, ItemDTO dto) {
        Item existingItem = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        if (!existingItem.getPartNumber().equalsIgnoreCase(dto.getPartNumber())) {
            itemRepository.findByPartNumber(dto.getPartNumber()).ifPresent(existing -> {
                throw new IllegalArgumentException("Part number already exists: " + dto.getPartNumber());
            });
        }

        existingItem.setBrand(dto.getBrand());
        existingItem.setModel(dto.getModel());
        existingItem.setCategory(dto.getCategory());
        existingItem.setPartNumber(dto.getPartNumber());
        existingItem.setDescription(dto.getDescription());
        Item savedItem = itemRepository.save(existingItem);

        InventoryStock stock = inventoryStockRepository.findById(id)
                .orElseGet(() -> {
                    InventoryStock newStock = new InventoryStock();
                    newStock.setItemId(savedItem.getItemId());
                    newStock.setItem(savedItem);
                    newStock.setMinimumStockLevel(10);
                    return newStock;
                });
        if (dto.getQuantity() != null) {
            stock.setCurrentQuantity(dto.getQuantity());
        }
        stock.setLastUpdated(LocalDateTime.now());
        inventoryStockRepository.save(stock);

        return convertToDTO(savedItem);
    }

    @Transactional
    public void deleteItem(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Item not found with ID: " + id);
        }
        inventoryStockRepository.deleteById(id);
        itemRepository.deleteById(id);
    }

    private ItemDTO convertToDTO(Item item) {
        ItemDTO dto = new ItemDTO();
        dto.setItemId(item.getItemId());
        dto.setBrand(item.getBrand());
        dto.setModel(item.getModel());
        dto.setCategory(item.getCategory());
        dto.setPartNumber(item.getPartNumber());
        dto.setDescription(item.getDescription());

        inventoryStockRepository.findById(item.getItemId())
                .ifPresentOrElse(
                        stock -> dto.setQuantity(stock.getCurrentQuantity()),
                        () -> dto.setQuantity(0)
                );

        return dto;
    }

    private Item convertToEntity(ItemDTO dto) {
        Item item = new Item();
        item.setItemId(dto.getItemId());
        item.setBrand(dto.getBrand());
        item.setModel(dto.getModel());
        item.setCategory(dto.getCategory());
        item.setPartNumber(dto.getPartNumber());
        item.setDescription(dto.getDescription());
        return item;
    }
}
