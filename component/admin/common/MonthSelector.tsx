"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface MonthSelectorProps {
  selectedMonth: number; // 1-12
  selectedYear: number;
  onDateChange: (month: number, year: number) => void;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", 
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

export default function MonthSelector({ selectedMonth, selectedYear, onDateChange }: MonthSelectorProps) {
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const isYearly = selectedMonth === 0;

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 bg-white p-6 md:p-8 rounded-[40px] border border-zinc-100 shadow-sm mb-8 flex-shrink-0 transition-all">
      {/* Header & Mode Toggle */}
      <div className="flex items-center justify-between md:border-r border-zinc-100 pr-6 gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FCF1E8] rounded-xl flex items-center justify-center border border-[#6B4423]/10">
            <Calendar className="w-5 h-5 text-[#6B4423]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-900 tracking-tight leading-none mb-1">Filter Periode</h3>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Pilih Laporan</p>
          </div>
        </div>

        <div className="flex bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100">
          <button
            onClick={() => onDateChange(new Date().getMonth() + 1, selectedYear)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              !isYearly 
                ? "bg-white text-[#6B4423] shadow-md border border-zinc-100" 
                : "text-zinc-400 hover:text-zinc-600"
            }`}
          >
            Bulanan
          </button>
          <button
            onClick={() => onDateChange(0, selectedYear)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              isYearly 
                ? "bg-white text-[#6B4423] shadow-md border border-zinc-100" 
                : "text-zinc-400 hover:text-zinc-600"
            }`}
          >
            Tahunan
          </button>
        </div>
      </div>

      {/* Selects */}
      <div className="flex flex-wrap items-center gap-4">
        {!isYearly && (
          <div className="relative group min-w-[130px]">
            <select
              value={selectedMonth}
              onChange={(e) => onDateChange(parseInt(e.target.value), selectedYear)}
              className="w-full bg-zinc-50 border-2 border-zinc-100 py-4 pl-6 pr-14 rounded-2xl focus:outline-none focus:border-[#6B4423]/20 text-sm font-black text-zinc-900 appearance-none transition-all cursor-pointer hover:bg-zinc-100"
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronRight className="w-4 h-4 text-zinc-400 rotate-90" />
            </div>
          </div>
        )}

        <div className="relative group min-w-[140px]">
          <select
            value={selectedYear}
            onChange={(e) => onDateChange(selectedMonth, parseInt(e.target.value))}
            className="w-full bg-zinc-50 border-2 border-zinc-100 py-4 pl-6 pr-14 rounded-2xl focus:outline-none focus:border-[#6B4423]/20 text-sm font-black text-zinc-900 appearance-none transition-all cursor-pointer hover:bg-zinc-100"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronRight className="w-4 h-4 text-zinc-400 rotate-90" />
          </div>
        </div>
      </div>
    </div>
  );
}
