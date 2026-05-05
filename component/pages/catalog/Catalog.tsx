"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Download, BookOpen, Sparkles, ChevronRight, ShoppingBag, Wheat, Heart, Star } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image_url: string;
  unit: string;
  status: string;
}

interface Category {
  id: number;
  name: string;
}

const FloatingElement = ({ children, delay = 0, className = "" }: any) => (
  <motion.div
    animate={{ 
      y: [0, -15, 0],
      rotate: [0, 5, -5, 0]
    }}
    transition={{ 
      duration: 6, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut" 
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Catalog({ products, categories }: { products: Product[], categories: Category[] }) {
  const catalogRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const groupedProducts = categories.map(cat => ({
    ...cat,
    products: products.filter(p => p.category === cat.name)
  })).filter(cat => cat.products.length > 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDownloadPDF = async () => {
    if (!catalogRef.current) return;
    
    setIsDownloading(true);
    try {
      const element = catalogRef.current;
      const originalStyle = element.style.backgroundColor;
      element.style.backgroundColor = "white";

      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const pdfOnly = clonedDoc.querySelectorAll('.pdf-only') as NodeListOf<HTMLElement>;
          pdfOnly.forEach(el => {
            el.style.display = 'flex';
            el.style.visibility = 'visible';
          });
          
          // Force certain styles for PDF consistency
          const cards = clonedDoc.querySelectorAll('.catalog-card') as NodeListOf<HTMLElement>;
          cards.forEach(card => {
            card.style.boxShadow = 'none';
            card.style.border = '1px solid #f0f0f0';
            card.style.backgroundColor = '#fafafa';
          });
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Katalog-BreadGift-Artisan-${new Date().toLocaleDateString('id-ID')}.pdf`);
      element.style.backgroundColor = originalStyle;
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-24 relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-40 right-10 opacity-20 hidden lg:block">
        <FloatingElement delay={0}>
          <Wheat size={120} className="text-primary" />
        </FloatingElement>
      </div>

      {/* 1. Header Lookbook Content */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 md:mb-32 relative z-10 text-left">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 space-y-6 md:space-y-8"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.4em]">
            <Sparkles size={12} className="animate-pulse" />
            Digital Artisan Lookbook
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-[8rem] font-black text-stone-900 tracking-tighter leading-[0.9] md:leading-[0.85]" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
            Selected <br />
            <span className="text-primary italic">Artisan</span> <br />
            Masterpiece.
          </h1>
          <p className="text-stone-500 text-sm md:text-2xl font-bold max-w-xl uppercase tracking-[0.2em] leading-relaxed opacity-80">
            Koleksi terbaik dari dapur kami, <br className="hidden md:block" />
            dikurasi khusus untuk Anda.
          </p>
        </motion.div>
 
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full md:w-auto"
        >
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full md:w-auto group flex flex-row md:flex-col items-center justify-center gap-6 bg-stone-950 text-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] transition-all hover:bg-primary active:scale-95 disabled:opacity-50 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {isDownloading ? (
              <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-8 h-8 md:w-12 md:h-12 group-hover:bounce-slow" />
            )}
            <div className="text-left md:text-center">
              <span className="block font-black text-xs md:text-sm uppercase tracking-[0.3em]">Save Magazine</span>
              <span className="text-[9px] md:text-[10px] font-bold text-stone-400 group-hover:text-white/80 uppercase tracking-widest mt-1 md:mt-2 block">High Quality PDF</span>
            </div>
          </button>
        </motion.div>
      </div>

      {/* 2. Catalog Display Content (PDF Source) */}
      <div ref={catalogRef} className="relative z-10 space-y-24 md:space-y-32">
         {/* PDF Only Header */}
         <div className="hidden pdf-only flex flex-col items-center text-center pb-20 border-b-2 border-primary">
            <h2 className="text-[6rem] font-black text-stone-900" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>BreadGift</h2>
            <p className="text-sm font-black uppercase tracking-[1em] text-primary">Artisan Lookbook • {new Date().getFullYear()}</p>
         </div>

         {groupedProducts.map((category, idx) => (
           <motion.section 
             key={category.id} 
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 1, delay: 0.2 }}
             className="relative"
           >
             <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 mb-12 md:mb-16">
               <div className="space-y-1">
                 <h2 className="text-4xl md:text-7xl font-black text-stone-900 tracking-tighter" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                  {category.name}
                 </h2>
                 <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Category Showcase</p>
               </div>
               <div className="h-[2px] flex-1 bg-stone-200/50 hidden md:block" />
               <div className="flex items-center gap-4 bg-stone-50 md:bg-white/40 md:backdrop-blur-xl px-6 py-3 rounded-2xl w-fit">
                  <span className="text-stone-900 font-black text-xl">{category.products.length}</span>
                  <span className="text-stone-400 font-bold text-[10px] uppercase tracking-widest">Masterpieces</span>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
               {category.products.map((product, pIdx) => (
                 <motion.div 
                   key={product.id}
                   whileHover={{ y: -20 }}
                   className="catalog-card group relative flex flex-col bg-white rounded-[3rem] md:rounded-[4rem] p-3 md:p-4 border border-zinc-100 md:border-white/50 transition-all duration-700 hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.1)] shadow-xl shadow-stone-200/20"
                 >
                   <div className="relative aspect-[4/5] w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden mb-6 md:mb-8 shadow-2xl">
                     <Image
                       src={product.image_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop"}
                       alt={product.name}
                       fill
                       className="object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-2"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                     
                     {/* Floating Badge in Card */}
                     <div className="absolute bottom-8 left-8 right-8 md:bottom-10 md:left-10 md:right-10 flex justify-between items-end translate-y-20 group-hover:translate-y-0 transition-transform duration-700 delay-100">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em]">Price Point</p>
                          <p className="text-xl md:text-2xl font-black text-white italic" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-secondary-content shadow-xl shadow-primary/40">
                          <ShoppingBag size={18} md:size={20} strokeWidth={2.5} />
                        </div>
                     </div>

                     <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-white/95 backdrop-blur px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-lg border border-white/20">
                        <span className="text-stone-900 font-black text-[8px] md:text-[10px] uppercase tracking-[0.3em]">{product.unit || "Pcs"}</span>
                     </div>
                   </div>

                   <div className="px-4 md:px-6 pb-6 space-y-2 md:space-y-3 text-center">
                     <div className="space-y-1">
                       <h3 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter group-hover:text-primary transition-colors duration-500" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                         {product.name}
                       </h3>
                       <p className="text-stone-400 font-bold uppercase tracking-[0.4em] text-[8px] md:text-[10px]">Artisan Selection</p>
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
           </motion.section>
         ))}

          {/* PDF Only Footer */}
          <div className="hidden pdf-only mt-32 pt-20 border-t-2 border-stone-200 text-center space-y-8">
             <div className="flex justify-center gap-12">
                <Heart className="text-primary w-12 h-12" />
                <Star className="text-primary w-12 h-12" />
                <Sparkles className="text-primary w-12 h-12" />
             </div>
             <p className="text-stone-500 font-bold text-xl uppercase tracking-[0.2em] max-w-2xl mx-auto">
                Dibuat dengan semangat artisan, <br />
                dinikmati dengan penuh kebahagiaan.
             </p>
             <div className="pt-12 grid grid-cols-3 gap-8 uppercase tracking-[0.5em] text-[8px] font-black text-stone-400">
                <span>BreadGift Bakery</span>
                <span>Lampung, Indonesia</span>
                <span>Est. 2021</span>
             </div>
          </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .pdf-only {
          display: none !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
