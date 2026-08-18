"use client";

import React from "react";
import { X } from "lucide-react";
import { BookingRequest } from "./types";
import { getStatusBadge } from "./BookingCard";
import { createInitialAvatarDataUrl } from "@/lib/avatar";

interface BookingDetailModalProps {
  booking: BookingRequest | null;
  onClose: () => void;
}

export default function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
  if (!booking) return null;

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
                <span className="text-[#9A8B88] dark:text-slate-500">Idol book:</span>{" "}
                <strong className="text-[#8F0709] dark:text-amber-300">{booking.talentName}</strong>
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
            <div className="rounded-2xl border border-white/5 bg-slate-950 p-4 space-y-3 shadow-md">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Idol trong đơn ({booking.bookedTalents.length})
              </p>
              <div className="space-y-2">
                {booking.bookedTalents.map((talent) => (
                  <div key={talent.id || talent.talentId || talent.talentName} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-2.5">
                    <img
                      src={talent.talentAvatar || createInitialAvatarDataUrl(talent.talentName, talent.talentId)}
                      alt={talent.talentName}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = createInitialAvatarDataUrl(talent.talentName, talent.talentId);
                      }}
                      className="h-10 w-10 rounded-xl object-cover border border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-white">{talent.talentName}</p>
                      <p className="truncate text-[11px] font-bold text-amber-300">{talent.talentRole}</p>
                    </div>
                    {talent.status && (
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-slate-300">
                        {talent.status}
                      </span>
                    )}
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
          <div className="rounded-2xl border border-[#F0D7D3] bg-[#FFF0EE] p-4 flex items-center justify-between shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8F0709] dark:text-amber-400">Tiền đặt cọc</p>
              <p className="text-base sm:text-xl font-black text-[#8F0709] font-mono mt-0.5 dark:text-amber-300">
                {booking.depositAmount.toLocaleString("vi-VN")} VND
              </p>
            </div>
            {booking.totalBudget && (
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#574D54] dark:text-slate-400">Tổng dự kiến</p>
                <p className="text-xs sm:text-sm font-bold text-[#191116] font-mono mt-0.5 dark:text-white">
                  {booking.totalBudget.toLocaleString("vi-VN")} VND
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
