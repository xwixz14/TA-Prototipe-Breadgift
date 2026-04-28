import React from "react";
import InfoDetail from "@/component/pages/info/InfoDetail";
import { getBreadInfoById, incrementBreadInfoView } from "@/lib/actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";

// DYNAMIC SEO FOR ARTICLE DETAIL
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getBreadInfoById(parseInt(resolvedParams.id));

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan | BreadGift",
    };
  }

  return {
    title: `${article.title} | BreadGift Wisdom`,
    description: article.content.substring(0, 160) + "...",
    openGraph: {
      title: article.title,
      description: article.content.substring(0, 160) + "...",
      images: [article.image_url || "/assets/og-info.png"],
      type: "article",
    },
  };
}

export default async function InfoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const articleId = parseInt(resolvedParams.id);
  
  // Increment view count
  await incrementBreadInfoView(articleId);
  
  const article = await getBreadInfoById(articleId);

  if (!article) {
    notFound();
  }

  let products = [];
  let categories = [];
  if (article.category === "Katalog") {
    const { getProducts, getCategories } = await import("@/lib/actions");
    products = await getProducts("Aktif");
    categories = await getCategories();
  }

  return (
    <main className="min-h-screen bg-stone-50/50 animated-mesh relative overflow-hidden pb-32">
       <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-white via-transparent to-transparent pointer-events-none"></div>
       <InfoDetail article={article} products={products} categories={categories} />
    </main>
  );
}
