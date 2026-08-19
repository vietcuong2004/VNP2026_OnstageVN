"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock,
  DollarSign,
  Gift,
  Info,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  applyTalentCampaign,
  loadTalentCampaignDetail,
  loadTalentCampaignsPage,
} from "@/lib/talent-api";
import { loadSavedJobIdsForSession, toggleSavedJobForSession } from "@/lib/saved-jobs";
import { isApplicationDeadlineExpired } from "@/lib/job-deadline";
import { useGuestActionPrompt } from "@/components/guest-action-prompt";
import EventInformationSection from "./EventInformationSection";
import JobImagesSection from "./JobImagesSection";
import JobInfoSection from "./JobInfoSection";
import RecruitmentPositionsSection from "./RecruitmentPositionsSection";

const JOBS_PAGE_STATE_KEY = "vnp_jobs_page_state";

function statusMeta(stage: string, isApplied: boolean) {
  if (["approved", "accepted", "executing", "completed", "confirmed", "done", "hired", "selected"].includes(String(stage || "").toLowerCase())) {
    return { label: "Đã duyệt", className: "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30 border-0" };
  }

  if (stage === "pending" || stage === "new" || (isApplied && !stage)) {
    return { label: "Chờ duyệt", className: "bg-yellow-400 text-slate-950 font-black shadow-lg shadow-yellow-400/30 border-0" };
  }

  return { label: "Ứng tuyển", className: "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 border-0" };
}

function normalizeApplicationStage(value?: string | null) {
  const stage = String(value || "").toLowerCase().trim();
  if (!stage) return "";
  if (["approved", "accepted", "executing", "completed", "confirmed", "done", "hired", "selected"].includes(stage)) return "approved";
  return "pending";
}

function formatDate(isoDate?: string | null, timeStr?: string | null) {
  if (!isoDate) return "";
  const raw = String(isoDate).trim();
  if (!raw) return "";

  let extractedTime = "";

  if (raw.includes("T") || raw.includes(" ")) {
    const timeMatch = raw.match(/[T ](\d{2}:\d{2})(:\d{2})?/);
    if (timeMatch && timeMatch[1] && timeMatch[1] !== "00:00") {
      extractedTime = timeMatch[1];
    }
  }

  const finalTime = timeStr && timeStr.trim() ? timeStr.trim() : extractedTime;

  const dateOnly = raw.split(/[T ]/)[0];
  const [year, month, day] = dateOnly.split("-");
  if (!year || !month || !day) return raw;

  const formattedDate = `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  return finalTime ? `${formattedDate} ${finalTime}` : formattedDate;
}

function getTimeText(dateValue?: string | null, timeValue?: string | null) {
  if (timeValue && timeValue.trim()) return timeValue.trim();
  const raw = String(dateValue || "").trim();
  const timeMatch = raw.match(/[T ](\d{2}:\d{2})(:\d{2})?/);
  return timeMatch?.[1] && timeMatch[1] !== "00:00" ? timeMatch[1] : "Có thể cập nhật sau";
}

function formatDateTimeRangePoint(dateValue?: string | null, timeValue?: string | null) {
  const raw = String(dateValue || "").trim();
  const dateOnly = raw.split(/[T ]/)[0];
  const [year, month, day] = dateOnly.split("-");
  const dateText = year && month && day ? `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}` : raw;
  const timeText = getTimeText(dateValue, timeValue);

  if (!dateText && !timeText) return "Có thể cập nhật sau";
  if (!dateText) return timeText;
  if (!timeText || timeText === "Có thể cập nhật sau") return dateText;

  return `${timeText} ${dateText}`;
}

function formatDateTimeRangeLabel(startValue: string, endValue: string) {
  if (!startValue || startValue === "Có thể cập nhật sau") return endValue || "Có thể cập nhật sau";
  if (!endValue || endValue === "Có thể cập nhật sau") return startValue;
  return `${startValue} - ${endValue}`;
}

function sentenceCase(text: string) {
  if (!text) return "";
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

type RecruitmentPosition = {
  id: string;
  title: string;
  count: number;
  requirements: string[];
};

function toRequirementList(value: any): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|[;•]/)
      .map((item) => item.replace(/^[-\s]+/, "").trim())
      .filter(Boolean);
  }

  return [];
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const { requireAuthAction, GuestActionPrompt } = useGuestActionPrompt();

  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [stage, setStage] = useState<string>("new");
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{ id: string; msg: string; tone?: "success" | "error" }[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerCarouselRef = useRef<HTMLDivElement>(null);

  const handleBannerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (!target.clientWidth) return;
    const index = Math.round(target.scrollLeft / target.clientWidth);
    if (index !== activeBannerIndex && index >= 0 && index < allMediaImages.length) {
      setActiveBannerIndex(index);
    }
  };

  const handleScrollBannerPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!bannerCarouselRef.current) return;
    const nextIndex = (activeBannerIndex - 1 + allMediaImages.length) % allMediaImages.length;
    setActiveBannerIndex(nextIndex);
    bannerCarouselRef.current.scrollTo({
      left: nextIndex * bannerCarouselRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const handleScrollBannerNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!bannerCarouselRef.current) return;
    const nextIndex = (activeBannerIndex + 1) % allMediaImages.length;
    setActiveBannerIndex(nextIndex);
    bannerCarouselRef.current.scrollTo({
      left: nextIndex * bannerCarouselRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handlePrevImage = () => {
    if (previewImageIndex === null || allMediaImages.length <= 1) return;
    setPreviewImageIndex((previewImageIndex - 1 + allMediaImages.length) % allMediaImages.length);
  };

  const handleNextImage = () => {
    if (previewImageIndex === null || allMediaImages.length <= 1) return;
    setPreviewImageIndex((previewImageIndex + 1) % allMediaImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNextImage();
    } else if (diff < -50) {
      handlePrevImage();
    }
  };

  const addToast = (msg: string, tone: "success" | "error" = "success") => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, msg, tone }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  };

  useEffect(() => {
    if (!jobId) return;

    let isMounted = true;
    setIsLoading(true);

    async function fetchJobDetail() {
      try {
        // Try fetching single detail first
        let data = await loadTalentCampaignDetail(jobId);

        // Fallback to searching in list if single detail API returns null
        if (!data) {
          const pageRes = await loadTalentCampaignsPage({ page: 1, perPage: 100 });
          const found = (pageRes.data || []).find(
            (item: any) => String(item.id) === String(jobId) || item.slug === jobId
          );
          if (found) data = found;
        }

        if (isMounted) {
          if (data) {
            setJob(data);
            setIsApplied(Boolean(data.hasApplied || data.application));
            setStage(normalizeApplicationStage(data.application?.status) || (data.hasApplied ? "pending" : "recruiting"));
          } else {
            setJob(null);
          }
        }
      } catch (error) {
        console.warn(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchJobDetail();

    loadSavedJobIdsForSession()
      .then((ids) => {
        if (isMounted) setIsSaved(ids.includes(String(jobId)));
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  const allMediaImages = useMemo(() => {
    if (!job) return [];
    const list: { url: string; caption?: string }[] = [];
    const addUrl = (url?: string | null, caption?: string) => {
      if (!url || typeof url !== "string") return;
      const trimmed = url.trim();
      if (trimmed && !list.some((item) => item.url === trimmed)) {
        list.push({ url: trimmed, caption: caption || job.title });
      }
    };

    addUrl(job.coverUrl);
    addUrl(job.cover_url);
    addUrl(job.cover);
    addUrl(job.image);
    addUrl(job.imageUrl);

    const checkArray = (arr: any) => {
      if (Array.isArray(arr)) {
        arr.forEach((m: any) => {
          if (typeof m === "string") {
            addUrl(m);
          } else if (m && typeof m === "object") {
            addUrl(m.url || m.path || m.src || m.image_url, m.caption);
          }
        });
      }
    };

    checkArray(job.media);
    checkArray(job.photos);
    checkArray(job.images);
    checkArray(job.detail?.media);

    if (list.length === 0) {
      list.push({ url: "/brand_cover_default.png", caption: job?.title || "Bìa chiến dịch" });
    }

    if (list.length > 1) {
      const customs = list.filter(
        (item) =>
          item.url !== "/brand_cover_default.png" &&
          item.url !== "brand_cover_default.png" &&
          item.url !== "/brand_cover_default"
      );
      if (customs.length > 0) {
        return customs;
      }
    }

    return list;
  }, [job]);

  const handleBack = () => {
    if (typeof window !== "undefined" && sessionStorage.getItem(JOBS_PAGE_STATE_KEY)) {
      router.push("/talent/jobs?restore=1");
    } else if (typeof window !== "undefined" && document.referrer.includes("/talent/jobs")) {
      router.back();
    } else {
      router.push("/talent/jobs");
    }
  };

  const handleToggleBookmark = async () => {
    if (!job) return;
    if (isOwnJob) {
      addToast("Bạn không thể lưu job do chính mình tạo.", "error");
      return;
    }
    try {
      const res = await toggleSavedJobForSession(job);
      setIsSaved(res.isSaved);
      addToast(res.isSaved ? "Đã lưu công việc thành công!" : "Đã bỏ lưu công việc thành công!", res.isSaved ? "success" : "error");
    } catch (err) {
      console.error(err);
      addToast("Chưa thể lưu công việc này.", "error");
    }
  };

  const handleApply = async () => {
    if (!job) return;
    if (isOwnJob) {
      addToast("Bạn không thể ứng tuyển job do chính mình tạo.", "error");
      return;
    }
    if (isApplicationDeadlineExpired(job.applicationDeadline || job.deadline)) {
      addToast("Công việc đã hết hạn ứng tuyển.", "error");
      return;
    }
    if (!requireAuthAction({
      actionLabel: `Ứng tuyển chiến dịch "${job.title}"`,
      description: "Bạn cần đăng nhập tài khoản Idol để ứng tuyển chiến dịch này và kết nối với Đối tác.",
    })) {
      return;
    }
    try {
      await applyTalentCampaign(job.id);
      setIsApplied(true);
      setStage("pending");
      addToast("Ứng tuyển chiến dịch thành công!", "success");
    } catch (err) {
      console.error(err);
      addToast(err instanceof Error ? err.message : "Chưa thể ứng tuyển chiến dịch này.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFCFA] dark:bg-[#080a12] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C72524] border-t-transparent dark:border-amber-400 dark:border-t-transparent" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8F0709] dark:text-slate-400">Đang tải chi tiết công việc...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#FFFCFA] dark:bg-[#080a12] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 rounded-3xl border border-[#E8C8C2] bg-white p-8 shadow-[0_18px_40px_rgba(143,7,9,0.08)] dark:border-[#1a2238] dark:bg-[#0c101d]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 mx-auto">
            <Info className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase">Không tìm thấy công việc</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Công việc này có thể đã bị gỡ bỏ hoặc link không còn tồn tại.
          </p>
          <button
            onClick={handleBack}
            className="light-force-white w-full py-3 rounded-xl bg-gradient-to-r from-[#8F0709] via-[#C72524] to-[#D85E5A] text-white dark:from-amber-300 dark:via-amber-400 dark:to-yellow-500 dark:text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer"
          >
            Quay lại danh sách công việc
          </button>
        </div>
      </div>
    );
  }

  const status = statusMeta(stage, isApplied);
  const detail = job.detail || {};
  const requirements = toRequirementList(detail.requirements);
  const benefits = detail.benefits || [];
  const industryPills = Array.isArray(job.industries)
    ? job.industries.map((item: unknown) => String(item || "").trim()).filter(Boolean)
    : [];
  const deadline = job.applicationDeadline || job.deadline;
  const isExpired = isApplicationDeadlineExpired(deadline);
  const isOwnJob = Boolean(job.isOwner || job.is_owner || job.canApply === false || job.can_apply === false);
  const onstageTime = job.onstageTime || job.eventTime || job.onstage_time || job.event_time || "";
  const rawRecruitmentPositions =
    (Array.isArray(detail.recruitmentPositions) && detail.recruitmentPositions) ||
    (Array.isArray(detail.positions) && detail.positions) ||
    (Array.isArray(detail.jobPositions) && detail.jobPositions) ||
    (Array.isArray((job as any).recruitmentPositions) && (job as any).recruitmentPositions) ||
    (Array.isArray((job as any).positions) && (job as any).positions) ||
    [];
  const recruitmentPositions: RecruitmentPosition[] =
    rawRecruitmentPositions.length > 0
      ? rawRecruitmentPositions.map((position: any, index: number) => {
        const positionRequirements =
          toRequirementList(position.requirements).length > 0
            ? toRequirementList(position.requirements)
            : toRequirementList(position.requirement);

        return {
          id: String(position.id || position.slug || `position-${index}`),
          title: position.talent_type_name || position.talent_type || position.title || position.name || position.role || position.type || `Vị trí ${index + 1}`,
          count: Number(position.count || position.quantity || position.headcount || position.slots || position.needed || 1),
          requirements: positionRequirements.length > 0 ? positionRequirements : ["Không có yêu cầu đặc biệt"],
        };
      })
      : [];
  const recruitmentTotal = recruitmentPositions.reduce((sum, position) => sum + position.count, 0);
  const startText = job.startDate ? formatDate(job.startDate, job.startTime || null) : "Không có";
  const endText = job.endDate ? formatDate(job.endDate, job.endTime || null) : "Không có";
  const rawEventSchedules = Array.isArray((job as any).events)
    ? (job as any).events
    : Array.isArray((job as any).eventSchedules)
      ? (job as any).eventSchedules
      : [];
  const eventSchedules: Array<{
    id: string;
    title: string;
    timeText: string;
    startText: string;
    endText: string;
    location: string;
    note: string;
  }> = rawEventSchedules.length > 0
    ? rawEventSchedules.map((event: any, index: number) => {
      const eventDate = event.event_date || event.eventDate || event.date || event.start_at || event.starts_at || event.startsAt || "";
      const eventStartDate = event.start_at || event.start_date || event.startDate || event.starts_at || event.startsAt || eventDate;
      const eventEndDate = event.end_at || event.end_date || event.endDate || event.ends_at || event.endsAt || eventDate;
      const eventStartTime = event.start_time || event.startTime || "";
      const eventEndTime = event.end_time || event.endTime || "";
      const contentList = toRequirementList(event.content);
      const eventNote = contentList.length > 0
        ? contentList.join("\n")
        : String(event.note || event.event_note || event.eventNote || event.description || "").trim();
      return {
        id: String(event.id || `${eventDate}-${index}`),
        title: event.event_name || event.eventName || event.name || event.title || `Sự kiện ${index + 1}`,
        startText: formatDateTimeRangePoint(eventStartDate, eventStartTime),
        endText: formatDateTimeRangePoint(eventEndDate, eventEndTime),
        timeText: formatDateTimeRangeLabel(
          formatDateTimeRangePoint(eventStartDate, eventStartTime),
          formatDateTimeRangePoint(eventEndDate, eventEndTime)
        ),
        location: event.location || event.address || job.location || "",
        note: eventNote,
      };
    })
    : [];

  const renderFooterAction = () => {
    if (isOwnJob) {
      return (
        <button disabled className="px-8 py-3 rounded-xl font-display text-xs sm:text-sm font-bold bg-slate-500/15 border border-slate-500/25 text-slate-400 cursor-not-allowed uppercase tracking-wider">
          Job của bạn
        </button>
      );
    }
    if (!isApplied && isExpired) {
      return (
        <button disabled className="px-8 py-3 rounded-xl font-display text-xs sm:text-sm font-bold bg-slate-500/15 border border-slate-500/25 text-slate-400 cursor-not-allowed uppercase tracking-wider">
          Đã hết hạn
        </button>
      );
    }

    if (!isApplied) {
      return (
        <button
          onClick={handleApply}
          className="light-force-white px-8 py-3 rounded-xl font-display text-xs sm:text-sm font-black bg-gradient-to-r from-[#8F0709] via-[#C72524] to-[#D85E5A] text-white shadow-[0_12px_26px_rgba(199,37,36,0.24)] hover:shadow-[0_14px_30px_rgba(199,37,36,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all uppercase tracking-wider dark:from-amber-300 dark:via-amber-400 dark:to-yellow-500 dark:text-slate-950 dark:shadow-[0_0_20px_rgba(245,158,11,0.3)] dark:hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
        >
          Ứng tuyển ngay
        </button>
      );
    }

    if (stage === "pending") {
      return (
        <button disabled className="px-8 py-3 rounded-xl font-display text-xs sm:text-sm font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 cursor-not-allowed uppercase tracking-wider">
          Chờ duyệt
        </button>
      );
    }

    return (
      <button disabled className="px-8 py-3 rounded-xl font-display text-xs sm:text-sm font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-not-allowed uppercase tracking-wider">
        Đã duyệt
      </button>
    );
  };

  const renderDesktopSaveAction = () => (
    <button
      type="button"
      onClick={handleToggleBookmark}
      disabled={isOwnJob}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-display text-xs sm:text-sm font-black border shadow-[0_0_18px_rgba(0,0,0,0.25)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-50",
        isSaved
          ? "light-force-white border-[#C72524]/70 bg-[#C72524] text-white dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "border-[#E8C8C2] bg-white text-[#8F0709] hover:border-[#C72524]/45 hover:bg-[#FFF3F1] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:border-amber-400/35 dark:hover:text-amber-200"
      )}
    >
      <Bookmark className={cn("h-4 w-4", isSaved && "fill-white dark:fill-emerald-300")} />
      {isSaved ? "Đã lưu công việc" : "Lưu công việc"}
    </button>
  );

  const renderMobileFooterAction = () => {
    if (isOwnJob) {
      return (
        <button disabled className="flex-1 py-3 rounded-xl font-display text-xs font-bold bg-slate-500/15 border border-slate-500/25 text-slate-400 cursor-not-allowed uppercase tracking-wider text-center justify-center">
          Job của bạn
        </button>
      );
    }

    if (!isApplied && isExpired) {
      return (
        <button disabled className="flex-1 py-3 rounded-xl font-display text-xs font-bold bg-slate-500/15 border border-slate-500/25 text-slate-400 cursor-not-allowed uppercase tracking-wider text-center justify-center">
          Đã hết hạn
        </button>
      );
    }

    if (!isApplied) {
      return (
        <button
          onClick={handleApply}
          className="light-force-white flex-1 py-3 rounded-xl font-display text-xs font-black bg-gradient-to-r from-[#8F0709] via-[#C72524] to-[#D85E5A] text-white shadow-[0_12px_26px_rgba(199,37,36,0.24)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all uppercase tracking-widest text-center justify-center items-center dark:from-amber-300 dark:via-amber-400 dark:to-yellow-500 dark:text-slate-950 dark:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
        >
          Ứng tuyển ngay
        </button>
      );
    }

    if (stage === "pending") {
      return (
        <button disabled className="flex-1 py-3 rounded-xl font-display text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 cursor-not-allowed uppercase tracking-wider text-center justify-center">
          Chờ duyệt
        </button>
      );
    }

    return (
      <button disabled className="flex-1 py-3 rounded-xl font-display text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-not-allowed uppercase tracking-wider text-center justify-center">
        Đã duyệt
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFCFA] text-[#191116] dark:bg-[#080a12] dark:text-slate-100 flex flex-col justify-between selection:bg-[#C72524] selection:text-white dark:selection:bg-amber-400 dark:selection:text-slate-950">

      <div className="sticky top-0 z-30 -mt-5 md:-mt-7 lg:-mt-8 -mx-4 md:-mx-8 lg:-mx-10 px-4 md:px-8 lg:px-10 pt-3 bg-transparent pointer-events-none flex items-center justify-between h-0 overflow-visible">
        <button
          type="button"
          onClick={handleBack}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E8C8C2] bg-white/90 backdrop-blur-md text-[#8F0709] shadow-[0_8px_22px_rgba(143,7,9,0.12)] transition-all duration-300 hover:border-[#C72524]/45 hover:bg-[#FFF3F1] active:scale-95 cursor-pointer dark:border-amber-500/30 dark:bg-[#0c1120]/85 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-[#0c1120] dark:hover:border-amber-500/50 dark:shadow-[0_4px_15px_rgba(0,0,0,0.4)]"
          aria-label="Quay lại"
          title="Quay lại"
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
        </button>

        <button
          type="button"
          onClick={handleToggleBookmark}
          className={cn(
            "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E8C8C2] bg-white/90 backdrop-blur-md text-[#8F0709] shadow-[0_8px_22px_rgba(143,7,9,0.12)] transition-all duration-300 active:scale-95 cursor-pointer dark:border-amber-500/30 dark:bg-[#0c1120]/85 dark:shadow-[0_4px_15px_rgba(0,0,0,0.4)]",
            isSaved
              ? "light-force-white border-[#C72524]/60 bg-[#C72524] text-white shadow-[0_10px_24px_rgba(199,37,36,0.22)] dark:border-amber-400 dark:bg-amber-400/20 dark:text-amber-300 dark:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              : "border-[#E8C8C2] text-[#8F0709] hover:text-[#C72524] hover:bg-[#FFF3F1] hover:border-[#C72524]/45 dark:border-amber-500/30 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-[#0c1120] dark:hover:border-amber-500/50"
          )}
          aria-label={isSaved ? "Bỏ lưu công việc" : "Lưu công việc"}
          title={isSaved ? "Bỏ lưu công việc" : "Lưu công việc"}
        >
          <Bookmark className={cn("h-5 w-5 shrink-0", isSaved && "fill-white dark:fill-amber-400")} />
        </button>
      </div>

      <JobImagesSection
        images={allMediaImages}
        jobTitle={job.title}
        previewImageIndex={previewImageIndex}
        bannerCarouselRef={bannerCarouselRef}
        onBannerScroll={handleBannerScroll}
        onOpenPreview={setPreviewImageIndex}
        onClosePreview={() => setPreviewImageIndex(null)}
        onBannerPrev={handleScrollBannerPrev}
        onBannerNext={handleScrollBannerNext}
        onPreviewPrev={handlePrevImage}
        onPreviewNext={handleNextImage}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Content Body Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-10 py-6 space-y-6 flex-1">

        {/* Title & Brand Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {industryPills.length > 0 ? (
              industryPills.map((industry: string) => (
                <span
                  key={industry}
                  className="rounded-md border border-[#E8C8C2] bg-[#FFF3F1] px-2.5 py-0.5 text-[10px] sm:text-xs font-extrabold text-[#8F0709] uppercase dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300"
                >
                  {industry}
                </span>
              ))
            ) : (
              <span className="rounded-md border border-[#E8C8C2] bg-[#FFF3F1] px-2.5 py-0.5 text-[10px] sm:text-xs font-extrabold text-[#8F0709] uppercase dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300">
                Chưa phân loại
              </span>
            )}
            {job.matchScore && (
              <span className="flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> AI Phù hợp {job.matchScore}%
              </span>
            )}
          </div>

          <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#7A1114] uppercase leading-tight tracking-tight dark:text-white">
            {job.title || "Không có tiêu đề"}
          </h1>

          <p className="text-xs sm:text-sm text-[#574D54] font-semibold flex items-center gap-1.5 dark:text-slate-400">
            <span className="text-[#8F0709] uppercase tracking-wider text-[10px] sm:text-xs font-bold dark:text-slate-500">Thương hiệu:</span>
            <span className="text-[#B31317] font-bold dark:text-amber-300">{job.brand || "Không có"}</span>
          </p>

          {/* Key Metrics Highlight Cards */}
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="light-force-white relative overflow-hidden rounded-2xl border border-[#C72524]/20 bg-gradient-to-br from-[#8F0709] via-[#C72524] to-[#D85E5A] p-4 flex flex-col justify-between space-y-1.5 shadow-[0_12px_28px_rgba(143,7,9,0.14)] dark:border-amber-500/25 dark:bg-gradient-to-br dark:from-amber-500/10 dark:via-[#0e1322] dark:to-[#080a12]">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white dark:text-amber-400">
                <DollarSign className="h-4 w-4 text-current shrink-0 dark:text-amber-400" />
                Thù lao
              </div>
              <div className="font-mono font-black text-sm sm:text-base text-white whitespace-nowrap dark:text-amber-300">
                {job.hasBudget && job.budget ? job.budget : "Không có"}
              </div>
            </div>

            <div className="rounded-2xl border border-[#F0D6D0] bg-white p-4 flex flex-col justify-between space-y-1.5 shadow-[0_12px_28px_rgba(143,7,9,0.06)] sm:col-span-2 lg:col-span-1 dark:border-[#1b233a] dark:bg-[#0c101d] dark:shadow-none">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#8F0709] dark:text-slate-400">
                <Clock className="h-4 w-4 text-[#B9861B] shrink-0 dark:text-amber-400" />
                Hạn ứng tuyển
              </div>
              <div className="font-semibold text-xs sm:text-sm text-[#191116] dark:text-slate-100">
                {deadline ? formatDate(deadline) : "Không có"}
              </div>
            </div>

            <div className="rounded-2xl border border-[#F0D6D0] bg-white p-4 flex flex-col justify-between space-y-1.5 shadow-[0_12px_28px_rgba(143,7,9,0.06)] dark:border-[#1b233a] dark:bg-[#0c101d] dark:shadow-none">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#8F0709] dark:text-slate-400">
                <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                Địa điểm làm việc
              </div>
              <div className="min-w-0 font-semibold text-xs sm:text-sm text-[#191116] break-words [overflow-wrap:anywhere] dark:text-slate-100" title={job.location || "Không có"}>
                {job.location || "Không có"}
              </div>
            </div>


            <div className="rounded-2xl border border-[#F0D6D0] bg-white p-4 flex flex-col justify-between space-y-1.5 shadow-[0_12px_28px_rgba(143,7,9,0.06)] dark:border-[#1b233a] dark:bg-[#0c101d] dark:shadow-none">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#8F0709] dark:text-slate-400">
                <Clock className="h-4 w-4 text-[#B9861B] shrink-0 dark:text-amber-400" />
                Thời gian onstage
              </div>
              <div className="font-semibold text-xs sm:text-sm text-[#191116] dark:text-slate-100">
                {onstageTime || "Không có"}
              </div>
            </div>
          </div>
          {/* Desktop Only Action Button */}
          <div className="hidden md:flex justify-center gap-3 pt-3">
            {renderFooterAction()}
            {renderDesktopSaveAction()}
          </div>
        </div>

        {/* Campaign Brief */}
        <div className="rounded-2xl border border-[#F0D6D0] bg-white p-5 space-y-2.5 shadow-[0_12px_28px_rgba(143,7,9,0.06)] dark:border-[#1b233a] dark:bg-[#0c101d] dark:shadow-none">
          <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#7A1114] uppercase tracking-wider border-b border-[#F0D6D0] pb-2.5 dark:border-[#151b2d] dark:text-white">
            <Info className="h-4 w-4 text-amber-400" /> Mô tả công việc
          </h4>
          <p className="text-xs sm:text-sm text-[#574D54] leading-relaxed font-normal whitespace-pre-line dark:text-slate-300">
            {job.brief || job.description || "Không có"}
          </p>
        </div>

        <JobInfoSection
          job={job}
          benefits={benefits}
          startText={startText}
          endText={endText}
          showAllBenefits={showAllBenefits}
          onToggleBenefits={() => setShowAllBenefits((cur) => !cur)}
        />

        {(recruitmentPositions.length > 0 || requirements.length > 0) && (
          <RecruitmentPositionsSection
            positions={recruitmentPositions}
            generalRequirements={requirements}
            total={recruitmentTotal}
          />
        )}

        {/* Brand Sponsorships */}
        {job.sponsorships && job.sponsorships.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-[#0e1322] to-[#080a12] p-5 space-y-3">
            <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wider">
              <Gift className="h-4 w-4 text-amber-400" /> Cam kết tài trợ từ Nhà tuyển dụng
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {job.sponsorships.map((spons: any, idx: number) => (
                <div key={idx} className="bg-[#080a12] border border-amber-400/20 rounded-xl p-3.5 space-y-1.5 hover:border-amber-400/40 transition-colors">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400">
                    <span>🎁</span>
                    <span>{spons.category}</span>
                  </div>
                  {spons.details && (
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                      {sentenceCase(spons.details)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {eventSchedules.length > 0 && <EventInformationSection events={eventSchedules} />}

        <div className="hidden md:flex items-center justify-center gap-3 pt-2 pb-4">
          {renderFooterAction()}
          {renderDesktopSaveAction()}
        </div>

      </div>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="mx-auto flex w-full max-w-7xl items-center px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] pt-1 md:hidden sm:px-8">
        {renderMobileFooterAction()}
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-24 right-6 z-[70] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-full px-4.5 py-2.5 text-xs font-bold shadow-2xl flex items-center gap-2.5 border backdrop-blur-md",
              t.tone === "error"
                ? "bg-[#090b14]/95 border-rose-500/30 text-rose-200"
                : "bg-[#090b14]/95 border-emerald-500/30 text-white"
            )}
          >
            {t.tone === "error" ? (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400">
                <X className="h-3.5 w-3.5 stroke-[2.5]" />
              </div>
            ) : (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
              </div>
            )}
            <span className="text-[12px] font-semibold">{t.msg}</span>
          </div>
        ))}
      </div>

      <GuestActionPrompt />
    </div>
  );
}
