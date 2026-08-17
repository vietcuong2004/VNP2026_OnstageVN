"use client";

import React from "react";
import { X, Search, Users2, MapPin, CheckCircle, Check, Send } from "lucide-react";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import BadgeTier, { getPrimaryAchievementBadge } from "@/components/ui/BadgeTier";
import { cn } from "@/lib/utils";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteSearch: string;
  onSearchChange: (val: string) => void;
  availableToInvite: any[];
  inviteSent: string[];
  handleInvite: (talentId: string) => void;
  getTalentStatus: (talentId: string) => string;
  tierColor: (tier: string) => string;
}

export default function InviteModal({
  isOpen,
  onClose,
  inviteSearch,
  onSearchChange,
  availableToInvite,
  inviteSent,
  handleInvite,
  getTalentStatus,
  tierColor,
}: InviteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#191116]/60 backdrop-blur-md animate-in fade-in duration-300 dark:bg-[#020408]/85">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-white border border-[#F0D7D3] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 dark:bg-[#08090f] dark:border-[#151b2d]">
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-[#F0D7D3] bg-[#FAF7F6] dark:border-[#151b2d]/60 dark:bg-slate-950/45">
          <div>
            <span className="rounded-md border border-[#F0D7D3] bg-[#FFF0EE] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#8F0709] shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              RECRUITMENT
            </span>
            <h2 className="font-display font-black text-lg text-[#191116] uppercase tracking-tight mt-1 dark:text-white">Mời Idol vào Brand</h2>
            <p className="text-[10px] text-[#574D54] mt-1 font-semibold dark:text-slate-500">Chọn từ danh sách các Idol xuất sắc để gửi lời mời tham gia Brand</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#F0D7D3] bg-[#FFF0EE] text-[#574D54] hover:text-[#8F0709] cursor-pointer transition-all dark:border-[#151b2d] dark:bg-[#050711] dark:text-slate-400 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Talent list - Grid style */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {availableToInvite.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#574D54] text-center dark:text-slate-500">
              <Users2 className="h-10 w-10 text-[#8F0709] mb-3 dark:text-slate-700" />
              <p className="text-xs font-bold text-[#191116] dark:text-white">Không tìm thấy Idol phù hợp</p>
              <p className="text-[10px] text-[#574D54] mt-1 leading-normal dark:text-slate-600">Hãy thử từ khoá khác hoặc tất cả Idol đã được liên kết</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableToInvite.map((talent) => {
                const alreadyInvited = inviteSent.includes(talent.id);
                const status = getTalentStatus(talent.id);
                const primaryBadge = getPrimaryAchievementBadge(talent);
                return (
                  <article key={talent.id} className="rounded-2xl border border-[#F0D7D3] bg-white p-3.5 shadow-sm hover:border-[#8F0709] transition-all duration-300 group flex flex-col justify-between min-w-0 text-left dark:border-[#2B313D] dark:bg-[#171A21] dark:hover:border-[#C9A86A]/30">
                    <div>
                      {/* Image Top Area */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-[#F0D7D3] mb-3.5 dark:bg-slate-900 dark:border-white/5">
                        <img src={talent.avatar} alt={talent.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = createInitialAvatarDataUrl(talent.name, ""); }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                        {/* Overlay top badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                          <BadgeTier badge={primaryBadge} tier={talent.tier} seed={talent.id || talent.email || talent.name} variant="gradient" size="xs" />
                        </div>

                        {/* Floating status badge */}
                        <div className="absolute bottom-2 left-2">
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded bg-white/90 border border-[#F0D7D3] backdrop-blur-sm px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#191116] dark:bg-[#0F1115]/80 dark:text-white",
                            status === "available" && "border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
                            status === "busy" && "border-red-500/30 text-red-700 dark:text-red-400",
                            status === "maybe" && "border-yellow-500/30 text-yellow-700 dark:text-yellow-400"
                          )}>
                            <span className={cn(
                              "h-1 w-1 rounded-full",
                              status === "available" && "bg-emerald-500",
                              status === "busy" && "bg-red-500",
                              status === "maybe" && "bg-yellow-500"
                            )} />
                            {status === "available" ? "Rảnh" : status === "busy" ? "Bận" : "Chưa có lịch"}
                          </span>
                        </div>
                      </div>

                      {/* Header details */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="text-xs font-black text-[#191116] truncate flex-1 group-hover:text-[#8F0709] transition-colors dark:text-white dark:group-hover:text-amber-300">{talent.name}</h3>
                          {talent.verified && <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0 dark:text-emerald-400" />}
                        </div>

                        <div className="flex items-center gap-1 text-[9px] text-[#574D54] font-bold uppercase tracking-wider dark:text-slate-500">
                          <MapPin className="h-3 w-3 text-[#8F0709] shrink-0 dark:text-slate-500" />
                          <span className="truncate">{talent.district || talent.city}, {talent.city}</span>
                        </div>
                      </div>

                      {/* Info badges row */}
                      <div className="my-2.5 flex flex-wrap gap-1">
                        <span className="rounded border border-[#F0D7D3] bg-[#FFF0EE] px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#8F0709] dark:border-transparent dark:bg-white/5 dark:text-slate-400">{talent.type}</span>
                        {talent.age && <span className="rounded border border-[#F0D7D3] bg-[#FAF7F6] px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#574D54] dark:border-transparent dark:bg-white/5 dark:text-slate-400">{talent.age} tuổi</span>}
                        {talent.height && <span className="rounded border border-[#F0D7D3] bg-[#FAF7F6] px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#574D54] dark:border-transparent dark:bg-white/5 dark:text-slate-400">{talent.height}cm</span>}
                        {talent.weight && <span className="rounded border border-[#F0D7D3] bg-[#FAF7F6] px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#574D54] dark:border-transparent dark:bg-white/5 dark:text-slate-400">{talent.weight}kg</span>}
                      </div>

                      {/* Lifestyle services badges */}
                      {talent.lifestyleServices && talent.lifestyleServices.some((s: any) => s.enabled) && (
                        <div className="mb-2.5 flex flex-wrap gap-1">
                          {talent.lifestyleServices.filter((s: any) => s.enabled).map((s: any) => {
                            let icon = "💼";
                            if (s.id === "golf") icon = "⛳";
                            else if (s.id === "pickleball") icon = "🎾";
                            else if (s.id === "dining") icon = "🍷";
                            else if (s.id === "cafe") icon = "☕";
                            else if (s.id === "redcarpet") icon = "✨";
                            else if (s.id === "shopping") icon = "🛍️";
                            else if (s.id === "art") icon = "🎨";
                            else if (s.id === "escort") icon = "🛥️";
                            else if (s.id === "content") icon = "📱";
                            return (
                              <span key={s.id} className="rounded border border-[#F0D7D3] bg-[#FFF0EE] px-1.5 py-0.5 text-[8px] font-bold text-[#8F0709] flex items-center gap-1 uppercase tracking-wider dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400" title={s.title}>
                                <span>{icon}</span>
                                <span className="max-w-[80px] truncate">{s.title.replace(/(Sport Companion |Business |VIP |Luxury |Launching Event |Daily Content )/g, "")}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Social stats row */}
                      <div className="grid grid-cols-2 gap-2 bg-[#FAF7F6] border border-[#F0D7D3] rounded-xl p-2 text-center text-[10px] my-3 dark:bg-[#0F1115]/50 dark:border-white/5">
                        <div>
                          <span className="block text-[7px] font-bold uppercase text-[#574D54] tracking-wider dark:text-slate-500">Followers</span>
                          <span className="font-mono font-black text-[#8F0709] mt-0.5 block dark:text-amber-300">{talent.followers || talent.followersCount}</span>
                        </div>
                        <div className="border-l border-[#F0D7D3] dark:border-white/5">
                          <span className="block text-[7px] font-bold uppercase text-[#574D54] tracking-wider dark:text-slate-500">Engagement</span>
                          <span className="font-mono font-black text-rose-700 mt-0.5 block dark:text-cyan-300">{talent.engagementRate || 4.2}%</span>
                        </div>
                      </div>

                      {/* Bio brief */}
                      <p className="line-clamp-2 text-[10px] leading-relaxed text-[#574D54] font-semibold mt-2 min-h-7 dark:text-slate-400">{talent.experience}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3.5 border-t border-[#F0D7D3] flex gap-2 dark:border-white/5">
                      <button
                        type="button"
                        className="flex h-10 px-3 items-center justify-center gap-1 rounded-xl bg-white border border-[#F0D7D3] text-[#574D54] hover:border-[#8F0709] hover:text-[#8F0709] transition active:scale-90 cursor-pointer text-[10px] font-black uppercase tracking-wider shadow-sm dark:bg-white/5 dark:border-white/10 dark:text-white"
                      >
                        Hồ sơ
                      </button>
                      <button
                        type="button"
                        style={{ color: "#ffffff" }}
                        onClick={() => handleInvite(talent.id)}
                        disabled={alreadyInvited}
                        className={cn(
                          "flex-1 flex h-10 items-center justify-center gap-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-md",
                          alreadyInvited
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800 cursor-not-allowed dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                            : "light-force-white bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white hover:brightness-105"
                        )}
                      >
                        {alreadyInvited ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5 stroke-[3] !text-white text-white" />}
                        <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">{alreadyInvited ? "Đã gửi" : "Mời vào Brand"}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
