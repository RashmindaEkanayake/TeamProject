package com.inventory.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierItemDTO {
    private Long supplierItemId;

    @NotNull
    private Long itemId;

    private String brand;
    private String model;
    private String supplierPartNumber;

    @NotNull
    private Double supplierPrice;

    private Integer supplyQuantity = 0;
}
