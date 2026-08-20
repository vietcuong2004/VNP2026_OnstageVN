export type BookingStatus =
  | "pending_confirmation"
  | "contacting_idols"
  | "need_replacement"
  | "idols_confirmed"
  | "waiting_payment"
  | "paid"
  | "waiting_payout"
  | "completed"
  | "cancelled"
  | "deposit_pending"
  | "submitted"
  | "reviewing"
  | "talent_confirming"
  | "confirmed"
  | "rejected";

export type BookedTalentSummary = {
  id: string;
  talentId: string;
  talentName: string;
  talentAvatar: string;
  talentRole: string;
  status?: string;
  note?: string;
  price?: number;
};

export type BookingRequest = {
  id: string;
  backendId?: string;
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
  totalAmount?: number;
  totalBudget?: number;
  clientQuotedAmount?: number;
  remainingAmount?: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  notes?: string;
  status: BookingStatus;
  paymentStatus?: string;
  createdAt: string;
};
