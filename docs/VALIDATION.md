# ATLAS ERP final validation

Executed on 4 October 2026. Changes were continued from the modified project, retaining the React/Spring structure and previously implemented fixes.

## Executed checks

| Check | Result |
|---|---|
| Backend `mvn clean verify`, Java 17 / Maven 3.9.9 | PASS; compilation, packaging and 22 tests, zero failures/errors/skips |
| Same 22 integration tests with MySQL 8.0.46 datasource overrides | PASS; zero failures/errors/skips |
| Packaged Spring Boot application against native MySQL | PASS; both Flyway migrations applied and Hibernate schema validation passed |
| Live HTTP checks against that packaged application | PASS; 53 checks |
| Restart the packaged application against the same database | PASS; approved order, inventory, edited representative and account password persisted |
| `npm ci --ignore-scripts` | PASS; lockfile installation |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS; five CSV safety tests |
| `npm run build` | PASS; TypeScript and Vite production output |
| `npm run format:check` | PASS |
| `npm run test:e2e` with live backend/frontend | PASS; one complete Playwright representative lifecycle scenario |
| Additional real-browser smoke workflow | PASS; ten Admin page loads, representative creation/login, route protection, deactivation/reactivation; no observed JavaScript errors |
| Configuration generator | PASS; private file permissions and refusal to overwrite existing secrets |
| Packaged runtime dependency inspection | MySQL and Flyway present; H2 absent |
| Source branding scan | Zero retired-brand matches in submitted text files; browser title verified as ATLAS ERP |

The browser environment could not run standard Chrome because of restricted socket creation. A headless Chromium build with software rendering was used successfully instead. No browser workflow is claimed solely from source inspection. Local students can use the normal Playwright installation documented in the README.

## Representative acceptance checks

Admin API listing, account creation, profile edit and status changes were verified against real MySQL. Creation stores a BCrypt hash and a server-selected SALES_REP role. New-account login succeeds. Duplicate username/email, invalid passwords/email and arbitrary role fields are rejected.

The browser scenario covers listing, creation, editing, new-account login, Sales route protection, deactivation, failed inactive-account login, reactivation and successful login again. Direct Sales calls to GET, POST, PUT and PATCH representative-management endpoints return 403, independently of the UI.

API tests create assigned customers and historical orders. Deactivation without a replacement is rejected; an active replacement is required. Customer reassignment and deactivation are atomic. Historical orders retain their original representative, and the representative/account records remain present. Existing JWTs for the inactive account are rejected. Reactivation restores login.

## Previous requirement verification

| Area | Implemented and verified behavior |
|---|---|
| Authentication / roles | Signed expiring JWTs, current database role/status, BCrypt, JSON 401/403, protected administrative operations |
| Ownership | Sales users cannot read/edit another representative's customers or submit orders for them |
| Admin orders | Selected active representative must own the selected customer |
| Nested validation | Null lines, duplicate products, nonpositive/fractional quantities, client price overrides and unsupported monetary precision rejected |
| Discounts / money | Fixed per-line discount bounded by gross; BigDecimal/DECIMAL calculations and approved price snapshots |
| Stock concurrency | Database row locks, transactional ledger, repeated approval protection; simultaneous decisions and overselling tested |
| Persistent database | MySQL runtime, Flyway migrations, schema validation, opt-in bootstrap; restart does not reset passwords or records |
| JWT configuration | No fallback secret; minimum key length enforced; private generator supplied |
| H2 | Test-scoped only; no runtime H2 or console |
| Goods Receiving | Supplier upload, atomic Excel errors, line verification and one-time finalization; only ARRIVED lines add stock |
| Reports / dashboard | Approved-order totals and inventory movement from database; no synthetic chart data |
| Excel | Header/format, duplicate/unknown parts, quantity/cost precision, formula and size/row limits; invalid batch writes nothing |
| API errors | Meaningful validation/not-found/conflict responses and generic internal errors |
| CORS | Explicit origins; permitted and disallowed preflight requests tested |
| CSV | Escaping, CRLF/BOM and spreadsheet formula neutralization; five automated cases |
| Notifications | Real order/price-request state; read state retained per account in the browser |
| Item Details | Real product, price history and authorized inventory ledger |
| Frontend connections | Representative management, receiving, price decisions/requests, customers, suppliers, invoice details, exports and retry/error states connected |

## Evidence and reproducibility

See `test-results/mysql-http-checks.txt`, `test-results/mysql-integration.txt` `test-results/browser-smoke.txt` and `test-results/playwright.txt`. Automated backend and frontend test source is included. Scratch database accounts, private secrets, native MySQL/browser binaries, installed dependencies and generated output are excluded from submission.

Run `mvn clean verify` in `backend/`. To repeat against MySQL, use a **disposable empty test schema** and override `spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password`, `spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver` and `spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect` with Maven `-D` arguments. Never point mutation tests at real business data. Frontend commands and browser-test startup are in the README.

## Remaining verification limits

Docker Compose itself was not executed in this environment; native MySQL startup, migrations, application behavior and persistence were executed. Windows launchers were reviewed but not run on Windows. The tests cover important workflows rather than every possible field combination or browser/device. Inter font loading depends on Google Fonts, with a system fallback; icons are bundled locally. Notification read state is browser-local, and there is no payment-processing or general accounting subsystem. See `DECISIONS.md` for explicit project scope.
