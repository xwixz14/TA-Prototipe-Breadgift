"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe, logoutUser } from "@/lib/actions";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, setIsCartOpen, refreshCart, clearCart, user } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    clearCart(); // Bersihkan keranjang saat logout agar tidak terbawa ke sesi berikutnya
    setIsCartOpen(false); // Pastikan drawer tertutup
    await refreshCart(); // Reset user state di context
    setIsMenuOpen(false);
    router.push("/");
  };

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Hide Navbar on Login, Register or Admin pages
  if (pathname === "/login" || pathname === "/register" || pathname?.startsWith("/admin")) return null;

  const SECURE_QUERY = "gs_lcrp=EgZjaHJvbWUqBwgAEAAYjwIyBwgAEAAYjwIyDAgBEC4YJxiABBiKBTIGCAIQRRg7MgYIAxBFGDsyDQgEEAAYgwEYsQMYgAQyDQgFEAAYgwEYsQMYgAQyBggGEEUYPTIGCAcQBRhA0gEHOTA2ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8";

  const navLinks = [
    { name: "Home", href: `/?${SECURE_QUERY}` },
    { name: "About", href: `/about?${SECURE_QUERY}` },

    { name: "Menu", href: `/menu?${SECURE_QUERY}` },
    { name: "Informasi", href: `/info?${SECURE_QUERY}` },
    { name: "Contact", href: `/contact?${SECURE_QUERY}` }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-6 md:px-12 py-4 bg-white/90 backdrop-blur-md border-b border-zinc-100 shadow-sm transition-all duration-300">
        {/* 1. Logo Section (Left Column) */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
            <Image
              src="/assets/Logo.png"
              alt="BreadGift Logo"
              width={65}
              height={65}
              className="object-contain drop-shadow-sm md:w-[85px] md:h-[85px]"
            />
          </Link>
        </div>

        {/* 2. Navigation Section (Center Column) - Desktop Only */}
        <div className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-[17px] font-extrabold tracking-tight transition-all duration-300 relative group py-2 ${pathname === link.href ? "text-primary" : "text-stone-500 hover:text-primary"
                }`}
            >
              {link.name}
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#6B4423] rounded-full transition-all duration-300 transform origin-left ${pathname === link.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 opacity-50"
                }`} />
            </Link>
          ))}
        </div>

        {/* 3. Auth & Controls Section (Right Column) */}
        <div className="flex-1 flex justify-end items-center gap-3 md:gap-6">
          {/* Cart Icon - Always visible if enough items or logged in (HIDDEN FOR ADMIN) */}
          {(user || totalItems > 0) && user?.role !== 'admin' && (
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Buka keranjang belanja (${totalItems} item)`}
              className="relative p-2.5 md:p-3 bg-zinc-50 rounded-2xl border border-zinc-100 hover:bg-[#FCF1E8]/20 hover:border-[#6B4423]/20 transition-all group"
            >
              <ShoppingCart className="w-5 h-5 text-zinc-400 group-hover:text-[#6B4423] transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 bg-[#6B4423] text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          )}

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center gap-8 bg-zinc-50 pl-6 pr-1.5 py-1.5 rounded-2xl border border-zinc-100">
                <div className="flex flex-col items-end text-right">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Status: {user.role === 'admin' ? 'Admin' : 'Pelanggan'}</span>
                  <span className="text-[13px] font-black text-primary mt-1 line-clamp-1 max-w-[120px]">{user.name}</span>
                </div>
                {user.role === 'admin' && (
                  <Link
                    href={`/admin/dashboard?${SECURE_QUERY}`}
                    className="px-4 py-2 bg-[#6B4423] text-white text-[11px] font-bold rounded-xl hover:bg-[#5D3822] transition-all"
                  >
                    Ke Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-white text-[11px] font-black text-red-500 hover:bg-red-50 rounded-xl shadow-sm border border-stone-200 transition-all active:scale-95"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-[14px] font-black text-zinc-500 hover:text-zinc-900 transition-all">Login</Link>
                <Link href="/register" className="text-[14px] font-black bg-[#6B4423] text-white px-7 py-3 rounded-xl shadow-lg border-2 border-white/20 hover:bg-[#5D3822] transition-all active:scale-95">Daftar</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
            className="p-2.5 bg-primary text-white rounded-2xl md:hidden shadow-lg shadow-primary/20 transition-all active:scale-90"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[90] bg-white transition-all duration-500 ease-in-out md:hidden ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col h-full pt-20 px-10 pb-12">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em] mb-10">Navigasi Menu</p>
          <div className="flex flex-col gap-6 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-3xl font-bold tracking-tight transition-all duration-300 flex items-center gap-4 ${pathname === link.href ? "text-primary translate-x-2" : "text-stone-600 hover:text-primary"
                  }`}
                style={{ 
                  fontFamily: "var(--font-outfit), sans-serif",
                  WebkitTextStroke: "0px",
                  textShadow: "none"
                }}
              >
                {pathname === link.href && (
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                )}
                {link.name}
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-10 border-t border-zinc-100">
            {user ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#6B4423] uppercase tracking-widest leading-none mb-1">{user.role === 'admin' ? 'Administrator' : 'Pelanggan Setia'}</p>
                    <p className="text-xl font-black text-zinc-900">{user.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-5 bg-red-50 text-red-600 rounded-[24px] text-lg font-black transition-all active:scale-95 hover:bg-red-100"
                >
                  Logout Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link href="/login" className="py-5 bg-zinc-50 text-zinc-900 rounded-[24px] text-center text-lg font-black hover:bg-zinc-100 transition-colors uppercase tracking-widest">Login</Link>
                <Link href="/register" className="py-5 bg-[#6B4423] text-white rounded-[24px] text-center text-lg font-black shadow-xl shadow-[#6B4423]/20 hover:bg-[#54351B] transition-all uppercase tracking-widest">Daftar</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
