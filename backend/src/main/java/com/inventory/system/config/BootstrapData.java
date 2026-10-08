package com.inventory.system.config;

import com.inventory.system.entities.*;
import com.inventory.system.repositories.*;
import com.inventory.system.services.StockService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class BootstrapData implements ApplicationRunner {
  private final UserRepository users;
  private final SalesRepRepository reps;
  private final ItemRepository items;
  private final InventoryStockRepository stocks;
  private final PriceHistoryRepository prices;
  private final SupplierRepository suppliers;
  private final CustomerRepository customers;
  private final PasswordEncoder encoder;
  private final StockService ledger;

  @Value("${app.bootstrap.enabled:false}")
  boolean enabled;

  @Value("${app.bootstrap.admin-password:}")
  String adminPassword;

  @Value("${app.bootstrap.sales-password:}")
  String salesPassword;

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    if (!enabled || users.count() != 0) return;
    if (adminPassword.length() < 10
        || salesPassword.length() < 10
        || adminPassword.length() > 72
        || salesPassword.length() > 72)
      throw new IllegalStateException("Bootstrap passwords must contain 10–72 characters");
    SalesRep rep = new SalesRep();
    rep.setFirstName("Demo");
    rep.setLastName("Representative");
    rep.setEmail("sales@example.com");
    reps.save(rep);
    account("admin", adminPassword, "admin@example.com", "ADMIN", null);
    account("salesrep", salesPassword, "sales@example.com", "SALES_REP", rep);
    Supplier supplier = new Supplier();
    supplier.setCompanyName("Demo Technology Supplier");
    supplier.setCompanyEmail("supplier@example.com");
    suppliers.save(supplier);
    Customer customer = new Customer();
    customer.setShopName("Demo Retail Shop");
    customer.setContactPersonName("Demo Customer");
    customer.setRep(rep);
    customers.save(customer);
    for (String[] data :
        new String[][] {
          {"Logitech", "MX Master 3S", "LOGI-MX3S", "89.99"},
          {"Keychron", "K2", "KEY-K2", "79.99"},
          {"Dell", "UltraSharp", "DELL-U27", "449.99"}
        }) {
      Item item = new Item();
      item.setBrand(data[0]);
      item.setModel(data[1]);
      item.setCategory("Electronics");
      item.setPartNumber(data[2]);
      items.save(item);
      InventoryStock stock = new InventoryStock();
      stock.setItem(item);
      stock.setItemId(item.getItemId());
      stock.setCurrentQuantity(50);
      stock.setMinimumStockLevel(10);
      stocks.save(stock);
      ledger.record(item, 50, "OPENING", "BOOTSTRAP", "admin");
      PriceHistory price = new PriceHistory();
      price.setItem(item);
      price.setSalePrice(new BigDecimal(data[3]));
      price.setRetailPrice(new BigDecimal(data[3]));
      price.setImportPrice(new BigDecimal("50.00"));
      price.setStatus("APPROVED");
      price.setStartDate(LocalDateTime.now());
      price.setRequestedBy("admin");
      price.setApprovedBy("admin");
      price.setDecisionDate(LocalDateTime.now());
      prices.save(price);
    }
  }

  private void account(String name, String password, String email, String role, SalesRep rep) {
    User user = new User();
    user.setUsername(name);
    user.setPassword(encoder.encode(password));
    user.setEmail(email);
    user.setRole(role);
    user.setFirstName(role.equals("ADMIN") ? "System" : "Demo");
    user.setLastName(role.equals("ADMIN") ? "Administrator" : "Representative");
    user.setAssociatedRep(rep);
    users.save(user);
  }
}
