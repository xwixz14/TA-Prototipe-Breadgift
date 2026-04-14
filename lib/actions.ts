"use server";

import { cookies } from "next/headers";

import { db, query } from "./db";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { encrypt, decrypt } from "./session";
import { snap } from "./midtrans";
import { sendPasswordResetCode } from "./mail";

export async function getProducts(status?: "Aktif" | "Nonaktif"): Promise<any[]> {
  try {
    let sql = `
      SELECT p.*, c.name as category,
        COALESCE(sales.total_sold, 0) as total_sold
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN (
        SELECT ti.product_id, SUM(ti.quantity) as total_sold
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        WHERE t.status != 'Cancel'
        GROUP BY ti.product_id
      ) as sales ON p.id = sales.product_id
    `;
    
    const params: any[] = [];
    if (status) {
      sql += " WHERE p.status = ?";
      params.push(status);
    }
    
    sql += " ORDER BY p.created_at DESC";

    const products = await query(sql, params) as any[];

    return products.map(p => ({
      ...p,
      price: Number(p.price) || 0,
      stock: Number(p.stock) || 0,
      min_stock: Number(p.min_stock) || 0,
      status: p.status || "Aktif",
      total_sold: Number(p.total_sold) || 0
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function getCategories(): Promise<any[]> {
  try {
    const categories = await query("SELECT * FROM categories ORDER BY name ASC") as any[];
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function addProduct(data: {
  name: string;
  category_id: number;
  price: number;
  stock: number;
  min_stock: number;
  unit: string;
  status: string;
  image_url: string;
}) {
  try {
    const user = await getMe();
    if (!user || user.role !== "admin") return { success: false, error: "Unauthorized" };

    await query(
      "INSERT INTO products (name, category_id, price, stock, min_stock, unit, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [data.name, data.category_id, data.price, data.stock, data.min_stock, data.unit, data.status, data.image_url]
    );
    return { success: true };
  } catch (error) {
    console.error("Failed to add product:", error);
    return { success: false, error: "Gagal menambah produk" };
  }
}

export async function updateProduct(id: number, data: {
  name: string;
  category_id: number;
  price: number;
  stock: number;
  min_stock: number;
  unit: string;
  status: string;
  image_url: string;
}) {
  try {
    const user = await getMe();
    if (!user || user.role !== "admin") return { success: false, error: "Unauthorized" };

    await query(
      "UPDATE products SET name = ?, category_id = ?, price = ?, stock = ?, min_stock = ?, unit = ?, status = ?, image_url = ? WHERE id = ?",
      [data.name, data.category_id, data.price, data.stock, data.min_stock, data.unit, data.status, data.image_url, id]
    );
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Gagal memperbarui produk" };
  }
}

export async function toggleProductStatus(id: number, currentStatus: string) {
  try {
    const user = await getMe();
    if (!user || user.role !== "admin") return { success: false, error: "Unauthorized" };

    const newStatus = currentStatus === 'Aktif' ? 'Nonaktif' : 'Aktif';
    await query("UPDATE products SET status = ? WHERE id = ?", [newStatus, id]);
    revalidatePath("/admin/products");
    return { success: true, newStatus };
  } catch (error) {
    console.error("Failed to toggle product status:", error);
    return { success: false, error: "Gagal mengubah status produk" };
  }
}

export async function deleteProduct(id: number) {
  try {
    const user = await getMe();
    if (!user || user.role !== "admin") return { success: false, error: "Unauthorized" };

    // Check if the product has any transaction history
    const checkSql = "SELECT COUNT(*) as count FROM transaction_items WHERE product_id = ?";
    const result = await query(checkSql, [id]) as any[];
    const hasTransactions = result[0].count > 0;

    if (hasTransactions) {
      // Soft delete if there's history
      await query("UPDATE products SET status = 'Nonaktif' WHERE id = ?", [id]);
      return { success: true, message: "Produk dinonaktifkan karena memiliki riwayat transaksi." };
    } else {
      // Hard delete if it's a new product
      await query("DELETE FROM products WHERE id = ?", [id]);
      return { success: true, message: "Produk berhasil dihapus." };
    }
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Gagal memproses penghapusan produk" };
  }
}

export async function createTransaction(data: {
  total_amount: number;
  payment_method: string;
  source?: 'POS' | 'Online';
  items: { product_id: number; quantity: number; price: number }[];
}) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const user = await getMe();
    const userId = user ? user.id : null;

    const status = data.source === 'POS' ? 'Confirm' : 'Pending';

    const [result] = await connection.query(
      "INSERT INTO transactions (total_amount, payment_method, user_id, status, source) VALUES (?, ?, ?, ?, ?)",
      [data.total_amount, data.payment_method, userId, status, data.source || 'Online']
    ) as any[];
    
    const transactionId = result.insertId;

    for (const item of data.items) {
      // Mencegah Race Condition Stok (Atomic Update)
      const [updateResult] = await connection.query(
        "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
        [item.quantity, item.product_id, item.quantity]
      ) as any[];

      if (updateResult.affectedRows === 0) {
        throw new Error(`Stok tidak mencukupi untuk memproses pesanan.`);
      }

      await connection.query(
        "INSERT INTO transaction_items (transaction_id, product_id, quantity, price_at_transaction) VALUES (?, ?, ?, ?)",
        [transactionId, item.product_id, item.quantity, item.price]
      );
    }

    let snapToken = null;
    if (data.source === 'Online') {
      const parameter = {
        transaction_details: {
          order_id: `TRX-${transactionId}-${Date.now()}`,
          gross_amount: Math.round(data.total_amount)
        },
        customer_details: {
          first_name: user ? (user as any).name : 'Customer',
          email: user ? (user as any).email : 'customer@example.com'
        }
      };

      try {
        const transaction = await snap.createTransaction(parameter);
        snapToken = transaction.token;
      } catch (err: any) {
        // Rollback DB if Midtrans fails to prevent inconsistent state
        await connection.rollback();
        connection.release();
        console.error("Midtrans Snap Error:", err);
        return { 
          success: false, 
          error: `Midtrans Error: ${err.message || 'Gagal membuat token pembayaran'}. Pastikan API Key benar dan nominal sesuai.` 
        };
      }
    }

    // Clear cart from database after checkout
    if (userId) {
      await connection.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);
    }

    await connection.commit();
    connection.release();

    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    revalidatePath("/menu");

    return { success: true, transactionId, snapToken };
  } catch (error: any) {
    // Basic check to see if connection is still active and needs rollback
    try {
      await connection.rollback();
      connection.release();
    } catch (e) {}
    
    console.error("Failed to create transaction:", error);
    return { success: false, error: error.message || "Database error" };
  }
}

export async function confirmMidtransTransaction(transactionId: number) {
  try {
    await query("UPDATE transactions SET status = 'Confirm', is_read = FALSE WHERE id = ?", [transactionId]);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    revalidatePath("/menu");
    return { success: true };
  } catch (error) {
    console.error("Midtrans confirmation error:", error);
    return { success: false, error: "Gagal konfirmasi status" };
  }
}

export async function uploadImage(formData: FormData) {
  try {
    const user = await getMe();
    if (!user || user.role !== "admin") return { success: false, error: "Unauthorized" };

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    // MIME type validation
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimeTypes.includes(file.type)) {
      return { success: false, error: "Format file tidak didukung. Harap unggah format JPG, PNG, atau WEBP." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${uuidv4()}_${file.name}`;
    const uploadDir = path.join(process.cwd(), "public", "assets", "products");

    // Create directory if it doesn't exist
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    return { 
      success: true, 
      imageUrl: `/assets/products/${fileName}` 
    };
  } catch (error) {
    console.error("Image upload error:", error);
    return { success: false, error: "Gagal mengunggah gambar" };
  }
}
export async function registerUser(data: { name: string; username: string; email: string; password: string }) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await query(
      "INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, 'user')",
      [data.name, data.username, data.email, hashedPassword]
    );
    return { success: true };
  } catch (error: any) {
    console.error("Register error:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return { success: false, error: "Username sudah digunakan" };
    }
    return { success: false, error: "Gagal mendaftarkan akun" };
  }
}

export async function loginUser(data: { username: string; password: string }) {
  try {
    const results = await query(
      "SELECT * FROM users WHERE username = ?",
      [data.username]
    ) as any[];

    if (results.length > 0) {
      const user = results[0];
      let passwordMatch = false;

      // Backward compatibility & auto-migration
      if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
        passwordMatch = await bcrypt.compare(data.password, user.password);
      } else {
        // Plaintext fallback (legacy)
        if (data.password === user.password) {
          passwordMatch = true;
          // Auto migrate to hash
          const newHash = await bcrypt.hash(data.password, 10);
          await query("UPDATE users SET password = ? WHERE id = ?", [newHash, user.id]);
        }
      }

      if (passwordMatch) {
        const cookieStore = await cookies();
        
        // Secure JWT session
        const sessionPayload = {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role
        };
        const token = await encrypt(sessionPayload);
        
        cookieStore.set("user_session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
        });

        return { success: true, role: user.role };
      }
    }
    return { success: false, error: "Username atau Password salah" };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Terjadi kesalahan saat login" };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("user_session");
  revalidatePath("/");
}

export async function getMe() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");
    if (sessionCookie) {
      return await decrypt(sessionCookie.value);
    }
    return null;
  } catch {
    return null;
  }
}

export async function getTransactionById(id: number) {
  try {
    const transactions = await query(`
      SELECT 
        t.*, 
        u.name as customer_name,
        u.username as customer_username
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [id]) as any[];

    if (transactions.length === 0) return null;

    const t = transactions[0];

    const allItems = await query(`
      SELECT 
        ti.*, 
        p.name as product_name,
        p.image_url
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      WHERE ti.transaction_id = ?
    `, [t.id]) as any[];

    const items = allItems.map(item => ({
      ...item,
      price_at_transaction: Number(item.price_at_transaction),
      subtotal: Number(item.quantity) * Number(item.price_at_transaction)
    }));

    return JSON.parse(JSON.stringify({
      ...t,
      items,
      total_amount: Number(t.total_amount)
    }));
  } catch (error) {
    console.error("Failed to fetch transaction:", error);
    return null;
  }
}

export async function getAdminTransactions() {
  try {
    const transactions = await query(`
      SELECT 
        t.*, 
        u.name as customer_name,
        u.username as customer_username
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.transaction_date DESC
    `) as any[];

    if (transactions.length === 0) return [];

    // Optimize: Get all unique transaction IDs
    const transactionIds = transactions.map(t => t.id);

    // Fetch all items for these transactions in ONE query
    const allItems = await query(`
      SELECT 
        ti.*, 
        p.name as product_name,
        p.image_url
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      WHERE ti.transaction_id IN (?)
    `, [transactionIds]) as any[];

    // Map items back to transactions in-memory
    const transactionsWithItems = transactions.map(t => {
      const items = allItems
        .filter(item => item.transaction_id === t.id)
        .map(item => ({
          ...item,
          price_at_transaction: Number(item.price_at_transaction),
          subtotal: Number(item.quantity) * Number(item.price_at_transaction)
        }));

      return {
        ...t,
        items,
        total_amount: Number(t.total_amount)
      };
    });

    return JSON.parse(JSON.stringify(transactionsWithItems));
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

export async function updateTransactionStatus(id: number, status: 'Pending' | 'Confirm' | 'Cancel') {
  try {
    await query("UPDATE transactions SET status = ? WHERE id = ?", [status, id]);
    revalidatePath("/admin/history");
    return { success: true };
  } catch (error) {
    console.error("Failed to update transaction status:", error);
    return { success: false, error: "Gagal memperbarui status" };
  }
}

export async function getRevenueStats() {
  try {
    // Run these queries in parallel to save time
    const [stats, categoryStats, summary, categorySummary] = await Promise.all([
      // 1. stats (last 7 days by source)
      query(`
        SELECT 
          DATE(transaction_date) as date,
          source,
          SUM(total_amount) as total
        FROM transactions
        WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND status != 'Cancel'
        GROUP BY DATE(transaction_date), source
        ORDER BY date ASC
      `),
      // 2. categoryStats (last 7 days by category)
      query(`
        SELECT 
          DATE(t.transaction_date) as date,
          c.name as category_name,
          SUM(ti.quantity * ti.price_at_transaction) as total
        FROM transactions t
        JOIN transaction_items ti ON t.id = ti.transaction_id
        JOIN products p ON ti.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE t.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND t.status != 'Cancel'
        GROUP BY DATE(t.transaction_date), c.name
      `),
      // 3. summary (grand total by source)
      query(`
        SELECT 
          source,
          SUM(total_amount) as total
        FROM transactions
        WHERE status != 'Cancel'
        GROUP BY source
      `),
      // 4. categorySummary (grand total by category)
      query(`
        SELECT 
          c.name as category_name,
          SUM(ti.quantity * ti.price_at_transaction) as total
        FROM transactions t
        JOIN transaction_items ti ON t.id = ti.transaction_id
        JOIN products p ON ti.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE t.status != 'Cancel'
        GROUP BY c.name
      `)
    ]) as any[][];

    // Format data for Recharts & Export
    const chartDataMap: { [key: string]: any } = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      chartDataMap[dateStr] = { 
        name: dateStr, 
        fullDate: d.toLocaleDateString('id-ID'), // Store full date for export
        POS: 0, 
        Online: 0,
        "Roti Isi": 0,
        "Roti Tawar": 0,
        "Donat": 0
      };
    }

    stats.forEach(s => {
      const dateStr = new Date(s.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      if (chartDataMap[dateStr]) {
        chartDataMap[dateStr][s.source] = Number(s.total) || 0;
      }
    });

    categoryStats.forEach(cs => {
      const dateStr = new Date(cs.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      if (chartDataMap[dateStr] && chartDataMap[dateStr].hasOwnProperty(cs.category_name)) {
        chartDataMap[dateStr][cs.category_name] = Number(cs.total) || 0;
      } else if (chartDataMap[dateStr]) {
        // Fallback for categories not pre-initialized (like Roti Bakar etc)
        chartDataMap[dateStr][cs.category_name] = Number(cs.total) || 0;
      }
    });

    const chartData = Object.values(chartDataMap);

    // Format summary results
    const posTotal = Number(summary.find(s => s.source === "POS")?.total) || 0;
    const onlineTotal = Number(summary.find(s => s.source === "Online")?.total) || 0;
    const categoryTotals: { [key: string]: number } = {};
    categorySummary.forEach(cs => {
      categoryTotals[cs.category_name] = Number(cs.total) || 0;
    });

    return {
      chartData,
      summary: {
        posTotal,
        onlineTotal,
        categoryTotals
      }
    };
  } catch (error) {
    console.error("Failed to fetch revenue stats:", error);
    return { chartData: [], summary: { posTotal: 0, onlineTotal: 0, categoryTotals: {} } };
  }
}


export async function getExpenses() {
  try {
    const expenses = await query("SELECT * FROM expenses ORDER BY expense_date DESC") as any[];
    return JSON.parse(JSON.stringify(expenses.map(e => ({
      ...e,
      amount: Number(e.amount)
    }))));
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }
}

export async function createExpense(data: {
  description: string;
  amount: number;
  category: string;
  expense_date: string;
}) {
  try {
    await query(
      "INSERT INTO expenses (description, amount, category, expense_date) VALUES (?, ?, ?, ?)",
      [data.description, data.amount, data.category, data.expense_date]
    );
    revalidatePath("/admin/expenses");
    return { success: true };
  } catch (error) {
    console.error("Failed to create expense:", error);
    return { success: false, error: "Gagal menyimpan pengeluaran" };
  }
}

export async function deleteExpense(id: number) {
  try {
    await query("DELETE FROM expenses WHERE id = ?", [id]);
    revalidatePath("/admin/expenses");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return { success: false, error: "Gagal menghapus pengeluaran" };
  }
}

export async function getSalaries() {
  try {
    const salaries = await query("SELECT * FROM salaries ORDER BY payment_date DESC") as any[];
    return JSON.parse(JSON.stringify(salaries.map(s => ({
      ...s,
      amount: Number(s.amount)
    }))));
  } catch (error) {
    console.error("Failed to fetch salaries:", error);
    return [];
  }
}

export async function createSalary(data: {
  employee_name: string;
  amount: number;
  payment_date: string;
}) {
  try {
    await query(
      "INSERT INTO salaries (employee_name, amount, payment_date) VALUES (?, ?, ?)",
      [data.employee_name, data.amount, data.payment_date]
    );
    revalidatePath("/admin/gaji");
    return { success: true };
  } catch (error) {
    console.error("Failed to create salary:", error);
    return { success: false, error: "Gagal menyimpan gaji" };
  }
}

export async function deleteSalary(id: number) {
  try {
    await query("DELETE FROM salaries WHERE id = ?", [id]);
    revalidatePath("/admin/gaji");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete salary:", error);
    return { success: false, error: "Gagal menghapus gaji" };
  }
}

export async function syncCartWithDB(items: { id: number, quantity: number }[]) {
  try {
    const user = await getMe();
    if (!user) return { success: false, error: "Not logged in" };

    // 1. Delete existing cart for this user
    await query("DELETE FROM cart_items WHERE user_id = ?", [user.id]);

    // 2. Insert new items if any
    if (items.length > 0) {
      const values = items.map(item => [user.id, item.id, item.quantity]);
      // Use direct pool query for bulk insert support
      await db.query("INSERT INTO cart_items (user_id, product_id, quantity) VALUES ?", [values]);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to sync cart:", error);
    return { success: false, error: "Gagal menyimpan keranjang" };
  }
}

export async function getSavedCart() {
  try {
    const user = await getMe();
    if (!user) return [];

    const items = await query(`
      SELECT ci.product_id as id, ci.quantity, p.name, p.price, p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `, [user.id]) as any[];

    return JSON.parse(JSON.stringify(items.map(item => ({
      ...item,
      id: Number(item.id),
      price: Number(item.price),
      quantity: Number(item.quantity)
    }))));
  } catch (error) {
    console.error("Failed to fetch saved cart:", error);
    return [];
  }
}

export async function requestPasswordReset(email: string) {
  try {
    // 1. Check if user exists with this email
    const users = await query("SELECT id, name FROM users WHERE email = ?", [email]) as any[];
    if (users.length === 0) {
      return { success: false, error: "Email tidak terdaftar!" };
    }

    // 2. Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. Set expiry (10 minutes from now)
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);
    
    // 4. Update user in DB
    await query(
      "UPDATE users SET reset_code = ?, reset_expiry = ? WHERE email = ?",
      [resetCode, expiry, email]
    );

    // 5. Send Email
    await sendPasswordResetCode(email, resetCode);

    return { success: true };
  } catch (error) {
    console.error("Request reset error:", error);
    return { success: false, error: "Gagal memproses permintaan reset password" };
  }
}

export async function resetPassword(data: { email: string; code: string; newPassword: string }) {
  try {
    // 1. Find user & verify code + expiry
    const users = await query(
      "SELECT id FROM users WHERE email = ? AND reset_code = ? AND reset_expiry > NOW()",
      [data.email, data.code]
    );

    if ((users as any[]).length === 0) {
      return { success: false, error: "Kode verifikasi salah atau sudah kadaluwarsa!" };
    }

    const userId = (users as any[])[0].id;

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // 3. Update password and CLEAR reset fields
    await query(
      "UPDATE users SET password = ?, reset_code = NULL, reset_expiry = NULL WHERE id = ?",
      [hashedPassword, userId]
    );

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "Gagal memperbarui password" };
  }
}
