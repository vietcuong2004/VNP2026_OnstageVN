"use client";

import type { MouseEvent } from "react";
import { CheckCircle2, Eye, Heart, MapPin, MessageSquare } from "lucide-react";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

export type TalentAvailabilityStatus = "available" | "busy" | "maybe" | string | null | undefined;

type TalentCardProps = {
  talent: any;
  avatar?: string;
  status?: TalentAvailabilityStatus;
  isSaved?: boolean;
  onToggleSaved?: (talent: any) => void;
  onView?: (talent: any) => void;
  onMessage?: (talent: any) => void;
  viewLabel?: string;
  messageLabel?: string;
  showMessageIcon?: boolean;
  showLifestyleServices?: boolean;
  showSocialStats?: boolean;
  experienceLabel?: "full" | "short";
  className?: string;
};

function getTalentTypes(talent: any): string[] {
  if (Array.isArray(talent?.talentTypes) && talent.talentTypes.length) {
    return talent.talentTypes.map((type: unknown) => String(type).trim()).filter(Boolean);
  }

  if (Array.isArray(talent?.talent_types) && talent.talent_types.length) {
    return talent.talent_types.map((type: unknown) => String(type).trim()).filter(Boolean);
  }

  return talent?.type ? [String(talent.type)] : [];
}

function getStatusLabel(status: TalentAvailabilityStatus) {
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
  viewLabel = "Xem",
  messageLabel = "Nhắn tin",
  showMessageIcon = true,
  showLifestyleServices = false,
  showSocialStats = false,
  experienceLabel = "full",
  className,
}: TalentCardProps) {
  const talentAvatar = avatar || talent?.avatar || createInitialAvatarDataUrl(talent?.name || "Talent", "");
  const locationText = [talent?.district, talent?.city].filter(Boolean).join(", ");
  const experienceYears = Number(talent?.yearsOfExperience ?? talent?.experience_years ?? 0);
  const talentTypes = getTalentTypes(talent);
  const hasActions = Boolean(onView || onMessage);
  const stopCardClick = (event: MouseEvent) => {
    event.stopPropagation();
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
            alt={talent?.name || "Talent"}
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = createInitialAvatarDataUrl(talent?.name || "Talent", "");
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute left-2 top-2 flex flex-col gap-1.5">
            <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[8.5px] font-black uppercase text-slate-950 shadow-md">
              Hạng {talent?.tier || "-"}
            </span>
          </div>

          {onToggleSaved && (
            <button
              onClick={(event) => {
                stopCardClick(event);
                onToggleSaved(talent);
              }}
              className={cn(
                "absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border shadow-lg backdrop-blur-sm transition active:scale-90",
                isSaved
                  ? "border-red-500 bg-red-500 text-white"
                  : "border-white/10 bg-[#0F1115]/60 text-slate-300 hover:text-white"
              )}
              title={isSaved ? "Bỏ lưu" : "Lưu vào shortlist"}
            >
              <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
            </button>
          )}

          <div className="absolute bottom-2 left-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded border bg-[#0F1115]/80 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur-sm",
                status === "available" && "border-emerald-500/30 text-emerald-400",
                status === "busy" && "border-red-500/30 text-red-400",
                status === "maybe" && "border-yellow-500/30 text-yellow-400"
              )}
            >
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  status === "available" && "bg-emerald-400",
                  status === "busy" && "bg-red-400",
                  status === "maybe" && "bg-yellow-400"
                )}
              />
              {getStatusLabel(status)}
            </span>
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="flex-1 truncate text-base font-black leading-tight tracking-wide text-white drop-shadow-[0_1px_8px_rgba(255,255,255,0.12)]">
              {talent?.name}
            </h3>
            {talent?.verified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C9A86A]" />
            <span className="truncate">{locationText || "Chưa cập nhật"}</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {talentTypes.length ? (
              talentTypes.map((type) => (
                <span key={type} className="inline-flex w-fit rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#C9A86A]">
                  {type}
                </span>
              ))
            ) : (
              <span className="inline-flex w-fit rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#C9A86A]">
                Chưa cập nhật
              </span>
            )}
          </div>
        </div>

        <div className="my-3 flex flex-nowrap gap-1 overflow-hidden">
          <span className="min-w-0 shrink rounded-md border border-white/10 bg-slate-800/90 px-1.5 py-1 text-[8px] font-black uppercase text-slate-100 shadow-sm whitespace-nowrap">{talent?.age} tuổi</span>
          <span className="min-w-0 shrink rounded-md border border-white/10 bg-slate-800/90 px-1.5 py-1 text-[8px] font-black uppercase text-slate-100 shadow-sm whitespace-nowrap">
            {experienceYears} năm {experienceLabel === "short" ? "KN" : "kinh nghiệm"}
          </span>
          <span className="min-w-0 shrink rounded-md border border-white/10 bg-slate-800/90 px-1.5 py-1 text-[8px] font-black uppercase text-slate-100 shadow-sm whitespace-nowrap">{talent?.height}cm</span>
          <span className="min-w-0 shrink rounded-md border border-white/10 bg-slate-800/90 px-1.5 py-1 text-[8px] font-black uppercase text-slate-100 shadow-sm whitespace-nowrap">{talent?.weight}kg</span>
        </div>

        {showLifestyleServices && Array.isArray(talent?.lifestyleServices) && talent.lifestyleServices.some((service: any) => service.enabled) && (
          <div className="my-2.5 flex flex-wrap gap-1">
            {talent.lifestyleServices.filter((service: any) => service.enabled).map((service: any) => (
              <span
                key={service.id}
                className="flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-400"
                title={service.title}
              >
                <span className="max-w-[80px] truncate">
                  {String(service.title || "").replace(/(Sport Companion |Business |VIP |Luxury |Launching Event |Daily Content )/g, "")}
                </span>
              </span>
            ))}
          </div>
        )}

        {showSocialStats && (
          <div className="my-3 grid grid-cols-2 gap-2 rounded-xl border border-white/5 bg-[#0F1115]/50 p-2 text-center text-[10px]">
            <div>
              <span className="block text-[7px] font-bold uppercase tracking-wider text-slate-500">Followers</span>
              <span className="mt-0.5 block font-mono font-black text-amber-300">{talent?.followers || "-"}</span>
            </div>
            <div className="border-l border-white/5">
              <span className="block text-[7px] font-bold uppercase tracking-wider text-slate-500">Engagement</span>
              <span className="mt-0.5 block font-mono font-black text-cyan-300">{talent?.engagementRate ?? "-"}%</span>
            </div>
          </div>
        )}

        <p className="mt-2 line-clamp-2 min-h-7 text-[10px] leading-relaxed text-slate-300">{talent?.experience}</p>
      </div>

      {hasActions && (
        <div className="mt-4 flex gap-2 border-t border-white/5 pt-3.5">
          {onView && (
            <button
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
          {onMessage && (
            <button
              onClick={(event) => {
                stopCardClick(event);
                onMessage(talent);
              }}
              className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-[10px] font-black uppercase tracking-wider text-slate-950 transition active:scale-95"
            >
              {showMessageIcon && <MessageSquare className="h-4 w-4" />}
              {messageLabel}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
