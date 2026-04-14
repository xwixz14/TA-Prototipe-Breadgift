"use client";

import React from "react";
import { Edit2, Trash2 } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  min_stock: number;
  status: "Aktif" | "Nonaktif";
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: string) => void;
}

export default function ProductTable({ products, onEdit, onDelete, onToggleStatus }: ProductTableProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse relative">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 sticky top-0 z-10">
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight">Nama barang</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight">Kategori</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-center">Satuan</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-right">Harga jual</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-center">Stok</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-center">Min. stok</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-center">Status</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((product) => (
              <tr key={product.id} className={`hover:bg-zinc-50/50 transition-colors group ${product.status === 'Nonaktif' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                <td className="px-6 py-5 text-sm font-extrabold text-zinc-900">{product.name}</td>
                <td className="px-6 py-5 text-sm font-bold text-zinc-500">{product.category}</td>
                <td className="px-6 py-5 text-sm font-bold text-zinc-500 text-center">{product.unit}</td>
                <td className="px-6 py-5 text-sm font-black text-[#6B4423] text-right">
                  Rp {product.price.toLocaleString("id-ID")}
                </td>
                <td className={`px-6 py-5 text-sm font-bold text-center ${product.stock <= product.min_stock ? 'text-red-500' : 'text-zinc-500'}`}>
                  {product.stock}
                </td>
                <td className="px-6 py-5 text-sm font-bold text-zinc-400 text-center">{product.min_stock}</td>
                <td className="px-6 py-5 text-center">
                  <button
                    onClick={() => onToggleStatus(product.id, product.status)}
                    title={`Klik untuk ${product.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}`}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                      product.status === "Aktif" 
                        ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100" 
                        : "bg-zinc-100 text-zinc-400 border border-zinc-200 hover:bg-zinc-200"
                    }`}
                  >
                    {product.status}
                  </button>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-3 transition-opacity">
                    <button 
                      onClick={() => onEdit(product)}
                      title="Ubah Produk"
                      className="p-2.5 bg-[#6B4423]/5 text-[#6B4423] hover:bg-[#6B4423] hover:text-white rounded-xl transition-all active:scale-90 border border-[#6B4423]/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(product.id)}
                      title="Hapus Produk"
                      className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-90 border border-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200">
        <p className="text-xs font-bold text-zinc-400">
          Menampilkan 1 - {products.length} dari {products.length} data
        </p>
      </div>
    </div>
  );
}
