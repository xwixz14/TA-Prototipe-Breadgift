"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Wheat, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getIngredients, getProductRecipe, updateProductRecipe } from "@/lib/actions";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: { id: number; name: string } | null;
}

export default function RecipeModal({ isOpen, onClose, product }: RecipeModalProps) {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [recipeItems, setRecipeItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      fetchData();
    }
  }, [isOpen, product]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allIng, currentRecipe] = await Promise.all([
        getIngredients(),
        getProductRecipe(product!.id)
      ]);
      setIngredients(allIng);
      setRecipeItems(currentRecipe.map((item: any) => ({
        ingredient_id: item.ingredient_id,
        quantity: item.quantity
      })));
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setRecipeItems([...recipeItems, { ingredient_id: "", quantity: 0 }]);
  };

  const removeItem = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...recipeItems];
    newItems[index][field] = value;
    setRecipeItems(newItems);
  };

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const validItems = recipeItems.filter(item => item.ingredient_id && item.quantity > 0);
      const res = await updateProductRecipe(product.id, validItems);
      if (res.success) {
        onClose();
      } else {
        alert(res.error);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
            className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-zinc-100"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 flex justify-between items-center border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FCF1E8] rounded-2xl flex items-center justify-center border border-[#6B4423]/10">
                  <Scale className="w-6 h-6 text-[#6B4423]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight text-wrap">Atur Resep: {product?.name}</h2>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-1 italic">Tentukan bahan baku per 1 unit roti</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-zinc-100 rounded-2xl transition-all">
                <X className="w-6 h-6 text-red-500" />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="py-20 text-center text-zinc-400 font-bold animate-pulse">Memuat data resep...</div>
              ) : (
                <div className="space-y-4">
                  {recipeItems.map((item, index) => (
                    <div key={index} className="flex items-end gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 group transition-all hover:border-[#6B4423]/20">
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Bahan Baku</label>
                        <select
                          value={item.ingredient_id}
                          onChange={(e) => updateItem(index, "ingredient_id", parseInt(e.target.value))}
                          className="w-full bg-white border border-zinc-200 py-3 px-4 rounded-xl text-sm font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20 appearance-none cursor-pointer"
                        >
                          <option value="">Pilih Bahan...</option>
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32 space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Jumlah</label>
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0"
                          value={item.quantity === 0 ? "" : item.quantity}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                            updateItem(index, "quantity", isNaN(val) ? 0 : val);
                          }}
                          className="w-full bg-white border border-zinc-200 py-3 px-4 rounded-xl text-sm font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#6B4423]/20"
                        />
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-90 border border-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addItem}
                    className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-2xl flex items-center justify-center gap-2 text-zinc-400 hover:text-[#6B4423] hover:border-[#6B4423]/40 hover:bg-[#FCF1E8]/20 transition-all font-bold text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Bahan ke Resep
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-[24px] font-black text-zinc-400 hover:bg-zinc-100 transition-all uppercase tracking-widest text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="flex-[2] bg-[#6B4423] text-white py-4 rounded-[24px] font-black flex items-center justify-center gap-3 shadow-lg shadow-[#6B4423]/20 hover:bg-[#5D3822] transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? "Menyimpan..." : "Simpan Resep"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
