package com.inventory.system.services;

import com.inventory.system.dto.CustomerDTO;
import com.inventory.system.dto.SalesRepDTO;
import com.inventory.system.entities.Customer;
import com.inventory.system.entities.Order;
import com.inventory.system.entities.SalesRep;
import com.inventory.system.exceptions.ResourceNotFoundException;
import com.inventory.system.repositories.CustomerRepository;
import com.inventory.system.repositories.OrderRepository;
import com.inventory.system.repositories.SalesRepRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SalesRepService {
  @Autowired private com.inventory.system.repositories.UserRepository users;
  @Autowired private org.springframework.security.crypto.password.PasswordEncoder encoder;

  @Autowired private SalesRepRepository salesRepRepository;

  @Autowired private CustomerRepository customerRepository;

  @Autowired private OrderRepository orderRepository;

  public List<SalesRepDTO> getAllSalesReps() {
    return salesRepRepository.findAll().stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
  }

  public SalesRepDTO getSalesRepById(Long id) {
    SalesRep rep =
        salesRepRepository
            .findById(id)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException("Sales Representative not found with ID: " + id));
    return convertToDTO(rep);
  }

  @Transactional
  public SalesRepDTO createSalesRep(SalesRepDTO dto) {
    validateUnique(dto, null);
    SalesRep rep = convertToEntity(dto);
    SalesRep saved = salesRepRepository.save(rep);
    if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
      if (dto.getPassword() == null)
        throw new IllegalArgumentException("Password required for login account");
      if (users.existsByUsername(dto.getUsername()))
        throw new IllegalArgumentException("Username already exists");
      com.inventory.system.entities.User u = new com.inventory.system.entities.User();
      u.setUsername(dto.getUsername());
      u.setPassword(encoder.encode(dto.getPassword()));
      u.setEmail(saved.getEmail());
      u.setRole("SALES_REP");
      u.setFirstName(saved.getFirstName());
      u.setLastName(saved.getLastName());
      u.setAssociatedRep(saved);
      users.save(u);
    } else
      throw new IllegalArgumentException("Username and password required for a new representative");
    return convertToDTO(saved);
  }

  @Transactional
  public SalesRepDTO updateSalesRep(Long id, SalesRepDTO dto) {
    SalesRep existing =
        salesRepRepository
            .findLockedById(id)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException("Sales Representative not found with ID: " + id));

    validateUnique(dto, id);
    existing.setFirstName(dto.getFirstName());
    existing.setLastName(dto.getLastName());
    existing.setEmail(dto.getEmail());
    existing.setPhoneNumber(dto.getPhoneNumber());

    users
        .findByAssociatedRepRepId(id)
        .ifPresent(
            u -> {
              u.setEmail(existing.getEmail());
              u.setFirstName(existing.getFirstName());
              u.setLastName(existing.getLastName());
              if (dto.getPassword() != null) u.setPassword(encoder.encode(dto.getPassword()));
              users.save(u);
            });
    SalesRep saved = salesRepRepository.save(existing);
    return convertToDTO(saved);
  }

  @Transactional
  public SalesRepDTO setStatus(Long id, String status, Long targetId) {
    if (!java.util.List.of("ACTIVE", "INACTIVE").contains(status))
      throw new IllegalArgumentException("Invalid status");
    if (id.equals(targetId))
      throw new IllegalArgumentException("Choose a different representative");
    // Stable lock order when reassigning between representatives.
    java.util.List<Long> ids = new java.util.ArrayList<>();
    ids.add(id);
    if (targetId != null) ids.add(targetId);
    ids.sort(Long::compareTo);
    java.util.Map<Long, SalesRep> locked = new java.util.HashMap<>();
    for (Long key : ids)
      locked.put(
          key,
          salesRepRepository
              .findLockedById(key)
              .orElseThrow(() -> new ResourceNotFoundException("Representative not found")));
    SalesRep rep = locked.get(id);
    java.util.List<Customer> assigned = customerRepository.findByRepRepId(id);
    if ("INACTIVE".equals(status) && !assigned.isEmpty()) {
      SalesRep target = targetId == null ? null : locked.get(targetId);
      if (target == null || !"ACTIVE".equals(target.getStatus()))
        throw new IllegalArgumentException(
            "This representative has "
                + assigned.size()
                + " customers. Select an active representative to reassign them before"
                + " deactivation.");
      for (Customer c :
          assigned.stream()
              .sorted(java.util.Comparator.comparing(Customer::getCustomerId))
              .toList()) {
        Customer customer = customerRepository.findLockedById(c.getCustomerId()).orElseThrow();
        if (customer.getRep() != null && id.equals(customer.getRep().getRepId())) {
          customer.setRep(target);
          customerRepository.save(customer);
        }
      }
    }
    rep.setStatus(status);
    salesRepRepository.save(rep);
    return convertToDTO(rep);
  }

  private SalesRepDTO convertToDTO(SalesRep rep) {
    SalesRepDTO dto = new SalesRepDTO();
    dto.setRepId(rep.getRepId());
    dto.setStatus(rep.getStatus());
    users.findByAssociatedRepRepId(rep.getRepId()).ifPresent(u -> dto.setUsername(u.getUsername()));
    dto.setFirstName(rep.getFirstName());
    dto.setLastName(rep.getLastName());
    dto.setEmail(rep.getEmail());
    dto.setPhoneNumber(rep.getPhoneNumber());

    List<CustomerDTO> customerDTOs =
        customerRepository.findByRepRepId(rep.getRepId()).stream()
            .map(
                c ->
                    new CustomerDTO(
                        c.getCustomerId(),
                        c.getShopName(),
                        c.getShopAddress(),
                        c.getContactNumber(),
                        c.getShopEmail(),
                        c.getContactPersonName(),
                        rep.getRepId(),
                        rep.getFirstName() + " " + rep.getLastName()))
            .collect(Collectors.toList());
    dto.setCustomers(customerDTOs);

    List<Order> orders = orderRepository.findByRepRepId(rep.getRepId());
    dto.setOrderCount(orders.size());
    dto.setTotalOrderValue(
        orders.stream()
            .filter(o -> "APPROVED".equals(o.getOrderStatus()))
            .map(Order::getTotalAmount)
            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));

    return dto;
  }

  private void validateUnique(SalesRepDTO dto, Long id) {
    salesRepRepository
        .findByEmail(dto.getEmail())
        .ifPresent(
            rep -> {
              if (!rep.getRepId().equals(id))
                throw new IllegalArgumentException("Email already assigned to a representative");
            });
    users
        .findByEmail(dto.getEmail())
        .ifPresent(
            u -> {
              if (u.getAssociatedRep() == null || !u.getAssociatedRep().getRepId().equals(id))
                throw new IllegalArgumentException("Email already assigned to an account");
            });
  }

  private SalesRep convertToEntity(SalesRepDTO dto) {
    SalesRep rep = new SalesRep();
    rep.setRepId(null);
    rep.setFirstName(dto.getFirstName());
    rep.setLastName(dto.getLastName());
    rep.setEmail(dto.getEmail());
    rep.setPhoneNumber(dto.getPhoneNumber());
    return rep;
  }
}
