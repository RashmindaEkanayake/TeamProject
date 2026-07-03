package com.inventory.system.repositories;

import com.inventory.system.entities.GoodsReceivingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoodsReceivingItemRepository extends JpaRepository<GoodsReceivingItem, Long> {
    java.util.List<GoodsReceivingItem> findByGoodsReceivingReceivingId(Long receivingId);
}
