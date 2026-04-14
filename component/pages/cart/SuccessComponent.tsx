"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Download, ShoppingBag, Calendar, CheckCircle2, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import { confirmMidtransTransaction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import Image from "next/image";

interface TransactionItem {
  id: number;
  product_name: string;
  image_url: string;
  quantity: number;
  price_at_transaction: number;
  subtotal: number;
}

interface Transaction {
  id: number;
  customer_name: string | null;
  total_amount: number;
  payment_method: string;
  transaction_date: string;
  status: string;
  source: string;
  items: TransactionItem[];
}

export default function SuccessComponent({ transaction }: { transaction: Transaction | null }) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [simulatingSnap, setSimulatingSnap] = useState(false);
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only fire confetti for confirmed transactions
    if (transaction?.status === "Pending") return;

    // Fire confetti on load
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!transaction) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-zinc-200 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-zinc-400" />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 mb-2 tracking-tight">Pesanan Terkonfirmasi</h1>
        <p className="text-zinc-500 max-w-sm font-medium">Terima kasih atas pesanan Anda. Kami sedang memprosesnya.</p>
        <Link 
          href="/menu" 
          className="mt-8 bg-[#6B4423] text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-[#6B4423]/20 hover:scale-[1.02] transition-all"
        >
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  // Regular Success View for Confirmed Orders
  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Success Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.08)] border border-zinc-100 overflow-hidden relative"
        >
          {/* Top Decorative Banner */}
          <div className="bg-[#6B4423] h-4 w-full" />
          
          <div className="p-10 md:p-16 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-green-100"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mb-4">
              Pesanan Berhasil!
            </h1>
            <p className="text-zinc-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
              Halo <span className="text-zinc-900 font-bold">{transaction.customer_name || "Pelanggan"}</span>, pesananmu <span className="text-[#6B4423] font-bold">#ORD-{transaction.id.toString().padStart(5, '0')}</span> telah kami terima.
            </p>

            {/* Order Summary Preview */}
            <div className="mt-12 bg-zinc-50 rounded-3xl p-8 border border-zinc-100 text-left space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                <span>Ringkasan Pesanan</span>
                <span>{transaction.items.length} Produk</span>
              </div>
              <div className="space-y-3">
                {transaction.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm font-bold text-zinc-700 truncate max-w-[200px]">
                      {item.product_name} <span className="text-zinc-400 ml-1">x{item.quantity}</span>
                    </span>
                    <span className="text-sm font-black text-zinc-900">Rp {item.subtotal.toLocaleString("id-ID")}</span>
                  </div>
                ))}
                {transaction.items.length > 3 && (
                   <p className="text-[10px] font-bold text-[#6B4423] italic">+ {transaction.items.length - 3} produk lainnya</p>
                )}
              </div>
              <div className="h-px bg-zinc-200 my-4" />
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Bayar</span>
                <span className="text-3xl font-black text-[#6B4423] tracking-tighter leading-none">
                  Rp {transaction.total_amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
              <button 
                onClick={handlePrint}
                className="flex items-center justify-center gap-3 bg-[#6B4423] text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-[#6B4423]/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
              >
                <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                Unduh Tanda Terima
              </button>
              
              <Link 
                href="/menu" 
                className="flex items-center justify-center gap-3 bg-white text-zinc-900 border-2 border-zinc-100 px-10 py-5 rounded-2xl font-black hover:bg-zinc-50 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Belanja Lagi
              </Link>
            </div>
            
            <p className="mt-8 text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Calendar className="w-3 h-3" />
              {new Date(transaction.transaction_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </motion.div>

        {/* Hidden Content for Printing (Receipt) */}
        <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[200]">
           <div className="p-10 max-w-[400px] mx-auto border-2 border-zinc-200 rounded-3xl" id="printable-receipt">
             <div className="text-center mb-8">
               <h2 className="text-2xl font-black text-zinc-900">BREADGIFT</h2>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Freshly Baked Everyday</p>
               <div className="h-1 w-12 bg-[#6B4423] mx-auto mt-2" />
             </div>
             
             <div className="space-y-4 mb-8">
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No. Pesanan</span>
                 <span className="text-xs font-black text-zinc-900">#ORD-{transaction.id.toString().padStart(5, '0')}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pelanggan</span>
                 <span className="text-xs font-black text-zinc-900">{transaction.customer_name || "Guest"}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Metode</span>
                 <span className="text-xs font-black text-zinc-900">{transaction.payment_method}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tanggal</span>
                 <span className="text-xs font-black text-zinc-900">
                    {new Date(transaction.transaction_date).toLocaleDateString('id-ID')}
                 </span>
               </div>
             </div>

             <div className="border-t border-dashed border-zinc-200 pt-6 space-y-4 mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-left">
                      <th className="pb-3">Produk</th>
                      <th className="pb-3 text-center">Qty</th>
                      <th className="pb-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {transaction.items.map((item, idx) => (
                      <tr key={idx} className="text-xs font-black text-zinc-800">
                        <td className="py-2 pr-4">{item.product_name}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">Rp {item.subtotal.toLocaleString("id-ID")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>

             <div className="border-t border-dashed border-zinc-200 pt-6 space-y-2">
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Bayar</span>
                 <span className="text-lg font-black text-[#6B4423]">Rp {transaction.total_amount.toLocaleString("id-ID")}</span>
               </div>
             </div>
             
             <div className="mt-12 text-center">
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Terima Kasih!</p>
               <p className="text-[8px] font-bold text-zinc-400 italic">Pesanan Anda Sedang Kami Siapkan</p>
             </div>
           </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            border: none !important;
            padding: 0 !important;
          }
           @page {
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
