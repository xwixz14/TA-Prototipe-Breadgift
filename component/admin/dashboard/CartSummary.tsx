"use client";

import React from "react";
import { ShoppingBasket, Trash2, Banknote, QrCode, Minus, Plus } from "lucide-react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartSummaryProps {
  items: CartItem[];
  paymentMethod: "Tunai" | "QRIS";
  setPaymentMethod: (method: "Tunai" | "QRIS") => void;
  onUpdateQuantity: (id: number, delta: number) => void;
  onSetQuantity: (id: number, qty: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export default function CartSummary({
  items,
  paymentMethod,
  setPaymentMethod,
  onUpdateQuantity,
  onSetQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout
}: CartSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; // Can add tax/discount here if needed

  return (
    <div className="w-full lg:w-[450px] bg-white border border-zinc-100 rounded-[32px] p-8 flex flex-col h-fit lg:h-full shadow-2xl shadow-zinc-100/50 min-h-0">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-zinc-900 flex items-center gap-3">
          Ringkasan Pembayaran
        </h2>
        {items.length > 0 && (
          <span className="bg-[#6B4423]/10 text-[#6B4423] text-[11px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm border border-[#6B4423]/10">
            {items.reduce((sum, i) => sum + i.quantity, 0)} Item
          </span>
        )}
      </div>

      <div className="mb-6">
        <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Item Dipilih</span>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto min-h-[300px] mb-8 pr-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 bg-zinc-50 rounded-[28px] border-2 border-dashed border-zinc-200 p-10 opacity-60">
            <div className="p-5 bg-white rounded-full shadow-sm">
              <ShoppingBasket className="w-10 h-10 text-zinc-300" />
            </div>
            <p className="text-sm font-bold text-zinc-400 text-center leading-relaxed">
              Keranjang masih kosong<br/>
              <span className="text-[11px] font-medium opacity-70">Pilih roti di sebelah kiri</span>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 group">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-extrabold text-zinc-800 tracking-tight">{item.name}</span>
                    <span className="text-xs font-bold text-zinc-400">
                      Rp {item.price.toLocaleString("id-ID")} x {item.quantity}
                    </span>
                    <span className="text-sm font-black text-[#6B4423] mt-0.5">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-3 bg-zinc-100/80 p-1 rounded-xl ring-1 ring-zinc-200/50 shadow-sm">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1.5 hover:bg-white hover:text-[#6B4423] rounded-lg transition-all text-zinc-400 active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input 
                        type="text"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          onSetQuantity(item.id, val === "" ? 0 : parseInt(val));
                        }}
                        className="w-10 bg-transparent text-xs font-black text-zinc-800 text-center focus:outline-none focus:ring-1 focus:ring-[#6B4423]/20 rounded"
                      />
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1.5 hover:bg-white hover:text-[#6B4423] rounded-lg transition-all text-zinc-400 active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Calculations */}
      <div className="space-y-4 pt-6 border-t border-zinc-100 mb-8">
        <div className="flex justify-between items-center px-2">
          <span className="text-sm font-bold text-zinc-400">Sub total</span>
          <span className="text-sm font-black text-zinc-600">Rp {subtotal.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-6 bg-[#FCF1E8]/30 rounded-2xl border border-[#FCF1E8]">
          <div className="flex flex-col gap-0.5">
             <span className="text-xs font-bold text-[#6B4423] uppercase tracking-widest opacity-60">Total pembayaran</span>
             <span className="text-3xl font-black text-[#6B4423]">Rp {total.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Toggle */}
      <div className="space-y-3 mb-10">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Metode pembayaran:</span>
        <div className="flex gap-3 p-1.5 bg-zinc-100/50 rounded-2xl border border-zinc-100">
          <button 
            onClick={() => setPaymentMethod("Tunai")}
            className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-bold transition-all ${
              paymentMethod === "Tunai" 
                ? "bg-white text-[#6B4423] shadow-sm ring-1 ring-zinc-200" 
                : "text-zinc-400 hover:bg-white/50"
            }`}
          >
            <Banknote className="w-4 h-4" />
            Tunai
          </button>
          <button 
            onClick={() => setPaymentMethod("QRIS")}
            className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-bold transition-all ${
              paymentMethod === "QRIS" 
                ? "bg-white text-[#6B4423] shadow-sm ring-1 ring-zinc-200" 
                : "text-zinc-400 hover:bg-white/50"
            }`}
          >
            <QrCode className="w-4 h-4" />
            QRIS
          </button>
        </div>
      </div>

      {/* Final Actions */}
      <div className="flex flex-col gap-3">
        <button 
          disabled={items.length === 0}
          onClick={onCheckout}
          className="w-full py-5 bg-[#6B4423] text-white rounded-[20px] text-lg font-black shadow-lg shadow-[#6B4423]/20 hover:bg-[#5D3822] hover:shadow-[#6B4423]/40 transition-all active:scale-95 disabled:bg-zinc-200 disabled:shadow-none"
        >
          Bayar
        </button>
        <button 
          disabled={items.length === 0}
          onClick={onClearCart}
          className="w-full py-4 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Trash2 className="w-4 h-4" />
          Hapus keranjang
        </button>
      </div>
    </div>
  );
}
