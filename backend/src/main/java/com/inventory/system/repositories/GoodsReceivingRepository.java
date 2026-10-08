package com.inventory.system.repositories;

import com.inventory.system.entities.GoodsReceiving;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoodsReceivingRepository extends JpaRepository<GoodsReceiving, Long> {
  Optional<GoodsReceiving> findByReferenceNumber(String referenceNumber);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query(
      "select e from GoodsReceiving e where e.receivingId = :id")
  java.util.Optional<GoodsReceiving> findLockedById(
      @org.springframework.data.repository.query.Param("id") Long id);
}
