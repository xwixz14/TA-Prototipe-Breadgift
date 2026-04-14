-- Skrip untuk membuat tabel gaji_karyawan (salaries)
-- Jalankan skrip ini di SQLyog atau klien MySQL Anda

USE breadgift_db;

CREATE TABLE IF NOT EXISTS salaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
