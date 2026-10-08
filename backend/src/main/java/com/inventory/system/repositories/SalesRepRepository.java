package com.inventory.system.repositories;

import com.inventory.system.entities.SalesRep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesRepRepository extends JpaRepository<SalesRep, Long> {
  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select r from SalesRep r where r.repId=:id")
  java.util.Optional<SalesRep> findLockedById(
      @org.springframework.data.repository.query.Param("id") Long id);

  java.util.Optional<SalesRep> findByEmail(String email);
}
