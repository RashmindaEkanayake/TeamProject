package com.inventory.system.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {
  @Positive private Long customerId;

  @NotBlank(message = "Shop name is required")
  @Size(max = 255)
  private String shopName;

  @Size(max = 255)
  private String shopAddress;

  @Size(max = 255)
  private String contactNumber;

  @Email
  @Size(max = 255)
  private String shopEmail;

  @Size(max = 255)
  private String contactPersonName;

  private Long repId;

  @Size(max = 255)
  private String repName;
}
