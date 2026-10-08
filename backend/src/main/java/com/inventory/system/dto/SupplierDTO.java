package com.inventory.system.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDTO {
  private Long supplierId;

  @NotBlank(message = "Company name is required")
  @Size(max = 255)
  private String companyName;

  @Email
  @Size(max = 255)
  private String companyEmail;

  @Size(max = 255)
  private String contactNumber;

  @Size(max = 255)
  private String fax;

  @Size(max = 255)
  private String country;

  @Size(max = 255)
  private String bankDetails;

  @Size(max = 255)
  private String contactPerson;

  @Size(max = 255)
  private String contactPersonNumber;

  @Email
  @Size(max = 255)
  private String personEmail;

  private List<@NotNull @Valid SupplierItemDTO> supplierItems;
}
