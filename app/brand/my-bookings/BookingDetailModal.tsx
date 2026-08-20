"use client";

import React from "react";
import { X } from "lucide-react";
import { BookingRequest } from "./types";
import { getStatusBadge } from "./BookingCard";
import { createInitialAvatarDataUrl } from "@/lib/avatar";

function renderTalentStatusBadge(status?: string | null) {
  const normalized = String(status || "").trim().toLowerCase();
  switch (normalized) {
    case "talent_confirming":
    case "contacting":
    case "pending":
    case "pending_confirmation":
      return (
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-800 dark:border-yellow-500/40 dark:bg-yellow-500/10 dark:text-yellow-300">
          Chờ Idol xác nhận
        </span>
      );
    case "confirmed":
    case "accepted":
    case "idols_confirmed":
      return (
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400">
          Đã nhận đơn
        </span>
      );
    case "rejected":
    case "declined":
      return (
        <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10.5px] font-bold text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
          Idol bận / Từ chối
        </span>
      );
    case "need_replacement":
      return (
        <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[10.5px] font-bold text-orange-800 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300">
          Cần đổi Idol khác
        </span>
      );
    default:
      return status ? (
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {status}
        </span>
      ) : null;
  }
}

interface BookingDetailModalProps {
  booking: BookingRequest | null;
  onClose: () => void;
}

export default function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
  if (!booking) return null;

  const calculatedTalentsQuote = (booking.bookedTalents ?? []).reduce((sum, t) => {
    return sum + (t.price && t.price > 0 ? Math.round(t.price * 1.3) : 0);
  }, 0);

  const totalPayable = (booking.totalAmount && booking.totalAmount > 0)
    ? booking.totalAmount
    : ((booking.clientQuotedAmount && booking.clientQuotedAmount > 0)
      ? booking.clientQuotedAmount
      : (calculatedTalentsQuote > 0
        ? calculatedTalentsQuote
        : (booking.totalBudget && booking.totalBudget > booking.depositAmount ? booking.totalBudget : (calculatedTalentsQuote || booking.totalBudget || booking.depositAmount))));

  const isPaid = ["paid", "waiting_payout", "completed"].includes(String(booking.status || "").toLowerCase()) || booking.paymentStatus === "paid";
  const remainingPayable = isPaid ? 0 : Math.max(0, totalPayable - booking.depositAmount);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex flex-col md:items-center md:justify-center h-dvh w-screen bg-[#191116]/60 md:bg-slate-950/80 md:backdrop-blur-sm p-0 md:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col h-full md:h-[95vh] md:max-h-[95vh] w-full md:max-w-2xl md:rounded-3xl border-0 md:border md:border-[#F0D7D3] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 dark:bg-[#171A21] dark:border-white/10"
      >
        {/* Header - Sticky at Top of Form */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-[#F0D7D3] shrink-0 flex items-center justify-between dark:bg-[#171A21]/95 dark:border-white/10">
          <div>
            <span className="text-xs font-black uppercase text-[#8F0709] font-mono dark:text-amber-400">
              MÃ ĐƠN: #{booking.id}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[#191116] mt-0.5 dark:text-white">Chi tiết Yêu cầu Booking</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#FFF0EE] border border-[#F0D7D3] p-2 text-[#574D54] hover:text-[#8F0709] transition cursor-pointer hover:bg-[#FFE5E2] active:scale-95 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:text-white dark:border-transparent"
            aria-label="Đóng"
            title="Đóng form chi tiết"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-left">
          {/* Status Section */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#574D54] dark:text-slate-400">Trạng thái đơn</p>
            <div>{getStatusBadge(booking.status)}</div>
          </div>

          {/* Campaign / Job Details */}
          <div className="rounded-2xl border border-[#F0D7D3] bg-[#FAF7F6] p-4 space-y-2.5 shadow-sm dark:border-white/5 dark:bg-slate-950">
            <p className="text-[10px] font-bold text-[#574D54] uppercase tracking-wider dark:text-slate-400">Tên sự kiện / Job</p>
            <p className="text-base font-black text-[#191116] leading-snug dark:text-white">{booking.campaignTitle}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-medium text-[#574D54] pt-2 border-t border-[#F0D7D3] dark:text-slate-300 dark:border-white/5">
              <div>
                <span className="text-[#9A8B88] dark:text-slate-500">
                  {(!booking.talentId && (!booking.bookedTalents || booking.bookedTalents.length === 0)) ? "Loại đơn:" : "Idol book:"}
                </span>{" "}
                <strong className="text-[#8F0709] dark:text-amber-300">
                  {(!booking.talentId && (!booking.bookedTalents || booking.bookedTalents.length === 0)) ? "0 Idol" : booking.talentName}
                </strong>
              </div>
              <div>
                <span className="text-[#9A8B88] dark:text-slate-500">Vai trò:</span>{" "}
                <strong className="text-[#191116] dark:text-white">{booking.talentRole}</strong>
              </div>
              <div>
                <span className="text-[#9A8B88] dark:text-slate-500">Ngày làm:</span> {booking.workDate}
              </div>
              <div>
                <span className="text-[#9A8B88] dark:text-slate-500">Giờ:</span> {booking.startTime} - {booking.endTime}
              </div>
            </div>

            <p className="text-xs font-medium text-[#574D54] pt-0.5 dark:text-slate-300">
              <span className="text-[#9A8B88] dark:text-slate-500">Địa điểm:</span> {booking.location}
            </p>

            {booking.notes && (
              <p className="text-xs font-medium text-[#574D54] pt-0.5 italic dark:text-slate-300">
                <span className="text-[#9A8B88] dark:text-slate-500">Ghi chú thêm:</span> {booking.notes}
              </p>
            )}
          </div>


          {booking.bookedTalents && booking.bookedTalents.length > 0 && (
            <div className="rounded-2xl border border-[#F0D7D3] bg-[#FAF7F6] p-4 space-y-3 shadow-sm dark:border-white/5 dark:bg-slate-950">
              <p className="text-[10px] font-bold text-[#574D54] uppercase tracking-wider dark:text-slate-400">
                Idol trong đơn ({booking.bookedTalents.length})
              </p>
              <div className="space-y-2">
                {booking.bookedTalents.map((talent) => (
                  <div
                    key={talent.id || talent.talentId || talent.talentName}
                    className="flex items-center gap-3 rounded-2xl border border-[#F0D7D3] bg-white p-2.5 shadow-2xs dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <img
                      src={talent.talentAvatar || createInitialAvatarDataUrl(talent.talentName, talent.talentId)}
                      alt={talent.talentName}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = createInitialAvatarDataUrl(talent.talentName, talent.talentId);
                      }}
                      className="h-10 w-10 rounded-full object-cover border border-[#F0D7D3] dark:border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[#191116] dark:text-white">{talent.talentName}</p>
                      <p className="truncate text-[11px] font-bold text-[#8F0709] dark:text-amber-300">{talent.talentRole || "Idol"}</p>
                    </div>
                    {renderTalentStatusBadge(talent.status)}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Contact Details for Purchaser */}
          <div className="rounded-2xl border border-[#F0D7D3] bg-[#FAF7F6] p-4 space-y-1.5 shadow-sm dark:border-white/5 dark:bg-slate-950">
            <p className="text-[10px] font-bold text-[#574D54] uppercase tracking-wider dark:text-slate-400">
              THÔNG TIN LIÊN HỆ CỦA NGƯỜI ĐẶT
            </p>
            <div className="text-xs font-medium text-[#574D54] space-y-1 pt-0.5 dark:text-slate-300">
              <p><span className="text-[#9A8B88] dark:text-slate-500">Họ và tên:</span> <strong className="text-[#191116] dark:text-white">{booking.contactName}</strong></p>
              <p><span className="text-[#9A8B88] dark:text-slate-500">Số điện thoại:</span> <strong className="text-[#191116] dark:text-white">{booking.contactPhone}</strong></p>
              <p><span className="text-[#9A8B88] dark:text-slate-500">Email:</span> <span className="text-[#191116] dark:text-slate-300">{booking.contactEmail}</span></p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="rounded-2xl border border-[#F0D7D3] bg-[#FFF0EE] p-4 shadow-sm space-y-2.5 dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#8F0709] dark:text-amber-400">
              Tổng kết thanh toán
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#574D54] font-semibold dark:text-slate-300">Đã đặt cọc:</span>
                <span className="font-mono font-black text-[#8F0709] dark:text-amber-300">
                  {booking.depositAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#574D54] font-semibold dark:text-slate-300">Tổng thanh toán dự kiến:</span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">
                  {totalPayable.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="pt-2 border-t border-[#F0D7D3]/80 dark:border-white/10 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#8F0709] font-black dark:text-rose-300 uppercase tracking-wide">
                  Còn phải thanh toán:
                </span>
                <span className="font-mono text-base sm:text-lg font-black text-[#8F0709] dark:text-rose-400">
                  {remainingPayable.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
