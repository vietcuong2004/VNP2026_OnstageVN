export type LifestyleService = {
  id: string; // "golf", "pickleball", "dining", "cafe", "travel", "redcarpet", "shopping", "art", "escort", "content"
  title: string;
  rate: number;
  unit: string;
  description: string;
  enabled: boolean;
};

export type TalentBadge = {
  id?: number | string;
  code?: string | null;
  title?: string | null;
  description?: string | null;
  tier?: string | null;
  color_scheme?: string | null;
  icon?: string | null;
  period_type?: string | null;
  period_value?: string | null;
  score?: number | null;
};

export type TalentProfile = {
  id: string;
  userId?: string;
  name: string;
  type: string;
  talentTypes?: string[];
  city: string;
  district: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  bust: number;
  waist: number;
  hips: number;
  skinTone: string;
  hairColor: string;
  yearsOfExperience: number;
  tier: "S" | "A" | "B" | "C" | "Potential";
  badges?: TalentBadge[];
  active_badges?: TalentBadge[];
  isOwner?: boolean;
  canBook?: boolean;
  verified: boolean;
  rating: number;
  completedJobs: number;
  responseRate: number;
  followersCount: number;
  followers: string;
  engagementRate: number;
  platforms: string[];
  rateValue: number;
  rate: string;
  rateUnit: string;
  avatar: string;
  cover: string | null;
  fullBodyImage: string | null;
  skills: string[];
  socialHighlights?: string[];
  experience: string;
  portfolio: string[];
  videos?: Array<{
    id: string | number;
    title: string;
    url: string;
    thumbnailUrl?: string;
    videoType?: string;
    sortOrder?: number;
  }>;
  availability: string;
  availabilityDates: string[];
  completion: number;
  matchScore: number;
  reliability: number;
  education: string;
  languages: string[];
  rateCard: Record<string, number>;
  lifestyleServices?: LifestyleService[];
  email?: string;
  phone?: string;
  dob?: string;
  surveyScores?: { pageant: number; runway: number; kol: number };
  mainCategory?: string;
  aiScore?: number;
  price?: string;
  portfolio_url?: string;
  socialAccounts?: Array<{ platform: string; url: string }>;
  createdAt?: string;
  created_at?: string;
};

export type CampaignStage = "new" | "accepted" | "executing" | "completed" | "confirmed";

export type CampaignTalent = {
  talentId: string;
  stage: CampaignStage;
  note: string;
  referredByTalentId?: string; // ID of the KOL who invited them to this campaign
};

export type CampaignSponsorship = {
  category: string;
  details: string;
};

export type CampaignMedia = {
  id?: string | number;
  url?: string | null;
  path?: string | null;
  category?: string | null;
  caption?: string | null;
  is_primary?: boolean;
};

export type CampaignEvent = {
  id?: string | number;
  name: string;
  startAt: string;
  endAt: string;
  location?: string;
  content?: string[];
  sortOrder?: number;
};

export type CampaignPosition = {
  id?: string | number;
  talentType: string;
  quantity: number;
  requirements?: string[];
  sortOrder?: number;
};

export type Campaign = {
  id: string;
  title: string;
  jobType: string;
  eventName?: string;
  campaignType?: string;
  city: string;
  address: string;
  startDate: string;
  endDate: string;
  startDateRaw?: string;
  endDateRaw?: string;
  applicationDeadline?: string;
  applicationDeadlineRaw?: string;
  eventDate?: string;
  onstageTime?: string;
  eventTime?: string;
  isOwner?: boolean;
  canApply?: boolean;
  deadline: string;
  talentQuantity: number;
  budget: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  budgetRaw?: string;
  budget_raw?: string;
  budget_unit?: string | null;
  budgetNote?: string;
  budgetValue: number;
  benefits: string;
  roles?: string[];
  responsibilities?: string[];
  industries?: string[];
  targetProfiles?: string[];
  contactNote?: string;
  status: "draft" | "published" | "closed";
  shortlistedTalentIds: string[];
  applicants: CampaignTalent[];
  contactRequests: number;
  description: string;
  requirements: string;
  heightMinCm?: number | null;
  weightMaxKg?: number | null;
  experienceMinYears?: number | null;
  views: number;
  sponsorships?: CampaignSponsorship[];
  escrowed?: boolean;
  media?: CampaignMedia[];
  coverMedia?: CampaignMedia | null;
  events?: CampaignEvent[];
  positions?: CampaignPosition[];
};

export const LIFESTYLE_SERVICES_TEMPLATES = [
  { id: "golf", title: "Sport Companion (Golf)", description: "Người đẹp đồng hành, am hiểu văn hóa ứng xử sân golf VIP.", unit: "giờ" },
  { id: "pickleball", title: "Sport Companion (Pickleball)", description: "Hot Influencer năng động, lan tỏa phong cách sống khỏe khoắn.", unit: "giờ" },
  { id: "dining", title: "Business Dining (Fine Dining)", description: "Giao tiếp ngoại giao xuất sắc, nâng tầm các buổi tiệc chiêu đãi đối tác.", unit: "buổi" },
  { id: "cafe", title: "VIP Cafe & Networking", description: "Kết nối tư duy tri thức, trò chuyện tại các không gian Luxury Hub.", unit: "giờ" },
  { id: "travel", title: "Business Travel Companion", description: "Tháp tùng công tác dài ngày, bảo mật tuyệt đối bằng hợp đồng NDA.", unit: "ngày" },
  { id: "redcarpet", title: "Red-Carpet Companion", description: "Khí chất thảm đỏ xuất sắc, tháp tùng các sự kiện Gala/Triển lãm VIP.", unit: "sự kiện" },
  { id: "shopping", title: "Luxury Shopping Advisor", description: "Fashionista/Stylist đồng hành mua sắm tại các Boutique xa xỉ.", unit: "buổi" },
  { id: "art", title: "Art & Exhibition Companion", description: "Thưởng lãm nghệ thuật, hòa nhạc, đấu giá tranh cổ chiều sâu tri thức.", unit: "buổi" },
  { id: "escort", title: "Launching Event Escort", description: "Nhân sự hình ảnh tháp tùng lễ bàn giao siêu xe, du thuyền cao cấp.", unit: "sự kiện" },
  { id: "content", title: "Daily Content Companion", description: "KOC đồng hành sáng tạo nội dung, xây dựng thương hiệu cá nhân cho CEO.", unit: "ngày" }
];

export const SPONSORSHIP_CATEGORIES = [
  { id: "cash", label: "Tiền mặt / Thù lao phụ" },
  { id: "makeup", label: "Tài trợ Trang điểm (Makeup)" },
  { id: "hair", label: "Tài trợ Làm tóc (Hair Styling)" },
  { id: "gown", label: "Tài trợ Trang phục dạ hội" },
  { id: "aodai", label: "Tài trợ Áo dài truyền thống" },
  { id: "casual", label: "Tài trợ Trang phục thường ngày" },
  { id: "sports", label: "Tài trợ Trang phục thể thao" },
  { id: "jewelry", label: "Tài trợ Trang sức cao cấp" },
  { id: "skincare", label: "Tài trợ Mỹ phẩm dưỡng da" },
  { id: "hotel", label: "Tài trợ Khách sạn/Lưu trú VIP" },
  { id: "flight", label: "Tài trợ Vé máy bay khứ hồi" },
  { id: "limo", label: "Tài trợ Xe đưa đón Limousine" },
  { id: "fb", label: "Tài trợ Ăn uống (F&B) cao cấp" },
  { id: "gym", label: "Tài trợ Thẻ tập Gym & Fitness" },
  { id: "dental", label: "Tài trợ Chăm sóc nha khoa" },
  { id: "aesthetic", label: "Tài trợ Thẩm mỹ viện & Skincare" },
  { id: "studio", label: "Tài trợ Chụp ảnh & Studio" },
  { id: "pr", label: "Tài trợ Gói truyền thông PR báo chí" },
  { id: "sound", label: "Tài trợ Kỹ thuật Âm thanh & Ánh sáng" },
  { id: "accessories", label: "Tài trợ Phụ kiện thời trang" },
  { id: "shoes", label: "Tài trợ Giày cao gót NTK" },
  { id: "resort", label: "Tài trợ Voucher Nghỉ dưỡng & Spa" },
  { id: "insurance", label: "Tài trợ Bảo hiểm sức khỏe sự kiện" },
  { id: "pt", label: "Tài trợ Huấn luyện viên thể hình (PT)" },
  { id: "training", label: "Tài trợ Đào tạo MC & Kỹ năng" }
];

export const partnerProfile = {
  organizationName: "L'Oréal Vietnam Cosmetics",
  organizationType: "brand",
  industry: "Beauty & Lifestyle",
  contactName: "Nguyễn Văn Hùng",
  contactEmail: "contact@loreal-vietnam.com",
  contactPhone: "0901234567",
  city: "TP. Hồ Chí Minh",
  completion: 82,
  verificationStatus: "Đang xác minh",
};

export const talents: TalentProfile[] = [
  {
    id: "tal-1",
    name: "Nguyễn Mai Anh",
    type: "KOL",
    city: "Hà Nội",
    district: "Ba Đình",
    gender: "Nữ",
    age: 24,
    height: 172,
    weight: 51,
    bust: 85,
    waist: 60,
    hips: 90,
    skinTone: "Sáng",
    hairColor: "Nâu đen",
    yearsOfExperience: 3,
    tier: "S",
    verified: true,
    rating: 4.9,
    completedJobs: 18,
    responseRate: 96,
    followersCount: 120000,
    followers: "120K",
    engagementRate: 4.8,
    platforms: ["TikTok", "Instagram", "Facebook"],
    rateValue: 8000000,
    rate: "từ 8.000.000đ",
    rateUnit: "dự án",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&h=500&q=80",
    cover: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    fullBodyImage: "/fullbody_model.png",
    skills: ["Livestream", "MC", "Beauty review", "Social content"],
    experience: "3 năm làm KOL ngành mỹ phẩm, từng tham gia hơn 20 chiến dịch social commerce.",
    portfolio: ["Beauty Mega Live", "Organic Glow Launch", "Summer Makeup Lookbook"],
    availability: "Rảnh từ 10/06 đến 20/06",
    availabilityDates: ["2026-06-10", "2026-06-15", "2026-06-17"],
    completion: 94,
    matchScore: 98,
    reliability: 96,
    education: "Cử nhân Học viện Ngoại giao",
    languages: ["Tiếng Việt", "Tiếng Anh IELTS 7.5"],
    rateCard: {
      "TikTok Video": 5000000,
      "Livestream 2h": 8000000,
      "Instagram Post": 3000000,
      "Event Appearance": 12000000,
    },
    lifestyleServices: [
      { id: "golf", title: "Sport Companion (Golf)", rate: 2500000, unit: "giờ", description: "Người đẹp đồng hành, am hiểu văn hóa ứng xử sân golf VIP.", enabled: true },
      { id: "dining", title: "Business Dining (Fine Dining)", rate: 3000000, unit: "buổi", description: "Giao tiếp ngoại giao xuất sắc, nâng tầm các buổi tiệc chiêu đãi đối tác.", enabled: true },
      { id: "cafe", title: "VIP Cafe & Networking", rate: 1500000, unit: "giờ", description: "Kết nối tư duy tri thức, trò chuyện tại các không gian Luxury Hub.", enabled: true },
      { id: "travel", title: "Business Travel Companion", rate: 10000000, unit: "ngày", description: "Tháp tùng công tác dài ngày, bảo mật tuyệt đối bằng hợp đồng NDA.", enabled: true },
      { id: "redcarpet", title: "Red-Carpet Companion", rate: 15000000, unit: "sự kiện", description: "Khí chất thảm đỏ xuất sắc, tháp tùng các sự kiện Gala/Triển lãm VIP.", enabled: true },
      { id: "shopping", title: "Luxury Shopping Advisor", rate: 2000000, unit: "buổi", description: "Fashionista/Stylist đồng hành mua sắm tại các Boutique xa xỉ.", enabled: true },
      { id: "art", title: "Art & Exhibition Companion", rate: 1800000, unit: "buổi", description: "Thưởng lãm nghệ thuật, hòa nhạc, đấu giá tranh cổ chiều sâu tri thức.", enabled: true },
      { id: "escort", title: "Launching Event Escort", rate: 8000000, unit: "sự kiện", description: "Nhân sự hình ảnh tháp tùng lễ bàn giao siêu xe, du thuyền cao cấp.", enabled: true },
      { id: "content", title: "Daily Content Companion", rate: 5000000, unit: "ngày", description: "KOC đồng hành sáng tạo nội dung, xây dựng thương hiệu cá nhân cho CEO.", enabled: true }
    ],
  },
  {
    id: "tal-2",
    name: "Khánh Linh",
    type: "Model",
    city: "TP. Hồ Chí Minh",
    district: "Quận 1",
    gender: "Nữ",
    age: 22,
    height: 175,
    weight: 53,
    bust: 83,
    waist: 59,
    hips: 89,
    skinTone: "Trung tính",
    hairColor: "Đen",
    yearsOfExperience: 4,
    tier: "B",
    verified: true,
    rating: 4.8,
    completedJobs: 22,
    responseRate: 91,
    followersCount: 85000,
    followers: "85K",
    engagementRate: 5.2,
    platforms: ["Instagram", "TikTok"],
    rateValue: 5500000,
    rate: "từ 5.500.000đ",
    rateUnit: "ngày",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&h=500&q=80",
    cover: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80",
    fullBodyImage: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=700&q=80",
    skills: ["Lookbook", "Runway", "Fashion video", "Pose dáng"],
    experience: "Model lookbook và runway, phù hợp thời trang, lifestyle, mỹ phẩm cao cấp.",
    portfolio: ["Summer Fashion Runway", "Minimal Lookbook Q2"],
    availability: "Rảnh cuối tuần",
    availabilityDates: ["2026-06-15", "2026-06-16", "2026-06-22"],
    completion: 88,
    matchScore: 95,
    reliability: 94,
    education: "Cao đẳng Nghệ thuật",
    languages: ["Tiếng Việt", "Tiếng Anh giao tiếp"],
    rateCard: {
      "Lookbook 1 ngày": 5500000,
      "Runway show": 9000000,
      "Fashion video": 7000000,
    },
    lifestyleServices: [
      { id: "pickleball", title: "Sport Companion (Pickleball)", rate: 1500000, unit: "giờ", description: "Hot Influencer năng động, lan tỏa phong cách sống khỏe khoắn.", enabled: true },
      { id: "redcarpet", title: "Red-Carpet Companion", rate: 8000000, unit: "sự kiện", description: "Khí chất thảm đỏ xuất sắc, tháp tùng các sự kiện Gala/Triển lãm VIP.", enabled: true },
      { id: "shopping", title: "Luxury Shopping Advisor", rate: 1500000, unit: "buổi", description: "Fashionista/Stylist đồng hành mua sắm tại các Boutique xa xỉ.", enabled: true }
    ],
  },
  {
    id: "tal-3",
    name: "Lê Ngọc Hân",
    type: "MC",
    city: "TP. Hồ Chí Minh",
    district: "Quận 3",
    gender: "Nữ",
    age: 27,
    height: 170,
    weight: 50,
    bust: 86,
    waist: 61,
    hips: 91,
    skinTone: "Sáng",
    hairColor: "Nâu",
    yearsOfExperience: 5,
    tier: "A",
    verified: true,
    rating: 4.9,
    completedJobs: 31,
    responseRate: 88,
    followersCount: 240000,
    followers: "240K",
    engagementRate: 3.9,
    platforms: ["Facebook", "Instagram"],
    rateValue: 12000000,
    rate: "từ 12.000.000đ",
    rateUnit: "sự kiện",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&h=500&q=80",
    cover: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    fullBodyImage: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=700&q=80",
    skills: ["MC event", "Public speaking", "Interview", "Brand ambassador"],
    experience: "MC sự kiện và đại sứ thương hiệu, mạnh về beauty, lifestyle và talkshow.",
    portfolio: ["Organic Glow Cosmetics", "Beauty Talk Live"],
    availability: "Cần đặt lịch trước 7 ngày",
    availabilityDates: ["2026-06-17", "2026-06-18", "2026-06-25"],
    completion: 96,
    matchScore: 92,
    reliability: 98,
    education: "Cử nhân Báo chí truyền thông",
    languages: ["Tiếng Việt", "Tiếng Anh trôi chảy"],
    rateCard: {
      "MC nửa ngày": 12000000,
      "MC cả ngày": 18000000,
      "Brand talkshow": 15000000,
    },
    lifestyleServices: [
      { id: "dining", title: "Business Dining (Fine Dining)", rate: 2500000, unit: "buổi", description: "Giao tiếp ngoại giao xuất sắc, nâng tầm các buổi tiệc chiêu đãi đối tác.", enabled: true },
      { id: "cafe", title: "VIP Cafe & Networking", rate: 1200000, unit: "giờ", description: "Kết nối tư duy tri thức, trò chuyện tại các không gian Luxury Hub.", enabled: true },
      { id: "content", title: "Daily Content Companion", rate: 4000000, unit: "ngày", description: "KOC đồng hành sáng tạo nội dung, xây dựng thương hiệu cá nhân cho CEO.", enabled: true }
    ],
  },
  {
    id: "tal-4",
    name: "Trần Thu Thảo",
    type: "PG/PB",
    city: "Hà Nội",
    district: "Cầu Giấy",
    gender: "Nữ",
    age: 21,
    height: 168,
    weight: 48,
    bust: 84,
    waist: 58,
    hips: 88,
    skinTone: "Sáng",
    hairColor: "Đen",
    yearsOfExperience: 2,
    tier: "C",
    verified: false,
    rating: 4.6,
    completedJobs: 9,
    responseRate: 82,
    followersCount: 36000,
    followers: "36K",
    engagementRate: 4.5,
    platforms: ["TikTok", "Facebook"],
    rateValue: 3000000,
    rate: "từ 3.000.000đ",
    rateUnit: "ngày",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&h=500&q=80",
    cover: "https://images.unsplash.com/photo-1493655161922-ef98929de9d8?auto=format&fit=crop&w=1200&q=80",
    fullBodyImage: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80",
    skills: ["PG event", "Activation", "Sampling", "Booth staff"],
    experience: "PG activation tại trung tâm thương mại, phù hợp event ngắn ngày.",
    portfolio: ["Mall Activation", "Sampling FMCG"],
    availability: "Rảnh theo ca",
    availabilityDates: ["2026-06-15", "2026-06-16", "2026-06-17"],
    completion: 72,
    matchScore: 86,
    reliability: 89,
    education: "Sinh viên truyền thông",
    languages: ["Tiếng Việt"],
    rateCard: {
      "PG theo ca": 1500000,
      "PG cả ngày": 3000000,
      "Activation 2 ngày": 5500000,
    },
  },
  {
    id: "tal-5",
    name: "Phạm Minh Anh",
    type: "Dancer",
    city: "Đà Nẵng",
    district: "Hải Châu",
    gender: "Nữ",
    age: 23,
    height: 166,
    weight: 49,
    bust: 82,
    waist: 60,
    hips: 88,
    skinTone: "Trung tính",
    hairColor: "Nâu sáng",
    yearsOfExperience: 4,
    tier: "B",
    verified: true,
    rating: 4.7,
    completedJobs: 16,
    responseRate: 90,
    followersCount: 62000,
    followers: "62K",
    engagementRate: 4.9,
    platforms: ["TikTok", "Instagram"],
    rateValue: 4500000,
    rate: "từ 4.500.000đ",
    rateUnit: "show",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=500&h=500&q=80",
    cover: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    fullBodyImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80",
    skills: ["Dance performance", "Choreography", "TikTok video"],
    experience: "Dancer biểu diễn event, viral challenge và video ngắn cho nhãn hàng.",
    portfolio: ["Dance Challenge Launch", "Music Event"],
    availability: "Rảnh tháng 06/2026",
    availabilityDates: ["2026-06-20", "2026-06-21", "2026-06-22"],
    completion: 84,
    matchScore: 84,
    reliability: 92,
    education: "Đào tạo biểu diễn chuyên nghiệp",
    languages: ["Tiếng Việt", "Tiếng Anh cơ bản"],
    rateCard: {
      "Dance performance": 4500000,
      "Choreography": 7000000,
      "TikTok challenge": 6000000,
    },
  },
];

export const savedTalentIds = ["tal-1", "tal-2", "tal-4"];

export const campaigns: Campaign[] = [
  {
    id: "camp-1",
    title: "Beauty Mega Live 06/2026",
    jobType: "KOL livestream",
    city: "Hà Nội",
    address: "Studio Ba Đình, Hà Nội",
    startDate: "2026-06-10",
    endDate: "2026-06-20",
    deadline: "2026-06-05",
    talentQuantity: 5,
    budget: "500k/ngày - 800k/ngày",
    budgetValue: 80000000,
    benefits: "Hỗ trợ makeup, trang phục, ăn nhẹ tại studio",
    status: "published",
    shortlistedTalentIds: ["tal-1", "tal-3"],
    applicants: [
      { talentId: "tal-1", stage: "accepted", note: "Phù hợp beauty livestream" },
      { talentId: "tal-3", stage: "new", note: "Cần kiểm tra lịch quay" },
      { talentId: "tal-4", stage: "new", note: "Backup PG hỗ trợ set quay", referredByTalentId: "tal-1" },
      { talentId: "tal-5", stage: "completed", note: "Đã check-in & hoàn thành buổi diễn, chờ brand nghiệm thu", referredByTalentId: "tal-3" },
    ],
    contactRequests: 2,
    views: 420,
    description: "Tìm KOL beauty livestream giới thiệu dòng sản phẩm mới, ưu tiên có kinh nghiệm review mỹ phẩm.",
    requirements: "Nữ 20-28 tuổi, có TikTok/Instagram hoạt động tốt, nói chuyện tự nhiên trước camera.",
    sponsorships: [
      { category: "Tài trợ mỹ phẩm", details: "Gói mỹ phẩm trang điểm Glow Beauty trị giá 20.000.000đ" },
      { category: "Tài trợ trang điểm", details: "Hỗ trợ chuyên gia trang điểm riêng tại Studio" },
      { category: "Tài trợ ăn uống", details: "Teabreak & nước uống lọc ion cao cấp suốt buổi quay" }
    ],
  },
  {
    id: "camp-2",
    title: "Lookbook Summer Fashion",
    jobType: "Model lookbook",
    city: "TP. Hồ Chí Minh",
    address: "Studio Quận 1, TP. Hồ Chí Minh",
    startDate: "2026-07-01",
    endDate: "2026-07-03",
    deadline: "2026-06-20",
    talentQuantity: 3,
    budget: "400k/ngày - 700k/ngày",
    budgetValue: 40000000,
    benefits: "Có ekip styling, ảnh portfolio sau buổi chụp",
    status: "draft",
    shortlistedTalentIds: ["tal-2"],
    applicants: [
      { talentId: "tal-2", stage: "new", note: "Phù hợp chiều cao và phong cách" },
    ],
    contactRequests: 0,
    views: 180,
    description: "Chụp lookbook thời trang hè, cần model nữ cao từ 170cm, phong cách clean, luxury.",
    requirements: "Nữ 18-26 tuổi, cao từ 170cm, có kinh nghiệm lookbook hoặc runway.",
    sponsorships: [
      { category: "Tài trợ trang phục dạ hội", details: "10 bộ trang phục từ nhà thiết kế thời trang haute couture" },
      { category: "Tài trợ đi lại", details: "Đưa đón bằng xe limousine từ khách sạn đến địa điểm chụp" },
      { category: "Tài trợ lưu trú", details: "Phòng nghỉ VIP tại khách sạn 5 sao Gem Center" }
    ],
  },
  {
    id: "camp-3",
    title: "PG Event Khai Trương",
    jobType: "PG event",
    city: "Hà Nội",
    address: "Trung tâm thương mại Cầu Giấy",
    startDate: "2026-06-25",
    endDate: "2026-06-26",
    deadline: "2026-06-18",
    talentQuantity: 8,
    budget: "350k/ngày - 600k/ngày",
    budgetValue: 30000000,
    benefits: "Ăn trưa, đồng phục, hỗ trợ di chuyển nội thành",
    status: "closed",
    shortlistedTalentIds: ["tal-4"],
    applicants: [
      { talentId: "tal-4", stage: "confirmed", note: "Đã xác nhận ca sáng" },
      { talentId: "tal-5", stage: "accepted", note: "Chờ xác nhận di chuyển" },
    ],
    contactRequests: 1,
    views: 260,
    description: "Cần PG cho sự kiện khai trương, làm theo ca, ưu tiên có kinh nghiệm activation.",
    requirements: "Nữ 18-25 tuổi, giao tiếp tốt, có thể đứng booth 4-6 tiếng.",
  },
  {
    id: "camp-4",
    title: "Sport Companion Golf VIP 2026",
    jobType: "⛳ Sport Companion (Golf)",
    city: "Hà Nội",
    address: "Sân Golf Vân Trì, Đông Anh, Hà Nội",
    startDate: "2026-06-15",
    endDate: "2026-06-18",
    deadline: "2026-06-12",
    talentQuantity: 4,
    budget: "600k/ngày - 900k/ngày",
    budgetValue: 60000000,
    benefits: "Bao gồm chi phí thuê sân, xe đưa đón, ăn uống tại Clubhouse",
    status: "published",
    shortlistedTalentIds: ["tal-1", "tal-2", "tal-3", "tal-5"],
    applicants: [
      { talentId: "tal-1", stage: "accepted", note: "Am hiểu luật chơi golf, ngoại giao tốt" },
      { talentId: "tal-2", stage: "executing", note: "Phong cách thể thao sang trọng" },
      { talentId: "tal-3", stage: "new", note: "Có kinh nghiệm dẫn chương trình giải đấu" },
      { talentId: "tal-5", stage: "confirmed", note: "Đã sẵn sàng lịch trình di chuyển" }
    ],
    contactRequests: 3,
    views: 310,
    description: "Tìm người đẹp đồng hành tham dự giải đấu giao hữu doanh nghiệp VIP, am hiểu văn hóa ứng xử sân golf.",
    requirements: "Nữ cao từ 168cm, gương mặt sáng, biết chơi golf hoặc có kiến thức cơ bản về golf.",
    sponsorships: [
      { category: "Tài trợ trang phục thể thao", details: "Gói đồ golf Luxury Adidas/Puma trị giá 15.000.000đ" },
      { category: "Tài trợ đi lại", details: "Xe đưa đón riêng từ Hà Nội đến sân golf Vân Trì" }
    ]
  },
  {
    id: "camp-5",
    title: "Beauty Product Review Campaign",
    jobType: "KOC review",
    city: "TP. Hồ Chí Minh",
    address: "Online / Làm việc tại nhà",
    startDate: "2026-06-20",
    endDate: "2026-07-05",
    deadline: "2026-06-15",
    talentQuantity: 6,
    budget: "400k/ngày - 650k/ngày",
    budgetValue: 35000000,
    benefits: "Được tặng trọn bộ sản phẩm dưỡng da mới nhất + Nhận hoa hồng doanh số (MLM)",
    status: "published",
    shortlistedTalentIds: ["tal-1", "tal-2", "tal-4", "tal-5"],
    applicants: [
      { talentId: "tal-1", stage: "executing", note: "Video review có kịch bản chi tiết" },
      { talentId: "tal-2", stage: "new", note: "Thích hợp phong cách skincare tối giản" },
      { talentId: "tal-4", stage: "accepted", note: "Kế hoạch lên bài 2 clip/tuần" },
      { talentId: "tal-5", stage: "completed", note: "Đã hoàn thành clip review đầu tiên, đang duyệt" }
    ],
    contactRequests: 1,
    views: 540,
    description: "Chiến dịch trải nghiệm và review dòng sản phẩm tinh chất chống lão hóa thế hệ mới trên các nền tảng TikTok và Instagram.",
    requirements: "KOC có làn da đẹp, tự tin nói trước camera, tối thiểu 20.000 followers.",
    sponsorships: [
      { category: "Tài trợ mỹ phẩm dưỡng da", details: "Trọn bộ mỹ phẩm skincare cao cấp trị giá 12.000.000đ" }
    ]
  },
  {
    id: "camp-6",
    title: "L'Oréal Paris Livestream Marathon",
    jobType: "KOL livestream",
    city: "Hà Nội",
    address: "Studio Cầu Giấy, Hà Nội",
    startDate: "2026-06-25",
    endDate: "2026-06-28",
    deadline: "2026-06-20",
    talentQuantity: 4,
    budget: "1 triệu/ngày - 1,5 triệu/ngày",
    budgetValue: 120000000,
    benefits: "Chuyên gia makeup riêng, trang phục thiết kế độc quyền, quà tặng từ L'Oréal",
    status: "published",
    shortlistedTalentIds: ["tal-1", "tal-3", "tal-4", "tal-5"],
    applicants: [
      { talentId: "tal-1", stage: "confirmed", note: "Host chính ca tối 19h-21h" },
      { talentId: "tal-3", stage: "accepted", note: "Dẫn dắt talkshow kết hợp bán hàng" },
      { talentId: "tal-4", stage: "new", note: "Hỗ trợ đứng set và test sản phẩm trực tiếp" },
      { talentId: "tal-5", stage: "executing", note: "Ca chiều 14h-16h, tập trung dòng son mới" }
    ],
    contactRequests: 4,
    views: 680,
    description: "Sự kiện Livestream Marathon kéo dài 72 giờ nhân ngày hội mua sắm giữa năm của L'Oréal Paris trên TikTok Shop.",
    requirements: "KOL/MC có khả năng chốt đơn tốt, hoạt ngôn, năng lượng tích cực trước camera suốt 2 tiếng liên tục.",
    sponsorships: [
      { category: "Tài trợ trang điểm", details: "Đội ngũ chuyên viên trang điểm cao cấp hỗ trợ tại chỗ" },
      { category: "Tài trợ ăn uống", details: "Cung cấp bữa ăn dưỡng chất chuẩn sạch cho ekip" }
    ]
  },
  {
    id: "camp-7",
    title: "Luxury Lookbook Autumn Launch",
    jobType: "Model lookbook",
    city: "TP. Hồ Chí Minh",
    address: "Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh",
    startDate: "2026-08-10",
    endDate: "2026-08-12",
    deadline: "2026-07-30",
    talentQuantity: 4,
    budget: "800k/ngày - 1,2 triệu/ngày",
    budgetValue: 90000000,
    benefits: "Được giữ lại 2 bộ trang phục yêu thích trị giá 30 triệu đồng, album hình thời trang chuyên nghiệp",
    status: "published",
    shortlistedTalentIds: ["tal-1", "tal-2", "tal-3", "tal-5"],
    applicants: [
      { talentId: "tal-1", stage: "new", note: "Phù hợp BST Thu Đông sang trọng" },
      { talentId: "tal-2", stage: "accepted", note: "Gương mặt high fashion, catwalk tốt" },
      { talentId: "tal-3", stage: "executing", note: "Đang chụp thử mẫu trang phục tại Studio" },
      { talentId: "tal-5", stage: "confirmed", note: "Đã hoàn thành thủ tục đo may đo riêng" }
    ],
    contactRequests: 2,
    views: 290,
    description: "Chụp ảnh quảng bá bộ sưu tập thời trang Thu Đông 'Autumn Glow' phong cách tối giản nhưng sang trọng và thanh lịch.",
    requirements: "Nữ người mẫu chuyên nghiệp hoặc KOL lớn, cao từ 172cm trở lên, thần thái sang trọng.",
    sponsorships: [
      { category: "Tài trợ trang phục dạ hội", details: "Bảo trợ trang phục độc quyền từ nhà thiết kế nổi tiếng" },
      { category: "Tài trợ khách sạn/lưu trú VIP", details: "Lưu trú tại resort cao cấp Anantara Mũi Né" }
    ]
  }
];

export const contactRequests = [
  {
    id: "cr-1",
    talentId: "tal-1",
    campaignId: "camp-1",
    status: "pending",
    createdAt: "2026-05-28",
  },
  {
    id: "cr-2",
    talentId: "tal-3",
    campaignId: "camp-1",
    status: "viewed",
    createdAt: "2026-05-27",
  },
  {
    id: "cr-3",
    talentId: "tal-4",
    campaignId: "camp-3",
    status: "accepted",
    createdAt: "2026-05-20",
  },
];

export function findTalentById(id: string) {
  const found = talents.find((talent) => talent.id === id);
  if (!found) return undefined;
  const slug = found.name ? found.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : `talent-${found.id}`;
  return {
    ...found,
    portfolio_url: found.portfolio_url || `https://portfolio.onstage.vn/${slug}/portfolio_main.pdf\nhttps://portfolio.onstage.vn/${slug}/lookbook_art.pdf`,
  };
}
