"use client";

import { apiJson, getAuthToken } from "@/lib/api-client";
import type { Campaign, CampaignStage, TalentProfile } from "@/lib/brand-mvp-data";

type BackendUser = {
  id?: number | string;
  name?: string | null;
  type?: string | null;
  is_verified?: boolean | number | null;
  external_avatar_url?: string | null;
};

type BackendProfile = {
  id?: number | string;
  display_name?: string | null;
  city?: string | null;
  avatar_url?: string | null;
  user?: BackendUser | null;
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

export async function loadBrandCampaigns(fallback: Campaign[] = []) {
  if (!getAuthToken()) return fallback;

  try {
    const response = await apiJson<{ data: BackendCampaign[] }>("/campaigns");
    return (response.data ?? []).map(mapBackendCampaign);
  } catch (error) {
    console.warn("Cannot load brand campaigns", error);
    return fallback;
  }
}

export async function loadBrandCampaign(id: string, fallback: Campaign[] = []) {
  if (!getAuthToken()) return fallback.find((campaign) => campaign.id === id) ?? null;

  try {
    const response = await apiJson<{ data: BackendCampaign }>(`/campaigns/${id}`);
    return mapBackendCampaign(response.data);
  } catch (error) {
    console.warn("Cannot load brand campaign", error);
    return fallback.find((campaign) => campaign.id === id) ?? null;
  }
}

export async function createBrandCampaign(form: CampaignForm) {
  const response = await apiJson<{ data: BackendCampaign }>("/campaigns", {
    method: "POST",
    body: JSON.stringify(buildCampaignPayload(form)),
  });

  return mapBackendCampaign(response.data);
}

export async function publishBrandCampaign(id: string) {
  const response = await apiJson<{ data: BackendCampaign }>(`/campaigns/${id}/publish`, {
    method: "POST",
  });

  return mapBackendCampaign(response.data);
}

export async function closeBrandCampaign(id: string) {
  const response = await apiJson<{ data: BackendCampaign }>(`/campaigns/${id}/close`, {
    method: "POST",
  });

  return mapBackendCampaign(response.data);
}
