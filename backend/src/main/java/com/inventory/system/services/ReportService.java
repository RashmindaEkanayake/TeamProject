package com.inventory.system.services;

import com.inventory.system.entities.*;
import com.inventory.system.repositories.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {
  private final OrderRepository orders;
  private final InventoryStockRepository stocks;
  private final StockMovementRepository movements;

  public record MonthMovement(String month, long incoming, long outgoing) {}

  public record Summary(
      BigDecimal approvedRevenue,
      long totalUnits,
      long lowStockCount,
      List<MonthMovement> movement) {}

  public Summary summary() {
    BigDecimal revenue =
        orders.findByOrderStatus("APPROVED").stream()
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add);
    List<InventoryStock> stock = stocks.findAll();
    YearMonth first = YearMonth.now().minusMonths(11);
    List<StockMovement> ms =
        movements.findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(first.atDay(1).atStartOfDay());
    List<MonthMovement> months = new ArrayList<>();
    for (int i = 0; i < 12; i++) {
      YearMonth month = first.plusMonths(i);
      long in = 0, out = 0;
      for (StockMovement m : ms)
        if (YearMonth.from(m.getCreatedAt()).equals(month)) {
          if (m.getQuantity() > 0) in += m.getQuantity();
          else out -= (long) m.getQuantity();
        }
      months.add(new MonthMovement(month.toString(), in, out));
    }
    return new Summary(
        revenue,
        stock.stream().mapToLong(InventoryStock::getCurrentQuantity).sum(),
        stock.stream().filter(s -> s.getCurrentQuantity() <= s.getMinimumStockLevel()).count(),
        months);
  }

  public List<StockMovement> itemMovements(Long id) {
    return movements.findByItemItemIdOrderByCreatedAtDesc(id);
  }
}
