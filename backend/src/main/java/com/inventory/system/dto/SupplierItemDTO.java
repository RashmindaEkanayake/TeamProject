package com.inventory.system.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierItemDTO {
  private Long supplierItemId;

  @NotNull @Positive private Long itemId;

  @Size(max = 255)
  private String brand;

  @Size(max = 255)
  private String model;

  @Size(max = 100)
  private String supplierPartNumber;

  @NotNull
  @DecimalMin("0.00")
  @Digits(integer = 12, fraction = 2)
  private BigDecimal supplierPrice;

  @Min(0)
  private Integer supplyQuantity = 0;
}
