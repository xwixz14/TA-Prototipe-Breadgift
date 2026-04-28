"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Package, Hash, MessageSquare, Plus, Trash2, Wheat, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber, parseRawNumber, MAX_LIMIT_STOCK, limitValue } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  unit: string;
}

interface Ingredient {
  id: number;
  name: string;
  unit: string;
  stock: number;
}

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  products: Product[];
  ingredients: Ingredient[];
}

export default function ProductionModal({ isOpen, onClose, onSubmit, products, ingredients }: ProductionModalProps) {
  const [formData, setFormData] = useState({
    product_id: "",
    quantity: "",
    notes: ""
  });
  
  const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ product_id: "", quantity: "", notes: "" });
      setSelectedMaterials([]);
    }
  }, [isOpen]);

  const addMaterial = () => {
    setSelectedMaterials([...selectedMaterials, { ingredient_id: "", quantity: "" }]);
  };

  const removeMaterial = (index: number) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: string, value: any) => {
    const newMats = [...selectedMaterials];
    newMats[index][field] = value;
    setSelectedMaterials(newMats);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || !formData.quantity) return;
    
    // Filter out empty materials
    const validMaterials = selectedMaterials.filter(m => m.ingredient_id && m.quantity > 0);

    setLoading(true);
    try {
      await onSubmit({
        product_id: parseInt(formData.product_id),
        quantity: parseInt(formData.quantity),
        notes: formData.notes,
        materials: validMaterials.map(m => ({
          ingredient_id: parseInt(m.ingredient_id),
          quantity: parseFloat(m.quantity)
        }))
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-zinc-100"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 flex justify-between items-center border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FCF1E8] rounded-2xl flex items-center justify-center border border-[#6B4423]/10">
                  <Package className="w-6 h-6 text-[#6B4423]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Catat Produksi</h2>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-1">Input Hasil Produksi & Bahan Baku</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-zinc-100 rounded-2xl transition-all">
                <X className="w-6 h-6 text-red-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col h-[70vh]">
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                
                {/* Product Info Section */}
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Pilih Produk Roti</label>
                    <div className="relative group">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#6B4423] transition-colors" />
                      <select
                        required
                        value={formData.product_id}
                        onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                        className="w-full bg-zinc-50 border-2 border-zinc-100 py-4 pl-12 pr-4 rounded-2xl focus:outline-none focus:border-[#6B4423]/20 text-sm font-black text-zinc-900 appearance-none transition-all cursor-pointer"
                      >
                        <option value="">Pilih Roti...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Jumlah Produksi</label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#6B4423] transition-colors" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 50"
                        value={formatNumber(formData.quantity)}
                        onChange={(e) => {
                          const raw = parseRawNumber(e.target.value);
                          const limited = limitValue(raw, MAX_LIMIT_STOCK);
                          setFormData({ ...formData, quantity: limited.toString() });
                        }}
                        className="w-full bg-zinc-50 border-2 border-zinc-100 py-4 pl-12 pr-4 rounded-2xl focus:outline-none focus:border-[#6B4423]/20 text-sm font-black text-zinc-900 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Materials Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#6B4423]">
                      <Wheat className="w-5 h-5" />
                      <h3 className="text-sm font-black uppercase tracking-widest">Bahan Baku yang Digunakan</h3>
                    </div>
                    <button
                      type="button"
                      onClick={addMaterial}
                      className="text-xs font-black text-[#6B4423] bg-[#FCF1E8] px-4 py-2 rounded-xl hover:bg-[#6B4423] hover:text-white transition-all flex items-center gap-2 border border-[#6B4423]/10"
                    >
                      <Plus className="w-3 h-3" /> Tambah Bahan
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedMaterials.length === 0 ? (
                      <div className="py-10 border-2 border-dashed border-zinc-100 rounded-[32px] flex flex-col items-center justify-center gap-2 text-zinc-300">
                         <Scale className="w-8 h-8 opacity-20" />
                         <p className="text-xs font-bold italic">Belum ada bahan yang dipilih</p>
                      </div>
                    ) : (
                      selectedMaterials.map((mat, index) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={index} 
                          className="flex items-end gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 group hover:border-[#6B4423]/20 transition-all"
                        >
                          <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Bahan Baku</label>
                            <select
                              required
                              value={mat.ingredient_id}
                              onChange={(e) => {
                                const id = e.target.value;
                                const ing = ingredients.find(i => i.id === parseInt(id));
                                const newMats = [...selectedMaterials];
                                newMats[index].ingredient_id = id;
                                if (ing) newMats[index].unit = ing.unit;
                                setSelectedMaterials(newMats);
                              }}
                              className="w-full bg-white border border-zinc-200 py-3 px-4 rounded-xl text-sm font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20 appearance-none cursor-pointer"
                            >
                              <option value="">Pilih...</option>
                              {ingredients.map((ing) => (
                                <option key={ing.id} value={ing.id}>{ing.name} (Stok: {ing.stock} {ing.unit})</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="w-24 space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Jumlah</label>
                            <input
                              type="text"
                              required
                              placeholder="0"
                              value={mat.quantity}
                              onChange={(e) => updateMaterial(index, "quantity", e.target.value)}
                              className="w-full bg-white border border-zinc-200 py-3 px-4 rounded-xl text-sm font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20"
                            />
                          </div>

                          <div className="w-32 space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Satuan</label>
                            <select
                              required
                              value={mat.unit || ""}
                              onChange={(e) => updateMaterial(index, "unit", e.target.value)}
                              className="w-full bg-white border border-zinc-200 py-3 px-4 rounded-xl text-sm font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20 appearance-none cursor-pointer"
                            >
                              <option value="kg">kilogram (kg)</option>
                              <option value="gram">gram (g)</option>
                              <option value="liter">liter (l)</option>
                              <option value="ml">mililiter (ml)</option>
                              <option value="pcs">pieces (pcs)</option>
                              <option value="pack">pack</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeMaterial(index)}
                            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))

                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Catatan Tambahan (Opsional)</label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-zinc-400 group-focus-within:text-[#6B4423] transition-colors" />
                    <textarea
                      placeholder="Tulis catatan di sini..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-zinc-50 border-2 border-zinc-100 py-4 pl-12 pr-4 rounded-2xl focus:outline-none focus:border-[#6B4423]/20 text-sm font-black text-zinc-900 transition-all h-24 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-[24px] font-black text-zinc-400 hover:bg-zinc-100 transition-all uppercase tracking-widest text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-[#6B4423] text-white py-4 rounded-[24px] font-black flex items-center justify-center gap-3 shadow-lg shadow-[#6B4423]/20 hover:bg-[#5D3822] transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Menyimpan..." : "Simpan Produksi"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
