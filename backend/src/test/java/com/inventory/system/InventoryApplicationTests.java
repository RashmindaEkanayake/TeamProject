package com.inventory.system;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.*;
import com.inventory.system.entities.*;
import com.inventory.system.repositories.*;
import com.inventory.system.security.JwtTokenProvider;
import com.inventory.system.services.Money;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class InventoryApplicationTests {
  static final String SECRET = UUID.randomUUID().toString() + UUID.randomUUID();

  @DynamicPropertySource
  static void secret(DynamicPropertyRegistry properties) {
    properties.add("app.jwt.secret", () -> SECRET);
  }

  @Autowired org.springframework.transaction.PlatformTransactionManager tx;
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired JwtTokenProvider jwt;
  @Autowired PasswordEncoder encoder;
  @Autowired JdbcTemplate db;
  @Autowired UserRepository users;
  @Autowired SalesRepRepository reps;
  @Autowired CustomerRepository customers;
  @Autowired ItemRepository items;
  @Autowired InventoryStockRepository stocks;
  @Autowired PriceHistoryRepository prices;
  @Autowired SupplierRepository suppliers;
  SalesRep rep, other;
  Customer customer, foreign;
  Item item;
  Supplier supplier;
  String admin, sales;
  long pending;
  String password = "Test-password-123";

  @BeforeEach
  void fixture() {
    new org.springframework.transaction.support.TransactionTemplate(tx)
        .executeWithoutResult(
            status -> {
              for (String table :
                  List.of(
                      "stock_movements",
                      "goods_receiving_items",
                      "goods_receiving",
                      "order_approvals",
                      "order_items",
                      "orders",
                      "price_history",
                      "supplier_items",
                      "inventory_stock",
                      "customers",
                      "users",
                      "items",
                      "suppliers",
                      "sales_reps")) db.update("DELETE FROM " + table);
              rep = rep("rep@example.com");
              other = rep("other@example.com");
              account("admin", "ADMIN", null);
              account("sales", "SALES_REP", rep);
              account("other", "SALES_REP", other);
              customer = customer("My shop", rep);
              foreign = customer("Other shop", other);
              item = new Item();
              item.setBrand("Brand");
              item.setModel("Model");
              item.setCategory("Electronics");
              item.setPartNumber("PART-001");
              item = items.save(item);
              InventoryStock stock = new InventoryStock();
              stock.setItemId(item.getItemId());
              stock.setItem(item);
              stock.setCurrentQuantity(10);
              stock.setMinimumStockLevel(3);
              stocks.save(stock);
              PriceHistory price = new PriceHistory();
              price.setItem(item);
              price.setSalePrice(new BigDecimal("10.10"));
              price.setRetailPrice(new BigDecimal("12.00"));
              price.setImportPrice(new BigDecimal("5.00"));
              price.setStatus("APPROVED");
              price.setStartDate(LocalDateTime.now());
              prices.save(price);
              supplier = new Supplier();
              supplier.setCompanyName("Supplier");
              supplier = suppliers.save(supplier);
              admin = jwt.generateToken("admin", "ADMIN");
              sales = jwt.generateToken("sales", "SALES_REP");
            });
  }

  SalesRep rep(String email) {
    SalesRep r = new SalesRep();
    r.setFirstName("Test");
    r.setLastName("Rep");
    r.setEmail(email);
    return reps.save(r);
  }

  Customer customer(String name, SalesRep r) {
    Customer c = new Customer();
    c.setShopName(name);
    c.setRep(r);
    return customers.save(c);
  }

  void account(String name, String role, SalesRep r) {
    User u = new User();
    u.setUsername(name);
    u.setRole(role);
    u.setEmail(name + "@example.com");
    u.setPassword(encoder.encode(password));
    u.setAssociatedRep(r);
    users.save(u);
  }

  ResultActions postJSON(String path, Object body, String token) throws Exception {
    return mvc.perform(
        post(path)
            .header("Authorization", "Bearer " + token)
            .contentType("application/json")
            .content(json.writeValueAsBytes(body)));
  }

  String orderBody(long customerId, Object quantity, Object discount, Long repId) throws Exception {
    Map<String, Object> body = new HashMap<>();
    body.put("customerId", customerId);
    if (repId != null) body.put("repId", repId);
    body.put(
        "items",
        List.of(
            Map.of("itemId", item.getItemId(), "quantity", quantity, "discountAmount", discount)));
    return json.writeValueAsString(body);
  }

  ResultActions order(long customerId, Object qty, Object discount, Long repId, String token)
      throws Exception {
    return mvc.perform(
        post("/api/orders")
            .header("Authorization", "Bearer " + token)
            .contentType("application/json")
            .content(orderBody(customerId, qty, discount, repId)));
  }

  long validOrder(int qty) throws Exception {
    return json.readTree(
            order(customer.getCustomerId(), qty, "0.20", null, sales)
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString())
        .get("orderId")
        .asLong();
  }

  @Test
  void authenticationAndPasswordHash() throws Exception {
    postJSON("/api/auth/login", Map.of("username", "admin", "password", password), "")
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.role").value("ADMIN"));
    postJSON("/api/auth/login", Map.of("username", "sales", "password", password), "")
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.associatedRepId").value(rep.getRepId()));
    postJSON("/api/auth/login", Map.of("username", "admin", "password", "wrong"), "")
        .andExpect(status().isUnauthorized());
    assertTrue(users.findByUsername("sales").orElseThrow().getPassword().startsWith("$2"));
  }

  @Test
  void expiredInvalidAndMissingTokensRejected() throws Exception {
    String expired =
        Jwts.builder()
            .setSubject("admin")
            .setExpiration(new Date(System.currentTimeMillis() - 10000))
            .signWith(
                Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)),
                SignatureAlgorithm.HS256)
            .compact();
    for (String token : List.of("bad", expired))
      mvc.perform(get("/api/inventory").header("Authorization", "Bearer " + token))
          .andExpect(status().isUnauthorized());
    mvc.perform(get("/api/inventory")).andExpect(status().isUnauthorized());
  }

  @Test
  void salesCannotUseAdminEndpoints() throws Exception {
    for (String path :
        List.of(
            "/api/sales-reps",
            "/api/suppliers",
            "/api/reports/summary",
            "/api/goods-receiving/logs",
            "/api/orders/pending",
            "/api/price-approvals/pending"))
      mvc.perform(get(path).header("Authorization", "Bearer " + sales))
          .andExpect(status().isForbidden());
    mvc.perform(
            put("/api/inventory/" + item.getItemId() + "/adjust")
                .param("adjustment", "3")
                .header("Authorization", "Bearer " + sales))
        .andExpect(status().isForbidden());
    postJSON(
            "/api/sales-reps",
            Map.of(
                "firstName",
                "No",
                "lastName",
                "Access",
                "email",
                "x@example.com",
                "username",
                "hacker",
                "password",
                password),
            sales)
        .andExpect(status().isForbidden());
    mvc.perform(
            put("/api/sales-reps/" + other.getRepId())
                .header("Authorization", "Bearer " + sales)
                .contentType("application/json")
                .content("{} "))
        .andExpect(status().isForbidden());
    mvc.perform(
            patch("/api/sales-reps/" + other.getRepId() + "/status")
                .header("Authorization", "Bearer " + sales)
                .contentType("application/json")
                .content("{\"status\":\"INACTIVE\"}"))
        .andExpect(status().isForbidden());
  }

  @Test
  void ownershipReadUpdateAndList() throws Exception {
    mvc.perform(get("/api/customers").header("Authorization", "Bearer " + sales))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1));
    mvc.perform(
            get("/api/customers/" + foreign.getCustomerId())
                .header("Authorization", "Bearer " + sales))
        .andExpect(status().isForbidden());
    mvc.perform(
            put("/api/customers/" + foreign.getCustomerId())
                .header("Authorization", "Bearer " + sales)
                .contentType("application/json")
                .content("{\"shopName\":\"Changed\"}"))
        .andExpect(status().isForbidden());
    mvc.perform(
            put("/api/customers/" + customer.getCustomerId())
                .header("Authorization", "Bearer " + sales)
                .contentType("application/json")
                .content("{\"shopName\":\"Allowed\"}"))
        .andExpect(status().isOk());
    assertEquals(
        rep.getRepId(),
        customers.findById(customer.getCustomerId()).orElseThrow().getRep().getRepId());
  }

  @Test
  void orderCustomerOwnershipAndAttribution() throws Exception {
    order(foreign.getCustomerId(), 1, 0, null, sales).andExpect(status().isForbidden());
    order(customer.getCustomerId(), 1, 0, null, admin).andExpect(status().isBadRequest());
    order(customer.getCustomerId(), 1, 0, other.getRepId(), admin)
        .andExpect(status().isBadRequest());
    order(customer.getCustomerId(), 1, 0, rep.getRepId(), admin).andExpect(status().isOk());
  }

  @Test
  void nestedInvalidQuantitiesAndDiscounts() throws Exception {
    for (Object quantity : List.of(-1, 0, 1.5))
      order(customer.getCustomerId(), quantity, 0, null, sales).andExpect(status().isBadRequest());
    for (Object discount : List.of(-1, "10.11", "1.001", "NaN"))
      order(customer.getCustomerId(), 1, discount, null, sales).andExpect(status().isBadRequest());
    order(customer.getCustomerId(), 11, 0, null, sales).andExpect(status().isBadRequest());
    assertEquals(10, stocks.findById(item.getItemId()).orElseThrow().getCurrentQuantity());
  }

  @Test
  void duplicateItemsRejected() throws Exception {
    Map<String, Object> line = Map.of("itemId", item.getItemId(), "quantity", 1);
    postJSON(
            "/api/orders",
            Map.of("customerId", customer.getCustomerId(), "items", List.of(line, line)),
            sales)
        .andExpect(status().isBadRequest());
  }

  @Test
  void exactTotalsStockAndDuplicateApproval() throws Exception {
    long id = validOrder(3);
    mvc.perform(get("/api/orders/" + id).header("Authorization", "Bearer " + sales))
        .andExpect(jsonPath("$.totalAmount").value(30.10));
    postJSON("/api/orders/" + id + "/approve", Map.of(), admin).andExpect(status().isOk());
    postJSON("/api/orders/" + id + "/approve", Map.of(), admin).andExpect(status().isConflict());
    assertEquals(7, stocks.findById(item.getItemId()).orElseThrow().getCurrentQuantity());
    assertEquals(1, db.queryForObject("SELECT COUNT(*) FROM stock_movements", Integer.class));
    mvc.perform(get("/api/reports/summary").header("Authorization", "Bearer " + admin))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.approvedRevenue").value(30.10))
        .andExpect(jsonPath("$.totalUnits").value(7));
  }

  @Test
  void rejectionDoesNotDeduct() throws Exception {
    long id = validOrder(2);
    postJSON("/api/orders/" + id + "/reject", Map.of("remarks", "Not approved"), admin)
        .andExpect(status().isOk());
    assertEquals(10, stocks.findById(item.getItemId()).orElseThrow().getCurrentQuantity());
  }

  @Test
  void concurrentSameOrderApprovalsDeductOnce() throws Exception {
    long id = validOrder(3);
    List<Integer> statuses =
        race(
            () ->
                postJSON("/api/orders/" + id + "/approve", Map.of(), admin)
                    .andReturn()
                    .getResponse()
                    .getStatus());
    assertEquals(List.of(200, 409), statuses.stream().sorted().toList());
    assertEquals(7, stocks.findById(item.getItemId()).orElseThrow().getCurrentQuantity());
  }

  @Test
  void concurrentDifferentOrdersCannotOversell() throws Exception {
    long a = validOrder(7), b = validOrder(7);
    java.util.concurrent.atomic.AtomicInteger index =
        new java.util.concurrent.atomic.AtomicInteger();
    List<Integer> statuses =
        race(
            () ->
                postJSON(
                        "/api/orders/" + (index.getAndIncrement() == 0 ? a : b) + "/approve",
                        Map.of(),
                        admin)
                    .andReturn()
                    .getResponse()
                    .getStatus());
    assertEquals(List.of(200, 400), statuses.stream().sorted().toList());
    assertEquals(3, stocks.findById(item.getItemId()).orElseThrow().getCurrentQuantity());
  }

  @Test
  void concurrentStockAdjustmentsPreserveBothChanges() throws Exception {
    assertEquals(
        List.of(200, 200),
        race(
            () ->
                mvc.perform(
                        put("/api/inventory/" + item.getItemId() + "/adjust")
                            .param("adjustment", "3")
                            .header("Authorization", "Bearer " + admin))
                    .andReturn()
                    .getResponse()
                    .getStatus()));
    assertEquals(16, stocks.findById(item.getItemId()).orElseThrow().getCurrentQuantity());
  }

  List<Integer> race(Callable<Integer> action) throws Exception {
    ExecutorService pool = Executors.newFixedThreadPool(2);
    CountDownLatch gate = new CountDownLatch(1);
    try {
      List<Future<Integer>> tasks = new ArrayList<>();
      for (int i = 0; i < 2; i++)
        tasks.add(
            pool.submit(
                () -> {
                  gate.await();
                  return action.call();
                }));
      gate.countDown();
      return List.of(
          tasks.get(0).get(20, TimeUnit.SECONDS), tasks.get(1).get(20, TimeUnit.SECONDS));
    } finally {
      pool.shutdownNow();
    }
  }

  @Test
  void stockCannotBecomeNegative() throws Exception {
    mvc.perform(
            put("/api/inventory/" + item.getItemId() + "/adjust")
                .param("adjustment", "-11")
                .header("Authorization", "Bearer " + admin))
        .andExpect(status().isBadRequest());
    assertEquals(10, stocks.findById(item.getItemId()).orElseThrow().getCurrentQuantity());
  }

  @Test
  void priceApprovalAndHistoryUsedByNewOrder() throws Exception {
    long id =
        json.readTree(
                postJSON(
                        "/api/price-approvals/request",
                        Map.of(
                            "itemId",
                            item.getItemId(),
                            "retailPrice",
                            "15.00",
                            "importPrice",
                            "6.00",
                            "salePrice",
                            "12.25"),
                        sales)
                    .andExpect(status().isOk())
                    .andReturn()
                    .getResponse()
                    .getContentAsString())
            .get("priceId")
            .asLong();
    postJSON("/api/price-approvals/" + id + "/approve", Map.of(), sales)
        .andExpect(status().isForbidden());
    postJSON("/api/price-approvals/" + id + "/approve", Map.of(), admin).andExpect(status().isOk());
    postJSON("/api/price-approvals/" + id + "/approve", Map.of(), admin)
        .andExpect(status().isConflict());
    order(customer.getCustomerId(), 2, 0, null, sales)
        .andExpect(jsonPath("$.totalAmount").value(24.50));
    assertEquals(1, prices.findByItemItemIdAndStatus(item.getItemId(), "APPROVED").size());
  }

  @Test
  void badPricesRejected() throws Exception {
    postJSON(
            "/api/price-approvals/request",
            Map.of(
                "itemId", item.getItemId(), "retailPrice", -1, "importPrice", 0, "salePrice", 10),
            admin)
        .andExpect(status().isBadRequest());
  }

  MockMultipartFile excel(Object[][] rows) throws Exception {
    try (XSSFWorkbook book = new XSSFWorkbook();
        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
      Sheet sheet = book.createSheet();
      Object[][] all = new Object[rows.length + 1][];
      all[0] = new Object[] {"partNumber", "quantity", "costPrice"};
      System.arraycopy(rows, 0, all, 1, rows.length);
      for (int n = 0; n < all.length; n++) {
        Row row = sheet.createRow(n);
        for (int c = 0; c < all[n].length; c++) {
          Object value = all[n][c];
          if (value == null) continue;
          Cell cell = row.createCell(c);
          if (value instanceof Number) cell.setCellValue(((Number) value).doubleValue());
          else cell.setCellValue(value.toString());
        }
      }
      book.write(out);
      return new MockMultipartFile(
          "file",
          "shipment.xlsx",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          out.toByteArray());
    }
  }

  ResultActions importFile(Object[][] rows, String reference) throws Exception {
    return mvc.perform(
        multipart("/api/goods-receiving/upload")
            .file(excel(rows))
            .param("supplierId", supplier.getSupplierId().toString())
            .param("referenceNumber", reference)
            .header("Authorization", "Bearer " + admin));
  }

  @Test
  void invalidExcelRowsAreAtomicAndExplainErrors() throws Exception {
    for (Object[][] rows :
        new Object[][][] {
          {{"PART-001", 1.5, 5}},
          {{"PART-001", 1, "abc"}},
          {{"MISSING", 1, 5}},
          {{"PART-001", null, 5}},
          {{"PART-001", 1, 5}, {"PART-001", 1, 5}},
          {{"PART-001", 1, 5}, {"MISSING", 1, 5}},
          {{"PART-001", 1, -1}},
          {{"PART-001", 0, 5}}
        }) {
      importFile(rows, UUID.randomUUID().toString())
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.successCount").value(0))
          .andExpect(jsonPath("$.errors").isNotEmpty());
      assertEquals(0, db.queryForObject("SELECT COUNT(*) FROM goods_receiving", Integer.class));
    }
  }

  @Test
  void receivingLifecycleAndDuplicateDecision() throws Exception {
    importFile(new Object[][] {{"PART-001", 5, 4.25}}, "SHIP-1")
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.successCount").value(1));
    long batch = db.queryForObject("SELECT receiving_id FROM goods_receiving", Long.class),
        line = db.queryForObject("SELECT receiving_item_id FROM goods_receiving_items", Long.class);
    mvc.perform(
            post("/api/goods-receiving/" + batch + "/decision")
                .param("decision", "VERIFY")
                .header("Authorization", "Bearer " + admin))
        .andExpect(status().isBadRequest());
    mvc.perform(
            put("/api/goods-receiving/items/" + line + "/verify")
                .param("status", "ARRIVED")
                .header("Authorization", "Bearer " + admin))
        .andExpect(status().isOk());
    mvc.perform(
            post("/api/goods-receiving/" + batch + "/decision")
                .param("decision", "VERIFY")
                .header("Authorization", "Bearer " + admin))
        .andExpect(status().isOk());
    mvc.perform(
            post("/api/goods-receiving/" + batch + "/decision")
                .param("decision", "VERIFY")
                .header("Authorization", "Bearer " + admin))
        .andExpect(status().isConflict());
    assertEquals(15, stocks.findById(item.getItemId()).orElseThrow().getCurrentQuantity());
    long id = validOrder(2);
    postJSON("/api/orders/" + id + "/approve", Map.of(), admin).andExpect(status().isOk());
    assertEquals(13, stocks.findById(item.getItemId()).orElseThrow().getCurrentQuantity());
  }

  @Test
  void representativeCreateLoginEditDeactivateReactivate() throws Exception {
    Map<String, Object> body =
        Map.of(
            "firstName",
            "New",
            "lastName",
            "Rep",
            "email",
            "new@example.com",
            "username",
            "newrep",
            "password",
            password);
    long id =
        json.readTree(
                postJSON("/api/sales-reps", body, admin)
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("ACTIVE"))
                    .andExpect(jsonPath("$.password").doesNotExist())
                    .andReturn()
                    .getResponse()
                    .getContentAsString())
            .get("repId")
            .asLong();
    assertEquals("SALES_REP", users.findByUsername("newrep").orElseThrow().getRole());
    postJSON("/api/auth/login", Map.of("username", "newrep", "password", password), "")
        .andExpect(status().isOk());
    mvc.perform(
            put("/api/sales-reps/" + id)
                .header("Authorization", "Bearer " + admin)
                .contentType("application/json")
                .content(
                    "{\"firstName\":\"Edited\",\"lastName\":\"Rep\",\"email\":\"new@example.com\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.firstName").value("Edited"));
    statusChange(id, "INACTIVE", null).andExpect(status().isOk());
    postJSON("/api/auth/login", Map.of("username", "newrep", "password", password), "")
        .andExpect(status().isUnauthorized());
    mvc.perform(
            get("/api/orders")
                .header("Authorization", "Bearer " + jwt.generateToken("newrep", "SALES_REP")))
        .andExpect(status().isUnauthorized());
    statusChange(id, "ACTIVE", null).andExpect(status().isOk());
    postJSON("/api/auth/login", Map.of("username", "newrep", "password", password), "")
        .andExpect(status().isOk());
  }

  ResultActions statusChange(long id, String status, Long target) throws Exception {
    Map<String, Object> body = new HashMap<>();
    body.put("status", status);
    if (target != null) body.put("reassignToRepId", target);
    return mvc.perform(
        patch("/api/sales-reps/" + id + "/status")
            .header("Authorization", "Bearer " + admin)
            .contentType("application/json")
            .content(json.writeValueAsBytes(body)));
  }

  @Test
  void deactivationReassignsCustomersPreservesHistoricalOrders() throws Exception {
    long id = validOrder(2);
    statusChange(rep.getRepId(), "INACTIVE", null).andExpect(status().isBadRequest());
    statusChange(rep.getRepId(), "INACTIVE", other.getRepId()).andExpect(status().isOk());
    assertEquals(
        other.getRepId(),
        customers.findById(customer.getCustomerId()).orElseThrow().getRep().getRepId());
    assertEquals(
        rep.getRepId(),
        db.queryForObject("SELECT rep_id FROM orders WHERE order_id=?", Long.class, id));
    assertTrue(users.findByUsername("sales").isPresent());
    mvc.perform(get("/api/orders").header("Authorization", "Bearer " + sales))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void representativeValidationAndPrivilegeInjectionRejected() throws Exception {
    postJSON(
            "/api/sales-reps",
            Map.of(
                "firstName",
                "New",
                "lastName",
                "Rep",
                "email",
                "bad-email",
                "username",
                "newrep",
                "password",
                "short"),
            admin)
        .andExpect(status().isBadRequest());
    postJSON(
            "/api/sales-reps",
            Map.of(
                "firstName",
                "New",
                "lastName",
                "Rep",
                "email",
                "new@example.com",
                "username",
                "sales",
                "password",
                password),
            admin)
        .andExpect(status().isBadRequest());
    postJSON(
            "/api/sales-reps",
            Map.of(
                "firstName",
                "New",
                "lastName",
                "Rep",
                "email",
                "rep@example.com",
                "username",
                "newrep",
                "password",
                password),
            admin)
        .andExpect(status().isBadRequest());
    postJSON(
            "/api/sales-reps",
            Map.of(
                "firstName",
                "New",
                "lastName",
                "Rep",
                "email",
                "new@example.com",
                "username",
                "newrep",
                "password",
                password,
                "role",
                "ADMIN"),
            admin)
        .andExpect(status().isBadRequest());
  }

  @Test
  void moneyRoundingRules() {
    assertEquals(new BigDecimal("0.30"), Money.line(new BigDecimal("0.10"), 3, BigDecimal.ZERO));
    assertThrows(IllegalArgumentException.class, () -> Money.value(new BigDecimal("1.001")));
  }

  @Test
  void corsOnlyConfiguredOrigin() throws Exception {
    mvc.perform(
            options("/api/items")
                .header("Origin", "https://untrusted.example")
                .header("Access-Control-Request-Method", "GET"))
        .andExpect(status().isForbidden());
    mvc.perform(
            options("/api/items")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET"))
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
  }
}
