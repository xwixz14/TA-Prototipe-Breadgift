import React from "react";
import MenuContainer from "@/component/pages/menu/MenuContainer";
import { getProducts, getCategories, getMe } from "@/lib/actions";

export const metadata = {
  title: "Menu Roti Segar - BreadGift",
  description: "Daftar roti kami yang baru dipanggang hari ini.",
};

export default async function MenuPage() {
  const products = await getProducts("Aktif");
  const categories = await getCategories();
  const user = await getMe();

  return (
    <main className="relative pt-32 pb-24 min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-10">
        <div className="flex flex-col mb-16">
          <span className="text-sm font-black text-[#6B4423] uppercase tracking-widest mb-4 border-l-4 border-[#6B4423] pl-4">Koleksi Kami</span>
          <h1 className="text-5xl font-black text-zinc-900 tracking-tight">Menu Roti Hari Ini</h1>
        </div>
        
        <MenuContainer products={products} categories={categories} user={user} />
      </div>
    </main>
  );
}
