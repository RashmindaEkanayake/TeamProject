package com.inventory.system.controllers;

import com.inventory.system.dto.CustomerDTO;
import com.inventory.system.entities.User;
import com.inventory.system.repositories.UserRepository;
import com.inventory.system.services.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CustomerDTO>> getCustomers(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).get();
        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.ok(customerService.getAllCustomers());
        } else {
            Long repId = user.getAssociatedRep() != null ? user.getAssociatedRep().getRepId() : null;
            if (repId == null) {
                return ResponseEntity.ok(List.of());
            }
            return ResponseEntity.ok(customerService.getCustomersByRep(repId));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    public ResponseEntity<CustomerDTO> createCustomer(@Valid @RequestBody CustomerDTO customerDTO, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).get();
        Long repId = null;
        
        if ("SALES_REP".equals(user.getRole()) && user.getAssociatedRep() != null) {
            repId = user.getAssociatedRep().getRepId();
        } else if (customerDTO.getRepId() != null) {
            repId = customerDTO.getRepId();
        }
        
        CustomerDTO created = customerService.createCustomer(customerDTO, repId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerDTO> updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerDTO customerDTO) {
        return ResponseEntity.ok(customerService.updateCustomer(id, customerDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
}
