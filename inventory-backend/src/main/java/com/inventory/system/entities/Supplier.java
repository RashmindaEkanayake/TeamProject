package com.inventory.system.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "company_name", nullable = false, unique = true, length = 150)
    private String companyName;

    @Column(name = "company_email", nullable = false, unique = true, length = 150)
    private String companyEmail;

    @Column(name = "contact_number", nullable = false, length = 20)
    private String contactNumber;

    @Column(length = 20)
    private String fax;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(name = "bank_details", length = 255)
    private String bankDetails;

    @Column(name = "contact_person", nullable = false, length = 100)
    private String contactPerson;

    @Column(name = "contact_person_number", length = 20)
    private String contactPersonNumber;

    @Column(name = "person_email", length = 150)
    private String personEmail;
}
