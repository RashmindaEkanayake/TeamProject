package com.inventory.system.controllers;

import com.inventory.system.entities.InventoryStock;
import com.inventory.system.exceptions.ResourceNotFoundException;
import com.inventory.system.repositories.InventoryStockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryStockRepository stockRepository;

    @GetMapping
    public ResponseEntity<List<InventoryStock>> getAllStock() {
        return ResponseEntity.ok(stockRepository.findAll());
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<InventoryStock> getStockById(@PathVariable Long itemId) {
        InventoryStock stock = stockRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory stock not found for Item ID: " + itemId));
        return ResponseEntity.ok(stock);
    }

    @PutMapping("/{itemId}/adjust")
    public ResponseEntity<InventoryStock> adjustStock(
            @PathVariable Long itemId,
            @RequestParam("adjustment") Integer adjustment) {
        InventoryStock stock = stockRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory stock not found for Item ID: " + itemId));

        int newQty = stock.getCurrentQuantity() + adjustment;
        if (newQty < 0) newQty = 0;
        stock.setCurrentQuantity(newQty);
        stock.setLastUpdated(LocalDateTime.now());
        return ResponseEntity.ok(stockRepository.save(stock));
    }
}
