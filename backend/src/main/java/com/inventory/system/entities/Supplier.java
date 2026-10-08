package com.inventory.system.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "suppliers")
public class Supplier {
  @Version private Long version;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "supplier_id")
  private Long supplierId;

  @Column(name = "company_name", nullable = false)
  private String companyName;

  @Column(name = "company_email")
  private String companyEmail;

  @Column(name = "contact_number")
  private String contactNumber;

  @Column(name = "fax")
  private String fax;

  @Column(name = "country")
  private String country;

  @Column(name = "bank_details")
  private String bankDetails;

  @Column(name = "contact_person")
  private String contactPerson;

  @Column(name = "contact_person_number")
  private String contactPersonNumber;

  @Column(name = "person_email")
  private String personEmail;
}
