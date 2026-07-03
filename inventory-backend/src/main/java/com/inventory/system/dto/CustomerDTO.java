package com.inventory.system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {
    private Long customerId;

    @NotBlank(message = "Shop name is required")
    private String shopName;

    @NotBlank(message = "Shop address is required")
    private String shopAddress;

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^\\+?[0-9\\s-()]{7,20}$", message = "Invalid contact number format")
    private String contactNumber;

    @Email(message = "Invalid shop email format")
    private String shopEmail;

    @NotBlank(message = "Contact person name is required")
    private String contactPersonName;

    private Long repId;
    private String repName;
}
