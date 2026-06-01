"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Star, Share2, Crown, ShieldCheck, User, Edit3, Sparkles, X,
  MessageSquare, HeartHandshake, CheckCircle, Trophy, Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import PersonalInfoTab from "./PersonalInfoTab";
import EditInfoTab from "./EditInfoTab";
import AddonServicesTab from "./AddonServicesTab";

export default function PortfolioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  // Exactly 3 main tabs: 'personal-info' (default), 'edit-info', 'addon-services'
  const [activeTab, setActiveTab] = useState<"edit-info" | "personal-info" | "addon-services">("personal-info");

  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "info" }[]>([]);

  // Modals for Brand interactions preview
  const [showBookModal, setShowBookModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Form states for booking preview
  const [bookingForm, setBookingForm] = useState({
    brandName: "",
    jobType: "Instagram Post",
    date: "",
    budget: "",
    note: ""
  });

  // Chat preview state
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([
    { sender: "brand", text: "Chào Mai Anh, bên mình là nhãn hàng L'Oréal Paris. Bên mình rất ấn tượng với profile của bạn và muốn book bạn cho buổi livestream ngày 24/06 tới." },
    { sender: "talent", text: "Dạ em chào anh/chị ạ! Rất vui nhận được lời mời từ L'Oréal Paris. Ngày 24/06 lịch của em hiện đang trống. Anh/chị gửi giúp em brief chi tiết qua đây nhé!" }
  ]);

  const addToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const stored = localStorage.getItem("vnp_talent_profile");
    const defaultMock = {
      name: "Nguyễn Mai Anh",
      birthYear: 2002,
      location: "Hà Nội",
      hometown: "Nam Định",
      phone: "0912345678",
      email: "maianh.nguyen@beautyapp.vn",
      avatar: "/avatar.png",
      height: 172,
      weight: 51,
      bust: 85,
      waist: 60,
      hips: 90,
      plasticSurgery: "false",
      maritalStatus: "Độc thân",
      education: "Cử nhân Học viện Ngoại giao",
      languages: ["Tiếng Việt", "Tiếng Anh (IELTS 7.5)"],
      skills: ["Catwalk", "MC song ngữ", "Social Content", "Pose dáng lookbook"],
      followersCount: 520000,
      engagementRate: 4.8,
      profileScore: 82,
      tier: "A",
      rateCard: {
        "Instagram Post": 3000000,
        "TikTok Video": 5000000,
        "Livestream 2h": 8000000,
        "Event Appearance": 10000000,
        "Catwalk Show": 15000000
      },
      availabilityCalendar: ["2026-06-24", "2026-06-25", "2026-06-28"],
      reliability: 96,
      reviewsCount: 18,
      averageRating: 4.9,
      surveyScores: { pageant: 50, runway: 45, kol: 95 },
      skillsScores: {
        catwalk: 85,
        pose: 90,
        mc: 75,
        livestream: 80,
        acting: 70,
        social: 95,
        safety: 90,
        reliability: 96
      },
      mainCategory: "KOL / Người mẫu ảnh / Giải trí thế hệ mới",
      verifiedLevel: "Elite",
      isAvailable: true,
      isSuperBoosted: false,
      isPremiumBoosted: false,
      photos: [
        "/fullbody_model.png",
        "/cover_image.png",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600"
      ],
      hasUploadedCatwalk: true,
      hasUploadedIntro: true,
      hasUploadedMC: true
    };

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.avatar?.includes("unsplash.com") || !parsed.avatar)) {
          parsed.avatar = "/avatar.png";
        }
        if (parsed) {
          if (!parsed.skillsScores) parsed.skillsScores = defaultMock.skillsScores;
          if (!parsed.followersCount || parsed.followersCount === 120000) parsed.followersCount = 520000;
          if (parsed.isAvailable === undefined) parsed.isAvailable = true;
          if (!parsed.verifiedLevel) parsed.verifiedLevel = "Elite";
          if (!parsed.rateCard["Event Appearance"]) parsed.rateCard["Event Appearance"] = 10000000;
          if (!parsed.photos) parsed.photos = defaultMock.photos;
          if (parsed.hasUploadedCatwalk === undefined) parsed.hasUploadedCatwalk = true;
          if (parsed.hasUploadedIntro === undefined) parsed.hasUploadedIntro = true;
          if (parsed.hasUploadedMC === undefined) parsed.hasUploadedMC = true;
        }
        localStorage.setItem("vnp_talent_profile", JSON.stringify(parsed));
        setProfile(parsed);
      } catch (e) {
        console.error(e);
        setProfile(defaultMock);
      }
    } else {
      localStorage.setItem("vnp_talent_profile", JSON.stringify(defaultMock));
      setProfile(defaultMock);
    }
  }, []);

  if (!profile) return null;

  // Social Badge computation
  const getSocialBadge = (count: number) => {
    if (count >= 1000000) return { text: "👑 Celebrity", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    if (count >= 500000) return { text: "💎 Star", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" };
    if (count >= 100000) return { text: "🥇 Influencer", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
    if (count >= 10000) return { text: "🥈 Rising", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
    return { text: "🥉 Micro", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" };
  };

  const socialBadge = getSocialBadge(profile.followersCount || 120000);

  // Search ranking score calculation
  const getBoostLevel = (p: any) => {
    if (p.isSuperBoosted) return 5;
    if (p.isPremiumBoosted) return 4;
    return 0;
  };

  const currentBoostLevel = getBoostLevel(profile);
  const rankingScore = Math.round((currentBoostLevel * 100) + (profile.profileScore || 82) * 0.5 + 95 * 0.3 + (profile.averageRating || 4.9) * 2);

  // Handler for booking form submit preview
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(`Đề xuất Booking từ Brand ${bookingForm.brandName || "Ẩn danh"} đã được gửi thành công!`, "success");
    setShowBookModal(false);
    setBookingForm({ brandName: "", jobType: "Instagram Post", date: "", budget: "", note: "" });
  };

  // Handler for chat send preview
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatHistory(prev => [...prev, { sender: "talent", text: chatMessage }]);
    const currentMsg = chatMessage;
    setChatMessage("");
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: "brand", text: `Cảm ơn bạn đã phản hồi: "${currentMsg}". Bên mình sẽ check lại budget và liên hệ lại nha.` }]);
    }, 1500);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">

      {/* Cover Banner Header - Dynamic & Responsive */}
      <div className="relative rounded-2xl border border-[#151b2d] bg-[#08090f] p-3 md:p-5 shadow-xl overflow-hidden">

        {/* Cover Background */}
        {profile.isSuperBoosted ? (
          <div className="h-28 sm:h-36 md:h-48 w-full rounded-xl relative overflow-hidden border border-amber-400/40 bg-gradient-to-r from-slate-950 via-[#2d220f] to-slate-950 animate-pulse">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.18),transparent_60%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display font-black text-amber-300/40 tracking-[0.25em] md:tracking-[0.35em] text-xs sm:text-lg md:text-3xl uppercase">FEATURED SUPER MODEL</span>
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-amber-400 text-slate-950 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              <Crown className="h-3 w-3 animate-pulse" /> SUPER BOOSTED
            </div>
          </div>
        ) : (
          <div className="h-28 sm:h-36 md:h-48 w-full rounded-xl relative overflow-hidden border border-white/5 bg-slate-950">
            <img
              src="/cover_image.png"
              alt="Cover banner"
              className="h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
          </div>
        )}

        {/* Profile Info Row */}
        <div className="relative px-3 sm:px-6 pt-3 flex flex-col md:flex-row gap-4 md:items-end justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">

            {/* Avatar block */}
            <div className={cn(
              "relative -mt-12 sm:-mt-16 md:-mt-20 h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-full border-4 bg-slate-900 p-0.5 shadow-2xl transition-all duration-300",
              (profile.isSuperBoosted || profile.isPremiumBoosted)
                ? "border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                : "border-[#08090f]"
            )}>
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-full w-full rounded-full object-cover"
              />
              <span className={cn(
                "absolute bottom-1 right-1 h-4 w-4 border-2 border-[#08090f] rounded-full",
                profile.isAvailable ? "bg-emerald-500" : "bg-red-500"
              )} />

              {(profile.isSuperBoosted || profile.isPremiumBoosted) && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-gradient-to-r from-red-500 to-amber-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full shadow-[0_2px_8px_rgba(239,68,68,0.4)] animate-bounce" style={{ animationDuration: '2s' }}>
                  🔥 HOT
                </span>
              )}
            </div>

            <div className="space-y-2 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display font-black text-white text-lg sm:text-xl md:text-2xl tracking-wide">{profile.name}</h2>

                {/* Social Followers Class Badge */}
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border", socialBadge.color)}>
                  {socialBadge.text}
                </span>

                {/* Verified Badge */}
                {profile.verifiedLevel === "Elite" && (
                  <span className="flex items-center gap-0.5 rounded bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 text-[8px] font-black text-amber-400 uppercase tracking-wider shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                    <Crown className="h-2.5 w-2.5" /> Elite Verified
                  </span>
                )}
                {profile.verifiedLevel === "Pro" && (
                  <span className="flex items-center gap-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[8px] font-black text-cyan-400 uppercase tracking-wider">
                    <ShieldCheck className="h-2.5 w-2.5" /> Pro Verified
                  </span>
                )}
                {profile.verifiedLevel === "Basic" && (
                  <span className="flex items-center gap-0.5 rounded bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[8px] font-black text-blue-400 uppercase tracking-wider">
                    <ShieldCheck className="h-2.5 w-2.5" /> Basic Verified
                  </span>
                )}
                {profile.verifiedLevel === "Agency" && (
                  <span className="flex items-center gap-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[8px] font-black text-emerald-400 uppercase tracking-wider">
                    <ShieldCheck className="h-2.5 w-2.5" /> Agency Verified
                  </span>
                )}
              </div>

              {/* Location & Availability Badge */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" /> {profile.location}
                </span>
                <span className="text-slate-600">•</span>
                <span>KOL Beauty • MC • Event Guest</span>
                <span className="text-slate-600">•</span>
                <span className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                  profile.isAvailable
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                    : "bg-red-500/10 border-red-500/25 text-red-400"
                )}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", profile.isAvailable ? "bg-emerald-400" : "bg-red-400")} />
                  {profile.isAvailable ? "Đang Rảnh (Lịch trống tuần này)" : "Đang Bận"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Area: Model Tier Card & Share Button */}
          <div className="flex items-center gap-3 pb-1 relative z-10 shrink-0">
            {/* Model Tier Card */}
            {profile.tier && (() => {
              const tier = profile.tier.toUpperCase();
              if (tier === "S") {
                return (
                  <div className="relative overflow-hidden rounded-2xl border border-amber-400/80 bg-gradient-to-br from-amber-500/20 via-[#221a0a]/95 to-[#070913]/98 p-3 text-left shadow-[0_0_15px_rgba(245,158,11,0.15)] w-64 md:w-72 transition-all duration-300">
                    <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-amber-500/15 blur-lg pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <Crown className="h-3.5 w-3.5 text-amber-400 fill-amber-400/10 animate-bounce" style={{ animationDuration: '3s' }} />
                        <span className="text-[7px] font-black uppercase tracking-widest text-amber-400">
                          CELEB / SUPER VIP
                        </span>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-amber-300 border border-amber-400/30">
                        90 - 100 ĐIỂM
                      </span>
                    </div>
                    <span className="block text-base font-black tracking-wide font-display bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                      HẠNG S
                    </span>
                    <p className="mt-0.5 text-[9px] text-slate-300 leading-normal">
                      Hoa hậu Quốc gia, Ngôi sao hạng S.
                    </p>
                  </div>
                );
              }
              if (tier === "A") {
                return (
                  <div className="relative overflow-hidden rounded-2xl border border-slate-300/60 bg-gradient-to-br from-slate-400/10 via-[#171922]/90 to-[#070913]/95 p-3 text-left shadow-[0_0_15px_rgba(203,213,225,0.06)] w-64 md:w-72 transition-all duration-300">
                    <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-slate-400/10 blur-lg pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5 text-slate-300" />
                        <span className="text-[7px] font-black uppercase tracking-widest text-slate-300">
                          HIGH-END PRO
                        </span>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-slate-400/20 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-slate-200 border border-slate-400/30">
                        70 - 89 ĐIỂM
                      </span>
                    </div>
                    <span className="block text-base font-black tracking-wide font-display bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400 bg-clip-text text-transparent">
                      HẠNG A
                    </span>
                    <p className="mt-0.5 text-[9px] text-slate-300 leading-normal">
                      Á hậu, Hoa khôi lớn, Siêu mẫu Runway chuyên nghiệp, MC VIP.
                    </p>
                  </div>
                );
              }
              if (tier === "B") {
                return (
                  <div className="relative overflow-hidden rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-[#1a1128]/90 to-[#070913]/95 p-3 text-left shadow-[0_0_15px_rgba(168,85,247,0.06)] w-64 md:w-72 transition-all duration-300">
                    <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-purple-500/10 blur-lg pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-purple-400" />
                        <span className="text-[7px] font-black uppercase tracking-widest text-purple-400">
                          MID FREELANCE
                        </span>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-purple-500/20 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-purple-300 border border-purple-500/30">
                        45 - 69 ĐIỂM
                      </span>
                    </div>
                    <span className="block text-base font-black tracking-wide font-display bg-gradient-to-r from-purple-200 to-pink-500 bg-clip-text text-transparent">
                      HẠNG B
                    </span>
                    <p className="mt-0.5 text-[9px] text-slate-300 leading-normal">
                      Người mẫu ảnh Lookbook, Micro/Mid-tier KOLs, PG VIP sự kiện cao cấp.
                    </p>
                  </div>
                );
              }
              if (tier === "C") {
                return (
                  <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-[#0e1f1e]/90 to-[#070913]/95 p-3 text-left shadow-[0_0_15px_rgba(20,184,166,0.06)] w-64 md:w-72 transition-all duration-300">
                    <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-teal-500/10 blur-lg pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-teal-400" />
                        <span className="text-[7px] font-black uppercase tracking-widest text-teal-400">
                          ENTRY / NEWBIE
                        </span>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-teal-500/20 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-teal-300 border border-teal-500/30">
                        20 - 44 ĐIỂM
                      </span>
                    </div>
                    <span className="block text-base font-black tracking-wide font-display bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent">
                      HẠNG C
                    </span>
                    <p className="mt-0.5 text-[9px] text-slate-300 leading-normal">
                      Người mẫu tự do mới vào nghề, diễn viên phụ, PG sự kiện đại trà.
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            {/* Share Button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                addToast("Đã sao chép link hồ sơ cá nhân!", "success");
              }}
              className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center shrink-0 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Chia sẻ profile"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 3 Tab Navigation */}
      <div className="flex border-b border-[#151b2d] gap-6 overflow-x-auto scrollbar-none whitespace-nowrap">
        <button
          onClick={() => setActiveTab("personal-info")}
          className={cn(
            "pb-4 text-xs font-black uppercase tracking-wider transition-all relative cursor-pointer flex items-center gap-1.5 shrink-0",
            activeTab === "personal-info" ? "text-amber-400" : "text-slate-400 hover:text-white"
          )}
        >
          <User className="h-4 w-4" />
          1. Thông tin cá nhân
          {activeTab === "personal-info" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("edit-info")}
          className={cn(
            "pb-4 text-xs font-black uppercase tracking-wider transition-all relative cursor-pointer flex items-center gap-1.5 shrink-0",
            activeTab === "edit-info" ? "text-[#f4c430]" : "text-slate-400 hover:text-white"
          )}
        >
          <Edit3 className="h-4 w-4" />
          2. Cập nhật thông tin
          {activeTab === "edit-info" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f4c430] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("addon-services")}
          className={cn(
            "pb-4 text-xs font-black uppercase tracking-wider transition-all relative cursor-pointer flex items-center gap-1.5 shrink-0",
            activeTab === "addon-services" ? "text-purple-400" : "text-slate-400 hover:text-white"
          )}
        >
          <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
          3. Chợ dịch vụ bổ trợ
          {activeTab === "addon-services" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Main Content Area based on Tab */}
      <div>
        {activeTab === "personal-info" && (
          <PersonalInfoTab
            profile={profile}
            setProfile={setProfile}
            addToast={addToast}
            setShowBookModal={setShowBookModal}
            setBookingForm={setBookingForm}
          />
        )}

        {activeTab === "edit-info" && (
          <EditInfoTab
            profile={profile}
            setProfile={setProfile}
            addToast={addToast}
          />
        )}

        {activeTab === "addon-services" && (
          <AddonServicesTab
            profile={profile}
            setProfile={setProfile}
            addToast={addToast}
            rankingScore={rankingScore}
          />
        )}
      </div>

      {/* Floating Toast Notification System */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "glass-panel border-l-4 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 min-w-[280px] max-w-[400px] bg-[#0c0d14]/90 backdrop-blur-md border border-white/5",
              toast.type === "success" ? "border-l-emerald-500" : "border-l-amber-500"
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            ) : (
              <Sparkles className="h-4.5 w-4.5 text-amber-400 shrink-0" />
            )}
            <p className="text-xs font-semibold text-white leading-snug">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* MODAL 1: BRAND BOOKING PREVIEW */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-4 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowBookModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1 text-xs">
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-amber-400" /> Book Talent (Nhãn Hàng Đặt Lịch)
              </h3>
              <p className="text-[10px] text-slate-400 leading-normal">
                Xem trước giao diện Form Đăng Ký Book gửi đề xuất công việc tới <strong>{profile.name}</strong>.
              </p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[9px]">Tên Thương Hiệu/Nhãn Hàng</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: L'Oréal Paris, Gucci Beauty..."
                  value={bookingForm.brandName}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, brandName: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[9px]">Loại Hình Công Việc</label>
                  <select
                    value={bookingForm.jobType}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, jobType: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
                  >
                    <option value="Instagram Post">Instagram Post</option>
                    <option value="TikTok Video">TikTok Video</option>
                    <option value="Livestream 2h">Livestream 2h</option>
                    <option value="Event Appearance">Event Appearance</option>
                    <option value="Catwalk Show">Catwalk Show</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[9px]">Ngày Diễn Ra (June)</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[9px]">Budget Đề Xuất (VND)</label>
                <input
                  type="number"
                  placeholder="Ví dụ: 8000000"
                  value={bookingForm.budget}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[9px]">Brief & Yêu Cầu Chi Tiết</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả công việc, quyền lợi và yêu cầu trang phục, concept..."
                  value={bookingForm.note}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="flex-1 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 text-slate-950 font-black uppercase tracking-wider hover:brightness-105 active:scale-98 transition-all cursor-pointer"
                >
                  Gửi Yêu Cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BRAND MESSAGING PREVIEW */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-4 shadow-2xl flex flex-col h-[500px]">
            <button
              type="button"
              onClick={() => setShowMessageModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1 shrink-0 border-b border-[#151b2d] pb-3 text-xs">
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-cyan-400" /> Nhắn Tin Trực Tiếp (Brand Chat Room)
              </h3>
              <p className="text-[10px] text-slate-400">
                Thảo luận về hợp đồng và thỏa thuận giá rate trực tiếp.
              </p>
            </div>

            {/* Chat message logs */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2 custom-scrollbar text-xs">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={cn("flex flex-col max-w-[80%] rounded-xl p-3",
                  chat.sender === "brand"
                    ? "self-start bg-slate-950 border border-white/5 text-slate-300"
                    : "self-end bg-[#f4c430]/10 border border-[#f4c430]/20 text-[#f4c430] ml-auto"
                )}>
                  <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">
                    {chat.sender === "brand" ? "L'Oréal Brand Manager" : "Nguyễn Mai Anh"}
                  </span>
                  <span className="leading-relaxed">{chat.text}</span>
                </div>
              ))}
            </div>

            {/* Input field */}
            <form onSubmit={handleSendChat} className="flex gap-2 shrink-0 pt-3 border-t border-[#151b2d]">
              <input
                type="text"
                placeholder="Nhập tin nhắn phản hồi..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <button
                type="submit"
                className="h-8 px-4 rounded-xl bg-cyan-500 text-slate-950 font-black uppercase text-[10px] tracking-wider hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              >
                Gửi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
