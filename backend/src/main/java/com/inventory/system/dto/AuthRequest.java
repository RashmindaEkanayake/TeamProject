package com.inventory.system.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {
  @NotBlank(message = "Username is required")
  @Size(max = 255)
  private String username;

  @NotBlank(message = "Password is required")
  @Size(max = 255)
  private String password;
}
