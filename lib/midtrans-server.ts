import crypto from "crypto";
import { db, query } from "./db";
import { revalidatePath } from "next/cache";
import { sendOrderConfirmation } from "./mail";

export async function handleMidtransNotification(payload: any) {
  const connection = await db.getConnection();
  try {
    const { 
      order_id, 
      status_code, 
      gross_amount, 
      signature_key, 
      transaction_status,
      fraud_status 
    } = payload;

    // 1. Verify Signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const input = order_id + status_code + gross_amount + serverKey;
    const computedSignature = crypto.createHash('sha512').update(input).digest('hex');

    if (computedSignature !== signature_key) {
      console.error("Midtrans Signature Verification Failed!");
      return { success: false, error: "Invalid signature" };
    }

    // 2. Extract Transaction ID from Order ID (TRX-ID-TIMESTAMP)
    const parts = order_id.split('-');
    const transactionId = parts[1];
    if (!transactionId) return { success: false, error: "Invalid Order ID format" };

    await connection.beginTransaction();

    // 3. Map Status
    let newStatus: 'Pending' | 'Confirm' | 'Cancel' = 'Pending';
    let shouldRestoreStock = false;

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') newStatus = 'Confirm';
    } else if (transaction_status === 'settlement') {
      newStatus = 'Confirm';
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      newStatus = 'Cancel';
      shouldRestoreStock = true;
    } else if (transaction_status === 'pending') {
      newStatus = 'Pending';
    }

    // 4. Update Transaction Status & is_read (for internal notification)
    const isRead = newStatus === 'Confirm' ? 0 : 1; // Mark as unread if confirmed
    await connection.query(
      "UPDATE transactions SET status = ?, is_read = ? WHERE id = ?",
      [newStatus, isRead, transactionId]
    );

    // 5. Restore Stock if needed
    if (shouldRestoreStock) {
      const itemsQueryResult = await connection.query(
        "SELECT product_id, quantity FROM transaction_items WHERE transaction_id = ?",
        [transactionId]
      ) as any[];

      const items = itemsQueryResult[0] || [];
      for (const item of items) {
         await connection.query(
           "UPDATE products SET stock = stock + ? WHERE id = ?",
           [item.quantity, item.product_id]
         );
      }
    }

    await connection.commit();
    connection.release();

    // 6. Send Email Notification (Non-blocking)
    if (newStatus === 'Confirm') {
       (async () => {
         try {
           const [items] = await db.query(
             "SELECT p.name, ti.quantity, ti.price_at_transaction as price FROM transaction_items ti JOIN products p ON ti.product_id = p.id WHERE ti.transaction_id = ?",
             [transactionId]
           ) as any[];

           // For online orders, we might need to fetch the customer name from the user table
           // For now, we'll use a generic "Pelanggan BreadGift" or fetch if user_id exists
           const [transactionData] = await db.query("SELECT user_id FROM transactions WHERE id = ?", [transactionId]) as any[];
           let customerName = "Pelanggan BreadGift";
           
           const userId = transactionData[0]?.user_id;
           if (userId) {
              const [userData] = await db.query("SELECT name FROM users WHERE id = ?", [userId]) as any[];
              if (userData[0]) customerName = userData[0].name;
           }

           // Fetch customer email
           let customerEmail = "customer@example.com";
           if (userId) {
              const [userData] = await db.query("SELECT email FROM users WHERE id = ?", [userId]) as any[];
              if (userData[0]?.email) customerEmail = userData[0].email;
           }

           await sendOrderConfirmation({
             orderId: order_id,
             customerName,
             customerEmail,
             totalAmount: parseFloat(gross_amount),
             items: items || [],
           });
         } catch (err) {
           console.error("Delayed Email Error:", err);
         }
       })();
    }

    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/history");
    
    return { success: true };
  } catch (error) {
    if (connection) {
       await connection.rollback();
       connection.release();
    }
    console.error("Midtrans Notification Processing Error:", error);
    return { success: false, error: "Processing error" };
  }
}
