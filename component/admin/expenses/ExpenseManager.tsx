"use client";

import React, { useState } from "react";
import { Plus, Trash2, Search, Calendar, Wallet, X, Loader2, AlertCircle } from "lucide-react";
import { createExpense, deleteExpense } from "@/lib/actions";

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
}

interface ExpenseManagerProps {
  initialExpenses: Expense[];
}

export default function ExpenseManager({ initialExpenses }: ExpenseManagerProps) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Bahan Baku",
    expense_date: new Date().toISOString().split('T')[0]
  });

  const categories = ["Bahan Baku", "Operasional", "Listrik & Air", "Lainnya"];
  const filterCategories = ["Semua", ...categories];

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createExpense({
        ...formData,
        amount: Number(formData.amount)
      });
      if (result.success) {
        // Refresh local state (simplest way without complex state syncing)
        window.location.reload(); 
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengeluaran ini?")) return;
    const result = await deleteExpense(id);
    if (result.success) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-8 h-full overflow-y-auto pr-2 custom-scrollbar pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Manajemen Pengeluaran</h1>
          <p className="text-sm text-zinc-500 font-medium tracking-wide uppercase">Catat setiap biaya operasional toko Anda.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#6B4423] text-white px-8 py-4 rounded-[24px] font-black flex items-center gap-3 shadow-xl shadow-[#6B4423]/20 hover:bg-[#5D3822] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Pengeluaran
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
             <Wallet className="w-7 h-7 text-red-500" />
           </div>
           <div>
             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Pengeluaran</p>
             <p className="text-2xl font-black text-zinc-900">Rp. {totalExpense.toLocaleString("id-ID")}</p>
           </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[40px] border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-zinc-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-zinc-50/30">
          <h3 className="text-lg font-black text-zinc-900 tracking-tight">Daftar Pengeluaran</h3>
          
          <div className="flex items-center gap-3 w-full md:w-fit">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Cari deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-zinc-100 py-3 pl-14 pr-6 rounded-2xl focus:outline-none focus:border-[#6B4423]/20 text-sm font-bold shadow-sm transition-all"
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-3 px-6 py-3.5 bg-white border-2 border-zinc-100 rounded-2xl shadow-sm hover:bg-zinc-50 transition-all group"
              >
                <X className={`w-4 h-4 text-zinc-300 transition-all ${selectedCategory !== "Semua" ? "opacity-100" : "opacity-0"}`} 
                  onClick={(e) => {
                    if (selectedCategory !== "Semua") {
                      e.stopPropagation();
                      setSelectedCategory("Semua");
                    }
                  }}
                />
                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">KATEGORI:</span>
                <span className="text-sm font-black text-zinc-900">{selectedCategory}</span>
              </button>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-[10]" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-100 rounded-[24px] shadow-2xl z-[20] overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-2">
                       {filterCategories.map((c) => (
                         <button
                           key={c}
                           onClick={() => {
                             setSelectedCategory(c);
                             setIsFilterOpen(false);
                           }}
                           className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${
                             selectedCategory === c 
                               ? "bg-[#6B4423] text-white shadow-lg shadow-[#6B4423]/20" 
                               : "text-zinc-600 hover:bg-zinc-50"
                           }`}
                         >
                           {c}
                         </button>
                       ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>


        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Deskripsi</th>
                <th className="px-8 py-5">Kategori</th>
                <th className="px-8 py-5">Tanggal</th>
                <th className="px-8 py-5 text-right">Nominal</th>
                <th className="px-8 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredExpenses.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-20 text-center">
                      <AlertCircle className="w-12 h-12 text-zinc-100 mx-auto mb-4" />
                      <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Belum ada data pengeluaran</p>
                   </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="group hover:bg-zinc-50/80 transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-zinc-900 leading-tight">{expense.description}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg uppercase tracking-wider">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(expense.expense_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="text-sm font-black text-red-500">Rp. {expense.amount.toLocaleString("id-ID")}</p>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex justify-center">
                         <button 
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                         >
                           <Trash2 className="w-5 h-5" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="relative w-full max-w-xl bg-white rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-zinc-100">
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Tambah Pengeluaran</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-2xl transition-all">
                  <X className="w-6 h-6 text-zinc-300" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Deskripsi</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Contoh: Belanja Terigu..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 py-4 px-6 rounded-2xl focus:outline-none focus:border-[#6B4423] text-sm font-bold transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nominal (Rp)</label>
                      <input 
                        required
                        type="text" 
                        placeholder="0"
                        value={formData.amount ? Number(formData.amount).toLocaleString("id-ID") : ""}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, "");
                          setFormData({...formData, amount: rawValue});
                        }}
                        className="w-full bg-zinc-50 border border-zinc-200 py-4 px-6 rounded-2xl focus:outline-none focus:border-[#6B4423] text-sm font-bold transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Kategori</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-200 py-4 px-6 rounded-2xl focus:outline-none focus:border-[#6B4423] text-sm font-bold transition-all appearance-none"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Tanggal</label>
                    <input 
                      required
                      type="date"
                      value={formData.expense_date}
                      onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 py-4 px-6 rounded-2xl focus:outline-none focus:border-[#6B4423] text-sm font-bold transition-all"
                    />
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-[#6B4423] text-white py-6 rounded-[28px] text-lg font-black shadow-2xl shadow-[#6B4423]/30 hover:bg-[#5D3822] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-zinc-300"
                >
                  {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : "Simpan Data"}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
