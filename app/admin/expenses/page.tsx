import React from "react";
import ExpenseManager from "@/component/admin/expenses/ExpenseManager";
import { getExpenses, getSalaries } from "@/lib/actions";

export const metadata = {
  title: "Pengeluaran & Gaji - Admin BreadGift",
};

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ month?: string, year?: string }> }) {
  const params = await searchParams;
  const month = params.month ? parseInt(params.month) : (new Date().getMonth() + 1);
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();
  
  const [initialExpenses, initialSalaries] = await Promise.all([
    getExpenses(month, year),
    getSalaries(month, year)
  ]);

  return (
    <div className="flex-1 h-fit">
      <ExpenseManager 
        initialExpenses={initialExpenses} 
        initialSalaries={initialSalaries}
        currentMonth={month}
        currentYear={year}
      />
    </div>
  );
}
