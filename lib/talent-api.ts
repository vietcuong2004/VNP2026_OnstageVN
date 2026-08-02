"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiForm, apiJson, getAuthToken, getStoredAuthUser, storeAuthUser } from "@/lib/api-client";
import { avatarFallbackForUser, createInitialAvatarDataUrl, isUsableAvatarUrl, normalizeBackendAssetUrl } from "@/lib/avatar";
import { busyDatesFromEvents, normalizeAvailabilityCalendar, normalizeBusyDates } from "@/lib/talent-calendar";

const PROFILE_STORAGE_KEY = "vnp_talent_profile";
export const TALENT_PROFILE_UPDATED_EVENT = "vnp_talent_profile_updated";

export function requireTalentSession() {
  if (!getAuthToken()) {
    throw new Error("Bạn cần đăng nhập để thực hiện thao tác này.");
  }
}

type BackendPhoto = {
  id: number;
  url?: string | null;
  path?: string | null;
  caption?: string | null;
  category?: string | null;
  is_primary?: boolean;
};

type BackendVideo = {
  id: number;
  path?: string | null;
  disk?: string | null;
  url?: string | null;
  title?: string | null;
  video_type?: string | null;
  thumbnail_url?: string | null;
};

type BackendProfile = {
  id: number;
  display_name?: string | null;
  talent_types?: string[] | null;
  city?: string | null;
  district?: string | null;
  gender?: string | null;
  birth_date?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  measurements?: Record<string, number | null> | string | null;
  skin_tone?: string | null;
  hair_color?: string | null;
  has_tattoo?: boolean | null;
  tattoo_description?: string | null;
  languages?: string[] | null;
  experience?: string | null;
  experience_years?: number | null;
  skills?: string[] | null;
  social_highlights?: string[] | null;
  bio?: string | null;
  education?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  price?: string | null;
  portfolio_url?: string | null;
  portfolio_links?: string[] | null;
  photos?: BackendPhoto[] | null;
  videos?: BackendVideo[] | null;
  social_accounts?: Array<{ platform?: string | null; url?: string | null; followers_count?: number | null; engagement_rate?: number | null }> | null;
  calendar_events?: any[] | null;
  user?: { name?: string | null; email?: string | null; phone?: string | null; external_avatar_url?: string | null } | null;
};

export function getDefaultTalentProfile() {
  const user = getStoredAuthUser<{ name?: string; email?: string; external_avatar_url?: string | null; avatar?: string | null }>();

  const fallbackAvatar = user ? (isUsableAvatarUrl(user.avatar) ? user.avatar : avatarFallbackForUser(user)) : "";

  return {
    name: user?.name || "",
    birthYear: undefined,
    location: "",
    hometown: "",
    phone: "",
    email: user?.email || "",
    avatar: fallbackAvatar,
    height: undefined,
    weight: undefined,
    bust: undefined,
    waist: undefined,
    hips: undefined,
    plasticSurgery: undefined,
    maritalStatus: "",
    education: "",
    languages: [],
    talentTypes: [],
    skills: [],
    specialSkills: [],
    socialHighlights: [],
    followersCount: 0,
    engagementRate: 0,
    profileScore: 0,
    tier: "",
    rateCard: {
      "Instagram Post": "",
      "TikTok Video": "",
      "Livestream 2h": "",
      "Event Appearance": "",
      "Catwalk Show": "",
    },
    availabilityCalendar: [],
    busyDates: [],
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
      reliability: 0,
    },
    mainCategory: "",
    verifiedLevel: "",
    isAvailable: true,
    isSuperBoosted: false,
    isPremiumBoosted: false,
    photos: [],
    videos: [],
    photoRecords: [],
    hasUploadedCatwalk: false,
    hasUploadedIntro: false,
    hasUploadedMC: false,
    price: "",
    portfolio_url: "",
    portfolioLinks: [],
    socialAccounts: [],
  };
}

function normalizePortfolioLinks(rawLinks: unknown): string[] {
  const links = Array.isArray(rawLinks)
    ? rawLinks
    : String(rawLinks || "").split(/[\n,;]+/);

  return Array.from(new Set(
    links
      .map((link) => String(link).trim())
      .filter(Boolean),
  ));
}

export function sanitizeTalentProfile(profile: any) {
  const normalizedAvatar = normalizeBackendAssetUrl(profile?.avatar);
  const normalizedCover = normalizeBackendAssetUrl(profile?.cover);
  const normalizedFullBody = normalizeBackendAssetUrl(profile?.fullBody);
  const normalizedCccdFront = normalizeBackendAssetUrl(profile?.cccdFront);
  const normalizedCccdBack = normalizeBackendAssetUrl(profile?.cccdBack);
  const normalizedCccdSelfie = normalizeBackendAssetUrl(profile?.cccdSelfie);
  const normalizedLookbook1 = normalizeBackendAssetUrl(profile?.lookbook1);
  const normalizedLookbook2 = normalizeBackendAssetUrl(profile?.lookbook2);
  const normalizedLookbook3 = normalizeBackendAssetUrl(profile?.lookbook3);
  const normalizedLookbook4 = normalizeBackendAssetUrl(profile?.lookbook4);

  const cccdUrls = [normalizedCccdFront, normalizedCccdBack, normalizedCccdSelfie].filter(Boolean) as string[];

  const photos = Array.isArray(profile?.photos)
    ? profile.photos
        .map(normalizeBackendAssetUrl)
        .filter((url: string) => isRealProfileImage(url) && !cccdUrls.includes(url))
    : profile?.photos;

  const photoRecords = Array.isArray(profile?.photoRecords)
    ? profile.photoRecords
        .map((photo: BackendPhoto) => ({
          ...photo,
          url: normalizeBackendAssetUrl(photo.url || photo.path),
        }))
        .filter((photo: BackendPhoto) => {
          const url = photo.url || photo.path;
          return !!url && isRealProfileImage(url) && photo.category !== "avatar" && photo.category !== "cover" && photo.category !== "full_body" && !photo.category?.startsWith("cccd") && !cccdUrls.includes(url);
        })
    : profile?.photoRecords;

  const avatar = isPortablePhotoUrl(normalizedAvatar)
    ? normalizedAvatar
    : createInitialAvatarDataUrl(profile?.name, profile?.email);
  const cover = isRealProfileImage(normalizedCover) ? normalizedCover : "";

  return {
    ...profile,
    name: isPlaceholderTalentName(profile?.name) ? "" : profile?.name,
    availabilityCalendar: normalizeAvailabilityCalendar(profile?.availabilityCalendar),
    busyDates: normalizeBusyDates(profile?.busyDates),
    avatar,
    cover,
    fullBody: isRealProfileImage(normalizedFullBody) ? normalizedFullBody : "",
    cccdFront: isPortablePhotoUrl(normalizedCccdFront) ? normalizedCccdFront : "",
    cccdBack: isPortablePhotoUrl(normalizedCccdBack) ? normalizedCccdBack : "",
    cccdSelfie: isPortablePhotoUrl(normalizedCccdSelfie) ? normalizedCccdSelfie : "",
    lookbook1: isRealProfileImage(normalizedLookbook1) ? normalizedLookbook1 : "",
    lookbook2: isRealProfileImage(normalizedLookbook2) ? normalizedLookbook2 : "",
    lookbook3: isRealProfileImage(normalizedLookbook3) ? normalizedLookbook3 : "",
    lookbook4: isRealProfileImage(normalizedLookbook4) ? normalizedLookbook4 : "",
    photos,
    photoRecords,
    videos: Array.isArray(profile?.videos)
      ? profile.videos.map((video: BackendVideo) => ({
          ...video,
          url: normalizeBackendAssetUrl(video.url),
          thumbnail_url: normalizeBackendAssetUrl(video.thumbnail_url),
        }))
      : [],
    portfolioLinks: normalizePortfolioLinks(profile?.portfolioLinks ?? profile?.portfolio_links ?? profile?.portfolio_url),
  };
}

function readLocalProfile() {
  const fallback = getDefaultTalentProfile();

  if (typeof window === "undefined") return fallback;

  const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!stored) return fallback;

  try {
    return sanitizeTalentProfile({ ...fallback, ...JSON.parse(stored) });
  } catch {
    return fallback;
  }
}

export function persistTalentProfile(profile: any) {
  const sanitizedProfile = sanitizeTalentProfile(profile);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(sanitizedProfile));
    window.dispatchEvent(new CustomEvent(TALENT_PROFILE_UPDATED_EVENT, { detail: sanitizedProfile }));
  }
  return sanitizedProfile;
}

function displayDate(isoDate?: string | null) {
  if (!isoDate) return undefined;
  const dateOnly = isoDate.split(/[T ]/)[0];
  const [year, month, day] = dateOnly.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

function inputDate(display?: string | null) {
  if (!display) return undefined;
  if (display.includes("-")) return display;
  const [day, month, year] = display.split("/");
  if (!day || !month || !year) return undefined;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function normalizeGender(value?: string | null) {
  if (!value) return undefined;
  const lowered = value.toLowerCase();
  if (lowered === "nữ" || lowered === "female") return "female";
  if (lowered === "nam" || lowered === "male") return "male";
  return "other";
}

function displayGender(value?: string | null) {
  if (value === "female") return "Nữ";
  if (value === "male") return "Nam";
  return value ? "Khác" : undefined;
}

function splitCsv(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeTalentTypeLabel(type: string) {
  const normalized = type.toLowerCase().trim();
  return ["pg", "pb", "pg/pb"].includes(normalized) ? "PG/PB" : type;
}

function normalizeLanguageLabel(value: string) {
  const item = String(value || "").trim();
  const proficiency = item.match(/\(([^)]+)\)/)?.[1]?.trim() || "";
  const baseInput = item.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  const lowered = baseInput.toLowerCase();
  const fullLowered = item.toLowerCase();
  let base = baseInput;

  if (
    lowered.includes("english") ||
    lowered.includes("tiếng anh") ||
    lowered.includes("tieng anh") ||
    fullLowered.includes("ielts") ||
    fullLowered.includes("toeic")
  ) {
    base = "Tiếng Anh";
  } else if (lowered.includes("vietnamese") || lowered.includes("tiếng việt") || lowered.includes("tieng viet")) {
    base = "Tiếng Việt";
  } else if (lowered.includes("korean") || lowered.includes("tiếng hàn") || lowered.includes("tieng han")) {
    base = "Tiếng Hàn";
  } else if (lowered.includes("japanese") || lowered.includes("tiếng nhật") || lowered.includes("tieng nhat")) {
    base = "Tiếng Nhật";
  } else if (lowered.includes("chinese") || lowered.includes("tiếng trung") || lowered.includes("tieng trung")) {
    base = "Tiếng Trung";
  }

  const label = proficiency ? `${base} (${proficiency})` : base;
  return label.length > 50 ? label.slice(0, 50).trim() : label;
}

function normalizeLanguages(value: string | string[] | undefined) {
  const labels = splitCsv(value).map(normalizeLanguageLabel);

  return Array.from(new Set(labels)).filter(Boolean);
}

function sumFollowers(profile: BackendProfile) {
  const accounts = profile.social_accounts || [];
  if (!accounts.length) return undefined;
  return accounts.reduce((total, account) => total + Number(account.followers_count || 0), 0);
}

function averageEngagement(profile: BackendProfile) {
  const rates = (profile.social_accounts || [])
    .map((account) => Number(account.engagement_rate || 0))
    .filter((rate) => rate > 0);

  if (!rates.length) return undefined;
  return Number((rates.reduce((total, rate) => total + rate, 0) / rates.length).toFixed(1));
}

function isPortablePhotoUrl(value: unknown) {
  const url = normalizeBackendAssetUrl(value);
  return Boolean(url) && !url.startsWith("blob:") && !isRawBackendPhotoPath(url);
}

function isMockProfileImage(value: unknown) {
  const url = String(value || "").trim();
  return url.includes("fullbody_model.png") || url.includes("cover_image.png");
}

function isRealProfileImage(value: unknown) {
  return isPortablePhotoUrl(value) && !isMockProfileImage(value);
}

function photoUrl(photo?: BackendPhoto | null) {
  const url = normalizeBackendAssetUrl(photo?.url || photo?.path || "");
  return isRealProfileImage(url) ? url : "";
}

function isRawBackendPhotoPath(value: unknown) {
  const url = String(value || "").trim();
  if (/^\/?(profiles|avatars)\//i.test(url)) return true;

  try {
    const parsed = new URL(url);
    return /^\/(profiles|avatars)\//i.test(parsed.pathname);
  } catch {
    return false;
  }
}

function bustAssetCache(url: string) {
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${Date.now()}`;
}

function isPlaceholderTalentName(value?: string | null) {
  const normalized = String(value || "").trim().toLowerCase();
  return !normalized || normalized === "talent" || normalized === "nguyễn mai anh";
}

function profileDisplayName(profile: BackendProfile, localName?: string) {
  if (!isPlaceholderTalentName(profile.user?.name)) return profile.user?.name;
  if (!isPlaceholderTalentName(profile.display_name)) return profile.display_name;
  if (!isPlaceholderTalentName(localName)) return localName;
  return "";
}

function applyLatestSurveyState(profile: any, history: TalentSurveyHistoryEntry[]) {
  const latest = history[0];
  if (!latest) return profile;

  return {
    ...profile,
    isOnboarded: true,
    tier: latest.tier || profile.tier,
    profileScore: latest.profileScore || profile.profileScore,
    mainCategory: latest.mainCategory || profile.mainCategory,
    surveyScores: {
      pageant: latest.pageant ?? profile.surveyScores?.pageant ?? 0,
      runway: latest.runway ?? profile.surveyScores?.runway ?? 0,
      kol: latest.kol ?? profile.surveyScores?.kol ?? 0,
    },
    aiSurveyAnalysis: latest.aiSurveyAnalysis ?? profile.aiSurveyAnalysis,
  };
}

function parseMeasurements(value: BackendProfile["measurements"] | string | null | undefined) {
  if (!value) return {};
  if (typeof value === "object") return value;

  const [bust, waist, hips] = value.split("-").map((item) => Number(item.trim()) || null);
  return { bust, waist, hips };
}

export function mapBackendProfile(profile: BackendProfile | null) {
  const local = readLocalProfile();
  if (!profile) return persistTalentProfile(local);

  const authUser = getStoredAuthUser<Record<string, unknown>>();
  if (authUser && profile.user?.name && authUser.name !== profile.user.name) {
    storeAuthUser({ ...authUser, name: profile.user.name });
  }

  const backendPhotos = profile.photos || [];
  const cccdFrontUrl = photoUrl([...backendPhotos].reverse().find((photo) => photo.category === "cccd_front"));
  const cccdBackUrl = photoUrl([...backendPhotos].reverse().find((photo) => photo.category === "cccd_back"));
  const cccdSelfieUrl = photoUrl([...backendPhotos].reverse().find((photo) => photo.category === "cccd_selfie"));
  const cccdUrls = [cccdFrontUrl, cccdBackUrl, cccdSelfieUrl].filter(Boolean);

  const portfolioPhotoRecords = backendPhotos.filter(
    (photo) =>
      photo.category !== "avatar" &&
      photo.category !== "cover" &&
      photo.category !== "full_body" &&
      !photo.category?.startsWith("cccd")
  );
  const photos = portfolioPhotoRecords
    .map(photoUrl)
    .filter((url: string) => isRealProfileImage(url) && !cccdUrls.includes(url)) as string[];
  const avatarUrl = photoUrl([...backendPhotos].reverse().find((photo) => photo.category === "avatar"));
  const coverUrl = photoUrl([...backendPhotos].reverse().find((photo) => photo.category === "cover"));
  const fullBodyPhotoObj = [...backendPhotos].reverse().find((photo) => photo.category === "full_body");
  const fullBodyUrl = photoUrl(fullBodyPhotoObj);
  const measurements = parseMeasurements(profile.measurements);
  const busyDates = busyDatesFromEvents(profile.calendar_events);

  const mapped = {
    ...local,
    backendProfileId: profile.id,
    name: profileDisplayName(profile, local.name),
    email: profile.user?.email || local.email,
    phone: (profile.user as any)?.phone || local.phone || "",
    avatar: avatarUrl || createInitialAvatarDataUrl(profileDisplayName(profile, local.name), profile.user?.email),
    cover: coverUrl || "",
    fullBody: fullBodyUrl || "",
    cccdFront: cccdFrontUrl || local.cccdFront || "",
    cccdBack: cccdBackUrl || local.cccdBack || "",
    cccdSelfie: cccdSelfieUrl || local.cccdSelfie || "",
    location: profile.city || "",
    hometown: profile.district || "",
    gender: displayGender(profile.gender) || "",
    dob: displayDate(profile.birth_date) || "",
    height: profile.height_cm ?? "",
    weight: profile.weight_kg ?? "",
    bust: measurements.bust ?? "",
    waist: measurements.waist ?? "",
    hips: measurements.hips ?? "",
    skinColor: profile.skin_tone || "",
    hairColor: profile.hair_color || "",
    tattoo: profile.has_tattoo ? "Có" : "Không",
    tattooDesc: profile.tattoo_description || "",
    languages: profile.languages?.length ? profile.languages : [],
    talentTypes: profile.talent_types?.length ? profile.talent_types.map((type) => normalizeTalentTypeLabel(String(type).trim())).filter(Boolean) : [],
    skills: profile.skills?.length ? profile.skills : [],
    specialSkills: profile.skills?.length ? profile.skills : [],
    socialHighlights: profile.social_highlights?.length ? profile.social_highlights : [],
    experience: profile.experience_years ?? "",
    experienceText: profile.experience || "",
    education: profile.education || "",
    bio: profile.bio || "",
    followersCount: sumFollowers(profile) ?? 0,
    engagementRate: averageEngagement(profile) ?? 0,
    availabilityCalendar: normalizeAvailabilityCalendar(local.availabilityCalendar),
    busyDates,
    photos,
    photoRecords: portfolioPhotoRecords,
    videos: (profile.videos || []).map((video: BackendVideo) => ({
      ...video,
      url: normalizeBackendAssetUrl(video.url),
      thumbnail_url: normalizeBackendAssetUrl(video.thumbnail_url),
    })),
    price: profile.price || "",
    portfolio_url: profile.portfolio_url || "",
    portfolioLinks: normalizePortfolioLinks(profile.portfolio_links ?? profile.portfolio_url),
    socialAccounts: profile.social_accounts || []
  };

  return persistTalentProfile(mapped);
}

export async function loadTalentProfile() {
  if (!getAuthToken()) return persistTalentProfile(readLocalProfile());

  try {
    const response = await apiJson<{ data: BackendProfile | null }>("/my/profile");
    const mappedProfile = mapBackendProfile(response.data);
    const history = await loadTalentSurveyHistory();
    return persistTalentProfile(applyLatestSurveyState(mappedProfile, history));
  } catch (error) {
    console.warn(error);
    return persistTalentProfile(readLocalProfile());
  }
}

export function buildBackendProfilePayload(profile: any) {
  const bust = Number(profile.bust || 0) || null;
  const waist = Number(profile.waist || 0) || null;
  const hips = Number(profile.hips || 0) || null;
  const talentTypes = splitCsv(profile.talentTypes?.length ? profile.talentTypes : profile.specialSkills).map(normalizeTalentTypeLabel);
  const portfolioLinks = normalizePortfolioLinks(profile.portfolioLinks ?? profile.portfolio_links ?? profile.portfolio_url);

  return {
    display_name: profile.name || undefined,
    email: profile.email || undefined,
    phone: profile.phone || undefined,
    talent_types: talentTypes.length ? talentTypes : ["KOL"],
    city: profile.location || undefined,
    district: profile.hometown || undefined,
    gender: normalizeGender(profile.gender),
    birth_date: inputDate(profile.dob),
    height_cm: Number(profile.height || 0) || undefined,
    weight_kg: Number(profile.weight || 0) || undefined,
    measurements: [bust, waist, hips].filter(Boolean).join("-") || undefined,
    skin_tone: profile.skinColor || undefined,
    hair_color: profile.hairColor || undefined,
    has_tattoo: profile.tattoo === "Có",
    tattoo_description: profile.tattoo === "Có" ? profile.tattooDesc || undefined : undefined,
    languages: normalizeLanguages(profile.languages),
    education: profile.education || undefined,
    experience: profile.experienceText || undefined,
    skills: splitCsv(profile.specialSkills?.length ? profile.specialSkills : profile.skills),
    social_highlights: splitCsv(profile.socialHighlights),
    experience_years: Number(profile.experience || 0) || 0,
    bio: profile.experienceText || profile.bio || undefined,
    budget_min: profile.rateCard ? Math.min(...Object.values(profile.rateCard).map(Number).filter(Boolean)) : undefined,
    budget_max: profile.rateCard ? Math.max(...Object.values(profile.rateCard).map(Number).filter(Boolean)) : undefined,
    price: profile.price || undefined,
    portfolio_url: portfolioLinks.join("\n") || undefined,
    portfolio_links: portfolioLinks,
    social_accounts: Array.isArray(profile.socialAccounts)
      ? profile.socialAccounts
        .map((a: any) => ({ platform: a.platform, url: a.url }))
        .filter((a: any) => a.platform && a.url)
      : undefined,
    is_public: true,
  };
}

export async function ensureTalentProfile(profile: any) {
  if (profile?.backendProfileId || !getAuthToken()) return persistTalentProfile(profile);

  const response = await apiJson<{ data: BackendProfile }>("/my/profile", {
    method: "PUT",
    body: JSON.stringify(buildBackendProfilePayload(profile)),
  });

  return mapBackendProfile(response.data);
}

export async function saveTalentProfile(profile: any) {
  if (!getAuthToken()) return persistTalentProfile(profile);

  try {
    const response = await apiJson<{ data: BackendProfile }>("/my/profile", {
      method: "PUT",
      body: JSON.stringify(buildBackendProfilePayload(profile)),
    });
    return mapBackendProfile(response.data);
  } catch (error) {
    console.warn(error);
    return persistTalentProfile(profile);
  }
}

export async function uploadTalentPhoto(profileId: number, file: File, category = "portfolio") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const response = await apiForm<{ data: BackendPhoto }>(`/profiles/${profileId}/photos`, formData);
  const url = photoUrl(response.data);

  return {
    ...response.data,
    url: bustAssetCache(url),
  };
}

export async function uploadTalentVideo(profileId: number, file: File, title?: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("video_type", "portfolio");
  if (title) formData.append("title", title);

  const response = await apiForm<{ data: BackendVideo }>(`/profiles/${profileId}/videos`, formData);

  return {
    ...response.data,
    url: bustAssetCache(response.data.url || ""),
  };
}

export async function createTalentVideoLink(profileId: number, url: string, title?: string) {
  const response = await apiJson<{ data: BackendVideo }>(`/profiles/${profileId}/videos`, {
    method: "POST",
    body: JSON.stringify({
      url,
      title,
      video_type: "portfolio",
    }),
  });

  return response.data;
}

export async function deleteTalentPhoto(profileId: number, photoId: number) {
  await apiJson(`/profiles/${profileId}/photos/${photoId}`, { method: "DELETE" });
}

export async function deleteTalentPhotoCategory(profileId: number, category: string) {
  await apiJson(`/profiles/${profileId}/photos/category/${encodeURIComponent(category)}`, { method: "DELETE" });
}


export async function deleteTalentVideo(profileId: number, videoId: string | number) {
  await apiJson(`/profiles/${profileId}/videos/${encodeURIComponent(String(videoId))}`, { method: "DELETE" });
}

function eventDate(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

export async function loadTalentCalendar(profile: any) {
  if (!getAuthToken()) return null;

  try {
    const response = await apiJson<{ data: any[] }>("/calendar/events");
    const events = response.data || [];
    const todoLists = events.reduce((acc: Record<string, any[]>, event) => {
      const date = eventDate(event.starts_at);
      if (!date) return acc;
      acc[date] = acc[date] || [];
      const isCampaignEvent = event.event_type === "campaign";
      acc[date].push({
        id: event.id,
        time: event.starts_at && event.ends_at ? `${event.starts_at.slice(11, 16)} - ${event.ends_at.slice(11, 16)}` : "Cả ngày",
        title: event.title,
        desc: event.description || "",
        status: event.status || "pending",
        eventType: event.event_type || "personal",
        campaignId: event.campaign_id || null,
        campaignTalentId: event.campaign_talent_id || null,
        locked: isCampaignEvent,
      });
      return acc;
    }, {});

    const availabilityCalendar = normalizeAvailabilityCalendar(profile?.availabilityCalendar);
    const busyDates = busyDatesFromEvents(events);

    return { todoLists, availabilityCalendar, busyDates };
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export async function createTalentCalendarEvent(profileId: number, date: string, task: { time?: string; title: string; desc?: string }) {
  requireTalentSession();

  const startTime = task.time?.split("-")[0]?.trim() || "09:00";
  const endTime = task.time?.split("-")[1]?.trim() || "10:00";

  const response = await apiJson<{ data: any }>("/calendar/events", {
    method: "POST",
    body: JSON.stringify({
      profile_id: profileId,
      title: task.title,
      description: task.desc || undefined,
      status: "pending",
      event_type: "task",
      starts_at: `${date}T${startTime}:00`,
      ends_at: `${date}T${endTime}:00`,
    }),
  });

  return response.data;
}

export async function updateTalentCalendarEvent(eventId: number | string, payload: { status?: string; title?: string }) {
  requireTalentSession();

  const response = await apiJson<{ data: any }>(`/calendar/events/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function deleteTalentCalendarEvent(eventId: number | string) {
  requireTalentSession();

  await apiJson(`/calendar/events/${eventId}`, { method: "DELETE" });
}

export async function loadTalentCampaigns() {
  try {
    const path = getAuthToken() ? "/talent/campaigns" : "/public/talent-campaigns";
    const response = await apiJson<{ data: any[] }>(path);
    return response.data || [];
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export async function loadTalentCampaignDetail(idOrSlug: string | number) {
  try {
    const path = getAuthToken()
      ? `/talent/campaigns/${idOrSlug}`
      : `/public/talent-campaigns/${idOrSlug}`;
    const response = await apiJson<{ data: any }>(path);
    return response.data ? mapCampaignToTalentJob(response.data) : null;
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export type TalentCampaignPaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  has_more: boolean;
  stage_counts?: {
    all: number;
    executing: number;
    recruiting: number;
    pending: number;
    completed: number;
    approved?: number;
    accepted?: number;
    confirmed?: number;
  };
};

export async function loadTalentCampaignsPage(options: {
  page?: number;
  perPage?: number;
  q?: string;
  type?: string;
  city?: string;
  minBudget?: number;
  maxBudget?: number;
  sortOrder?: "newest" | "oldest";
  stage?: "executing" | "recruiting" | "pending" | "completed";
} = {}) {
  try {
    const params = new URLSearchParams();
    params.set("page", String(options.page ?? 1));
    params.set("per_page", String(options.perPage ?? 100));
    if (options.q?.trim()) params.set("q", options.q.trim());
    if (options.type?.trim()) params.set("type", options.type.trim());
    if (options.city?.trim()) params.set("city", options.city.trim());
    if (options.minBudget) params.set("min_budget", String(options.minBudget));
    if (options.maxBudget) params.set("max_budget", String(options.maxBudget));
    if (options.sortOrder) params.set("sort", options.sortOrder);
    if (options.stage) params.set("stage", options.stage);

    const route = getAuthToken() ? "/talent/campaigns" : "/public/talent-campaigns";
    const path = `${route}?${params.toString()}`;
    const response = await apiJson<{ data: any[]; meta?: TalentCampaignPaginationMeta }>(path);
    const data = response.data || [];
    const page = options.page ?? 1;
    const perPage = options.perPage ?? 100;

    if (!response.meta) {
      const start = (page - 1) * perPage;
      const pagedData = data.slice(start, start + perPage);

      return {
        data: pagedData,
        meta: {
          current_page: page,
          per_page: perPage,
          total: data.length,
          last_page: Math.max(1, Math.ceil(data.length / perPage)),
          has_more: start + perPage < data.length,
        },
      };
    }

    return {
      data,
      meta: response.meta,
    };
  } catch (error) {
    console.warn(error);
    return {
      data: [],
      meta: {
        current_page: options.page ?? 1,
        per_page: options.perPage ?? 100,
        total: 0,
        last_page: 1,
        has_more: false,
      },
    };
  }
}

export async function applyTalentCampaign(campaignId: number | string, notes?: string, referralCode?: string | null) {
  requireTalentSession();

  const response = await apiJson<{ data: any }>(`/talent/campaigns/${campaignId}/apply`, {
    method: "POST",
    body: JSON.stringify({
      notes,
      referral_code: referralCode || undefined,
    }),
  });

  return response.data;
}

export async function updateTalentCampaignApplicationStatus(campaignId: number | string, status: "executing" | "completed") {
  requireTalentSession();

  const response = await apiJson<{ data: any }>(`/talent/campaigns/${campaignId}/application-status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

  return response.data;
}

export async function getCampaignReferralLink(campaignId: number | string) {
  requireTalentSession();

  const response = await apiJson<{ data: any }>(`/campaigns/${campaignId}/referral-link`, {
    method: "POST",
  });

  return response.data;
}

export async function resolveCampaignReferralLink(code: string) {
  const response = await apiJson<{ data: any }>(`/referral-links/${encodeURIComponent(code)}`);

  return response.data;
}

export async function resolveCampaignReferralLinkBySlug(campaignSlug: string, referrerSlug: string) {
  const response = await apiJson<{ data: any }>(
    `/referral-links/campaign/${encodeURIComponent(campaignSlug)}/${encodeURIComponent(referrerSlug)}`
  );

  return response.data;
}

export type ParsedCampaignReferralUrl =
  | {
    mode: "slug";
    campaignSlug: string;
    referrerSlug: string;
    referralCode: string;
  }
  | {
    mode: "legacy";
    campaignId: string;
    referralCode: string;
  };

export function parseCampaignReferralUrl(rawUrl: string): ParsedCampaignReferralUrl {
  let urlStr = String(rawUrl || "").trim();
  if (!urlStr) {
    throw new Error("Vui lòng dán link affiliate chiến dịch.");
  }

  if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
    urlStr = `https://${urlStr}`;
  }

  const urlObj = new URL(urlStr);
  const segments = urlObj.pathname.split("/").filter(Boolean);
  const referralCode = urlObj.searchParams.get("ref") || "";

  if (segments[0] === "ref" && segments.length >= 3) {
    return {
      mode: "slug",
      campaignSlug: segments[1],
      referrerSlug: segments[2],
      referralCode,
    };
  }

  if (segments[0] === "campaign" && segments[1]) {
    const campaignPart = segments[1];

    return {
      mode: "legacy",
      campaignId: campaignPart,
      referralCode,
    };
  }

  throw new Error("Link affiliate chiến dịch chưa đúng định dạng.");
}

export async function loadTalentBrandInvitations() {
  if (!getAuthToken()) return null;

  try {
    const response = await apiJson<{ data: any[] }>("/talent/brand-invitations");
    return response.data || [];
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export async function updateTalentBrandInvitation(invitationId: number | string, status: "active" | "inactive") {
  requireTalentSession();

  const response = await apiJson<{ data: any }>(`/talent/brand-invitations/${invitationId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

  return response.data;
}

export async function loadTalentBrandInviteLink(brandId: number | string) {
  requireTalentSession();

  const response = await apiJson<{ data: any }>(`/talent/brand-invitations/${brandId}/invite-link`);

  return response.data;
}

export async function resolveBrandTalentInviteLink(code: string, talentSlug?: string | null) {
  const path = talentSlug
    ? `/brand/talent-invite-links/${encodeURIComponent(code)}/${encodeURIComponent(talentSlug)}`
    : `/brand/talent-invite-links/${encodeURIComponent(code)}`;

  const response = await apiJson<{ data: any }>(path);
  return response.data;
}

export async function acceptBrandTalentInviteLink(code: string, talentSlug?: string | null) {
  requireTalentSession();

  const path = talentSlug
    ? `/brand/talent-invite-links/${encodeURIComponent(code)}/${encodeURIComponent(talentSlug)}/accept`
    : `/brand/talent-invite-links/${encodeURIComponent(code)}/accept`;

  const response = await apiJson<{ data: any }>(path, {
    method: "POST",
  });

  return response.data;
}

export type TalentRecommendationPageant = {
  name?: string | null;
  match_score?: number | string | null;
  reasoning?: string | null;
};

export type TalentRecommendationCareerTrend = {
  title?: string | null;
  match_score?: number | string | null;
  reasoning?: string | null;
  next_steps?: string[] | null;
};

export type TalentRecommendationsResponse = {
  tier?: string | null;
  pageants?: TalentRecommendationPageant[];
  career_trends?: TalentRecommendationCareerTrend[];
};

export async function loadTalentRecommendations() {
  if (!getAuthToken()) return null;

  try {
    return await apiJson<TalentRecommendationsResponse>("/recommendations");
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export async function submitTalentSurvey(section: string, answers: { question_code: string; answer_value: unknown }[]) {
  if (!getAuthToken() || answers.length === 0) return null;

  return apiJson<{ success: boolean; section_completed: string; answered_questions: number }>("/survey/submit", {
    method: "POST",
    body: JSON.stringify({
      section,
      answers,
    }),
  });
}

export type TalentSurveyProgress = {
  current_step: number;
  status?: "draft" | "completed" | "analyzed";
  answered_questions?: number;
  completed_sections?: string[];
  last_saved_at?: string | null;
  completed_at?: string | null;
};

export async function loadTalentSurveyProgress() {
  if (!getAuthToken()) return null;

  try {
    return await apiJson<TalentSurveyProgress>("/survey/progress", {
      clearAuthOnUnauthorized: false,
    });
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export async function saveTalentSurveyProgress(currentStep: number, status: TalentSurveyProgress["status"] = "draft") {
  if (!getAuthToken()) return null;

  try {
    return await apiJson<TalentSurveyProgress>("/survey/progress", {
      method: "PUT",
      body: JSON.stringify({
        current_step: currentStep,
        status,
      }),
    });
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export async function calculateTalentSurvey() {
  if (!getAuthToken()) return null;

  return apiJson<{ tier: string; overall_score: number; criteria_scores: Record<string, number> }>("/survey/calculate", {
    method: "POST",
  });
}

export type TalentSurveyAnalysis = {
  model?: string;
  tier?: "S" | "A" | "B" | "C" | "Potential";
  overall_score?: number;
  scores?: {
    pageant?: number;
    runway?: number;
    kol?: number;
  };
  summary?: string;
  pageants?: Array<{
    name?: string;
    match_score?: number;
    reasoning?: string;
  }>;
  career_trends?: Array<{
    title?: string;
    match_score?: number;
    reasoning?: string;
    next_steps?: string[];
  }>;
};

export type TalentSurveyHistoryEntry = {
  id: string | number;
  date: string;
  mainCategory: string;
  tier: "S" | "A" | "B" | "C" | "Potential";
  pageant: number;
  runway: number;
  kol: number;
  profileScore: number;
  aiSurveyAnalysis?: TalentSurveyAnalysis | null;
};

export async function analyzeTalentSurvey() {
  if (!getAuthToken()) return null;

  return apiJson<TalentSurveyAnalysis>("/survey/analyze", {
    method: "POST",
  });
}

export async function loadTalentSurveyHistory() {
  if (!getAuthToken()) return [];

  try {
    const response = await apiJson<{ data: TalentSurveyHistoryEntry[] }>("/survey/history", {
      clearAuthOnUnauthorized: false,
    });
    return response.data || [];
  } catch (error) {
    console.warn(error);
    return [];
  }
}

function parseCompensation(value: number) {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const formatted = Number.isInteger(millions)
      ? String(millions)
      : millions.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
    return { text: formatted, unit: "triệu/ngày" };
  }

  if (value >= 1_000) {
    const thousands = Math.round(value / 1_000);
    return { text: thousands.toLocaleString("vi-VN"), unit: "k/ngày" };
  }

  return { text: value.toLocaleString("vi-VN"), unit: "đ/ngày" };
}

function dailyCompensation(value: number) {
  const parsed = parseCompensation(value);
  return `${parsed.text} ${parsed.unit}`;
}

function moneyRange(min?: number | null, max?: number | null) {
  if (min && max) {
    const pMin = parseCompensation(min);
    const pMax = parseCompensation(max);
    if (pMin.unit === pMax.unit) {
      return `${pMin.text} - ${pMax.text} ${pMax.unit}`;
    }
    return `${pMin.text} ${pMin.unit} - ${pMax.text} ${pMax.unit}`;
  }
  if (max) return dailyCompensation(max);
  if (min) return dailyCompensation(min);
  return "Thỏa thuận";
}

function campaignColor(jobType?: string | null) {
  const normalized = String(jobType || "").toLowerCase();
  if (normalized.includes("live")) return "cyan";
  if (normalized.includes("runway") || normalized.includes("model")) return "purple";
  if (normalized.includes("mc") || normalized.includes("event")) return "rose";
  return "gold";
}

function campaignTheme(color: string) {
  const themes: Record<string, any> = {
    cyan: {
      borderColor: "border-[#143d4d] hover:border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.02)]",
      badgeColor: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
      glowColor: "from-cyan-500/5 to-transparent",
    },
    purple: {
      borderColor: "border-[#2f1c4f] hover:border-[#a855f7]/40 shadow-[0_0_15px_rgba(168,85,247,0.02)]",
      badgeColor: "bg-[#a855f7]/10 border-[#a855f7]/20 text-[#a855f7]",
      glowColor: "from-purple-500/5 to-transparent",
    },
    rose: {
      borderColor: "border-[#4f1a2d] hover:border-rose-400/40 shadow-[0_0_15px_rgba(236,72,153,0.02)]",
      badgeColor: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      glowColor: "from-rose-500/5 to-transparent",
    },
    gold: {
      borderColor: "border-[#3e3415] hover:border-amber-400/40 shadow-[0_0_15px_rgba(244,196,48,0.02)]",
      badgeColor: "bg-amber-400/10 border-amber-400/20 text-amber-400",
      glowColor: "from-amber-400/5 to-transparent",
    },
  };

  return themes[color] || themes.gold;
}

function splitBackendText(value: unknown) {
  return String(value || "")
    .split(/\r?\n|;|\./)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mapCampaignToTalentJob(campaign: any) {
  const color = campaignColor(campaign.job_type);
  const theme = campaignTheme(color);
  const budget = moneyRange(campaign.budget_min, campaign.budget_max);
  const hasBudget = Boolean(budget);
  const media = Array.isArray(campaign.media)
    ? campaign.media
      .map((item: any) => ({
        ...item,
        url: normalizeBackendAssetUrl(item?.url) || item?.url || null,
      }))
      .filter((item: any) => item.url)
    : [];
  const coverMedia = campaign.cover_media || campaign.coverMedia || media[0] || null;
  const coverUrl = normalizeBackendAssetUrl(coverMedia?.url) || coverMedia?.url || null;
  const owner = campaign.owner || {};
  const partnerProfile = owner.partner_profile || owner.partnerProfile || campaign.partner_profile || campaign.partnerProfile || {};
  const brandLogo = normalizeBackendAssetUrl(campaign.brand_logo || partnerProfile.logo_url || owner.external_avatar_url || "") || "";
  const phone = campaign.contact_phone || partnerProfile.contact_phone || partnerProfile.phone || owner.phone || "";
  const email = campaign.contact_email || partnerProfile.contact_email || partnerProfile.email || owner.email || "";
  const website = campaign.website_url || partnerProfile.website_url || partnerProfile.website || campaign.website || "";
  const requirements = splitBackendText(campaign.requirements);
  const benefits = splitBackendText(campaign.benefits);

  return {
    id: String(campaign.id),
    title: campaign.title,
    brand: campaign.brand || partnerProfile.organization_name || owner.name || "",
    brandLogo,
    type: campaign.campaign_type || campaign.job_type || "",
    startDate: campaign.start_date || "",
    endDate: campaign.end_date || "",
    publishedAt: campaign.published_at || "",
    createdAt: campaign.created_at || "",
    created_at: campaign.created_at || "",
    eventName: campaign.event_name || "",
    eventDate: campaign.event_date || "",
    deadline: campaign.application_deadline || campaign.deadline || "",
    applicationDeadline: campaign.application_deadline || "",
    city: campaign.city || "",
    roles: campaign.roles || [],
    responsibilities: campaign.responsibilities || [],
    industries: campaign.industries || [],
    targetProfiles: campaign.target_profiles || [],
    contactNote: campaign.contact_note || "",
    budget,
    budgetMin: campaign.budget_min ?? null,
    budgetMax: campaign.budget_max ?? null,
    hasBudget,
    location: campaign.location || "",
    brief: campaign.description || "",
    coverUrl,
    media,
    minHeight: 0,
    matchScore: campaign.match_score || null,
    escrowed: true,
    color,
    ...theme,
    hasApplied: Boolean(campaign.has_applied),
    application: campaign.application || null,
    referrals: campaign.referrals || [],
    detail: {
      requirements,
      benefits,
      address: campaign.location || "",
      phone,
      email,
      website,
    },
  };
}
