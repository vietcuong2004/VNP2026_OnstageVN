"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MapPin, User, Edit3, Sparkles,
  CheckCircle, Camera, X,
  Eye,
  Ruler, Scale, FileText, Upload, Trash2,
  Star, ShieldCheck, ChevronRight, Share2, MoreVertical, Film, Play, Copy,
  Calendar, Users, Wallet, PackageCheck, Layers, BookOpen, Languages, GraduationCap, Globe,
  Home
} from "lucide-react";
import { cn, formatOrGenerateViews, getVideoThumbnail } from "@/lib/utils";
import PersonalInfoTab from "./PersonalInfoTab";
import EditInfoTab from "./EditInfoTab";
import ProgressBar from "@/components/ui/ProgressBar";
import TierExplanationDialog from "@/components/ui/TierExplanationDialog";
import BadgeTier, { getPrimaryAchievementBadge } from "@/components/ui/BadgeTier";
import { createInitialAvatarDataUrl, normalizeBackendAssetUrl } from "@/lib/avatar";
import { getAuthToken } from "@/lib/api-client";
import { deleteTalentPhotoCategory, deleteTalentPhoto, deleteTalentVideo, ensureTalentProfile, loadTalentProfile, persistTalentProfile, TALENT_PROFILE_UPDATED_EVENT, uploadTalentPhoto, uploadTalentVideo, createTalentVideoLink } from "@/lib/talent-api";

const FacebookLogo = ({ className = "h-5 w-5 shrink-0 object-contain" }: { className?: string }) => (
  <img src="/social/facebook.png" alt="Facebook" className={className} />
);

const TiktokLogo = ({ className = "h-5 w-5 shrink-0 object-contain" }: { className?: string }) => (
  <img src="/social/tiktok.png" alt="TikTok" className={className} />
);

const InstagramLogo = ({ className = "h-5 w-5 shrink-0 object-contain" }: { className?: string }) => (
  <img src="/social/instagram.png" alt="Instagram" className={className} />
);

const YoutubeLogo = ({ className = "h-5 w-5 shrink-0 object-contain" }: { className?: string }) => (
  <img src="/social/youtube.png" alt="YouTube" className={className} />
);

const ThreadIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.48 13.9c-.83.09-1.58-.2-2-.84-.33-.51-.39-1.12-.39-2.22 0-1.89.87-2.92 2.32-2.92 1.41 0 2.22.99 2.22 2.76 0 1.94-.89 2.97-2.15 3.22zm2.09-6.3c-.63-.61-1.54-.95-2.57-.95-1.95 0-3.34 1.34-3.34 3.79s1.39 3.79 3.34 3.79c.8 0 1.51-.2 2.03-.59.18-.13.43-.1.58.07l.79.9c.28.32.18.84-.2 1.04-1 .55-2.14.78-3.2.78-3.33 0-5.74-2.17-5.74-5.99s2.41-5.99 5.74-5.99c1.67 0 3.2.53 4.31 1.49.27.23.31.63.09.91l-.88 1.13c-.15.2-.42.24-.62.08z" />
  </svg>
);

const getSocialPlatformInfo = (rawPlatform: string, url: string) => {
  const p = (rawPlatform || "").toLowerCase().trim();
  const u = (url || "").toLowerCase().trim();

  if (p.includes("facebook") || p.includes("fb") || u.includes("facebook.com") || u.includes("fb.com")) {
    return {
      platformKey: "Facebook",
      icon: <FacebookLogo className="h-8 w-8 shrink-0 object-contain" />,
    };
  }
  if (p.includes("tiktok") || u.includes("tiktok.com")) {
    return {
      platformKey: "TikTok",
      icon: <TiktokLogo className="h-8 w-8 shrink-0 object-contain" />,
    };
  }
  if (p.includes("instagram") || p.includes("insta") || u.includes("instagram.com") || u.includes("instagr.am")) {
    return {
      platformKey: "Instagram",
      icon: <InstagramLogo className="h-8 w-8 shrink-0 object-contain" />,
    };
  }
  if (p.includes("thread") || u.includes("threads.net")) {
    return {
      platformKey: "Thread",
      icon: <ThreadIcon />,
    };
  }
  if (p.includes("youtube") || p.includes("yt") || u.includes("youtube.com") || u.includes("youtu.be")) {
    return {
      platformKey: "YouTube",
      icon: <YoutubeLogo className="h-8 w-8 shrink-0 object-contain" />,
    };
  }

  return {
    platformKey: rawPlatform || "Globe",
    icon: <Globe className="h-6 w-6 shrink-0 text-amber-400" />,
  };
};

const formatShortCount = (num: number) => {
  if (!Number.isFinite(num) || num <= 0) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return num.toLocaleString("vi-VN");
};

function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|mov|m4v|webm|ogg)(\?|#|$)/i.test(url);
}

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

  // Main tabs: 'personal-info', 'edit-info', 'addon-services', 'portrait-3d'
  const [activeTab, setActiveTab] = useState<"edit-info" | "personal-info" | "addon-services" | "portrait-3d">("personal-info");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isTierDialogOpen, setIsTierDialogOpen] = useState(false);
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const [openImageActionMenu, setOpenImageActionMenu] = useState<"avatar" | "cover" | null>(null);

  // Mobile Sub-tabs: 'photos' | 'videos' | 'about' | 'reviews'
  const [mobileTab, setMobileTab] = useState<"photos" | "videos" | "about" | "reviews">("photos");
  const [mobileVideoSubTab, setMobileVideoSubTab] = useState<"recent" | "featured">("featured");
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

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
      specialSkills: [],
      socialHighlights: [],
      talentTypes: [],
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

  const profileTalentTypes = getProfileTalentTypes(profile);
  const profileSkills = getStringList(profile?.skills ?? profile?.specialSkills);
  const profileSocialHighlights = getStringList(profile?.socialHighlights ?? profile?.social_highlights);
  const portfolioLinks = portfolioLinksFromProfile(profile);
  const portfolioOwnerName = String(profile?.name || "Idol").trim().replace(/\s+/g, "_");
  const headerBio = profile?.bio && profile?.bio !== profile?.education ? profile.bio : "";
  const primaryBadge = getPrimaryAchievementBadge(profile);

  // Lookbook photos memoized
  const lookbookPhotos = useMemo(() => {
    if (!profile) return [];
    const portfolioPhotoUrls = Array.from(new Set(
      (profile.photos || [])
        .map((p: any) => typeof p === "string" ? p : p?.url || p?.path)
        .map((url: string) => normalizeBackendAssetUrl(url))
        .filter(Boolean),
    ));

    const photoRecords = Array.isArray(profile.photoRecords) ? profile.photoRecords : [];

    return Array.from({ length: 8 }, (_, index) => {
      const id = index + 1;
      const explicitUrl = normalizeBackendAssetUrl((profile as any)["lookbook" + id]);
      const url = explicitUrl || portfolioPhotoUrls[index] || "";

      if (!url) return null;

      const matchedRecord = photoRecords.find((r: any) => {
        const rUrl = normalizeBackendAssetUrl(r.url || r.path);
        return rUrl === url;
      });

      return {
        id,
        photoId: matchedRecord?.id,
        label: "Ảnh " + id,
        url,
      };
    }).filter(Boolean) as Array<{ id: number; photoId?: number | string; label: string; url: string }>;
  }, [profile]);

  const nextLookbookSlot = useMemo(() => {
    if (!profile) return null;
    if (lookbookPhotos.length >= 8) return null;
    return lookbookPhotos.length + 1;
  }, [profile, lookbookPhotos]);

  const canAddVideo = useMemo(() => {
    return (profile?.videos?.length ?? 0) < 4;
  }, [profile?.videos]);

  const [mobileVideoLinkInput, setMobileVideoLinkInput] = useState("");

  const handleLookbookPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const selectedFiles = Array.from(e.target.files || []).filter((file) => 
      file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|heic|heif|gif)$/i.test(file.name)
    );
    e.target.value = "";
    if (selectedFiles.length === 0) return;

    const remainingSlots = Math.max(0, 9 - id);
    const fileList = selectedFiles.slice(0, remainingSlots);

    if (selectedFiles.length > remainingSlots) {
      addToast("Chỉ được tải tối đa 8 ảnh trong bộ sưu tập.", "info");
    }

    const previews = fileList.map((file) => URL.createObjectURL(file));
    const stateKeys = fileList.map((_, index) => `lookbook-${id + index}`);

    setProfile((current: any) => {
      const nextPhotos = [...(current?.photos || [])];
      const updates: Record<string, string> = {};

      previews.forEach((previewUrl, index) => {
        const slot = id + index;
        nextPhotos[slot - 1] = previewUrl;
        updates[`lookbook${slot}`] = previewUrl;
      });

      return { ...current, ...updates, photos: nextPhotos.filter(Boolean) };
    });

    setUploadingState((prev: any) => {
      const next = { ...prev };
      stateKeys.forEach((key, index) => {
        next[key] = {
          progress: 10,
          fileName: fileList[index].name,
          status: "uploading",
        };
      });
      return next;
    });

    try {
      const syncedProfile = await ensureTalentProfile(profile);

      if (!syncedProfile.backendProfileId) {
        setUploadingState((prev: any) => {
          const next = { ...prev };
          stateKeys.forEach((key) => delete next[key]);
          return next;
        });
        addToast(`Cập nhật ${fileList.length} ảnh thành công!`, "success");
        return;
      }

      const uploadedRecords: any[] = [];
      const uploadedUrls: string[] = [];

      for (let index = 0; index < fileList.length; index++) {
        const file = fileList[index];
        const photo = await uploadTalentPhoto(syncedProfile.backendProfileId, file, "portfolio");
        const photoUrl = photo.url || photo.path;
        if (photoUrl) {
          uploadedUrls.push(photoUrl);
          uploadedRecords.push(photo);
        }
        setUploadingState((prev: any) => ({
          ...prev,
          [stateKeys[index]]: {
            ...prev[stateKeys[index]],
            progress: 100,
            status: "done",
          }
        }));
      }

      setProfile((current: any) => {
        const nextPhotos = [...(current?.photos || [])];
        const updates: Record<string, string> = {};

        uploadedUrls.forEach((photoUrl, index) => {
          const slot = id + index;
          nextPhotos[slot - 1] = photoUrl;
          updates[`lookbook${slot}`] = photoUrl;
        });

        const updated = persistTalentProfile({
          ...syncedProfile,
          ...current,
          ...updates,
          photos: nextPhotos.filter(Boolean),
          photoRecords: [
            ...(Array.isArray(current?.photoRecords) ? current.photoRecords : []),
            ...uploadedRecords,
          ],
          isOnboarded: true,
          tier: current?.tier || "Potential",
        });
        return updated;
      });

      previews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));

      setTimeout(() => {
        setUploadingState((prev: any) => {
          const next = { ...prev };
          stateKeys.forEach((key) => delete next[key]);
          return next;
        });
      }, 500);

      addToast(`Cập nhật ${uploadedUrls.length} ảnh thành công!`, "success");
    } catch (error) {
      setUploadingState((prev: any) => {
        const next = { ...prev };
        stateKeys.forEach((key) => delete next[key]);
        return next;
      });
      previews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không tải được ảnh lên, vui lòng thử lại.", "info");
    }
  };

  const handleRemoveLookbookPhoto = async (id: number, photoId?: number | string) => {
    const numericPhotoId = Number(photoId);

    try {
      const syncedProfile = await ensureTalentProfile(profile);

      if (syncedProfile.backendProfileId && Number.isFinite(numericPhotoId) && numericPhotoId > 0) {
        await deleteTalentPhoto(syncedProfile.backendProfileId, numericPhotoId);
      }

      const fieldKey = `lookbook${id}`;
      const nextPhotos = (profile.photos || []).filter((_: unknown, idx: number) => idx !== id - 1);
      const nextPhotoRecords = Array.isArray(profile.photoRecords)
        ? profile.photoRecords.filter((photo: any) => Number(photo.id) !== numericPhotoId)
        : profile.photoRecords;

      const updatedProfile = persistTalentProfile({
        ...profile,
        [fieldKey]: "",
        photos: nextPhotos.filter(Boolean),
        photoRecords: nextPhotoRecords,
      });

      setProfile(updatedProfile);
      addToast(`Đã xóa ảnh.`, "info");
    } catch (error) {
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không xóa được ảnh, vui lòng thử lại.", "info");
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const currentVideos = Array.isArray(profile.videos) ? profile.videos : [];
    if (currentVideos.length >= 4) {
      addToast("Chỉ được tải tối đa 4 video.", "info");
      return;
    }

    const stateKey = "portfolio-video";
    const previewUrl = URL.createObjectURL(file);

    setUploadingState(prev => ({
      ...prev,
      [stateKey]: {
        progress: 0,
        fileName: file.name,
        status: "uploading"
      }
    }));

    try {
      const syncedProfile = await ensureTalentProfile(profile);

      if (!syncedProfile.backendProfileId) {
        const nextVideo = {
          id: `local-video-${Date.now()}`,
          url: previewUrl,
          title: file.name.replace(/\.[^.]+$/, ""),
          video_type: "portfolio",
        };
        const updatedProfile = persistTalentProfile({
          ...profile,
          videos: [...currentVideos, nextVideo].slice(0, 4),
        });
        setProfile(updatedProfile);
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[stateKey];
          return next;
        });
        addToast("Cập nhật video thành công!", "success");
        return;
      }

      const video = await uploadTalentVideo(syncedProfile.backendProfileId, file, file.name.replace(/\.[^.]+$/, ""));
      const nextVideos = [...currentVideos, video].slice(0, 4);
      const updatedProfile = persistTalentProfile({
        ...syncedProfile,
        ...profile,
        videos: nextVideos,
        isOnboarded: true,
        tier: profile.tier || "Potential",
      });
      setProfile(updatedProfile);
      URL.revokeObjectURL(previewUrl);

      setUploadingState(prev => {
        const next = { ...prev };
        delete next[stateKey];
        return next;
      });

      addToast("Cập nhật video thành công!", "success");
    } catch (error) {
      setUploadingState(prev => {
        const next = { ...prev };
        delete next[stateKey];
        return next;
      });
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không tải được video lên, vui lòng thử lại.", "info");
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleAddVideoLink = async () => {
    const currentVideos = Array.isArray(profile.videos) ? profile.videos : [];
    if (currentVideos.length >= 4) {
      addToast("Chỉ được thêm tối đa 4 video.", "info");
      return;
    }

    const trimmed = mobileVideoLinkInput.trim();
    if (!trimmed) return;
    const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      let nextVideo: any = {
        id: `local-video-${Date.now()}`,
        url,
        title: `Video ${currentVideos.length + 1}`,
        video_type: "portfolio",
      };

      const syncedProfile = await ensureTalentProfile(profile);
      if (syncedProfile.backendProfileId) {
        nextVideo = await createTalentVideoLink(syncedProfile.backendProfileId, url, `Video ${currentVideos.length + 1}`);
      }

      const updatedProfile = persistTalentProfile({
        ...syncedProfile,
        ...profile,
        videos: [...currentVideos, nextVideo].slice(0, 4),
        isOnboarded: true,
        tier: profile.tier || "Potential",
      });
      setProfile(updatedProfile);
      setMobileVideoLinkInput("");
      addToast("Đã thêm video vào bộ sưu tập.", "success");
    } catch (error) {
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không thêm được video, vui lòng thử lại.", "info");
    }
  };

  const handleRemoveVideo = async (videoId: string | number | undefined, index: number) => {
    const currentVideos = Array.isArray(profile.videos) ? profile.videos : [];
    const targetVideo = currentVideos.find((video: any, idx: number) => idx === index || video.id === videoId);

    try {
      const syncedProfile = await ensureTalentProfile(profile);
      const numericVideoId = Number(targetVideo?.id ?? videoId);

      if (syncedProfile.backendProfileId && Number.isFinite(numericVideoId) && numericVideoId > 0) {
        await deleteTalentVideo(syncedProfile.backendProfileId, numericVideoId);
      }

      const updatedProfile = persistTalentProfile({
        ...syncedProfile,
        ...profile,
        videos: currentVideos.filter((video: any, idx: number) => idx !== index && video.id !== videoId),
      });
      setProfile(updatedProfile);
      addToast("Đã xóa video khỏi bộ sưu tập.", "info");
    } catch (error) {
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không xóa được video, vui lòng thử lại.", "info");
    }
  };

  // Mobile Hero Photos & infinite sliding track
  const mobileHeroPhotos = useMemo(() => {
    if (!profile) return [];

    const urls = [
      ...lookbookPhotos.map((photo) => photo.url),
      normalizeBackendAssetUrl(profile.cover || ""),
      normalizeBackendAssetUrl(profile.avatar || ""),
      normalizeBackendAssetUrl(profile.fullBody || ""),
    ].filter(Boolean);

    return Array.from(new Set(urls));
  }, [lookbookPhotos, profile]);

  const extendedHeroPhotos = useMemo(() => {
    if (mobileHeroPhotos.length <= 1) return mobileHeroPhotos;
    return [...mobileHeroPhotos, mobileHeroPhotos[0]];
  }, [mobileHeroPhotos]);

  const [mobileHeroIndex, setMobileHeroIndex] = useState(0);
  const [isHeroSliding, setIsHeroSliding] = useState(true);

  useEffect(() => {
    setMobileHeroIndex(0);
    setIsHeroSliding(true);
  }, [mobileHeroPhotos.length]);

  useEffect(() => {
    if (mobileHeroPhotos.length <= 1) return;
    if (mobileHeroIndex >= mobileHeroPhotos.length) return;

    const timer = setTimeout(() => {
      setIsHeroSliding(true);
      setMobileHeroIndex((prev) => prev + 1);
    }, 4000);

    return () => clearTimeout(timer);
  }, [mobileHeroIndex, mobileHeroPhotos.length]);

  const handleHeroTransitionEnd = () => {
    if (mobileHeroIndex >= mobileHeroPhotos.length) {
      setIsHeroSliding(false);
      setMobileHeroIndex(0);
    }
  };

  const talentKey = String(profile?.id || profile?.name || "talent");

  const portfolioVideos = useMemo<Array<{ id: string | number; title: string; url: string; thumbnailUrl?: string; views?: string }>>(() => {
    if (!profile || !Array.isArray(profile.videos)) return [];

    return profile.videos
      .map((video: any, index: number) => {
        const rawUrl = video?.url || "";
        const rawThumb = video?.thumbnailUrl || video?.thumbnail_url || video?.thumbnail || "";
        const resolvedThumb = rawThumb ? normalizeBackendAssetUrl(rawThumb) : getVideoThumbnail(rawUrl);
        const resolvedViews = formatOrGenerateViews(video?.views || video?.views_count, `${talentKey}-portfolio-${rawUrl}`, index);
        return {
          id: video?.id ?? `video-${index + 1}`,
          title: String(video?.title || `Video ${index + 1}`),
          url: normalizeBackendAssetUrl(rawUrl),
          thumbnailUrl: resolvedThumb,
          views: resolvedViews,
        };
      })
      .filter((video: { url: string }) => Boolean(video.url))
      .slice(0, 4);
  }, [profile, talentKey]);

  const mobileSocialAccounts = useMemo(() => {
    return Array.isArray(profile?.socialAccounts)
      ? profile.socialAccounts
      : (Array.isArray(profile?.social_accounts) ? profile.social_accounts : []);
  }, [profile]);

  const mobileRecentVideos = useMemo(() => {
    const list: Array<{ id: string | number; title: string; url: string; thumbnailUrl: string; views: string }> = [];
    const seenUrls = new Set<string>();

    if (Array.isArray(mobileSocialAccounts)) {
      mobileSocialAccounts.forEach((acc: any) => {
        if (Array.isArray(acc.recent_videos)) {
          acc.recent_videos.forEach((v: any, idx: number) => {
            const rawUrl = String(v.url || acc.url || "").trim();
            if (rawUrl && !seenUrls.has(rawUrl)) {
              seenUrls.add(rawUrl);
              const rawThumb = v.thumbnail || v.thumbnailUrl || v.thumbnail_url || "";
              const resolvedViews = formatOrGenerateViews(v.views || v.views_count, `${talentKey}-recent-${rawUrl}`, idx);
              list.push({
                id: v.id || `recent-${idx}`,
                title: v.title || "Video gần đây",
                url: rawUrl,
                thumbnailUrl: rawThumb ? normalizeBackendAssetUrl(rawThumb) : getVideoThumbnail(rawUrl),
                views: resolvedViews,
              });
            }
          });
        }
      });
    }

    return list;
  }, [mobileSocialAccounts, talentKey]);

  const mobileFeaturedVideos = useMemo(() => {
    const list: Array<{ id: string | number; title: string; url: string; thumbnailUrl: string; views: string }> = [];
    const seenUrls = new Set<string>();

    if (Array.isArray(mobileSocialAccounts)) {
      mobileSocialAccounts.forEach((acc: any) => {
        if (Array.isArray(acc.featured_videos)) {
          acc.featured_videos.forEach((v: any, idx: number) => {
            const rawUrl = String(v.url || acc.url || "").trim();
            if (rawUrl && !seenUrls.has(rawUrl)) {
              seenUrls.add(rawUrl);
              const rawThumb = v.thumbnail || v.thumbnailUrl || v.thumbnail_url || "";
              const resolvedViews = formatOrGenerateViews(v.views || v.views_count, `${talentKey}-feat-${rawUrl}`, idx);
              list.push({
                id: v.id || `featured-${idx}`,
                title: v.title || "Video nổi bật",
                url: rawUrl,
                thumbnailUrl: rawThumb ? normalizeBackendAssetUrl(rawThumb) : getVideoThumbnail(rawUrl),
                views: resolvedViews,
              });
            }
          });
        }
      });
    }

    if (portfolioVideos.length > 0) {
      portfolioVideos.forEach((v, idx) => {
        if (v.url && !seenUrls.has(v.url)) {
          seenUrls.add(v.url);
          const resolvedViews = formatOrGenerateViews(v.views, `${talentKey}-feat-port-${v.url}`, idx);
          list.push({
            id: v.id,
            title: v.title || "Video nổi bật",
            url: v.url,
            thumbnailUrl: v.thumbnailUrl || getVideoThumbnail(v.url),
            views: resolvedViews,
          });
        }
      });
    }

    return list;
  }, [mobileSocialAccounts, portfolioVideos, talentKey]);

  const mobileDisplayStats = [
    { platform: "TikTok", match: /tiktok/i, label: "Followers" },
    { platform: "Instagram", match: /instagram|insta/i, label: "Followers" },
    { platform: "YouTube", match: /youtube|youtu\.be|yt/i, label: "Subscribers" },
    { platform: "Facebook", match: /facebook|fb\.com/i, label: "Followers" },
  ].map((config) => {
    const account = mobileSocialAccounts.find((item: any) => {
      const haystack = `${item?.platform || ""} ${item?.name || ""} ${item?.url || ""}`.toLowerCase();
      return config.match.test(haystack);
    });
    const rawUrl = String(account?.url || "").trim();
    const href = rawUrl ? (rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`) : "";

    return {
      platform: config.platform,
      href,
      value: account?.followers_count ? formatShortCount(Number(account.followers_count)) : href ? (profile?.followersCount ? formatShortCount(Number(profile.followersCount)) : "0") : "0",
      label: href ? config.label : "Chưa cập nhật",
      disabled: !href,
    };
  });

  const mobileReviewItems = (profile?.reviews && profile.reviews.length > 0 ? profile.reviews : [
    { brand: "L'Oréal Paris Vietnam", rating: 5, date: "15/05/2026", comment: `${profile?.name || "Talent"} làm việc vô cùng chuyên nghiệp, đúng giờ và hoàn thành tốt KPI chiến dịch truyền thông của nhãn hàng. Rất mong tiếp tục hợp tác.` },
    { brand: "Gucci Beauty Event", rating: 5, date: "29/04/2026", comment: "Thần thái xuất sắc, hình ảnh high-fashion phù hợp tiêu chuẩn quốc tế. Cảm ơn vì sự hỗ trợ nhiệt tình." },
    { brand: "Vogue Vietnam Editorial", rating: 5, date: "12/04/2026", comment: "Thái độ làm việc nghiêm túc, tạo dáng xuất sắc và có kiến thức chuyên môn cao. Rất nên hợp tác." }
  ]).slice(0, 3);

  const mobileAboutRows = [
    { icon: <Ruler className="h-5 w-5 text-[#8F0709] dark:text-[#F0C56B]" />, label: "Chiều cao", value: profile?.height ? formatHeight(profile.height) : "Chưa cập nhật" },
    { icon: <Scale className="h-5 w-5 text-[#8F0709] dark:text-[#F0C56B]" />, label: "Cân nặng", value: profile?.weight ? `${profile.weight} kg` : "Chưa cập nhật" },
    { icon: <User className="h-5 w-5 text-[#8F0709] dark:text-[#F0C56B]" />, label: "Số đo 3 vòng (cm)", value: formatMeasurements(profile) },
    { icon: <User className="h-5 w-5 text-[#8F0709] dark:text-[#F0C56B]" />, label: "Nghệ danh", value: formatDisplayName(profile?.name || "Chưa cập nhật") },
    { icon: <Users className="h-5 w-5 text-[#8F0709] dark:text-[#F0C56B]" />, label: "Giới tính", value: profile?.gender || "Chưa cập nhật" },
    { icon: <Wallet className="h-5 w-5 text-[#8F0709] dark:text-[#F0C56B]" />, label: "Phí booking", value: profile?.price || "Liên hệ" },
    { icon: <MapPin className="h-5 w-5 text-[#8F0709] dark:text-[#F0C56B]" />, label: "Địa chỉ", value: profile?.location || "Chưa cập nhật" },
    { icon: <MapPin className="h-5 w-5 text-[#8F0709] dark:text-[#F0C56B]" />, label: "Quê quán", value: profile?.hometown || "Chưa cập nhật" },
    { icon: <PackageCheck className="h-5 w-5 text-[#8F0709] dark:text-[#F0C56B]" />, label: "Kinh nghiệm", value: profile?.experienceYears ? `${profile.experienceYears} năm` : (profile?.experience || "Chưa cập nhật") },
    { icon: <Layers className="h-5 w-5 text-[#8F0709] dark:text-[#F0C56B]" />, label: "Loại hình Idol", value: profileTalentTypes.join(", ") || "Chưa cập nhật" },
    { icon: <BookOpen className="h-5 w-5 text-[#8F0709] dark:text-[#F0C56B]" />, label: "Lĩnh vực chuyên sâu", value: profileSkills.slice(0, 2).join(", ") || profileSocialHighlights.slice(0, 2).join(", ") || "Chưa cập nhật" },
    { icon: <Languages className="h-5 w-5 text-[#8F0709] dark:text-[#F0C56B]" />, label: "Ngôn ngữ", value: getStringList(profile?.languages).join(", ") || "Chưa cập nhật" },
    { icon: <GraduationCap className="h-5 w-5 text-[#8F0709] dark:text-[#F0C56B]" />, label: "Học vấn", value: profile?.education || "Chưa cập nhật" },
  ];

  async function handleShare() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: profile?.name ? `${profile.name} - Onstage` : "Hồ sơ Idol - Onstage",
      text: `Xem hồ sơ của ${profile?.name || "Idol"} trên Onstage`,
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        addToast("Đã sao chép liên kết chia sẻ vào bộ nhớ tạm!", "success");
      } else {
        addToast("Không thể sao chép liên kết", "info");
      }
    } catch {
      addToast("Không thể sao chép liên kết", "info");
    }
  }

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
    if (!file) return;
    e.target.value = "";
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

  if (!profile) return null;

  const mobileHeroTotal = Math.max(mobileHeroPhotos.length, 1);
  const mobileHeroImage = mobileHeroPhotos[mobileHeroIndex] || normalizeBackendAssetUrl(profile.cover || profile.avatar || "") || "/brand_cover_default.png";

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">

      {/* ========================================================================= */}
      {/* MOBILE VIEW (md:hidden): Exactly styled after /brand/talents/[id] */}
      {/* ========================================================================= */}
      {activeTab === "personal-info" && (
        <div className="md:hidden -mx-4 -mt-6 bg-white text-[#10122f] dark:bg-[#08090f] dark:text-white">
          
          {/* Sticky/Fixed Mobile Top Action Bar */}
          <div className="fixed top-3 left-4 right-4 z-40 flex items-start justify-between pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Home button to return to home page */}
              <Link
                href="/"
                className="light-force-white flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-md active:scale-95 transition cursor-pointer"
                style={{ color: "#ffffff" }}
                aria-label="Trang chủ"
                title="Quay về trang chủ"
              >
                <Home className="h-5 w-5" style={{ color: "#ffffff", stroke: "#ffffff" }} />
              </Link>
            </div>

            <div className="relative pointer-events-auto flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                className="light-force-white flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-md active:scale-95 transition cursor-pointer"
                style={{ color: "#ffffff" }}
                aria-label="Thao tác"
              >
                <MoreVertical className="h-5 w-5" style={{ color: "#ffffff", stroke: "#ffffff" }} />
              </button>

              {isMobileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMobileDropdownOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-[#F0D7D3] bg-white p-1.5 text-left shadow-2xl ring-1 ring-black/10 animate-in fade-in slide-in-from-top-2 duration-150 dark:border-white/10 dark:bg-[#121827]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDropdownOpen(false);
                        setActiveTab("edit-info");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-[#10122f] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition cursor-pointer whitespace-nowrap dark:text-slate-200 dark:hover:bg-white/10"
                    >
                      <Edit3 className="h-4 w-4 text-[#8F0709] shrink-0 dark:text-rose-400" />
                      <span>Chỉnh sửa hồ sơ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDropdownOpen(false);
                        handleShare();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-[#10122f] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition cursor-pointer whitespace-nowrap dark:text-slate-200 dark:hover:bg-white/10"
                    >
                      <Share2 className="h-4 w-4 text-[#8F0709] shrink-0 dark:text-rose-400" />
                      <span>Chia sẻ liên kết</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDropdownOpen(false);
                        handleViewPortfolio();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-[#10122f] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition cursor-pointer whitespace-nowrap dark:text-slate-200 dark:hover:bg-white/10"
                    >
                      <Eye className="h-4 w-4 text-[#8F0709] shrink-0 dark:text-rose-400" />
                      <span>Xem portfolio</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Full-bleed Hero Sliding Carousel Section */}
          <section className="relative min-h-[100dvh] bg-white pb-24 dark:bg-[#08090f]">
            <div className="relative h-[54vh] min-h-[360px] max-h-[470px] overflow-hidden bg-slate-950">
              {/* Smooth Infinite Horizontal Sliding Carousel Track */}
              <div
                onTransitionEnd={handleHeroTransitionEnd}
                className={cn(
                  "flex h-full w-full",
                  isHeroSliding ? "transition-transform duration-700 ease-out" : "transition-none"
                )}
                style={{ transform: `translateX(-${mobileHeroIndex * 100}%)` }}
              >
                {extendedHeroPhotos.length > 0 ? (
                  extendedHeroPhotos.map((photoUrl, idx) => (
                    <div key={`${photoUrl}-${idx}`} className="h-full w-full shrink-0">
                      <img
                        src={photoUrl}
                        alt={`${profile.name || "Talent"} photo ${idx + 1}`}
                        className="h-full w-full object-cover cursor-pointer select-none"
                        onClick={() => setPreviewImage(photoUrl)}
                        onError={(event) => {
                          event.currentTarget.src = "/brand_cover_default.png";
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="h-full w-full shrink-0">
                    <img
                      src={mobileHeroImage}
                      alt={`${profile.name || "Talent"} cover`}
                      className="h-full w-full object-cover cursor-pointer select-none"
                      onClick={() => setPreviewImage(mobileHeroImage)}
                      onError={(event) => {
                        event.currentTarget.src = "/brand_cover_default.png";
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/15 pointer-events-none" />

              {/* Photo Counter inside Hero */}
              <span
                className="light-force-white absolute right-4 top-16 z-20 rounded-full bg-black/60 px-2.5 py-1 text-xs font-black text-white shadow-md backdrop-blur-md"
                style={{ color: "#ffffff" }}
              >
                {(mobileHeroIndex % mobileHeroTotal) + 1}/{mobileHeroTotal}
              </span>

              {/* Bottom overlay inside Hero */}
              <div className="absolute bottom-7 left-4 right-4 z-20 pointer-events-none space-y-1.5">
                {/* Row 1: Full-width Name + Verified Badge */}
                <div className="pointer-events-auto w-full">
                  <h1 className="light-force-white flex flex-wrap items-center gap-1.5 text-[22px] min-[380px]:text-2xl sm:text-[26px] font-black leading-tight tracking-tight text-white drop-shadow-lg" style={{ color: "#ffffff" }}>
                    <span>{formatDisplayName(profile.name || "Chưa cập nhật")}</span>
                    <span className="light-force-white inline-flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-[#ffb13b] text-xs sm:text-sm font-black text-white shadow-md" style={{ color: "#ffffff" }}>
                      ✓
                    </span>
                  </h1>
                  <p className="light-force-white mt-1 break-words text-xs sm:text-sm font-semibold text-white/90" style={{ color: "#ffffff" }}>
                    {[...profileTalentTypes, ...profileSkills].slice(0, 3).join(" · ") || "Creator · Lifestyle · Review"}
                  </p>
                </div>

                {/* Row 2: Location + Active Status (Left) & Quick Edit Button (Right) */}
                <div className="flex items-center justify-between gap-2.5 pt-0.5 pointer-events-auto">
                  <div className="light-force-white flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-bold text-white" style={{ color: "#ffffff" }}>
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-white" style={{ color: "#ffffff", stroke: "#ffffff" }} />
                      <span className="break-words" style={{ color: "#ffffff" }}>
                        {profile?.location || "Chưa cập nhật"}
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-emerald-400" style={{ color: "#34d399" }}>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Đang hoạt động
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("edit-info")}
                    className="pointer-events-auto flex h-9 sm:h-10 shrink-0 items-center gap-1.5 rounded-full border border-[#F0D7D3] bg-white px-3.5 sm:px-4 text-xs sm:text-sm font-black text-[#8F0709] shadow-xl active:scale-95 cursor-pointer dark:bg-[#171A21] dark:border-white/10 dark:text-rose-400"
                  >
                    <Edit3 className="h-4 w-4" />
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            </div>

            {/* Overlapping White Sheet Card */}
            <div className="relative z-20 -mt-6 rounded-t-[28px] bg-white px-4 pb-6 pt-5 shadow-[0_-12px_28px_rgba(16,18,47,0.08)] dark:bg-[#08090f] dark:shadow-[0_-12px_28px_rgba(0,0,0,0.5)]">
              {/* 4-column Social Stats Grid */}
              <div className="grid grid-cols-4 divide-x divide-slate-200 rounded-3xl bg-white py-2 shadow-sm dark:bg-[#121827] dark:divide-white/10">
                {mobileDisplayStats.map((item: { platform: string; href: string; value: string; label: string; disabled: boolean }) => {
                  const info = getSocialPlatformInfo(item.platform, item.href);
                  const content = (
                    <>
                      <div className="mb-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
                        {info.icon}
                      </div>
                      <strong className="text-sm font-black leading-tight text-[#10122f] dark:text-white">{item.value}</strong>
                      <span className="text-[10px] font-semibold leading-tight text-[#888aa5] dark:text-slate-400">{item.label}</span>
                    </>
                  );

                  if (item.disabled) {
                    return (
                      <button
                        key={item.platform}
                        type="button"
                        disabled
                        className="flex min-w-0 flex-col items-center justify-center px-1 text-center opacity-35 grayscale"
                        title={`${item.platform} chưa cập nhật`}
                      >
                        {content}
                      </button>
                    );
                  }

                  return (
                    <a
                      key={item.platform}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-w-0 flex-col items-center justify-center px-1 text-center transition active:scale-95"
                      title={`Mở ${item.platform}`}
                    >
                      {content}
                    </a>
                  );
                })}
              </div>

              {/* Rating & Campaign row */}
              <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap font-bold text-xs sm:text-sm text-[#10122f] dark:text-white">
                  <Star className="h-4 w-4 shrink-0 fill-[#ffb13b] text-[#ffb13b]" />
                  <span>4.8 <span className="font-normal text-slate-500 text-[11px] sm:text-xs dark:text-slate-400">(98 đánh giá)</span></span>
                </div>
                <div className="flex min-w-0 items-center justify-end gap-1.5 whitespace-nowrap font-bold text-xs sm:text-sm text-[#10122f] dark:text-white">
                  <ShieldCheck className="h-4 w-4 shrink-0 fill-[#ffb13b] text-[#ffb13b]" />
                  <span>412 <span className="font-normal text-slate-500 text-[11px] sm:text-xs dark:text-slate-400">chiến dịch</span></span>
                </div>
              </div>

              {/* Bio Quote */}
              <p className="mt-2.5 text-xs sm:text-[13px] font-normal leading-relaxed text-slate-600 dark:text-slate-300">
                “{headerBio || profile?.experienceText || "Sáng tạo nội dung chuyên nghiệp, phù hợp các chiến dịch thương hiệu và sự kiện."}”
              </p>

              {/* Scrollable Quick Tag Pills with visual scroll indicator */}
              <div className="relative mt-3.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 pr-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {(() => {
                    const combined = [
                      ...profileTalentTypes,
                      ...profileSkills,
                      ...profileSocialHighlights,
                    ].filter(Boolean);

                    const defaultFallbackTags = ["Food", "Lifestyle", "Review", "Café", "Ẩm thực"];
                    const tagsToRender = combined.length > 0
                      ? Array.from(new Set(combined)).slice(0, 8)
                      : defaultFallbackTags;

                    return tagsToRender.map((tag) => (
                      <span
                        key={tag}
                        className="h-8 shrink-0 inline-flex items-center rounded-full border border-[#F1D8D4] bg-white px-3.5 text-[11px] font-bold text-[#191116] shadow-2xs dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                      >
                        {tag}
                      </span>
                    ));
                  })()}
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-white via-white/90 to-transparent pl-4 pr-0 dark:from-[#08090f] dark:via-[#08090f]/90">
                  <ChevronRight className="h-4 w-4 animate-pulse text-[#C72524]/80 dark:text-[#C9A86A]/80" />
                </div>
              </div>

              {/* 4 Tabs Header */}
              <div className="mt-4 grid grid-cols-4 border-b border-slate-100 text-center text-xs sm:text-sm font-semibold text-[#85879f] dark:border-white/10">
                {[
                  { id: "photos", label: "Hình ảnh" },
                  { id: "videos", label: "Video" },
                  { id: "about", label: "Giới thiệu" },
                  { id: "reviews", label: "Đánh giá" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMobileTab(tab.id as typeof mobileTab)}
                    className={cn(
                      "relative w-full pb-2.5 pt-2 text-center transition cursor-pointer select-none",
                      mobileTab === tab.id ? "font-bold text-[#8F0709] dark:text-rose-400" : "text-[#85879f] hover:text-[#10122f] dark:hover:text-white"
                    )}
                  >
                    {tab.label}
                    {mobileTab === tab.id && <span className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709]" />}
                  </button>
                ))}
              </div>

              {/* Tab 1: Photos */}
              {mobileTab === "photos" && (
                <div className="mt-4">
                  <div className="grid grid-cols-3 gap-2">
                    {lookbookPhotos.map((img) => (
                      <div
                        key={img.id}
                        className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-xs group"
                      >
                        <img
                          src={normalizeBackendAssetUrl(img.url)}
                          alt={img.label}
                          className="h-full w-full object-cover cursor-pointer select-none"
                          loading="lazy"
                          onClick={() => setPreviewImage(normalizeBackendAssetUrl(img.url))}
                        />

                        {/* Delete button on top-right */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveLookbookPhoto(img.id, img.photoId);
                          }}
                          className="light-force-white absolute right-1.5 top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/70 !text-white text-white shadow-md hover:bg-rose-600 active:scale-95 transition cursor-pointer"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="h-3.5 w-3.5 !text-white text-white" />
                        </button>

                        {/* Camera edit button on bottom-right */}
                        <div className="absolute bottom-1.5 right-1.5 z-20">
                          <label className="light-force-white flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer dark:bg-[#F0C56B] dark:!text-slate-950 dark:text-slate-950">
                            <Camera className="h-3.5 w-3.5 !text-white dark:!text-slate-950" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={!!uploadingState[`lookbook-${img.id}`]}
                              onChange={(e) => handleLookbookPhotoUpload(e, img.id)}
                            />
                          </label>
                        </div>

                        {uploadingState[`lookbook-${img.id}`] && (
                          <ProgressBar
                            progress={uploadingState[`lookbook-${img.id}`].progress}
                            message="Đang tải..."
                          />
                        )}
                      </div>
                    ))}

                    {/* Next slot to upload new photo */}
                    {nextLookbookSlot && (
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/70 border border-dashed border-[#F0D7D3] dark:border-white/10 hover:border-[#8F0709] transition-colors">
                        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-[#8F0709] transition-colors p-2 text-center">
                          <Upload className="h-5 w-5 text-[#8F0709] dark:text-amber-400" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#8F0709] dark:text-amber-400">Tải ảnh</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={!!uploadingState[`lookbook-${nextLookbookSlot}`]}
                            onChange={(e) => handleLookbookPhotoUpload(e, nextLookbookSlot)}
                          />
                        </label>
                        {uploadingState[`lookbook-${nextLookbookSlot}`] && (
                          <ProgressBar
                            progress={uploadingState[`lookbook-${nextLookbookSlot}`].progress}
                            message="Đang tải..."
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {lookbookPhotos.length === 0 && !nextLookbookSlot && (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400">
                      Chưa có ảnh trong bộ sưu tập.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Videos */}
              {mobileTab === "videos" && (
                <div className="mt-4 space-y-4">
                  {/* Interactive Sub-tab Toggle */}
                  <div className="grid grid-cols-2 gap-2 rounded-full bg-[#fbf7f7] p-1 text-center text-xs sm:text-sm font-semibold dark:bg-white/5">
                    <button
                      type="button"
                      onClick={() => setMobileVideoSubTab("featured")}
                      className={cn(
                        "rounded-full py-2 transition-all cursor-pointer select-none",
                        mobileVideoSubTab === "featured"
                          ? "bg-white text-[#8F0709] shadow-sm font-bold dark:bg-slate-800 dark:text-rose-400"
                          : "text-[#10122f] hover:text-[#8F0709] dark:text-slate-300"
                      )}
                    >
                      Video nổi bật {mobileFeaturedVideos.length > 0 && `(${mobileFeaturedVideos.length})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileVideoSubTab("recent")}
                      className={cn(
                        "rounded-full py-2 transition-all cursor-pointer select-none",
                        mobileVideoSubTab === "recent"
                          ? "bg-white text-[#8F0709] shadow-sm font-bold dark:bg-slate-800 dark:text-rose-400"
                          : "text-[#10122f] hover:text-[#8F0709] dark:text-slate-300"
                      )}
                    >
                      Video gần đây {mobileRecentVideos.length > 0 && `(${mobileRecentVideos.length})`}
                    </button>
                  </div>

                  {/* Video Grid */}
                  {(() => {
                    const currentVideos = mobileVideoSubTab === "recent" ? mobileRecentVideos : mobileFeaturedVideos;
                    const isFeaturedTab = mobileVideoSubTab === "featured";

                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          {currentVideos.map((video, index) => {
                            const thumb = video.thumbnailUrl || "";
                            const views = video.views || "10K";
                            return (
                              <div
                                key={`${video.id || index}-${index}`}
                                className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-950 block select-none shadow-xs"
                              >
                                {isDirectVideoUrl(video.url) ? (
                                  <video src={video.url} className="h-full w-full object-cover" preload="metadata" />
                                ) : thumb ? (
                                  <img src={normalizeBackendAssetUrl(thumb)} alt={video.title} className="h-full w-full object-cover" loading="lazy" />
                                ) : (
                                  <div className="h-full w-full bg-slate-950 flex items-center justify-center p-2 text-center text-[10px] text-slate-400 font-semibold">
                                    {video.title}
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />
                                
                                <a
                                  href={video.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="absolute inset-0 flex items-center justify-center z-10"
                                >
                                  <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/45 backdrop-blur-xs group-hover:scale-110 transition-transform">
                                    <Play className="h-5 w-5 sm:h-6 sm:w-6 translate-x-0.5" style={{ fill: "#ffffff", color: "#ffffff", stroke: "none" }} />
                                  </span>
                                </a>

                                {/* Delete button on top-right for featured/portfolio videos */}
                                {isFeaturedTab && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleRemoveVideo(video.id, index);
                                    }}
                                    className="light-force-white absolute right-1.5 top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/70 !text-white text-white shadow-md hover:bg-rose-600 active:scale-95 transition cursor-pointer"
                                    title="Xóa video"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 !text-white text-white" />
                                  </button>
                                )}

                                <span
                                  className="light-force-white absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 z-20 inline-flex items-center gap-1 text-[10.5px] sm:text-xs font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                                  style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                                >
                                  <Play className="h-3 w-3 shrink-0" style={{ fill: "#ffffff", color: "#ffffff", stroke: "none" }} />
                                  <span style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
                                    {views}
                                  </span>
                                </span>
                              </div>
                            );
                          })}

                          {/* Upload slot for Featured Videos when < 4 */}
                          {isFeaturedTab && canAddVideo && (
                            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/70 border border-dashed border-[#F0D7D3] dark:border-white/10 hover:border-[#8F0709] transition-colors">
                              <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-[#8F0709] transition-colors p-2 text-center">
                                <Upload className="h-5 w-5 text-[#8F0709] dark:text-amber-400" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#8F0709] dark:text-amber-400">Tải video</span>
                                <input
                                  type="file"
                                  accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska"
                                  className="hidden"
                                  disabled={!!uploadingState["portfolio-video"]}
                                  onChange={handleVideoFileUpload}
                                />
                              </label>
                              {uploadingState["portfolio-video"] && (
                                <ProgressBar
                                  progress={uploadingState["portfolio-video"].progress}
                                  message="Đang tải..."
                                />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Add Video Link Input Box for Featured Tab */}
                        {isFeaturedTab && canAddVideo && (
                          <div className="flex gap-2 items-center pt-2">
                            <input
                              type="url"
                              value={mobileVideoLinkInput}
                              onChange={(e) => setMobileVideoLinkInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddVideoLink();
                                }
                              }}
                              placeholder="Nhập đường dẫn video (TikTok, YouTube, Facebook...)"
                              className="flex-1 rounded-xl border border-[#F0D7D3] bg-white px-3 py-2 text-xs font-semibold text-[#191116] placeholder:text-[#9A8B88] focus:border-[#8F0709] focus:outline-none dark:border-white/20 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-400 shadow-xs"
                            />
                            <button
                              type="button"
                              onClick={handleAddVideoLink}
                              className="light-force-white rounded-xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-4 py-2 text-xs font-black uppercase tracking-wider !text-white text-white shadow-xs hover:brightness-110 active:scale-95 transition cursor-pointer shrink-0"
                            >
                              Thêm
                            </button>
                          </div>
                        )}

                        {currentVideos.length === 0 && (!isFeaturedTab || !canAddVideo) && (
                          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs sm:text-sm font-semibold text-slate-400 dark:border-white/10 dark:text-slate-500">
                            {mobileVideoSubTab === "recent" ? "Chưa có video gần đây." : "Chưa có video nổi bật."}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Tab 3: About */}
              {mobileTab === "about" && (
                <div className="mt-3 divide-y divide-slate-100 border-y border-slate-100 dark:divide-white/10 dark:border-white/10">
                  {mobileAboutRows.map((row) => (
                    <div key={row.label} className="grid grid-cols-[36px_1fr_1.15fr] items-center gap-2 py-2.5 text-xs sm:text-sm">
                      <span className="text-[#10122f] dark:text-slate-300">{row.icon}</span>
                      <span className="font-medium text-[#85879f] dark:text-slate-400">{row.label}</span>
                      <span className="text-right font-semibold text-[#10122f] dark:text-white">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Reviews */}
              {mobileTab === "reviews" && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-[#10122f] dark:text-white">
                    <h2 className="text-sm sm:text-base font-bold">
                      Đánh giá từ đối tác <span className="font-normal text-slate-500 text-xs">({profile?.reviews?.length || 98})</span>
                    </h2>
                    <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      <Star className="h-4 w-4 fill-[#ffb13b] text-[#ffb13b]" />
                      4.8/5
                    </div>
                  </div>
                  {mobileReviewItems.map((review: any, index: number) => (
                    <div key={`${review.brand}-${index}`} className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-xs dark:border-white/10 dark:bg-[#121827]">
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-[10px] font-bold text-white uppercase dark:border-white/10">
                          {String(review.brand || "Brand").slice(0, 3)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-xs sm:text-sm font-bold leading-tight text-[#10122f] dark:text-white">{review.brand || "Thương hiệu"}</h3>
                              <p className="text-[10.5px] sm:text-[11px] font-normal text-slate-400 mt-0.5">Ngày hợp tác: {review.date || "Chưa cập nhật"}</p>
                            </div>
                            <span className="flex shrink-0 items-center gap-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              <Star className="h-3.5 w-3.5 fill-[#ffb13b] text-[#ffb13b]" />
                              {Number(review.rating || 5).toFixed(1)}/5
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2.5 text-xs sm:text-[13px] font-normal leading-relaxed text-slate-600 dark:text-slate-300">
                        “{review.comment || "Talent làm việc chuyên nghiệp và phối hợp tốt trong suốt chiến dịch."}”
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (hidden md:block): Desktop Cover Banner Header */}
      {/* ========================================================================= */}
      <div className="hidden md:block relative overflow-hidden rounded-[24px] border border-[#F0D7D3] bg-[#FAF7F6] p-0 shadow-sm backdrop-blur-md md:rounded-[32px] md:p-6 text-[#191116] dark:border-white/5 dark:bg-[#05070e]/85 dark:text-white">

        {/* Cover Background */}
        <div className="group relative h-44 w-full overflow-hidden rounded-t-[24px] border-b border-[#F0D7D3] bg-white shadow-inner sm:h-56 md:h-72 md:rounded-2xl md:border dark:border-white/5 dark:bg-[#05070e]">
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
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white border border-[#F0D7D3] hover:border-[#8F0709] text-[#8F0709] cursor-pointer shadow-sm transition-all active:scale-95 dark:bg-slate-950/80 dark:hover:bg-slate-950 dark:border-white/10 dark:text-white"
            >
              <Camera className="h-4.5 w-4.5" />
            </button>
            {openImageActionMenu === "cover" && (
              <div className="absolute right-0 bottom-full mb-2 z-50 w-40 overflow-hidden rounded-xl border border-[#F0D7D3] bg-white shadow-2xl dark:border-white/10 dark:bg-[#08090f]">
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-[#191116] transition hover:bg-[#FFF0EE] hover:text-[#8F0709] dark:text-slate-200 dark:hover:bg-white/10">
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
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs font-bold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/10"
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

        {/* Desktop Profile Info */}
        <div className="relative z-20 w-full flex-col items-start justify-between gap-6 px-3 text-left sm:px-6 md:mt-6 flex lg:flex-row lg:items-start">
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left w-full">
              
              {/* Avatar block */}
              <div className="relative shrink-0">
                <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-gradient-gold p-[3.5px] shadow-sm relative">
                  <img
                    src={normalizeBackendAssetUrl(profile.avatar) || createInitialAvatarDataUrl(profile.name || "Khách truy cập", profile.email)}
                    alt={profile.name || "Khách truy cập"}
                    onError={(event) => {
                      event.currentTarget.src = createInitialAvatarDataUrl(profile.name || "Khách truy cập", profile.email);
                    }}
                    className="h-full w-full rounded-full object-cover border border-black/10 cursor-pointer"
                    onClick={() => normalizeBackendAssetUrl(profile.avatar) && setPreviewImage(normalizeBackendAssetUrl(profile.avatar))}
                  />
                </div>

                {/* Avatar camera edit button */}
                <div className="absolute bottom-0.5 right-0.5 z-30" data-image-action-menu>
                  <button
                    type="button"
                    onClick={() => setOpenImageActionMenu(openImageActionMenu === "avatar" ? null : "avatar")}
                    className="h-9 w-9 bg-[#FFF0EE] text-[#8F0709] rounded-full border-2 border-white hover:brightness-110 active:scale-95 shadow-md flex items-center justify-center cursor-pointer transition-all dark:bg-[#F0C56B] dark:text-slate-950 dark:border-[#05070e]"
                  >
                    <Camera className="h-4.5 w-4.5" />
                  </button>
                  {openImageActionMenu === "avatar" && (
                    <div className="absolute right-0 bottom-full mb-2 z-50 w-40 overflow-hidden rounded-xl border border-[#F0D7D3] bg-white shadow-2xl dark:border-white/10 dark:bg-[#08090f]">
                      <label className="flex cursor-pointer items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-[#191116] transition hover:bg-[#FFF0EE] hover:text-[#8F0709] dark:text-slate-200 dark:hover:bg-white/10">
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
                        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs font-bold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/10"
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
                <h2 className="font-display font-black text-[#191116] text-2xl sm:text-3xl tracking-wide leading-tight text-center sm:text-left dark:text-white">
                  <span>{formatDisplayName(profile.name || "Chưa cập nhật")}</span>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#8F0709] text-white text-[10px] font-extrabold shadow-sm select-none ml-2 align-middle dark:bg-amber-400 dark:text-slate-950" title="Đã xác minh">
                    ✓
                  </span>
                </h2>
                
                <div className="flex flex-wrap justify-center items-center gap-1.5 sm:justify-start">
                  {profileTalentTypes.length ? (
                    profileTalentTypes.map((type) => (
                      <span key={type} className="inline-flex rounded-md border border-[#F0D7D3] bg-[#FFF7F6] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#8F0709] dark:border-[#C9A86A]/25 dark:bg-[#C9A86A]/10 dark:text-[#C9A86A]">
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex rounded-md border border-[#F0D7D3] bg-[#FFF7F6] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#8F0709] dark:border-[#C9A86A]/25 dark:bg-[#C9A86A]/10 dark:text-[#C9A86A]">
                      Idol mới
                    </span>
                  )}

                  {profileSocialHighlights.map((highlight) => (
                    <span key={highlight} className="inline-flex rounded-md border border-[#F0D7D3] bg-[#FFF7F6] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#8F0709] dark:border-[#C9A86A]/25 dark:bg-[#C9A86A]/10 dark:text-[#C9A86A]">
                      {highlight}
                    </span>
                  ))}

                  {profile.isOnboarded && primaryBadge && (
                    <button
                      type="button"
                      onClick={() => setIsTierDialogOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-full transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-98 cursor-pointer select-none"
                      title="Xem chi tiết danh hiệu"
                    >
                      <BadgeTier badge={primaryBadge} tier={profile.tier} seed={profile.email || profile.name} variant="gradient" />
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#F0D7D3] bg-[#FFF0EE] text-[8px] font-black text-[#8F0709] transition-colors dark:border-white/10 dark:bg-white/10 dark:text-white">
                        ?
                      </span>
                    </button>
                  )}
                </div>
                
                {/* Location & Measurements Row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-1.5 text-[11px] sm:text-xs font-bold text-[#574D54] dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#8F0709] dark:text-[#F0C56B]" />
                    <span className="text-[#191116] font-medium dark:text-slate-300">{profile.location || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Ruler className="h-4 w-4 text-[#8F0709] dark:text-[#F0C56B]" />
                    <span className="text-[#191116] font-medium dark:text-slate-300">{profile.height ? formatHeight(profile.height) : "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-[#8F0709] dark:text-[#F0C56B]" />
                    <span className="text-[#191116] font-medium dark:text-slate-300">{profile.weight ? `${profile.weight} kg` : "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-[#8F0709] dark:text-[#F0C56B]" />
                    <span className="text-[#191116] font-medium font-mono dark:text-slate-300">{formatMeasurements(profile)}</span>
                  </div>
                </div>

                {profileSkills.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                    {profileSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex rounded-md border border-[#F0D7D3] bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#574D54] dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bio (Description) Row */}
                {headerBio ? (
                  <div className="text-[11px] sm:text-xs text-[#574D54] font-medium leading-relaxed pt-2.5 border-t border-[#F0D7D3] mt-1 text-center sm:text-left dark:border-white/5 dark:text-slate-400">
                    {headerBio}
                  </div>
                ) : null}

                {/* Portfolio URL Button */}
                <div className="pt-3 flex justify-center sm:justify-start">
                  <button
                    type="button"
                    style={{ color: "#ffffff" }}
                    onClick={handleViewPortfolio}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider !text-white text-white bg-gradient-to-r from-[#E01B1F] to-[#8F0709] hover:brightness-110 hover:scale-[1.02] active:scale-98 transition-all duration-300 shadow-md cursor-pointer"
                  >
                    <Eye className="h-4 w-4 shrink-0 !text-white text-white" />
                    <span style={{ color: "#ffffff" }} className="!text-white text-white font-black tracking-wider">
                      Xem Portfolio
                    </span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Desktop Main 2 Tab Navigation */}
      <div className="hidden md:grid grid-cols-2 border-b border-[#F0D7D3] dark:border-[#151b2d]">
        <button
          onClick={() => setActiveTab("personal-info")}
          className={cn(
            "py-3 px-1 text-[10px] sm:text-xs font-black uppercase tracking-wide transition-all relative cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 text-center border-r border-[#F0D7D3] dark:border-[#151b2d]",
            activeTab === "personal-info" ? "text-[#8F0709] font-black dark:text-amber-400" : "text-[#574D54] hover:text-[#191116] dark:text-slate-400 dark:hover:text-white"
          )}
        >
          <User className="h-4 w-4 shrink-0" />
          <span className="leading-tight">Thông tin</span>
          {activeTab === "personal-info" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8F0709] dark:bg-amber-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("edit-info")}
          className={cn(
            "py-3 px-1 text-[10px] sm:text-xs font-black uppercase tracking-wide transition-all relative cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 text-center",
            activeTab === "edit-info" ? "text-[#8F0709] font-black dark:text-[#f4c430]" : "text-[#574D54] hover:text-[#191116] dark:text-slate-400 dark:hover:text-white"
          )}
        >
          <Edit3 className="h-4 w-4 shrink-0" />
          <span className="leading-tight">Cập nhật</span>
          {activeTab === "edit-info" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8F0709] dark:bg-[#f4c430] rounded-full" />
          )}
        </button>
      </div>

      {/* Main Content Area based on Tab */}
      <div>
        {activeTab === "personal-info" && (
          <div className="hidden md:block">
            <PersonalInfoTab
              profile={profile}
              setProfile={setProfile}
              addToast={addToast}
              onPreviewImage={setPreviewImage}
            />
          </div>
        )}

        {activeTab === "edit-info" && (
          <EditInfoTab
            profile={profile}
            setProfile={setProfile}
            addToast={addToast}
            setActiveTab={setActiveTab}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(null);
                }}
                style={{
                  backgroundColor: "rgba(18, 18, 22, 0.85)",
                  borderColor: "rgba(255, 255, 255, 0.35)",
                  color: "#ffffff",
                }}
                className="light-keep-white light-force-white absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border shadow-xl transition-all duration-200 hover:bg-black hover:scale-110 active:scale-95 cursor-pointer"
                title="Đóng ảnh"
              >
                <X className="h-5 w-5 !text-white text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} strokeWidth={2.5} />
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

      {/* Portfolio Selection Dialog */}
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
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
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
                  className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-left text-xs font-bold text-slate-200 transition hover:border-amber-400/40 hover:bg-amber-400/5 hover:text-amber-300 cursor-pointer"
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
