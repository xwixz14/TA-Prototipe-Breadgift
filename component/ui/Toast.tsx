"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const styles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      text: "text-green-800",
      accent: "bg-green-500"
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      text: "text-red-800",
      accent: "bg-red-500"
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: <Info className="w-5 h-5 text-blue-500" />,
      text: "text-blue-800",
      accent: "bg-blue-500"
    }
  };

  const current = styles[type];

  return (
    <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-5 rounded-[32px] border shadow-2xl transition-all duration-300 min-w-[300px] ${current.bg} ${current.border} ${isExiting ? 'opacity-0 -translate-y-10' : 'opacity-100 translate-y-0 animate-in slide-in-from-top-10'}`}>
       <div className="flex items-center gap-4">
          <div className="p-2 rounded-2xl bg-white shadow-sm">
            {current.icon}
          </div>
          <p className={`text-base font-black tracking-tight ${current.text}`}>{message}</p>
       </div>
       <button onClick={handleClose} className="ml-6 p-2 rounded-xl hover:bg-black/5 transition-colors">
          <X className="w-5 h-5 text-red-500" />
       </button>
       <div className={`absolute bottom-0 left-0 h-1.5 rounded-full ${current.accent} animate-[progress_4s_linear_forwards]`} style={{ width: '100%' }} />
       <style jsx>{`
          @keyframes progress {
            from { width: 100%; }
            to { width: 0%; }
          }
       `}</style>
    </div>
  );
}
