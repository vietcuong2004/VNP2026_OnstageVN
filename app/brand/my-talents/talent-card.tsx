"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, Edit, MessageSquare, Phone, Mail, Trash2, Shield,
  MapPin, Clock, MoreVertical, Calendar, User, Briefcase, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
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

const tierColor = (tier: string) => {
  if (tier === "S") return "text-amber-300 bg-amber-500/10 border-amber-500/20";
  if (tier === "A") return "text-cyan-300 bg-cyan-500/10 border-cyan-500/20";
  if (tier === "B") return "text-purple-300 bg-purple-500/10 border-purple-500/20";
  return "text-slate-300 bg-slate-700/40 border-slate-600/30";
};

function fmt(d: string) {
  if (!d) return "—";
  const p = d.split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
}

export default function TalentCard({ entry, talent, onDeleteClick, onActivateClick, onEditClick, onAssignJobClick }: TalentCardProps) {
  const router = useRouter();
  const sc = statusConfig[entry.status] ?? statusConfig.declined;
  const isAccepted = entry.status === "accepted";
  const isPending = entry.status === "pending";
  const isManaged = talent.userStatus === "managed";

  const [menuOpen, setMenuOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    if (menuOpen) document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [menuOpen]);

  return (
    <div className={cn(
      "relative rounded-2xl border overflow-hidden flex flex-col",
      "bg-gradient-to-b from-[#0c1120] via-[#080d18] to-[#050810]",
      "transition-all duration-300 group",
      isAccepted
        ? "border-yellow-400/25 shadow-[0_0_22px_rgba(250,204,21,0.1)]"
        : isPending
          ? "border-yellow-500/15 shadow-[0_0_22px_rgba(234,179,8,0.07)]"
          : "border-red-500/15 opacity-65",
    )}>
      {/* top glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />

      {/* ── HEADER ROW: avatar | info ── */}
      <div className="flex items-stretch gap-3 px-4 pt-4 pb-3">
        {/* Avatar */}
        <div className="relative shrink-0 aspect-square">
          <div className={cn(
            "absolute inset-0 rounded-xl overflow-hidden border-2 p-[2px]",
            isAccepted ? "border-yellow-400/35 bg-yellow-400/5" : "border-yellow-500/20 bg-yellow-500/5",
          )}>
            <img
              src={talent.avatar}
              alt={talent.name}
              onError={(e) => { e.currentTarget.src = createInitialAvatarDataUrl(talent.name, talent.email); }}
              className="h-full w-full rounded-[9px] object-cover"
            />
          </div>
          {talent.verified && (
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#07090f] border-2 border-yellow-400 flex items-center justify-center z-10">
              <Shield className="h-2.5 w-2.5 text-yellow-400" />
            </div>
          )}
        </div>

        {/* Main info — 3 rows inside */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5 justify-between">
          {/* Row 1: status badge + 3-dot menu */}
          <div className="flex items-center justify-end gap-2">
            <div className={cn(
              "inline-flex items-center gap-1 border rounded-full px-2 py-0.5 font-black uppercase tracking-wider whitespace-nowrap",
              isManaged
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : sc.badge,
            )}
              style={{ fontSize: 'clamp(8px, 2vw, 10px)' }}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", isManaged ? "bg-amber-400" : sc.dot)} />
              {isManaged ? "Managed" : sc.label}
            </div>

            {/* 3-dot menu */}
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(v => !v)}
                className="h-6 w-6 flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-400 hover:text-white hover:bg-white/15 hover:border-white/30 transition-all cursor-pointer"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-7 z-50 w-44 rounded-xl border border-white/10 bg-[#0d1020] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onEditClick(talent, entry); }}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[11px] font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5 text-yellow-400" /> Chỉnh sửa hồ sơ
                  </button>
                  <div className="mx-3 h-px bg-white/5" />
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onDeleteClick(entry.talentId, talent.name); }}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[11px] font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {isPending ? "Hủy lời mời" : "Xóa"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Name */}
          <h3
            className="font-extrabold leading-tight text-white whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ fontSize: 'clamp(13px, 4vw, 18px)' }}
          >
            {talent.name}
          </h3>

          {/* Row 3: Chips row */}
          <div className="flex items-center gap-1.5 overflow-hidden flex-nowrap">
            {talent.tier && (
              <span
                className={cn("rounded border px-1.5 py-0.5 font-black uppercase tracking-widest shrink-0", tierColor(talent.tier))}
                style={{ fontSize: 'clamp(8px, 2.2vw, 10px)', lineHeight: 1.1 }}
              >
                {talent.tier}
              </span>
            )}
            {talent.type && (
              <span
                className="border border-white/20 bg-white/8 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider text-slate-200 shrink-0"
                style={{ fontSize: 'clamp(8px, 2.2vw, 10px)', lineHeight: 1.1 }}
              >
                {talent.type}
              </span>
            )}
            {talent.city && (
              <span
                className="flex items-center gap-0.5 text-slate-300 font-semibold shrink-0"
                style={{ fontSize: 'clamp(8px, 2.2vw, 10px)' }}
              >
                <MapPin className="text-slate-400 shrink-0" style={{ width: 'clamp(10px, 2.5vw, 12px)', height: 'clamp(10px, 2.5vw, 12px)' }} />
                <span>{talent.city}</span>
              </span>
            )}
            {talent.phone && (
              <span
                className="flex items-center gap-0.5 text-slate-300 font-semibold shrink-0"
                style={{ fontSize: 'clamp(8px, 2.2vw, 10px)' }}
              >
                <Phone className="text-slate-400 shrink-0" style={{ width: 'clamp(10px, 2.5vw, 12px)', height: 'clamp(10px, 2.5vw, 12px)' }} />
                <span>{talent.phone}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="mx-4 h-px bg-white/[0.05]" />

      {/* ── MIDDLE: Notes + Status ── */}
      <div className="px-4 py-3 space-y-2.5 flex-1">

        {/* Notes */}
        <div className="flex items-start gap-2">
          <FileText className="h-3.5 w-3.5 text-white shrink-0 mt-0.5" />
          {entry.notes ? (
            <p
              onClick={() => setNotesExpanded(v => !v)}
              className={cn(
                "text-[11px] text-slate-300 font-medium leading-relaxed flex-1 cursor-pointer select-none",
                !notesExpanded && "line-clamp-2"
              )}
              title="Click để xem chi tiết ghi chú"
            >
              {entry.notes}
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 italic flex-1">Chưa có ghi chú.</p>
          )}
        </div>

        {/* Invite CTA — compact horizontal */}
        {isAccepted && isManaged && (
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-amber-400/30 bg-amber-400/[0.05] px-3 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white leading-tight">Mời Talent tham gia OnstageVN</p>
              <p
                onClick={() => setDescExpanded(v => !v)}
                className={cn(
                  "text-[10px] text-slate-400 mt-1 leading-relaxed cursor-pointer select-none",
                  !descExpanded && "line-clamp-2"
                )}
                title="Click để xem chi tiết mô tả"
              >
                Hiện tại chỉ Brand có thể quản lý hồ sơ này. Gửi lời mời để Talent tự đăng nhập và cập nhật thông tin của mình.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onActivateClick(talent)}
              className="shrink-0 h-8 px-3 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-[9px] uppercase tracking-wider cursor-pointer hover:brightness-105 active:scale-[0.97] transition-all whitespace-nowrap mt-0.5"
            >
              Gửi lời mời
            </button>
          </div>
        )}

        {/* Pending notice — compact */}
        {isPending && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-3 py-2">
            <Clock className="h-3 w-3 shrink-0 text-amber-400" />
            <p className="text-[10px] text-amber-300/80 font-semibold leading-snug">
              Mời lúc <span className="font-bold text-white">{entry.addedAt}</span> · Chờ xác nhận
            </p>
          </div>
        )}
      </div>

      {/* ── DIVIDER ── */}
      <div className="mx-4 h-px bg-white/[0.05]" />

      {/* ── FOOTER: 3 buttons ── */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => router.push(`/brand/talents/${talent.id}`)}
          className="flex items-center justify-center gap-1.5 h-10 rounded-xl border border-yellow-400/20 bg-yellow-400/5 hover:bg-yellow-400/12 active:scale-[0.97] text-yellow-300 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
          Xem
        </button>
        <button
          type="button"
          onClick={() => router.push(`/brand/messages?talentId=${talent.id}`)}
          className="flex items-center justify-center gap-1.5 h-10 rounded-xl border border-yellow-400/20 bg-yellow-400/5 hover:bg-yellow-400/12 active:scale-[0.97] text-yellow-300 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          <MessageSquare className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
          Nhắn tin
        </button>
        <button
          type="button"
          onClick={() => onAssignJobClick(talent)}
          className="flex items-center justify-center gap-1.5 h-10 rounded-xl border border-yellow-400/20 bg-yellow-400/5 hover:bg-yellow-400/12 active:scale-[0.97] text-yellow-300 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          <Briefcase className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
          Assign Job
        </button>
      </div>
    </div>
  );
}
