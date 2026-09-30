package com.inventory.system.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "supplier_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"supplier_id", "item_id"})
})
public class SupplierItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "supplier_item_id")
    private Long supplierItemId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "supplier_part_number", length = 100)
    private String supplierPartNumber;

    @Column(name = "supplier_price", nullable = false)
    private Double supplierPrice;

    @Column(name = "supply_quantity", nullable = false)
    private Integer supplyQuantity = 0;
}
