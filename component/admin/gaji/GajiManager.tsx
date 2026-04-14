"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, UserRound } from "lucide-react";
import GajiTable from "./GajiTable";
import AddGajiModal from "./AddGajiModal";
import { deleteSalary } from "@/lib/actions";

interface Salary {
  id: number;
  employee_name: string;
  amount: number;
  payment_date: string;
}

interface GajiManagerProps {
  initialSalaries: Salary[];
}

export default function GajiManager({ initialSalaries }: GajiManagerProps) {
  const [salaries, setSalaries] = useState<Salary[]>(initialSalaries);
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

  // Re-fetch data would be better with Server Actions + revalidatePath, 
  // but for immediate UI update we use local state or window.location.reload()
  const handleSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[42px] font-black text-zinc-900 tracking-tighter leading-none mb-2">
            Gaji Karyawan
          </h1>
          <p className="text-zinc-400 font-bold text-sm tracking-widest uppercase">
            Manajemen dan pencatatan gaji karyawan toko
          </p>
        </div>

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

      {/* Stats Card */}
      <div className="bg-white border border-zinc-100 p-8 rounded-[40px] shadow-sm flex items-center gap-8 w-fit min-w-[320px]">
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
