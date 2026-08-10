"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingRequest, BookingStatus } from "./types";
import BookingCard from "./BookingCard";
import BookingDetailModal from "./BookingDetailModal";

const MOCK_BOOKINGS: BookingRequest[] = [
  {
    id: "PG100826-001",
    talentId: "talent-1",
    talentName: "An An là Mặt trời nhỏ",
    talentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    talentRole: "PG/PB",
    campaignTitle: "Sự kiện Khai trương Volvo Showroom Hà Nội",
    workDate: "2026-08-26",
    startTime: "18:00",
    endTime: "22:00",
    location: "Hai Bà Trưng, Hà Nội",
    depositAmount: 200000,
    totalBudget: 2500000,
    contactName: "Nguyễn Văn Thương",
    contactPhone: "0988123456",
    contactEmail: "contact@brand.com",
    notes: "Yêu cầu trang phục đầm dạ hội đen sang trọng.",
    status: "pending",
    createdAt: "2026-08-10T10:15:00Z",
  },
  {
    id: "MC202608-002",
    talentId: "talent-2",
    talentName: "Bảo Ngọc MC",
    talentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
    talentRole: "MC",
    campaignTitle: "Hội thảo Giải pháp AI & Công nghệ 2026",
    workDate: "2026-09-02",
    startTime: "08:30",
    endTime: "12:00",
    location: "Quận 1, TP. Hồ Chí Minh",
    depositAmount: 500000,
    totalBudget: 5000000,
    contactName: "Trần Minh Đức",
    contactPhone: "0912345678",
    contactEmail: "duc.tran@agency.vn",
    notes: "MC Song ngữ Việt - Anh, điều phối chương trình ra mắt sản phẩm.",
    status: "approved",
    createdAt: "2026-08-08T14:20:00Z",
  },
  {
    id: "LB202608-003",
    talentId: "talent-3",
    talentName: "Hà My Lookbook",
    talentAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400",
    talentRole: "Lookbook",
    campaignTitle: "Bộ sưu tập Thời trang Thu Đông Premium 2026",
    workDate: "2026-08-18",
    startTime: "09:00",
    endTime: "17:00",
    location: "Studio 88, Cầu Giấy, Hà Nội",
    depositAmount: 300000,
    totalBudget: 3800000,
    contactName: "Phạm Hải Đăng",
    contactPhone: "0977888999",
    contactEmail: "fashion@brand.vn",
    notes: "Chụp 15 bộ trang phục thời trang nữ cao cấp.",
    status: "completed",
    createdAt: "2026-08-01T09:00:00Z",
  },
];

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "completed", label: "Hoàn thành" },
];

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("brand_my_bookings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map((item: any) => {
            let status: BookingStatus = "pending";
            if (item.status === "completed") status = "completed";
            else if (item.status === "approved" || item.status === "talent_accepted") status = "approved";
            else status = "pending";
            return { ...item, status };
          });
          setBookings(normalized);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setBookings(MOCK_BOOKINGS);
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      const matchesTab = activeTab === "all" || item.status === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.talentName.toLowerCase().includes(q) ||
        item.campaignTitle.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [bookings, activeTab, searchQuery]);

  return (
    <div className="space-y-4 pb-20">
      {/* ── MOBILE-ONLY STICKY TOP SEARCH HEADER (Hidden on Desktop) ── */}
      <section className="block md:hidden sticky top-0 z-40 bg-[#070913]/95 backdrop-blur-md space-y-3 pt-3.5 pb-2.5 border-b border-white/5 -mx-4 px-4">
        {/* Row 1: Search Input Box & Back Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A86A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập mã đơn..."
              className="w-full h-9.5 rounded-full border border-white/10 bg-slate-950/80 pl-9.5 pr-8 text-xs font-semibold text-white outline-none focus:border-[#C9A86A]/60 placeholder:text-slate-500 transition shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full border border-[#C9A86A]/50 bg-[#C9A86A]/15 text-[#C9A86A] transition-all hover:bg-[#C9A86A]/20 active:scale-95 cursor-pointer shadow-md"
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Row 2: Quick Status Tabs */}
        <div className="relative flex-1 min-w-0">
          <div className="flex gap-2 overflow-x-auto pb-0.5 pr-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "h-8 shrink-0 rounded-full border px-3.5 text-[11px] font-black transition active:scale-95 cursor-pointer whitespace-nowrap",
                    isActive
                      ? "border-[#C9A86A]/70 bg-[#C9A86A]/15 text-[#F9D66D] shadow-[0_0_14px_rgba(201,168,106,0.14)]"
                      : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-[#C9A86A]/35 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-[#050711] via-[#050711]/90 to-transparent pl-4 pr-0">
            <ChevronRight className="h-4 w-4 animate-pulse text-[#C9A86A]/80" />
          </div>
        </div>
      </section>

      {/* ── DESKTOP SEARCH HEADER CARD (Clean, Static, Non-floating) ── */}
      <section className="hidden md:block rounded-3xl border border-white/10 bg-[#171A21] p-5 shadow-xl space-y-4 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-xl lg:text-2xl font-black uppercase text-white tracking-wide">
              Quản lý Booking
            </h1>
            <p className="text-xs text-slate-400 font-semibold">
              Theo dõi đơn đặt cọc, thông tin người đặt và tiến độ làm việc của Idol.
            </p>
          </div>

          {/* Desktop Search Box */}
          <div className="relative w-72 lg:w-96">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A86A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập mã đơn, tên idol..."
              className="w-full h-10 rounded-full border border-white/10 bg-slate-950/80 pl-9.5 pr-8 text-xs font-semibold text-white outline-none focus:border-[#C9A86A]/60 placeholder:text-slate-500 transition shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Status Tabs */}
        <div className="flex items-center gap-2 border-t border-white/5 pt-3">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "h-9 rounded-2xl border px-4 text-xs font-black transition active:scale-95 cursor-pointer whitespace-nowrap",
                  isActive
                    ? "border-[#C9A86A]/70 bg-[#C9A86A]/15 text-[#F9D66D] shadow-md"
                    : "border-white/10 bg-slate-900/60 text-slate-300 hover:border-[#C9A86A]/35 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── BOOKING CARDS LIST ── */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center">
          <CalendarCheck className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white uppercase tracking-wide">Chưa tìm thấy đơn booking nào</h3>
          <p className="mt-1 text-xs text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc chọn tab trạng thái khác.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:gap-4 pt-1">
          {filteredBookings.map((item) => (
            <BookingCard
              key={item.id}
              item={item}
              onSelect={setSelectedBooking}
            />
          ))}
        </div>
      )}

      {/* ── FULL SCREEN DETAIL MODAL ── */}
      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}
