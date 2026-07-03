package com.inventory.system.controllers;

import com.inventory.system.entities.InventoryStock;
import com.inventory.system.services.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryStock>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<InventoryStock> getInventoryByItemId(@PathVariable Long itemId) {
        return ResponseEntity.ok(inventoryService.getInventoryByItemId(itemId));
    }

    @PutMapping("/{itemId}/adjust")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryStock> adjustStockQuantity(
            @PathVariable Long itemId, 
            @RequestParam Integer adjustment) {
        return ResponseEntity.ok(inventoryService.adjustStockQuantity(itemId, adjustment));
    }
}
