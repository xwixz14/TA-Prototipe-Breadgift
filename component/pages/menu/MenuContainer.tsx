
"use client";

import React, { useState, useMemo, useRef } from "react";
import MenuProductCard from "./MenuProductCard";
import { Search, Filter, SlidersHorizontal, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Semua" || selectedCategory === "Terlaris" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (selectedCategory === "Terlaris") {
      filtered.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
    }

    return filtered;
  }, [products, searchQuery, selectedCategory]);

  const allCategories = ["Semua", "Terlaris", ...categories.map(c => c.name)];

  return (
    <div className="flex flex-col gap-12 relative">
      {/* Floating Glass Filter Bar */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-24 z-30 w-full"
      >
        <div className="glass-premium p-4 md:p-6 rounded-[2.5rem] border-white/20 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="w-full md:flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Cari roti favorite kamu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4.5 bg-white border border-stone-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-stone-800 placeholder:text-stone-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]"
              style={{ fontFamily: 'var(--font-outfit)' }}
            />
          </div>

          <div className="h-px md:h-12 w-full md:w-px bg-stone-200/50 mx-2"></div>

          {/* Desktop Category Pills Slider */}
          <div className="hidden md:flex flex-1 overflow-hidden relative">
            <div 
              ref={scrollRef}
              className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1"
            >
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${
                    selectedCategory === cat 
                      ? "bg-primary text-secondary-content shadow-lg shadow-primary/20 scale-105" 
                      : "bg-white/40 text-stone-400 hover:bg-white hover:text-stone-600 border border-stone-100"
                  }`}
                >
                  {cat === "Terlaris" && <Sparkles size={12} className="inline mr-2 -mt-1" />}
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Filter Toggle */}
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden w-full flex items-center justify-center gap-3 py-4.5 bg-primary text-white rounded-2xl border-2 border-white/20 font-black uppercase tracking-[0.2em] text-[13px] shadow-xl shadow-primary/20 active:scale-95 transition-all"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            <Filter size={18} strokeWidth={2.5} />
            Filter Kategori
          </button>
        </div>

        {/* Mobile Filter Dropdown */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white/90 backdrop-blur-xl border border-stone-100 rounded-[2rem] mt-4 overflow-hidden shadow-2xl"
            >
              <div className="p-6 grid grid-cols-2 gap-3">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                    className={`px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedCategory === cat 
                        ? "bg-primary text-secondary-content" 
                        : "bg-stone-50 text-stone-400 border border-stone-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Product Grid with Transitions */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <MenuProductCard 
                product={product} 
                isLoggedIn={!!user}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      <AnimatePresence>
        {filteredProducts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-40 flex flex-col items-center justify-center gap-8 glass-premium rounded-[4rem] text-center"
          >
             <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center border-2 border-dashed border-stone-200">
               <Search className="w-10 h-10 text-stone-200" />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-stone-400 tracking-tight">Roti Tidak Ditemukan</h3>
                <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Coba cari dengan kata kunci lain, bebs!</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
