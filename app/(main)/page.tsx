"use client";

import Hero from "@/component/pages/home/Hero";

export default function Home() {
  return (
    <main className="relative flex flex-col bg-[#fffcf8] min-h-screen">
      <Hero />
      {/* Keeping only the polished Hero with animations as requested */}
    </main>
  );
}
