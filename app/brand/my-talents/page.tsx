"use client";

import React, { useState, useEffect } from "react";
import {
  Users2, Briefcase, DollarSign, CheckCircle, Clock, Wallet, TrendingUp, UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { talents as allTalents } from "@/lib/brand-mvp-data";

import RosterTab, { type RosterTalent, type RosterStatus } from "./roster-tab";
import CampaignsTab from "./campaigns-tab";
import RevenueTab from "./revenue-tab";
import InviteModal from "./invite-modal";

// ─── Extended mock talents local to this page so that invite list has candidates ────
const extendedTalents: any[] = [
  ...allTalents,
  {
    id: "tal-6",
    name: "Vương Việt Cường",
    type: "Model/KOL",
    city: "TP. Hồ Chí Minh",
    district: "Quận 7",
    gender: "Nam",
    age: 25,
    height: 180,
    weight: 70,
    bust: 95,
    waist: 76,
    hips: 96,
    skinTone: "Rám nắng",
    hairColor: "Đen",
    yearsOfExperience: 4,
    tier: "A",
    verified: true,
    rating: 4.8,
    completedJobs: 15,
    responseRate: 95,
    followersCount: 320000,
    followers: "320K",
    engagementRate: 5.1,
    platforms: ["TikTok", "Instagram"],
    rateValue: 6000000,
    rate: "từ 6.000.000đ",
    rateUnit: "buổi",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&h=500&q=80",
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    fullBodyImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80",
    skills: ["Lookbook", "Runway show", "Livestream", "Sport Companion"],
    experience: "Model ảnh chuyên nghiệp cho các thương hiệu thời trang nam cao cấp, đại sứ thương hiệu golf.",
    portfolio: ["Golf Tournament 2026", "Men's Luxury Lookbook"],
    availability: "Rảnh các ngày trong tuần",
    availabilityDates: ["2026-06-10", "2026-06-12", "2026-06-14"],
    completion: 92,
    matchScore: 94,
    reliability: 95,
    education: "Đại học Thể dục Thể thao",
    languages: ["Tiếng Việt", "Tiếng Anh IELTS 6.5"],
    rateCard: {
      "Lookbook 1 ngày": 6000000,
      "Golf Companion 4h": 4000000,
    },
    lifestyleServices: [
      { id: "golf", title: "Sport Companion (Golf)", rate: 1000000, unit: "giờ", description: "Người đẹp đồng hành, am hiểu văn hóa ứng xử sân golf VIP.", enabled: true },
      { id: "dining", title: "Business Dining (Fine Dining)", rate: 2000000, unit: "buổi", description: "Giao tiếp ngoại giao xuất sắc, nâng tầm các buổi tiệc chiêu đãi đối tác.", enabled: true },
      { id: "pickleball", title: "Sport Companion (Pickleball)", rate: 800000, unit: "giờ", description: "Hot Influencer năng động, lan tỏa phong cách sống khỏe khoắn.", enabled: true },
    ]
  },
  {
    id: "tal-7",
    name: "Nguyễn Hải Yến",
    type: "KOC/Beauty",
    city: "Hà Nội",
    district: "Cầu Giấy",
    gender: "Nữ",
    age: 23,
    height: 165,
    weight: 48,
    bust: 82,
    waist: 58,
    hips: 88,
    skinTone: "Sáng hồng",
    hairColor: "Nâu hạt dẻ",
    yearsOfExperience: 2,
    tier: "B",
    verified: true,
    rating: 4.7,
    completedJobs: 24,
    responseRate: 98,
    followersCount: 150000,
    followers: "150K",
    engagementRate: 6.4,
    platforms: ["TikTok", "Instagram", "Shopee"],
    rateValue: 3500000,
    rate: "từ 3.500.000đ",
    rateUnit: "video",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&h=500&q=80",
    cover: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=80",
    fullBodyImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80",
    skills: ["Review mỹ phẩm", "Livestream bán hàng", "Tạo nội dung TikTok"],
    experience: "KOC hàng đầu phân khúc skincare học đường và makeup hằng ngày, lượng fan trung thành cao.",
    portfolio: ["L'Oreal Skincare Campaign", "Maybelline Lipstick Swatch"],
    availability: "Nhận job hằng ngày",
    availabilityDates: ["2026-06-11", "2026-06-13", "2026-06-16"],
    completion: 96,
    matchScore: 97,
    reliability: 97,
    education: "Đại học Thương mại",
    languages: ["Tiếng Việt", "Tiếng Anh giao tiếp"],
    rateCard: {
      "TikTok Video 60s": 3500000,
      "Livestream Shopee 2h": 5000000,
    },
    lifestyleServices: [
      { id: "cafe", title: "VIP Cafe & Networking", rate: 1000000, unit: "giờ", description: "Kết nối tư duy tri thức, trò chuyện tại các không gian Luxury Hub.", enabled: true },
      { id: "shopping", title: "Luxury Shopping Advisor", rate: 1500000, unit: "buổi", description: "Fashionista/Stylist đồng hành mua sắm tại các Boutique xa xỉ.", enabled: true },
      { id: "content", title: "Daily Content Companion", rate: 3000000, unit: "ngày", description: "KOC đồng hành sáng tạo nội dung, xây dựng thương hiệu cá nhân cho CEO.", enabled: true }
    ]
  },
  {
    id: "tal-8",
    name: "Phạm Minh Hoàng",
    type: "KOL/TikToker",
    city: "Hà Nội",
    district: "Đống Đa",
    gender: "Nam",
    age: 26,
    height: 178,
    weight: 68,
    bust: 92,
    waist: 74,
    hips: 94,
    skinTone: "Sáng",
    hairColor: "Đen",
    yearsOfExperience: 3,
    tier: "A",
    verified: false,
    rating: 4.6,
    completedJobs: 12,
    responseRate: 90,
    followersCount: 450000,
    followers: "450K",
    engagementRate: 4.2,
    platforms: ["TikTok", "Facebook"],
    rateValue: 5000000,
    rate: "từ 5.000.000đ",
    rateUnit: "dự án",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&h=500&q=80",
    cover: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80",
    fullBodyImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80",
    skills: ["Comedy video", "Street fashion style", "Sự kiện thảm đỏ"],
    experience: "Tạo nội dung hài hước ngắn, kết hợp khéo léo giới thiệu sản phẩm công nghệ và lifestyle nam giới.",
    portfolio: ["Galaxy S26 Launching", "Luxury Suit Show"],
    availability: "Cần báo trước 3 ngày",
    availabilityDates: ["2026-06-12", "2026-06-18", "2026-06-19"],
    completion: 90,
    matchScore: 88,
    reliability: 92,
    education: "Đại học Bách Khoa",
    languages: ["Tiếng Việt"],
    rateCard: {
      "TikTok Video review": 5000000,
      "Event Appearance": 8000000,
    },
    lifestyleServices: [
      { id: "golf", title: "Sport Companion (Golf)", rate: 1200000, unit: "giờ", description: "Người đẹp đồng hành, am hiểu văn hóa ứng xử sân golf VIP.", enabled: true },
      { id: "travel", title: "Business Travel Companion", rate: 5000000, unit: "ngày", description: "Tháp tùng công tác dài ngày, bảo mật tuyệt đối bằng hợp đồng NDA.", enabled: true }
    ]
  }
];

type ActiveTab = "roster" | "campaigns" | "revenue";

const COMMISSION_RATE = 0.10; // F1 = 10%
const AFFILIATE_ID = "mgr-loreal-vn-2026";

// ─── Mock roster data (pre-seeded in localStorage if empty) ───────────────────
const MOCK_ROSTER: RosterTalent[] = [
  { talentId: "tal-1", status: "accepted", addedAt: "2026-05-01", earnedCommission: 2400000, activeJobs: 2, completedJobs: 8 },
  { talentId: "tal-2", status: "accepted", addedAt: "2026-05-10", earnedCommission: 1800000, activeJobs: 1, completedJobs: 5 },
  { talentId: "tal-3", status: "pending", addedAt: "2026-06-08", earnedCommission: 0, activeJobs: 0, completedJobs: 0 },
  { talentId: "tal-4", status: "accepted", addedAt: "2026-05-20", earnedCommission: 950000, activeJobs: 0, completedJobs: 3 },
  { talentId: "tal-5", status: "declined", addedAt: "2026-06-01", earnedCommission: 0, activeJobs: 0, completedJobs: 0 },
];

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n) + "đ";

export default function MyTalentsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("roster");
  const [roster, setRoster] = useState<RosterTalent[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteSent, setInviteSent] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; msg: string }[]>([]);

  // Load roster from localStorage or seed mock
  useEffect(() => {
    const stored = localStorage.getItem("onstagevn_my_roster");
    if (stored) {
      try { setRoster(JSON.parse(stored)); return; } catch { }
    }
    setRoster(MOCK_ROSTER);
    localStorage.setItem("onstagevn_my_roster", JSON.stringify(MOCK_ROSTER));
  }, []);

  const saveRoster = (r: RosterTalent[]) => {
    setRoster(r);
    localStorage.setItem("onstagevn_my_roster", JSON.stringify(r));
  };

  const addToast = (msg: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const handleInvite = (talentId: string) => {
    const existing = roster.find(r => r.talentId === talentId);
    let nextRoster = [...roster];
    if (existing) {
      if (existing.status === "declined") {
        nextRoster = roster.map(r => r.talentId === talentId ? { ...r, status: "pending" as const, addedAt: new Date().toISOString().slice(0, 10) } : r);
      } else {
        return; // already pending or accepted
      }
    } else {
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
    saveRoster(nextRoster);
    setInviteSent(p => [...p, talentId]);
    addToast("Đã gửi lời mời cho Talent! Chờ họ xác nhận.");
  };

  const handleRemove = (talentId: string) => {
    saveRoster(roster.filter(r => r.talentId !== talentId));
    addToast("Đã xoá Talent khỏi danh sách hợp tác.");
  };

  const handleCopyLink = () => {
    const link = `https://onstage.vn/ref/${AFFILIATE_ID}`;
    navigator.clipboard.writeText(link).catch(() => { });
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    addToast("Đã sao chép Affiliate Link!");
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const acceptedRoster = roster.filter(r => r.status === "accepted");
  const pendingRoster = roster.filter(r => r.status === "pending");
  const totalF1Commission = roster.reduce((s, r) => s + r.earnedCommission, 0);
  const passiveMLM = 3100000;            // mock passive
  const totalRevenue = totalF1Commission + passiveMLM;

  const affiliateLink = `https://onstage.vn/ref/${AFFILIATE_ID}`;

  // Talents not yet in roster or whose status is declined (for invite modal)
  const availableToInvite = extendedTalents.filter(
    t => {
      const r = roster.find(item => item.talentId === t.id);
      return !r || r.status === "declined";
    }
  ).filter(t =>
    inviteSearch === "" ||
    t.name.toLowerCase().includes(inviteSearch.toLowerCase()) ||
    t.type.toLowerCase().includes(inviteSearch.toLowerCase())
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

  const statusConfig = {
    accepted: { label: "Đã chấp nhận", dot: "bg-emerald-400", text: "text-emerald-400" },
    pending: { label: "Đang chờ xác nhận", dot: "bg-amber-400 animate-pulse", text: "text-amber-400" },
    declined: { label: "Đã từ chối", dot: "bg-red-400", text: "text-red-400" },
  };

  // ── TABS CONTENT ──────────────────────────────────────────────────────────
  const TABS = [
    { id: "roster" as ActiveTab, label: "Danh sách Talent hợp tác", icon: Users2 },
    { id: "campaigns" as ActiveTab, label: "Chiến dịch", icon: Briefcase },
    { id: "revenue" as ActiveTab, label: "Doanh thu & Affiliate", icon: DollarSign },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-white/5 pb-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
              TALENT MANAGEMENT
            </span>
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight text-white uppercase leading-none">
            Quản lý Talent
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Quản lý đội ngũ KOL độc quyền, theo dõi tiến độ chiến dịch và hoa hồng giới thiệu Affiliate.
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(244,196,48,0.2)] hover:shadow-[0_0_25px_rgba(244,196,48,0.4)] hover:brightness-105 active:scale-[0.98] cursor-pointer transition-all duration-300"
        >
          <UserPlus className="h-4 w-4" />
          Thêm Talent
        </button>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Talent đã xác nhận", value: acceptedRoster.length, icon: CheckCircle, color: "text-emerald-400 border-emerald-500/15 bg-emerald-500/5", glow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]" },
          { label: "Đang chờ xác nhận", value: pendingRoster.length, icon: Clock, color: "text-amber-400 border-amber-500/15 bg-amber-500/5", glow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.08)]" },
          { label: "Hoa hồng F1 tháng này", value: formatVND(totalF1Commission), icon: Wallet, color: "text-cyan-400 border-cyan-500/15 bg-cyan-500/5", glow: "hover:shadow-[0_0_20px_rgba(6,182,212,0.08)]" },
          { label: "Tổng doanh thu tháng này", value: formatVND(totalRevenue), icon: TrendingUp, color: "text-amber-300 border-amber-400/20 bg-amber-500/5", glow: "hover:shadow-[0_0_25px_rgba(244,196,48,0.12)]" },
        ].map((stat) => (
          <div key={stat.label} className={cn("rounded-2xl border p-5 bg-[#08090f] transition-all duration-300 hover:scale-[1.02] hover:border-slate-700/50", stat.glow)}>
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border mb-3.5", stat.color)}>
              <stat.icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-xl font-black text-white tracking-tight font-mono">{stat.value}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-[#151b2d] flex gap-8 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative cursor-pointer flex items-center gap-2 shrink-0",
              activeTab === tab.id ? "text-amber-400 font-black" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-300 to-yellow-500 rounded-full shadow-[0_0_8px_rgba(244,196,48,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════ TABS CONTENT ══════════════════════════ */}
      {activeTab === "roster" && (
        <RosterTab
          roster={roster}
          extendedTalents={extendedTalents}
          statusConfig={statusConfig}
          tierColor={tierColor}
          formatVND={formatVND}
          handleRemove={handleRemove}
          setShowInviteModal={setShowInviteModal}
        />
      )}

      {activeTab === "campaigns" && (
        <CampaignsTab
          extendedTalents={extendedTalents}
          tierColor={tierColor}
          formatVND={formatVND}
        />
      )}

      {activeTab === "revenue" && (
        <RevenueTab
          roster={roster}
          totalF1Commission={totalF1Commission}
          passiveMLM={passiveMLM}
          totalRevenue={totalRevenue}
          affiliateLink={affiliateLink}
          copiedLink={copiedLink}
          handleCopyLink={handleCopyLink}
          formatVND={formatVND}
        />
      )}

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
