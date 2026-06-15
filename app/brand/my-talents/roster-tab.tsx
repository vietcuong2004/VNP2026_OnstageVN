"use client";

import React from "react";
import { Users2, Plus, Shield, MapPin, Eye, Briefcase, MessageSquare, Clock, X, Link2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createInitialAvatarDataUrl } from "@/lib/avatar";

export type RosterStatus = "accepted" | "pending" | "declined";

export interface RosterTalent {
  rosterId?: string;
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
  affiliateLink: string;
  copiedLink: boolean;
  handleCopyLink: () => void;
  handleRemove: (talentId: string) => void;
  setShowInviteModal: (show: boolean) => void;
}

export default function RosterTab({
  roster,
  extendedTalents,
  statusConfig,
  tierColor,
  formatVND,
  affiliateLink,
  copiedLink,
  handleCopyLink,
  handleRemove,
  setShowInviteModal,
}: RosterTabProps) {
  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-[#111018] to-[#08090f] p-3.5 shadow-[0_0_20px_rgba(245,158,11,0.06)] md:p-4">
        <div className="absolute right-[-70px] top-[-80px] h-40 w-40 rounded-full bg-amber-300/8 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
              <Link2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="inline-flex rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-300">
                Affiliate Link
              </span>
              <h2 className="mt-1.5 text-sm font-black uppercase tracking-tight text-white md:text-base">
                Link tuyển Talent vào mạng lưới Brand
              </h2>
              <p className="mt-1 max-w-2xl text-[10px] font-semibold leading-relaxed text-slate-400 md:text-[11px]">
                Chia sẻ link này cho Talent để họ tham gia roster của Brand và ghi nhận hoa hồng affiliate.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className={cn(
              "flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.98] lg:w-auto",
              copiedLink
                ? "border border-emerald-400/30 bg-emerald-400/15 text-emerald-300"
                : "bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 shadow-[0_0_18px_rgba(245,158,11,0.22)] hover:brightness-105"
            )}
          >
            {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedLink ? "Đã sao chép" : "Sao chép link"}
          </button>
        </div>

        <div className="relative mt-3 flex min-w-0 items-center gap-2 rounded-xl border border-amber-400/15 bg-[#050711]/80 p-2.5 md:p-3">
          <Link2 className="h-4 w-4 shrink-0 text-amber-300" />
          <span className="min-w-0 flex-1 truncate font-mono text-[10px] font-bold text-amber-100 md:text-xs">
            {affiliateLink}
          </span>
        </div>
      </section>

      {roster.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 md:py-20 px-4 text-center rounded-3xl border border-dashed border-white/5 bg-[#08090f]/40">
          <Users2 className="h-12 w-12 text-slate-700 mb-4 animate-pulse" />
          <p className="text-slate-400 font-black text-sm uppercase tracking-wider">Danh sách hợp tác trống</p>
          <p className="text-slate-500 text-xs mt-1 max-w-sm">
            Brand chưa mời Talent nào vào đội ngũ quản lý. Hãy bắt đầu xây dựng danh sách hợp tác ngay.
          </p>
          <button
            onClick={() => setShowInviteModal(true)}
            className="mt-6 flex w-full max-w-xs items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 cursor-pointer shadow-lg hover:brightness-105 active:scale-[0.98] transition-all md:w-auto"
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
                  "relative rounded-2xl bg-[#08090f] border p-4 md:p-6 transition-all duration-300 hover:scale-[1.01]",
                  isAccepted
                    ? "border-[#151b2d] hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.04)]"
                    : isPending
                    ? "border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.04)]"
                    : "border-red-500/20 opacity-60 hover:opacity-80"
                )}
              >
                {/* Status indicator */}
                <div className="mb-3 inline-flex items-center gap-1.5 bg-[#050711] border border-[#151b2d] px-2.5 py-1 rounded-full md:absolute md:top-4 md:right-5 md:mb-0 md:py-0.5">
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
                        onError={(event) => {
                          event.currentTarget.src = createInitialAvatarDataUrl(talent.name, talent.email);
                        }}
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
                  <div className="flex-1 min-w-0 md:pr-16">
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
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[10px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">👥 <strong className="text-white">{talent.followers}</strong> followers</span>
                      <span className="flex items-center gap-1">⭐ <strong className="text-white">{talent.rating}</strong>/5</span>
                    </div>
                  </div>
                </div>

                {isAccepted && (
                  <>
                    {/* Stats row */}
                    <div className="mt-5 pt-4 border-t border-[#151b2d] grid grid-cols-3 gap-2 md:gap-3 text-center">
                      <div className="bg-[#050711]/50 rounded-xl p-2 border border-[#151b2d]/40">
                        <p className="text-[11px] md:text-sm font-black text-emerald-400 font-mono break-words">{formatVND(entry.earnedCommission)}</p>
                        <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Hoa hồng</p>
                      </div>
                      <div className="bg-[#050711]/50 rounded-xl p-2 border border-[#151b2d]/40">
                        <p className="text-sm font-black text-cyan-400 font-mono">{entry.activeJobs}</p>
                        <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Đang làm</p>
                      </div>
                      <div className="bg-[#050711]/50 rounded-xl p-2 border border-[#151b2d]/40">
                        <p className="text-sm font-black text-white font-mono">{entry.completedJobs}</p>
                        <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Đã xong</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <button className="flex h-10 md:h-9 items-center justify-center gap-1 md:gap-1.5 rounded-xl bg-[#050711] border border-[#151b2d] text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:border-slate-700/50 cursor-pointer transition-all">
                        <Eye className="h-3.5 w-3.5 text-amber-400" /> Hồ sơ
                      </button>
                      <button className="flex h-10 md:h-9 items-center justify-center gap-1 md:gap-1.5 rounded-xl bg-[#050711] border border-[#151b2d] text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:border-slate-700/50 cursor-pointer transition-all">
                        <Briefcase className="h-3.5 w-3.5 text-cyan-400" /> Assign Job
                      </button>
                      <button className="flex h-10 md:h-9 items-center justify-center gap-1 md:gap-1.5 rounded-xl bg-[#050711] border border-[#151b2d] text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:border-slate-700/50 cursor-pointer transition-all">
                        <MessageSquare className="h-3.5 w-3.5 text-purple-400" /> Nhắn tin
                      </button>
                    </div>
                  </>
                )}

                {isPending && (
                  <div className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <p className="text-[10px] font-medium leading-relaxed text-amber-300/80">
                        Lời mời đã được gửi vào <span className="font-bold text-white">{entry.addedAt}</span>. Chờ Talent xác nhận.
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(entry.talentId)}
                      className="flex h-8 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 text-[9px] font-black uppercase tracking-wider text-red-300 transition-all hover:bg-red-500/20 hover:text-red-200 sm:w-auto"
                    >
                      <X className="h-3.5 w-3.5" />
                      Hủy lời mời
                    </button>
                  </div>
                )}

                {/* Remove button */}
                {!isAccepted && !isPending && (
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
