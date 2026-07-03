package com.inventory.system.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierItemDTO {
    private Long supplierItemId;

    @NotNull(message = "Item ID is required")
    private Long itemId;

    private String brand;
    private String model;
    private String supplierPartNumber;

    @NotNull(message = "Supplier price is required")
    @Min(value = 0, message = "Supplier price must be at least 0")
    private Double supplierPrice;

    @NotNull(message = "Supply quantity is required")
    @Min(value = 0, message = "Supply quantity must be at least 0")
    private Integer supplyQuantity;
}
