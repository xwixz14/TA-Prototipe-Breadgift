"use client";

import Image from "next/image";
import { motion, Variants, useScroll, useTransform, useSpring } from "framer-motion";
import { Sparkles, Calendar, Heart, MapPin, Quote, ChevronDown, Wheat, UtensilsCrossed } from "lucide-react";
import { useRef } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const FloatingIcon = ({ icon: Icon, delay = 0, x = 0, y = 0, size = 24 }: any) => (
  <motion.div
    initial={{ x, y, opacity: 0 }}
    animate={{ 
      y: [y, y - 20, y],
      rotate: [0, 10, -10, 0],
      opacity: [0.2, 0.5, 0.2]
    }}
    transition={{ 
      duration: 5 + Math.random() * 2, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut" 
    }}
    className="absolute pointer-events-none"
  >
    <Icon size={size} className="text-primary/30" />
  </motion.div>
);

export default function About() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  const titleWords = "BreadGift".split("");
  const bakeryWords = "Bakery".split("");

  return (
    <div ref={containerRef} className="w-full bg-background font-sans overflow-hidden">
      {/* 1. Hero Section - Masterpiece 2.0 */}
      <section className="relative h-[95vh] w-full flex items-center justify-center bg-stone-950 overflow-hidden">
        {/* Parallax Background */}
        <motion.div style={{ y: springY, scale, opacity }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2000&auto=format&fit=crop"
            alt="Artisan Bakery Background"
            fill
            className="object-cover brightness-[0.25]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-transparent to-background"></div>
        </motion.div>

        {/* Floating Artisan Elements */}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          <FloatingIcon icon={Wheat} x="10%" y="20%" size={64} delay={0} />
          <FloatingIcon icon={Sparkles} x="85%" y="15%" size={48} delay={1} />
          <FloatingIcon icon={Heart} x="15%" y="70%" size={32} delay={2} />
          <FloatingIcon icon={UtensilsCrossed} x="80%" y="65%" size={56} delay={0.5} />
          <FloatingIcon icon={Wheat} x="45%" y="85%" size={40} delay={1.5} />
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-20 text-center px-6"
        >
          {/* Main Floating Glass Card */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass-premium p-12 md:p-20 rounded-[4rem] border-white/10 shadow-[0_32px_120px_-15px_rgba(0,0,0,0.5)] relative group overflow-hidden"
          >
            <div className="absolute -inset-20 bg-primary/5 blur-3xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-1000"></div>
            
            <div className="relative z-10 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.5em]"
              >
                <Sparkles size={14} className="animate-pulse" />
                Est. Twenty Twenty One
              </motion.div>

              <div className="space-y-4">
                <h1 className="flex justify-center text-7xl md:text-[11rem] font-black text-white tracking-tighter leading-none" style={{ fontFamily: 'var(--font-rametto)' }}>
                  {titleWords.map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + (i * 0.05), duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </h1>
                <h1 className="flex justify-center text-7xl md:text-[11rem] font-black text-primary italic tracking-tighter leading-none" style={{ fontFamily: 'var(--font-rametto)' }}>
                   {bakeryWords.map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.2 + (i * 0.05), duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </h1>
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 1 }}
                className="text-stone-300 text-lg md:text-2xl font-bold max-w-2xl mx-auto uppercase tracking-[0.3em] leading-relaxed opacity-90"
              >
                Menghadirkan Kehangatan dalam <br />
                Setiap Gigitan
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ y: [0, 15, 0], opacity: 0.4 }}
            transition={{ repeat: Infinity, duration: 3, delay: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white"
          >
            <ChevronDown size={48} strokeWidth={1} />
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Our Journey - Redesigned Timeline */}
      <section className="py-32 px-6 md:px-24 bg-white relative">
        <div className="max-w-6xl mx-auto space-y-24">
          <div className="text-center space-y-6">
             <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-primary font-black uppercase tracking-[0.4em] text-xs"
             >
               Evolution
             </motion.span>
            <h2 className="text-5xl md:text-7xl font-black text-stone-900 tracking-tight">Our Journey</h2>
            <div className="h-2 w-32 bg-primary mx-auto rounded-full"></div>
          </div>

          <ul className="timeline timeline-vertical lg:timeline-horizontal">
            <li>
              <div className="timeline-start font-black text-stone-900 text-2xl">2021</div>
              <div className="timeline-middle">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
              </div>
              <motion.div 
                whileHover={{ y: -10 }}
                className="timeline-end timeline-box glass-premium border-none shadow-2xl p-8 rounded-[2.5rem] max-w-xs"
              >
                <h3 className="font-black text-xl text-primary uppercase tracking-wider">The Beginning</h3>
                <p className="text-sm text-stone-500 font-bold leading-relaxed mt-4">
                  BreadGift Bakery hadir dengan komitmen menghadirkan roti berkualitas dari bahan pilihan.
                </p>
              </motion.div>
              <hr className="bg-primary/20" />
            </li>
            <li>
              <hr className="bg-primary/20" />
              <motion.div 
                whileHover={{ y: -10 }}
                className="timeline-start timeline-box glass-premium border-none shadow-2xl p-8 rounded-[2.5rem] max-w-xs"
              >
                <h3 className="font-black text-xl text-primary uppercase tracking-wider">Identity Growth</h3>
                <p className="text-sm text-stone-500 font-bold leading-relaxed mt-4">
                  Menjadi pilihan utama pelanggan di Bandar Lampung yang mengutamakan kualitas rasa.
                </p>
              </motion.div>
              <div className="timeline-middle">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="timeline-end font-black text-stone-900 text-2xl">2023</div>
              <hr className="bg-primary/20" />
            </li>
            <li>
              <hr className="bg-primary/20" />
              <div className="timeline-start font-black text-stone-900 text-2xl">TODAY</div>
              <div className="timeline-middle">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary animate-pulse">
                   <Sparkles className="w-5 h-5 text-primary" />
                </div>
              </div>
              <motion.div 
                whileHover={{ y: -10 }}
                className="timeline-end timeline-box glass-premium border-none shadow-2xl p-8 rounded-[2.5rem] max-w-xs"
              >
                <h3 className="font-black text-xl text-primary uppercase tracking-wider">The Masterpiece</h3>
                <p className="text-sm text-stone-500 font-bold leading-relaxed mt-4">
                  Terus berinovasi dalam menyajikan roti artisan yang lembut dan penuh kebahagiaan setiap harinya.
                </p>
              </motion.div>
            </li>
          </ul>
        </div>
      </section>

      {/* 3. Philosophy Section - Masterpiece Styling */}
      <section className="relative py-40 animated-mesh overflow-hidden">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-20"
        >
          <motion.div variants={itemVariants} className="flex-1 space-y-10">
            <div className="relative">
              <Quote className="text-primary/10 w-40 h-40 absolute -top-10 -left-10" />
              <h2 className="text-6xl md:text-8xl font-black text-stone-900 tracking-tighter leading-[0.9] relative z-10" style={{ fontFamily: 'var(--font-rametto)' }}>
                Roti Bukan <br />
                <span className="text-primary italic">Sekadar</span> <br />
                Makanan.
              </h2>
            </div>
            <div className="space-y-8 text-xl text-stone-600 font-bold leading-relaxed text-justify opacity-80">
              <p>
                Didirikan pada tahun 2021, BreadGift Bakery hadir dengan komitmen menghadirkan roti berkualitas 
                yang dibuat dari bahan pilihan dan diproses dengan penuh ketelitian. Setiap produk dirancang 
                untuk memberikan cita rasa terbaik, tekstur lembut, serta kesegaran premium.
              </p>
              <p>
                Bagi kami, roti adalah bagian dari kehangatan dan kebahagiaan dalam setiap momen. 
                Inilah yang menjadi alasan mengapa kami tidak pernah berkompromi dengan kualitas.
              </p>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex-1 relative">
            <div className="relative aspect-square w-full max-w-xl mx-auto group">
              <div className="absolute -inset-10 bg-primary/20 rounded-full blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full h-full"
              >
                <Image
                  src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1000&auto=format&fit=crop"
                  alt="Bread Selection"
                  fill
                  className="object-cover rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]"
                />
              </motion.div>
              {/* Floating Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 glass-premium rounded-full flex items-center justify-center shadow-2xl z-20 animate-bounce-slow">
                 <Sparkles className="text-primary w-12 h-12" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 4. Footer Accent */}
      <section className="py-20 bg-stone-950 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-50"></div>
        <p className="text-stone-500 font-extrabold uppercase tracking-[0.8em] text-[10px] relative z-10">
          BREADGIFT • THE MASTERPIECE • SINCE 2021
        </p>
      </section>
    </div>
  );
}
