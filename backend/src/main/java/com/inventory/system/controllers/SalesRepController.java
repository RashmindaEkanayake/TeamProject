package com.inventory.system.controllers;

import com.inventory.system.dto.SalesRepDTO;
import com.inventory.system.services.SalesRepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/sales-reps")
public class SalesRepController {

    @Autowired
    private SalesRepService salesRepService;

    @GetMapping
    public ResponseEntity<List<SalesRepDTO>> getAllSalesReps() {
        return ResponseEntity.ok(salesRepService.getAllSalesReps());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesRepDTO> getSalesRepById(@PathVariable Long id) {
        return ResponseEntity.ok(salesRepService.getSalesRepById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalesRepDTO> createSalesRep(@Valid @RequestBody SalesRepDTO salesRepDTO) {
        SalesRepDTO created = salesRepService.createSalesRep(salesRepDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalesRepDTO> updateSalesRep(@PathVariable Long id, @Valid @RequestBody SalesRepDTO salesRepDTO) {
        return ResponseEntity.ok(salesRepService.updateSalesRep(id, salesRepDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSalesRep(@PathVariable Long id) {
        salesRepService.deleteSalesRep(id);
        return ResponseEntity.noContent().build();
    }
}
