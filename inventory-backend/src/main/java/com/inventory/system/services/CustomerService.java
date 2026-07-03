package com.inventory.system.services;

import com.inventory.system.dto.CustomerDTO;
import com.inventory.system.entities.Customer;
import com.inventory.system.entities.SalesRep;
import com.inventory.system.exceptions.ResourceNotFoundException;
import com.inventory.system.repositories.CustomerRepository;
import com.inventory.system.repositories.SalesRepRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SalesRepRepository salesRepRepository;

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
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        return convertToDTO(customer);
    }

    @Transactional
    public CustomerDTO createCustomer(CustomerDTO dto, Long repId) {
        Customer customer = convertToEntity(dto);
        if (repId != null) {
            SalesRep rep = salesRepRepository.findById(repId)
                    .orElseThrow(() -> new ResourceNotFoundException("Sales Representative not found with ID: " + repId));
            customer.setRep(rep);
        }
        Customer saved = customerRepository.save(customer);
        return convertToDTO(saved);
    }

    @Transactional
    public CustomerDTO updateCustomer(Long id, CustomerDTO dto) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        existing.setShopName(dto.getShopName());
        existing.setShopAddress(dto.getShopAddress());
        existing.setContactNumber(dto.getContactNumber());
        existing.setShopEmail(dto.getShopEmail());
        existing.setContactPersonName(dto.getContactPersonName());

        if (dto.getRepId() != null) {
            SalesRep rep = salesRepRepository.findById(dto.getRepId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sales Representative not found with ID: " + dto.getRepId()));
            existing.setRep(rep);
        } else {
            existing.setRep(null);
        }

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
