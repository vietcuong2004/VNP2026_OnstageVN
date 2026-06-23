export interface DonationCampaign {
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
  status: "active" | "completed";
  details?: string;
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
