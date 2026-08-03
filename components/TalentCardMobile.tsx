"use client";

import React, { useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Check, CheckCircle2, Eye, Heart, Loader2, MapPin, Trash2, UserPlus, Crown, Trophy, Star, Award } from "lucide-react";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import {
  type TalentCardProps,
  getTalentTypes,
  getTalentTypeLabel,
  getStringList,
  getStatusLabel,
} from "./TalentCard";

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
      {/* Row 1: Avatar & Information */}
      <div className="flex flex-row gap-3.5 items-center">
        {/* Left Column: Avatar Image Container */}
        <div className="relative aspect-square w-[110px] h-[110px] shrink-0 overflow-hidden rounded-xl border border-white/5 bg-slate-900">
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

          {/* Availability status badge inside image (Hide if "Chưa có lịch" / "maybe") */}
          {status && status !== "maybe" && (
            <div className="absolute bottom-1.5 left-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded border bg-[#0F1115]/80 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur-sm",
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

        {/* Right Column: Information Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Header row: Name, verified badge (smaller font text-[13px] so they fit on same line) */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex min-w-0 items-center gap-1.5 flex-wrap">
              <h3 className="text-[13px] font-black leading-tight tracking-wide text-white drop-shadow-[0_1px_8px_rgba(255,255,255,0.12)] break-words">
                {talent?.name}
              </h3>
              {talent?.verified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
            </div>
          </div>

          {/* Location row */}
          <div className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="h-3 w-3 shrink-0 text-[#C9A86A]" />
            <span className="truncate">{locationText || "Chưa cập nhật"}</span>
          </div>

          {/* Types row */}
          <div className="flex flex-wrap gap-1">
            {talentTypes.length ? (
              talentTypes.slice(0, 3).map((type) => (
                <span key={type} className="inline-flex w-fit rounded border border-[#C9A86A]/20 bg-[#C9A86A]/5 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-[#C9A86A]">
                  {getTalentTypeLabel(type)}
                </span>
              ))
            ) : (
              <span className="inline-flex w-fit rounded border border-[#C9A86A]/20 bg-[#C9A86A]/5 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-[#C9A86A]">
                Chưa cập nhật
              </span>
            )}
          </div>

          {/* Social Stats Row (if visible) */}
          {showSocialStats && (
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/5 bg-[#0F1115]/50 p-1.5 text-center text-[9px]">
              <div>
                <span className="block text-[7.5px] font-bold uppercase tracking-wider text-slate-500">Followers</span>
                <span className="font-mono font-black text-amber-300">{talent?.followers || "-"}</span>
              </div>
              <div className="border-l border-white/5">
                <span className="block text-[7.5px] font-bold uppercase tracking-wider text-slate-500">Engagement</span>
                <span className="font-mono font-black text-cyan-300">{talent?.engagementRate ?? "-"}%</span>
              </div>
            </div>
          )}

          {/* Profile skills & service badges */}
          {(profilePills.length > 0 || (showLifestyleServices && Array.isArray(talent?.lifestyleServices))) && (
            <div className="flex flex-wrap gap-1 max-h-[46px] overflow-hidden">
              {profilePills.slice(0, 3).map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center rounded border border-white/5 bg-slate-800/80 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-200"
                  title={pill}
                >
                  <span className="truncate max-w-[80px]">{pill}</span>
                </span>
              ))}
              {showLifestyleServices && Array.isArray(talent?.lifestyleServices) &&
                talent.lifestyleServices.filter((s: any) => s.enabled).slice(0, 2).map((service: any) => (
                  <span
                    key={service.id}
                    className="flex items-center gap-0.5 rounded border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-400"
                  >
                    <span className="truncate max-w-[80px]">
                      {String(service.title || "").replace(/(Sport Companion |Business |VIP |Luxury |Launching Event |Daily Content )/g, "")}
                    </span>
                  </span>
                ))
              }
            </div>
          )}

          {/* Short Bio text */}
          <p className="line-clamp-3 text-[10px] leading-relaxed text-slate-355 font-medium">
            {bioText || "Chưa có thông tin giới thiệu"}
          </p>
        </div>
      </div>

      {/* Row 2: 3 Action Buttons spanning full card width - compact sizes */}
      {hasActions && (
        <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-3">
          {/* 1. Xem */}
          {onView && (
            <button
              type="button"
              onClick={(event) => {
                stopCardClick(event);
                onView(talent);
              }}
              className="flex h-[32px] flex-none items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 text-[8.5px] font-black uppercase tracking-wider text-white transition hover:bg-white/10 active:scale-90 cursor-pointer"
              title="Xem hồ sơ chi tiết"
            >
              <Eye className="h-3 w-3" />
              <span>{viewLabel}</span>
            </button>
          )}

          {/* 2. Thêm vào brand */}
          {onMessage && (
            <button
              type="button"
              disabled={messageLoading}
              onClick={handleBrandButtonClick}
              className={cn(
                "flex h-[32px] flex-1 items-center justify-center gap-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer border",
                messageDisabled
                  ? "border-[#C9A86A]/40 bg-[#C9A86A]/10 text-[#C9A86A]"
                  : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              )}
            >
              {messageLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : messageDisabled ? (
                <Check className="h-3 w-3 text-[#C9A86A]" />
              ) : (
                showMessageIcon && <UserPlus className="h-3 w-3" />
              )}
              <span className="truncate">{messageLabel}</span>
            </button>
          )}

          {/* 3. Lưu thông tin */}
          {onToggleSaved && (
            <button
              type="button"
              onClick={(event) => {
                stopCardClick(event);
                onToggleSaved(talent);
              }}
              className={cn(
                "flex h-[32px] flex-1 items-center justify-center gap-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer",
                isSaved
                  ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  : "bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 hover:brightness-110"
              )}
              title={isSaved ? "Bỏ lưu" : "Lưu thông tin"}
            >
              <Heart className={cn("h-3 w-3", isSaved && "fill-current")} />
              <span className="truncate">{saveLabel || (isSaved ? "Đã lưu" : "Lưu thông tin")}</span>
            </button>
          )}
        </div>
      )}

      {/* Dialog Modals (confirm add/remove) */}
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
