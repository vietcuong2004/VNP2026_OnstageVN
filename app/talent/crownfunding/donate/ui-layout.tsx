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
  const progressPct = Math.min(100, Math.round((raised / (goal || 1)) * 100));
  const availableToRequest = Math.max(raised - disbursed, 0);

  return (
    <div className="bg-[#050711]/60 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header: Raised & Percentage */}
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-end gap-3 xs:gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Tổng số tiền quyên góp</span>
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-400 font-display">{raised.toLocaleString()}đ</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold">/ {goal.toLocaleString()}đ mục tiêu</span>
          </div>
        </div>
        <div className="text-left xs:text-right shrink-0">
          <span className="text-2xl font-display font-black text-gradient-gold block leading-none">{progressPct}%</span>
          <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block mt-1">Tiến độ chiến dịch</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2.5 w-full rounded-full bg-slate-950 border border-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-gold shadow-[0_0_15px_rgba(240,197,107,0.4)] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Row of supporting stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-white/5 text-xs font-semibold text-slate-400">
        <div className="space-y-1">
          <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-cyan-400 shrink-0" /> Lượt ủng hộ
          </span>
          <span className="text-white font-mono font-extrabold text-xs xs:text-sm sm:text-base">{supportersCount}</span>
        </div>
        <div className="space-y-1 border-l border-white/5 pl-2.5 sm:pl-4">
          <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Đã giải ngân
          </span>
          <span className="text-emerald-400 font-mono font-extrabold text-xs xs:text-sm sm:text-base">{disbursed.toLocaleString()}đ</span>
        </div>
        <div className="space-y-1 border-l border-white/5 pl-2.5 sm:pl-4">
          <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-[#F0C56B] shrink-0" /> Còn khả dụng
          </span>
          <span className="text-amber-300 font-mono font-extrabold text-xs xs:text-sm sm:text-base">{availableToRequest.toLocaleString()}đ</span>
        </div>
      </div>
    </div>
  );
}
