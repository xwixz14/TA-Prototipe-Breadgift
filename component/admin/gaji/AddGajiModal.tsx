"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { createSalary } from "@/lib/actions";
import { formatNumber, parseRawNumber, limitValue, MAX_LIMIT_CURRENCY } from "@/lib/utils";

interface AddGajiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddGajiModal({ isOpen, onClose, onSuccess }: AddGajiModalProps) {
  const [employeeName, setEmployeeName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName || !amount || !paymentDate) return;

    setIsSubmitting(true);
    const result = await createSalary({
      employee_name: employeeName,
      amount: Number(amount),
      payment_date: paymentDate
    });

    if (result.success) {
      onSuccess();
      setEmployeeName("");
      setAmount("");
      onClose();
    } else {
      alert("Gagal menyimpan data gaji");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[500px] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 flex items-center justify-between border-b border-zinc-100">
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Tambah Data Gaji</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-red-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">
              NAMA KARYAWAN
            </label>
            <input
              type="text"
              required
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Masukkan nama karyawan..."
              className="w-full px-6 py-4 bg-[#FBFBFB] border-2 border-transparent focus:border-[#6B4423]/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-zinc-900 placeholder:text-zinc-300 placeholder:font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">
              NOMINAL (RP)
            </label>
            <input
              type="text"
              required
              value={formatNumber(amount)}
              onChange={(e) => {
                const raw = parseRawNumber(e.target.value);
                const limited = limitValue(raw, MAX_LIMIT_CURRENCY);
                setAmount(limited.toString());
              }}
              placeholder="0"
              className="w-full px-6 py-4 bg-[#FBFBFB] border-2 border-transparent focus:border-[#6B4423]/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-zinc-900 placeholder:text-zinc-300 placeholder:font-bold"
            />
          </div>


          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">
              TANGGAL PEMBAYARAN
            </label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-6 py-4 bg-[#FBFBFB] border-2 border-transparent focus:border-[#6B4423]/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-[#6B4423] text-white rounded-[24px] font-black text-lg shadow-xl shadow-[#6B4423]/20 hover:bg-[#5A391D] transition-all active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {isSubmitting && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Simpan Data
          </button>
        </form>
      </div>
    </div>
  );
}
