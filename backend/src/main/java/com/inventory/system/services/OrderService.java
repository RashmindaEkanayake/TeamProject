package com.inventory.system.services;

import com.inventory.system.entities.*;
import com.inventory.system.dto.OrderRequest;
import com.inventory.system.dto.OrderItemRequest;
import com.inventory.system.exceptions.ResourceNotFoundException;
import com.inventory.system.exceptions.InsufficientStockException;
import com.inventory.system.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SalesRepRepository salesRepRepository;

    @Autowired
    private InventoryStockRepository stockRepository;

    @Autowired
    private PriceHistoryRepository priceHistoryRepository;

    @Autowired
    private OrderApprovalRepository orderApprovalRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByRep(Long repId) {
        return orderRepository.findByRepRepId(repId);
    }

    public List<Order> getPendingOrders() {
        return orderRepository.findByOrderStatus("PENDING_APPROVAL");
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
    }

    @Transactional
    public Order submitOrder(OrderRequest request, Long repId) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));

        SalesRep rep = salesRepRepository.findById(repId)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Representative not found with ID: " + repId));

        Order order = new Order();
        order.setCustomer(customer);
        order.setRep(rep);
        order.setInvoiceNum("INV-" + System.currentTimeMillis());
        order.setOrderedDate(LocalDate.now());
        order.setClearanceStatus(false);

        double totalAmount = 0.0;
        List<OrderItem> items = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            InventoryStock stock = stockRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Stock record not found for Item: " + itemReq.getItemId()));

            if (stock.getCurrentQuantity() < itemReq.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for item: " + stock.getItem().getModel() + 
                        ". Requested: " + itemReq.getQuantity() + ", Available: " + stock.getCurrentQuantity());
            }

            PriceHistory activePrice = priceHistoryRepository
                    .findFirstByItemItemIdAndStatusOrderByStartDateDesc(itemReq.getItemId(), "APPROVED")
                    .orElseThrow(() -> new ResourceNotFoundException("No active approved price set for item ID: " + itemReq.getItemId()));

            double unitPrice = activePrice.getSalePrice();
            double discount = itemReq.getDiscountAmount() != null ? itemReq.getDiscountAmount() : 0.0;
            double lineTotal = (unitPrice * itemReq.getQuantity()) - discount;
            if (lineTotal < 0) lineTotal = 0;

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setItem(stock.getItem());
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setDiscountAmount(discount);
            orderItem.setTotalPrice(lineTotal);
            items.add(orderItem);

            totalAmount += lineTotal;
        }

        order.setOrderItems(items);
        order.setTotalAmount(totalAmount);
        order.setOutstandingAmount(totalAmount);
        order.setOrderStatus("PENDING_APPROVAL");

        return orderRepository.save(order);
    }

    @Transactional
    public Order approveOrder(Long orderId, String approvedBy) {
        Order order = getOrderById(orderId);
        if (!"PENDING_APPROVAL".equals(order.getOrderStatus())) {
            throw new IllegalStateException("Order is not pending approval. Current status: " + order.getOrderStatus());
        }

        for (OrderItem orderItem : order.getOrderItems()) {
            InventoryStock stock = stockRepository.findById(orderItem.getItem().getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Stock record not found for Item: " + orderItem.getItem().getItemId()));
            
            if (stock.getCurrentQuantity() < orderItem.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for item during approval: " + stock.getItem().getModel() +
                        ". Requested: " + orderItem.getQuantity() + ", Available: " + stock.getCurrentQuantity());
            }
            stock.setCurrentQuantity(stock.getCurrentQuantity() - orderItem.getQuantity());
            stockRepository.save(stock);
        }

        order.setOrderStatus("APPROVED");
        order = orderRepository.save(order);

        OrderApproval approval = new OrderApproval();
        approval.setOrder(order);
        approval.setApprovedBy(approvedBy);
        approval.setApprovalStatus("APPROVED");
        approval.setApprovalDate(LocalDateTime.now());
        approval.setRemarks("Approved by Admin: " + approvedBy);
        orderApprovalRepository.save(approval);

        return order;
    }

    @Transactional
    public Order rejectOrder(Long orderId, String approvedBy, String remarks) {
        Order order = getOrderById(orderId);
        if (!"PENDING_APPROVAL".equals(order.getOrderStatus())) {
            throw new IllegalStateException("Order is not pending approval. Current status: " + order.getOrderStatus());
        }

        order.setOrderStatus("REJECTED");
        order = orderRepository.save(order);

        OrderApproval approval = new OrderApproval();
        approval.setOrder(order);
        approval.setApprovedBy(approvedBy);
        approval.setApprovalStatus("REJECTED");
        approval.setApprovalDate(LocalDateTime.now());
        approval.setRemarks(remarks);
        orderApprovalRepository.save(approval);

        return order;
    }
}
