"use client";
import { motion, AnimatePresence } from "framer-motion";

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, Clock, Menu, Volume2, VolumeX, AlertCircle, Check, User, Key, LogOut, X, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { getUnreadTransactionsCount, markAllAsRead } from "@/lib/notifications";
import { useCart } from "@/context/CartContext";
import { logoutUser, updateProfile, updatePassword } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const {
    isSoundEnabled,
    setIsSoundEnabled,
    isAudioUnlocked,
    playNotification,
    user,
    refreshUser
  } = useCart();

  const router = useRouter();
  const [dateTime, setDateTime] = useState({ time: "", date: "" });
  const [unreadCount, setUnreadCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const lastNotifiedCount = useRef(0);

  // Profile Menu States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Timer Jam & Tanggal
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

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      const count = await getUnreadTransactionsCount();

      setUnreadCount((prev: number) => {
        // Logika Audio Gacor
        if (count > 0 && (count > lastNotifiedCount.current)) {
          // Gunakan playNotification dari global context
          playNotification();
          setShowToast(true);
          lastNotifiedCount.current = count;
          setTimeout(() => setShowToast(false), 8000);
        } else if (count === 0) {
          lastNotifiedCount.current = 0;
        }
        return count;
      });
    };

    fetchUnread();
    const pollTimer = setInterval(fetchUnread, 10000);

    return () => clearInterval(pollTimer);
  }, [isSoundEnabled, isAudioUnlocked, playNotification]);

  const handleNotificationClick = async () => {
    await markAllAsRead();
    setUnreadCount(0);
    lastNotifiedCount.current = 0;
  };

  const toggleSound = () => {
    const nextState = !isSoundEnabled;
    setIsSoundEnabled(nextState);

    if (nextState) {
      playNotification(); // Unlock & test
      if (unreadCount > 0) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      }
    }
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

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2.5 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 ${isSoundEnabled ? 'bg-amber-50 border border-amber-100 text-[#6B4423]' : 'bg-zinc-100 border border-zinc-200 text-zinc-400'}`}
          title={isSoundEnabled ? "Matikan Suara" : "Aktifkan Suara"}
        >
          {isSoundEnabled ? (
            <Volume2 className={`w-5 h-5 ${isAudioUnlocked ? 'animate-pulse' : ''}`} />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">
            {isSoundEnabled ? (isAudioUnlocked ? "Audio Aktif" : "Klik Beri Izin") : "Cek Suara"}
          </span>
        </button>

        {/* Time & Date Section - Hide on very small screens */}
        <div className="hidden sm:flex items-center gap-4 bg-zinc-50 px-5 py-2.5 rounded-2xl border border-zinc-100 shadow-sm">
          <Clock className="w-5 h-5 text-[#6B4423]" />
          <div className="flex flex-col gap-0.5 min-w-[120px]">
            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-[0.2em]">{dateTime.date || "Memuat..."}</span>
            <span className="text-sm font-black text-zinc-900 tracking-tight">{dateTime.time || "00:00:00 WIB"}</span>
          </div>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 pl-3 md:pl-4 border-l border-zinc-200 transition-all cursor-pointer hover:bg-zinc-50 py-1 px-2 rounded-xl ${isProfileOpen ? 'bg-zinc-50' : ''}`}
          >
            <div className="hidden xs:flex flex-col items-end gap-0">
              <span className="text-sm font-bold text-zinc-900 leading-tight">{user?.name || "Admin"}</span>
              <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">{user?.role || "Kasir"}</span>
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

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-zinc-100 overflow-hidden z-[110]"
              >
                <div className="p-4 border-b border-zinc-50 bg-zinc-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-zinc-900 truncate max-w-[140px]">{user?.name}</span>
                      <span className="text-[10px] font-bold text-zinc-400 truncate max-w-[140px]">{user?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => { setIsEditModalOpen(true); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-2xl transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <User size={16} />
                    </div>
                    Edit Profil
                  </button>

                  <button
                    onClick={() => { setIsPasswordModalOpen(true); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-2xl transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                      <Key size={16} />
                    </div>
                    Ganti Password
                  </button>

                  <div className="h-[1px] bg-zinc-50 my-1 mx-2" />

                  <button
                    onClick={async () => { await logoutUser(); router.push("/login"); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100/50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                      <LogOut size={16} />
                    </div>
                    Keluar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <User className="text-primary w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-zinc-900 tracking-tight">Edit Profil</h3>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Informasi Dasar Akun</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                    <X className="w-6 h-6 text-red-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Nama Lengkap</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full pl-11 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold"
                        placeholder="Nama kamu bebs..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold"
                        placeholder="email@contoh.com"
                      />
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      setIsUpdatingProfile(true);
                      const res = await updateProfile(profileForm);
                      if (res.success) {
                        await refreshUser();
                        setIsEditModalOpen(false);
                      } else {
                        alert(res.error);
                      }
                      setIsUpdatingProfile(false);
                    }}
                    disabled={isUpdatingProfile}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {isUpdatingProfile ? <span className="loading loading-spinner"></span> : "Simpan Perubahan"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                      <Key className="text-amber-600 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-zinc-900 tracking-tight">Ganti Password</h3>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Keamanan Akun</p>
                    </div>
                  </div>
                  <button onClick={() => setIsPasswordModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                    <X className="w-6 h-6 text-red-500" />
                  </button>
                </div>

                {passwordError && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
                    <AlertCircle size={20} />
                    <span className="text-sm font-bold">{passwordError}</span>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Password Lama</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                        <Key size={18} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        className="w-full pl-11 pr-12 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-amber-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Password Baru</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                        <ShieldCheck size={18} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full pl-11 pr-12 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold"
                        placeholder="Minimal 6 karakter..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-amber-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                        <ShieldCheck size={18} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full pl-11 pr-12 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold"
                        placeholder="Ulangi password baru..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-amber-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                        setPasswordError("Konfirmasi password tidak cocok!");
                        return;
                      }
                      if (passwordForm.newPassword.length < 4) {
                        setPasswordError("Password baru terlalu pendek!");
                        return;
                      }

                      setIsUpdatingPassword(true);
                      setPasswordError("");
                      const res = await updatePassword({
                        oldPassword: passwordForm.oldPassword,
                        newPassword: passwordForm.newPassword
                      });

                      if (res.success) {
                        setIsPasswordModalOpen(false);
                        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
                        alert("Password berhasil diubah!");
                      } else {
                        setPasswordError(res.error || "Gagal mengubah password");
                      }
                      setIsUpdatingPassword(false);
                    }}
                    disabled={isUpdatingPassword}
                    className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {isUpdatingPassword ? <span className="loading loading-spinner"></span> : "Ganti Password Sekarang"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Order Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-full max-w-[400px] px-4"
          >
            <div className="bg-zinc-900 text-white p-6 rounded-[32px] shadow-2xl flex flex-col gap-4 border border-zinc-800 pointer-events-auto">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#6B4423] rounded-2xl flex items-center justify-center shadow-lg shadow-[#6B4423]/20 animate-bounce">
                  <AlertCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-0.5">Ada Pesanan Baru!</p>
                  <p className="text-base font-black tracking-tight leading-tight">Segera cek rincian pesanan bebs!</p>
                </div>
                <button
                  onClick={() => setShowToast(false)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
