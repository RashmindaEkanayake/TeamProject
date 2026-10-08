package com.inventory.system.repositories;

import com.inventory.system.entities.InventoryStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryStockRepository extends JpaRepository<InventoryStock, Long> {
  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query(
      "select e from InventoryStock e where e.itemId = :id")
  java.util.Optional<InventoryStock> findLockedById(
      @org.springframework.data.repository.query.Param("id") Long id);
}
