"use client";

import React from "react";
import { Trash2, Calendar } from "lucide-react";
import { deleteSalary } from "@/lib/actions";

interface Salary {
  id: number;
  employee_name: string;
  amount: number;
  payment_date: string;
}

interface GajiTableProps {
  salaries: Salary[];
  onDeleteRequest: (id: number) => void;
}

export default function GajiTable({ salaries, onDeleteRequest }: GajiTableProps) {
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("Rp", "Rp.");
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <div className="bg-white rounded-[40px] border border-zinc-100 shadow-sm overflow-hidden mb-10">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-50">
              <th className="px-10 py-8 text-[11px] font-black text-zinc-400 tracking-widest uppercase">
                NAMA KARYAWAN
              </th>
              <th className="px-10 py-8 text-[11px] font-black text-zinc-400 tracking-widest uppercase">
                TANGGAL PEMBAYARAN
              </th>
              <th className="px-10 py-8 text-[11px] font-black text-zinc-400 tracking-widest uppercase text-right">
                NOMINAL
              </th>
              <th className="px-10 py-8 text-[11px] font-black text-zinc-400 tracking-widest uppercase text-center w-32">
                AKSI
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {salaries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-10 py-20 text-center text-zinc-400 font-bold">
                  Belum ada data gaji karyawan.
                </td>
              </tr>
            ) : (
              salaries.map((s) => (
                <tr key={s.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-10 py-7">
                    <span className="text-[15px] font-black text-zinc-900 capitalize italic">
                      {s.employee_name}
                    </span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-2 text-zinc-500 font-bold text-sm">
                      <Calendar className="w-4 h-4 text-zinc-300" />
                      {formatDate(s.payment_date)}
                    </div>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <span className="text-base font-black text-[#6B4423]">
                      {formatIDR(s.amount)}
                    </span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex justify-center">
                      <button
                        onClick={() => onDeleteRequest(s.id)}
                        className="p-2.5 text-zinc-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
