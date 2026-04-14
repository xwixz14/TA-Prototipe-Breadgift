import React from "react";
import ContactComponent from "@/component/pages/contact/ContactComponent";

export const metadata = {
  title: "Hubungi Kami - BreadGift",
  description: "Ada pertanyaan? Segera hubungi tim kami sekarang.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <ContactComponent />
    </main>
  );
}
