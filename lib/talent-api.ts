"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiForm, apiJson, getAuthToken, getStoredAuthUser } from "@/lib/api-client";
import { avatarFallbackForUser, createInitialAvatarDataUrl, isUsableAvatarUrl, normalizeBackendAssetUrl } from "@/lib/avatar";
import { busyDatesFromEvents, normalizeAvailabilityCalendar, normalizeBusyDates } from "@/lib/talent-calendar";

const PROFILE_STORAGE_KEY = "vnp_talent_profile";
export const TALENT_PROFILE_UPDATED_EVENT = "vnp_talent_profile_updated";

type BackendPhoto = {
  id: number;
  url?: string | null;
  path?: string | null;
  caption?: string | null;
  category?: string | null;
  is_primary?: boolean;
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
  bio?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  photos?: BackendPhoto[] | null;
  social_accounts?: Array<{ followers_count?: number | null; engagement_rate?: number | null }> | null;
  calendar_events?: any[] | null;
  user?: { name?: string | null; email?: string | null; external_avatar_url?: string | null } | null;
};

export function getDefaultTalentProfile() {
  const user = getStoredAuthUser<{ name?: string; email?: string; external_avatar_url?: string | null; avatar?: string | null }>();

  const fallbackAvatar = isUsableAvatarUrl(user?.avatar) ? user?.avatar : avatarFallbackForUser(user);

  return {
    name: user?.name || "Talent",
    birthYear: 2002,
    location: "Hà Nội",
    hometown: "Nam Định",
    phone: "0912345678",
    email: user?.email || "",
    avatar: fallbackAvatar,
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
    specialSkills: ["Catwalk", "MC song ngữ", "Social Content", "Pose dáng lookbook"],
    followersCount: 520000,
    engagementRate: 4.8,
    profileScore: 82,
    tier: "A",
    rateCard: {
      "Instagram Post": 3000000,
      "TikTok Video": 5000000,
      "Livestream 2h": 8000000,
      "Event Appearance": 10000000,
      "Catwalk Show": 15000000,
    },
    availabilityCalendar: [],
    busyDates: [],
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
      reliability: 96,
    },
    mainCategory: "KOL / Người mẫu ảnh / Giải trí thế hệ mới",
    verifiedLevel: "Elite",
    isAvailable: true,
    isSuperBoosted: false,
    isPremiumBoosted: false,
    photos: ["/fullbody_model.png", "/cover_image.png"],
    photoRecords: [],
    hasUploadedCatwalk: true,
    hasUploadedIntro: true,
    hasUploadedMC: true,
  };
}

export function sanitizeTalentProfile(profile: any) {
  const photos = Array.isArray(profile?.photos)
    ? profile.photos.map(normalizeBackendAssetUrl).filter(isPortablePhotoUrl)
    : profile?.photos;
  const photoRecords = Array.isArray(profile?.photoRecords)
    ? profile.photoRecords
        .map((photo: BackendPhoto) => ({
          ...photo,
          url: normalizeBackendAssetUrl(photo.url || photo.path),
        }))
        .filter((photo: BackendPhoto) => isPortablePhotoUrl(photo.url || photo.path))
    : profile?.photoRecords;
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
  const avatar = isPortablePhotoUrl(normalizedAvatar)
    ? normalizedAvatar
    : createInitialAvatarDataUrl(profile?.name, profile?.email);
  const cover = isPortablePhotoUrl(normalizedCover) ? normalizedCover : "/cover_image.png";

  return {
    ...profile,
    availabilityCalendar: normalizeAvailabilityCalendar(profile?.availabilityCalendar),
    busyDates: normalizeBusyDates(profile?.busyDates),
    avatar,
    cover,
    fullBody: isPortablePhotoUrl(normalizedFullBody) ? normalizedFullBody : "/fullbody_model.png",
    cccdFront: isPortablePhotoUrl(normalizedCccdFront) ? normalizedCccdFront : "",
    cccdBack: isPortablePhotoUrl(normalizedCccdBack) ? normalizedCccdBack : "",
    cccdSelfie: isPortablePhotoUrl(normalizedCccdSelfie) ? normalizedCccdSelfie : "",
    lookbook1: isPortablePhotoUrl(normalizedLookbook1) ? normalizedLookbook1 : "",
    lookbook2: isPortablePhotoUrl(normalizedLookbook2) ? normalizedLookbook2 : "",
    lookbook3: isPortablePhotoUrl(normalizedLookbook3) ? normalizedLookbook3 : "",
    lookbook4: isPortablePhotoUrl(normalizedLookbook4) ? normalizedLookbook4 : "",
    photos,
    photoRecords,
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
  const [year, month, day] = isoDate.split("-");
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

function normalizeLanguages(value: string | string[] | undefined) {
  const labels = splitCsv(value).map((item) => {
    const lowered = item.toLowerCase();

    if (
      lowered.includes("english") ||
      lowered.includes("tiếng anh") ||
      lowered.includes("ielts") ||
      lowered.includes("toeic") ||
      lowered.includes("thành thạo") ||
      lowered.includes("lưu loát")
    ) {
      return "Tiếng Anh";
    }

    if (lowered.includes("vietnamese") || lowered.includes("tiếng việt")) {
      return "Tiếng Việt";
    }

    if (lowered.includes("korean") || lowered.includes("tiếng hàn")) {
      return "Tiếng Hàn";
    }

    if (lowered.includes("japanese") || lowered.includes("tiếng nhật")) {
      return "Tiếng Nhật";
    }

    if (lowered.includes("chinese") || lowered.includes("tiếng trung")) {
      return "Tiếng Trung";
    }

    return item.length > 50 ? item.slice(0, 50).trim() : item;
  });

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

function photoUrl(photo?: BackendPhoto | null) {
  const url = normalizeBackendAssetUrl(photo?.url || photo?.path || "");
  return isPortablePhotoUrl(url) ? url : "";
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
  return !normalized || normalized === "talent";
}

function profileDisplayName(profile: BackendProfile, localName?: string) {
  if (!isPlaceholderTalentName(profile.display_name)) return profile.display_name;
  if (!isPlaceholderTalentName(profile.user?.name)) return profile.user?.name;
  if (!isPlaceholderTalentName(localName)) return localName;
  return "Talent";
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

  const backendPhotos = profile.photos || [];
  const portfolioPhotoRecords = backendPhotos.filter((photo) => !photo.category || photo.category === "portfolio");
  const photos = portfolioPhotoRecords
    .map(photoUrl)
    .filter(isPortablePhotoUrl) as string[];
  const avatarUrl = photoUrl([...backendPhotos].reverse().find((photo) => photo.category === "avatar"));
  const coverUrl = photoUrl([...backendPhotos].reverse().find((photo) => photo.category === "cover"));
  const fullBodyUrl = photoUrl([...backendPhotos].reverse().find((photo) => photo.category === "full_body"));
  const cccdFrontUrl = photoUrl([...backendPhotos].reverse().find((photo) => photo.category === "cccd_front"));
  const cccdBackUrl = photoUrl([...backendPhotos].reverse().find((photo) => photo.category === "cccd_back"));
  const cccdSelfieUrl = photoUrl([...backendPhotos].reverse().find((photo) => photo.category === "cccd_selfie"));
  const localPhotos = (Array.isArray(local.photos) ? local.photos : []).filter(isPortablePhotoUrl);
  const measurements = parseMeasurements(profile.measurements);
  const busyDates = busyDatesFromEvents(profile.calendar_events);

  const mapped = {
    ...local,
    backendProfileId: profile.id,
    name: profileDisplayName(profile, local.name),
    email: profile.user?.email || local.email,
    avatar: avatarUrl || local.avatar || createInitialAvatarDataUrl(profileDisplayName(profile, local.name), profile.user?.email),
    cover: coverUrl || local.cover || "/cover_image.png",
    fullBody: fullBodyUrl || local.fullBody || "/fullbody_model.png",
    cccdFront: cccdFrontUrl || local.cccdFront || "",
    cccdBack: cccdBackUrl || local.cccdBack || "",
    cccdSelfie: cccdSelfieUrl || local.cccdSelfie || "",
    location: profile.city || local.location,
    hometown: profile.district || local.hometown,
    gender: displayGender(profile.gender) || local.gender,
    dob: displayDate(profile.birth_date) || local.dob,
    height: profile.height_cm ?? local.height,
    weight: profile.weight_kg ?? local.weight,
    bust: measurements.bust ?? local.bust,
    waist: measurements.waist ?? local.waist,
    hips: measurements.hips ?? local.hips,
    skinColor: profile.skin_tone || local.skinColor,
    hairColor: profile.hair_color || local.hairColor,
    tattoo: profile.has_tattoo ? "Có" : "Không",
    tattooDesc: profile.tattoo_description || "",
    languages: profile.languages?.length ? profile.languages : local.languages,
    skills: profile.skills?.length ? profile.skills : local.skills,
    specialSkills: profile.skills?.length ? profile.skills : local.specialSkills,
    experience: profile.experience_years ?? local.experience,
    bio: profile.bio || local.bio,
    followersCount: sumFollowers(profile) ?? local.followersCount,
    engagementRate: averageEngagement(profile) ?? local.engagementRate,
    availabilityCalendar: normalizeAvailabilityCalendar(local.availabilityCalendar),
    busyDates,
    photos: photos.length ? photos : localPhotos.length ? localPhotos : ["/fullbody_model.png", "/cover_image.png"],
    photoRecords: portfolioPhotoRecords,
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

  return {
    display_name: profile.name || "Talent",
    talent_types: profile.talentTypes?.length ? profile.talentTypes : ["kol", "model"],
    city: profile.location || "Hà Nội",
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
    experience: profile.bio || profile.education || undefined,
    skills: splitCsv(profile.specialSkills?.length ? profile.specialSkills : profile.skills),
    experience_years: Number(profile.experience || 0) || 0,
    bio: profile.bio || profile.education || undefined,
    budget_min: profile.rateCard ? Math.min(...Object.values(profile.rateCard).map(Number).filter(Boolean)) : undefined,
    budget_max: profile.rateCard ? Math.max(...Object.values(profile.rateCard).map(Number).filter(Boolean)) : undefined,
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

export async function deleteTalentPhoto(profileId: number, photoId: number) {
  await apiJson(`/profiles/${profileId}/photos/${photoId}`, { method: "DELETE" });
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
  const response = await apiJson<{ data: any }>(`/calendar/events/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function deleteTalentCalendarEvent(eventId: number | string) {
  await apiJson(`/calendar/events/${eventId}`, { method: "DELETE" });
}

export async function loadTalentCampaigns() {
  if (!getAuthToken()) return null;

  try {
    const response = await apiJson<{ data: any[] }>("/talent/campaigns");
    return response.data || [];
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export async function applyTalentCampaign(campaignId: number | string, notes?: string, referralCode?: string | null) {
  const response = await apiJson<{ data: any }>(`/talent/campaigns/${campaignId}/apply`, {
    method: "POST",
    body: JSON.stringify({
      notes,
      referral_code: referralCode || undefined,
    }),
  });

  return response.data;
}

export async function getCampaignReferralLink(campaignId: number | string) {
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

function normalizeLegacyCampaignId(rawId: string) {
  let campaignId = rawId;

  if (campaignId === "c1") campaignId = "camp-1";
  if (campaignId === "c2") campaignId = "camp-2";
  if (campaignId === "c3") campaignId = "camp-3";
  if (campaignId === "c4") campaignId = "camp-4";

  return campaignId;
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
    const campaignId = campaignPart.split("-").slice(-2).join("-") === "camp-1" ||
      campaignPart.split("-").slice(-2).join("-") === "camp-2" ||
      campaignPart.split("-").slice(-2).join("-") === "camp-3" ||
      campaignPart.split("-").slice(-2).join("-") === "camp-4"
      ? campaignPart.split("-").slice(-2).join("-")
      : campaignPart.split("-").pop() || "";

    return {
      mode: "legacy",
      campaignId: normalizeLegacyCampaignId(campaignId),
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
  const response = await apiJson<{ data: any }>(`/talent/brand-invitations/${invitationId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

  return response.data;
}

export async function loadTalentBrandInviteLink(brandId: number | string) {
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

function moneyRange(min?: number | null, max?: number | null) {
  const format = (value: number) => `${value.toLocaleString("vi-VN")}đ`;
  if (min && max) return `${format(min)} - ${format(max)}`;
  if (max) return format(max);
  if (min) return `Từ ${format(min)}`;
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

export function mapCampaignToTalentJob(campaign: any) {
  const color = campaignColor(campaign.job_type);
  const theme = campaignTheme(color);
  const media = Array.isArray(campaign.media)
    ? campaign.media
        .map((item: any) => ({
          ...item,
          url: normalizeBackendAssetUrl(item?.url) || item?.url || null,
        }))
        .filter((item: any) => item.url)
    : [];
  const coverMedia = campaign.cover_media || campaign.coverMedia || media.find((item: any) => item.category === "cover") || media[0] || null;
  const coverUrl = normalizeBackendAssetUrl(coverMedia?.url) || coverMedia?.url || null;
  const requirements = String(campaign.requirements || campaign.description || "Brand sẽ cập nhật yêu cầu chi tiết sau.")
    .split(/\r?\n|;|\./)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    id: String(campaign.id),
    title: campaign.title,
    brand: campaign.brand || "Brand",
    type: campaign.campaign_type || campaign.job_type || "Campaign",
    startDate: campaign.start_date || "",
    endDate: campaign.end_date || "",
    eventName: campaign.event_name || "",
    eventDate: campaign.event_date || "",
    deadline: campaign.application_deadline || campaign.deadline || "",
    applicationDeadline: campaign.application_deadline || "",
    venueName: campaign.venue_name || "",
    venueAddress: campaign.venue_address || "",
    roles: campaign.roles || [],
    responsibilities: campaign.responsibilities || [],
    industries: campaign.industries || [],
    targetProfiles: campaign.target_profiles || [],
    contactNote: campaign.contact_note || "",
    budget: moneyRange(campaign.budget_min, campaign.budget_max),
    location: campaign.venue_name || campaign.location || campaign.city || "Linh hoạt",
    brief: campaign.description || "Campaign đang tuyển talent phù hợp.",
    coverUrl,
    media,
    minHeight: 0,
    matchScore: campaign.match_score || 82,
    escrowed: true,
    color,
    ...theme,
    hasApplied: Boolean(campaign.has_applied),
    application: campaign.application || null,
    referrals: campaign.referrals || [],
    detail: {
      requirements: requirements.length ? requirements : ["Brand sẽ cập nhật yêu cầu chi tiết sau."],
      benefits: [
        ...(campaign.benefits ? String(campaign.benefits).split(/\r?\n|;|\./).map((item) => item.trim()).filter(Boolean) : []),
        campaign.budget_min || campaign.budget_max ? `Cát-xê dự kiến: ${moneyRange(campaign.budget_min, campaign.budget_max)}.` : "Cát-xê trao đổi theo brief.",
        "Brand sẽ xem hồ sơ và phản hồi trạng thái ứng tuyển ngay trên hệ thống.",
      ],
      phases: [
        {
          title: "Ứng tuyển & duyệt hồ sơ",
          timeline: campaign.start_date && campaign.end_date ? `${campaign.start_date} - ${campaign.end_date}` : "Theo lịch brand cập nhật",
          location: campaign.location || campaign.city || "Linh hoạt",
          items: [
            "Talent gửi hồ sơ ứng tuyển qua hệ thống.",
            "Brand xem hồ sơ và cập nhật trạng thái trong danh sách campaign.",
          ],
        },
      ],
      address: campaign.location || campaign.city || "Chưa cập nhật",
      phone: "Chưa cập nhật",
      email: "Chưa cập nhật",
      website: "onstage.vn",
    },
  };
}
