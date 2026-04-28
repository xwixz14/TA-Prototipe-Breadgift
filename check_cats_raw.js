const mysql = require("mysql2/promise");
async function main() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "breadgift_db"
  });
  try {
    const [rows] = await connection.query("SELECT * FROM categories");
    console.log(JSON.stringify(rows));
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
    process.exit();
  }
}
main();
