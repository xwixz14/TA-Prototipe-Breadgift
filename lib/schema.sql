-- Create Database
CREATE DATABASE IF NOT EXISTS breadgift_db;
USE breadgift_db;

-- Table for Categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Products
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
    FOREIGN KEY (category_id) REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('Tunai', 'QRIS') NOT NULL,
    user_id INT DEFAULT NULL,
    status ENUM('Pending', 'Confirm', 'Cancel') DEFAULT 'Pending',
    source ENUM('POS', 'Online') DEFAULT 'Online',
    is_read BOOLEAN DEFAULT FALSE,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Transaction Items
CREATE TABLE IF NOT EXISTS transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price_at_transaction DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert Initial Categories
INSERT INTO categories (name) VALUES ('Roti Isi'), ('Roti Tawar'), ('Roti Bakar');

-- Insert Initial Products (derived from screenshot)
INSERT INTO products (name, category_id, price, stock, image_url) VALUES 
('Roti Coklat', 1, 4000, 120, '/assets/products/roti_coklat.png'),
('Roti Keju', 1, 4000, 33, '/assets/products/roti_keju.png'),
('Roti Nanas', 1, 4000, 32, '/assets/products/roti_nanas.png'),
('Roti Vanilla', 1, 4000, 3, '/assets/products/roti_vanilla.png'),
('Roti Tawar', 2, 7000, 120, '/assets/products/roti_tawar.png'),
('Roti Tawar Pandan', 2, 7000, 81, '/assets/products/roti_tawar_pandan.png');
