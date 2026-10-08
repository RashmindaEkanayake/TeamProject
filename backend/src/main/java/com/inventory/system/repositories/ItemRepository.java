package com.inventory.system.repositories;

import com.inventory.system.entities.Item;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
  Optional<Item> findByPartNumber(String partNumber);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select e from Item e where e.itemId = :id")
  java.util.Optional<Item> findLockedById(
      @org.springframework.data.repository.query.Param("id") Long id);
}
