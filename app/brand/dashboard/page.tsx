"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookmarkCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  Heart,
  MapPin,
  MessageSquare,
  Search,
  UserRoundCheck,
  Wallet,
} from "lucide-react";
import { savedTalentIds, type Campaign, type TalentProfile } from "@/lib/brand-mvp-data";
import {
  loadBrandCampaignCommissions,
  loadBrandCampaigns,
  loadBrandPartnerProfile,
  loadBrandRosterTalents,
  loadBrandTalents,
  type BrandRosterTalent,
} from "@/lib/brand-api";
import { getStoredAuthUser } from "@/lib/api-client";
import { createInitialAvatarDataUrl, isUsableAvatarUrl, normalizeBackendAssetUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { useGuestActionPrompt } from "@/components/guest-action-prompt";

const nextActions = [
  {
    title: "Hoàn thiện hồ sơ đối tác",
    description: "Bổ sung thông tin thương hiệu, người phụ trách và kênh liên hệ để sẵn sàng vận hành campaign.",
    href: "/brand/settings",
    icon: UserRoundCheck,
  },
  {
    title: "Tìm talent phù hợp",
    description: "Lọc talent theo vai trò, khu vực, tier và độ hoàn thiện hồ sơ để thêm vào Brand hoặc campaign.",
    href: "/brand/search",
    icon: Search,
  },
  {
    title: "Tạo campaign mới",
    description: "Tạo brief tuyển chọn mới để nhận ứng viên, quản lý shortlist và theo dõi tiến độ chiến dịch.",
    href: "/brand/campaigns",
    icon: Briefcase,
  },
];

const emptyPartnerProfile = {
  organizationName: "",
  organizationType: "brand",
  industry: "",
  websiteUrl: "",
  fanpageUrl: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  city: "",
  description: "",
  verificationStatus: "pending",
  logoUrl: "",
  coverUrl: "",
};

function isBackendCampaignId(id: string) {
  return /^\d+$/.test(String(id || ""));
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function formatRosterDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getRosterSourceLabel(source?: string | null) {
  switch (source) {
    case "manual":
      return "Thêm thủ công";
    case "wishlist":
      return "Từ danh sách lưu";
    case "campaign":
      return "Từ campaign";
    case "referral":
      return "Từ link mời";
    default:
      return "Trong Brand";
  }
}

function resolveRosterTalentName(item: BrandRosterTalent) {
  return (
    item.talent_profile?.user?.name
    || item.talent_profile?.display_name
    || item.talent_profile?.full_name
    || `Talent #${item.talent_profile_id}`
  );
}

function resolveRosterTalentAvatar(item: BrandRosterTalent) {
  const profile = item.talent_profile;
  const avatarPhoto = profile?.photos?.find((photo) => photo?.category === "avatar");
  const avatarUrl = normalizeBackendAssetUrl(
    avatarPhoto?.url
    || avatarPhoto?.path
    || profile?.avatar_url
    || profile?.user?.external_avatar_url
    || "",
  );

  if (isUsableAvatarUrl(avatarUrl)) return avatarUrl;

  return createInitialAvatarDataUrl(resolveRosterTalentName(item), profile?.user?.email || profile?.user?.name);
}

function rankRecommendedTalents(items: TalentProfile[]) {
  return [...items]
    .sort((a, b) => {
      if (Number(b.verified) !== Number(a.verified)) return Number(b.verified) - Number(a.verified);
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (b.followersCount !== a.followersCount) return b.followersCount - a.followersCount;
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.completion !== a.completion) return b.completion - a.completion;
      return b.completedJobs - a.completedJobs;
    })
    .slice(0, 16);
}

function resolveRecommendedTalentAvatar(talent: TalentProfile) {
  const avatarUrl = normalizeBackendAssetUrl(talent.avatar || '');

  if (isUsableAvatarUrl(avatarUrl)) return avatarUrl;

  return createInitialAvatarDataUrl(talent.name, talent.name);
}

function getRecommendedTalentStatus(id: string) {
  if (id === "tal-1" || id === "tal-2") return "available";
  if (id === "tal-3") return "busy";
  return "maybe";
}

function getTalentTypes(talent: TalentProfile) {
  if (Array.isArray(talent.talentTypes) && talent.talentTypes.length) {
    return talent.talentTypes.map((type) => String(type).trim()).filter(Boolean);
  }

  return talent.type ? [talent.type] : [];
}

export default function BrandDashboard() {
  const router = useRouter();
  const { requireAuthAction, GuestActionPrompt } = useGuestActionPrompt();
  const [authUser, setAuthUser] = useState<{ id?: number | string; name?: string; email?: string } | null>(null);
  const authUserId = authUser?.id ? String(authUser.id) : null;

  const [savedIds, setSavedIds] = useState<string[]>(savedTalentIds);
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);
  const [rosterTalents, setRosterTalents] = useState<BrandRosterTalent[]>([]);
  const [recommendedTalents, setRecommendedTalents] = useState<TalentProfile[]>([]);
  const [partnerProfile, setPartnerProfile] = useState(emptyPartnerProfile);
  const [approvedRevenue, setApprovedRevenue] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);

  useEffect(() => {
    setAuthUser(getStoredAuthUser<{ id?: number | string; name?: string; email?: string }>());
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([
      loadBrandCampaigns([]).catch(() => []),
      loadBrandRosterTalents().catch(() => []),
      loadBrandTalents([]).catch(() => []),
      loadBrandPartnerProfile(emptyPartnerProfile).catch(() => emptyPartnerProfile),
    ]).then(([campaignItems, rosterItems, talentItems, profile]) => {
      if (!active) return;

      setCampaignsList(campaignItems);
      setRosterTalents(rosterItems);
      setRecommendedTalents(rankRecommendedTalents(talentItems));
      setPartnerProfile(profile);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const backendCampaigns = campaignsList.filter((campaign) => isBackendCampaignId(String(campaign.id)));

    if (!authUserId || backendCampaigns.length === 0) {
      queueMicrotask(() => {
        if (!active) return;
        setApprovedRevenue(0);
        setPendingRevenue(0);
      });

      return () => {
        active = false;
      };
    }

    Promise.all(
      backendCampaigns.map(async (campaign) => {
        try {
          return await loadBrandCampaignCommissions(String(campaign.id));
        } catch {
          return null;
        }
      }),
    ).then((responses) => {
      if (!active) return;

      const transactions = responses
        .flatMap((response) => response?.data ?? [])
        .filter((transaction) => String(transaction.receiver_user_id || "") === authUserId);

      setApprovedRevenue(
        transactions
          .filter((transaction) => transaction.status === "approved")
          .reduce((sum, transaction) => sum + transaction.amount, 0),
      );
      setPendingRevenue(
        transactions
          .filter((transaction) => transaction.status === "pending")
          .reduce((sum, transaction) => sum + transaction.amount, 0),
      );
    });

    return () => {
      active = false;
    };
  }, [authUserId, campaignsList]);

  const brandDisplayName = useMemo(() => {
    return partnerProfile.organizationName || partnerProfile.contactName || authUser?.name || "Onstage Brand";
  }, [authUser?.name, partnerProfile.contactName, partnerProfile.organizationName]);

  const openCampaigns = useMemo(
    () => campaignsList.filter((campaign) => campaign.status === "published"),
    [campaignsList],
  );

  const totalApplicants = useMemo(
    () => campaignsList.reduce((sum, campaign) => sum + (campaign.applicants?.length ?? 0), 0),
    [campaignsList],
  );

  const acceptedTalents = useMemo(
    () => rosterTalents.filter((item) => item.status === "active").length,
    [rosterTalents],
  );

  const rosterPreview = useMemo(
    () => rosterTalents.filter((item) => item.status === "active").slice(0, 5),
    [rosterTalents],
  );

  const stats = useMemo(() => [
    {
      label: "Chiến dịch đang mở",
      value: `${openCampaigns.length} chiến dịch`,
      hint: `${campaignsList.length} chiến dịch tổng cộng`,
      icon: Briefcase,
      color: "text-amber-300 border-amber-500/25 bg-amber-500/10",
    },
    {
      label: "Ứng viên nhận được",
      value: `${totalApplicants} ứng viên`,
      hint: `Từ ${openCampaigns.length} campaign đang mở`,
      icon: BookmarkCheck,
      color: "text-cyan-300 border-cyan-500/25 bg-cyan-500/10",
    },
    {
      label: "Talent đang hợp tác",
      value: `${acceptedTalents} talent`,
      hint: `${rosterTalents.length} talent trong brand`,
      icon: UserRoundCheck,
      color: "text-emerald-300 border-emerald-500/25 bg-emerald-500/10",
    },
    {
      label: "Doanh thu đã duyệt",
      value: formatCurrency(approvedRevenue),
      hint: `Chờ duyệt: ${formatCurrency(pendingRevenue)}`,
      icon: Wallet,
      color: "text-[#C9A86A] border-[#C9A86A]/25 bg-[#C9A86A]/10",
    },
  ], [acceptedTalents, approvedRevenue, campaignsList.length, openCampaigns.length, pendingRevenue, rosterTalents.length, totalApplicants]);

  const toggleSaved = (id: string) => {
    if (!requireAuthAction({ actionLabel: "Lưu talent vào shortlist" })) return;
    setSavedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-16">
      <section className="flex flex-col gap-5 border-b border-[#2B313D] pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md border border-[#C9A86A]/30 bg-[#C9A86A]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
              Onstage VN - Model Management System
            </span>
          </div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
            CHÀO MỪNG QUAY LẠI,{" "}
            <span className="bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 bg-clip-text text-transparent">
              {brandDisplayName}
            </span>
            !
          </h1>
          <p className="mt-2 max-w-2xl text-xs font-semibold uppercase tracking-wide text-slate-400">
            Theo dõi campaign đang mở, talent hiện có và những gương mặt phù hợp nhất để triển khai chiến dịch tiếp theo.
          </p>
        </div>

        <button
          onClick={() => router.push("/brand/search")}
          className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 px-5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:-translate-y-0.5"
        >
          <Search className="mr-2 h-4 w-4 shrink-0" />
          Tìm Talent Ngay
        </button>
      </section>

      <section className="space-y-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A]">Talent đề xuất</h3>
              {/* <span className="rounded-lg border border-white/5 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Top hồ sơ phù hợp từ dữ liệu hiện có
              </span> */}
            </div>
            <button onClick={() => router.push("/brand/search")} className="hidden text-[10px] font-black uppercase text-[#C9A86A] hover:underline">
              Khám phá tất cả &rarr;
            </button>
          </div>

          {recommendedTalents.length === 0 ? (
            <div className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-10 text-center shadow-[0_12px_36px_rgba(0,0,0,0.28)]">
              <Search className="mx-auto mb-3 h-8 w-8 text-slate-600" />
              <h3 className="text-sm font-black text-white">Chưa có dữ liệu talent để đề xuất</h3>
              <p className="mt-2 text-xs text-slate-500">Khi dữ liệu talent được tải từ backend, danh sách đề xuất sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recommendedTalents.map((talent) => {
                const isSaved = savedIds.includes(talent.id);
                const avatar = resolveRecommendedTalentAvatar(talent);
                const status = getRecommendedTalentStatus(talent.id);
                const locationText = [talent.district, talent.city].filter(Boolean).join(", ");
                const experienceYears = Number(talent.yearsOfExperience || 0);
                const talentTypes = getTalentTypes(talent);

                return (
                  <article key={talent.id} className="group flex min-w-0 flex-col justify-between rounded-2xl border border-[#2B313D] bg-[#171A21] p-3.5 shadow-lg transition-all duration-300 hover:border-[#C9A86A]/30">
                    <div>
                      <div className="relative mb-3.5 aspect-square w-full overflow-hidden rounded-xl border border-white/5 bg-slate-900">
                        <img
                          src={avatar}
                          alt={talent.name}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = createInitialAvatarDataUrl(talent.name, talent.name);
                          }}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
                          <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[8.5px] font-black uppercase text-slate-950 shadow-md">
                            Hạng {talent.tier}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleSaved(talent.id)}
                          className={cn(
                            "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border shadow-lg backdrop-blur-sm transition active:scale-90",
                            isSaved
                              ? "border-red-500 bg-red-500 text-white"
                              : "border-white/10 bg-[#0F1115]/60 text-slate-300 hover:text-white",
                          )}
                          title={isSaved ? "Bỏ lưu" : "Lưu vào shortlist"}
                        >
                          <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
                        </button>

                        <div className="absolute bottom-2 left-2">
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded bg-[#0F1115]/80 border backdrop-blur-sm px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white",
                            status === "available" && "border-emerald-500/30 text-emerald-400",
                            status === "busy" && "border-red-500/30 text-red-400",
                            status === "maybe" && "border-yellow-500/30 text-yellow-400"
                          )}>
                            <span className={cn(
                              "h-1 w-1 rounded-full",
                              status === "available" && "bg-emerald-400",
                              status === "busy" && "bg-red-400",
                              status === "maybe" && "bg-yellow-400"
                            )} />
                            {status === "available" ? "Rảnh" : status === "busy" ? "Bận" : "Chưa có lịch"}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 space-y-2">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <h3 className="flex-1 truncate text-base font-black leading-tight tracking-wide text-white drop-shadow-[0_1px_8px_rgba(255,255,255,0.12)]">{talent.name}</h3>
                          {talent.verified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
                        </div>

                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C9A86A]" />
                          <span className="truncate">{locationText || "Chưa cập nhật"}</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {talentTypes.length ? (
                            talentTypes.map((type) => (
                              <span key={type} className="inline-flex w-fit rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#C9A86A]">
                                {type}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex w-fit rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#C9A86A]">
                              Chưa cập nhật
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="my-3 flex flex-nowrap gap-1 overflow-hidden">
                        <span className="min-w-0 shrink rounded-md border border-white/10 bg-slate-800/90 px-1.5 py-1 text-[8px] font-black uppercase text-slate-100 shadow-sm whitespace-nowrap">{talent.age} tuổi</span>
                        <span className="min-w-0 shrink rounded-md border border-white/10 bg-slate-800/90 px-1.5 py-1 text-[8px] font-black uppercase text-slate-100 shadow-sm whitespace-nowrap">{experienceYears} năm KN</span>
                        <span className="min-w-0 shrink rounded-md border border-white/10 bg-slate-800/90 px-1.5 py-1 text-[8px] font-black uppercase text-slate-100 shadow-sm whitespace-nowrap">{talent.height}cm</span>
                        <span className="min-w-0 shrink rounded-md border border-white/10 bg-slate-800/90 px-1.5 py-1 text-[8px] font-black uppercase text-slate-100 shadow-sm whitespace-nowrap">{talent.weight}kg</span>
                      </div>

                      <p className="mt-2 line-clamp-2 min-h-7 text-[10px] leading-relaxed text-slate-300">{talent.experience}</p>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-white/5 pt-3.5">
                      <button
                        onClick={() => router.push(`/brand/talents/${talent.id}`)}
                        className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-white/10"
                        title="Xem hồ sơ chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Xem</span>
                      </button>
                      <button
                        onClick={() => {
                          if (!requireAuthAction({ actionLabel: "Nhắn tin với talent" })) return;
                          router.push(`/brand/messages?talentId=${talent.id}`);
                        }}
                        className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-[10px] font-black uppercase tracking-wider text-slate-950 transition active:scale-95"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Nhắn tin
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-center pt-1">
          <button
            onClick={() => router.push("/brand/search")}
            className="group relative flex min-h-12 w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-[#F0C56B]/45 bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-950 shadow-[0_14px_45px_rgba(201,168,106,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(201,168,106,0.34)] active:translate-y-0"
          >
            <span className="absolute inset-y-0 left-[-30%] w-1/3 skew-x-[-20deg] bg-white/35 opacity-0 transition duration-700 group-hover:left-[120%] group-hover:opacity-100" />
            <Search className="mr-2 h-4 w-4 shrink-0" />
            Khám phá tất cả Talent
            <ArrowRight className="ml-2 h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.28)]">
        <div className="mb-5 flex items-center justify-between border-b border-[#2B313D] pb-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A]">TALENT CỦA TÔI</h3>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {acceptedTalents} talent đang hợp tác
            </p>
          </div>
            <button onClick={() => router.push("/brand/my-talents")} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-[#C9A86A] hover:underline">
              <Eye className="h-3.5 w-3.5" />
              Xem tất cả
            </button>
        </div>

        {rosterPreview.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-8 text-center">
            <Building2 className="mx-auto mb-3 h-8 w-8 text-slate-600" />
            <button
              onClick={() => router.push("/brand/my-talents")}
              className="mt-2 mb-4 inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 px-5 text-[10px] font-black uppercase tracking-wider text-slate-950 transition hover:-translate-y-0.5 active:translate-y-0"
            >
              Thêm Talent ngay
            </button>
            <h3 className="text-sm font-black text-white">Brand chưa có talent hoạt động</h3>
            <p className="mt-2 text-xs text-slate-500">Thêm talent vào Brand hoặc duyệt link mời để bắt đầu xây mạng lưới cộng tác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {rosterPreview.map((item) => {
              const profile = item.talent_profile;
              const name = resolveRosterTalentName(item);
              const avatar = resolveRosterTalentAvatar(item);
              const role = profile?.talent_types?.[0] || "Talent";
              const city = profile?.city || "Chưa cập nhật";

              return (
                <article key={String(item.id)} className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#0F1115]/50 p-3">
                  <img
                    src={avatar}
                    alt={name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = createInitialAvatarDataUrl(name, profile?.user?.email || profile?.user?.name);
                    }}
                    className="h-12 w-12 rounded-full border border-white/10 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-[12px] font-black text-white">{name}</h4>
                      {item.status === "active" ? (
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[7.5px] font-black uppercase text-emerald-300">
                          Đang hợp tác
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{role} • {city}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {getRosterSourceLabel(item.source)} • Tham gia {formatRosterDate(item.joined_at)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.28)]">
        <div className="mb-5 flex items-center justify-between border-b border-[#2B313D] pb-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A]">Chiến dịch của tôi</h3>
          <button onClick={() => router.push("/brand/campaigns")} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-[#C9A86A] hover:underline">
            <Eye className="h-3.5 w-3.5" />
            Xem tất cả
          </button>
        </div>

        {openCampaigns.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-10 text-center">
            <Briefcase className="mx-auto mb-3 h-8 w-8 text-slate-600" />
            <button
              onClick={() => router.push("/brand/campaigns")}
              className="mt-2 mb-4 inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 px-5 text-[10px] font-black uppercase tracking-wider text-slate-950 transition hover:-translate-y-0.5 active:translate-y-0"
            >
              Tạo chiến dịch ngay
            </button>
            <h3 className="text-sm font-black text-white">Chưa có chiến dịch nào đang hoạt động</h3>
            <p className="mt-2 text-xs text-slate-500">Hãy tạo campaign mới hoặc xuất bản campaign nháp để bắt đầu nhận ứng viên.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {openCampaigns.map((campaign) => (
              <article key={campaign.id} className="group flex flex-col justify-between rounded-2xl border border-[#2B313D] bg-[#171A21] p-5 shadow-md transition-all duration-300 hover:border-[#C9A86A]/30">
                <div>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-400">{campaign.jobType}</span>
                    <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300">
                      Đang mở
                    </span>
                  </div>
                  <h3 className="line-clamp-1 text-base font-black text-white transition-colors group-hover:text-[#C9A86A]">{campaign.title}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">{campaign.description}</p>
                </div>

                <div className="mt-5 border-t border-white/5 pt-4">
                  <div className="mb-4 grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <span className="block text-[8px] font-bold uppercase text-slate-500">Views</span>
                      <span className="mt-0.5 block font-mono font-bold text-white">{campaign.views}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold uppercase text-slate-500">Ứng viên</span>
                      <span className="mt-0.5 block font-mono font-bold text-white">{campaign.applicants?.length ?? 0}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold uppercase text-slate-500">Shortlist</span>
                      <span className="mt-0.5 block font-mono font-bold text-amber-300">{campaign.shortlistedTalentIds?.length ?? 0}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold uppercase text-slate-500">Liên hệ</span>
                      <span className="mt-0.5 block font-mono font-bold text-emerald-300">{campaign.contactRequests ?? 0}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
                    className="flex h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-white/10"
                  >
                    Xem ATS & brief &rarr;
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <GuestActionPrompt />

      <section className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-6">
        <h3 className="mb-5 text-xs font-black uppercase tracking-widest text-[#C9A86A]">Hành động khuyên dùng</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {nextActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.title}
                onClick={() => router.push(action.href)}
                className="group flex flex-col justify-between rounded-2xl border border-white/5 bg-slate-950/30 p-5 text-left transition hover:border-[#C9A86A]/30 hover:bg-[#C9A86A]/[0.02]"
              >
                <div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#C9A86A]/20 bg-[#C9A86A]/10 text-[#C9A86A]">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-sm font-black text-white">{action.title}</h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{action.description}</p>
                </div>
                <div className="mt-4 flex items-center text-[10px] font-black uppercase tracking-widest text-[#C9A86A] group-hover:underline">
                  Mở màn hình <ArrowRight className="ml-1.5 h-3 w-3 transition group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
