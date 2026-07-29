export type StepId = 1 | 2 | 3 | 4;

export type StepInfo = {
  id: StepId;
  title: string;
  subtitle: string;
  status: "complete" | "warning" | "empty" | "error";
};

export type SubActivity = {
  id: string;
  stt: string; // e.g., "1", "2", "A", "B"
  title: string; // Nội dung hoạt động
  location: string; // Địa điểm tổ chức
  startDate: string; // "2026-07-29T08:00"
  endDate: string;   // "2026-07-29T17:00"
  timeline?: string;
  isPublic?: boolean;
};

export type Phase = {
  id: string;
  code: string; // e.g. "I", "II", "III", "IV"
  name: string;
  publicName: string;
  startDate: string; // "2026-07-29T08:00"
  endDate: string;   // "2026-07-29T17:00"
  timeline?: string;
  location?: string;
  address?: string;
  status: string;
  isPublic: boolean;
  activities: SubActivity[];
};

export type Sponsor = {
  id: string;
  name: string;
  logo: string;
  tier: string;
};

export type Partner = {
  id: string;
  name: string;
  logo: string;
  type: "Truyền thông" | "Địa điểm" | "Công nghệ" | "Lưu trú" | "Khác";
};

export type ConditionItem = {
  id: string;
  title: string;
  desc: string;
  mandatory: boolean;
};

export type DocumentItem = {
  id: string;
  name: string;
  desc: string;
  mandatory: boolean;
};

export type Judge = {
  id: string;
  name: string;
  role: string;
  title: string;
  avatar: string;
};

export type Candidate = {
  id: string;
  sbd: string;
  name: string;
  city: string;
  year: number;
  avatar: string;
};

export type GeneralInfoState = {
  name: string;
  shortName: string;
  season: string;
  slogan: string;
  category: string;
  logoUrl: string;
  coverDesktop: string;
  coverMobile: string;
  videoUrl: string;
  shortDesc: string;
  richIntro: string;
  goals: string;
  targetCandidates: string;
  scope: string;
  startDate: string;
  endDate: string;
  primaryLocation: string;
  cities: string[];
  format: string;
  slug: string;
  seoTitle: string;
  seoDesc: string;
  images?: string[];
};

export type TimelineDataState = {
  importMode: "excel" | "manual";
  isExcelLoaded: boolean;
  excelFileName: string;
  phases: Phase[];
};

export type RegistrationDataState = {
  isOpenRegistration: boolean;
  status: string;
  startDate: string;
  deadlineDate: string;
  maxCandidates: number;
  method: "onstage" | "external" | "qr" | "contact";
  externalUrl: string;
  qrUrl: string;
  hotline: string;
  email: string;
  conditions: ConditionItem[];
  documents: DocumentItem[];
  downloadableFiles: Array<{ id: string; name: string; type: string; isPublic: boolean }>;
};

export type PublicContentState = {
  enabledSections: {
    announcements: boolean;
    judges: boolean;
    candidates: boolean;
    results: boolean;
    news: boolean;
    gallery: boolean;
  };
  announcements: Array<{ id: string; title: string; date: string; level: string; summary: string }>;
  judges: Judge[];
  candidates: Candidate[];
  news: Array<{ id: string; title: string; date: string; image: string; summary: string }>;
  gallery: Array<{ id: string; title: string; image: string }>;
};

export type SponsorsDataState = {
  organizer: {
    name: string;
    englishName: string;
    logo: string;
    role: string;
    website: string;
  };
  sponsors: Sponsor[];
  partners: Partner[];
  contact: {
    hotline: string;
    email: string;
    address: string;
    supportHours: string;
  };
};
