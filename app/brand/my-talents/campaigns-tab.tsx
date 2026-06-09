"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignsTabProps {
  extendedTalents: any[];
  tierColor: (tier: string) => string;
  formatVND: (n: number) => string;
}

const MOCK_CAMPAIGNS_SUMMARY = [
  { campaignId: "camp-1", title: "Beauty Mega Live 06/2026", talents: ["tal-1", "tal-2"], budget: "24.000.000đ", status: "Đang thực hiện" },
  { campaignId: "camp-2", title: "Summer Runway 2026", talents: ["tal-1", "tal-4"], budget: "40.000.000đ", status: "Hoàn thành" },
  { campaignId: "camp-3", title: "Organic Glow Launch", talents: ["tal-2"], budget: "12.000.000đ", status: "Đang tuyển" },
];

const COMMISSION_RATE = 0.10; // F1 = 10%

export default function CampaignsTab({
  extendedTalents,
  tierColor,
  formatVND,
}: CampaignsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="rounded-md border border-white/5 bg-[#08090f] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Tổng hợp Campaign tuyển Roster Talent
        </span>
      </div>
      {MOCK_CAMPAIGNS_SUMMARY.map((camp) => (
        <div key={camp.campaignId} className="rounded-2xl bg-[#08090f] border border-[#151b2d] p-5 hover:border-amber-500/25 hover:shadow-[0_0_20px_rgba(244,196,48,0.03)] transition-all duration-300">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white hover:text-amber-400 transition-colors cursor-pointer">{camp.title}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Ngân sách: <span className="text-amber-400 font-mono font-black text-xs">{camp.budget}</span></p>
            </div>
            <span className={cn(
              "rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider shrink-0",
              camp.status === "Đang thực hiện" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 animate-pulse" :
                camp.status === "Hoàn thành" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                  "bg-amber-500/10 border-amber-500/20 text-amber-400"
            )}>
              {camp.status}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-b border-[#151b2d]/50 py-3">
            {camp.talents.map(tid => {
              const t = extendedTalents.find(t => t.id === tid);
              if (!t) return null;
              return (
                <div key={tid} className="flex items-center gap-2 rounded-xl bg-[#050711] border border-[#151b2d] px-3 py-1.5 hover:border-slate-700/50 transition-colors">
                  <img src={t.avatar} alt={t.name} className="h-6 w-6 rounded-full object-cover border border-white/10" />
                  <span className="text-[10px] font-bold text-slate-300">{t.name}</span>
                  <span className={cn("text-[8px] font-black rounded px-1.5 py-0.5 border", tierColor(t.tier ?? ""))}>
                    Tier {t.tier}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Hoa hồng F1 dự kiến (10%):{" "}
              <span className="text-emerald-400 font-mono font-black text-sm ml-1">
                {formatVND(parseInt(camp.budget.replace(/[^0-9]/g, "")) / 1000 * COMMISSION_RATE)}
              </span>
            </p>
            <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:translate-x-0.5 transition-all cursor-pointer">
              Chi tiết <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
