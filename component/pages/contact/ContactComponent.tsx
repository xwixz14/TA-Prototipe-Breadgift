"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Globe,
  Share2,
  MessageSquare,
  Clock,
  CheckCircle2
} from "lucide-react";

// Static constants outside for hydration stability
const contactInfo = [
  {
    icon: <Mail className="w-6 h-6" />,
    label: "Email Kami",
    value: "breadgift9@gmail.com",
    href: "mailto:breadgift9@gmail.com",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: <Phone className="w-6 h-6" />,
    label: "Telepon / WA",
    value: "+62 822-7972-8849",
    href: "https://wa.me/6282279728849",
    color: "bg-green-50 text-green-600"
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    label: "Lokasi Toko",
    value: "Gg. Mushola Tawakal No.69, Sukarame, Kec. Sukarame, Kota Bandar Lampung, Lampung 35122",
    href: "https://maps.app.goo.gl/8NX1PX5WorBVdztb7",
    color: "bg-red-50 text-red-600"
  },
  {
    icon: <Clock className="w-6 h-6" />,
    label: "Jam Operasional",
    value: "07:00 - 21:00 (Setiap Hari)",
    color: "bg-amber-50 text-amber-600"
  }
];

const socialLinks = [
  { icon: <Globe className="w-5 h-5" />, href: "#", color: "hover:text-pink-500" },
  { icon: <Share2 className="w-5 h-5" />, href: "#", color: "hover:text-blue-400" },
  { icon: <MessageSquare className="w-5 h-5" />, href: "#", color: "hover:text-blue-600" }
];

export default function ContactComponent() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSent(true);
    setTimeout(() => setIsSent(false), 5000);
    setFormState({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="flex-1 flex flex-col pt-24 md:pt-32 pb-24 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 w-full">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col mb-10 md:mb-16"
        >
          <span className="text-xs font-black text-[#6B4423] uppercase tracking-widest mb-4 border-l-4 border-[#6B4423] pl-4">Contact Us</span>
          <h1 className="text-3xl md:text-6xl font-black text-zinc-900 tracking-tighter leading-[1.1] mb-6">
            Katakan Halo pada <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B4423] to-[#A67C52]">Roti Segar Kami.</span>
          </h1>
          <p className="max-w-xl text-sm md:text-lg text-zinc-500 font-medium leading-relaxed">
            Punya pertanyaan atau pesanan khusus? Tim kami siap membantu Anda mendapatkan pengalaman roti terbaik langsung dari oven.
          </p>
        </motion.div>
 
        <div className="grid lg:grid-cols-12 gap-10 md:gap-16">
          
          {/* Left Column: Contact Info & Socials */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col gap-8 md:gap-10"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-zinc-100 p-6 rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className={`p-3 rounded-xl w-fit mb-4 transition-colors ${info.color}`}>
                    {React.cloneElement(info.icon as React.ReactElement, { size: 20 })}
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{info.label}</p>
                  {info.href ? (
                    <a href={info.href} className="text-sm font-black text-zinc-900 hover:text-[#6B4423] transition-colors line-clamp-1">
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-sm font-black text-zinc-900">{info.value}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-[#6B4423] p-8 rounded-[32px] text-white relative overflow-hidden group">
              <h3 className="text-xl font-black mb-3 relative z-10">Follow Our Journey</h3>
              <p className="text-white/60 text-xs font-medium mb-6 relative z-10">Dapatkan update terbaru mengenai promo dan varian roti kami.</p>
              
              <div className="flex gap-3 relative z-10">
                {socialLinks.map((social, idx) => (
                  <a 
                    key={idx} 
                    href={social.href}
                    className={`w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center transition-all duration-300 border border-white/10 hover:bg-white hover:text-[#6B4423] ${social.color}`}
                  >
                    {React.cloneElement(social.icon as React.ReactElement, { size: 18 })}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-7"
          >
            <div className="bg-white border border-zinc-100 p-6 md:p-12 rounded-[32px] shadow-2xl shadow-zinc-200/40 relative overflow-hidden">
              
              {isSent ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-16"
                >
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 mb-3">Pesan Terkirim!</h3>
                  <p className="text-zinc-500 text-sm font-medium max-w-xs">Terima kasih telah menghubungi kami. Kami akan segera merespon.</p>
                  <button 
                    onClick={() => setIsSent(false)}
                    className="mt-8 text-xs font-black text-[#6B4423] underline underline-offset-4"
                  >
                    Kirim pesan lain
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-zinc-900 mb-1 tracking-tight">Kirim Pesan</h3>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Kami akan membalas dalam 24 jam.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                        <input 
                          required
                          type="text" 
                          value={formState.name}
                          onChange={(e) => setFormState({...formState, name: e.target.value})}
                          className="w-full bg-zinc-50 border border-zinc-100 py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#6B4423]/5 focus:border-[#6B4423] transition-all font-bold text-xs text-zinc-900 placeholder:text-zinc-300" 
                          placeholder="Bread Gift" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Alamat Email</label>
                        <input 
                          required
                          type="email" 
                          value={formState.email}
                          onChange={(e) => setFormState({...formState, email: e.target.value})}
                          className="w-full bg-zinc-50 border border-zinc-100 py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#6B4423]/5 focus:border-[#6B4423] transition-all font-bold text-xs text-zinc-900 placeholder:text-zinc-300" 
                          placeholder="halo@example.com" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Subjek</label>
                      <input 
                        required
                        type="text" 
                        value={formState.subject}
                        onChange={(e) => setFormState({...formState, subject: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-100 py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#6B4423]/5 focus:border-[#6B4423] transition-all font-bold text-xs text-zinc-900 placeholder:text-zinc-300" 
                        placeholder="Ingin bertanya tentang..." 
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Pesan Anda</label>
                      <textarea 
                        required
                        rows={4} 
                        value={formState.message}
                        onChange={(e) => setFormState({...formState, message: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-100 py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#6B4423]/5 focus:border-[#6B4423] transition-all font-bold text-xs text-zinc-900 placeholder:text-zinc-300 resize-none" 
                        placeholder="Tuliskan detail pertanyaan atau pesanan Anda..."
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-[#6B4423] text-white rounded-2xl text-[10px] md:text-xs font-black shadow-xl shadow-[#6B4423]/20 hover:bg-[#5D3822] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait group uppercase tracking-[0.2em]"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Mengirim...
                        </div>
                      ) : (
                        <>
                          Hubungi Kami Sekarang
                          <Send size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
