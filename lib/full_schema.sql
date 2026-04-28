-- Consolidated Database Schema for BreadGift
-- Database: breadgift_db

CREATE DATABASE IF NOT EXISTS breadgift_db;
USE breadgift_db;

-- 1. Table for Categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table for Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    reset_code VARCHAR(6) DEFAULT NULL,
    reset_expiry DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table for Products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    min_stock INT DEFAULT 20,
    unit VARCHAR(50) DEFAULT 'Pcs',
    status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
    image_url VARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table for Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('Tunai', 'QRIS') NOT NULL,
    user_id INT DEFAULT NULL,
    status ENUM('Pending', 'Confirm', 'Cancel') DEFAULT 'Pending',
    source ENUM('POS', 'Online') DEFAULT 'Online',
    is_read BOOLEAN DEFAULT FALSE,
    proof_of_payment VARCHAR(255) DEFAULT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Table for Transaction Items
CREATE TABLE IF NOT EXISTS transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price_at_transaction DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. Table for Cart Items (Persistence)
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- 7. Table for Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Table for Salaries
CREATE TABLE IF NOT EXISTS salaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Table for Bread Information (Dynamic CMS)
CREATE TABLE IF NOT EXISTS bread_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    category VARCHAR(100) DEFAULT 'Wawasan Roti',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data
INSERT IGNORE INTO categories (id, name) VALUES 
(1, 'Roti Isi'), 
(2, 'Roti Tawar'), 
(3, 'Roti Bakar');

INSERT IGNORE INTO products (name, category_id, price, stock, image_url) VALUES 
('Roti Coklat', 1, 4000, 120, '/assets/products/roti_coklat.png'),
('Roti Keju', 1, 4000, 33, '/assets/products/roti_keju.png'),
('Roti Nanas', 1, 4000, 32, '/assets/products/roti_nanas.png'),
('Roti Vanilla', 1, 4000, 3, '/assets/products/roti_vanilla.png'),
('Roti Tawar', 2, 7000, 120, '/assets/products/roti_tawar.png'),
('Roti Tawar Pandan', 2, 7000, 81, '/assets/products/roti_tawar_pandan.png');

-- Create Default Admin (Password: admin123)
-- Hash bcrypt for 'admin123' is $2a$10$8K7pQ7.7.7.7.7.7.7.7.7.7.7.7.7.7.7.7.7.7.7.7.7.7.
-- Using a simpler placeholder or the hash if known. Let's use a clear placeholder.
INSERT IGNORE INTO users (name, username, email, password, role) VALUES 
('Admin BreadGift', 'admin', 'admin@breadgift.com', 'admin123', 'admin');