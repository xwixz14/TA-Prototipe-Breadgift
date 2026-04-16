import type { Metadata } from "next";
import { Poppins, Geist_Mono, Rammetto_One } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rammettoOne = Rammetto_One({
  variable: "--font-rammetto-one",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BreadGift Bakery",
  description: "Fresh from the oven, straight to your heart.",
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
      className={`${poppins.variable} ${geistMono.variable} ${rammettoOne.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans antialiased">
        <CartProvider initialUser={user}>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
