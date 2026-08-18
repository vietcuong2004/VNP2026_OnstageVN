"use client";

import React, { useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Briefcase, CalendarCheck, Check, CheckCircle2, Heart, Loader2, MapPin, Star, Trash2, UserPlus } from "lucide-react";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import BadgeTier, { getPrimaryAchievementBadge, type TalentAchievementBadge } from "@/components/ui/BadgeTier";

export type TalentAvailabilityStatus = "available" | "busy" | "maybe" | string | null | undefined;

export type TalentCardProps = {
  talent: any;
  avatar?: string;
  status?: TalentAvailabilityStatus;
  isSaved?: boolean;
  onToggleSaved?: (talent: any) => void;
  onView?: (talent: any) => void;
  onMessage?: (talent: any) => void;
  onRemoveFromBrand?: (talent: any) => void;
  viewLabel?: string;
  saveLabel?: string;
  messageLabel?: string;
  showMessageIcon?: boolean;
  messageDisabled?: boolean;
  messageLoading?: boolean;
  showLifestyleServices?: boolean;
  showSocialStats?: boolean;
  experienceLabel?: "full" | "short";
  requireConfirm?: boolean;
  className?: string;
};

export function getTalentTypes(talent: any): string[] {
  const normalizeType = (type: unknown) => {
    const value = String(type).trim();
    return ["pg", "pb", "pg/pb"].includes(value.toLowerCase()) ? "PG/PB" : value;
  };

  if (Array.isArray(talent?.talentTypes) && talent.talentTypes.length) {
    return Array.from(new Set(talent.talentTypes.map(normalizeType).filter(Boolean)));
  }

  if (Array.isArray(talent?.talent_types) && talent.talent_types.length) {
    return Array.from(new Set(talent.talent_types.map(normalizeType).filter(Boolean)));
  }

  if (Array.isArray(talent?.categories) && talent.categories.length) {
    return talent.categories.map((c: any) => (typeof c === "string" ? c : c.name || c.title || "")).filter(Boolean);
  }

  if (Array.isArray(talent?.categoryNames) && talent.categoryNames.length) {
    return talent.categoryNames.map((type: unknown) => String(type).trim()).filter(Boolean);
  }

  return talent?.type ? [String(talent.type)] : [];
}

export function getTalentTypeLabel(type: string) {
  const normalized = type.trim().toLowerCase();
  if (normalized === "kols") return "KOL";
  if (normalized === "kocs") return "KOC";
  if (normalized === "livestreamers") return "Livestreamer";
  return type;
}

export function getStringList(value: unknown): string[] {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return Array.from(new Set(list.map((item) => String(item).trim()).filter(Boolean)));
}

export function getStatusLabel(status: TalentAvailabilityStatus) {
  if (status === "available") return "Rảnh";
  if (status === "busy") return "Bận";
  return "Chưa có lịch";
}

export function getTalentPrimaryBadge(talent: any): TalentAchievementBadge | null {
  return getPrimaryAchievementBadge(talent);
}

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

export default function TalentCard({
  talent,
  avatar,
  status = "maybe",
  isSaved = false,
  onToggleSaved,
  onView,
  onMessage,
  onRemoveFromBrand,
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
  const mockStats = getMockTalentStats(talent);
  const primaryBadge = getTalentPrimaryBadge(talent);
  const hasActions = Boolean(onView || onToggleSaved || onMessage);

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

  const handleBookNowClick = (event: MouseEvent) => {
    stopCardClick(event);
    const targetId = talent?.profileId || talent?.profile_id || talent?.id || talent?.slug;
    if (!targetId) return;
    router.push(`/booking?talentId=${encodeURIComponent(String(targetId))}`);
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
        "group flex min-w-0 flex-col justify-between rounded-2xl border border-[#F0D7D3] bg-white p-3.5 shadow-[0_16px_34px_rgba(143,7,9,0.10)] transition-all duration-300 hover:border-[#C72524]/45 dark:border-[#2B313D] dark:bg-[#171A21] dark:shadow-lg dark:hover:border-[#C9A86A]/30",
        onView && "cursor-pointer active:scale-[0.99]",
        className
      )}
    >
      <div>
        <div className="relative mb-3.5 aspect-square w-full overflow-hidden rounded-xl border border-[#F1DBD7] bg-[#FFF7F5] dark:border-white/5 dark:bg-slate-900">
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

          <div className="absolute left-2 top-2">
            <BadgeTier badge={primaryBadge} tier={talent?.tier} seed={talent?.id || talent?.slug || talent?.email || talent?.name} variant="gradient" className="talent-card-achievement" />
          </div>

          {onMessage ? (
            <button
              type="button"
              disabled={messageLoading}
              onClick={handleBrandButtonClick}
              className={cn(
                "absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border shadow-lg backdrop-blur-sm transition active:scale-90",
                messageDisabled
                  ? "border-[#C72524]/45 bg-white/90 text-[#C72524] hover:border-[#C72524] hover:bg-[#FFF1EF] dark:border-[#C9A86A]/40 dark:bg-[#0F1115]/80 dark:text-[#C9A86A] dark:hover:bg-rose-500/20 dark:hover:border-rose-500/50 dark:hover:text-rose-400"
                  : "border-[#F1D8D4] bg-white/85 text-[#9B1215] hover:border-[#C72524]/45 hover:text-[#C72524] dark:border-white/10 dark:bg-[#0F1115]/60 dark:text-slate-300 dark:hover:border-[#C9A86A]/50 dark:hover:text-white"
              )}
              title={messageDisabled ? "Bấm để xóa khỏi danh sách quản lý" : "Thêm vào danh sách quản lý"}
            >
              {messageLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : messageDisabled ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <UserPlus className="h-3.5 w-3.5" />
              )}
            </button>
          ) : onToggleSaved ? (
            <button
              type="button"
              onClick={(event) => {
                stopCardClick(event);
                onToggleSaved(talent);
              }}
              className={cn(
                "absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border shadow-lg backdrop-blur-sm transition active:scale-90",
                isSaved
                  ? "light-force-white border-[#C72524] bg-[#C72524] text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-white"
                  : "border-[#F1D8D4] bg-white/85 text-[#9B1215] hover:border-[#C72524]/45 hover:text-[#C72524] dark:border-white/10 dark:bg-[#0F1115]/60 dark:text-slate-300 dark:hover:text-white"
              )}
              title={isSaved ? "Bỏ lưu" : "Lưu thông tin"}
            >
              <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
            </button>
          ) : null}

          {status && status !== "maybe" && (
            <div className="absolute bottom-2 left-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded border bg-white/90 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-[#191116] backdrop-blur-sm dark:bg-[#0F1115]/80 dark:text-white",
                  status === "available" && "border-emerald-500/30 text-emerald-400",
                  status === "busy" && "border-red-500/30 text-red-400"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    status === "available" && "bg-emerald-400",
                    status === "busy" && "bg-red-400"
                  )}
                />
                {getStatusLabel(status)}
              </span>
            </div>
          )}
        </div>



        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex min-h-[24px] min-w-0 flex-1 items-center justify-center gap-1 rounded-full border border-[#E9CFC5] bg-[#FFFDFB] px-2 text-center text-[#A36C1D] shadow-[0_5px_14px_rgba(143,7,9,0.06)] dark:border-[#C9A86A]/45 dark:bg-[#1B1608] dark:text-[#FFE05F] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-[9px] font-black tracking-tight">{mockStats.bookings} lượt booking</span>
            </div>
            <div className="flex min-h-[24px] min-w-0 flex-1 items-center justify-center gap-1 rounded-full border border-[#F1D5D8] bg-[#FFF7F8] px-2 text-center text-[#C72524] shadow-[0_5px_14px_rgba(143,7,9,0.06)] dark:border-fuchsia-300/35 dark:bg-[#34183B] dark:text-fuchsia-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Star className="h-3.5 w-3.5 shrink-0 fill-current" />
              <span className="truncate text-[9px] font-black tracking-tight">{mockStats.goodReviews} đánh giá</span>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="flex-1 truncate text-base font-black leading-tight tracking-wide text-[#191116] dark:text-white dark:drop-shadow-[0_1px_8px_rgba(255,255,255,0.12)]">
              {talent?.name}
            </h3>
            {talent?.verified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#C72524] dark:text-emerald-400" />}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7B6866] dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#A36C1D] dark:text-[#C9A86A]" />
            <span className="truncate">{locationText || "Chưa cập nhật"}</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {talentTypes.length ? (
              talentTypes.map((type) => (
                <span key={type} className="inline-flex w-fit rounded-md border border-[#F1D8D4] bg-[#FFF7F6] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#9B1215] dark:border-[#C9A86A]/25 dark:bg-[#C9A86A]/10 dark:text-[#C9A86A]">
                  {getTalentTypeLabel(type)}
                </span>
              ))
            ) : (
              <span className="inline-flex w-fit rounded-md border border-[#F1D8D4] bg-[#FFF7F6] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#9B1215] dark:border-[#C9A86A]/25 dark:bg-[#C9A86A]/10 dark:text-[#C9A86A]">
                Chưa cập nhật
              </span>
            )}
          </div>
        </div>

        {/* Info Pills: Chiều cao > Cân nặng > Số đo 3 vòng (1 Hàng) */}
        {profilePills.length > 0 && (
          <div className="my-3 flex flex-wrap gap-1">
            {profilePills.map((pill) => (
              <span
                key={pill}
                className="inline-flex max-w-full items-center rounded-lg border border-[#F1D8D4] bg-[#FFF9F8] px-2 py-1 text-[9.5px] font-black uppercase tracking-wider text-[#9B1215] shadow-sm dark:border-white/10 dark:bg-slate-800/90 dark:text-slate-100"
                title={pill}
              >
                <span className="truncate">{pill}</span>
              </span>
            ))}
          </div>
        )}

        {showLifestyleServices && Array.isArray(talent?.lifestyleServices) && talent.lifestyleServices.some((service: any) => service.enabled) && (
          <div className="my-2.5 flex flex-wrap gap-1">
            {talent.lifestyleServices.filter((service: any) => service.enabled).map((service: any) => (
              <span
                key={service.id}
                className="flex items-center gap-1 rounded border border-[#E9CFC5] bg-[#FFFDFB] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#A36C1D] dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400"
                title={service.title}
              >
                <span className="max-w-[100px] truncate">
                  {String(service.title || "").replace(/(Sport Companion |Business |VIP |Luxury |Launching Event |Daily Content )/g, "")}
                </span>
              </span>
            ))}
          </div>
        )}

        {showSocialStats && (
          <div className="my-3 grid grid-cols-2 gap-2 rounded-xl border border-[#F1D8D4] bg-[#FFF9F8] p-2 text-center text-[10px] dark:border-white/5 dark:bg-[#0F1115]/50">
            <div>
              <span className="block text-[8px] font-bold uppercase tracking-wider text-[#9A8581] dark:text-slate-500">Followers</span>
              <span className="mt-0.5 block font-mono font-black text-[#A36C1D] dark:text-amber-300">{talent?.followers || "-"}</span>
            </div>
            <div className="border-l border-[#F1D8D4] dark:border-white/5">
              <span className="block text-[8px] font-bold uppercase tracking-wider text-[#9A8581] dark:text-slate-500">Engagement</span>
              <span className="mt-0.5 block font-mono font-black text-[#C72524] dark:text-cyan-300">{talent?.engagementRate ?? "-"}%</span>
            </div>
          </div>
        )}

        <p className="mt-2 whitespace-pre-line text-[11px] font-semibold leading-relaxed text-[#5F5554] dark:text-slate-300">
          {bioText || "Talent chuyên nghiệp. Rất mong được hợp tác"}
        </p>
      </div>

      {hasActions && (
        <div className="mt-4 flex items-center gap-2 border-t border-[#F4E1DE] pt-3.5 dark:border-white/5">
          <button
            type="button"
            onClick={handleBookNowClick}
            className="flex min-h-[46px] flex-1 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#D8A8A3] bg-[#FFF7F6] px-4 text-[11px] font-black uppercase tracking-wider text-[#C72524] transition hover:border-[#C72524]/55 hover:bg-[#FFF1EF] active:scale-95 dark:border-[#D7A900]/80 dark:bg-[#241D08] dark:text-[#FFE05F] dark:hover:border-[#FFE05F] dark:hover:bg-[#2D2409]"
            title="Đặt ngay"
          >
            <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Đặt ngay</span>
          </button>

          {onToggleSaved ? (
            <button
              type="button"
              onClick={(event) => {
                stopCardClick(event);
                onToggleSaved(talent);
              }}
              className={cn(
                "flex min-h-[40px] flex-1 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-[9px] font-black uppercase tracking-wider transition active:scale-95",
                isSaved
                  ? "light-force-white border border-[#C72524]/55 bg-[#C72524] text-white hover:bg-[#A40E10] dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30"
                  : "light-force-white bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-white hover:brightness-110 dark:from-amber-100 dark:via-[#C9A86A] dark:to-yellow-600 dark:text-slate-950"
              )}
              title={isSaved ? "Bỏ lưu khỏi danh sách đã lưu" : "Lưu vào danh sách đã lưu"}
            >
              <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
              <span className="truncate">{saveLabel === "Lưu thông tin" ? "Lưu" : saveLabel || (isSaved ? "Đã lưu" : "Lưu")}</span>
            </button>
          ) : onMessage ? (
            <button
              type="button"
              disabled={messageLoading}
              onClick={handleBrandButtonClick}
              className={cn(
                "flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg pl-2 pr-3 text-[9px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer",
                messageDisabled
                  ? "border border-[#D8A8A3] bg-[#FFF7F6] text-[#C72524] hover:border-[#C72524]/55 hover:bg-[#FFF1EF] dark:border-[#C9A86A]/30 dark:bg-[#C9A86A]/10 dark:text-[#C9A86A] dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                  : "light-force-white bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-white dark:from-amber-100 dark:via-[#C9A86A] dark:to-yellow-600 dark:text-slate-950"
              )}
            >
              {messageLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : messageDisabled ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#A36C1D] dark:text-[#C9A86A]" />
              ) : (
                showMessageIcon && <UserPlus className="h-3.5 w-3.5" />
              )}
              <span className="truncate">{messageLabel}</span>
            </button>
          ) : null}
        </div>
      )}

      {/* Dialog Modal xác nhận Thêm vào Quản lý Idol */}
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
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeModals}
                className="flex-1 rounded-2xl border border-[#F0D7D3] bg-white py-2.5 text-xs font-bold uppercase tracking-wider text-[#574D54] transition hover:bg-[#FFF0EE] hover:text-[#8F0709] active:scale-95 cursor-pointer shadow-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={(e) => {
                  closeModals(e);
                  onMessage?.(talent);
                }}
                className="light-force-white flex-1 rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] py-2.5 text-xs font-black uppercase tracking-wider !text-white text-white transition hover:brightness-110 active:scale-95 cursor-pointer shadow-md"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Dialog Modal xác nhận Xóa khỏi Quản lý Idol */}
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
              Bạn có muốn xóa Idol này khỏi danh sách quản lý của bạn (Mục &quot;Quản lý Idol&quot;)?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeModals}
                className="flex-1 rounded-2xl border border-[#F0D7D3] bg-white py-2.5 text-xs font-bold uppercase tracking-wider text-[#574D54] transition hover:bg-[#FFF0EE] hover:text-[#8F0709] active:scale-95 cursor-pointer shadow-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={(e) => {
                  closeModals(e);
                  if (onRemoveFromBrand) {
                    onRemoveFromBrand(talent);
                  } else {
                    onMessage?.(talent);
                  }
                }}
                className="light-force-white flex-1 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 py-2.5 text-xs font-black uppercase tracking-wider !text-white text-white transition hover:brightness-110 active:scale-95 cursor-pointer shadow-md"
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
