"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Tag, 
  Share2, 
  Bookmark,
  Wheat,
  Quote,
  Eye
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Catalog from "../catalog/Catalog";

interface InfoDetailProps {
  article: any;
  products?: any[];
  categories?: any[];
}

export default function InfoDetail({ article, products = [], categories = [] }: InfoDetailProps) {
  if (!article) return null;

  if (article.category === "Katalog") {
    return (
      <div className="relative">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-[1400px] mx-auto px-6 pt-12 flex items-center justify-between"
        >
          <Link 
            href="/info"
            className="group flex items-center gap-3 text-stone-400 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-[0.3em]"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center transition-transform group-hover:-translate-x-2">
              <ArrowLeft size={16} />
            </div>
            Kembali ke Journal
          </Link>
        </motion.div>
        
        <Catalog products={products} categories={categories} />
        
        {/* Simple Footer for Catalog Article */}
        <div className="max-w-[1400px] mx-auto px-6 pb-24 text-center">
            <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">
                Bagian dari BreadGift Journal Selection
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 md:py-24 relative">
      {/* 1. Navigation & Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12 flex items-center justify-between"
      >
        <Link 
          href="/info"
          className="group flex items-center gap-3 text-stone-400 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-[0.3em]"
        >
          <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center transition-transform group-hover:-translate-x-2">
            <ArrowLeft size={16} />
          </div>
          Kembali ke Journal
        </Link>

        <div className="flex items-center gap-4">
           <button className="w-10 h-10 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-stone-400 hover:text-primary transition-all">
              <Share2 size={16} />
           </button>
           <button className="w-10 h-10 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-stone-400 hover:text-primary transition-all">
              <Bookmark size={16} />
           </button>
        </div>
      </motion.div>

      {/* 2. Article Header */}
      <div className="space-y-8 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.4em]"
        >
          <Tag size={12} />
          {article.category || "Berita Terbaru"}
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-stone-900 tracking-tighter leading-[1.1]"
          style={{ fontFamily: 'var(--font-rametto)' }}
        >
          {article.title}
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-8 py-6 border-y border-zinc-100"
        >
          <div className="flex items-center gap-3 text-stone-400 font-bold text-xs uppercase tracking-widest">
            <Calendar size={16} className="text-primary" />
            {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-3 text-stone-400 font-bold text-xs uppercase tracking-widest">
            <Clock size={16} className="text-primary" />
            5 Menit Baca
          </div>
          <div className="flex items-center gap-3 text-stone-400 font-bold text-xs uppercase tracking-widest">
            <Eye size={16} className="text-primary" />
            {article.views || 0} Pengunjung
          </div>
          <div className="flex items-center gap-3 text-stone-400 font-bold text-xs uppercase tracking-widest ml-auto">
            <span className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-black">BG</span>
            BreadGift Editorial
          </div>
        </motion.div>
      </div>

      {/* 3. Hero Image */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative aspect-video w-full rounded-[4rem] overflow-hidden shadow-2xl mb-16 border border-zinc-100"
      >
        <Image 
          src={article.image_url || "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=1200"}
          alt={article.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* 4. Article Content */}
      <div className="relative">
         {/* Decorative Icon */}
         <div className="absolute -left-20 top-20 opacity-5 hidden lg:block">
            <Quote size={120} className="text-primary" />
         </div>

         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="prose prose-stone max-w-none prose-xl"
         >
           <div className="text-stone-600 font-medium leading-[2] text-xl whitespace-pre-wrap space-y-6">
             {article.content}
           </div>
         </motion.div>
      </div>

      {/* 5. Footer Article */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-24 pt-12 border-t border-zinc-100 flex flex-col items-center text-center space-y-8"
      >
        <div className="w-20 h-20 bg-[#FCF1E8] rounded-3xl flex items-center justify-center text-[#6B4423]">
          <Wheat size={40} />
        </div>
        <div className="space-y-4">
          <h4 className="text-2xl font-black text-stone-900">Informasi Seputar Roti</h4>
          <p className="text-stone-400 font-bold max-w-md mx-auto uppercase tracking-widest text-[10px]">
            Terima kasih telah membaca. Kami berkomitmen untuk terus menyebarkan kebahagiaan melalui roti berkualitas tinggi setiap hari.
          </p>
        </div>
        <Link 
          href="/catalog" 
          className="px-10 py-5 bg-stone-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary transition-all active:scale-95"
        >
          Lihat Koleksi Roti Kami
        </Link>
      </motion.div>
    </div>
  );
}
