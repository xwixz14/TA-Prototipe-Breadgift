"use client";

import React, { useState } from "react";
import { Trash2, Calendar, ReceiptText, Loader2 } from "lucide-react";
import { deleteSalary } from "@/lib/actions";
import jsPDF from "jspdf";

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
  const [isPrinting, setIsPrinting] = useState<number | null>(null);

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

  const getBase64Image = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handlePrintSlip = async (s: Salary) => {
    setIsPrinting(s.id);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [100, 150] // Receipt size format
      });

      // Fetch Logo
      const logoBase64 = await getBase64Image("/assets/Logo.png");
      
      // Header
      doc.addImage(logoBase64, 'PNG', 40, 10, 20, 20); 
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(107, 68, 35); // #6B4423
      doc.text("BREADGIFT", 50, 36, { align: "center" });

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "normal");
      doc.text("Gg. Mushola Tawakal No.69, Sukarame", 50, 42, { align: "center" });
      doc.text("Bandar Lampung, Lampung 35122", 50, 46, { align: "center" });

      // Divider
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(10, 52, 90, 52);

      // Title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("SLIP GAJI KARYAWAN", 50, 62, { align: "center" });

      // Details
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      
      doc.text("Tanggal", 10, 75);
      doc.text(`: ${formatDate(s.payment_date)}`, 30, 75);
      
      doc.text("Nama", 10, 83);
      doc.setFont("helvetica", "bold");
      doc.text(`: ${s.employee_name}`, 30, 83);
      
      // Amount Box
      doc.setFillColor(252, 241, 232); // #FCF1E8
      doc.roundedRect(10, 92, 80, 18, 3, 3, 'F');
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(107, 68, 35);
      doc.text("Total Diterima", 15, 100);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(formatIDR(s.amount), 85, 104, { align: "right" });

      // Footer
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(10, 120, 90, 120);

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.text("Terima kasih atas dedikasi dan kerja keras Anda", 50, 128, { align: "center" });
      doc.text("untuk BreadGift Bakery.", 50, 132, { align: "center" });

      // Download
      const filename = `Slip_Gaji_${s.employee_name.replace(/\s+/g, '_')}_${new Date(s.payment_date).toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

    } catch (error) {
      console.error("Gagal mencetak slip gaji:", error);
      alert("Gagal memuat dokumen slip gaji. Pastikan koneksi internet stabil.");
    } finally {
      setIsPrinting(null);
    }
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
              <th className="px-10 py-8 text-[11px] font-black text-zinc-400 tracking-widest uppercase text-center w-40">
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
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handlePrintSlip(s)}
                        disabled={isPrinting === s.id}
                        title="Cetak Slip Gaji"
                        className="p-2.5 text-zinc-400 hover:text-[#6B4423] hover:bg-[#FCF1E8] rounded-xl transition-all disabled:opacity-50"
                      >
                        {isPrinting === s.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <ReceiptText className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => onDeleteRequest(s.id)}
                        title="Hapus Data"
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
