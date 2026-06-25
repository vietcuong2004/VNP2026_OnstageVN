"use client";

import React from "react";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Supporter } from "@/app/talent/crownfunding/types";

interface DonationHistoryProps {
  supporters: Supporter[];
}

export function DonationHistory({ supporters }: DonationHistoryProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/7 bg-gradient-to-b from-[#0d101b]/80 to-[#050712]/92 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-in fade-in duration-300">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent"></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-3">
        <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="h-4.5 w-4.5 text-amber-400" /> Lịch sử quyên góp từ nhà hảo tâm
        </h3>
        <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-amber-400/30 bg-amber-400/10 text-amber-300 w-fit">
          Nhà hảo tâm
        </span>
      </div>

      <div className="space-y-4 mt-4">
        {supporters.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Chưa có lượt quyên góp nào.</p>
        ) : (
          supporters.map((sup, idx) => (
            <div
              key={idx}
              className="flex justify-between items-start gap-4 border-b border-white/5 last:border-transparent pb-4 last:pb-0 text-xs font-semibold animate-in fade-in duration-300"
            >
              <div className="flex gap-3">
                {/* Avatar placeholder */}
                <div className="h-10 w-10 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center shrink-0 text-[10px] text-[#F0C56B] font-black shadow-inner">
                  {sup.isAnonymous ? "ẨN" : sup.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <span
                    className={cn(
                      "block font-extrabold text-white text-xs break-words",
                      sup.isAnonymous && "text-slate-500 font-normal italic"
                    )}
                  >
                    {sup.isAnonymous ? "Nhà hảo tâm ẩn danh" : sup.name}
                    {sup.isBrand && (
                      <span className="ml-2 inline-flex items-center rounded bg-amber-400/15 border border-amber-400/35 px-1.5 py-0.5 text-[7px] font-black uppercase text-[#F0C56B] tracking-widest shrink-0">
                        BRAND
                      </span>
                    )}
                  </span>
                  {sup.message && <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">"{sup.message}"</p>}
                  <span className="block text-[8px] text-slate-500 font-mono uppercase font-bold tracking-wider">
                    {sup.date}
                  </span>
                </div>
              </div>

              <span className="font-mono font-extrabold text-amber-400 shrink-0 text-right text-sm">
                +{sup.amount.toLocaleString()}đ
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
