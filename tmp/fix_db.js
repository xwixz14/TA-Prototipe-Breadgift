
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");

async function fix() {
  // Manual env parsing to avoid dotenv dependency
  const envPath = path.join(process.cwd(), ".env");
  const envContent = fs.readFileSync(envPath, "utf8");
  const env = {};
  envContent.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) env[key.trim()] = value.trim();
  });

  const connection = await mysql.createConnection({
    host: env.MYSQL_HOST || "localhost",
    user: env.MYSQL_USER || "root",
    password: env.MYSQL_PASSWORD || "",
    database: env.MYSQL_DATABASE || "breadgift_db",
    multipleStatements: true
  });

  console.log("Connected to database...");

  const sql = `
    -- 1. Ensure categories table exists
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Add default category if none exist
    INSERT IGNORE INTO categories (id, name) VALUES (1, 'Roti');

    -- 3. Ensure products table exists and has basic layout
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category_id INT,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0,
      stock INT DEFAULT 0,
      min_stock INT DEFAULT 20,
      unit VARCHAR(50) DEFAULT 'Pcs',
      status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
      image_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `;

  await connection.query(sql);
  
  // Specific ALTER TABLE for missing columns
  const columnsToAdd = [
    { name: 'status', type: "ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif'" },
    { name: 'min_stock', type: "INT DEFAULT 20" },
    { name: 'unit', type: "VARCHAR(50) DEFAULT 'Pcs'" },
    { name: 'image_url', type: "VARCHAR(255)" }
  ];

  for (const col of columnsToAdd) {
    try {
      await connection.query(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type}`);
      console.log(`Added column ${col.name}`);
    } catch (e) {
      if (e.code === 'ER_DUP_COLUMN_NAME') {
        console.log(`Column ${col.name} already exists.`);
      } else {
        console.error(`Error adding ${col.name}:`, e.message);
      }
    }
  }

  // Ensure transactions and items exist
  await connection.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      total_amount DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(50),
      transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transaction_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      transaction_id INT,
      product_id INT,
      quantity INT NOT NULL,
      price_at_transaction DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );
  `);

  console.log("Database schema fix completed!");
  await connection.end();
}

fix().catch(err => {
  console.error("Fix failed:", err);
  process.exit(1);
});
