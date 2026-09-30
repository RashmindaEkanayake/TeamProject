# NEXUS ERP - Inventory & Sales Management System

A full-stack enterprise inventory and sales management solution built with **Spring Boot 3.2.5** and **React 18 + TypeScript + Vite**.

---

## Architecture Overview

```
project/
 ├── backend/                        # Spring Boot 3.2.5 Maven Backend
 │    ├── pom.xml
 │    └── src/
 │         ├── main/
 │         │    ├── java/com/inventory/system/
 │         │    │    ├── controllers/       # REST API Endpoints
 │         │    │    ├── services/          # Business Logic & Transactions
 │         │    │    ├── repositories/      # Spring Data JPA Repositories
 │         │    │    ├── entities/          # JPA Domain Entities
 │         │    │    ├── dto/               # Data Transfer Objects & Requests
 │         │    │    ├── exceptions/        # Custom Exceptions & Global Handler
 │         │    │    ├── security/          # JWT Provider & Security Filters
 │         │    │    ├── config/            # SecurityConfig, CORS, Beans
 │         │    │    └── InventoryApplication.java
 │         │    └── resources/
 │         │         ├── application.properties
 │         │         └── data.sql           # Database Schema & Seed Data
 │         └── test/
 └── frontend/                       # React 18 + Vite + TypeScript Frontend
      ├── package.json
      ├── vite.config.ts
      ├── tsconfig.json
      ├── tailwind.config.js
      └── src/
           ├── components/                  # Reusable UI Components (Modal, Sidebar, Navbar)
           ├── layouts/                     # Main Layout Shell
           ├── pages/                       # Route Views (Dashboards, Inventory, Orders, etc.)
           ├── routes/                      # AppRoutes & Role-based ProtectedRoute
           ├── services/                    # Axios API Client & JWT Interceptors
           └── types/                       # TypeScript Data Models
```

---

## Default Seed Credentials

The application seeds two default accounts in H2:

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `admin` | `password123` | `ADMIN` | Full administrative access to inventory, goods receiving, orders, pricing approvals, suppliers, and reports. |
| `salesrep` | `password123` | `SALES_REP` | Sales Representative portal with access to assigned customers, sales dashboard, and order submission. |

---

## Prerequisites

- **Java 17** or higher (`java -version`)
- **Apache Maven 3.9+** (`mvn -version`)
- **Node.js 18+** & **npm** (`node -v`, `npm -v`)

---

## Getting Started

### 1. Running the Backend

Open a terminal in the `backend/` directory:

```bash
cd backend
mvn clean spring-boot:run
```

The backend server will start on **`http://localhost:8080`**.
- **REST APIs**: `http://localhost:8080/api`
- **H2 In-Memory Database Console**: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:inventorydb`
  - Username: `sa`
  - Password: *(blank)*

### 2. Running the Frontend

Open a second terminal in the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

The frontend application will be live at **`http://localhost:5173`**.

---

## API Reference

### Authentication
- `POST /api/auth/login` - Authenticate with username/password, returns JWT token and user profile.

### Inventory & Catalog
- `GET /api/inventory` - Retrieve current stock levels and minimum thresholds.
- `GET /api/inventory/{itemId}` - Retrieve single stock record.
- `PUT /api/inventory/{itemId}/adjust?adjustment={qty}` - Adjust item stock quantity.
- `GET /api/items` - List all catalog items.
- `POST /api/items` - Create a new catalog item *(Admin only)*.
- `PUT /api/items/{id}` - Update item details *(Admin only)*.
- `DELETE /api/items/{id}` - Remove an item from catalog *(Admin only)*.

### Orders
- `GET /api/orders` - View all orders (Admins see all; Sales Reps see assigned accounts).
- `GET /api/orders/{id}` - View specific order details.
- `POST /api/orders` - Submit new sales order.
- `GET /api/orders/pending` - List pending orders awaiting approval *(Admin only)*.
- `POST /api/orders/{id}/approve` - Approve order and decrement stock *(Admin only)*.
- `POST /api/orders/{id}/reject` - Reject order with remarks *(Admin only)*.

### Goods Receiving
- `GET /api/goods-receiving/logs` - List all inbound shipment logs.
- `POST /api/goods-receiving/upload` - Ingest shipment batch from Excel (.xlsx) file *(Admin only)*.
- `PUT /api/goods-receiving/items/{id}/verify?status={ARRIVED|MISSING|DAMAGED}` - Verify received item state.
- `POST /api/goods-receiving/{id}/decision?decision={VERIFY|REJECT}` - Finalize shipment batch and credit stock.

### Pricing Approvals
- `GET /api/price-approvals/pending` - List pending price changes *(Admin only)*.
- `POST /api/price-approvals/request` - Propose a new catalog / retail price update.
- `POST /api/price-approvals/{id}/approve` - Authorize price update *(Admin only)*.
- `POST /api/price-approvals/{id}/reject` - Decline price update *(Admin only)*.

### Customers & Suppliers
- `GET /api/customers` - List customer accounts.
- `POST /api/customers` - Create customer account.
- `PUT /api/customers/{id}` - Update customer account.
- `DELETE /api/customers/{id}` - Delete customer *(Admin only)*.
- `GET /api/suppliers` - List vendors and supplier catalogs.
- `POST /api/suppliers` - Register new supplier *(Admin only)*.
- `POST /api/suppliers/{id}/items` - Link item to supplier catalog *(Admin only)*.
- `DELETE /api/suppliers/{id}/items/{itemId}` - Unlink item from supplier catalog *(Admin only)*.
