package com.inventory.system.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_items")
public class OrderItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "order_item_id")
  private Long orderItemId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "order_id", nullable = false)
  @JsonIgnore
  private Order order;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "item_id", nullable = false)
  private Item item;

  @Column(nullable = false)
  private Integer quantity;

  @Column(name = "unit_price", nullable = false, precision = 19, scale = 2)
  private BigDecimal unitPrice;

  @Column(name = "discount_amount", nullable = false, precision = 19, scale = 2)
  private BigDecimal discountAmount;

  @Column(name = "total_price", nullable = false, precision = 19, scale = 2)
  private BigDecimal totalPrice;
}
