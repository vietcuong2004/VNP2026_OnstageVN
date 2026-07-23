"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin, User, Edit3, Sparkles,
  CheckCircle, Camera, Mail, Phone, X,
  Crown, Trophy, Star, Award, HelpCircle, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import PersonalInfoTab from "./PersonalInfoTab";
import EditInfoTab from "./EditInfoTab";
import AddonServicesTab from "./AddonServicesTab";
import ProgressBar from "@/components/ui/ProgressBar";
import TierExplanationDialog from "@/components/ui/TierExplanationDialog";
import { createInitialAvatarDataUrl, normalizeBackendAssetUrl } from "@/lib/avatar";
import { getAuthToken } from "@/lib/api-client";
import { ensureTalentProfile, loadTalentProfile, persistTalentProfile, TALENT_PROFILE_UPDATED_EVENT, uploadTalentPhoto } from "@/lib/talent-api";

function getProfileTalentTypes(profile: unknown) {
  const record = profile && typeof profile === "object" ? profile as Record<string, unknown> : {};
  const candidates = [record.talentTypes, record.talent_types, record.specialSkills, record.skills];

  for (const value of candidates) {
    if (Array.isArray(value) && value.length) {
      return value.map((type) => String(type).trim()).filter(Boolean);
    }
  }

  if (typeof record.mainCategory === "string" && record.mainCategory.trim()) {
    return [record.mainCategory.trim()];
  }

  return [];
}

export default function PortfolioPage() {
  const [profile, setProfile] = useState<any>(null);

  // Four main tabs: 'personal-info', 'edit-info', 'addon-services', 'portrait-3d'
  const [activeTab, setActiveTab] = useState<"edit-info" | "personal-info" | "addon-services" | "portrait-3d">("personal-info");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isTierDialogOpen, setIsTierDialogOpen] = useState(false);

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
      name: "",
      birthYear: undefined,
      location: "",
      hometown: "",
      phone: "",
      email: "",
      avatar: "",
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
      lifestyleServices: [],
      portfolio_url: ""
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
  const profileTalentTypes = getProfileTalentTypes(profile);

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
      if (!getAuthToken()) {
        const photoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });

        const updatedProfile = persistTalentProfile({ ...profile, [type]: photoUrl });
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

        addToast("Đã lưu ảnh vào bản nháp trên trình duyệt. Đăng nhập để đồng bộ lên hệ thống.", "info");
        return;
      }

      const syncedProfile = await ensureTalentProfile(profile);
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
              className="h-full w-full object-cover filter brightness-[0.7] transition-transform duration-500 group-hover:scale-[1.01] cursor-pointer"
              onClick={() => setPreviewImage(normalizeBackendAssetUrl(profile.cover))}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-700 bg-gradient-to-br from-slate-950 to-slate-900">
              <Camera className="h-10 w-10 text-slate-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Chưa có ảnh bìa</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070e] via-black/20 to-black/40 pointer-events-none" />



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
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-start px-3 sm:px-6 gap-6 mt-6 z-20 w-full text-left">
          
          {/* Left Column: Avatar + Details (Name, Category, Location, Contacts) */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left w-full">
              
              {/* Avatar block */}
              <div className="relative shrink-0">
                <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-gradient-gold p-[3.5px] shadow-[0_0_25px_rgba(240,197,107,0.45)] relative">
                  <img
                    src={normalizeBackendAssetUrl(profile.avatar) || createInitialAvatarDataUrl("Khách truy cập", profile.email)}
                    alt={profile.name || "Khách truy cập"}
                    onError={(event) => {
                      event.currentTarget.src = createInitialAvatarDataUrl(profile.name || "Khách truy cập", profile.email);
                    }}
                    className="h-full w-full rounded-full object-cover border border-black/10 cursor-pointer"
                    onClick={() => normalizeBackendAssetUrl(profile.avatar) && setPreviewImage(normalizeBackendAssetUrl(profile.avatar))}
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
              </div>

              {/* Details stack next to Avatar */}
              <div className="space-y-2.5 flex-1 min-w-0 w-full">
                <h2 className="font-display font-black text-white text-2xl sm:text-3xl tracking-wide uppercase leading-tight text-center sm:text-left">
                  <span>{profile.name || "Chưa cập nhật"}</span>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold shadow-md select-none ml-2 align-middle" title="Đã xác minh">
                    ✓
                  </span>
                </h2>
                
                <div className="flex flex-wrap justify-center items-center gap-1.5 sm:justify-start">
                  {profileTalentTypes.length ? (
                    profileTalentTypes.map((type) => (
                      <span key={type} className="inline-flex rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
                      Tài năng mới
                    </span>
                  )}

                  {/* Tier Badge inside the same row */}
                  {profile.isOnboarded && profile.tier && (() => {
                    const tier = profile.tier.toUpperCase();
                    let tierColor = "";
                    let IconComponent = HelpCircle;

                    if (tier === "S") {
                      IconComponent = Crown;
                      tierColor = "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
                    } else if (tier === "A") {
                      IconComponent = Trophy;
                      tierColor = "border-slate-400/30 bg-slate-400/10 text-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.08)]";
                    } else if (tier === "B") {
                      IconComponent = Star;
                      tierColor = "border-purple-500/30 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.08)]";
                    } else if (tier === "C") {
                      IconComponent = Award;
                      tierColor = "border-teal-500/30 bg-teal-500/10 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.08)]";
                    }

                    return (
                      <button
                        type="button"
                        onClick={() => setIsTierDialogOpen(true)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-black tracking-wider uppercase transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-98 cursor-pointer shadow-md select-none",
                          tierColor
                        )}
                        title="Xem chi tiết phân hạng"
                      >
                        <IconComponent className="h-3 w-3 shrink-0" />
                        <span>Tier {tier}</span>
                        <span className="ml-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-[8px] font-black transition-colors">
                          ?
                        </span>
                      </button>
                    );
                  })()}
                </div>
                
                {/* Location, Email & Phone Contacts Row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-1.5 text-[11px] sm:text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#F0C56B]" />
                    <span className="text-slate-300 font-medium">{profile.location || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-[#F0C56B]" />
                    <span className="text-slate-300 font-medium">{profile.email || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-[#F0C56B]" />
                    <span className="text-slate-300 font-medium font-mono">{profile.phone || "Chưa cập nhật"}</span>
                  </div>
                </div>

                {/* Bio (Description) Row */}
                <div className="text-[11px] sm:text-xs text-slate-400 font-medium leading-relaxed pt-2.5 border-t border-white/5 mt-1 text-center sm:text-left">
                  {profile.bio || "Chưa cập nhật giới thiệu bản thân."}
                </div>

                {/* Portfolio URL Button */}
                {profile.portfolio_url && (
                  <div className="pt-3 flex justify-center">
                    <a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 hover:brightness-110 rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(240,197,107,0.2)] hover:scale-[1.02] active:scale-98 transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 shrink-0 text-slate-950" />
                      Xem Portfolio
                    </a>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right Column (Placeholder or empty) */}
          <div className="shrink-0 lg:pb-2 w-full lg:w-auto flex justify-center lg:justify-end" />
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
            onPreviewImage={setPreviewImage}
          />
        )}

        {activeTab === "edit-info" && (
          <EditInfoTab
            profile={profile}
            setProfile={setProfile}
            addToast={addToast}
            setActiveTab={setActiveTab}
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

      {/* Full Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-all duration-300 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-full max-h-[85vh] md:max-h-[90vh] flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-fit">
              <button 
                type="button" 
                className="absolute top-4 right-4 text-white/75 hover:text-white bg-slate-900/60 p-2.5 rounded-full border border-white/10 hover:bg-slate-800 transition-all z-20 cursor-pointer"
                onClick={() => setPreviewImage(null)}
              >
                <X className="h-5 w-5" />
              </button>
              <img 
                src={previewImage} 
                alt="Talent Photo Preview" 
                className="max-w-full max-h-[85vh] md:max-h-[90vh] rounded-xl border border-white/10 shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tier Explanation Dialog */}
      <TierExplanationDialog 
        isOpen={isTierDialogOpen} 
        onClose={() => setIsTierDialogOpen(false)} 
      />

    </div>
  );
}
