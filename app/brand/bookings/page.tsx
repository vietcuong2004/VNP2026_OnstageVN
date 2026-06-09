"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookmarkCheck, CalendarDays, MapPin, ReceiptText, Send, WalletCards } from "lucide-react";
import { loadBrandBookings } from "@/lib/brand-api";
import { cn } from "@/lib/utils";

type BookingItem = Awaited<ReturnType<typeof loadBrandBookings>>[number];

function statusText(status: string) {
  if (status === "confirmed") return "Đã xác nhận";
  if (status === "cancelled") return "Đã hủy";
  if (status === "completed") return "Hoàn thành";
  return "Đang chờ";
}

function paymentText(status: string) {
  if (status === "paid") return "Đã thanh toán";
  if (status === "refunded") return "Đã hoàn tiền";
  return "Chưa thanh toán";
}

function displayDate(value: string) {
  if (!value) return "Chưa cập nhật";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BrandBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrandBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  if (!loading && bookings.length === 0) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="max-w-lg rounded-2xl border border-white/5 bg-slate-950/30 p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-300">
            <Send className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black text-white">Chưa có booking nào</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Khi brand tạo booking với talent, dữ liệu sẽ hiển thị tại đây từ backend.
          </p>
          <button
            onClick={() => router.push("/brand/shortlists")}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-5 text-xs font-black uppercase tracking-wider text-slate-950"
          >
            <BookmarkCheck className="mr-2 h-4 w-4" />
            Mở Shortlist
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <section className="flex flex-col gap-4 border-b border-white/5 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
              BOOKING
            </span>
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight text-white">
            LỊCH BOOKING <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent">ĐÃ TẠO</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Theo dõi booking brand đã gửi cho talent, trạng thái xử lý và thanh toán.
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/30 px-4 py-3">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Tổng booking</span>
          <span className="text-lg font-black text-white">{loading ? "..." : bookings.length}</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {(loading ? [] : bookings).map((booking) => (
          <article key={booking.id} className="rounded-2xl border border-white/5 bg-slate-950/25 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-black text-white">{booking.campaignTitle}</h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">{booking.talentName}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded px-2 py-1 text-[9px] font-black uppercase",
                  booking.status === "confirmed"
                    ? "bg-emerald-500/10 text-emerald-300"
                    : booking.status === "cancelled"
                      ? "bg-rose-500/10 text-rose-300"
                      : "bg-amber-500/10 text-amber-300"
                )}
              >
                {statusText(booking.status)}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-amber-300" />
                <span>{displayDate(booking.startsAt)} - {displayDate(booking.endsAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-300" />
                <span>{booking.location || "Chưa cập nhật địa điểm"}</span>
              </div>
              <div className="flex items-center gap-2">
                <WalletCards className="h-4 w-4 text-amber-300" />
                <span>{booking.amountText}</span>
              </div>
              <div className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-amber-300" />
                <span>{paymentText(booking.paymentStatus)}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
