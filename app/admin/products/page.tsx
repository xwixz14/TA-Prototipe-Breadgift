"use client";

import React, { useState, useEffect } from "react";
import ProductTable from "@/component/admin/products/ProductTable";
import ProductModal from "@/component/admin/products/ProductModal";
import StockAlert from "@/component/admin/products/StockAlert";
import Toast, { ToastType } from "@/component/ui/Toast";
import { Search, Plus, Filter } from "lucide-react";
import { getProducts, addProduct, updateProduct, deleteProduct, toggleProductStatus } from "@/lib/actions";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const router = useRouter();

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
  };

  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
    setFilteredProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;
    
    if (category !== "Semua") {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [search, category, products]);

  const handleAddProduct = async (data: any) => {
    const res = await addProduct(data);
    if (res.success) {
      setIsModalOpen(false);
      fetchProducts();
      router.refresh();
      showToast("Produk baru berhasil ditambahkan!");
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6B4423", "#F59E0B", "#10B981"]
      });
    } else {
      showToast(res.error || "Gagal menambahkan produk", "error");
    }
  };

  const handleUpdateProduct = async (data: any) => {
    const res = await updateProduct(editingProduct.id, data);
    if (res.success) {
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
      router.refresh();
      showToast("Perubahan produk berhasil disimpan!");
    } else {
      showToast(res.error || "Gagal memperbarui produk", "error");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const res = await toggleProductStatus(id, currentStatus);
    if (res.success) {
      fetchProducts();
      showToast(`Produk kini berstatus ${res.newStatus || 'Updated'}`);
    } else {
      showToast(res.error || "Gagal mengubah status", "error");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Apa Anda yakin ingin menghapus produk ini?")) {
      const res = await deleteProduct(id) as { success: boolean; message?: string; error?: string };
      if (res.success) {
        showToast(res.message || "Produk berhasil dihapus");
        fetchProducts();
        router.refresh();
      } else {
        showToast(res.error || "Gagal menghapus produk", "error");
      }
    }
  };

  const lowStockCount = products.filter(p => p.stock <= p.min_stock).length;

  return (
    <div className="flex-1 flex flex-col gap-8 w-full h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header Info */}
      <div className="flex justify-between items-start shrink-0">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Daftar Barang</h1>
          <p className="text-sm font-bold text-zinc-400 mt-1">Kelola data barang dan inventori toko Anda</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-[#6B4423] text-white px-8 py-4 rounded-[20px] font-black flex items-center gap-3 shadow-lg shadow-[#6B4423]/20 hover:bg-[#5D3822] hover:shadow-[#6B4423]/40 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Tambah Barang
        </button>
      </div>

      {/* Stock Alert Section - Keep it visible or allow it to be part of the flow */}
      <div className="shrink-0">
        <StockAlert lowStockCount={lowStockCount} />
      </div>

      {/* Filter Bar - Keep it visible */}
      <div className="flex gap-6 items-center shrink-0">
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white border border-zinc-200 px-6 py-3.5 pr-12 rounded-2xl text-sm font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20 appearance-none cursor-pointer min-w-[200px]"
          >
            <option value="Semua">Semua Produk</option>
            <option value="Roti Isi">Roti Isi</option>
            <option value="Roti Tawar">Roti Tawar</option>
            <option value="Donat">Donat</option>
          </select>
          <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>

        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#6B4423] transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau kode barang..."
            className="w-full bg-white border border-zinc-200 py-3.5 pl-12 pr-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20 focus:border-[#6B4423] transition-all text-sm font-bold text-zinc-800 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Products Table Container - This should scroll */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <ProductTable 
          products={filteredProducts} 
          onEdit={(p) => {
            setEditingProduct(p);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteProduct}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      {/* Add/Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
        initialData={editingProduct}
      />
    </div>
  );
}
