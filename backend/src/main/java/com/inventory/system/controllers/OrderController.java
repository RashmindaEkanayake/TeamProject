package com.inventory.system.controllers;

import com.inventory.system.entities.Order;
import com.inventory.system.entities.User;
import com.inventory.system.dto.OrderRequest;
import com.inventory.system.dto.ApprovalRequest;
import com.inventory.system.repositories.UserRepository;
import com.inventory.system.services.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Order>> getOrders(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).get();
        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.ok(orderService.getAllOrders());
        } else {
            Long repId = user.getAssociatedRep() != null ? user.getAssociatedRep().getRepId() : null;
            if (repId == null) {
                return ResponseEntity.ok(List.of());
            }
            return ResponseEntity.ok(orderService.getOrdersByRep(repId));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).get();
        Order order = orderService.getOrderById(id);
        
        if ("SALES_REP".equals(user.getRole())) {
            Long repId = user.getAssociatedRep() != null ? user.getAssociatedRep().getRepId() : null;
            if (repId == null || !repId.equals(order.getRep().getRepId())) {
                throw new AccessDeniedException("You do not have permission to view this order.");
            }
        }
        
        return ResponseEntity.ok(order);
    }

    @PostMapping
    public ResponseEntity<Order> submitOrder(@Valid @RequestBody OrderRequest request, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).get();
        Long repId = null;
        
        if ("SALES_REP".equals(user.getRole())) {
            if (user.getAssociatedRep() == null) {
                throw new IllegalStateException("Authenticated user is not linked to a Sales Representative profile.");
            }
            repId = user.getAssociatedRep().getRepId();
        } else {
            repId = 1L; // Fallback default for testing when Admin submits directly
        }

        return ResponseEntity.ok(orderService.submitOrder(request, repId));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getPendingOrders() {
        return ResponseEntity.ok(orderService.getPendingOrders());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> approveOrder(@PathVariable Long id, Principal principal) {
        String approvedBy = principal.getName();
        return ResponseEntity.ok(orderService.approveOrder(id, approvedBy));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> rejectOrder(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalRequest request,
            Principal principal) {
        String approvedBy = principal.getName();
        return ResponseEntity.ok(orderService.rejectOrder(id, approvedBy, request.getRemarks()));
    }
}
