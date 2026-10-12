package com.inventory.system.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesRepDTO {
  private Long repId;

  @com.fasterxml.jackson.annotation.JsonProperty(
      access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
  private String status;

  @Pattern(
      regexp = "[A-Za-z0-9_.-]{3,100}",
      message = "Username must contain 3–100 letters, numbers, dots, underscores or hyphens")
  private String username;

  @Size(min = 10, max = 72)
  @com.fasterxml.jackson.annotation.JsonProperty(
      access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
  private String password;

  @NotBlank(message = "First name is required")
  @Size(max = 255)
  private String firstName;

  @NotBlank(message = "Last name is required")
  @Size(max = 255)
  private String lastName;

  @NotBlank(message = "Email is required")
  @Email
  @Size(max = 255)
  private String email;

  @Size(max = 255)
  private String phoneNumber;

  private List<CustomerDTO> customers;
  private Integer orderCount;
  private BigDecimal totalOrderValue;
}
