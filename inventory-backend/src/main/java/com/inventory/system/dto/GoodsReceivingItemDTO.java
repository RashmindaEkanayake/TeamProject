package com.inventory.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoodsReceivingItemDTO {
    private Long receivingItemId;
    private Long itemId;
    private String brand;
    private String model;
    private String partNumber;
    private Integer quantityReceived;
    private Double costPrice;
    private String verificationStatus; // "ARRIVED", "MISSING", "DAMAGED"
}
