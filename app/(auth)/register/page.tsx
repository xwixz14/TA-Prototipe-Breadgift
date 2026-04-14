
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/lib/actions";
import { useCart } from "@/context/CartContext";

export default function RegisterPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setError("Harap isi semua bidang!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await registerUser(formData);
    
    if (result.success) {
      clearCart(); // Bersihkan keranjang agar akun baru mulai dari nol
      alert("Pendaftaran Berhasil! Silakan Login.");
      router.push("/login");
    } else {
      setError(result.error || "Gagal mendaftar");
    }
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl flex flex-col items-center gap-10">
        
        {/* Welcome Text */}
        <h1 className="text-3xl md:text-4xl font-black text-[#7B4A2D] text-center tracking-tight leading-none">
          Buat Akun BreadGift Anda
        </h1>
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Mulai perjalanan roti segar Anda di sini</p>

        {/* Logo */}
        <div className="relative w-28 h-28">
          <Image
            src="/assets/Logo.png"
            alt="BreadGift Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center">
            {error}
          </div>
        )}

        {/* Register Form */}
        <div className="w-full space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masukkan Nama Anda"
              className="w-full px-8 py-5 text-lg font-bold text-zinc-900 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7B4A2D]/10 focus:border-[#7B4A2D] transition-all placeholder:text-zinc-300"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Masukkan Username"
              className="w-full px-8 py-5 text-lg font-bold text-zinc-900 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7B4A2D]/10 focus:border-[#7B4A2D] transition-all placeholder:text-zinc-300"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Masukkan Email Anda (Alamat Email Aktif)"
              className="w-full px-8 py-5 text-lg font-bold text-zinc-900 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7B4A2D]/10 focus:border-[#7B4A2D] transition-all placeholder:text-zinc-300"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Masukkan Password"
              className="w-full px-8 py-5 text-lg font-bold text-zinc-900 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7B4A2D]/10 focus:border-[#7B4A2D] transition-all placeholder:text-zinc-300"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-6 mt-4">
          <button
            onClick={handleRegister}
            disabled={isSubmitting}
            className="w-full bg-[#7B4A2D] text-white py-5 rounded-3xl text-2xl font-black shadow-xl shadow-[#7B4A2D]/20 hover:bg-[#5D3822] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:bg-zinc-200 disabled:shadow-none"
          >
            {isSubmitting ? "Mendaftar..." : "Daftar Sekarang"}
          </button>
          
          <p className="text-center text-sm font-bold text-zinc-400 uppercase tracking-widest">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[#7B4A2D] hover:underline decoration-2 underline-offset-4">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
