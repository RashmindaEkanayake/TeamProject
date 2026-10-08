# ATLAS ERP

University software engineering team project: inventory and sales management with separate Admin and Sales Representative portals. The existing dark interface and layered application structure have been retained.

## Requirements

- Java 17, Maven 3.9+, Node.js 20+, npm, Python 3 (standard library only for launch scripts).
- MySQL 8.0.16 or newer within MySQL 8.0 (CHECK constraints are required); tested with MySQL 8.0.46.
- Docker Compose is optional and provides a convenient local MySQL instance.

## Run locally

From this project's root:

1. Generate local secrets: `python scripts/configure.py` (use `python3` on Linux/macOS if needed).
2. Start MySQL: `docker compose up -d db`. Wait for `docker compose ps` to show healthy. Keep the database volume between runs.
3. Start the backend in terminal 1: `python scripts/run_backend.py`. API: http://localhost:8080/api.
4. In terminal 2: `cd frontend`, `npm ci`, then `npm run dev`. Open http://localhost:5173.
5. Open the private root `.env` file. Login as **admin** using `BOOTSTRAP_ADMIN_PASSWORD`, or **salesrep** using `BOOTSTRAP_SALES_PASSWORD`.
6. After initial startup, set `BOOTSTRAP_ENABLED=false`. The initial demo dataset is explicitly opt-in; it is stored in the database and never overwrites accounts or business data on restart.

Windows users can use `start-backend.bat` and `start-frontend.bat` after steps 1–2. The backend script loads `.env` without executing shell code. `.env` is private and must not be submitted or committed. Existing credentials are not overwritten by the configuration generator.

### Existing local MySQL instead of Docker

Create a new empty database `atlas_erp` with `utf8mb4` encoding and a dedicated database account. Give that account schema privileges on **only** `atlas_erp` (Flyway needs CREATE/ALTER/INDEX, and the app needs SELECT/INSERT/UPDATE/DELETE). Put the JDBC URL, username and password in `.env`. Use the account password already set in MySQL rather than the generated Docker password. Do not use a root account for the app.

Flyway applies `backend/src/main/resources/db/migration/V1__initial_schema.sql` and subsequent migrations once. Hibernate uses `ddl-auto=validate`. Restarting does not drop tables or repeat seed inserts. An existing incompatible prototype database should not be pointed at this project; use a new database and migrate its data deliberately.

The supplied JDBC URL disables TLS **for loopback local development only**. For a remote deployment, set `DB_URL` to a TLS-enabled connection (for example `sslMode=VERIFY_IDENTITY`) and set `CORS_ALLOWED_ORIGINS` to the exact HTTPS frontend origin. Frontend configuration uses `VITE_API_BASE_URL`; no secret belongs in a Vite variable.

## Build and test

Backend, from `backend/`:

```bash
mvn clean verify
```

Frontend, from `frontend/`:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Backend integration tests use a disposable H2 database in MySQL compatibility mode and the same Flyway migrations. H2 is **test-only**, absent from the packaged runtime, and has no exposed web console. Mockito uses its subclass mock maker so tests do not require JVM agent attachment. Runtime storage is MySQL.

Optional browser tests (with frontend and backend already running on a disposable development database): `npx playwright install chromium`, then `npm run test:e2e`. Tests read initial Admin credentials from root `.env`, or `E2E_ADMIN_PASSWORD`. They create uniquely named test representatives; use the Admin portal to deactivate those accounts afterward. Never run mutation tests against a production database.

Backend output: `backend/target/system-0.0.1-SNAPSHOT.jar`. Frontend output: `frontend/dist`. Use an SPA-aware web server for a hosted frontend so direct routes return `index.html`.

## Main workflows

- **Representatives:** Admin creates a profile and BCrypt login together. The server assigns `SALES_REP`; clients cannot supply arbitrary roles. Admin can edit name, email, phone, and optionally reset the password. Usernames remain stable to preserve named approval history. Deactivation keeps the account and history. If customers are assigned, the admin must select another active representative; reassignment and deactivation happen in one transaction. Reactivation is supported. Inactive representatives cannot log in or use existing tokens.
- **Customers:** Representatives can create, view and edit only their assigned customers. Admin can assign customers to active representatives. Omitting an assignment during edit preserves it. Historical orders keep their original representative even after customer reassignment.
- **Catalog and inventory:** Admin creates items with an optional opening quantity. Catalog editing preserves stock and description. Separate signed whole-number adjustments are recorded in the ledger. Negative resulting stock is rejected.
- **Orders:** Admin selects the active representative and a customer assigned to them. A sales representative can submit only for their own customer. Catalog-approved prices are read by the server; client unit-price overrides are rejected. Click an invoice to view its lines and captured prices. Quantities must be positive whole numbers and products cannot appear twice. Discounts are fixed **per-line monetary amounts**, from zero up to that line's gross value; percentage discounts are not supported. Totals use decimal arithmetic and two decimal places. Prices are captured at submission; later price changes affect new orders only.
- **Approvals:** Stock is deducted only on order approval, not submission or rejection. The order and stock rows are locked; multiple stock items are processed in stable item-ID order. Repeated approvals cannot deduct twice. Pending orders do not reserve stock; the stock check is repeated at approval.
- **Pricing:** Both roles can request prices. Representatives see their own request history; Admin approves/rejects. Prior approved prices become `SUPERSEDED`, retain an end date, and remain in Item Details history. Decisions are serialized per item.
- **Receiving:** Admin uploads Excel, verifies every line, then finalizes/rejects. Only `ARRIVED` lines increase stock. `MISSING` and `DAMAGED` lines do not. Verification is for a whole line; split partial deliveries into distinct shipment references. A finalized batch cannot be repeated.
- **Reports:** Approved-order value, stock counts, and a 12-month ledger movement chart use database data. Approved-order value is sales booked, not a payment collection metric. CSV exports escape quotes, separators and line breaks and neutralize spreadsheet formulas.
- **Notifications:** Derived from actual order status and pending prices. Read IDs persist per account in this browser's local storage. This is not a cross-device notification service. Status changes create distinct notification IDs. Time labels use order creation time, not a notification-delivery timestamp.

## Excel format

First sheet, first row, in this exact order:

| partNumber | quantity | costPrice |
|---|---|---|
| LOGI-MX3S | 5 | 65.00 |

Use an Excel **Text** cell for part numbers, positive whole-number quantities, and non-negative costs with at most two decimal places. `.xlsx` and `.xls` workbooks are accepted (up to 10 MB / 10,000 rows). Formulas are not evaluated. A product must already exist in the catalog. Duplicate products within a file, blank required values, invalid costs, fractional quantities and unknown products produce row errors. If any row fails, **nothing** from that file is stored. Blank rows are skipped. Receipt references must be unique.

## Architecture and submission contents

- `backend/`: Spring Boot 3.2.5, Spring Security/JWT, Spring Data JPA, MySQL connector, Flyway, Apache POI, validation and integration tests.
- `frontend/`: React 18, TypeScript, Vite, Tailwind, Axios, role routes, ESLint and CSV/money tests.
- `scripts/`: configuration generation and cross-platform backend startup.
- `docs/`: API roles, engineering decisions, validation evidence and remaining scope.
- `compose.yaml`: local persistent MySQL service.

Generated builds, installed dependencies, private configuration, and test database files are excluded from the clean source submission.

See [validation report](docs/VALIDATION.md), [API roles](docs/API.md), and [engineering decisions](docs/DECISIONS.md).
