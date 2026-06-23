"use client";

import React from "react";
import { Coins, Crown, Users, CheckCircle, Award } from "lucide-react";
import { cn } from "@/lib/utils";

// ==========================================
// Sub-component: CampaignStatsGrid
// ==========================================
interface CampaignStatsGridProps {
  raised: number;
  goal: number;
  supportersCount: number;
  disbursed: number;
}

export function CampaignStatsGrid({ raised, goal, supportersCount, disbursed }: CampaignStatsGridProps) {
  const stats = [
    {
      label: "Tổng Đã Nhận",
      val: raised.toLocaleString() + "đ",
      desc: "Nạp qua ví Bảo Kim",
      color: "text-amber-400",
      border: "border-amber-400/35 shadow-[0_0_22px_rgba(245,158,11,0.18)]",
      bg: "from-[#1a1305]/88 to-[#070913]/96",
      icon: <Coins className="h-4.5 w-4.5" />
    },
    {
      label: "Mục Tiêu Quỹ",
      val: goal.toLocaleString() + "đ",
      desc: "Kế hoạch định mức",
      color: "text-white",
      border: "border-white/10 shadow-md",
      bg: "from-[#111421]/88 to-[#070913]/96",
      icon: <Crown className="h-4.5 w-4.5" />
    },
    {
      label: "Lượt Ủng Hộ",
      val: supportersCount.toString(),
      desc: "Người ủng hộ",
      color: "text-cyan-400",
      border: "border-cyan-500/30 shadow-[0_0_22px_rgba(34,211,238,0.1)]",
      bg: "from-[#0d1628]/88 to-[#070913]/96",
      icon: <Users className="h-4.5 w-4.5" />
    },
    {
      label: "Đã Giải Ngân",
      val: disbursed.toLocaleString() + "đ",
      desc: "Nghiệm thu thực tế",
      color: "text-emerald-400",
      border: "border-emerald-500/30 shadow-[0_0_22px_rgba(16,185,129,0.1)]",
      bg: "from-[#0a1c17]/88 to-[#070913]/96",
      icon: <CheckCircle className="h-4.5 w-4.5" />
    },
    {
      label: "Còn Khả Dụng",
      val: (raised - disbursed).toLocaleString() + "đ",
      desc: "Số dư khả dụng rút",
      color: "text-[#F0C56B] font-extrabold animate-pulse",
      border: "border-amber-300/40 shadow-[0_0_22px_rgba(245,158,11,0.22)]",
      bg: "from-[#1c180a]/90 to-[#070913]/96",
      icon: <Award className="h-4.5 w-4.5" />
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={cn(
            "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-305 hover:-translate-y-0.5 bg-gradient-to-b hover:scale-[1.02]",
            stat.border,
            stat.bg
          )}
        >
          {/* Glows */}
          <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-10 blur-xl bg-gradient-to-br from-amber-200 to-yellow-600"></div>

          <div className="flex items-start justify-between gap-4">
            <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">
              {stat.label}
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 group-hover:border-amber-400/30 group-hover:bg-amber-400/10 group-hover:text-amber-300 transition-colors">
              {stat.icon}
            </div>
          </div>
          <span className={cn("block font-display font-black text-sm mt-3", stat.color)}>{stat.val}</span>
          <span className="block text-[8px] text-slate-500 mt-0.5 leading-snug font-bold uppercase">{stat.desc}</span>
        </div>
      ))}
    </div>
  );
}
