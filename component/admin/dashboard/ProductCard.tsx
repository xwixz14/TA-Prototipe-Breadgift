"use client";

import React from "react";
import Image from "next/image";
import { Plus } from "lucide-react";

interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  onAdd: () => void;
}

export default function ProductCard({ 
  id, 
  name, 
  category, 
  price, 
  stock, 
  image, 
  onAdd 
}: ProductCardProps) {
  const isOutOfStock = stock <= 0;

  return (
    <div 
      className={`group bg-white border border-zinc-100 rounded-3xl overflow-hidden p-3 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer relative ${
        isOutOfStock ? "opacity-75 blur-[0.5px]" : ""
      }`}
      onClick={!isOutOfStock ? onAdd : undefined}
    >
      {/* Category Badge - Now on top right with a solid look */}
      <div className="absolute top-4 right-4 z-10">
        <span className="bg-[#6B4423]/80 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
          {category}
        </span>
      </div>

      {/* Product Image */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-50 shadow-inner group-hover:shadow-none transition-shadow">
        <Image
          src={image || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800"}
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase tracking-widest bg-red-600 px-3 py-1 rounded-lg shadow-lg">Habis</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-4 flex flex-col gap-1 px-1">
        <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight leading-tight line-clamp-1">{name}</h3>
        <div className="flex justify-between items-end mt-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-black text-[#6B4423]">Rp {price.toLocaleString("id-ID")}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${stock < 10 ? "text-red-500" : "text-zinc-400"}`}>
              Stok: <span className="text-zinc-800">{stock}</span>
            </span>
          </div>
          
          {/* Add Button - Stronger, brown square look */}
          <button 
            disabled={isOutOfStock}
            className="p-3.5 bg-[#6B4423] text-white rounded-2xl shadow-lg shadow-[#6B4423]/20 hover:bg-[#5D3822] hover:shadow-[#6B4423]/40 transition-all active:scale-90 disabled:bg-zinc-300 disabled:shadow-none ml-2"
          >
            <Plus className="w-5 h-5 stroke-[3px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
