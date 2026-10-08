package com.inventory.system.controllers;

import com.inventory.system.dto.AuthRequest;
import com.inventory.system.dto.AuthResponse;
import com.inventory.system.entities.User;
import com.inventory.system.repositories.UserRepository;
import com.inventory.system.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  @Autowired private AuthenticationManager authenticationManager;

  @Autowired private UserRepository userRepository;

  @Autowired private JwtTokenProvider jwtTokenProvider;

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

    User user =
        userRepository
            .findByUsername(request.getUsername())
            .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

    String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole());

    String fullName =
        ((user.getFirstName() != null ? user.getFirstName() : "")
                + " "
                + (user.getLastName() != null ? user.getLastName() : ""))
            .trim();
    if (fullName.isEmpty()) {
      fullName = user.getUsername();
    }

    Long repId = user.getAssociatedRep() != null ? user.getAssociatedRep().getRepId() : null;

    AuthResponse response =
        new AuthResponse(
            token,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            fullName,
            repId);

    return ResponseEntity.ok(response);
  }
}
