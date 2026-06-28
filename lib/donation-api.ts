"use client";

import type {
  DonationCampaign,
  DonationCampaignStatus,
  PayoutRequest,
  Supporter,
  UpdateLog,
} from "@/app/talent/crownfunding/types";
import { apiJson, getAuthToken } from "@/lib/api-client";

type BackendDonationTalent = {
  id?: number;
  name?: string | null;
  type?: string | null;
} | null;

type BackendDonationCampaign = {
  id: number;
  slug?: string | null;
  title?: string | null;
  summary?: string | null;
  description?: string | null;
  goal_amount?: number | null;
  raised_amount?: number | null;
  supporters_count?: number | null;
  paid_out_amount?: number | null;
  status?: string | null;
  progress_percent?: number | null;
  donation_qr_payload?: string | null;
  donation_qr_code?: string | null;
  collection_channel?: {
    provider?: string | null;
    channel_code?: string | null;
    status?: string | null;
    qr_payload?: string | null;
    qr_code?: string | null;
  } | null;
  currency?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  talent?: BackendDonationTalent;
};

type BackendDonationUpdate = {
  id: number;
  title?: string | null;
  content?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

type BackendDonationTransaction = {
  id: number;
  donor_name?: string | null;
  amount?: number | null;
  message?: string | null;
  is_anonymous?: boolean | null;
  status?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
};

type BackendDonationPayoutRequest = {
  id: number;
  title?: string | null;
  description?: string | null;
  amount_requested?: number | null;
  amount_approved?: number | null;
  status?: "pending" | "approved" | "rejected" | "paid" | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  paid_at?: string | null;
};

type DonationCampaignPayload = {
  title: string;
  summary?: string;
  description?: string;
  goal_amount: number;
  starts_at?: string;
  ends_at?: string;
};

const DEFAULT_CAMPAIGN_IMAGES = [
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&h=400&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&h=400&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&h=400&q=80",
];

function formatIsoDate(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function formatReadableDate(value?: string | null) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return formatIsoDate(value);
  }
}

function formatReadableDateTime(value?: string | null) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function normalizeCampaignStatus(status?: string | null): DonationCampaignStatus {
  if (status === "draft" || status === "pending_review" || status === "active" || status === "paused" || status === "closed" || status === "rejected") {
    return status;
  }

  return "draft";
}

export function isDonationCampaignEditable(campaign: DonationCampaign | null) {
  return campaign ? campaign.status === "draft" || campaign.status === "rejected" : false;
}

export function getDonationShareLink(campaign: DonationCampaign | null) {
  if (typeof window === "undefined") return "";
  if (!campaign?.id) return window.location.href;

  return `${window.location.origin}/talent/crownfunding/donate?campaign=${campaign.id}`;
}

export function downloadDonationQrSvg(campaign: DonationCampaign | null) {
  if (!campaign?.qrCodeSvg || typeof window === "undefined") return false;

  const blob = new Blob([campaign.qrCodeSvg], { type: "image/svg+xml;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${campaign.slug || `donation-${campaign.id || "campaign"}`}-qr.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return true;
}

export function buildDonationCampaignPayload(input: Partial<DonationCampaign>): DonationCampaignPayload {
  const title = String(input.title || "").trim();
  const summary = String(input.description || "").trim();
  const detailedDescription = String(input.details || input.description || "").trim();

  return {
    title,
    summary: summary || undefined,
    description: detailedDescription || undefined,
    goal_amount: Math.max(1, Number(input.goal || 0) || 0),
    starts_at: input.startDate || undefined,
    ends_at: input.endDate || undefined,
  };
}

export function mapBackendDonationCampaign(campaign: BackendDonationCampaign): DonationCampaign {
  const status = normalizeCampaignStatus(campaign.status);
  const goal = Number(campaign.goal_amount || 0);
  const raised = Number(campaign.raised_amount || 0);
  const coverImages = [...DEFAULT_CAMPAIGN_IMAGES];
  const activeCollectionChannel =
    campaign.collection_channel && campaign.collection_channel.status === "active"
      ? campaign.collection_channel
      : null;

  return {
    id: campaign.id,
    slug: campaign.slug || undefined,
    title: String(campaign.title || "Chiến dịch gây quỹ"),
    description: String(campaign.summary || campaign.description || "Chưa có mô tả ngắn cho chiến dịch này."),
    details: String(campaign.description || campaign.summary || ""),
    coverImage: coverImages[0],
    coverImages,
    goal,
    raised,
    supportersCount: Number(campaign.supporters_count || 0),
    disbursed: Number(campaign.paid_out_amount || 0),
    startDate: formatIsoDate(campaign.starts_at || campaign.created_at),
    endDate: formatIsoDate(campaign.ends_at),
    status,
    progressPercent: Number(campaign.progress_percent || 0),
    collectionChannel: activeCollectionChannel ? {
      provider: activeCollectionChannel.provider || undefined,
      channelCode: activeCollectionChannel.channel_code || undefined,
      status: activeCollectionChannel.status || undefined,
      qrCodeSvg: activeCollectionChannel.qr_code || undefined,
      qrPayload: activeCollectionChannel.qr_payload || undefined,
    } : undefined,
    qrCodeSvg: activeCollectionChannel?.qr_code || undefined,
    qrPayload: activeCollectionChannel?.qr_payload || undefined,
    currency: campaign.currency || "VND",
    createdAt: campaign.created_at || undefined,
    updatedAt: campaign.updated_at || undefined,
    approvedAt: campaign.approved_at || undefined,
    rejectedAt: campaign.rejected_at || undefined,
    rejectionReason: campaign.rejection_reason || undefined,
    talentName: campaign.talent?.name || undefined,
  };
}

function mapBackendDonationUpdate(update: BackendDonationUpdate): UpdateLog {
  return {
    id: String(update.id),
    title: String(update.title || "Cập nhật tiến độ"),
    content: String(update.content || ""),
    date: formatReadableDate(update.published_at || update.created_at),
  };
}

function mapBackendDonationTransaction(transaction: BackendDonationTransaction): Supporter {
  return {
    name: String(transaction.donor_name || "Nhà hảo tâm"),
    amount: Number(transaction.amount || 0),
    message: transaction.message || undefined,
    isAnonymous: Boolean(transaction.is_anonymous),
    date: formatReadableDateTime(transaction.paid_at || transaction.created_at),
  };
}

function mapBackendDonationPayoutRequest(request: BackendDonationPayoutRequest): PayoutRequest {
  const status = request.status === "paid" ? "approved" : request.status || "pending";

  return {
    id: String(request.id),
    amount: Number(request.amount_requested || request.amount_approved || 0),
    reason: String(request.title || request.description || "Yêu cầu giải ngân"),
    filesCount: 0,
    status,
    date: formatReadableDate(request.submitted_at || request.reviewed_at || request.paid_at),
  };
}

export async function loadMyDonationCampaign() {
  if (!getAuthToken()) return null;

  try {
    const response = await apiJson<{ data: BackendDonationCampaign[] }>("/donations/my-campaigns");
    const [latestCampaign] = response.data || [];
    return latestCampaign ? mapBackendDonationCampaign(latestCampaign) : null;
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export async function loadMyDonationCampaigns() {
  if (!getAuthToken()) return [] as DonationCampaign[];

  try {
    const response = await apiJson<{ data: BackendDonationCampaign[] }>("/donations/my-campaigns");
    return (response.data || []).map(mapBackendDonationCampaign);
  } catch (error) {
    console.warn(error);
    return [] as DonationCampaign[];
  }
}

export async function createDonationCampaign(input: Partial<DonationCampaign>) {
  const response = await apiJson<{ data: BackendDonationCampaign }>("/donations/campaigns", {
    method: "POST",
    body: JSON.stringify(buildDonationCampaignPayload(input)),
  });

  return mapBackendDonationCampaign(response.data);
}

export async function updateDonationCampaign(campaignId: number, input: Partial<DonationCampaign>) {
  const response = await apiJson<{ data: BackendDonationCampaign }>(`/donations/campaigns/${campaignId}`, {
    method: "PUT",
    body: JSON.stringify(buildDonationCampaignPayload(input)),
  });

  return mapBackendDonationCampaign(response.data);
}

export async function submitDonationCampaignReview(campaignId: number) {
  const response = await apiJson<{ data: BackendDonationCampaign }>(`/donations/campaigns/${campaignId}/submit-review`, {
    method: "POST",
  });

  return mapBackendDonationCampaign(response.data);
}

export async function closeDonationCampaign(campaignId: number) {
  const response = await apiJson<{ data: BackendDonationCampaign }>(`/donations/campaigns/${campaignId}/close`, {
    method: "POST",
  });

  return mapBackendDonationCampaign(response.data);
}

export async function deleteDonationCampaign(campaignId: number) {
  const response = await apiJson<{ message?: string }>(`/donations/campaigns/${campaignId}`, {
    method: "DELETE",
  });

  return response.message || "Đã xóa chiến dịch gây quỹ.";
}

export async function loadDonationUpdates(campaignId: number) {
  const response = await apiJson<{ data: BackendDonationUpdate[] }>(`/donations/campaigns/${campaignId}/updates`, {
    clearAuthOnUnauthorized: false,
  });

  return (response.data || []).map(mapBackendDonationUpdate);
}

export async function createDonationUpdate(campaignId: number, payload: { title: string; content: string }) {
  const response = await apiJson<{ data: BackendDonationUpdate }>(`/donations/campaigns/${campaignId}/updates`, {
    method: "POST",
    body: JSON.stringify({
      title: payload.title || undefined,
      content: payload.content,
    }),
  });

  return mapBackendDonationUpdate(response.data);
}

export async function loadDonationSupporters(campaignId: number) {
  const response = await apiJson<{ data: BackendDonationTransaction[] }>(`/donations/campaigns/${campaignId}/transactions`, {
    clearAuthOnUnauthorized: false,
  });

  return (response.data || []).map(mapBackendDonationTransaction);
}

export async function loadDonationPayoutRequests(campaignId: number) {
  const response = await apiJson<{ data: BackendDonationPayoutRequest[] }>(`/donations/campaigns/${campaignId}/payout-requests`);

  return (response.data || []).map(mapBackendDonationPayoutRequest);
}

export async function createDonationPayoutRequest(
  campaignId: number,
  payload: { amount: number; reason: string },
) {
  const response = await apiJson<{ data: BackendDonationPayoutRequest }>(`/donations/campaigns/${campaignId}/payout-requests`, {
    method: "POST",
    body: JSON.stringify({
      title: payload.reason,
      description: payload.reason,
      amount_requested: payload.amount,
    }),
  });

  return mapBackendDonationPayoutRequest(response.data);
}
