import React from "react";
import ExpenseManager from "@/component/admin/expenses/ExpenseManager";
import { getExpenses } from "@/lib/actions";

export const metadata = {
  title: "Pengeluaran - Admin BreadGift",
};

export default async function ExpensesPage() {
  const initialExpenses = await getExpenses();

  return (
    <div className="flex-1 h-full overflow-hidden">
      <ExpenseManager initialExpenses={initialExpenses} />
    </div>
  );
}
