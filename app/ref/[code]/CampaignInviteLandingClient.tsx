"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api-client";
import {
  applyTalentCampaign,
  resolveCampaignReferralLink,
  resolveCampaignReferralLinkBySlug,
  mapCampaignToTalentJob,
  loadTalentCampaignDetail,
} from "@/lib/talent-api";
import { isApplicationDeadlineExpired } from "@/lib/job-deadline";
import { cn } from "@/lib/utils";
import { useGuestActionPrompt } from "@/components/guest-action-prompt";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Gift,
  Info,
  MapPin,
  Sparkles,
  UserRoundPlus,
  X,
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import JobImagesSection from "@/app/talent/jobs/[id]/JobImagesSection";
import JobInfoSection from "@/app/talent/jobs/[id]/JobInfoSection";
import RecruitmentPositionsSection from "@/app/talent/jobs/[id]/RecruitmentPositionsSection";
import EventInformationSection from "@/app/talent/jobs/[id]/EventInformationSection";

type Props = {
  code?: string;
  campaignSlug?: string;
  referrerSlug?: string;
};

type CampaignInvitePayload = {
  code?: string;
  type?: string;
  campaign?: any;
  referrer?: {
    id?: number | string;
    name?: string | null;
    display_name?: string | null;
    profile?: {
      display_name?: string | null;
    } | null;
  } | null;
};

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

export default function CampaignInviteLandingClient({ code, campaignSlug, referrerSlug }: Props) {
  const router = useRouter();
  const { requireAuthAction, GuestActionPrompt } = useGuestActionPrompt();
  const [inviteData, setInviteData] = useState<CampaignInvitePayload | null>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerCarouselRef = useRef<HTMLDivElement>(null);
  const [toasts, setToasts] = useState<{ id: string; msg: string; tone?: "success" | "error" }[]>([]);

  const addToast = (msg: string, tone: "success" | "error" = "success") => {
    const id = Date.now().toString();
    setToasts((p) => [...p, { id, msg, tone }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  };

  useEffect(() => {
    let isMounted = true;

    const resolver = campaignSlug && referrerSlug
      ? resolveCampaignReferralLinkBySlug(campaignSlug, referrerSlug)
      : resolveCampaignReferralLink(String(code || ""));

    resolver
      .then(async (data) => {
        if (!isMounted) return;

        if (data?.type !== "campaign" || !data.campaign) {
          setInviteData(null);
          setError("Đường dẫn này không phải link mời campaign hợp lệ.");
          setLoading(false);
          return;
        }

        setInviteData(data as CampaignInvitePayload);
        let mappedJob = mapCampaignToTalentJob(data.campaign);

        // Enhance with full campaign detail if available
        if (data.campaign.id) {
          try {
            const detail = await loadTalentCampaignDetail(data.campaign.id);
            if (detail && isMounted) {
              mappedJob = { ...mappedJob, ...detail };
            }
          } catch (e) {
            // fallback to mappedJob
          }
        }

        if (isMounted) {
          setJob(mappedJob);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error resolving campaign invite link:", err);
        if (!isMounted) return;
        setInviteData(null);
        setError("Đường liên kết mời campaign không tồn tại, đã hết hạn hoặc chưa được kích hoạt.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [campaignSlug, code, referrerSlug]);

  const inviteStorageKey = code || (campaignSlug && referrerSlug ? `${campaignSlug}/${referrerSlug}` : "");

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

  const referrerName = inviteData?.referrer?.profile?.display_name || inviteData?.referrer?.name || "Đối tác OnstageVN";

  const clearPendingState = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("pendingCampaignInviteCode");
    localStorage.removeItem("pendingCampaignInvitePath");
    localStorage.removeItem("pendingCampaignAutoJoin");
  };

  const handleConfirmApply = async () => {
    if (!job?.id) return;

    setIsApplying(true);
    try {
      const refCode = inviteData?.code || code || campaignSlug;
      await applyTalentCampaign(job.id, "Ứng tuyển từ link giới thiệu campaign.", refCode);
      clearPendingState();
      if (typeof window !== "undefined") {
        try {
          const saved = sessionStorage.getItem("vnp_jobs_page_state");
          if (saved) {
            const parsed = JSON.parse(saved);
            parsed.selectedStageFilter = "approved";
            sessionStorage.setItem("vnp_jobs_page_state", JSON.stringify(parsed));
          }
        } catch {
          // ignore
        }
      }
      setError(null);
      router.push("/talent/jobs?stage=approved");
    } catch (err) {
      console.error(err);
      addToast(err instanceof Error ? err.message : "Không thể ứng tuyển campaign từ link giới thiệu này.", "error");
      setIsApplying(false);
    }
  };

  const handlePrimaryClick = () => {
    if (!getAuthToken()) {
      const redirectPath = `${window.location.pathname}${window.location.search}`;
      localStorage.setItem("pendingCampaignInviteCode", inviteStorageKey);
      localStorage.setItem("pendingCampaignInvitePath", redirectPath);
      localStorage.setItem("pendingCampaignAutoJoin", "1");
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    handleConfirmApply();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shouldAutoJoin = localStorage.getItem("pendingCampaignAutoJoin") === "1";
    if (!shouldAutoJoin || !getAuthToken() || !job?.id) return;

    localStorage.removeItem("pendingCampaignAutoJoin");
    handleConfirmApply();
  }, [job?.id]);

  const handleDecline = () => {
    clearPendingState();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFCFA] dark:bg-[#080a12] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C72524] border-t-transparent dark:border-amber-400 dark:border-t-transparent" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8F0709] dark:text-slate-400">Đang tải thông tin lời mời...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#FFFCFA] dark:bg-[#080a12] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 rounded-3xl border border-[#E8C8C2] bg-white p-8 shadow-[0_18px_40px_rgba(143,7,9,0.08)] dark:border-[#1a2238] dark:bg-[#0c101d]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-[#8F0709] uppercase">Liên kết không hợp lệ</h3>
          <p className="text-xs text-[#574D54] dark:text-slate-400 leading-relaxed">
            {error || "Đường liên kết mời campaign không tồn tại, đã hết hạn hoặc chưa được kích hoạt."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="light-force-white w-full py-3 rounded-xl bg-gradient-to-r from-[#8F0709] via-[#C72524] to-[#D85E5A] text-white dark:from-amber-300 dark:via-amber-400 dark:to-yellow-500 dark:text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer"
          >
            Trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FFFCFA] text-[#191116] dark:bg-[#080a12] dark:text-slate-100 flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl border border-[#F0D7D3] bg-white dark:border-[#1a2238] dark:bg-[#0c101d] p-8 shadow-2xl relative z-10 overflow-hidden text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF7EE] text-[#0A6C3B] border border-[#A6E9BD] shadow-sm">
              <Check className="h-9 w-9 stroke-[3]" />
            </div>

            <h2 className="mt-6 font-display text-xl md:text-2xl font-black uppercase tracking-wider text-[#8F0709] dark:text-white">🎉 Thành công!</h2>
            <p className="mt-2 text-xs font-bold text-[#0A6C3B] uppercase tracking-widest">Tham gia chiến dịch thành công</p>

            <div className="mt-5 rounded-2xl border border-[#F0D7D3] bg-[#FFF7F6] dark:border-[#1a2238] dark:bg-[#101424] p-4 flex items-center gap-3 text-left">
              <img
                src={job.brandLogo || "/brand_cover_default.png"}
                alt={job.brand}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/brand_cover_default.png"; }}
                className="h-11 w-11 rounded-xl object-cover border border-[#F0D7D3]"
              />
              <div className="min-w-0">
                <p className="text-sm font-black text-[#191116] dark:text-white truncate">{job.title || "Chiến dịch"}</p>
                <p className="text-[10px] text-[#574D54] dark:text-slate-400 font-semibold truncate">{job.brand} • {job.city || job.location || "Linh hoạt"}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-left text-xs text-[#574D54] dark:text-slate-300 font-medium">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0A6C3B] shrink-0" />
                <span>Bạn đã tham gia chiến dịch của {job.brand} thành công.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0A6C3B] shrink-0" />
                <span>Ghi nhận nguồn giới thiệu từ đối tác: {referrerName}.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#0A6C3B] shrink-0" />
                <span>Trạng thái tham gia hiển thị trong Workspace của bạn.</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/talent/jobs")}
              className="light-force-white mt-8 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-xs font-black uppercase tracking-widest !text-white text-white shadow-md transition hover:brightness-110 active:scale-[0.99] cursor-pointer"
            >
              Đi tới cơ hội việc làm
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const detail = job.detail || {};
  const rawReqList = detail.requirements || job.requirements || [];
  const customRequirements = (Array.isArray(rawReqList) ? rawReqList : toRequirementList(rawReqList))
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .filter((line) => {
      const lower = line.toLowerCase();
      if (lower.startsWith("chiều cao tối thiểu")) return false;
      if (lower.startsWith("cân nặng tối đa")) return false;
      if (lower.startsWith("kinh nghiệm tối thiểu")) return false;
      if (lower.includes("chưa có yêu cầu chi tiết")) return false;
      return true;
    });

  const requirements: string[] = [];
  const heightMin = job.heightMinCm || job.height_min_cm || detail.heightMinCm || detail.height_min_cm;
  const weightMax = job.weightMaxKg || job.weight_max_kg || detail.weightMaxKg || detail.weight_max_kg;
  const expMin = job.experienceMinYears || job.experience_min_years || detail.experienceMinYears || detail.experience_min_years;

  if (heightMin) requirements.push(`Chiều cao tối thiểu: ${heightMin} cm.`);
  if (weightMax) requirements.push(`Cân nặng tối đa: ${weightMax} kg.`);
  if (expMin) requirements.push(`Kinh nghiệm tối thiểu: ${expMin} năm.`);
  requirements.push(...customRequirements);
  const benefits = detail.benefits || (Array.isArray(job.benefits) ? job.benefits : toRequirementList(job.benefits));
  const industryPills = Array.isArray(job.industries)
    ? job.industries.map((item: unknown) => String(item || "").trim()).filter(Boolean)
    : [];
  const deadline = job.applicationDeadline || job.deadline;
  const isExpired = isApplicationDeadlineExpired(deadline);
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

  const renderActionButtons = (isMobile = false) => {
    if (isExpired) {
      return (
        <div className={isMobile ? "flex w-full items-center gap-3" : "flex items-center justify-center gap-3 w-full"}>
          <button disabled className={isMobile ? "flex-[1.6] h-12 rounded-full font-display text-xs font-bold bg-slate-500/15 border border-slate-500/25 text-slate-400 cursor-not-allowed uppercase tracking-wider text-center justify-center" : "px-8 py-3 rounded-full font-display text-xs sm:text-sm font-bold bg-slate-500/15 border border-slate-500/25 text-slate-400 cursor-not-allowed uppercase tracking-wider"}>
            Chiến dịch đã hết hạn
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className={isMobile ? "flex-1 h-12 rounded-full font-display text-xs font-black bg-white border border-[#E8C8C2] text-[#8F0709] hover:bg-[#FFF3F1] active:scale-[0.98] transition cursor-pointer shadow-xs text-center justify-center uppercase tracking-widest" : "inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-display text-xs sm:text-sm font-black border border-[#E8C8C2] bg-white text-[#8F0709] hover:bg-[#FFF3F1] hover:border-[#C72524] hover:text-[#C72524] shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all uppercase tracking-wider dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"}
          >
            Từ chối
          </button>
        </div>
      );
    }

    if (isMobile) {
      return (
        <div className="flex w-full items-center gap-3">
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 h-12 rounded-full bg-white border border-[#E8C8C2] text-xs font-black uppercase tracking-widest text-[#8F0709] hover:bg-[#FFF3F1] active:scale-[0.98] transition cursor-pointer shadow-xs dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"
          >
            Từ chối
          </button>
          <button
            type="button"
            onClick={handlePrimaryClick}
            className="light-force-white flex-[1.6] h-12 rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-xs font-black uppercase tracking-widest !text-white text-white active:scale-[0.98] transition flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer"
          >
            Tham gia ngay <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-3 w-full">
        <button
          type="button"
          onClick={handlePrimaryClick}
          className="light-force-white px-8 py-3 rounded-full font-display text-xs sm:text-sm font-black uppercase tracking-widest bg-gradient-to-r from-[#8F0709] via-[#C72524] to-[#D85E5A] text-white shadow-[0_12px_26px_rgba(199,37,36,0.24)] hover:shadow-[0_14px_30px_rgba(199,37,36,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all flex items-center justify-center gap-2 dark:from-amber-300 dark:via-amber-400 dark:to-yellow-500 dark:text-slate-950"
        >
          Tham gia ngay <ArrowRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleDecline}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-display text-xs sm:text-sm font-black uppercase tracking-widest bg-white border border-[#E8C8C2] text-[#8F0709] hover:bg-[#FFF3F1] hover:border-[#C72524] hover:text-[#C72524] shadow-[0_0_18px_rgba(0,0,0,0.06)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:border-amber-400/35 dark:hover:text-amber-200"
        >
          Từ chối
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFCFA] text-[#191116] dark:bg-[#080a12] dark:text-slate-100 flex flex-col justify-between selection:bg-[#C72524] selection:text-white dark:selection:bg-amber-400 dark:selection:text-slate-950 font-sans relative overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main container */}
      <main className="w-full flex-1 flex flex-col">
        {/* Carousel Image Section */}
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
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-10 py-6 pb-28 md:pb-6 space-y-6 flex-1 text-left">
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
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              <div className="light-force-white relative overflow-hidden rounded-2xl border border-[#C72524]/20 bg-gradient-to-br from-[#8F0709] via-[#C72524] to-[#D85E5A] p-4 flex min-w-0 flex-col justify-between space-y-1.5 shadow-[0_12px_28px_rgba(143,7,9,0.14)] dark:border-amber-500/25 dark:bg-gradient-to-br dark:from-amber-500/10 dark:via-[#0e1322] dark:to-[#080a12]">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white dark:text-amber-400">
                  <DollarSign className="h-4 w-4 text-current shrink-0 dark:text-amber-400" />
                  Thù lao
                </div>
                <div className="min-w-0 font-mono font-black text-sm sm:text-base text-white whitespace-normal break-words [overflow-wrap:anywhere] dark:text-amber-300">
                  {job.hasBudget && job.budget ? job.budget : "Thỏa thuận"}
                </div>
              </div>

              <div className="rounded-2xl border border-[#F0D6D0] bg-white p-4 flex flex-col justify-between space-y-1.5 shadow-[0_12px_28px_rgba(143,7,9,0.06)] dark:border-[#1b233a] dark:bg-[#0c101d] dark:shadow-none">
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
            </div>

            {/* Desktop Action Buttons under metrics */}
            <div className="hidden md:flex justify-center pt-4">
              {renderActionButtons(false)}
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

          {/* Job Info Section */}
          <JobInfoSection
            job={job}
            benefits={benefits}
            startText={startText}
            endText={endText}
            showAllBenefits={showAllBenefits}
            onToggleBenefits={() => setShowAllBenefits((cur) => !cur)}
          />

          {/* Positions Section */}
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

          {/* Event Schedule Section */}
          {eventSchedules.length > 0 && <EventInformationSection events={eventSchedules} />}

          {/* Bottom Desktop Action Buttons */}
          <div className="hidden md:flex justify-center pt-4 pb-6">
            {renderActionButtons(false)}
          </div>
        </div>

        {/* Mobile Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden w-full border-t border-[#F0D7D3] bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-8px_24px_rgba(143,7,9,0.08)] dark:border-[#1b233a] dark:bg-[#0c101d]/95 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
          {renderActionButtons(true)}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl border border-[#F0D7D3] bg-white dark:border-[#1a2238] dark:bg-[#0c101d] p-6 shadow-2xl relative overflow-hidden text-[#191116] dark:text-white text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0EE] border border-[#F0D7D3] text-[#8F0709] mx-auto">
              <UserRoundPlus className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-center font-display text-lg font-black uppercase tracking-wider text-[#8F0709] dark:text-white">
              Xác nhận tham gia
            </h3>
            <p className="mt-2 text-center text-xs text-[#574D54] dark:text-slate-300 leading-relaxed font-medium">
              Bạn sắp tham gia campaign <strong className="text-[#191116] dark:text-white">{job.title || "-"}</strong> qua link giới thiệu của <strong className="text-[#8F0709] dark:text-amber-300">{referrerName}</strong>.
            </p>

            <div className="mt-5 rounded-2xl border border-[#F0D7D3] bg-[#FFF7F6] dark:border-[#1a2238] dark:bg-[#101424] p-4 space-y-2.5 text-xs text-left text-[#574D54] dark:text-slate-300 font-medium">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#0A6C3B] shrink-0 mt-0.5" />
                <span>Bạn sẽ được duyệt tham gia trực tiếp chiến dịch này.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#0A6C3B] shrink-0 mt-0.5" />
                <span>Trạng thái tham gia sẽ hiển thị trong Workspace của bạn.</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                disabled={isApplying}
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 h-11 rounded-2xl bg-white border border-[#F0D7D3] text-xs font-bold uppercase tracking-widest text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition cursor-pointer shadow-xs dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                disabled={isApplying || isExpired}
                onClick={handleConfirmApply}
                className="light-force-white flex-1 h-11 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-xs font-black uppercase tracking-widest !text-white text-white hover:brightness-110 shadow-md disabled:opacity-50 transition cursor-pointer"
              >
                {isApplying ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-24 right-6 z-[70] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-full px-4.5 py-2.5 text-xs font-bold flex items-center gap-2.5 border backdrop-blur-md transition-all",
              t.tone === "error"
                ? "border-rose-300 bg-white/95 text-rose-700 shadow-[0_8px_24px_rgba(244,63,94,0.2)] dark:border-rose-500/30 dark:bg-[#090b14]/95 dark:text-rose-200"
                : "border-emerald-300 bg-white/95 text-emerald-800 shadow-[0_8px_24px_rgba(16,185,129,0.2)] dark:border-emerald-500/30 dark:bg-[#090b14]/95 dark:text-white"
            )}
          >
            {t.tone === "error" ? (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
                <X className="h-3.5 w-3.5 stroke-[2.5]" />
              </div>
            ) : (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
              </div>
            )}
            <span className="text-[#191116] dark:text-white">{t.msg}</span>
          </div>
        ))}
      </div>

      <GuestActionPrompt />
    </div>
  );
}
