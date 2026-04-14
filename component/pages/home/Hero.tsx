"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe } from "@/lib/actions";

export default function Hero() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getMe();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const handleOrderNow = () => {
    if (user) {
      router.push("/menu");
    } else {
      router.push("/register");
    }
  };

  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center">
      {/* Artwork Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/hero_bg.png"
          alt="Bakery Hero Background"
          fill
          className="object-cover object-[center_35%]"
          priority
        />
        {/* Subtle Warm Overlay for Atmospheric Effect */}
        <div className="absolute inset-0 bg-[#6B4423]/5"></div>
      </div>

      {/* Main Content Area - Shifted lower and font size reduced */}
      <div className="relative z-10 w-full px-8 md:px-12 mt-32 text-left">
        {/* Headline: "Breadgift Bakery" with Rammetto One (Smaller Size) */}
        <h1 
          className="text-5xl md:text-[85px] leading-tight mb-4"
          style={{
            color: "#7B4A2D",
            WebkitTextStroke: "6px white",
            paintOrder: "stroke fill",
            textShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
            fontFamily: "var(--font-rammetto-one), cursive",
          }}
        >
          Breadgift Bakery
        </h1>

        {/* Subtitle: Smaller Size & White */}
        <p 
          className="text-lg md:text-[26px] font-bold text-white max-w-xl leading-snug mb-8 drop-shadow-md"
          style={{ letterSpacing: "-0.01em" }}
        >
          Aroma roti hangat yang baru keluar dari oven selalu menunggu Anda di BreadGift Bakery.
        </p>

        {/* Action Button: Scaled Down proportionately */}
        <button 
          onClick={handleOrderNow}
          className="bg-[#6B4423] text-white px-10 py-4 rounded-xl text-[22px] font-extrabold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(0,0,0,0.25)] border-2 border-white/60 hover:bg-[#4A3728] uppercase tracking-wide"
        >
          Pesan Sekarang
        </button>
      </div>
    </section>
  );
}
