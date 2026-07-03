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
@Table(name = "goods_receiving")
public class GoodsReceiving {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "receiving_id")
    private Long receivingId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "receive_date", nullable = false)
    private LocalDateTime receiveDate;

    @Column(name = "reference_number", nullable = false, unique = true, length = 100)
    private String referenceNumber;

    @Column(name = "received_by", nullable = false, length = 100)
    private String receivedBy;

    @Column(length = 255)
    private String notes;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // "PENDING", "VERIFIED", "REJECTED"

    @PrePersist
    protected void onCreate() {
        if (receiveDate == null) {
            receiveDate = LocalDateTime.now();
        }
        if (status == null) {
            status = "PENDING";
        }
    }
}
