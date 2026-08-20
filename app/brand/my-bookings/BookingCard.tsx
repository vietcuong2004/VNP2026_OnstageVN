"use client";

import React from "react";
import {
  Clock,
  MapPin,
  Trash2,
  UserCheck,
  Users2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { BookingRequest, BookingStatus } from "./types";

type StatusConfig = {
  label: string;
  className: string;
  Icon: LucideIcon;
  dotColor: string;
};

function statusConfig(status: BookingStatus): StatusConfig {
  switch (status) {
    case "pending_confirmation":
    case "deposit_pending":
    case "submitted":
    case "reviewing":
      return {
        label: "Chờ xác nhận",
        Icon: Clock,
        className: "border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400",
        dotColor: "bg-[#8F0709] dark:bg-amber-400",
      };
    case "contacting_idols":
    case "talent_confirming":
    case "need_replacement":
    case "rejected":
      return {
        label: "Đang liên hệ Idol",
        Icon: UserCheck,
        className: "border-amber-200 bg-amber-50/90 text-amber-900 dark:border-yellow-500/40 dark:bg-yellow-500/10 dark:text-yellow-300",
        dotColor: "bg-amber-500",
      };
    case "idols_confirmed":
    case "confirmed":
      return {
        label: "Đã chốt Idol",
        Icon: UserCheck,
        className: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400",
        dotColor: "bg-emerald-500",
      };
    case "waiting_payment":
      return {
        label: "Chờ thanh toán",
        Icon: Clock,
        className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-yellow-500/40 dark:bg-yellow-500/10 dark:text-yellow-300",
        dotColor: "bg-amber-500",
      };
    case "paid":
    case "waiting_payout":
      return {
        label: "Đã thanh toán",
        Icon: UserCheck,
        className: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400",
        dotColor: "bg-emerald-500",
      };
    case "completed":
      return {
        label: "Hoàn tất",
        Icon: UserCheck,
        className: "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-400",
        dotColor: "bg-indigo-500",
      };
    case "cancelled":
      return {
        label: "Đã hủy",
        Icon: XCircle,
        className: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-500/40 dark:bg-slate-500/10 dark:text-slate-300",
        dotColor: "bg-slate-400",
      };
    default:
      return {
        label: "Chờ xác nhận",
        Icon: Clock,
        className: "border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400",
        dotColor: "bg-[#8F0709] dark:bg-amber-400",
      };
  }
}

export function getStatusBadge(status: BookingStatus) {
  const config = statusConfig(status);
  const Icon = config.Icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap shrink-0 ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor} shrink-0 animate-pulse`} />
      <Icon className="h-3 w-3 shrink-0" />
      <span className="whitespace-nowrap">{config.label}</span>
    </span>
  );
}

interface BookingCardProps {
  item: BookingRequest;
  onSelect: (item: BookingRequest) => void;
  onDelete: (item: BookingRequest) => void;
  isDeleting?: boolean;
}

export default function BookingCard({ item, onSelect, onDelete, isDeleting = false }: BookingCardProps) {
  const timeRange = [item.startTime, item.endTime].filter(Boolean).join(" - ");
  const scheduleText = timeRange
    ? `${item.workDate || "Chưa cập nhật"} (${timeRange})`
    : item.workDate || "Chưa cập nhật";
  const bookedTalentCount = item.bookedTalents?.length ?? 0;
  const isZeroTalents = (!item.talentId || item.talentId === "") && bookedTalentCount === 0 && (!item.talentName || item.talentName === "Idol" || item.talentName === "0 Idol" || item.talentName.includes("0 Idol"));
  const isMultipleBooking = !isZeroTalents && (item.bookingType === "multiple" || bookedTalentCount > 1);

  const getTalentDisplayName = () => {
    if (isZeroTalents) return "Chưa chọn Idol";
    if (isMultipleBooking) {
      if (item.talentName && !item.talentName.toLowerCase().includes("idol")) {
        return `${item.talentName} + ${Math.max(1, bookedTalentCount - 1)} Idol khác`;
      }
      return item.talentName || `Booking ${bookedTalentCount} Idol`;
    }
    return item.talentName || "Idol";
  };

  return (
    <article
      onClick={() => onSelect(item)}
      className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-[#F0D7D3] bg-white p-3.5 sm:p-4.5 shadow-xs transition-all duration-300 hover:border-[#8F0709]/60 hover:shadow-md text-left cursor-pointer active:scale-[0.995] dark:border-[#2B313D] dark:bg-[#171A21] dark:hover:border-[#C9A86A]/60"
    >
      {/* ── Top Header Row (Always 1 single aligned line) ── */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {getStatusBadge(item.status)}
          {isMultipleBooking && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800 whitespace-nowrap dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              <Users2 className="h-2.5 w-2.5" /> {bookedTalentCount} Idol
            </span>
          )}
        </div>

        <span className="shrink-0 text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#8F0709] font-mono bg-[#FFF0EE] px-2.5 py-0.5 rounded-lg border border-[#F0D7D3] dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20">
          #{item.id}
        </span>
      </div>

      {/* ── Main Content (Avatar + Info) ── */}
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Circular Avatar */}
        <div className="relative h-13 w-13 sm:h-15 sm:w-15 shrink-0 overflow-hidden rounded-full border border-[#F0D7D3] bg-slate-100 shadow-2xs transition-transform duration-300 group-hover:scale-105 dark:border-white/10 dark:bg-slate-900">
          <img
            src={item.talentAvatar || createInitialAvatarDataUrl(isZeroTalents ? "0 Idol" : item.talentName, "")}
            alt={isZeroTalents ? "0 Idol" : item.talentName}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = createInitialAvatarDataUrl(isZeroTalents ? "0 Idol" : item.talentName, "");
            }}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Details Text Block */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm sm:text-base font-black text-[#191116] leading-snug truncate group-hover:text-[#8F0709] transition-colors dark:text-white dark:group-hover:text-amber-300">
            {item.campaignTitle}
          </h3>

          <div className="text-xs text-[#574D54] flex items-center gap-1.5 flex-wrap dark:text-slate-300">
            <span className="text-[#9A8B88] font-medium">Idol:</span>
            <strong className="text-[#8F0709] font-black dark:text-amber-300 truncate max-w-[200px]">
              {getTalentDisplayName()}
            </strong>
            {item.talentRole && (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[9.5px] font-bold uppercase text-[#574D54] dark:bg-white/10 dark:text-slate-300">
                {item.talentRole}
              </span>
            )}
          </div>

          {/* Time & Location in a clean, compact inline layout */}
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[11px] text-[#574D54] dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 shrink-0 text-[#8F0709] dark:text-[#C9A86A]" />
              <span className="truncate">{scheduleText}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0 text-[#8F0709] dark:text-[#C9A86A]" />
              <span className="truncate max-w-[220px]">{item.location || "Chưa cập nhật"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Row (Deposit Info & Delete Button in 1 clean bar) ── */}
      <div className="mt-3 pt-2.5 border-t border-[#F5E6E4] flex items-center justify-between gap-2 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#574D54] dark:text-slate-400">
            Đã cọc:
          </span>
          <span className="text-sm sm:text-base font-black text-[#8F0709] font-mono dark:text-amber-400">
            {item.depositAmount.toLocaleString("vi-VN")} đ
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          disabled={isDeleting}
          title="Xóa đơn booking"
          className="flex h-8 sm:h-8.5 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white px-3 text-xs font-black hover:brightness-110 active:scale-95 transition cursor-pointer shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
          <span className="font-black">{isDeleting ? "Đang xóa" : "Xóa"}</span>
        </button>
      </div>
    </article>
  );
}
