package com.inventory.system.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemDTO {
  @Positive private Long itemId;

  @com.fasterxml.jackson.annotation.JsonProperty(
      access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
  private BigDecimal salePrice;

  @NotBlank(message = "Brand is required")
  @Size(max = 255)
  private String brand;

  @NotBlank(message = "Model is required")
  @Size(max = 255)
  private String model;

  @NotBlank(message = "Category is required")
  @Size(max = 255)
  private String category;

  @NotBlank(message = "Part number is required")
  @Size(max = 255)
  private String partNumber;

  @Size(max = 10000)
  private String description;

  @Min(0)
  private Integer quantity;
}
