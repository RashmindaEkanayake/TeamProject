package com.inventory.system.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequest {
  @Size(max = 255)
  private String status;

  @Size(max = 255)
  private String remarks;
}
