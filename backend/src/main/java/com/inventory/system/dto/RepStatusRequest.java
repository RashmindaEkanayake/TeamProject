package com.inventory.system.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RepStatusRequest {
  @NotNull
  @Pattern(regexp = "ACTIVE|INACTIVE")
  private String status;

  @Positive private Long reassignToRepId;
}
