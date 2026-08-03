"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin, User, Edit3, Sparkles,
  CheckCircle, Camera, X,
  Eye,
  Ruler, Scale, FileText, Upload, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import PersonalInfoTab from "./PersonalInfoTab";
import EditInfoTab from "./EditInfoTab";
import AddonServicesTab from "./AddonServicesTab";
import ProgressBar from "@/components/ui/ProgressBar";
import TierExplanationDialog from "@/components/ui/TierExplanationDialog";
import BadgeTier from "@/components/ui/BadgeTier";
import { createInitialAvatarDataUrl, normalizeBackendAssetUrl } from "@/lib/avatar";
import { getAuthToken } from "@/lib/api-client";
import { deleteTalentPhotoCategory, ensureTalentProfile, loadTalentProfile, persistTalentProfile, TALENT_PROFILE_UPDATED_EVENT, uploadTalentPhoto } from "@/lib/talent-api";

function getProfileTalentTypes(profile: unknown) {
  const record = profile && typeof profile === "object" ? profile as Record<string, unknown> : {};
  const candidates = [record.talentTypes, record.talent_types];

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

function getStringList(value: unknown) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return Array.from(new Set(list.map((item) => String(item).trim()).filter(Boolean)));
}

const formatHeight = (h: number | string) => {
  const val = Number(h);
  if (!val) return "—";
  return `${val} cm`;
};

const formatMeasurements = (profile: any) => {
  if (profile?.bust && profile?.waist && profile?.hips) {
    return `${profile.bust}-${profile.waist}-${profile.hips}`;
  }

  return "Chưa biết";
};

function formatDisplayName(name: string) {
  return name
    .toLocaleLowerCase("vi-VN")
    .replace(/(^|[\s'-])([^\s'-])/g, (match, prefix, char) => `${prefix}${char.toLocaleUpperCase("vi-VN")}`);
}

function portfolioLinksFromProfile(profile: any): string[] {
  const rawLinks = profile?.portfolioLinks ?? profile?.portfolio_links ?? profile?.portfolio_url ?? "";
  const links = Array.isArray(rawLinks)
    ? rawLinks
    : String(rawLinks).split(/[\n,;]+/);

  return Array.from(new Set(
    links
      .map((link: unknown) => String(link).trim())
      .filter(Boolean),
  ));
}

function portfolioHref(link: string): string {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

export default function PortfolioPage() {
  const [profile, setProfile] = useState<any>(null);

  // Four main tabs: 'personal-info', 'edit-info', 'addon-services', 'portrait-3d'
  const [activeTab, setActiveTab] = useState<"edit-info" | "personal-info" | "addon-services" | "portrait-3d">("personal-info");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isTierDialogOpen, setIsTierDialogOpen] = useState(false);
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const [openImageActionMenu, setOpenImageActionMenu] = useState<"avatar" | "cover" | null>(null);

  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "info" }[]>([]);

  useEffect(() => {
    if (activeTab === "edit-info") {
      document.documentElement.classList.add("hide-bottom-nav-override");
    } else {
      document.documentElement.classList.remove("hide-bottom-nav-override");
    }
    return () => {
      document.documentElement.classList.remove("hide-bottom-nav-override");
    };
  }, [activeTab]);

  const [uploadingState, setUploadingState] = useState<{
    [key: string]: {
      progress: number;
      fileName: string;
      status: "uploading" | "done" | "error" | "idle";
    };
  }>({});

  useEffect(() => {
    if (!openImageActionMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-image-action-menu]")) return;
      setOpenImageActionMenu(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openImageActionMenu]);

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
  const profileSkills = getStringList(profile.skills ?? profile.specialSkills);
  const profileSocialHighlights = getStringList(profile.socialHighlights ?? profile.social_highlights);
  const portfolioLinks = portfolioLinksFromProfile(profile);
  const portfolioOwnerName = String(profile?.name || "Idol").trim().replace(/\s+/g, "_");
  const headerBio = profile.bio && profile.bio !== profile.education ? profile.bio : "";

  function openPortfolioLink(link: string) {
    window.open(portfolioHref(link), "_blank", "noopener,noreferrer");
  }

  function handleViewPortfolio() {
    if (portfolioLinks.length === 0) {
      addToast("Chưa có portfolio", "info");
      return;
    }

    if (portfolioLinks.length === 1) {
      openPortfolioLink(portfolioLinks[0]);
      return;
    }

    setIsPortfolioDialogOpen(true);
  }

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

      const updatedProfile = persistTalentProfile({
        ...syncedProfile,
        ...profile,
        [type]: photoUrl,
        isOnboarded: true,
        tier: profile.tier || "Potential",
      });
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

  const handleRemoveProfileImage = async (type: "avatar" | "cover") => {
    setOpenImageActionMenu(null);
    try {
      const syncedProfile = await ensureTalentProfile(profile);
      if (syncedProfile.backendProfileId) {
        await deleteTalentPhotoCategory(syncedProfile.backendProfileId, type);
      }

      const updatedProfile = persistTalentProfile({
        ...syncedProfile,
        ...profile,
        [type]: "",
      });
      setProfile(updatedProfile);
      addToast(`Đã xóa ${type === "avatar" ? "ảnh đại diện" : "ảnh bìa"}.`, "info");
    } catch (error) {
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không xóa được ảnh, vui lòng thử lại.", "info");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">

      {/* Cover Banner Header - Dynamic & Responsive */}
      <div className="relative overflow-hidden rounded-[24px] border border-white/5 bg-[#05070e]/85 p-0 shadow-soft backdrop-blur-md md:rounded-[32px] md:p-6">

        {/* Cover Background */}
        <div className="group relative h-44 w-full overflow-hidden rounded-t-[24px] border-b border-white/5 bg-[#05070e] shadow-inner sm:h-56 md:h-72 md:rounded-2xl md:border">
          {/* Cover image */}
          {normalizeBackendAssetUrl(profile.cover) ? (
            <img
              src={normalizeBackendAssetUrl(profile.cover)}
              alt="Cover banner"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01] cursor-pointer"
              onClick={() => setPreviewImage(normalizeBackendAssetUrl(profile.cover))}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-700 bg-gradient-to-br from-slate-950 to-slate-900">
              <Camera className="h-10 w-10 text-slate-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Chưa có ảnh bìa</span>
            </div>
          )}



          {/* Cover camera edit button in bottom-right corner */}
          <div className="absolute bottom-3 right-6 z-20" data-image-action-menu>
            <button
              type="button"
              onClick={() => setOpenImageActionMenu(openImageActionMenu === "cover" ? null : "cover")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 hover:bg-slate-950 border border-white/10 hover:border-[#F0C56B]/80 text-white hover:text-[#F0C56B] cursor-pointer shadow-soft transition-all active:scale-95"
            >
              <Camera className="h-4.5 w-4.5" />
            </button>
            {openImageActionMenu === "cover" && (
              <div className="absolute right-0 bottom-full mb-2 z-50 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#08090f] shadow-2xl">
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-[#F0C56B]">
                  <Upload className="h-4 w-4 shrink-0" />
                  Chọn ảnh mới
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!!uploadingState["cover"]}
                    onChange={(e) => {
                      setOpenImageActionMenu(null);
                      handleImageUpload(e, "cover");
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveProfileImage("cover")}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs font-bold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                >
                  <Trash2 className="h-4 w-4 shrink-0" />
                  Xóa ảnh
                </button>
              </div>
            )}
          </div>

          {uploadingState["cover"] && (
            <ProgressBar
              progress={uploadingState["cover"].progress}
              message="Đang tải ảnh bìa lên..."
            />
          )}
        </div>

        <div className="relative z-20 px-4 pb-4 md:hidden">
          <div className="-mt-6 flex items-start gap-3">
            <div className="relative shrink-0 rounded-full bg-[#08090f] p-1 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
              <div className="h-24 w-24 rounded-full bg-gradient-gold p-[3px] shadow-[0_0_20px_rgba(240,197,107,0.35)]">
                <img
                  src={normalizeBackendAssetUrl(profile.avatar) || createInitialAvatarDataUrl(profile.name || "Khách truy cập", profile.email)}
                  alt={profile.name || "Khách truy cập"}
                  onError={(event) => {
                    event.currentTarget.src = createInitialAvatarDataUrl(profile.name || "Khách truy cập", profile.email);
                  }}
                  className="h-full w-full rounded-full border border-black/10 object-cover"
                  onClick={() => normalizeBackendAssetUrl(profile.avatar) && setPreviewImage(normalizeBackendAssetUrl(profile.avatar))}
                />
              </div>

              <div className="absolute bottom-1 right-1 z-30" data-image-action-menu>
                <button
                  type="button"
                  onClick={() => setOpenImageActionMenu(openImageActionMenu === "avatar" ? null : "avatar")}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#05070e] bg-[#F0C56B] text-slate-950 shadow-lg transition-all active:scale-95"
                >
                  <Camera className="h-4 w-4" />
                </button>
                {openImageActionMenu === "avatar" && (
                  <div className="absolute left-0 bottom-full z-50 mb-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#08090f] shadow-2xl">
                    <label className="flex cursor-pointer items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-[#F0C56B]">
                      <Upload className="h-4 w-4 shrink-0" />
                      Chọn ảnh mới
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!!uploadingState["avatar"]}
                        onChange={(e) => {
                          setOpenImageActionMenu(null);
                          handleImageUpload(e, "avatar");
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveProfileImage("avatar")}
                      className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs font-bold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                    >
                      <Trash2 className="h-4 w-4 shrink-0" />
                      Xóa ảnh
                    </button>
                  </div>
                )}
              </div>

              {uploadingState["avatar"] && (
                <ProgressBar
                  progress={uploadingState["avatar"].progress}
                  message="Tải ảnh..."
                  className="absolute inset-1 rounded-full"
                />
              )}
            </div>

            <div className="min-w-0 flex-1 pt-7">
              <h2 className="font-display text-lg font-black leading-tight tracking-wide text-white">
                <span>{formatDisplayName(profile.name || "Chưa cập nhật")}</span>
                <span className="ml-2 inline-flex h-4 w-4 select-none items-center justify-center rounded-full bg-amber-400 align-middle text-[9px] font-extrabold text-slate-950 shadow-md" title="Đã xác minh">
                  ✓
                </span>
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-extrabold leading-snug text-slate-200">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-[#F0C56B]" />
                  {profile.location || "Chưa cập nhật"}
                </span>
                {profile.isOnboarded && profile.tier && (
                  <button
                    type="button"
                    onClick={() => setIsTierDialogOpen(true)}
                    className="inline-flex items-center gap-1 rounded-full transition active:scale-95"
                    title="Xem chi tiết phân hạng"
                  >
                    <BadgeTier tier={profile.tier} variant="gradient" size="xs" />
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[10px] font-black text-white">
                      ?
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-1.5 text-[10px] font-black leading-snug text-[#F0C56B]">
            <span className="inline-flex min-w-0 items-center justify-center gap-1 rounded-full border border-[#F0C56B]/20 bg-[#F0C56B]/10 px-2 py-1">
              <Ruler className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{profile.height ? formatHeight(profile.height) : "Chưa biết"}</span>
            </span>
            <span className="inline-flex min-w-0 items-center justify-center gap-1 rounded-full border border-[#F0C56B]/20 bg-[#F0C56B]/10 px-2 py-1">
              <Scale className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{profile.weight ? `${profile.weight} kg` : "Chưa biết"}</span>
            </span>
            <span className="inline-flex min-w-0 items-center justify-center gap-1 rounded-full border border-[#F0C56B]/20 bg-[#F0C56B]/10 px-2 py-1 font-mono">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{formatMeasurements(profile)}</span>
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {profileTalentTypes.length ? (
              profileTalentTypes.map((type) => (
                <span key={type} className="inline-flex rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
                  {type}
                </span>
              ))
            ) : (
              <span className="inline-flex rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
                Idol mới
              </span>
            )}

            {profileSocialHighlights.map((highlight) => (
              <span key={highlight} className="inline-flex rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
                {highlight}
              </span>
            ))}

            {profileSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>

          {headerBio ? (
            <div className="mt-3 border-t border-white/5 pt-3 text-left text-xs font-medium leading-relaxed text-slate-400">
              {headerBio}
            </div>
          ) : null}

          <div className="mt-4">
            <button
              type="button"
              aria-disabled={portfolioLinks.length === 0}
              onClick={handleViewPortfolio}
              className={cn(
                "flex h-12 w-full items-center justify-center rounded-2xl border px-4 text-xs font-black uppercase tracking-wider transition active:scale-95",
                portfolioLinks.length > 0
                  ? "cursor-pointer border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  : "cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-500"
              )}
            >
              <Eye className="mr-2 h-4 w-4 shrink-0 text-current" />
              Xem Portfolio
            </button>
          </div>
        </div>

        {/* Profile Info & Centered Details */}
        <div className="relative z-20 hidden w-full flex-col items-start justify-between gap-6 px-3 text-left sm:px-6 md:mt-6 md:flex lg:flex-row lg:items-start">
          
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
                <div className="absolute bottom-0.5 right-0.5 z-30" data-image-action-menu>
                  <button
                    type="button"
                    onClick={() => setOpenImageActionMenu(openImageActionMenu === "avatar" ? null : "avatar")}
                    className="h-9 w-9 bg-[#F0C56B] text-slate-950 rounded-full border-2 border-[#05070e] hover:brightness-110 active:scale-95 shadow-lg flex items-center justify-center cursor-pointer transition-all"
                  >
                    <Camera className="h-4.5 w-4.5" />
                  </button>
                  {openImageActionMenu === "avatar" && (
                    <div className="absolute right-0 bottom-full mb-2 z-50 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#08090f] shadow-2xl">
                      <label className="flex cursor-pointer items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-[#F0C56B]">
                        <Upload className="h-4 w-4 shrink-0" />
                        Chọn ảnh mới
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={!!uploadingState["avatar"]}
                          onChange={(e) => {
                            setOpenImageActionMenu(null);
                            handleImageUpload(e, "avatar");
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveProfileImage("avatar")}
                        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs font-bold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                      >
                        <Trash2 className="h-4 w-4 shrink-0" />
                        Xóa ảnh
                      </button>
                    </div>
                  )}
                </div>

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
                <h2 className="font-display font-black text-white text-2xl sm:text-3xl tracking-wide leading-tight text-center sm:text-left">
                  <span>{formatDisplayName(profile.name || "Chưa cập nhật")}</span>
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
                      Idol mới
                    </span>
                  )}

                  {profileSocialHighlights.map((highlight) => (
                    <span key={highlight} className="inline-flex rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
                      {highlight}
                    </span>
                  ))}

                  {profile.isOnboarded && profile.tier && (
                    <button
                      type="button"
                      onClick={() => setIsTierDialogOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-full transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-98 cursor-pointer select-none"
                      title="Xem chi tiết phân hạng"
                    >
                      <BadgeTier tier={profile.tier} variant="gradient" />
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[8px] font-black text-white transition-colors hover:bg-white/25">
                        ?
                      </span>
                    </button>
                  )}
                </div>
                
                {/* Location & Measurements Row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-1.5 text-[11px] sm:text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#F0C56B]" />
                    <span className="text-slate-300 font-medium">{profile.location || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Ruler className="h-4 w-4 text-[#F0C56B]" />
                    <span className="text-slate-300 font-medium">{profile.height ? formatHeight(profile.height) : "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-[#F0C56B]" />
                    <span className="text-slate-300 font-medium">{profile.weight ? `${profile.weight} kg` : "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-[#F0C56B]" />
                    <span className="text-slate-300 font-medium font-mono">{formatMeasurements(profile)}</span>
                  </div>
                </div>

                {profileSkills.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                    {profileSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bio (Description) Row */}
                {headerBio ? (
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium leading-relaxed pt-2.5 border-t border-white/5 mt-1 text-center sm:text-left">
                    {headerBio}
                  </div>
                ) : null}

                {/* Portfolio URL Button */}
                <div className="pt-3 flex justify-center">
                  <button
                    type="button"
                    aria-disabled={portfolioLinks.length === 0}
                    onClick={handleViewPortfolio}
                    className={cn(
                      "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(240,197,107,0.2)] active:scale-98 transition-all duration-300",
                      portfolioLinks.length > 0
                        ? "bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 hover:brightness-110 hover:scale-[1.02] cursor-pointer"
                        : "border border-white/10 bg-white/[0.03] text-slate-500 cursor-not-allowed"
                    )}
                  >
                    <Eye className="h-4 w-4 shrink-0 text-current" />
                    Xem Portfolio
                  </button>
                </div>
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

      {isPortfolioDialogOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setIsPortfolioDialogOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#2B313D] bg-[#08090f] p-5 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-[#151b2d] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-[#f4c430]" />
                <h3 className="font-display text-xs font-black uppercase tracking-wider text-white">Chọn portfolio</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPortfolioDialogOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {portfolioLinks.map((link, index) => (
                <button
                  key={`${link}-${index}`}
                  type="button"
                  onClick={() => {
                    setIsPortfolioDialogOpen(false);
                    openPortfolioLink(link);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-left text-xs font-bold text-slate-200 transition hover:border-amber-400/40 hover:bg-amber-400/5 hover:text-amber-300"
                  title={link}
                >
                  <FileText className="h-4 w-4 shrink-0 text-[#f4c430]" />
                  <span className="truncate">{`Portfolio${index + 1}_${portfolioOwnerName}`}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
