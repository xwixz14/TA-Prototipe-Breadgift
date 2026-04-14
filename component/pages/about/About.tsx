"use client";

import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="w-full bg-white py-32 px-10 md:px-24 flex flex-col md:flex-row items-start justify-between gap-16">
      {/* Left Content (Text) - Shifted slightly down */}
      <div className="flex-1 flex flex-col items-start text-left gap-8 mt-12 md:mt-16">
        <h2 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight">
          Breadgift Bakery
        </h2>
        
        <div className="flex flex-col gap-8 text-lg md:text-xl text-zinc-700 leading-relaxed max-w-2xl font-medium text-justify">
          <p>
            Didirikan pada tahun 2021, BreadGift Bakery hadir dengan komitmen menghadirkan roti berkualitas 
            yang dibuat dari bahan pilihan dan diproses dengan penuh ketelitian. Setiap produk dirancang 
            untuk memberikan cita rasa terbaik, tekstur lembut, serta kesegaran yang dapat dinikmati setiap hari.
          </p>
          
          <p>
            Berlokasi di Gg. Mushola Tawakal No.69, Sukarame, Kec. Sukarame, Kota Bandar Lampung, BreadGift Bakery terus 
            berupaya menjadi pilihan bagi pelanggan yang mengutamakan kualitas, rasa, dan pelayanan terbaik. 
            Bagi kami, roti bukan sekadar makanan, tetapi bagian dari kehangatan dan kebahagiaan dalam setiap momen.
          </p>
        </div>
      </div>

      {/* Right Content (Image) - Aligned with the top of text container */}
      <div className="flex-1 flex justify-center items-start pt-8">
        <div className="relative w-full max-w-2xl aspect-[4/3]">
          <Image
            src="/assets/about.png"
            alt="Artisan Bread Basket"
            fill
            className="object-contain drop-shadow-2xl"
            onError={(e) => {
              // Fallback if image not found
              (e.target as any).src = "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop";
            }}
          />
        </div>
      </div>
    </section>
  );
}
