"use client";

import { apiForm, apiJson, getAuthToken } from "@/lib/api-client";
import { createInitialAvatarDataUrl, isUsableAvatarUrl, normalizeBackendAssetUrl, profileAvatarFromBackend } from "@/lib/avatar";
import type { Campaign, CampaignMedia, CampaignStage, TalentProfile } from "@/lib/brand-mvp-data";

const BRAND_PROFILE_DRAFT_KEY = "onstagevn_guest_brand_profile";

type BackendUser = {
  id?: number | string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  type?: string | null;
  status?: string | null;
  is_verified?: boolean | number | null;
  is_ghost?: boolean | number | null;
  external_avatar_url?: string | null;
  parent_id?: number | string | null;
  parent?: BackendUser | null;
};

export function requireBrandSession() {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Bạn cần đăng nhập để thực hiện thao tác này.");
  }
}

type BackendProfile = {
  id?: number | string;
  full_name?: string | null;
  display_name?: string | null;
  talent_types?: string[] | null;
  city?: string | null;
  district?: string | null;
  gender?: string | null;
  birth_date?: string | null;
  height_cm?: number | string | null;
  weight_kg?: number | string | null;
  measurements?: Record<string, number | null> | string | null;
  skin_tone?: string | null;
  hair_color?: string | null;
  experience_years?: number | string | null;
  tier?: string | null;
  rating?: number | string | null;
  profile_completion?: number | string | null;
  verification_status?: string | null;
  skills?: string[] | null;
  languages?: string[] | null;
  experience?: string | null;
  bio?: string | null;
  education?: string | null;
  budget_min?: number | string | null;
  budget_max?: number | string | null;
  avatar_url?: string | null;
  price?: string | null;
  portfolio_url?: string | null;
  photos?: BackendPhoto[] | null;
  social_accounts?: BackendSocialAccount[] | null;
  calendar_events?: Array<{ starts_at?: string | null }> | null;
  user?: BackendUser | null;
  latest_survey?: {
    pageant_score?: number | null;
    runway_score?: number | null;
    kol_score?: number | null;
    profile_score?: number | null;
    tier?: string | null;
    main_category?: string | null;
  } | null;
};

type BackendPhoto = {
  id?: number | string;
  url?: string | null;
  path?: string | null;
  category?: string | null;
  is_primary?: boolean | number | null;
};

export type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  has_more: boolean;
};

export type LoadBrandTalentsOptions = {
  page?: number;
  perPage?: number;
  sort?: string;
  q?: string;
  type?: string;
  city?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
};

export type LoadBrandTalentsResult = {
  data: TalentProfile[];
  meta: PaginationMeta;
};

type BackendSocialAccount = {
  platform?: string | null;
  url?: string | null;
  followers_count?: number | string | null;
  engagement_rate?: number | string | null;
};

type BackendCampaignTalent = {
  id?: number | string;
  campaign_id?: number | string;
  profile_id?: number | string;
  referred_by_user_id?: number | string | null;
  status?: string | null;
  notes?: string | null;
  profile?: BackendProfile | null;
  referred_by?: BackendUser | null;
};

type BackendCampaign = {
  id: number | string;
  title?: string | null;
  job_type?: string | null;
  event_name?: string | null;
  campaign_type?: string | null;
  description?: string | null;
  city?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  application_deadline?: string | null;
  event_date?: string | null;
  deadline?: string | null;
  talent_quantity?: number | string | null;
  budget_min?: number | string | null;
  budget_max?: number | string | null;
  benefits?: string | null;
  requirements?: string | null;
  height_min_cm?: number | string | null;
  weight_max_kg?: number | string | null;
  experience_min_years?: number | string | null;
  roles?: string[] | null;
  responsibilities?: string[] | null;
  industries?: string[] | null;
  target_profiles?: string[] | null;
  contact_note?: string | null;
  status?: Campaign["status"] | string | null;
  talents?: BackendCampaignTalent[] | null;
  media?: BackendCampaignMedia[] | null;
  cover_media?: BackendCampaignMedia | null;
  coverMedia?: BackendCampaignMedia | null;
};

type BackendCampaignMedia = {
  id?: number | string;
  url?: string | null;
  path?: string | null;
  category?: string | null;
  caption?: string | null;
  is_primary?: boolean | number | null;
};

type BackendPartnerProfile = {
  organization_name?: string | null;
  organization_type?: string | null;
  industry?: string | null;
  website_url?: string | null;
  fanpage_url?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  city?: string | null;
  description?: string | null;
  verification_status?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
};

type BackendWishlistItem = {
  id: number | string;
  profile_id?: number | string;
  notes?: string | null;
  profile?: BackendProfile | null;
};

type BackendWishlist = {
  id: number | string;
  name?: string | null;
  description?: string | null;
  items?: BackendWishlistItem[] | null;
};

type BackendBooking = {
  id: number | string;
  campaign?: BackendCampaign | null;
  talent?: BackendUser | null;
  starts_at?: string | null;
  ends_at?: string | null;
  location?: string | null;
  compensation_amount?: number | string | null;
  platform_commission_amount?: number | string | null;
  status?: string | null;
  payment_status?: string | null;
  created_at?: string | null;
};

type BackendContactRequest = {
  id: number | string;
  status?: string | null;
  talent?: BackendUser | null;
  campaign?: BackendCampaign | null;
  created_at?: string | null;
};

export type BrandRosterTalent = {
  id: number | string;
  brand_user_id: number | string;
  talent_profile_id: number | string;
  status: "invited" | "active" | "inactive" | "blocked" | string;
  source: "manual" | "wishlist" | "campaign" | "referral" | string;
  joined_at?: string | null;
  notes?: string | null;
  talent_profile?: BackendProfile | null;
  active_term?: {
    id?: number | string;
    commission_rate?: number | string | null;
    commission_base?: string | null;
    status?: string | null;
  } | null;
  active_activation_link?: ManagedTalentActivationLink | null;
  activeActivationLink?: ManagedTalentActivationLink | null;
};

export type ManagedTalentActivationLink = {
  id: number | string;
  brand_talent_id: number | string;
  talent_user_id: number | string;
  token: string;
  url: string;
  expires_at?: string | null;
  used_at?: string | null;
  is_expired: boolean;
  conversation_id?: number | string | null;
  brand?: { id?: number | string; name?: string | null; avatar_url?: string | null } | null;
  talent?: { id?: number | string; name?: string | null; email?: string | null; phone?: string | null; is_ghost?: boolean } | null;
};

export type BrandTalentInviteLink = {
  id: number | string;
  campaign_id?: number | string | null;
  owner_user_id: number | string;
  name?: string | null;
  code: string;
  destination_path?: string | null;
  status: string;
  click_count?: number;
  conversion_count?: number;
  expires_at?: string | null;
  last_used_at?: string | null;
  url: string;
};

export type BrandCommissionTransaction = {
  id: number | string;
  campaign_id?: number | string | null;
  campaign_talent_id?: number | string | null;
  commission_plan_id?: number | string | null;
  source_type: "campaign_payout" | "referral" | "roster_management" | string;
  talent_user_id?: number | string | null;
  receiver_user_id?: number | string | null;
  level: number;
  rate: number;
  base_amount: number;
  amount: number;
  calculation_base?: string | null;
  status: "pending" | "approved" | "cancelled" | string;
  metadata?: Record<string, unknown>;
  calculated_at?: string | null;
  campaign?: { id?: number | string | null; title?: string | null } | null;
  commission_plan?: { id?: number | string | null; name?: string | null; type?: string | null } | null;
  receiver?: { id?: number | string | null; name?: string | null; type?: string | null; external_avatar_url?: string | null } | null;
  talent?: { id?: number | string | null; name?: string | null; type?: string | null; external_avatar_url?: string | null } | null;
  campaign_talent?: {
    id?: number | string | null;
    profile_id?: number | string | null;
    status?: string | null;
    profile?: {
      id?: number | string | null;
      display_name?: string | null;
      full_name?: string | null;
      user?: { id?: number | string | null; name?: string | null; type?: string | null } | null;
    } | null;
  } | null;
};

export type BrandCampaignCommissionResponse = {
  data: BrandCommissionTransaction[];
  summary: {
    total: number;
    pending: number;
    approved: number;
    cancelled: number;
    campaign_payout: number;
    referral: number;
    roster_management: number;
    talent_gross: number;
    roster_deduction: number;
    talent_net: number;
  };
  platform_fee?: {
    id?: number | string | null;
    brand_user_id?: number | string | null;
    campaign_id?: number | string | null;
    platform_fee_plan_id?: number | string | null;
    fee_type?: string | null;
    base_amount: number;
    rate: number;
    amount: number;
    status: "pending" | "approved" | "cancelled" | string;
    brand_total_payable: number;
    platform_fee_plan?: { id?: number | string | null; name?: string | null } | null;
  } | null;
  campaign?: { id?: number | string | null; title?: string | null };
  updated_count?: number;
};

type CampaignForm = {
  title: string;
  jobType: string;
  eventName?: string;
  campaignType?: string;
  city: string;
  address: string;
  startDate: string;
  endDate: string;
  deadline: string;
  applicationDeadline?: string;
  eventDate?: string;
  talentQuantity: string;
  budget: string;
  budgetMin?: string;
  budgetMax?: string;
  budgetNegotiable?: boolean;
  benefits: string;
  requirements: string;
  heightMin?: string;
  weightMax?: string;
  experienceMin?: string;
  description: string;
  roles?: string;
  responsibilities?: string;
  industries?: string;
  targetProfiles?: string;
  contactNote?: string;
};

type CampaignTalentWithProfile = Campaign["applicants"][number] & {
  id?: string;
  profileId?: string;
  referredByUserId?: string | null;
  referredByName?: string | null;
  referredByAvatar?: string | null;
  talent?: Pick<TalentProfile, "id" | "name" | "type" | "avatar" | "matchScore">;
};

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDailyCompensation(value: number) {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const formatted = Number.isInteger(millions)
      ? String(millions)
      : millions.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
    return `${formatted} triệu/ngày`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000).toLocaleString("vi-VN")}k/ngày`;
  }

  return `${value.toLocaleString("vi-VN")}đ/ngày`;
}

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")}đ`;
}

function formatBudget(min: unknown, max: unknown) {
  const budgetMin = numberOrNull(min);
  const budgetMax = numberOrNull(max);

  if (budgetMin && budgetMax && budgetMin === budgetMax) return formatDailyCompensation(budgetMin);
  if (budgetMin && budgetMax) return `${formatDailyCompensation(budgetMin)} - ${formatDailyCompensation(budgetMax)}`;
  if (budgetMax) return formatDailyCompensation(budgetMax);
  if (budgetMin) return formatDailyCompensation(budgetMin);
  return "Thỏa thuận";
}

function formatFollowers(value: number) {
  if (value >= 1000000) return `${Number((value / 1000000).toFixed(1))}M`;
  if (value >= 1000) return `${Number((value / 1000).toFixed(0))}K`;
  return String(value);
}

function repairMojibake(value: unknown) {
  if (typeof value !== "string" || !value) return value ?? "";

  const text = value.trim();
  if (!/[ÃÂÄÆ]|á»/.test(text)) return text;

  try {
    const bytes = Uint8Array.from(Array.from(text).map((char) => char.charCodeAt(0) & 0xff));
    const repaired = new TextDecoder("utf-8").decode(bytes).trim();

    if (!repaired) return text;

    const beforeNoise = (text.match(/[ÃÂÄÆ]|á»/g) || []).length;
    const afterNoise = (repaired.match(/[ÃÂÄÆ]|á»/g) || []).length;

    return afterNoise < beforeNoise ? repaired : text;
  } catch {
    return text;
  }
}

function hasSuspiciousQuestionMojibake(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return false;

  const questionMarks = (text.match(/\?/g) || []).length;
  return questionMarks >= 2 && /[A-Za-zÀ-ỹ]/u.test(text);
}

function fallbackTalentExperience(profile: BackendProfile, fallback?: TalentProfile) {
  const fallbackText = String(fallback?.experience || "").trim();
  if (fallbackText && !hasSuspiciousQuestionMojibake(fallbackText)) {
    return fallbackText;
  }

  const talentType = String(repairMojibake(profile.talent_types?.[0] || fallback?.type || "Talent")).trim();
  const city = String(repairMojibake(profile.city || fallback?.city || "")).trim();
  const skills = (profile.skills?.length ? profile.skills : fallback?.skills || [])
    .map((item) => String(repairMojibake(item)).trim())
    .filter(Boolean)
    .slice(0, 3);

  const parts = [
    talentType ? `${talentType} chuyên nghiệp` : "Talent chuyên nghiệp",
    city ? `hoạt động tại ${city}` : "",
    skills.length ? `Kỹ năng nổi bật: ${skills.join(", ")}` : "",
  ].filter(Boolean);

  return parts.join(". ") || "Talent chuyên nghiệp đang cập nhật mô tả hồ sơ.";
}

function profileAge(birthDate?: string | null) {
  if (!birthDate) return 24;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return 24;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age > 0 ? age : 24;
}

function parseMeasurements(value: BackendProfile["measurements"]) {
  if (!value) return {};
  if (typeof value === "object") return value;
  const [bust, waist, hips] = value.split("-").map((item) => Number(item.trim()) || 0);
  return { bust, waist, hips };
}

function firstPhoto(profile: BackendProfile, category?: string): string | null {
  const photos = profile.photos ?? [];
  const photo = category
    ? [...photos].reverse().find((item) => item.category === category)
    : photos[0];

  const url = normalizeBackendAssetUrl(photo?.url || photo?.path || "");
  return url || null;
}

function mapTier(value?: string | null): TalentProfile["tier"] {
  if (value === "Potential") return value;
  if (value === "S" || value === "A" || value === "B" || value === "C") return value;
  return "C";
}

function sumFollowers(profile: BackendProfile) {
  return (profile.social_accounts ?? []).reduce((total, account) => total + (Number(account.followers_count) || 0), 0);
}

function avgEngagement(profile: BackendProfile) {
  const rates = (profile.social_accounts ?? [])
    .map((account) => Number(account.engagement_rate) || 0)
    .filter((rate) => rate > 0);

  if (!rates.length) return 0;
  return Number((rates.reduce((total, rate) => total + rate, 0) / rates.length).toFixed(1));
}

function mapBackendTalent(profile: BackendProfile, fallback?: TalentProfile): TalentProfile {
  const measurements = parseMeasurements(profile.measurements);
  const followersCount = sumFollowers(profile) || fallback?.followersCount || 0;
  const engagementRate = avgEngagement(profile) || fallback?.engagementRate || 0;
  const displayName = String(repairMojibake(profile.user?.name || profile.display_name || profile.full_name || fallback?.name || "Talent"));
  const rawAvatar = profileAvatarFromBackend(profile)
    || normalizeBackendAssetUrl(profile.avatar_url)
    || normalizeBackendAssetUrl(profile.user?.external_avatar_url)
    || "";
  const avatar = isUsableAvatarUrl(rawAvatar)
    ? rawAvatar
    : createInitialAvatarDataUrl(displayName, profile.user?.email || profile.user?.name);
  const cover = firstPhoto(profile, "cover") || null;
  const portfolio = (profile.photos ?? [])
    .filter((photo) => photo.category !== 'avatar' && photo.category !== 'cover')
    .map((photo) => photo.url || photo.path || "")
    .filter(Boolean);
  const rawExperience = String(profile.experience || profile.bio || fallback?.experience || "");
  const repairedExperience = String(repairMojibake(rawExperience)).trim();
  const displayExperience = repairedExperience && !hasSuspiciousQuestionMojibake(repairedExperience)
    ? repairedExperience
    : fallbackTalentExperience(profile, fallback);
  const talentTypes = (profile.talent_types?.length ? profile.talent_types : fallback?.talentTypes || [fallback?.type || "Talent"])
    .map((item) => String(repairMojibake(item)).trim())
    .filter(Boolean);

  return {
    id: String(profile.id ?? fallback?.id ?? ""),
    name: displayName,
    type: talentTypes[0] || "Talent",
    talentTypes,
    city: String(repairMojibake(profile.city || fallback?.city || "")),
    district: String(repairMojibake(profile.district || fallback?.district || "")),
    gender: profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Nữ" : fallback?.gender || "",
    age: profileAge(profile.birth_date) || fallback?.age || 24,
    dob: profile.birth_date || fallback?.dob || "",
    height: Number(profile.height_cm) || fallback?.height || 0,
    weight: Number(profile.weight_kg) || fallback?.weight || 0,
    bust: Number(measurements.bust) || fallback?.bust || 0,
    waist: Number(measurements.waist) || fallback?.waist || 0,
    hips: Number(measurements.hips) || fallback?.hips || 0,
    skinTone: String(repairMojibake(profile.skin_tone || fallback?.skinTone || "")),
    hairColor: String(repairMojibake(profile.hair_color || fallback?.hairColor || "")),
    yearsOfExperience: Number(profile.experience_years) || fallback?.yearsOfExperience || 0,
    tier: mapTier(profile.latest_survey?.tier || profile.tier) || fallback?.tier || "C",
    verified: profile.verification_status === "verified" || Boolean(profile.user?.is_verified) || fallback?.verified || false,
    rating: Number(profile.rating) || fallback?.rating || 0,
    completedJobs: fallback?.completedJobs || 0,
    responseRate: fallback?.responseRate || 0,
    followersCount,
    followers: formatFollowers(followersCount),
    engagementRate,
    platforms: (profile.social_accounts ?? []).map((account) => account.platform || "").filter(Boolean),
    rateValue: Number(profile.budget_max || profile.budget_min) || fallback?.rateValue || 0,
    rate: formatBudget(profile.budget_min, profile.budget_max),
    rateUnit: String(repairMojibake(fallback?.rateUnit || "dự án")),
    avatar,
    cover,
    fullBodyImage: firstPhoto(profile, "full_body") || firstPhoto(profile, "lookbook") || firstPhoto(profile, "portfolio") || firstPhoto(profile) || avatar || null,
    skills: (profile.skills?.length ? profile.skills : fallback?.skills || []).map((item) => String(repairMojibake(item))),
    experience: displayExperience,
    portfolio: portfolio.length ? portfolio : fallback?.portfolio || [],
    availability: String(repairMojibake(fallback?.availability || "Chưa có lịch")),
    availabilityDates: (profile.calendar_events ?? []).map((event) => String(event.starts_at || "").slice(0, 10)).filter(Boolean),
    completion: Number(profile.profile_completion) || fallback?.completion || 0,
    matchScore: Number(profile.profile_completion) || fallback?.matchScore || 0,
    reliability: fallback?.reliability || 0,
    education: String(repairMojibake(profile.education || fallback?.education || "")),
    languages: (profile.languages?.length ? profile.languages : fallback?.languages || []).map((item) => String(repairMojibake(item))),
    rateCard: fallback?.rateCard || {},
    email: profile.user?.email || fallback?.email || "",
    phone: profile.user?.phone || fallback?.phone || "",
    portfolio_url: profile.portfolio_url || fallback?.portfolio_url || "",
    socialAccounts: (profile.social_accounts ?? [])
      .map((account) => ({ platform: account.platform || "", url: account.url || "" }))
      .filter((account) => account.platform && account.url),
    surveyScores: profile.latest_survey
      ? {
          pageant: Number(profile.latest_survey.pageant_score) || 0,
          runway: Number(profile.latest_survey.runway_score) || 0,
          kol: Number(profile.latest_survey.kol_score) || 0,
        }
      : (fallback as any)?.surveyScores || { pageant: 0, runway: 0, kol: 0 },
    mainCategory: profile.latest_survey?.main_category || (fallback as any)?.mainCategory || "",
    aiScore: Number(profile.latest_survey?.profile_score) || (fallback as any)?.aiScore || 0,
    price: profile.price || fallback?.price || "",
  };
}

function parseBudgetRange(value: string) {
  function parseCompensationPart(part: string) {
    const normalized = part.trim().toLowerCase();
    const rawNumber = normalized.match(/\d+([\.,]\d+)?/)?.[0];
    if (!rawNumber) return null;

    const number = Number(rawNumber.replace(",", "."));
    if (!Number.isFinite(number) || number <= 0) return null;

    if (normalized.includes("triệu") || normalized.includes("trieu")) return Math.round(number * 1_000_000);
    if (/\bk\b/.test(normalized) || normalized.includes("k/")) return Math.round(number * 1_000);

    return Math.round(Number(normalized.replace(/[^\d]/g, ""))) || null;
  }

  const numbers = value
    .split("-")
    .map(parseCompensationPart)
    .filter((part): part is number => Number.isFinite(part) && Number(part) > 0);

  return {
    budget_min: numbers[0] ?? null,
    budget_max: numbers[1] ?? numbers[0] ?? null,
  };
}

function mapTalentStage(status?: string | null): CampaignStage {
  if (status === "accepted" || status === "approved") return "accepted";
  if (status === "confirmed") return "confirmed";
  if (status === "executing") return "executing";
  if (status === "completed") return "completed";
  return "new";
}

function mapCampaignStatus(status?: string | null): Campaign["status"] {
  if (status === "published" || status === "closed") return status;
  return "draft";
}

function mapCampaignMedia(media?: BackendCampaignMedia | null): CampaignMedia | null {
  if (!media) return null;

  return {
    id: media.id,
    url: normalizeBackendAssetUrl(media.url) || media.url || null,
    path: media.path || null,
    category: media.category || null,
    caption: media.caption || null,
    is_primary: Boolean(media.is_primary),
  };
}

function displayApplicationNote(value?: string | null) {
  const note = String(value || "").trim();
  if (note === "Toi rat quan tam va mong muon ung tuyen thuc hien chien dich nay.") {
    return "Tôi rất quan tâm và mong muốn ứng tuyển thực hiện chiến dịch này.";
  }

  if (note === "Dang ky tham gia qua link gioi thieu Affiliate.") {
    return "Đăng ký tham gia qua link giới thiệu Affiliate.";
  }

  return note;
}

function mapCampaignTalent(item: BackendCampaignTalent, index: number): CampaignTalentWithProfile {
  const profile = item.profile;
  const user = profile?.user;
  const id = String(profile?.id ?? item.id ?? `talent-${index + 1}`);
  const name = user?.name || profile?.display_name || profile?.full_name || `Talent #${id}`;
  const stage = mapTalentStage(item.status);

  return {
    id: item.id ? String(item.id) : undefined,
    profileId: profile?.id ? String(profile.id) : item.profile_id ? String(item.profile_id) : undefined,
    referredByUserId: item.referred_by_user_id ? String(item.referred_by_user_id) : null,
    referredByName: item.referred_by?.name || null,
    referredByAvatar: item.referred_by?.external_avatar_url || null,
    talentId: id,
    stage,
    note: displayApplicationNote(item.notes),
    talent: {
      id,
      name,
      type: user?.type || "Talent",
      avatar: (() => {
        const rawAvatar = profile
          ? profileAvatarFromBackend(profile)
          || normalizeBackendAssetUrl(profile.avatar_url)
          || normalizeBackendAssetUrl(user?.external_avatar_url)
          || ""
          : normalizeBackendAssetUrl(user?.external_avatar_url) || "";

        return isUsableAvatarUrl(rawAvatar)
          ? rawAvatar
          : createInitialAvatarDataUrl(name, user?.email || user?.name || "");
      })(),
      matchScore: 0,
    },
  };
}

export function mapBackendCampaign(campaign: BackendCampaign): Campaign {
  const applicants = (campaign.talents ?? []).map(mapCampaignTalent);
  const shortlistedTalentIds = applicants
    .filter((item) => item.stage !== "new")
    .map((item) => item.talentId);
  const budgetMax = numberOrNull(campaign.budget_max);
  const budgetMin = numberOrNull(campaign.budget_min);
  const media = (campaign.media ?? []).map(mapCampaignMedia).filter(Boolean) as CampaignMedia[];
  const coverMedia = mapCampaignMedia(campaign.cover_media ?? campaign.coverMedia ?? null)
    ?? media.find((item) => item.category === "cover" && item.is_primary)
    ?? media.find((item) => item.category === "cover")
    ?? media[0]
    ?? null;

  return {
    id: String(campaign.id),
    title: campaign.title || "Campaign mới",
    jobType: campaign.job_type || "Campaign",
    eventName: campaign.event_name || "",
    campaignType: campaign.campaign_type || campaign.job_type || "Campaign",
    city: campaign.city || "",
    address: campaign.location || campaign.city || "",
    startDate: campaign.start_date || "",
    endDate: campaign.end_date || "",
    deadline: campaign.application_deadline || campaign.deadline || "",
    applicationDeadline: campaign.application_deadline || campaign.deadline || "",
    eventDate: campaign.event_date || "",
    talentQuantity: Number(campaign.talent_quantity) || 1,
    budget: formatBudget(campaign.budget_min, campaign.budget_max),
    budgetValue: budgetMax ?? budgetMin ?? 0,
    benefits: campaign.benefits || "Thỏa thuận theo brief",
    status: mapCampaignStatus(campaign.status),
    shortlistedTalentIds,
    applicants,
    contactRequests: 0,
    description: campaign.description || "Chưa có mô tả brief.",
    requirements: campaign.requirements || "Chưa có yêu cầu chi tiết.",
    heightMinCm: numberOrNull(campaign.height_min_cm),
    weightMaxKg: numberOrNull(campaign.weight_max_kg),
    experienceMinYears: numberOrNull(campaign.experience_min_years),
    roles: campaign.roles || [],
    responsibilities: campaign.responsibilities || [],
    industries: campaign.industries || [],
    targetProfiles: campaign.target_profiles || [],
    contactNote: campaign.contact_note || "",
    views: 0,
    media,
    coverMedia,
  };
}

export function mapBackendPartnerProfile(profile: BackendPartnerProfile | null | undefined) {
  return {
    organizationName: profile?.organization_name || "",
    organizationType: profile?.organization_type || "brand",
    industry: profile?.industry || "",
    websiteUrl: profile?.website_url || "",
    fanpageUrl: profile?.fanpage_url || "",
    contactName: profile?.contact_name || "",
    contactPhone: profile?.contact_phone || "",
    contactEmail: profile?.contact_email || "",
    city: profile?.city || "",
    description: profile?.description || "",
    verificationStatus: profile?.verification_status || "pending",
    logoUrl: normalizeBackendAssetUrl(profile?.logo_url || ""),
    coverUrl: normalizeBackendAssetUrl(profile?.cover_url || ""),
  };
}

type BrandPartnerProfile = ReturnType<typeof mapBackendPartnerProfile>;

function hasUsefulBrandDraft(profile: BrandPartnerProfile) {
  return [
    profile.organizationName,
    profile.industry,
    profile.websiteUrl,
    profile.fanpageUrl,
    profile.contactName,
    profile.contactPhone,
    profile.contactEmail,
    profile.city,
    profile.description,
  ].some((value) => String(value || "").trim() !== "");
}

function isLegacyMockBrandDraft(profile: Partial<BrandPartnerProfile>) {
  const haystack = [
    profile.organizationName,
    profile.websiteUrl,
    profile.fanpageUrl,
    profile.contactEmail,
    profile.contactPhone,
    profile.description,
  ]
    .map((value) => String(value || "").toLowerCase())
    .join(" ");

  return (
    haystack.includes("loreal") ||
    haystack.includes("l'or") ||
    haystack.includes("0901234567") ||
    haystack.includes("mỹ phẩm và chăm sóc sắc đẹp")
  );
}

export function loadGuestBrandProfileDraft(fallback: BrandPartnerProfile) {
  if (typeof window === "undefined") return fallback;

  const raw = window.localStorage.getItem(BRAND_PROFILE_DRAFT_KEY);
  if (!raw) return fallback;

  try {
    const draft = JSON.parse(raw) as Partial<BrandPartnerProfile>;
    if (isLegacyMockBrandDraft(draft)) {
      window.localStorage.removeItem(BRAND_PROFILE_DRAFT_KEY);
      return fallback;
    }

    return { ...fallback, ...draft };
  } catch {
    window.localStorage.removeItem(BRAND_PROFILE_DRAFT_KEY);
    return fallback;
  }
}

export function persistGuestBrandProfileDraft(profile: BrandPartnerProfile) {
  if (typeof window === "undefined") return profile;

  window.localStorage.setItem(BRAND_PROFILE_DRAFT_KEY, JSON.stringify(profile));
  return profile;
}

export function clearGuestBrandProfileDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(BRAND_PROFILE_DRAFT_KEY);
}

export function hasGuestBrandProfileDraft() {
  if (typeof window === "undefined") return false;

  const raw = window.localStorage.getItem(BRAND_PROFILE_DRAFT_KEY);
  if (!raw) return false;

  try {
    return hasUsefulBrandDraft(JSON.parse(raw) as BrandPartnerProfile);
  } catch {
    return false;
  }
}

function buildPartnerProfilePayload(profile: ReturnType<typeof mapBackendPartnerProfile>) {
  return {
    organization_name: profile.organizationName,
    organization_type: profile.organizationType,
    industry: profile.industry || null,
    website_url: profile.websiteUrl || null,
    fanpage_url: profile.fanpageUrl || null,
    contact_name: profile.contactName,
    contact_phone: profile.contactPhone || null,
    contact_email: profile.contactEmail,
    city: profile.city,
    description: profile.description || null,
  };
}

export function mapBackendWishlist(wishlist: BackendWishlist, fallbackTalents: TalentProfile[] = []) {
  const items = wishlist.items ?? [];
  const notes: Record<string, string> = {};
  const savedIds = items
    .map((item) => {
      const profile = item.profile;
      const id = String(profile?.id ?? item.profile_id ?? "");
      if (id && item.notes) notes[id] = item.notes;
      return id;
    })
    .filter(Boolean);

  const talents = items
    .map((item, index) => item.profile ? mapBackendTalent(item.profile, fallbackTalents[index]) : null)
    .filter(Boolean) as TalentProfile[];

  return {
    id: String(wishlist.id),
    name: wishlist.name || "Talent đã lưu",
    description: wishlist.description || "",
    savedIds,
    notes,
    talents,
    items,
  };
}

export function mapBackendBooking(booking: BackendBooking) {
  const amount = numberOrNull(booking.compensation_amount);

  return {
    id: String(booking.id),
    campaignTitle: booking.campaign?.title || "Booking không gắn campaign",
    talentName: booking.talent?.name || "Talent",
    startsAt: booking.starts_at || "",
    endsAt: booking.ends_at || "",
    location: booking.location || booking.campaign?.location || booking.campaign?.city || "",
    amountText: amount ? formatMoney(amount) : "Thỏa thuận",
    status: booking.status || "pending",
    paymentStatus: booking.payment_status || "pending",
    createdAt: booking.created_at || "",
  };
}

function buildCampaignPayload(form: CampaignForm) {
  const budget = parseBudgetRange(form.budget);
  const explicitBudgetMin = numberOrNull(form.budgetMin);
  const explicitBudgetMax = numberOrNull(form.budgetMax);
  const parsedBudgetMax = budget.budget_max !== budget.budget_min ? budget.budget_max : null;
  const budgetMin = form.budgetNegotiable ? null : explicitBudgetMin ?? (explicitBudgetMax === null ? budget.budget_min : null);
  const budgetMax = form.budgetNegotiable ? null : explicitBudgetMax ?? (explicitBudgetMin === null ? parsedBudgetMax : null);
  const listFromText = (value?: string) => String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    title: form.title || "Campaign mới",
    job_type: form.jobType,
    description: form.description || "Chưa có mô tả brief.",
    event_name: form.eventName || null,
    city: form.city,
    location: form.address || form.city,
    start_date: form.startDate || null,
    end_date: form.endDate || null,
    application_deadline: form.applicationDeadline || form.deadline || null,
    event_date: form.eventDate || null,
    talent_quantity: Number(form.talentQuantity) || 1,
    budget_min: budgetMin,
    budget_max: budgetMax,
    benefits: form.benefits || null,
    requirements: form.requirements || "Chưa có yêu cầu chi tiết.",
    height_min_cm: numberOrNull(form.heightMin),
    weight_max_kg: numberOrNull(form.weightMax),
    experience_min_years: numberOrNull(form.experienceMin),
    roles: listFromText(form.roles),
    responsibilities: listFromText(form.responsibilities),
    industries: listFromText(form.industries),
    target_profiles: listFromText(form.targetProfiles),
    contact_note: form.contactNote || null,
  };
}

function isBackendRecordId(id?: string | number | null) {
  return /^\d+$/.test(String(id || ""));
}

export async function loadBrandCampaigns(fallback: Campaign[] = []) {
  if (!getAuthToken()) return fallback;

  try {
    const response = await apiJson<{ data: BackendCampaign[] }>("/campaigns");
    const items = (response.data ?? []).map(mapBackendCampaign);
    return items.length > 0 ? items : fallback;
  } catch (error) {
    console.warn("Cannot load brand campaigns", error);
    return fallback;
  }
}

export async function loadBrandCampaign(id: string, fallback: Campaign[] = []) {
  if (!getAuthToken()) return fallback.find((campaign) => campaign.id === id) ?? null;
  if (!isBackendRecordId(id)) return fallback.find((campaign) => campaign.id === id) ?? null;

  try {
    const response = await apiJson<{ data: BackendCampaign }>(`/campaigns/${id}`);
    return mapBackendCampaign(response.data);
  } catch (error) {
    console.warn("Cannot load brand campaign", error);
    return fallback.find((campaign) => campaign.id === id) ?? null;
  }
}

export async function createBrandCampaign(form: CampaignForm) {
  requireBrandSession();

  const response = await apiJson<{ data: BackendCampaign }>("/campaigns", {
    method: "POST",
    body: JSON.stringify(buildCampaignPayload(form)),
  });

  return mapBackendCampaign(response.data);
}

export async function updateBrandCampaign(id: string, form: CampaignForm) {
  requireBrandSession();
  if (!isBackendRecordId(id)) throw new Error("Campaign này đang là dữ liệu local, chưa có ID backend.");

  const response = await apiJson<{ data: BackendCampaign }>(`/campaigns/${id}`, {
    method: "PUT",
    body: JSON.stringify(buildCampaignPayload(form)),
  });

  return mapBackendCampaign(response.data);
}

export async function publishBrandCampaign(id: string) {
  requireBrandSession();
  if (!isBackendRecordId(id)) throw new Error("Campaign này đang là dữ liệu local, chưa có ID backend.");

  const response = await apiJson<{ data: BackendCampaign }>(`/campaigns/${id}/publish`, {
    method: "POST",
  });

  return mapBackendCampaign(response.data);
}

export async function closeBrandCampaign(id: string) {
  requireBrandSession();
  if (!isBackendRecordId(id)) throw new Error("Campaign này đang là dữ liệu local, chưa có ID backend.");

  const response = await apiJson<{ data: BackendCampaign }>(`/campaigns/${id}/close`, {
    method: "POST",
  });

  return mapBackendCampaign(response.data);
}

export async function deleteBrandCampaign(id: string) {
  requireBrandSession();
  if (!isBackendRecordId(id)) throw new Error("Campaign này đang là dữ liệu local, chưa có ID backend.");

  await apiJson<void>(`/campaigns/${id}`, {
    method: "DELETE",
  });
}

export async function uploadBrandCampaignMedia(
  campaignId: string,
  file: File,
  options: { category?: "cover" | "gallery" | "brief"; caption?: string; isPrimary?: boolean } = {},
) {
  requireBrandSession();
  if (!isBackendRecordId(campaignId)) throw new Error("Campaign này đang là dữ liệu local, chưa có ID backend.");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", options.category || "cover");
  if (options.caption) formData.append("caption", options.caption);
  if (options.isPrimary !== undefined) formData.append("is_primary", options.isPrimary ? "1" : "0");

  const response = await apiForm<{ data: BackendCampaignMedia }>(`/campaigns/${campaignId}/media`, formData);

  return mapCampaignMedia(response.data);
}

export async function deleteBrandCampaignMedia(campaignId: string, mediaId: string | number) {
  requireBrandSession();
  if (!isBackendRecordId(campaignId)) throw new Error("Campaign này đang là dữ liệu local, chưa có ID backend.");

  await apiJson<void>(`/campaigns/${campaignId}/media/${mediaId}`, {
    method: "DELETE",
  });
}

function buildTalentSearchParams(options: LoadBrandTalentsOptions = {}) {
  const params = new URLSearchParams();

  params.set("page", String(options.page ?? 1));
  params.set("per_page", String(options.perPage ?? 20));
  params.set("sort", options.sort ?? "match");

  if (options.q?.trim()) params.set("q", options.q.trim());
  if (options.type?.trim()) params.set("type", options.type.trim());
  if (options.city?.trim()) params.set("city", options.city.trim());
  if (options.gender?.trim()) params.set("gender", options.gender.trim());
  if (options.minAge) params.set("min_age", String(options.minAge));
  if (options.maxAge) params.set("max_age", String(options.maxAge));
  if (options.minHeight) params.set("min_height", String(options.minHeight));
  if (options.maxHeight) params.set("max_height", String(options.maxHeight));

  return params;
}

function fallbackPaginationMeta(options: LoadBrandTalentsOptions, count: number): PaginationMeta {
  return {
    current_page: options.page ?? 1,
    per_page: options.perPage ?? count,
    total: count,
    last_page: 1,
    has_more: false,
  };
}

export async function loadBrandTalentsPage(
  options: LoadBrandTalentsOptions = {},
  fallback: TalentProfile[] = [],
): Promise<LoadBrandTalentsResult> {
  try {
    const params = buildTalentSearchParams(options);
    const response = await apiJson<{ data: BackendProfile[]; meta?: PaginationMeta }>(`/talents?${params.toString()}`);
    const items = (response.data ?? []).map((profile, index) => mapBackendTalent(profile, fallback[index]));
    const data = items.length > 0 ? items : fallback;

    return {
      data,
      meta: response.meta ?? fallbackPaginationMeta(options, data.length),
    };
  } catch (error) {
    console.warn("Cannot load brand talents", error);
    return {
      data: fallback,
      meta: fallbackPaginationMeta(options, fallback.length),
    };
  }
}

export async function loadBrandTalents(fallback: TalentProfile[] = []) {
  const response = await loadBrandTalentsPage({ page: 1, perPage: 24, sort: "match" }, fallback);
  return response.data;
}

export async function loadBrandRosterTalents() {
  requireBrandSession();

  const response = await apiJson<{ data: BrandRosterTalent[] }>("/brand/talents");
  return response.data ?? [];
}

export async function addBrandRosterTalent(profileId: string, notes?: string) {
  requireBrandSession();

  const response = await apiJson<{ data: BrandRosterTalent }>("/brand/talents", {
    method: "POST",
    body: JSON.stringify({
      profile_id: profileId,
      status: "active",
      notes,
    }),
  });

  return response.data;
}

export interface CreateManagedTalentPayload {
  name: string;
  phone?: string;
  city: string;
  talent_types: string[];
  notes?: string;
  avatar?: File | null;
}

export async function createBrandManagedTalent(payload: CreateManagedTalentPayload) {
  requireBrandSession();

  const formData = new FormData();
  formData.append("display_name", payload.name);
  if (payload.phone) formData.append("phone", payload.phone);
  if (payload.city) formData.append("city", payload.city);
  payload.talent_types.forEach((type) => formData.append("talent_types[]", type));
  if (payload.notes) formData.append("notes", payload.notes);
  if (payload.avatar) formData.append("avatar", payload.avatar);

  const response = await apiForm<{ data: BrandRosterTalent }>("/brand/talents/quick-create", formData);

  return response.data;
}

export async function updateBrandRosterTalent(
  rosterTalentId: string,
  payload: { status?: BrandRosterTalent["status"]; notes?: string | null },
) {
  requireBrandSession();

  const response = await apiJson<{ data: BrandRosterTalent }>(`/brand/talents/${rosterTalentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export interface UpdateManagedTalentPayload {
  name?: string;
  phone?: string;
  city?: string;
  talent_types?: string[];
  notes?: string | null;
}

export async function updateBrandManagedTalent(
  rosterTalentId: string,
  payload: UpdateManagedTalentPayload,
) {
  requireBrandSession();

  const response = await apiJson<{ data: BrandRosterTalent }>(`/brand/talents/${rosterTalentId}`, {
    method: "PUT",
    body: JSON.stringify({
      display_name: payload.name,
      phone: payload.phone || null,
      city: payload.city || null,
      talent_types: payload.talent_types,
      notes: payload.notes ?? null,
    }),
  });

  return response.data;
}

export async function removeBrandRosterTalent(rosterTalentId: string) {
  requireBrandSession();

  await apiJson(`/brand/talents/${rosterTalentId}`, {
    method: "DELETE",
  });
}

export async function createManagedTalentActivationLink(rosterTalentId: string, options: { force?: boolean } = {}) {
  requireBrandSession();

  const response = await apiJson<{ data: ManagedTalentActivationLink }>(`/brand/talents/${rosterTalentId}/activation-link`, {
    method: "POST",
    body: JSON.stringify({ force: Boolean(options.force) }),
  });

  return response.data;
}

export async function loadBrandTalentInviteLink() {
  requireBrandSession();

  const response = await apiJson<{ data: BrandTalentInviteLink }>("/brand/talent-invite-link");
  return response.data;
}

export async function createBrandTalentInviteLink() {
  requireBrandSession();

  const response = await apiJson<{ data: BrandTalentInviteLink }>("/brand/talent-invite-link", {
    method: "POST",
  });

  return response.data;
}

export async function loadBrandTalent(id: string, fallback?: TalentProfile | null) {
  try {
    const response = await apiJson<{ data: BackendProfile }>(`/talents/${id}`);
    return mapBackendTalent(response.data, fallback ?? undefined);
  } catch (error) {
    console.warn("Cannot load brand talent", error);
    return fallback ?? null;
  }
}

export async function loadBrandPartnerProfile(fallback: ReturnType<typeof mapBackendPartnerProfile>) {
  if (!getAuthToken()) return loadGuestBrandProfileDraft(fallback);

  try {
    const response = await apiJson<{ data: BackendPartnerProfile | null }>("/partner/profile");
    return mapBackendPartnerProfile(response.data) || fallback;
  } catch (error) {
    console.warn("Cannot load brand profile", error);
    return fallback;
  }
}

export async function saveBrandPartnerProfile(profile: ReturnType<typeof mapBackendPartnerProfile>) {
  if (!getAuthToken()) return persistGuestBrandProfileDraft(profile);

  requireBrandSession();

  const response = await apiJson<{ data: BackendPartnerProfile }>("/partner/profile", {
    method: "PUT",
    body: JSON.stringify(buildPartnerProfilePayload(profile)),
  });

  return mapBackendPartnerProfile(response.data);
}

export async function uploadBrandProfileLogo(file: File) {
  requireBrandSession();

  const formData = new FormData();
  formData.append("file", file);

  const response = await apiForm<{ data: BackendPartnerProfile }>("/partner/profile/logo", formData);

  return mapBackendPartnerProfile(response.data);
}

export async function uploadBrandProfileCover(file: File) {
  requireBrandSession();

  const formData = new FormData();
  formData.append("file", file);

  const response = await apiForm<{ data: BackendPartnerProfile }>("/partner/profile/cover", formData);

  return mapBackendPartnerProfile(response.data);
}

export async function loadBrandWishlists(fallbackTalents: TalentProfile[] = []) {
  if (!getAuthToken()) return [];

  try {
    const response = await apiJson<{ data: BackendWishlist[] }>("/wishlists");
    return (response.data ?? []).map((wishlist) => mapBackendWishlist(wishlist, fallbackTalents));
  } catch (error) {
    console.warn("Cannot load brand wishlists", error);
    return [];
  }
}

export async function createBrandWishlist(name = "Talent đã lưu", description?: string) {
  requireBrandSession();

  const response = await apiJson<{ data: BackendWishlist }>("/wishlists", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });

  return mapBackendWishlist(response.data);
}

export async function addTalentToWishlist(wishlistId: string, profileId: string, notes?: string) {
  requireBrandSession();

  const response = await apiJson<{ data: BackendWishlistItem }>(`/wishlists/${wishlistId}/items`, {
    method: "POST",
    body: JSON.stringify({
      profile_id: profileId,
      notes: notes || undefined,
    }),
  });

  return response.data;
}

export async function removeTalentFromWishlist(wishlistId: string, itemId: string) {
  requireBrandSession();

  await apiJson(`/wishlists/${wishlistId}/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function loadBrandBookings() {
  if (!getAuthToken()) return [];

  try {
    const response = await apiJson<{ data: BackendBooking[] }>("/bookings");
    return (response.data ?? []).map(mapBackendBooking);
  } catch (error) {
    console.warn("Cannot load brand bookings", error);
    return [];
  }
}

export async function loadBrandContactRequests() {
  if (!getAuthToken()) return [];

  try {
    const response = await apiJson<{ data: BackendContactRequest[] }>("/contact-requests");
    return response.data ?? [];
  } catch (error) {
    console.warn("Cannot load brand contact requests", error);
    return [];
  }
}

export async function addTalentToBrandCampaign(campaignId: string, profileId: string, notes?: string) {
  requireBrandSession();

  if (!isBackendRecordId(campaignId) || !isBackendRecordId(profileId)) {
    return {
      id: `local-${campaignId}-${profileId}`,
      campaign_id: campaignId,
      profile_id: profileId,
      status: "accepted",
      notes,
    } as BackendCampaignTalent;
  }

  const response = await apiJson<{ data: BackendCampaignTalent }>(`/campaigns/${campaignId}/talents`, {
    method: "POST",
    body: JSON.stringify({
      profile_id: profileId,
      status: "accepted",
      notes,
    }),
  });

  return response.data;
}

export async function updateBrandCampaignTalent(
  campaignId: string,
  campaignTalentId: string,
  payload: { status?: CampaignStage; notes?: string; referredByUserId?: string | null },
) {
  requireBrandSession();
  if (!isBackendRecordId(campaignId) || !isBackendRecordId(campaignTalentId)) {
    throw new Error("Ứng viên này đang là dữ liệu local, chưa có ID backend.");
  }

  const response = await apiJson<{ data: BackendCampaignTalent }>(`/campaigns/${campaignId}/talents/${campaignTalentId}`, {
    method: "PUT",
    body: JSON.stringify({
      status: payload.status,
      notes: payload.notes,
      referred_by_user_id: payload.referredByUserId || null,
    }),
  });

  return response.data;
}

export async function removeBrandCampaignTalent(campaignId: string, campaignTalentId: string) {
  requireBrandSession();
  if (!isBackendRecordId(campaignId) || !isBackendRecordId(campaignTalentId)) {
    return true;
  }

  await apiJson(`/campaigns/${campaignId}/talents/${campaignTalentId}`, {
    method: "DELETE",
  });
}

export async function createBrandContactRequest(profileId: string, campaignId?: string, message?: string) {
  requireBrandSession();

  if (!isBackendRecordId(profileId)) {
    return {
      id: `local-contact-${profileId}`,
      profile_id: profileId,
      campaign_id: isBackendRecordId(campaignId) ? campaignId : undefined,
      message,
    };
  }

  const response = await apiJson<{ data: unknown }>("/contact-requests", {
    method: "POST",
    body: JSON.stringify({
      profile_id: profileId,
      campaign_id: isBackendRecordId(campaignId) ? campaignId : undefined,
      message,
    }),
  });

  return response.data;
}

export async function loadBrandCampaignCommissions(campaignId: string) {
  requireBrandSession();
  if (!isBackendRecordId(campaignId)) throw new Error("Campaign này đang là dữ liệu local, chưa có ID backend.");

  return apiJson<BrandCampaignCommissionResponse>(`/campaigns/${campaignId}/commission-transactions`);
}

export async function settleBrandCampaign(campaignId: string, settlementAmount: number) {
  requireBrandSession();
  if (!isBackendRecordId(campaignId)) throw new Error("Campaign này đang là dữ liệu local, chưa có ID backend.");

  return apiJson<BrandCampaignCommissionResponse>(`/campaigns/${campaignId}/settle`, {
    method: "POST",
    body: JSON.stringify({
      settlement_amount: Math.max(1, Math.round(settlementAmount)),
    }),
  });
}

export async function approveBrandCampaignCommissions(campaignId: string) {
  requireBrandSession();
  if (!isBackendRecordId(campaignId)) throw new Error("Campaign này đang là dữ liệu local, chưa có ID backend.");

  return apiJson<BrandCampaignCommissionResponse>(`/campaigns/${campaignId}/commission-transactions/approve`, {
    method: "POST",
  });
}

export async function cancelBrandCampaignCommissions(campaignId: string) {
  requireBrandSession();
  if (!isBackendRecordId(campaignId)) throw new Error("Campaign này đang là dữ liệu local, chưa có ID backend.");

  return apiJson<BrandCampaignCommissionResponse>(`/campaigns/${campaignId}/commission-transactions/cancel`, {
    method: "POST",
  });
}
