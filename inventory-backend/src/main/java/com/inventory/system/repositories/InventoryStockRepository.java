package com.inventory.system.repositories;

import com.inventory.system.entities.InventoryStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryStockRepository extends JpaRepository<InventoryStock, Long> {
}
