const mysql = require("mysql2/promise");
async function main() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "breadgift_db"
  });
  try {
    const [res] = await connection.query("UPDATE categories SET name = 'Donat' WHERE name = 'Roti Bakar'");
    console.log(`Updated ${res.affectedRows} rows.`);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
    process.exit();
  }
}
main();
