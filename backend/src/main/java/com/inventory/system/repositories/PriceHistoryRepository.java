package com.inventory.system.repositories;

import com.inventory.system.entities.PriceHistory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
  List<PriceHistory> findByItemItemIdOrderByStartDateDesc(Long itemId);

  List<PriceHistory> findByRequestedByOrderByStartDateDesc(String username);

  List<PriceHistory> findByStatus(String status);

  List<PriceHistory> findByItemItemIdAndStatus(Long itemId, String status);

  Optional<PriceHistory> findFirstByItemItemIdAndStatusOrderByStartDateDesc(
      Long itemId, String status);
}
