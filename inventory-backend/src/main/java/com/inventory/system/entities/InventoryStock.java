package com.inventory.system.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "inventory_stock")
public class InventoryStock {

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

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
