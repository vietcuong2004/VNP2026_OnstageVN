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
  requireConfirm = false,
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
  const isOwnTalent = Boolean(talent?.isOwner || talent?.is_owner || talent?.canBook === false || talent?.can_book === false);
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

    if (!requireConfirm) {
      if (messageDisabled) {
        onRemoveFromBrand ? onRemoveFromBrand(talent) : onMessage?.(talent);
      } else {
        onMessage?.(talent);
      }
      return;
    }

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
        "group flex min-w-0 flex-col justify-between rounded-3xl border border-[#F0D7D3] bg-white p-3 transition-all duration-300 hover:border-[#C72524]/45 dark:border-[#2B313D] dark:bg-[#171A21] dark:hover:border-[#C9A86A]/40 sm:p-4",
        onView && "cursor-pointer active:scale-[0.99]",
        className
      )}
    >
      {/* ── ROW 1: TOP BAR (All 3 Pills Strictly on 1 Single Horizontal Line) ── */}
      <div className="mb-2.5 grid w-full grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-1 border-b border-[#F4E1DE] pb-2 dark:border-white/5">
        {/* Left: Badge Tier */}
        <div className="min-w-0">
          <BadgeTier
            badge={primaryBadge}
            tier={talent?.tier}
            seed={talentBadgeSeed}
            variant="gradient"
            size="xs"
            className="talent-card-achievement max-w-full whitespace-nowrap px-1.5 text-[8.5px] leading-none [&>svg]:h-3 [&>svg]:w-3"
          />
        </div>

        {/* Right: 2 Stat Pills on 1 Single Line */}
        <div className="contents">
          {/* 1. Lượt booking pill */}
          <div className="flex min-w-0 max-w-full items-center justify-center gap-1 rounded-full border border-[#E9CFC5] bg-[#FFFDFB] px-1 py-0.5 text-[#A36C1D] dark:border-amber-500/40 dark:bg-[#16140e] dark:text-amber-300">
            <CalendarCheck className="h-3 w-3 shrink-0 text-[#A36C1D] dark:text-amber-400" />
            <span className="min-w-0 whitespace-nowrap text-[7.5px] font-black text-[#A36C1D] dark:text-amber-300">
              {mockStats.bookings} lượt booking
            </span>
          </div>

          {/* 2. Đánh giá pill */}
          <div className="flex min-w-0 max-w-full items-center justify-center gap-1 rounded-full border border-[#F1D5D8] bg-[#FFF7F8] px-1.5 py-0.5 text-[#C72524] dark:border-purple-500/40 dark:bg-[#191022] dark:text-purple-300">
            <Star className="h-3.5 w-3.5 shrink-0 fill-[#C72524] text-[#C72524] dark:fill-purple-300 dark:text-purple-300" />
            <span className="min-w-0 whitespace-nowrap text-[8.5px] font-black text-[#C72524] dark:text-purple-300">
              {mockStats.goodReviews} đánh giá
            </span>
          </div>
        </div>
      </div>

      {/* ── ROW 2: MIDDLE SECTION (Compact Avatar on Left, Info on Right) ── */}
      <div className="flex flex-row gap-3 items-start min-w-0">
        {/* Left Column: Compact Avatar Image */}
        <div className="relative h-[95px] w-[95px] shrink-0 overflow-hidden rounded-2xl border border-[#F1DBD7] bg-[#FFF7F5] dark:border-white/10 dark:bg-slate-900">
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
                  "inline-flex items-center gap-1 rounded border bg-white/90 px-1 py-0.5 text-[7.5px] font-bold uppercase tracking-wider text-[#191116] backdrop-blur-sm dark:bg-[#0F1115]/80 dark:text-white",
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
            <h3 className="text-[13px] font-black leading-tight tracking-wide text-[#191116] dark:text-white">
              {talent?.name}
            </h3>
            {talent?.verified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#C72524] dark:text-emerald-400" />}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-[#7B6866] dark:text-slate-400">
            <MapPin className="h-3 w-3 shrink-0 text-[#A36C1D] dark:text-[#C9A86A]" />
            <span className="truncate">{locationText || "Chưa cập nhật"}</span>
          </div>

          {/* Talent Types */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {talentTypes.length ? (
              talentTypes.slice(0, 3).map((type) => (
                <span key={type} className="inline-flex w-fit rounded-md border border-[#F1D8D4] bg-[#FFF7F6] px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-[#9B1215] dark:border-[#C9A86A]/30 dark:bg-[#C9A86A]/10 dark:text-[#C9A86A]">
                  {getTalentTypeLabel(type)}
                </span>
              ))
            ) : (
              <span className="inline-flex w-fit rounded-md border border-[#F1D8D4] bg-[#FFF7F6] px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-[#9B1215] dark:border-[#C9A86A]/30 dark:bg-[#C9A86A]/10 dark:text-[#C9A86A]">
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
                  className="inline-flex items-center rounded-lg border border-[#F1D8D4] bg-[#FFF9F8] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#9B1215] dark:border-white/10 dark:bg-[#222733] dark:text-slate-200"
                  title={pill}
                >
                  <span className="truncate max-w-[85px]">{pill}</span>
                </span>
              ))}
            </div>
          )}

          {/* Bio Description */}
          <p className="line-clamp-2 pt-0.5 text-[10px] font-medium leading-relaxed text-[#5F5554] dark:text-slate-300">
            {bioText || "Talent chuyên nghiệp. Rất mong được hợp tác"}
          </p>
        </div>
      </div>

      {/* ── ROW 3: BOTTOM ACTIONS (Đặt ngay & Lưu) ── */}
      {hasActions && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#F4E1DE] pt-2.5 dark:border-white/5">
          {/* Đặt ngay */}
          <button
            type="button"
            onClick={(e) => {
              stopCardClick(e);
              if (isOwnTalent) return;
              const targetId = talent?.profileId || talent?.profile_id || talent?.id || talent?.slug;
              if (!targetId) return;
              router.push(`/booking?talentId=${encodeURIComponent(String(targetId))}`);
            }}
            disabled={isOwnTalent}
            className="flex min-h-[38px] w-full cursor-pointer items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50 rounded-2xl border border-[#D8A8A3] bg-[#FFF7F6] px-3 text-center text-[#C72524] transition-all hover:border-[#C72524]/55 hover:bg-[#FFF1EF] active:scale-95 dark:border-amber-500/50 dark:bg-[#282110] dark:text-amber-300 dark:hover:brightness-125"
            title="Đặt ngay dịch vụ của Idol"
          >
            <CalendarCheck className="h-3.5 w-3.5 shrink-0 text-[#C72524] dark:text-amber-400" />
            <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-wider text-[#C72524] dark:text-amber-300">
              ĐẶT NGAY
            </span>
          </button>

          {/* Lưu / Đã lưu */}
          {onToggleSaved ? (
            <button
              type="button"
              onClick={(event) => {
                stopCardClick(event);
                if (isOwnTalent) return;
                onToggleSaved(talent);
              }}
              disabled={isOwnTalent}
              className={cn(
                "flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-2xl px-3 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer",
                isSaved
                  ? "light-force-white border border-[#C72524]/55 bg-[#C72524] text-white hover:bg-[#A40E10] dark:border-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30"
                  : "light-force-white bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-white hover:brightness-110 dark:from-yellow-200 dark:via-amber-400 dark:to-yellow-500 dark:text-slate-950"
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
                "flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-2xl px-3 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer",
                messageDisabled
                  ? "border border-[#D8A8A3] bg-[#FFF7F6] text-[#C72524] hover:border-[#C72524]/55 hover:bg-[#FFF1EF] dark:border-[#C9A86A]/30 dark:bg-[#C9A86A]/10 dark:text-[#C9A86A] dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                  : "light-force-white bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-white hover:brightness-110 dark:from-yellow-200 dark:via-amber-400 dark:to-yellow-500 dark:text-slate-950"
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
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-full max-w-sm rounded-3xl border border-[#F0D7D3] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left text-[#191116]"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709]">
              <UserPlus className="h-6 w-6" />
            </div>
            <h3 className="text-center font-display text-base font-black uppercase tracking-wide text-[#8F0709]">
              Xác nhận thêm vào Quản lý Idol
            </h3>
            <p className="mt-2 text-center text-xs font-semibold leading-relaxed text-[#574D54]">
              Bạn có muốn thêm Idol này vào danh sách quản lý của bạn (Mục &quot;Quản lý Idol&quot;) để tiện theo dõi và giao việc?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModals}
                className="rounded-2xl border border-[#F0D7D3] bg-white px-4 py-2.5 text-xs font-bold text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] active:scale-95 transition shadow-xs"
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
                className="light-force-white rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-4 py-2.5 text-xs font-black uppercase tracking-wider !text-white text-white shadow-md hover:brightness-110 active:scale-95 transition"
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
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-full max-w-sm rounded-3xl border border-red-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left text-[#191116]"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-center font-display text-base font-black uppercase tracking-wide text-red-600">
              Xác nhận xóa khỏi Quản lý Idol
            </h3>
            <p className="mt-2 text-center text-xs font-semibold leading-relaxed text-[#574D54]">
              Bạn có chắc chắn muốn xóa Idol này khỏi danh sách quản lý?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModals}
                className="rounded-2xl border border-[#F0D7D3] bg-white px-4 py-2.5 text-xs font-bold text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] active:scale-95 transition shadow-xs"
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
                className="light-force-white rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-xs font-black uppercase tracking-wider !text-white text-white shadow-md hover:brightness-110 active:scale-95 transition"
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
