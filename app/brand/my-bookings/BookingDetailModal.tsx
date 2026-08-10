"use client";

import React from "react";
import { X } from "lucide-react";
import { BookingRequest } from "./types";
import { getStatusBadge } from "./BookingCard";

interface BookingDetailModalProps {
  booking: BookingRequest | null;
  onClose: () => void;
}

export default function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
  if (!booking) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex flex-col md:items-center md:justify-center h-dvh w-screen bg-[#171A21] md:bg-slate-950/80 md:backdrop-blur-sm p-0 md:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col h-full md:h-[95vh] md:max-h-[95vh] w-full md:max-w-2xl md:rounded-3xl border-0 md:border md:border-white/10 bg-[#171A21] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header - Sticky at Top of Form */}
        <header className="sticky top-0 z-50 bg-[#171A21]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-white/10 shrink-0 flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase text-amber-400 font-mono">
              MÃ ĐƠN: #{booking.id}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">Chi tiết Yêu cầu Booking</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-800/90 p-2.5 text-slate-300 hover:text-white transition cursor-pointer hover:bg-slate-700 active:scale-95"
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trạng thái đơn</p>
            <div>{getStatusBadge(booking.status)}</div>
          </div>

          {/* Campaign / Job Details */}
          <div className="rounded-2xl border border-white/5 bg-slate-950 p-4 space-y-2.5 shadow-md">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên sự kiện / Job</p>
            <p className="text-base font-black text-white leading-snug">{booking.campaignTitle}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-medium text-slate-300 pt-2 border-t border-white/5">
              <div>
                <span className="text-slate-500">Idol book:</span>{" "}
                <strong className="text-amber-300">{booking.talentName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Vai trò:</span>{" "}
                <strong className="text-white">{booking.talentRole}</strong>
              </div>
              <div>
                <span className="text-slate-500">Ngày làm:</span> {booking.workDate}
              </div>
              <div>
                <span className="text-slate-500">Giờ:</span> {booking.startTime} - {booking.endTime}
              </div>
            </div>

            <p className="text-xs font-medium text-slate-300 pt-0.5">
              <span className="text-slate-500">Địa điểm:</span> {booking.location}
            </p>

            {booking.notes && (
              <p className="text-xs font-medium text-slate-300 pt-0.5 italic">
                <span className="text-slate-500">Ghi chú thêm:</span> {booking.notes}
              </p>
            )}
          </div>

          {/* Contact Details for Purchaser */}
          <div className="rounded-2xl border border-white/5 bg-slate-950 p-4 space-y-1.5 shadow-md">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              THÔNG TIN LIÊN HỆ CỦA NGƯỜI ĐẶT
            </p>
            <div className="text-xs font-medium text-slate-300 space-y-1 pt-0.5">
              <p><span className="text-slate-500">Họ và tên:</span> <strong className="text-white">{booking.contactName}</strong></p>
              <p><span className="text-slate-500">Số điện thoại:</span> <strong className="text-white">{booking.contactPhone}</strong></p>
              <p><span className="text-slate-500">Email:</span> <span className="text-slate-300">{booking.contactEmail}</span></p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between shadow-md">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Tiền đặt cọc</p>
              <p className="text-base sm:text-xl font-black text-amber-300 font-mono mt-0.5">
                {booking.depositAmount.toLocaleString("vi-VN")} VND
              </p>
            </div>
            {booking.totalBudget && (
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tổng dự kiến</p>
                <p className="text-xs sm:text-sm font-bold text-white font-mono mt-0.5">
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
