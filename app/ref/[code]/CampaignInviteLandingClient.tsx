"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api-client";
import { applyTalentCampaign, resolveCampaignReferralLink } from "@/lib/talent-api";
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
  Users,
} from "lucide-react";

type Props = {
  code: string;
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

function formatCurrency(value?: number | string | null) {
  const amount = Number(value || 0);
  if (!amount) return null;
  return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
}

function formatBudget(min?: number | string | null, max?: number | string | null) {
  const minValue = formatCurrency(min);
  const maxValue = formatCurrency(max);

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
    .filter(Boolean)
    .slice(0, 6);
}

export default function CampaignInviteLandingClient({ code }: Props) {
  const router = useRouter();
  const [inviteData, setInviteData] = useState<CampaignInvitePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    resolveCampaignReferralLink(code)
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
  }, [code]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("pendingCampaignInviteCode") !== code || !getAuthToken()) return;

    const frame = window.requestAnimationFrame(() => {
      setShowConfirmDialog(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [code, inviteData]);

  const campaign = useMemo<InviteCampaign>(() => inviteData?.campaign ?? {}, [inviteData]);
  const brand = campaign.owner ?? {};
  const partner = brand.partner_profile || brand.partnerProfile || {};
  const referrer = inviteData?.referrer ?? {};

  const brandName = partner.organization_name || brand.name || "Brand Partner";
  const brandLogo =
    normalizeBackendAssetUrl(partner.logo_url || brand.external_avatar_url || "") ||
    createInitialAvatarDataUrl(brandName, "");
  const coverImage = normalizeBackendAssetUrl(partner.cover_url || "") || "/cover_image.png";

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
      campaign.budget_min || campaign.budget_max ? `Cát-xê dự kiến ${formatBudget(campaign.budget_min, campaign.budget_max)}.` : null,
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
      localStorage.setItem("pendingCampaignInviteCode", code);
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

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#02040a] px-4 text-center text-white">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-r-2 border-t-2 border-amber-400 border-b-transparent border-l-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F0C56B]">VNP</span>
          </div>
        </div>
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-500">Đang tải lời mời campaign...</p>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#02040a] px-4 text-center text-white">
        <div className="max-w-md rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 shadow-2xl backdrop-blur-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-lg font-black uppercase tracking-wider text-white">Link không hợp lệ</h2>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            {error || "Đường liên kết này không còn khả dụng. Vui lòng liên hệ người giới thiệu hoặc Brand để nhận link mới."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-slate-950 px-6 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-900"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#02040a] px-4 text-center text-white">
        <div className="w-full max-w-md rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 shadow-2xl backdrop-blur-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/25">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>
          <h2 className="mt-6 text-xl font-black uppercase tracking-wider text-white">Ứng tuyển thành công</h2>
          <p className="mt-3 text-sm text-slate-300">
            Hồ sơ của bạn đã được gửi vào campaign <strong>{campaign.title || "chiến dịch"}</strong> qua link giới thiệu của <strong>{referrer.name || "đối tác"}</strong>.
          </p>
          <div className="mt-6 rounded-2xl border border-white/5 bg-slate-950/60 p-4 text-left text-xs text-slate-300">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Brand</span>
              <span className="font-bold text-white">{brandName}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-slate-500">Campaign</span>
              <span className="font-bold text-white">{campaign.title || "-"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-slate-500">Người giới thiệu</span>
              <span className="font-bold text-amber-300">{referrer.name || "-"}</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/talent/jobs")}
            className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:brightness-110"
          >
            Đi tới chợ việc làm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02040a] text-white">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#02040a]/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-4 md:px-8">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:border-white/20 hover:bg-white/5"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Về trang chủ
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo_icon.png" alt="OnstageVN" className="h-9 w-9 object-contain" />
            <img src="/logo_text.png" alt="OnstageVN" className="h-7 object-contain" />
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-6 md:px-8 lg:grid-cols-12 lg:py-10">
        <section className="space-y-8 lg:col-span-8">
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#090b16]/45 shadow-2xl backdrop-blur-xl">
            <div className="relative h-48 overflow-hidden border-b border-white/5 md:h-64">
              <img
                src={coverImage}
                alt={brandName}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/cover_image.png";
                }}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
            </div>

            <div className="relative p-6 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:gap-6">
                <div className="relative -mt-16 h-24 w-24 overflow-hidden rounded-3xl border-4 border-[#02040a] bg-slate-950 p-[3px] shadow-2xl md:-mt-20 md:h-28 md:w-28">
                  <img
                    src={brandLogo}
                    alt={brandName}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = createInitialAvatarDataUrl(brandName, "");
                    }}
                    className="h-full w-full rounded-2xl object-cover bg-slate-900"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-2 pb-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded bg-amber-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-300">
                      {campaign.job_type || "Campaign"}
                    </span>
                    <span className="rounded bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-300">
                      {isCampaignOpen ? "Đang nhận ứng tuyển" : "Tạm đóng"}
                    </span>
                  </div>
                  <h1 className="text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
                    {campaign.title || "Lời mời campaign"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <span>{brandName}</span>
                    <span className="text-slate-600">•</span>
                    <span>{campaign.city || campaign.location || "Linh hoạt"}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                    <Users className="h-3.5 w-3.5" />
                    Người giới thiệu: <strong className="text-white">{referrer.name || "Đối tác OnstageVN"}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/5 bg-slate-950/55 p-5 text-sm leading-relaxed text-slate-300">
                {campaign.description || "Brand sẽ cập nhật mô tả campaign chi tiết tại đây."}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Ngân sách", value: budget, icon: CircleDollarSign },
              { label: "Bắt đầu campaign", value: startDate, icon: CalendarDays },
              { label: "Kết thúc campaign", value: endDate, icon: Clock3 },
              { label: "Sự kiện chính", value: eventDate, icon: Briefcase },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/5 bg-[#090b16]/45 p-4 backdrop-blur-xl">
                <item.icon className="h-4.5 w-4.5 text-amber-300" />
                <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</p>
                <p className="mt-1 text-sm font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-white/5 bg-[#090b16]/45 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-amber-400/50" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-amber-300">Thông tin tuyển chọn</h2>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-white">Yêu cầu</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {(requirementItems.length ? requirementItems : ["Brand sẽ cập nhật yêu cầu chi tiết sau."]).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-white">Phúc lợi</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {(benefitItems.length ? benefitItems : ["Quyền lợi sẽ được Brand cập nhật theo brief."]).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hạn ứng tuyển</p>
                <p className="mt-1 text-sm font-black text-cyan-200">{deadline}</p>
              </div>
              <div className="rounded-2xl border border-purple-400/15 bg-purple-400/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Địa điểm</p>
                <p className="mt-1 text-sm font-black text-purple-200">{campaign.location || campaign.city || "Linh hoạt"}</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-white/5 bg-[#090b16]/45 p-6 shadow-2xl backdrop-blur-xl">
            <span className="inline-block rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-amber-300">
              Tham gia qua link giới thiệu
            </span>

            <div className="mt-4 rounded-2xl border border-amber-400/20 bg-[#071B42]/45 p-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campaign</p>
              <p className="mt-2 text-xl font-black text-white">{campaign.title || "-"}</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">
                Tham gia qua người giới thiệu <strong className="text-amber-300">{referrer.name || "Đối tác"}</strong> để Brand ghi nhận nguồn ứng tuyển chính xác.
              </p>
            </div>

            <div className="mt-5 space-y-3 rounded-2xl border border-white/5 bg-slate-950/50 p-4 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <span>Brand sẽ nhận hồ sơ của bạn kèm nguồn giới thiệu từ link này.</span>
              </div>
              <div className="flex items-start gap-2.5 border-t border-white/5 pt-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>Ứng tuyển vẫn đi qua hệ thống OnstageVN, không làm thay đổi luồng xử lý campaign hiện tại.</span>
              </div>
              <div className="flex items-start gap-2.5 border-t border-white/5 pt-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <span>Địa điểm làm việc: {campaign.location || campaign.city || "Linh hoạt"}.</span>
              </div>
            </div>

            {!isCampaignOpen && (
              <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-200">
                Campaign này hiện không còn ở trạng thái nhận ứng tuyển.
              </div>
            )}

            <div className="mt-6 hidden flex-col gap-3 lg:flex">
              <button
                onClick={handlePrimaryClick}
                disabled={!isCampaignOpen}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ứng tuyển ngay <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push(`/campaign/${campaign.id || ""}?ref=${encodeURIComponent(code)}`)}
                className="flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-slate-950 text-xs font-black uppercase tracking-widest text-slate-300 transition hover:border-white/20 hover:bg-slate-900"
              >
                Xem trang campaign cũ
              </button>
            </div>
          </div>
        </aside>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-[#02040a]/92 p-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/campaign/${campaign.id || ""}?ref=${encodeURIComponent(code)}`)}
            className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-300"
          >
            Xem thêm
          </button>
          <button
            onClick={handlePrimaryClick}
            disabled={!isCampaignOpen}
            className="flex-[1.4] rounded-xl bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ứng tuyển ngay
          </button>
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-amber-400/25 bg-[#02040a] p-6 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
              <UserRoundPlus className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-center text-lg font-black uppercase tracking-wider text-white">Xác nhận ứng tuyển</h3>
            <p className="mt-2 text-center text-sm leading-relaxed text-slate-400">
              Bạn sắp gửi hồ sơ vào campaign <strong className="text-white">{campaign.title || "-"}</strong> qua link giới thiệu của <strong className="text-amber-300">{referrer.name || "đối tác"}</strong>.
            </p>
            <div className="mt-5 space-y-2 rounded-2xl border border-white/5 bg-slate-950/65 p-4 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>Brand sẽ nhận hồ sơ của bạn cùng nguồn giới thiệu từ link này.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>Luồng apply và xét duyệt vẫn đi qua hệ thống campaign như bình thường.</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isApplying}
                className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-300"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmApply}
                disabled={isApplying || !isCampaignOpen}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
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