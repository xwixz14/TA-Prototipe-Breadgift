"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, Save, Package2, ChevronDown, Check } from "lucide-react";
import { formatNumber, parseRawNumber, limitValue, MAX_LIMIT_STOCK } from "@/lib/utils";



interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  ingredients?: any[];
  onDeleteIngredient?: (id: number) => Promise<void>;
}

export default function IngredientModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  ingredients = [], 
  onDeleteIngredient 
}: IngredientModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    stock: 0,
    unit: "kg",
    min_stock: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        stock: Number(initialData.stock) || 0,
        unit: initialData.unit || "kg",
        min_stock: Number(initialData.min_stock) || 5,
      });
    } else {
      setFormData({ name: "", stock: 0, unit: "kg", min_stock: 5 });
    }
  }, [initialData, isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
       alert("Harap pilih nama bahan baku!");
       return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[500px] rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#6B4423]/10 rounded-xl flex items-center justify-center">
              <Package2 className="w-5 h-5 text-[#6B4423]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-zinc-900 tracking-tight">
                {initialData ? "Ubah Bahan Baku" : "Tambah Bahan Baku"}
              </h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                Detail Inventori Bahan
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors text-zinc-400 hover:text-zinc-900"
          >
            <X className="w-6 h-6 text-red-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Nama Bahan - SEARCHABLE COMBOBOX */}
          <div className="relative" ref={dropdownRef}>
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Nama Bahan</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Pilih atau ketik nama bahan..."
                value={formData.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setFormData({ ...formData, name: newName });
                  setIsDropdownOpen(true);
                  
                  // Auto-sync existing unit and min_stock if found
                  const existing = ingredients.find(i => i.name.toLowerCase() === newName.toLowerCase());
                  if (existing && !initialData) {
                    setFormData(prev => ({
                      ...prev,
                      name: newName,
                      unit: existing.unit,
                      min_stock: existing.min_stock
                    }));
                  }
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className={`w-full bg-zinc-50 border px-6 py-4 rounded-2xl text-sm font-bold transition-all pr-20 ${
                  isDropdownOpen ? "border-[#6B4423] ring-2 ring-[#6B4423]/10" : "border-zinc-100"
                }`}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {formData.name && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, name: "", stock: 0 });
                    }}
                    className="p-1 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div 
                  className="cursor-pointer p-1"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-[#6B4423]" : ""}`} />
                </div>
              </div>
            </div>

            {/* Existing Stock Info Badge */}
            {(() => {
              const existing = ingredients.find(i => i.name.toLowerCase() === formData.name.toLowerCase());
              if (existing && !initialData) {
                return (
                  <div className="mt-3 px-5 py-3 bg-[#FCF1E8] border border-[#6B4423]/10 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-1 duration-300">
                    <span className="text-[10px] font-black text-[#6B4423] uppercase tracking-widest">Stok Lama:</span>
                    <span className="text-sm font-black text-[#6B4423]">{existing.stock} {existing.unit}</span>
                  </div>
                );
              }
              return null;
            })()}

            {/* Dropdown List */}
            {isDropdownOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-zinc-100 rounded-3xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[250px] overflow-y-auto p-2 custom-scrollbar">
                  {(() => {
                    const allOptions = [...new Set([
                      ...(ingredients.map(i => i.name)),
                      ...(initialData ? [initialData.name] : [])
                    ])].filter(Boolean);

                    const filteredOptions = allOptions.filter(option => 
                      option.toLowerCase().includes(formData.name.toLowerCase())
                    );

                    if (filteredOptions.length === 0) {
                      return (
                        <div className="px-5 py-4 text-xs font-bold text-zinc-400 italic text-center">
                          Tidak ada bahan yang cocok. Tekan Enter untuk menggunakan nama ini.
                        </div>
                      );
                    }

                    return filteredOptions.map((option) => {
                      const dbItem = ingredients.find(i => i.name === option);
                      
                      return (
                        <div
                          key={option}
                          onClick={() => {
                            const existing = ingredients.find(i => i.name === option);
                            setFormData({ 
                              ...formData, 
                              name: option,
                              unit: existing?.unit || formData.unit,
                              min_stock: existing?.min_stock || formData.min_stock
                            });
                            setIsDropdownOpen(false);
                          }}
                          className={`px-5 py-3.5 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center justify-between group ${
                            formData.name === option 
                              ? "bg-[#6B4423]/10 text-[#6B4423]" 
                              : "text-zinc-600 hover:bg-zinc-50 hover:text-[#6B4423]"
                          }`}
                        >
                          <span className="flex-1">{option}</span>
                          <div className="flex items-center gap-3">
                            {formData.name === option && <Check className="w-4 h-4" />}
                            {dbItem && onDeleteIngredient && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteIngredient(dbItem.id);
                                }}
                                className="p-1.5 bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition-all"
                                title="Hapus dari daftar"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Stok / Tambah Stok */}
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">
                {(!initialData && ingredients.some(i => i.name.toLowerCase() === formData.name.toLowerCase())) 
                  ? "Tambah Stok" 
                  : "Stok"}
              </label>
              <input
                required
                type="text"
                placeholder="0"
                value={formatNumber(formData.stock)}
                onChange={(e) => {
                  const raw = parseRawNumber(e.target.value);
                  const limited = limitValue(raw, MAX_LIMIT_STOCK);
                  setFormData({ ...formData, stock: limited });
                }}
                className="w-full bg-zinc-50 border border-zinc-100 px-6 py-4 rounded-2xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#6B4423]/10 focus:border-[#6B4423] transition-all"
              />
            </div>

            {/* Satuan */}
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Satuan</label>
              <select
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-100 px-6 py-4 rounded-2xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#6B4423]/10 focus:border-[#6B4423] transition-all appearance-none cursor-pointer"
              >
                <option value="kg">kilogram (kg)</option>
                <option value="gram">gram (g)</option>
                <option value="liter">liter (l)</option>
                <option value="ml">mililiter (ml)</option>
                <option value="pcs">pieces (pcs)</option>
                <option value="pack">pack</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Form Tambahan (Catatan) */}
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Catatan Tambahan</label>
              <input
                type="text"
                placeholder="Contoh: Belanja Pasar..."
                className="w-full bg-zinc-50 border border-zinc-100 px-6 py-4 rounded-2xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#6B4423]/10 focus:border-[#6B4423] transition-all"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-4 px-4 bg-zinc-50 text-zinc-500 rounded-2xl text-sm font-black hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 px-4 bg-[#6B4423] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#6B4423]/20 hover:bg-[#5D3822] hover:shadow-[#6B4423]/40 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{initialData ? "Simpan Perubahan" : "Tambah Bahan"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
