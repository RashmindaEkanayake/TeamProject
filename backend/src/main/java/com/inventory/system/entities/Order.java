package com.inventory.system.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {
  @Version private Long version;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "order_id")
  private Long orderId;

  @Column(name = "invoice_num", nullable = false, unique = true, length = 100)
  private String invoiceNum;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "customer_id", nullable = false)
  private Customer customer;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "rep_id", nullable = false)
  private SalesRep rep;

  @Column(name = "ordered_date", nullable = false)
  private LocalDate orderedDate;

  @Column(name = "closing_date")
  private LocalDate closingDate;

  @Column(name = "total_amount", nullable = false, precision = 19, scale = 2)
  private BigDecimal totalAmount;

  @Column(name = "outstanding_amount", nullable = false, precision = 19, scale = 2)
  private BigDecimal outstandingAmount;

  @Column(name = "clearance_status", nullable = false)
  private Boolean clearanceStatus;

  @Column(name = "order_status", nullable = false, length = 20)
  private String orderStatus; // "PENDING_APPROVAL", "APPROVED", "REJECTED", "SHIPPED", "CANCELLED"

  @OneToMany(
      mappedBy = "order",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.EAGER)
  private List<OrderItem> orderItems = new ArrayList<>();

  @PrePersist
  protected void onCreate() {
    if (orderedDate == null) {
      orderedDate = LocalDate.now();
    }
    if (clearanceStatus == null) {
      clearanceStatus = false;
    }
    if (orderStatus == null) {
      orderStatus = "PENDING_APPROVAL";
    }
  }
}
