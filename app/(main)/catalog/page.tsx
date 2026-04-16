import React from "react";
import Catalog from "@/component/pages/catalog/Catalog";
import { getProducts, getCategories } from "@/lib/actions";

export const metadata = {
  title: "Digital Lookbook - BreadGift Bakery",
  description: "Eksplorasi koleksi roti artisan premium kami dalam tampilan katalog digital yang menawan.",
};

export default async function CatalogPage() {
  const products = await getProducts("Aktif");
  const categories = await getCategories();

  return (
    <main className="relative min-h-screen animated-mesh pb-32 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none"></div>
      <Catalog products={products} categories={categories} />
    </main>
  );
}
