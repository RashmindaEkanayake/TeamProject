package com.inventory.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDTO {
    private Long supplierId;

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String companyEmail;
    private String contactNumber;
    private String fax;
    private String country;
    private String bankDetails;
    private String contactPerson;
    private String contactPersonNumber;
    private String personEmail;
    private List<SupplierItemDTO> supplierItems;
}
