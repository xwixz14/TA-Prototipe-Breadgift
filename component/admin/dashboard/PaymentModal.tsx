
"use client";

import React, { useState, useEffect } from "react";
import { X, Banknote, QrCode } from "lucide-react";
import { formatNumber, parseRawNumber, limitValue, MAX_LIMIT_CURRENCY } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  paymentMethod: "Tunai" | "QRIS";
  setPaymentMethod: (method: "Tunai" | "QRIS") => void;
  onConfirm: (amountPaid: number) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  totalAmount,
  paymentMethod,
  setPaymentMethod,
  onConfirm
}: PaymentModalProps) {
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const quickAmounts = [50000, 100000, 150000, 200000];

  useEffect(() => {
    if (paymentMethod === "QRIS") {
      setAmountPaid(totalAmount);
    } else {
      setAmountPaid(0);
    }
  }, [paymentMethod, totalAmount, isOpen]);

  if (!isOpen) return null;

  const change = Math.max(0, amountPaid - totalAmount);
  const isValid = amountPaid >= totalAmount;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-zinc-100">
          <h2 className="text-2xl font-black text-zinc-900">Pembayaran</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-red-500" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-8 space-y-8">
          <p className="text-zinc-500 font-medium">Silakan pilih metode pembayaran dan masukkan jumlah yang dibayarkan</p>
          
          {/* Total Display */}
          <div className="bg-[#FCF1E8] p-6 rounded-3xl border border-[#FCF1E8] flex justify-between items-center">
            <span className="text-sm font-bold text-[#6B4423]">Total yang harus dibayar:</span>
            <span className="text-2xl font-black text-[#6B4423]">Rp {totalAmount.toLocaleString("id-ID")}</span>
          </div>

          <div className="space-y-6">
             <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Metode pembayaran</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setPaymentMethod("Tunai")}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'Tunai' ? 'border-[#6B4423] bg-[#6B4423]/5 text-[#6B4423]' : 'border-zinc-100 text-zinc-400 opacity-50 hover:border-zinc-200'}`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="font-bold">Tunai</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod("QRIS")}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'QRIS' ? 'border-[#6B4423] bg-[#6B4423]/5 text-[#6B4423]' : 'border-zinc-100 text-zinc-400 opacity-50 hover:border-zinc-200'}`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="font-bold">QRIS</span>
                  </button>
                </div>
             </div>

             {paymentMethod === "Tunai" ? (
               <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Jumlah bayar</label>
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-zinc-400">Rp</span>
                       <input 
                        type="text"
                        autoFocus
                        value={formatNumber(amountPaid)}
                        onChange={(e) => {
                          const raw = parseRawNumber(e.target.value);
                          const limited = limitValue(raw, MAX_LIMIT_CURRENCY);
                          setAmountPaid(limited);
                        }}
                        className="w-full bg-zinc-50 border border-zinc-200 py-5 pl-14 pr-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B4423]/10 focus:border-[#6B4423] text-xl font-bold transition-all"
                        placeholder="Masukkan nominal..."
                       />
                    </div>
                  </div>

                  {/* Quick Amounts */}
                  <div className="grid grid-cols-4 gap-3">
                    {quickAmounts.map((amt) => (
                      <button 
                        key={amt}
                        onClick={() => setAmountPaid(amt)}
                        className="py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold text-zinc-600 hover:border-[#6B4423]/30 hover:bg-white transition-all shadow-sm"
                      >
                        Rp {amt.toLocaleString("id-ID")}
                      </button>
                    ))}
                  </div>

                  {/* Change Calculation */}
                  <div className="flex justify-between items-center p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <span className="text-sm font-bold text-zinc-500">Kembalian:</span>
                    <span className={`text-xl font-black ${change > 0 ? 'text-green-600' : 'text-zinc-300'}`}>
                      Rp {change.toLocaleString("id-ID")}
                    </span>
                  </div>
               </div>
             ) : (
                <div className="flex flex-col items-center gap-8 py-6 animate-in fade-in zoom-in duration-700">
                  <div className="relative group">
                    {/* Glossy Card Effect */}
                    <div className="absolute -inset-4 bg-zinc-100/50 rounded-[48px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative p-6 bg-white border-2 border-zinc-100 rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] flex items-center justify-center transition-transform duration-500 hover:scale-[1.05]">
                      <img 
                        src="/assets/qris_offline.png" 
                        alt="QRIS Barcode" 
                        className="w-full max-w-[400px] h-auto object-contain"
                      />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">Scan untuk Membayar</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Tunjukkan barcode ini kepada pelanggan</p>
                  </div>
                </div>
             )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-zinc-50/50 border-t border-zinc-100">
           <button 
            disabled={!isValid}
            onClick={() => onConfirm(amountPaid)}
            className="w-full py-5 bg-[#6B4423] text-white rounded-3xl text-lg font-black shadow-xl shadow-[#6B4423]/20 hover:bg-[#5D3822] hover:scale-[1.01] transition-all disabled:bg-zinc-200 disabled:shadow-none active:scale-[0.98]"
           >
            {paymentMethod === "QRIS" ? "Konfirmasi Pembayaran QRIS" : "Bayar Sekarang"}
           </button>
        </div>
      </div>
    </div>
  );
}
