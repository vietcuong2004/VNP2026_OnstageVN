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
        "group flex min-w-0 flex-col justify-between rounded-2xl border border-[#F0D7D3] bg-white p-3.5 shadow-sm transition-all duration-300 hover:border-[#8F0709] cursor-pointer active:scale-[0.99] dark:border-[#2B313D] dark:bg-[#171A21] dark:hover:border-[#C9A86A]/30"
      )}
    >
      <div>
        <div className="relative mb-3.5 aspect-square w-full overflow-hidden rounded-xl border border-[#F0D7D3] bg-slate-100 dark:border-white/5 dark:bg-slate-950">
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
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#F0D7D3] bg-white/90 text-[#574D54] hover:text-[#8F0709] hover:bg-white transition active:scale-90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#0F1115]/60 dark:text-slate-350 dark:hover:text-white"
              title="Thao tác"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-9 z-50 w-44 rounded-xl border border-[#F0D7D3] bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 dark:border-white/10 dark:bg-[#0d1020]"
              >
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onEditClick(talent, entry); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[11px] font-black uppercase tracking-wider text-[#191116] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition-colors cursor-pointer dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <Edit className="h-3.5 w-3.5 text-[#8F0709] dark:text-yellow-400" /> Chỉnh sửa hồ sơ
                </button>
                <div className="mx-3 h-px bg-[#F0D7D3] dark:bg-white/5" />
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDeleteClick(entry.talentId, talent.name); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[11px] font-black uppercase tracking-wider text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
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
              "inline-flex items-center gap-1 rounded border bg-white/90 border-[#F0D7D3] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#191116] backdrop-blur-sm dark:bg-[#0F1115]/85 dark:text-white",
              isManaged 
                ? "border-amber-500/30 text-amber-700 dark:text-amber-400"
                : sc.badge.replace(/bg-\S+/, "")
            )}>
              <span className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0", 
                isManaged ? "bg-amber-500" : sc.dot.replace(/animate-pulse/, "")
              )} />
              {isManaged ? "Managed" : sc.label}
            </span>
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="flex-1 truncate text-base font-black leading-tight tracking-wide text-[#191116] group-hover:text-[#8F0709] transition-colors dark:text-white dark:group-hover:text-amber-300">
              {talent.name}
            </h3>
            {talent.verified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />}
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#574D54] dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#8F0709] dark:text-[#C9A86A]" />
            <span className="truncate">{locationText || "Chưa cập nhật"}</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {talentTypes.length ? (
              talentTypes.map((type) => (
                <span key={type} className="inline-flex w-fit rounded-md border border-[#F0D7D3] bg-[#FFF0EE] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#8F0709] dark:border-[#C9A86A]/25 dark:bg-[#C9A86A]/10 dark:text-[#C9A86A]">
                  {type}
                </span>
              ))
            ) : (
              <span className="inline-flex w-fit rounded-md border border-[#F0D7D3] bg-[#FFF0EE] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#8F0709] dark:border-[#C9A86A]/25 dark:bg-[#C9A86A]/10 dark:text-[#C9A86A]">
                Chưa cập nhật
              </span>
            )}
          </div>
        </div>

        <div className="my-3 flex flex-nowrap gap-1 overflow-hidden">
          <span className="min-w-0 shrink rounded-md border border-[#F0D7D3] bg-[#FAF7F6] px-1.5 py-1 text-[8px] font-black uppercase text-[#574D54] shadow-sm whitespace-nowrap dark:border-white/10 dark:bg-slate-800/90 dark:text-slate-100">{talent.age || "-"} tuổi</span>
          <span className="min-w-0 shrink rounded-md border border-[#F0D7D3] bg-[#FAF7F6] px-1.5 py-1 text-[8px] font-black uppercase text-[#574D54] shadow-sm whitespace-nowrap dark:border-white/10 dark:bg-slate-800/90 dark:text-slate-100">
            {experienceYears} năm kinh nghiệm
          </span>
          <span className="min-w-0 shrink rounded-md border border-[#F0D7D3] bg-[#FAF7F6] px-1.5 py-1 text-[8px] font-black uppercase text-[#574D54] shadow-sm whitespace-nowrap dark:border-white/10 dark:bg-slate-800/90 dark:text-slate-100">{talent.height || "-"}cm</span>
          <span className="min-w-0 shrink rounded-md border border-[#F0D7D3] bg-[#FAF7F6] px-1.5 py-1 text-[8px] font-black uppercase text-[#574D54] shadow-sm whitespace-nowrap dark:border-white/10 dark:bg-slate-800/90 dark:text-slate-100">{talent.weight || "-"}kg</span>
        </div>

        {/* Notes */}
        <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-[#F0D7D3] bg-[#FAF7F6] p-2.5 text-[10px] dark:border-white/5 dark:bg-[#0F1115]/30">
          <FileText className="h-3.5 w-3.5 text-[#8F0709] shrink-0 mt-0.5 dark:text-slate-400" />
          <p className={cn("leading-relaxed font-semibold", entry.notes ? "text-[#191116] dark:text-slate-300" : "text-[#9A8B88] italic dark:text-slate-500")}>
            {(() => {
              if (!entry.notes) return "Idol được tạo bởi quản lý.";
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
          <div className="mt-2.5 flex flex-col gap-2 rounded-xl border border-dashed border-[#8F0709]/30 bg-[#FFF0EE] p-2.5 dark:border-amber-400/30 dark:bg-amber-400/[0.03]">
            <div>
              <p className="text-[10px] font-black text-[#191116] uppercase tracking-wider dark:text-white">Mời Idol tham gia OnstageVN</p>
              <p
                onClick={(e) => {
                  e.stopPropagation();
                  setDescExpanded(v => !v);
                }}
                className={cn(
                  "text-[9px] text-[#574D54] mt-1 leading-relaxed cursor-pointer select-none dark:text-slate-400",
                  !descExpanded && "line-clamp-2"
                )}
                title="Click để xem chi tiết mô tả"
              >
                Hiện tại chỉ nhà quản lý mới có thể quản lý hồ sơ này. Gửi lời mời để Idol tự đăng nhập và cập nhật thông tin của mình.
              </p>
            </div>
            <button
              type="button"
              style={{ color: "#ffffff" }}
              onClick={(e) => {
                e.stopPropagation();
                onActivateClick(talent);
              }}
              className="light-force-white w-full h-8 rounded-lg bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white font-black text-[9px] uppercase tracking-wider cursor-pointer hover:brightness-105 active:scale-[0.97] transition-all whitespace-nowrap mt-0.5"
            >
              Gửi lời mời kích hoạt
            </button>
          </div>
        )}

        {/* Pending notice */}
        {isPending && (
          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-[#F0D7D3] bg-[#FFF0EE] p-2.5 dark:border-amber-500/20 dark:bg-amber-500/[0.03]">
            <Clock className="h-3 w-3 shrink-0 text-[#8F0709] dark:text-amber-400" />
            <p className="text-[9px] text-[#8F0709] font-bold uppercase tracking-wider leading-snug dark:text-amber-300/80">
              Mời lúc <span className="text-[#191116] font-black dark:text-white">{entry.addedAt}</span> · Chờ xác nhận
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2 border-t border-[#F0D7D3] pt-3.5 dark:border-white/5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/brand/talents/${talent.id}?from=/brand/my-talents`);
          }}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#F0D7D3] bg-white px-4 text-[10px] font-black uppercase tracking-wider text-[#574D54] hover:border-[#8F0709] hover:text-[#8F0709] transition active:scale-95 cursor-pointer shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          title="Xem hồ sơ chi tiết"
        >
          <Eye className="h-4 w-4 shrink-0" />
          <span>Xem</span>
        </button>
        <button
          type="button"
          style={{ color: "#ffffff" }}
          onClick={(e) => {
            e.stopPropagation();
            onAssignJobClick(talent);
          }}
          className="light-force-white flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white text-[10px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-md hover:brightness-110"
          title="Giao việc cho idol"
        >
          <Briefcase className="h-4 w-4 stroke-[3] !text-white text-white shrink-0" />
          <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">Assign Job</span>
        </button>
      </div>
    </article>
  );
}
