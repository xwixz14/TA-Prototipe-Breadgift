import React from "react";
import RevenueCharts from "@/component/admin/dashboard/RevenueCharts";
import { getRevenueStats } from "@/lib/actions";

export const metadata = {
  title: "Pendapatan - Admin BreadGift",
};

export default async function RevenuePage() {
  const { chartData, summary } = await getRevenueStats();

  return (
    <div className="flex-1 h-full overflow-hidden">
      <RevenueCharts chartData={chartData} summary={summary} />
    </div>
  );
}
