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
  if (stage === "approved") return { label: "Đã duyệt", className: "bg-emerald-200 text-emerald-700" };
  if (stage === "pending" || isApplied) return { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" };
  return { label: "Đang tuyển", className: "bg-emerald-100 text-emerald-600" };
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
  const baseBadge = getStatusBadge(stage, isApplied);
  const badge =
    !isApplied && stage !== "approved" && stage !== "pending" && isApplicationDeadlineExpired(job.applicationDeadline)
      ? { label: "Đã hết hạn", className: "bg-slate-200 text-slate-600" }
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
    if (!isApplied) {
      onApply(job);
      return;
    }
    onView(job);
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

  return (
    <article
      onClick={() => onView(job)}
      className="group min-w-0 cursor-pointer overflow-hidden rounded-xl border border-[#262B38] bg-[#10131D] p-1.5 text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition hover:border-[#C9A86A]/35 active:scale-[0.99]"
    >
      <div className="relative aspect-[1.22/1] w-full overflow-hidden rounded-lg border border-white/5 bg-slate-900">
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-slate-950/10" />
        <span className={cn("absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-black", badge.className)}>
          {badge.label}
        </span>
      </div>

      <div className="px-0.5 pt-2">
        <h3 className="line-clamp-2 min-h-[34px] text-[13px] font-black leading-tight tracking-tight text-white">
          {job.title}
        </h3>

        <div className="mt-1.5 space-y-1 text-[10.5px] font-semibold leading-tight text-slate-400">
          <div className="flex min-w-0 items-center gap-1.5">
            <CalendarClock className="h-3 w-3 shrink-0 text-slate-500" />
            <span className="truncate">{deadlineLabel}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0 text-slate-500" />
            <span className="truncate">{job.city || "Toàn quốc"}</span>
          </div>
        </div>

        {job.type && (
          <p className="mt-1.5 truncate text-[9px] font-black uppercase tracking-wider text-[#C9A86A]">
            {job.type}
          </p>
        )}

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            {job.hasBudget && budgetText ? (
              <p className="flex min-w-0 items-center gap-1 truncate text-[13px] font-black leading-tight text-[#F5D76E]">
                <CircleDollarSign className="h-3.5 w-3.5 shrink-0 text-[#FFD500]" />
                {budgetText}
              </p>
            ) : (
              <p className="flex min-w-0 items-center gap-1 truncate text-[12px] font-black leading-tight text-[#F5D76E]">
                <CircleDollarSign className="h-3.5 w-3.5 shrink-0 text-[#FFD500]" />
                Thỏa thuận
              </p>
            )}
          </div>

          {applicantText && (
            <div className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-slate-400">
              <Users className="h-3 w-3" />
              <span>{applicantText}</span>
            </div>
          )}
        </div>

        <div className="mt-2 grid grid-cols-[0.9fr_1.1fr] gap-1.5">
          <button
            type="button"
            onClick={handleSaveClick}
            className={cn(
              "flex h-8 min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 text-[8.5px] font-black tracking-normal transition active:scale-95",
              isSaved
                ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                : "border border-white/10 bg-white/8 text-slate-200"
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
            disabled={isApplied && stage !== "approved"}
            className={cn(
              "flex h-8 min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 text-[8.5px] font-black tracking-normal transition active:scale-95 disabled:cursor-not-allowed",
              !isApplied
                ? "bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950"
                : stage === "approved"
                  ? "border border-emerald-500/35 bg-emerald-500/15 text-emerald-300"
                  : "border border-amber-500/35 bg-amber-500/15 text-amber-300"
            )}
          >
            {!isApplied ? <Send className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            <span className="truncate">{!isApplied ? "Ứng tuyển" : stage === "approved" ? "Duyệt" : "Chờ"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
