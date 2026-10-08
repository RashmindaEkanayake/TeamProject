package com.inventory.system.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoodsReceivingDTO {
  private Long receivingId;
  private Long supplierId;

  @Size(max = 255)
  private String supplierName;

  private LocalDateTime receiveDate;

  @Size(max = 255)
  private String referenceNumber;

  @Size(max = 255)
  private String receivedBy;

  @Size(max = 255)
  private String notes;

  @Size(max = 255)
  private String status;

  private List<GoodsReceivingItemDTO> items;
}
