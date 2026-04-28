"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search, Calendar, Wallet, X, Loader2, AlertCircle, FileSpreadsheet, FileText } from "lucide-react";
import { createExpense, deleteExpense, createSalary, deleteSalary } from "@/lib/actions";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import MonthSelector from "../common/MonthSelector";
import { useRouter } from "next/navigation";
import { formatNumber, parseRawNumber, limitValue, MAX_LIMIT_CURRENCY } from "@/lib/utils";
import GajiTable from "../gaji/GajiTable";
import AddGajiModal from "../gaji/AddGajiModal";

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
}

interface ExpenseManagerProps {
  initialExpenses: Expense[];
  initialSalaries: any[];
  currentMonth: number;
  currentYear: number;
}

export default function ExpenseManager({ initialExpenses, initialSalaries, currentMonth, currentYear }: ExpenseManagerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"expenses" | "salaries">("expenses");
  const [expenses, setExpenses] = useState(initialExpenses);
  const [salaries, setSalaries] = useState(initialSalaries);

  useEffect(() => {
    setExpenses(initialExpenses);
    setSalaries(initialSalaries);
  }, [initialExpenses, initialSalaries]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Bahan Baku",
    expense_date: new Date().toISOString().split('T')[0]
  });

  const handleDateChange = (month: number, year: number) => {
    router.push(`/admin/expenses?month=${month}&year=${year}`);
  };

  const categories = ["Bahan Baku", "Operasional", "Listrik dan Air", "Lainnya"];
  const filterCategories = ["Semua", ...categories];

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createExpense({
        ...formData,
        amount: Number(formData.amount)
      });
      if (result.success) {
        // Refresh local state (simplest way without complex state syncing)
        window.location.reload(); 
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengeluaran ini?")) return;
    const result = await deleteExpense(id);
    if (result.success) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const handleDeleteSalary = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data gaji ini?")) return;
    const result = await deleteSalary(id);
    if (result.success) {
      setSalaries(salaries.filter(s => s.id !== id));
    }
  };

  const isYearly = currentMonth === 0;

  const getReportHeader = () => {
    const monthName = !isYearly ? new Date(currentYear, currentMonth - 1, 1).toLocaleDateString('id-ID', { month: 'long' }) : "";
    const lastDayOfMonth = !isYearly ? new Date(currentYear, currentMonth, 0).getDate() : "";
    
    const periodStr = isYearly 
      ? `Laporan Pengeluaran Tahunan: ${currentYear}`
      : `Laporan Pengeluaran: 01 ${monthName} ${currentYear} - ${lastDayOfMonth} ${monthName} ${currentYear}`;

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
    const worksheet = workbook.addWorksheet("Laporan Pengeluaran");

    try {
      const logoBase64 = await getBase64Image("/assets/Logo.png");
      const logoId = workbook.addImage({ base64: logoBase64, extension: 'png' });

      worksheet.columns = [
        { width: 30 }, // Deskripsi
        { width: 20 }, // Kategori
        { width: 20 }, // Tanggal
        { width: 20 }, // Nominal
      ];

      worksheet.mergeCells('A1:D2');
      worksheet.getRow(1).height = 65;
      worksheet.getRow(2).height = 65;

      worksheet.addImage(logoId, {
        tl: { col: 1, row: 0.35 },
        ext: { width: 71, height: 71 } 
      });

      const titleCell = worksheet.getCell('A1');
      titleCell.value = `  ${header.title}`;
      titleCell.font = { size: 34, bold: true, color: { argb: 'FF6B4423' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.mergeCells('A3:D3');
      const addressCell = worksheet.getCell('A3');
      addressCell.value = header.address;
      addressCell.font = { size: 9, color: { argb: 'FF888888' } };
      addressCell.alignment = { vertical: 'middle', horizontal: 'center' };
      addressCell.border = { top: { style: 'thin', color: { argb: 'FFDDDDDD' } } };

      worksheet.mergeCells('A4:D4');
      const periodCell = worksheet.getCell('A4');
      periodCell.value = header.period;
      periodCell.font = { bold: true, size: 11 };
      periodCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(4).height = 25;

      worksheet.addRow([]);

      const headerRow = worksheet.getRow(6);
      headerRow.values = ['Deskripsi', 'Kategori', 'Tanggal', 'Nominal'];
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B4423' } };
        cell.alignment = { horizontal: 'center' };
      });

      filteredExpenses.forEach((e) => {
        const row = worksheet.addRow([
          e.description,
          e.category,
          new Date(e.expense_date).toLocaleDateString('id-ID'),
          e.amount
        ]);
        row.getCell(4).numFmt = '#,##0';
      });

      const totalRow = worksheet.addRow(['TOTAL PENGELUARAN', '', '', totalExpense]);
      totalRow.font = { bold: true };
      totalRow.getCell(4).numFmt = '#,##0';
      totalRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Laporan_Pengeluaran_BreadGift_${new Date().toISOString().split('T')[0]}.xlsx`;
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

      const tableData: any[] = filteredExpenses.map(e => [
        e.description,
        e.category,
        new Date(e.expense_date).toLocaleDateString('id-ID'),
        `Rp ${e.amount.toLocaleString("id-ID")}`
      ]);

      tableData.push([
        { content: 'TOTAL PENGELUARAN', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
        { content: `Rp ${totalExpense.toLocaleString("id-ID")}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240], halign: 'right' } }
      ]);

      autoTable(doc, {
        startY: 55,
        head: [['Deskripsi', 'Kategori', 'Tanggal', 'Nominal']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [107, 68, 35], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 3: { halign: 'right' } }
      });

      doc.save(`Laporan_Pengeluaran_BreadGift_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-8 h-fit lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Manajemen Pengeluaran & Gaji</h1>
          <p className="text-sm text-zinc-500 font-medium tracking-wide uppercase italic leading-none mt-1">
            Data Periode {isYearly ? `Tahun ${currentYear}` : new Date(currentYear, currentMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-wrap items-stretch gap-4">
          <div className="flex bg-zinc-100 p-1.5 rounded-[24px] border border-zinc-200">
            <button 
              onClick={() => setActiveTab("expenses")}
              className={`px-6 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === "expenses" ? "bg-white text-[#6B4423] shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
            >
              Pengeluaran
            </button>
            <button 
              onClick={() => setActiveTab("salaries")}
              className={`px-6 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === "salaries" ? "bg-white text-[#6B4423] shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
            >
              Gaji Karyawan
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportExcel}
              className="bg-white p-4 rounded-[24px] border border-zinc-200 shadow-sm flex items-center gap-4 hover:border-[#6B4423]/40 hover:bg-[#FCF1E8]/20 transition-all active:scale-95 group"
            >
              <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-[#6B4423] transition-all">
                <FileSpreadsheet className="w-5 h-5 text-zinc-400 group-hover:text-white" />
              </div>
              <div className="hidden sm:block text-left">
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
              <div className="hidden sm:block text-left">
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Download</p>
                <p className="text-xs font-black text-zinc-900 group-hover:text-red-600">PDF</p>
              </div>
            </button>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#6B4423] text-white px-8 py-4 rounded-[24px] font-black flex items-center gap-3 shadow-xl shadow-[#6B4423]/20 hover:bg-[#5D3822] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" />
            Tambah {activeTab === "expenses" ? "Pengeluaran" : "Data Gaji"}
          </button>
        </div>
      </div>

      <MonthSelector 
        selectedMonth={currentMonth}
        selectedYear={currentYear}
        onDateChange={handleDateChange}
      />

      {activeTab === "expenses" ? (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm flex items-center gap-6">
               <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                 <Wallet className="w-7 h-7 text-red-500" />
               </div>
               <div>
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Pengeluaran</p>
                 <p className="text-2xl font-black text-zinc-900">Rp. {totalExpense.toLocaleString("id-ID")}</p>
               </div>
            </div>
          </div>

          {/* Main Table Section */}
          <div className="bg-white rounded-[40px] border border-zinc-100 shadow-sm flex flex-col">
            <div className="p-8 border-b border-zinc-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-zinc-50/30">
              <h3 className="text-lg font-black text-zinc-900 tracking-tight">Daftar Pengeluaran</h3>
              
              <div className="flex items-center gap-3 w-full md:w-fit">
                <div className="relative w-full md:w-[350px]">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Cari deskripsi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-zinc-100 py-3 pl-14 pr-6 rounded-2xl focus:outline-none focus:border-[#6B4423]/20 text-sm font-bold shadow-sm transition-all"
                  />
                </div>

                {/* Category Filter Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-3 px-6 py-3.5 bg-white border-2 border-zinc-100 rounded-2xl shadow-sm hover:bg-zinc-50 transition-all group"
                  >
                    <X className={`w-4 h-4 text-red-500 transition-all ${selectedCategory !== "Semua" ? "opacity-100" : "opacity-0"}`} 
                      onClick={(e) => {
                        if (selectedCategory !== "Semua") {
                          e.stopPropagation();
                          setSelectedCategory("Semua");
                        }
                      }}
                    />
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">KATEGORI:</span>
                    <span className="text-sm font-black text-zinc-900">{selectedCategory}</span>
                  </button>

                  {isFilterOpen && (
                    <>
                      <div className="fixed inset-0 z-[10]" onClick={() => setIsFilterOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-100 rounded-[24px] shadow-2xl z-[20] overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-2">
                           {filterCategories.map((c) => (
                             <button
                               key={c}
                               onClick={() => {
                                 setSelectedCategory(c);
                                 setIsFilterOpen(false);
                               }}
                               className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${
                                 selectedCategory === c 
                                   ? "bg-[#6B4423] text-white shadow-lg shadow-[#6B4423]/20" 
                                   : "text-zinc-600 hover:bg-zinc-50"
                               }`}
                             >
                               {c}
                             </button>
                           ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                    <th className="px-8 py-5">Deskripsi</th>
                    <th className="px-8 py-5">Kategori</th>
                    <th className="px-8 py-5">Tanggal</th>
                    <th className="px-8 py-5 text-right">Nominal</th>
                    <th className="px-8 py-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="py-20 text-center">
                          <AlertCircle className="w-12 h-12 text-zinc-100 mx-auto mb-4" />
                          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Belum ada data pengeluaran</p>
                       </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="group hover:bg-zinc-50/80 transition-colors">
                        <td className="px-8 py-5">
                          <p className="text-sm font-black text-zinc-900 leading-tight">{expense.description}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-black px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg uppercase tracking-wider">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(expense.expense_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <p className="text-sm font-black text-red-500">Rp. {expense.amount.toLocaleString("id-ID")}</p>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex justify-center">
                             <button 
                              onClick={() => handleDelete(expense.id)}
                              className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
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
        </>
      ) : (
        <GajiTable salaries={salaries} onDeleteRequest={handleDeleteSalary} />
      )}

      {activeTab === "expenses" ? (
        isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300">
             <div className="relative w-full max-w-xl bg-white rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-zinc-100">
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Tambah Pengeluaran</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-2xl transition-all">
                    <X className="w-6 h-6 text-red-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Deskripsi</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Contoh: Belanja Terigu..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-200 py-4 px-6 rounded-2xl focus:outline-none focus:border-[#6B4423] text-sm font-bold transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nominal (Rp)</label>
                        <input 
                          required
                          type="text" 
                          placeholder="0"
                          value={formatNumber(formData.amount)}
                          onChange={(e) => {
                            const raw = parseRawNumber(e.target.value);
                            const limited = limitValue(raw, MAX_LIMIT_CURRENCY);
                            setFormData({...formData, amount: limited.toString()});
                          }}
                          className="w-full bg-zinc-50 border border-zinc-200 py-4 px-6 rounded-2xl focus:outline-none focus:border-[#6B4423] text-sm font-bold transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Kategori</label>
                        <select 
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-zinc-50 border border-zinc-200 py-4 px-6 rounded-2xl focus:outline-none focus:border-[#6B4423] text-sm font-bold transition-all appearance-none"
                        >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Tanggal</label>
                      <input 
                        required
                        type="date"
                        value={formData.expense_date}
                        onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-200 py-4 px-6 rounded-2xl focus:outline-none focus:border-[#6B4423] text-sm font-bold transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-[#6B4423] text-white py-6 rounded-[28px] text-lg font-black shadow-2xl shadow-[#6B4423]/30 hover:bg-[#5D3822] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-zinc-300"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : "Simpan Data"}
                  </button>
                </form>
             </div>
          </div>
        )
      ) : (
        <AddGajiModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => window.location.reload()} 
        />
      )}
    </div>
  );
}
