export type CampaignType = 'placement' | 'review';

export type CampaignStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'pricing'
  | 'quotation_sent'
  | 'waiting_payment'
  | 'recruiting'
  | 'shipping'
  | 'producing'
  | 'content_review'
  | 'publishing'
  | 'measuring'
  | 'make_good'
  | 'completed'
  | 'cancelled';

export interface CreatorProduct {
  name: string;
  category: string;
  sellingPrice: number;
  description: string;
  usp: string;
  productUrl: string;
  images: string[];
  allowedClaims: string[];
  prohibitedClaims: string[];
  legalNotes?: string;
}

export interface CreatorCampaignBrief {
  platform: 'tiktok' | 'facebook_reels' | 'youtube_shorts';
  videoDuration: '15s_30s' | '30s_60s' | 'above_60s';
  mandatoryKeywords: string[];
  mandatoryHashtags: string[];
  mandatoryCta: string;
  talkingPoints: string[];
  usageRights: string[];
}

export interface CreatorAssignment {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  avatar: string;
  followers: number;
  expectedViews: number;
  actualViews: number;
  status: 'invited' | 'accepted' | 'shipping' | 'received' | 'producing' | 'draft_submitted' | 'approved' | 'published' | 'completed';
  baseFee: number;
  bonusEarned: number;
  publishedUrl?: string;
  publishDate?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  viewsD1?: number;
  viewsD3?: number;
  viewsD7?: number;
  viewsD14?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface CampaignQuotation {
  id: string;
  campaignId: string;
  targetViews: number;
  creatorCount: number;
  contentFee: number;
  usageRightsFee: number;
  logisticsFee: number;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  expiryDate: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'revision_requested';
  revisionNote?: string;
}

export interface CreatorCampaignItem {
  id: string;
  campaignCode: string;
  title: string;
  product: CreatorProduct;
  campaignType: CampaignType;
  targetViews: number;
  deliveredViews: number;
  measurementDays: number;
  deadline: string;
  budget: number;
  status: CampaignStatus;
  createdAt: string;
  brief: CreatorCampaignBrief;
  quotation?: CampaignQuotation;
  creators: CreatorAssignment[];
}
