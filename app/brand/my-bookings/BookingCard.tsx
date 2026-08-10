"use client";

import React from "react";
import { CheckCircle2, Clock, Eye, MapPin, UserCheck } from "lucide-react";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { BookingRequest, BookingStatus } from "./types";

export function getStatusBadge(status: BookingStatus) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400">
          <Clock className="h-3 w-3 shrink-0" /> Chờ duyệt
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-400">
          <UserCheck className="h-3 w-3 shrink-0" /> Đã duyệt
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-blue-400">
          <CheckCircle2 className="h-3 w-3 shrink-0" /> Hoàn thành
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400">
          <Clock className="h-3 w-3 shrink-0" /> Chờ duyệt
        </span>
      );
  }
}

interface BookingCardProps {
  item: BookingRequest;
  onSelect: (item: BookingRequest) => void;
}

export default function BookingCard({ item, onSelect }: BookingCardProps) {
  return (
    <article
      onClick={() => onSelect(item)}
      className="group relative flex flex-col justify-between rounded-3xl border border-[#2B313D] bg-[#171A21] p-4 shadow-xl transition-all duration-300 hover:border-[#C9A86A]/60 text-left overflow-hidden cursor-pointer active:scale-[0.99]"
    >
      {/* ── CARD ROW 1: TOP BAR (Status Badge on Left, Booking ID on Right) ── */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5 mb-3">
        <div className="shrink-0">{getStatusBadge(item.status)}</div>
        <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
          #{item.id}
        </span>
      </div>

      {/* ── CARD ROW 2: MIDDLE SECTION (Avatar + Main Info) ── */}
      <div className="flex flex-row items-start gap-3 sm:gap-4">
        {/* Talent Avatar */}
        <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-md">
          <img
            src={item.talentAvatar || createInitialAvatarDataUrl(item.talentName, "")}
            alt={item.talentName}
            className="h-full w-full object-cover"
          />
          <span className="absolute bottom-0 inset-x-0 bg-slate-950/85 text-[7.5px] sm:text-[8.5px] font-black uppercase text-amber-300 py-0.5 text-center truncate">
            {item.talentRole}
          </span>
        </div>

        {/* Main Info Column */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm sm:text-base font-black text-white leading-tight truncate group-hover:text-amber-300 transition-colors drop-shadow-[0_1px_8px_rgba(255,255,255,0.1)]">
            {item.campaignTitle}
          </h3>

          <p className="text-xs font-bold text-slate-300">
            Idol: <span className="text-amber-300">{item.talentName}</span>
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[10.5px] sm:text-xs font-semibold text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#C9A86A]" />
              {item.workDate} ({item.startTime} - {item.endTime})
            </span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C9A86A]" />
              <span className="truncate">{item.location}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── CARD ROW 3: BOTTOM ACTIONS (Financial Deposit + Action Buttons) ── */}
      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
        <div className="text-left">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Đã cọc trước
          </span>
          <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
            {item.depositAmount.toLocaleString("vi-VN")} đ
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            className="flex h-9 items-center justify-center gap-1.5 rounded-2xl border border-[#C9A86A]/40 bg-[#C9A86A]/15 px-4 text-xs font-black text-amber-300 hover:bg-[#C9A86A]/25 active:scale-95 transition cursor-pointer shadow-md"
          >
            <Eye className="h-3.5 w-3.5" />
            Chi tiết
          </button>
        </div>
      </div>
    </article>
  );
}
