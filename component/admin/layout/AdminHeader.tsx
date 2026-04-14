"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, Clock, Menu } from "lucide-react";
import Image from "next/image";
import { getUnreadTransactionsCount, markAllAsRead } from "@/lib/notifications";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [dateTime, setDateTime] = useState({ time: "", date: "" });
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // ... (keep useEffect as is)
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("id-ID", { hour12: false }) + " WIB";
      const dateStr = now.toLocaleDateString("id-ID", { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      setDateTime({ time: timeStr, date: dateStr });
    }, 1000);

    const fetchUnread = async () => {
      const count = await getUnreadTransactionsCount();
      setUnreadCount((prev: number) => {
        if (count > prev) {
           audioRef.current?.play().catch((e: any) => console.log("Audio play blocked"));
        }
        return count;
      });
    };

    fetchUnread();
    const pollTimer = setInterval(fetchUnread, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(pollTimer);
    };
  }, []);

  const handleNotificationClick = async () => {
    await markAllAsRead();
    setUnreadCount(0);
  };

  return (
    <header className="flex justify-between items-center py-4 px-4 md:px-10 bg-white border-b border-zinc-100 sticky top-0 z-[100]">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2.5 bg-zinc-50 rounded-xl lg:hidden text-zinc-600 hover:bg-zinc-100 transition-all active:scale-90"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex flex-col">
          <h2 className="text-lg md:text-2xl font-black text-zinc-900 leading-none">Kasir</h2>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Toko Bread Gift</p>
        </div>
      </div>

      {/* Empty space */}
      <div className="flex-1" />

      {/* Profile & Notifications */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Notification Bell */}
        <div 
          onClick={handleNotificationClick}
          className="bg-zinc-100 p-2.5 rounded-2xl hover:bg-zinc-200 transition-colors cursor-pointer relative shadow-sm"
        >
          <Bell className="w-5 h-5 text-zinc-600" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-[10px] font-black text-white">{unreadCount}</span>
            </div>
          )}
        </div>

        {/* Time & Date Section - Hide on very small screens */}
        <div className="hidden sm:flex items-center gap-4 bg-zinc-50 px-5 py-2.5 rounded-2xl border border-zinc-100 shadow-sm">
          <Clock className="w-5 h-5 text-[#6B4423]" />
          <div className="flex flex-col gap-0.5 min-w-[120px]">
            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-[0.2em]">{dateTime.date || "Memuat..."}</span>
            <span className="text-sm font-black text-zinc-900 tracking-tight">{dateTime.time || "00:00:00 WIB"}</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-zinc-200 active:scale-95 transition-transform cursor-pointer">
          <div className="hidden xs:flex flex-col items-end gap-0">
            <span className="text-sm font-bold text-zinc-900 leading-tight">Admin</span>
            <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Kasir</span>
          </div>
          <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-2xl overflow-hidden ring-2 ring-zinc-50 shadow-md">
             <Image 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150"
                alt="Profile Avatar"
                fill
                className="object-cover"
             />
          </div>
        </div>
      </div>
    </header>
  );
}
