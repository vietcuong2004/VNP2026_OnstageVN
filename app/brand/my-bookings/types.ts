export type BookingStatus =
  | "pending"   // Chờ duyệt
  | "approved"  // Đã duyệt
  | "completed"; // Hoàn thành

export type BookingRequest = {
  id: string; // e.g. "PG100826-001"
  talentId: string;
  talentName: string;
  talentAvatar: string;
  talentRole: string; // "MC" | "PG/PB" | "Lookbook" | "KOL"
  campaignTitle: string;
  workDate: string;
  startTime: string;
  endTime: string;
  location: string;
  depositAmount: number;
  totalBudget?: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
};
