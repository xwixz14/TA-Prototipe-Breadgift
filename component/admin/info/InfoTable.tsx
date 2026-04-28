"use client";

import React from "react";
import { Edit2, Trash2, Calendar, Tag, FileText } from "lucide-react";
import Image from "next/image";

interface InfoTableProps {
  articles: any[];
  onEdit: (article: any) => void;
  onDelete: (id: number) => void;
}

export default function InfoTable({ articles, onEdit, onDelete }: InfoTableProps) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-zinc-200">
        <div className="w-16 h-16 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mb-4">
          <FileText size={32} />
        </div>
        <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">Belum ada informasi</p>
        <p className="text-xs text-zinc-400 mt-1">Silakan tambah artikel baru untuk ditampilkan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Konten / Berita</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Kategori</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dilihat</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tanggal Buat</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-zinc-100 flex-shrink-0">
                      <Image 
                        src={article.image_url || "/assets/Logo.png"} 
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-black text-zinc-900 text-sm line-clamp-1">{article.title}</p>
                      <p className="text-xs text-zinc-400 font-bold line-clamp-1 max-w-[250px]">{article.content}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <Tag size={10} />
                    {article.category}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-zinc-500 font-bold text-xs uppercase tracking-tighter">
                    <span className="text-zinc-900 font-black">{article.views || 0}</span>
                    <span className="text-[10px] text-zinc-400">Dilihat</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-zinc-500 font-bold text-xs">
                    <Calendar size={14} className="text-zinc-400" />
                    {new Date(article.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-end gap-2 transition-all">
                    <button 
                      onClick={() => onEdit(article)}
                      className="p-2.5 bg-stone-50 text-[#6B4423] hover:text-white hover:bg-[#6B4423] rounded-xl border border-[#6B4423]/10 transition-all active:scale-90"
                      title="Edit Berita"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(article.id)}
                      className="p-2.5 bg-rose-50 text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl border border-rose-100 transition-all active:scale-90"
                      title="Hapus Berita"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
