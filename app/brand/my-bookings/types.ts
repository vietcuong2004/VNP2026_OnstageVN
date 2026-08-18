export type BookingStatus =
  | "deposit_pending"
  | "submitted"
  | "reviewing"
  | "talent_confirming"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed";

export type BookedTalentSummary = {
  id: string;
  talentId: string;
  talentName: string;
  talentAvatar: string;
  talentRole: string;
  status?: string;
  note?: string;
};

export type BookingRequest = {
  id: string;
  bookingType?: "single" | "multiple" | string;
  talentId: string;
  talentName: string;
  talentAvatar: string;
  talentRole: string;
  bookedTalents?: BookedTalentSummary[];
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
  paymentStatus?: string;
  createdAt: string;
};