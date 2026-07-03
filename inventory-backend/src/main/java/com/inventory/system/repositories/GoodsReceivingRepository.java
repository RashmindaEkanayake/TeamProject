package com.inventory.system.repositories;

import com.inventory.system.entities.GoodsReceiving;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoodsReceivingRepository extends JpaRepository<GoodsReceiving, Long> {
    java.util.Optional<GoodsReceiving> findByReferenceNumber(String referenceNumber);
}
