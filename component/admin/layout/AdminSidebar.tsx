"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  Package, 
  History, 
  BarChart3, 
  Wallet, 
  LogOut,
  Store,
  Users,
  TrendingUp,
  Wheat,
  X,
  Newspaper,
  ChefHat
} from "lucide-react";

import { logoutUser } from "@/lib/actions";
import { useCart } from "@/context/CartContext";

const SECURE_QUERY = "gs_lcrp=EgZjaHJvbWUqBwgAEAAYjwIyBwgAEAAYjwIyDAgBEC4YJxiABBiKBTIGCAIQRRg7MgYIAxBFGDsyDQgEEAAYgwEYsQMYgAQyDQgFEAAYgwEYsQMYgAQyBggGEEUYPTIGCAcQBRhA0gEHOTA2ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8";

const menuItems = [
  { name: "Kasir", icon: ShoppingCart, href: `/admin/dashboard?${SECURE_QUERY}` },
  { name: "Riwayat Transaksi", icon: History, href: `/admin/history?${SECURE_QUERY}` },
  { name: "Stok Roti", icon: Package, href: `/admin/products?${SECURE_QUERY}` },
  { name: "Produksi Roti", icon: ChefHat, href: `/admin/production?${SECURE_QUERY}` },
  { name: "Stok Bahan", icon: Wheat, href: `/admin/ingredients?${SECURE_QUERY}` },
  { name: "Pendapatan", icon: TrendingUp, href: `/admin/revenue?${SECURE_QUERY}` },
  { name: "Pengeluaran", icon: Wallet, href: `/admin/expenses?${SECURE_QUERY}` },
  { name: "Laba Rugi", icon: BarChart3, href: `/admin/profit-loss?${SECURE_QUERY}` },
  { name: "Kelola Info", icon: Newspaper, href: `/admin/info?${SECURE_QUERY}` },
];


interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { refreshCart, clearCart } = useCart();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      clearCart();
      
      // Use window.location.href for a clean break from the admin dashboard
      // this prevents any background re-renders of admin layouts after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
    {/* Mobile Backdrop */}
    {isOpen && (
      <div 
        className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[110] lg:hidden"
        onClick={onClose}
      />
    )}

    <aside className={`fixed inset-y-0 left-0 w-64 h-full bg-white border-r border-zinc-100 flex flex-col justify-between py-6 z-[120] transition-transform duration-300 lg:relative lg:translate-x-0 ${
      isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
    }`}>
      <div className="px-6 flex flex-col gap-10">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="bg-[#6B4423] p-2.5 rounded-xl shadow-lg">
              <Store className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 leading-tight">Pos Sistem</h1>
              <p className="text-xs text-zinc-500">Sistem kasir</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-xl lg:hidden"
          >
            <X className="w-5 h-5 text-red-500" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-bold ${
                  isActive 
                    ? "bg-[#FCF1E8] text-[#6B4423]" 
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="px-6">
        <button 
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-all font-medium group"
        >
          <div className="bg-red-50 p-2 rounded-lg group-hover:bg-red-100 transition-colors">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-sm font-black">Keluar</span>
        </button>
      </div>
    </aside>

    {/* Custom Logout Modal */}
    {showLogoutModal && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-[340px] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="p-8 pb-6 flex flex-col items-center text-center gap-5">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-1 ring-8 ring-red-50/50">
              <LogOut className="w-8 h-8 ml-1" />
            </div>
            <div>
              <h3 className="text-xl font-black text-zinc-900 tracking-tight">Konfirmasi Keluar</h3>
              <p className="text-sm font-bold text-zinc-400 mt-2 leading-relaxed px-2">
                Apakah Anda yakin ingin keluar dari sesi administrator?
              </p>
            </div>
          </div>
          <div className="p-4 px-6 pb-6 flex gap-3">
            <button 
              onClick={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
              className="flex-1 py-4 px-4 bg-zinc-100 text-zinc-500 rounded-2xl text-sm font-black hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex-1 py-4 px-4 bg-red-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingOut ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   <span>Keluar...</span>
                 </>
              ) : (
                "Ya, Keluar"
              )}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

