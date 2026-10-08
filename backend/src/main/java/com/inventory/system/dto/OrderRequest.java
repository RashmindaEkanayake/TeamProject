package com.inventory.system.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
  @NotNull @Positive private Long customerId;
  @Positive private Long repId;

  @NotEmpty private List<@NotNull @Valid OrderItemRequest> items;
}
