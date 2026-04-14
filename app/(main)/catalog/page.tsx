import React from "react";
import Catalog from "@/component/pages/catalog/Catalog";
import { getProducts, getCategories } from "@/lib/actions";

export const metadata = {
  title: "Catalog | BreadGift Bakery",
  description: "Lihat koleksi lengkap roti dan kue lezat kami di BreadGift Bakery.",
};

export default async function CatalogPage() {
  const products = await getProducts("Aktif");
  const categories = await getCategories();

  return (
    <main className="relative pt-24 min-h-screen bg-white">
      <Catalog products={products} categories={categories} />
    </main>
  );
}
