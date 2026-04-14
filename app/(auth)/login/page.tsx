"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { loginUser } from "@/lib/actions";
import { useCart } from "@/context/CartContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { refreshCart, setIsCartOpen } = useCart();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Harap isi username dan password!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await loginUser({ username, password });
    
    if (result.success) {
      await refreshCart(); // Muat keranjang tersimpan dari database
      setIsCartOpen(false); // Reset UI keranjang agar tidak macet
      if (result.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push(redirect);
      }
    } else {
      setError(result.error || "Login gagal");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-10">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-[#7B4A2D] tracking-tight leading-none">
          Selamat Datang Kembali
        </h1>
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Silakan login untuk menikmati roti kami</p>
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

      <div className="w-full space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan Username"
            className="w-full px-8 py-5 text-lg font-bold text-zinc-900 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7B4A2D]/10 focus:border-[#7B4A2D] transition-all placeholder:text-zinc-300"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan Password"
            className="w-full px-8 py-5 text-lg font-bold text-zinc-900 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7B4A2D]/10 focus:border-[#7B4A2D] transition-all placeholder:text-zinc-300"
          />
          <div className="flex justify-end pr-1">
            <Link 
              href="/forgot-password" 
              className="text-xs font-bold text-zinc-400 hover:text-[#7B4A2D] transition-colors"
            >
              Lupa Password?
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-6 mt-4">
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/")}
            disabled={isSubmitting}
            className="flex-1 bg-zinc-100 text-zinc-400 py-5 rounded-3xl text-xl font-bold hover:bg-zinc-200 transition-all font-sans disabled:opacity-50"
          >
            Batal
          </button>
          
          <button
            onClick={handleLogin}
            disabled={isSubmitting}
            className="flex-[2] bg-[#7B4A2D] text-white py-5 rounded-3xl text-2xl font-black shadow-xl shadow-[#7B4A2D]/20 hover:bg-[#5D3822] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:bg-zinc-200 disabled:shadow-none"
          >
            {isSubmitting ? "Masuk..." : "Login"}
          </button>
        </div>

        <p className="text-center text-sm font-bold text-zinc-400 uppercase tracking-widest">
          Belum punya akun?{" "}
          <Link href="/register" className="text-[#7B4A2D] hover:underline decoration-2 underline-offset-4">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-6 py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
