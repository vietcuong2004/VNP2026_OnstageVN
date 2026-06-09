"use client";

import { apiJson, getAuthToken, getStoredAuthUser } from "@/lib/api-client";
import type { Campaign, CampaignStage, TalentProfile } from "@/lib/brand-mvp-data";

type BackendUser = {
  id?: number | string;
  name?: string | null;
  type?: string | null;
  is_verified?: boolean | number | null;
  external_avatar_url?: string | null;
};

type StoredAuthUser = {
  type?: string | null;
};

export function requireBrandSession() {
  const token = getAuthToken();
  const user = getStoredAuthUser<StoredAuthUser>();

  if (!token) {
    throw new Error("Bạn cần đăng nhập bằng tài khoản brand để thực hiện thao tác này.");
  }

  if (user?.type && user.type !== "brand") {
    throw new Error("Tính năng này chỉ dành cho tài khoản brand.");
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
  budget_min?: number | string | null;
  budget_max?: number | string | null;
  avatar_url?: string | null;
  photos?: BackendPhoto[] | null;
  social_accounts?: BackendSocialAccount[] | null;
  calendar_events?: Array<{ starts_at?: string | null }> | null;
  user?: BackendUser | null;
};

type BackendPhoto = {
  id?: number | string;
  url?: string | null;
  path?: string | null;
  category?: string | null;
  is_primary?: boolean | number | null;
};

type BackendSocialAccount = {
  platform?: string | null;
  followers_count?: number | string | null;
  engagement_rate?: number | string | null;
};

type BackendCampaignTalent = {
  id?: number | string;
  status?: string | null;
  notes?: string | null;
  profile?: BackendProfile | null;
};

type BackendCampaign = {
  id: number | string;
  title?: string | null;
  job_type?: string | null;
  description?: string | null;
  city?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  deadline?: string | null;
  talent_quantity?: number | string | null;
  budget_min?: number | string | null;
  budget_max?: number | string | null;
  requirements?: string | null;
  status?: Campaign["status"] | string | null;
  talents?: BackendCampaignTalent[] | null;
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

type CampaignForm = {
  title: string;
  jobType: string;
  city: string;
  address: string;
  startDate: string;
  endDate: string;
  deadline: string;
  talentQuantity: string;
  budget: string;
  benefits: string;
  requirements: string;
  description: string;
};

type CampaignTalentWithProfile = Campaign["applicants"][number] & {
  talent?: Pick<TalentProfile, "id" | "name" | "type" | "avatar" | "matchScore">;
};

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function formatBudget(min: unknown, max: unknown) {
  const budgetMin = numberOrNull(min);
  const budgetMax = numberOrNull(max);

  if (budgetMin && budgetMax) return `${formatMoney(budgetMin)} - ${formatMoney(budgetMax)}`;
  if (budgetMax) return `đến ${formatMoney(budgetMax)}`;
  if (budgetMin) return `từ ${formatMoney(budgetMin)}`;
  return "Thỏa thuận";
}

function formatFollowers(value: number) {
  if (value >= 1000000) return `${Number((value / 1000000).toFixed(1))}M`;
  if (value >= 1000) return `${Number((value / 1000).toFixed(0))}K`;
  return String(value);
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

function firstPhoto(profile: BackendProfile, category?: string) {
  const photos = profile.photos ?? [];
  const photo = category
    ? [...photos].reverse().find((item) => item.category === category)
    : photos[0];

  return photo?.url || photo?.path || "";
}

function mapTier(value?: string | null): TalentProfile["tier"] {
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
  const avatar = firstPhoto(profile, "avatar") || profile.avatar_url || profile.user?.external_avatar_url || fallback?.avatar || "/images/default-avatar.png";
  const cover = firstPhoto(profile, "cover") || fallback?.cover || avatar;
  const portfolio = (profile.photos ?? [])
    .map((photo) => photo.url || photo.path || "")
    .filter(Boolean);

  return {
    id: String(profile.id ?? fallback?.id ?? ""),
    name: profile.full_name || profile.display_name || fallback?.name || profile.user?.name || "Talent",
    type: profile.talent_types?.[0] || fallback?.type || "Talent",
    city: profile.city || fallback?.city || "",
    district: profile.district || fallback?.district || "",
    gender: profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Nu" : fallback?.gender || "",
    age: profileAge(profile.birth_date) || fallback?.age || 24,
    height: Number(profile.height_cm) || fallback?.height || 0,
    weight: Number(profile.weight_kg) || fallback?.weight || 0,
    bust: Number(measurements.bust) || fallback?.bust || 0,
    waist: Number(measurements.waist) || fallback?.waist || 0,
    hips: Number(measurements.hips) || fallback?.hips || 0,
    skinTone: profile.skin_tone || fallback?.skinTone || "",
    hairColor: profile.hair_color || fallback?.hairColor || "",
    yearsOfExperience: Number(profile.experience_years) || fallback?.yearsOfExperience || 0,
    tier: mapTier(profile.tier) || fallback?.tier || "C",
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
    rateUnit: fallback?.rateUnit || "du an",
    avatar,
    cover,
    fullBodyImage: firstPhoto(profile, "portfolio") || fallback?.fullBodyImage || avatar,
    skills: profile.skills?.length ? profile.skills : fallback?.skills || [],
    experience: profile.experience || profile.bio || fallback?.experience || "",
    portfolio: portfolio.length ? portfolio : fallback?.portfolio || [],
    availability: fallback?.availability || "Chua co lich",
    availabilityDates: (profile.calendar_events ?? []).map((event) => String(event.starts_at || "").slice(0, 10)).filter(Boolean),
    completion: Number(profile.profile_completion) || fallback?.completion || 0,
    matchScore: Number(profile.profile_completion) || fallback?.matchScore || 0,
    reliability: fallback?.reliability || 0,
    education: fallback?.education || "",
    languages: profile.languages?.length ? profile.languages : fallback?.languages || [],
    rateCard: fallback?.rateCard || {},
  };
}

function parseBudgetRange(value: string) {
  const numbers = value
    .split("-")
    .map((part) => Number(part.replace(/[^\d]/g, "")))
    .filter((part) => Number.isFinite(part) && part > 0);

  return {
    budget_min: numbers[0] ?? null,
    budget_max: numbers[1] ?? numbers[0] ?? null,
  };
}

function mapTalentStage(status?: string | null): CampaignStage {
  if (status === "shortlisted") return "shortlisted";
  if (status === "interview") return "interview";
  if (status === "accepted" || status === "approved") return "accepted";
  if (status === "confirmed") return "confirmed";
  return "new";
}

function mapCampaignStatus(status?: string | null): Campaign["status"] {
  if (status === "published" || status === "closed") return status;
  return "draft";
}

function mapCampaignTalent(item: BackendCampaignTalent, index: number): CampaignTalentWithProfile {
  const profile = item.profile;
  const user = profile?.user;
  const id = String(profile?.id ?? item.id ?? `talent-${index + 1}`);
  const name = profile?.display_name || user?.name || `Talent #${id}`;
  const stage = mapTalentStage(item.status);

  return {
    talentId: id,
    stage,
    note: item.notes || "",
    talent: {
      id,
      name,
      type: user?.type || "Talent",
      avatar: profile?.avatar_url || user?.external_avatar_url || "/images/default-avatar.png",
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

  return {
    id: String(campaign.id),
    title: campaign.title || "Campaign mới",
    jobType: campaign.job_type || "Campaign",
    city: campaign.city || "",
    address: campaign.location || campaign.city || "",
    startDate: campaign.start_date || "",
    endDate: campaign.end_date || "",
    deadline: campaign.deadline || "",
    talentQuantity: Number(campaign.talent_quantity) || 1,
    budget: formatBudget(campaign.budget_min, campaign.budget_max),
    budgetValue: budgetMax ?? budgetMin ?? 0,
    benefits: "Thỏa thuận theo brief",
    status: mapCampaignStatus(campaign.status),
    shortlistedTalentIds,
    applicants,
    contactRequests: 0,
    description: campaign.description || "Chưa có mô tả brief.",
    requirements: campaign.requirements || "Chưa có yêu cầu chi tiết.",
    views: 0,
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
  };
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

  return {
    title: form.title || "Campaign mới",
    job_type: form.jobType,
    description: form.description || "Chưa có mô tả brief.",
    city: form.city,
    location: form.address || form.city,
    start_date: form.startDate || null,
    end_date: form.endDate || null,
    talent_quantity: Number(form.talentQuantity) || 1,
    budget_min: budget.budget_min,
    budget_max: budget.budget_max,
    requirements: form.requirements || "Chưa có yêu cầu chi tiết.",
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

export async function loadBrandTalents(fallback: TalentProfile[] = []) {
  if (!getAuthToken()) return fallback;

  try {
    const response = await apiJson<{ data: BackendProfile[] }>("/talents?per_page=100&sort=match");
    const items = (response.data ?? []).map((profile, index) => mapBackendTalent(profile, fallback[index]));
    return items.length > 0 ? items : fallback;
  } catch (error) {
    console.warn("Cannot load brand talents", error);
    return fallback;
  }
}

export async function loadBrandTalent(id: string, fallback?: TalentProfile | null) {
  if (!getAuthToken()) return fallback ?? null;

  try {
    const response = await apiJson<{ data: BackendProfile }>(`/talents/${id}`);
    return mapBackendTalent(response.data, fallback ?? undefined);
  } catch (error) {
    console.warn("Cannot load brand talent", error);
    return fallback ?? null;
  }
}

export async function loadBrandPartnerProfile(fallback: ReturnType<typeof mapBackendPartnerProfile>) {
  if (!getAuthToken()) return fallback;

  try {
    const response = await apiJson<{ data: BackendPartnerProfile | null }>("/partner/profile");
    return mapBackendPartnerProfile(response.data) || fallback;
  } catch (error) {
    console.warn("Cannot load brand profile", error);
    return fallback;
  }
}

export async function saveBrandPartnerProfile(profile: ReturnType<typeof mapBackendPartnerProfile>) {
  requireBrandSession();

  const response = await apiJson<{ data: BackendPartnerProfile }>("/partner/profile", {
    method: "PUT",
    body: JSON.stringify(buildPartnerProfilePayload(profile)),
  });

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
      status: "shortlisted",
      notes,
    } as BackendCampaignTalent;
  }

  const response = await apiJson<{ data: BackendCampaignTalent }>(`/campaigns/${campaignId}/talents`, {
    method: "POST",
    body: JSON.stringify({
      profile_id: profileId,
      status: "shortlisted",
      notes,
    }),
  });

  return response.data;
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
