"use client";

import React from "react";
import { CheckCircle2, Clock, MapPin, Trash2, UserCheck, XCircle, type LucideIcon } from "lucide-react";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { BookingRequest, BookingStatus } from "./types";

type StatusConfig = {
  label: string;
  className: string;
  Icon: LucideIcon;
};

function statusConfig(status: BookingStatus): StatusConfig {
  switch (status) {
    case "deposit_pending":
      return {
        label: "Chờ đặt cọc",
        Icon: Clock,
        className: "border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400",
      };
    case "submitted":
      return {
        label: "Chờ kiểm tra",
        Icon: Clock,
        className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-yellow-500/40 dark:bg-yellow-500/10 dark:text-yellow-300",
      };
    case "reviewing":
      return {
        label: "Đang xử lý",
        Icon: Clock,
        className: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-300",
      };
    case "talent_confirming":
      return {
        label: "Chờ Idol xác nhận",
        Icon: UserCheck,
        className: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300",
      };
    case "confirmed":
      return {
        label: "Đã xác nhận",
        Icon: UserCheck,
        className: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400",
      };
    case "rejected":
      return {
        label: "Idol từ chối",
        Icon: XCircle,
        className: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300",
      };
    case "cancelled":
      return {
        label: "Đã hủy",
        Icon: XCircle,
        className: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-500/40 dark:bg-slate-500/10 dark:text-slate-300",
      };
    case "completed":
      return {
        label: "Hoàn tất",
        Icon: CheckCircle2,
        className: "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-400",
      };
  }
}

export function getStatusBadge(status: BookingStatus) {
  const config = statusConfig(status);
  const Icon = config.Icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider ${config.className}`}>
      <Icon className="h-3 w-3 shrink-0" /> {config.label}
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
  const isMultipleBooking = item.bookingType === "multiple" || bookedTalentCount > 1;
  return (
    <article
      onClick={() => onSelect(item)}
      className="group relative flex flex-col justify-between rounded-3xl border border-[#F0D7D3] bg-white p-4 shadow-sm transition-all duration-300 hover:border-[#8F0709] text-left overflow-hidden cursor-pointer active:scale-[0.99] dark:border-[#2B313D] dark:bg-[#171A21] dark:hover:border-[#C9A86A]/60"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#F0D7D3] pb-2.5 mb-3 dark:border-white/5">
        <div className="shrink-0">{getStatusBadge(item.status)}</div>
        <span className="text-xs font-black uppercase tracking-wider text-[#8F0709] font-mono bg-[#FFF0EE] px-2.5 py-1 rounded-xl border border-[#F0D7D3] dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20">
          #{item.id}
        </span>
      </div>

      <div className="flex flex-row items-start gap-3 sm:gap-4">
        <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-2xl border border-[#F0D7D3] bg-slate-100 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <img
            src={item.talentAvatar || createInitialAvatarDataUrl(item.talentName, "")}
            alt={item.talentName}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = createInitialAvatarDataUrl(item.talentName, "");
            }}
            className="h-full w-full object-cover"
          />
          <span className="absolute bottom-0 inset-x-0 bg-[#8F0709] text-[7.5px] sm:text-[8.5px] font-black uppercase text-white py-0.5 text-center truncate dark:bg-slate-950/85 dark:text-amber-300">
            {item.talentRole}
          </span>
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm sm:text-base font-black text-[#191116] leading-tight truncate group-hover:text-[#8F0709] transition-colors dark:text-white dark:group-hover:text-amber-300">
            {item.campaignTitle}
          </h3>

          <p className="text-xs font-bold text-[#574D54] dark:text-slate-300">
            {isMultipleBooking ? (
              <>
                Loại đơn: <span className="text-[#8F0709] font-extrabold dark:text-amber-300">Booking nhiều Idol{bookedTalentCount ? ` (${bookedTalentCount})` : ""}</span>
              </>
            ) : (
              <>
                Idol: <span className="text-[#8F0709] font-extrabold dark:text-amber-300">{item.talentName}</span>
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[10.5px] sm:text-xs font-semibold text-[#574D54] pt-0.5 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#8F0709] dark:text-[#C9A86A]" />
              {scheduleText}
            </span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#8F0709] dark:text-[#C9A86A]" />
              <span className="truncate">{item.location || "Chưa cập nhật"}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[#F0D7D3] pt-3 dark:border-white/5">
        <div className="text-left">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#574D54] block dark:text-slate-400">
            Đã cọc trước
          </span>
          <span className="text-sm sm:text-base font-black text-[#8F0709] font-mono dark:text-amber-400">
            {item.depositAmount.toLocaleString("vi-VN")} đ
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            style={{ color: "#ffffff" }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            disabled={isDeleting}
            className="light-force-white flex h-9 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white px-4 text-xs font-black hover:brightness-110 active:scale-95 transition cursor-pointer shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5 stroke-[3] !text-white text-white" />
            <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">{isDeleting ? "Đang xóa" : "Xóa"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
