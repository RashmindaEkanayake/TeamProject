package com.inventory.system.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String username;

  @Column(nullable = false)
  @com.fasterxml.jackson.annotation.JsonIgnore
  private String password;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String role; // "ADMIN", "SALES_REP"

  @Column(name = "first_name")
  private String firstName;

  @Column(name = "last_name")
  private String lastName;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "associated_rep_id")
  private SalesRep associatedRep;
}
