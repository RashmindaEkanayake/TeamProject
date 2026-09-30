package com.inventory.system.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "goods_receiving_items")
public class GoodsReceivingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "receiving_item_id")
    private Long receivingItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiving_id", nullable = false)
    private GoodsReceiving goodsReceiving;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "quantity_received", nullable = false)
    private Integer quantityReceived;

    @Column(name = "cost_price", nullable = false)
    private Double costPrice;

    @Column(name = "verification_status", nullable = false, length = 20)
    private String verificationStatus = "ARRIVED"; // "ARRIVED", "MISSING", "DAMAGED"
}
