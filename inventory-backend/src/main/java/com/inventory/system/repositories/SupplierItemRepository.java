package com.inventory.system.repositories;

import com.inventory.system.entities.SupplierItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SupplierItemRepository extends JpaRepository<SupplierItem, Long> {
    Optional<SupplierItem> findBySupplierSupplierIdAndItemItemId(Long supplierId, Long itemId);
    java.util.List<SupplierItem> findBySupplierSupplierId(Long supplierId);
}
