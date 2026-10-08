package com.inventory.system.controllers;

import com.inventory.system.entities.InventoryStock;
import com.inventory.system.exceptions.ResourceNotFoundException;
import com.inventory.system.repositories.InventoryStockRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

  @Autowired private InventoryStockRepository stockRepository;
  @Autowired private com.inventory.system.services.StockService stocks;

  @GetMapping
  public ResponseEntity<List<InventoryStock>> getAllStock() {
    return ResponseEntity.ok(stockRepository.findAll());
  }

  @GetMapping("/{itemId}")
  public ResponseEntity<InventoryStock> getStockById(@PathVariable Long itemId) {
    InventoryStock stock =
        stockRepository
            .findById(itemId)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Inventory stock not found for Item ID: " + itemId));
    return ResponseEntity.ok(stock);
  }

  @PutMapping("/{itemId}/adjust")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<InventoryStock> adjustStock(
      @PathVariable Long itemId,
      @RequestParam Integer adjustment,
      java.security.Principal principal) {
    if (adjustment == 0) throw new IllegalArgumentException("Adjustment cannot be zero");
    return ResponseEntity.ok(
        stocks.change(itemId, adjustment, "ADJUSTMENT", "MANUAL", principal.getName()));
  }
}
