package com.inventory.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequest {
    @NotBlank
    @Pattern(regexp = "APPROVED|REJECTED", message = "Status must be APPROVED or REJECTED")
    private String status;

    private String remarks;
}
