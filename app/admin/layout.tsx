"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/component/admin/layout/AdminSidebar";
import AdminHeader from "@/component/admin/layout/AdminHeader";
import { getMe } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getMe();
      if (!user || user.role !== "admin") {
        router.push("/login");
      } else {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-[#6B4423] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex bg-[#FBFBFB] h-screen text-zinc-900 font-sans overflow-hidden">
      {/* Responsive Sidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Persistent Header */}
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Absolute Main View - Responsive Padding */}
        <main className="flex-1 overflow-hidden p-4 md:p-10">
          <div className="max-w-[1600px] mx-auto h-full flex flex-col lg:flex-row gap-6 lg:gap-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
