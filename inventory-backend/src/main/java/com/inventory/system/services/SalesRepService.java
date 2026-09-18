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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalesRepService {

    @Autowired
    private SalesRepRepository salesRepRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderRepository orderRepository;

    public List<SalesRepDTO> getAllSalesReps() {
        return salesRepRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SalesRepDTO getSalesRepById(Long id) {
        SalesRep rep = salesRepRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Representative not found with ID: " + id));
        return convertToDTO(rep);
    }

    @Transactional
    public SalesRepDTO createSalesRep(SalesRepDTO dto) {
        SalesRep rep = convertToEntity(dto);
        SalesRep saved = salesRepRepository.save(rep);
        return convertToDTO(saved);
    }

    @Transactional
    public SalesRepDTO updateSalesRep(Long id, SalesRepDTO dto) {
        SalesRep existing = salesRepRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Representative not found with ID: " + id));

        existing.setFirstName(dto.getFirstName());
        existing.setLastName(dto.getLastName());
        existing.setEmail(dto.getEmail());
        existing.setPhoneNumber(dto.getPhoneNumber());

        SalesRep saved = salesRepRepository.save(existing);
        return convertToDTO(saved);
    }

    @Transactional
    public void deleteSalesRep(Long id) {
        SalesRep rep = salesRepRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Representative not found with ID: " + id));
        
        // Remove associations in customer table first
        List<Customer> customers = customerRepository.findByRepRepId(id);
        for (Customer c : customers) {
            c.setRep(null);
            customerRepository.save(c);
        }
        
        salesRepRepository.delete(rep);
    }

    private SalesRepDTO convertToDTO(SalesRep rep) {
        SalesRepDTO dto = new SalesRepDTO();
        dto.setRepId(rep.getRepId());
        dto.setFirstName(rep.getFirstName());
        dto.setLastName(rep.getLastName());
        dto.setEmail(rep.getEmail());
        dto.setPhoneNumber(rep.getPhoneNumber());

        List<CustomerDTO> customerDTOs = customerRepository.findByRepRepId(rep.getRepId()).stream()
                .map(c -> new CustomerDTO(c.getCustomerId(), c.getShopName(), c.getShopAddress(),
                        c.getContactNumber(), c.getShopEmail(), c.getContactPersonName(),
                        rep.getRepId(), rep.getFirstName() + " " + rep.getLastName()))
                .collect(Collectors.toList());
        dto.setCustomers(customerDTOs);

        // Populate order stats
        List<Order> orders = orderRepository.findByRepRepId(rep.getRepId());
        dto.setOrderCount(orders.size());
        dto.setTotalOrderValue(orders.stream()
                .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0.0)
                .sum());

        return dto;
    }

    private SalesRep convertToEntity(SalesRepDTO dto) {
        SalesRep rep = new SalesRep();
        rep.setRepId(dto.getRepId());
        rep.setFirstName(dto.getFirstName());
        rep.setLastName(dto.getLastName());
        rep.setEmail(dto.getEmail());
        rep.setPhoneNumber(dto.getPhoneNumber());
        return rep;
    }
}
