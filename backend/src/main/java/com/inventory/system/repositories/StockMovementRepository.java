package com.inventory.system.repositories;

import com.inventory.system.entities.StockMovement;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
  List<StockMovement> findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(LocalDateTime start);

  List<StockMovement> findByItemItemIdOrderByCreatedAtDesc(Long id);
}
