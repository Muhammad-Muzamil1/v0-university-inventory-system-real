-- University Inventory Management System - Database Schema
-- Agriculture University Tando Jam, Sindh, Pakistan

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN', 'STAFF', 'VIEWER') DEFAULT 'STAFF',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_name (category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory Items Table
CREATE TABLE IF NOT EXISTS inventory_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_value DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    description TEXT,
    location VARCHAR(100),
    sku VARCHAR(50) UNIQUE,
    reorder_level INT DEFAULT 5,
    added_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    FOREIGN KEY (added_by) REFERENCES users(user_id),
    INDEX idx_item_name (item_name),
    INDEX idx_category (category_id),
    INDEX idx_quantity (quantity),
    INDEX idx_sku (sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock Transactions Table
CREATE TABLE IF NOT EXISTS stock_transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    transaction_type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
    quantity_change INT NOT NULL,
    reference_number VARCHAR(50),
    notes TEXT,
    performed_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES inventory_items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(user_id),
    INDEX idx_item (item_id),
    INDEX idx_type (transaction_type),
    INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Categories
INSERT INTO categories (category_name, description) VALUES
('Equipment', 'Laboratory and farming equipment'),
('Seeds', 'Various crop seeds'),
('Fertilizers', 'Fertilizers and nutrients'),
('Tools', 'Hand and power tools'),
('Chemicals', 'Pesticides and chemicals'),
('Supplies', 'General supplies and materials')
ON DUPLICATE KEY UPDATE category_name=category_name;

-- Insert Default Admin User (password: admin123 - bcrypted)
INSERT INTO users (username, email, password, full_name, role, is_active) VALUES
('admin', 'admin@autandojam.edu.pk', '$2a$10$8.UnVuG33yBt1iqRedHFeLK1AfSZGQq7StufNXY7V9R8Bj.Jm3Na', 'System Administrator', 'ADMIN', TRUE)
ON DUPLICATE KEY UPDATE username=username;
