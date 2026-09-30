package com.inventory.system.repositories;

import com.inventory.system.entities.GoodsReceiving;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GoodsReceivingRepository extends JpaRepository<GoodsReceiving, Long> {
    Optional<GoodsReceiving> findByReferenceNumber(String referenceNumber);
}
