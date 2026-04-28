"use client";

import React from "react";
import { Package, Calendar, StickyNote } from "lucide-react";

interface ProductionLog {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit: string;
  production_date: string;
  notes: string;
}

interface ProductionTableProps {
  logs: ProductionLog[];
}

export default function ProductionTable({ logs }: ProductionTableProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse relative">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 sticky top-0 z-10">
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight">Produk</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-center">Jumlah Produksi</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight text-center">Tanggal & Waktu</th>
              <th className="px-6 py-5 text-sm font-bold text-zinc-900 tracking-tight">Catatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-zinc-400 font-bold italic">
                  Belum ada catatan produksi untuk periode ini.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-5 text-sm font-extrabold text-zinc-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#FCF1E8] rounded-lg flex items-center justify-center border border-[#6B4423]/10">
                        <Package className="w-4 h-4 text-[#6B4423]" />
                      </div>
                      <span>{log.product_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-black text-center text-[#6B4423]">
                    +{log.quantity.toLocaleString("id-ID")} <span className="text-[10px] text-zinc-400 uppercase ml-0.5">{log.unit}</span>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-zinc-500 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {new Date(log.production_date).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-zinc-400">
                    <div className="flex items-start gap-2">
                      <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span className="line-clamp-1">{log.notes || "-"}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200">
        <p className="text-xs font-bold text-zinc-400">
          Menampilkan {logs.length} catatan produksi terakhir
        </p>
      </div>
    </div>
  );
}
