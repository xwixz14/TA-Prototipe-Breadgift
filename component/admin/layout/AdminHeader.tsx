"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, Clock } from "lucide-react";
import Image from "next/image";
import { getUnreadTransactionsCount, markAllAsRead } from "@/lib/notifications";

export default function AdminHeader() {
  const [dateTime, setDateTime] = useState({ time: "", date: "" });
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
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

    // Polling for new orders
    const fetchUnread = async () => {
      const count = await getUnreadTransactionsCount();
      setUnreadCount(prev => {
        if (count > prev) {
           audioRef.current?.play().catch(e => console.log("Audio play blocked"));
        }
        return count;
      });
    };

    fetchUnread();
    const pollTimer = setInterval(fetchUnread, 10000); // Check every 10 seconds

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
    <header className="flex justify-between items-center py-4 px-10 bg-white border-b border-zinc-100">
      {/* Title Section */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-zinc-900 leading-none">Kasir</h2>
        <p className="text-xs text-zinc-400 font-medium tracking-wide">Toko Bread Gift</p>
      </div>

      {/* Empty space where search was */}
      <div className="flex-1" />

      {/* Profile & Notifications */}
      <div className="flex items-center gap-6">
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

        {/* Time & Date Section */}
        <div className="flex items-center gap-4 bg-zinc-50 px-5 py-2.5 rounded-2xl border border-zinc-100 shadow-sm">
          <Clock className="w-5 h-5 text-[#6B4423]" />
          <div className="flex flex-col gap-0.5 min-w-[120px]">
            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-[0.2em]">{dateTime.date || "Memuat..."}</span>
            <span className="text-sm font-black text-zinc-900 tracking-tight">{dateTime.time || "00:00:00 WIB"}</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-200 active:scale-95 transition-transform cursor-pointer">
          <div className="flex flex-col items-end gap-0">
            <span className="text-sm font-bold text-zinc-900 leading-tight">Admin</span>
            <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Kasir</span>
          </div>
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-zinc-50 shadow-md">
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
