"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Filter, Wheat, AlertCircle, ShoppingBasket, Edit2, FileSpreadsheet, FileText, TrendingDown } from "lucide-react";
import IngredientTable from "./IngredientTable";
import IngredientModal from "./IngredientModal";
import Toast, { ToastType } from "@/component/ui/Toast";
import MonthSelector from "../common/MonthSelector";
import { getIngredients, addIngredient, updateIngredient, deleteIngredient, getIngredientUsageStats } from "@/lib/actions";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function IngredientManager() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [usageStats, setUsageStats] = useState<any[]>([]);
  const router = useRouter();

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
  };

  const fetchData = async () => {
    const [basicData, statsData] = await Promise.all([
      getIngredients(),
      getIngredientUsageStats(selectedMonth, selectedYear)
    ]);
    setIngredients(basicData);
    setFilteredIngredients(basicData);
    setUsageStats(statsData);
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    let filtered = ingredients;
    
    if (filterType === "Hampir Habis") {
      filtered = filtered.filter(item => Number(item.stock) <= Number(item.min_stock));
    }
    
    if (search) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredIngredients(filtered);
  }, [search, filterType, ingredients]);

  const handleAdd = async (data: any) => {
    const res = await addIngredient(data);
    if (res.success) {
      setIsModalOpen(false);
      fetchData();
      router.refresh();
      showToast(res.message || "Bahan baku berhasil diproses!");
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#6B4423", "#F59E0B"]
      });
    } else {
      showToast(res.error || "Gagal menambahkan bahan", "error");
    }
  };

  const handleUpdate = async (data: any) => {
    const res = await updateIngredient(editingItem.id, data);
    if (res.success) {
      setIsModalOpen(false);
      setEditingItem(null);
      fetchData();
      router.refresh();
      showToast("Perubahan stok bahan berhasil disimpan!");
    } else {
      showToast(res.error || "Gagal memperbarui bahan", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apa Anda yakin ingin menghapus bahan ini dari inventori?")) {
      const res = await deleteIngredient(id);
      if (res.success) {
        showToast("Bahan baku berhasil dihapus");
        fetchData();
        router.refresh();
      } else {
        showToast(res.error || "Gagal menghapus bahan", "error");
      }
    }
  };

  const handleDateChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Stok Bahan");

    const isYearly = selectedMonth === 0;
    const periodStr = isYearly ? `Tahun ${selectedYear}` : `Bulan ${selectedMonth}/${selectedYear}`;

    worksheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "Nama Bahan", key: "name", width: 30 },
      { header: "Satuan", key: "unit", width: 10 },
      { header: "Stok Saat Ini", key: "stock", width: 15 },
      { header: "Digunakan (" + periodStr + ")", key: "used", width: 25 },
      { header: "Status", key: "status", width: 15 },
    ];

    usageStats.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        name: item.name,
        unit: item.unit,
        stock: item.stock,
        used: item.used_quantity,
        status: item.stock <= item.min_stock ? "Hampir Habis" : "Aman",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Stok_Bahan_${periodStr.replace(/\//g, "-")}.xlsx`;
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const isYearly = selectedMonth === 0;
    const periodStr = isYearly ? `Tahun ${selectedYear}` : `Bulan ${selectedMonth}/${selectedYear}`;

    doc.setFontSize(18);
    doc.text("Laporan Stok Bahan Baku", 14, 20);
    doc.setFontSize(12);
    doc.text(`Periode: ${periodStr}`, 14, 30);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 38);

    const tableData = usageStats.map((item, index) => [
      index + 1,
      item.name,
      item.unit,
      item.stock,
      item.used_quantity,
      item.stock <= item.min_stock ? "Hampir Habis" : "Aman"
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["No", "Nama Bahan", "Unit", "Stok", "Digunakan", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [107, 68, 35] },
    });

    doc.save(`Laporan_Stok_Bahan_${periodStr.replace(/\//g, "-")}.pdf`);
  };

  const lowStockCount = ingredients.filter(item => Number(item.stock) <= Number(item.min_stock)).length;

  return (
    <div className="flex-1 flex flex-col gap-8 w-full h-fit lg:h-full lg:overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative pr-4 custom-scrollbar pb-20">
      {/* Toast Notification */}
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
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Stok Bahan Baku</h1>
          <p className="text-sm font-bold text-zinc-400 mt-1 uppercase tracking-tight italic">Pantau ketersediaan bahan produksi BreadGift</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <button 
            disabled={!editingItem}
            onClick={() => setIsModalOpen(true)}
            className={`flex-1 md:flex-initial px-8 py-4 rounded-[24px] font-black flex items-center justify-center gap-3 transition-all active:scale-95 border-2 ${
              editingItem 
                ? "bg-[#FCF1E8] text-[#6B4423] border-[#6B4423]/20 hover:border-[#6B4423]/40 shadow-lg shadow-[#6B4423]/5" 
                : "bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed"
            }`}
          >
            <Edit2 className={`w-5 h-5 ${editingItem ? "text-[#6B4423]" : "text-zinc-200"}`} />
            Edit Bahan Baku
          </button>

          <button 
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="flex-1 md:flex-initial bg-[#6B4423] text-white px-8 py-4 rounded-[24px] font-black flex items-center gap-3 shadow-lg shadow-[#6B4423]/20 hover:bg-[#5D3822] hover:shadow-[#6B4423]/40 transition-all active:scale-95 justify-center"
          >
            <Plus className="w-5 h-5" />
            Tambah Bahan Baku
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 shrink-0">
        <div className="bg-white p-7 rounded-[40px] border border-zinc-100 shadow-sm flex items-center gap-6 group hover:border-[#6B4423]/20 transition-all">
          <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:bg-[#FCF1E8] transition-all">
            <Wheat className="w-7 h-7 text-[#6B4423]/60 group-hover:text-[#6B4423] transition-all" />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Jenis Bahan</p>
            <p className="text-3xl font-black text-zinc-900 tracking-tighter">
              {ingredients.length} <span className="text-sm text-zinc-400 font-bold ml-1 uppercase">Item</span>
            </p>
          </div>
        </div>

        <div className={`p-7 rounded-[40px] border flex items-center gap-6 transition-all ${
          lowStockCount > 0 
            ? 'bg-rose-50 border-rose-100 text-rose-800' 
            : 'bg-emerald-50 border-emerald-100 text-emerald-800'
        }`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
           lowStockCount > 0 ? 'bg-white text-rose-500 border-rose-100' : 'bg-white text-emerald-500 border-emerald-100'
          }`}>
            {lowStockCount > 0 ? <AlertCircle className="w-7 h-7 animate-pulse" /> : <ShoppingBasket className="w-7 h-7" />}
          </div>
          <div>
            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Status Inventori</p>
            <p className="text-3xl font-black tracking-tighter">
              {lowStockCount > 0 ? `${lowStockCount} Hampir Habis` : 'Stok Aman'}
            </p>
          </div>
        </div>

        {/* Informative card for the user */}
        <div className="hidden lg:flex bg-[#6B4423] p-7 rounded-[40px] shadow-xl shadow-[#6B4423]/20 items-center gap-6 text-white overflow-hidden relative group">
           <div className="relative z-10">
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Tips</p>
              <p className="text-sm font-bold leading-relaxed tracking-tight">
                Update stok secara berkala setiap habis belanja ya! ✨
              </p>
           </div>
           <Wheat className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center shrink-0">
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <MonthSelector 
            selectedMonth={selectedMonth} 
            selectedYear={selectedYear} 
            onDateChange={handleDateChange} 
          />

          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-zinc-200 px-6 py-4 pr-12 rounded-2xl text-sm font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20 appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="Semua">Semua Bahan</option>
              <option value="Hampir Habis">Bahan Hampir Habis ⚠️</option>
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex-1 relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#6B4423] transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama bahan baku..."
            className="w-full bg-white border border-zinc-200 py-4 pl-12 pr-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20 focus:border-[#6B4423] transition-all text-sm font-bold text-zinc-800 placeholder:text-zinc-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={exportToExcel}
            className="flex-1 lg:flex-initial bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all border border-emerald-100"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Excel
          </button>
          <button 
            onClick={exportToPDF}
            className="flex-1 lg:flex-initial bg-rose-50 text-rose-600 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-rose-100 transition-all border border-rose-100"
          >
            <FileText className="w-5 h-5" />
            PDF
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 flex flex-col">
        <IngredientTable 
          ingredients={filteredIngredients} 
          selectedId={editingItem?.id || null}
          onSelect={(item) => {
            // Jika klik item yang sama, deselect (toggle)
            if (editingItem?.id === item.id) {
              setEditingItem(null);
            } else {
              setEditingItem(item);
            }
          }}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal */}
      <IngredientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingItem ? handleUpdate : handleAdd}
        initialData={editingItem}
        ingredients={ingredients}
        onDeleteIngredient={handleDelete}
      />
    </div>
  );
}
