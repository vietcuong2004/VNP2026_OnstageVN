"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiForm, apiJson, getAuthToken, getStoredAuthUser } from "@/lib/api-client";

const PROFILE_STORAGE_KEY = "vnp_talent_profile";

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

  return {
    name: user?.name || "Nguyễn Mai Anh",
    birthYear: 2002,
    location: "Hà Nội",
    hometown: "Nam Định",
    phone: "0912345678",
    email: user?.email || "maianh.nguyen@beautyapp.vn",
    avatar: user?.external_avatar_url || user?.avatar || "/avatar.png",
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
    ? profile.photos.filter(isPortablePhotoUrl)
    : profile?.photos;
  const photoRecords = Array.isArray(profile?.photoRecords)
    ? profile.photoRecords.filter((photo: BackendPhoto) => isPortablePhotoUrl(photo.url || photo.path))
    : profile?.photoRecords;
  const avatar = isPortablePhotoUrl(profile?.avatar) ? profile.avatar : "/avatar.png";
  const cover = isPortablePhotoUrl(profile?.cover) ? profile.cover : "/cover_image.png";

  return {
    ...profile,
    avatar,
    cover,
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
  const url = String(value || "");
  return Boolean(url) && !url.startsWith("/storage/") && !url.startsWith("data:") && !url.startsWith("blob:");
}

function photoUrl(photo?: BackendPhoto | null) {
  const url = photo?.url || photo?.path || "";
  return isPortablePhotoUrl(url) ? url : "";
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
  const localPhotos = (Array.isArray(local.photos) ? local.photos : []).filter(isPortablePhotoUrl);
  const measurements = parseMeasurements(profile.measurements);

  const mapped = {
    ...local,
    backendProfileId: profile.id,
    name: profile.display_name || profile.user?.name || local.name,
    email: profile.user?.email || local.email,
    avatar: avatarUrl || profile.user?.external_avatar_url || local.avatar || "/avatar.png",
    cover: coverUrl || local.cover || "/cover_image.png",
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
    photos: photos.length ? photos : localPhotos.length ? localPhotos : ["/fullbody_model.png", "/cover_image.png"],
    photoRecords: portfolioPhotoRecords,
  };

  return persistTalentProfile(mapped);
}

export async function loadTalentProfile() {
  if (!getAuthToken()) return persistTalentProfile(readLocalProfile());

  try {
    const response = await apiJson<{ data: BackendProfile | null }>("/my/profile");
    return mapBackendProfile(response.data);
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
    languages: splitCsv(profile.languages),
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
  return response.data;
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
      acc[date].push({
        id: event.id,
        time: event.starts_at && event.ends_at ? `${event.starts_at.slice(11, 16)} - ${event.ends_at.slice(11, 16)}` : "Cả ngày",
        title: event.title,
        desc: event.description || "",
        status: event.status || "pending",
      });
      return acc;
    }, {});

    const availabilityCalendar = Array.from(new Set([...(profile.availabilityCalendar || []), ...events.map((event) => eventDate(event.starts_at)).filter(Boolean)]));

    return { todoLists, availabilityCalendar };
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

export async function loadTalentCampaigns() {
  if (!getAuthToken()) return null;

  try {
    const response = await apiJson<{ data: any[] }>("/campaigns");
    return response.data || [];
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export async function applyTalentCampaign(campaignId: number | string, notes?: string) {
  const response = await apiJson<{ data: any }>(`/campaigns/${campaignId}/talents`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });

  return response.data;
}

export async function loadTalentRecommendations() {
  if (!getAuthToken()) return null;

  try {
    const response = await apiJson<{ tier?: string | null; pageants?: any[] }>("/recommendations");
    return response.pageants || [];
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

export async function analyzeTalentSurvey() {
  if (!getAuthToken()) return null;

  return apiJson<TalentSurveyAnalysis>("/survey/analyze", {
    method: "POST",
  });
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
  const requirements = String(campaign.requirements || campaign.description || "Brand sẽ cập nhật yêu cầu chi tiết sau.")
    .split(/\r?\n|;|\./)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    id: campaign.id,
    title: campaign.title,
    brand: campaign.brand || "Brand",
    type: campaign.job_type || "Campaign",
    budget: moneyRange(campaign.budget_min, campaign.budget_max),
    location: campaign.location || campaign.city || "Linh hoạt",
    brief: campaign.description || "Campaign đang tuyển talent phù hợp.",
    minHeight: 0,
    matchScore: campaign.match_score || 82,
    escrowed: true,
    color,
    ...theme,
    hasApplied: Boolean(campaign.has_applied),
    application: campaign.application || null,
    detail: {
      requirements: requirements.length ? requirements : ["Brand sẽ cập nhật yêu cầu chi tiết sau."],
      benefits: [
        campaign.budget_min || campaign.budget_max ? `Cát-xê dự kiến: ${moneyRange(campaign.budget_min, campaign.budget_max)}.` : "Cát-xê trao đổi theo brief.",
        "Thông tin ứng tuyển được lưu trực tiếp vào backend để brand xử lý.",
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
