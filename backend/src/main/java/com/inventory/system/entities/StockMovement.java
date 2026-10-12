package com.inventory.system.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "stock_movements")
@Getter
@Setter
@NoArgsConstructor
public class StockMovement {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "item_id", nullable = false)
  private Item item;

  @Column(nullable = false)
  private Integer quantity;

  @Column(nullable = false)
  private String reason;

  @Column(nullable = false)
  private String reference;

  @Column(nullable = false)
  private String actor;

  @Column(nullable = false)
  private LocalDateTime createdAt;
}
