const { query } = require("./lib/db");
async function main() {
  try {
    const results = await query("SELECT * FROM categories");
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
main();
