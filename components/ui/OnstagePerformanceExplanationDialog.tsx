"use client";

import React from "react";
import { X, FileText, ShoppingCart, Coins, Star, Trophy } from "lucide-react";

interface OnstagePerformanceExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const performanceMetricCards = [
  {
    key: "campaigns",
    Icon: FileText,
    title: "Chiến dịch / Đơn đã thực hiện",
    cardClass: "border-rose-200/90 bg-[#FFF9F8] dark:border-rose-500/20 dark:bg-rose-500/5",
    iconClass: "text-[#C72524] dark:text-rose-400",
    description:
      "Tổng số chiến dịch sáng tạo nội dung (KOL/KOC video) và đơn booking trực tiếp (PG/PB, Model, Livestream) mà Idol đã hoàn thành 100% nghĩa vụ và được nghiệm thu thành công trên Onstage.",
  },
  {
    key: "orders",
    Icon: ShoppingCart,
    title: "Đơn hàng tạo ra",
    cardClass: "border-amber-200/90 bg-[#FFFDF5] dark:border-amber-500/20 dark:bg-amber-500/5",
    iconClass: "text-[#A36C1D] dark:text-amber-400",
    description:
      "Tổng số đơn hàng bán ra thành công thông qua video gắn giỏ hàng (TikTok Shop, Shopee) và link affiliate / mã voucher độc quyền trong các chiến dịch (đã trừ đơn hủy và hoàn tiền).",
  },
  {
    key: "gmv",
    Icon: Coins,
    title: "Tổng doanh thu",
    cardClass: "border-emerald-200/90 bg-[#F4FAF6] dark:border-emerald-500/20 dark:bg-emerald-500/5",
    iconClass: "text-emerald-700 dark:text-emerald-400",
    description:
      "Tổng giá trị hàng hóa thực tế bán được qua các nội dung review và phiên livestream của Idol, đo lường sức mua và khả năng mang lại doanh thu thực tế cho Brand.",
  },
  {
    key: "rating",
    Icon: Star,
    title: "Đánh giá từ Brand",
    cardClass: "border-amber-200/90 bg-[#FFFDF5] dark:border-amber-500/20 dark:bg-amber-500/5",
    iconClass: "text-amber-600 dark:text-amber-400 fill-current",
    description:
      "Điểm số đánh giá trung bình (thang điểm 5.0) từ các Nhãn hàng & Agency đã trực tiếp làm việc, dựa trên tiêu chí: đúng hạn deadline, thái độ làm việc, chất lượng nội dung và khả năng đạt KPI.",
  },
];

export default function OnstagePerformanceExplanationDialog({
  isOpen,
  onClose,
}: OnstagePerformanceExplanationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex h-[100dvh] w-screen items-stretch justify-stretch overflow-hidden bg-white/80 dark:bg-[#080914] p-0 md:items-center md:justify-center md:bg-transparent md:p-4 animate-in fade-in duration-150">
      <div
        className="absolute inset-0 bg-black/60 dark:bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative flex h-[100dvh] max-h-[100dvh] w-screen flex-col overflow-hidden rounded-none border-0 bg-white text-[#191116] shadow-2xl animate-in zoom-in-95 duration-200 dark:bg-[#080914] dark:text-white md:h-auto md:max-h-[90vh] md:w-full md:max-w-2xl md:rounded-3xl md:border md:border-[#F0D7D3] dark:md:border-white/10">
        <div className="flex-1 space-y-4 overflow-y-auto p-5 pb-[96px] md:p-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#F0D7D3] pb-4 text-left dark:border-white/5">
            <div className="min-w-0">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-[#8F0709] dark:text-amber-400 sm:whitespace-nowrap flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                Hệ thống dữ liệu OnstageVN
              </span>
              <h3 className="text-lg font-black uppercase tracking-wider text-[#191116] dark:text-white sm:whitespace-nowrap">
                Hiệu suất thực chiến trên Onstage
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="hidden shrink-0 rounded-full border border-[#F0D7D3] bg-[#FFF0EE] p-2 text-[#8F0709] shadow-md transition-all hover:bg-[#FDE2DF] active:scale-95 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-slate-800 dark:hover:text-white md:inline-flex cursor-pointer"
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {performanceMetricCards.map(({ key, Icon, title, cardClass, iconClass, description }) => (
              <div key={key} className={`rounded-2xl border p-4 text-left shadow-xs ${cardClass}`}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${iconClass}`} />
                  <h4 className="text-sm font-black text-[#191116] dark:text-white leading-tight">
                    {title}
                  </h4>
                </div>
                <p className="text-justify text-xs leading-relaxed text-[#574D54] dark:text-slate-300">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Bottom Close Button */}
        <div className="fixed inset-x-0 bottom-0 z-[100000] border-t border-[#F0D7D3] bg-white/95 p-4 pb-[calc(16px+env(safe-area-inset-bottom))] backdrop-blur-md dark:border-white/10 dark:bg-[#080914]/95 md:hidden">
          <button
            type="button"
            onClick={onClose}
            className="light-force-white flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-xs font-black uppercase tracking-wider text-white shadow-md transition active:scale-95 dark:from-amber-100 dark:via-amber-300 dark:to-yellow-500 dark:text-slate-950 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
