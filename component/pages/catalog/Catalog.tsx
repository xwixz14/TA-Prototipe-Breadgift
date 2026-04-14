"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Download, BookOpen, Sparkles, ChevronRight, ShoppingBag } from "lucide-react";
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

export default function Catalog({ products, categories }: { products: Product[], categories: Category[] }) {
  const catalogRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Group products by category
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
      
      // Temporary style adjustments for better PDF output
      const originalStyle = element.style.backgroundColor;
      element.style.backgroundColor = "white";

      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        logging: true, // Enable logging to debug if it still fails
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // 1. Show pdf-only elements in the cloned document
          const pdfOnly = clonedDoc.querySelectorAll('.pdf-only') as NodeListOf<HTMLElement>;
          pdfOnly.forEach(el => {
            el.style.display = 'flex';
            el.style.visibility = 'visible';
          });

          // 2. Fix unsupported color functions (lab, oklch) for html2canvas
          // This is a common issue with Tailwind v4
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            const style = window.getComputedStyle(el);
            
            // html2canvas struggles with modern color functions
            // We force standard RGB colors where possible by reading computed styles
            // which the browser already resolved to rgb/rgba
            if (style.color.includes('lab') || style.color.includes('oklch')) {
              el.style.color = 'inherit'; 
            }
            if (style.backgroundColor.includes('lab') || style.backgroundColor.includes('oklch')) {
              el.style.backgroundColor = 'transparent';
            }
            if (style.borderColor.includes('lab') || style.borderColor.includes('oklch')) {
              el.style.borderColor = 'transparent';
            }
          }
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add more pages if content exceeds A4 height
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Katalog-BreadGift-${new Date().toLocaleDateString('id-ID')}.pdf`);
      element.style.backgroundColor = originalStyle;
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 border-b border-zinc-100 pb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <div className="flex items-center gap-2 text-[#6B4423] font-bold text-sm uppercase tracking-[0.2em] mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Digital Lookbook</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-black tracking-tight mb-6">
            Katalog <span className="text-[#949499]">Roti</span> <br />
            Pilihan <span className="text-[#6B4423]">Terbaik</span>.
          </h1>
          <p className="text-[#71717a] text-lg max-w-xl font-medium leading-relaxed">
            Menghadirkan kehangatan dari oven kami langsung ke meja Anda. 
            Setiap roti dibuat dengan bahan premium dan kasih sayang.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className={`flex items-center gap-3 bg-[#6B4423] text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-2xl shadow-[#6B4423]/30 hover:bg-[#5D3822] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isDownloading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Memproses...</span>
            </div>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Unduh Katalog (PDF)</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Catalog Content Area for PDF Export */}
      <div ref={catalogRef} className="bg-white p-2">
         {/* Internal Catalog Header (visible in PDF) */}
         <div className="hidden pdf-only flex justify-between items-center mb-12 border-b-2 border-[#6B4423] pb-8">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-[#6B4423] rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
               </div>
               <div>
                  <h2 className="text-2xl font-black text-black uppercase tracking-tight">BreadGift Bakery</h2>
                  <p className="text-[#a1a1aa] font-bold text-xs uppercase tracking-widest">Premium Artisan Bread</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[#a1a1aa] font-bold text-xs uppercase tracking-widest">Katalog Produk</p>
            </div>
         </div>

         {groupedProducts.map((category, idx) => (
           <motion.section 
             key={category.id} 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, delay: idx * 0.1 }}
             className="mb-24"
           >
             <div className="flex items-center gap-4 mb-10">
               <h2 className="text-3xl font-black text-black tracking-tight">{category.name}</h2>
               <div className="h-px flex-1 bg-[#f4f4f5]" />
               <span className="text-[#a1a1aa] font-bold text-sm uppercase tracking-widest">{category.products.length} Items</span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {category.products.map((product) => (
                 <motion.div 
                   key={product.id}
                   whileHover={{ y: -10 }}
                   className="group relative bg-[#fafafa] rounded-[32px] p-6 border border-[#f4f4f5] transition-all hover:bg-white hover:shadow-2xl hover:shadow-[#e4e4e7]"
                 >
                   <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-6 bg-white border border-[#f4f4f5] shadow-inner">
                     <Image
                       src={product.image_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop"}
                       alt={product.name}
                       fill
                       className="object-cover transition-transform duration-700 group-hover:scale-110"
                       onError={(e) => {
                         (e.target as any).src = "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop";
                       }}
                     />
                     <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm">
                        <span className="text-[#6B4423] font-black text-xs uppercase tracking-widest">{product.unit}</span>
                     </div>
                   </div>

                   <div className="flex flex-col gap-2">
                     <h3 className="text-xl font-black text-black tracking-tight group-hover:text-[#6B4423] transition-colors">
                       {product.name}
                     </h3>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#f4f4f5]">
                        <span className="text-2xl font-black text-black">
                           {formatPrice(product.price)}
                        </span>
                        <div className="w-10 h-10 bg-white border border-[#f4f4f5] rounded-xl flex items-center justify-center shadow-sm group-hover:bg-[#6B4423] group-hover:text-white transition-all">
                           <ChevronRight className="w-5 h-5" />
                        </div>
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
           </motion.section>
         ))}

          {/* Catalog Footer (visible in PDF) */}
          <div className="hidden pdf-only mt-24 pt-12 border-t-2 border-[#6B4423] text-center">
             <p className="text-[#71717a] font-medium mb-4">Terima kasih telah memilih BreadGift Bakery sebagai teman makan Anda.</p>
             <div className="flex justify-center gap-8 text-[#6B4423] font-black text-xs uppercase tracking-[0.2em]">
               <span>Sukarame, Lampung</span>
               <span>•</span>
               <span>Instagram: @breadgift.bakery</span>
            </div>
         </div>
      </div>

      <style jsx global>{`
        .pdf-only {
          display: none !important;
        }
        @media print {
          .pdf-only {
            display: flex !important;
          }
        }
        /* Custom class handled during download for non-print context */
        div[ref] .pdf-only {
            display: none;
        }
      `}</style>
    </div>
  );
}
