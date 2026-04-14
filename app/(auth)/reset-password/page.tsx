"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { resetPassword } from "@/lib/actions";
import { Loader2, ShieldCheck, KeyRound, Lock } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async () => {
    if (!email || !code || !newPassword || !confirmPassword) {
      setError("Harap isi semua kolom!");
      return;
    }

    if (code.length !== 6) {
      setError("Kode verifikasi harus 6 digit!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok!");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await resetPassword({ email, code, newPassword });
    
    if (result.success) {
      setSuccess("Password berhasil diubah! Mengalihkan ke halaman login...");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } else {
      setError(result.error || "Gagal mereset password");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-10">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-[#7B4A2D] tracking-tight leading-none">
          Reset Password
        </h1>
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Masukkan kode 6 digit yang dikirim ke email kamu</p>
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
        <div className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center animate-shake">
          {error}
        </div>
      )}

      {success && (
        <div className="w-full p-6 bg-green-50 border border-green-100 rounded-[32px] text-green-700 text-sm font-black text-center flex flex-col items-center gap-3">
          <ShieldCheck className="w-10 h-10 text-green-500" />
          {success}
        </div>
      )}

      {!success && (
        <div className="w-full space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Email</label>
            <input
              type="email"
              value={email}
              readOnly={!!initialEmail}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-8 py-5 text-lg font-bold text-zinc-900 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7B4A2D]/10 focus:border-[#7B4A2D] transition-all bg-zinc-50/50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Kode Verifikasi (6 Digit)</label>
            <div className="relative">
               <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300" />
               <input
                 type="text"
                 maxLength={6}
                 value={code}
                 onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                 placeholder="000000"
                 className="w-full pl-16 pr-8 py-5 text-2xl font-black text-zinc-900 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7B4A2D]/10 focus:border-[#7B4A2D] transition-all tracking-[0.5em] placeholder:text-zinc-200"
               />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex flex-col gap-2">
               <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Password Baru</label>
               <div className="relative">
                 <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                 <input
                   type="password"
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}
                   className="w-full pl-14 pr-6 py-5 text-lg font-bold text-zinc-900 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7B4A2D]/10 focus:border-[#7B4A2D] transition-all"
                 />
               </div>
             </div>
             <div className="flex flex-col gap-2">
               <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Konfirmasi</label>
               <div className="relative">
                 <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                 <input
                   type="password"
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   className="w-full pl-14 pr-6 py-5 text-lg font-bold text-zinc-900 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7B4A2D]/10 focus:border-[#7B4A2D] transition-all"
                 />
               </div>
             </div>
          </div>

          <button
            onClick={handleReset}
            disabled={isSubmitting}
            className="w-full bg-[#7B4A2D] text-white py-6 rounded-3xl text-2xl font-black shadow-xl shadow-[#7B4A2D]/20 hover:bg-[#5D3822] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:bg-zinc-200 disabled:shadow-none flex items-center justify-center gap-3 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Memproses...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-6 py-12">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-10 h-10 text-[#7B4A2D] animate-spin" />
           <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Loading Reset Form...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
