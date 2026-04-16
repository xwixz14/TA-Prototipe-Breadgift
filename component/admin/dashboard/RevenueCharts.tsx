"use client";

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from "recharts";
import { TrendingUp, ShoppingCart, Store, ArrowUpRight, ArrowDownRight, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface RevenueChartsProps {
  chartData: any[];
  summary: {
    posTotal: number;
    onlineTotal: number;
    categoryTotals: { [key: string]: number };
  };
}

export default function RevenueCharts({ chartData, summary }: RevenueChartsProps) {
  const totalRevenue = summary.posTotal + summary.onlineTotal;

  const getReportHeader = () => {
    return {
      title: "BREADGIFT",
      address: "Gg. Mushola Tawakal No.69, Sukarame, Kec. Sukarame, Kota Bandar Lampung, Lampung 35122",
      period: `Periode: 7 Hari Terakhir (${chartData[0]?.fullDate || ""} - ${chartData[6]?.fullDate || ""})`
    };
  };

  // Helper to convert image URL to Base64
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
    const worksheet = workbook.addWorksheet("Laporan Pendapatan");

    try {
      // Add Logo
      const logoBase64 = await getBase64Image("/assets/Logo.png");
      const logoId = workbook.addImage({
        base64: logoBase64,
        extension: 'png',
      });

      // Adjust column widths
      worksheet.columns = [
        { width: 20 }, // Tanggal
        { width: 15 }, // Roti Isi
        { width: 15 }, // Roti Tawar
        { width: 15 }, // Donat
        { width: 20 }, // POS
        { width: 20 }, // Online
        { width: 20 }, // Total
      ];

      // Add Header Row 1 - Logo and Title Parallel (Centered together)
      worksheet.mergeCells('A1:G2');
      worksheet.getRow(1).height = 65; // Height for ~71px logo
      worksheet.getRow(2).height = 65;

      // Positioning Logo & Title for perfect alignment (1.89 cm = ~71 px)
      worksheet.addImage(logoId, {
        tl: { col: 2.8, row: 0.35 }, // Moved further right to be closer to text
        ext: { width: 71, height: 71 } 
      });

      const titleCell = worksheet.getCell('A1');
      titleCell.value = `  ${header.title}`; // Reduced spaces from 4 to 2
      titleCell.font = { size: 34, bold: true, color: { argb: 'FF6B4423' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

      // Add a thin separator line below the logo/title
      const lineRow = worksheet.getRow(3);
      lineRow.height = 15;
      worksheet.mergeCells('A3:G3');
      const addressCell = worksheet.getCell('A3');
      addressCell.value = header.address;
      addressCell.font = { size: 9, color: { argb: 'FF888888' } };
      addressCell.alignment = { vertical: 'middle', horizontal: 'center' };
      addressCell.border = { top: { style: 'thin', color: { argb: 'FFDDDDDD' } } };

      worksheet.mergeCells('A4:G4');
      const periodCell = worksheet.getCell('A4');
      periodCell.value = header.period;
      periodCell.font = { bold: true, size: 11 };
      periodCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(4).height = 25;

      // Add some spacing
      worksheet.addRow([]);

      // Table Header (Row 6)
      const headerRow = worksheet.getRow(6);
      headerRow.values = ['Tanggal', 'Roti Isi', 'Roti Tawar', 'Donat', 'Pendapatan POS', 'Pendapatan Online', 'Total Harian'];
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF6B4423' }
        };
        cell.alignment = { horizontal: 'center' };
      });

      // Add Data
      chartData.forEach((d, index) => {
        const row = worksheet.addRow([
          d.fullDate || d.name,
          d["Roti Isi"] || 0,
          d["Roti Tawar"] || 0,
          d["Donat"] || 0,
          d.POS,
          d.Online,
          d.POS + d.Online
        ]);
        row.getCell(1).alignment = { horizontal: 'center' };
        for (let i = 2; i <= 7; i++) {
          row.getCell(i).numFmt = '#,##0';
        }
      });

      // Add Grand Total
      const totalRow = worksheet.addRow([
        'GRAND TOTAL',
        summary.categoryTotals["Roti Isi"] || 0,
        summary.categoryTotals["Roti Tawar"] || 0,
        summary.categoryTotals["Donat"] || 0,
        summary.posTotal,
        summary.onlineTotal,
        totalRevenue
      ]);
      totalRow.font = { bold: true };
      totalRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' }
        };
      });
      for (let i = 2; i <= 7; i++) {
        totalRow.getCell(i).numFmt = '#,##0';
      }

      // Buffer and Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const dateStr = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
      anchor.href = url;
      anchor.download = `Laporan_Pendapatan_BreadGift_${dateStr}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Excel Export Error:", error);
    }
  };

  const handleExportPDF = async () => {
    const header = getReportHeader();
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('id-ID');
    const pageWidth = doc.internal.pageSize.getWidth();

    try {
      // Setup Fonts for width calculation
      doc.setFontSize(32); 
      doc.setFont("helvetica", "bold");
      
      const logoWidth = 18.9; 
      const logoHeight = 18.9;
      const spacing = 0.5; // Minimal spacing to keep them close
      const titleWidth = doc.getTextWidth(header.title);
      const totalHeaderWidth = logoWidth + spacing + titleWidth;
      const startX = (pageWidth - totalHeaderWidth) / 2;

      // Add Logo and Title Side-by-Side (Parallel)
      const logoBase64 = await getBase64Image("/assets/Logo.png");
      doc.addImage(logoBase64, 'PNG', startX, 12, logoWidth, logoHeight); 

      doc.setTextColor(107, 68, 35); // Brand Brown
      doc.text(header.title, startX + logoWidth + spacing, 24.5); 
      
      // Address - Centered below with line
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text(header.address, pageWidth / 2, 38, { align: "center" });
      
      doc.setLineWidth(0.2);
      doc.setDrawColor(220, 220, 220);
      doc.line(30, 34, pageWidth - 30, 34); // Adjusted line Y

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(header.period, pageWidth / 2, 38, { align: "center" });

      // Table
      const tableData = chartData.map(d => [
        d.fullDate || d.name,
        `Rp ${Number(d["Roti Isi"] || 0).toLocaleString("id-ID")}`,
        `Rp ${Number(d["Roti Tawar"] || 0).toLocaleString("id-ID")}`,
        `Rp ${Number(d["Donat"] || 0).toLocaleString("id-ID")}`,
        `Rp ${Number(d.POS).toLocaleString("id-ID")}`,
        `Rp ${Number(d.Online).toLocaleString("id-ID")}`,
        `Rp ${Number(d.POS + d.Online).toLocaleString("id-ID")}`
      ]);

      // Total Row
      tableData.push([
        { content: 'GRAND TOTAL', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
        { content: `Rp ${Number(summary.categoryTotals["Roti Isi"] || 0).toLocaleString("id-ID")}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
        { content: `Rp ${Number(summary.categoryTotals["Roti Tawar"] || 0).toLocaleString("id-ID")}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
        { content: `Rp ${Number(summary.categoryTotals["Donat"] || 0).toLocaleString("id-ID")}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
        { content: `Rp ${Number(summary.posTotal).toLocaleString("id-ID")}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
        { content: `Rp ${Number(summary.onlineTotal).toLocaleString("id-ID")}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
        { content: `Rp ${Number(totalRevenue).toLocaleString("id-ID")}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }
      ]);

      autoTable(doc, {
        startY: 52,
        head: [['Tanggal', 'Roti Isi', 'Roti Tawar', 'Donat', 'Kasir (POS)', 'Online', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [107, 68, 35], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'right' },
          6: { halign: 'right' }
        }
      });

      const fileNameDate = dateStr.replace(/\//g, '-');
      doc.save(`Laporan_Pendapatan_BreadGift_${fileNameDate}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
    }
  };




  return (
    <div className="flex-1 flex flex-col gap-8 h-full overflow-y-auto pr-2 custom-scrollbar pb-10">
      {/* Header & Overall Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Laporan Pendapatan</h1>
          <p className="text-sm text-zinc-500 font-medium">Analisis performa penjualan Kasir vs Online.</p>
        </div>

        <div className="flex items-stretch gap-6">
          <button 
            onClick={handleExportExcel}
            className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm flex flex-col justify-between min-w-[200px] hover:border-[#6B4423]/40 hover:bg-[#FCF1E8]/20 transition-all active:scale-95 text-left group"
          >
            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-[#6B4423] transition-all">
              <FileSpreadsheet className="w-5 h-5 text-zinc-400 group-hover:text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Download Format .xlsx</p>
              <p className="text-sm font-black text-zinc-900 group-hover:text-[#6B4423]">Ekspor Excel</p>
            </div>
          </button>

          <button 
            onClick={handleExportPDF}
            className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-200 shadow-sm flex flex-col justify-between min-w-[200px] hover:border-red-500/40 hover:bg-red-50/20 transition-all active:scale-95 text-left group"
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:bg-red-500 transition-all shadow-sm">
              <FileText className="w-5 h-5 text-zinc-400 group-hover:text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Download Format .pdf</p>
              <p className="text-sm font-black text-zinc-900 group-hover:text-red-600">Ekspor PDF</p>
            </div>
          </button>


          <div className="bg-[#6B4423] p-6 rounded-[32px] shadow-2xl shadow-[#6B4423]/20 text-white min-w-[280px]">
            <div className="flex justify-between items-start mb-4">
               <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                 <TrendingUp className="w-5 h-5 text-white" />
               </div>
               <span className="flex items-center gap-1 text-[10px] font-black bg-white/20 px-2 py-1 rounded-lg">
                 <ArrowUpRight className="w-3 h-3" />
                 +12.5%
               </span>
            </div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Total Pendapatan Kotor</p>
            <p className="text-3xl font-black tracking-tighter">Rp. {totalRevenue.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100">
            <Store className="w-7 h-7 text-[#6B4423]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Penjualan Kasir (POS)</p>
            <p className="text-2xl font-black text-zinc-900">Rp. {summary.posTotal.toLocaleString("id-ID")}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-[#FCF1E8] rounded-2xl flex items-center justify-center border border-[#6B4423]/10">
            <ShoppingCart className="w-7 h-7 text-[#6B4423]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Penjualan Online</p>
            <p className="text-2xl font-black text-zinc-900">Rp. {summary.onlineTotal.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-zinc-900">Tren Penjualan 7 Hari Terakhir</h3>
            <p className="text-xs text-zinc-400 font-medium">Perbandingan volume transaksi harian.</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#6B4423] rounded-full" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Kasir</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#3B82F6] rounded-full" />
                <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Online</span>
             </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B4423" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6B4423" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E2E2" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#18181B', fontSize: 11, fontWeight: 900}} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#18181B', fontSize: 11, fontWeight: 900}}
                tickFormatter={(value) => `Rp ${value / 1000}k`}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{borderRadius: '24px', border: '1px solid #F0F0F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '24px'}}
                itemStyle={{fontSize: '13px', fontWeight: '900'}}
                labelStyle={{fontSize: '11px', fontWeight: '900', color: '#6B4423', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em'}}
              />
              <Area 
                type="monotone" 
                dataKey="POS" 
                stroke="#6B4423" 
                strokeWidth={5}
                fillOpacity={1} 
                fill="url(#colorPos)" 
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="Online" 
                stroke="#3B82F6" 
                strokeWidth={5}
                fillOpacity={1} 
                fill="url(#colorOnline)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-zinc-900 p-8 rounded-[40px] text-white flex flex-col gap-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Distribusi Pendapatan</h3>
            <div className="flex flex-col gap-4">
               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                     <span>Kasir</span>
                     <span>{Math.round((summary.posTotal / totalRevenue) * 100) || 0}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-[#6B4423] transition-all duration-1000" 
                        style={{ width: `${(summary.posTotal / totalRevenue) * 100}%` }}
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-white">
                     <span>Online</span>
                     <span>{Math.round((summary.onlineTotal / totalRevenue) * 100) || 0}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-[#3B82F6] transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                        style={{ width: `${(summary.onlineTotal / totalRevenue) * 100}%` }}
                     />
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-[#FCF1E8] p-8 rounded-[40px] flex flex-col justify-center gap-2">
            <p className="text-[10px] font-black text-[#6B4423] uppercase tracking-[0.3em]">Quick Tip</p>
            <h3 className="text-xl font-black text-[#6B4423] tracking-tight">Maksimalkan Penjualan Online!</h3>
            <p className="text-sm text-[#6B4423]/60 font-medium leading-relaxed">
              Tren menunjukkan peningkatan pesanan online pada hari libur. Pastikan stok produk populer selalu tersedia.
            </p>
         </div>
      </div>
    </div>
  );
}
