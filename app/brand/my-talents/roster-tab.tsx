"use client";

import React from "react";
import { Users2, Plus, Shield, MapPin, Eye, Briefcase, MessageSquare, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type RosterStatus = "accepted" | "pending" | "declined";

export interface RosterTalent {
  talentId: string;
  status: RosterStatus;
  addedAt: string;
  earnedCommission: number;
  activeJobs: number;
  completedJobs: number;
}

interface RosterTabProps {
  roster: RosterTalent[];
  extendedTalents: any[];
  statusConfig: Record<RosterStatus, { label: string; dot: string; text: string }>;
  tierColor: (tier: string) => string;
  formatVND: (n: number) => string;
  handleRemove: (talentId: string) => void;
  setShowInviteModal: (show: boolean) => void;
}

export default function RosterTab({
  roster,
  extendedTalents,
  statusConfig,
  tierColor,
  formatVND,
  handleRemove,
  setShowInviteModal,
}: RosterTabProps) {
  return (
    <div className="space-y-4">
      {roster.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-white/5 bg-[#08090f]/40">
          <Users2 className="h-12 w-12 text-slate-700 mb-4 animate-pulse" />
          <p className="text-slate-400 font-black text-sm uppercase tracking-wider">Roster trống</p>
          <p className="text-slate-500 text-xs mt-1 max-w-sm">
            Bạn chưa mời Talent nào vào đội ngũ quản lý. Hãy bắt đầu xây dựng roster của mình ngay.
          </p>
          <button
            onClick={() => setShowInviteModal(true)}
            className="mt-6 flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 cursor-pointer shadow-lg hover:brightness-105 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" /> Mời Talent ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roster.map((entry) => {
            const talent = extendedTalents.find((t) => t.id === entry.talentId);
            if (!talent) return null;
            const sc = statusConfig[entry.status];
            const isAccepted = entry.status === "accepted";
            const isPending = entry.status === "pending";
            return (
              <div
                key={entry.talentId}
                className={cn(
                  "relative rounded-2xl bg-[#08090f] border p-6 transition-all duration-300 hover:scale-[1.01]",
                  isAccepted
                    ? "border-[#151b2d] hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.04)]"
                    : isPending
                    ? "border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.04)]"
                    : "border-red-500/20 opacity-60 hover:opacity-80"
                )}
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-5 flex items-center gap-1.5 bg-[#050711] border border-[#151b2d] px-2.5 py-0.5 rounded-full">
                  <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
                  <span className={cn("text-[9px] font-black uppercase tracking-wider", sc.text)}>{sc.label}</span>
                </div>

                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={cn(
                      "h-16 w-16 rounded-2xl overflow-hidden border p-[2px] transition-colors duration-300",
                      isAccepted ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"
                    )}>
                      <img
                        src={talent.avatar}
                        alt={talent.name}
                        className="h-full w-full rounded-[14px] object-cover"
                      />
                    </div>
                    {talent.verified && (
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#08090f] border border-[#151b2d] flex items-center justify-center shadow-md">
                        <Shield className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-16">
                    <h3 className="text-base font-black text-white truncate hover:text-amber-400 transition-colors cursor-pointer">{talent.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider", tierColor(talent.tier ?? ""))}>
                        Tier {talent.tier}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{talent.type}</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                        <MapPin className="h-3 w-3 text-slate-500" />{talent.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2.5 text-[10px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">👥 <strong className="text-white">{talent.followers}</strong> followers</span>
                      <span className="flex items-center gap-1">⭐ <strong className="text-white">{talent.rating}</strong>/5</span>
                    </div>
                  </div>
                </div>

                {isAccepted && (
                  <>
                    {/* Stats row */}
                    <div className="mt-5 pt-4 border-t border-[#151b2d] grid grid-cols-3 gap-3 text-center">
                      <div className="bg-[#050711]/50 rounded-xl p-2 border border-[#151b2d]/40">
                        <p className="text-sm font-black text-emerald-400 font-mono">{formatVND(entry.earnedCommission)}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Hoa hồng F1</p>
                      </div>
                      <div className="bg-[#050711]/50 rounded-xl p-2 border border-[#151b2d]/40">
                        <p className="text-sm font-black text-cyan-400 font-mono">{entry.activeJobs}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Đang làm</p>
                      </div>
                      <div className="bg-[#050711]/50 rounded-xl p-2 border border-[#151b2d]/40">
                        <p className="text-sm font-black text-white font-mono">{entry.completedJobs}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Đã xong</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#050711] border border-[#151b2d] text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:border-slate-700/50 cursor-pointer transition-all">
                        <Eye className="h-3.5 w-3.5 text-amber-400" /> Hồ sơ
                      </button>
                      <button className="flex-1 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#050711] border border-[#151b2d] text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:border-slate-700/50 cursor-pointer transition-all">
                        <Briefcase className="h-3.5 w-3.5 text-cyan-400" /> Assign Job
                      </button>
                      <button className="flex-1 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#050711] border border-[#151b2d] text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:border-slate-700/50 cursor-pointer transition-all">
                        <MessageSquare className="h-3.5 w-3.5 text-purple-400" /> Nhắn tin
                      </button>
                    </div>
                  </>
                )}

                {isPending && (
                  <div className="mt-5 rounded-xl bg-amber-500/5 border border-amber-500/15 p-3 flex items-center gap-3">
                    <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                    <p className="text-[10px] text-amber-300/80 font-medium leading-relaxed">
                      Lời mời đã được gửi vào <span className="text-white font-bold">{entry.addedAt}</span>. Chờ Talent xác nhận.
                    </p>
                  </div>
                )}

                {/* Remove button */}
                {!isAccepted && (
                  <button
                    onClick={() => handleRemove(entry.talentId)}
                    className="absolute bottom-5 right-5 h-7 w-7 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer transition-all"
                    title="Hủy lời mời"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
