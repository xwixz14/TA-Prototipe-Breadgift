
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

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
    <div 
      onClick={handleOrderClick}
      className={`group bg-white border border-zinc-200 rounded-[24px] overflow-hidden p-0 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer relative ${
      isOutOfStock ? "opacity-75 blur-[0.5px]" : ""
    }`}>
      {/* Product Image - Large like in mockup */}
      <div className="relative w-full aspect-[4/3] bg-zinc-50 border-b border-zinc-100 p-6">
        <div className="relative w-full h-full">
           <Image
            src={product.image_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800"}
            alt={product.name}
            fill
            className="object-contain transform group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase tracking-widest bg-red-600 px-3 py-1 rounded-lg">Habis</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-black text-zinc-900 tracking-tight leading-tight line-clamp-1">{product.name}</h3>
          <button 
            onClick={handleOrderClick}
            className="bg-[#6B4423] text-white text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider hover:bg-[#5D3822] transition-colors shadow-sm flex items-center gap-2 group-hover:scale-105 transition-all"
          >
            <ShoppingCart className="w-3 h-3" />
            Tambah
          </button>
        </div>
        
        <div className="flex justify-between items-end mt-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Harga Satuan</span>
            <span className="text-lg font-black text-[#5A351D]">Rp. {product.price.toLocaleString("id-ID")}</span>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${product.stock < 10 ? "text-red-600" : "text-zinc-500"}`}>
            Stok : {product.stock}
          </span>
        </div>
      </div>
    </div>
  );
}
