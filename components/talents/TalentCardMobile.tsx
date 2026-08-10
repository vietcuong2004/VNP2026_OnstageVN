"use client";

import React, { useEffect, useMemo, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CalendarCheck, Check, CheckCircle2, Heart, Loader2, MapPin, Star, Trash2, UserPlus } from "lucide-react";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import BadgeTier, { getBackendBadgeConfig } from "@/components/ui/BadgeTier";
import {
  type TalentCardProps,
  getTalentTypes,
  getTalentTypeLabel,
  getStringList,
  getStatusLabel,
  getTalentPrimaryBadge,
} from "./TalentCard";

function getMockTalentStats(talent: any) {
  const key = String(talent?.id || talent?.slug || talent?.email || talent?.name || "idol");
  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }

  return {
    bookings: 72 + (hash % 164),
    goodReviews: 820 + ((hash >> 3) % 1380),
  };
}

export default function TalentCardMobile({
  talent,
  avatar,
  status = "maybe",
  isSaved = false,
  onToggleSaved,
  onView,
  onMessage,
  onRemoveFromBrand,
  viewLabel = "Xem",
  saveLabel,
  messageLabel = "Thêm vào danh sách quản lý",
  showMessageIcon = true,
  messageDisabled = false,
  messageLoading = false,
  showLifestyleServices = false,
  showSocialStats = false,
  className,
}: TalentCardProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const talentAvatar = avatar || talent?.avatar || createInitialAvatarDataUrl(talent?.name || "Idol", "");
  const locationText = [talent?.district, talent?.city].filter(Boolean).join(", ");
  const talentTypes = getTalentTypes(talent);
  const socialHighlights = getStringList(talent?.socialHighlights ?? talent?.social_highlights);
  const talentSkills = getStringList(talent?.skills ?? talent?.specialSkills);
  const profilePills = [...socialHighlights, ...talentSkills];
  const bioText = talent?.experience || talent?.bio || talent?.summary || talent?.description || talent?.introduction || "";
  const hasActions = Boolean(onView || onToggleSaved || onMessage);
  const talentBadgeSeed = talent?.id || talent?.slug || talent?.email || talent?.name;
  const primaryBadge = getTalentPrimaryBadge(talent);
  const tierBadge = getBackendBadgeConfig(primaryBadge, talent?.tier);
  const mockStats = useMemo(() => getMockTalentStats(talent), [talent]);

  const stopCardClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const handleBrandButtonClick = (event: MouseEvent) => {
    stopCardClick(event);
    if (messageLoading) return;

    if (messageDisabled) {
      setShowRemoveConfirm(true);
    } else {
      setShowAddConfirm(true);
    }
  };

  const closeModals = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowAddConfirm(false);
    setShowRemoveConfirm(false);
  };

  return (
    <article
      onClick={() => onView?.(talent)}
      className={cn(
        "group flex min-w-0 flex-col justify-between rounded-3xl border border-[#2B313D] bg-[#171A21] p-3 sm:p-4 shadow-xl transition-all duration-300 hover:border-[#C9A86A]/40",
        onView && "cursor-pointer active:scale-[0.99]",
        className
      )}
    >
      {/* ── ROW 1: TOP BAR (All 3 Pills Strictly on 1 Single Horizontal Line) ── */}
      <div className="mb-2.5 grid w-full grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-1 border-b border-white/5 pb-2">
        {/* Left: Badge Tier */}
        <div className="min-w-0">
          <BadgeTier
            badge={primaryBadge}
            tier={talent?.tier}
            seed={talentBadgeSeed}
            variant="gradient"
            size="xs"
            className="max-w-full whitespace-nowrap px-1.5 text-[8.5px] leading-none [&>svg]:h-3 [&>svg]:w-3"
          />
        </div>

        {/* Right: 2 Stat Pills on 1 Single Line */}
        <div className="contents">
          {/* 1. Lượt booking pill */}
          <div className="flex min-w-0 max-w-full items-center justify-center gap-1 rounded-full border border-amber-500/40 bg-[#16140e] px-1 py-0.5 shadow-sm">
            <CalendarCheck className="h-3 w-3 shrink-0 text-amber-400" />
            <span className="min-w-0 whitespace-nowrap text-[7.5px] font-black text-amber-300">
              {mockStats.bookings} lượt booking
            </span>
          </div>

          {/* 2. Đánh giá pill */}
          <div className="flex min-w-0 max-w-full items-center justify-center gap-1 rounded-full border border-purple-500/40 bg-[#191022] px-1.5 py-0.5 shadow-sm">
            <Star className="h-3.5 w-3.5 shrink-0 fill-purple-300 text-purple-300" />
            <span className="min-w-0 whitespace-nowrap text-[8.5px] font-black text-purple-300">
              {mockStats.goodReviews} đánh giá
            </span>
          </div>
        </div>
      </div>

      {/* ── ROW 2: MIDDLE SECTION (Compact Avatar on Left, Info on Right) ── */}
      <div className="flex flex-row gap-3 items-start min-w-0">
        {/* Left Column: Compact Avatar Image */}
        <div className="relative h-[95px] w-[95px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-md">
          <img
            src={talentAvatar}
            alt={talent?.name || "Idol"}
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = createInitialAvatarDataUrl(talent?.name || "Idol", "");
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Availability status badge inside image */}
          {status && status !== "maybe" && (
            <div className="absolute bottom-1 left-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded border bg-[#0F1115]/80 px-1 py-0.5 text-[7.5px] font-bold uppercase tracking-wider text-white backdrop-blur-sm",
                  status === "available" && "border-emerald-500/30 text-emerald-400",
                  status === "busy" && "border-red-500/30 text-red-400"
                )}
              >
                <span
                  className={cn(
                    "h-1 w-1 rounded-full",
                    status === "available" && "bg-emerald-400",
                    status === "busy" && "bg-red-400"
                  )}
                />
                {getStatusLabel(status)}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Name, Location, Types, Pills & Bio */}
        <div className="flex-1 min-w-0 space-y-1 text-left">
          {/* Name & Verified Badge */}
          <div className="flex items-center gap-1 flex-wrap">
            <h3 className="text-[13px] font-black leading-tight tracking-wide text-white drop-shadow-[0_1px_8px_rgba(255,255,255,0.12)]">
              {talent?.name}
            </h3>
            {talent?.verified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="h-3 w-3 shrink-0 text-[#C9A86A]" />
            <span className="truncate">{locationText || "Chưa cập nhật"}</span>
          </div>

          {/* Talent Types */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {talentTypes.length ? (
              talentTypes.slice(0, 3).map((type) => (
                <span key={type} className="inline-flex w-fit rounded-md border border-[#C9A86A]/30 bg-[#C9A86A]/10 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-[#C9A86A]">
                  {getTalentTypeLabel(type)}
                </span>
              ))
            ) : (
              <span className="inline-flex w-fit rounded-md border border-[#C9A86A]/30 bg-[#C9A86A]/10 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-[#C9A86A]">
                Chưa cập nhật
              </span>
            )}
          </div>

          {/* Skill Pills */}
          {profilePills.length > 0 && (
            <div className="flex flex-wrap gap-1 max-h-[42px] overflow-hidden pt-0.5">
              {profilePills.slice(0, 3).map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center rounded-lg border border-white/10 bg-[#222733] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-200"
                  title={pill}
                >
                  <span className="truncate max-w-[85px]">{pill}</span>
                </span>
              ))}
            </div>
          )}

          {/* Bio Description */}
          <p className="line-clamp-2 text-[10px] leading-relaxed text-slate-300 font-medium pt-0.5">
            {bioText || "Talent chuyên nghiệp. Rất mong được hợp tác"}
          </p>
        </div>
      </div>

      {/* ── ROW 3: BOTTOM ACTIONS (Đặt ngay & Lưu) ── */}
      {hasActions && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/5 pt-2.5">
          {/* Đặt ngay */}
          <button
            type="button"
            onClick={(e) => {
              stopCardClick(e);
              const targetId = talent?.id || talent?.slug || "talent-1";
              router.push(`/brand/talents/${targetId}/booking-talent`);
            }}
            className="flex min-h-[38px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-amber-500/50 bg-[#282110] px-3 text-center text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)] transition-all active:scale-95 hover:brightness-125"
            title="Đặt ngay dịch vụ của Idol"
          >
            <CalendarCheck className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span className="whitespace-nowrap text-[10px] font-black tracking-wider uppercase text-amber-300">
              ĐẶT NGAY
            </span>
          </button>

          {/* Lưu / Đã lưu */}
          {onToggleSaved ? (
            <button
              type="button"
              onClick={(event) => {
                stopCardClick(event);
                onToggleSaved(talent);
              }}
              className={cn(
                "flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-2xl px-3 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md",
                isSaved
                  ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  : "bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-110"
              )}
              title={isSaved ? "Bỏ lưu Idol" : "Lưu Idol"}
            >
              <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
              <span className="whitespace-nowrap">{saveLabel === "Lưu thông tin" ? "LƯU" : saveLabel?.toUpperCase() || (isSaved ? "ĐÃ LƯU" : "LƯU")}</span>
            </button>
          ) : onMessage ? (
            <button
              type="button"
              disabled={messageLoading}
              onClick={handleBrandButtonClick}
              className={cn(
                "flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-2xl px-3 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md",
                messageDisabled
                  ? "border border-[#C9A86A]/30 bg-[#C9A86A]/10 text-[#C9A86A] hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
                  : "bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-110"
              )}
            >
              {messageLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : messageDisabled ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#C9A86A]" />
              ) : (
                showMessageIcon && <UserPlus className="h-3.5 w-3.5" />
              )}
              <span className="truncate">{messageLabel?.toUpperCase()}</span>
            </button>
          ) : null}
        </div>
      )}

      {/* Dialog Modals */}
      {mounted && showAddConfirm && createPortal(
        <div
          onClick={closeModals}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-full max-w-sm rounded-2xl border border-[#2B313D] bg-[#171A21] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#C9A86A]/30 bg-[#C9A86A]/10 text-[#C9A86A]">
              <UserPlus className="h-6 w-6" />
            </div>
            <h3 className="text-center font-display text-base font-black uppercase tracking-wide text-white">
              Xác nhận thêm vào Quản lý Idol
            </h3>
            <p className="mt-2 text-center text-xs font-semibold leading-relaxed text-slate-300">
              Bạn có muốn thêm Idol này vào danh sách quản lý của bạn (Mục &quot;Quản lý Idol&quot;) để tiện theo dõi và giao việc?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModals}
                className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 active:scale-95 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={(e) => {
                  stopCardClick(e);
                  closeModals(e);
                  onMessage?.(talent);
                }}
                className="rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {mounted && showRemoveConfirm && createPortal(
        <div
          onClick={closeModals}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-full max-w-sm rounded-2xl border border-[#2B313D] bg-[#171A21] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-center font-display text-base font-black uppercase tracking-wide text-white">
              Xác nhận xóa khỏi Quản lý Idol
            </h3>
            <p className="mt-2 text-center text-xs font-semibold leading-relaxed text-slate-300">
              Bạn có chắc chắn muốn xóa Idol này khỏi danh sách quản lý?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModals}
                className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 active:scale-95 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={(e) => {
                  stopCardClick(e);
                  closeModals(e);
                  if (onRemoveFromBrand) {
                    onRemoveFromBrand(talent);
                  } else {
                    onMessage?.(talent);
                  }
                }}
                className="rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:brightness-110 active:scale-95 transition"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </article>
  );
}
