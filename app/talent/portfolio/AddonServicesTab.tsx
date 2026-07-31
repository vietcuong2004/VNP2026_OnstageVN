"use client";

import React from "react";
import { Zap, Camera, Edit3, PhoneCall, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { persistTalentProfile } from "@/lib/talent-api";

interface AddonServicesTabProps {
  profile: any;
  setProfile: (profile: any) => void;
  addToast: (message: string, type?: "success" | "info") => void;
  rankingScore: number;
}

export default function AddonServicesTab({
  profile,
  setProfile,
  addToast,
  rankingScore
}: AddonServicesTabProps) {

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Placeholder Notice */}
      <div className="rounded-3xl border border-white/10 bg-[#090c1e]/90 p-10 md:p-16 text-center space-y-5 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center min-h-[360px]">
        <div className="h-16 w-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-[#F0C56B] shadow-lg animate-pulse">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="space-y-2.5 max-w-md">
          <h3 className="font-display font-black text-base md:text-lg text-white uppercase tracking-wider">
            Dịch Vụ Nâng Cao (Marketplace)
          </h3>
          <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
            Tính năng này sẽ được phát triển trong tương lai.
          </p>
        </div>
      </div>

      {/* 
      SECTION A & SECTION B (Commented out for future release)

      <div className="rounded-2xl border border-amber-400/20 bg-[#08090f] shadow-[0_0_20px_rgba(245,158,11,0.03)] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#151b2d] pb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400 animate-pulse" />
            <div>
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                Trung Tâm Đẩy Top Hồ Sơ (Profile Boosting Center)
              </h3>
            </div>
          </div>
        </div>
      </div>
      */}
    </div>
  );
}
