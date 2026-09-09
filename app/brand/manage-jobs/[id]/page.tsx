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
  Mail,
  ShieldCheck,
  Eye,
  Trash2,
  Info,
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
import { downloadJobPoster } from "@/lib/downloadJobPoster";

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
import JobInfoSection from "@/app/talent/jobs/[id]/JobInfoSection";
import RecruitmentPositionsSection from "@/app/talent/jobs/[id]/RecruitmentPositionsSection";
import EventInformationSection from "@/app/talent/jobs/[id]/EventInformationSection";

function isBackendRecordId(id?: string | number | null) {
  return /^\d+$/.test(String(id || ""));
}

function getTalentEmail(talent: any, applicant: any): string {
  if (talent?.email && String(talent.email).trim()) return String(talent.email).trim();
  if (applicant?.email && String(applicant.email).trim()) return String(applicant.email).trim();
  if (talent?.user?.email && String(talent.user.email).trim()) return String(talent.user.email).trim();
  const name = talent?.name || "talent";
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return `${slug || "talent"}@gmail.com`;
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

function displayCampaignDateTime(value?: string | null, explicitTime?: string | null) {
  if (!value && !explicitTime) return "-";

  const raw = String(value || "").trim();
  const timeMatch = raw.match(/T(\d{2}:\d{2})/i) || raw.match(/\s+(\d{2}:\d{2})/);
  const time = explicitTime?.trim() || (timeMatch ? timeMatch[1] : "");

  let dateStr = "";
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})/) || raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (dateOnly) {
    if (dateOnly[1].length === 4) {
      dateStr = `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
    } else {
      dateStr = `${dateOnly[1]}/${dateOnly[2]}/${dateOnly[3]}`;
    }
  } else if (raw) {
    if (!raw.includes("T") && !raw.includes(" ")) {
      dateStr = raw;
    } else {
      const normalized = raw.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})?$/, ".$1$2");
      const date = new Date(normalized);
      dateStr = Number.isNaN(date.getTime())
        ? raw
        : new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(date);
    }
  }

  if (time && dateStr && dateStr !== "-") {
    return `${time} ${dateStr}`;
  }
  return dateStr || time || "-";
}

function formatEventScheduleTimeText(evt: any, fallbackDate?: string | null) {
  const startRaw = evt.startAt || evt.start_at || evt.startDate || evt.start_date || evt.eventDate || evt.event_date || evt.date || fallbackDate;
  const endRaw = evt.endAt || evt.end_at || evt.endDate || evt.end_date || fallbackDate;
  const startTime = evt.startTime || evt.start_time || "";
  const endTime = evt.endTime || evt.end_time || "";

  const parsePoint = (val?: string | null, expTime?: string | null) => {
    if (!val && !expTime) return null;
    const raw = String(val || "").trim();
    const timeMatch = raw.match(/T(\d{2}:\d{2})/i) || raw.match(/\s+(\d{2}:\d{2})/);
    const time = expTime?.trim() || (timeMatch ? timeMatch[1] : "");

    let dateStr = "";
    const dateMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/) || raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (dateMatch) {
      if (dateMatch[1].length === 4) {
        dateStr = `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`;
      } else {
        dateStr = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
      }
    } else if (raw) {
      if (!raw.includes("T") && !raw.includes(" ")) {
        dateStr = raw;
      } else {
        const normalized = raw.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})?$/, ".$1$2");
        const date = new Date(normalized);
        dateStr = Number.isNaN(date.getTime())
          ? raw
          : new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(date);
      }
    }

    return { dateStr, time };
  };

  const startObj = parsePoint(startRaw, startTime);
  const endObj = parsePoint(endRaw, endTime);

  if (startObj && endObj) {
    if (startObj.dateStr === endObj.dateStr) {
      if (startObj.time && endObj.time) {
        return `${startObj.time} - ${endObj.time} ${startObj.dateStr}`;
      }
      if (startObj.time) {
        return `${startObj.time} ${startObj.dateStr}`;
      }
      return startObj.dateStr;
    }
    const startPart = startObj.time ? `${startObj.time} ${startObj.dateStr}` : startObj.dateStr;
    const endPart = endObj.time ? `${endObj.time} ${endObj.dateStr}` : endObj.dateStr;
    if (startPart && endPart) return `${startPart} - ${endPart}`;
    return startPart || endPart || "Theo lịch sự kiện";
  }

  if (startObj) {
    return startObj.time ? `${startObj.time} ${startObj.dateStr}` : startObj.dateStr || "Theo lịch sự kiện";
  }

  if (endObj) {
    return endObj.time ? `${endObj.time} ${endObj.dateStr}` : endObj.dateStr || "Theo lịch sự kiện";
  }

  return "Theo lịch sự kiện";
}

function displayCampaignDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return "-";
  if (!start) return displayCampaignDateTime(end);
  if (!end) return displayCampaignDateTime(start);

  const startText = displayCampaignDateTime(start);
  const endText = displayCampaignDateTime(end);
  return startText === endText ? startText : `${startText} - ${endText}`;
}

function statusLabel(status: Campaign["status"]) {
  if (status === "published") return "Đang mở";
  if (status === "closed") return "Đã đóng";
  return "Nháp";
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
  const [showQrModal, setShowQrModal] = useState(false);
  const [deletingApplicant, setDeletingApplicant] = useState<{ talentId: string; talentName: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAllBenefits, setShowAllBenefits] = useState(false);

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

  const handleDownloadQRCode = async (canvasFromComponent?: HTMLCanvasElement | null) => {
    if (!selectedCampaign) return;
    try {
      const camp = selectedCampaign as any;
      const qrCanvas = canvasFromComponent || (document.querySelector(".fi-qr-canvas canvas, canvas") as HTMLCanvasElement | null);
      await downloadJobPoster({
        title: camp.title,
        startDate: camp.startDate || camp.start_date || camp.schedule_text || camp.scheduleText,
        endDate: camp.endDate || camp.end_date,
        applicationDeadline: camp.applicationDeadline || camp.application_deadline,
        budgetMin: camp.budgetMin ?? camp.budget_min,
        budgetMax: camp.budgetMax ?? camp.budget_max,
        budget: camp.budget,
        budgetUnit: camp.budgetUnit ?? camp.budget_unit,
        referralLink: referralLink,
      }, qrCanvas);
    } catch (err) {
      console.warn("Failed to download styled QR poster:", err);
      if (referralLink) {
        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(referralLink)}`, "_blank");
      }
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

  const benefits = useMemo(() => {
    return String(selectedCampaign?.benefits || "")
      .split(/\r?\n|;/)
      .map(s => s.trim())
      .filter(Boolean);
  }, [selectedCampaign?.benefits]);

  const generalRequirements = useMemo(() => {
    if (!selectedCampaign) return [];
    const customReqs = String(selectedCampaign.requirements || "")
      .split(/\r?\n|;/)
      .map(s => s.trim())
      .filter(Boolean)
      .filter(line => {
        const lower = line.toLowerCase();
        if (lower.startsWith("chiều cao tối thiểu")) return false;
        if (lower.startsWith("cân nặng tối đa")) return false;
        if (lower.startsWith("kinh nghiệm tối thiểu")) return false;
        if (lower === "chưa có yêu cầu chi tiết." || lower === "chưa có yêu cầu chi tiết") return false;
        return true;
      });

    const list: string[] = [];
    if (selectedCampaign.heightMinCm) list.push(`Chiều cao tối thiểu: ${selectedCampaign.heightMinCm} cm.`);
    if (selectedCampaign.weightMaxKg) list.push(`Cân nặng tối đa: ${selectedCampaign.weightMaxKg} kg.`);
    if (selectedCampaign.experienceMinYears) list.push(`Kinh nghiệm tối thiểu: ${selectedCampaign.experienceMinYears} năm.`);
    list.push(...customReqs);
    return list;
  }, [selectedCampaign]);

  const recruitmentPositions = useMemo(() => {
    if (!selectedCampaign) return [];
    if (Array.isArray(selectedCampaign.positions) && selectedCampaign.positions.length > 0) {
      return selectedCampaign.positions.map((pos, idx) => ({
        id: String(pos.id || `pos-${idx}`),
        title: pos.talentType || `Vị trí ${idx + 1}`,
        count: Number(pos.quantity || 1),
        requirements: Array.isArray(pos.requirements) && pos.requirements.length > 0
          ? pos.requirements
          : ["Không có yêu cầu đặc biệt"],
      }));
    }
    if (Array.isArray(selectedCampaign.roles) && selectedCampaign.roles.length > 0) {
      return selectedCampaign.roles.map((role, idx) => ({
        id: `role-${idx}`,
        title: role,
        count: 1,
        requirements: ["Không có yêu cầu đặc biệt"],
      }));
    }
    return [];
  }, [selectedCampaign]);

  const recruitmentTotal = useMemo(() => {
    return recruitmentPositions.reduce((sum, p) => sum + p.count, 0);
  }, [recruitmentPositions]);

  const eventSchedules = useMemo(() => {
    if (!selectedCampaign) return [];
    const rawEvents = Array.isArray(selectedCampaign.events)
      ? selectedCampaign.events
      : Array.isArray((selectedCampaign as any).eventSchedules)
        ? (selectedCampaign as any).eventSchedules
        : [];

    if (rawEvents.length === 0) return [];

    return rawEvents.map((evt: any, idx: number) => {
      const title = evt.eventName || evt.event_name || evt.title || evt.name || `Sự kiện ${idx + 1}`;
      const location = evt.address || evt.location || evt.event_address || selectedCampaign.address || selectedCampaign.city || "Không có";
      const timeText = formatEventScheduleTimeText(evt, selectedCampaign.startDate);

      const contentList = Array.isArray(evt.content)
        ? evt.content
        : String(evt.content || evt.note || evt.description || "")
            .split(/\r?\n/)
            .map((s: string) => s.trim())
            .filter(Boolean);

      const note = contentList.join("\n");

      return {
        id: String(evt.id || `event-${idx}`),
        title,
        timeText,
        location,
        note,
      };
    });
  }, [selectedCampaign]);

  const startText = selectedCampaign?.startDate
    ? displayCampaignDateTime(selectedCampaign.startDate, (selectedCampaign as any).startTime)
    : "Không có";
  const endText = selectedCampaign?.endDate
    ? displayCampaignDateTime(selectedCampaign.endDate, (selectedCampaign as any).endTime)
    : "Không có";

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
      router.push("/brand/manage-jobs");
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
          onClick={() => router.push("/brand/manage-jobs")}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 px-4 text-xs font-black text-white hover:bg-white/10 cursor-pointer"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. HERO MỞ RỘNG (HERO + KPI + LINK ỨNG TUYỂN) */}
      <Hero
        selectedCampaign={selectedCampaign}
        referralLink={referralLink}
        copiedLink={copiedLink}
        isGeneratingLink={isGeneratingLink}
        onCopyReferralLink={handleCopyReferralLink}
        onOpenQrModal={() => setShowQrModal(true)}
        onBack={() => router.push("/brand/manage-jobs")}
        onOpenPayoutModal={openPayoutModal}
        onUpdateStatus={(status) => updateCampaignStatus(selectedCampaign.id, status)}
        onDeleteCampaign={handleDeleteCampaign}
        onEditCampaign={() => router.push(`/brand/manage-jobs/${selectedCampaign.id}/edit-job`)}
      />

      {/* 5. NHÂN SỰ JOB */}
      <section className="space-y-4 pt-4 border-t border-[#F0D7D3]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-baseline justify-between sm:justify-start gap-3 w-full sm:w-auto text-left">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#8F0709]">NHÂN SỰ JOB</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#574D54]">{selectedCampaign.applicants.length + 1} nhân sự</span>
          </div>
          <button
            onClick={() => setIsAddingStaff(true)}
            className="light-force-white flex w-full sm:w-auto h-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-4 text-[10px] font-black uppercase tracking-wider !text-white text-white shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Thêm nhân sự
          </button>
        </div>

        {/* --- DESKTOP TABLE VIEW (md:block) --- */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#F0D7D3] bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse font-medium min-w-[700px]">
            <thead>
              <tr className="border-b border-[#F0D7D3] bg-[#FAF7F6] text-[9.5px] font-black uppercase tracking-wider text-[#574D54]">
                <th className="py-3.5 px-4">Nhân sự</th>
                <th className="py-3.5 px-4">Vai trò / Nguồn</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0D7D3]">
              {/* Người phụ trách Job */}
              <tr className="hover:bg-[#FFF0EE]/30 transition-colors group">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={activeOwner.avatar}
                        alt={activeOwner.name}
                        onError={(event) => {
                          event.currentTarget.src = createInitialAvatarDataUrl(activeOwner.name, "");
                        }}
                        className="h-10 w-10 rounded-xl object-cover border border-[#F0D7D3] bg-[#FFF0EE]"
                      />
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8F0709] ring-2 ring-white text-white" title="Người phụ trách">
                        <ShieldCheck className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#191116] group-hover:text-[#8F0709] transition-colors text-xs truncate">{activeOwner.name}</span>
                        <span className="inline-flex items-center gap-1 font-display font-extrabold text-[8.5px] text-[#8F0709] bg-[#FFF0EE] border border-[#F0D7D3] px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider">
                          <ShieldCheck className="w-2.5 h-2.5 text-[#8F0709]" />
                          Người phụ trách Job
                        </span>
                      </div>
                      <span className="text-[10.5px] text-[#574D54] font-medium">
                        {activeOwner.role} · {activeOwner.location || "Hà Nội"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-left">
                  <span className="text-xs font-bold text-[#191116]">Quản lý Job</span>
                </td>
                <td className="py-3.5 px-4 text-left">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0EE] border border-[#F0D7D3] px-3 py-1 text-[9.5px] font-extrabold text-[#8F0709] uppercase tracking-wider shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-[#E01B1F] animate-pulse" />
                    Đang phụ trách
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setIsShowingOwnerTransferModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#F0D7D3] bg-[#FFF0EE] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#8F0709] hover:bg-[#FFE5E2] hover:border-[#8F0709]/40 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Chuyển quyền phụ trách
                  </button>
                </td>
              </tr>

              {/* Danh sách Applicants / Talents */}
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
                  <tr key={item.talentId} className="hover:bg-[#FFF0EE]/20 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={talent.avatar}
                          alt={talent.name}
                          onError={(event) => {
                            event.currentTarget.src = createInitialAvatarDataUrl(talent.name, "");
                          }}
                          className="h-10 w-10 rounded-xl object-cover border border-[#F0D7D3] shrink-0 bg-[#FAF7F6]"
                        />
                        <div className="flex flex-col text-left min-w-0">
                          <span className="font-bold text-[#191116] group-hover:text-[#8F0709] transition-colors text-xs truncate">{talent.name}</span>
                          <span className="text-[10.5px] text-[#574D54] font-medium">
                            {talent.type || "Talent"} · {talent.city || "Hà Nội"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      {referrerName ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#FFF0EE] border border-[#F0D7D3] px-2 py-0.5 text-[9.5px] font-bold text-[#8F0709] tracking-wide">
                          <Users className="h-3 w-3 text-[#8F0709]" />
                          Giới thiệu: {referrerName}
                        </span>
                      ) : (
                        <span className="text-xs text-[#574D54] font-medium">Ứng tuyển trực tiếp</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      {stage === "confirmed" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF7EE] border border-[#A6E9BD] px-2.5 py-1 text-[9.5px] font-extrabold text-[#0A6C3B] uppercase tracking-wider">
                          <CheckCircle2 className="h-3 w-3 text-[#0A6C3B]" />
                          Đã giải ngân
                        </span>
                      ) : stage === "accepted" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#EBF3FF] border border-[#B9D7FE] px-2.5 py-1 text-[9.5px] font-extrabold text-[#1351B4] uppercase tracking-wider">
                          <CheckCircle2 className="h-3 w-3 text-[#1351B4]" />
                          Đã duyệt
                        </span>
                      ) : stage === "new" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF4E5] border border-[#FED7AA] px-2.5 py-1 text-[9.5px] font-extrabold text-[#B45309] uppercase tracking-wider">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
                          Mới ứng tuyển
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[9.5px] font-bold text-slate-700 uppercase tracking-wider">
                          {stage}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {stage === "confirmed" ? (
                          <span className="inline-flex items-center gap-1 rounded-xl border border-[#A6E9BD] bg-[#EAF7EE] px-2.5 py-1.5 text-[9.5px] text-[#0A6C3B] font-black uppercase tracking-wider whitespace-nowrap">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#0A6C3B]" />
                            Đã giải ngân
                          </span>
                        ) : (
                          <button
                            onClick={() => router.push(`/brand/talents/${talent.id}`)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#F0D7D3] text-[#574D54] px-2.5 py-1.5 text-[10px] font-black uppercase transition-all cursor-pointer hover:bg-[#FFF0EE] hover:text-[#8F0709] active:scale-[0.98]"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#574D54]" />
                            Xem hồ sơ
                          </button>
                        )}

                        {stage === "new" && (
                          <button
                            onClick={() => moveApplicant(selectedCampaign.id, talent.id, "accepted")}
                            className="light-force-white inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-black uppercase bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Duyệt
                          </button>
                        )}

                        <button
                          onClick={() => removeApplicant(selectedCampaign.id, talent.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-black uppercase bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer active:scale-[0.98]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* --- MOBILE CARDS VIEW (md:hidden) --- */}
        <div className="md:hidden space-y-3">
          {/* Mobile Card: Người phụ trách Job */}
          <div className="rounded-2xl border border-[#F0D7D3] bg-white p-4 space-y-3 shadow-sm text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={activeOwner.avatar}
                    alt={activeOwner.name}
                    onError={(event) => {
                      event.currentTarget.src = createInitialAvatarDataUrl(activeOwner.name, "");
                    }}
                    className="h-11 w-11 rounded-xl object-cover border border-[#F0D7D3] bg-[#FFF0EE]"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8F0709] ring-2 ring-white text-white" title="Người phụ trách">
                    <ShieldCheck className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-bold text-[#191116] truncate">{activeOwner.name}</h3>
                  </div>
                  <p className="text-[11px] text-[#574D54] mt-0.5">
                    {activeOwner.role} · {activeOwner.location || "Hà Nội"}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0EE] border border-[#F0D7D3] px-2.5 py-1 text-[9px] font-extrabold text-[#8F0709] uppercase tracking-wider shrink-0 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E01B1F] animate-pulse" />
                Đang phụ trách
              </span>
            </div>

            <div className="pt-2 border-t border-[#F0D7D3] flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 font-display font-extrabold text-[9px] text-[#8F0709] bg-[#FFF0EE] border border-[#F0D7D3] px-2 py-0.5 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-2.5 h-2.5 text-[#8F0709]" />
                Người phụ trách Job
              </span>

              <button
                onClick={() => setIsShowingOwnerTransferModal(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#F0D7D3] bg-[#FFF0EE] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#8F0709] hover:bg-[#FFE5E2] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
                Chuyển quyền
              </button>
            </div>
          </div>

          {/* Mobile Cards: Applicants / Talents */}
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
              <div key={item.talentId} className="rounded-2xl border border-[#F0D7D3] bg-white p-4 space-y-3 shadow-sm text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={talent.avatar}
                      alt={talent.name}
                      onError={(event) => {
                        event.currentTarget.src = createInitialAvatarDataUrl(talent.name, "");
                      }}
                      className="h-11 w-11 rounded-xl object-cover border border-[#F0D7D3] shrink-0 bg-[#FAF7F6]"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#191116] truncate">{talent.name}</h3>
                      <p className="text-[11px] text-[#574D54] mt-0.5">
                        {talent.type || "Talent"} · {talent.city || "Hà Nội"}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {stage === "confirmed" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF7EE] border border-[#A6E9BD] px-2 py-0.5 text-[9px] font-bold text-[#0A6C3B] uppercase tracking-wider">
                        <CheckCircle2 className="h-2.5 w-2.5 text-[#0A6C3B]" />
                        Đã giải ngân
                      </span>
                    ) : stage === "accepted" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EBF3FF] border border-[#B9D7FE] px-2 py-0.5 text-[9px] font-bold text-[#1351B4] uppercase tracking-wider">
                        <CheckCircle2 className="h-2.5 w-2.5 text-[#1351B4]" />
                        Đã duyệt
                      </span>
                    ) : stage === "new" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF4E5] border border-[#FED7AA] px-2 py-0.5 text-[9px] font-bold text-[#B45309] uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
                        Mới ứng tuyển
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-700 uppercase tracking-wider">
                        {stage}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F0D7D3] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    {referrerName ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#FFF0EE] border border-[#F0D7D3] px-2 py-0.5 text-[9.5px] font-bold text-[#8F0709] tracking-wide truncate">
                        <Users className="h-3 w-3 text-[#8F0709] shrink-0" />
                        Giới thiệu: {referrerName}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#574D54] font-medium">Ứng tuyển trực tiếp</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {stage === "confirmed" ? (
                      <span className="inline-flex items-center gap-1 rounded-xl border border-[#A6E9BD] bg-[#EAF7EE] px-2.5 py-1.5 text-[9.5px] text-[#0A6C3B] font-black uppercase tracking-wider">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#0A6C3B]" />
                        Đã giải ngân
                      </span>
                    ) : (
                      <button
                        onClick={() => router.push(`/brand/talents/${talent.id}`)}
                        className="inline-flex items-center gap-1 rounded-xl bg-white border border-[#F0D7D3] text-[#574D54] px-2.5 py-1.5 text-[10px] font-black uppercase transition-all cursor-pointer hover:bg-[#FFF0EE] hover:text-[#8F0709]"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#574D54]" />
                        Xem
                      </button>
                    )}

                    {stage === "new" && (
                      <button
                        onClick={() => moveApplicant(selectedCampaign.id, talent.id, "accepted")}
                        className="light-force-white inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[10px] font-black uppercase bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Duyệt
                      </button>
                    )}

                    <button
                      onClick={() => removeApplicant(selectedCampaign.id, talent.id)}
                      className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[10px] font-black uppercase bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>



      {/* 2. MÔ TẢ CÔNG VIỆC */}
      <div className="rounded-3xl border border-[#F0D7D3] bg-white p-6 space-y-3 shadow-sm text-left dark:border-white/5 dark:bg-slate-950/25 dark:text-white">
        <h4 className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#8F0709] uppercase tracking-wider border-b border-[#F0D7D3] pb-3 dark:border-white/5 dark:text-white">
          <Info className="h-4.5 w-4.5 text-[#8F0709] dark:text-amber-400" /> Mô tả công việc
        </h4>
        <p className="text-xs sm:text-sm text-[#191116] leading-relaxed font-normal whitespace-pre-line dark:text-slate-300">
          {selectedCampaign.description || (selectedCampaign as any).brief || "Không có mô tả chi tiết."}
        </p>
      </div>

      {/* 3. THÔNG TIN CÔNG VIỆC */}
      <JobInfoSection
        job={selectedCampaign}
        benefits={benefits}
        startText={startText}
        endText={endText}
        showAllBenefits={showAllBenefits}
        onToggleBenefits={() => setShowAllBenefits((cur) => !cur)}
      />

      {/* 4. VỊ TRÍ & YÊU CẦU TUYỂN DỤNG */}
      {(recruitmentPositions.length > 0 || generalRequirements.length > 0) && (
        <RecruitmentPositionsSection
          positions={recruitmentPositions}
          generalRequirements={generalRequirements}
          total={recruitmentTotal}
        />
      )}

      {/* 5. THÔNG TIN SỰ KIỆN */}
      {eventSchedules.length > 0 && (
        <EventInformationSection events={eventSchedules} />
      )}

      {/* 3. Bộ ảnh job */}
      <section className="space-y-5">
        {/* Bộ ảnh job (full width) */}
        <div className="rounded-3xl border border-[#F0D7D3] bg-white p-6 text-left shadow-sm text-[#191116] dark:border-white/10 dark:bg-slate-950/25 dark:text-white">
          <div className="mb-6 flex flex-col gap-3 border-b border-[#F0D7D3] pb-4 sm:flex-row sm:items-start sm:justify-between text-left dark:border-white/10">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#F0D7D3] bg-[#FFF0EE] dark:border-amber-400/20 dark:bg-amber-400/10">
                <ImagePlus className="h-4.5 w-4.5 text-[#8F0709] dark:text-amber-300" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-[#191116] dark:text-white">Bộ ảnh job</h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#574D54] dark:text-slate-500">
                  Tải lên các hình ảnh bạn muốn dùng cho job (Tối đa 10 ảnh)
                </p>
              </div>
            </div>
            <span className="rounded-full border border-[#F0D7D3] bg-[#FFF0EE] px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#8F0709] shrink-0 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              {selectedCampaign.media?.length || 0}/10 ảnh
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {/* Upload block (only show if < 10 images) */}
            {(selectedCampaign.media?.length || 0) < 10 && (
              <label className="group relative flex aspect-[4/5] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#F0D7D3] bg-[#FFF0EE]/40 p-4 text-center transition-all hover:border-[#8F0709] hover:bg-[#FFF0EE] dark:border-white/20 dark:bg-slate-900/60">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isUploadingMedia}
                  onChange={handleCampaignMediaUpload}
                  className="hidden"
                />
                <ImagePlus className="mb-3 h-8 w-8 text-[#8F0709] transition-colors group-hover:scale-110 dark:text-slate-400 dark:group-hover:text-amber-300" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8F0709] dark:text-slate-100">
                  {isUploadingMedia ? "Đang tải..." : "Tải ảnh lên"}
                </span>
                <span className="mt-1 text-[8.5px] font-medium leading-relaxed text-[#574D54] dark:text-slate-500">
                  JPG, PNG hoặc WebP
                </span>
              </label>
            )}

            {(selectedCampaign.media || []).map((media, index) => (
              media.url ? (
                <div key={`${media.id || media.url || index}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#F0D7D3] bg-[#FAF7F6] shadow-sm dark:border-white/10 dark:bg-slate-950">
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
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#F0D7D3] bg-white text-[#574D54] shadow-sm transition hover:border-red-500 hover:bg-red-500 hover:text-white cursor-pointer dark:border-white/15 dark:bg-black/60 dark:text-white"
                    title="Xóa ảnh"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Edit button (Pencil) */}
                  <label className="absolute right-14 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#F0D7D3] bg-white text-[#574D54] shadow-sm transition hover:border-[#8F0709] hover:bg-[#FFF0EE] hover:text-[#8F0709] dark:border-white/15 dark:bg-black/60 dark:text-white">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#F0D7D3] bg-white text-[#8F0709] hover:bg-[#FFF0EE] transition-all cursor-pointer shadow-md"
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
              className="border-[#F0D7D3] bg-white shadow-2xl overflow-hidden text-[#191116]"
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
            router.push(`/brand/talents/${talent.id}`);
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


      {/* Owner Transfer Modal Dialog */}
      {isShowingOwnerTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-xl max-h-[80vh] flex flex-col bg-white border border-[#F0D7D3] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 text-[#191116]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#F0D7D3] bg-[#FAF7F6]">
              <div className="text-left">
                <h3 className="text-sm font-black text-[#8F0709] uppercase tracking-wider">Chuyển quyền phụ trách Job</h3>
                <p className="text-[10px] text-[#574D54] mt-1 font-semibold">Chọn nhân sự để bàn giao quản lý chiến dịch này</p>
              </div>
              <button
                onClick={() => setIsShowingOwnerTransferModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#F0D7D3] bg-white text-[#8F0709] hover:bg-[#FFF0EE] cursor-pointer transition-colors shadow-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">
              {/* Current Owner Highlight */}
              <div className="rounded-2xl border border-[#F0D7D3] bg-[#FFF0EE] p-4 text-left shadow-xs">
                <span className="block text-[9px] font-black uppercase tracking-wider text-[#8F0709] mb-2">Đang phụ trách hiện tại</span>
                <div className="flex items-center gap-3">
                  <img
                    src={activeOwner.avatar}
                    alt={activeOwner.name}
                    className="h-10 w-10 rounded-xl object-cover border border-[#F0D7D3] bg-white shrink-0 shadow-xs"
                    onError={(event) => {
                      event.currentTarget.src = createInitialAvatarDataUrl(activeOwner.name, "");
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-[#191116]">{activeOwner.name}</h4>
                    <p className="text-[10px] text-[#574D54] font-medium mt-0.5">{activeOwner.role} · {activeOwner.location}</p>
                  </div>
                </div>
              </div>

              {/* List of candidates to transfer to */}
              <div className="space-y-2.5">
                <span className="block text-[9px] font-black uppercase tracking-wider text-[#574D54] text-left">Danh sách nhân sự chuyển giao</span>
                <div className="space-y-2">
                  {availableOwners.map((owner) => {
                    const isCurrent = owner.id === campaignOwnerId;
                    return (
                      <div
                        key={owner.id}
                        className={cn(
                          "flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 text-left gap-3",
                          isCurrent
                            ? "border-[#F0D7D3] bg-[#FFF0EE] cursor-default"
                            : "border-[#F0D7D3] bg-white hover:border-[#8F0709]/40 hover:bg-[#FFF0EE]/40 cursor-pointer shadow-xs"
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
                            className="h-9 w-9 rounded-xl object-cover border border-[#F0D7D3] shrink-0 bg-[#FAF7F6]"
                            onError={(event) => {
                              event.currentTarget.src = createInitialAvatarDataUrl(owner.name, "");
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-[#191116] truncate">{owner.name}</h4>
                              {owner.id === "me" && (
                                <span className="rounded-full bg-[#FFF0EE] border border-[#F0D7D3] px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider text-[#8F0709]">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#574D54] mt-0.5 truncate">{owner.role} · {owner.location}</p>
                          </div>
                        </div>

                        <div>
                          {isCurrent ? (
                            <span className="inline-flex h-7 items-center justify-center rounded-xl bg-white border border-[#F0D7D3] px-3 text-[9px] font-extrabold uppercase tracking-wider text-[#8F0709] shadow-xs">
                              Đang phụ trách
                            </span>
                          ) : (
                            <button
                              className="light-force-white h-7 rounded-xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-3 text-[9px] font-black uppercase tracking-wider !text-white text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-xs"
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
