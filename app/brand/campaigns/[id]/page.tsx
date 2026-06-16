"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  MapPin,
  Users,
  X,
  Plus,
  ImagePlus,
  Pencil,
} from "lucide-react";
import { campaigns as initialCampaigns, talents, type Campaign, type CampaignMedia, type CampaignStage } from "@/lib/brand-mvp-data";
import {
  approveBrandCampaignCommissions,
  closeBrandCampaign,
  deleteBrandCampaignMedia,
  loadBrandCampaign,
  loadBrandCampaignCommissions,
  loadBrandTalents,
  publishBrandCampaign,
  settleBrandCampaign,
  uploadBrandCampaignMedia,
  type BrandCampaignCommissionResponse,
  type BrandCommissionTransaction,
  updateBrandCampaignTalent,
} from "@/lib/brand-api";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const stageLabels: Record<CampaignStage, string> = {
  new: "Chờ duyệt",
  accepted: "Đã duyệt",
  executing: "Đang tham gia",
  completed: "Nghiệm thu",
  confirmed: "Thành công",
};

const getTalentStatus = (id: string) => {
  if (id === "tal-1" || id === "tal-2") return "available";
  if (id === "tal-3") return "busy";
  return "maybe";
};

const DEFAULT_PLATFORM_FEE_RATE = 5;

function isBackendRecordId(id?: string | number | null) {
  return /^\d+$/.test(String(id || ""));
}

function backendStage(stage: CampaignStage) {
  if (stage === "executing" || stage === "completed") return null;
  return stage;
}

function moneyText(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")} VND`;
}

function sentenceCaseText(value: string) {
  const text = String(value || "").trim();
  if (!text) return "";

  const firstLetterIndex = text.search(/\p{L}/u);
  if (firstLetterIndex < 0) return text;

  return `${text.slice(0, firstLetterIndex)}${text.charAt(firstLetterIndex).toLocaleUpperCase("vi-VN")}${text.slice(firstLetterIndex + 1)}`;
}

function displayListText(value?: string | null) {
  return String(value || "")
    .split(/\r?\n|;/)
    .map((item) => sentenceCaseText(item))
    .filter(Boolean);
}

function displayCampaignDate(value?: string | null) {
  if (!value) return "-";

  const raw = String(value);
  const normalized = raw.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})?$/, ".$1$2");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
    return raw;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function displayCampaignDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return "-";
  if (!start) return displayCampaignDate(end);
  if (!end) return displayCampaignDate(start);

  const startText = displayCampaignDate(start);
  const endText = displayCampaignDate(end);
  return startText === endText ? startText : `${startText} - ${endText}`;
}

function transactionRole(transaction: BrandCommissionTransaction) {
  if (transaction.source_type === "campaign_payout") {
    if (transaction.level === 1) return "Brand tổ chức";
    return `Talent thực hiện${transaction.metadata?.eligible_talent_count ? ` (${transaction.metadata.eligible_talent_count} talent)` : ""}`;
  }

  if (transaction.source_type === "roster_management") return "Brand quản lý talent";

  return `F${transaction.level}`;
}

function transactionRelatedTalent(transaction: BrandCommissionTransaction) {
  return transaction.talent?.name
    || transaction.campaign_talent?.profile?.display_name
    || transaction.campaign_talent?.profile?.full_name
    || transaction.campaign_talent?.profile?.user?.name
    || "-";
}

function transactionRow(transaction: BrandCommissionTransaction) {
  return {
    role: transactionRole(transaction),
    recipient: transaction.receiver?.name || "-",
    relatedTalent: transactionRelatedTalent(transaction),
    base: Number(transaction.base_amount) || 0,
    rate: Number(transaction.rate) || 0,
    amount: Number(transaction.amount) || 0,
    status: transaction.status === "approved" ? "Đã duyệt" : transaction.status === "cancelled" ? "Đã hủy" : "Chờ duyệt",
  };
}


function statusLabel(status: Campaign["status"]) {
  if (status === "published") return "Đang mở";
  if (status === "closed") return "Đã đóng";
  return "Nháp";
}

function nextStage(stage: CampaignStage): CampaignStage {
  if (stage === "new") return "accepted";
  if (stage === "accepted") return "executing";
  if (stage === "executing") return "completed";
  return "confirmed";
}

function stageActionLabel(stage: CampaignStage): string {
  if (stage === "new") return "Duyệt ứng viên";
  if (stage === "accepted") return "Bắt đầu tham gia (Check-in)";
  if (stage === "executing") return "Báo cáo hoàn thành";
  if (stage === "completed") return "Nghiệm thu & Giải ngân";
  return "";
}

function getProgressPercent(stage: CampaignStage): string {
  if (stage === "new") return "20%";
  if (stage === "accepted") return "40%";
  if (stage === "executing") return "60%";
  if (stage === "completed") return "80%";
  return "100%";
}

function isStagePassed(current: CampaignStage, target: "new" | "accepted" | "executing" | "completed" | "confirmed"): boolean {
  const order = {
    new: 1,
    accepted: 2,
    executing: 3,
    completed: 4,
    confirmed: 5,
  };

  const currentVal = order[current] || 1;
  const targetVal = order[target] || 1;
  return currentVal >= targetVal;
}

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [payoutDetails, setPayoutDetails] = useState<any>(null);
  const [selectedProfileTalent, setSelectedProfileTalent] = useState<any>(null);
  const [currentApplicantItem, setCurrentApplicantItem] = useState<any>(null);
  const [reviewApplicant, setReviewApplicant] = useState<any>(null);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isShowingPayoutModal, setIsShowingPayoutModal] = useState(false);
  const [commissionData, setCommissionData] = useState<BrandCampaignCommissionResponse | null>(null);
  const [isCommissionLoading, setIsCommissionLoading] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [replacingMediaId, setReplacingMediaId] = useState<string | number | null>(null);

  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});
  const [displayTalents, setDisplayTalents] = useState<any[]>(talents);

  useEffect(() => {
    const fallbackCampaigns = initialCampaigns;

    if (typeof window !== "undefined") {

      const storedRequests = window.localStorage.getItem("onstagevn_sent_requests");
      if (storedRequests) {
        try {
          setSentRequests(JSON.parse(storedRequests));
        } catch (e) { }
      }
      const storedProfile = window.localStorage.getItem("vnp_talent_profile");
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          if (parsed) {
            setDisplayTalents(prev => prev.map(t => {
              if (t.id === "tal-1") {
                return {
                  ...t,
                  name: parsed.name || t.name,
                  avatar: parsed.avatar || t.avatar,
                  cover: parsed.cover || t.cover,
                  height: parsed.height !== undefined ? Number(parsed.height) : t.height,
                  weight: parsed.weight !== undefined ? Number(parsed.weight) : t.weight,
                  bust: parsed.bust !== undefined ? Number(parsed.bust) : t.bust,
                  waist: parsed.waist !== undefined ? Number(parsed.waist) : t.waist,
                  hips: parsed.hips !== undefined ? Number(parsed.hips) : t.hips,
                  gender: parsed.gender || t.gender,
                  district: parsed.location || t.district,
                  education: parsed.education || t.education,
                  languages: parsed.languages || t.languages,
                  skills: parsed.skills || t.skills,
                  rateCard: parsed.rateCard || t.rateCard,
                  lifestyleServices: parsed.lifestyleServices || t.lifestyleServices,
                  yearsOfExperience: parsed.experience !== undefined ? Number(parsed.experience) : t.yearsOfExperience,
                  verified: parsed.verifiedLevel === "Elite" || parsed.verifiedLevel === "Pro" || parsed.verifiedLevel === "Basic" || t.verified,
                  tier: parsed.tier || t.tier,
                };
              }
              return t;
            }));
          }
        } catch (e) { }
      }
    }

    loadBrandTalents(talents).then(setDisplayTalents);
    loadBrandCampaign(params.id, fallbackCampaigns).then((campaign) => {
      if (!campaign) return;
      const loadedCampaign = campaign;

      setCampaigns((current) => {
        const mergedApplicants = [...loadedCampaign.applicants];



        const mergedCampaign = {
          ...loadedCampaign,
          applicants: mergedApplicants
        };

        const exists = current.some((item) => item.id === loadedCampaign.id);
        const next = exists
          ? current.map((item) => item.id === loadedCampaign.id ? mergedCampaign : item)
          : [mergedCampaign, ...current];



        return next;
      });
    });
  }, [params.id]);

  const selectedCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === params.id);
  }, [campaigns, params.id]);

  async function handleCampaignMediaUpload(event: React.ChangeEvent<HTMLInputElement>, replacingMedia?: CampaignMedia | null) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedCampaign) return;

    if (!isBackendRecordId(selectedCampaign.id)) {
      window.alert("Campaign này đang là dữ liệu local, cần tạo campaign trên backend trước khi upload ảnh.");
      return;
    }

    setIsUploadingMedia(true);
    setReplacingMediaId(replacingMedia?.id ?? null);
    try {
      const uploadedMedia = await uploadBrandCampaignMedia(selectedCampaign.id, file, {
        category: "gallery",
        isPrimary: !selectedCampaign.media?.length || selectedCampaign.media?.[0]?.id === replacingMedia?.id,
      });

      if (!uploadedMedia) return;

      if (replacingMedia?.id) {
        try {
          await deleteBrandCampaignMedia(selectedCampaign.id, replacingMedia.id);
        } catch (deleteError) {
          console.warn("Cannot delete old campaign media after replacement", deleteError);
        }
      }

      setCampaigns((current) => current.map((campaign) => {
        if (campaign.id !== selectedCampaign.id) return campaign;

        const currentMedia = campaign.media || [];
        const media = replacingMedia?.id
          ? currentMedia.map((item) => item.id === replacingMedia.id ? uploadedMedia : item)
          : [...currentMedia, uploadedMedia];

        return {
          ...campaign,
          media,
          coverMedia: media[0] || null,
        };
      }));
    } catch (error) {
      console.warn("Cannot upload campaign media", error);
      window.alert(error instanceof Error ? error.message : "Chưa upload được ảnh chiến dịch.");
    } finally {
      setIsUploadingMedia(false);
      setReplacingMediaId(null);
    }
  }

  async function openPayoutModal() {
    if (!selectedCampaign || !isBackendRecordId(selectedCampaign.id)) {
      setIsShowingPayoutModal(true);
      return;
    }

    setCommissionData(null);
    setIsCommissionLoading(true);
    try {
      const data = await loadBrandCampaignCommissions(selectedCampaign.id);
      if (data.data.length && data.summary.approved > 0) {
        setCommissionData(data);
        return;
      }

      const settled = await settleBrandCampaign(selectedCampaign.id, selectedCampaign.budgetValue || 20000000);
      setCommissionData(settled);
    } catch (error) {
      console.warn("Cannot load campaign commission transactions", error);
    } finally {
      setIsShowingPayoutModal(true);
      setIsCommissionLoading(false);
    }
  }

  async function confirmCampaignDisbursement(totalBudget: number) {
    if (!selectedCampaign || !isBackendRecordId(selectedCampaign.id)) {
      window.alert(`Đã xác nhận giải ngân thành công tổng cộng ${moneyText(totalBudget)}!`);
      setIsShowingPayoutModal(false);
      return;
    }

    setIsCommissionLoading(true);
    try {
      const current = commissionData?.data?.length
        ? commissionData
        : await settleBrandCampaign(selectedCampaign.id, totalBudget);

      setCommissionData(current);

      const hasPending = current.data.some((transaction) => transaction.status === "pending");
      const approved = hasPending
        ? await approveBrandCampaignCommissions(selectedCampaign.id)
        : current;

      setCommissionData(approved);
      window.alert(`Đã xác nhận giải ngân thành công tổng cộng ${moneyText(approved.summary.total)} cho ${approved.data.length} đối tượng nhận tiền!`);
      setIsShowingPayoutModal(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Chưa thể xác nhận giải ngân.");
    } finally {
      setIsCommissionLoading(false);
    }
  }

  async function updateCampaignStatus(id: string, status: Campaign["status"]) {
    if (isBackendRecordId(id) && (status === "published" || status === "closed")) {
      try {
        const updatedCampaign = status === "published"
          ? await publishBrandCampaign(id)
          : await closeBrandCampaign(id);

        const nextCampaigns = campaigns.map((campaign) =>
          campaign.id === id ? updatedCampaign : campaign
        );
        setCampaigns(nextCampaigns);

        return;
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Chưa thể cập nhật trạng thái campaign.");
        return;
      }
    }

    const nextCampaigns = campaigns.map((campaign) =>
      campaign.id === id ? { ...campaign, status } : campaign
    );
    setCampaigns(nextCampaigns);

  }

  async function moveApplicant(campaignId: string, talentId: string, stage: CampaignStage) {
    const campaign = campaigns.find((item) => item.id === campaignId);
    const applicant = campaign?.applicants.find((item: any) => item.talentId === talentId);
    const apiStage = backendStage(stage);

    if (campaign && applicant && apiStage && isBackendRecordId(campaignId) && isBackendRecordId((applicant as any).id)) {
      try {
        await updateBrandCampaignTalent(campaignId, String((applicant as any).id), {
          status: apiStage,
          notes: applicant.note,
          referredByUserId: (applicant as any).referredByUserId ?? null,
        });
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Chưa thể cập nhật trạng thái ứng viên.");
        return;
      }
    }

    const nextCampaigns = campaigns.map((campaign) => {
      if (campaign.id !== campaignId) return campaign;
      return {
        ...campaign,
        applicants: campaign.applicants.map((item) =>
          item.talentId === talentId ? { ...item, stage } : item
        ),
      };
    });

    setCampaigns(nextCampaigns);


    if (stage === "confirmed") {
      const campaign = campaigns.find(c => c.id === campaignId);
      const talent = displayTalents.find(t => t.id === talentId) || talents.find(t => t.id === talentId);
      if (campaign && talent) {
        setPayoutDetails({
          talentName: talent.name,
          campaignTitle: campaign.title,
          budget: campaign.budget,
        });

        // Update local talent wallet if it is Nguyễn Mai Anh (tal-1)
        const storedProfile = window.localStorage.getItem("vnp_talent_profile");
        if (storedProfile && talentId === "tal-1") {
          try {
            const parsed = JSON.parse(storedProfile);
            let addedVal = 5000000;
            const budgetStr = campaign.budget.replace(/[^0-9]/g, "");
            if (budgetStr) {
              const numVal = parseInt(budgetStr, 10);
              if (!isNaN(numVal)) {
                addedVal = numVal > 100000000 ? Math.round(numVal / 10) : numVal;
              }
            }
            parsed.availableBalance = (parsed.availableBalance || 19000000) + addedVal;
            window.localStorage.setItem("vnp_talent_profile", JSON.stringify(parsed));
          } catch (e) {
            console.error("Failed to update simulated talent wallet balance:", e);
          }
        }
      }
    }
  }

  async function addTalentToCampaignDirect(talentId: string) {
    if (!selectedCampaign) return;

    let newApplicant = {
      talentId,
      stage: "new" as CampaignStage,
      note: "Thêm trực tiếp bởi đối tác.",
    } as Campaign["applicants"][number] & { id?: string };

    const isBackendCampaign = /^\d+$/.test(selectedCampaign.id);
    const isBackendTalent = /^\d+$/.test(talentId);

    if (isBackendCampaign && isBackendTalent) {
      try {
        const { addTalentToBrandCampaign } = await import("@/lib/brand-api");
        const created = await addTalentToBrandCampaign(selectedCampaign.id, talentId, "Thêm trực tiếp bởi đối tác.");
        newApplicant = {
          ...newApplicant,
          id: created.id ? String(created.id) : undefined,
          stage: "new",
          note: created.notes || newApplicant.note,
        };
      } catch (e) {
        console.warn("Could not sync to backend DB:", e);
      }
    }

    const nextCampaigns = campaigns.map((campaign) => {
      if (campaign.id !== selectedCampaign.id) return campaign;
      return {
        ...campaign,
        applicants: [...campaign.applicants, newApplicant],
      };
    });

    setCampaigns(nextCampaigns);

  }

  function sendContactRequest(campaignId: string, talentId: string) {
    const key = `${campaignId}-${talentId}`;
    const nextRequests = { ...sentRequests, [key]: true };
    setSentRequests(nextRequests);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("onstagevn_sent_requests", JSON.stringify(nextRequests));
    }

    const nextCampaigns = campaigns.map((campaign) =>
      campaign.id === campaignId
        ? { ...campaign, contactRequests: campaign.contactRequests + 1 }
        : campaign
    );
    setCampaigns(nextCampaigns);

  }

  if (!selectedCampaign) {
    return (
      <div className="space-y-6 pb-16 text-center py-20">
        <h2 className="text-lg font-black text-white">Không tìm thấy campaign</h2>
        <p className="text-xs text-slate-500 mt-2">Chiến dịch này có thể đã bị xóa hoặc không tồn tại.</p>
        <button
          onClick={() => router.push("/brand/campaigns")}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 px-4 text-xs font-black text-white hover:bg-white/10 cursor-pointer"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Section: Header & Info Grid on Left + Mô tả chung on Right */}
      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        {/* Left Side: Campaign Header & Grid of 5 Info Cards */}
        <div className="flex flex-col gap-4 xl:col-span-8">
          {/* Campaign Header Card */}
          <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-3">
                <button onClick={() => router.push("/brand/campaigns")} className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-slate-900/30 text-slate-400 hover:text-white cursor-pointer">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-400">{selectedCampaign.jobType}</span>
                    <span className={cn(
                      "rounded px-2 py-0.5 text-[9px] font-black uppercase",
                      selectedCampaign.status === "published" ? "bg-emerald-500/10 text-emerald-300" : selectedCampaign.status === "closed" ? "bg-slate-500/10 text-slate-400" : "bg-amber-500/10 text-amber-300"
                    )}>
                      {statusLabel(selectedCampaign.status)}
                    </span>
                  </div>
                  <h1 className="font-display text-2xl font-black tracking-tight text-white">{selectedCampaign.title}</h1>
                  {(selectedCampaign.eventName || selectedCampaign.campaignType) && (
                    <p className="mt-1 text-[11px] font-black uppercase tracking-wider text-amber-300">
                      {[selectedCampaign.eventName, selectedCampaign.campaignType].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="mt-2 max-w-xl text-xs font-semibold leading-relaxed text-slate-400">{sentenceCaseText(selectedCampaign.description)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                {selectedCampaign.status === "draft" && (
                  <button onClick={() => updateCampaignStatus(selectedCampaign.id, "published")} className="flex h-10 items-center rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-4 text-xs font-black text-slate-950 cursor-pointer">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Publish
                  </button>
                )}
                {selectedCampaign.status !== "closed" && (
                  <>
                    <button
                      onClick={openPayoutModal}
                      className="flex h-10 items-center rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 px-4 text-xs font-black text-slate-950 hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    >
                      Quyết Toán
                    </button>
                    <button
                      onClick={() => {
                        const confirmed = window.confirm("Bạn có muốn đóng campaign không?");
                        if (confirmed) {
                          updateCampaignStatus(selectedCampaign.id, "closed");
                        }
                      }}
                      className="flex h-10 items-center rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-xs font-black text-red-400 hover:bg-red-500/20 hover:border-red-500/40 active:scale-95 transition-all cursor-pointer"
                    >
                      Đóng campaign
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: "Địa điểm", value: selectedCampaign.venueName || selectedCampaign.address, icon: MapPin, color: "text-amber-300" },
              { label: "Ứng viên", value: `${selectedCampaign.applicants.length}/${selectedCampaign.talentQuantity}`, icon: Users, color: "text-emerald-300" },
              { label: "Lượt xem", value: selectedCampaign.views.toString(), icon: Briefcase, color: "text-rose-300" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white/5 bg-slate-950/25 p-4 text-left">
                  <Icon className={cn("mb-3 h-5 w-5", item.color)} />
                  <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">{item.label}</span>
                  <span className="mt-1 block break-words text-[11px] font-black leading-snug text-white" title={item.value}>{item.value}</span>
                </div>
              );
            })}
          </div>

          {(Boolean(selectedCampaign.roles?.length) ||
            Boolean(selectedCampaign.targetProfiles?.length) ||
            Boolean(selectedCampaign.industries?.length) ||
            selectedCampaign.requirements ||
            selectedCampaign.eventDate ||
            selectedCampaign.startDate ||
            selectedCampaign.endDate ||
            selectedCampaign.applicationDeadline ||
            selectedCampaign.deadline ||
            selectedCampaign.contactNote ||
            Boolean(selectedCampaign.sponsorships?.length)) && (
            <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-5 text-left">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/5 pb-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-300">Thông tin tuyển chọn</h2>
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-amber-300">
                  Brief
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Sự kiện</span>
                  <p className="text-xs font-black leading-relaxed text-cyan-200">
                    {selectedCampaign.eventDate
                      ? displayCampaignDate(selectedCampaign.eventDate)
                      : displayCampaignDateRange(selectedCampaign.startDate, selectedCampaign.endDate)}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Deadline</span>
                  <p className="text-xs font-black leading-relaxed text-purple-200">
                    {displayCampaignDate(selectedCampaign.applicationDeadline || selectedCampaign.deadline)}
                  </p>
                </div>
                {selectedCampaign.requirements && (
                  <div className="space-y-2 lg:col-span-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Yêu cầu</span>
                    <p className="text-xs font-semibold leading-relaxed text-slate-300">
                      {sentenceCaseText(selectedCampaign.requirements)}
                    </p>
                  </div>
                )}
                {selectedCampaign.roles && selectedCampaign.roles.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Vị trí tuyển</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCampaign.roles.map((role, idx) => (
                        <span key={`${role}-${idx}`} className="rounded bg-cyan-400/10 border border-cyan-400/20 px-2 py-1 text-[8.5px] font-bold text-cyan-300 uppercase tracking-wider">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedCampaign.targetProfiles && selectedCampaign.targetProfiles.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Nhóm talent phù hợp</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCampaign.targetProfiles.map((profile, idx) => (
                        <span key={`${profile}-${idx}`} className="rounded bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 text-[8.5px] font-bold text-emerald-300 uppercase tracking-wider">
                          {profile}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedCampaign.industries && selectedCampaign.industries.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Lĩnh vực</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCampaign.industries.map((industry, idx) => (
                        <span key={`${industry}-${idx}`} className="rounded bg-amber-400/10 border border-amber-400/20 px-2 py-1 text-[8.5px] font-bold text-amber-300 uppercase tracking-wider">
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedCampaign.sponsorships && selectedCampaign.sponsorships.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Tài trợ</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCampaign.sponsorships.map((s, idx) => (
                        <span key={idx} className="inline-block rounded bg-amber-400/10 border border-amber-400/30 px-2 py-1 text-[8.5px] font-bold text-amber-300 uppercase tracking-wider">
                          {s.category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedCampaign.contactNote && (
                  <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 text-xs font-semibold leading-relaxed text-slate-300 lg:col-span-2">
                    <span className="mr-2 text-[9px] font-black uppercase tracking-wider text-amber-300">Ứng tuyển</span>
                    {sentenceCaseText(selectedCampaign.contactNote)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Mô tả chung sidebar */}
        <aside className="rounded-2xl border border-white/5 bg-slate-950/25 p-4 xl:col-span-4 xl:self-start text-left">
          <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-300">MÔ TẢ CHUNG</h2>
          <div className="divide-y divide-white/5 text-xs">
            <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 py-2 first:pt-0">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Ngân sách</span>
              <p className="font-black text-amber-300">{selectedCampaign.budget}</p>
            </div>
            <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 py-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Phúc lợi</span>
              {(() => {
                const benefitItems = displayListText(selectedCampaign.benefits);
                return benefitItems.length > 1 ? (
                  <ul className="max-h-36 list-disc space-y-1 overflow-y-auto pr-2 pl-4 leading-relaxed text-slate-300 scrollbar-thin">
                    {benefitItems.map((item, idx) => (
                      <li key={`${item}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="max-h-36 overflow-y-auto pr-2 leading-relaxed text-slate-300 scrollbar-thin" title={selectedCampaign.benefits}>{benefitItems[0] || "-"}</p>
                );
              })()}
            </div>
            {selectedCampaign.responsibilities && selectedCampaign.responsibilities.length > 0 && (
              <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 py-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Đầu việc</span>
                <ul className="max-h-36 list-disc space-y-1 overflow-y-auto pr-2 pl-4 leading-relaxed text-slate-300 scrollbar-thin">
                  {selectedCampaign.responsibilities.map((item, idx) => (
                    <li key={`${item}-${idx}`}>{sentenceCaseText(item)}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-[10px] leading-relaxed text-slate-500">
              Hệ thống ATS đã được đồng bộ chuẩn theo BRD: Chờ duyệt (New), Đã duyệt (Approved), Đang tham gia (Executing), Nghiệm thu (Completed), và Thành công (Paid & MLM).
            </div> */}
          </div>
        </aside>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/25 p-5">
        <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
              <ImagePlus className="h-4.5 w-4.5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Bộ ảnh chiến dịch</h2>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tải lên các hình ảnh bạn muốn dùng cho chiến dịch
              </p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
            {selectedCampaign.media?.length || 0} ảnh
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <label className="group relative flex aspect-[4/5] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-slate-900/60 p-4 text-center transition-all hover:border-amber-400 hover:bg-slate-900">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isUploadingMedia}
              onChange={handleCampaignMediaUpload}
              className="hidden"
            />
            <ImagePlus className="mb-3 h-8 w-8 text-slate-400 transition-colors group-hover:text-amber-300" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-100">
              {isUploadingMedia ? "Đang tải..." : "Tải ảnh lên"}
            </span>
            <span className="mt-1 text-[8.5px] font-medium leading-relaxed text-slate-500">
              JPG, PNG hoặc WebP
            </span>
          </label>

          {(selectedCampaign.media || []).map((media, index) => (
            media.url ? (
              <div key={`${media.id || media.url || index}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
                <img
                  src={media.url}
                  alt={media.caption || selectedCampaign.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
                <label className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/60 text-white opacity-100 shadow-lg backdrop-blur transition hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950 sm:opacity-0 sm:group-hover:opacity-100">
                  {replacingMediaId === media.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isUploadingMedia}
                    onChange={(event) => handleCampaignMediaUpload(event, media)}
                    className="hidden"
                  />
                </label>
              </div>
            ) : null
          ))}

          {!selectedCampaign.media?.length && (
            <div className="col-span-1 flex aspect-[4/5] items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center text-[10px] font-semibold leading-relaxed text-slate-500">
              Ảnh đã tải lên sẽ hiển thị tại đây.
            </div>
          )}
        </div>
      </section>

      {/* Bottom Section: KOC Candidates list (Full Width) */}
      <section className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-300">NHÂN SỰ CAMPAIGN</h2>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{selectedCampaign.applicants.length + 1} nhân sự</span>
            <button
              onClick={() => setIsAddingStaff(true)}
              className="flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-4 text-[10px] font-black uppercase tracking-wider text-slate-950 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Thêm nhân sự
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Người phụ trách Campaign card */}
          <article
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between space-y-5 animate-in fade-in duration-300"
          >
            {/* Top info */}
            <div className="flex gap-4 items-start text-left">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
                alt="Nguyễn Ngọc Anh"
                className="h-16 w-16 rounded-xl object-cover border border-emerald-500/20 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col items-start gap-1">
                  <h3 className="text-sm font-black text-white">Nguyễn Ngọc Anh</h3>
                  <span className="font-display font-extrabold text-[9px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded shrink-0">
                    Người phụ trách Campaign
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400/80 mt-1">Brand Representative · Hà Nội</p>
                <p className="text-[10.5px] text-slate-400 leading-relaxed mt-2.5 italic font-medium">
                  "Người đại diện cho Brand. Chịu trách nhiệm vận hành, đối soát và giải ngân chiến dịch."
                </p>
              </div>
            </div>

            {/* Contact Information Box */}
            <div className="space-y-2.5 bg-[#050711] border border-emerald-500/10 rounded-xl p-3.5 text-left">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Thông tin liên hệ
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-[10px] text-slate-500">📞 Số điện thoại:</span>
                  <span className="font-bold text-white font-mono">090.123.4567</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-[10px] text-slate-500">✉️ Email:</span>
                  <span className="font-bold text-white font-mono">ngocanh.nguyen@loreal.com</span>
                </div>
              </div>
            </div>

            {/* Actions row */}
            <div className="flex flex-wrap gap-3 pt-3.5 border-t border-white/5 justify-between items-center">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={openPayoutModal}
                  className="rounded-xl bg-gradient-to-r from-emerald-400 to-teal-600 text-slate-950 px-4 py-2 text-[10px] font-black uppercase transition-all cursor-pointer hover:brightness-105 active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                >
                  Quyết Toán
                </button>
                <button
                  onClick={() => router.push("/brand/messages")}
                  className="rounded-xl px-3 py-2 text-[10px] font-black uppercase bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 cursor-pointer"
                >
                  Nhắn tin nhóm
                </button>
              </div>


            </div>
          </article>

          {selectedCampaign.applicants.map((item) => {
            const talent = displayTalents.find((candidate) => candidate.id === item.talentId)
              || talents.find((candidate) => candidate.id === item.talentId)
              || (item as any).talent;
            if (!talent) return null;
            const requestKey = `${selectedCampaign.id}-${talent.id}`;
            const stage = item.stage;
            const referredByName = (item as any).referredByName;
            const referrer = item.referredByTalentId
              ? displayTalents.find((candidate) => candidate.id === item.referredByTalentId) || talents.find((candidate) => candidate.id === item.referredByTalentId) || (referredByName ? { name: referredByName } : null)
              : (referredByName ? { name: referredByName } : null);
            const referrerName = referrer?.name;
            return (
              <article
                key={item.talentId}
                className="rounded-2xl border border-white/5 bg-slate-900/30 p-5 hover:border-amber-400/30 transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                {/* Top info and note */}
                <div className="flex gap-4 items-start text-left">
                  <img
                    src={talent.avatar}
                    alt={talent.name}
                    onError={(event) => {
                      event.currentTarget.src = createInitialAvatarDataUrl(talent.name, "");
                    }}
                    className="h-16 w-16 rounded-xl object-cover border border-white/5 shrink-0 bg-slate-950"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-white truncate">{talent.name}</h3>
                      <span className="font-display font-extrabold text-[9px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded shrink-0">
                        {talent.matchScore}% Match
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-slate-400">{talent.type} · {talent.city}</span>
                      {referrerName && (
                        <span className="inline-flex items-center gap-1 rounded bg-cyan-400/10 border border-cyan-500/20 px-2 py-0.5 text-[8.5px] font-bold text-cyan-400 uppercase tracking-wider">
                          Giới thiệu bởi: {referrer.name}
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed mt-2.5 italic font-medium">
                      "{item.note || "Tôi rất quan tâm và mong muốn thực hiện chiến dịch này."}"
                    </p>
                  </div>
                </div>

                {/* Progress tracker */}
                <div className="space-y-2.5 bg-[#050711] border border-white/5 rounded-xl p-3.5 text-left">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                    <span className="text-slate-500">Tiến độ thực hiện:</span>
                    <span className={cn(
                      "font-extrabold",
                      stage === "confirmed" ? "text-emerald-400" : "text-amber-400"
                    )}>
                      {stageLabels[stage]}
                    </span>
                  </div>
                  {/* Visual Progress Bar */}
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        stage === "confirmed" ? "bg-emerald-400" : "bg-amber-400"
                      )}
                      style={{ width: getProgressPercent(stage) }}
                    />
                  </div>

                  {/* Micro stages list */}
                  <div className="grid grid-cols-5 gap-1 pt-1.5 text-[8.5px] font-bold text-center">
                    <span className={cn("transition-colors", isStagePassed(stage, "new") ? "text-amber-400" : "text-slate-600")}>Chờ duyệt</span>
                    <span className={cn("transition-colors", isStagePassed(stage, "accepted") ? "text-amber-400" : "text-slate-600")}>Đã duyệt</span>
                    <span className={cn("transition-colors", isStagePassed(stage, "executing") ? "text-amber-400" : "text-slate-600")}>Đang tham gia</span>
                    <span className={cn("transition-colors", isStagePassed(stage, "completed") ? "text-amber-400" : "text-slate-600")}>Nghiệm thu</span>
                    <span className={cn("transition-colors", isStagePassed(stage, "confirmed") ? "text-emerald-400" : "text-slate-600")}>Thành công</span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex flex-wrap gap-3 pt-3.5 border-t border-white/5 justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {stage === "new" ? (
                      <button
                        onClick={() => {
                          setSelectedProfileTalent(talent);
                          setCurrentApplicantItem(item);
                        }}
                        className="rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 px-4 py-2 text-[10px] font-black uppercase transition-all cursor-pointer hover:brightness-105 active:scale-95"
                      >
                        Xem hồ sơ
                      </button>
                    ) : stage === "completed" ? (
                      <button
                        onClick={() => setReviewApplicant({ talentId: talent.id, talentName: talent.name })}
                        className="rounded-xl bg-gradient-to-r from-emerald-400 to-teal-600 text-slate-950 px-4 py-2 text-[10px] font-black uppercase transition-all cursor-pointer hover:brightness-105 active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      >
                        Nghiệm thu
                      </button>
                    ) : stage === "confirmed" ? (
                      <span className="flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">
                        <CheckCircle2 className="h-4 w-4" /> Đã giải ngân
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedProfileTalent(talent);
                          setCurrentApplicantItem(item);
                        }}
                        className="rounded-xl bg-white/5 border border-white/10 text-slate-355 px-4 py-2 text-[10px] font-black uppercase transition-all cursor-pointer hover:bg-white/10 active:scale-95"
                      >
                        Xem hồ sơ
                      </button>
                    )}

                    <button
                      onClick={() => router.push("/brand/messages")}
                      className="rounded-xl px-3 py-2 text-[10px] font-black uppercase bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 cursor-pointer"
                    >
                      Nhắn tin
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Payout Modal Dialog for MLM and F0 */}
      {payoutDetails && (() => {
        const rawBudget = payoutDetails.budget;
        const cleanBudgetStr = rawBudget.split("-").pop().replace(/[^0-9]/g, "");
        const parsedVal = parseInt(cleanBudgetStr, 10) || 10000000;
        const poolVal = parsedVal / (selectedCampaign.applicants.length || 1);

        const appEntry = selectedCampaign.applicants.find(a => {
          const t = displayTalents.find(dt => dt.id === a.talentId) || talents.find(dt => dt.id === a.talentId);
          return t && t.name === payoutDetails.talentName;
        });

        const hasReferrer = appEntry ? !!appEntry.referredByTalentId : false;
        const referrer = (appEntry && appEntry.referredByTalentId) ? (displayTalents.find(t => t.id === appEntry.referredByTalentId) || talents.find(t => t.id === appEntry.referredByTalentId)) : null;

        const talentAmount = hasReferrer ? poolVal * 0.70 : poolVal * 0.75;
        const brandAmount = poolVal * 0.10;
        const referralAmount = hasReferrer ? poolVal * 0.05 : 0;
        const platformAmount = poolVal * 0.15;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md flex flex-col bg-[#08090f] border border-emerald-500/30 rounded-3xl shadow-[0_24px_60px_rgba(16,185,129,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 text-left">
              <div className="flex items-center gap-3 p-6 border-b border-[#151b2d] bg-emerald-500/5">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Nghiệm Thu & Giải Ngân Thành Công</h3>
                  <p className="text-[10px] text-emerald-400/80 mt-0.5">Hợp đồng thông minh đã tự động phân bổ dòng tiền</p>
                </div>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="space-y-1 bg-[#050711] border border-white/5 rounded-xl p-3.5">
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Thông tin thanh toán</span>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-slate-300 font-medium">Thù lao Talent ({hasReferrer ? "KOL F2" : "KOL F1"} - {hasReferrer ? "70%" : "75%"}):</span>
                    <span className="font-extrabold text-white font-mono text-sm text-emerald-400">+{moneyText(talentAmount)}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">Đã cộng vào ví khả dụng của: <b>{payoutDetails.talentName}</b></p>
                </div>

                <div className="space-y-3 bg-[#050711] border border-white/5 rounded-xl p-3.5">
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Phân bổ hoa hồng chi tiết (Campaign Affiliate)</span>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Phí quản lý Brand F0 (10%):</span>
                      <span className="font-bold text-amber-400 font-mono">+{moneyText(brandAmount)}</span>
                    </div>
                    {hasReferrer && referrer && (
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Hoa hồng F1 Giới thiệu ({referrer.name} - 5%):</span>
                        <span className="font-bold text-cyan-400 font-mono">+{moneyText(referralAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Phí nền tảng OnStage Platform (15%):</span>
                      <span className="font-bold text-slate-450 font-mono">+{moneyText(platformAmount)}</span>
                    </div>
                  </div>
                  <div className="border-t border-[#151b2d] pt-2 text-[9px] text-slate-500 italic">
                    * Áp dụng quy tắc trích thưởng và giải ngân tự động từ số dư bảo chứng (Escrow).
                  </div>
                </div>

                <div className="flex gap-2 items-start text-[9.5px] text-slate-400 bg-amber-400/5 border border-amber-400/10 rounded-xl p-3">
                  <span>🛡️</span>
                  <p className="leading-normal">
                    <b>Lịch sử giao dịch (Audit Logs)</b> đã được ghi nhận: <i>"Quyết toán thù lao cho {payoutDetails.talentName} thuộc chiến dịch {payoutDetails.campaignTitle}"</i>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end p-6 border-t border-[#151b2d] bg-[#050711]">
                <button
                  onClick={() => setPayoutDetails(null)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer hover:brightness-105 active:scale-95 transition-all"
                >
                  Hoàn tất
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Profile Detail Modal */}
      {selectedProfileTalent && currentApplicantItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">

            <div className="flex items-center justify-between p-6 border-b border-[#151b2d] bg-slate-950/45">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProfileTalent.avatar}
                  alt={selectedProfileTalent.name}
                  onError={(event) => {
                    event.currentTarget.src = createInitialAvatarDataUrl(selectedProfileTalent.name, "");
                  }}
                  className="h-12 w-12 rounded-xl object-cover border border-white/5 bg-slate-950"
                />
                <div className="text-left">
                  <h3 className="text-sm font-black text-white">{selectedProfileTalent.name}</h3>
                  <p className="text-[10px] text-slate-400">{selectedProfileTalent.type} · {selectedProfileTalent.city}</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedProfileTalent(null); setCurrentApplicantItem(null); }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left scrollbar-thin">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#050711] border border-white/5 rounded-xl p-3 text-center">
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Hạng Profile</span>
                  <span className="block text-xs font-black text-amber-400 mt-1">Tier {selectedProfileTalent.tier}</span>
                </div>
                <div className="bg-[#050711] border border-white/5 rounded-xl p-3 text-center">
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Đánh Giá</span>
                  <span className="block text-xs font-black text-white mt-1">{selectedProfileTalent.rating} ★</span>
                </div>
                <div className="bg-[#050711] border border-white/5 rounded-xl p-3 text-center">
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Hoàn Thành</span>
                  <span className="block text-xs font-black text-white mt-1">{selectedProfileTalent.completedJobs} Jobs</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chỉ số hình thể</h4>
                <div className="grid grid-cols-5 gap-2 bg-[#050711] border border-white/5 rounded-xl p-3 text-center text-[10px]">
                  <div>
                    <span className="block text-slate-500">Chiều cao</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedProfileTalent.height} cm</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Cân nặng</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedProfileTalent.weight} kg</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Vòng 1</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedProfileTalent.bust} cm</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Vòng 2</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedProfileTalent.waist} cm</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Vòng 3</span>
                    <span className="font-bold text-white mt-0.5 block">{selectedProfileTalent.hips} cm</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kỹ năng nổi bật</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProfileTalent.skills?.map((s: string, idx: number) => (
                      <span key={idx} className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[9.5px] text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Học vấn & Ngôn ngữ</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{selectedProfileTalent.education}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Ngôn ngữ: {selectedProfileTalent.languages?.join(", ") || "Tiếng Việt, Tiếng Anh"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bảng Giá Dịch Vụ Cơ Bản (Basic)</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedProfileTalent.rateCard || {}).map(([key, value]: any) => (
                    <div key={key} className="flex justify-between p-2.5 bg-[#050711]/40 border border-white/5 rounded-lg items-center">
                      <span className="text-slate-400">{key}</span>
                      <span className="font-bold text-amber-400 font-mono">từ {value.toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedProfileTalent.lifestyleServices && selectedProfileTalent.lifestyleServices.some((s: any) => s.enabled) && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dịch Vụ Đồng Hành VIP</h4>
                  <div className="space-y-2">
                    {selectedProfileTalent.lifestyleServices.filter((s: any) => s.enabled).map((service: any) => (
                      <div key={service.id} className="flex justify-between items-start p-3 bg-[#050711] border border-white/5 rounded-xl">
                        <div>
                          <span className="text-xs font-bold text-white block">⛳ {service.title}</span>
                          <span className="text-xs text-slate-500 leading-normal block mt-1">{service.description}</span>
                        </div>
                        <span className="text-[10px] font-black text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded shrink-0">
                          {service.rate.toLocaleString()}đ/{service.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lookbook Photos Section */}
              <div className="space-y-3 border-t border-[#151b2d] pt-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  📸 Bộ Ảnh Lookbook Nghệ Thuật (4 Ảnh)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
                    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600",
                    "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600"
                  ].map((url, idx) => (
                    <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-md">
                      <img src={url} alt={`Lookbook ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-2 left-2">
                        <span className="inline-block bg-[#f4c430] text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Ảnh {idx + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Videos Section - Commented out as requested
              <div className="space-y-3 border-t border-[#151b2d] pt-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  🎥 Video Giới Thiệu & Demo Thực Tế (3 Videos)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 flex flex-col justify-end">
                    <video
                      src="https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-smiling-at-the-camera-40898-large.mp4"
                      className="absolute inset-0 h-full w-full object-cover"
                      playsInline
                      loop
                      muted
                      autoPlay
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1 z-10">
                      <span className="inline-block bg-cyan-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                        INTRO VIDEO
                      </span>
                      <h4 className="text-[10px] font-black text-white">Video Giới Thiệu</h4>
                    </div>
                  </div>

                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 flex flex-col justify-end">
                    <video
                      src="https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-on-a-runway-show-39871-large.mp4"
                      className="absolute inset-0 h-full w-full object-cover"
                      playsInline
                      loop
                      muted
                      autoPlay
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1 z-10">
                      <span className="inline-block bg-cyan-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                        CATWALK POLAROID
                      </span>
                      <h4 className="text-[10px] font-black text-white">Catwalk Video</h4>
                    </div>
                  </div>

                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 flex flex-col justify-end">
                    <video
                      src="https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-to-camera-in-interview-42358-large.mp4"
                      className="absolute inset-0 h-full w-full object-cover"
                      playsInline
                      loop
                      muted
                      autoPlay
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1 z-10">
                      <span className="inline-block bg-cyan-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                        DEMO MC / LIVE
                      </span>
                      <h4 className="text-[10px] font-black text-white">MC / Livestream Demo</h4>
                    </div>
                  </div>
                </div>
              </div>
              */}

            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#151b2d] bg-slate-950/45">
              {currentApplicantItem.stage === "new" ? (
                <>
                  <button
                    onClick={() => { setSelectedProfileTalent(null); setCurrentApplicantItem(null); }}
                    className="px-5 py-2 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 transition active:scale-95 cursor-pointer text-xs font-bold"
                  >
                    Không duyệt
                  </button>
                  <button
                    onClick={() => {
                      moveApplicant(selectedCampaign.id, selectedProfileTalent.id, "accepted");
                      setSelectedProfileTalent(null);
                      setCurrentApplicantItem(null);
                    }}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer hover:brightness-105 active:scale-95 transition-all"
                  >
                    Duyệt ứng viên
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setSelectedProfileTalent(null); setCurrentApplicantItem(null); }}
                  className="px-5 py-2 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Checklist Photos Modal */}
      {reviewApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300 text-left">
            <div className="flex items-center justify-between p-6 border-b border-[#151b2d] bg-slate-950/45">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Nghiệm Thu Kết Quả Job</h3>
                <p className="text-[10px] text-slate-500 mt-1">Đối soát hình ảnh và lịch trình thực tế của {reviewApplicant.talentName}</p>
              </div>
              <button onClick={() => setReviewApplicant(null)} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-4.5 w-4.5" /></button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-[#050711] border border-white/5 rounded-xl p-3.5 space-y-2">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Đối soát hành trình GPS</span>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Địa điểm check-in:</span>
                  <span className="text-white font-semibold">📍 Studio Cầu Giấy, Hà Nội</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Thời gian làm việc:</span>
                  <span className="text-white font-mono font-semibold">08/06/2026 (08:00 - 12:00)</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Hợp đồng thông minh:</span>
                  <span className="text-emerald-400 font-semibold">✍️ Đã ký số NDA & Lịch trình</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Hình ảnh check-in thực tế</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-white/5">
                    <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80" alt="Check-in 1" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/75 px-1 rounded text-[7px] text-white">Check-in bắt đầu</span>
                  </div>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-white/5">
                    <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80" alt="Check-out 1" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/75 px-1 rounded text-[7px] text-white">Báo cáo hoàn thành</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-start text-[9.5px] text-slate-400 bg-amber-400/5 border border-amber-400/10 rounded-xl p-3">
                <span>🔔</span>
                <p className="leading-normal">
                  Bấm <b>"Xác nhận nghiệm thu"</b> để kết thúc công việc của ứng viên này, tự động giải ngân cát-xê ký quỹ và thực hiện cascade hoa hồng đa cấp.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#151b2d] bg-[#050711]">
              <button onClick={() => setReviewApplicant(null)} className="px-4 py-2 rounded-xl border border-[#151b2d] text-xs font-bold text-slate-400 hover:text-white cursor-pointer">Hủy</button>
              <button
                onClick={() => {
                  moveApplicant(selectedCampaign.id, reviewApplicant.talentId, "confirmed");
                  setReviewApplicant(null);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer hover:brightness-105 active:scale-95 transition-all"
              >
                Xác nhận nghiệm thu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#151b2d] bg-slate-950/45">
              <div className="text-left">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Thêm Nhân Sự Vào Chiến Dịch</h3>
                <p className="text-[10px] text-slate-500 mt-1">Chọn từ danh sách các Talent xuất sắc để đề xuất hoặc thêm trực tiếp</p>
              </div>
              <button onClick={() => setIsAddingStaff(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable grid of talent cards */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-4">
              {(() => {
                const applicantIds = selectedCampaign.applicants.map((a: any) => a.talentId);
                const availableTalents = displayTalents.filter((t: any) => !applicantIds.includes(t.id));

                if (availableTalents.length === 0) {
                  return (
                    <div className="text-center py-12 space-y-2">
                      <p className="text-xs text-slate-500 italic">Tất cả talent đã được thêm vào chiến dịch này.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableTalents.map((talent) => {
                      const status = getTalentStatus(talent.id);
                      return (
                        <article key={talent.id} className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-3.5 shadow-lg hover:border-[#C9A86A]/30 transition-all duration-300 group flex flex-col justify-between min-w-0 text-left">
                          <div>
                            {/* Image Top Area */}
                            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border border-white/5 mb-3.5">
                              <img
                                src={talent.avatar}
                                alt={talent.name}
                                onError={(event) => {
                                  event.currentTarget.src = createInitialAvatarDataUrl(talent.name, "");
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-slate-950"
                              />

                              {/* Overlay top badges */}
                              <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                                <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[8.5px] font-black uppercase text-slate-950 shadow-md">
                                  Hạng {talent.tier}
                                </span>
                              </div>

                              {/* Floating calendar status at bottom of image */}
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

                            {/* Header details */}
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <h3 className="text-xs font-black text-white truncate flex-1">{talent.name}</h3>
                                {talent.verified && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                              </div>

                              <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{talent.district}, {talent.city}</span>
                              </div>
                            </div>

                            {/* Info badges row */}
                            <div className="my-2.5 flex flex-wrap gap-1">
                              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{talent.type}</span>
                              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{talent.age} tuổi</span>
                              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{talent.height}cm</span>
                              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{talent.weight}kg</span>
                            </div>

                            {/* Lifestyle services badges */}
                            {talent.lifestyleServices && talent.lifestyleServices.some((s: any) => s.enabled) && (
                              <div className="mb-2.5 flex flex-wrap gap-1">
                                {talent.lifestyleServices.filter((s: any) => s.enabled).map((s: any) => {
                                  let icon = "💼";
                                  if (s.id === "golf") icon = "⛳";
                                  else if (s.id === "pickleball") icon = "🎾";
                                  else if (s.id === "dining") icon = "🍷";
                                  else if (s.id === "cafe") icon = "☕";
                                  else if (s.id === "redcarpet") icon = "✨";
                                  else if (s.id === "shopping") icon = "🛍️";
                                  else if (s.id === "art") icon = "🎨";
                                  else if (s.id === "escort") icon = "🛥️";
                                  else if (s.id === "content") icon = "📱";
                                  return (
                                    <span key={s.id} className="rounded border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 text-[8px] font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider" title={s.title}>
                                      <span>{icon}</span>
                                      <span className="max-w-[80px] truncate">{s.title.replace(/(Sport Companion |Business |VIP |Luxury |Launching Event |Daily Content )/g, "")}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            {/* Social stats row */}
                            <div className="grid grid-cols-2 gap-2 bg-[#0F1115]/50 border border-white/5 rounded-xl p-2 text-center text-[10px] my-3">
                              <div>
                                <span className="block text-[7px] font-bold uppercase text-slate-500 tracking-wider">Followers</span>
                                <span className="font-mono font-black text-amber-300 mt-0.5 block">{talent.followers}</span>
                              </div>
                              <div className="border-l border-white/5">
                                <span className="block text-[7px] font-bold uppercase text-slate-500 tracking-wider">Engagement</span>
                                <span className="font-mono font-black text-cyan-300 mt-0.5 block">{talent.engagementRate}%</span>
                              </div>
                            </div>

                            {/* Bio brief */}
                            <p className="line-clamp-2 text-[10px] leading-relaxed text-slate-400 mt-2 min-h-7">{talent.experience}</p>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 pt-3.5 border-t border-white/5 flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedProfileTalent(talent);
                                setCurrentApplicantItem({ talentId: talent.id, stage: "new", note: "Được đề xuất thêm từ hệ thống." });
                              }}
                              className="flex h-10 px-3 items-center justify-center gap-1 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white transition active:scale-90 cursor-pointer text-[10px] font-black uppercase tracking-wider"
                              title="Xem hồ sơ"
                            >
                              <span>Xem hồ sơ</span>
                            </button>
                            <button
                              onClick={() => addTalentToCampaignDirect(talent.id)}
                              className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 font-black text-[10px] uppercase tracking-wider transition active:scale-95 cursor-pointer"
                            >
                              Thêm vào Campaigns
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Payout Table Modal Dialog */}
      {isShowingPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300 text-left">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#151b2d] bg-slate-950/45">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Đối soát & Chia tiền campaign</h3>
                <p className="text-[10px] text-slate-500 mt-1">Thông tin giải ngân dòng tiền cho đại diện Brand, KOCs và Uplines theo phân bổ MLM</p>
              </div>
              <button
                onClick={() => setIsShowingPayoutModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {/* Summary Stats Row */}
              {(() => {
                const totalBudget = selectedCampaign.budgetValue || 20000000;

                // Get active applicants
                const activeApplicants = selectedCampaign.applicants.filter(
                  (a) => a.stage === "accepted" || a.stage === "executing" || a.stage === "completed" || a.stage === "confirmed"
                );

                // Map display applicants
                const displayApplicants = activeApplicants.length > 0 ? activeApplicants.map(a => ({
                  talentId: a.talentId,
                  referredByTalentId: a.referredByTalentId
                })) : [
                  { talentId: "tal-1", referredByTalentId: undefined },
                  { talentId: "tal-4", referredByTalentId: "tal-1" },
                  { talentId: "tal-5", referredByTalentId: "tal-3" }
                ];

                const N = displayApplicants.length;
                const poolPerTalent = totalBudget / N;

                let campaignRows: any[] = [];
                let referralRows: any[] = [];
                let rosterRows: any[] = [];

                displayApplicants.forEach((appl) => {
                  const talent = displayTalents.find(t => t.id === appl.talentId) || talents.find(t => t.id === appl.talentId) || { name: appl.talentId };
                  const hasReferrer = !!appl.referredByTalentId;
                  const referrer = hasReferrer ? (displayTalents.find(t => t.id === appl.referredByTalentId) || talents.find(t => t.id === appl.referredByTalentId)) : null;

                  if (hasReferrer && referrer) {
                    // F2 referred candidate
                    campaignRows.push({
                      role: "KOL F2 (Thực hiện - 70%)",
                      recipient: talent.name,
                      relatedTalent: talent.name,
                      base: poolPerTalent,
                      rate: 70,
                      amount: poolPerTalent * 0.7,
                      status: "Chờ duyệt"
                    });
                    campaignRows.push({
                      role: "Brand F0 (Phí quản lý - 10%)",
                      recipient: "Nguyễn Ngọc Anh",
                      relatedTalent: talent.name,
                      base: poolPerTalent,
                      rate: 10,
                      amount: poolPerTalent * 0.1,
                      status: "Chờ duyệt"
                    });
                    referralRows.push({
                      role: "F1 (Giới thiệu Campaign - 5%)",
                      recipient: referrer.name,
                      relatedTalent: talent.name,
                      base: poolPerTalent,
                      rate: 5,
                      amount: poolPerTalent * 0.05,
                      status: "Chờ duyệt"
                    });
                  } else {
                    // F1 direct candidate
                    campaignRows.push({
                      role: "KOL F1 (Thực hiện - 75%)",
                      recipient: talent.name,
                      relatedTalent: talent.name,
                      base: poolPerTalent,
                      rate: 75,
                      amount: poolPerTalent * 0.75,
                      status: "Chờ duyệt"
                    });
                    campaignRows.push({
                      role: "Brand F0 (Phí quản lý - 10%)",
                      recipient: "Nguyễn Ngọc Anh",
                      relatedTalent: talent.name,
                      base: poolPerTalent,
                      rate: 10,
                      amount: poolPerTalent * 0.1,
                      status: "Chờ duyệt"
                    });
                  }
                });

                if (commissionData?.data?.length) {
                  campaignRows = commissionData.data
                    .filter((transaction) => transaction.source_type === "campaign_payout")
                    .map(transactionRow);
                  referralRows = commissionData.data
                    .filter((transaction) => transaction.source_type === "referral")
                    .map(transactionRow);
                  rosterRows = commissionData.data
                    .filter((transaction) => transaction.source_type === "roster_management")
                    .map(transactionRow);
                }

                const allRows = [...campaignRows, ...referralRows, ...rosterRows];
                const totalCalculatedPayout = commissionData?.data?.length
                  ? commissionData.summary.total
                  : allRows.reduce((sum, r) => sum + r.amount, 0);
                const pendingPayout = commissionData?.data?.length
                  ? commissionData.summary.pending
                  : totalCalculatedPayout;
                const shouldShowPlatformFee = Boolean(commissionData);
                const platformFee = commissionData?.platform_fee;
                const platformFeeRate = Number(platformFee?.rate || DEFAULT_PLATFORM_FEE_RATE);
                const platformFeeBaseAmount = Number(platformFee?.base_amount || totalBudget);
                const platformFeeAmount = Number(platformFee?.amount || Math.round(platformFeeBaseAmount * (platformFeeRate / 100)));
                const brandTotalPayable = Number(platformFee?.brand_total_payable || totalBudget + platformFeeAmount);

                return (
                  <div className="space-y-6">
                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-[#0F1115]/60 border border-white/5 rounded-2xl p-5">
                      <div>
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Campaign</span>
                        <span className="text-xs font-black text-white mt-1 block truncate">{selectedCampaign.title}</span>
                      </div>
                      <div className="border-l border-white/5 pl-4">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Brand</span>
                        <span className="text-xs font-black text-white mt-1 block">Nguyễn Ngọc Anh</span>
                      </div>
                      <div className="border-l border-white/5 pl-4">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Số dòng</span>
                        <span className="text-xs font-black text-white mt-1 block font-mono">{allRows.length}</span>
                      </div>
                      <div className="border-l border-white/5 pl-4">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Tổng tiền</span>
                        <span className="text-xs font-black text-emerald-400 mt-1 block font-mono">
                          {Math.round(totalCalculatedPayout).toLocaleString("vi-VN")} VND
                        </span>
                      </div>
                      <div className="border-l border-white/5 pl-4">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Chờ duyệt</span>
                        <span className="text-xs font-black text-amber-400 mt-1 block font-mono">
                          {Math.round(pendingPayout).toLocaleString("vi-VN")} VND
                        </span>
                      </div>
                    </div>

                    {shouldShowPlatformFee && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0F1115]/60 border border-white/5 rounded-2xl p-5">
                        <div>
                          <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Phí sàn brand</span>
                          <span className="text-xs font-black text-violet-300 mt-1 block font-mono">
                            {Math.round(platformFeeAmount).toLocaleString("vi-VN")} VND
                          </span>
                        </div>
                        <div className="border-l border-white/5 pl-4">
                          <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ phí sàn</span>
                          <span className="text-xs font-black text-white mt-1 block font-mono">{platformFeeRate}%</span>
                        </div>
                        <div className="border-l border-white/5 pl-4">
                          <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Brand cần thanh toán</span>
                          <span className="text-xs font-black text-emerald-400 mt-1 block font-mono">
                            {Math.round(brandTotalPayable).toLocaleString("vi-VN")} VND
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Table 1: Chia tiền campaign */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Chia tiền campaign
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0F1115]/30">
                        <table className="w-full text-left text-xs border-collapse font-medium">
                          <thead>
                            <tr className="border-b border-white/5 bg-slate-950/45 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              <th className="p-3">Vai trò/F</th>
                              <th className="p-3">Người nhận</th>
                              <th className="p-3">Talent liên quan</th>
                              <th className="p-3">Cơ sở tính</th>
                              <th className="p-3 text-center">Tỷ lệ</th>
                              <th className="p-3 text-right">Số tiền</th>
                              <th className="p-3 text-center">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {campaignRows.map((row, idx) => (
                              <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="p-3 font-semibold text-slate-300">{row.role}</td>
                                <td className="p-3 font-bold text-white">{row.recipient}</td>
                                <td className="p-3 text-slate-400">{row.relatedTalent}</td>
                                <td className="p-3 font-mono text-slate-400">{Math.round(row.base).toLocaleString("vi-VN")} VND</td>
                                <td className="p-3 text-center font-bold text-[#C9A86A]">{row.rate}%</td>
                                <td className="p-3 text-right font-mono font-black text-white">{Math.round(row.amount).toLocaleString("vi-VN")} VND</td>
                                <td className="p-3 text-center">
                                  <span className="inline-block rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8.5px] font-bold text-amber-400 uppercase tracking-wide">
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Table 2: Giới thiệu */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-cyan-400" />
                        Giới thiệu
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0F1115]/30">
                        <table className="w-full text-left text-xs border-collapse font-medium">
                          <thead>
                            <tr className="border-b border-white/5 bg-slate-950/45 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              <th className="p-3">Vai trò/F</th>
                              <th className="p-3">Người nhận</th>
                              <th className="p-3">Talent liên quan</th>
                              <th className="p-3">Cơ sở tính</th>
                              <th className="p-3 text-center">Tỷ lệ</th>
                              <th className="p-3 text-right">Số tiền</th>
                              <th className="p-3 text-center">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {referralRows.map((row, idx) => (
                              <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="p-3 font-semibold text-cyan-400 font-mono">{row.role}</td>
                                <td className="p-3 font-bold text-white">{row.recipient}</td>
                                <td className="p-3 text-slate-400">{row.relatedTalent}</td>
                                <td className="p-3 font-mono text-slate-400">{Math.round(row.base).toLocaleString("vi-VN")} VND</td>
                                <td className="p-3 text-center font-bold text-cyan-400">{row.rate}%</td>
                                <td className="p-3 text-right font-mono font-black text-white">{Math.round(row.amount).toLocaleString("vi-VN")} VND</td>
                                <td className="p-3 text-center">
                                  <span className="inline-block rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8.5px] font-bold text-amber-400 uppercase tracking-wide">
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {rosterRows.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-violet-400" />
                          Brand quản lý talent
                        </h4>
                        <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0F1115]/30">
                          <table className="w-full text-left text-xs border-collapse font-medium">
                            <thead>
                              <tr className="border-b border-white/5 bg-slate-950/45 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                <th className="p-3">Vai trò/F</th>
                                <th className="p-3">Người nhận</th>
                                <th className="p-3">Talent liên quan</th>
                                <th className="p-3">Cơ sở tính</th>
                                <th className="p-3 text-center">Tỷ lệ</th>
                                <th className="p-3 text-right">Số tiền</th>
                                <th className="p-3 text-center">Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rosterRows.map((row, idx) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                  <td className="p-3 font-semibold text-violet-300">{row.role}</td>
                                  <td className="p-3 font-bold text-white">{row.recipient}</td>
                                  <td className="p-3 text-slate-400">{row.relatedTalent}</td>
                                  <td className="p-3 font-mono text-slate-400">{Math.round(row.base).toLocaleString("vi-VN")} VND</td>
                                  <td className="p-3 text-center font-bold text-violet-300">{row.rate}%</td>
                                  <td className="p-3 text-right font-mono font-black text-white">{Math.round(row.amount).toLocaleString("vi-VN")} VND</td>
                                  <td className="p-3 text-center">
                                    <span className="inline-block rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8.5px] font-bold text-amber-400 uppercase tracking-wide">
                                      {row.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Footer Actions inside Content */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#151b2d]">
                      <button
                        onClick={() => setIsShowingPayoutModal(false)}
                        className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        Đóng
                      </button>
                      <button
                        onClick={() => confirmCampaignDisbursement(totalBudget)}
                        disabled={isCommissionLoading}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer hover:brightness-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCommissionLoading ? "Đang xử lý..." : "Xác nhận giải ngân"}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
