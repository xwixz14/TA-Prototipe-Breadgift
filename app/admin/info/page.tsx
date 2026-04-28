import React from "react";
import InfoManager from "@/component/admin/info/InfoManager";
import { getBreadInfoArticles } from "@/lib/actions";

export const metadata = {
  title: "Admin - Kelola Informasi | BreadGift POS",
  description: "Manajemen konten dan berita seputar roti.",
};

export default async function AdminInfoPage() {
  const articles = await getBreadInfoArticles();

  return (
    <div className="p-4 md:p-8 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      <InfoManager initialArticles={articles} />
    </div>
  );
}
