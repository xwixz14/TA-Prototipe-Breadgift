"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/actions";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError("Harap masukkan email terdaftar!");
      return;
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Format email tidak valid!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await requestPasswordReset(email);
    
    if (result.success) {
      setIsSent(true);
      // Wait 3 seconds then redirect to reset-password
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 3000);
    } else {
      setError(result.error || "Gagal mengirim kode reset");
    }
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl flex flex-col items-center gap-10">
        
        {/* Header */}
        <button 
          onClick={() => router.push("/login")}
          className="self-start flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Login
        </button>

        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-[#7B4A2D] tracking-tight leading-none">
            {isSent ? "Kode Terkirim!" : "Lupa Password?"}
          </h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs max-w-sm mx-auto">
            {isSent 
              ? `Kami telah mengirimkan 6 digit kode keamanan ke email ${email}`
              : "Jangan khawatir bebs, masukkan email kamu di bawah untuk mendapatkan kode reset."
            }
          </p>
        </div>

        <div className="relative w-32 h-32 md:w-36 md:h-36 overflow-hidden">
          <Image
            src="/assets/Logo.png"
            alt="BreadGift Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {error && (
          <div className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center">
            {error}
          </div>
        )}

        {!isSent ? (
          <>
            <div className="w-full space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Email Terdaftar</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-16 pr-8 py-5 text-lg font-bold text-zinc-900 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7B4A2D]/10 focus:border-[#7B4A2D] transition-all placeholder:text-zinc-300"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#7B4A2D] text-white py-6 rounded-3xl text-2xl font-black shadow-xl shadow-[#7B4A2D]/20 hover:bg-[#5D3822] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:bg-zinc-200 disabled:shadow-none flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim Kode Reset"
              )}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-6 p-8 bg-zinc-50 rounded-[40px] border border-zinc-100 text-center w-full">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Loader2 className="w-8 h-8 text-[#7B4A2D] animate-spin" />
             </div>
             <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
               Mengalihkan kamu ke halaman verifikasi...
             </p>
          </div>
        )}
        
        <p className="text-center text-sm font-bold text-zinc-400 uppercase tracking-widest">
          Butuh bantuan?{" "}
          <Link href="/contact" className="text-[#7B4A2D] hover:underline decoration-2 underline-offset-4">
            Hubungi Admin
          </Link>
        </p>
      </div>
    </main>
  );
}
