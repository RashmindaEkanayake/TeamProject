package com.inventory.system.controllers;

import com.inventory.system.dto.SupplierDTO;
import com.inventory.system.dto.SupplierItemDTO;
import com.inventory.system.services.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @GetMapping
    public ResponseEntity<List<SupplierDTO>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierDTO> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupplierDTO> createSupplier(@Valid @RequestBody SupplierDTO supplierDTO) {
        SupplierDTO created = supplierService.createSupplier(supplierDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupplierDTO> updateSupplier(@PathVariable Long id, @Valid @RequestBody SupplierDTO supplierDTO) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, supplierDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/items")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupplierItemDTO> linkItem(@PathVariable Long id, @Valid @RequestBody SupplierItemDTO itemDTO) {
        return ResponseEntity.ok(supplierService.linkItem(id, itemDTO));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unlinkItem(@PathVariable Long id, @PathVariable Long itemId) {
        supplierService.unlinkItem(id, itemId);
        return ResponseEntity.noContent().build();
    }
}
