"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe, logoutUser } from "@/lib/actions";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, setIsCartOpen, refreshCart, user } = useCart();

  const handleLogout = async () => {
    await logoutUser();
    await refreshCart(); // Reset keranjang dan user state di context
    router.push("/");
  };

  // Hide Navbar on Login, Register or Admin pages
  if (pathname === "/login" || pathname === "/register" || pathname?.startsWith("/admin")) return null;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Catalog", href: "/catalog" },
    { name: "Menu", href: "/menu" },
    { name: "Contact", href: "/contact" }
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-12 py-4 bg-white/80 backdrop-blur-md border-b border-zinc-100 shadow-sm transition-all duration-300">
      {/* 1. Logo Section (Left Column) */}
      <div className="flex-1 flex justify-start">
        <Link href="/" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
          <Image
            src="/assets/Logo.png"
            alt="BreadGift Logo"
            width={85}
            height={85}
            className="object-contain drop-shadow-sm"
          />
        </Link>
      </div>

      {/* 2. Navigation Section (Center Column) - Perfectly centered links */}
      <div className="flex items-center gap-12">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`text-[17px] font-extrabold tracking-tight transition-all duration-300 relative group py-2 ${
              pathname === link.href ? "text-[#6B4423]" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {link.name}
            {/* Elegant Underline Indicator */}
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#6B4423] rounded-full transition-all duration-300 transform origin-left ${
              pathname === link.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 opacity-50"
            }`} />
          </Link>
        ))}
      </div>

      {/* 3. Auth Section (Right Column) */}
      <div className="flex-1 flex justify-end items-center gap-6">
        {/* Cart Icon - Only visible for logged-in users */}
        {user && (
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 bg-zinc-50 rounded-2xl border border-zinc-100 hover:bg-[#FCF1E8]/20 hover:border-[#6B4423]/20 transition-all group"
          >
            <ShoppingCart className="w-5 h-5 text-zinc-400 group-hover:text-[#6B4423] transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#6B4423] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm transition-all animate-in zoom-in-50 duration-300">
                {totalItems}
              </span>
            )}
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-8 bg-zinc-50 pl-6 pr-1.5 py-1.5 rounded-2xl border border-zinc-100">
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-[#6B4423] uppercase tracking-widest leading-none">Status: {user.role === 'admin' ? 'Admin' : 'Pelanggan'}</span>
               <span className="text-[13px] font-black text-zinc-900 mt-1 line-clamp-1 max-w-[120px]">{user.name}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 bg-white text-[11px] font-black text-red-500 hover:bg-red-50 rounded-xl shadow-sm border border-zinc-200 transition-all active:scale-95"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-[14px] font-black text-zinc-500 hover:text-zinc-900 transition-all"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="text-[14px] font-black bg-[#6B4423] text-white px-7 py-3 rounded-xl shadow-lg shadow-[#6B4423]/20 hover:bg-[#5D3822] transition-all active:scale-95"
            >
              Daftar Gratis
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
