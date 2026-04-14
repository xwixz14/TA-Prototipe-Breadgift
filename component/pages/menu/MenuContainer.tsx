
"use client";

import React, { useState, useMemo } from "react";
import MenuProductCard from "./MenuProductCard";
import { Search, Filter } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  total_sold?: number;
}

interface MenuContainerProps {
  products: Product[];
  categories: any[];
  user: any;
}

export default function MenuContainer({ products, categories, user }: MenuContainerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Semua" || selectedCategory === "Paling Banyak Dibeli" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (selectedCategory === "Paling Banyak Dibeli") {
      filtered.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
    }

    return filtered;
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col gap-10">
      {/* Search & Filter Bar - Styled like the mockup */}
      <div className="flex gap-4">
        <div className="flex-1 relative group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400 group-focus-within:text-[#6B4423] transition-colors" />
          <input
            type="text"
            placeholder="Pilih roti yang ingin dicari"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 py-6 pl-16 pr-8 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-[#6B4423]/10 focus:border-[#6B4423] transition-all text-lg font-black text-zinc-900 placeholder:text-zinc-400 shadow-sm"
          />
        </div>
        
        {/* Clickable Filter Toggle */}
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`h-full px-6 border rounded-[20px] transition-all flex items-center justify-center shadow-sm ${
              isFilterOpen || (selectedCategory !== "Semua" && selectedCategory !== "Paling Banyak Dibeli") ? 'border-[#6B4423]/40 bg-[#FCF1E8]/50' : 'bg-white border-zinc-200 hover:border-[#6B4423]/40 hover:bg-[#FCF1E8]/20'
            }`}
          >
            <Filter className={`w-6 h-6 ${isFilterOpen || (selectedCategory !== "Semua" && selectedCategory !== "Paling Banyak Dibeli") ? 'text-[#6B4423]' : 'text-zinc-600'}`} />
          </button>
          
          {/* Clickable Category Selector */}
          {isFilterOpen && (
            <>
              {/* Invisible overlay to catch outside clicks */}
              <div 
                className="fixed inset-0 z-[30]" 
                onClick={() => setIsFilterOpen(false)} 
              />
              
              <div className="absolute right-0 top-full mt-4 bg-white border border-zinc-100 shadow-2xl rounded-3xl p-4 min-w-[220px] z-[40] animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest p-4 pb-2">Filter & Urutan</p>
                <button 
                  onClick={() => { setSelectedCategory("Semua"); setIsFilterOpen(false); }}
                  className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-bold transition-all ${selectedCategory === "Semua" ? 'bg-[#FCF1E8] text-[#6B4423]' : 'text-zinc-600 hover:bg-zinc-50'}`}
                >
                  Semua Produk
                </button>
                <button 
                  onClick={() => { setSelectedCategory("Paling Banyak Dibeli"); setIsFilterOpen(false); }}
                  className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-bold transition-all ${selectedCategory === "Paling Banyak Dibeli" ? 'bg-[#FCF1E8] text-[#6B4423]' : 'text-zinc-600 hover:bg-zinc-50'}`}
                >
                  Paling Banyak Dibeli
                </button>
                
                <div className="h-px bg-zinc-100 my-2 mx-4"></div>
                
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest p-4 pt-2 pb-2">Kategori</p>
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.name); setIsFilterOpen(false); }}
                    className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-bold transition-all ${selectedCategory === cat.name ? 'bg-[#FCF1E8] text-[#6B4423]' : 'text-zinc-600 hover:bg-zinc-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {filteredProducts.map((product) => (
          <MenuProductCard 
            key={product.id} 
            product={product} 
            isLoggedIn={!!user}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="py-32 flex flex-col items-center justify-center gap-6 bg-zinc-50 rounded-[48px] border-2 border-dashed border-zinc-200">
          <p className="text-xl font-black text-zinc-300 tracking-tight">Tidak ada roti yang sesuai dengan pencarian Anda.</p>
        </div>
      )}
    </div>
  );
}
