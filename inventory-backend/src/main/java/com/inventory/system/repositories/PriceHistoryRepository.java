package com.inventory.system.repositories;

import com.inventory.system.entities.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    List<PriceHistory> findByStatus(String status);
    List<PriceHistory> findByItemItemIdAndStatus(Long itemId, String status);
    Optional<PriceHistory> findFirstByItemItemIdAndStatusOrderByStartDateDesc(Long itemId, String status);
}
