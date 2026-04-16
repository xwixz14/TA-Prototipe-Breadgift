"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image_url: string;
}

interface MenuProductCardProps {
  product: Product;
  isLoggedIn: boolean;
}

export default function MenuProductCard({ product, isLoggedIn }: MenuProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const router = useRouter();
  const { addToCart } = useCart();

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    
    if (!isLoggedIn) {
      router.push(`/login?redirect=/menu`);
    } else {
      addToCart(product);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -12 }}
      className={`group relative glass-premium rounded-[3rem] overflow-hidden p-3 transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] flex flex-col bg-white/40 border-white/50 ${
        isOutOfStock ? "grayscale opacity-80" : ""
      }`}
    >
      {/* Product Image Container */}
      <div className={`relative w-full aspect-square rounded-[2.5rem] overflow-hidden bg-stone-50/50 shadow-inner group-hover:bg-stone-100/50 transition-colors duration-500 ${
        isOutOfStock ? "brightness-[0.4] grayscale" : ""
      }`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <Image
          src={product.image_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800"}
          alt={product.name}
          fill
          className="object-contain p-8 transform group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700 ease-out"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          {product.stock < 10 && !isOutOfStock && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-amber-500/90 backdrop-blur-md text-white text-[8px] font-black py-1.5 px-3 rounded-full uppercase tracking-[0.2em] shadow-lg flex items-center gap-1.5"
            >
              <AlertCircle size={10} />
              Limited Stock
            </motion.div>
          )}

          {isOutOfStock && (
            <div className="bg-red-500/90 backdrop-blur-md text-white text-[8px] font-black py-1.5 px-3 rounded-full uppercase tracking-[0.2em] shadow-lg flex items-center gap-1.5">
              <AlertCircle size={10} />
              Out of Stock
            </div>
          )}

          {product.stock >= 50 && (
            <div className="bg-primary/90 backdrop-blur-md text-secondary-content text-[8px] font-black py-1.5 px-3 rounded-full uppercase tracking-[0.2em] shadow-lg flex items-center gap-1.5">
              <Sparkles size={10} />
              Staff Pick
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6 flex flex-col flex-1 gap-5">
        <div className="space-y-1">
          <div className="flex justify-between items-center gap-2">
            <h3 className="text-xl font-black text-stone-800 tracking-tighter leading-none group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </div>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest italic opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             Ready to bake happiness.
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-stone-900 tracking-tighter flex items-start gap-1 leading-none">
              <span className="text-[10px] mt-1 font-bold text-primary">Rp</span>
              {product.price.toLocaleString("id-ID")}
            </span>
            <div className="mt-2.5 flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-xl w-fit border border-stone-200/50">
              <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
              <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest leading-none">
                Sisa Stok: <span className="text-stone-900">{product.stock}</span>
              </span>
            </div>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOrderClick}
            disabled={isOutOfStock}
            className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all shadow-xl active:shadow-inner ${
              isOutOfStock 
                ? "bg-stone-100 text-stone-300 pointer-events-none shadow-none" 
                : "bg-primary text-secondary-content hover:shadow-primary/30 rotate-0 hover:-rotate-12"
            }`}
          >
            <ShoppingCart size={24} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
