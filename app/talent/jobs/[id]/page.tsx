"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Gift,
  Globe,
  Image as ImageIcon,
  Info,
  Layers,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Tag,
  Users,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  applyTalentCampaign,
  loadTalentCampaignDetail,
  loadTalentCampaignsPage,
  updateTalentCampaignApplicationStatus,
} from "@/lib/talent-api";
import { useGuestActionPrompt } from "@/components/guest-action-prompt";

const JOBS_PAGE_STATE_KEY = "vnp_jobs_page_state";

function statusMeta(stage: string, isApplied: boolean) {
  if (stage === "completed" || stage === "confirmed") {
    return { label: "Đã hoàn thành", className: "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30 border-0" };
  }

  if (stage === "executing" || stage === "accepted") {
    return { label: "Đang tham gia", className: "bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-400/30 border-0" };
  }

  if (stage === "new" || (isApplied && !stage)) {
    return { label: "Chờ duyệt hồ sơ", className: "bg-yellow-400 text-slate-950 font-black shadow-lg shadow-yellow-400/30 border-0" };
  }

  return { label: "Đang tuyển dụng", className: "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 border-0" };
}

function formatDate(isoDate?: string | null) {
  if (!isoDate) return "";
  const dateOnly = isoDate.split(/[T ]/)[0];
  const [year, month, day] = dateOnly.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

function sentenceCase(text: string) {
  if (!text) return "";
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const { requireAuthAction, GuestActionPrompt } = useGuestActionPrompt();

  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);
  const [stage, setStage] = useState<string>("new");
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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
            setStage(data.application?.status || (data.hasApplied ? "new" : "recruiting"));
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

  const handleApply = async () => {
    if (!job) return;
    if (!requireAuthAction({
      actionLabel: `Ứng tuyển chiến dịch "${job.title}"`,
      description: "Bạn cần đăng nhập tài khoản Talent để ứng tuyển chiến dịch này và kết nối với Brand.",
    })) {
      return;
    }
    try {
      await applyTalentCampaign(job.id);
      setIsApplied(true);
      setStage("new");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStage = async (nextStage: "executing" | "completed") => {
    if (!job) return;
    try {
      await updateTalentCampaignApplicationStatus(job.id, nextStage);
      setStage(nextStage);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080a12] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Đang tải chi tiết công việc...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#080a12] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 rounded-3xl border border-[#1a2238] bg-[#0c101d] p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 mx-auto">
            <Info className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase">Không tìm thấy công việc</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Công việc này có thể đã bị gỡ bỏ hoặc link không còn tồn tại.
          </p>
          <button
            onClick={handleBack}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer"
          >
            Quay lại danh sách công việc
          </button>
        </div>
      </div>
    );
  }

  const status = statusMeta(stage, isApplied);
  const detail = job.detail || {};
  const requirements = detail.requirements || [];
  const benefits = detail.benefits || [];
  const deadline = job.applicationDeadline || job.deadline;

  const renderFooterAction = () => {
    if (!isApplied) {
      return (
        <button
          onClick={handleApply}
          className="px-8 py-3 rounded-xl font-display text-xs sm:text-sm font-black bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all uppercase tracking-wider"
        >
          Ứng tuyển ngay
        </button>
      );
    }

    if (stage === "new") {
      return (
        <button disabled className="px-8 py-3 rounded-xl font-display text-xs sm:text-sm font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 cursor-not-allowed uppercase tracking-wider">
          Chờ duyệt hồ sơ
        </button>
      );
    }

    if (stage === "accepted") {
      return (
        <button
          onClick={() => handleUpdateStage("executing")}
          className="px-8 py-3 rounded-xl font-display text-xs sm:text-sm font-black bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all uppercase tracking-wider"
        >
          Bắt đầu tham gia
        </button>
      );
    }

    if (stage === "executing") {
      return (
        <button
          onClick={() => handleUpdateStage("completed")}
          className="px-8 py-3 rounded-xl font-display text-xs sm:text-sm font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all uppercase tracking-wider"
        >
          Báo cáo hoàn thành
        </button>
      );
    }

    if (stage === "completed") {
      return (
        <button disabled className="px-8 py-3 rounded-xl font-display text-xs sm:text-sm font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 cursor-not-allowed uppercase tracking-wider">
          Đang chờ nghiệm thu
        </button>
      );
    }

    return (
      <button disabled className="px-8 py-3 rounded-xl font-display text-xs sm:text-sm font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-not-allowed uppercase tracking-wider">
        Thành công (Đã rút ví)
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#080a12] text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      
      {/* Top Hero Image Banner */}
      <div className="relative w-full h-64 sm:h-80 bg-[#050711] shrink-0 overflow-hidden border-b border-[#151b2d]">
        {allMediaImages.length > 0 ? (
          <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-none">
            {allMediaImages.map((img, idx) => (
              <div
                key={`${img.url}-${idx}`}
                onClick={() => setPreviewImageUrl(img.url)}
                className="w-full h-full shrink-0 snap-center relative cursor-pointer group"
              >
                <img
                  src={img.url}
                  alt={img.caption || job.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/brand_cover_default.png";
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0e1322] to-[#080a12] text-slate-500 p-4">
            <ImageIcon className="h-10 w-10 text-slate-600 mb-2" />
            <span className="text-xs font-semibold">Chưa có hình ảnh chiến dịch</span>
          </div>
        )}

        {/* Floating Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80 transition-all cursor-pointer shadow-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Floating Top Right Status Badge */}
        <div className="absolute top-4 right-4 z-20">
          <span className={cn("inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-black uppercase tracking-wider shadow-xl", status.className)}>
            {status.label}
          </span>
        </div>

        {/* Image count badge */}
        {allMediaImages.length > 1 && (
          <div className="absolute bottom-4 right-4 z-10 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white border border-white/10">
            Vuốt sang để xem thêm ➔
          </div>
        )}
      </div>

      {/* Content Body Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-10 py-6 space-y-6 flex-1">
        
        {/* Title & Brand Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-extrabold text-cyan-300 uppercase">
              {job.type || "Chưa phân loại"}
            </span>
            {job.matchScore && (
              <span className="flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> AI Phù hợp {job.matchScore}%
              </span>
            )}
          </div>

          <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white uppercase leading-tight tracking-tight">
            {job.title || "Không có tiêu đề"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 font-semibold flex items-center gap-1.5">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] sm:text-xs font-bold">Thương hiệu:</span>
            <span className="text-amber-300 font-bold">{job.brand || "Không có"}</span>
          </p>

          {/* Key Metrics Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-[#0e1322] to-[#080a12] p-4 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">
                <DollarSign className="h-4 w-4 text-amber-400 shrink-0" />
                Thù lao
              </div>
              <div className="font-mono font-black text-sm sm:text-base text-amber-300 whitespace-nowrap">
                {job.hasBudget && job.budget ? job.budget : "Không có"}
              </div>
            </div>

            <div className="rounded-2xl border border-[#1b233a] bg-[#0c101d] p-4 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                Hạn ứng tuyển
              </div>
              <div className="font-semibold text-xs sm:text-sm text-slate-100">
                {deadline ? formatDate(deadline) : "Không có"}
              </div>
            </div>

            <div className="rounded-2xl border border-[#1b233a] bg-[#0c101d] p-4 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                Địa điểm làm việc
              </div>
              <div className="font-semibold text-xs sm:text-sm text-slate-100 break-words" title={job.location || "Không có"}>
                {job.location || "Không có"}
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Brief */}
        <div className="rounded-2xl border border-[#1b233a] bg-[#0c101d] p-5 space-y-2.5">
          <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white uppercase tracking-wider border-b border-[#151b2d] pb-2.5">
            <Info className="h-4 w-4 text-amber-400" /> Mô tả công việc
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-line">
            {job.brief || job.description || "Không có"}
          </p>
        </div>

        {/* Campaign Details */}
        <div className="rounded-2xl border border-[#1b233a] bg-[#0c101d] p-5 space-y-4">
          <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white uppercase tracking-wider border-b border-[#151b2d] pb-2.5">
            <Layers className="h-4 w-4 text-amber-400" /> Thông tin công việc
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Tag className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-slate-400 font-medium">Loại công việc:</span>
              <span className="font-semibold text-slate-100">{job.type || "Không có"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-slate-400 font-medium">Sự kiện:</span>
              <span className="font-semibold text-slate-100">{job.eventName || "Không có"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-slate-400 font-medium">Bắt đầu:</span>
              <span className="font-semibold text-slate-100">{job.startDate ? formatDate(job.startDate) : "Không có"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-slate-400 font-medium">Kết thúc:</span>
              <span className="font-semibold text-slate-100">{job.endDate ? formatDate(job.endDate) : "Không có"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-slate-400 font-medium">Sự kiện chính:</span>
              <span className="font-semibold text-slate-100">{(job.eventDate || job.startDate) ? formatDate(job.eventDate || job.startDate) : "Không có"}</span>
            </div>
          </div>

          <PillSection
            title="Vị trí tuyển"
            items={job.roles?.length > 0 ? job.roles : ["Không có"]}
            className="border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
          />
          <PillSection
            title="Nhóm phù hợp"
            items={job.targetProfiles?.length > 0 ? job.targetProfiles : ["Không có"]}
            className="border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          />
          <PillSection
            title="Lĩnh vực"
            items={job.industries?.length > 0 ? job.industries : ["Không có"]}
            className="border-amber-400/20 bg-amber-400/10 text-amber-300"
          />

          <div className="space-y-2 pt-2 border-t border-[#151b2d]">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Đầu việc chính</p>
            {job.responsibilities?.length > 0 ? (
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-200">
                {job.responsibilities.slice(0, 5).map((item: string, idx: number) => (
                  <li key={`${item}-${idx}`} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{sentenceCase(item)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs sm:text-sm text-slate-400 font-normal">Không có</p>
            )}
          </div>
        </div>

        {/* Requirements & Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#1b233a] bg-[#0c101d] p-5 space-y-3">
            <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white uppercase tracking-wider border-b border-[#151b2d] pb-2.5">
              <FileText className="h-4 w-4 text-amber-400" /> Yêu cầu tuyển dụng
            </h4>
            {requirements.length > 0 ? (
              <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                {requirements.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span>{sentenceCase(item)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs sm:text-sm text-slate-400 font-normal">Không có</p>
            )}
          </div>

          <div className="rounded-2xl border border-[#1b233a] bg-[#0c101d] p-5 space-y-3">
            <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white uppercase tracking-wider border-b border-[#151b2d] pb-2.5">
              <Award className="h-4 w-4 text-emerald-400" /> Quyền lợi & Đãi ngộ
            </h4>
            {benefits.length > 0 ? (
              <>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                  {(showAllBenefits ? benefits : benefits.slice(0, 5)).map((benefit: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span>{sentenceCase(benefit)}</span>
                    </li>
                  ))}
                </ul>
                {benefits.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllBenefits((cur) => !cur)}
                    className="flex items-center gap-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 hover:text-amber-200 transition-colors pt-1 cursor-pointer"
                  >
                    {showAllBenefits ? (
                      <>Thu gọn <ChevronUp className="h-3.5 w-3.5" /></>
                    ) : (
                      <>Xem thêm {benefits.length - 5} phúc lợi <ChevronDown className="h-3.5 w-3.5" /></>
                    )}
                  </button>
                )}
              </>
            ) : (
              <p className="text-xs sm:text-sm text-slate-400 font-normal">Không có</p>
            )}
          </div>
        </div>

        {/* Brand Sponsorships */}
        {job.sponsorships && job.sponsorships.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-[#0e1322] to-[#080a12] p-5 space-y-3">
            <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wider">
              <Gift className="h-4 w-4 text-amber-400" /> Cam kết tài trợ từ Brand
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

        {/* Brand Contact Info */}
        <div className="rounded-2xl border border-[#1b233a] bg-[#0c101d] p-5 space-y-3">
          <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white uppercase tracking-wider border-b border-[#151b2d] pb-2.5">
            <Users className="h-4 w-4 text-amber-400" /> Thông tin liên hệ Doanh nghiệp
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-200">
            <div className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block">Hotline Brand</span>
                <span className="font-mono text-slate-100 font-semibold">{detail.phone || "Không có"}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block">Email liên hệ</span>
                <span className="font-mono text-slate-100 font-semibold">{detail.email || "Không có"}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Globe className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block">Website</span>
                {detail.website ? (
                  <a
                    href={detail.website.startsWith("http") ? detail.website : `https://${detail.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-300 hover:underline font-mono font-semibold truncate block max-w-[200px]"
                  >
                    {detail.website}
                  </a>
                ) : (
                  <span className="font-mono text-slate-400">Không có</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 pt-6 border-t border-[#151b2d]">
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-xl border border-slate-700/80 bg-[#121827] text-slate-200 text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#1a2238] hover:border-slate-500 hover:text-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
          {renderFooterAction()}
        </div>

      </div>

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setPreviewImageUrl(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={previewImageUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
        </div>
      )}

      {/* Guest Action Prompt Modal */}
      <GuestActionPrompt />
    </div>
  );
}

function PillSection({ title, items, className }: { title: string; items: string[]; className: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <span key={`${item}-${idx}`} className={cn("rounded-lg border px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider", className)}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
