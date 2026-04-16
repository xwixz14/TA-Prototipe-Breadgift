"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { resetPassword } from "@/lib/actions";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Loader2, ShieldCheck, KeyRound, Lock, Sparkles, Wand2 } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md space-y-8 relative z-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
         <div className="relative w-24 h-24 mx-auto mb-6">
           <Image
             src="/assets/Logo.png"
             alt="BreadGift Logo"
             fill
             className="object-contain drop-shadow-2xl"
             priority
           />
         </div>
         <h1 className="text-4xl font-black text-stone-900 tracking-tight">
           Reset Password
         </h1>
         <p className="text-stone-500 font-bold uppercase tracking-widest text-[10px]">
           Masukkan kode 6 digit dari email kamu
         </p>
      </motion.div>

      {/* Form Card */}
      <motion.div
        variants={itemVariants}
        className="glass-premium p-8 lg:p-10 rounded-[3rem] space-y-6 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6 py-8 text-center"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-100">
                <ShieldCheck className="w-10 h-10 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-green-800">Yay, Berhasil!</h3>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest leading-relaxed px-4">
                  Password kamu sudah diperbarui. <br />
                  Siap untuk belanja lagi?
                </p>
              </div>
              <Loader2 className="w-6 h-6 text-green-400 animate-spin mt-4" />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    readOnly={!!initialEmail}
                    className="w-full px-6 py-4 bg-stone-50/50 border border-stone-100 rounded-2xl focus:outline-none font-bold text-stone-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Kode Verifikasi (6 Digit)</label>
                  <div className="relative group">
                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000 000"
                      className="w-full pl-14 pr-6 py-5 bg-white/50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-black text-stone-800 text-2xl tracking-[0.3em] placeholder:text-stone-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Password Baru</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-bold text-stone-800"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Konfirmasi</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-bold text-stone-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl text-red-600 text-[10px] font-bold text-center"
                >
                  {error}
                </motion.div>
              )}

              <button
                onClick={handleReset}
                disabled={isSubmitting}
                className="w-full bg-primary text-secondary-content py-5 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group mt-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Update Password
                    <Wand2 size={18} className="group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen w-full flex bg-background font-sans animated-mesh relative overflow-hidden">
      {/* Left Side: Image Content (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/assets/auth_bg.png"
          alt="Premium Bakery"
          fill
          className="object-cover scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/60 to-transparent flex flex-col justify-end p-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="space-y-6 max-w-lg"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} className="text-primary" />
              New Identity
            </div>
            <h2 className="text-6xl font-black text-white leading-tight">
              Create a <br />
              <span className="text-primary italic">Better Key.</span>
            </h2>
            <p className="text-lg text-stone-200/90 leading-relaxed font-medium">
              Pastikan password barumu mudah diingat namun tetap aman demi kelezatan roti yang tak terputus.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
        <Suspense fallback={
          <div className="flex flex-col items-center gap-4">
             <Loader2 className="w-10 h-10 text-primary animate-spin" />
             <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Loading Reset Form...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
