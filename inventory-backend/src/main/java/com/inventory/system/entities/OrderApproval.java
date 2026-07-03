package com.inventory.system.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

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

    @Column(name = "approved_by", nullable = false, length = 100)
    private String approvedBy;

    @Column(name = "approval_status", nullable = false, length = 20)
    private String approvalStatus; // "APPROVED", "REJECTED"

    @Column(name = "approval_date", nullable = false)
    private LocalDateTime approvalDate;

    @Column(length = 255)
    private String remarks;

    @PrePersist
    protected void onCreate() {
        if (approvalDate == null) {
            approvalDate = LocalDateTime.now();
        }
    }
}
