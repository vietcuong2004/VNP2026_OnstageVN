"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api-client";
import { applyTalentCampaign, resolveCampaignReferralLink, resolveCampaignReferralLinkBySlug } from "@/lib/talent-api";
import { createInitialAvatarDataUrl, normalizeBackendAssetUrl } from "@/lib/avatar";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle,
  CircleDollarSign,
  Clock3,
  Info,
  MapPin,
  Shield,
  Sparkles,
  UserRoundPlus,
} from "lucide-react";

type Props = {
  code?: string;
  campaignSlug?: string;
  referrerSlug?: string;
};

type InvitePartnerProfile = {
  organization_name?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
};

type InviteBrand = {
  name?: string | null;
  external_avatar_url?: string | null;
  partner_profile?: InvitePartnerProfile | null;
  partnerProfile?: InvitePartnerProfile | null;
};

type InviteCampaign = {
  id?: number | string;
  status?: string | null;
  title?: string | null;
  job_type?: string | null;
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  budget_min?: number | string | null;
  budget_max?: number | string | null;
  city?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  application_deadline?: string | null;
  event_date?: string | null;
  roles?: string[] | null;
  target_profiles?: string[] | null;
  owner?: InviteBrand | null;
};

type InviteReferrer = {
  name?: string | null;
};

type CampaignInvitePayload = {
  code?: string;
  type?: string;
  campaign?: InviteCampaign | null;
  referrer?: InviteReferrer | null;
};

function formatDailyCompensation(value?: number | string | null) {
  const amount = Number(value || 0);
  if (!amount) return null;

  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const formatted = Number.isInteger(millions)
      ? String(millions)
      : millions.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
    return `${formatted} triệu/ngày`;
  }

  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000).toLocaleString("vi-VN")}k/ngày`;
  }

  return `${amount.toLocaleString("vi-VN")}đ/ngày`;
}

function formatBudget(min?: number | string | null, max?: number | string | null) {
  const minValue = formatDailyCompensation(min);
  const maxValue = formatDailyCompensation(max);

  if (minValue && maxValue) return `${minValue} - ${maxValue}`;
  if (maxValue) return maxValue;
  if (minValue) return `Từ ${minValue}`;
  return "Thỏa thuận";
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const raw = String(value);
  const normalized = raw.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})?$/, ".$1$2");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    const matched = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (matched) return `${matched[3]}/${matched[2]}/${matched[1]}`;
    return raw;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function toBulletList(value?: string | null) {
  return String(value || "")
    .split(/\r?\n|•|\.|;/)
    .map((item) => item.trim())
    .filter((item) => Boolean(item) && item.toLowerCase() !== "không" && item.toLowerCase() !== "none")
    .slice(0, 6);
}

export default function CampaignInviteLandingClient({ code, campaignSlug, referrerSlug }: Props) {
  const router = useRouter();
  const [inviteData, setInviteData] = useState<CampaignInvitePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const resolver = campaignSlug && referrerSlug
      ? resolveCampaignReferralLinkBySlug(campaignSlug, referrerSlug)
      : resolveCampaignReferralLink(String(code || ""));

    resolver
      .then((data) => {
        if (!isMounted) return;

        if (data?.type !== "campaign") {
          setInviteData(null);
          setError("Đường dẫn này không phải link mời campaign hợp lệ.");
          setLoading(false);
          return;
        }

        setInviteData(data as CampaignInvitePayload);
        setError(null);
        setLoading(false);
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!inviteStorageKey || localStorage.getItem("pendingCampaignInviteCode") !== inviteStorageKey || !getAuthToken()) return;

    const frame = window.requestAnimationFrame(() => {
      setShowConfirmDialog(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [inviteData, inviteStorageKey]);

  const campaign = useMemo<InviteCampaign>(() => inviteData?.campaign ?? {}, [inviteData]);
  const brand = campaign.owner ?? {};
  const partner = brand.partner_profile || brand.partnerProfile || {};
  const referrer = inviteData?.referrer ?? {};

  const brandName = partner.organization_name || brand.name || "Brand Partner";
  const brandLogo =
    normalizeBackendAssetUrl(partner.logo_url || brand.external_avatar_url || "") ||
    createInitialAvatarDataUrl(brandName, "");
  const coverImage = normalizeBackendAssetUrl(partner.cover_url || "") || "/brand_cover_default.png";

  const requirementItems = useMemo(() => {
    const items = [
      ...toBulletList(campaign.requirements),
      ...(campaign.roles || []),
      ...(campaign.target_profiles || []),
    ];

    return Array.from(new Set(items)).slice(0, 8);
  }, [campaign]);

  const benefitItems = useMemo(() => {
    const items = [
      ...toBulletList(campaign.benefits),
      campaign.budget_min || campaign.budget_max ? `Thù lao dự kiến ${formatBudget(campaign.budget_min, campaign.budget_max)}.` : null,
      campaign.location || campaign.city ? `Làm việc tại ${campaign.location || campaign.city}.` : null,
    ].filter(Boolean) as string[];

    return Array.from(new Set(items)).slice(0, 6);
  }, [campaign]);

  const isCampaignOpen = campaign.status === "published";
  const budget = formatBudget(campaign.budget_min, campaign.budget_max);
  const eventDate = formatDate(campaign.event_date || campaign.start_date);
  const startDate = formatDate(campaign.start_date);
  const endDate = formatDate(campaign.end_date);
  const deadline = formatDate(campaign.application_deadline);

  const handlePrimaryClick = () => {
    if (!getAuthToken()) {
      const redirectPath = `${window.location.pathname}${window.location.search}`;
      localStorage.setItem("pendingCampaignInviteCode", inviteStorageKey);
      localStorage.setItem("pendingCampaignInvitePath", redirectPath);
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    setShowConfirmDialog(true);
  };

  const clearPendingState = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("pendingCampaignInviteCode");
    localStorage.removeItem("pendingCampaignInvitePath");
  };

  const handleConfirmApply = async () => {
    if (!campaign.id) return;

    setIsApplying(true);
    try {
      await applyTalentCampaign(campaign.id, "Ứng tuyển từ link giới thiệu campaign.", inviteData?.code || code);
      clearPendingState();
      setSuccess(true);
      setShowConfirmDialog(false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Không thể ứng tuyển campaign từ link giới thiệu này.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleDecline = () => {
    clearPendingState();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#02040a] text-center px-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-amber-400 border-r-2 border-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F0C56B]">VNP</span>
          </div>
        </div>
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">
          Đang tải thông tin lời mời...
        </p>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#02040a] text-center px-4 relative overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute top-0 right-0 left-0 z-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <img src="/hero_bg.png" alt="Background" className="w-full h-full object-cover" />
        </div>

        <div className="max-w-md rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 shadow-2xl backdrop-blur-md relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-450">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-lg font-black uppercase tracking-wider text-white">Liên kết không hợp lệ</h2>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            {error || "Đường liên kết mời campaign không tồn tại, đã hết hạn hoặc chưa được kích hoạt. Vui lòng kiểm tra lại."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 border border-white/10 px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-900"
          >
            Trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#02040a] text-center px-4 relative overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute top-0 right-0 left-0 z-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <img src="/hero_bg.png" alt="Background" className="w-full h-full object-cover" />
        </div>

        <div className="max-w-md w-full rounded-3xl border border-[#D4A64A]/30 bg-[#092318]/25 p-8 shadow-2xl backdrop-blur-md relative z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-gold text-slate-950 shadow-lg shadow-amber-500/25">
            <Check className="h-9 w-9 stroke-[3]" />
          </div>

          <h2 className="mt-6 font-display text-xl md:text-2xl font-black uppercase tracking-wider text-white">🎉 Thành công!</h2>
          <p className="mt-2 text-xs font-bold text-[#F0C56B] uppercase tracking-widest">Tham gia chiến dịch thành công</p>

          <div className="mt-5 rounded-2xl border border-white/5 bg-slate-950/70 p-4 flex items-center gap-3 text-left">
            <img src={brandLogo} alt={brandName} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = createInitialAvatarDataUrl(brandName, ""); }} className="h-11 w-11 rounded-xl object-cover border border-[#D4A64A]/30" />
            <div className="min-w-0">
              <p className="text-sm font-black text-white truncate">{campaign.title || "Chiến dịch"}</p>
              <p className="text-[10px] text-slate-500 font-semibold truncate">{brandName} • {campaign.city || campaign.location || "Linh hoạt"}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-left text-xs text-slate-350 font-medium">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-450 shrink-0" />
              <span>Bạn đã tham gia chiến dịch của {brandName} thành công.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-450 shrink-0" />
              <span>Ghi nhận nguồn giới thiệu từ đối tác: {referrer.name || "OnstageVN"}.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-450 shrink-0" />
              <span>Trạng thái tham gia hiển thị trong Workspace của bạn.</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/talent/jobs")}
            className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-gold text-xs font-black uppercase tracking-widest text-slate-950 shadow-lg shadow-amber-500/10 transition hover:brightness-110 active:scale-[0.99] cursor-pointer"
          >
            Đi tới cơ hội việc làm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Immersive Mockup Background Image & Gradient Overlays (z-0 to prevent background-color overlap) */}
      <div className="absolute top-0 right-0 left-0 z-0 w-full h-[70vh] md:h-[105vh] overflow-hidden pointer-events-none">
        <img
          src="/hero_bg.png"
          alt="OnstageVN Background Graphics"
          className="w-full h-full object-cover object-right md:object-center absolute right-0 top-0 opacity-40"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-[#02040a]/75 pointer-events-none" />
      </div>

      {/* Additional ambient glows matching root app/page.tsx */}
      <div className="absolute top-[400px] right-10 -z-10 h-[450px] w-[450px] rounded-full bg-purple-650/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[200px] left-1/2 -translate-x-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-[#D4A64A]/5 blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#02040a]/80 backdrop-blur-md border-b border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="w-full max-w-[1550px] mx-auto flex items-center justify-between py-3 md:py-4 px-4 md:px-8">
          <div className="flex items-center hover:opacity-95 transition-opacity cursor-pointer" onClick={() => router.push("/")}>
            <img src="/logo_new.png" alt="OnstageVN Logo Icon" className="h-8 w-8 md:h-11 md:w-11 object-contain shrink-0" />
            <img src="/logo_text.png" alt="OnstageVN Logo Text" className="h-6 md:h-9 object-contain shrink-0 ml-2" />
            <span className="ml-2.5 rounded bg-amber-400/10 border border-amber-400/25 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-300 hidden sm:inline-block">
              INVITE
            </span>
          </div>
          <div>
            <button
              onClick={() => router.push("/")}
              className="px-3.5 py-1.5 md:px-5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-300 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Trang chủ
            </button>
          </div>
        </div>
      </header>

      {/* Spacer to push content down below fixed header */}
      <div className="h-20 md:h-24 w-full shrink-0 relative z-10" />

      {/* Main Content Wrapper (z-10 to stay on top of background graphics) */}
      <main className="relative z-10 w-full max-w-[1550px] mx-auto px-4 md:px-8 py-6 md:py-10 flex-1 grid gap-8 lg:grid-cols-12 items-start">

        {/* Left Column - Details */}
        <section className="lg:col-span-8 space-y-8 text-left">

          {/* Brand Hero Card (Home page aesthetic) */}
          <div className="rounded-3xl border border-white/5 bg-[#090b16]/45 backdrop-blur-xl overflow-hidden shadow-2xl relative group hover:border-[#D4A64A]/20 transition-all duration-300">
            {/* Banner block containing default brand cover image */}
            <div className="h-40 md:h-56 relative overflow-hidden border-b border-white/5">
              <img
                src={coverImage}
                alt="Campaign Cover Banner"
                onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/brand_cover_default.png"; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            </div>

            {/* Profile Content block */}
            <div className="p-6 md:p-8 relative">
              {/* Header row: Avatar & details side-by-side on desktop, stacked on mobile, offset into banner */}
              <div className="flex flex-col md:flex-row items-start md:items-end gap-5 -mt-16 md:-mt-20 relative z-10">
                {/* Avatar position with gold glowing border */}
                <div className="relative h-24 w-24 md:h-28 md:w-28 shrink-0 rounded-3xl overflow-hidden border-4 border-[#02040a] bg-slate-950 p-[3px] shadow-2xl shadow-black/80 group-hover:border-[#D4A64A]/30 transition-colors duration-300">
                  <img src={brandLogo} alt={brandName} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = createInitialAvatarDataUrl(brandName, ""); }} className="h-full w-full rounded-2xl object-cover bg-slate-900" />
                </div>

                {/* Text details */}
                <div className="flex-1 space-y-2 min-w-0 pb-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="font-display text-xl md:text-2xl font-black tracking-tight text-white uppercase leading-none">
                      {campaign.title || "Lời mời campaign"}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded bg-[#071B42]/60 border border-[#D4A64A]/30 px-2.5 py-1 text-[9px] font-black uppercase text-[#F0C56B] shadow-sm">
                      {campaign.job_type || "Campaign"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 text-[9px] font-black uppercase text-emerald-300 shadow-sm">
                      {isCampaignOpen ? "Đang nhận ứng tuyển" : "Tạm đóng"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-[9px] font-black text-[#F0C56B] uppercase tracking-widest bg-[#071B42]/85 border border-[#D4A64A]/30 px-2.5 py-1 rounded">
                      {brandName}
                    </span>
                    <span className="text-[9px] font-black text-slate-350 uppercase tracking-widest bg-slate-950/70 border border-white/10 px-2.5 py-1 rounded flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-amber-400" /> {campaign.city || campaign.location || "Linh hoạt"}
                    </span>
                    <span className="text-slate-550 font-semibold text-[10px] uppercase tracking-wider">
                      Campaign Partner • OnstageVN Ecosystem
                    </span>
                  </div>
                </div>
              </div>

              {/* Campaign Description */}
              <div className="mt-6 p-5 rounded-2xl bg-slate-950/50 border border-white/5 text-slate-200 text-xs md:text-sm leading-relaxed text-justify space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#F0C56B] flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" /> Mô tả chiến dịch
                </p>
                <p className="text-slate-350">
                  {campaign.description && campaign.description.trim().toLowerCase() !== "không"
                    ? campaign.description
                    : "Brand sẽ cập nhật mô tả campaign chi tiết tại đây."}
                </p>
              </div>
            </div>
          </div>

          {/* Upline Referrer Pill */}
          {referrer.name && (
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full border border-[#D4A64A]/30 bg-[#071B42]/45 backdrop-blur-md max-w-full">
              <span className="h-2 w-2 rounded-full bg-[#F0C56B] animate-pulse shrink-0" />
              <span className="text-[10px] md:text-xs font-bold text-[#F0C56B] uppercase tracking-wider flex items-center gap-2 truncate">
                Được giới thiệu bởi đối tác: <strong className="text-white font-black">{referrer.name}</strong>
              </span>
            </div>
          )}

          {/* Campaign Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Thù lao", value: budget, icon: CircleDollarSign },
              { label: "Bắt đầu campaign", value: startDate, icon: CalendarDays },
              { label: "Kết thúc campaign", value: endDate, icon: Clock3 },
              { label: "Sự kiện chính", value: eventDate, icon: Briefcase },
            ].map((item) => (
              <div key={item.label} className="group relative p-4 rounded-2xl bg-[#071B42]/30 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-300 hover:bg-[#0c0f24]/50 text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D4A64A]/10 border border-[#D4A64A]/20 text-[#F0C56B] mb-2 group-hover:scale-105 transition-transform duration-300">
                  <item.icon className="h-4 w-4" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.label}</p>
                <p className="mt-1 text-xs font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Campaign Details Grid */}
          <div className="rounded-3xl border border-white/5 bg-[#090b16]/45 backdrop-blur-xl p-6 shadow-2xl hover:border-[#D4A64A]/20 transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-[#D4A64A]/50" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-[#F0C56B]">Thông tin tuyển chọn</h2>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#F0C56B]">Yêu cầu</p>
                <ul className="mt-3 space-y-2 text-xs text-slate-350">
                  {(requirementItems.length ? requirementItems : ["Brand sẽ cập nhật yêu cầu chi tiết sau."]).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-300">Phúc lợi</p>
                <ul className="mt-3 space-y-2 text-xs text-slate-350">
                  {(benefitItems.length ? benefitItems : ["Quyền lợi sẽ được Brand cập nhật theo brief."]).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-450" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4 text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Hạn ứng tuyển</p>
                <p className="mt-1 text-sm font-black text-cyan-200">{deadline}</p>
              </div>
              <div className="rounded-2xl border border-purple-400/15 bg-purple-400/5 p-4 text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Địa điểm</p>
                <p className="mt-1 text-sm font-black text-purple-200">{campaign.location || campaign.city || "Linh hoạt"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column - Action Card (Sticky) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 text-left">
          <div className="rounded-3xl border border-white/5 bg-[#090b16]/45 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden hover:border-[#D4A64A]/25 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

            <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400/15 border border-amber-400/30 px-3 py-1 rounded-full text-amber-300 shadow-sm inline-block mb-4">
              THAM GIA CAMPAIGN
            </span>

            {/* Referrer display */}
            <div className="p-5 rounded-2xl bg-[#071B42]/40 border border-[#D4A64A]/20 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Người giới thiệu</span>
              <span className="text-lg font-black text-gradient-gold mt-1 block tracking-tight truncate">{referrer.name || "Đối tác OnstageVN"}</span>
              <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-1.5 block leading-relaxed">
                Tham gia qua đối tác giới thiệu để vào trực tiếp chiến dịch
              </span>
            </div>

            {/* Campaign info details */}
            <div className="mt-5 rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-3.5 text-[11px] leading-relaxed">
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 text-[#F0C56B] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-black uppercase tracking-wider text-slate-350 block">Ghi nhận tham gia</span>
                  <p className="text-slate-450 mt-1">
                    Bạn sẽ được duyệt tham gia trực tiếp chiến dịch của Brand kèm nguồn giới thiệu của {referrer.name || "đối tác"}.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-white/5 pt-3.5">
                <Shield className="h-4 w-4 text-[#F0C56B] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-black uppercase tracking-wider text-slate-350 block">Bảo vệ & Quy trình</span>
                  <p className="text-slate-450 mt-1">
                    Luồng tham gia vẫn đi qua hệ thống OnstageVN, bảo đảm các quyền lợi và mức chi trả của bạn.
                  </p>
                </div>
              </div>
            </div>

            {!isCampaignOpen && (
              <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-200">
                Campaign này hiện không còn ở trạng thái nhận ứng tuyển.
              </div>
            )}

            {/* Desktop Actions */}
            <div className="mt-6 hidden lg:flex flex-col gap-4">
              <button
                onClick={handlePrimaryClick}
                disabled={!isCampaignOpen}
                className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-gold text-slate-950 hover:shadow-[0_0_20px_rgba(240,197,107,0.3)] hover:scale-102 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tham gia ngay <ArrowRight className="h-4 w-4" />
              </button>

              <div className="relative w-full group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4A64A] to-[#F0C56B] rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300 pointer-events-none" />
                <button
                  onClick={handleDecline}
                  className="relative w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-950 text-[#F0C56B] hover:text-white hover:scale-102 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border border-[#D4A64A]/50 shadow-[0_0_15px_rgba(212,166,74,0.2)]"
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-4 border-t border-white/5 bg-[#02040a]/90 backdrop-blur-md shadow-2xl flex items-center gap-3">
        <button
          onClick={handleDecline}
          className="flex-1 h-11 rounded-xl bg-slate-950 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-350 active:scale-[0.98] transition cursor-pointer"
        >
          Từ chối
        </button>
        <button
          onClick={handlePrimaryClick}
          disabled={!isCampaignOpen}
          className="flex-[1.4] h-11 rounded-xl bg-gradient-gold text-[10px] font-black uppercase tracking-widest text-slate-950 active:scale-[0.98] transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tham gia ngay <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-[#02040a]/80 backdrop-blur-md pt-16 pb-24 md:pb-12 px-4 md:px-8 mt-16 max-w-[1550px] mx-auto text-center">
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <img src="/logo_new.png" alt="OnstageVN Logo Icon" className="h-12 w-12 object-contain shrink-0" />
            <img src="/logo_text.png" alt="OnstageVN Logo Text" className="h-10 object-contain shrink-0" />
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed text-center px-4 font-medium">
            Nền tảng công nghệ tối tân giúp kiến tạo hồ sơ sắc đẹp số chuyên nghiệp, định hướng AI và tự động khớp nối cơ hội hợp tác cho các thế hệ idol cùng nhãn hàng.
          </p>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col items-center gap-3 text-[10px] font-semibold text-slate-500">
          <p>© {new Date().getFullYear()} ONSTAGE VN. All rights reserved.</p>
          <p>Designed with excellence for beauty and brand matching.</p>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl border border-[#D4A64A]/30 bg-[#02040a] p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 border border-[#D4A64A]/30 text-amber-400 mx-auto">
              <UserRoundPlus className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-center font-display text-lg font-black uppercase tracking-wider text-white">Xác nhận tham gia</h3>
            <p className="mt-2 text-center text-xs text-slate-400 leading-relaxed font-medium">
              Bạn sắp tham gia campaign <strong className="text-white">{campaign.title || "-"}</strong> qua link giới thiệu của <strong className="text-amber-300">{referrer.name || "đối tác"}</strong>.
            </p>

            <div className="mt-5 rounded-2xl border border-white/5 bg-slate-950/70 p-4 space-y-2.5 text-xs text-left text-slate-350 font-medium">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-amber-450 shrink-0 mt-0.5" />
                <span>Bạn sẽ được duyệt tham gia trực tiếp chiến dịch này.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-amber-450 shrink-0 mt-0.5" />
                <span>Trạng thái tham gia sẽ hiển thị trong Workspace của bạn.</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                disabled={isApplying}
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 h-11 rounded-xl bg-slate-900 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                disabled={isApplying || !isCampaignOpen}
                onClick={handleConfirmApply}
                className="flex-1 h-11 items-center justify-center gap-1.5 rounded-xl bg-gradient-gold text-xs font-black uppercase tracking-widest text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/15 disabled:opacity-50 transition cursor-pointer"
              >
                {isApplying ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
