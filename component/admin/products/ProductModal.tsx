"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Upload, ImageIcon, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/actions";
import { formatNumber, parseRawNumber, limitValue, MAX_LIMIT_CURRENCY, MAX_LIMIT_STOCK } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id?: number;
  name: string;
  category_id: number;
  unit: string;
  price: number;
  stock: number;
  status: "Aktif" | "Nonaktif";
  image_url: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => void;
  initialData?: Product;
}

export default function ProductModal({ isOpen, onClose, onSubmit, initialData }: ProductModalProps) {
  const [formData, setFormData] = useState<Product>({
    name: "",
    category_id: 1,
    unit: "Pcs",
    price: 0,
    stock: 0,
    status: "Aktif",
    image_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.image_url);
    } else {
      setFormData({
        name: "",
        category_id: 1,
        unit: "Pcs",
        price: 0,
        stock: 0,
        status: "Aktif",
        image_url: "",
      });
      setImagePreview(null);
    }
  }, [initialData, isOpen]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size validation (e.g., 5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      alert("Ukuran file terlalu besar! Maksimal 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await uploadImage(formDataUpload);
      if (res.success && res.imageUrl) {
        setFormData(prev => ({ ...prev, image_url: res.imageUrl! }));
      } else {
        alert("Gagal mengunggah gambar: " + res.error);
        // Reset preview if upload failed
        setImagePreview(initialData?.image_url || null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Terjadi kesalahan sistem saat mengunggah gambar.");
      setImagePreview(initialData?.image_url || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="px-10 py-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
              {initialData ? "Ubah Data Roti" : "Tambah Roti Baru"}
            </h2>
            <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest leading-none">
              Isi informasi detail produk roti Anda
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all"
          >
            <X className="w-6 h-6 text-red-500" />
          </button>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}
          className="p-10 grid grid-cols-2 gap-x-8 gap-y-6"
        >
          <div className="col-span-2 space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Nama Roti</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-50 border border-zinc-200 py-3.5 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20 focus:border-[#6B4423] transition-all text-sm font-bold text-zinc-800 placeholder:text-zinc-300"
              placeholder="Contoh: Roti Coklat Lumer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Kategori</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
              className="w-full bg-zinc-50 border border-zinc-200 py-3.5 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20 focus:border-[#6B4423] transition-all text-sm font-bold text-zinc-800 appearance-none cursor-pointer"
            >
              <option value={1}>Roti Isi</option>
              <option value={2}>Roti Tawar</option>
              <option value={3}>Donat</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Satuan</label>
            <input
              type="text"
              required
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full bg-zinc-50 border border-zinc-200 py-3.5 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20 focus:border-[#6B4423] transition-all text-sm font-bold text-zinc-800 placeholder:text-zinc-300"
              placeholder="Pcs, Box, Pack"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Harga Jual (Rp)</label>
            <input
              type="text"
              required
              value={formatNumber(formData.price)}
              onChange={(e) => {
                const raw = parseRawNumber(e.target.value);
                const limited = limitValue(raw, MAX_LIMIT_CURRENCY);
                setFormData({ ...formData, price: limited });
              }}
              className="w-full bg-zinc-50 border border-zinc-200 py-3.5 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20 focus:border-[#6B4423] transition-all text-sm font-black text-[#6B4423] placeholder:text-zinc-300"
              placeholder="0"
            />
          </div>


          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Stok Awal</label>
            <input
              type="text"
              required
              value={formatNumber(formData.stock)}
              onChange={(e) => {
                const raw = parseRawNumber(e.target.value);
                const limited = limitValue(raw, MAX_LIMIT_STOCK);
                setFormData({ ...formData, stock: limited });
              }}
              className="w-full bg-zinc-50 border border-zinc-200 py-3.5 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20 focus:border-[#6B4423] transition-all text-sm font-bold text-zinc-800"
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "Aktif" | "Nonaktif" })}
              className="w-full bg-zinc-50 border border-zinc-200 py-3.5 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20 focus:border-[#6B4423] transition-all text-sm font-bold text-zinc-800 appearance-none cursor-pointer"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>

          <div className="col-span-2 space-y-3">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Gambar Produk</label>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer border-2 border-dashed rounded-[32px] overflow-hidden transition-all duration-300 min-h-[180px] flex flex-col items-center justify-center gap-4 ${
                imagePreview ? "border-[#6B4423]/20 bg-zinc-50" : "border-zinc-200 hover:border-[#6B4423]/40 bg-zinc-50/50 hover:bg-zinc-50"
              }`}
            >
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              {imagePreview ? (
                <>
                  <div className="absolute inset-0 w-full h-full">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className={`w-full h-full object-cover transition-opacity duration-300 ${uploading ? "opacity-40" : "opacity-100"}`}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl">
                      <Upload className="w-4 h-4 text-[#6B4423]" />
                      <span className="text-xs font-bold text-[#6B4423]">Ganti Gambar</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-[#6B4423] group-hover:bg-[#FCF1E8] transition-all">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-zinc-600">Klik untuk upload gambar</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">PNG, JPG atau WEBP (Maks. 2MB)</p>
                  </div>
                </>
              )}

              {uploading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-10">
                  <Loader2 className="w-8 h-8 text-[#6B4423] animate-spin" />
                  <p className="text-xs font-black text-[#6B4423] uppercase tracking-widest">Mengunggah...</p>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2 pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-zinc-100 text-zinc-400 rounded-2xl text-sm font-black hover:bg-zinc-200 hover:text-zinc-500 transition-all active:scale-95"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-2 py-4 bg-[#6B4423] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#6B4423]/20 hover:bg-[#5D3822] hover:shadow-[#6B4423]/40 transition-all active:scale-95"
            >
              {initialData ? "Simpan Perubahan" : "Simpan Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
