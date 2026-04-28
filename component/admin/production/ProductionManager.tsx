"use client";

import React, { useState, useEffect } from "react";
import { Plus, History, Package, TrendingUp, Search } from "lucide-react";
import ProductionTable from "./ProductionTable";
import ProductionModal from "./ProductionModal";
import Toast, { ToastType } from "@/component/ui/Toast";
import { getProductionLogs, createProductionLog, getProducts, getIngredients } from "@/lib/actions";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export default function ProductionManager() {
  const [logs, setLogs] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsData, productsData, ingredientsData] = await Promise.all([
        getProductionLogs(),
        getProducts(),
        getIngredients()
      ]);
      setLogs(logsData);
      setProducts(productsData.filter((p: any) => p.status === 'Aktif'));
      setIngredients(ingredientsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduction = async (data: any) => {
    const res = await createProductionLog(data);
    if (res.success) {
      setIsModalOpen(false);
      fetchData();
      router.refresh();
      setToast({ message: "Catatan produksi berhasil disimpan!", type: "success" });
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#6B4423", "#F59E0B"]
      });
    } else {
      setToast({ message: res.error || "Gagal menyimpan produksi", type: "error" });
    }
  };

  const totalProductionToday = logs
    .filter(log => new Date(log.production_date).toDateString() === new Date().toDateString())
    .reduce((sum, log) => sum + log.quantity, 0);

  return (
    <div className="flex-1 flex flex-col gap-8 w-full h-fit lg:h-full lg:overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative pr-4 custom-scrollbar pb-20">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Dashboard Produksi Roti</h1>
          <p className="text-sm font-bold text-zinc-400 mt-1 uppercase tracking-tight italic">Pantau hasil produksi harian dan update stok otomatis</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-[#6B4423] text-white px-8 py-4 rounded-[24px] font-black flex items-center justify-center gap-3 shadow-lg shadow-[#6B4423]/20 hover:bg-[#5D3822] hover:shadow-[#6B4423]/40 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Catat Hasil Produksi
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 shrink-0">
        <div className="bg-white p-7 rounded-[40px] border border-zinc-100 shadow-sm flex items-center gap-6 group hover:border-[#6B4423]/20 transition-all">
          <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:bg-[#FCF1E8] transition-all">
            <TrendingUp className="w-7 h-7 text-[#6B4423]/60 group-hover:text-[#6B4423] transition-all" />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Produksi Hari Ini</p>
            <p className="text-3xl font-black text-zinc-900 tracking-tighter">
              {totalProductionToday.toLocaleString("id-ID")} <span className="text-sm text-zinc-400 font-bold ml-1 uppercase">Pcs</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-7 rounded-[40px] border border-zinc-100 shadow-sm flex items-center gap-6 group hover:border-[#6B4423]/20 transition-all">
          <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:bg-[#FCF1E8] transition-all">
            <History className="w-7 h-7 text-[#6B4423]/60 group-hover:text-[#6B4423] transition-all" />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Catatan</p>
            <p className="text-3xl font-black text-zinc-900 tracking-tighter">
              {logs.length} <span className="text-sm text-zinc-400 font-bold ml-1 uppercase">Log</span>
            </p>
          </div>
        </div>

        <div className="bg-[#6B4423] p-7 rounded-[40px] shadow-xl shadow-[#6B4423]/20 flex items-center gap-6 text-white group overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Status Gudang</p>
            <p className="text-lg font-bold leading-tight">
              Stok otomatis bertambah setiap produksi dicatat! ✨
            </p>
          </div>
          <Package className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <History className="w-5 h-5 text-[#6B4423]" />
            Riwayat Produksi Terkini
          </h2>
        </div>
        <ProductionTable logs={logs} />
      </div>

      {/* Modal */}
      <ProductionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProduction}
        products={products}
        ingredients={ingredients}
      />
    </div>
  );
}
