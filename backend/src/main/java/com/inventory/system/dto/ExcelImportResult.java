package com.inventory.system.dto;

import jakarta.validation.constraints.*;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExcelImportResult {
  @Size(max = 255)
  private String referenceNumber;

  private Long supplierId;
  private int successCount;
  private int totalCount;
  private List<String> errors;
}
