"use server";

import { cookies } from "next/headers";

import { db, query } from "./db";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { encrypt, decrypt } from "./session";
import { sendPasswordResetCode, sendOrderConfirmation } from "./mail";

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
  unit: string;
  status: string;
  image_url: string;
}) {
  try {
    const user = await getMe();
    if (!user || user.role !== "admin") return { success: false, error: "Unauthorized" };

    await query(
      "INSERT INTO products (name, category_id, price, stock, unit, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [data.name, data.category_id, data.price, data.stock, data.unit, data.status, data.image_url]
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
  unit: string;
  status: string;
  image_url: string;
}) {
  try {
    const user = await getMe();
    if (!user || user.role !== "admin") return { success: false, error: "Unauthorized" };

    await query(
      "UPDATE products SET name = ?, category_id = ?, price = ?, stock = ?, unit = ?, status = ?, image_url = ? WHERE id = ?",
      [data.name, data.category_id, data.price, data.stock, data.unit, data.status, data.image_url, id]
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
  const connection = await db.getConnection();
  try {
    const user = await getMe();
    if (!user || user.role !== "admin") return { success: false, error: "Unauthorized" };

    await connection.beginTransaction();

    // 1. Delete all associated data manually to ensure no FK constraints block us
    // Delete Recipes
    await connection.query("DELETE FROM product_ingredients WHERE product_id = ?", [id]);
    
    // Delete Cart Items
    await connection.query("DELETE FROM cart_items WHERE product_id = ?", [id]);
    
    // Delete Production Materials (linked through production logs)
    await connection.query(`
      DELETE FROM production_materials 
      WHERE production_log_id IN (SELECT id FROM production_logs WHERE product_id = ?)
    `, [id]);
    
    // Delete Production Logs
    await connection.query("DELETE FROM production_logs WHERE product_id = ?", [id]);
    
    // Delete Transaction Items (Historical sales data will be lost!)
    await connection.query("DELETE FROM transaction_items WHERE product_id = ?", [id]);

    // 2. Finally delete the product itself
    await connection.query("DELETE FROM products WHERE id = ?", [id]);

    await connection.commit();
    revalidatePath("/admin/products");
    revalidatePath("/admin/production");
    revalidatePath("/admin/history");
    
    return { success: true, message: "Produk dan semua riwayat terkait telah dihapus permanen." };
  } catch (error: any) {
    await connection.rollback();
    console.error("Failed to hard delete product:", error);
    return { success: false, error: "Gagal menghapus produk secara permanen: " + (error.message || "Database error") };
  } finally {
    connection.release();
  }
}

export async function createTransaction(data: {
  total_amount: number;
  payment_method: string;
  source?: 'POS' | 'Online';
  delivery_method?: 'Ambil di Toko' | 'Maxim Delivery';
  recipient_name?: string;
  delivery_address?: string;
  items: { product_id: number; quantity: number; price: number }[];
}) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const user = await getMe();
    const userId = user ? user.id : null;

    const status = data.source === 'POS' ? 'Confirm' : 'Pending';

    const [result] = await connection.query(
      "INSERT INTO transactions (total_amount, payment_method, user_id, status, source, delivery_method, recipient_name, delivery_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        data.total_amount, 
        data.payment_method, 
        userId, 
        status, 
        data.source || 'Online', 
        data.delivery_method || 'Ambil di Toko',
        data.recipient_name || null,
        data.delivery_address || null
      ]
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

    // Clear cart from database after checkout
    if (userId) {
      await connection.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);
    }

    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    revalidatePath("/menu");

    await connection.commit();

    // --- OTOMATISASI EMAIL (Background) ---
    try {
      console.log("📨 [DEBUG] Memulai proses email otomatis...");
      if (user) {
        console.log(`📨 [DEBUG] User terdeteksi: ${user.name} (${user.email})`);
        
        // Ambil detail nama produk untuk struk email
        const productIds = data.items.map(i => i.product_id);
        const [products] = await connection.query(
          "SELECT id, name FROM products WHERE id IN (?)",
          [productIds]
        ) as any[];

        const productsMap = new Map((products as any[]).map(p => [p.id, p.name]));
        
        const emailItems = data.items.map(item => ({
          name: productsMap.get(item.product_id) || "Produk Roti",
          quantity: item.quantity,
          price: item.price
        }));

        console.log(`📨 [DEBUG] Menyiapkan pengiriman email konfirmasi ke ${user.email}...`);
        
        // Lepas koneksi sebelum pengiriman email (agar tidak lock pool)
        connection.release(); 

        // Kirim email tanpa await agar tidak menghambat respon ke UI
        sendOrderConfirmation({
          orderId: transactionId.toString(),
          customerName: (user as any).name || "Pelanggan",
          customerEmail: (user as any).email || "",
          totalAmount: data.total_amount,
          items: emailItems
        }).then(() => {
          console.log(`📨 [DEBUG] sendOrderConfirmation selesai dieksekusi.`);
        }).catch(err => {
          console.error("❌ [DEBUG] Email Automation Error:", err.message);
        });
      } else {
        console.log("📨 [DEBUG] Selesai: Skip email karena tidak ada User logged in.");
        connection.release();
      }
    } catch (emailError: any) {
      console.error("❌ [DEBUG] Background Email Setup Error:", emailError.message);
      if (connection) connection.release();
    }

    return { success: true, transactionId };
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

export async function uploadProofOfPayment(formData: FormData, transactionId: number) {
  try {
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

    const fileName = `PROOF_${transactionId}_${uuidv4().slice(0, 8)}_${file.name}`;
    const uploadDir = path.join(process.cwd(), "public", "assets", "proofs");

    // Create directory if it doesn't exist
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const proofUrl = `/assets/proofs/${fileName}`;

    // Update transaction in DB
    await query("UPDATE transactions SET proof_of_payment = ? WHERE id = ?", [proofUrl, transactionId]);

    // --- OTOMATISASI EMAIL SETELAH UPLOAD BUKTI ---
    try {
      console.log(`📸 [DEBUG] Bukti pembayaran diunggah. Menyiapkan email konfirmasi...`);
      
      // Ambil data transaksi lengkap dari database
      const order = await getTransactionById(transactionId);
      if (order) {
        // Kirim email (Admin & Pelanggan)
        sendOrderConfirmation({
          orderId: transactionId.toString(),
          customerName: order.customer_name || "Pelanggan",
          customerEmail: order.customer_email || "", 
          totalAmount: order.total_amount,
          items: order.items.map((i: any) => ({
            name: i.product_name,
            quantity: i.quantity,
            price: i.price_at_transaction
          }))
        }).then(() => {
          console.log(`📸 [DEBUG] Email konfirmasi pembayaran berhasil dikirim.`);
        }).catch(err => {
          console.error(`📸 [DEBUG] Gagal kirim email pembayaran:`, err.message);
        });
      }
    } catch (err: any) {
      console.error(`📸 [DEBUG] Setup email pembayaran gagal:`, err.message);
    }

    revalidatePath("/admin/history");
    return { 
      success: true, 
      proofUrl 
    };
  } catch (error) {
    console.error("Proof of payment upload error:", error);
    return { success: false, error: "Gagal mengunggah bukti pembayaran" };
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
    
    // Check for Duplicate Entry
    if (error.code === 'ER_DUP_ENTRY') {
      const msg = error.message || "";
      if (msg.toLowerCase().includes('email')) {
        return { success: false, error: "Email ini sudah terdaftar. Silakan gunakan email lain atau masuk." };
      }
      if (msg.toLowerCase().includes('username')) {
        return { success: false, error: "Username ini sudah digunakan. Silakan pilih username lain." };
      }
      return { success: false, error: "Data ini sudah terdaftar." };
    }
    
    return { success: false, error: `Gagal mendaftarkan akun: ${error.message || "Kesalahan sistem"}` };
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
  return { success: true };
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
        u.username as customer_username,
        u.email as customer_email
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

export async function getRevenueStats(selectedMonth?: number, selectedYear?: number) {
  try {
    const now = new Date();
    const targetMonth = selectedMonth !== undefined ? selectedMonth : now.getMonth() + 1; // 1-12
    const targetYear = selectedYear || now.getFullYear();

    const isYearly = selectedMonth === 0;
    const dateFilter = isYearly ? "YEAR(transaction_date) = ?" : "YEAR(transaction_date) = ? AND MONTH(transaction_date) = ?";
    const queryParams = isYearly ? [targetYear] : [targetYear, targetMonth];

    const [stats, categoryStats, summary, categorySummary] = await Promise.all([
      // 1. stats (daily by source if monthly, monthly by source if yearly)
      query(`
        SELECT 
          ${isYearly ? 'MONTH(transaction_date)' : 'DATE(transaction_date)'} as date,
          source,
          SUM(total_amount) as total
        FROM transactions
        WHERE ${dateFilter}
        AND status != 'Cancel'
        GROUP BY ${isYearly ? 'MONTH(transaction_date)' : 'DATE(transaction_date)'}, source
        ORDER BY date ASC
      `, queryParams),
      // 2. categoryStats
      query(`
        SELECT 
          ${isYearly ? 'MONTH(t.transaction_date)' : 'DATE(t.transaction_date)'} as date,
          c.name as category_name,
          SUM(ti.quantity * ti.price_at_transaction) as total
        FROM transactions t
        JOIN transaction_items ti ON t.id = ti.transaction_id
        JOIN products p ON ti.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE ${isYearly ? 'YEAR(t.transaction_date) = ?' : 'YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ?'}
        AND t.status != 'Cancel'
        GROUP BY ${isYearly ? 'MONTH(t.transaction_date)' : 'DATE(t.transaction_date)'}, c.name
      `, queryParams),
      // 3. summary
      query(`
        SELECT 
          source,
          SUM(total_amount) as total
        FROM transactions
        WHERE ${dateFilter}
        AND status != 'Cancel'
        GROUP BY source
      `, queryParams),
      // 4. categorySummary
      query(`
        SELECT 
          c.name as category_name,
          SUM(ti.quantity * ti.price_at_transaction) as total
        FROM transactions t
        JOIN transaction_items ti ON t.id = ti.transaction_id
        JOIN products p ON ti.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE ${isYearly ? 'YEAR(t.transaction_date) = ?' : 'YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ?'}
        AND t.status != 'Cancel'
        GROUP BY c.name
      `, queryParams)
    ]) as any[][];

    // Format data for Recharts & Export
    const chartDataMap: { [key: string]: any } = {};
    // Initialize days of month or months of year
    if (isYearly) {
      for (let m = 1; m <= 12; m++) {
        const dateStr = new Date(targetYear, m - 1, 1).toLocaleDateString('id-ID', { month: 'short' });
        chartDataMap[dateStr] = { 
          name: dateStr, 
          fullDate: new Date(targetYear, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
          POS: 0, 
          Online: 0,
          "Roti Isi": 0,
          "Roti Tawar": 0,
          "Donat": 0
        };
      }
    } else {
      const lastDayInMonth = new Date(targetYear, targetMonth, 0).getDate();
      for (let day = 1; day <= lastDayInMonth; day++) {
        const d = new Date(targetYear, targetMonth - 1, day);
        const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        chartDataMap[dateStr] = { 
          name: dateStr, 
          fullDate: d.toLocaleDateString('id-ID'),
          POS: 0, 
          Online: 0,
          "Roti Isi": 0,
          "Roti Tawar": 0,
          "Donat": 0
        };
      }
    }

    stats.forEach(s => {
      let dateStr;
      if (isYearly) {
        dateStr = new Date(targetYear, s.date - 1, 1).toLocaleDateString('id-ID', { month: 'short' });
      } else {
        dateStr = new Date(s.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      }
      if (chartDataMap[dateStr]) {
        chartDataMap[dateStr][s.source] = Number(s.total) || 0;
      }
    });

    categoryStats.forEach(cs => {
      let dateStr;
      if (isYearly) {
        dateStr = new Date(targetYear, cs.date - 1, 1).toLocaleDateString('id-ID', { month: 'short' });
      } else {
        dateStr = new Date(cs.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      }
      if (chartDataMap[dateStr]) {
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
      },
      targetPeriod: { month: targetMonth, year: targetYear }
    };
  } catch (error) {
    console.error("Failed to fetch revenue stats:", error);
    return { 
      chartData: [], 
      summary: { posTotal: 0, onlineTotal: 0, categoryTotals: {} },
      targetPeriod: { 
        month: selectedMonth || new Date().getMonth() + 1, 
        year: selectedYear || new Date().getFullYear() 
      }
    };
  }
}


export async function getExpenses(selectedMonth?: number, selectedYear?: number) {
  try {
    const targetMonth = selectedMonth === undefined ? new Date().getMonth() + 1 : selectedMonth;
    const targetYear = selectedYear || new Date().getFullYear();
    const isYearly = selectedMonth === 0;
    const dateFilter = isYearly ? "YEAR(expense_date) = ?" : "YEAR(expense_date) = ? AND MONTH(expense_date) = ?";
    const queryParams = isYearly ? [targetYear] : [targetYear, targetMonth];

    const expenses = await query(`
      SELECT * FROM expenses 
      WHERE ${dateFilter}
      ORDER BY expense_date DESC
    `, queryParams) as any[];
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

export async function getSalaries(selectedMonth?: number, selectedYear?: number) {
  try {
    const now = new Date();
    const targetMonth = selectedMonth === undefined ? now.getMonth() + 1 : selectedMonth;
    const targetYear = selectedYear || now.getFullYear();
    const isYearly = selectedMonth === 0;
    
    const dateFilter = isYearly ? "YEAR(payment_date) = ?" : "YEAR(payment_date) = ? AND MONTH(payment_date) = ?";
    const queryParams = isYearly ? [targetYear] : [targetYear, targetMonth];

    const salaries = await query(`
      SELECT * FROM salaries 
      WHERE ${dateFilter}
      ORDER BY payment_date DESC
    `, queryParams) as any[];
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

export async function getProfitLossStats(selectedMonth?: number, selectedYear?: number) {
  try {
    const now = new Date();
    const targetMonth = selectedMonth !== undefined ? selectedMonth : now.getMonth() + 1;
    const targetYear = selectedYear || now.getFullYear();
    const isYearly = selectedMonth === 0;
    
    // 1. Fetch Total Revenue (from transactions)
    const revenueSummary = await query(`
      SELECT SUM(total_amount) as total
      FROM transactions
      WHERE ${isYearly ? 'YEAR(transaction_date) = ?' : 'YEAR(transaction_date) = ? AND MONTH(transaction_date) = ?'}
      AND status != 'Cancel'
    `, isYearly ? [targetYear] : [targetYear, targetMonth]) as any[];
    const totalRevenue = Number(revenueSummary[0]?.total) || 0;

    // 2. Fetch Total Expenses and Breakdown by Category
    const dbExpenses = await query(`
      SELECT category, SUM(amount) as total
      FROM expenses
      WHERE ${isYearly ? 'YEAR(expense_date) = ?' : 'YEAR(expense_date) = ? AND MONTH(expense_date) = ?'}
      GROUP BY category
    `, isYearly ? [targetYear] : [targetYear, targetMonth]) as any[];

    const totalExpenses = dbExpenses.reduce((sum, row) => sum + Number(row.total), 0);
    const expensesByCategory: Record<string, number> = {};
    dbExpenses.forEach(row => {
      expensesByCategory[row.category] = Number(row.total);
    });

    // 3. Fetch Total Salaries (from salaries)
    const salariesSummary = await query(`
      SELECT SUM(amount) as total
      FROM salaries
      WHERE ${isYearly ? 'YEAR(payment_date) = ?' : 'YEAR(payment_date) = ? AND MONTH(payment_date) = ?'}
    `, isYearly ? [targetYear] : [targetYear, targetMonth]) as any[];
    const totalSalaries = Number(salariesSummary[0]?.total) || 0;


    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      expensesByCategory: expensesByCategory,
      salaries: totalSalaries,
      netProfit: totalRevenue - (totalExpenses + totalSalaries),
      targetPeriod: { month: targetMonth, year: targetYear }
    };
  } catch (error) {
    console.error("Failed to fetch profit loss stats:", error);
    return { 
      revenue: 0, 
      expenses: 0, 
      expensesByCategory: {},
      salaries: 0, 
      netProfit: 0,
      targetPeriod: { month: selectedMonth || 1, year: selectedYear || 2026 } 
    };
  }
}

// --- INGREDIENTS ACTIONS ---

export async function getIngredients(): Promise<any[]> {
  try {
    const ingredients = await query(`
      SELECT 
        i.*,
        (SELECT MAX(date) FROM ingredient_logs WHERE ingredient_id = i.id AND type = 'OUT') as last_used_date
      FROM ingredients i
      ORDER BY i.name ASC
    `) as any[];
    return JSON.parse(JSON.stringify(ingredients));
  } catch (error) {
    console.error("Failed to fetch ingredients:", error);
    return [];
  }
}

export async function addIngredient(data: {
  name: string;
  stock: number;
  unit: string;
  min_stock: number;
  entry_date?: string;
}) {
  try {
    // 1. Cek apakah bahan dengan nama yang sama sudah ada (Case Insensitive check)
    const existing = await query("SELECT id, stock FROM ingredients WHERE LOWER(name) = LOWER(?)", [data.name]) as any[];
    
    if (existing.length > 0) {
      // 2. Jika ada, akumulasikan stok
      const ingredientId = existing[0].id;
      const currentStock = Number(existing[0].stock);
      const addedStock = Number(data.stock);
      const totalStock = currentStock + addedStock;
      
      await query(
        "UPDATE ingredients SET stock = ?, unit = ?, min_stock = ?, entry_date = ? WHERE id = ?",
        [totalStock, data.unit, data.min_stock, data.entry_date || new Date(), ingredientId]
      );

      // Log the 'IN' transaction
      await query(
        "INSERT INTO ingredient_logs (ingredient_id, type, quantity, notes, date) VALUES (?, 'IN', ?, ?, ?)",
        [ingredientId, addedStock, "Tambah stok manual", data.entry_date || new Date()]
      );
      
      revalidatePath("/admin/ingredients");
      return { success: true, message: `Stok ${data.name} berhasil ditambahkan! Total sekarang: ${totalStock} ${data.unit}` };
    } else {
      // 3. Jika tidak ada, buat baru
      const [newIngRes] = await query(
        "INSERT INTO ingredients (name, stock, unit, min_stock, entry_date) VALUES (?, ?, ?, ?, ?)",
        [data.name, data.stock, data.unit, data.min_stock, data.entry_date || new Date()]
      ) as any;

      // Log the initial 'IN' transaction
      await query(
        "INSERT INTO ingredient_logs (ingredient_id, type, quantity, notes, date) VALUES (?, 'IN', ?, ?, ?)",
        [newIngRes.insertId, data.stock, "Stok awal", data.entry_date || new Date()]
      );
      
      revalidatePath("/admin/ingredients");
      return { success: true, message: `Bahan baku ${data.name} berhasil ditambahkan!` };
    }
  } catch (error: any) {
    console.error("Failed to add/update ingredient:", error);
    return { success: false, error: "Gagal memproses bahan baku: " + (error.message || "") };
  }
}

export async function updateIngredient(id: number, data: {
  name: string;
  stock: number;
  unit: string;
  min_stock: number;
  entry_date?: string;
}) {
  try {
    await query(
      "UPDATE ingredients SET name = ?, stock = ?, unit = ?, min_stock = ?, entry_date = ? WHERE id = ?",
      [data.name, data.stock, data.unit, data.min_stock, data.entry_date || new Date(), id]
    );
    revalidatePath("/admin/ingredients");
    return { success: true };
  } catch (error) {
    console.error("Failed to update ingredient:", error);
    return { success: false, error: "Gagal memperbarui bahan baku" };
  }
}

export async function deleteIngredient(id: number) {
  try {
    await query("DELETE FROM ingredients WHERE id = ?", [id]);
    revalidatePath("/admin/ingredients");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete ingredient:", error);
    return { success: false, error: "Gagal menghapus bahan baku" };
  }
}

// --- BREAD INFO (CMS) ACTIONS ---

export async function getBreadInfoArticles(): Promise<any[]> {
  try {
    const articles = await query("SELECT * FROM bread_info ORDER BY created_at DESC") as any[];
    return JSON.parse(JSON.stringify(articles));
  } catch (error) {
    console.error("Failed to fetch bread info articles:", error);
    return [];
  }
}

export async function addBreadInfo(data: {
  title: string;
  content: string;
  image_url: string;
  category: string;
}) {
  try {
    const user = await getMe();
    if (!user || user.role !== "admin") return { success: false, error: "Unauthorized" };

    await query(
      "INSERT INTO bread_info (title, content, image_url, category) VALUES (?, ?, ?, ?)",
      [data.title, data.content, data.image_url, data.category]
    );
    revalidatePath("/info");
    revalidatePath("/admin/info");
    return { success: true };
  } catch (error) {
    console.error("Failed to add bread info:", error);
    return { success: false, error: "Gagal menambah informasi" };
  }
}

export async function updateBreadInfo(id: number, data: {
  title: string;
  content: string;
  image_url: string;
  category: string;
}) {
  try {
    const user = await getMe();
    if (!user || user.role !== "admin") return { success: false, error: "Unauthorized" };

    await query(
      "UPDATE bread_info SET title = ?, content = ?, image_url = ?, category = ? WHERE id = ?",
      [data.title, data.content, data.image_url, data.category, id]
    );
    revalidatePath("/info");
    revalidatePath("/admin/info");
    return { success: true };
  } catch (error) {
    console.error("Failed to update bread info:", error);
    return { success: false, error: "Gagal memperbarui informasi" };
  }
}

export async function deleteBreadInfo(id: number) {
  try {
    const user = await getMe();
    if (!user || user.role !== "admin") return { success: false, error: "Unauthorized" };

    await query("DELETE FROM bread_info WHERE id = ?", [id]);
    revalidatePath("/info");
    revalidatePath("/admin/info");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete bread info:", error);
    return { success: false, error: "Gagal menghapus informasi" };
  }
}
export async function getBreadInfoById(id: number): Promise<any | null> {
  try {
    const articles = await query("SELECT * FROM bread_info WHERE id = ?", [id]) as any[];
    if (articles.length === 0) return null;
    return JSON.parse(JSON.stringify(articles[0]));
  } catch (error) {
    console.error("Failed to fetch bread info article by id:", error);
    return null;
  }
}

export async function incrementBreadInfoView(id: number) {
  try {
    await query("UPDATE bread_info SET views = views + 1 WHERE id = ?", [id]);
    return { success: true };
  } catch (error) {
    console.error("Failed to increment bread info view:", error);
    return { success: false };
  }
}

export async function updateProfile(data: { name: string; email: string }) {
  try {
    const user = await getMe();
    if (!user) return { success: false, error: "Unauthorized" };

    // Update DB
    await query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [data.name, data.email, user.id]
    );

    // Update Session Cookie
    const cookieStore = await cookies();
    
    // Explicit payload to avoid non-serializable junk from JWT (iat, exp etc)
    const sessionPayload = {
      id: user.id,
      name: data.name,
      username: user.username,
      email: data.email,
      role: user.role
    };
    
    const token = await encrypt(sessionPayload);
    
    cookieStore.set("user_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Update profile error:", error.message || error);
    return { success: false, error: "Gagal memperbarui profil: " + (error.message || "") };
  }
}

export async function updatePassword(data: { oldPassword?: string; newPassword: string }) {
  try {
    const user = await getMe();
    if (!user) return { success: false, error: "Unauthorized" };

    // Verify old password if provided
    if (data.oldPassword) {
      const results = await query("SELECT password FROM users WHERE id = ?", [user.id]) as any[];
      if (results.length === 0) return { success: false, error: "User tidak ditemukan" };
      
      const isMatch = await bcrypt.compare(data.oldPassword, results[0].password);
      if (!isMatch) return { success: false, error: "Password lama salah" };
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Update password error:", error.message || error);
    return { success: false, error: "Gagal memperbarui password: " + (error.message || "") };
  }
}

export async function getProductionLogs() {
  try {
    const logs = await query(`
      SELECT 
        pl.*, 
        p.name as product_name,
        p.unit,
        GROUP_CONCAT(CONCAT(i.name, ': ', pm.quantity_used, ' ', i.unit) SEPARATOR ', ') as materials_used
      FROM production_logs pl
      JOIN products p ON pl.product_id = p.id
      LEFT JOIN production_materials pm ON pl.id = pm.production_log_id
      LEFT JOIN ingredients i ON pm.ingredient_id = i.id
      GROUP BY pl.id
      ORDER BY pl.production_date DESC, pl.created_at DESC
    `) as any[];
    return JSON.parse(JSON.stringify(logs));
  } catch (error) {
    console.error("Failed to fetch production logs:", error);
    return [];
  }
}

export async function createProductionLog(data: {
  product_id: number;
  quantity: number;
  production_date?: string;
  notes?: string;
  materials: { ingredient_id: number; quantity: number }[];
}) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert production log
    const [logRes] = await connection.query(
      "INSERT INTO production_logs (product_id, quantity, production_date, notes) VALUES (?, ?, ?, ?)",
      [data.product_id, data.quantity, data.production_date || new Date(), data.notes || ""]
    ) as any;
    const logId = logRes.insertId;

    // 2. Process each material manually selected
    for (const mat of data.materials) {
      // 2a. Check if stock is sufficient
      const [ingRows] = await connection.query(
        "SELECT name, stock, unit FROM ingredients WHERE id = ?",
        [mat.ingredient_id]
      ) as any;
      
      if (!ingRows || ingRows.length === 0) {
        throw new Error(`Bahan baku dengan ID ${mat.ingredient_id} tidak ditemukan!`);
      }

      const ingredient = ingRows[0];
      if (Number(ingredient.stock) < Number(mat.quantity)) {
        throw new Error(`Stok tidak mencukupi untuk ${ingredient.name}! (Dibutuhkan: ${mat.quantity} ${ingredient.unit}, Tersedia: ${ingredient.stock} ${ingredient.unit})`);
      }

      // 2b. Deduct stock from ingredients
      await connection.query(
        "UPDATE ingredients SET stock = stock - ? WHERE id = ?",
        [mat.quantity, mat.ingredient_id]
      );

      // Save material usage log
      await connection.query(
        "INSERT INTO production_materials (production_log_id, ingredient_id, quantity_used) VALUES (?, ?, ?)",
        [logId, mat.ingredient_id, mat.quantity]
      );

      // Also log to the main ingredient_logs table
      await connection.query(
        "INSERT INTO ingredient_logs (ingredient_id, type, quantity, date, notes) VALUES (?, 'OUT', ?, ?, ?)",
        [mat.ingredient_id, mat.quantity, data.production_date || new Date(), `Digunakan untuk produksi roti (Log ID: ${logId})`]
      );
    }

    // 3. Update product stock
    await connection.query(
      "UPDATE products SET stock = stock + ? WHERE id = ?",
      [data.quantity, data.product_id]
    );

    await connection.commit();
    revalidatePath("/admin/products");
    revalidatePath("/admin/production");
    revalidatePath("/admin/ingredients");
    return { success: true };
  } catch (error: any) {
    await connection.rollback();
    console.error("Failed to create production log:", error);
    return { success: false, error: "Gagal mencatat produksi: " + (error.message || "Database error") };
  } finally {
    connection.release();
  }
}

export async function getIngredientUsageStats(selectedMonth?: number, selectedYear?: number) {
  try {
    const now = new Date();
    const targetMonth = selectedMonth !== undefined ? selectedMonth : now.getMonth() + 1;
    const targetYear = selectedYear || now.getFullYear();
    const isYearly = selectedMonth === 0;

    const queryParams = isYearly ? [targetYear] : [targetYear, targetMonth];

    const stats = await query(`
      SELECT 
        i.id, 
        i.name, 
        i.unit, 
        i.stock,
        i.min_stock,
        pl.created_at as time,
        pm.quantity_used as used_quantity
      FROM ingredients i
      JOIN production_materials pm ON i.id = pm.ingredient_id
      JOIN production_logs pl ON pm.production_log_id = pl.id 
      WHERE ${isYearly ? 'YEAR(pl.production_date) = ?' : 'YEAR(pl.production_date) = ? AND MONTH(pl.production_date) = ?'}
      ORDER BY pl.created_at DESC, i.name ASC
    `, queryParams) as any[];

    return JSON.parse(JSON.stringify(stats.map(s => ({
      ...s,
      stock: Number(s.stock),
      min_stock: Number(s.min_stock),
      used_quantity: Number(s.used_quantity)
    }))));
  } catch (error) {
    console.error("Failed to fetch ingredient usage stats:", error);
    return [];
  }
}
export async function getProductRecipe(productId: number) {
  try {
    const recipe = await query(`
      SELECT 
        pi.*, 
        i.name as ingredient_name,
        i.unit as ingredient_unit
      FROM product_ingredients pi
      JOIN ingredients i ON pi.ingredient_id = i.id
      WHERE pi.product_id = ?
    `, [productId]) as any[];
    return JSON.parse(JSON.stringify(recipe));
  } catch (error) {
    console.error("Failed to fetch product recipe:", error);
    return [];
  }
}

export async function updateProductRecipe(productId: number, items: { ingredient_id: number, quantity: number }[]) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Delete existing recipe
    await connection.query("DELETE FROM product_ingredients WHERE product_id = ?", [productId]);

    // 2. Insert new items
    if (items.length > 0) {
      const values = items.map(item => [productId, item.ingredient_id, item.quantity]);
      await connection.query("INSERT INTO product_ingredients (product_id, ingredient_id, quantity) VALUES ?", [values]);
    }

    await connection.commit();
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    await connection.rollback();
    console.error("Failed to update product recipe:", error);
    return { success: false, error: error.message || "Database error" };
  } finally {
    connection.release();
  }
}

export async function getIngredientLogs(selectedMonth?: number, selectedYear?: number) {
  try {
    const isYearly = selectedMonth === 0;
    const queryParams = isYearly ? [selectedYear] : [selectedYear, selectedMonth];
    
    const logs = await query(`
      SELECT 
        l.*, 
        i.name as ingredient_name,
        i.unit
      FROM ingredient_logs l
      JOIN ingredients i ON l.ingredient_id = i.id
      WHERE ${isYearly ? 'YEAR(l.date) = ?' : 'YEAR(l.date) = ? AND MONTH(l.date) = ?'}
      ORDER BY l.date DESC
    `, queryParams) as any[];

    return JSON.parse(JSON.stringify(logs));
  } catch (error) {
    console.error("Failed to fetch ingredient logs:", error);
    return [];
  }
}


