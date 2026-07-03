package com.inventory.system.controllers;

import com.inventory.system.dto.ExcelImportResult;
import com.inventory.system.dto.GoodsReceivingDTO;
import com.inventory.system.dto.GoodsReceivingItemDTO;
import com.inventory.system.services.GoodsReceivingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/goods-receiving")
public class GoodsReceivingController {

    @Autowired
    private GoodsReceivingService goodsReceivingService;

    @GetMapping("/logs")
    public ResponseEntity<List<GoodsReceivingDTO>> getLogs() {
        return ResponseEntity.ok(goodsReceivingService.getAllReceivingLogs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoodsReceivingDTO> getReceivingById(@PathVariable Long id) {
        return ResponseEntity.ok(goodsReceivingService.getReceivingById(id));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExcelImportResult> uploadExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("supplierId") Long supplierId,
            @RequestParam("referenceNumber") String referenceNumber,
            @RequestParam(value = "receivedBy", required = false) String receivedBy,
            @RequestParam(value = "notes", required = false) String notes,
            Principal principal) {
        try {
            String uploader = receivedBy != null ? receivedBy : principal.getName();
            ExcelImportResult result = goodsReceivingService.importGoodsFromExcel(file, supplierId, referenceNumber, uploader, notes);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            ExcelImportResult errorResult = new ExcelImportResult();
            errorResult.setReferenceNumber(referenceNumber);
            errorResult.setSupplierId(supplierId);
            errorResult.setErrors(List.of("Error importing file: " + e.getMessage()));
            return ResponseEntity.badRequest().body(errorResult);
        }
    }

    @PutMapping("/items/{receivingItemId}/verify")
    public ResponseEntity<GoodsReceivingItemDTO> verifyItem(
            @PathVariable Long receivingItemId,
            @RequestParam("status") String status) {
        return ResponseEntity.ok(goodsReceivingService.verifyGoodsReceivingItem(receivingItemId, status));
    }

    @PostMapping("/{receivingId}/decision")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GoodsReceivingDTO> decideBatch(
            @PathVariable Long receivingId,
            @RequestParam("decision") String decision) {
        return ResponseEntity.ok(goodsReceivingService.decideGoodsReceivingBatch(receivingId, decision));
    }
}
