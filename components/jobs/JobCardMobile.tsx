"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { Bookmark, CalendarClock, Check, CircleDollarSign, MapPin, Send, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { isApplicationDeadlineExpired } from "@/lib/job-deadline";
import { loadSavedJobIdsForSession, SAVED_JOBS_UPDATED_EVENT, toggleSavedJobForSession } from "@/lib/saved-jobs";
import type { JobCardProps, TalentJobStage } from "./JobCard";

function formatDisplayBudget(budgetStr?: string | null) {
  if (!budgetStr) return "";
  return String(budgetStr)
    .replace(/ triệu\/ngày\s*-\s*/gi, " - ")
    .replace(/ k\/ngày\s*-\s*/gi, " - ")
    .replace(/ đ\/ngày\s*-\s*/gi, " - ");
}

function getStatusBadge(stage: TalentJobStage, isApplied: boolean) {
  if (stage === "approved") return { label: "Đã duyệt", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-200 dark:text-emerald-700" };
  if (stage === "pending" || isApplied) return { label: "Chờ duyệt", className: "bg-amber-50 text-amber-700 dark:bg-amber-100 dark:text-amber-700" };
  return { label: "Đang tuyển", className: "bg-[#FFF1EF] text-[#9B1215] dark:bg-emerald-100 dark:text-emerald-600" };
}

function getDeadlineLabel(value: string | null | undefined, formatDate: JobCardProps["formatDate"]) {
  if (!value) return "Không có hạn";

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return formatDate(value);

  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "Đã hết hạn";

  const hours = Math.ceil(diffMs / (1000 * 60 * 60));
  if (hours < 24) return `Còn ${hours} giờ`;

  const days = Math.ceil(hours / 24);
  return `Còn ${days} ngày`;
}

function getApplicantText(job: any) {
  const current = Number(job.appliedCount ?? job.applicants_count ?? job.applicantCount ?? job.applicants?.length ?? 0);
  const limit = Number(job.maxApplicants ?? job.max_applicants ?? job.quantity ?? job.slots ?? 0);
  if (!limit) return current > 0 ? String(current) : "";
  return `${Math.max(0, current)}/${limit}`;
}

export default function JobCardMobile({
  job,
  isApplied,
  stage,
  onView,
  onApply,
  formatDate,
}: JobCardProps) {
  const isExpired = isApplicationDeadlineExpired(job.applicationDeadline);
  const isOwnJob = Boolean(job.isOwner || job.is_owner || job.canApply === false || job.can_apply === false);
  const baseBadge = getStatusBadge(stage, isApplied);
  const badge =
    !isApplied && stage !== "approved" && stage !== "pending" && isExpired
      ? { label: "Đã hết hạn", className: "bg-[#FFF7F6] text-[#7B6866] dark:bg-slate-200 dark:text-slate-600" }
      : baseBadge;
  const deadlineLabel = getDeadlineLabel(job.applicationDeadline, formatDate);
  const applicantText = getApplicantText(job);
  const budgetText = formatDisplayBudget(job.budget);
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

  const handlePrimaryAction = (event: MouseEvent) => {
    stopCardClick(event);
    if (isOwnJob || (!isApplied && isExpired)) return;
    if (!isApplied) {
      onApply(job);
      return;
    }
    onView(job);
  };

  const handleSaveClick = async (event: MouseEvent) => {
    stopCardClick(event);
    if (isSavingSavedJob || isOwnJob) return;

    setIsSavingSavedJob(true);
    try {
      const result = await toggleSavedJobForSession(job);
      setIsSaved(result.isSaved);
    } finally {
      setIsSavingSavedJob(false);
    }
  };

  return (
    <article
      onClick={() => onView(job)}
      className="group min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-[#F0D7D3] bg-white p-1.5 text-[#191116] transition hover:border-[#C72524]/40 active:scale-[0.99] dark:rounded-xl dark:border-[#262B38] dark:bg-[#10131D] dark:text-white dark:hover:border-[#C9A86A]/35"
    >
      <div className="relative aspect-[1.22/1] w-full overflow-hidden rounded-xl border border-[#F2DCD8] bg-[#FFF7F6] dark:rounded-lg dark:border-white/5 dark:bg-slate-900">
        <img
          src={job.coverUrl || "/brand_cover_default.png"}
          alt={job.title || "Việc làm"}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/brand_cover_default.png";
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent dark:from-slate-950/25 dark:to-slate-950/10" />
        <span className={cn("absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-black", badge.className)}>
          {badge.label}
        </span>
      </div>

      <div className="px-0.5 pt-2">
        <h3 className="line-clamp-2 min-h-[34px] text-[13px] font-black leading-tight tracking-tight text-[#191116] dark:text-white">
          {job.title}
        </h3>

        <div className="mt-1.5 space-y-1 text-[10.5px] font-semibold leading-tight text-[#574D54] dark:text-slate-400">
          <div className="flex min-w-0 items-center gap-1.5">
            <CalendarClock className="h-3 w-3 shrink-0 text-[#8F0709] dark:text-slate-500" />
            <span className="truncate">{deadlineLabel}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0 text-[#8F0709] dark:text-slate-500" />
            <span className="truncate">{job.city || "Toàn quốc"}</span>
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            {job.hasBudget && budgetText ? (
              <p className="flex min-w-0 items-center gap-1 truncate text-[13px] font-black leading-tight text-[#8F0709] dark:text-[#F5D76E]">
                <CircleDollarSign className="h-3.5 w-3.5 shrink-0 text-[#8F0709] dark:text-[#FFD500]" />
                {budgetText}
              </p>
            ) : (
              <p className="flex min-w-0 items-center gap-1 truncate text-[12px] font-black leading-tight text-[#8F0709] dark:text-[#F5D76E]">
                <CircleDollarSign className="h-3.5 w-3.5 shrink-0 text-[#8F0709] dark:text-[#FFD500]" />
                Thỏa thuận
              </p>
            )}
          </div>

          {applicantText && (
            <div className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-[#574D54] dark:text-slate-400">
              <Users className="h-3 w-3" />
              <span>{applicantText}</span>
            </div>
          )}
        </div>

        <div className="mt-2 grid grid-cols-[0.9fr_1.1fr] gap-1.5">
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isOwnJob}
            className={cn(
              "flex h-8 min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 text-[8.5px] font-black tracking-normal transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
              isSaved
                ? "border border-[#8F0709] bg-[#FFF0EE] text-[#8F0709] dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-400"
                : "border border-[#F0D7D3] bg-white text-[#574D54] hover:border-[#8F0709] hover:text-[#8F0709] dark:border-white/10 dark:bg-white/8 dark:text-slate-200"
            )}
            aria-label={isSaved ? "Bỏ lưu job" : "Lưu job"}
            title={isSaved ? "Bỏ lưu job" : "Lưu job"}
          >
            <Bookmark className={cn("h-3.5 w-3.5 shrink-0", isSaved && "fill-current")} />
            <span className="truncate">{isSaved ? "Đã lưu" : "Lưu"}</span>
          </button>
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={isOwnJob || (!isApplied && isExpired) || (isApplied && stage !== "approved")}
            className={cn(
              "flex h-8 min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 text-[8.5px] font-black tracking-normal transition active:scale-95 disabled:cursor-not-allowed",
              !isApplied && isExpired
                ? "border border-[#E6D6D2] bg-[#F7F1F0] text-[#8F7C78] dark:border-slate-500/25 dark:bg-slate-500/15 dark:text-slate-400"
                : !isApplied
                ? "light-force-white bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-white dark:from-amber-100 dark:via-[#C9A86A] dark:to-yellow-600 dark:text-slate-950"
                : stage === "approved"
                  ? "border border-emerald-500/35 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "border border-amber-500/35 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
            )}
          >
            {isOwnJob ? <Check className="h-3.5 w-3.5" /> : !isApplied ? <Send className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            <span className="truncate">{!isApplied ? (isExpired ? "Hết hạn" : "Ứng tuyển") : stage === "approved" ? "Duyệt" : "Chờ"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
