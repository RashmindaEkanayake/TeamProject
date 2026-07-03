package com.inventory.system.controllers;

import com.inventory.system.entities.PriceHistory;
import com.inventory.system.dto.PriceUpdateRequest;
import com.inventory.system.dto.ApprovalRequest;
import com.inventory.system.services.PriceApprovalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/price-approvals")
public class PriceApprovalController {

    @Autowired
    private PriceApprovalService priceApprovalService;

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PriceHistory>> getPendingPriceRequests() {
        return ResponseEntity.ok(priceApprovalService.getPendingPriceRequests());
    }

    @PostMapping("/request")
    public ResponseEntity<PriceHistory> submitPriceRequest(
            @Valid @RequestBody PriceUpdateRequest request,
            Principal principal) {
        String requestedBy = principal.getName();
        return ResponseEntity.ok(priceApprovalService.submitPriceRequest(request, requestedBy));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PriceHistory> approvePriceRequest(
            @PathVariable Long id,
            Principal principal) {
        String approvedBy = principal.getName();
        return ResponseEntity.ok(priceApprovalService.approvePriceRequest(id, approvedBy));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PriceHistory> rejectPriceRequest(
            @PathVariable Long id,
            Principal principal) {
        String approvedBy = principal.getName();
        return ResponseEntity.ok(priceApprovalService.rejectPriceRequest(id, approvedBy));
    }
}
