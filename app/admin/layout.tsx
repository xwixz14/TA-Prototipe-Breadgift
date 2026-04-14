import React from "react";
import AdminSidebar from "@/component/admin/layout/AdminSidebar";
import AdminHeader from "@/component/admin/layout/AdminHeader";

import { getMe } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMe();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }
  return (
    <div className="flex bg-[#FBFBFB] h-screen text-zinc-900 font-sans overflow-hidden">
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Persistent Header */}
        <AdminHeader />

        {/* Absolute Main View - No outer scroll */}
        <main className="flex-1 overflow-hidden p-8 md:p-10">
          <div className="max-w-[1600px] mx-auto h-full flex gap-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
