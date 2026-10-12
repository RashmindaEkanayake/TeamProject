package com.inventory.system.repositories;

import com.inventory.system.entities.GoodsReceivingItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoodsReceivingItemRepository extends JpaRepository<GoodsReceivingItem, Long> {
  List<GoodsReceivingItem> findByGoodsReceivingReceivingId(Long receivingId);
}
