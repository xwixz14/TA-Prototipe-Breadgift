"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Type, FileText, Image as ImageIcon, Tag } from "lucide-react";
import { uploadImage } from "@/lib/actions";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
}

export default function InfoModal({ isOpen, onClose, onSave, initialData }: InfoModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    category: "Wawasan Roti"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        content: initialData.content || "",
        image_url: initialData.image_url || "",
        category: initialData.category || "Wawasan Roti"
      });
    } else {
      setFormData({
        title: "",
        content: "",
        image_url: "",
        category: "Wawasan Roti"
      });
    }
  }, [initialData, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    const result = await uploadImage(uploadFormData);
    if (result.success && result.imageUrl) {
      setFormData(prev => ({ ...prev, image_url: result.imageUrl! }));
    } else {
      alert("Gagal mengunggah gambar");
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 flex items-center justify-between border-b border-zinc-100">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
              {initialData ? "Edit Informasi" : "Tambah Informasi Baru"}
            </h2>
            <p className="text-sm font-bold text-zinc-400">Silakan lengkapi konten artikel Anda.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-zinc-100 rounded-2xl transition-all active:scale-90"
          >
            <X className="w-6 h-6 text-red-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Type size={14} /> Judul Artikel
            </label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Rahasia Roti Lembut"
              className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Tag size={14} /> Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
            >
              <option value="Wawasan Roti">Wawasan Roti</option>
              <option value="Tips & Trik">Tips & Trik</option>
              <option value="Berita Bakery">Berita Bakery</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={14} /> Gambar Sampul
            </label>
            <div className="flex gap-4 items-center">
              {formData.image_url && (
                <div className="w-20 h-20 rounded-2xl overflow-hidden relative border border-zinc-200">
                  <img src={formData.image_url} alt="Preview" className="object-cover w-full h-full" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl text-sm font-bold text-zinc-500 hover:border-primary hover:text-primary transition-all cursor-pointer"
                >
                  {isUploading ? (
                     <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : <ImageIcon size={20} />}
                  {formData.image_url ? "Ubah Gambar" : "Pilih Gambar"}
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <FileText size={14} /> Isi Konten
            </label>
            <textarea
              required
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Tuliskan detail informasi di sini..."
              className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-zinc-100 text-zinc-500 rounded-2xl text-sm font-black hover:bg-zinc-200 transition-all active:scale-95"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-[2] py-4 bg-primary text-white rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:bg-[#5D3822] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Save size={20} />}
              Simpan Informasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
