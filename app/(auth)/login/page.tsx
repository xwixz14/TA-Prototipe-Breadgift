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
      className="w-full max-w-md space-y-8 relative z-10"
    >
      <motion.div variants={itemVariants} className="text-center space-y-2">
        <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="flex justify-center mb-6"
        >
            <div className="relative w-24 h-24 overflow-hidden drop-shadow-2xl">
                <Image
                src="/assets/Logo.png"
                alt="BreadGift Logo"
                fill
                className="object-contain"
                priority
                />
            </div>
        </motion.div>
        
        <h1 className="text-5xl font-brand text-primary tracking-tight">
          Welcome Back
        </h1>
        <p className="text-stone-400 font-medium">Masuk untuk menikmati aroma roti segar kami.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-premium p-8 lg:p-10 rounded-[3rem] space-y-6 relative overflow-hidden">
        {/* Decorative elements inside card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-2xl flex items-center border border-red-100 shadow-sm"
            >
              <span className="flex-1 text-center">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-5">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-black text-stone-400 uppercase tracking-[0.2em] text-[10px]">Username</span>
            </label>
            <div className="relative group transition-all duration-300">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-300 group-focus-within:text-primary transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: breadlover"
                className="input w-full pl-11 bg-white/40 border-stone-200/60 focus:border-primary/50 focus:bg-white rounded-2xl h-14 font-bold transition-all placeholder:text-stone-300 focus:shadow-[0_0_20px_rgba(123,74,45,0.05)]"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-black text-stone-400 uppercase tracking-[0.2em] text-[10px]">Password</span>
            </label>
            <div className="relative group transition-all duration-300">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-300 group-focus-within:text-primary transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input w-full pl-11 pr-12 bg-white/40 border-stone-200/60 focus:border-primary/50 focus:bg-white rounded-2xl h-14 font-bold transition-all placeholder:text-stone-300 focus:shadow-[0_0_20px_rgba(123,74,45,0.05)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-300 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <Link 
                href="/forgot-password" 
                className="text-[11px] font-black text-stone-400 hover:text-primary transition-colors uppercase tracking-widest"
              >
                Lupa Password?
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleLogin}
            disabled={isSubmitting}
            className="btn btn-primary w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary border-none text-white hover:bg-primary/90"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>
                <LogIn size={20} className="mr-2" />
                Login
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs font-bold text-stone-400 uppercase tracking-widest pt-4">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary hover:underline decoration-2 underline-offset-4 decoration-primary/30">
            Daftar Sekarang
          </Link>
        </p>
      </motion.div>

      <motion.button
        variants={itemVariants}
        onClick={() => router.push("/")}
        className="flex items-center justify-center w-full text-stone-400 hover:text-stone-600 font-bold text-sm transition-colors group"
      >
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
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
