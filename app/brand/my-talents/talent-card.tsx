"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, Edit, MessageSquare, Trash2, MapPin, Clock, MoreVertical,
  Briefcase, FileText, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import BadgeTier, { getPrimaryAchievementBadge } from "@/components/ui/BadgeTier";
import type { BrandTalentCard, RosterTalent } from "./page";

interface TalentCardProps {
  entry: RosterTalent;
  talent: BrandTalentCard;
  onDeleteClick: (talentId: string, name: string) => void;
  onActivateClick: (talent: BrandTalentCard) => void;
  onEditClick: (talent: BrandTalentCard, entry: RosterTalent) => void;
  onAssignJobClick: (talent: BrandTalentCard) => void;
}

const statusConfig = {
  accepted: { label: "Đang hoạt động", dot: "bg-emerald-400", text: "text-emerald-400", badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  pending: { label: "Đang chờ", dot: "bg-amber-400 animate-pulse", text: "text-amber-400", badge: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
  declined: { label: "Đã từ chối", dot: "bg-red-400", text: "text-red-400", badge: "bg-red-500/10 border-red-500/30 text-red-400" },
};

function getTalentTypes(talent: any): string[] {
  const normalizeType = (type: unknown) => {
    const value = String(type).trim();
    return ["pg", "pb", "pg/pb"].includes(value.toLowerCase()) ? "PG/PB" : value;
  };

  if (Array.isArray(talent?.talentTypes) && talent.talentTypes.length) {
    return Array.from(new Set(talent.talentTypes.map(normalizeType).filter(Boolean)));
  }
  if (Array.isArray(talent?.talent_types) && talent.talent_types.length) {
    return Array.from(new Set(talent.talent_types.map(normalizeType).filter(Boolean)));
  }
  return talent?.type ? [normalizeType(talent.type)] : [];
}

export default function TalentCard({ entry, talent, onDeleteClick, onActivateClick, onEditClick, onAssignJobClick }: TalentCardProps) {
  const router = useRouter();
  const sc = statusConfig[entry.status] ?? statusConfig.declined;
  const isAccepted = entry.status === "accepted";
  const isPending = entry.status === "pending";
  const isManaged = talent.userStatus === "managed";

  const [menuOpen, setMenuOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [menuOpen]);

  const talentAvatar = talent.avatar || createInitialAvatarDataUrl(talent.name, talent.email);
  const locationText = [talent.district, talent.city].filter(Boolean).join(", ") || talent.city;
  const experienceYears = Number(talent.yearsOfExperience ?? talent.experience_years ?? 0);
  const talentTypes = getTalentTypes(talent);
  const primaryBadge = getPrimaryAchievementBadge(talent);

  return (
    <article
      onClick={() => router.push(`/brand/talents/${talent.id}?from=/brand/my-talents`)}
      className={cn(
        "group flex min-w-0 flex-col justify-between rounded-2xl border border-[#2B313D] bg-[#171A21] p-3.5 shadow-lg transition-all duration-300 hover:border-[#C9A86A]/30 cursor-pointer active:scale-[0.99]"
      )}
    >
      <div>
        <div className="relative mb-3.5 aspect-square w-full overflow-hidden rounded-xl border border-white/5 bg-slate-950">
          <img
            src={talentAvatar}
            alt={talent.name}
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = createInitialAvatarDataUrl(talent.name, talent.email);
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute left-2 top-2 flex flex-col gap-1.5">
            <BadgeTier badge={primaryBadge} tier={talent.tier} seed={talent.id || talent.email || talent.name} variant="gradient" size="xs" />
          </div>

          {/* 3-dot menu */}
          <div className="absolute right-2 top-2 z-25" ref={menuRef}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen(v => !v);
              }}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#0F1115]/60 text-slate-350 hover:text-white hover:bg-[#0F1115]/80 transition active:scale-90 shadow-lg backdrop-blur-sm"
              title="Thao tác"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-9 z-50 w-44 rounded-xl border border-white/10 bg-[#0d1020] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              >
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onEditClick(talent, entry); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5 text-yellow-400" /> Chỉnh sửa hồ sơ
                </button>
                <div className="mx-3 h-px bg-white/5" />
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDeleteClick(entry.talentId, talent.name); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[11px] font-black uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  {isPending ? "Hủy lời mời" : "Xóa"}
                </button>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute bottom-2 left-2">
            <span className={cn(
              "inline-flex items-center gap-1 rounded border bg-[#0F1115]/85 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur-sm",
              isManaged 
                ? "border-amber-500/30 text-amber-400"
                : sc.badge.replace(/bg-\S+/, "")
            )}>
              <span className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0", 
                isManaged ? "bg-amber-400" : sc.dot.replace(/animate-pulse/, "")
              )} />
              {isManaged ? "Managed" : sc.label}
            </span>
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="flex-1 truncate text-base font-black leading-tight tracking-wide text-white drop-shadow-[0_1px_8px_rgba(255,255,255,0.12)]">
              {talent.name}
            </h3>
            {talent.verified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C9A86A]" />
            <span className="truncate">{locationText || "Chưa cập nhật"}</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {talentTypes.length ? (
              talentTypes.map((type) => (
                <span key={type} className="inline-flex w-fit rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#C9A86A]">
                  {type}
                </span>
              ))
            ) : (
              <span className="inline-flex w-fit rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#C9A86A]">
                Chưa cập nhật
              </span>
            )}
          </div>
        </div>

        <div className="my-3 flex flex-nowrap gap-1 overflow-hidden">
          <span className="min-w-0 shrink rounded-md border border-white/10 bg-slate-800/90 px-1.5 py-1 text-[8px] font-black uppercase text-slate-100 shadow-sm whitespace-nowrap">{talent.age || "-"} tuổi</span>
          <span className="min-w-0 shrink rounded-md border border-white/10 bg-slate-800/90 px-1.5 py-1 text-[8px] font-black uppercase text-slate-100 shadow-sm whitespace-nowrap">
            {experienceYears} năm kinh nghiệm
          </span>
          <span className="min-w-0 shrink rounded-md border border-white/10 bg-slate-800/90 px-1.5 py-1 text-[8px] font-black uppercase text-slate-100 shadow-sm whitespace-nowrap">{talent.height || "-"}cm</span>
          <span className="min-w-0 shrink rounded-md border border-white/10 bg-slate-800/90 px-1.5 py-1 text-[8px] font-black uppercase text-slate-100 shadow-sm whitespace-nowrap">{talent.weight || "-"}kg</span>
        </div>

        {/* Notes */}
        <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-white/5 bg-[#0F1115]/30 p-2.5 text-[10px]">
          <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className={cn("leading-relaxed font-semibold", entry.notes ? "text-slate-300" : "text-slate-500 italic")}>
            {(() => {
              if (!entry.notes) return "Idol được tạo bởi Brand.";
              const notes = entry.notes.trim();
              if (
                notes.startsWith("Thêm từ") ||
                notes.includes("Thêm từ danh sách") ||
                notes.includes("Thêm từ trang tìm kiếm") ||
                notes.includes("Thêm từ hồ sơ")
              ) {
                return "Idol được thêm từ danh sách idol của hệ thống Onstage VN";
              }
              return entry.notes;
            })()}
          </p>
        </div>

        {/* Invite CTA — Managed */}
        {isAccepted && isManaged && (
          <div className="mt-2.5 flex flex-col gap-2 rounded-xl border border-dashed border-amber-400/30 bg-amber-400/[0.03] p-2.5">
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-wider">Mời Idol tham gia OnstageVN</p>
              <p
                onClick={(e) => {
                  e.stopPropagation();
                  setDescExpanded(v => !v);
                }}
                className={cn(
                  "text-[9px] text-slate-400 mt-1 leading-relaxed cursor-pointer select-none",
                  !descExpanded && "line-clamp-2"
                )}
                title="Click để xem chi tiết mô tả"
              >
                Hiện tại chỉ Brand có thể quản lý hồ sơ này. Gửi lời mời để Idol tự đăng nhập và cập nhật thông tin của mình.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onActivateClick(talent);
              }}
              className="w-full h-8 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-[9px] uppercase tracking-wider cursor-pointer hover:brightness-105 active:scale-[0.97] transition-all whitespace-nowrap mt-0.5"
            >
              Gửi lời mời kích hoạt
            </button>
          </div>
        )}

        {/* Pending notice */}
        {isPending && (
          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-2.5">
            <Clock className="h-3 w-3 shrink-0 text-amber-400" />
            <p className="text-[9px] text-amber-300/80 font-bold uppercase tracking-wider leading-snug">
              Mời lúc <span className="text-white">{entry.addedAt}</span> · Chờ xác nhận
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2 border-t border-white/5 pt-3.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/brand/talents/${talent.id}?from=/brand/my-talents`);
          }}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-white/10 active:scale-95 cursor-pointer"
          title="Xem hồ sơ chi tiết"
        >
          <Eye className="h-4 w-4 shrink-0" />
          <span>Xem</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAssignJobClick(talent);
          }}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 text-[10px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer hover:brightness-110"
          title="Giao việc cho idol"
        >
          <Briefcase className="h-4 w-4 shrink-0" />
          <span>Assign Job</span>
        </button>
      </div>
    </article>
  );
}
