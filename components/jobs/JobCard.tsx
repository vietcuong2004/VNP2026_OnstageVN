"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { Bookmark, Calendar, CircleDollarSign, MapPin } from "lucide-react";
import { cn } from "../../lib/utils";
import { isApplicationDeadlineExpired } from "@/lib/job-deadline";
import { loadSavedJobIdsForSession, SAVED_JOBS_UPDATED_EVENT, toggleSavedJobForSession } from "@/lib/saved-jobs";

export type TalentJobStage = "pending" | "approved" | string | null | undefined;

export type JobCardProps = {
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
  const raw = String(budgetStr).trim();
  if (!raw.includes("-")) return raw;

  const parts = raw.split("-").map((p) => p.trim());
  if (parts.length !== 2) return raw;

  const [first, second] = parts;

  // Case 1: First is thousands (e.g. 949k/ngày or 949k), Second is millions (e.g. 9,4 triệu/ngày)
  if (/k(?:\/ngày)?$/i.test(first) && /triệu|trieu/i.test(second)) {
    const cleanFirst = first.replace(/\/ngày$/i, "").trim().replace(/\s*k$/i, "k");
    return `${cleanFirst} - ${second}`;
  }

  // Case 2: Both are millions (e.g. 1 triệu/ngày - 1,5 triệu/ngày -> 1 - 1,5 triệu/ngày)
  if (/triệu|trieu/i.test(first) && /triệu|trieu/i.test(second)) {
    const cleanFirst = first.replace(/(?:\s*triệu|\s*trieu)(?:\/ngày)?$/i, "").trim();
    return `${cleanFirst} - ${second}`;
  }

  // Case 3: Both are thousands (e.g. 300k/ngày - 500k/ngày -> 300 - 500k/ngày)
  if (/k(?:\/ngày)?$/i.test(first) && /k(?:\/ngày)?$/i.test(second)) {
    const cleanFirst = first.replace(/(?:\s*k)(?:\/ngày)?$/i, "").trim();
    return `${cleanFirst} - ${second}`;
  }

  // Case 4: Both are dong (e.g. 300đ/ngày - 500đ/ngày -> 300 - 500đ/ngày)
  if (/đ(?:\/ngày)?$/i.test(first) && /đ(?:\/ngày)?$/i.test(second)) {
    const cleanFirst = first.replace(/(?:\s*đ)(?:\/ngày)?$/i, "").trim();
    return `${cleanFirst} - ${second}`;
  }

  return raw
    .replace(/ triệu\/ngày\s*-\s*/gi, " - ")
    .replace(/ k\/ngày\s*-\s*/gi, "k - ")
    .replace(/ đ\/ngày\s*-\s*/gi, "đ - ");
}

function getStatusBadge(stage: TalentJobStage, isApplied: boolean) {
  if (stage === "approved") {
    return { label: "ĐÃ DUYỆT", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-600 dark:text-white" };
  }

  if (stage === "pending" || isApplied) {
    return { label: "CHỜ DUYỆT", className: "bg-amber-50 text-amber-700 dark:bg-amber-500 dark:text-white" };
  }

  return { label: "Đang tuyển", className: "bg-[#FFF1EF] text-[#9B1215] dark:bg-[#00c875] dark:text-white" };
}

export default function JobCard({
  job,
  isApplied,
  stage,
  onView,
  onApply,
  formatDate,
}: JobCardProps) {
  const isExpired = isApplicationDeadlineExpired(job.applicationDeadline);
  const baseBadge = getStatusBadge(stage, isApplied);
  const badge =
    !isApplied && stage !== "approved" && stage !== "pending" && isExpired
      ? { label: "ĐÃ HẾT HẠN", className: "bg-[#FFF7F6] text-[#7B6866] dark:bg-slate-500 dark:text-white" }
      : baseBadge;
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingSavedJob, setIsSavingSavedJob] = useState(false);

  useEffect(() => {
    let active = true;

    async function syncSavedState() {
      const ids = await loadSavedJobIdsForSession();
      if (active) {
        setIsSaved(ids.includes(String(job?.id || "")));
      }
    }

    void syncSavedState();
    window.addEventListener(SAVED_JOBS_UPDATED_EVENT, syncSavedState);
    window.addEventListener("storage", syncSavedState);

    return () => {
      active = false;
      window.removeEventListener(SAVED_JOBS_UPDATED_EVENT, syncSavedState);
      window.removeEventListener("storage", syncSavedState);
    };
  }, [job?.id]);

  const stopCardClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const handleSaveClick = async (event: MouseEvent) => {
    stopCardClick(event);
    if (isSavingSavedJob) return;

    setIsSavingSavedJob(true);
    try {
      const result = await toggleSavedJobForSession(job);
      setIsSaved(result.isSaved);
    } finally {
      setIsSavingSavedJob(false);
    }
  };

  const renderPrimaryAction = () => {
    if (!isApplied && isExpired) {
      return (
        <button
          disabled
          className="flex h-11 cursor-not-allowed items-center justify-center rounded-full border border-[#E6D6D2] bg-[#F7F1F0] text-xs font-black uppercase tracking-wider text-[#8F7C78] dark:border-slate-500/20 dark:bg-slate-500/15 dark:text-slate-400"
        >
          ĐÃ HẾT HẠN
        </button>
      );
    }

    if (!isApplied) {
      return (
        <button
          onClick={(event) => {
            stopCardClick(event);
            onApply(job);
          }}
          className="light-force-white flex h-11 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-xs font-black uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-[0.98] dark:from-amber-100 dark:via-[#C9A86A] dark:to-yellow-600 dark:text-slate-950"
        >
          ỨNG TUYỂN
        </button>
      );
    }

    if (stage === "approved") {
      return (
        <button
          disabled
          className="flex h-11 cursor-not-allowed items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-50 text-xs font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
        >
          ĐÃ DUYỆT
        </button>
      );
    }

    return (
      <button
        disabled
        className="flex h-11 cursor-not-allowed items-center justify-center rounded-full border border-amber-500/20 bg-amber-50 text-xs font-black uppercase tracking-wider text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
      >
        CHỜ DUYỆT
      </button>
    );
  };

  return (
    <div
      onClick={() => onView(job)}
      className="relative flex h-full min-h-[525px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-[#F0D7D3] bg-white transition-all duration-300 hover:border-[#C72524]/40 dark:border-[#1a1c2e] dark:bg-[#0a0b12] dark:hover:border-[#f5c518]/30"
    >
      <div className="relative h-48 w-full shrink-0 overflow-hidden bg-[#FFF7F6] dark:bg-slate-900">
        <img
          src={job.coverUrl || "/brand_cover_default.png"}
          alt={job.title}
          className="h-full w-full object-cover"
        />

        <div className="absolute right-3 top-3 z-10">
          <span className={cn("inline-block rounded-full px-3 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm", badge.className)}>
            {badge.label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-3 p-4 sm:p-5">
        <div className="flex flex-1 flex-col">
          {/* Brand Logo & Brand Name */}
          <div className="mb-2.5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#F0D7D3] bg-[#FFF0EE] text-xs sm:text-sm font-black text-[#8F0709] shadow-sm dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300">
              {job.brandLogo ? (
                <img src={job.brandLogo} alt={job.brand} className="h-full w-full object-cover" />
              ) : job.brand ? (
                <span>{getBrandInitials(job.brand)}</span>
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-xs sm:text-sm font-black leading-tight tracking-tight text-[#8F0709] dark:text-[#f5c518]">
                {job.brand}
              </h4>
            </div>
          </div>

          <h3
            className="line-clamp-2 min-h-[44px] font-display text-sm sm:text-base font-extrabold leading-snug tracking-tight text-[#191116] transition-colors hover:text-[#8F0709] dark:text-white dark:hover:text-[#f5c518]"
          >
            {job.title}
          </h3>

          <div className="mt-3.5 flex min-h-[50px] flex-col gap-2 text-xs font-medium text-[#574D54] dark:text-slate-300">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] dark:border-[#f5c518]/60 dark:bg-[#f5c518]/10 dark:text-[#f5c518]">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span className="whitespace-nowrap text-xs leading-none">
                <span className="text-[#574D54] font-semibold dark:text-slate-300">Hạn ứng tuyển:</span>{" "}
                <span className="text-[#191116] font-bold dark:text-white">
                  {job.applicationDeadline ? formatDate(job.applicationDeadline) : "Không có"}
                </span>
              </span>
            </div>

            {job.city && (
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] dark:border-[#f5c518]/60 dark:bg-[#f5c518]/10 dark:text-[#f5c518]">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span className="truncate text-xs leading-none">
                  <span className="text-[#574D54] font-semibold dark:text-slate-300">Địa điểm:</span>{" "}
                  <span className="text-[#191116] font-bold dark:text-white">{job.city}</span>
                </span>
              </div>
            )}
          </div>

          {job.hasBudget && (
            <>
              <div className="my-3 border-t border-[#F0D7D3] dark:border-[#1a1d30]" />

              <div className="min-h-[22px] min-w-0">
                <span className="flex w-full items-center gap-1 font-mono text-[11px] xs:text-xs sm:text-xs md:text-sm font-black leading-tight tracking-tight text-[#8F0709] dark:text-[#f5c518] whitespace-nowrap overflow-hidden">
                  <CircleDollarSign className="h-4 w-4 shrink-0 text-[#8F0709] dark:text-[#f5c518]" />
                  <span className="truncate">{formatDisplayBudget(job.budget)}</span>
                </span>
              </div>
            </>
          )}
        </div>

        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSaveClick}
              className={cn(
                "flex h-9 sm:h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full text-xs font-black transition-all active:scale-[0.98]",
                isSaved
                  ? "border border-[#8F0709] bg-[#FFF0EE] text-[#8F0709] hover:bg-[#8F0709] hover:text-white dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-400"
                  : "border border-[#F0D7D3] bg-white text-[#574D54] hover:border-[#8F0709] hover:text-[#8F0709] dark:border-white/10 dark:bg-white/8 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
              )}
              aria-label={isSaved ? "Bỏ lưu job" : "Lưu job"}
              title={isSaved ? "Bỏ lưu job" : "Lưu job"}
            >
              <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
              {isSaved ? "Đã lưu" : "Lưu job"}
            </button>

            {renderPrimaryAction()}
          </div>
        </div>
      </div>
    </div>
  );
}
