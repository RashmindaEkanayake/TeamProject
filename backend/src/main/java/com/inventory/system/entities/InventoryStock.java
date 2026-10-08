package com.inventory.system.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "inventory_stock")
public class InventoryStock implements Persistable<Long> {
  @Version private Long version;

  @Id
  @Column(name = "item_id")
  private Long itemId;

  @OneToOne(fetch = FetchType.EAGER)
  @MapsId
  @JoinColumn(name = "item_id")
  private Item item;

  @Column(name = "current_quantity", nullable = false)
  private Integer currentQuantity;

  @Column(name = "minimum_stock_level", nullable = false)
  private Integer minimumStockLevel;

  @Column(name = "last_updated")
  private LocalDateTime lastUpdated;

  @Transient private boolean isNewEntity = true;

  @Override
  public Long getId() {
    return itemId;
  }

  @Override
  public boolean isNew() {
    return isNewEntity;
  }

  @PostPersist
  @PostLoad
  protected void markNotNew() {
    this.isNewEntity = false;
  }

  @PrePersist
  @PreUpdate
  protected void onUpdate() {
    lastUpdated = LocalDateTime.now();
  }
}
