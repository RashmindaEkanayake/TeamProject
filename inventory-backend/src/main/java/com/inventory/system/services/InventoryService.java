package com.inventory.system.services;

import com.inventory.system.entities.InventoryStock;
import com.inventory.system.exceptions.ResourceNotFoundException;
import com.inventory.system.exceptions.InsufficientStockException;
import com.inventory.system.repositories.InventoryStockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private InventoryStockRepository inventoryStockRepository;

    public List<InventoryStock> getAllInventory() {
        return inventoryStockRepository.findAll();
    }

    public InventoryStock getInventoryByItemId(Long itemId) {
        return inventoryStockRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory stock record not found for Item ID: " + itemId));
    }

    @Transactional
    public InventoryStock adjustStockQuantity(Long itemId, Integer adjustment) {
        if (adjustment == null) {
            throw new IllegalArgumentException("Stock adjustment quantity cannot be null");
        }

        InventoryStock stock = getInventoryByItemId(itemId);
        int newQuantity = stock.getCurrentQuantity() + adjustment;

        if (newQuantity < 0) {
            throw new InsufficientStockException("Insufficient stock for Item: " + stock.getItem().getModel() + 
                    ". Available stock: " + stock.getCurrentQuantity() + ", requested adjustment: " + adjustment);
        }

        stock.setCurrentQuantity(newQuantity);
        stock.setLastUpdated(LocalDateTime.now());
        return inventoryStockRepository.save(stock);
    }
}
