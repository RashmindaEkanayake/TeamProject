package com.inventory.system.controllers;

import com.inventory.system.config.JwtUtils;
import com.inventory.system.dto.LoginRequest;
import com.inventory.system.dto.JwtResponse;
import com.inventory.system.entities.User;
import com.inventory.system.repositories.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(loginRequest.getUsername());
        
        User user = userRepository.findByUsername(loginRequest.getUsername()).get();
        Long associatedRepId = user.getAssociatedRep() != null ? user.getAssociatedRep().getRepId() : null;
        String fullName = user.getFirstName() + " " + user.getLastName();

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                associatedRepId,
                fullName
        ));
    }
}
