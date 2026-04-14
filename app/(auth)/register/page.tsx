"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/lib/actions";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { User, Mail, Lock, UserPlus, ArrowLeft, Heart } from "lucide-react";

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
            className="w-full max-w-2xl space-y-8 z-10"
         >
            <motion.div variants={itemVariants} className="text-center lg:text-left space-y-2">
                <h1 className="text-4xl lg:text-5xl font-brand text-primary tracking-tight">
                    Join BreadGift
                </h1>
                <p className="text-stone-400 font-medium text-lg">Mulai petualangan rasa dengan bahan-bahan premium pilihan.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-premium p-8 lg:p-12 rounded-[3.5rem] space-y-6 relative">
                 {/* Floating Decorative Heart */}
                 <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-primary rotate-12">
                    <Heart size={20} fill="currentColor" />
                 </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-2xl flex items-center border border-red-100 shadow-sm"
                        >
                        <span className="flex-1 text-center">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="form-control">
                        <label className="label py-1">
                        <span className="label-text font-black text-stone-400 uppercase tracking-widest text-[10px]">Nama Lengkap</span>
                        </label>
                        <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-300 group-focus-within:text-primary transition-colors">
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            className="input w-full pl-11 bg-white/40 border-stone-200/60 focus:border-primary/50 focus:bg-white rounded-2xl h-14 font-bold transition-all placeholder:text-stone-300"
                        />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label py-1">
                        <span className="label-text font-black text-stone-400 uppercase tracking-widest text-[10px]">Username</span>
                        </label>
                        <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-300 group-focus-within:text-primary transition-colors">
                            <UserPlus size={18} />
                        </div>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="breadlover"
                            className="input w-full pl-11 bg-white/40 border-stone-200/60 focus:border-primary/50 focus:bg-white rounded-2xl h-14 font-bold transition-all placeholder:text-stone-300"
                        />
                        </div>
                    </div>

                    <div className="form-control md:col-span-2">
                        <label className="label py-1">
                        <span className="label-text font-black text-stone-400 uppercase tracking-widest text-[10px]">Email</span>
                        </label>
                        <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-300 group-focus-within:text-primary transition-colors">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            className="input w-full pl-11 bg-white/40 border-stone-200/60 focus:border-primary/50 focus:bg-white rounded-2xl h-14 font-bold transition-all placeholder:text-stone-300"
                        />
                        </div>
                    </div>

                    <div className="form-control md:col-span-2">
                        <label className="label py-1">
                        <span className="label-text font-black text-stone-400 uppercase tracking-widest text-[10px]">Password</span>
                        </label>
                        <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-300 group-focus-within:text-primary transition-colors">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            className="input w-full pl-11 bg-white/40 border-stone-200/60 focus:border-primary/50 focus:bg-white rounded-2xl h-14 font-bold transition-all placeholder:text-stone-300"
                        />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                    <button
                        onClick={handleRegister}
                        disabled={isSubmitting}
                        className="btn btn-primary w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary border-none text-white hover:bg-primary/90"
                    >
                        {isSubmitting ? (
                        <span className="loading loading-spinner"></span>
                        ) : (
                        "Gabung Sekarang"
                        )}
                    </button>
                    
                    <button
                        type="button"
                        className="btn btn-outline w-full h-14 rounded-2xl border-stone-200 hover:bg-stone-50 hover:border-stone-300 text-stone-600 font-bold transition-all"
                    >
                        <Mail size={20} className="mr-2 text-primary" />
                        Daftar dengan Google
                    </button>
                </div>

                <p className="text-center text-xs font-bold text-stone-400 uppercase tracking-widest pt-4">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="text-primary hover:underline decoration-2 underline-offset-4 decoration-primary/30">
                        Masuk di sini
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
