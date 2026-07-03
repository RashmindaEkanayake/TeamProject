package com.inventory.system.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "shop_name", nullable = false, length = 150)
    private String shopName;

    @Column(name = "shop_address", nullable = false, length = 255)
    private String shopAddress;

    @Column(name = "contact_number", nullable = false, length = 20)
    private String contactNumber;

    @Column(name = "shop_email", unique = true, length = 150)
    private String shopEmail;

    @Column(name = "contact_person_name", nullable = false, length = 100)
    private String contactPersonName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rep_id")
    private SalesRep rep;
}
