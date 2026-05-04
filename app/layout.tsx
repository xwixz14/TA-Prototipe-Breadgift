import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono, Outfit, Poppins } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BreadGift Bakery",
  description: "Fresh from the oven, straight to your heart.",
  icons: {
    icon: "/assets/Logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import Navbar from "@/component/layout/Navbar";
import { CartProvider } from "@/context/CartContext";
import { getMe } from "@/lib/actions";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getMe();

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${geistMono.variable} ${outfit.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans antialiased">
        <CartProvider initialUser={user}>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
