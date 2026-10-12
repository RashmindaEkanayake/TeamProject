package com.inventory.system.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_approvals")
public class OrderApproval {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "approval_id")
  private Long approvalId;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "order_id", nullable = false)
  private Order order;

  @Column(name = "approved_by")
  private String approvedBy;

  @Column(name = "approval_status", nullable = false)
  private String approvalStatus;

  @Column(name = "approval_date", nullable = false)
  private LocalDateTime approvalDate;

  @Column(name = "remarks")
  private String remarks;

  @PrePersist
  protected void onCreate() {
    if (approvalDate == null) {
      approvalDate = LocalDateTime.now();
    }
  }
}
