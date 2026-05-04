"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, ShoppingBag, Trash2, Loader2, ArrowRight, CreditCard, ShieldCheck, MapPin, Truck } from "lucide-react";
import Image from "next/image";
import { createTransaction, getMe } from "@/lib/actions";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [deliveryMethod, setDeliveryMethod] = useState<'Ambil di Toko' | 'Maxim Delivery'>('Ambil di Toko');
  const [recipientName, setRecipientName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Use a separate state to handle the 'entering' animation after render
  const [shouldRender, setShouldRender] = useState(false);

  // Close drawer on route change to prevent UI locks
  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname, setIsCartOpen]);

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

    if (deliveryMethod === 'Maxim Delivery' && (!recipientName || !deliveryAddress)) {
      alert("Harap isi Nama Penerima dan Alamat Lengkap untuk pengiriman Maxim bebs!");
      return;
    }

    setIsSubmitting(true);

    try {
      const transactionData: any = {
        total_amount: totalPrice,
        payment_method: 'QRIS',
        source: 'Online',
        delivery_method: deliveryMethod,
        recipient_name: deliveryMethod === 'Maxim Delivery' ? recipientName : user.name,
        delivery_address: deliveryMethod === 'Maxim Delivery' ? deliveryAddress : null,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const result = await createTransaction(transactionData);
      
      if (result.success) {
        clearCart();
        setIsCartOpen(false);
        router.push(`/cart/success?id=${result.transactionId}`);
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

  if (!isCartOpen && !shouldRender) return null;

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-8 transition-all duration-300 ${isCartOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"}`}>
        {/* Backdrop */}
        <div 
        className={`absolute inset-0 bg-zinc-900/60 backdrop-blur-md transition-opacity duration-500 ${isCartOpen ? "opacity-100" : "opacity-0"}`} 
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Modal Panel - Centered on Desktop, Full Screen on Mobile */}
      <div className={`relative w-full h-full md:h-auto md:max-h-[95vh] md:max-w-4xl bg-white md:rounded-[48px] shadow-[0_32px_80px_rgba(0,0,0,0.15)] flex flex-col md:flex-row overflow-y-auto md:overflow-hidden transform transition-all duration-500 ${isCartOpen ? "scale-100 opacity-100 translate-y-0" : "scale-100 opacity-0 translate-y-full md:translate-y-12"}`}>
        
        {/* Main Area: Combined scroll on mobile */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto custom-scrollbar">
        
        {/* Left Side: Items & Header (2/3 width) */}
        <div className="flex-1 flex flex-col min-w-0 md:border-r border-zinc-100 md:h-full">
          {/* Header */}
          <div className="sticky top-0 z-20 px-6 md:px-10 py-5 md:py-10 border-b border-zinc-100 flex items-center justify-between bg-white/95 backdrop-blur-sm">
            <div className="flex items-center gap-4 md:gap-5">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-[#6B4423] rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl shadow-[#6B4423]/20">
                <ShoppingBag className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-black text-zinc-900 tracking-tight">Pesanan</h2>
                <p className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-1">{cartItems.length} Item</p>
              </div>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-3 bg-red-50 text-red-500 rounded-2xl active:scale-90 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 px-6 md:px-10 py-6 md:py-8 space-y-5">
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
                        onClick={() => {
                          const success = updateQuantity(item.id, item.quantity - 1);
                          if (!success) alert("Waduh bebs, stok roti ini sudah habis!");
                        }} 
                        className="w-10 h-10 flex items-center justify-center bg-white text-zinc-900 rounded-xl shadow-sm hover:bg-[#6B4423] hover:text-white transition-all active:scale-95"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="text-base font-black text-zinc-900 w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => {
                          const success = updateQuantity(item.id, item.quantity + 1);
                          if (!success) alert("Waduh bebs, stok roti ini sudah habis!");
                        }} 
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

        </div>

        {/* Right Side: Payment & Checkout (1/3 width) */}
        <div className="w-full md:w-[400px] bg-zinc-50 flex flex-col border-t md:border-t-0 md:border-l border-zinc-100">
          {/* Header Right */}
          <div className="px-6 md:px-10 py-6 md:py-10 border-b border-zinc-200/50 flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-black text-zinc-900 tracking-tight">Checkout</h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-3 hover:bg-zinc-200 rounded-2xl transition-all hidden md:block"
            >
              <X className="w-6 h-6 text-red-500 hover:text-red-700 transition-colors" />
            </button>
          </div>

          <div className="flex-1 p-6 md:p-10 flex flex-col gap-6 md:gap-8">
            <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <Truck className="w-4 h-4 text-[#6B4423]" />
                 <h3 className="font-black text-zinc-900 text-xs uppercase tracking-widest">Metode Pengiriman</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setDeliveryMethod('Ambil di Toko')}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${deliveryMethod === 'Ambil di Toko' ? 'border-[#6B4423] bg-white shadow-md' : 'border-zinc-200 bg-zinc-100/50 hover:border-zinc-300'}`}
                >
                  <MapPin className={`w-5 h-5 ${deliveryMethod === 'Ambil di Toko' ? 'text-[#6B4423]' : 'text-zinc-400'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${deliveryMethod === 'Ambil di Toko' ? 'text-zinc-900' : 'text-zinc-500'}`}>Ambil Sendiri</span>
                </button>
                
                <button 
                  onClick={() => setDeliveryMethod('Maxim Delivery')}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${deliveryMethod === 'Maxim Delivery' ? 'border-[#6B4423] bg-white shadow-md' : 'border-zinc-200 bg-zinc-100/50 hover:border-zinc-300'}`}
                >
                  <Truck className={`w-5 h-5 ${deliveryMethod === 'Maxim Delivery' ? 'text-[#6B4423]' : 'text-zinc-400'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${deliveryMethod === 'Maxim Delivery' ? 'text-zinc-900' : 'text-zinc-500'}`}>Maxim Delivery</span>
                </button>
              </div>
              
              <AnimatePresence mode="wait">
                {deliveryMethod === 'Ambil di Toko' ? (
                  <motion.div 
                    key="pickup"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-4 bg-zinc-100/80 rounded-2xl border border-zinc-200"
                  >
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                      Lokasi: Sukarame, Bandar Lampung. <br/>
                      <span className="text-zinc-400">Silakan ambil pesanan Anda setelah status berubah menjadi "Selesai".</span>
                    </p>
                    <a 
                      href="https://maps.app.goo.gl/8NX1PX5WorBVdztb7" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-1.5 text-[9px] font-black text-[#6B4423] hover:underline"
                    >
                      <MapPin className="w-3 h-3" />
                      BUKA GOOGLE MAPS
                    </a>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="maxim"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-3"
                  >
                    <p className="text-[9px] text-amber-700 font-black uppercase tracking-widest leading-relaxed">
                      Lengkapi Data Pengiriman:
                    </p>
                    
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        placeholder="Nama Penerima..."
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-amber-200 transition-all"
                      />
                      <textarea 
                        placeholder="Alamat Lengkap (Patokan/No. Rumah)..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-amber-200 transition-all resize-none h-20"
                      />
                    </div>

                    <p className="text-[8px] text-amber-600/80 font-bold leading-relaxed italic">
                      *Biaya Maxim dibayarkan langsung ke Driver saat roti sampai.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-zinc-100/50 p-6 md:p-8 rounded-[32px] border border-zinc-200/50 text-center space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-[#6B4423]" />
              </div>
              <div>
                <h3 className="font-black text-zinc-900 text-base md:text-lg tracking-tight">Pembayaran QRIS</h3>
                <p className="text-[10px] md:text-xs text-zinc-500 font-medium mt-1">Selesaikan pesanan Anda dengan scan barcode QRIS setelah tombol checkout.</p>
              </div>
            </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-zinc-200 space-y-3">
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
            
          </div>
        </div>
      </div>
    </div>
    </AnimatePresence>
  );
}

