package com.inventory.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {
    private Long customerId;

    @NotBlank(message = "Shop name is required")
    private String shopName;

    private String shopAddress;
    private String contactNumber;
    private String shopEmail;
    private String contactPersonName;
    private Long repId;
    private String repName;
}
