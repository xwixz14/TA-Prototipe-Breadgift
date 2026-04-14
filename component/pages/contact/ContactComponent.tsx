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
    value: "halo@breadgift.id",
    href: "mailto:halo@breadgift.id",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: <Phone className="w-6 h-6" />,
    label: "Telepon / WA",
    value: "+62 812-3456-7890",
    href: "tel:+6281234567890",
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
    <div className="flex-1 flex flex-col pt-32 pb-24 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-10 w-full">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col mb-20"
        >
          <span className="text-sm font-black text-[#6B4423] uppercase tracking-widest mb-4 border-l-4 border-[#6B4423] pl-4">Contact Us</span>
          <h1 className="text-6xl md:text-7xl font-black text-zinc-900 tracking-tighter leading-none mb-8">
            Katakan Halo pada <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B4423] to-[#A67C52]">Roti Segar Kami.</span>
          </h1>
          <p className="max-w-2xl text-xl text-zinc-500 font-medium leading-relaxed">
            Punya pertanyaan atau pesanan khusus? Tim kami siap membantu Anda mendapatkan pengalaman roti terbaik langsung dari oven.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* Left Column: Contact Info & Socials */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col gap-12"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((info, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-zinc-100 p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className={`p-4 rounded-2xl w-fit mb-6 transition-colors ${info.color}`}>
                    {info.icon}
                  </div>
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">{info.label}</p>
                  {info.href ? (
                    <a href={info.href} className="text-lg font-black text-zinc-900 hover:text-[#6B4423] transition-colors line-clamp-1">
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-lg font-black text-zinc-900">{info.value}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-[#6B4423] p-10 rounded-[40px] text-white relative overflow-hidden group">
              {/* Abstract Background Shapes */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
              
              <h3 className="text-2xl font-black mb-4 relative z-10">Follow Our Journey</h3>
              <p className="text-white/60 font-medium mb-8 relative z-10">Dapatkan update terbaru mengenai promo dan varian roti baru kami di media sosial.</p>
              
              <div className="flex gap-4 relative z-10">
                {socialLinks.map((social, idx) => (
                  <a 
                    key={idx} 
                    href={social.href}
                    className={`w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center transition-all duration-300 border border-white/10 hover:bg-white hover:text-[#6B4423] ${social.color}`}
                  >
                    {social.icon}
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
            <div className="bg-white border border-zinc-100 p-12 md:p-16 rounded-[48px] shadow-2xl shadow-zinc-200/50 relative overflow-hidden">
              
              {isSent ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-20"
                >
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-black text-zinc-900 mb-4">Pesan Terkirim!</h3>
                  <p className="text-zinc-500 font-medium max-w-xs">Terima kasih telah menghubungi kami. Tim kami akan segera merespon pesan Anda.</p>
                  <button 
                    onClick={() => setIsSent(false)}
                    className="mt-10 text-sm font-black text-[#6B4423] underline underline-offset-4"
                  >
                    Kirim pesan lain
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="mb-12">
                    <h3 className="text-3xl font-black text-zinc-900 mb-2">Kirim Pesan</h3>
                    <p className="text-zinc-400 font-bold">Kami akan membalas pesan Anda dalam waktu 24 jam.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="flex flex-col gap-3">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                        <input 
                          required
                          type="text" 
                          value={formState.name}
                          onChange={(e) => setFormState({...formState, name: e.target.value})}
                          className="w-full bg-zinc-50 border border-zinc-100 py-5 px-8 rounded-3xl focus:outline-none focus:ring-4 focus:ring-[#6B4423]/5 focus:border-[#6B4423] transition-all font-bold text-sm text-zinc-900 placeholder:text-zinc-300" 
                          placeholder="Bread Gift" 
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Alamat Email</label>
                        <input 
                          required
                          type="email" 
                          value={formState.email}
                          onChange={(e) => setFormState({...formState, email: e.target.value})}
                          className="w-full bg-zinc-50 border border-zinc-100 py-5 px-8 rounded-3xl focus:outline-none focus:ring-4 focus:ring-[#6B4423]/5 focus:border-[#6B4423] transition-all font-bold text-sm text-zinc-900 placeholder:text-zinc-300" 
                          placeholder="halo@example.com" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Subjek</label>
                      <input 
                        required
                        type="text" 
                        value={formState.subject}
                        onChange={(e) => setFormState({...formState, subject: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-100 py-5 px-8 rounded-3xl focus:outline-none focus:ring-4 focus:ring-[#6B4423]/5 focus:border-[#6B4423] transition-all font-bold text-sm text-zinc-900 placeholder:text-zinc-300" 
                        placeholder="Ingin bertanya tentang..." 
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Pesan Anda</label>
                      <textarea 
                        required
                        rows={5} 
                        value={formState.message}
                        onChange={(e) => setFormState({...formState, message: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-100 py-5 px-8 rounded-3xl focus:outline-none focus:ring-4 focus:ring-[#6B4423]/5 focus:border-[#6B4423] transition-all font-bold text-sm text-zinc-900 placeholder:text-zinc-300 resize-none" 
                        placeholder="Tuliskan detail pertanyaan atau pesanan Anda di sini..."
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-6 bg-[#6B4423] text-white rounded-3xl text-lg font-black shadow-2xl shadow-[#6B4423]/30 hover:bg-[#5D3822] hover:shadow-[#6B4423]/50 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait group"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          Mengirim...
                        </div>
                      ) : (
                        <>
                          Hubungi Kami Sekarang
                          <Send className="w-6 h-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
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
