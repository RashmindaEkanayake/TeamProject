package com.inventory.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriceUpdateRequest {
    @NotNull
    private Long itemId;

    @NotNull
    @Min(0)
    private Double retailPrice;

    @NotNull
    @Min(0)
    private Double importPrice;

    @NotNull
    @Min(0)
    private Double salePrice;
}
