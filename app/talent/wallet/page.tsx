"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, ArrowLeft, ArrowUpRight, TrendingUp, Vault, ShieldCheck, CheckCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WalletPage() {
  const router = useRouter();
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "info" }[]>([]);

  const addToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleWithdraw = () => {
    addToast("Yêu cầu rút tiền 19.000.000đ đã được gửi tới Ban Quản Trị hệ thống.", "success");
  };

  const transactions = [
    {
      id: "tx1",
      title: "Giải ngân: Livestream Glow Son Môi",
      amount: "+7.600.000đ",
      date: "25 Tháng 5, 2026",
      status: "Thành công",
      type: "income",
      borderColor: "border-[#153f2d] shadow-[0_0_15px_rgba(16,185,129,0.02)]",
      badgeColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    },
    {
      id: "tx2",
      title: "Đặt cọc: Summer Runway Collection",
      amount: "15.000.000đ",
      date: "23 Tháng 5, 2026",
      status: "Đang tạm khóa (Escrow)",
      type: "escrow",
      borderColor: "border-[#143d4d] shadow-[0_0_15px_rgba(34,211,238,0.02)]",
      badgeColor: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
    },
    {
      id: "tx3",
      title: "Giải ngân: Chụp ảnh BST Thu",
      amount: "+11.400.000đ",
      date: "18 Tháng 5, 2026",
      status: "Thành công",
      type: "income",
      borderColor: "border-[#153f2d] shadow-[0_0_15px_rgba(16,185,129,0.02)]",
      badgeColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push("/talent/jobs")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#151b2d] bg-[#08090f] text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-tight uppercase leading-none">Thu Nhập & Ví</h1>
          <p className="text-xs text-slate-400 mt-2 font-medium">Quản lý số dư thu nhập khả dụng, lịch sử giải ngân & quỹ bảo lãnh đặt cọc.</p>
        </div>
      </div>

      {/* Available Balance Card - styled like dashboard.htm banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/7 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-amber-400/5 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.18em] block">Số dư tài khoản khả dụng</span>
            <h2 className="font-display font-black text-white text-3xl md:text-4xl mt-1.5 font-mono">19.000.000đ</h2>
          </div>
          
          <button 
            onClick={handleWithdraw}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 font-display text-xs font-bold shadow-md hover:shadow-lg hover:brightness-105 active:scale-98 transition-all cursor-pointer whitespace-nowrap"
          >
            Rút tiền về tài khoản ngân hàng
          </button>
        </div>
      </div>

      {/* Escrow summary card - styled like dashboard.htm cards */}
      <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#111421]/88 to-[#070913]/96 p-5 transition-all duration-300 border-cyan-400/25 shadow-[0_0_22px_rgba(34,211,238,0.12)]">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-5 blur-2xl bg-gradient-to-br from-cyan-300 to-blue-500" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
              <Vault className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Đang bảo vệ giữ tiền đặt cọc (Escrow)</span>
              <span className="font-display font-black text-white text-lg mt-1 font-mono">15.000.000đ</span>
            </div>
          </div>
          
          <span className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-[9px] font-black uppercase tracking-wider border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
            <ShieldCheck className="h-4 w-4" /> Đặt cọc an toàn
          </span>
        </div>
      </div>

      {/* Transaction Logs */}
      <div className="space-y-4">
        <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
          📝 Lịch Sử Giao Dịch Gần Đây
        </h3>
        
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div 
              key={tx.id} 
              className={cn(
                "rounded-2xl border bg-[#08090f] p-5 flex justify-between items-center transition-all duration-300 hover:bg-slate-950",
                tx.borderColor
              )}
            >
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-white leading-snug">{tx.title}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                  <span>{tx.date}</span>
                  <span>•</span>
                  <span className={cn(
                    tx.status === "Thành công" ? "text-emerald-400" : "text-cyan-400"
                  )}>
                    {tx.status}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <span className={cn(
                  "font-display font-extrabold text-sm font-mono block",
                  tx.type === "income" ? "text-amber-400" : "text-cyan-400"
                )}>
                  {tx.amount}
                </span>
                <span className={cn("inline-block rounded border px-2 py-0.2 text-[8px] font-bold uppercase tracking-wider mt-1.5", tx.badgeColor)}>
                  {tx.type === "income" ? "Thu nhập" : "Khóa đặt cọc"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast system */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`glass-panel border-l-4 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 min-w-[280px] max-w-[400px] ${
              toast.type === "success" ? "border-l-emerald-500" : "border-l-cyan-500"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            ) : (
              <Sparkles className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            )}
            <p className="text-xs font-semibold text-white leading-snug">{toast.message}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
