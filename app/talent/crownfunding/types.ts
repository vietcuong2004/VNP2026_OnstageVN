export type DonationCampaignStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "paused"
  | "closed"
  | "rejected";

export interface DonationCampaign {
  id?: string | number;
  slug?: string;
  title: string;
  description: string;
  coverImage: string;
  coverImages?: string[];
  goal: number;
  raised: number;
  supportersCount: number;
  disbursed: number;
  startDate: string;
  endDate: string;
  status: DonationCampaignStatus;
  details?: string;
  progressPercent?: number;
  collectionChannel?: {
    provider?: string;
    channelCode?: string;
    status?: string;
    qrCodeSvg?: string;
    qrPayload?: string;
  };
  qrCodeSvg?: string;
  qrPayload?: string;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  talentName?: string;
}

export interface UpdateLog {
  id: string;
  title: string;
  content: string;
  image?: string;
  date: string;
}

export interface Supporter {
  name: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  isBrand?: boolean;
  date: string;
}

export interface PayoutRequest {
  id: string;
  amount: number;
  reason: string;
  filesCount: number;
  status: "pending" | "approved" | "rejected";
  date: string;
}
