import mysql, { Pool } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var db: Pool | undefined;
}

const poolOptions = {
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "breadgift_db",
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
};


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
    throw new Error(`Database Error: ${error.message || "Unknown error"}`);
  }
}


