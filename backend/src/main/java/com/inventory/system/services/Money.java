package com.inventory.system.services;

import java.math.*;

public final class Money {
  private Money() {}

  public static BigDecimal value(BigDecimal amount) {
    if (amount == null
        || amount.signum() < 0
        || amount.precision() - amount.scale() > 12
        || amount.stripTrailingZeros().scale() > 2)
      throw new IllegalArgumentException(
          "Money must be non-negative, at most 12 integer digits and 2 decimal places");
    return amount.setScale(2, RoundingMode.UNNECESSARY);
  }

  public static BigDecimal line(BigDecimal price, int quantity, BigDecimal discount) {
    if (quantity <= 0) throw new IllegalArgumentException("Quantity must be positive");
    BigDecimal gross = value(price).multiply(BigDecimal.valueOf(quantity));
    BigDecimal reduction = value(discount == null ? BigDecimal.ZERO : discount);
    if (reduction.compareTo(gross) > 0)
      throw new IllegalArgumentException("Discount cannot exceed line value");
    return value(gross.subtract(reduction));
  }
}
