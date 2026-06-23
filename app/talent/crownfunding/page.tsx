"use client";

import React, { useState } from "react";
import { Crown, Heart, Share2, Users, Calendar, Award, CheckCircle, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CrownPage() {
  const [raised, setRaised] = useState(62500000);
  const [supportersCount, setSupportersCount] = useState(1248);
  const [donationAmount, setDonationAmount] = useState("200000");
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "info" }[]>([]);
  const goal = 100000000;

  const addToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(donationAmount);
    if (!val || val <= 0) return;
    setRaised((prev) => prev + val);
    setSupportersCount((prev) => prev + 1);
    addToast(`Cảm ơn bạn đã đóng góp ${val.toLocaleString()}đ ủng hộ dự án nhân ái!`, "success");
  };

  const percent = Math.round((raised / goal) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Title Block */}
      <div>
        <h1 className="font-display text-3xl font-black text-white tracking-tight uppercase leading-none">Quỹ Vương Miện</h1>
        <p className="text-xs text-slate-400 mt-2 font-medium">Gây quỹ cộng đồng cho các dự án nhân ái, truyền thông xã hội và hỗ trợ tài năng.</p>
      </div>

      {/* Hero Campaign Card - matching dashboard.htm banner styling */}
      <div className="group relative overflow-hidden rounded-3xl border border-white/7 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        
        {/* Cover Image container */}
        <div className="h-48 md:h-64 w-full rounded-2xl bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 relative overflow-hidden mb-6 border border-white/5">
          <img
            src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&h=400&q=80"
            alt="Tủ sách cho em"
            className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090f] via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4">
            <span className="inline-flex items-center rounded border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border-amber-400/25 bg-amber-400/10 text-amber-300">
              Nhân Ái
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">Dự án: Tủ sách cho trẻ em vùng cao</h3>
          
          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            <span className="text-slate-400 flex items-center gap-1">
              Người thực hiện: <strong className="text-amber-400">Nguyễn Mai Anh</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Verified Beauty Talent</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            Chiến dịch quyên góp xây dựng 5 tủ sách cộng đồng với hơn 2,000 đầu sách học tập, kỹ năng sống và truyện đọc dành tặng các học sinh nghèo hiếu học tại Trường Tiểu học Đồng Văn, tỉnh Hà Giang.
          </p>
        </div>

        {/* Progress details */}
        <div className="mt-8 border-t border-[#151b2d] pt-6 space-y-3">
          <div className="flex justify-between items-end text-xs">
            <div className="space-y-1">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tổng ngân sách nhận được</span>
              <span className="font-display font-black text-white text-xl">{raised.toLocaleString()}đ</span>
            </div>
            <div className="text-right space-y-1">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mục tiêu đề ra</span>
              <span className="text-slate-400 font-mono font-bold">{goal.toLocaleString()}đ</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 shadow-[0_0_8px_rgba(245,158,11,0.4)] transition-all duration-500"
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">
            <span>Tiến độ hiện tại: <b className="text-amber-400">{percent}%</b></span>
            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> <b>{supportersCount}</b> Nhà Ủng Hộ</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Donate Form Card */}
        <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#111421]/88 to-[#070913]/96 p-6 transition-all duration-300 border-amber-400/25 shadow-[0_0_22px_rgba(245,158,11,0.03)] flex flex-col justify-between">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-5 blur-2xl bg-gradient-to-br from-amber-200 to-yellow-600" />
          
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#151b2d] pb-3 mb-4">
            <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500/20 shrink-0" /> Đồng hành đóng góp dự án
          </h3>

          <form onSubmit={handleDonate} className="space-y-4">
            
            {/* Quick selectors */}
            <div className="flex gap-2">
              {["100000", "200000", "500000"].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setDonationAmount(amount)}
                  className={cn(
                    "flex-1 rounded-xl py-2.5 text-xs font-bold border transition-all duration-300 cursor-pointer",
                    donationAmount === amount
                      ? "border-amber-400 bg-amber-400/10 text-amber-300 font-extrabold"
                      : "border-[#151b2d] bg-slate-950/40 text-slate-400 hover:text-white"
                  )}
                >
                  {(Number(amount) / 1000).toFixed(0)}k đ
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="w-full rounded-xl border border-[#151b2d] bg-slate-950/40 px-4 py-3.5 text-sm text-white focus:border-amber-400 focus:outline-none transition-all"
                placeholder="Nhập số tiền ủng hộ khác"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-extrabold">VNĐ</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex h-12 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 font-display text-xs font-bold text-slate-950 shadow-md hover:shadow-lg hover:brightness-105 active:scale-98 transition-all cursor-pointer"
              >
                Gửi Tiền Ủng Hộ
              </button>
              <button
                type="button"
                onClick={() => addToast("Đã sao chép liên kết chia sẻ chiến dịch", "info")}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#151b2d] bg-slate-950/40 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
              >
                <Share2 className="h-4.5 w-4.5" />
              </button>
            </div>

          </form>
        </div>

        {/* Top Sponsors card */}
        <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 flex flex-col justify-between">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 mb-4 flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-slate-400" /> Bảng Vinh Danh Nhà Tài Trợ
          </h3>
          
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold">🥇</span>
                <div>
                  <span className="font-bold text-white block">Glow Beauty Cosmetics</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Brand Partner</span>
                </div>
              </div>
              <span className="font-mono font-extrabold text-amber-400 text-sm">10.000.000đ</span>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-[#151b2d] pt-4">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold">🥈</span>
                <div>
                  <span className="font-bold text-white block">CEO Minh Hằng</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Nhà Hảo Tâm</span>
                </div>
              </div>
              <span className="font-mono font-extrabold text-amber-400 text-sm">5.000.000đ</span>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-[#151b2d] pt-4">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold">🥉</span>
                <div>
                  <span className="font-bold text-white block">VNDress Fashion Group</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Brand Partner</span>
                </div>
              </div>
              <span className="font-mono font-extrabold text-amber-400 text-sm">2.000.000đ</span>
            </div>

          </div>
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
