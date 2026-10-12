package com.inventory.system.controllers;

import com.inventory.system.entities.StockMovement;
import com.inventory.system.services.ReportService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
  private final ReportService reports;

  @GetMapping("/summary")
  @PreAuthorize("hasRole('ADMIN')")
  public ReportService.Summary summary() {
    return reports.summary();
  }

  @GetMapping("/movements/{itemId}")
  @PreAuthorize("hasRole('ADMIN')")
  public List<StockMovement> movements(@PathVariable Long itemId) {
    return reports.itemMovements(itemId);
  }
}
