package com.inventory.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoodsReceivingDTO {
    private Long receivingId;
    private Long supplierId;
    private String supplierName;
    private LocalDateTime receiveDate;
    private String referenceNumber;
    private String receivedBy;
    private String notes;
    private String status;
    private List<GoodsReceivingItemDTO> items;
}
