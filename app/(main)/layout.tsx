import React from "react";
import Navbar from "@/component/layout/Navbar";
import CartDrawer from "@/component/pages/menu/CartDrawer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <CartDrawer />
    </>
  );
}
