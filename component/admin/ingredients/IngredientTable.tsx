"use client";

import React from "react";
import { Edit2, Trash2, AlertTriangle } from "lucide-react";

interface Ingredient {
  id: number;
  name: string;
  stock: number;
  unit: string;
  min_stock: number;
  entry_date?: string;
  last_used_date?: string;
}

interface IngredientTableProps {
  ingredients: Ingredient[];
  selectedId: number | null;
  onSelect: (ingredient: Ingredient) => void;
  onDelete: (id: number) => void;
}

export default function IngredientTable({ ingredients, selectedId, onSelect, onDelete }: IngredientTableProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse relative">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 sticky top-0 z-10">
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight">Nama Bahan</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-center">Tanggal Masuk</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-center">Tanggal Keluar</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-center">Stok Saat Ini</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-center">Satuan</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-center">Ambangan Min.</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-center">Status Stok</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {ingredients.map((item) => {
              const isOut = Number(item.stock) <= 0;
              const isLow = !isOut && Number(item.stock) <= Number(item.min_stock);
              return (
                <tr 
                  key={item.id} 
                  onClick={() => onSelect(item)}
                  className={`cursor-pointer transition-colors group ${
                    selectedId === item.id 
                      ? 'bg-[#6B4423]/10 border-l-4 border-l-[#6B4423]' 
                      : isOut ? 'bg-red-50/30' : isLow ? 'bg-amber-50/30' : 'hover:bg-zinc-50/50'
                  }`}
                >
                  <td className="px-6 py-5 text-sm font-extrabold text-zinc-900">
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      {isOut ? (
                        <span className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-0.5 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> STOK HABIS!
                        </span>
                      ) : isLow ? (
                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3" /> Stok Hampir Habis!
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-zinc-500 text-center whitespace-nowrap">
                    {item.entry_date ? new Date(item.entry_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    }) : "-"}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-zinc-500 text-center whitespace-nowrap italic">
                    {item.last_used_date ? new Date(item.last_used_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    }) : "-"}
                  </td>
                  <td className={`px-6 py-5 text-sm font-black text-center ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-zinc-600'}`}>
                    {Number(item.stock).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-zinc-500 text-center uppercase tracking-wider">{item.unit}</td>
                  <td className="px-6 py-5 text-sm font-bold text-zinc-400 text-center uppercase tracking-wider">{item.min_stock}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      isOut
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : isLow 
                        ? 'bg-amber-50 text-amber-600 border-amber-200' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {isOut ? 'HABIS TOTAL' : isLow ? 'PERLU BELANJA' : 'Aman'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        title="Hapus Bahan"
                        className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-90 border border-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200">
        <p className="text-xs font-bold text-zinc-400">
          Menampilkan {ingredients.length} jenis bahan baku
        </p>
      </div>
    </div>
  );
}
