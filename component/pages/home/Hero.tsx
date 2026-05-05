"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function Hero() {
  const router = useRouter();
  const { user } = useCart();
  const [windowWidth, setWindowWidth] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Handle initial width and resize
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth > 0 && windowWidth < 768;

  const handleOrderNow = () => {
    if (user) {
      router.push("/menu");
    } else {
      router.push("/register");
    }
  };

  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center bg-[#fffcf8]">
      {/* Artwork Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="w-full h-full"
        >
          <Image
            src="/assets/hero_bg.png"
            alt="Bakery Hero Background"
            fill
            className="object-cover object-[center_35%]"
            priority
          />
        </motion.div>
        {/* Subtle Warm Overlay for Atmospheric Effect */}
        <div className="absolute inset-0 bg-[#6B4423]/5"></div>
      </div>

      {/* Main Content Area - Responsive spacing and font sizes */}
      <div className="relative z-10 w-full px-8 md:px-24 mt-20 md:mt-32 text-left">
        {/* Headline: "Breadgift Bakery" with Outfit */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1
            className="text-4xl sm:text-5xl md:text-[100px] font-black leading-[1] mb-6 tracking-tighter"
            style={{
              color: "#7B4A2D",
              WebkitTextStroke: (isMounted && isMobile) ? "1.5px white" : "4px white",
              paintOrder: "stroke fill",
              textShadow: "0 15px 30px rgba(107, 68, 35, 0.25)",
              fontFamily: "var(--font-outfit), sans-serif",
            }}
          >
            Breadgift Bakery
          </h1>
        </motion.div>

        {/* Subtitle: Smaller Size on mobile */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-base md:text-[28px] font-medium text-white max-w-sm md:max-w-2xl leading-snug mb-12 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
          style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif", letterSpacing: "-0.01em" }}
        >
          Aroma roti hangat yang baru keluar dari oven selalu menunggu Anda di BreadGift Bakery.
        </motion.p>

        {/* Action Button: More compact on mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <button
            onClick={handleOrderNow}
            className="group relative bg-[#6B4423] text-white px-8 md:px-14 py-4 md:py-6 rounded-2xl text-[16px] md:text-[24px] font-black transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(107,68,35,0.4)] border-2 border-white/40 hover:bg-[#4A3728] uppercase tracking-widest overflow-hidden"
          >
            <span className="relative z-10">Belanja Sekarang</span>
            {/* Shimmer Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform"></div>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
