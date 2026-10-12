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
public class PriceUpdateRequest {
  @NotNull @Positive private Long itemId;

  @NotNull
  @DecimalMin("0.00")
  @Digits(integer = 12, fraction = 2)
  private BigDecimal retailPrice;

  @NotNull
  @DecimalMin("0.00")
  @Digits(integer = 12, fraction = 2)
  private BigDecimal importPrice;

  @NotNull
  @DecimalMin("0.00")
  @Digits(integer = 12, fraction = 2)
  private BigDecimal salePrice;
}
