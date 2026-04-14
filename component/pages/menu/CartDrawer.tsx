"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, ShoppingBag, Trash2, Loader2, ArrowRight, CreditCard, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { createTransaction, getMe, confirmMidtransTransaction } from "@/lib/actions";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snapTransactionId, setSnapTransactionId] = useState<number | null>(null);
  const [simulatingSnap, setSimulatingSnap] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Use a separate state to handle the 'entering' animation after render
  const [shouldRender, setShouldRender] = useState(false);

  // Close drawer on route change to prevent UI locks
  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname, setIsCartOpen]);

  React.useEffect(() => {
    // Load Midtrans Snap script
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
    const snapScript = isProduction 
      ? "https://app.midtrans.com/snap/snap.js" 
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
    
    // Check if script already exists to avoid duplicates
    if (!document.querySelector(`script[src="${snapScript}"]`)) {
      const script = document.createElement("script");
      script.src = snapScript;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  React.useEffect(() => {
    if (isCartOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    // Check auth first
    const user = await getMe();
    if (!user) {
      setIsCartOpen(false);
      router.push("/login?redirect=/cart");
      return;
    }

    setIsSubmitting(true);

    try {
      const transactionData: any = {
        total_amount: totalPrice,
        payment_method: 'Midtrans',
        source: 'Online',
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const result = await createTransaction(transactionData);
      
      if (result.success && result.snapToken) {
        // @ts-ignore
        window.snap.pay(result.snapToken, {
          onSuccess: async function(snapResult: any) {
            const confirmRes = await confirmMidtransTransaction(result.transactionId);
            if (confirmRes.success) {
               clearCart();
               setIsCartOpen(false);
               router.push(`/cart/success?id=${result.transactionId}`);
            } else {
               alert("Midtrans Gagal: " + confirmRes.error);
               setIsSubmitting(false);
            }
          },
          onPending: function(snapResult: any) {
            alert("Menunggu pembayaran Anda.");
            setIsSubmitting(false);
          },
          onError: function(snapResult: any) {
            alert("Pembayaran Gagal!");
            setIsSubmitting(false);
          },
          onClose: function() {
            setIsSubmitting(false);
          }
        });
      } else {
        alert("Gagal memproses pesanan: " + result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Terjadi kesalahan saat memproses pesanan.");
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen && !shouldRender && !snapTransactionId) return null;

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 transition-all duration-300 ${isCartOpen || snapTransactionId ? "visible pointer-events-auto" : "invisible pointer-events-none"}`}>
        {/* Backdrop */}
        <div 
        className={`absolute inset-0 bg-zinc-900/60 backdrop-blur-md transition-opacity duration-500 ${isCartOpen ? "opacity-100" : "opacity-0"}`} 
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Modal Panel - Centered on Desktop, Full Screen on Mobile */}
      <div className={`relative w-full h-full md:h-auto md:max-w-4xl bg-white md:rounded-[48px] shadow-[0_32px_80px_rgba(0,0,0,0.15)] flex flex-col md:flex-row overflow-hidden transform transition-all duration-500 ${isCartOpen ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-12"}`}>
        
        {/* Left Side: Items & Header (2/3 width) */}
        <div className="flex-1 flex flex-col min-w-0 md:border-r border-zinc-100 h-full overflow-hidden">
          {/* Header */}
          <div className="px-6 md:px-10 py-6 md:py-10 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-4 md:gap-5">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-[#6B4423] rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl shadow-[#6B4423]/20">
                <ShoppingBag className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-black text-zinc-900 tracking-tight">Pesanan Anda</h2>
                <p className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-1">{cartItems.length} Produk Terpilih</p>
              </div>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-3 hover:bg-zinc-100 rounded-2xl transition-all"
            >
              <X className="w-6 h-6 text-zinc-300 hover:text-zinc-900" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-10 py-8 space-y-6 max-h-[50vh] md:max-h-[60vh]">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-10 h-10 text-zinc-200" />
                </div>
                <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Keranjang Kosong</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex gap-6 group items-center">
                  <div className="relative w-20 h-20 bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden flex-shrink-0">
                    <Image 
                      src={item.image_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800"} 
                      alt={item.name}
                      fill
                      className="object-contain p-3"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-black text-zinc-900 text-base tracking-tight truncate">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-4 bg-zinc-100/50 p-1 rounded-2xl border border-zinc-200 shadow-inner">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                        className="w-10 h-10 flex items-center justify-center bg-white text-zinc-900 rounded-xl shadow-sm hover:bg-[#6B4423] hover:text-white transition-all active:scale-95"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="text-base font-black text-zinc-900 w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                        className="w-10 h-10 flex items-center justify-center bg-white text-zinc-900 rounded-xl shadow-sm hover:bg-[#6B4423] hover:text-white transition-all active:scale-95"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                      <p className="font-black text-zinc-900 text-sm">Rp. {(item.price * item.quantity).toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Payment & Checkout (1/3 width) */}
        <div className="w-full md:w-[400px] bg-zinc-50 flex flex-col">
          {/* Header Right */}
          <div className="px-6 md:px-10 py-6 md:py-10 border-b border-zinc-200/50 flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-black text-zinc-900 tracking-tight">Checkout</h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-3 hover:bg-zinc-200 rounded-2xl transition-all hidden md:block"
            >
              <X className="w-6 h-6 text-zinc-400 hover:text-zinc-900" />
            </button>
          </div>

          <div className="flex-1 p-6 md:p-10 flex flex-col gap-6 md:gap-8">
            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-zinc-100/50 p-6 md:p-8 rounded-[32px] border border-zinc-200/50 text-center space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-[#6B4423]" />
                </div>
                <div>
                  <h3 className="font-black text-zinc-900 text-base md:text-lg tracking-tight">Pembayaran Instan</h3>
                  <p className="text-[10px] md:text-xs text-zinc-500 font-medium mt-1">Klik tombol di bawah untuk melunasi pesanan Anda via Midtrans.</p>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white p-4 md:p-6 rounded-3xl border border-zinc-200 space-y-3">
              <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>Rp. {totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <span>Biaya Admin</span>
                <span className="text-green-500">GRATIS</span>
              </div>
              <div className="h-px bg-zinc-100 my-2" />
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-[#6B4423] uppercase tracking-widest">Total Bayar</span>
                <span className="text-xl md:text-2xl font-black text-[#6B4423] tracking-tighter leading-none">Rp. {totalPrice.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto space-y-4">
              <button 
                onClick={handleCheckout}
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full bg-[#6B4423] text-white py-4 md:py-6 rounded-[24px] md:rounded-[28px] text-base md:text-lg font-black shadow-2xl shadow-[#6B4423]/30 hover:bg-[#5D3822] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-zinc-300 disabled:shadow-none group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sedang Diproses...
                  </>
                ) : (
                  <>
                    Bayar Sekarang
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2 opacity-40">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Pembayaran Aman</span>
              </div>
            </div>
            
            {/* Simulation Overlay Inside Right Panel */}
            {simulatingSnap && (
              <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-xl border border-zinc-100"
                >
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-base font-black text-zinc-900 animate-pulse">Memuat Midtrans Gateway...</p>
                  <p className="text-xs text-zinc-500 mt-2 text-center">Mohon tunggu.</p>
                </motion.div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
    </AnimatePresence>
  );
}

