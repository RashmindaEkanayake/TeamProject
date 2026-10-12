package com.inventory.system.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {
  @NotNull @Positive private Long itemId;

  @NotNull
  @Min(1)
  private Integer quantity;

  @DecimalMin("0.00")
  @Digits(integer = 12, fraction = 2)
  private BigDecimal discountAmount = BigDecimal.ZERO;
}
