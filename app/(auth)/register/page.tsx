"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/lib/actions";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { User, Mail, Lock, UserPlus, ArrowLeft, Heart, Eye, EyeOff } from "lucide-react";

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
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function RegisterPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setError("Harap isi semua bidang!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await registerUser(formData);
      
      if (result.success) {
        clearCart(); // Bersihkan keranjang agar akun baru mulai dari nol
        router.push("/login?registered=true");
      } else {
        setError(result.error || "Gagal mendaftar");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex bg-background font-sans animated-mesh relative overflow-hidden">
      {/* Left Side: Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8 relative overflow-hidden order-2 lg:order-1">
         <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-2xl space-y-6 z-10 px-4 lg:px-0"
         >
            <motion.div variants={itemVariants} className="text-center lg:text-left space-y-3">
                <h1 className="text-3xl md:text-5xl font-black text-stone-900 tracking-tighter" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                    Join <span className="text-primary italic">BreadGift.</span>
                </h1>
                <p className="text-stone-400 font-bold text-[10px] md:text-xs uppercase tracking-widest leading-relaxed">Mulai petualangan rasa dengan bahan premium.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] space-y-6 relative overflow-hidden border border-white shadow-2xl shadow-stone-200/30">
                 {/* Floating Decorative Heart */}
                 <div className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-primary rotate-12">
                    <Heart size={18} fill="currentColor" />
                 </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest p-3 rounded-xl flex items-center border border-red-100"
                        >
                        <span className="flex-1 text-center">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div className="form-control">
                        <label className="label py-0.5">
                        <span className="label-text font-black text-stone-400 uppercase tracking-[0.2em] text-[8px]">Nama Lengkap</span>
                        </label>
                        <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-300 group-focus-within:text-primary transition-colors">
                            <User size={16} />
                        </div>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            className="input w-full pl-11 bg-stone-50 border-transparent focus:border-primary/10 focus:bg-white rounded-xl h-12 md:h-14 font-bold text-stone-900 transition-all placeholder:text-stone-300 text-sm"
                            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                        />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label py-0.5">
                        <span className="label-text font-black text-stone-400 uppercase tracking-[0.2em] text-[8px]">Username</span>
                        </label>
                        <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-300 group-focus-within:text-primary transition-colors">
                            <UserPlus size={16} />
                        </div>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="breadlover"
                            className="input w-full pl-11 bg-stone-50 border-transparent focus:border-primary/10 focus:bg-white rounded-xl h-12 md:h-14 font-bold text-stone-900 transition-all placeholder:text-stone-300 text-sm"
                            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                        />
                        </div>
                    </div>

                    <div className="form-control md:col-span-2">
                        <label className="label py-0.5">
                        <span className="label-text font-black text-stone-400 uppercase tracking-[0.2em] text-[8px]">Email</span>
                        </label>
                        <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-300 group-focus-within:text-primary transition-colors">
                            <Mail size={16} />
                        </div>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            className="input w-full pl-11 bg-stone-50 border-transparent focus:border-primary/10 focus:bg-white rounded-xl h-12 md:h-14 font-bold text-stone-900 transition-all placeholder:text-stone-300 text-sm"
                            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                        />
                        </div>
                    </div>

                    <div className="form-control md:col-span-2">
                        <label className="label py-0.5">
                        <span className="label-text font-black text-stone-400 uppercase tracking-[0.2em] text-[8px]">Password</span>
                        </label>
                        <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-300 group-focus-within:text-primary transition-colors">
                            <Lock size={16} />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            className="input w-full pl-11 pr-12 bg-stone-50 border-transparent focus:border-primary/10 focus:bg-white rounded-xl h-12 md:h-14 font-bold text-stone-900 transition-all placeholder:text-stone-300 text-sm"
                            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-300 hover:text-primary transition-colors"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <button
                        onClick={handleRegister}
                        disabled={isSubmitting}
                        className="btn btn-primary w-full h-12 md:h-14 rounded-xl text-[10px] md:text-xs font-black shadow-xl shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all bg-primary border-none text-white hover:bg-stone-900 uppercase tracking-[0.25em]"
                    >
                        {isSubmitting ? (
                        <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                        "Gabung Sekarang"
                        )}
                    </button>
                </div>

                <p className="text-center text-[10px] font-medium text-stone-400 pt-4 whitespace-nowrap">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="text-primary hover:text-stone-900 transition-colors font-bold border-b border-primary/20 hover:border-primary pb-0.5">
                        Masuk di sini
                    </Link>
                </p>
            </motion.div>

            <motion.button
                variants={itemVariants}
                onClick={() => router.push("/")}
                className="flex items-center justify-center w-full text-stone-400 hover:text-stone-900 font-black text-[9px] uppercase tracking-[0.25em] transition-all group pt-2"
            >
                <ArrowLeft size={12} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Kembali ke Beranda
            </motion.button>
         </motion.div>
      </div>

      {/* Right Side: Image & Content (Desktop only) */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden order-1 lg:order-2">
        <Image
          src="/assets/auth_bg.png"
          alt="Premium Bakery"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 text-white">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
                 <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center p-4 border border-white/30 shadow-2xl">
                    <Image src="/assets/Logo.png" alt="Logo" width={80} height={80} className="brightness-0 invert" />
                 </div>
            </div>
            <h2 className="text-5xl font-brand">Better Bread.<br/>Better Day.</h2>
            <p className="text-lg font-medium opacity-90 max-w-xs mx-auto">
              Ribuan pecinta roti sudah bergabung. Jadilah bagian dari keluarga BreadGift hari ini.
            </p>
            
            <div className="flex items-center justify-center gap-2 pt-4">
               <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-stone-200"></div>
                  ))}
               </div>
               <span className="text-xs font-bold">1,200+ Member Baru</span>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
