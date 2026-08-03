"use client";

import React, { useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Check, CheckCircle2, Eye, Heart, Loader2, MapPin, Trash2, UserPlus } from "lucide-react";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import BadgeTier from "@/components/ui/BadgeTier";

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

export default function TalentCard({
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
  messageLabel = "Thêm vào Brand",
  showMessageIcon = true,
  messageDisabled = false,
  messageLoading = false,
  showLifestyleServices = false,
  showSocialStats = false,
  className,
}: TalentCardProps) {
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
        "group flex min-w-0 flex-col justify-between rounded-2xl border border-[#2B313D] bg-[#171A21] p-3.5 shadow-lg transition-all duration-300 hover:border-[#C9A86A]/30",
        onView && "cursor-pointer active:scale-[0.99]",
        className
      )}
    >
      <div>
        <div className="relative mb-3.5 aspect-square w-full overflow-hidden rounded-xl border border-white/5 bg-slate-900">
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
            <BadgeTier tier={talent?.tier} variant="gradient" />
          </div>

          {onMessage ? (
            <button
              type="button"
              disabled={messageLoading}
              onClick={handleBrandButtonClick}
              className={cn(
                "absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border shadow-lg backdrop-blur-sm transition active:scale-90",
                messageDisabled
                  ? "border-[#C9A86A]/40 bg-[#0F1115]/80 text-[#C9A86A] hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-400"
                  : "border-white/10 bg-[#0F1115]/60 text-slate-300 hover:border-[#C9A86A]/50 hover:text-white"
              )}
              title={messageDisabled ? "Bấm để xóa khỏi Brand" : "Thêm vào Brand"}
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
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-white/10 bg-[#0F1115]/60 text-slate-300 hover:text-white"
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
                  "inline-flex items-center gap-1 rounded border bg-[#0F1115]/80 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white backdrop-blur-sm",
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
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="flex-1 truncate text-base font-black leading-tight tracking-wide text-white drop-shadow-[0_1px_8px_rgba(255,255,255,0.12)]">
              {talent?.name}
            </h3>
            {talent?.verified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C9A86A]" />
            <span className="truncate">{locationText || "Chưa cập nhật"}</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {talentTypes.length ? (
              talentTypes.map((type) => (
                <span key={type} className="inline-flex w-fit rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#C9A86A]">
                  {getTalentTypeLabel(type)}
                </span>
              ))
            ) : (
              <span className="inline-flex w-fit rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#C9A86A]">
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
                className="inline-flex max-w-full items-center rounded-lg border border-white/10 bg-slate-800/90 px-2 py-1 text-[9.5px] font-black uppercase tracking-wider text-slate-100 shadow-sm"
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
                className="flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400"
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
          <div className="my-3 grid grid-cols-2 gap-2 rounded-xl border border-white/5 bg-[#0F1115]/50 p-2 text-center text-[10px]">
            <div>
              <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">Followers</span>
              <span className="mt-0.5 block font-mono font-black text-amber-300">{talent?.followers || "-"}</span>
            </div>
            <div className="border-l border-white/5">
              <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">Engagement</span>
              <span className="mt-0.5 block font-mono font-black text-cyan-300">{talent?.engagementRate ?? "-"}%</span>
            </div>
          </div>
        )}

        <p className="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-slate-300 font-semibold">
          {bioText || "Talent chuyên nghiệp. Rất mong được hợp tác"}
        </p>
      </div>

      {hasActions && (
        <div className="mt-4 flex gap-2 border-t border-white/5 pt-3.5">
          {onView && (
            <button
              type="button"
              onClick={(event) => {
                stopCardClick(event);
                onView(talent);
              }}
              className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-white/10 active:scale-90"
              title="Xem hồ sơ chi tiết"
            >
              <Eye className="h-4 w-4" />
              <span>{viewLabel}</span>
            </button>
          )}
          {onToggleSaved ? (
            <button
              type="button"
              onClick={(event) => {
                stopCardClick(event);
                onToggleSaved(talent);
              }}
              className={cn(
                "flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95",
                isSaved
                  ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  : "bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 hover:brightness-110"
              )}
              title={isSaved ? "Bỏ lưu khỏi danh sách đã lưu" : "Lưu vào danh sách đã lưu"}
            >
              <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
              <span>{saveLabel || (isSaved ? "Đã lưu" : "Lưu thông tin")}</span>
            </button>
          ) : onMessage ? (
            <button
              type="button"
              disabled={messageLoading}
              onClick={handleBrandButtonClick}
              className={cn(
                "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer",
                messageDisabled
                  ? "border border-[#C9A86A]/30 bg-[#C9A86A]/10 text-[#C9A86A] hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
                  : "bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950"
              )}
            >
              {messageLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : messageDisabled ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C9A86A]" />
              ) : (
                showMessageIcon && <UserPlus className="h-4 w-4" />
              )}
              {messageLabel}
            </button>
          ) : null}
        </div>
      )}

      {/* Dialog Modal xác nhận Thêm vào Brand */}
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
              Xác nhận thêm vào Brand
            </h3>
            <p className="mt-2 text-center text-xs font-semibold leading-relaxed text-slate-300">
              Bạn có muốn thêm Idol này vào Brand của bạn (Mục &quot;Dành cho brand / Quản lý Idol&quot;)?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeModals}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/10 active:scale-95 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={(e) => {
                  closeModals(e);
                  onMessage?.(talent);
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:brightness-110 active:scale-95 cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Dialog Modal xác nhận Xóa khỏi Brand */}
      {mounted && showRemoveConfirm && createPortal(
        <div
          onClick={closeModals}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-full max-w-sm rounded-2xl border border-rose-500/30 bg-[#171A21] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-center font-display text-base font-black uppercase tracking-wide text-white">
              Xác nhận xóa khỏi Brand
            </h3>
            <p className="mt-2 text-center text-xs font-semibold leading-relaxed text-slate-300">
              Bạn có muốn xóa Idol này ra khỏi Brand của bạn (Mục &quot;Dành cho brand / Quản lý Idol&quot;)?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeModals}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/10 active:scale-95 cursor-pointer"
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
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-rose-500 active:scale-95 cursor-pointer"
              >
                Xóa khỏi Brand
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </article>
  );
}
