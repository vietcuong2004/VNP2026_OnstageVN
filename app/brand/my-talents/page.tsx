"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users2, Briefcase, DollarSign, CheckCircle, Clock, Wallet, TrendingUp, UserPlus, Link2, Copy, Check, Download, Share2, X, Plus, Shield, MapPin, Eye, MessageSquare, QrCode, Search, Phone, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import QRCodeContainer from "@/components/QR_Code";
import { QRCodeCanvas } from "qrcode.react";
import { createInitialAvatarDataUrl, isUsableAvatarUrl, profileAvatarFromBackend } from "@/lib/avatar";
import { talents as allTalents, type Campaign, type TalentProfile } from "@/lib/brand-mvp-data";
import {
  addBrandRosterTalent,
  createBrandTalentInviteLink,
  loadBrandCampaignCommissions,
  loadBrandCampaigns,
  loadBrandRosterTalents,
  loadBrandTalentInviteLink,
  loadBrandTalents,
  removeBrandRosterTalent,
  createBrandManagedTalent,
  updateBrandManagedTalent,
  addTalentToBrandCampaign,
  type BrandRosterTalent,
  type BrandCommissionTransaction,
  type ManagedTalentActivationLink,
} from "@/lib/brand-api";
import { getStoredAuthUser } from "@/lib/api-client";

import InviteModal from "./invite-modal";
import CreateTalentModal from "./create-modal";
import EditTalentModal from "./edit-modal";
import TalentCard from "./talent-card";
import ActivationCard from "./activation-card";

export type RosterStatus = "accepted" | "pending" | "declined";

export interface BrandTalentCard {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  type?: string;
  city?: string;
  district?: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  bust?: number;
  waist?: number;
  hips?: number;
  tier?: string;
  verified?: boolean;
  rating?: number | string;
  followers?: string;
  followersCount?: number;
  engagementRate?: number;
  cover?: string;
  fullBodyImage?: string;
  experience?: string;
  skills?: string[];
  languages?: string[];
  completion?: number;
  matchScore?: number;
  userStatus?: string;
  userId?: string;
  isGhost?: boolean;
  [key: string]: unknown;
}

export interface RosterTalent {
  rosterId?: string;
  talentId: string;
  status: RosterStatus;
  addedAt: string;
  earnedCommission: number;
  activeJobs: number;
  completedJobs: number;
  invitedBy?: string;
  notes?: string | null;
  activeActivationLink?: ManagedTalentActivationLink | null;
}

const COMMISSION_RATE = 0.10; // F1 = 10%
const AFFILIATE_ID = "mgr-loreal-vn-2026";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n) + "đ";

function isBackendCampaignId(id: string) {
  return /^\d+$/.test(String(id || ""));
}

function toDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isInCurrentMonth(date: Date | null) {
  if (!date) return false;

  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function rosterStatusFromBackend(status?: string | null): RosterStatus {
  if (status === "active") return "accepted";
  if (status === "inactive" || status === "blocked") return "declined";
  return "pending";
}

function usableText(value: unknown) {
  const text = String(value || "").trim();
  if (!text || text.toLowerCase() === "talent") return "";
  return text;
}

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function profileToTalent(
  profile: BrandRosterTalent["talent_profile"],
  fallback?: BrandTalentCard,
): BrandTalentCard | undefined {
  if (!profile) return fallback;

  const followersCount = fallback?.followersCount || 0;
  const displayName =
    usableText(profile.display_name) ||
    usableText(profile.full_name) ||
    usableText(profile.user?.name) ||
    usableText(profile.user?.email) ||
    usableText(fallback?.name) ||
    `Talent #${String(profile.id || fallback?.id || "").trim() || "mới"}`;
  const backendAvatar = profileAvatarFromBackend(profile) || profile.avatar_url || profile.user?.external_avatar_url;
  const fallbackAvatar = fallback?.avatar;
  const avatar = isUsableAvatarUrl(backendAvatar)
    ? String(backendAvatar)
    : isUsableAvatarUrl(fallbackAvatar)
      ? String(fallbackAvatar)
      : createInitialAvatarDataUrl(displayName, profile.user?.email || profile.user?.name);

  return {
    ...fallback,
    id: String(profile.id || fallback?.id || ""),
    name: displayName,
    userStatus: profile.user?.status || fallback?.userStatus || "",
    userId: profile.user?.id ? String(profile.user.id) : fallback?.userId,
    isGhost: typeof profile.user?.is_ghost !== "undefined" ? Boolean(profile.user.is_ghost) : Boolean(fallback?.isGhost),
    phone: profile.user?.phone || fallback?.phone || "",
    type: profile.talent_types?.[0] || fallback?.type || "Talent",
    city: profile.city || fallback?.city || "",
    district: profile.district || fallback?.district || "",
    gender: profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Nữ" : fallback?.gender || "",
    age: fallback?.age || 24,
    height: Number(profile.height_cm) || fallback?.height || 0,
    weight: Number(profile.weight_kg) || fallback?.weight || 0,
    tier: profile.tier || fallback?.tier || "C",
    verified: profile.verification_status === "verified" || Boolean(profile.user?.is_verified) || fallback?.verified || false,
    rating: Number(profile.rating) || fallback?.rating || 0,
    followersCount,
    followers: fallback?.followers || (followersCount ? new Intl.NumberFormat("vi-VN").format(followersCount) : "0"),
    engagementRate: fallback?.engagementRate || 0,
    avatar,
    cover: fallback?.cover || avatar,
    fullBodyImage: fallback?.fullBodyImage || avatar,
    experience: profile.experience || profile.bio || fallback?.experience || "",
    skills: profile.skills?.length ? profile.skills : fallback?.skills || [],
    languages: profile.languages?.length ? profile.languages : fallback?.languages || [],
    completion: Number(profile.profile_completion) || fallback?.completion || 0,
    matchScore: Number(profile.profile_completion) || fallback?.matchScore || 0,
  };
}

function rosterFromBackend(item: BrandRosterTalent): RosterTalent {
  const invitedBy = item.talent_profile?.user?.parent?.name || "Brand";

  return {
    rosterId: String(item.id),
    talentId: String(item.talent_profile_id),
    status: rosterStatusFromBackend(item.status),
    addedAt: String(item.joined_at || new Date().toISOString()).slice(0, 10),
    earnedCommission: 0,
    activeJobs: 0,
    completedJobs: 0,
    invitedBy,
    notes: item.notes,
    activeActivationLink: item.active_activation_link ?? item.activeActivationLink ?? null,
  };
}

export default function MyTalentsPage() {
  const router = useRouter();
  const [roster, setRoster] = useState<RosterTalent[]>([]);
  const [displayTalents, setDisplayTalents] = useState<BrandTalentCard[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [commissionTransactions, setCommissionTransactions] = useState<BrandCommissionTransaction[]>([]);
  const [commissionLoading, setCommissionLoading] = useState(true);
  const [affiliateLink, setAffiliateLink] = useState(`https://onstage.vn/ref/${AFFILIATE_ID}`);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activatingTalent, setActivatingTalent] = useState<BrandTalentCard | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTalentId, setDeletingTalentId] = useState<string | null>(null);
  const [deletingTalentName, setDeletingTalentName] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTalent, setEditingTalent] = useState<BrandTalentCard | null>(null);
  const [editingEntry, setEditingEntry] = useState<RosterTalent | null>(null);

  const [showAssignJobModal, setShowAssignJobModal] = useState(false);
  const [assigningTalent, setAssigningTalent] = useState<BrandTalentCard | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAssignJobConfirm = async () => {
    if (!assigningTalent) return;
    if (!selectedCampaignId) {
      addToast("Vui lòng chọn chiến dịch!");
      return;
    }
    setAssigningLoading(true);
    try {
      await addTalentToBrandCampaign(selectedCampaignId, assigningTalent.id, assignNotes);
      const campaign = campaigns.find(c => String(c.id) === String(selectedCampaignId));
      addToast(`Đã thêm ${assigningTalent.name} vào chiến dịch ${campaign?.title || ""} thành công!`);
      setShowAssignJobModal(false);
      setAssigningTalent(null);
      setSelectedCampaignId("");
      setAssignNotes("");
    } catch (error: any) {
      console.error("Failed to assign job:", error);
      const errMsg = error?.message || "";
      if (errMsg.includes("Talent nay da nam trong campaign.")) {
        addToast("Talent này đã có trong chiến dịch!");
      } else {
        addToast("Không thể gán job cho talent. Vui lòng thử lại!");
      }
    } finally {
      setAssigningLoading(false);
    }
  };
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteSent, setInviteSent] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; msg: string }[]>([]);

  // Load roster from backend, with local fallback while API is offline.
  useEffect(() => {
    let cancelled = false;

    async function loadRoster() {
      try {
        const [talentItems, rosterItems, link, campaignItems] = await Promise.all([
          loadBrandTalents([]),
          loadBrandRosterTalents(),
          loadBrandTalentInviteLink().catch(() => createBrandTalentInviteLink()),
          loadBrandCampaigns([]),
        ]);

        if (cancelled) return;

        const talentsById = new Map<string, BrandTalentCard>();
        talentItems.forEach((talent: BrandTalentCard) => talentsById.set(String(talent.id), talent));

        rosterItems.forEach((item) => {
          const profileId = String(item.talent_profile_id);
          const talent = profileToTalent(item.talent_profile, talentsById.get(profileId));
          if (talent) talentsById.set(profileId, talent);
        });

        const nextRoster = rosterItems.map(rosterFromBackend);
        setDisplayTalents(Array.from(talentsById.values()));
        setRoster(nextRoster);
        setCampaigns(campaignItems);
        setAffiliateLink(link.url);
      } catch (error) {
        console.warn("Cannot load brand roster from API", error);
        setRoster([]);
        setCampaigns([]);
        setDisplayTalents([]);
      }
    }

    loadRoster();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCommissions() {
      setCommissionLoading(true);

      const authUser = getStoredAuthUser<{ id?: number | string }>();
      const authUserId = authUser?.id ? String(authUser.id) : null;
      const backendCampaigns = campaigns.filter((campaign) => isBackendCampaignId(String(campaign.id)));

      if (!authUserId || backendCampaigns.length === 0) {
        if (active) {
          setCommissionTransactions([]);
          setCommissionLoading(false);
        }
        return;
      }

      const responses = await Promise.all(
        backendCampaigns.map(async (campaign) => {
          try {
            return await loadBrandCampaignCommissions(String(campaign.id));
          } catch {
            return null;
          }
        }),
      );

      if (!active) return;

      const receiverTransactions = responses
        .flatMap((response) => response?.data ?? [])
        .filter((transaction) => String(transaction.receiver_user_id || "") === authUserId);

      setCommissionTransactions(receiverTransactions);
      setCommissionLoading(false);
    }

    void loadCommissions();

    return () => {
      active = false;
    };
  }, [campaigns]);

  const saveRoster = (r: RosterTalent[]) => {
    setRoster(r);
  };

  const addToast = (msg: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const handleInvite = async (talentId: string) => {
    const existing = roster.find(r => r.talentId === talentId);
    let nextRoster = [...roster];
    if (existing) {
      if (existing.status === "declined") {
        nextRoster = roster.map(r => r.talentId === talentId ? { ...r, status: "pending" as const, addedAt: new Date().toISOString().slice(0, 10) } : r);
      } else {
        return; // already pending or accepted
      }
    } else {
      try {
        const created = await addBrandRosterTalent(talentId);
        nextRoster.push(rosterFromBackend(created));
      } catch (error) {
        console.warn("Cannot sync roster invite to backend, using local fallback", error);
        const newEntry: RosterTalent = {
          talentId,
          status: "pending",
          addedAt: new Date().toISOString().slice(0, 10),
          earnedCommission: 0,
          activeJobs: 0,
          completedJobs: 0,
        };
        nextRoster.push(newEntry);
      }
    }
    saveRoster(nextRoster);
    setInviteSent(p => [...p, talentId]);
    addToast("Đã gửi lời mời cho Talent! Chờ họ xác nhận.");
  };

  const handleRemove = async (talentId: string) => {
    const existing = roster.find(r => r.talentId === talentId);
    if (existing?.rosterId) {
      try {
        await removeBrandRosterTalent(existing.rosterId);
      } catch (error) {
        console.warn("Cannot remove roster talent from backend, removing locally", error);
      }
    }

    saveRoster(roster.filter(r => r.talentId !== talentId));
    addToast("Đã xoá Talent khỏi danh sách hợp tác.");
  };

  const handleEditClick = (talent: BrandTalentCard, entry: RosterTalent) => {
    setEditingTalent(talent);
    setEditingEntry(entry);
    setShowEditModal(true);
  };

  const handleEditSuccess = (updatedEntry: RosterTalent, updatedTalentPartial: Partial<BrandTalentCard>) => {
    setRoster(prev => prev.map(r => r.talentId === updatedEntry.talentId ? updatedEntry : r));
    setDisplayTalents(prev => prev.map(t => t.id === editingTalent?.id ? { ...t, ...updatedTalentPartial } : t));
  };

  const handleDeleteClick = (talentId: string, name: string) => {
    setDeletingTalentId(talentId);
    setDeletingTalentName(name);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingTalentId) {
      await handleRemove(deletingTalentId);
    }
    setShowDeleteConfirm(false);
    setDeletingTalentId(null);
    setDeletingTalentName("");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink).catch(() => { });
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    addToast("Đã sao chép link mời!");
  };

  const downloadQr = async () => {
    if (!affiliateLink) return;
    const targetUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(affiliateLink)}`;
    try {
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      addToast("Đã tải xuống mã QR tuyển dụng!");
    } catch (err) {
      console.warn("Failed to download QR code directly, opening in new tab:", err);
      window.open(targetUrl, "_blank");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Tuyển dụng Talent vào Brand",
        url: affiliateLink,
      }).catch(() => { });
    } else {
      setShowShareMenu(true);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const acceptedRoster = roster.filter(r => r.status === "accepted");
  const pendingRoster = roster.filter(r => r.status === "pending");
  const monthTransactions = commissionTransactions.filter(
    (transaction) => transaction.status !== "cancelled" && isInCurrentMonth(toDate(transaction.calculated_at))
  );
  const monthRevenue = monthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const approvedBalance = commissionTransactions
    .filter((transaction) => transaction.status === "approved")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  // Talents not yet in roster or whose status is declined (for invite modal)
  const availableToInvite = displayTalents.filter(
    t => {
      const r = roster.find(item => item.talentId === t.id);
      return !r || r.status === "declined";
    }
  ).filter(t =>
    inviteSearch === "" ||
    t.name.toLowerCase().includes(inviteSearch.toLowerCase()) ||
    (t.type || "").toLowerCase().includes(inviteSearch.toLowerCase())
  );

  const tierColor = (tier: string) => {
    if (tier === "S") return "text-amber-300 bg-amber-500/10 border-amber-500/20";
    if (tier === "A") return "text-cyan-300 bg-cyan-500/10 border-cyan-500/20";
    if (tier === "B") return "text-purple-300 bg-purple-500/10 border-purple-500/20";
    return "text-slate-300 bg-slate-500/10 border-slate-500/20";
  };

  const getTalentStatus = (id: string) => {
    if (id === "tal-1" || id === "tal-2" || id === "tal-6" || id === "tal-7") return "available";
    if (id === "tal-3" || id === "tal-8") return "busy";
    return "maybe";
  };

  const filteredRoster = roster.filter((entry) => {
    const cleanId = (id: string | number) => String(id || "").replace(/^tal-/, "");
    const talent = displayTalents.find((t) => cleanId(t.id) === cleanId(entry.talentId));
    if (!talent) return false;
    return searchQuery === "" || talent.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activationTalentItems = roster
    .map((entry) => {
      const cleanId = (id: string | number) => String(id || "").replace(/^tal-/, "");
      const talent = displayTalents.find((t) => cleanId(t.id) === cleanId(entry.talentId));
      return talent && entry.rosterId && talent.isGhost ? { entry, talent } : null;
    })
    .filter((item): item is { entry: RosterTalent; talent: BrandTalentCard } => Boolean(item));

  return (
    <div className="relative space-y-6 pb-20 md:space-y-8 md:pb-0 animate-in fade-in duration-500">
      {/* Immersive Background Image & Dark Overlay */}
      <div className="absolute inset-0 -mx-4 -mt-5 -mb-24 md:-mx-8 md:-mt-7 md:-mb-8 lg:-mx-10 lg:-mt-8 2xl:-mx-12 z-0 overflow-hidden pointer-events-none">
        <img
          src="/hero_bg.png"
          alt="OnstageVN Background Graphics"
          className="w-full h-full object-cover object-center absolute inset-0 opacity-40"
        />
        {/* Subtle overlay for contrast */}
        <div className="absolute inset-0 bg-[#02040a]/40 pointer-events-none" />
      </div>

      {/* ── Welcome Header Banner ── */}
      <div className="relative z-10 overflow-hidden rounded-3xl border border-white/7 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-amber-400/40 bg-amber-400/10 text-amber-300">
                TALENT MANAGEMENT
              </span>
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-yellow-400/30 bg-yellow-400/10 text-yellow-200">
                Brand Portal
              </span>
            </div>
            <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl uppercase">
              Quản lý <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-600 bg-clip-text text-transparent">Talent</span>
            </h1>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              Quản lý đội ngũ KOL độc quyền, theo dõi tiến độ chiến dịch và hoa hồng giới thiệu Affiliate.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(244,196,48,0.25)] hover:shadow-[0_0_25px_rgba(244,196,48,0.45)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all duration-300 shrink-0"
            >
              <UserPlus className="h-4 w-4" />
              Thêm Talent mới
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-xs font-black uppercase tracking-widest bg-slate-950 border border-white/10 hover:border-amber-400/30 text-white hover:text-amber-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
            >
              <Search className="h-4 w-4 text-amber-400" />
              Thêm từ hệ thống
            </button>
          </div>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="relative z-10 space-y-6 animate-in fade-in duration-300">
        {/* 🔗 Tuyển Talent */}
        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-[#150f02]/90 to-[#050712]/95 shadow-[0_0_30px_rgba(245,158,11,0.08)] p-6 space-y-5">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            {/* Left section */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400">
                <Link2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
                  LINK MỜI VÀO BRAND
                </span>
                <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                  Tuyển Dụng Talent
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Chia sẻ link này cho Talent để họ đăng ký tham gia mạng lưới của Brand.
                </p>
              </div>
            </div>

            {/* Right section (Buttons) */}
            <div className="grid grid-cols-2 gap-2 w-full xl:flex xl:w-auto shrink-0">
              <button
                onClick={handleCopyLink}
                className={cn(
                  "flex h-10 items-center justify-center gap-2 rounded-2xl px-3 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer w-full xl:w-auto",
                  copiedLink
                    ? "border border-emerald-400/30 bg-emerald-400/15 text-emerald-300"
                    : "bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:brightness-105"
                )}
              >
                {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedLink ? "Đã copy" : "Sao chép Link"}
              </button>

              <button
                onClick={() => setShowQrModal(true)}
                className="flex h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:brightness-105 px-3 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] w-full xl:w-auto"
              >
                <QrCode className="h-4 w-4" /> Hiện QR
              </button>
            </div>
          </div>

          {/* Bottom section (URL display) */}
          <div className="flex items-center gap-3 rounded-2xl bg-[#04060a]/90 border border-amber-500/10 px-4 py-3 font-mono text-xs font-bold text-amber-100/90">
            <Link2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="truncate select-all">{affiliateLink}</span>
          </div>
        </div>
        <ActivationCard items={activationTalentItems} addToast={addToast} />



        {/* 👥 Danh sách Talent */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Users2 className="h-4.5 w-4.5 text-amber-400 fill-amber-400/20 animate-pulse" /> Danh sách talent của tôi
            </h3>
            {/* Search Input with nested button */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchQuery(searchInputValue);
                  }
                }}
                placeholder="Nhập tên để tìm kiếm..."
                className="w-full h-9 pl-9 pr-20 rounded-xl border border-white/10 bg-slate-950 text-xs font-semibold text-white focus:outline-none focus:border-white/30 placeholder:text-slate-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />

              {/* Clear button X */}
              {searchInputValue && (
                <button
                  onClick={() => {
                    setSearchInputValue("");
                    setSearchQuery("");
                  }}
                  className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}

              {/* "Tìm" button inside search box on the right */}
              <button
                onClick={() => setSearchQuery(searchInputValue)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-400/10 border border-amber-400/20 hover:bg-amber-400/20 text-amber-400 hover:text-amber-300 transition-all cursor-pointer"
              >
                Tìm
              </button>
            </div>
          </div>

          {roster.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 md:py-20 px-4 text-center rounded-3xl border border-dashed border-white/5 bg-[#08090f]/40">
              <Users2 className="h-12 w-12 text-slate-700 mb-4 animate-pulse" />
              <p className="text-white font-black text-sm uppercase tracking-wider">Chưa có Talent nào</p>
              <p className="text-slate-400 text-xs mt-2 max-w-sm font-semibold leading-relaxed">
                Hãy mời Talent đầu tiên tham gia mạng lưới của Brand bằng link hoặc mã QR bên phải.
              </p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="mt-6 flex w-full max-w-xs items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 cursor-pointer shadow-[0_0_15px_rgba(244,196,48,0.2)] hover:shadow-[0_0_25px_rgba(244,196,48,0.3)] hover:brightness-105 active:scale-[0.98] transition-all duration-300 md:w-auto"
              >
                <Plus className="h-4 w-4" /> Thêm Talent
              </button>
            </div>
          ) : (
            <>
              {filteredRoster.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-3xl border border-[#1d2238] bg-[#08090f]/20">
                  <p className="text-slate-400 text-xs font-semibold">Không tìm thấy Talent nào phù hợp với từ khóa tìm kiếm.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRoster.map((entry) => {
                    const cleanId = (id: string | number) => String(id || "").replace(/^tal-/, "");
                    const talent = displayTalents.find((t) => cleanId(t.id) === cleanId(entry.talentId));
                    if (!talent) return null;
                    return (
                      <TalentCard
                        key={entry.talentId}
                        entry={entry}
                        talent={talent}
                        onDeleteClick={handleDeleteClick}
                        onEditClick={handleEditClick}
                        onActivateClick={(t: BrandTalentCard) => {
                          setActivatingTalent(t);
                          setShowActivateModal(true);
                        }}
                        onAssignJobClick={(t: BrandTalentCard) => {
                          setAssigningTalent(t);
                          setShowAssignJobModal(true);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Edit Talent Modal ── */}
      <EditTalentModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingTalent(null); setEditingEntry(null); }}
        onSuccess={(updatedEntry, updatedTalent) => {
          handleEditSuccess(updatedEntry, updatedTalent);
          setShowEditModal(false);
        }}
        addToast={addToast}
        talent={editingTalent}
        entry={editingEntry}
      />

      {/* ── QR Code Popover Dialog Modal ── */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm flex flex-col bg-[#0b0c15] border border-[#1d2238] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Close button top right */}
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer transition-colors z-10 p-1 bg-white/5 hover:bg-white/10 rounded-full"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <QRCodeContainer
              campaignLink={affiliateLink}
              title="Mã QR Tuyển Dụng"
              subtitle="Quét mã để gia nhập"
              badgeText="OnstageVN Gateway"
              shareButtonLabel="Chia sẻ"
              onCopyLink={handleCopyLink}
              onDownloadQr={downloadQr}
              className="border-0 bg-transparent shadow-none p-6"
            />
          </div>
        </div>
      )}

      {/* ── Share Menu Dialog Modal ── */}
      {showShareMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm flex flex-col bg-[#0b0c15] border border-[#1d2238] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] p-6 text-left animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Chia sẻ link tuyển dụng
              </h3>
              <button
                onClick={() => setShowShareMenu(false)}
                className="text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-normal">
              Chọn nền tảng để chia sẻ liên kết:
            </p>

            {/* Grid of options */}
            <div className="grid grid-cols-4 gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
              <button
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(affiliateLink)}`, "_blank");
                  setShowShareMenu(false);
                }}
                className="flex flex-col items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="h-6 w-6 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-[8px] mt-1">Facebook</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(affiliateLink);
                  setShowShareMenu(false);
                  addToast("Đã sao chép liên kết! Bạn có thể chia sẻ lên Instagram.");
                }}
                className="flex flex-col items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <Share2 className="h-6 w-6 text-pink-500" />
                <span className="text-[8px] mt-1">Instagram</span>
              </button>
              <button
                onClick={() => {
                  window.open(`https://sp.zalo.me/share?vt=1&url=${encodeURIComponent(affiliateLink)}`, "_blank");
                  setShowShareMenu(false);
                }}
                className="flex flex-col items-center gap-2 p-2.5 rounded-xl bg-[#08090f]/20 border border-white/5 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <Share2 className="h-6 w-6 text-sky-400" />
                <span className="text-[8px] mt-1">Zalo</span>
              </button>
              <button
                onClick={() => {
                  handleCopyLink();
                  setShowShareMenu(false);
                }}
                className="flex flex-col items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <Link2 className="h-6 w-6 text-[#F0C56B]" />
                <span className="text-[8px] mt-1">Copy Link</span>
              </button>
            </div>

            {/* Cancel button */}
            <button
              onClick={() => setShowShareMenu(false)}
              className="mt-6 w-full h-10 rounded-xl border border-white/5 bg-white/5 text-xs font-black uppercase text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer transition-all"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog Modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl p-6 text-center space-y-5 shadow-[0_24px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in-95 duration-300">
            <h3 className="font-display font-black text-base text-white uppercase tracking-tight">Xác nhận xóa</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Bạn có chắc chắn muốn xóa Talent <strong className="text-white">"{deletingTalentName}"</strong> khỏi danh sách hợp tác không?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl h-10 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase transition-all cursor-pointer font-bold"
              >
                Xóa
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingTalentId(null);
                  setDeletingTalentName("");
                }}
                className="flex-1 rounded-xl h-10 border border-white/5 bg-white/5 text-slate-400 hover:text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-bold"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {showActivateModal && activatingTalent && (() => {
        const activateLink = affiliateLink;
        const handleCopyActivateLink = () => {
          navigator.clipboard.writeText(activateLink).catch(() => { });
          addToast("Đã sao chép liên kết mời nhận tài khoản!");
        };
        const handleShareActivate = () => {
          if (navigator.share) {
            navigator.share({ title: `Mời ${activatingTalent.name} nhận tài khoản`, url: activateLink }).catch(() => { });
          } else {
            handleCopyActivateLink();
          }
        };
        const handleDownloadActivateQr = async () => {
          const targetUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(activateLink)}`;
          try {
            const res = await fetch(targetUrl);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `qr-invite-${activatingTalent.name.replace(/\s+/g, "-")}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
            addToast("Đã tải xuống mã QR mời nhận tài khoản!");
          } catch {
            window.open(targetUrl, "_blank");
          }
        };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto scrollbar-thin flex flex-col bg-[#0b0c15] border border-[#1d2238] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] p-5 sm:p-6 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200">

              {/* Close Button top-right */}
              <button
                onClick={() => { setShowActivateModal(false); setActivatingTalent(null); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer transition-colors p-1.5 hover:bg-white/5 rounded-full z-10"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="flex flex-col items-center justify-center border-b border-white/5 pb-3 shrink-0 pt-2">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest border-amber-400/40 bg-amber-400/10 text-amber-300 mb-2">
                  ONSTAGEVN GATEWAY
                </span>
                <h3 className="font-display font-black text-[11px] sm:text-xs text-white uppercase tracking-normal flex items-center justify-center gap-1.5 whitespace-nowrap">
                  Mời Talent tham gia OnstageVN
                </h3>
              </div>

              {/* Sub-header description */}
              <p className="text-xs text-slate-300 font-semibold leading-relaxed text-justify px-1 shrink-0">
                Gửi mã QR hoặc liên kết này cho <strong className="text-yellow-400 font-black">{activatingTalent.name}</strong> để nhận tài khoản. Talent nhận tài khoản, đăng ký/đăng nhập và hoàn thiện hồ sơ của mình.
              </p>

              {/* URL + Copy button */}
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#04060a]/90 border border-white/5 px-2.5 py-1.5 sm:px-3 sm:py-2 font-mono text-[10px] sm:text-[11px] font-bold text-slate-350 shrink-0">
                <span className="truncate select-all text-left flex-1">{activateLink}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activateLink);
                    addToast("Đã sao chép liên kết mời!");
                  }}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-amber-400 hover:text-amber-300 transition-all cursor-pointer shrink-0"
                  title="Sao chép liên kết"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="relative h-40 w-40 sm:h-48 sm:w-48 rounded-[2rem] bg-white p-3.5 sm:p-4 flex flex-col items-center justify-center shadow-2xl shrink-0">
                  <QRCodeCanvas
                    value={activateLink}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#020617"
                    level="H"
                    includeMargin={false}
                    className="h-full w-full rounded-2xl"
                  />
                  <div className="absolute h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#02040a] border-2 border-white flex items-center justify-center shadow-lg overflow-hidden">
                    <img
                      src="/logo_new.png"
                      alt="ONSTAGE"
                      className="h-full w-full object-contain p-1"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                </div>
              </div>

              {/* Instruction Steps */}
              <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-3 sm:p-4 space-y-1.5 sm:space-y-2 text-left shrink-0">
                <div className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs text-slate-300 font-semibold leading-relaxed">
                  <div className="flex gap-2">
                    <span className="text-amber-400 font-bold">1.</span>
                    <span>Gửi mã cho Talent</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-amber-400 font-bold">2.</span>
                    <span>Talent quét mã</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-amber-400 font-bold">3.</span>
                    <span>Talent đăng nhập và hoàn thiện hồ sơ</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-amber-400 font-bold">4.</span>
                    <span>Hồ sơ của Talent được cập nhật cho bạn xem</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest pt-2 shrink-0">
                <button
                  onClick={handleDownloadActivateQr}
                  className="flex-1 flex h-10 sm:h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 hover:text-white hover:border-slate-400 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4 shrink-0" /> Tải về
                </button>
                <button
                  onClick={handleShareActivate}
                  className="flex-1 flex h-10 sm:h-11 items-center justify-center gap-2 rounded-xl bg-[#F0C56B] text-[#02040a] font-black hover:bg-[#d6af5d] hover:shadow-[0_0_15px_rgba(240,197,107,0.25)] hover:scale-[1.02] active:scale-98 transition-all duration-300 cursor-pointer shadow-lg"
                >
                  <Share2 className="h-4 w-4 shrink-0" /> Chia sẻ
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        inviteSearch={inviteSearch}
        onSearchChange={setInviteSearch}
        availableToInvite={availableToInvite}
        inviteSent={inviteSent}
        handleInvite={handleInvite}
        getTalentStatus={getTalentStatus}
        tierColor={tierColor}
      />

      <CreateTalentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        addToast={addToast}
        onSuccess={(newRosterItem) => {
          const nextRosterEntry = rosterFromBackend(newRosterItem);
          const nextTalentCard = profileToTalent(newRosterItem.talent_profile);
          if (nextTalentCard) {
            setDisplayTalents((prev) => [nextTalentCard, ...prev]);
          }
          setRoster((prev) => [nextRosterEntry, ...prev]);
        }}
      />

      {/* ── Assign Job Modal ── */}
      {showAssignJobModal && assigningTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md flex flex-col bg-[#0b0c15] border border-[#1d2238] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#080911]/40">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="h-4.5 w-4.5 text-yellow-400" /> Assign Job cho Talent
                </h3>
                <span className="block text-xs font-semibold text-slate-300 mt-1.5 leading-normal">
                  Thêm <span className="text-yellow-400 font-black">{assigningTalent.name}</span> vào chiến dịch của bạn
                </span>
              </div>
              <button
                onClick={() => { setShowAssignJobModal(false); setAssigningTalent(null); setSelectedCampaignId(""); setAssignNotes(""); }}
                className="text-slate-400 hover:text-white cursor-pointer transition-colors p-1 hover:bg-white/5 rounded-full"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              {/* Campaign Select */}
              <label className="block text-left space-y-1.5">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Chọn chiến dịch</span>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#1d2238] bg-slate-900 text-xs font-semibold text-white focus:outline-none focus:border-amber-400/50 cursor-pointer"
                >
                  <option value="">-- Chọn chiến dịch --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </label>

              {/* Notes */}
              <label className="block text-left space-y-1.5">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Ghi chú công việc (Tùy chọn)</span>
                <textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Nhập ghi chú hoặc brief nhanh cho talent..."
                  className="w-full h-24 px-3.5 py-2.5 rounded-xl border border-[#1d2238] bg-slate-900 text-xs font-semibold text-white focus:outline-none focus:border-amber-400/50 resize-none"
                />
              </label>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5 bg-[#050711]">
              <button
                onClick={() => { setShowAssignJobModal(false); setAssigningTalent(null); setSelectedCampaignId(""); setAssignNotes(""); }}
                className="px-4 py-2 rounded-xl border border-[#1d2238] text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                disabled={assigningLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleAssignJobConfirm}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
                disabled={assigningLoading}
              >
                {assigningLoading ? "Đang xử lý..." : "Xác nhận thêm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notifications ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-xl bg-emerald-950 border border-emerald-500/30 px-4 py-3 text-xs font-bold text-emerald-300 shadow-xl flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
