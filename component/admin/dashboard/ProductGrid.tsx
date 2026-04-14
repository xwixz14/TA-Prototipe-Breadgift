"use client";

import React from "react";
import ProductCard from "./ProductCard";
import { Search } from "lucide-react";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  min_stock: number;
  unit: string;
  status: "Aktif" | "Nonaktif";
  image_url: string;
}

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function ProductGrid({ 
  products, 
  onAddToCart,
  searchQuery,
  setSearchQuery
}: ProductGridProps) {
  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Cari Produk - Styled to match mockup */}
      <div className="mb-8 pr-6">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#6B4423] transition-colors" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 py-4.5 pl-14 pr-6 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-[#6B4423]/10 focus:border-[#6B4423]/40 transition-all text-sm font-black text-zinc-900 placeholder:text-zinc-300 shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              price={product.price}
              stock={product.stock}
              image={product.image_url}
              onAdd={() => onAddToCart(product)}
            />
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-400 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
             <p className="text-sm font-bold tracking-tight">Tidak ada produk ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
