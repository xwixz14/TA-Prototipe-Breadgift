"use client";

import React, { useState } from "react";
import { updateTransactionStatus } from "@/lib/actions";
import { 
  Search, 
  Calendar, 
  User, 
  CreditCard, 
  Package, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  Eye
} from "lucide-react";
import Image from "next/image";

interface TransactionItem {
  product_id: number;
  product_name: string;
  image_url: string;
  quantity: number;
  price_at_transaction: number;
  subtotal: number;
}

interface Transaction {
  id: number;
  customer_name: string | null;
  customer_username: string | null;
  total_amount: number;
  payment_method: string;
  transaction_date: string;
  status: 'Pending' | 'Confirm' | 'Cancel';
  source: 'POS' | 'Online';
  items: TransactionItem[];
}

interface TransactionListProps {
  initialTransactions: Transaction[];
}

export default function TransactionList({ initialTransactions }: TransactionListProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [activeTab, setActiveTab] = useState<"All" | "Online" | "POS">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toString().includes(searchQuery) ||
      t.payment_method.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "All" || t.source === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const handleStatusUpdate = async (id: number, newStatus: 'Pending' | 'Confirm' | 'Cancel') => {
    setIsUpdating(id);
    const result = await updateTransactionStatus(id, newStatus);
    if (result.success) {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } else {
      alert("Gagal memperbarui status: " + result.error);
    }
    setIsUpdating(null);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Confirm': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancel': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirm': return <CheckCircle2 className="w-4 h-4" />;
      case 'Cancel': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        {/* Tabs */}
        <div className="flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200">
          {(['All', 'Online', 'POS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === tab 
                  ? "bg-white text-[#6B4423] shadow-sm" 
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {tab === 'All' ? 'Semua' : tab === 'Online' ? 'Online' : 'Kasir (POS)'}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative group w-full md:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#6B4423] transition-colors" />
          <input
            type="text"
            placeholder="Cari pesanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 py-3 pl-12 pr-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B4423]/10 focus:border-[#6B4423] text-sm font-bold text-zinc-900 placeholder:text-zinc-500 shadow-sm"
          />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x_auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 font-black">
                <th className="px-6 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">ID Pesanan</th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Sumber</th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Pelanggan</th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Tanggal</th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Total</th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredTransactions.map((t) => (
                <React.Fragment key={t.id}>
                  <tr className={`hover:bg-zinc-50/50 transition-colors ${expandedId === t.id ? 'bg-zinc-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="font-bold text-zinc-900 text-sm">#ORD-{t.id.toString().padStart(5, '0')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black border ${t.source === 'POS' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-[#FCF1E8] text-[#6B4423] border-[#6B4423]/10'}`}>
                        {t.source === 'POS' ? 'KASIR' : 'ONLINE'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {t.source === 'POS' ? (
                        <div className="flex items-center gap-3 opacity-60">
                           <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-zinc-400" />
                          </div>
                          <span className="text-xs font-bold text-zinc-500 italic">Penjualan Langsung</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-zinc-500" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-zinc-900">{t.customer_name || "Guest"}</p>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">@{t.customer_username || "guest_user"}</p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-600 text-xs font-bold">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(t.transaction_date).toLocaleDateString('id-ID', {
                           day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-[#6B4423]">
                        Rp. {t.total_amount.toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${getStatusStyle(t.status)}`}>
                        {getStatusIcon(t.status)}
                        {t.status.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {t.source === 'Online' ? (
                          <select
                            value={t.status}
                            disabled={isUpdating === t.id}
                            onChange={(e) => handleStatusUpdate(t.id, e.target.value as any)}
                            className="text-[10px] font-bold bg-white border border-zinc-200 rounded-lg px-2 py-1 outline-none focus:border-[#6B4423]"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirm">Confirm</option>
                            <option value="Cancel">Cancel</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black border border-green-100">
                             <CheckCircle2 className="w-3 h-3" />
                             AUTO-CONFIRM
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Detail View */}
                  {expandedId === t.id && (
                    <tr className="bg-zinc-50/30">
                      <td colSpan={7} className="px-10 py-6 border-y border-zinc-100">
                        <div className="flex flex-col gap-4">
                          <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Detail Produk</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {t.items.map((item, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-2xl border border-zinc-100 flex items-center gap-4 shadow-sm">
                                <div className="relative w-12 h-12 bg-zinc-50 rounded-xl border border-zinc-100 overflow-hidden">
                                  <Image 
                                    src={item.image_url || "/assets/products/placeholder.png"} 
                                    alt={item.product_name}
                                    fill
                                    className="object-contain p-1"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-black text-zinc-900 truncate">{item.product_name}</p>
                                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                                    {item.quantity} Pcs x Rp. {item.price_at_transaction.toLocaleString("id-ID")}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-black text-zinc-900">
                                    Rp. {item.subtotal.toLocaleString("id-ID")}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="py-20 text-center">
            <Package className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-400 font-bold">Tidak ada riwayat transaksi ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
