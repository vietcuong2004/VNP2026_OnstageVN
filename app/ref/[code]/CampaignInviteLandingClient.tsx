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
import Header from "@/components/header";
import Footer from "@/components/footer";

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F6] text-center px-4">
        <div className="relative">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#8F0709] border-t-transparent"></div>
        </div>
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-[#8F0709] animate-pulse">
          Đang tải thông tin lời mời...
        </p>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F6] text-center px-4 relative overflow-hidden text-[#191116]">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 shadow-2xl relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-lg font-black uppercase tracking-wider text-[#8F0709]">Liên kết không hợp lệ</h2>
          <p className="mt-3 text-xs leading-relaxed text-[#574D54]">
            {error || "Đường liên kết mời campaign không tồn tại, đã hết hạn hoặc chưa được kích hoạt. Vui lòng kiểm tra lại."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl border border-[#F0D7D3] bg-white px-6 text-xs font-black uppercase tracking-widest text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition shadow-xs cursor-pointer"
          >
            Trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F6] text-center px-4 relative overflow-hidden text-[#191116]">
        <div className="max-w-md w-full rounded-3xl border border-[#F0D7D3] bg-white p-8 shadow-2xl relative z-10 overflow-hidden">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF7EE] text-[#0A6C3B] border border-[#A6E9BD] shadow-sm">
            <Check className="h-9 w-9 stroke-[3]" />
          </div>

          <h2 className="mt-6 font-display text-xl md:text-2xl font-black uppercase tracking-wider text-[#8F0709]">🎉 Thành công!</h2>
          <p className="mt-2 text-xs font-bold text-[#0A6C3B] uppercase tracking-widest">Tham gia chiến dịch thành công</p>

          <div className="mt-5 rounded-2xl border border-[#F0D7D3] bg-[#FFF7F6] p-4 flex items-center gap-3 text-left">
            <img src={brandLogo} alt={brandName} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = createInitialAvatarDataUrl(brandName, ""); }} className="h-11 w-11 rounded-xl object-cover border border-[#F0D7D3]" />
            <div className="min-w-0">
              <p className="text-sm font-black text-[#191116] truncate">{campaign.title || "Chiến dịch"}</p>
              <p className="text-[10px] text-[#574D54] font-semibold truncate">{brandName} • {campaign.city || campaign.location || "Linh hoạt"}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-left text-xs text-[#574D54] font-medium">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-[#0A6C3B] shrink-0" />
              <span>Bạn đã tham gia chiến dịch của {brandName} thành công.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-[#0A6C3B] shrink-0" />
              <span>Ghi nhận nguồn giới thiệu từ đối tác: {referrer.name || "OnstageVN"}.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-[#0A6C3B] shrink-0" />
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
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F6] text-[#191116] flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFF0EE] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFF5F3] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <Header />

      {/* Main Content Wrapper */}
      <main className="relative z-10 w-full max-w-[1550px] mx-auto px-4 md:px-8 py-6 md:py-8 flex-1 grid gap-8 lg:grid-cols-12 items-start">

        {/* Left Column - Details */}
        <section className="lg:col-span-8 space-y-6 text-left">

          {/* Brand Hero Card */}
          <div className="rounded-3xl border border-[#F0D7D3] bg-white overflow-hidden shadow-sm relative group hover:border-[#8F0709]/40 transition-all duration-300">
            {/* Banner block containing default brand cover image */}
            <div className="h-40 md:h-56 relative overflow-hidden border-b border-[#F0D7D3]">
              <img
                src={coverImage}
                alt="Campaign Cover Banner"
                onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/brand_cover_default.png"; }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Profile Content block */}
            <div className="p-6 md:p-8 relative">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-5 -mt-16 md:-mt-20 relative z-10">
                {/* Avatar position */}
                <div className="relative h-24 w-24 md:h-28 md:w-28 shrink-0 rounded-3xl overflow-hidden border-4 border-white bg-white p-[3px] shadow-lg ring-1 ring-[#F0D7D3]">
                  <img src={brandLogo} alt={brandName} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = createInitialAvatarDataUrl(brandName, ""); }} className="h-full w-full rounded-2xl object-cover bg-[#FFF7F6]" />
                </div>

                {/* Text details */}
                <div className="flex-1 space-y-2 min-w-0 pb-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="font-display text-xl md:text-2xl font-black tracking-tight text-[#191116] uppercase leading-none">
                      {campaign.title || "Lời mời campaign"}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0EE] border border-[#F0D7D3] px-3 py-1 text-[9px] font-black uppercase text-[#8F0709]">
                      {campaign.job_type || "Campaign"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF7EE] border border-[#A6E9BD] px-3 py-1 text-[9px] font-black uppercase text-[#0A6C3B]">
                      {isCampaignOpen ? "Đang nhận ứng tuyển" : "Tạm đóng"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-[9px] font-black text-[#8F0709] uppercase tracking-widest bg-[#FFF0EE] border border-[#F0D7D3] px-2.5 py-1 rounded-full">
                      {brandName}
                    </span>
                    <span className="text-[9px] font-bold text-[#574D54] uppercase tracking-widest bg-white border border-[#F0D7D3] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-[#8F0709]" /> {campaign.city || campaign.location || "Linh hoạt"}
                    </span>
                    <span className="text-[#574D54] font-semibold text-[10px] uppercase tracking-wider">
                      Campaign Partner • OnstageVN
                    </span>
                  </div>
                </div>
              </div>

              {/* Campaign Description */}
              <div className="mt-6 p-5 rounded-2xl bg-[#FFF7F6] border border-[#F0D7D3] text-[#191116] text-xs md:text-sm leading-relaxed text-justify space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#8F0709] flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" /> Mô tả chiến dịch
                </p>
                <p className="text-[#574D54] font-medium">
                  {campaign.description && campaign.description.trim().toLowerCase() !== "không"
                    ? campaign.description
                    : "Brand sẽ cập nhật mô tả campaign chi tiết tại đây."}
                </p>
              </div>
            </div>
          </div>

          {/* Upline Referrer Pill */}
          {referrer.name && (
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full border border-[#F0D7D3] bg-[#FFF0EE] shadow-xs max-w-full">
              <span className="h-2 w-2 rounded-full bg-[#E01B1F] animate-pulse shrink-0" />
              <span className="text-[10px] md:text-xs font-bold text-[#8F0709] uppercase tracking-wider flex items-center gap-2 truncate">
                Được giới thiệu bởi đối tác: <strong className="text-[#191116] font-black">{referrer.name}</strong>
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
              <div key={item.label} className="group relative p-4 rounded-2xl bg-white border border-[#F0D7D3] shadow-xs hover:border-[#8F0709]/40 transition-all duration-300 text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF0EE] border border-[#F0D7D3] text-[#8F0709] mb-2 group-hover:scale-105 transition-transform duration-300">
                  <item.icon className="h-4 w-4" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#574D54]">{item.label}</p>
                <p className="mt-1 text-xs font-black text-[#191116]">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Campaign Details Grid */}
          <div className="rounded-3xl border border-[#F0D7D3] bg-white p-6 shadow-sm hover:border-[#8F0709]/40 transition-all duration-300">
            <div className="flex items-center gap-2 border-b border-[#F0D7D3] pb-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-[#8F0709]">Thông tin tuyển chọn</h2>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#8F0709]">Yêu cầu</p>
                <ul className="mt-3 space-y-2 text-xs text-[#574D54] font-medium">
                  {(requirementItems.length ? requirementItems : ["Brand sẽ cập nhật yêu cầu chi tiết sau."]).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#8F0709] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#0A6C3B]">Phúc lợi</p>
                <ul className="mt-3 space-y-2 text-xs text-[#574D54] font-medium">
                  {(benefitItems.length ? benefitItems : ["Quyền lợi sẽ được Brand cập nhật theo brief."]).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#0A6C3B]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF4E5] p-4 text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#B45309]">Hạn ứng tuyển</p>
                <p className="mt-1 text-sm font-black text-[#B45309]">{deadline}</p>
              </div>
              <div className="rounded-2xl border border-[#F0D7D3] bg-[#FFF0EE] p-4 text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#8F0709]">Địa điểm</p>
                <p className="mt-1 text-sm font-black text-[#8F0709]">{campaign.location || campaign.city || "Linh hoạt"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column - Action Card (Sticky) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 text-left">
          <div className="rounded-3xl border border-[#F0D7D3] bg-white p-6 shadow-sm relative overflow-hidden">
            <span className="text-[9px] font-black uppercase tracking-widest bg-[#FFF0EE] border border-[#F0D7D3] px-3 py-1 rounded-full text-[#8F0709] inline-block mb-4">
              THAM GIA CAMPAIGN
            </span>

            {/* Referrer display */}
            <div className="p-5 rounded-2xl bg-[#FFF7F6] border border-[#F0D7D3] text-center">
              <span className="text-[10px] text-[#574D54] font-bold uppercase tracking-wider block">Người giới thiệu</span>
              <span className="text-lg font-black text-[#8F0709] mt-1 block tracking-tight truncate">{referrer.name || "Đối tác OnstageVN"}</span>
              <span className="text-[9px] text-[#574D54] font-semibold uppercase tracking-wider mt-1.5 block leading-relaxed">
                Tham gia qua đối tác giới thiệu để vào trực tiếp chiến dịch
              </span>
            </div>

            {/* Campaign info details */}
            <div className="mt-5 rounded-2xl border border-[#F0D7D3] bg-[#FFF0EE]/40 p-4 space-y-3.5 text-[11px] leading-relaxed">
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 text-[#8F0709] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-black uppercase tracking-wider text-[#8F0709] block">Ghi nhận tham gia</span>
                  <p className="text-[#574D54] font-medium mt-1">
                    Bạn sẽ được duyệt tham gia trực tiếp chiến dịch của Brand kèm nguồn giới thiệu của {referrer.name || "đối tác"}.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-[#F0D7D3] pt-3.5">
                <Shield className="h-4 w-4 text-[#8F0709] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-black uppercase tracking-wider text-[#8F0709] block">Bảo vệ & Quy trình</span>
                  <p className="text-[#574D54] font-medium mt-1">
                    Luồng tham gia vẫn đi qua hệ thống OnstageVN, bảo đảm các quyền lợi và mức chi trả của bạn.
                  </p>
                </div>
              </div>
            </div>

            {!isCampaignOpen && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-600 font-semibold">
                Campaign này hiện không còn ở trạng thái nhận ứng tuyển.
              </div>
            )}

            {/* Desktop Actions */}
            <div className="mt-6 hidden lg:flex flex-col gap-3">
              <button
                onClick={handlePrimaryClick}
                disabled={!isCampaignOpen}
                className="light-force-white w-full h-12 rounded-2xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white shadow-md hover:brightness-110 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tham gia ngay <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleDecline}
                className="w-full h-12 rounded-2xl text-xs font-black uppercase tracking-widest bg-white text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border border-[#F0D7D3] shadow-xs"
              >
                Từ chối
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-4 border-t border-[#F0D7D3] bg-white/95 backdrop-blur-md shadow-2xl flex items-center gap-3">
        <button
          onClick={handleDecline}
          className="flex-1 h-11 rounded-2xl bg-white border border-[#F0D7D3] text-[10px] font-black uppercase tracking-widest text-[#574D54] hover:bg-[#FFF0EE] active:scale-[0.98] transition cursor-pointer shadow-xs"
        >
          Từ chối
        </button>
        <button
          onClick={handlePrimaryClick}
          disabled={!isCampaignOpen}
          className="light-force-white flex-[1.4] h-11 rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-[10px] font-black uppercase tracking-widest !text-white text-white active:scale-[0.98] transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tham gia ngay <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Footer */}
      <div className="w-full px-4 md:px-8 max-w-[1550px] mx-auto pb-20 md:pb-6 relative z-10">
        <Footer />
      </div>

      {/* Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl border border-[#F0D7D3] bg-white p-6 shadow-2xl relative overflow-hidden text-[#191116]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0EE] border border-[#F0D7D3] text-[#8F0709] mx-auto">
              <UserRoundPlus className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-center font-display text-lg font-black uppercase tracking-wider text-[#8F0709]">Xác nhận tham gia</h3>
            <p className="mt-2 text-center text-xs text-[#574D54] leading-relaxed font-medium">
              Bạn sắp tham gia campaign <strong className="text-[#191116]">{campaign.title || "-"}</strong> qua link giới thiệu của <strong className="text-[#8F0709]">{referrer.name || "đối tác"}</strong>.
            </p>

            <div className="mt-5 rounded-2xl border border-[#F0D7D3] bg-[#FFF7F6] p-4 space-y-2.5 text-xs text-left text-[#574D54] font-medium">
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
                className="flex-1 h-11 rounded-2xl bg-white border border-[#F0D7D3] text-xs font-bold uppercase tracking-widest text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition cursor-pointer shadow-xs"
              >
                Hủy
              </button>
              <button
                disabled={isApplying || !isCampaignOpen}
                onClick={handleConfirmApply}
                className="light-force-white flex-1 h-11 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-xs font-black uppercase tracking-widest !text-white text-white hover:brightness-110 shadow-md disabled:opacity-50 transition cursor-pointer"
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
