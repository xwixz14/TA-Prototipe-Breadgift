"use server";

import { query } from "./db";
import { revalidatePath } from "next/cache";

export async function getUnreadTransactionsCount() {
  try {
    const results = await query("SELECT COUNT(*) as count FROM transactions WHERE is_read = FALSE AND status = 'Confirm'") as any[];
    return results[0].count || 0;
  } catch (error) {
    console.error("Failed to get unread count:", error);
    return 0;
  }
}

export async function markAllAsRead() {
  try {
    await query("UPDATE transactions SET is_read = TRUE WHERE is_read = FALSE");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all as read:", error);
    return { success: false };
  }
}
