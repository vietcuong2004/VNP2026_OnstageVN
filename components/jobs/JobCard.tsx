"use client";

import type { MouseEvent } from "react";
import { Calendar, CircleDollarSign, MapPin, UserPlus } from "lucide-react";
import { cn } from "../../lib/utils";

export type TalentJobStage = "pending" | "approved" | string | null | undefined;

type JobCardProps = {
  job: any;
  isApplied: boolean;
  stage?: TalentJobStage;
  isLoadingReferral?: boolean;
  onView: (job: any) => void;
  onApply: (job: any) => void;
  onUpdateStage: (job: any, stage: "executing" | "completed") => void;
  onInvite: (job: any) => void;
  onInviteBlocked: () => void;
  formatDate: (value?: string | null) => string;
};

function getBrandInitials(name?: string) {
  const text = String(name || "").trim();
  if (!text) return "";
  const words = text.split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + (words[1]?.[0] || "")).toUpperCase();
}

function formatDisplayBudget(budgetStr?: string | null) {
  if (!budgetStr) return "";
  return String(budgetStr)
    .replace(/ triệu\/ngày\s*-\s*/gi, " - ")
    .replace(/ k\/ngày\s*-\s*/gi, " - ")
    .replace(/ đ\/ngày\s*-\s*/gi, " - ");
}

function getStatusBadge(stage: TalentJobStage, isApplied: boolean) {
  if (stage === "approved") {
    return { label: "ĐÃ DUYỆT", className: "bg-emerald-600" };
  }

  if (stage === "pending" || isApplied) {
    return { label: "CHỜ DUYỆT", className: "bg-amber-500" };
  }

  return { label: "ỨNG TUYỂN", className: "bg-[#00c875]" };
}

export default function JobCard({
  job,
  isApplied,
  stage,
  isLoadingReferral = false,
  onView,
  onApply,
  onUpdateStage,
  onInvite,
  onInviteBlocked,
  formatDate,
}: JobCardProps) {
  const badge = getStatusBadge(stage, isApplied);

  const stopCardClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const renderPrimaryAction = () => {
    if (!isApplied) {
      return (
        <button
          onClick={(event) => {
            stopCardClick(event);
            onApply(job);
          }}
          className="flex h-11 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-[#f5c518] via-[#e6b600] to-[#d49e00] text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_4px_20px_rgba(245,197,24,0.3)] transition-all hover:brightness-110 active:scale-[0.98]"
        >
          ỨNG TUYỂN
        </button>
      );
    }

    if (stage === "approved") {
      return (
        <button
          disabled
          className="flex h-11 cursor-not-allowed items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-black uppercase tracking-wider text-emerald-400"
        >
          ĐÃ DUYỆT
        </button>
      );
    }

    return (
      <button
        disabled
        className="flex h-11 cursor-not-allowed items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-xs font-black uppercase tracking-wider text-amber-400"
      >
        CHỜ DUYỆT
      </button>
    );
  };

  return (
    <div
      onClick={() => onView(job)}
      className="relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-[#1a1c2e] bg-[#0a0b12] shadow-xl transition-all duration-300 hover:border-[#f5c518]/30"
    >
      <div className="relative h-44 sm:h-48 w-full shrink-0 overflow-hidden bg-slate-900">
        <img
          src={job.coverUrl || "/brand_cover_default.png"}
          alt={job.title}
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0b12] via-[#0a0b12]/60 to-transparent" />

        <div className="absolute right-3 top-3 z-10">
          <span className={cn("inline-block rounded-full px-3 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white shadow-lg", badge.className)}>
            {badge.label}
          </span>
        </div>

        <div className="absolute bottom-2.5 left-3.5 right-3.5 z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#0a0b12] bg-white text-xs sm:text-sm font-black text-slate-950 shadow-xl">
            {job.brandLogo ? (
              <img src={job.brandLogo} alt={job.brand} className="h-full w-full object-cover" />
            ) : job.brand ? (
              <span>{getBrandInitials(job.brand)}</span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            {job.type && (
              <span className="mb-0.5 block truncate text-[10px] sm:text-[11px] font-black uppercase leading-normal tracking-widest text-[#f5c518] pt-0.5">
                {job.type}
              </span>
            )}
            <h4 className="truncate text-xs sm:text-sm font-black leading-normal tracking-tight text-white drop-shadow">
              {job.brand}
            </h4>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-3 p-4 sm:p-5">
        <div>
          <h3
            className="line-clamp-2 font-display text-sm sm:text-base font-extrabold leading-snug tracking-tight text-white transition-colors hover:text-[#f5c518]"
          >
            {job.title}
          </h3>

            <div className="mt-3.5 flex flex-col gap-2 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[#f5c518]/60 bg-[#f5c518]/10">
                  <Calendar className="h-3.5 w-3.5 text-[#f5c518]" />
                </div>
                <span className="whitespace-nowrap text-xs leading-none">
                  <span className="text-slate-300 font-semibold">Hạn ứng tuyển:</span>{" "}
                  <span className="text-white font-bold">
                    {job.applicationDeadline ? formatDate(job.applicationDeadline) : "Không có"}
                  </span>
                </span>
              </div>

              {job.city && (
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[#f5c518]/60 bg-[#f5c518]/10">
                    <MapPin className="h-3.5 w-3.5 text-[#f5c518]" />
                  </div>
                  <span className="truncate text-xs leading-none">
                    <span className="text-slate-300 font-semibold">Địa điểm:</span>{" "}
                    <span className="text-white font-bold">{job.city}</span>
                  </span>
                </div>
              )}
            </div>

          {job.hasBudget && (
            <>
              <div className="my-3 border-t border-[#1a1d30]" />

              <div className="min-w-0">
                <span className="flex w-full items-center gap-1 font-mono text-[11px] xs:text-xs sm:text-xs md:text-sm font-black leading-tight tracking-tight text-[#f5c518] whitespace-nowrap overflow-hidden">
                  <CircleDollarSign className="h-4 w-4 shrink-0 text-[#f5c518]" />
                  <span className="truncate">{formatDisplayBudget(job.budget)}</span>
                </span>
              </div>
            </>
          )}
        </div>

        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(event) => {
                stopCardClick(event);
                onView(job);
              }}
              className="flex h-9 sm:h-10 cursor-pointer items-center justify-center rounded-full border border-slate-700/60 bg-[#0d0e19] text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-[#161828]"
            >
              XEM
            </button>

            {renderPrimaryAction()}
          </div>

          <button
            onClick={(event) => {
              stopCardClick(event);
              if (isApplied) {
                onInvite(job);
              } else {
                onInviteBlocked();
              }
            }}
            disabled={isLoadingReferral}
            className={cn(
              "flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all duration-300",
              isApplied
                ? "border-[#f5c518]/30 bg-[#f5c518]/10 text-[#f5c518] hover:bg-[#f5c518]/20"
                : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
            )}
          >
            <UserPlus className="h-4 w-4 text-[#f5c518]" />
            {isLoadingReferral ? "Đang lấy link..." : "Mời tham gia"}
          </button>
        </div>
      </div>
    </div>
  );
}
