"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { loginUser } from "@/lib/actions";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Lock, User, ArrowLeft, LogIn, Mail, Quote, Eye, EyeOff } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { refreshCart, setIsCartOpen } = useCart();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Harap isi username dan password!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await loginUser({ username, password });
      
      if (result.success) {
        await refreshCart(); // Muat keranjang tersimpan dari database
        setIsCartOpen(false); // Reset UI keranjang agar tidak macet
        if (result.role === "admin") {
          const SECURE_QUERY = "gs_lcrp=EgZjaHJvbWUqBwgAEAAYjwIyBwgAEAAYjwIyDAgBEC4YJxiABBiKBTIGCAIQRRg7MgYIAxBFGDsyDQgEEAAYgwEYsQMYgAQyDQgFEAAYgwEYsQMYgAQyBggGEEUYPTIGCAcQBRhA0gEHOTA2ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8";
          router.push(`/admin/dashboard?${SECURE_QUERY}`);
        } else {
          router.push(redirect);
        }
      } else {
        setError(result.error || "Login gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md space-y-8 md:space-y-12 relative z-10 px-4 md:px-0"
    >
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex justify-center mb-4 md:mb-8"
        >
            <div className="relative w-20 h-20 md:w-28 md:h-28 overflow-hidden drop-shadow-2xl">
                <Image
                src="/assets/Logo.png"
                alt="BreadGift Logo"
                fill
                className="object-contain"
                priority
                />
            </div>
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-black text-stone-900 tracking-tighter" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
          Welcome <br className="md:hidden" />
          <span className="text-primary italic">Back.</span>
        </h1>
        <p className="text-stone-400 font-bold text-xs md:text-sm uppercase tracking-widest leading-relaxed">
          Masuk untuk menikmati <br className="hidden md:block" /> aroma roti segar kami.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] space-y-8 relative overflow-hidden border border-white shadow-2xl shadow-stone-200/40">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl flex items-center border border-red-100"
            >
              <span className="flex-1 text-center">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-black text-stone-400 uppercase tracking-[0.3em] text-[9px]">Username</span>
            </label>
            <div className="relative group transition-all duration-300">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-stone-300 group-focus-within:text-primary transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: breadlover"
                className="input w-full pl-12 bg-stone-50 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl h-14 md:h-16 font-bold text-stone-900 transition-all placeholder:text-stone-300 placeholder:font-medium focus:shadow-[0_10px_30px_-5px_rgba(123,74,45,0.1)]"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-black text-stone-400 uppercase tracking-[0.3em] text-[9px]">Password</span>
            </label>
            <div className="relative group transition-all duration-300">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-stone-300 group-focus-within:text-primary transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input w-full pl-12 pr-14 bg-stone-50 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl h-14 md:h-16 font-bold text-stone-900 transition-all placeholder:text-stone-300 focus:shadow-[0_10px_30px_-5px_rgba(123,74,45,0.1)]"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-stone-300 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end mt-3">
              <Link 
                href="/forgot-password" 
                className="text-[9px] font-black text-stone-400 hover:text-primary transition-colors uppercase tracking-[0.2em]"
              >
                Lupa Password?
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <button
            onClick={handleLogin}
            disabled={isSubmitting}
            className="btn btn-primary w-full h-14 md:h-16 rounded-2xl text-xs md:text-sm font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary border-none text-white hover:bg-stone-900 uppercase tracking-[0.3em]"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>
                <LogIn size={18} className="mr-3" />
                Login
              </>
            )}
          </button>
        </div>

        <p className="text-center text-[10px] font-medium text-stone-400 pt-6 whitespace-nowrap">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary hover:text-stone-900 transition-colors font-bold border-b border-primary/20 hover:border-primary pb-0.5">
            Daftar Sekarang
          </Link>
        </p>
      </motion.div>

      <motion.button
        variants={itemVariants}
        onClick={() => router.push("/")}
        className="flex items-center justify-center w-full text-stone-400 hover:text-stone-900 font-black text-[10px] uppercase tracking-[0.3em] transition-all group pt-4"
      >
        <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Beranda
      </motion.button>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex bg-background font-sans animated-mesh relative overflow-hidden">
      {/* Left Side: Image & Content (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/assets/auth_bg.png"
          alt="Premium Bakery"
          fill
          className="object-cover scale-105 hover:scale-110 transition-transform duration-[10s] ease-linear"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 via-primary/20 to-transparent"></div>
        
        <div className="absolute top-12 left-12 z-20">
             <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center p-2">
                    <Image src="/assets/Logo.png" alt="Logo" width={40} height={40} className="brightness-0 invert" />
                </div>
                <span className="font-brand text-2xl tracking-tight">BreadGift.</span>
             </div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 text-white z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-6xl font-brand leading-none">Freshly<br/>Baked Joy.</h2>
            <p className="text-xl font-medium opacity-90 max-w-md">
              Hadirkan kebahagiaan ke meja makan Anda dengan roti yang dibuat sepenuh hati setiap hari.
            </p>
          </div>

          <div className="glass-premium p-6 rounded-[2rem] max-w-sm border-white/20">
             <Quote className="text-white/40 mb-3" size={24} fill="white" />
             <p className="text-white font-medium italic text-sm leading-relaxed">
               "Roti paling lembut yang pernah saya beli di aplikasi. Pengalaman pesannya juga sangat premium!"
             </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
        <Suspense fallback={<div className="loading loading-dots loading-lg text-primary"></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
