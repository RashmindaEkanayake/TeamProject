package com.inventory.system.services;

import com.inventory.system.dto.CustomerDTO;
import com.inventory.system.entities.Customer;
import com.inventory.system.entities.SalesRep;
import com.inventory.system.exceptions.ResourceNotFoundException;
import com.inventory.system.repositories.CustomerRepository;
import com.inventory.system.repositories.SalesRepRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CustomerService {
  @Autowired private com.inventory.system.security.CurrentUser current;

  @Autowired private CustomerRepository customerRepository;

  @Autowired private SalesRepRepository salesRepRepository;

  public List<CustomerDTO> getAllCustomers() {
    return customerRepository.findAll().stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
  }

  public List<CustomerDTO> getCustomersByRep(Long repId) {
    return customerRepository.findByRepRepId(repId).stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
  }

  public CustomerDTO getCustomerById(Long id) {
    Customer customer =
        customerRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
    current.customer(customer);
    return convertToDTO(customer);
  }

  @Transactional
  public CustomerDTO createCustomer(CustomerDTO dto, Long repId) {
    Customer customer = convertToEntity(dto);
    customer.setCustomerId(null);
    if (repId != null) {
      SalesRep rep =
          salesRepRepository
              .findLockedById(repId)
              .orElseThrow(
                  () ->
                      new ResourceNotFoundException(
                          "Sales Representative not found with ID: " + repId));
      if (!"ACTIVE".equals(rep.getStatus()))
        throw new IllegalArgumentException("Representative is inactive");
      customer.setRep(rep);
    }
    Customer saved = customerRepository.save(customer);
    return convertToDTO(saved);
  }

  @Transactional
  public CustomerDTO updateCustomer(Long id, CustomerDTO dto) {
    SalesRep target = null;
    if (current.admin() && dto.getRepId() != null) {
      target =
          salesRepRepository
              .findLockedById(dto.getRepId())
              .orElseThrow(() -> new ResourceNotFoundException("Representative not found"));
      if (!"ACTIVE".equals(target.getStatus()))
        throw new IllegalArgumentException("Representative is inactive");
    }
    Customer existing =
        customerRepository
            .findLockedById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

    current.customer(existing);
    if (!current.admin() && dto.getRepId() != null && !current.repId().equals(dto.getRepId()))
      throw new org.springframework.security.access.AccessDeniedException(
          "Cannot reassign a customer");
    existing.setShopName(dto.getShopName());
    existing.setShopAddress(dto.getShopAddress());
    existing.setContactNumber(dto.getContactNumber());
    existing.setShopEmail(dto.getShopEmail());
    existing.setContactPersonName(dto.getContactPersonName());

    if (target != null) existing.setRep(target); // Omitted representative preserves assignment.

    Customer saved = customerRepository.save(existing);
    return convertToDTO(saved);
  }

  @Transactional
  public void deleteCustomer(Long id) {
    if (!customerRepository.existsById(id)) {
      throw new ResourceNotFoundException("Customer not found with ID: " + id);
    }
    customerRepository.deleteById(id);
  }

  private CustomerDTO convertToDTO(Customer customer) {
    CustomerDTO dto = new CustomerDTO();
    dto.setCustomerId(customer.getCustomerId());
    dto.setShopName(customer.getShopName());
    dto.setShopAddress(customer.getShopAddress());
    dto.setContactNumber(customer.getContactNumber());
    dto.setShopEmail(customer.getShopEmail());
    dto.setContactPersonName(customer.getContactPersonName());
    if (customer.getRep() != null) {
      dto.setRepId(customer.getRep().getRepId());
      dto.setRepName(customer.getRep().getFirstName() + " " + customer.getRep().getLastName());
    }
    return dto;
  }

  private Customer convertToEntity(CustomerDTO dto) {
    Customer customer = new Customer();
    customer.setCustomerId(dto.getCustomerId());
    customer.setShopName(dto.getShopName());
    customer.setShopAddress(dto.getShopAddress());
    customer.setContactNumber(dto.getContactNumber());
    customer.setShopEmail(dto.getShopEmail());
    customer.setContactPersonName(dto.getContactPersonName());
    return customer;
  }
}
