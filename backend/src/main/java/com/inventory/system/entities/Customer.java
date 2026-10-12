package com.inventory.system.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "customers")
public class Customer {
  @Version private Long version;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "customer_id")
  private Long customerId;

  @Column(name = "shop_name", nullable = false)
  private String shopName;

  @Column(name = "shop_address")
  private String shopAddress;

  @Column(name = "contact_number")
  private String contactNumber;

  @Column(name = "shop_email")
  private String shopEmail;

  @Column(name = "contact_person_name")
  private String contactPersonName;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "rep_id")
  private SalesRep rep;
}
