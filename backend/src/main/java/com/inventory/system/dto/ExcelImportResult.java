package com.inventory.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExcelImportResult {
    private String referenceNumber;
    private Long supplierId;
    private int successCount;
    private int totalCount;
    private List<String> errors;
}
