package com.inventory.system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDTO {
    private Long supplierId;

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Company email is required")
    @Email(message = "Invalid company email format")
    private String companyEmail;

    @NotBlank(message = "Contact number is required")
    private String contactNumber;

    private String fax;

    @NotBlank(message = "Country is required")
    private String country;

    private String bankDetails;

    @NotBlank(message = "Contact person is required")
    private String contactPerson;

    private String contactPersonNumber;

    @Email(message = "Invalid person email format")
    private String personEmail;

    private List<SupplierItemDTO> supplierItems = new ArrayList<>();
}
