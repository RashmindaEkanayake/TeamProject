package com.inventory.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String role;
    private Long associatedRepId;
    private String fullName;

    public JwtResponse(String accessToken, Long id, String username, String email, String role, Long associatedRepId, String fullName) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.associatedRepId = associatedRepId;
        this.fullName = fullName;
    }
}
