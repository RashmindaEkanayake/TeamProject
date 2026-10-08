-- ATLAS ERP initial schema. Flyway applies this once; JPA validates on startup.
CREATE TABLE sales_reps (
    version BIGINT NOT NULL DEFAULT 0,
    rep_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(255)
);

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    associated_rep_id BIGINT,
    FOREIGN KEY (associated_rep_id) REFERENCES sales_reps(rep_id)
);

CREATE TABLE suppliers (
    version BIGINT NOT NULL DEFAULT 0,
    supplier_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(255) NOT NULL,
    company_email VARCHAR(255),
    contact_number VARCHAR(255),
    fax VARCHAR(255),
    country VARCHAR(255),
    bank_details VARCHAR(255),
    contact_person VARCHAR(255),
    contact_person_number VARCHAR(255),
    person_email VARCHAR(255)
);

CREATE TABLE items (
    version BIGINT NOT NULL DEFAULT 0,
    item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    part_number VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE customers (
    version BIGINT NOT NULL DEFAULT 0,
    customer_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_name VARCHAR(255) NOT NULL,
    shop_address VARCHAR(255),
    contact_number VARCHAR(255),
    shop_email VARCHAR(255),
    contact_person_name VARCHAR(255),
    rep_id BIGINT,
    FOREIGN KEY (rep_id) REFERENCES sales_reps(rep_id)
);

CREATE TABLE inventory_stock (
    version BIGINT NOT NULL DEFAULT 0,
    item_id BIGINT PRIMARY KEY,
    current_quantity INT NOT NULL CHECK (current_quantity >= 0),
    minimum_stock_level INT NOT NULL CHECK (minimum_stock_level >= 0),
    last_updated DATETIME(6),
    FOREIGN KEY (item_id) REFERENCES items(item_id)
);

CREATE TABLE supplier_items (
    version BIGINT NOT NULL DEFAULT 0,
    supplier_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    supplier_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    supplier_part_number VARCHAR(100),
    supplier_price DECIMAL(19,2) NOT NULL CHECK (supplier_price >= 0),
    supply_quantity INT NOT NULL CHECK (supply_quantity >= 0),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    FOREIGN KEY (item_id) REFERENCES items(item_id),
    UNIQUE (supplier_id, item_id)
);

CREATE TABLE orders (
    version BIGINT NOT NULL DEFAULT 0,
    order_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invoice_num VARCHAR(100) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    rep_id BIGINT NOT NULL,
    ordered_date DATE NOT NULL,
    closing_date DATE,
    total_amount DECIMAL(19,2) NOT NULL CHECK (total_amount >= 0),
    outstanding_amount DECIMAL(19,2) NOT NULL CHECK (outstanding_amount >= 0),
    clearance_status BOOLEAN NOT NULL,
    order_status VARCHAR(20) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (rep_id) REFERENCES sales_reps(rep_id)
);

CREATE TABLE order_items (
    order_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 1),
    unit_price DECIMAL(19,2) NOT NULL CHECK (unit_price >= 0),
    discount_amount DECIMAL(19,2) NOT NULL CHECK (discount_amount >= 0),
    total_price DECIMAL(19,2) NOT NULL CHECK (total_price >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (item_id) REFERENCES items(item_id),
    UNIQUE (order_id, item_id)
);

CREATE TABLE order_approvals (
    approval_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    approved_by VARCHAR(255),
    approval_status VARCHAR(255) NOT NULL,
    approval_date DATETIME(6) NOT NULL,
    remarks VARCHAR(255),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    UNIQUE (order_id)
);

CREATE TABLE price_history (
    version BIGINT NOT NULL DEFAULT 0,
    price_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT NOT NULL,
    retail_price DECIMAL(19,2) NOT NULL CHECK (retail_price >= 0),
    import_price DECIMAL(19,2) NOT NULL CHECK (import_price >= 0),
    sale_price DECIMAL(19,2) NOT NULL CHECK (sale_price >= 0),
    start_date DATETIME(6) NOT NULL,
    end_date DATETIME(6),
    status VARCHAR(20) NOT NULL,
    requested_by VARCHAR(100),
    approved_by VARCHAR(100),
    decision_date DATETIME(6),
    FOREIGN KEY (item_id) REFERENCES items(item_id)
);

CREATE TABLE goods_receiving (
    version BIGINT NOT NULL DEFAULT 0,
    receiving_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    supplier_id BIGINT NOT NULL,
    reference_number VARCHAR(255) NOT NULL UNIQUE,
    received_by VARCHAR(255),
    notes VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    receive_date DATETIME(6) NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

CREATE TABLE goods_receiving_items (
    receiving_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    receiving_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    quantity_received INT NOT NULL CHECK (quantity_received >= 1),
    cost_price DECIMAL(19,2) NOT NULL CHECK (cost_price >= 0),
    verification_status VARCHAR(20) NOT NULL,
    FOREIGN KEY (receiving_id) REFERENCES goods_receiving(receiving_id),
    FOREIGN KEY (item_id) REFERENCES items(item_id)
);

CREATE TABLE stock_movements (
 id BIGINT PRIMARY KEY AUTO_INCREMENT, item_id BIGINT NOT NULL, quantity INT NOT NULL,
 reason VARCHAR(255) NOT NULL, reference VARCHAR(255) NOT NULL, actor VARCHAR(255) NOT NULL,
 created_at DATETIME(6) NOT NULL, FOREIGN KEY (item_id) REFERENCES items(item_id)
);
CREATE INDEX idx_movements_date ON stock_movements(created_at);
CREATE INDEX idx_orders_rep ON orders(rep_id);
CREATE INDEX idx_customers_rep ON customers(rep_id);
CREATE INDEX idx_price_item ON price_history(item_id, status, start_date);
