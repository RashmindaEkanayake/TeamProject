package com.inventory.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriceUpdateRequest {
    @NotNull
    private Long itemId;

    @NotNull
    private Double retailPrice;

    @NotNull
    private Double importPrice;

    @NotNull
    private Double salePrice;
}
