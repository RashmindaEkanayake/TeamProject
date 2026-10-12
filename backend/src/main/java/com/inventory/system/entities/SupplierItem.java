package com.inventory.system.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "supplier_items",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"supplier_id", "item_id"})})
public class SupplierItem {
  @Version private Long version;

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

  @Column(name = "supplier_price", nullable = false, precision = 19, scale = 2)
  private BigDecimal supplierPrice;

  @Column(name = "supply_quantity", nullable = false)
  private Integer supplyQuantity = 0;
}
