import React from "react";
import TransactionList from "@/component/admin/history/TransactionList";
import { getAdminTransactions } from "@/lib/actions";
import { History, ShoppingBag, TrendingUp, Clock, XCircle } from "lucide-react";

export const metadata = {
  title: "Riwayat Transaksi - Admin BreadGift",
};

export default async function HistoryPage() {
  const transactions = await getAdminTransactions();

  // Basic stats
  const totalConfirm = transactions.filter((t: any) => t.status === 'Confirm').length;
  const totalPending = transactions.filter((t: any) => t.status === 'Pending').length;
  const totalCancel = transactions.filter((t: any) => t.status === 'Cancel').length;
  const totalRevenue = transactions
    .filter((t: any) => t.status === 'Confirm')
    .reduce((sum: number, t: any) => sum + t.total_amount, 0);

  return (
    <div className="flex-1 flex flex-col gap-8 h-full overflow-y-auto pr-2 custom-scrollbar pb-10">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Riwayat Transaksi</h1>
          <p className="text-sm text-zinc-500 font-medium">Monitoring pesanan online dari pelanggan.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4 px-6">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pending</p>
              <p className="text-xl font-black text-zinc-900">{totalPending}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4 px-6">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Selesai</p>
              <p className="text-xl font-black text-zinc-900">{totalConfirm}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4 px-6">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Batal</p>
              <p className="text-xl font-black text-zinc-900">{totalCancel}</p>
            </div>
          </div>
          
          <div className="bg-[#6B4423] p-4 rounded-2xl shadow-lg shadow-[#6B4423]/20 flex items-center gap-4 px-6 text-white">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Omzet</p>
              <p className="text-xl font-black text-white">Rp. {totalRevenue.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>
      </div>

      <TransactionList initialTransactions={transactions} />
    </div>
  );
}
