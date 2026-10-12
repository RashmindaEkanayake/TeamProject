package com.inventory.system.services;

import com.inventory.system.entities.*;
import com.inventory.system.exceptions.*;
import com.inventory.system.repositories.*;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StockService {
  private final InventoryStockRepository stocks;
  private final StockMovementRepository movements;

  @Transactional
  public InventoryStock change(Long id, int delta, String reason, String reference, String actor) {
    InventoryStock s =
        stocks
            .findLockedById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Stock record not found"));
    long next = (long) s.getCurrentQuantity() + delta;
    if (next < 0 || next > Integer.MAX_VALUE)
      throw new InsufficientStockException(
          "Stock change would produce an invalid balance for " + s.getItem().getPartNumber());
    s.setCurrentQuantity((int) next);
    stocks.save(s);
    record(s.getItem(), delta, reason, reference, actor);
    return s;
  }

  @Transactional
  public void record(Item item, int delta, String reason, String reference, String actor) {
    if (delta == 0) return;
    StockMovement m = new StockMovement();
    m.setItem(item);
    m.setQuantity(delta);
    m.setReason(reason);
    m.setReference(reference);
    m.setActor(actor);
    m.setCreatedAt(LocalDateTime.now());
    movements.save(m);
  }
}
