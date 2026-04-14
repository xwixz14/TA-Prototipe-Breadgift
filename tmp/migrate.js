const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

loadEnv();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'breadgift_db',
  });

  try {
    console.log('Running migrations...');
    
    // Add user_id if not exists
    try { await connection.query('ALTER TABLE transactions ADD COLUMN user_id INT DEFAULT NULL'); } catch (e) {}
    
    // Add status if not exists
    try { await connection.query("ALTER TABLE transactions ADD COLUMN status ENUM('Pending', 'Confirm', 'Cancel') DEFAULT 'Pending'"); } catch (e) {}
    
    // Add source if not exists
    try { await connection.query("ALTER TABLE transactions ADD COLUMN source ENUM('POS', 'Online') DEFAULT 'Online'"); } catch (e) {}
    
    // Add is_read if not exists
    try { await connection.query('ALTER TABLE transactions ADD COLUMN is_read BOOLEAN DEFAULT FALSE'); } catch (e) {}

    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
