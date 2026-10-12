package com.inventory.system.controllers;

import com.inventory.system.dto.PriceUpdateRequest;
import com.inventory.system.entities.PriceHistory;
import com.inventory.system.services.PriceApprovalService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/price-approvals")
public class PriceApprovalController {

  @Autowired private PriceApprovalService priceApprovalService;

  @GetMapping("/mine")
  public ResponseEntity<List<PriceHistory>> mine(Principal principal) {
    return ResponseEntity.ok(priceApprovalService.getMine(principal.getName()));
  }

  @GetMapping("/history/{itemId}")
  public ResponseEntity<List<PriceHistory>> history(@PathVariable Long itemId) {
    return ResponseEntity.ok(priceApprovalService.getHistory(itemId));
  }

  @GetMapping("/pending")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<List<PriceHistory>> getPendingApprovals() {
    return ResponseEntity.ok(priceApprovalService.getPendingPriceRequests());
  }

  @PostMapping("/request")
  public ResponseEntity<PriceHistory> requestPriceChange(
      @Valid @RequestBody PriceUpdateRequest request, Principal principal) {
    return ResponseEntity.ok(priceApprovalService.submitPriceRequest(request, principal.getName()));
  }

  @PostMapping("/{id}/approve")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<PriceHistory> approvePrice(@PathVariable Long id, Principal principal) {
    return ResponseEntity.ok(priceApprovalService.approvePriceRequest(id, principal.getName()));
  }

  @PostMapping("/{id}/reject")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<PriceHistory> rejectPrice(@PathVariable Long id, Principal principal) {
    return ResponseEntity.ok(priceApprovalService.rejectPriceRequest(id, principal.getName()));
  }
}
