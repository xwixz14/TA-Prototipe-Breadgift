import React from "react";
import ProfitLossManager from "@/component/admin/profit-loss/ProfitLossManager";
import { getProfitLossStats } from "@/lib/actions";

export const metadata = {
  title: "Laporan Laba Rugi - Admin BreadGift",
};

export default async function ProfitLossPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ month?: string, year?: string }> 
}) {
  const params = await searchParams;
  const month = params.month ? parseInt(params.month) : (new Date().getMonth() + 1);
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();
  
  const data = await getProfitLossStats(month, year);

  return (
    <div className="flex-1 h-fit">
      <ProfitLossManager data={data} />
    </div>
  );
}
