"use client";

import React, { useRef } from "react";
import { 
  TrendingUp, 
  Wallet, 
  Users, 
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import MonthSelector from "../common/MonthSelector";
import { useRouter } from "next/navigation";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ProfitLossData {
  revenue: number;
  expenses: number;
  expensesByCategory: Record<string, number>;
  salaries: number;
  netProfit: number;
  targetPeriod: { month: number, year: number };
}

export default function ProfitLossManager({ data }: { data: ProfitLossData }) {
  const router = useRouter();
  const { revenue, expenses, expensesByCategory, salaries, netProfit, targetPeriod } = data;
  const isProfit = netProfit >= 0;

  const handleDateChange = (month: number, year: number) => {
    router.push(`/admin/profit-loss?month=${month}&year=${year}`);
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isYearly = targetPeriod.month === 0;

  const getReportHeader = () => {
    const monthName = !isYearly ? new Date(targetPeriod.year, targetPeriod.month - 1, 1).toLocaleDateString('id-ID', { month: 'long' }) : "";
    
    const periodStr = isYearly 
      ? `Laporan Laba Rugi Tahunan: ${targetPeriod.year}`
      : `Laporan Laba Rugi: ${monthName} ${targetPeriod.year}`;

    return {
      title: "BREADGIFT",
      address: "Gg. Mushola Tawakal No.69, Sukarame, Kec. Sukarame, Kota Bandar Lampung, Lampung 35122",
      period: periodStr
    };
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

  const handleExportExcel = async () => {
    const header = getReportHeader();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Laba Rugi");

    try {
      const logoBase64 = await getBase64Image("/assets/Logo.png");
      const logoId = workbook.addImage({ base64: logoBase64, extension: 'png' });

      worksheet.mergeCells('A1:C2');
      worksheet.addImage(logoId, {
        tl: { col: 0.8, row: 0.35 },
        ext: { width: 71, height: 71 } 
      });

      const titleCell = worksheet.getCell('A1');
      titleCell.value = `  ${header.title}`;
      titleCell.font = { size: 34, bold: true, color: { argb: 'FF6B4423' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.mergeCells('A3:C3');
      const addressCell = worksheet.getCell('A3');
      addressCell.value = header.address;
      addressCell.font = { size: 9, color: { argb: 'FF888888' } };
      addressCell.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.mergeCells('A4:C4');
      const periodCell = worksheet.getCell('A4');
      periodCell.value = header.period;
      periodCell.font = { bold: true, size: 11 };
      periodCell.alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.addRow([]);
      
      const tableHeader = worksheet.addRow(['Keterangan', '', 'Nilai (Rp)']);
      tableHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      tableHeader.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B4423' } };
      });

      worksheet.addRow(['Total Pendapatan', '', revenue]).getCell(3).numFmt = '#,##0';
      
      const expenseHeader = worksheet.addRow(['Total Pengeluaran Operasional', '', expenses]);
      expenseHeader.getCell(3).numFmt = '#,##0';
      expenseHeader.getCell(1).font = { bold: true };

      Object.entries(expensesByCategory).forEach(([category, amount]) => {
        const row = worksheet.addRow([`  - ${category}`, '', amount]);
        row.getCell(3).numFmt = '#,##0';
        row.getCell(1).font = { italic: true };
      });

      worksheet.addRow(['Total Gaji Karyawan', '', salaries]).getCell(3).numFmt = '#,##0';
      
      const profitRow = worksheet.addRow(['LABA / RUGI BERSIH', '', netProfit]);
      profitRow.font = { bold: true };
      profitRow.getCell(3).numFmt = '#,##0';
      profitRow.getCell(3).font = { color: { argb: isProfit ? 'FF10B981' : 'FFEF4444' }, bold: true };

      worksheet.getColumn(1).width = 40;
      worksheet.getColumn(3).width = 25;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Laporan_Laba_Rugi_${targetPeriod.month}_${targetPeriod.year}.xlsx`);
    } catch (error) {
      console.error(error);
    }
  };

  const saveAs = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const header = getReportHeader();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    try {
      const logoBase64 = await getBase64Image("/assets/Logo.png");
      doc.addImage(logoBase64, 'PNG', (pageWidth - 20) / 2 - 25, 12, 18.9, 18.9);
      doc.setFontSize(32);
      doc.setTextColor(107, 68, 35);
      doc.text(header.title, (pageWidth + 20) / 2 - 25, 24.5);
      
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(header.address, pageWidth / 2, 38, { align: "center" });
      
      doc.setDrawColor(220, 220, 220);
      doc.line(30, 34, pageWidth - 30, 34);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(header.period, pageWidth / 2, 48, { align: "center" });

      autoTable(doc, {
        startY: 58,
        head: [['Keterangan', 'Nilai (Rp)']],
        body: [
          ['Total Pendapatan', `Rp ${revenue.toLocaleString('id-ID')}`],
          ['Total Pengeluaran Operasional', `Rp ${expenses.toLocaleString('id-ID')}`],
          ...Object.entries(expensesByCategory).map(([cat, val]) => [
            `   - ${cat}`, `Rp ${val.toLocaleString('id-ID')}`
          ]),
          ['Total Gaji Karyawan', `Rp ${salaries.toLocaleString('id-ID')}`],
          [
            { content: 'LABA / RUGI BERSIH', styles: { fontStyle: 'bold' } },
            { content: `Rp ${netProfit.toLocaleString('id-ID')}`, styles: { fontStyle: 'bold', textColor: isProfit ? [16, 185, 129] : [239, 68, 68] } }
          ]
        ],
        theme: 'grid',
        headStyles: { fillColor: [107, 68, 35] },
        styles: { fontSize: 10, cellPadding: 8 }
      });

      doc.save(`Laporan_Laba_Rugi_${targetPeriod.month}_${targetPeriod.year}.pdf`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-8 h-fit lg:h-full lg:overflow-y-auto pr-4 custom-scrollbar pb-20 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Laporan Laba Rugi</h1>
          <p className="text-sm text-zinc-500 font-medium tracking-wide uppercase italic">
            Ringkasan Keuangan Periode {isYearly ? `Tahun ${targetPeriod.year}` : new Date(targetPeriod.year, targetPeriod.month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-wrap items-stretch gap-4">
          <button 
            onClick={handleExportExcel}
            className="bg-white p-4 rounded-[24px] border border-zinc-200 shadow-sm flex items-center gap-4 hover:border-[#6B4423]/40 hover:bg-[#FCF1E8]/20 transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-[#6B4423] transition-all">
              <FileSpreadsheet className="w-5 h-5 text-zinc-400 group-hover:text-white" />
            </div>
            <div className="text-left">
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Download</p>
              <p className="text-xs font-black text-zinc-900 group-hover:text-[#6B4423]">Excel</p>
            </div>
          </button>

          <button 
            onClick={handleExportPDF}
            className="bg-white p-4 rounded-[24px] border border-zinc-200 shadow-sm flex items-center gap-4 hover:border-red-500/40 hover:bg-red-50/20 transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-red-500 transition-all">
              <FileText className="w-5 h-5 text-zinc-400 group-hover:text-white" />
            </div>
            <div className="text-left">
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Download</p>
              <p className="text-xs font-black text-zinc-900 group-hover:text-red-600">PDF</p>
            </div>
          </button>
        </div>
      </div>

      <MonthSelector 
        selectedMonth={targetPeriod.month}
        selectedYear={targetPeriod.year}
        onDateChange={handleDateChange}
      />

      {/* Main Stats Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Pendapatan</p>
          <p className="text-xl font-black text-zinc-900">{formatIDR(revenue)}</p>
        </div>

        {/* Expenses Card */}
        <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
            <Wallet className="w-6 h-6 text-rose-500" />
          </div>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Pengeluaran</p>
          <p className="text-xl font-black text-zinc-900">{formatIDR(expenses)}</p>
        </div>

        {/* Salaries Card */}
        <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
            <Users className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Gaji</p>
          <p className="text-xl font-black text-zinc-900">{formatIDR(salaries)}</p>
        </div>

        {/* Net Profit Card */}
        <div className={`p-8 rounded-[40px] border shadow-2xl transition-all ${
          isProfit 
            ? "bg-[#6B4423] border-[#6B4423]/20 text-white shadow-[#6B4423]/20" 
            : "bg-rose-600 border-rose-600/20 text-white shadow-rose-600/20"
        }`}>
          <div className="flex justify-between items-start mb-6">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
               <CircleDollarSign className="w-6 h-6 text-white" />
             </div>
             <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter">
                {isProfit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {isProfit ? "PROFIT" : "LOSS"}
             </div>
          </div>
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Laba / Rugi Bersih</p>
          <p className="text-2xl font-black tracking-tight">{formatIDR(netProfit)}</p>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="bg-white rounded-[40px] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-zinc-50 bg-zinc-50/30">
          <h3 className="text-lg font-black text-zinc-900 tracking-tight">Rincian Perhitungan</h3>
        </div>
        <div className="p-10 space-y-8">
           <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center text-sm">
                 <span className="font-bold text-zinc-500">Pendapatan Kotor</span>
                 <span className="font-black text-emerald-600">+{formatIDR(revenue)}</span>
              </div>
              <div className="flex flex-col gap-3">
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-zinc-800">Pengeluaran Operasional</span>
                    <span className="font-black text-rose-500">-{formatIDR(expenses)}</span>
                 </div>
                 {Object.entries(expensesByCategory).map(([category, amount]) => (
                   <div key={category} className="flex justify-between items-center text-[13px] ml-4">
                      <span className="font-medium text-zinc-400 italic">└ {category}</span>
                      <span className="font-bold text-zinc-500">-{formatIDR(amount)}</span>
                   </div>
                 ))}
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="font-bold text-zinc-500">Beban Gaji Karyawan</span>
                 <span className="font-black text-rose-500">-{formatIDR(salaries)}</span>
              </div>
              <div className="h-px bg-zinc-100 w-full my-2" />
              <div className="flex justify-between items-center">
                 <span className="text-lg font-black text-zinc-900">Laba Bersih Akhir</span>
                 <span className={`text-2xl font-black ${isProfit ? "text-[#6B4423]" : "text-rose-600"}`}>
                   {formatIDR(netProfit)}
                 </span>
              </div>
           </div>
           
           <div className={`p-6 rounded-3xl border ${isProfit ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"}`}>
              <p className="text-base font-bold leading-relaxed">
                {isProfit 
                  ? "Luar biasa! Bisnis sedang menghasilkan profit bulan ini. Pertahankan performanya ya! ✨" 
                  : "Bulan ini pengeluaran lebih besar dari pendapatan. Coba cek lagi bagian yang bisa dihemat ya! 💪"}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
