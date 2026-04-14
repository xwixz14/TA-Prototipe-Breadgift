"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface StockAlertProps {
  lowStockCount: number;
}

export default function StockAlert({ lowStockCount }: StockAlertProps) {
  if (lowStockCount === 0) return null;

  return (
    <div className="bg-[#FFF9E6] border border-[#FFE7A3] text-[#856404] px-6 py-4 rounded-2xl flex items-center gap-3 mb-8 shadow-sm">
      <AlertCircle className="w-5 h-5" />
      <p className="text-sm font-bold tracking-tight">
        {lowStockCount} barang memiliki stok di bawah minimum
      </p>
    </div>
  );
}
