"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BookingFlow from "@/app/brand/talents/[id]/booking-talent/BookingFlow";
import { Sparkles } from "lucide-react";

function BookingContent() {
  const searchParams = useSearchParams();
  const talentIdParam = searchParams?.get("talentId") || "";

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 pb-20 pt-6 px-4 md:px-8">
      {/* ── Top Header ── */}
      <div className="max-w-4xl mx-auto mb-8 text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-300">
          <Sparkles className="h-3.5 w-3.5" /> LUỒNG ĐẶT IDOL TRỰC TIẾP
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
          Quy trình Booking Nhanh
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Không cần đăng nhập phức tạp — Hoàn tất thông tin đặt hẹn dịch vụ chỉ trong vài bước đơn giản.
        </p>
      </div>

      <BookingFlow />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070913] flex items-center justify-center text-amber-400 text-xs font-bold uppercase">
        Đang tải trang Booking...
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
