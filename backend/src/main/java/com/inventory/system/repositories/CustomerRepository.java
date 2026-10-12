package com.inventory.system.repositories;

import com.inventory.system.entities.Customer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
  List<Customer> findByRepRepId(Long repId);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query(
      "select e from Customer e where e.customerId = :id")
  java.util.Optional<Customer> findLockedById(
      @org.springframework.data.repository.query.Param("id") Long id);
}
