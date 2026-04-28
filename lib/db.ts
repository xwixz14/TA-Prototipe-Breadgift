import mysql, { Pool } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var db: Pool | undefined;
}

const poolOptions = {
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
};

// Validasi wajib
if (!poolOptions.host || !poolOptions.user || !poolOptions.database) {
  console.error("❌ CRITICAL ERROR: Missing Database Environment Variables!");
  throw new Error("Missing mandatory database configuration in .env");
}


// Singleton pattern to handle Next.js Fast Refresh
export const db = globalThis.db || mysql.createPool(poolOptions);

if (process.env.NODE_ENV !== "production") {
  globalThis.db = db;
}

export async function query(sql: string, params?: any[]) {
  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (error: any) {
    console.error("❌ DATABASE ERROR DETAIL:", error);
    // Throw the original error object so callers can access properties like .code
    throw error;
  }
}


