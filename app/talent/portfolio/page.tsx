"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin, User, Edit3, Sparkles,
  CheckCircle, Camera, Mail, Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import PersonalInfoTab from "./PersonalInfoTab";
import EditInfoTab from "./EditInfoTab";
import AddonServicesTab from "./AddonServicesTab";
import ProgressBar from "@/components/ui/ProgressBar";
import { createInitialAvatarDataUrl, normalizeBackendAssetUrl } from "@/lib/avatar";
import { ensureTalentProfile, loadTalentProfile, persistTalentProfile, TALENT_PROFILE_UPDATED_EVENT, uploadTalentPhoto } from "@/lib/talent-api";

export default function PortfolioPage() {
  const [profile, setProfile] = useState<any>(null);

  // Four main tabs: 'personal-info', 'edit-info', 'addon-services', 'portrait-3d'
  const [activeTab, setActiveTab] = useState<"edit-info" | "personal-info" | "addon-services" | "portrait-3d">("personal-info");

  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "info" }[]>([]);

  const [uploadingState, setUploadingState] = useState<{
    [key: string]: {
      progress: number;
      fileName: string;
      status: "uploading" | "done" | "error" | "idle";
    };
  }>({});

  const addToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const defaultProfile = {
      name: "Talent",
      birthYear: undefined,
      location: "",
      hometown: "",
      phone: "",
      email: "",
      avatar: createInitialAvatarDataUrl("Talent", ""),
      height: undefined,
      weight: undefined,
      bust: undefined,
      waist: undefined,
      hips: undefined,
      plasticSurgery: undefined,
      maritalStatus: "",
      education: "",
      languages: [],
      skills: [],
      followersCount: 0,
      engagementRate: 0,
      profileScore: 0,
      tier: "",
      rateCard: {
        "Instagram Post": "",
        "TikTok Video": "",
        "Livestream 2h": "",
        "Event Appearance": "",
        "Catwalk Show": ""
      },
      availabilityCalendar: [],
      reliability: 0,
      reviewsCount: 0,
      averageRating: 0,
      surveyScores: { pageant: 0, runway: 0, kol: 0 },
      skillsScores: {
        catwalk: 0,
        pose: 0,
        mc: 0,
        livestream: 0,
        acting: 0,
        social: 0,
        safety: 0,
        reliability: 0
      },
      mainCategory: "",
      verifiedLevel: "",
      isAvailable: true,
      isSuperBoosted: false,
      isPremiumBoosted: false,
      photos: [],
      hasUploadedCatwalk: false,
      hasUploadedIntro: false,
      hasUploadedMC: false,
      lifestyleServices: []
    };

    void loadTalentProfile().then((loadedProfile) => {
      const nextProfile = {
        ...defaultProfile,
        ...loadedProfile,
        skillsScores: loadedProfile?.skillsScores || defaultProfile.skillsScores,
        followersCount: loadedProfile?.followersCount ?? defaultProfile.followersCount,
        isAvailable: loadedProfile?.isAvailable ?? true,
        verifiedLevel: loadedProfile?.verifiedLevel || "",
        rateCard: {
          ...defaultProfile.rateCard,
          ...(loadedProfile?.rateCard || {}),
        },
        photos: loadedProfile?.photos?.length ? loadedProfile.photos : [],
        hasUploadedCatwalk: loadedProfile?.hasUploadedCatwalk ?? false,
        hasUploadedIntro: loadedProfile?.hasUploadedIntro ?? false,
        hasUploadedMC: loadedProfile?.hasUploadedMC ?? false,
        lifestyleServices: loadedProfile?.lifestyleServices?.length
          ? loadedProfile.lifestyleServices
          : [],
      };

      if (!nextProfile.avatar) {
        nextProfile.avatar = createInitialAvatarDataUrl(nextProfile.name, nextProfile.email);
      }

      setProfile(persistTalentProfile(nextProfile));
    });
  }, []);

  useEffect(() => {
    const handleProfileUpdated = (event: Event) => {
      const nextProfile = (event as CustomEvent).detail;
      if (nextProfile) setProfile(nextProfile);
    };

    window.addEventListener(TALENT_PROFILE_UPDATED_EVENT, handleProfileUpdated as EventListener);
    return () => {
      window.removeEventListener(TALENT_PROFILE_UPDATED_EVENT, handleProfileUpdated as EventListener);
    };
  }, []);

  if (!profile) return null;

  // Search ranking score calculation
  const getBoostLevel = (p: any) => {
    if (p.isSuperBoosted) return 5;
    if (p.isPremiumBoosted) return 4;
    return 0;
  };

  const currentBoostLevel = getBoostLevel(profile);
  const rankingScore = Math.round((currentBoostLevel * 100) + (Number(profile.profileScore) || 0) * 0.5 + (Number(profile.reliability) || 0) * 0.3 + (Number(profile.averageRating) || 0) * 2);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover") => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setProfile((current: any) => ({ ...current, [type]: previewUrl }));

    setUploadingState(prev => ({
      ...prev,
      [type]: {
        progress: 0,
        fileName: file.name,
        status: "uploading"
      }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 8;
      if (progress > 95) progress = 95;
      setUploadingState(prev => {
        if (!prev[type]) return prev;
        return {
          ...prev,
          [type]: {
            ...prev[type],
            progress
          }
        };
      });
    }, 150);

    try {
      const syncedProfile = await ensureTalentProfile(profile);

      if (!syncedProfile.backendProfileId) {
        clearInterval(interval);
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
        setProfile(syncedProfile);
        addToast("Vui lòng đăng nhập lại để tải ảnh lên hệ thống.", "info");
        return;
      }

      const photo = await uploadTalentPhoto(syncedProfile.backendProfileId, file, type);
      const photoUrl = photo.url || photo.path;

      if (!photoUrl) {
        clearInterval(interval);
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
        addToast("Đăng tải thành công nhưng backend chưa trả về đường dẫn ảnh.", "info");
        return;
      }

      const updatedProfile = persistTalentProfile({ ...syncedProfile, ...profile, [type]: photoUrl });
      setProfile(updatedProfile);
      URL.revokeObjectURL(previewUrl);

      clearInterval(interval);
      setUploadingState(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          progress: 100,
          status: "done"
        }
      }));

      setTimeout(() => {
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
      }, 800);

      addToast(`Cập nhật ${type === "avatar" ? "ảnh đại diện" : "ảnh bìa"} thành công!`, "success");
    } catch (error) {
      clearInterval(interval);
      setUploadingState(prev => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không tải được ảnh lên backend. Kiểm tra lại API/storage.", "info");
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">

      {/* Cover Banner Header - Dynamic & Responsive */}
      <div className="relative rounded-[32px] border border-white/5 bg-[#05070e]/85 backdrop-blur-md p-4 md:p-6 shadow-soft overflow-hidden">

        {/* Cover Background */}
        <div className="h-56 sm:h-64 md:h-72 w-full rounded-2xl relative overflow-hidden border border-white/5 bg-[#05070e] group shadow-inner">
          {/* Cover image */}
          {normalizeBackendAssetUrl(profile.cover) ? (
            <img
              src={normalizeBackendAssetUrl(profile.cover)}
              alt="Cover banner"
              className="h-full w-full object-cover filter brightness-[0.7] transition-transform duration-500 group-hover:scale-[1.01]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-700 bg-gradient-to-br from-slate-950 to-slate-900">
              <Camera className="h-10 w-10 text-slate-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Chưa có ảnh bìa</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070e] via-black/20 to-black/40" />



          {/* Cover camera edit button in bottom-right corner */}
          <div className="absolute bottom-3 right-6 z-20">
            <label className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 hover:bg-slate-950 border border-white/10 hover:border-[#F0C56B]/80 text-white hover:text-[#F0C56B] cursor-pointer shadow-soft transition-all active:scale-95">
              <Camera className="h-4.5 w-4.5" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!!uploadingState["cover"]}
                onChange={(e) => handleImageUpload(e, "cover")}
              />
            </label>
          </div>

          {uploadingState["cover"] && (
            <ProgressBar
              progress={uploadingState["cover"].progress}
              message="Đang tải ảnh bìa lên..."
            />
          )}
        </div>

        {/* Profile Info & Centered Details */}
        <div className="relative px-3 sm:px-6 pt-3 flex flex-col items-center text-center">
          
          {/* Avatar block */}
          <div className="relative -mt-16 sm:-mt-20 md:-mt-24">
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-gradient-gold p-[3.5px] shadow-[0_0_25px_rgba(240,197,107,0.45)] relative">
              <img
                src={normalizeBackendAssetUrl(profile.avatar)}
                alt={profile.name}
                onError={(event) => {
                  event.currentTarget.src = createInitialAvatarDataUrl(profile.name, profile.email);
                }}
                className="h-full w-full rounded-full object-cover border border-black/10"
              />
            </div>

            {/* Avatar camera edit button on bottom right */}
            <label className="absolute bottom-0.5 right-0.5 h-9 w-9 bg-[#F0C56B] text-slate-950 rounded-full border-2 border-[#05070e] hover:brightness-110 active:scale-95 shadow-lg flex items-center justify-center cursor-pointer transition-all">
              <Camera className="h-4.5 w-4.5" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!!uploadingState["avatar"]}
                onChange={(e) => handleImageUpload(e, "avatar")}
              />
            </label>

            {uploadingState["avatar"] && (
              <ProgressBar
                progress={uploadingState["avatar"].progress}
                message="Tải ảnh..."
                className="rounded-full absolute inset-0.5"
              />
            )}

            <span className={cn(
              "absolute bottom-2.5 left-2.5 h-4 w-4 border-2 border-[#05070e] rounded-full z-10",
              profile.isAvailable ? "bg-emerald-500" : "bg-red-500"
            )} />
          </div>

          {/* Details */}
          <div className="mt-4 space-y-2.5 max-w-2xl">
            <h2 className="font-display font-black text-white text-2xl sm:text-3xl tracking-wide uppercase leading-tight">
              {profile.name}
            </h2>

            {/* Categories formatted as "NGƯỜI MẪU THỜI TRANG · KOL · MC" */}
            <p className="text-xs sm:text-[13px] font-black uppercase text-slate-400 tracking-widest">
              {profile.isOnboarded ? "Người mẫu Thời trang · KOL · MC" : "Tài năng mới"}
            </p>

            {/* Location */}
            <div className="flex items-center justify-center gap-1.5 text-slate-500 font-bold text-[11px] sm:text-xs">
              <MapPin className="h-4 w-4 text-[#F0C56B]" />
              <span>{profile.isOnboarded ? `${profile.location}, Việt Nam` : "Chưa cập nhật"}</span>
            </div>

            {/* Email & Phone Contacts */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] sm:text-xs font-bold text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-[#F0C56B]" />
                <span className="text-slate-300 font-medium">{profile.email || "Chưa cập nhật"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-[#F0C56B]" />
                <span className="text-slate-300 font-medium font-mono">{profile.phone || "Chưa cập nhật"}</span>
              </div>
            </div>

            {/* Badges: VERIFIED TALENT & ELITE */}
            <div className="flex items-center justify-center gap-2 pt-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F0C56B] px-3.5 py-1.5 text-[9.5px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                ★ VERIFIED TALENT
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#F0C56B] bg-[#F0C56B]/5 px-3.5 py-1.5 text-[9.5px] font-black uppercase tracking-wider text-[#F0C56B] shadow-sm">
                ELITE
              </span>
            </div>

            {/* Tier Info inside details (collapsible/responsive) */}
            <div className="pt-4 flex justify-center">
              {/* Model Tier Card (Clean, simplified version or full card centered) */}
              {profile.isOnboarded && profile.tier && (() => {
                const tier = profile.tier.toUpperCase();
                let tierText = "";
                let tierLabel = "";
                let tierColor = "";
                let tierBadge = "";
                let scoreText = "";

                if (tier === "S") {
                  tierText = "HẠNG S";
                  tierLabel = "CELEB / SUPER VIP";
                  tierColor = "border-amber-400/50 bg-amber-500/5 text-amber-400";
                  tierBadge = "90 - 100 ĐIỂM";
                  scoreText = "Hoa hậu Quốc gia, Ngôi sao hạng S.";
                } else if (tier === "A") {
                  tierText = "HẠNG A";
                  tierLabel = "HIGH-END PRO";
                  tierColor = "border-slate-300/40 bg-slate-400/5 text-slate-300";
                  tierBadge = "70 - 89 ĐIỂM";
                  scoreText = "Á hậu, Hoa khôi lớn, Siêu mẫu Runway chuyên nghiệp, MC VIP.";
                } else if (tier === "B") {
                  tierText = "HẠNG B";
                  tierLabel = "MID FREELANCE";
                  tierColor = "border-purple-500/40 bg-purple-500/5 text-purple-400";
                  tierBadge = "45 - 69 ĐIỂM";
                  scoreText = "Người mẫu ảnh Lookbook, Micro/Mid-tier KOLs, PG VIP sự kiện cao cấp.";
                } else if (tier === "C") {
                  tierText = "HẠNG C";
                  tierLabel = "ENTRY / NEWBIE";
                  tierColor = "border-teal-500/30 bg-teal-500/5 text-teal-400";
                  tierBadge = "20 - 44 ĐIỂM";
                  scoreText = "Người mẫu tự do mới vào nghề, diễn viên phụ, PG sự kiện đại trà.";
                }

                return (
                  <div className={cn("relative overflow-hidden rounded-2xl border p-3.5 text-left max-w-sm w-full md:w-64 backdrop-blur-md shadow-soft", tierColor)}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[7.5px] font-black uppercase tracking-widest">{tierLabel}</span>
                      <span className="text-[7.5px] font-black uppercase tracking-wider bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full">{tierBadge}</span>
                    </div>
                    <span className="block text-[15px] font-black tracking-wide font-display">{tierText}</span>
                    <p className="mt-1 text-[9.5px] leading-relaxed opacity-80">{scoreText}</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Main 3 Tab Navigation – responsive grid, no horizontal scroll */}
      <div className="grid grid-cols-3 border-b border-[#151b2d]">
        <button
          onClick={() => setActiveTab("personal-info")}
          className={cn(
            "py-3 px-1 text-[10px] sm:text-xs font-black uppercase tracking-wide transition-all relative cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-center",
            activeTab === "personal-info" ? "text-amber-400" : "text-slate-400 hover:text-white"
          )}
        >
          <User className="h-4 w-4 shrink-0" />
          <span className="leading-tight">Thông tin</span>
          {activeTab === "personal-info" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("edit-info")}
          className={cn(
            "py-3 px-1 text-[10px] sm:text-xs font-black uppercase tracking-wide transition-all relative cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-center border-x border-[#151b2d]",
            activeTab === "edit-info" ? "text-[#f4c430]" : "text-slate-400 hover:text-white"
          )}
        >
          <Edit3 className="h-4 w-4 shrink-0" />
          <span className="leading-tight">Cập nhật</span>
          {activeTab === "edit-info" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f4c430] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("addon-services")}
          className={cn(
            "py-3 px-1 text-[10px] sm:text-xs font-black uppercase tracking-wide transition-all relative cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-center",
            activeTab === "addon-services" ? "text-purple-400" : "text-slate-400 hover:text-white"
          )}
        >
          <Sparkles className="h-4 w-4 shrink-0 text-purple-400 animate-pulse" />
          <span className="leading-tight">Dịch vụ</span>
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

    </div>
  );
}
