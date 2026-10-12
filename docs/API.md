# ATLAS ERP API and permissions

All paths below are relative to `/api`. Login is public. Other requests require `Authorization: Bearer <token>`. Normal responses serialize decimal financial values as JSON numbers; the backend remains authoritative for calculations.

| API | Admin | Sales Representative |
|---|---|---|
| POST `/auth/login` | Login | Login if active |
| GET `/items`, `/items/{id}` | Read | Read |
| POST/PUT/DELETE `/items` or `/items/{id}` | Manage | Forbidden |
| GET `/inventory`, `/inventory/{id}` | Read | Read |
| PUT `/inventory/{id}/adjust?adjustment=5` | Adjust | Forbidden |
| GET `/customers` | All | Own only |
| GET/PUT `/customers/{id}` | Manage | Own only |
| POST `/customers` | Create/assign | Creates own customer |
| DELETE `/customers/{id}` | Delete if unreferenced | Forbidden |
| GET/POST `/sales-reps`, GET/PUT `/sales-reps/{id}` | Manage | Forbidden |
| PATCH `/sales-reps/{id}/status` | Deactivate/reactivate | Forbidden |
| `/suppliers` and supplier item catalog endpoints | Manage | Forbidden |
| GET `/orders`, `/orders/{id}` | All | Own only |
| POST `/orders` | Select assigned rep/customer | Own customer |
| GET `/orders/pending` | Read | Forbidden |
| POST `/orders/{id}/approve`, `/reject` | Decide | Forbidden |
| POST `/price-approvals/request` | Request | Request |
| GET `/price-approvals/mine` | Own requests | Own requests |
| GET `/price-approvals/history/{itemId}` | Read | Read |
| GET `/price-approvals/pending` | Read | Forbidden |
| POST `/price-approvals/{id}/approve`, `/reject` | Decide | Forbidden |
| GET `/goods-receiving/logs`, `/goods-receiving/{id}` | Read | Forbidden |
| POST `/goods-receiving/upload` | Import | Forbidden |
| PUT `/goods-receiving/items/{id}/verify?status=ARRIVED` | Verify | Forbidden |
| POST `/goods-receiving/{id}/decision?decision=VERIFY` | Finalize | Forbidden |
| GET `/reports/summary`, `/reports/movements/{itemId}` | Read | Forbidden |

## Representative creation

```json
{"firstName":"Jane","lastName":"Perera","email":"jane@example.com","phoneNumber":"0712345678","username":"jane.perera","password":"<private password of 10–72 characters>"}
```

Username must contain 3–100 letters, numbers, dots, underscores or hyphens. Email and username must be unique. Passwords are write-only, never returned by the representative APIs, and are BCrypt-hashed. No `role` input is accepted. Existing usernames are preserved on edit; include a password only to reset it.

Deactivate with `{"status":"INACTIVE","reassignToRepId":123}`. Omit `reassignToRepId` only when no customers need reassignment. Reactivate with `{"status":"ACTIVE"}`. There is no physical representative-delete endpoint.

## Orders and money

```json
{"customerId":123,"repId":456,"items":[{"itemId":789,"quantity":2,"discountAmount":1.50}]}
```

`repId` is required for Admin submissions and is derived from the authenticated account for representative submissions. It must match the customer's assigned representative. A request-supplied unit price is not accepted. Reject with `{"remarks":"Reason"}`.

Money must be non-negative, contain at most 12 integer digits and two decimal places. Quantities must be positive integers. Duplicate item lines and excessive discounts are rejected.

## Errors

- `400`: invalid request or insufficient stock.
- `401`: missing/invalid/expired token, wrong login, or inactive account.
- `403`: role or ownership violation.
- `404`: missing resource.
- `409`: already decided record, duplicate/reference constraint, or concurrency conflict.
- `413`: upload too large.
- `500`: unexpected failure with a generic public message; details remain in server logs.

Failed Excel row validation returns an import-result object with `successCount: 0` and `errors`; no receipt is inserted. Structural/file errors return `400`. The frontend checks row errors before announcing success.
