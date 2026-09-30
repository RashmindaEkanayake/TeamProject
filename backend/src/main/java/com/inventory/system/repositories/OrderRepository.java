package com.inventory.system.repositories;

import com.inventory.system.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByRepRepId(Long repId);
    List<Order> findByOrderStatus(String orderStatus);
}
