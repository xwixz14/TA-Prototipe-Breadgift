import React from "react";
import Catalog from "@/component/pages/catalog/Catalog";
import { getProducts, getCategories } from "@/lib/actions";
import Script from "next/script";

export const metadata = {
  title: "Toko Roti Terdekat & Roti Enak - Katalog BreadGift Bakery",
  description: "Daftar roti enak dan artisan premium di Lampung. Lihat kesegaran roti kami secara visual tanpa ribet. Freshly baked everyday!",
  keywords: ["roti enak", "toko roti terdekat", "artisan bakery lampung", "breadgift", "roti fresh", "katalog roti"],
  openGraph: {
    title: "BreadGift Bakery - Artisan Selection",
    description: "Koleksi roti terbaik dengan teknik fermentasi alami.",
    images: ["/assets/og-image.png"],
  },
};

export default async function CatalogPage() {
  const products = await getProducts("Aktif");
  const categories = await getCategories();

  // JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "name": "BreadGift Bakery",
    "image": "https://breadgift.com/logo.png",
    "@id": "",
    "url": "https://breadgift.com/catalog",
    "telephone": "08123456789",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Artisan No. 123",
      "addressLocality": "Bandar Lampung",
      "addressRegion": "Lampung",
      "addressCountry": "ID"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "07:00",
      "closes": "21:00"
    }
  };

  return (
    <main className="relative min-h-screen animated-mesh pb-32 overflow-hidden">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none"></div>
      <Catalog products={products} categories={categories} />
    </main>
  );
}
