
const mysql = require("mysql2/promise");

async function check() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "breadgift_db",
  });

  console.log("--- Tables ---");
  const [tables] = await connection.query("SHOW TABLES");
  console.log(JSON.stringify(tables, null, 2));

  console.log("--- Products Columns ---");
  try {
    const [columns] = await connection.query("DESCRIBE products");
    console.log(JSON.stringify(columns, null, 2));
  } catch (e) {
    console.log("Products table error:", e.message);
  }

  await connection.end();
}

check().catch(console.error);
