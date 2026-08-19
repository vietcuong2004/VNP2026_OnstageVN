"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarCheck,
  ChevronRight,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuthToken } from "@/lib/api-client";
import { deleteBrandBooking, loadBrandBookings } from "@/lib/brand-api";
import { BookingRequest, BookingStatus } from "./types";
import BookingCard from "./BookingCard";
import BookingDetailModal from "./BookingDetailModal";

type StoredBookingRecord = Omit<Partial<BookingRequest>, "status"> & {
  status?: string | null;
};

const STATUS_TABS: Array<{ value: "all" | BookingStatus; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "deposit_pending", label: "Chờ cọc" },
  { value: "submitted", label: "Chờ kiểm tra" },
  { value: "reviewing", label: "Đang xử lý" },
  { value: "talent_confirming", label: "Chờ Idol" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "rejected", label: "Từ chối" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "completed", label: "Hoàn tất" },
];

function normalizeStoredBookingStatus(status?: string | null): BookingStatus {
  switch (status) {
    case "submitted":
    case "reviewing":
    case "talent_confirming":
    case "confirmed":
    case "rejected":
    case "cancelled":
    case "completed":
      return status;
    case "approved":
    case "talent_accepted":
      return "confirmed";
    case "pending":
    default:
      return "deposit_pending";
  }
}

function normalizeBookingCode(value?: string | null) {
  return String(value || "").trim().replace(/^#+/, "");
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [pendingDeleteBooking, setPendingDeleteBooking] = useState<BookingRequest | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadStoredBookings = (): BookingRequest[] => {
      try {
        const stored = localStorage.getItem("brand_my_bookings");
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];

        return parsed
          .filter((item: unknown): item is StoredBookingRecord => Boolean(item) && typeof item === "object")
          .map((item) => ({
            ...item,
            id: normalizeBookingCode(item.id),
            status: normalizeStoredBookingStatus(item.status),
          }) as BookingRequest);
      } catch (e) {
        console.error(e);
        return [];
      }
    };

    const mergeBookings = (primary: BookingRequest[], fallback: BookingRequest[]) => {
      const seen = new Set<string>();
      return [...primary, ...fallback].filter((item) => {
        const id = String(item.id || "");
        if (!id || seen.has(id)) return false;

        seen.add(id);
        return true;
      });
    };

    if (getAuthToken()) {
      loadBrandBookings()
        .then((items) => {
          if (!cancelled) setBookings(mergeBookings(items, loadStoredBookings()));
        })
        .catch((error) => {
          console.error(error);
          if (!cancelled) setBookings(loadStoredBookings());
        });

      return () => {
        cancelled = true;
      };
    }

    const storedBookings = loadStoredBookings();
    queueMicrotask(() => {
      if (!cancelled) setBookings(storedBookings);
    });

    return () => {
      cancelled = true;
    };
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

  const removeStoredBooking = (bookingId: string) => {
    try {
      const stored = localStorage.getItem("brand_my_bookings");
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;

      localStorage.setItem(
        "brand_my_bookings",
        JSON.stringify(parsed.filter((item: { id?: string }) => normalizeBookingCode(item?.id) !== bookingId)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleRequestDeleteBooking = (item: BookingRequest) => {
    setPendingDeleteBooking(item);
  };

  const handleConfirmDeleteBooking = async () => {
    const item = pendingDeleteBooking;
    if (!item) return;
    setDeletingBookingId(item.id);

    try {
      if (item.backendId) {
        await deleteBrandBooking(item.backendId);
      }

      setBookings((current) => current.filter((booking) => booking.id !== item.id));
      removeStoredBooking(item.id);
      if (selectedBooking?.id === item.id) setSelectedBooking(null);
      setPendingDeleteBooking(null);
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : "Không thể xóa đơn booking. Vui lòng thử lại.");
    } finally {
      setDeletingBookingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* ── MOBILE-ONLY STICKY TOP SEARCH HEADER (Hidden on Desktop) ── */}
      <section className="block md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md space-y-3 pt-3.5 pb-2.5 border-b border-[#F0D7D3] -mx-4 px-4 dark:bg-[#070913]/95 dark:border-white/5">
        {/* Row 1: Search Input Box & Back Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F0709] dark:text-[#C9A86A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập mã đơn..."
              className="w-full h-9.5 rounded-full border border-[#F0D7D3] bg-white pl-9.5 pr-8 text-xs font-semibold text-[#191116] outline-none focus:border-[#8F0709] placeholder:text-[#9A8B88] transition shadow-sm dark:border-white/10 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#C9A86A]/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8B88] hover:text-[#8F0709] dark:text-slate-400 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] transition-all hover:bg-[#FFE5E2] active:scale-95 cursor-pointer shadow-sm dark:border-[#C9A86A]/50 dark:bg-[#C9A86A]/15 dark:text-[#C9A86A]"
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
                      ? "border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] shadow-sm dark:border-[#C9A86A]/70 dark:bg-[#C9A86A]/15 dark:text-[#F9D66D]"
                      : "border-[#F0D7D3] bg-white text-[#574D54] hover:border-[#8F0709] hover:text-[#8F0709] shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-[#C9A86A]/35 dark:hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-[#FAF7F6] via-[#FAF7F6]/90 to-transparent pl-4 pr-0 dark:from-[#050711] dark:via-[#050711]/90">
            <ChevronRight className="h-4 w-4 animate-pulse text-[#8F0709]/80 dark:text-[#C9A86A]/80" />
          </div>
        </div>
      </section>

      {/* ── DESKTOP SEARCH HEADER CARD (Clean, Static, Non-floating) ── */}
      <section className="hidden md:block rounded-3xl border border-[#F0D7D3] bg-white p-5 shadow-sm space-y-4 mb-4 dark:border-white/10 dark:bg-[#171A21]">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-xl lg:text-2xl font-black uppercase text-[#191116] tracking-wide dark:text-white">
              Yêu cầu của tôi
            </h1>
            <p className="text-xs text-[#574D54] font-semibold dark:text-slate-400">
              Theo dõi đơn đặt cọc, thông tin người đặt và tiến độ làm việc của Idol.
            </p>
          </div>

          {/* Desktop Search Box */}
          <div className="relative w-72 lg:w-96">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F0709] dark:text-[#C9A86A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập mã đơn, tên idol..."
              className="w-full h-10 rounded-full border border-[#F0D7D3] bg-white pl-9.5 pr-8 text-xs font-semibold text-[#191116] outline-none focus:border-[#8F0709] placeholder:text-[#9A8B88] transition shadow-sm dark:border-white/10 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#C9A86A]/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8B88] hover:text-[#8F0709] dark:text-slate-400 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Status Tabs */}
        <div className="flex items-center gap-2 border-t border-[#F0D7D3] pt-3 dark:border-white/5">
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
                    ? "border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] shadow-sm dark:border-[#C9A86A]/70 dark:bg-[#C9A86A]/15 dark:text-[#F9D66D]"
                    : "border-[#F0D7D3] bg-white text-[#574D54] hover:border-[#8F0709] hover:text-[#8F0709] shadow-sm dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-[#C9A86A]/35 dark:hover:text-white"
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
        <div className="rounded-3xl border border-[#F0D7D3] bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-slate-900/60">
          <CalendarCheck className="mx-auto h-12 w-12 text-[#8F0709] mb-3 dark:text-slate-600" />
          <h3 className="text-base font-bold text-[#191116] uppercase tracking-wide dark:text-white">Chưa tìm thấy đơn booking nào</h3>
          <p className="mt-1 text-xs text-[#574D54] dark:text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc chọn tab trạng thái khác.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:gap-4 pt-1">
          {filteredBookings.map((item) => (
            <BookingCard
              key={item.id}
              item={item}
              onSelect={setSelectedBooking}
              onDelete={handleRequestDeleteBooking}
              isDeleting={deletingBookingId === item.id}
            />
          ))}
        </div>
      )}

      {/* ── FULL SCREEN DETAIL MODAL ── */}
      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />

      {pendingDeleteBooking && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-booking-dialog-title"
          onClick={() => {
            if (!deletingBookingId) setPendingDeleteBooking(null);
          }}
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#191116]/65 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-[#F0D7D3] bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#171A21]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 id="delete-booking-dialog-title" className="text-base font-black text-[#191116] dark:text-white">
                  Xác nhận xóa đơn
                </h3>
                <p className="mt-1 text-xs font-medium leading-5 text-[#574D54] dark:text-slate-300">
                  Bạn có chắc muốn xóa đơn <strong className="text-[#8F0709] dark:text-amber-300">{pendingDeleteBooking.id}</strong>? Hành động này sẽ xóa đơn khỏi danh sách booking.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDeleteBooking(null)}
                disabled={Boolean(deletingBookingId)}
                className="h-10 rounded-2xl border border-[#F0D7D3] bg-white px-4 text-xs font-black text-[#574D54] transition hover:border-[#8F0709] hover:text-[#8F0709] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBooking}
                disabled={Boolean(deletingBookingId)}
                style={{ color: "#ffffff" }}
                className="light-force-white flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-4 text-xs font-black !text-white text-white shadow-md transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5 stroke-[3] !text-white text-white" />
                <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">
                  {deletingBookingId ? "Đang xóa" : "Xóa"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
