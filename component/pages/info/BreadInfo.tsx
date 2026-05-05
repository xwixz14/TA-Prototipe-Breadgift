"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Sparkles, 
  Wheat, 
  Info, 
  Eye, 
  Compass, 
  Wind, 
  Clock, 
  ChevronRight, 
  Heart,
  Star,
  CheckCircle2,
  Zap,
  Leaf,
  Newspaper
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const InfoCard = ({ icon: Icon, title, description, color }: any) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="bg-white p-10 rounded-[3.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/20 space-y-6 group transition-all duration-500 hover:border-primary/20"
  >
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`} aria-hidden="true">
      <Icon size={32} />
    </div>
    <h3 className="text-2xl font-black text-stone-900 tracking-tight">{title}</h3>
    <p className="text-stone-500 text-sm font-bold leading-relaxed">{description}</p>
  </motion.div>
);

export default function BreadInfo({ dynamicArticles = [] }: { dynamicArticles?: any[] }) {
  const catalogArticle = dynamicArticles.find(a => a.category === "Katalog");
  const journalArticles = dynamicArticles.filter(a => a.category !== "Katalog");

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-24 relative space-y-32">
      {/* 1. Hero Section */}
      <div className="flex flex-col md:flex-row items-center gap-20">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 space-y-8"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em]">
            <BookOpen size={14} aria-hidden="true" />
            Edukasi & Tips Roti
          </div>
          <h1 className="text-6xl md:text-[7rem] font-black text-stone-900 tracking-tighter leading-[0.85]" style={{ fontFamily: 'var(--font-rametto)' }}>
            Informasi <br />
            <span className="text-primary italic">Seputar Roti.</span>
          </h1>
          <p className="text-stone-500 text-lg md:text-xl font-bold max-w-xl uppercase tracking-widest leading-relaxed">
            Panduan lengkap memahami kualitas roti artisan dan cara menikmati kelezatan maksimal setiap hari.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 relative aspect-square w-full max-w-[600px]"
        >
          <div className="absolute inset-0 bg-primary/5 rounded-[5rem] rotate-6 -z-10"></div>
          <div className="absolute inset-0 bg-stone-900 rounded-[5rem] -rotate-3 overflow-hidden shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=1200&auto=format&fit=crop"
              alt="Artisan Sourdough Bread freshly baked"
              fill
              priority
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent"></div>
            <div className="absolute bottom-12 left-12 right-12">
               <div className="flex items-center gap-4 text-primary mb-2">
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
               </div>
               <p className="text-white font-black text-2xl">"Kualitas bukan pilihan, tapi identitas kami."</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. Visual Quality Section */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <p className="text-primary font-black uppercase tracking-[0.4em] text-xs">Visual Inspection</p>
          <h2 className="text-5xl md:text-6xl font-black text-stone-900 tracking-tighter" style={{ fontFamily: 'var(--font-rametto)' }}>
            Cek Kesegaran <span className="text-stone-300 italic">Tanpa Tanggal.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <InfoCard 
            icon={Eye}
            title="Deteksi Warna"
            description="Pelajari gradasi warna crust. Roti segar memiliki kilau kuning keemasan yang 'setengah matang' di bagian dalam dan garing di luar."
            color="bg-emerald-100 text-emerald-600"
          />
          <InfoCard 
            icon={Compass}
            title="Uji Tekstur (Bounce)"
            description="Tekan perlahan jari Anda ke roti. Roti berkualitas tinggi akan membal kembali ke bentuk semula (Springy) dalam 2 detik."
            color="bg-amber-100 text-amber-600"
          />
          <InfoCard 
            icon={Wind}
            title="Aktivitas Aroma"
            description="Dekatkan roti ke hidung. Aroma ragi alami dan mentega berkualitas harus tercium kuat, bukan bau 'asam ragi instan'."
            color="bg-blue-100 text-blue-600"
          />
        </div>
      </section>

      {/* 5. Featured Catalog Section */}
      {catalogArticle && (
        <section className="space-y-12">
           <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-100 pb-12">
            <div className="space-y-4">
              <p className="text-amber-600 font-black uppercase tracking-[0.4em] text-xs">Informasi & Koleksi</p>
              <h2 className="text-5xl md:text-[5rem] font-black text-stone-900 tracking-tighter leading-none" style={{ fontFamily: 'var(--font-rametto)' }}>
                Catalog <br /><span className="text-stone-300 italic">Breadgift.</span>
              </h2>
            </div>
            <p className="text-stone-500 font-bold text-lg max-w-sm uppercase tracking-widest leading-relaxed">
              Eksplorasi koleksi roti terbaik kami melalui katalog visual yang mendalam.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group relative h-[500px] md:h-[600px] rounded-[4rem] overflow-hidden shadow-2xl border border-zinc-100 cursor-pointer"
          >
            <Image 
              src={catalogArticle.image_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200"}
              alt={catalogArticle.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent"></div>
            
            <div className="absolute bottom-16 left-16 right-16 space-y-6">
               <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em]">
                  <Sparkles size={14} className="text-amber-400" />
                  Edisi Koleksi Utama
               </div>
               <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter max-w-2xl" style={{ fontFamily: 'var(--font-rametto)' }}>
                 {catalogArticle.title}
               </h3>
               <p className="text-white/60 text-lg font-bold max-w-xl line-clamp-2 uppercase tracking-widest">
                 {catalogArticle.content}
               </p>
               <Link 
                 href={`/info/${catalogArticle.id}`}
                 className="inline-flex items-center gap-4 bg-white text-stone-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all active:scale-95"
               >
                 Buka Katalog <ChevronRight size={16} />
               </Link>
            </div>
          </motion.div>
        </section>
      )}

      {/* 6. Dynamic Articles Section (Journal) */}
      {journalArticles.length > 0 && (
        <section className="space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-100 pb-12">
            <div className="space-y-4">
              <p className="text-primary font-black uppercase tracking-[0.4em] text-xs">Journal & Updates</p>
              <h2 className="text-5xl md:text-[5rem] font-black text-stone-900 tracking-tighter leading-none" style={{ fontFamily: 'var(--font-rametto)' }}>
                BreadGift <br /><span className="text-stone-300 italic">Journal.</span>
              </h2>
            </div>
            <p className="text-stone-500 font-bold text-lg max-w-sm uppercase tracking-widest leading-relaxed">
              Berita terbaru, tips khusus, dan informasi harian dari dapur BreadGift.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {journalArticles.map((article, index) => (
              <motion.article 
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[16/10] rounded-[3rem] overflow-hidden mb-8 shadow-2xl border border-zinc-100 transition-all duration-500 group-hover:shadow-primary/10">
                  <Image 
                    src={article.image_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000"} 
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-6 left-6 py-2 px-4 bg-white/90 backdrop-blur rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                    {article.category || "Berita"}
                  </div>
                </div>
                <div className="space-y-4 px-2">
                  <div className="flex items-center gap-6 text-stone-400 font-black text-[10px] uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-primary" />
                      {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye size={12} className="text-primary" />
                      {article.views || 0} Terlihat
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-stone-900 tracking-tight group-hover:text-primary transition-colors leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-stone-500 text-sm font-bold leading-relaxed line-clamp-3">
                    {article.content}
                  </p>
                  <Link 
                    href={`/info/${article.id}`}
                    className="pt-4 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0"
                  >
                    Baca Selengkapnya <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* 3. The BreadGift Process */}
      <div className="bg-stone-950 rounded-[4rem] p-12 md:p-24 overflow-hidden relative">
        {/* ... (keep existing process section) ... */}
         <div className="absolute top-0 right-0 p-20 opacity-10">
            <Wheat size={300} className="text-white" />
         </div>

         <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
               <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">Rahasia di Balik <br /><span className="text-primary italic">Crunchy Crust.</span></h2>
               <div className="space-y-6">
                  {[
                    "Proses proofing alami selama 24 jam untuk tekstur aerasi sempurna.",
                    "Penggunaan mentega premium tanpa pengawet buatan.",
                    "Suhu oven yang dikalibrasi untuk karamelisasi crust yang pas.",
                    "Bahan isian (filling) lokal pilihan tanpa pemanis buatan."
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-4 items-start group">
                      <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <CheckCircle2 size={14} />
                      </div>
                      <p className="text-stone-400 font-bold text-lg leading-snug">{tip}</p>
                    </div>
                  ))}
               </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-6">
                <div className="bg-white/5 backdrop-blur-xl p-5 md:p-8 rounded-2xl md:rounded-3xl space-y-2 md:space-y-4 border border-white/10">
                  <Clock className="text-primary w-6 h-6 md:w-8 md:h-8" />
                  <p className="text-white font-black text-sm md:text-xl leading-none uppercase md:normal-case">24 Jam</p>
                  <p className="text-stone-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-none">Waktu Proses</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl p-5 md:p-8 rounded-2xl md:rounded-3xl space-y-2 md:space-y-4 border border-white/10">
                  <Leaf className="text-primary w-6 h-6 md:w-8 md:h-8" />
                  <p className="text-white font-black text-sm md:text-xl leading-none uppercase md:normal-case">100% Alam</p>
                  <p className="text-stone-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-none">Bahan Pilihan</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl p-5 md:p-8 rounded-2xl md:rounded-3xl space-y-2 md:space-y-4 border border-white/10">
                  <Zap className="text-primary w-6 h-6 md:w-8 md:h-8" />
                  <p className="text-white font-black text-sm md:text-xl leading-none uppercase md:normal-case">Fresh Heat</p>
                  <p className="text-stone-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-none">Oven To Hand</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl p-5 md:p-8 rounded-2xl md:rounded-3xl space-y-2 md:space-y-4 border border-white/10">
                  <Heart className="text-primary w-6 h-6 md:w-8 md:h-8" />
                  <p className="text-white font-black text-sm md:text-xl leading-none uppercase md:normal-case">Artisan</p>
                  <p className="text-stone-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-none">Made with Love</p>
                </div>
            </div>
         </div>
      </div>

      {/* 4. Final Bread Tips Table - Transformed to Cards on Mobile */}
      <section className="bg-stone-50 rounded-[3rem] md:rounded-[4rem] p-8 md:p-20 space-y-12">
        <h3 className="text-3xl md:text-4xl font-black text-stone-900 text-center" style={{ fontFamily: 'var(--font-rametto)' }}>Panduan Penyimpanan</h3>
        
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-stone-400 font-black uppercase text-[10px] tracking-[0.2em]">
                <th className="px-8 pb-4">Jenis Roti</th>
                <th className="px-8 pb-4">Suhu Ruang</th>
                <th className="px-8 pb-4">Refrigerated</th>
                <th className="px-8 pb-4">Tips Menghangatkan</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: "Roti Manis", ruang: "2-3 Hari", cooler: "5 Hari", reheat: "Oven 180°C (3 Menit)" },
                { type: "Roti Tawar", ruang: "3-4 Hari", cooler: "7 Hari", reheat: "Toaster / Pan" },
                { type: "Donut", ruang: "1 Hari", cooler: "Tidak Disarankan", reheat: "Microwave (10 Detik)" }
              ].map((row, i) => (
                <tr key={i} className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow group">
                  <td className="px-8 py-8 rounded-l-[2rem] font-black text-stone-900 group-hover:text-primary">{row.type}</td>
                  <td className="px-8 py-8 font-bold text-stone-500">{row.ruang}</td>
                  <td className="px-8 py-8 font-bold text-stone-500">{row.cooler}</td>
                  <td className="px-8 py-8 rounded-r-[2rem] font-bold text-primary italic">{row.reheat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden space-y-6">
          {[
            { type: "Roti Manis", ruang: "2-3 Hari", cooler: "5 Hari", reheat: "Oven 180°C (3 Menit)" },
            { type: "Roti Tawar", ruang: "3-4 Hari", cooler: "7 Hari", reheat: "Toaster / Pan" },
            { type: "Donut", ruang: "1 Hari", cooler: "Tidak Disarankan", reheat: "Microwave (10 Detik)" }
          ].map((row, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-50 pb-3">
                <span className="font-black text-stone-900 text-lg uppercase tracking-tight">{row.type}</span>
                <span className="text-primary text-[9px] font-black uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">Artisan Guide</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-stone-400 text-[8px] font-black uppercase tracking-widest mb-1">Suhu Ruang</p>
                  <p className="text-stone-700 font-bold text-xs">{row.ruang}</p>
                </div>
                <div>
                  <p className="text-stone-400 text-[8px] font-black uppercase tracking-widest mb-1">Refrigerated</p>
                  <p className="text-stone-700 font-bold text-xs">{row.cooler}</p>
                </div>
              </div>
              <div className="bg-stone-50 p-4 rounded-2xl">
                <p className="text-stone-400 text-[8px] font-black uppercase tracking-widest mb-1">Tips Menghangatkan</p>
                <p className="text-primary font-black text-xs italic">{row.reheat}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Look */}
      <div className="text-center pb-24" role="contentinfo">
         <p className="text-stone-400 font-bold uppercase tracking-[0.5em] text-xs">BreadGift Bakery Artisan Philosophy</p>
      </div>
    </div>
  );
}
