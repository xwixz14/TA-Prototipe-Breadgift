import React from "react";
import MenuContainer from "@/component/pages/menu/MenuContainer";
import { getProducts, getCategories, getMe } from "@/lib/actions";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Menu Roti Segar - BreadGift",
  description: "Daftar roti kami yang baru dipanggang hari ini.",
};

export default async function MenuPage() {
  const products = await getProducts("Aktif");
  const categories = await getCategories();
  const user = await getMe();

  return (
    <main className="relative min-h-screen animated-mesh pb-24 overflow-hidden">
      {/* Premium Hero Section */}
      <section className="relative pt-40 pb-20 px-6 md:px-10 flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] animate-fade-in">
            <Sparkles size={14} className="animate-pulse" />
            Freshly Baked Today
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl md:text-[8rem] font-black text-stone-900 tracking-tighter leading-[0.9]" style={{ fontFamily: 'var(--font-outfit)' }}>
              The <span className="text-primary italic">Menu</span> <br />
              Masterpiece
            </h1>
            <p className="text-primary/60 font-black uppercase tracking-[0.3em] text-[9px] md:text-xs">
              Jelajahi kelezatan roti artisan dari dapur BreadGift
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 relative z-10">
        <MenuContainer products={products} categories={categories} user={user} />
      </div>
    </main>
  );
}
