import React from "react";
import RevenueCharts from "@/component/admin/dashboard/RevenueCharts";
import { getRevenueStats } from "@/lib/actions";

export const metadata = {
  title: "Pendapatan - Admin BreadGift",
};

export default async function RevenuePage({ searchParams }: { searchParams: Promise<{ month?: string, year?: string }> }) {
  const params = await searchParams;
  const month = params.month ? parseInt(params.month) : undefined;
  const year = params.year ? parseInt(params.year) : undefined;
  
  const { chartData, summary, targetPeriod } = await getRevenueStats(month, year);

  return (
    <div className="flex-1 h-full overflow-hidden">
      <RevenueCharts 
        chartData={chartData} 
        summary={summary} 
        currentMonth={targetPeriod.month}
        currentYear={targetPeriod.year}
      />
    </div>
  );
}
