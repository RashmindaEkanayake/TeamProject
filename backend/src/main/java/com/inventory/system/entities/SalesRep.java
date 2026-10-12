package com.inventory.system.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sales_reps")
public class SalesRep {
  @Column(nullable = false, length = 20)
  private String status = "ACTIVE";

  @Version private Long version;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "rep_id")
  private Long repId;

  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Column(name = "last_name", nullable = false)
  private String lastName;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(name = "phone_number")
  private String phoneNumber;
}
