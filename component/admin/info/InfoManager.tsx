"use client";

import React, { useState } from "react";
import { Plus, Newspaper, Search, Filter } from "lucide-react";
import InfoTable from "./InfoTable";
import InfoModal from "./InfoModal";
import { addBreadInfo, updateBreadInfo, deleteBreadInfo } from "@/lib/actions";

export default function InfoManager({ initialArticles }: { initialArticles: any[] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const CATEGORIES = ["Semua", "Berita Bakery", "Wawasan Roti", "Tips & Trik"];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = async (data: any) => {
    if (editingArticle) {
      const result = await updateBreadInfo(editingArticle.id, data);
      if (result.success) {
        setArticles(prev => prev.map(a => a.id === editingArticle.id ? { ...a, ...data } : a));
      }
    } else {
      const result = await addBreadInfo(data);
      if (result.success) {
        // Refresh local state (or window.location.reload since we use revalidatePath)
        window.location.reload();
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus informasi ini?")) {
      const result = await deleteBreadInfo(id);
      if (result.success) {
        setArticles(prev => prev.filter(article => article.id !== id));
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingArticle(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (article: any) => {
    setEditingArticle(article);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Newspaper size={120} className="text-[#6B4423]" />
        </div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 bg-[#FCF1E8] rounded-3xl flex items-center justify-center text-[#6B4423] shadow-inner">
            <Newspaper size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Kelola Informasi</h1>
            <p className="text-sm font-bold text-zinc-400 mt-1 uppercase tracking-widest">Konten & Berita Toko Roti</p>
          </div>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="relative z-10 group flex items-center gap-3 bg-stone-900 text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-[#6B4423] active:scale-95 shadow-xl shadow-stone-900/10 hover:shadow-[#6B4423]/20"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Tambah Berita Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Cari judul berita atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border border-zinc-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-sm"
          />
        </div>
        <div className="relative group">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none bg-white px-10 py-5 rounded-3xl border border-zinc-100 shadow-sm text-sm font-bold text-zinc-600 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all cursor-pointer min-w-[180px]"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        </div>
      </div>

      {/* Table Section */}
      <InfoTable 
        articles={filteredArticles} 
        onEdit={handleOpenEditModal} 
        onDelete={handleDelete} 
      />

      {/* Modal */}
      <InfoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialData={editingArticle}
      />
    </div>
  );
}
