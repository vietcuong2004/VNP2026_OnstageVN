"use client";

import React, { useEffect, useMemo, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Star, Trash2, UserPlus } from "lucide-react";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import BadgeTier, { getPrimaryAchievementBadge } from "@/components/ui/BadgeTier";
import {
  type TalentCardProps,
  getTalentTypes,
  getTalentTypeLabel,
  getStringList,
  getStatusLabel,
} from "./TalentCard";

function formatFollowers(value: number) {
  if (value >= 1000000) return `${Number((value / 1000000).toFixed(1))}M`;
  if (value >= 1000) return `${Number((value / 1000).toFixed(0))}K`;
  return String(value);
}

function getMockTalentStats(talent: any) {
  const key = String(talent?.id || talent?.slug || talent?.email || talent?.name || "idol");
  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }

  return {
    bookings: 72 + (hash % 164),
    goodReviews: 80 + ((hash >> 3) % 250),
    rating: Number((4.6 + ((hash % 4) * 0.1)).toFixed(1)),
  };
}

interface SocialItem {
  key: string;
  icon: string;
  name: string;
  formatted: string | null;
}

function getSocialAccountsList(talent: any): SocialItem[] {
  const validPlatforms = [
    { key: "tiktok", name: "TikTok", icon: "/social/tiktok.png" },
    { key: "instagram", name: "Instagram", icon: "/social/instagram.png" },
    { key: "youtube", name: "YouTube", icon: "/social/youtube.png" },
    { key: "facebook", name: "Facebook", icon: "/social/facebook.png" },
    { key: "threads", name: "Threads", icon: "/social/threads.png" },
  ];

  const rawList: any[] = [];

  if (Array.isArray(talent?.socialAccounts) && talent.socialAccounts.length > 0) {
    rawList.push(...talent.socialAccounts);
  } else if (Array.isArray(talent?.social_accounts) && talent.social_accounts.length > 0) {
    rawList.push(...talent.social_accounts);
  }

  // Also check legacy fields on talent if rawList is empty
  const legacyKeys = [
    { key: "tiktok", name: "TikTok" },
    { key: "instagram", name: "Instagram" },
    { key: "youtube", name: "YouTube" },
    { key: "facebook", name: "Facebook" },
    { key: "threads", name: "Threads" },
    { key: "thread", name: "Threads" },
  ];

  for (const item of legacyKeys) {
    if (talent?.[item.key] && typeof talent[item.key] === "string" && talent[item.key].trim()) {
      const normalizedKey = item.key === "thread" ? "threads" : item.key;
      if (!rawList.some((acc) => String(acc?.platform || acc?.platform_key || "").toLowerCase().includes(normalizedKey))) {
        rawList.push({
          platform: item.name,
          url: talent[item.key],
          followers_count: talent[`${item.key}_followers`] || talent[`${item.key}Followers`] || talent?.followers_count || 0,
        });
      }
    }
  }

  if (rawList.length === 0) {
    return [];
  }

  const seenKeys = new Set<string>();
  const mapped: SocialItem[] = [];

  for (const acc of rawList) {
    const platformStr = String(acc.platform || acc.platform_key || "").toLowerCase().trim();
    const matched = validPlatforms.find((p) => platformStr.includes(p.key) || (p.key === "threads" && platformStr.includes("thread")));
    if (!matched) continue;
    if (seenKeys.has(matched.key)) continue;
    seenKeys.add(matched.key);

    const followers = Number(acc.followers_count ?? acc.follower_count ?? acc.followers ?? acc.followersCount ?? 0);
    mapped.push({
      key: matched.key,
      icon: matched.icon,
      name: matched.name,
      formatted: followers > 0 ? formatFollowers(followers) : null,
    });
  }

  return mapped.slice(0, 4);
}

function getTalentCategoryTags(talent: any): string {
  const types = getTalentTypes(talent).map(getTalentTypeLabel);
  const socialHighlights = getStringList(talent?.socialHighlights ?? talent?.social_highlights);
  const talentSkills = getStringList(talent?.skills ?? talent?.specialSkills);

  const allTags = Array.from(new Set([...types, ...socialHighlights, ...talentSkills]))
    .filter(Boolean)
    .map((tag) => String(tag).replace(/_/g, " "));

  if (allTags.length > 0) {
    return allTags.slice(0, 3).join(" · ");
  }
  return "Lifestyle · Travel · Review";
}

function getCleanCity(talent: any): string {
  const rawCity = String(talent?.city || talent?.province || talent?.location || "Hà Nội").trim();
  const cleaned = rawCity
    .replace(/^(Thành phố|Tỉnh|TP\.?)\s+/i, "")
    .trim();
  return cleaned || "Hà Nội";
}

function YellowVerifiedBadge({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      className={cn(
        "talent-card-mobile-verified inline-flex items-center justify-center shrink-0 rounded-full bg-[#EAB308] text-slate-950 p-0.5 shadow-xs",
        className
      )}
      style={{ backgroundColor: "#EAB308", color: "#09090b" }}
      title="Đã xác thực"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5" style={{ stroke: "#09090b", color: "#09090b" }}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
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
  messageDisabled = false,
  messageLoading = false,
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

  const talentAvatar = talent?.fullBodyImage || talent?.cover || avatar || talent?.avatar || createInitialAvatarDataUrl(talent?.name || "Idol", "");
  const locationText = getCleanCity(talent);
  const primaryBadge = useMemo(() => getPrimaryAchievementBadge(talent), [talent]);
  const mockStats = useMemo(() => getMockTalentStats(talent), [talent]);
  const ratingValue = Number(talent?.rating || mockStats.rating).toFixed(1);
  const reviewsCount = talent?.reviewsCount || talent?.completedJobs || mockStats.goodReviews;
  const isOwnTalent = Boolean(talent?.isOwner || talent?.is_owner || talent?.canBook === false || talent?.can_book === false);
  const categoryTags = useMemo(() => getTalentCategoryTags(talent), [talent]);
  const socialList = useMemo(() => getSocialAccountsList(talent), [talent]);

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
        "group relative aspect-[3/4.6] w-full min-w-0 overflow-hidden rounded-2xl md:rounded-3xl border border-black/10 bg-slate-950 shadow-md transition-all duration-300 hover:shadow-xl active:scale-[0.99] select-none cursor-pointer dark:border-white/10",
        className
      )}
    >
      {/* ── BACKGROUND FULL-BLEED IMAGE ── */}
      <img
        src={talentAvatar}
        alt={talent?.name || "Idol"}
        loading="lazy"
        decoding="async"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = createInitialAvatarDataUrl(talent?.name || "Idol", "");
        }}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* ── SMOOTH BOTTOM DARK GRADIENT OVERLAY (ONLY AT BOTTOM INFO AREA) ── */}
      <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-black/90 via-black/55 to-transparent pointer-events-none" />

      {/* ── TOP HEADER: STATUS (LEFT) + HEART BUTTON (RIGHT) ── */}
      <div className="absolute inset-x-2.5 top-2.5 z-20 flex items-center justify-between gap-1.5 pointer-events-none">
        {/* Left: Status */}
        <div className="flex items-center pointer-events-auto">
          {status && status !== "maybe" && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm max-w-full truncate",
                status === "available" && "border-emerald-500/40 bg-emerald-950/75 text-emerald-300",
                status === "busy" && "border-red-500/40 bg-red-950/75 text-red-300"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full animate-pulse",
                  status === "available" && "bg-emerald-400",
                  status === "busy" && "bg-red-400"
                )}
              />
              <span className="truncate">{getStatusLabel(status)}</span>
            </span>
          )}
        </div>

        {/* Right: Heart / Save Button */}
        <button
          type="button"
          onClick={(event) => {
            stopCardClick(event);
            if (isOwnTalent) return;
            if (onToggleSaved) {
              onToggleSaved(talent);
            } else if (onRemoveFromBrand && messageDisabled) {
              onRemoveFromBrand(talent);
            } else if (onMessage) {
              handleBrandButtonClick(event);
            }
          }}
          disabled={isOwnTalent}
          className={cn(
            "pointer-events-auto shrink-0 flex h-7.5 w-7.5 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-xs transition-all active:scale-90 hover:scale-105 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            isSaved ? "text-rose-500" : "text-slate-900"
          )}
          title={isSaved ? "Bỏ lưu Idol" : "Lưu Idol"}
        >
          <Heart className={cn("h-4 w-4", isSaved ? "fill-rose-500 text-rose-500" : "stroke-[2.4]")} />
        </button>
      </div>

      {/* ── BOTTOM OVERLAY CONTENT ── */}
      <div className="talent-card-mobile-overlay absolute inset-x-0 bottom-0 z-10 p-2 sm:p-2.5 flex flex-col justify-end gap-0.5 sm:gap-1 text-left min-w-0">
        {/* ROW 1: Name + Yellow Verified Badge */}
        <div className="flex items-center gap-1 min-w-0 h-5">
          <h3
            className="talent-card-mobile-white font-['Inter','Be_Vietnam_Pro',sans-serif] text-[13px] sm:text-[14px] font-medium leading-none tracking-normal truncate"
            style={{ color: "rgba(255, 255, 255, 0.88)", WebkitTextFillColor: "rgba(255, 255, 255, 0.88)" }}
            title={talent?.name || "Idol"}
          >
            {talent?.name || "Idol"}
          </h3>
          {(talent?.verified !== false) && (
            <YellowVerifiedBadge className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
          )}
        </div>

        {/* ROW 2: Categories / Tags (Lifestyle · Travel · Review) */}
        <div className="flex items-center min-w-0 h-3.5 sm:h-4">
          <p
            className="talent-card-mobile-muted font-['Inter','Be_Vietnam_Pro',sans-serif] text-[9px] sm:text-[10px] font-normal leading-none truncate w-full"
            style={{ color: "rgba(255, 255, 255, 0.60)", WebkitTextFillColor: "rgba(255, 255, 255, 0.60)" }}
            title={categoryTags}
          >
            {categoryTags}
          </p>
        </div>

        {/* ROW 3: Social Media Followers list OR "Chưa cập nhật MXH" */}
        <div className="flex items-center justify-start min-w-0 h-4.5 w-full">
          {socialList.length > 0 ? (
            <div className="flex items-center justify-start gap-1.5 sm:gap-2 overflow-hidden w-full">
              {socialList.map((acc, index) => (
                <div
                  key={`${acc.key}-${index}`}
                  className={cn(
                    "flex items-center gap-0.5 shrink-0",
                    index >= 3 && "max-[330px]:hidden"
                  )}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden">
                    <img
                      src={acc.icon}
                      alt={acc.name}
                      className="h-3.5 w-3.5 object-contain opacity-100"
                      loading="lazy"
                    />
                  </span>
                  {acc.formatted && (
                    <span
                      className="talent-card-mobile-white font-['Inter',sans-serif] text-[8px] min-[350px]:text-[8.5px] sm:text-[9px] font-normal tracking-tight leading-none"
                      style={{ color: "rgba(255, 255, 255, 0.65)", WebkitTextFillColor: "rgba(255, 255, 255, 0.65)" }}
                    >
                      {acc.formatted}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <span
              className="talent-card-mobile-subtle font-['Inter',sans-serif] text-[8.5px] sm:text-[9.5px] font-normal tracking-tight leading-none italic"
              style={{ color: "rgba(255, 255, 255, 0.48)", WebkitTextFillColor: "rgba(255, 255, 255, 0.48)" }}
            >
              Chưa cập nhật MXH
            </span>
          )}
        </div>

        {/* ROW 4: Rating + Location */}
        <div className="flex items-center justify-between gap-1 min-w-0 h-4.5 pt-0.5">
          {/* Rating */}
          <div className="flex items-center gap-1 shrink-0">
            <Star
              className="talent-card-mobile-star h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0"
              style={{ color: "#FACC15", fill: "#FACC15", stroke: "#FACC15" }}
            />
            <span
              className="talent-card-mobile-white font-['Inter',sans-serif] text-[11px] sm:text-[11.5px] font-medium leading-none"
              style={{ color: "rgba(255, 255, 255, 0.80)", WebkitTextFillColor: "rgba(255, 255, 255, 0.80)" }}
            >
              {ratingValue}
            </span>
            <span
              className="talent-card-mobile-subtle font-['Inter',sans-serif] text-[9px] sm:text-[9.5px] font-normal leading-none"
              style={{ color: "rgba(255, 255, 255, 0.48)", WebkitTextFillColor: "rgba(255, 255, 255, 0.48)" }}
            >
              ({reviewsCount})
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 min-w-0 shrink-0">
            <MapPin
              className="talent-card-mobile-muted h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 opacity-55"
              style={{ color: "rgba(255, 255, 255, 0.58)", stroke: "rgba(255, 255, 255, 0.58)" }}
            />
            <span
              className="talent-card-mobile-muted font-['Inter','Be_Vietnam_Pro',sans-serif] text-[9.5px] sm:text-[10.5px] font-normal truncate max-w-[85px] sm:max-w-[110px] leading-none"
              style={{ color: "rgba(255, 255, 255, 0.58)", WebkitTextFillColor: "rgba(255, 255, 255, 0.58)" }}
            >
              {locationText}
            </span>
          </div>
        </div>
      </div>

      {/* Dialog Modals */}
      {mounted && showAddConfirm && createPortal(
        <div
          onClick={closeModals}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => e.stopPropagation()}
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
