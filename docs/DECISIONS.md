# ATLAS ERP engineering decisions

## Preserve the existing architecture

The layered Spring Boot backend and React/Tailwind interface were retained. Java package names remain `com.inventory.system`; they are implementation identifiers, not visible branding. The browser title, favicon, navigation, login, CSV headings/filenames and documentation use ATLAS ERP.

## Persistence

Runtime uses MySQL with Flyway versioned migrations and Hibernate schema validation. H2 is isolated to automated tests. Seed accounts are opt-in, use environment-supplied passwords and generated entity IDs, and are never reset at application startup. A private configuration generator avoids bundled credentials.

## Stock and approval integrity

Order approvals and receipt decisions acquire database write locks on the business record. All stock mutations occur inside a transaction and lock the stock row. Multi-item changes use ascending item IDs to reduce deadlocks. Optimistic entity versions cover other concurrent writes. Failed operations roll back stock, decisions, approval history and ledger entries together. A database unique constraint allows only one decision record per order. Pending orders do not reserve stock.

## Representative lifecycle

Soft deactivation preserves foreign keys, usernames, approvals and historical orders. Reassigning customers and setting status share one transaction. A replacement must be active. Representative locks use stable ID order, and assignment creation locks the target representative to coordinate with deactivation. Authentication reloads current account status for every authenticated request; existing tokens cannot keep an inactive representative active. Requests already executing when deactivation happens may finish their transaction.

## Decimal calculations

Financial entity/DTO fields use BigDecimal and database DECIMAL(19,2). Up to 12 integer digits and two decimals are accepted for inputs and order totals. Unsupported fractional cents are rejected rather than rounded silently. Fixed line discounts are bounded by gross line value. Order prices are snapshots from approved catalog pricing. Frontend money previews use integer cents; report revenue is calculated on the server.

## Receiving

Excel rows are validated before any database inserts. This intentionally chooses an atomic import over partial acceptance. Each imported line begins UNVERIFIED. Finalization credits only ARRIVED lines and cannot repeat. A receipt captures supplier, reference, unit cost, received-by account and verification results. Whole-line verification keeps scope appropriate to the project; partial units require separate receipts.

## Security and UX

URL-level role restrictions and method-level checks protect administrative operations. Customer/order ownership is enforced server-side. JSON unknown fields and fractional integer input are rejected. CORS allows exact configured origins without credentials. Exceptions are translated into meaningful statuses; internal failures are not exposed. CSV formula injection and field escaping share one export implementation. Static charts and item placeholders were replaced with database data.

## Scope limits

This is a single-warehouse inventory/sales project. It does not implement a general ledger, payments, tax invoices, shipment logistics, purchase-order planning or a cross-device push-notification service. Logout removes browser credentials; JWTs otherwise expire after the configured duration. Deactivation blocks existing JWTs. A stolen token for an active account remains usable until expiry; deploy over HTTPS and protect frontend content against XSS. Accounts for representatives are managed by Admin; a separate admin self-service profile/password screen is outside this submission scope.

Material Symbols icons are bundled locally with their Apache license, so sidebar controls work offline. Inter remains an optional Google Fonts resource; the application uses a system font fallback. Docker Compose is supplied for convenience; it must be checked on the student's local Docker installation. Native MySQL runtime behavior is covered in validation evidence.
