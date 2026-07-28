"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  MapPin,
  Users,
  ImagePlus,
  Pencil,
  Link as LinkIcon,
  Link2,
  Copy,
  Check,
  Calendar,
  Sparkles,
  Download,
  QrCode,
  X,
} from "lucide-react";
import { type Campaign, type CampaignMedia, type CampaignStage } from "@/lib/brand-mvp-data";
import {
  approveBrandCampaignCommissions,
  closeBrandCampaign,
  deleteBrandCampaign,
  deleteBrandCampaignMedia,
  loadBrandCampaign,
  loadBrandCampaignCommissions,
  loadBrandTalents,
  publishBrandCampaign,
  settleBrandCampaign,
  uploadBrandCampaignMedia,
  type BrandCampaignCommissionResponse,
  updateBrandCampaignTalent,
} from "@/lib/brand-api";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { getStoredAuthUser } from "@/lib/api-client";
import QRCodeContainer from "@/components/QR_Code";

interface StaffMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  phone: string;
  email: string;
  bio?: string;
  location?: string;
}

// Sub-components split to reduce file size
import Hero from "./components/Hero";
import ProfileModal from "./components/ProfileModal";
import ChecklistModal from "./components/ChecklistModal";
import AddStaffModal from "./components/AddStaffModal";
import PayoutSuccessModal from "./components/PayoutSuccessModal";
import PayoutTableModal from "./components/PayoutTableModal";
import FormEditJob from "../FormEditJob";

const stageLabels: Record<CampaignStage, string> = {
  new: "Chờ duyệt",
  accepted: "Đã duyệt",
  executing: "Đang tham gia",
  completed: "Nghiệm thu",
  confirmed: "Thành công",
};

function isBackendRecordId(id?: string | number | null) {
  return /^\d+$/.test(String(id || ""));
}

function backendStage(stage: CampaignStage) {
  if (stage === "executing" || stage === "completed") return null;
  return stage;
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

function statusLabel(status: Campaign["status"]) {
  if (status === "published") return "Đang mở";
  if (status === "closed") return "Đã đóng";
  return "Nháp";
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
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [replacingMediaId, setReplacingMediaId] = useState<string | number | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [deletingApplicant, setDeletingApplicant] = useState<{ talentId: string; talentName: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [isShowingOwnerTransferModal, setIsShowingOwnerTransferModal] = useState(false);
  const [campaignOwnerId, setCampaignOwnerId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(`campaign_owner_${params.id}`);
      return stored || "me";
    }
    return "me";
  });

  const changeCampaignOwner = (newOwnerId: string) => {
    setCampaignOwnerId(newOwnerId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`campaign_owner_${params.id}`, newOwnerId);
    }
  };

  const authUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      return getStoredAuthUser<{
        id?: string | number;
        name?: string;
        email?: string;
        external_avatar_url?: string | null;
        avatar?: string | null;
        phone?: string | null;
        location?: string | null;
        brand_representative?: string | null;
        role?: string;
      }>();
    } catch {
      return null;
    }
  }, []);

  const myProfile = useMemo<StaffMember>(() => {
    const name = authUser?.brand_representative || authUser?.name || "Nguyễn Ngọc Anh";
    const email = authUser?.email || "ngocanh.nguyen@loreal.com";
    return {
      id: "me",
      name: name,
      avatar: authUser?.external_avatar_url || authUser?.avatar || createInitialAvatarDataUrl(name, email),
      role: authUser?.role || "Brand Representative",
      phone: authUser?.phone || "090.123.4567",
      email: email,
      bio: "Người đại diện cho Brand. Chịu trách nhiệm vận hành, đối soát và giải ngân chiến dịch.",
      location: authUser?.location || "Hà Nội",
    };
  }, [authUser]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});
  const [displayTalents, setDisplayTalents] = useState<any[]>([]);

  const [referralLink, setReferralLink] = useState<string>("");
  const [isGeneratingLink, setIsGeneratingLink] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const refreshSelectedCampaign = useCallback(async () => {
    const loadedCampaign = await loadBrandCampaign(params.id, []);
    if (!loadedCampaign) return;

    setCampaigns((current) => {
      const mergedCampaign = {
        ...loadedCampaign,
        applicants: [...loadedCampaign.applicants],
      };

      const exists = current.some((item) => item.id === loadedCampaign.id);
      return exists
        ? current.map((item) => item.id === loadedCampaign.id ? mergedCampaign : item)
        : [mergedCampaign, ...current];
    });
  }, [params.id]);

  const handleCopyReferralLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
    }, 2000);
  };

  const handleDownloadQRCode = async () => {
    if (!referralLink || !selectedCampaign) return;
    try {
      const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(referralLink)}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `qr-code-${selectedCampaign.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Failed to download QR code directly, opening in new tab:", err);
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(referralLink)}`, "_blank");
    }
  };

  useEffect(() => {
    let cancelled = false;

    loadBrandTalents([]).then((talents) => {
      if (!cancelled) setDisplayTalents(talents);
    });
    setCampaignLoading(true);
    refreshSelectedCampaign().catch((error) => {
      if (cancelled) return;
      console.warn("Cannot load brand campaign detail", error);
    }).finally(() => {
      if (!cancelled) setCampaignLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [params.id, refreshSelectedCampaign]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      refreshSelectedCampaign().catch((error) => {
        console.warn("Cannot refresh brand campaign detail", error);
      });
    }, 8000);

    return () => window.clearInterval(interval);
  }, [refreshSelectedCampaign]);

  const selectedCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === params.id);
  }, [campaigns, params.id]);

  const availableOwners = useMemo<StaffMember[]>(() => {
    const list: StaffMember[] = [
      myProfile
    ];

    if (selectedCampaign) {
      selectedCampaign.applicants.forEach((applicant) => {
        const talent = displayTalents.find((t) => t.id === applicant.talentId) || (applicant as any)?.talent;
        if (talent) {
          list.push({
            id: talent.id,
            name: talent.name,
            avatar: talent.avatar,
            role: `Campaign Talent (${talent.type})`,
            phone: "090.999.8888",
            email: `${talent.id}@onstage.vn`,
            bio: `Thành viên tham gia chiến dịch. Rank ${talent.tier} - ${talent.city}.`,
            location: talent.city,
          });
        }
      });
    }

    return list;
  }, [myProfile, selectedCampaign, displayTalents]);

  const activeOwner = useMemo<StaffMember>(() => {
    return availableOwners.find(o => o.id === campaignOwnerId) || myProfile;
  }, [availableOwners, campaignOwnerId, myProfile]);

  useEffect(() => {
    if (!selectedCampaign) return;
    let isMounted = true;
    setIsGeneratingLink(true);

    import("@/lib/talent-api").then(({ getCampaignReferralLink }) => {
      return getCampaignReferralLink(selectedCampaign.id);
    }).then((res) => {
      if (!isMounted) return;
      if (res && res.url) {
        setReferralLink(res.url);
      } else {
        setReferralLink("");
      }
    }).catch((err) => {
      console.warn("Failed to fetch referral link:", err);
      if (!isMounted) return;
      setReferralLink("");
    }).finally(() => {
      if (isMounted) {
        setIsGeneratingLink(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedCampaign?.id]);

  async function handleCampaignMediaUpload(event: React.ChangeEvent<HTMLInputElement>, replacingMedia?: CampaignMedia | null) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedCampaign) return;

    if (!replacingMedia && (selectedCampaign.media?.length || 0) >= 10) {
      window.alert("Chiến dịch chỉ được phép tải lên tối đa 10 ảnh.");
      return;
    }

    if (!isBackendRecordId(selectedCampaign.id)) {
      window.alert("Job này đang là dữ liệu local, cần tạo job trên backend trước khi upload ảnh.");
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

  async function handleCampaignMediaDelete(media: CampaignMedia) {
    if (!selectedCampaign) return;

    if (isBackendRecordId(selectedCampaign.id) && media.id) {
      try {
        await deleteBrandCampaignMedia(selectedCampaign.id, media.id);
      } catch (error) {
        console.warn("Cannot delete campaign media", error);
        window.alert(error instanceof Error ? error.message : "Chưa xóa được ảnh.");
        return;
      }
    }

    setCampaigns((current) => current.map((campaign) => {
      if (campaign.id !== selectedCampaign.id) return campaign;

      const currentMedia = campaign.media || [];
      const mediaList = currentMedia.filter((item) => item.id !== media.id && item.url !== media.url);

      return {
        ...campaign,
        media: mediaList,
        coverMedia: mediaList[0] || null,
      };
    }));
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
      const formattedBudget = `${Math.round(totalBudget).toLocaleString("vi-VN")} VND`;
      window.alert(`Đã xác nhận giải ngân thành công tổng cộng ${formattedBudget}!`);
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
      const formattedTotal = `${Math.round(approved.summary.total).toLocaleString("vi-VN")} VND`;
      window.alert(`Đã xác nhận giải ngân thành công tổng cộng ${formattedTotal} cho ${approved.data.length} đối tượng nhận tiền!`);
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
        window.alert(error instanceof Error ? error.message : "Chưa thể cập nhật trạng thái job.");
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
      const talent = displayTalents.find(t => t.id === talentId);
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

  async function removeApplicant(campaignId: string, talentId: string) {
    const campaign = campaigns.find((item) => item.id === campaignId);
    const applicant = campaign?.applicants.find((item: any) => item.talentId === talentId);
    const talent = displayTalents.find(t => t.id === talentId) || (applicant as any)?.talent;
    const name = talent?.name || "Talent";
    setDeletingApplicant({ talentId, talentName: name });
  }

  async function handleConfirmRemoveApplicant() {
    if (!deletingApplicant || !selectedCampaign) return;
    const { talentId } = deletingApplicant;
    const campaignId = selectedCampaign.id;
    const applicant = selectedCampaign.applicants.find((item: any) => item.talentId === talentId);

    if (isBackendRecordId(campaignId) && applicant && isBackendRecordId((applicant as any).id)) {
      try {
        const { removeBrandCampaignTalent } = await import("@/lib/brand-api");
        await removeBrandCampaignTalent(campaignId, String((applicant as any).id));
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Chưa thể xóa ứng viên khỏi chiến dịch.");
        return;
      }
    }

    const nextCampaigns = campaigns.map((campaign) => {
      if (campaign.id !== campaignId) return campaign;
      return {
        ...campaign,
        applicants: campaign.applicants.filter((item) => item.talentId !== talentId),
      };
    });

    setCampaigns(nextCampaigns);
    setDeletingApplicant(null);
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

  async function handleDeleteCampaign() {
    if (!selectedCampaign) return;
    try {
      if (isBackendRecordId(selectedCampaign.id)) {
        await deleteBrandCampaign(selectedCampaign.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      router.push("/brand/campaigns");
    }
  }

  if (campaignLoading && !selectedCampaign) {
    return (
      <div className="space-y-6 py-20 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Đang tải thông tin job...</p>
      </div>
    );
  }

  if (!selectedCampaign) {
    return (
      <div className="space-y-6 pb-16 text-center py-20">
        <h2 className="text-lg font-black text-white">Không tìm thấy job</h2>
        <p className="text-xs text-slate-500 mt-2">Job này có thể đã bị xóa hoặc không tồn tại.</p>
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
      {/* 1. HERO MỞ RỘNG (HERO + KPI) */}
      <Hero
        selectedCampaign={selectedCampaign}
        onBack={() => router.push("/brand/campaigns")}
        onOpenPayoutModal={openPayoutModal}
        onUpdateStatus={(status) => updateCampaignStatus(selectedCampaign.id, status)}
        onDeleteCampaign={handleDeleteCampaign}
        onEditCampaign={() => setIsEditingJob(true)}
      />

      {/* 5. NHÂN SỰ JOB */}
      <section className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-baseline justify-between sm:justify-start gap-3 w-full sm:w-auto text-left">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-350">NHÂN SỰ JOB</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{selectedCampaign.applicants.length + 1} nhân sự</span>
          </div>
          <button
            onClick={() => setIsAddingStaff(true)}
            className="flex w-full sm:w-auto h-9 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-4 text-[10px] font-black uppercase tracking-wider text-slate-950 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            Thêm nhân sự
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Người phụ trách Job card */}
          <article
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between space-y-5 animate-in fade-in duration-300"
          >
            {/* Top info */}
            <div className="flex gap-4 items-start text-left">
              <img
                src={activeOwner.avatar}
                alt={activeOwner.name}
                onError={(event) => {
                  event.currentTarget.src = createInitialAvatarDataUrl(activeOwner.name, "");
                }}
                className="h-16 w-16 rounded-xl object-cover border border-emerald-500/20 shrink-0 bg-slate-900"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col items-start gap-1">
                  <h3 className="text-sm font-black text-white">{activeOwner.name}</h3>
                  <span className="font-display font-extrabold text-[9px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded shrink-0">
                    Người phụ trách Job
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400/80 mt-1">
                  {activeOwner.role} · {activeOwner.location || "Hà Nội"}
                </p>
                {activeOwner.bio && (
                  <p className="text-[10.5px] text-slate-400 leading-relaxed mt-2.5 italic font-medium">
                    "{activeOwner.bio}"
                  </p>
                )}
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
                  <span className="font-bold text-white font-mono">{activeOwner.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-[10px] text-slate-500">✉️ Email:</span>
                  <span className="font-bold text-white font-mono truncate max-w-[200px]" title={activeOwner.email}>
                    {activeOwner.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions row */}
            <div className="pt-3.5 border-t border-white/5 w-full">
              <button
                onClick={() => setIsShowingOwnerTransferModal(true)}
                className="flex w-full h-9 items-center justify-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 text-[10px] font-black uppercase tracking-wider text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
                Chuyển quyền phụ trách
              </button>
            </div>
          </article>

          {selectedCampaign.applicants.map((item) => {
            const talent = displayTalents.find((candidate) => candidate.id === item.talentId)
              || (item as any)?.talent
              || (item as any).talent;
            if (!talent) return null;
            const stage = item.stage;
            const referredByName = (item as any).referredByName;
            const referrer = item.referredByTalentId
              ? displayTalents.find((candidate) => candidate.id === item.referredByTalentId) || (referredByName ? { name: referredByName } : null)
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
                          Giới thiệu: {referrerName}
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
                  <div className="grid grid-cols-5 gap-0.5 pt-1.5 text-[7.5px] xs:text-[8.5px] font-bold text-center">
                    <span className={cn("transition-colors", isStagePassed(stage, "new") ? "text-amber-400" : "text-slate-600")}>Chờ duyệt</span>
                    <span className={cn("transition-colors", isStagePassed(stage, "accepted") ? "text-amber-400" : "text-slate-600")}>Đã duyệt</span>
                    <span className={cn("transition-colors", isStagePassed(stage, "executing") ? "text-amber-400" : "text-slate-600")}>Đang tham gia</span>
                    <span className={cn("transition-colors", isStagePassed(stage, "completed") ? "text-amber-400" : "text-slate-600")}>Nghiệm thu</span>
                    <span className={cn("transition-colors", isStagePassed(stage, "confirmed") ? "text-emerald-400" : "text-slate-600")}>Thành công</span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="pt-3.5 border-t border-white/5 w-full">
                  <div className="grid grid-cols-3 gap-1.5 w-full">
                    {stage === "new" ? (
                      <button
                        onClick={() => {
                          setSelectedProfileTalent(talent);
                          setCurrentApplicantItem(item);
                        }}
                        className="w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 px-2 py-2 text-[10.5px] font-black uppercase transition-all cursor-pointer hover:brightness-105 active:scale-95"
                      >
                        Xem hồ sơ
                      </button>
                    ) : stage === "completed" ? (
                      <button
                        onClick={() => setReviewApplicant({ talentId: talent.id, talentName: talent.name })}
                        className="w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-teal-600 text-slate-950 px-2 py-2 text-[10.5px] font-black uppercase transition-all cursor-pointer hover:brightness-105 active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      >
                        Nghiệm thu
                      </button>
                    ) : stage === "confirmed" ? (
                      <span className="w-full flex items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-1 py-2 text-[9px] sm:text-[9.5px] text-emerald-400 font-extrabold uppercase tracking-normal text-center whitespace-nowrap">
                        Đã giải ngân
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedProfileTalent(talent);
                          setCurrentApplicantItem(item);
                        }}
                        className="w-full flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 px-2 py-2 text-[10.5px] font-black uppercase transition-all cursor-pointer hover:bg-white/10 active:scale-95"
                      >
                        Xem hồ sơ
                      </button>
                    )}

                    {stage === "new" ? (
                      <button
                        onClick={() => moveApplicant(selectedCampaign.id, talent.id, "accepted")}
                        className="w-full flex items-center justify-center rounded-xl px-2 py-2 text-[10.5px] font-black uppercase bg-gradient-to-r from-emerald-400 to-teal-600 text-slate-950 hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      >
                        Duyệt
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push("/brand/messages")}
                        className="w-full flex items-center justify-center rounded-xl px-2 py-2 text-[10.5px] font-black uppercase bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 cursor-pointer"
                      >
                        Nhắn tin
                      </button>
                    )}

                    <button
                      onClick={() => removeApplicant(selectedCampaign.id, talent.id)}
                      className="w-full flex items-center justify-center rounded-xl px-2 py-2 text-[10.5px] font-black uppercase bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-900/20 hover:text-red-300 transition-all cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Affiliate Link Bar (full width, horizontal) */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-b from-[#150f02]/90 to-[#050712]/95 shadow-[0_0_30px_rgba(245,158,11,0.08)] p-5">
        <div className="absolute right-[-60px] top-[-60px] h-40 w-40 rounded-full bg-amber-300/6 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          {/* Left: Icon + Label + Description */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
              <Link2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-400/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
                AFFILIATE LINK
              </span>
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                Ứng tuyển Job
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Chia sẻ link này cho Talent để họ xem chi tiết chiến dịch và đăng ký tham gia.
              </p>
            </div>
          </div>

          {/* Right: Buttons */}
          <div className="grid grid-cols-2 gap-2 w-full xl:flex xl:w-auto shrink-0">
            <button
              type="button"
              onClick={handleCopyReferralLink}
              disabled={!referralLink}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-2xl px-3 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer w-full xl:w-auto disabled:opacity-50",
                copiedLink
                  ? "border border-emerald-400/30 bg-emerald-400/15 text-emerald-300"
                  : "bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:brightness-105"
              )}
            >
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedLink ? "Đã copy" : "Sao chép Link"}
            </button>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              disabled={!referralLink}
              className="flex h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:brightness-105 px-3 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] w-full xl:w-auto disabled:opacity-50"
            >
              <QrCode className="h-4 w-4" /> Hiện QR
            </button>
          </div>
        </div>

        {/* URL display */}
        <div className="relative mt-4 flex min-w-0 items-center gap-3 rounded-2xl bg-[#04060a]/90 border border-amber-400/10 px-4 py-3 font-mono text-xs font-bold text-amber-100/90">
          <Link2 className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="truncate select-all flex-1">
            {referralLink || (isGeneratingLink ? "Đang tạo link ứng tuyển..." : "Chưa có liên kết ứng tuyển")}
          </span>
        </div>
      </div>

      {/* 2. HÀNG THÔNG TIN CHÍNH (MÔ TẢ CHUNG & THÔNG TIN TUYỂN CHỌN) */}
      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">

        {/* Left Column (7 columns): Mô tả chung */}
        <div className="xl:col-span-7 rounded-3xl border border-white/5 bg-slate-950/25 p-6 text-left self-stretch flex flex-col justify-between">
          <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-350 flex items-center gap-1.5">
              <Briefcase className="h-4.5 w-4.5 text-amber-400" /> Mô tả công việc
            </h2>
          </div>

          <div className="divide-y divide-white/5 text-xs flex-1 flex flex-col justify-around">
            <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-3 py-3.5 first:pt-0">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Thù lao</span>
              <p className="font-black text-amber-300 text-sm leading-none">{selectedCampaign.budget}</p>
            </div>

            {/* Loại hình + Số lượng tuyển */}
            <div className="grid grid-cols-2 gap-3 py-3.5">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Loại hình</span>
                <p className="mt-1 text-xs font-bold text-slate-200">{selectedCampaign.jobType || "Không có"}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Số lượng tuyển</span>
                <p className="mt-1 text-xs font-black text-amber-300">{selectedCampaign.talentQuantity ? `${selectedCampaign.talentQuantity} người` : "Không có"}</p>
              </div>
            </div>

            {/* Thành phố + Địa điểm */}
            <div className="grid grid-cols-2 gap-3 py-3.5">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Thành phố</span>
                <p className="mt-1 text-xs font-bold text-slate-200">{selectedCampaign.city || "Không có"}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Địa điểm</span>
                <p className="mt-1 text-xs text-slate-300">{selectedCampaign.address || "Không có"}</p>
              </div>
            </div>

            {/* 4 mốc thời gian */}
            <div className="grid grid-cols-2 gap-3 py-3.5">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Bắt đầu job</span>
                <p className="mt-1 text-xs font-black text-amber-300">{displayCampaignDate(selectedCampaign.startDate) || "Không có"}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Kết thúc job</span>
                <p className="mt-1 text-xs font-black text-amber-300">{displayCampaignDate(selectedCampaign.endDate) || "Không có"}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Sự kiện chính</span>
                <p className="mt-1 text-xs font-black text-amber-300">
                  {selectedCampaign.eventDate
                    ? displayCampaignDate(selectedCampaign.eventDate)
                    : (selectedCampaign.startDate && selectedCampaign.endDate
                      ? displayCampaignDateRange(selectedCampaign.startDate, selectedCampaign.endDate)
                      : "Không có")}
                </p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Hạn ứng tuyển</span>
                <p className="mt-1 text-xs font-black text-amber-300">{displayCampaignDate(selectedCampaign.applicationDeadline || selectedCampaign.deadline) || "Không có"}</p>
              </div>
            </div>

            <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-3 py-3.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Quyền lợi</span>
              {(() => {
                const benefitItems = displayListText(selectedCampaign.benefits);
                return benefitItems.length > 1 ? (
                  <ul className="max-h-36 list-disc space-y-1 overflow-y-auto pr-2 pl-4 leading-relaxed text-slate-300 scrollbar-thin text-justify">
                    {benefitItems.map((item, idx) => (
                      <li key={`${item}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="max-h-36 overflow-y-auto pr-2 leading-relaxed text-slate-300 scrollbar-thin text-justify" title={selectedCampaign.benefits}>{benefitItems[0] || "-"}</p>
                );
              })()}
            </div>

            {selectedCampaign.description && (
              <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-3 py-3.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Mô tả</span>
                <p className="leading-relaxed text-slate-300 text-justify">
                  {sentenceCaseText(selectedCampaign.description)}
                </p>
              </div>
            )}

            {selectedCampaign.responsibilities && selectedCampaign.responsibilities.length > 0 && (
              <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-3 py-3.5 last:pb-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Đầu việc</span>
                <ul className="max-h-36 list-disc space-y-1 overflow-y-auto pr-2 pl-4 leading-relaxed text-slate-300 scrollbar-thin text-justify">
                  {selectedCampaign.responsibilities.map((item, idx) => (
                    <li key={`${item}-${idx}`}>{sentenceCaseText(item)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 columns): Thông tin tuyển chọn */}
        <div className="xl:col-span-5">
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
              <div className="rounded-3xl border border-white/5 bg-slate-950/25 p-6 text-left h-full flex flex-col justify-between">
                <div>
                  <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/5 pb-3">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-350 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-amber-400" /> Yêu cầu tuyển chọn
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    {/* Yêu cầu */}
                    <div className="space-y-1.5 col-span-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Yêu cầu</span>
                      <p className="text-xs leading-relaxed text-slate-300 text-justify">
                        {selectedCampaign.requirements ? sentenceCaseText(selectedCampaign.requirements) : "Không có"}
                      </p>
                    </div>

                    {/* Chiều cao / Cân nặng / Kinh nghiệm */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Chiều cao tối thiểu</span>
                      <p className="text-xs font-bold leading-relaxed text-slate-200">
                        {selectedCampaign.heightMinCm ? `${selectedCampaign.heightMinCm} cm` : "Không có"}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Cân nặng tối đa</span>
                      <p className="text-xs font-bold leading-relaxed text-slate-200">
                        {selectedCampaign.weightMaxKg ? `${selectedCampaign.weightMaxKg} kg` : "Không có"}
                      </p>
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Kinh nghiệm tối thiểu</span>
                      <p className="text-xs font-bold leading-relaxed text-slate-200">
                        {selectedCampaign.experienceMinYears ? `${selectedCampaign.experienceMinYears} năm` : "Không có"}
                      </p>
                    </div>

                    {/* Vị trí tuyển */}
                    <div className="space-y-1.5 col-span-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Vị trí tuyển</span>
                      {selectedCampaign.roles && selectedCampaign.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCampaign.roles.map((role, idx) => (
                            <span key={`${role}-${idx}`} className="rounded bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-[8.5px] font-bold text-amber-300 uppercase tracking-wider">
                              {role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Không có</p>
                      )}
                    </div>

                    {/* Nhóm talent phù hợp */}
                    <div className="space-y-1.5 col-span-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Nhóm talent phù hợp</span>
                      {selectedCampaign.targetProfiles && selectedCampaign.targetProfiles.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCampaign.targetProfiles.map((profile, idx) => (
                            <span key={`${profile}-${idx}`} className="rounded bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-[8.5px] font-bold text-amber-300 uppercase tracking-wider">
                              {profile}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Không có</p>
                      )}
                    </div>

                    {/* Lĩnh vực */}
                    <div className="space-y-1.5 col-span-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Lĩnh vực liên quan</span>
                      {selectedCampaign.industries && selectedCampaign.industries.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCampaign.industries.map((industry, idx) => (
                            <span key={`${industry}-${idx}`} className="rounded bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-[8.5px] font-bold text-amber-300 uppercase tracking-wider">
                              {industry}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Không có</p>
                      )}
                    </div>



                  </div>
                </div>
              </div>
            )}
        </div>
      </section>

      {/* 3. Bộ ảnh job */}
      <section className="space-y-5">

        {/* Bộ ảnh job (full width) */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-6 text-left">
          <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
                <ImagePlus className="h-4.5 w-4.5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-white">Bộ ảnh job</h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Tải lên các hình ảnh bạn muốn dùng cho job (Tối đa 10 ảnh)
                </p>
              </div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400 shrink-0">
              {selectedCampaign.media?.length || 0}/10 ảnh
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {/* Upload block (only show if < 10 images) */}
            {(selectedCampaign.media?.length || 0) < 10 && (
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
            )}

            {(selectedCampaign.media || []).map((media, index) => (
              media.url ? (
                <div key={`${media.id || media.url || index}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
                  <img
                    src={media.url}
                    alt={media.caption || selectedCampaign.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] cursor-pointer"
                    onClick={() => setPreviewImage(media.url || null)}
                  />

                  {/* Delete button (X) */}
                  <button
                    type="button"
                    onClick={() => handleCampaignMediaDelete(media)}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white opacity-100 shadow-lg backdrop-blur transition hover:border-red-500 hover:bg-red-500 hover:text-white sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                    title="Xóa ảnh"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Edit button (Pencil) */}
                  <label className="absolute right-14 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/60 text-white opacity-100 shadow-lg backdrop-blur transition hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950 sm:opacity-0 sm:group-hover:opacity-100">
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



          </div>
        </div>
      </section>

      {/* QR Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <QRCodeContainer
              campaignLink={referralLink}
              title="Mã QR Tuyển Dụng Job"
              subtitle="Quét mã để ứng tuyển nhanh"
              badgeText="OnStage Job Gateway"
              shareButtonLabel="Chia sẻ"
              onCopyLink={handleCopyReferralLink}
              onDownloadQr={handleDownloadQRCode}
              className="border-[#D4A64A]/30 bg-gradient-to-br from-[#1a1305]/60 via-[#070913]/90 to-[#070913]/95 shadow-[0_8px_40px_rgba(212,166,74,0.08)] overflow-hidden"
            />
          </div>
        </div>
      )}


      {/* Profile Detail Modal */}
      {selectedProfileTalent && currentApplicantItem && (
        <ProfileModal
          talent={selectedProfileTalent}
          currentApplicantItem={currentApplicantItem}
          selectedCampaign={selectedCampaign}
          onClose={() => {
            setSelectedProfileTalent(null);
            setCurrentApplicantItem(null);
          }}
          onMoveApplicant={moveApplicant}
        />
      )}

      {/* ── Confirm Delete Applicant Modal ── */}
      {deletingApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl p-6 text-center space-y-5 shadow-[0_24px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in-95 duration-300">
            <h3 className="font-display font-black text-base text-white uppercase tracking-tight">Xác nhận xóa</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Bạn có chắc chắn muốn xóa Talent <strong className="text-white">"{deletingApplicant.talentName}"</strong> khỏi chiến dịch không?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmRemoveApplicant}
                className="flex-1 rounded-xl h-10 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase transition-all cursor-pointer font-bold"
              >
                Xóa
              </button>
              <button
                onClick={() => setDeletingApplicant(null)}
                className="flex-1 rounded-xl h-10 border border-white/5 bg-white/5 text-slate-400 hover:text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-bold"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Checklist Photos Modal */}
      {reviewApplicant && (
        <ChecklistModal
          reviewApplicant={reviewApplicant}
          onClose={() => setReviewApplicant(null)}
          onConfirm={(talentId) => moveApplicant(selectedCampaign.id, talentId, "confirmed")}
        />
      )}

      {/* Add Staff Modal */}
      {isAddingStaff && (
        <AddStaffModal
          selectedCampaign={selectedCampaign}
          displayTalents={displayTalents}
          onClose={() => setIsAddingStaff(false)}
          onAddDirect={addTalentToCampaignDirect}
          onPreviewTalent={(talent, applicantItem) => {
            setSelectedProfileTalent(talent);
            setCurrentApplicantItem(applicantItem);
          }}
        />
      )}

      {/* Payout Modal Dialog for MLM and F0 */}
      {payoutDetails && (
        <PayoutSuccessModal
          payoutDetails={payoutDetails}
          selectedCampaign={selectedCampaign}
          displayTalents={displayTalents}
          onClose={() => setPayoutDetails(null)}
        />
      )}

      {/* Payout Table Modal Dialog */}
      {isShowingPayoutModal && (
        <PayoutTableModal
          selectedCampaign={selectedCampaign}
          displayTalents={displayTalents}
          commissionData={commissionData}
          isCommissionLoading={isCommissionLoading}
          onClose={() => setIsShowingPayoutModal(false)}
          onConfirmDisbursement={confirmCampaignDisbursement}
        />
      )}

      <FormEditJob
        isOpen={isEditingJob}
        campaignToEdit={selectedCampaign}
        onClose={() => setIsEditingJob(false)}
        onCampaignUpdated={(updated) =>
          setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        }
      />

      {/* Owner Transfer Modal Dialog */}
      {isShowingOwnerTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-xl max-h-[80vh] flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#151b2d] bg-slate-950/45">
              <div className="text-left">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Chuyển quyền phụ trách Job</h3>
                <p className="text-[10px] text-slate-500 mt-1">Chọn nhân sự để bàn giao quản lý chiến dịch này</p>
              </div>
              <button onClick={() => setIsShowingOwnerTransferModal(false)} className="text-slate-400 hover:text-white cursor-pointer transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin space-y-4">
              {/* Current Owner Highlight */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left">
                <span className="block text-[8px] font-black uppercase tracking-wider text-emerald-400 mb-2">Đang phụ trách hiện tại</span>
                <div className="flex items-center gap-3">
                  <img
                    src={activeOwner.avatar}
                    alt={activeOwner.name}
                    className="h-10 w-10 rounded-lg object-cover border border-emerald-500/20 shrink-0"
                    onError={(event) => {
                      event.currentTarget.src = createInitialAvatarDataUrl(activeOwner.name, "");
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-white">{activeOwner.name}</h4>
                    <p className="text-[9.5px] text-emerald-400/80 mt-0.5">{activeOwner.role} · {activeOwner.location}</p>
                  </div>
                </div>
              </div>

              {/* List of candidates to transfer to */}
              <div className="space-y-2.5">
                <span className="block text-[8px] font-black uppercase tracking-wider text-slate-500 text-left">Danh sách nhân sự chuyển giao</span>
                <div className="space-y-2">
                  {availableOwners.map((owner) => {
                    const isCurrent = owner.id === campaignOwnerId;
                    return (
                      <div
                        key={owner.id}
                        className={cn(
                          "flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 text-left gap-3",
                          isCurrent
                            ? "border-emerald-500/20 bg-emerald-500/5 cursor-default"
                            : "border-white/5 bg-slate-900/20 hover:border-amber-500/20 hover:bg-slate-900/40 cursor-pointer"
                        )}
                        onClick={() => {
                          if (!isCurrent) {
                            changeCampaignOwner(owner.id);
                            setIsShowingOwnerTransferModal(false);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={owner.avatar}
                            alt={owner.name}
                            className="h-9 w-9 rounded-lg object-cover border border-white/5 shrink-0 bg-slate-800"
                            onError={(event) => {
                              event.currentTarget.src = createInitialAvatarDataUrl(owner.name, "");
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-white truncate">{owner.name}</h4>
                              {owner.id === "me" && (
                                <span className="rounded bg-blue-500/10 px-1 py-0.5 text-[7px] font-black uppercase tracking-wider text-blue-400">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <p className="text-[9.5px] text-slate-400 mt-0.5 truncate">{owner.role} · {owner.location}</p>
                          </div>
                        </div>

                        <div>
                          {isCurrent ? (
                            <span className="inline-flex h-7 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/20 px-3 text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">
                              Đang phụ trách
                            </span>
                          ) : (
                            <button
                              className="h-7 rounded-lg bg-amber-400 px-3 text-[9px] font-black uppercase tracking-wider text-slate-950 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                            >
                              Chọn
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Full Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020408]/90 backdrop-blur-md transition-all duration-300 animate-in fade-in cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-black/60 border border-white/10 text-white hover:bg-black/80 hover:text-[#f4c430] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[85vh] max-w-full object-contain select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </div>
  );
}
