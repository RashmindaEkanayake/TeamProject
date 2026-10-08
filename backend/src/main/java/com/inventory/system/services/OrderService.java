package com.inventory.system.services;

import com.inventory.system.dto.*;
import com.inventory.system.entities.*;
import com.inventory.system.exceptions.*;
import com.inventory.system.repositories.*;
import com.inventory.system.security.CurrentUser;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {
  private final OrderRepository orders;
  private final CustomerRepository customers;
  private final SalesRepRepository reps;
  private final InventoryStockRepository stocks;
  private final PriceHistoryRepository prices;
  private final OrderApprovalRepository approvals;
  private final StockService stockService;
  private final CurrentUser current;

  public List<Order> getAllOrders() {
    return orders.findAll();
  }

  public List<Order> getOrdersByRep(Long id) {
    return orders.findByRepRepId(id);
  }

  public List<Order> getPendingOrders() {
    return orders.findByOrderStatus("PENDING_APPROVAL");
  }

  public Order getOrderById(Long id) {
    Order o =
        orders.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    if (!current.admin() && !current.repId().equals(o.getRep().getRepId()))
      throw new AccessDeniedException("Order belongs to another representative");
    return o;
  }

  @Transactional
  public Order submitOrder(OrderRequest request, Long repId) {
    Customer customer =
        customers
            .findLockedById(request.getCustomerId())
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    current.customer(customer);
    if (repId == null || customer.getRep() == null || !repId.equals(customer.getRep().getRepId()))
      throw new IllegalArgumentException("Select the representative assigned to this customer");
    SalesRep rep =
        reps.findById(repId)
            .orElseThrow(() -> new ResourceNotFoundException("Representative not found"));
    if (!"ACTIVE".equals(rep.getStatus()))
      throw new IllegalArgumentException("Representative is inactive");
    if (request.getItems() == null || request.getItems().isEmpty())
      throw new IllegalArgumentException("At least one order item is required");
    Order order = new Order();
    order.setCustomer(customer);
    order.setRep(rep);
    order.setInvoiceNum("INV-" + UUID.randomUUID());
    order.setOrderedDate(LocalDate.now());
    order.setClearanceStatus(false);
    Set<Long> seen = new HashSet<>();
    BigDecimal total = BigDecimal.ZERO.setScale(2);
    for (OrderItemRequest line : request.getItems()) {
      if (line == null
          || line.getQuantity() == null
          || line.getQuantity() <= 0
          || !seen.add(line.getItemId()))
        throw new IllegalArgumentException("Each item must appear once with a positive quantity");
      InventoryStock stock =
          stocks
              .findById(line.getItemId())
              .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));
      if (stock.getCurrentQuantity() < line.getQuantity())
        throw new InsufficientStockException(
            "Insufficient stock for " + stock.getItem().getModel());
      PriceHistory price =
          prices
              .findFirstByItemItemIdAndStatusOrderByStartDateDesc(line.getItemId(), "APPROVED")
              .filter(p -> p.getEndDate() == null)
              .orElseThrow(
                  () ->
                      new IllegalArgumentException(
                          "No active approved price for " + stock.getItem().getModel()));
      BigDecimal discount =
          Money.value(
              line.getDiscountAmount() == null ? BigDecimal.ZERO : line.getDiscountAmount());
      BigDecimal lineTotal = Money.line(price.getSalePrice(), line.getQuantity(), discount);
      OrderItem oi = new OrderItem();
      oi.setOrder(order);
      oi.setItem(stock.getItem());
      oi.setQuantity(line.getQuantity());
      oi.setUnitPrice(price.getSalePrice());
      oi.setDiscountAmount(discount);
      oi.setTotalPrice(lineTotal);
      order.getOrderItems().add(oi);
      total = total.add(lineTotal);
    }
    order.setTotalAmount(Money.value(total));
    order.setOutstandingAmount(order.getTotalAmount());
    order.setOrderStatus("PENDING_APPROVAL");
    return orders.save(order);
  }

  @Transactional
  public Order approveOrder(Long id, String actor) {
    Order order = lockPending(id);
    for (OrderItem line :
        order.getOrderItems().stream()
            .sorted(Comparator.comparing(l -> l.getItem().getItemId()))
            .toList())
      stockService.change(
          line.getItem().getItemId(), -line.getQuantity(), "SALE", order.getInvoiceNum(), actor);
    return decision(order, "APPROVED", actor, "Approved by " + actor);
  }

  @Transactional
  public Order rejectOrder(Long id, String actor, String remarks) {
    return decision(lockPending(id), "REJECTED", actor, remarks);
  }

  private Order lockPending(Long id) {
    Order o =
        orders
            .findLockedById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    if (!"PENDING_APPROVAL".equals(o.getOrderStatus()))
      throw new IllegalStateException("Order already decided");
    return o;
  }

  private Order decision(Order o, String status, String actor, String remarks) {
    o.setOrderStatus(status);
    OrderApproval a = new OrderApproval();
    a.setOrder(o);
    a.setApprovedBy(actor);
    a.setApprovalStatus(status);
    a.setApprovalDate(LocalDateTime.now());
    a.setRemarks(remarks);
    approvals.save(a);
    return orders.save(o);
  }
}
