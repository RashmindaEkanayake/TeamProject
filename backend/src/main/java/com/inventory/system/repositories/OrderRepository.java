package com.inventory.system.repositories;

import com.inventory.system.entities.Order;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
  List<Order> findByRepRepId(Long repId);

  List<Order> findByOrderStatus(String orderStatus);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select e from Order e where e.orderId = :id")
  java.util.Optional<Order> findLockedById(
      @org.springframework.data.repository.query.Param("id") Long id);
}
