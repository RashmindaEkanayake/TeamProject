package com.inventory.system.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Column(name = "reference_number", nullable = false, unique = true)
    private String referenceNumber;

    @Column(name = "received_by")
    private String receivedBy;

    @Column(name = "notes")
    private String notes;

    @Column(nullable = false)
    private String status = "PENDING"; // "PENDING", "VERIFIED", "REJECTED"

    @Column(name = "receive_date", nullable = false)
    private LocalDateTime receiveDate;

    @OneToMany(mappedBy = "goodsReceiving", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GoodsReceivingItem> items = new ArrayList<>();

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
