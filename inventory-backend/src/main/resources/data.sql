-- Seed Sales Representatives
INSERT INTO sales_reps (rep_id, first_name, last_name, email, phone_number) VALUES
(1, 'John', 'Doe', 'john.doe@system.com', '+1234567890');

-- Seed Users for Authentication
-- Password for admin is 'admin123' (BCrypt hashed) -> $2a$10$H8yQZ9v2fIeb3GkCjNf/mO073nLwD8H1226xLd/b8qJ4hHk7H4rO2
-- Password for salesrep is 'salesrep123' (BCrypt hashed) -> $2a$10$QO0R8HhP7n7tE6u5y8hN/Ou73nLwD8H1226xLd/b8qJ4hHk7H4rO2
-- We'll use a unified BCrypt password for both: '$2a$10$pLgqH1gHk5V5O0lHqjUbe.W3t2E3wU7v0L5hJ9y2g2M2sWw9H8z6e' (BCrypt for 'password123')
-- Admin: username 'admin', password 'password123'
-- Sales Rep: username 'salesrep', password 'password123'

INSERT INTO users (id, username, password, email, role, first_name, last_name, associated_rep_id) VALUES
(1, 'admin', '$2a$10$pLgqH1gHk5V5O0lHqjUbe.W3t2E3wU7v0L5hJ9y2g2M2sWw9H8z6e', 'admin@system.com', 'ADMIN', 'System', 'Administrator', NULL),
(2, 'salesrep', '$2a$10$pLgqH1gHk5V5O0lHqjUbe.W3t2E3wU7v0L5hJ9y2g2M2sWw9H8z6e', 'john.doe@system.com', 'SALES_REP', 'John', 'Doe', 1);

-- Seed Suppliers
INSERT INTO suppliers (supplier_id, company_name, company_email, contact_number, fax, country, bank_details, contact_person, contact_person_number, person_email) VALUES
(1, 'Global Tech Supplies', 'info@globaltech.com', '+1999888777', 'FAX-999', 'United States', 'Chase Bank, Acct: 123456789', 'Robert Smith', '+1999888778', 'robert@globaltech.com');

-- Seed Catalog Items
INSERT INTO items (item_id, brand, model, category, part_number, description) VALUES
(1, 'Logitech', 'MX Master 3S', 'Accessories', 'LOGI-MX3S', 'Ergonomic wireless office mouse'),
(2, 'Keychron', 'K2 Version 2', 'Accessories', 'KEY-K2V2', 'Wireless mechanical keyboard 75% layout'),
(3, 'Dell', 'UltraSharp U2723QE', 'Monitors', 'DELL-U2723QE', '27-inch 4K USB-C Hub monitor');

-- Seed Supplier Items Catalog
INSERT INTO supplier_items (supplier_item_id, supplier_id, item_id, supplier_part_number, supplier_price, supply_quantity) VALUES
(1, 1, 1, 'SUPP-LOGI-MX3S', 65.00, 100),
(2, 1, 2, 'SUPP-KEY-K2V2', 55.00, 80),
(3, 1, 3, 'SUPP-DELL-U2723QE', 320.00, 50);

-- Seed Inventory Stock Levels
INSERT INTO inventory_stock (item_id, current_quantity, minimum_stock_level, last_updated) VALUES
(1, 50, 10, CURRENT_TIMESTAMP),
(2, 25, 5, CURRENT_TIMESTAMP),
(3, 12, 3, CURRENT_TIMESTAMP);

-- Seed Customers
INSERT INTO customers (customer_id, shop_name, shop_address, contact_number, shop_email, contact_person_name, rep_id) VALUES
(1, 'TechZone Retail', '123 Tech Avenue, New York, NY', '+1555123456', 'orders@techzone.com', 'Alice Johnson', 1),
(2, 'Gadget Hub', '456 Innovation Blvd, San Francisco, CA', '+1555987654', 'contact@gadgethub.com', 'Bob Williams', 1);

-- Seed Initial Price History (Approved catalog pricing)
INSERT INTO price_history (item_id, retail_price, import_price, sale_price, start_date, status, requested_by, approved_by, decision_date) VALUES
(1, 99.99, 65.00, 89.99, CURRENT_TIMESTAMP, 'APPROVED', 'admin', 'admin', CURRENT_TIMESTAMP),
(2, 89.99, 55.00, 79.99, CURRENT_TIMESTAMP, 'APPROVED', 'admin', 'admin', CURRENT_TIMESTAMP),
(3, 499.99, 320.00, 449.99, CURRENT_TIMESTAMP, 'APPROVED', 'admin', 'admin', CURRENT_TIMESTAMP);
