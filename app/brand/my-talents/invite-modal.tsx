"use client";

import React from "react";
import { X, Search, Users2, MapPin, CheckCircle, Check, Send } from "lucide-react";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-[#151b2d]/60 bg-slate-950/45">
          <div>
            <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-300">
              RECRUITMENT
            </span>
            <h2 className="font-display font-black text-lg text-white uppercase tracking-tight mt-1">Mời Idol vào Brand</h2>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Chọn từ danh sách các Idol xuất sắc để gửi lời mời tham gia Brand</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#151b2d] bg-[#050711] text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        {/* <div className="p-5 border-b border-[#151b2d]/60 bg-[#050711]/30">
          <div className="flex items-center gap-2.5 rounded-xl bg-[#050711] border border-[#151b2d] px-3.5 py-3 focus-within:border-amber-500/40 transition-colors">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc danh mục của Idol..."
              value={inviteSearch}
              onChange={e => onSearchChange(e.target.value)}
              className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-600 outline-none font-medium"
            />
          </div>
        </div> */}

        {/* Talent list - Grid style */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {availableToInvite.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-center">
              <Users2 className="h-10 w-10 text-slate-700 mb-3" />
              <p className="text-xs font-bold">Không tìm thấy Idol phù hợp</p>
              <p className="text-[10px] text-slate-600 mt-1 leading-normal">Hãy thử từ khoá khác hoặc tất cả Idol đã được liên kết</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableToInvite.map((talent) => {
                const alreadyInvited = inviteSent.includes(talent.id);
                const status = getTalentStatus(talent.id);
                return (
                  <article key={talent.id} className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-3.5 shadow-lg hover:border-[#C9A86A]/30 transition-all duration-300 group flex flex-col justify-between min-w-0 text-left">
                    <div>
                      {/* Image Top Area */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border border-white/5 mb-3.5">
                        <img src={talent.avatar} alt={talent.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = createInitialAvatarDataUrl(talent.name, ""); }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                        {/* Overlay top badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                          <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[8.5px] font-black uppercase text-slate-950 shadow-md">
                            Hạng {talent.tier}
                          </span>
                        </div>

                        {/* Floating status badge */}
                        <div className="absolute bottom-2 left-2">
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded bg-[#0F1115]/80 border backdrop-blur-sm px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white",
                            status === "available" && "border-emerald-500/30 text-emerald-400",
                            status === "busy" && "border-red-500/30 text-red-400",
                            status === "maybe" && "border-yellow-500/30 text-yellow-400"
                          )}>
                            <span className={cn(
                              "h-1 w-1 rounded-full",
                              status === "available" && "bg-emerald-400",
                              status === "busy" && "bg-red-400",
                              status === "maybe" && "bg-yellow-400"
                            )} />
                            {status === "available" ? "Rảnh" : status === "busy" ? "Bận" : "Chưa có lịch"}
                          </span>
                        </div>
                      </div>

                      {/* Header details */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="text-xs font-black text-white truncate flex-1">{talent.name}</h3>
                          {talent.verified && <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                        </div>

                        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{talent.district || talent.city}, {talent.city}</span>
                        </div>
                      </div>

                      {/* Info badges row */}
                      <div className="my-2.5 flex flex-wrap gap-1">
                        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{talent.type}</span>
                        {talent.age && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{talent.age} tuổi</span>}
                        {talent.height && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{talent.height}cm</span>}
                        {talent.weight && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{talent.weight}kg</span>}
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
                              <span key={s.id} className="rounded border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 text-[8px] font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider" title={s.title}>
                                <span>{icon}</span>
                                <span className="max-w-[80px] truncate">{s.title.replace(/(Sport Companion |Business |VIP |Luxury |Launching Event |Daily Content )/g, "")}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Social stats row */}
                      <div className="grid grid-cols-2 gap-2 bg-[#0F1115]/50 border border-white/5 rounded-xl p-2 text-center text-[10px] my-3">
                        <div>
                          <span className="block text-[7px] font-bold uppercase text-slate-500 tracking-wider">Followers</span>
                          <span className="font-mono font-black text-amber-300 mt-0.5 block">{talent.followers || talent.followersCount}</span>
                        </div>
                        <div className="border-l border-white/5">
                          <span className="block text-[7px] font-bold uppercase text-slate-500 tracking-wider">Engagement</span>
                          <span className="font-mono font-black text-cyan-300 mt-0.5 block">{talent.engagementRate || 4.2}%</span>
                        </div>
                      </div>

                      {/* Bio brief */}
                      <p className="line-clamp-2 text-[10px] leading-relaxed text-slate-400 mt-2 min-h-7">{talent.experience}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3.5 border-t border-white/5 flex gap-2">
                      <button
                        type="button"
                        className="flex h-10 px-3 items-center justify-center gap-1 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white transition active:scale-90 cursor-pointer text-[10px] font-black uppercase tracking-wider"
                      >
                        Hồ sơ
                      </button>
                      <button
                        onClick={() => handleInvite(talent.id)}
                        disabled={alreadyInvited}
                        className={cn(
                          "flex-1 flex h-10 items-center justify-center gap-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition active:scale-95 cursor-pointer",
                          alreadyInvited
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 shadow-md hover:brightness-105 active:scale-95 transition-all"
                        )}
                      >
                        {alreadyInvited ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                        {alreadyInvited ? "Đã gửi" : "Mời vào Brand"}
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
