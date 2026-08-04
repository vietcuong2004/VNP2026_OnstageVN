"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award, Calendar, DollarSign, Briefcase, ChevronRight, Crown,
  Sparkles, Star, Bell, Search, Info, Shield,
  Users, UserCheck, Play, Plus, BookOpen, Clock,
  ArrowUpRight, ArrowRight, Flame, Heart, ShieldCheck, Activity,
  AlertTriangle, Radio, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import RadarChart from "@/components/ui/RadarChart";
import {
  applyTalentCampaign,
  loadTalentCampaignsPage,
  loadTalentProfile,
  mapCampaignToTalentJob,
  updateTalentCampaignApplicationStatus,
} from "@/lib/talent-api";
import { getStoredAuthUser } from "@/lib/api-client";
import JobCard from "@/components/jobs/JobCard";
import { useGuestActionPrompt } from "@/components/guest-action-prompt";
import TierExplanationDialog from "@/components/ui/TierExplanationDialog";
import ControlCenterExplanationDialog from "@/components/ui/ControlCenterExplanationDialog";

const JOBS_LIST = [
  { id: 1, title: "Đại sứ thương hiệu", desc: "Gương mặt đại diện thương hiệu luxury", weights: { pageant: 0.4, runway: 0.2, kol: 0.4 } },
  { id: 2, title: "KOLs/Influencer quảng cáo", desc: "Sáng tạo nội dung video ngắn", weights: { pageant: 0.1, runway: 0.1, kol: 0.8 } },
  { id: 3, title: "KOC Livestream bán hàng", desc: "Thực hiện livestream bán hàng trực tiếp", weights: { pageant: 0.05, runway: 0.05, kol: 0.9 } },
  { id: 4, title: "Gương mặt trang bìa", desc: "Chụp ảnh bìa tạp chí, lookbook, ảnh PR", weights: { pageant: 0.3, runway: 0.5, kol: 0.2 } },
  { id: 5, title: "Người mẫu sàn diễn (Runway)", desc: "Trình diễn các bộ sưu tập thời trang cao cấp", weights: { pageant: 0.1, runway: 0.8, kol: 0.1 } },
  { id: 6, title: "Người mẫu quảng cáo", desc: "Diễn xuất trong các TVC quảng cáo", weights: { pageant: 0.2, runway: 0.3, kol: 0.5 } },
  { id: 7, title: "Diễn viên MV ca nhạc", desc: "Đóng vai nữ chính/nam chính MV ca nhạc", weights: { pageant: 0.2, runway: 0.2, kol: 0.6 } },
  { id: 8, title: "KOL sự kiện / Khách mời VIP", desc: "Tham dự thảm đỏ và sự kiện thương hiệu", weights: { pageant: 0.6, runway: 0.2, kol: 0.2 } },
  { id: 9, title: "Người dẫn chương trình (MC)", desc: "Dẫn dắt các sự kiện và chương trình giải trí", weights: { pageant: 0.7, runway: 0.1, kol: 0.2 } },
  { id: 10, title: "VIP Promotion Girl (PG)", desc: "Lễ tân đón tiếp khách tại sự kiện lớn", weights: { pageant: 0.4, runway: 0.3, kol: 0.3 } },
  { id: 11, title: "Huấn luyện viên Catwalk", desc: "Đào tạo kỹ thuật đi catwalk cho học viên", weights: { pageant: 0.1, runway: 0.8, kol: 0.1 } },
  { id: 12, title: "CEO thương hiệu riêng", desc: "Kinh doanh nhãn hàng thời trang, mỹ phẩm", weights: { pageant: 0.5, runway: 0.2, kol: 0.3 } },
  { id: 13, title: "Giám khảo cuộc thi sắc đẹp", desc: "Chấm điểm các cuộc thi hoa hậu, hoa khôi", weights: { pageant: 0.7, runway: 0.2, kol: 0.1 } },
  { id: 14, title: "Giám đốc hình ảnh / Stylist", desc: "Cố vấn định hình phong cách và trang phục", weights: { pageant: 0.1, runway: 0.6, kol: 0.3 } },
  { id: 15, title: "Sứ giả chiến dịch cộng đồng", desc: "Lan tỏa các giá trị nhân văn và dự án từ thiện", weights: { pageant: 0.8, runway: 0.1, kol: 0.1 } },
  { id: 16, title: "Vlogger du lịch & trải nghiệm", desc: "Quảng bá điểm đến, khách sạn, resort cao cấp", weights: { pageant: 0.2, runway: 0.1, kol: 0.7 } },
  { id: 17, title: "Người mẫu ảnh nghệ thuật", desc: "Hợp tác chụp ảnh thời trang Fine-art", weights: { pageant: 0.2, runway: 0.6, kol: 0.2 } },
  { id: 18, title: "Nhà sáng tạo nội dung tri thức", desc: "Chia sẻ kỹ năng mềm, kiến thức làm đẹp", weights: { pageant: 0.4, runway: 0.1, kol: 0.5 } },
  { id: 19, title: "Đại sứ Game / Esports", desc: "Hình ảnh đại diện cho các dự án game lớn", weights: { pageant: 0.1, runway: 0.1, kol: 0.8 } },
  { id: 20, title: "Người mẫu ảo / Metaverse", desc: "Scan 3D hình ảnh số để làm mẫu ảo", weights: { pageant: 0.1, runway: 0.6, kol: 0.3 } }
];

function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatCompactVND(value: number) {
  if (!value) return "0đ";
  if (value >= 1000000) return `${Number((value / 1000000).toFixed(1))}M đ`;
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function parseRateCardValue(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized.includes("infinity")) return null;

  const millionMatch = normalized.match(/(\d+(?:[,.]\d+)?)\s*m/);
  if (millionMatch) {
    const amount = Number(millionMatch[1].replace(",", "."));
    return Number.isFinite(amount) && amount > 0 ? amount * 1000000 : null;
  }

  const digits = normalized.replace(/[^\d]/g, "");
  if (!digits) return null;

  const amount = Number(digits);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function formatMinimumRateCard(rateCard: unknown) {
  if (!rateCard || typeof rateCard !== "object") return "Chưa cập nhật";

  const prices = Object.values(rateCard)
    .map(parseRateCardValue)
    .filter((value): value is number => value !== null);

  if (prices.length === 0) return "Chưa cập nhật";

  return `Từ ${formatCompactVND(Math.min(...prices))}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { requireAuthAction, GuestActionPrompt } = useGuestActionPrompt();
  const [profile, setProfile] = useState<any>(null);
  const currentUser = useMemo(() => getStoredAuthUser(), []);
  const currentTalentId = (currentUser as any)?.profile_id || (currentUser as any)?.id;
  const [currentDateText, setCurrentDateText] = useState("");
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [showControlCenterDialog, setShowControlCenterDialog] = useState(false);

  useEffect(() => {
    let active = true;

    setCurrentDateText(new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date()));

    loadTalentProfile().then((loadedProfile) => {
      if (active) {
        if (!currentUser) {
          setProfile({
            ...loadedProfile,
            tier: "Potential",
            isOnboarded: true,
            name: "Bạn",
          });
        } else {
          setProfile(loadedProfile);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [currentUser]);

  const [dashboardJobs, setDashboardJobs] = useState<any[]>([]);
  const [calendarData, setCalendarData] = useState<{ availabilityCalendar?: string[]; todoLists?: Record<string, any[]> } | null>(null);

  useEffect(() => {
    let active = true;

    loadTalentCampaignsPage({ perPage: 20 }).then((res) => {
      if (!active) return;
      if (!res?.data?.length) return;
      const mapped = res.data.map(mapCampaignToTalentJob).slice(0, 20);
      setDashboardJobs(mapped);
    }).catch((error) => {
      console.warn("Cannot load dashboard campaigns from backend", error);
    });

    return () => {
      active = false;
    };
  }, []);

  const normalizeJobStage = (status?: string | null) => {
    if (!status) return "";
    if (status === "pending") return "new";
    if (status === "approved") return "accepted";
    return status;
  };

  const getTalentJobStage = (job: any) => {
    if (!job) return "";
    const backendStage = normalizeJobStage(job.application?.status);
    if (backendStage) return backendStage;

    const appItem = job.applicants?.find((a: any) => {
      const talentId = String(a.talentId || a.profileId || a.userId || "");
      return talentId === String(currentTalentId || "");
    });
    return normalizeJobStage(appItem?.stage) || "";
  };

  const hasTalentApplication = (job: any) => {
    return Boolean(
      job.hasApplied
      || job.application
      || job.applicants?.some((a: any) => {
        const talentId = String(a.talentId || a.profileId || a.userId || "");
        return talentId === String(currentTalentId || "");
      })
    );
  };

  const handleApply = async (job: any) => {
    if (!requireAuthAction({
      actionLabel: `Ứng tuyển chiến dịch "${job.title}"`,
      description: "Bạn cần đăng nhập tài khoản Idol để ứng tuyển chiến dịch này và kết nối với Brand.",
    })) {
      return;
    }
    try {
      await applyTalentCampaign(job.id);
      setDashboardJobs((prev) =>
        prev.map((item) =>
          item.id === job.id
            ? { ...item, hasApplied: true, application: { status: "pending" } }
            : item
        )
      );
    } catch (err) {
      console.warn("Failed to apply", err);
      window.alert(err instanceof Error ? err.message : "Chưa thể ứng tuyển chiến dịch này.");
    }
  };

  const handleUpdateStage = async (job: any, nextStage: "executing" | "completed") => {
    if (!currentUser) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    try {
      await updateTalentCampaignApplicationStatus(job.id, nextStage);
      setDashboardJobs((prev) =>
        prev.map((item) =>
          item.id === job.id
            ? { ...item, application: { ...item.application, status: nextStage } }
            : item
        )
      );
    } catch (err) {
      console.warn("Failed to update status", err);
    }
  };

  if (!profile) return null;

  if (!profile.isOnboarded) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[80vh] py-6 sm:py-12 px-4 animate-in fade-in duration-500 w-full">
        <div className="absolute inset-0 -mx-4 -mt-5 -mb-24 md:-mx-8 md:-mt-7 md:-mb-8 lg:-mx-10 lg:-mt-8 2xl:-mx-12 z-0 overflow-hidden pointer-events-none">
          <img
            src="/hero_bg.png"
            alt="OnstageVN Background Graphics"
            className="w-full h-full object-cover object-center absolute inset-0"
          />
          <div className="absolute inset-0 bg-[#02040a]/30 md:bg-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_40%),linear-gradient(135deg,rgba(15,23,42,0.8),rgba(2,6,23,0.95))] p-6 sm:p-10 md:p-12 text-center max-w-xl w-full shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D4A64A]/30 bg-[#071B42]/45 backdrop-blur-md max-w-full mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F0C56B] animate-pulse shrink-0" />
            <span className="text-[10px] font-bold text-[#F0C56B] uppercase tracking-widest truncate">
              Yêu cầu hoàn thành khảo sát
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight uppercase text-white">
            Kích Hoạt Trung Tâm <br />
            <span className="text-gradient-gold">Điều Khiển Idol</span>
          </h1>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/5 shadow-xl max-w-md mx-auto my-6 text-center">
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 font-medium">
              Chào mừng bạn đến với <b>OnstageVN</b>! Để mở khóa các thông số đánh giá định hướng AI, độ tin cậy, thống kê thu nhập và danh sách các chiến dịch đề xuất phù hợp nhất, vui lòng làm bài khảo sát định hướng trước.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-2">
            <button
              onClick={() => router.push("/talent/survey")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gradient-gold text-slate-950 hover:shadow-[0_0_20px_rgba(240,197,107,0.35)] hover:scale-[1.02] active:scale-98 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4 stroke-[3]" /> Làm Khảo Sát Ngay
            </button>
            <button
              onClick={() => router.push("/talent/profile")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-950 text-[#F0C56B] hover:text-white hover:scale-[1.02] active:scale-98 transition-all duration-305 cursor-pointer flex items-center justify-center gap-2 border border-[#D4A64A]/50 shadow-[0_0_15px_rgba(212,166,74,0.15)]"
            >
              Xem Hồ Sơ Cá Nhân
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      <div className="relative overflow-hidden rounded-3xl border border-white/7 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div className={currentUser ? "max-w-3xl" : "w-full"}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-amber-400/40 bg-amber-400/10 text-amber-300">
                Talent Control Center
              </span>

              <button
                type="button"
                onClick={() => setShowControlCenterDialog(true)}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/35 text-amber-300 text-[9px] font-black shadow-[0_0_8px_rgba(245,158,11,0.15)] hover:scale-110 hover:shadow-[0_0_12px_rgba(245,158,11,0.35)] transition-all duration-300 cursor-pointer"
                title="Tìm hiểu vai trò Idol"
              >
                ?
              </button>

              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 ml-1">
                {currentDateText || "May 2026"}
              </span>
            </div>

            <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-5xl">
              {currentUser ? (
                <>Chào mừng <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-600 bg-clip-text text-transparent">{profile.name || (currentUser as any)?.name || "Idol"}</span>!</>
              ) : (
                <>Chào mừng bạn đến với <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-600 bg-clip-text text-transparent">OnstageVN</span>!</>
              )}
            </h1>
            <p className={`mt-3 text-sm leading-6 text-slate-400 text-justify lg:text-left ${currentUser ? "max-w-2xl" : "w-full"}`}>
              {currentUser ? (
                "Khám phá các chiến dịch tuyển dụng từ các nhãn hàng, tìm kiếm cơ hội phù hợp để phát triển sự nghiệp của bạn."
              ) : (
                "Mỗi idol đều xứng đáng có một sân khấu. Onstage giúp bạn kết nối đúng người, đúng cơ hội và phát triển sự nghiệp bền vững."
              )}
            </p>
          </div>

          {!!currentUser && (
            <div className="flex flex-col sm:flex-row gap-4 lg:w-[360px] shrink-0">
              {(() => {
                const t = profile.tier || "A";
                const tierConfig: Record<string, any> = {
                  S: { border: "border-amber-400/80", bg: "bg-gradient-to-br from-amber-500/20 via-[#221a0a]/95 to-[#070913]/98", shadow: "shadow-[0_0_25px_rgba(245,158,11,0.3)]", hoverShadow: "hover:shadow-[0_0_35px_rgba(245,158,11,0.45)]", glow: "bg-amber-500/30", icon: <Crown className="h-5 w-5 text-amber-400 fill-amber-400/25 animate-bounce" />, label: "KIM CƯƠNG", labelColor: "text-amber-400", badge: "bg-amber-400/25 text-amber-300 border-amber-400/30", badgeText: "90 - 100 ĐIỂM", titleGradient: "bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500", titleText: "TOP 50 KOL", subtitleColor: "text-amber-300", desc: "Hồ sơ nổi bật trong nhóm Top 50 KOL tháng này." },
                  A: { border: "border-slate-300/60", bg: "bg-gradient-to-br from-slate-400/10 via-[#171922]/90 to-[#070913]/95", shadow: "shadow-[0_0_20px_rgba(203,213,225,0.08)]", hoverShadow: "hover:shadow-[0_0_25px_rgba(203,213,225,0.18)]", glow: "bg-slate-400/20", icon: <Award className="h-5 w-5 text-slate-300" />, label: "VÀNG", labelColor: "text-slate-300", badge: "bg-slate-400/20 text-slate-200 border-slate-400/30", badgeText: "70 - 89 ĐIỂM", titleGradient: "bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400", titleText: "NỔI BẬT T7", subtitleColor: "text-slate-300", desc: "Hồ sơ có hoạt động nổi bật và dữ liệu hợp tác tốt." },
                  B: { border: "border-purple-500/40", bg: "bg-gradient-to-br from-purple-500/10 via-[#1a1128]/90 to-[#070913]/95", shadow: "shadow-[0_0_20px_rgba(168,85,247,0.08)]", hoverShadow: "hover:shadow-[0_0_25px_rgba(168,85,247,0.18)]", glow: "bg-purple-500/20", icon: <Star className="h-5 w-5 text-purple-400" />, label: "BẠC", labelColor: "text-purple-400", badge: "bg-purple-500/20 text-purple-300 border-purple-500/30", badgeText: "45 - 69 ĐIỂM", titleGradient: "bg-gradient-to-r from-purple-200 to-pink-500", titleText: "ĐÁNH GIÁ TỐT", subtitleColor: "text-purple-300", desc: "Hồ sơ có nhiều đánh giá tích cực từ hoạt động thực tế." },
                  C: { border: "border-teal-500/30", bg: "bg-gradient-to-br from-teal-500/10 via-[#0e1f1e]/90 to-[#070913]/95", shadow: "shadow-[0_0_20px_rgba(20,184,166,0.08)]", hoverShadow: "hover:shadow-[0_0_25px_rgba(20,184,166,0.18)]", glow: "bg-teal-500/20", icon: <Award className="h-5 w-5 text-teal-400" />, label: "ĐỒNG", labelColor: "text-teal-400", badge: "bg-teal-500/20 text-teal-300 border-teal-500/30", badgeText: "20 - 44 ĐIỂM", titleGradient: "bg-gradient-to-r from-teal-200 to-emerald-400", titleText: "GƯƠNG MẶT MỚI", subtitleColor: "text-teal-300", desc: "Gương mặt mới có tiềm năng phát triển trên hệ thống." },
                  Potential: { border: "border-rose-500/40", bg: "bg-gradient-to-br from-rose-500/20 via-[#260f12]/95 to-[#070913]/98", shadow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]", hoverShadow: "hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]", glow: "bg-rose-500/30", icon: <ShieldAlert className="h-5 w-5 text-rose-400 animate-pulse" />, label: "HỒ SƠ MỚI", labelColor: "text-rose-400", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30", badgeText: "< 20 ĐIỂM", titleGradient: "bg-gradient-to-r from-rose-200 via-rose-300 to-red-500", titleText: "CHƯA CÓ DANH HIỆU", subtitleColor: "text-rose-300", desc: "Hồ sơ đang chờ thêm dữ liệu để gắn danh hiệu tháng." }
                };
                const cfg = tierConfig[t] || tierConfig["A"];
                return (
                  <div 
                    onClick={() => setShowTierDialog(true)}
                    className={cn("flex-1 relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300 hover:scale-[1.02] cursor-pointer", cfg.border, cfg.bg, cfg.shadow, cfg.hoverShadow)}
                  >
                    <div className={cn("absolute -right-4 -top-4 h-16 w-16 rounded-full blur-xl pointer-events-none", cfg.glow)}></div>

                    {/* Nút ? nổi bật ở góc trên cùng bên phải */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTierDialog(true);
                      }}
                      className="absolute top-3.5 right-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/35 text-amber-300 text-[11px] font-black shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:scale-110 hover:shadow-[0_0_18px_rgba(245,158,11,0.45)] transition-all duration-300 cursor-pointer z-10"
                      title="Xem giải thích danh hiệu"
                    >
                      ?
                    </button>

                    <div className="flex items-center justify-between mb-3 pr-8">
                      <div className="flex items-center gap-1.5">
                        {cfg.icon}
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", cfg.labelColor)}>{cfg.label}</span>
                      </div>
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider border", cfg.badge)}>{cfg.badgeText}</span>
                    </div>
                    <span className={cn("block text-3xl font-black tracking-wide font-display bg-clip-text text-transparent", cfg.titleGradient)}>{cfg.titleText}</span>
                    <span className={cn("mt-1 block text-[10px] font-bold", cfg.subtitleColor)}>{cfg.desc}</span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {!!currentUser && profile.tier === "Potential" && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.05)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Hồ sơ của bạn đang chờ danh hiệu tháng</h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Bạn chưa thực hiện bài khảo sát định hướng hoặc tổng điểm khảo sát dưới 20. Vui lòng làm khảo sát để hệ thống có thêm dữ liệu đánh giá và kích hoạt đề xuất việc làm chuẩn xác nhất.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/talent/survey?start=true")}
            className="shrink-0 h-9 rounded-lg bg-gradient-to-r from-rose-400 to-rose-600 px-4 text-[10px] font-black text-white hover:brightness-105 shadow-md active:scale-98 transition-all uppercase tracking-wider cursor-pointer"
          >
            Làm Khảo Sát Ngay
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      {false && (() => {
        const showCount = calendarData?.availabilityCalendar?.length ?? 0;
        const now = new Date();
        const monthLabel = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;
        const reliability = Number(profile.reliability);
        const budgetFormatted = formatMinimumRateCard(profile.rateCard);
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* Thẻ 1: Job Phù Hợp - Gold */}
            <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#1a1305]/88 to-[#070913]/96 p-5 transition-all duration-300 hover:-translate-y-0.5 border-amber-400/35 shadow-[0_0_22px_rgba(245,158,11,0.18)]">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-15 blur-2xl bg-gradient-to-br from-amber-300 to-yellow-600"></div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Job Phù Hợp</span>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/35 bg-amber-400/15 text-amber-300">
                  <Briefcase className="h-4.5 w-4.5" />
                </div>
              </div>
              <strong className="mt-5 block text-2xl font-black tracking-tight text-white">
                {dashboardJobs.length > 0 ? `${dashboardJobs.length} Chiến dịch` : "—"}
              </strong>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">AI Matching</span>
            </div>
            {/* Thẻ 2: Lịch Trình - Gold-Deep */}
            <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#14100a]/88 to-[#070913]/96 p-5 transition-all duration-300 hover:-translate-y-0.5 border-yellow-500/30 shadow-[0_0_22px_rgba(234,179,8,0.14)]">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-12 blur-2xl bg-gradient-to-br from-yellow-300 to-amber-600"></div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Lịch Trình Show</span>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-300">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
              </div>
              <strong className="mt-5 block text-2xl font-black tracking-tight text-white">
                {showCount > 0 ? `${showCount} Lịch` : "Chưa cập nhật"}
              </strong>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{monthLabel}</span>
            </div>

            {/* Thẻ 3: Mức cát-xê tham khảo - Gold */}
            <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#111421]/88 to-[#070913]/96 p-5 transition-all duration-300 hover:-translate-y-0.5 border-amber-400/25 shadow-[0_0_22px_rgba(245,158,11,0.12)]">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600"></div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Cát-xê tối thiểu</span>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
                  <DollarSign className="h-4.5 w-4.5" />
                </div>
              </div>
              <strong className="mt-5 block text-2xl font-black tracking-tight text-white">{budgetFormatted}</strong>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Rate card của bạn</span>
            </div>

            {/* Thẻ 4: Độ tin cậy - Gold-Light */}
            <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#1a1508]/88 to-[#070913]/96 p-5 transition-all duration-300 hover:-translate-y-0.5 border-amber-300/30 shadow-[0_0_22px_rgba(253,230,138,0.12)]">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-gradient-to-br from-amber-100 to-amber-500"></div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Độ tin cậy</span>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-300/10 text-amber-200">
                  <Award className="h-4.5 w-4.5" />
                </div>
              </div>
              <strong className="mt-5 block text-2xl font-black tracking-tight text-white">
                {Number.isFinite(reliability) && reliability > 0 ? `${reliability}%` : "Chưa cập nhật"}
              </strong>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Chất lượng diễn show</span>
            </div>

          </div>
        );
      })()}

      {/* Chiến Dịch Nên Tham Gia (Top Section) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-extrabold text-sm sm:text-base text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400/20 animate-pulse" /> Chiến Dịch Nên Tham Gia
          </h3>
          <button
            onClick={() => router.push("/talent/jobs")}
            className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-500/20 px-3.5 py-1.5 rounded-lg hover:bg-amber-400 hover:text-black transition-all uppercase tracking-wider cursor-pointer"
          >
            Xem tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {dashboardJobs.slice(0, 20).map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isApplied={hasTalentApplication(job)}
              stage={getTalentJobStage(job)}
              onView={(j) => router.push(`/talent/jobs/${j.id}?from=/talent/jobs`)}
              onApply={handleApply}
              onUpdateStage={handleUpdateStage}
              onInvite={() => router.push(`/talent/jobs/${job.id}?from=/talent/jobs`)}
              onInviteBlocked={() => { }}
              formatDate={formatDate}
            />
          ))}
        </div>

        <div className="flex justify-center pt-3">
          <button
            onClick={() => router.push("/talent/jobs")}
            className="group relative flex min-h-12 w-full max-w-md items-center justify-center overflow-hidden rounded-full border border-[#F0C56B]/45 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-950 shadow-[0_14px_45px_rgba(245,197,24,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(245,197,24,0.38)] active:translate-y-0 cursor-pointer"
          >
            <span className="absolute inset-y-0 left-[-30%] w-1/3 skew-x-[-20deg] bg-white/35 opacity-0 transition duration-700 group-hover:left-[120%] group-hover:opacity-100" />
            <Search className="mr-2 h-4 w-4 shrink-0" />
            Khám phá tất cả Jobs
            <ArrowRight className="ml-2 h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* AI Career Diagnostics Component */}
      <div className="hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#150f02]/90 to-[#050712]/95 shadow-[0_0_30px_rgba(245,158,11,0.08)] p-6 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-amber-400/10 pb-4 justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            <div>
              <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">
                Định Hướng Sự Nghiệp
              </h3>
              <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                Chẩn đoán năng lực & Tương thích việc làm
              </span>
            </div>
          </div>
          <div className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
            AI Powered
          </div>
        </div>

        {profile.tier === "Potential" ? (
          <div className="flex flex-col items-center justify-center text-center p-8 py-12 rounded-xl border border-amber-500/15 bg-slate-950/40 max-w-xl mx-auto space-y-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Kích Hoạt Định Hướng Sự Nghiệp AI</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Thực hiện bài khảo sát định hướng gồm 20 câu hỏi định tính để mở khóa bản đồ năng lực AI, biểu đồ radar & danh sách 20 vị trí tương thích nhất với bạn.
              </p>
            </div>
            <button
              onClick={() => router.push("/talent/survey?start=true")}
              className="h-10 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 text-xs font-black text-black hover:brightness-105 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 active:scale-98 transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
            >
              Làm Khảo Sát Ngay <ArrowUpRight className="h-4.5 w-4.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Radar Chart Summary Column */}
            <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-xl border border-white/5 bg-slate-950/40">
              <div className="space-y-2">
                <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black">Đề xuất phù hợp nhất</span>
                <h4 className="text-sm font-black text-white leading-relaxed">
                  {profile.mainCategory || "Người mẫu Runway chuyên nghiệp"}
                </h4>
                <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1">
                  Hệ thống đề xuất hướng đi chuyên nghiệp dựa trên nhân trắc học và phản hồi khảo sát định tính.
                </p>
              </div>

              {/* SVG Radar */}
              <div className="h-36 w-36 mx-auto my-5 shrink-0 rounded-xl border border-white/5 bg-slate-950 p-2 shadow-inner flex items-center justify-center">
                <RadarChart
                  scores={profile.surveyScores}
                  fillColor="rgba(245,158,11,0.22)"
                  strokeColor="#f59e0b"
                  strokeWidth={2.5}
                  labelFontSize={12}
                  labelFontWeight="black"
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-white/5 pt-2 mt-2 font-bold">
                <span>P: Pageant ({(profile.surveyScores?.pageant || 15)}%)</span>
                <span>R: Runway ({(profile.surveyScores?.runway || 80)}%)</span>
                <span>K: KOL ({(profile.surveyScores?.kol || 10)}%)</span>
              </div>
            </div>

            {/* 20 Recommended Roles Column */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black text-left mb-3">Bảng xếp hạng 20 vị trí tương thích</span>

                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {(() => {
                    const scores = profile.surveyScores || { pageant: 50, runway: 50, kol: 50 };
                    const calculatedJobs = JOBS_LIST.map((job) => {
                      const matchScore = Math.round(
                        scores.pageant * job.weights.pageant +
                        scores.runway * job.weights.runway +
                        scores.kol * job.weights.kol
                      );
                      return { ...job, matchScore };
                    }).sort((a, b) => b.matchScore - a.matchScore);

                    return calculatedJobs.map((job, idx) => {
                      let barColor = "bg-amber-700";
                      let textColor = "text-amber-600";
                      if (job.matchScore >= 80) {
                        barColor = "bg-amber-400";
                        textColor = "text-amber-400";
                      } else if (job.matchScore >= 70) {
                        barColor = "bg-amber-500";
                        textColor = "text-amber-400";
                      } else if (job.matchScore >= 60) {
                        barColor = "bg-yellow-600";
                        textColor = "text-yellow-500";
                      } else {
                        barColor = "bg-yellow-800";
                        textColor = "text-yellow-700";
                      }

                      return (
                        <div
                          key={job.id}
                          className="flex items-center gap-3.5 rounded-xl border border-white/5 bg-slate-950 p-3 hover:bg-amber-400/5 hover:border-amber-400/15 transition-all duration-300 group"
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[10px] font-black text-slate-400 group-hover:bg-amber-500/15 group-hover:text-amber-400 transition-colors">
                            {idx + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-[11.5px] font-extrabold text-white truncate group-hover:text-amber-300 transition-colors">
                                {job.title}
                              </h4>
                              <span className={cn("font-display font-black text-[11px] shrink-0 ml-2", textColor)}>
                                {job.matchScore}% Match
                              </span>
                            </div>

                            {/* Progress bar container */}
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={cn("h-full rounded-full transition-all duration-500", barColor)}
                                style={{ width: `${job.matchScore}%` }}
                              />
                            </div>
                            <span className="block text-[9px] text-slate-500 truncate mt-0.5">{job.desc}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom section matching the design layout and styles of dashboard.htm widgets */}
      <div className="grid gap-6 xl:grid-cols-2">

        {/* Live Activity section */}
        <section className="relative overflow-hidden rounded-2xl border border-white/7 bg-gradient-to-b from-[#0d101b]/80 to-[#050712]/92 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent"></div>

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">Hoạt Động Gần Đây</h2>
            <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-amber-400/30 bg-amber-400/10 text-amber-300">
              Thời Gian Thực
            </span>
          </div>

          {(() => {
            // Build activity items from real data
            const activities: { label: string; time?: string }[] = [];
            // Chiến dịch đã ứng tuyển
            dashboardJobs.forEach((job) => {
              const dateVal = job.createdAt || job.publishedAt;
              const dateStr = dateVal ? formatDate(dateVal) : formatDate(new Date().toISOString());
              activities.push({ label: `${job.brand} đã đăng tải chiến dịch "${job.title}" vào ${dateStr}` });
            });
            // Lịch từ calendar
            const calEvents = Object.values(calendarData?.todoLists ?? {}).flat();
            calEvents.slice(0, 3).forEach((ev: any) => {
              activities.push({ label: ev.title, time: ev.time });
            });

            if (activities.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-10 w-10 mb-3 flex items-center justify-center rounded-full bg-amber-400/10 border border-amber-400/20">
                    <Radio className="h-4 w-4 text-amber-400/60" />
                  </div>
                  <p className="text-xs font-bold text-slate-500">Chưa có hoạt động nào</p>
                  <p className="text-[10px] text-slate-600 mt-1">Các chiến dịch và lịch trình sẽ hiển thị tại đây sau khi bạn đăng nhập và ứng tuyển.</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {activities.slice(0, 5).map((act, idx) => (
                  <div key={idx} className="flex gap-3 rounded-xl border border-amber-400/10 bg-amber-400/[0.03] p-3 text-xs leading-relaxed">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                    <div>
                      <p className="font-semibold text-slate-300">{act.label}</p>
                      {act.time && <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-600">{act.time}</span>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>

        {/* AI Orientation Alert card / Risk Alerts Style */}
        <section className="relative overflow-hidden rounded-2xl border border-white/7 bg-gradient-to-b from-[#0d101b]/80 to-[#050712]/92 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent"></div>

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">CẬP NHẬT HỒ SƠ</h2>
            <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-amber-500/25 bg-amber-500/10 text-amber-300">
              Thông Tin Hệ Thống
            </span>
          </div>

          <div className="space-y-3">
            {/* Warning Alert: Yellow/Orange */}
            <div className="rounded-xl border p-3 border-amber-400/25 bg-amber-400/10 text-xs">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 text-amber-300 shrink-0" />
                <p className="font-bold leading-5 text-slate-200">Hãy cập nhật số đo ngoại hình thường xuyên để AI tối ưu hóa độ khớp công việc của bạn.</p>
              </div>
            </div>

            {/* AI Recommendation: Gold */}
            <div className="rounded-xl border p-3 border-amber-400/25 bg-amber-400/8 text-xs">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-amber-300 shrink-0" />
                <p className="font-bold leading-5 text-slate-200">Liên kết tài khoản mạng xã hội (TikTok, Instagram) để tăng độ nổi bật của hồ sơ và tăng tỷ lệ được duyệt job.</p>
              </div>
            </div>

            {/* Verified: Gold */}
            <div className="rounded-xl border p-3 border-yellow-500/25 bg-yellow-500/8 text-xs">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-yellow-300 shrink-0" />
                <p className="font-bold leading-5 text-slate-200">Tài khoản của bạn sẽ được kiểm định và xác thực bởi Ban quản trị OnstageVN.</p>
              </div>
            </div>
          </div>
        </section>



      </div>

      {/* Guest Action Prompt Modal */}
      <GuestActionPrompt />

      {/* Tier Explanation Dialog Modal */}
      <TierExplanationDialog isOpen={showTierDialog} onClose={() => setShowTierDialog(false)} />

      {/* Control Center Explanation Dialog Modal */}
      <ControlCenterExplanationDialog
        isOpen={showControlCenterDialog}
        onClose={() => setShowControlCenterDialog(false)}
        defaultTab="talent"
      />
    </div>
  );
}
