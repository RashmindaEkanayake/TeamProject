package com.inventory.system.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
  @Size(max = 255)
  private String token;

  private Long id;

  @Size(max = 255)
  private String username;

  @Email
  @Size(max = 255)
  private String email;

  @Size(max = 255)
  private String role;

  @Size(max = 255)
  private String fullName;

  private Long associatedRepId;
}
