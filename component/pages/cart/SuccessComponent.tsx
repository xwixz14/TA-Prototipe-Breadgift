"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ShoppingBag, Calendar, CheckCircle2, CreditCard, ShieldCheck, Loader2, Download, QrCode, ArrowRight, Info, Upload, Image as ImageIcon, Check, MessageSquare, MapPin, Truck } from "lucide-react";
import { uploadProofOfPayment } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import Image from "next/image";

interface TransactionItem {
  id: number;
  product_name: string;
  image_url: string;
  quantity: number;
  price_at_transaction: number;
  subtotal: number;
}

interface Transaction {
  id: number;
  customer_name: string | null;
  total_amount: number;
  payment_method: string;
  transaction_date: string;
  status: string;
  source: string;
  delivery_method?: string | null;
  recipient_name?: string | null;
  delivery_address?: string | null;
  proof_of_payment?: string | null;
  items: TransactionItem[];
}

export default function SuccessComponent({ transaction }: { transaction: Transaction | null }) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(!!transaction?.proof_of_payment);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(transaction?.proof_of_payment || null);
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only fire confetti for confirmed transactions
    if (transaction?.status === "Pending") return;

    // Fire confetti on load
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !transaction) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    const result = await uploadProofOfPayment(formData, transaction.id);
    if (result.success) {
      setUploadSuccess(true);
      setPreviewUrl(result.proofUrl || null);
      setShowSuccessModal(true);
      
      // Fire celebratory confetti on manual upload success
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6B4423', '#D97706', '#10B981']
      });
    } else {
      alert("Gagal mengunggah bukti: " + result.error);
    }
    setIsUploading(null as any); 
    setIsUploading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!transaction) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-zinc-200 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-zinc-400" />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 mb-2 tracking-tight">Pesanan Terkonfirmasi</h1>
        <p className="text-zinc-500 max-w-sm font-medium">Terima kasih atas pesanan Anda. Kami sedang memprosesnya.</p>
        <Link 
          href="/menu" 
          className="mt-8 bg-[#6B4423] text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-[#6B4423]/20 hover:scale-[1.02] transition-all"
        >
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  // QRIS Payment View for Pending Orders
  if (transaction.status === "Pending") {
    return (
      <div className="min-h-screen bg-zinc-50 pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.08)] border border-zinc-100 overflow-hidden"
          >
            <div className="bg-[#6B4423] h-4 w-full" />
            
            <div className="p-8 md:p-16 text-center">
              <div className="w-20 h-20 bg-[#FFF4EB] rounded-full flex items-center justify-center mx-auto mb-8 border border-[#6B4423]/10">
                <QrCode className="w-10 h-10 text-[#6B4423]" />
              </div>

              <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-4">
                Selesaikan Pembayaran
              </h1>
              <p className="text-zinc-500 font-medium max-w-md mx-auto leading-relaxed mb-10">
                Silakan scan barcode QRIS di bawah ini untuk menyelesaikan pesanan <span className="text-zinc-900 font-bold">#ORD-{transaction.id.toString().padStart(5, '0')}</span>.
              </p>

              {/* QRIS BARCODE */}
              <div className="relative max-w-[320px] mx-auto bg-white p-6 rounded-[32px] border-4 border-zinc-100 shadow-xl mb-10">
                <div className="aspect-[3/4] relative overflow-hidden rounded-2xl">
                  <Image 
                    src="/assets/qris.png" 
                    alt="QRIS BreadGift"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-50">
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total yang harus dibayar</p>
                   <p className="text-2xl font-black text-[#6B4423]">Rp {transaction.total_amount.toLocaleString("id-ID")}</p>
                </div>
              </div>

              {/* Upload Proof Section */}
              <div className="max-w-[440px] mx-auto mb-10 text-left">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 bg-[#6B4423] rounded-lg flex items-center justify-center shadow-lg shadow-[#6B4423]/10">
                      <ImageIcon className="w-4 h-4 text-white" />
                   </div>
                   <h3 className="font-black text-zinc-900 text-sm uppercase tracking-wider">Kirim Bukti Pembayaran</h3>
                </div>

                <div className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 ${uploadSuccess ? 'border-green-200 bg-green-50/50' : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50'}`}>
                  {previewUrl ? (
                    <div className="p-6">
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-100 shadow-sm bg-black/5 mb-4">
                        <Image 
                          src={previewUrl} 
                          alt="Preview"
                          fill
                          className="object-contain"
                        />
                        {uploadSuccess && (
                          <div className="absolute inset-0 bg-green-500/10 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-white p-3 rounded-full shadow-xl">
                              <Check className="w-6 h-6 text-green-500" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {!uploadSuccess && (
                        <div className="flex gap-3">
                          <button 
                            disabled={isUploading}
                            onClick={handleUpload}
                            className="flex-1 bg-zinc-900 text-white py-3 rounded-xl font-black text-xs hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            Unggah Sekarang
                          </button>
                          <label className="bg-white text-zinc-600 border border-zinc-200 py-3 px-4 rounded-xl font-black text-xs hover:bg-zinc-50 cursor-pointer transition-colors">
                            Ganti
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                          </label>
                        </div>
                      )}
                      
                      {uploadSuccess && (
                        <div className="flex items-center justify-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest text-center py-2">
                           <CheckCircle2 className="w-4 h-4" />
                           Berhasil Terkirim
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-12 cursor-pointer group">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-zinc-100 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-zinc-400" />
                      </div>
                      <p className="text-sm font-black text-zinc-900">Klik untuk Unggah Bukti</p>
                      <p className="text-xs font-medium text-zinc-400 mt-1">Format: JPG, PNG, WEBP</p>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-zinc-50 rounded-[32px] p-8 border border-zinc-100 text-left mb-10">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-blue-50 rounded-xl">
                      <Info className="w-4 h-4 text-blue-500" />
                   </div>
                   <h3 className="font-black text-zinc-900 text-sm uppercase tracking-wider">Instruksi Pembayaran</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                     <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm border border-zinc-100 flex-shrink-0">1</span>
                     <p className="text-sm text-zinc-600 leading-relaxed font-medium">Buka aplikasi mobile banking atau e-wallet (Gopay, OVO, Dana, dll) Anda.</p>
                  </li>
                  <li className="flex gap-4">
                     <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm border border-zinc-100 flex-shrink-0">2</span>
                     <p className="text-sm text-zinc-600 leading-relaxed font-medium">Scan barcode QRIS BREADGIFT di atas atau unggah screenshot barcode ini.</p>
                  </li>
                  <li className="flex gap-4">
                     <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm border border-zinc-100 flex-shrink-0">3</span>
                     <p className="text-sm text-zinc-600 leading-relaxed font-medium">Masukkan nominal <span className="font-bold text-zinc-900 uppercase">Rp {transaction.total_amount.toLocaleString("id-ID")}</span> dan selesaikan transaksi.</p>
                  </li>
                  <li className="flex gap-4">
                     <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm border border-zinc-100 flex-shrink-0">4</span>
                     <p className="text-sm text-zinc-600 leading-relaxed font-medium">Tunggu konfirmasi dari admin. Pesanan Anda akan segera diproses setelah pembayaran divalidasi.</p>
                  </li>
                </ul>
              </div>

              {/* WhatsApp Confirmation Button */}
              <div className="max-w-[440px] mx-auto mb-10">
                <a 
                  href={`https://wa.me/6282279728849?text=${encodeURIComponent(
                    `Halo BreadGift! 🥖\n\nSaya ingin mengonfirmasi pembayaran untuk pesanan saya:\n\n*ID Pesanan:* #ORD-${transaction.id.toString().padStart(5, '0')}\n*Total:* Rp ${transaction.total_amount.toLocaleString("id-ID")}\n*Metode Kirim:* ${transaction.delivery_method || 'Ambil di Toko'}${transaction.delivery_method === 'Maxim Delivery' ? `\n*Nama Penerima:* ${transaction.recipient_name}\n*Alamat:* ${transaction.delivery_address}` : ''}\n\nBerikut saya lampirkan bukti transfernya. Mohon segera diproses ya bebs! Terima kasih.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 rounded-2xl font-black shadow-xl shadow-[#25D366]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm md:text-base uppercase tracking-widest"
                >
                  <MessageSquare className="w-6 h-6" />
                  Konfirmasi via WhatsApp
                </a>
                <p className="text-center text-zinc-400 text-[10px] font-bold mt-4 uppercase tracking-[0.2em]">
                  Disarankan konfirmasi via WA agar pesanan lebih cepat diproses
                </p>
              </div>

              <div className="flex justify-center">
                <Link 
                  href="/menu" 
                  className="flex items-center justify-center gap-3 bg-[#6B4423] text-white px-12 py-5 rounded-2xl font-black shadow-xl shadow-[#6B4423]/20 hover:scale-[1.02] transition-all group"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Kembali ke Menu
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Success Modal for Pending View */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-md"
              onClick={() => setShowSuccessModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.2)] border border-zinc-100 p-8 md:p-12 max-w-sm w-full relative z-10 text-center"
            >
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100 relative">
                 <motion.div
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ delay: 0.2, type: "spring" }}
                   className="absolute inset-0 bg-green-500/10 rounded-full animate-ping"
                 />
                 <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
              </div>
              
              <h2 className="text-2xl font-black text-zinc-900 mb-3 tracking-tight">Berhasil Terkirim!</h2>
              <p className="text-zinc-500 font-medium leading-relaxed mb-10">
                Bukti pembayaranmu sudah kami terima. Mohon tunggu tim <span className="text-[#6B4423] font-bold">BreadGift</span> memvalidasi pesananmu ya bebs!
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-[#6B4423] text-white py-4 rounded-2xl font-black shadow-xl shadow-[#6B4423]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                >
                  Siap, Mengerti!
                </button>
                <Link 
                  href="/menu"
                  className="block w-full bg-zinc-50 text-zinc-500 py-4 rounded-2xl font-black hover:bg-zinc-100 transition-all text-sm"
                >
                  Kembali ke Menu
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // Regular Success View for Confirmed Orders
  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Success Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.08)] border border-zinc-100 overflow-hidden relative"
        >
          {/* Top Decorative Banner */}
          <div className="bg-[#6B4423] h-4 w-full" />
          
          <div className="p-8 md:p-16 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 md:w-24 md:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10 border border-green-100"
            >
              <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-green-500" />
            </motion.div>

            <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight mb-4">
              Pesanan Berhasil!
            </h1>
            <p className="text-zinc-500 text-base md:text-lg font-medium max-w-md mx-auto leading-relaxed">
              Halo <span className="text-zinc-900 font-bold">{transaction.customer_name || "Pelanggan"}</span>, pesananmu <span className="text-[#6B4423] font-bold">#ORD-{transaction.id.toString().padStart(5, '0')}</span> telah kami terima.
            </p>

            {/* Order Summary Preview */}
            <div className="mt-8 md:mt-12 bg-zinc-50 rounded-[32px] p-6 md:p-8 border border-zinc-100 text-left space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                <span>Ringkasan Pesanan</span>
                <span>{transaction.items.length} Produk</span>
              </div>
              <div className="space-y-3">
                {transaction.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm font-bold text-zinc-700 truncate max-w-[200px]">
                      {item.product_name} <span className="text-zinc-400 ml-1">x{item.quantity}</span>
                    </span>
                    <span className="text-sm font-black text-zinc-900">Rp {item.subtotal.toLocaleString("id-ID")}</span>
                  </div>
                ))}
                {transaction.items.length > 3 && (
                   <p className="text-[10px] font-bold text-[#6B4423] italic">+ {transaction.items.length - 3} produk lainnya</p>
                )}
              </div>
              <div className="h-px bg-zinc-200 my-4" />
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pengiriman</span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    {transaction.delivery_method === 'Maxim Delivery' ? (
                      <><Truck className="w-4 h-4 text-amber-500" /> Maxim Delivery</>
                    ) : (
                      <><MapPin className="w-4 h-4 text-blue-500" /> Ambil di Toko</>
                    )}
                  </span>
                  {transaction.delivery_method !== 'Maxim Delivery' && (
                    <a 
                      href="https://maps.app.goo.gl/8NX1PX5WorBVdztb7" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[9px] font-black text-[#6B4423] hover:underline flex items-center gap-1"
                    >
                      Buka Lokasi di Maps
                    </a>
                  )}
                </div>
              </div>
              
              {transaction.delivery_method === 'Maxim Delivery' && (
                <div className="bg-amber-100/30 p-4 rounded-2xl border border-amber-100/50 space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-amber-700 uppercase tracking-widest">
                    <Truck className="w-3 h-3" />
                    Detail Pengiriman Maxim
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-zinc-900">{transaction.recipient_name}</p>
                    <p className="text-[11px] font-medium text-zinc-600 leading-relaxed">{transaction.delivery_address}</p>
                  </div>
                  <p className="text-[9px] text-amber-600 font-bold italic leading-none pt-1">
                    * Ongkir dibayar ke driver saat sampai
                  </p>
                </div>
              )}

              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Bayar</span>
                <span className="text-2xl md:text-3xl font-black text-[#6B4423] tracking-tighter leading-none">
                  Rp {transaction.total_amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 md:mt-12 flex justify-center">
              <Link 
                href="/menu" 
                className="flex items-center justify-center gap-4 bg-[#6B4423] text-white px-12 py-5 rounded-2xl font-black shadow-xl shadow-[#6B4423]/20 hover:scale-[1.02] active:scale-[0.98] transition-all group text-sm md:text-base"
              >
                <ShoppingBag className="w-5 h-5" />
                Belanja Lagi
              </Link>
            </div>
            
            <p className="mt-8 text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Calendar className="w-3 h-3" />
              {new Date(transaction.transaction_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </motion.div>

        {/* Hidden Content for Printing (Receipt) */}
        <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[200]">
           <div className="p-10 max-w-[400px] mx-auto border-2 border-zinc-200 rounded-3xl" id="printable-receipt">
             <div className="text-center mb-8">
               <h2 className="text-2xl font-black text-zinc-900">BREADGIFT</h2>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Freshly Baked Everyday</p>
               <div className="h-1 w-12 bg-[#6B4423] mx-auto mt-2" />
             </div>
             
             <div className="space-y-4 mb-8">
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No. Pesanan</span>
                 <span className="text-xs font-black text-zinc-900">#ORD-{transaction.id.toString().padStart(5, '0')}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pelanggan</span>
                 <span className="text-xs font-black text-zinc-900">{transaction.customer_name || "Guest"}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Metode</span>
                 <span className="text-xs font-black text-zinc-900">{transaction.payment_method}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tanggal</span>
                 <span className="text-xs font-black text-zinc-900">
                    {new Date(transaction.transaction_date).toLocaleDateString('id-ID')}
                 </span>
               </div>
             </div>

             <div className="border-t border-dashed border-zinc-200 pt-6 space-y-4 mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-left">
                      <th className="pb-3">Produk</th>
                      <th className="pb-3 text-center">Qty</th>
                      <th className="pb-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {transaction.items.map((item, idx) => (
                      <tr key={idx} className="text-xs font-black text-zinc-800">
                        <td className="py-2 pr-4">{item.product_name}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">Rp {item.subtotal.toLocaleString("id-ID")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>

             <div className="border-t border-dashed border-zinc-200 pt-6 space-y-2">
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Bayar</span>
                 <span className="text-lg font-black text-[#6B4423]">Rp {transaction.total_amount.toLocaleString("id-ID")}</span>
               </div>
             </div>
             
             <div className="mt-12 text-center">
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Terima Kasih!</p>
               <p className="text-[8px] font-bold text-zinc-400 italic">Pesanan Anda Sedang Kami Siapkan</p>
             </div>
           </div>
        </div>
      </div>


      {/* Modern Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-md"
            onClick={() => setShowSuccessModal(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.2)] border border-zinc-100 p-8 md:p-12 max-w-sm w-full relative z-10 text-center"
          >
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100 relative">
               <motion.div
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ delay: 0.2, type: "spring" }}
                 className="absolute inset-0 bg-green-500/10 rounded-full animate-ping"
               />
               <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
            </div>
            
            <h2 className="text-2xl font-black text-zinc-900 mb-3 tracking-tight">Berhasil Terkirim!</h2>
            <p className="text-zinc-500 font-medium leading-relaxed mb-10">
              Bukti pembayaranmu sudah kami terima. Mohon tunggu tim <span className="text-[#6B4423] font-bold">BreadGift</span> memvalidasi pesananmu ya bebs!
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-[#6B4423] text-white py-4 rounded-2xl font-black shadow-xl shadow-[#6B4423]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
              >
                Siap, Mengerti!
              </button>
              <Link 
                href="/menu"
                className="block w-full bg-zinc-50 text-zinc-500 py-4 rounded-2xl font-black hover:bg-zinc-100 transition-all text-sm"
              >
                Kembali ke Menu
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            border: none !important;
            padding: 0 !important;
          }
           @page {
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
