const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'breadgift_db'
  });

  try {
    console.log('Adding source to transactions...');
    try {
      await connection.query("ALTER TABLE transactions ADD COLUMN source ENUM('POS', 'Online') DEFAULT 'Online' AFTER status");
      console.log('Successfully added source column');
    } catch (e) { 
      console.log('Source column might already exist or failed:', e.message); 
    }

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
