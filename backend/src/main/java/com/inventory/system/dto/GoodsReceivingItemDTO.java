package com.inventory.system.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoodsReceivingItemDTO {
  private Long receivingItemId;
  @Positive private Long itemId;

  @Size(max = 255)
  private String brand;

  @Size(max = 255)
  private String model;

  @Size(max = 255)
  private String partNumber;

  @Min(0)
  private Integer quantityReceived;

  @DecimalMin("0.00")
  @Digits(integer = 12, fraction = 2)
  private BigDecimal costPrice;

  @Size(max = 255)
  private String verificationStatus;
}
