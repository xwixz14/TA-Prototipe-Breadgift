"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, UserRound, FileSpreadsheet, FileText } from "lucide-react";
import GajiTable from "./GajiTable";
import AddGajiModal from "./AddGajiModal";
import { deleteSalary } from "@/lib/actions";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import MonthSelector from "../common/MonthSelector";
import { useRouter } from "next/navigation";

interface Salary {
  id: number;
  employee_name: string;
  amount: number;
  payment_date: string;
}

interface GajiManagerProps {
  initialSalaries: Salary[];
  currentMonth: number;
  currentYear: number;
}

export default function GajiManager({ initialSalaries, currentMonth, currentYear }: GajiManagerProps) {
  const router = useRouter();
  const [salaries, setSalaries] = useState<Salary[]>(initialSalaries);

  useEffect(() => {
    setSalaries(initialSalaries);
  }, [initialSalaries]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const filteredSalaries = salaries.filter((s) =>
    s.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenditure = salaries.reduce((acc, curr) => acc + Number(curr.amount), 0);

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

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data gaji ini?")) {
      const result = await deleteSalary(id);
      if (result.success) {
        setSalaries(salaries.filter((s) => s.id !== id));
      } else {
        alert("Gagal menghapus data gaji");
      }
    }
  };

  const handleDateChange = (month: number, year: number) => {
    router.push(`/admin/gaji?month=${month}&year=${year}`);
  };

  const isYearly = currentMonth === 0;

  const getReportHeader = () => {
    const monthName = !isYearly ? new Date(currentYear, currentMonth - 1, 1).toLocaleDateString('id-ID', { month: 'long' }) : "";
    const lastDayOfMonth = !isYearly ? new Date(currentYear, currentMonth, 0).getDate() : "";
    
    const periodStr = isYearly 
      ? `Laporan Gaji Karyawan Tahunan: ${currentYear}`
      : `Laporan Gaji Karyawan: 01 ${monthName} ${currentYear} - ${lastDayOfMonth} ${monthName} ${currentYear}`;

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
    const worksheet = workbook.addWorksheet("Laporan Gaji");

    try {
      const logoBase64 = await getBase64Image("/assets/Logo.png");
      const logoId = workbook.addImage({ base64: logoBase64, extension: 'png' });

      worksheet.columns = [
        { width: 30 }, // Nama Karyawan
        { width: 20 }, // Tanggal Pembayaran
        { width: 25 }, // Nominal Gaji
      ];

      worksheet.mergeCells('A1:C2');
      worksheet.getRow(1).height = 65;
      worksheet.getRow(2).height = 65;

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
      addressCell.border = { top: { style: 'thin', color: { argb: 'FFDDDDDD' } } };

      worksheet.mergeCells('A4:C4');
      const periodCell = worksheet.getCell('A4');
      periodCell.value = header.period;
      periodCell.font = { bold: true, size: 11 };
      periodCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(4).height = 25;

      worksheet.addRow([]);

      const headerRow = worksheet.getRow(6);
      headerRow.values = ['Nama Karyawan', 'Tanggal Pembayaran', 'Nominal Gaji'];
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B4423' } };
        cell.alignment = { horizontal: 'center' };
      });

      filteredSalaries.forEach((s) => {
        const row = worksheet.addRow([
          s.employee_name,
          new Date(s.payment_date).toLocaleDateString('id-ID'),
          s.amount
        ]);
        row.getCell(3).numFmt = '#,##0';
      });

      const totalRow = worksheet.addRow(['TOTAL PENGELUARAN GAJI', '', totalExpenditure]);
      totalRow.font = { bold: true };
      totalRow.getCell(3).numFmt = '#,##0';
      totalRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Laporan_Gaji_BreadGift_${new Date().toISOString().split('T')[0]}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Excel Export Error:", error);
    }
  };

  const handleExportPDF = async () => {
    const header = getReportHeader();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    try {
      doc.setFontSize(32); 
      doc.setFont("helvetica", "bold");
      const titleWidth = doc.getTextWidth(header.title);
      const logoWidth = 18.9;
      const startX = (pageWidth - (logoWidth + 2 + titleWidth)) / 2;

      const logoBase64 = await getBase64Image("/assets/Logo.png");
      doc.addImage(logoBase64, 'PNG', startX, 12, logoWidth, 18.9); 
      doc.setTextColor(107, 68, 35);
      doc.text(header.title, startX + logoWidth + 2, 24.5); 

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text(header.address, pageWidth / 2, 38, { align: "center" });

      doc.setLineWidth(0.2);
      doc.setDrawColor(220, 220, 220);
      doc.line(30, 34, pageWidth - 30, 34);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(header.period, pageWidth / 2, 45, { align: "center" });

      const tableData: any[] = filteredSalaries.map(s => [
        s.employee_name,
        new Date(s.payment_date).toLocaleDateString('id-ID'),
        `Rp. ${Number(s.amount).toLocaleString("id-ID")}`
      ]);

      tableData.push([
        { content: 'TOTAL PENGELUARAN GAJI', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
        { content: `Rp. ${totalExpenditure.toLocaleString("id-ID")}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240], halign: 'right' } }
      ]);

      autoTable(doc, {
        startY: 55,
        head: [['Nama Karyawan', 'Tanggal Pembayaran', 'Nominal Gaji']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [107, 68, 35], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 2: { halign: 'right' } }
      });

      doc.save(`Laporan_Gaji_BreadGift_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
    }
  };

  // Re-fetch data would be better with Server Actions + revalidatePath, 
  // but for immediate UI update we use local state or window.location.reload()
  const handleSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-fit lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar gap-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[42px] font-black text-zinc-900 tracking-tighter leading-none mb-2">
            Gaji Karyawan
          </h1>
          <p className="text-zinc-400 font-bold text-sm tracking-widest uppercase italic">
            Data Periode {isYearly ? `Tahun ${currentYear}` : new Date(currentYear, currentMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
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

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-[#6B4423] text-white px-8 py-4 rounded-[24px] font-black text-sm shadow-xl shadow-[#6B4423]/20 hover:bg-[#5A391D] transition-all active:scale-95 whitespace-nowrap"
          >
            <div className="bg-white/10 p-1.5 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            Tambah Gaji
          </button>
        </div>
      </div>

      <MonthSelector 
        selectedMonth={currentMonth}
        selectedYear={currentYear}
        onDateChange={handleDateChange}
      />



      {/* Stats Cards */}
      <div className="flex flex-wrap gap-6">
        <div className="bg-white border border-zinc-100 p-8 rounded-[40px] shadow-sm flex items-center gap-8 min-w-[320px] flex-1 md:flex-initial">
          <div className="w-16 h-16 bg-[#6B4423]/5 text-[#6B4423] rounded-[24px] flex items-center justify-center">
            <UserRound className="w-8 h-8 opacity-40" />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 tracking-widest uppercase mb-1">
              TOTAL PENGELUARAN GAJI
            </p>
            <h3 className="text-3xl font-black text-zinc-900 tracking-tighter">
              {formatIDR(totalExpenditure)}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 p-8 rounded-[40px] shadow-sm flex items-center gap-8 min-w-[320px] flex-1 md:flex-initial">
          <div className="w-16 h-16 bg-[#FCF1E8] text-[#6B4423] rounded-[24px] flex items-center justify-center">
            <div className="relative">
              <UserRound className="w-8 h-8 opacity-60" />
              <div className="absolute -right-1 -top-1 w-4 h-4 bg-[#6B4423] rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 tracking-widest uppercase mb-1">
              JUMLAH KARYAWAN
            </p>
            <h3 className="text-3xl font-black text-zinc-900 tracking-tighter">
              {new Set(salaries.map(s => s.employee_name.toLowerCase().trim())).size} <span className="text-sm text-zinc-400 uppercase ml-1">Orang</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
            Daftar Gaji
          </h2>
          
          <div className="relative group w-full max-w-sm">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-[#6B4423] transition-colors" />
            <input
              type="text"
              placeholder="Cari nama karyawan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-zinc-100 rounded-2xl py-4 flex items-center gap-5 pl-14 pr-6 text-sm font-bold text-zinc-900 outline-none focus:border-[#6B4423]/20 transition-all placeholder:text-zinc-300 shadow-sm"
            />
          </div>
        </div>

        <GajiTable 
          salaries={filteredSalaries} 
          onDeleteRequest={handleDelete}
        />
      </div>

      <AddGajiModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess}
      />
    </div>
  );
}
