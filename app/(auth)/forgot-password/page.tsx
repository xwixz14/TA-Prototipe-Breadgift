"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/actions";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Loader2, ArrowLeft, Mail, ShieldAlert, Sparkles } from "lucide-react";

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

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Format email tidak valid!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await requestPasswordReset(email);
    
    if (result.success) {
      setIsSent(true);
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 3000);
    } else {
      setError(result.error || "Gagal mengirim kode reset");
    }
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen w-full flex bg-background font-sans animated-mesh relative overflow-hidden">
      {/* Left Side: Image Content (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/assets/auth_bg.png"
          alt="Premium Bakery"
          fill
          className="object-cover scale-105 hover:scale-100 transition-transform duration-[10s] ease-linear"
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
              <ShieldAlert size={14} className="text-secondary" />
              Security First
            </div>
            <h2 className="text-6xl font-black text-white leading-tight">
              Don't Worry, <br />
              <span className="text-primary italic">Bebs.</span>
            </h2>
            <p className="text-lg text-stone-200/90 leading-relaxed font-medium">
              Satu langkah lagi untuk kembali menikmati kelezatan roti BreadGift. Kami akan membantumu mengamankan akunmu.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
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
               {isSent ? "Kode Terkirim!" : "Lupa Password?"}
             </h1>
             <p className="text-stone-500 font-bold uppercase tracking-widest text-[10px]">
               {isSent 
                 ? `Cek email ${email} untuk kode verifikasi`
                 : "Masukkan email terdaftar untuk reset"
               }
             </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            variants={itemVariants}
            className="glass-premium p-8 lg:p-10 rounded-[3rem] space-y-6 relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {!isSent ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Email Terdaftar</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full pl-14 pr-6 py-5 bg-white/50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-bold text-stone-800 placeholder:text-stone-300 placeholder:font-medium"
                      />
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
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-primary text-secondary-content py-5 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        Kirim Kode Reset
                        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-6 py-8 text-center"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <p className="text-sm font-bold text-stone-500 uppercase tracking-widest leading-relaxed">
                    Mengalihkan kamu ke <br />
                    halaman verifikasi...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <button 
              onClick={() => router.push("/login")}
              className="inline-flex items-center gap-2 text-stone-400 hover:text-primary transition-colors font-bold text-[10px] uppercase tracking-widest group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Login
            </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
