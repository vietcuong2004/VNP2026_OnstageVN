"use client";

import { apiForm, apiJson, getAuthToken } from "@/lib/api-client";
import { createInitialAvatarDataUrl, isUsableAvatarUrl, normalizeBackendAssetUrl, profileAvatarFromBackend } from "@/lib/avatar";
import type { Campaign, CampaignMedia, CampaignStage, TalentProfile } from "@/lib/brand-mvp-data";

const BRAND_PROFILE_DRAFT_KEY = "onstagevn_guest_brand_profile";

type BackendBadge = {
  id?: number | string;
  code?: string | null;
  title?: string | null;
  description?: string | null;
  tier?: string | null;
  color_scheme?: string | null;
  icon?: string | null;
  period_type?: string | null;
  period_value?: string | null;
  score?: number | null;
};

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
  profile?: BackendProfile | null;
};

export function requireBrandSession() {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Bạn cần đăng nhập để thực hiện thao tác này.");
  }
}

type BackendProfile = {
  id?: number | string;
  user_id?: number | string | null;
  is_owner?: boolean | number | null;
  can_book?: boolean | number | null;
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
  badges?: BackendBadge[] | null;
  active_badges?: BackendBadge[] | null;
  rating?: number | string | null;
  profile_completion?: number | string | null;
  verification_status?: string | null;
  skills?: string[] | null;
  social_highlights?: string[] | null;
  languages?: string[] | null;
  experience?: string | null;
  bio?: string | null;
  education?: string | null;
  budget_min?: number | string | null;
  budget_max?: number | string | null;
  budget_unit?: string | null;
  budget_note?: string | null;
  avatar_url?: string | null;
  price?: string | null;
  client_price?: string | null;
  portfolio_url?: string | null;
  photos?: BackendPhoto[] | null;
  videos?: BackendVideo[] | null;
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
  created_at?: string | null;
};

type BackendPhoto = {
  id?: number | string;
  url?: string | null;
  path?: string | null;
  category?: string | null;
  is_primary?: boolean | number | null;
};

type BackendVideo = {
  id?: number | string;
  path?: string | null;
  disk?: string | null;
  url?: string | null;
  title?: string | null;
  thumbnail_url?: string | null;
  video_type?: string | null;
  sort_order?: number | string | null;
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
  type?: string | string[];
  city?: string;
  nearCity?: string;
  nearDistrict?: string;
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
  onstage_time?: string | null;
  event_time?: string | null;
  is_owner?: boolean | number | null;
  can_apply?: boolean | number | null;
  deadline?: string | null;
  talent_quantity?: number | string | null;
  budget_min?: number | string | null;
  budget_max?: number | string | null;
  budget_unit?: string | null;
  budget_note?: string | null;
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
  events?: BackendCampaignEvent[] | null;
  positions?: BackendCampaignPosition[] | null;
};

type BackendCampaignEvent = {
  id?: number | string;
  name?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  location?: string | null;
  content?: string[] | null;
  sort_order?: number | string | null;
};

type BackendCampaignPosition = {
  id?: number | string;
  talent_type?: string | null;
  quantity?: number | string | null;
  requirements?: string[] | null;
  sort_order?: number | string | null;
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

type BackendBookedTalent = {
  id?: number | string;
  booking_request_id?: number | string | null;
  talent_id?: number | string | null;
  status?: string | null;
  talent_response_note?: string | null;
  admin_note?: string | null;
  talent?: BackendUser | null;
};

type BackendBookingRequest = {
  id: number | string;
  request_code?: string | null;
  brand_id?: number | string | null;
  talent_id?: number | string | null;
  booking_type?: "single" | "multiple" | "mc" | "pg" | "lookbook" | string | null;
  talent?: BackendUser | null;
  booked_talents?: BackendBookedTalent[] | null;
  job_type?: string | null;
  package_id?: string | null;
  package_price?: number | string | null;
  client_budget_amount?: number | string | null;
  total_amount?: number | string | null;
  client_quoted_amount?: number | string | null;
  total_actual_amount?: number | string | null;
  talent_payout_amount?: number | string | null;
  platform_fee_amount?: number | string | null;
  platform_fee_rate?: number | string | null;
  package_name?: string | null;
  package_duration?: string | null;
  job_name?: string | null;
  job_description?: string | null;
  work_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  extra_requirements?: string | null;
  job_details?: Record<string, unknown> | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  deposit_amount?: number | string | null;
  remaining_amount?: number | string | null;
  request_status?: string | null;
  payment_status?: string | null;
  deposit_transfer_content?: string | null;
  deposit_qr_payload?: string | null;
  created_at?: string | null;
};

export type CreateBookingRequestPayload = {
  talent_id?: number | string | null;
  talent_ids?: Array<number | string>;
  profile_id?: number | string | null;
  profile_ids?: Array<number | string>;
  job_type: "mc" | "pg" | "lookbook" | "kol" | "influencer" | "model" | "pg_model" | string;
  package_id?: "basic" | "standard" | "premium" | string | null;
  job_name: string;
  job_description?: string | null;
  work_date: string;
  start_time: string;
  end_time: string;
  location?: string | null;
  extra_requirements?: string | null;
  job_details?: Record<string, unknown> | null;
  contact_name: string;
  contact_phone: string;
  contact_email?: string | null;
  payment_method?: "bank" | "wallet";
  client_budget_amount?: number | string | null;
  talent_payout_amount?: number | string | null;
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
  onstageTime?: string;
  talentQuantity: string;
  budget: string;
  budgetMin?: string;
  budgetMax?: string;
  budgetUnit?: 'day' | 'hour' | 'job' | 'month' | 'video' | string;
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
  events?: Array<{
    name: string;
    start_at: string;
    end_at: string;
    location?: string;
    content?: string[];
    sort_order?: number;
  }>;
  positions?: Array<{
    talent_type: string;
    talent_type_name?: string;
    quantity: number;
    requirements?: string[];
    sort_order?: number;
  }>;
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

function budgetUnitSuffix(unit: string = "day") {
  if (unit === "hour") return "/giờ";
  if (unit === "job") return "/job";
  if (unit === "month") return "/tháng";
  if (unit === "video") return "/video";
  return "/ngày";
}

function appendBudgetNote(text: string, note?: string | null) {
  const cleaned = String(note || "").trim();
  if (!cleaned || text === "Thỏa thuận") return text;
  return /^[,;]/.test(cleaned) ? `${text}${cleaned}` : `${text} ${cleaned}`;
}

function formatDailyCompensation(value: number, unit: string = "day") {
  const suffix = budgetUnitSuffix(unit);
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const formatted = Number.isInteger(millions)
      ? String(millions)
      : millions.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
    return `${formatted} triệu${suffix}`;
  }

  if (value >= 1_000) {
    const thousands = value / 1_000;
    const formatted = Number.isInteger(thousands)
      ? String(thousands)
      : thousands.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
    return `${formatted}k${suffix}`;
  }

  return `${value.toLocaleString("vi-VN")}đ${suffix}`;
}

function formatBudget(min: unknown, max: unknown, unit: string = "day", note?: string | null) {
  const budgetMin = numberOrNull(min);
  const budgetMax = numberOrNull(max);

  if (budgetMin && budgetMax && budgetMin === budgetMax) return appendBudgetNote(formatDailyCompensation(budgetMin, unit), note);
  if (budgetMin && budgetMax) {
    const suffix = budgetUnitSuffix(unit);
    const formatPart = (val: number) => {
      if (val >= 1_000_000) {
        const m = val / 1_000_000;
        return { text: `${Number.isInteger(m) ? String(m) : m.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu`, isM: true };
      }
      if (val >= 1_000) {
        const k = val / 1_000;
        return { text: `${Number.isInteger(k) ? String(k) : k.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}k`, isM: false };
      }
      return { text: `${val.toLocaleString("vi-VN")}đ`, isM: false };
    };

    const first = formatPart(budgetMin);
    const second = formatPart(budgetMax);

    if (first.isM && second.isM) {
      return appendBudgetNote(`${first.text.replace(/\s*triệu/i, "")} - ${second.text}${suffix}`, note);
    }
    if (!first.isM && !second.isM) {
      return appendBudgetNote(`${first.text.replace(/k$/i, "")} - ${second.text}${suffix}`, note);
    }
    return appendBudgetNote(`${first.text} - ${second.text}${suffix}`, note);
  }
  if (budgetMax) return appendBudgetNote(formatDailyCompensation(budgetMax, unit), note);
  if (budgetMin) return appendBudgetNote(formatDailyCompensation(budgetMin, unit), note);
  return "Thỏa thuận";
}

function formatFollowers(value: number) {
  if (value >= 1000000) return `${Number((value / 1000000).toFixed(1))}M`;
  if (value >= 1000) return `${Number((value / 1000).toFixed(0))}K`;
  return String(value);
}

const MOJIBAKE_MARKER_PATTERN = /[\u00c2-\u00c6]|\u00e1[\u00ba\u00bb]/;
const MOJIBAKE_MARKER_PATTERN_GLOBAL = /[\u00c2-\u00c6]|\u00e1[\u00ba\u00bb]/g;

function repairMojibake(value: unknown) {
  if (typeof value !== "string" || !value) return value ?? "";

  const text = value.trim();
  if (!MOJIBAKE_MARKER_PATTERN.test(text)) return text;

  try {
    const bytes = Uint8Array.from(Array.from(text).map((char) => char.charCodeAt(0) & 0xff));
    const repaired = new TextDecoder("utf-8").decode(bytes).trim();

    if (!repaired) return text;

    const beforeNoise = (text.match(MOJIBAKE_MARKER_PATTERN_GLOBAL) || []).length;
    const afterNoise = (repaired.match(MOJIBAKE_MARKER_PATTERN_GLOBAL) || []).length;

    return afterNoise < beforeNoise ? repaired : text;
  } catch {
    return text;
  }
}

function hasSuspiciousQuestionMojibake(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return false;

  const questionMarks = (text.match(/\?/g) || []).length;
  return questionMarks >= 2 && /\p{L}/u.test(text);
}

function fallbackTalentExperience(profile: BackendProfile, fallback?: TalentProfile) {
  const fallbackText = String(fallback?.experience || "").trim();
  if (fallbackText && !hasSuspiciousQuestionMojibake(fallbackText)) {
    return fallbackText;
  }

  const talentType = String(repairMojibake(profile.talent_types?.[0] || fallback?.type || "Talent")).trim();
  const skills = (profile.skills?.length ? profile.skills : fallback?.skills || [])
    .map((item) => String(repairMojibake(item)).trim())
    .filter(Boolean)
    .slice(0, 3);

  const parts = [
    talentType ? `${talentType} chuyên nghiệp` : "Talent chuyên nghiệp",
    skills.length ? `Kỹ năng nổi bật: ${skills.join(", ")}` : "",
    "Rất mong được hợp tác",
  ].filter(Boolean);

  return parts.join(". ");
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

function normalizeTalentTypeLabel(type: string) {
  const normalized = type.toLowerCase().trim();
  if (["pg", "pb", "pg/pb", "pg_pb", "pg-pb"].includes(normalized)) return "PG/PB";
  if (normalized === "mc") return "MC";
  if (normalized === "lookbook") return "Lookbook";
  return type;
}

function normalizeBookingRoleLabel(booking: Pick<BackendBookingRequest, "job_type" | "booking_type">) {
  const rawJobType = String(booking.job_type || "").trim();
  if (rawJobType) return normalizeTalentTypeLabel(String(repairMojibake(rawJobType)).trim());

  const rawBookingType = String(booking.booking_type || "").trim();
  const normalizedBookingType = rawBookingType.toLowerCase();
  if (rawBookingType && !["single", "multiple"].includes(normalizedBookingType)) {
    return normalizeTalentTypeLabel(String(repairMojibake(rawBookingType)).trim());
  }

  return "Idol";
}

function normalizeBookingSelectionType(bookingType?: string | null, bookedTalentCount = 0) {
  const normalized = String(bookingType || "").toLowerCase().trim();
  if (normalized === "single" || normalized === "multiple") return normalized;

  return bookedTalentCount > 1 ? "multiple" : "single";
}

function normalizeBookingRequestCode(value: unknown) {
  return String(value || "").trim().replace(/^#+/, "");
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
    .filter((photo) => photo.category !== 'avatar' && photo.category !== 'cover' && !photo.category?.startsWith('cccd'))
    .map((photo) => photo.url || photo.path || "")
    .filter(Boolean);
  const videos = (profile.videos ?? [])
    .map((video, index) => ({
      id: String(video.id ?? `video-${index + 1}`),
      title: String(repairMojibake(video.title || `Video ${index + 1}`)).trim(),
      url: normalizeBackendAssetUrl(video.url || ""),
      path: video.path ?? null,
      disk: video.disk ?? null,
      thumbnailUrl: normalizeBackendAssetUrl(video.thumbnail_url || ""),
      videoType: String(video.video_type || ""),
      sortOrder: Number(video.sort_order) || index,
    }))
    .filter((video) => video.url)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const rawExperience = String(profile.experience || profile.bio || fallback?.experience || "");
  const repairedExperience = String(repairMojibake(rawExperience)).trim();
  const displayExperience = repairedExperience && !hasSuspiciousQuestionMojibake(repairedExperience)
    ? repairedExperience
    : fallbackTalentExperience(profile, fallback);
  const talentTypes = (profile.talent_types?.length ? profile.talent_types : fallback?.talentTypes || [fallback?.type || "Talent"])
    .map((item) => normalizeTalentTypeLabel(String(repairMojibake(item)).trim()))
    .filter(Boolean);

  return {
    id: String(profile.id ?? fallback?.id ?? ""),
    userId: profile.user_id != null ? String(profile.user_id) : fallback?.userId,
    isOwner: Boolean(profile.is_owner ?? fallback?.isOwner ?? false),
    canBook: profile.can_book !== undefined && profile.can_book !== null
      ? profile.can_book !== false && profile.can_book !== 0
      : fallback?.canBook !== false,
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
    badges: profile.badges || (fallback as { badges?: BackendBadge[] } | undefined)?.badges,
    active_badges: profile.active_badges || (fallback as { active_badges?: BackendBadge[] } | undefined)?.active_badges,
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
    socialHighlights: (profile.social_highlights?.length ? profile.social_highlights : fallback?.socialHighlights || []).map((item: string) => String(repairMojibake(item))),
    experience: displayExperience,
    portfolio: portfolio.length ? portfolio : fallback?.portfolio || [],
    videos,
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
    createdAt: profile.created_at || fallback?.createdAt || "",
    created_at: profile.created_at || fallback?.created_at || "",
    surveyScores: profile.latest_survey
      ? {
        pageant: Number(profile.latest_survey.pageant_score) || 0,
        runway: Number(profile.latest_survey.runway_score) || 0,
        kol: Number(profile.latest_survey.kol_score) || 0,
      }
      : fallback?.surveyScores || { pageant: 0, runway: 0, kol: 0 },
    mainCategory: profile.latest_survey?.main_category || fallback?.mainCategory || "",
    aiScore: Number(profile.latest_survey?.profile_score) || fallback?.aiScore || 0,
    price: profile.client_price || profile.price || fallback?.price || "",
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
    onstageTime: campaign.onstage_time || campaign.event_time || "",
    eventTime: campaign.event_time || campaign.onstage_time || "",
    isOwner: Boolean(campaign.is_owner),
    canApply: campaign.can_apply !== false && campaign.can_apply !== 0,
    talentQuantity: Number(campaign.talent_quantity) || 1,
    budget: formatBudget(campaign.budget_min, campaign.budget_max, campaign.budget_unit || "day", campaign.budget_note),
    budgetMin: budgetMin,
    budgetMax: budgetMax,
    budget_unit: campaign.budget_unit || "day",
    budgetNote: campaign.budget_note || "",
    budgetValue: budgetMax ?? budgetMin ?? 0,
    benefits: campaign.benefits || "Thỏa thuận theo brief",
    status: mapCampaignStatus(campaign.status),
    shortlistedTalentIds,
    applicants,
    contactRequests: 0,
    description: campaign.description || "",
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
    events: (campaign.events ?? []).map((event) => ({
      id: event.id,
      name: event.name || "",
      startAt: event.start_at || "",
      endAt: event.end_at || "",
      location: event.location || "",
      content: Array.isArray(event.content) ? event.content : [],
      sortOrder: numberOrNull(event.sort_order) ?? 0,
    })),
    positions: (campaign.positions ?? []).map((position) => ({
      id: position.id,
      talentType: position.talent_type || "",
      quantity: Number(position.quantity) || 1,
      requirements: Array.isArray(position.requirements) ? position.requirements : [],
      sortOrder: numberOrNull(position.sort_order) ?? 0,
    })),
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

const BOOKING_STATUS_VALUES = [
  "pending_confirmation",
  "contacting_idols",
  "need_replacement",
  "idols_confirmed",
  "waiting_payment",
  "paid",
  "waiting_payout",
  "completed",
  "cancelled",
  "deposit_pending",
  "submitted",
  "reviewing",
  "talent_confirming",
  "confirmed",
  "rejected",
] as const;

type BookingStatusValue = (typeof BOOKING_STATUS_VALUES)[number];

function mapBookingStatus(status?: string | null): BookingStatusValue {
  const value = String(status || "").trim().toLowerCase();
  if ((BOOKING_STATUS_VALUES as readonly string[]).includes(value)) {
    if (value === "deposit_pending" || value === "submitted" || value === "reviewing") return "pending_confirmation";
    if (value === "talent_confirming") return "contacting_idols";
    if (value === "rejected") return "need_replacement";
    return value as BookingStatusValue;
  }
  if (value === "pending" || value === "awaiting_transfer") return "pending_confirmation";
  if (value === "approved") return "idols_confirmed";
  return "pending_confirmation";
}

function formatBookingDate(value?: string | null) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return text;

  return `${match[3]}/${match[2]}/${match[1]}`;
}

function formatBookingTime(value?: string | null) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : text;
}

function isBareImageFilename(value?: string | null) {
  return /^[^/?#\\/]+\.(?:avif|gif|heic|heif|jpe?g|png|webp)$/i.test(String(value || "").trim());
}

function isBookingAvatarCandidate(value?: string | null) {
  const url = String(value || "").trim();
  if (!url) return false;
  if (isBareImageFilename(url)) return false;

  return isUsableAvatarUrl(url);
}

function mapBookingTalentSnapshot(talent: BackendUser | null | undefined, fallbackJobType?: string | null) {
  const profile = talent?.profile ?? null;
  const talentName = String(repairMojibake(profile?.display_name || profile?.full_name || talent?.name || "Idol")).trim();
  const talentRole = normalizeTalentTypeLabel(
    String(repairMojibake(profile?.talent_types?.[0] || fallbackJobType || "Idol")).trim(),
  );
  const rawAvatar = profileAvatarFromBackend(profile || undefined)
    || normalizeBackendAssetUrl(profile?.avatar_url)
    || normalizeBackendAssetUrl(talent?.external_avatar_url)
    || "";
  const talentAvatar = isBookingAvatarCandidate(rawAvatar)
    ? rawAvatar
    : createInitialAvatarDataUrl(talentName, talent?.email || talent?.name || "");

  return {
    talentId: String(talent?.id || ""),
    talentName,
    talentAvatar,
    talentRole,
  };
}

export function mapBackendBooking(booking: BackendBookingRequest) {
  const bookedTalents = (booking.booked_talents ?? [])
    .map((item) => {
      const snapshot = mapBookingTalentSnapshot(item.talent ?? null, booking.job_type);
      const rawPrice = item.talent?.profile?.price;
      const parsedPrice = typeof rawPrice === "number" ? rawPrice : numberOrNull(String(rawPrice || "").replace(/\D/g, ""));

      return {
        id: String(item.id || item.talent_id || snapshot.talentId || ""),
        talentId: String(item.talent_id || snapshot.talentId || ""),
        talentName: snapshot.talentName,
        talentAvatar: snapshot.talentAvatar,
        talentRole: snapshot.talentRole,
        status: item.status || "pending",
        note: String(repairMojibake(item.talent_response_note || item.admin_note || "")).trim(),
        price: parsedPrice ?? undefined,
      };
    })
    .filter((item) => item.id || item.talentId || item.talentName !== "Idol");
  const bookingSelectionType = normalizeBookingSelectionType(booking.booking_type, bookedTalents.length);
  const isMultiple = bookingSelectionType === "multiple";
  const primaryTalent = bookedTalents[0] ?? mapBookingTalentSnapshot(booking.talent ?? null, booking.job_type);
  const bookingRole = normalizeBookingRoleLabel(booking);
  const hasSelectedTalent = Boolean(booking.talent_id || (bookedTalents.length > 0) || (booking.talent?.name && booking.talent?.name !== "Idol" && booking.talent?.name !== "0 Idol"));
  const talentName = !hasSelectedTalent
    ? "0 Idol"
    : isMultiple
    ? `${bookedTalents.length || 0} Idol được chọn`
    : primaryTalent.talentName;
  const talentRole = bookingRole !== "Idol" ? bookingRole : primaryTalent.talentRole;
  const requestCode = normalizeBookingRequestCode(booking.request_code || booking.id);
  const talentAvatar = isMultiple
    ? createInitialAvatarDataUrl(talentName, requestCode)
    : primaryTalent.talentAvatar;
  const isPaid = ["paid", "waiting_payout", "completed"].includes(String(booking.request_status || "").toLowerCase()) || booking.payment_status === "paid";
  const depositAmount = numberOrNull(booking.deposit_amount) ?? 200000;

  let calculatedTalentQuote = 0;
  if (bookedTalents && bookedTalents.length > 0) {
    for (const bt of bookedTalents) {
      if (bt.price && bt.price > 0) {
        calculatedTalentQuote += Math.round(bt.price * 1.3);
      }
    }
  } else if (booking.talent?.profile?.price) {
    const rawP = String(booking.talent.profile.price).replace(/\D/g, "");
    const p = Number(rawP);
    if (p > 0) calculatedTalentQuote += Math.round(p * 1.3);
  }

  const rawTotalAmount = numberOrNull(booking.total_amount);
  const rawClientQuoted = numberOrNull(booking.client_quoted_amount);
  const clientQuotedAmount = (rawTotalAmount && rawTotalAmount > 0)
    ? rawTotalAmount
    : ((rawClientQuoted && rawClientQuoted > 0)
      ? rawClientQuoted
      : (calculatedTalentQuote > 0 ? calculatedTalentQuote : undefined));

  const clientBudgetAmount = numberOrNull(booking.client_budget_amount);
  const packagePrice = numberOrNull(booking.package_price);
  const backendRemaining = numberOrNull(booking.remaining_amount);
  const totalBudget = (clientQuotedAmount && clientQuotedAmount > 0)
    ? clientQuotedAmount
    : (clientBudgetAmount ?? packagePrice ?? (backendRemaining !== null ? backendRemaining + depositAmount : depositAmount));
  const remainingAmount = isPaid ? 0 : (backendRemaining !== null ? backendRemaining : Math.max(0, totalBudget - depositAmount));

  return {
    id: requestCode,
    backendId: String(booking.id || ""),
    bookingType: bookingSelectionType,
    talentId: String(booking.talent_id || primaryTalent.talentId || ""),
    talentName,
    talentAvatar,
    talentRole,
    bookedTalents,
    campaignTitle: String(repairMojibake(booking.job_name || "Yêu cầu booking")).trim(),
    workDate: formatBookingDate(booking.work_date),
    startTime: formatBookingTime(booking.start_time),
    endTime: formatBookingTime(booking.end_time),
    location: String(repairMojibake(booking.location || "")).trim(),
    depositAmount,
    totalAmount: clientQuotedAmount ?? totalBudget,
    totalBudget,
    clientQuotedAmount,
    remainingAmount,
    contactName: String(repairMojibake(booking.contact_name || "")).trim(),
    contactPhone: booking.contact_phone || "",
    contactEmail: booking.contact_email || "",
    notes: String(repairMojibake(booking.extra_requirements || booking.job_description || "")).trim(),
    status: mapBookingStatus(booking.request_status),
    paymentStatus: booking.payment_status || "pending",
    createdAt: booking.created_at || "",
  };
}
function buildCampaignPayload(form: CampaignForm) {
  const budget = parseBudgetRange(form.budget);
  const explicitBudgetMin = numberOrNull(form.budgetMin);
  const explicitBudgetMax = numberOrNull(form.budgetMax);
  
  let budgetMin: number | null = form.budgetNegotiable ? null : explicitBudgetMin ?? budget.budget_min ?? null;
  let budgetMax: number | null = form.budgetNegotiable ? null : explicitBudgetMax ?? budget.budget_max ?? null;

  if (budgetMin !== null && budgetMax !== null) {
    if (budgetMax < budgetMin) {
      const temp = budgetMin;
      budgetMin = budgetMax;
      budgetMax = temp;
    }
  } else if (budgetMin !== null && budgetMax === null) {
    budgetMax = budgetMin;
  } else if (budgetMax !== null && budgetMin === null) {
    budgetMin = budgetMax;
  }

  const listFromText = (value?: string) => String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    title: form.title || "Campaign mới",
    job_type: form.jobType,
    description: form.description || "",
    event_name: form.eventName || null,
    city: form.city,
    location: form.address || form.city,
    start_date: form.startDate || null,
    end_date: form.endDate || null,
    application_deadline: form.applicationDeadline || form.deadline || null,
    event_date: form.eventDate || null,
    onstage_time: form.onstageTime || null,
    talent_quantity: Number(form.talentQuantity) || 1,
    budget_min: budgetMin,
    budget_max: budgetMax,
    budget_unit: form.budgetUnit || "day",
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
    events: form.events || [],
    positions: form.positions || [],
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
  const talentTypes = Array.isArray(options.type)
    ? options.type
    : options.type?.split(",") ?? [];
  talentTypes.map((type) => type.trim()).filter(Boolean).forEach((type) => {
    params.append("type[]", type);
  });
  if (options.city?.trim()) params.set("city", options.city.trim());
  if (options.nearCity?.trim()) params.set("near_city", options.nearCity.trim());
  if (options.nearDistrict?.trim()) params.set("near_district", options.nearDistrict.trim());
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
  city_id?: number;
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
  if (payload.city_id) formData.append("city_id", String(payload.city_id));
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
  city_id?: number;
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
      city_id: payload.city_id || null,
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

export async function createBookingRequest(payload: CreateBookingRequestPayload) {
  const response = await apiJson<{ data: BackendBookingRequest }>("/booking-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function loadBrandBookings() {
  if (!getAuthToken()) return [];

  try {
    const response = await apiJson<{ data: BackendBookingRequest[] }>("/booking-requests");
    return (response.data ?? []).map(mapBackendBooking);
  } catch (error) {
    console.warn("Cannot load brand bookings", error);
    return [];
  }
}

export async function deleteBrandBooking(bookingId: string) {
  requireBrandSession();
  if (!isBackendRecordId(bookingId)) throw new Error("Đơn booking này đang là dữ liệu local, chưa có ID backend.");

  await apiJson<void>(`/booking-requests/${bookingId}`, {
    method: "DELETE",
  });
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
