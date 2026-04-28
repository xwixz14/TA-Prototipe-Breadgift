import React from "react";
import BreadInfo from "@/component/pages/info/BreadInfo";
import { getBreadInfoArticles } from "@/lib/actions";
import { Metadata } from "next";

// DYNAMIC SEO: Google akan membaca judul & deskripsi berdasarkan artikel terbaru yang Anda upload!
export async function generateMetadata(): Promise<Metadata> {
  const articles = await getBreadInfoArticles();
  
  // Default metadata if no articles exist
  const defaultTitle = "Toko Roti Terdekat & Roti Enak - Tips & Informasi BreadGift";
  const defaultDesc = "Daftar rute kesegaran roti tanpa melihat tanggal. Pelajari cara memilih roti enak dan artisan premium di Lampung. Freshly baked everyday!";
  const baseKeywords = ["roti enak", "toko roti terdekat", "tips memilih roti", "roti fresh", "informasi roti lampung", "breadgift"];

  if (articles && articles.length > 0) {
    const latest = articles[0];
    const dynamicTitle = `${latest.title} | BreadGift Wisdom`;
    const dynamicDesc = latest.content.substring(0, 160) + "...";
    
    // Gabungkan keyword dasar dengan judul artikel terbaru
    const dynamicKeywords = [...baseKeywords, ...latest.title.toLowerCase().split(" ")];

    return {
      title: dynamicTitle,
      description: dynamicDesc,
      keywords: dynamicKeywords,
      openGraph: {
        title: dynamicTitle,
        description: dynamicDesc,
        images: [latest.image_url || "/assets/og-info.png"],
      },
    };
  }

  return {
    title: defaultTitle,
    description: defaultDesc,
    keywords: baseKeywords,
    openGraph: {
      title: "Informasi & Wisdom Roti - BreadGift Bakery",
      description: "Panduan lengkap memahami kualitas roti artisan kami.",
      images: ["/assets/og-info.png"],
    },
  };
}

export default async function InfoPage() {
  const articles = await getBreadInfoArticles();

  return (
    <main className="relative min-h-screen animated-mesh pb-32 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none"></div>
      <BreadInfo dynamicArticles={articles} />
    </main>
  );
}
