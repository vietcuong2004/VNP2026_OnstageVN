export type ComboboxOption = {
  label: string;
  value: string;
};

export type ComboboxPresetGroup = {
  title: string;
  keywords?: readonly string[];
  options: readonly string[];
};

export const CITY_VALUES = [
  "Tỉnh An Giang",
  "Tỉnh Bắc Ninh",
  "Tỉnh Cà Mau",
  "Tỉnh Cao Bằng",
  "TP. Cần Thơ",
  "TP. Đà Nẵng",
  "Tỉnh Đắk Lắk",
  "Tỉnh Điện Biên",
  "Tỉnh Đồng Nai",
  "Tỉnh Đồng Tháp",
  "Tỉnh Gia Lai",
  "TP. Hà Nội",
  "Tỉnh Hà Tĩnh",
  "TP. Hải Phòng",
  "TP. Hồ Chí Minh",
  "TP. Huế",
  "Tỉnh Hưng Yên",
  "Tỉnh Khánh Hòa",
  "Tỉnh Lai Châu",
  "Tỉnh Lâm Đồng",
  "Tỉnh Lạng Sơn",
  "Tỉnh Lào Cai",
  "Tỉnh Nghệ An",
  "Tỉnh Ninh Bình",
  "Tỉnh Phú Thọ",
  "Tỉnh Quảng Ngãi",
  "Tỉnh Quảng Ninh",
  "Tỉnh Quảng Trị",
  "Tỉnh Sơn La",
  "Tỉnh Tây Ninh",
  "Tỉnh Thái Nguyên",
  "Tỉnh Thanh Hóa",
  "Tỉnh Tuyên Quang",
  "Tỉnh Vĩnh Long",
] as const;

export const TALENT_TYPE_VALUES = [
  "Diễn viên",
  "Người mẫu",
  "KOL",
  "KOC",
  "Livestreamer",
  "MC",
  "PG/PB",
  "Hoa hậu",
] as const;

export const CONTENT_SKILL_VALUES = [
  "Beauty",
  "Food",
  "Make-up",
  "Thời trang",
  "Travel",
  "Cafe",
  "Lifestyle",
] as const;

export const SOCIAL_HIGHLIGHT_PRESET_GROUPS: ComboboxPresetGroup[] = [
  {
    title: "KOL / KOC",
    keywords: ["kol", "koc"],
    options: [
      "5K+ Followers",
      "10K+ Followers",
      "50K+ Followers",
      "100K+ Followers",
      "100K+ Views",
      "500K+ Views",
      "1000+ Likes",
      "10K+ Likes",
    ],
  },
  {
    title: "Livestreamer",
    keywords: ["livestreamer", "livestream"],
    options: [
      "10+ Phiên livestream",
      "50+ Phiên livestream",
      "100+ Đơn hàng",
      "500+ Đơn hàng",
      "Tỉ lệ chốt đơn tốt",
      "Có kinh nghiệm live bán hàng",
      "Có kinh nghiệm live TikTok Shop",
    ],
  },
  {
    title: "Diễn viên",
    keywords: ["diễn viên", "dien vien"],
    options: [
      "Đã tham gia TVC",
      "Đã tham gia phim ngắn",
      "Đã tham gia phim truyền hình",
      "Đã tham gia web drama",
      "Có kinh nghiệm diễn xuất trước máy quay",
      "Có khả năng thoại tốt",
    ],
  },
  {
    title: "MC",
    keywords: ["mc"],
    options: [
      "10+ Sự kiện dẫn chương trình",
      "30+ Sự kiện dẫn chương trình",
      "Có kinh nghiệm MC sự kiện",
      "Có kinh nghiệm MC livestream",
      "Có khả năng hoạt náo",
      "Giọng nói rõ ràng",
    ],
  },
  {
    title: "PG/PB",
    keywords: ["pg/pb", "pg", "pb"],
    options: [
      "Có kinh nghiệm activation",
      "Có kinh nghiệm sampling",
      "Có kinh nghiệm event",
      "Có kinh nghiệm roadshow",
      "Có tác phong chuyên nghiệp",
      "Giao tiếp tốt",
    ],
  },
  {
    title: "Người mẫu / Hoa hậu",
    keywords: ["người mẫu", "nguoi mau", "hoa hậu", "hoa hau"],
    options: [
      "Có kinh nghiệm lookbook",
      "Có kinh nghiệm catwalk",
      "Có kinh nghiệm chụp studio",
      "Có kinh nghiệm chụp campaign",
      "Từng tham gia cuộc thi sắc đẹp",
      "Từng đạt giải cuộc thi",
    ],
  },
];

export const CITY_OPTIONS: ComboboxOption[] = CITY_VALUES.map((value) => ({ label: value, value }));
export const TALENT_TYPE_OPTIONS: ComboboxOption[] = TALENT_TYPE_VALUES.map((value) => ({ label: value, value }));
export const CONTENT_SKILL_OPTIONS: ComboboxOption[] = CONTENT_SKILL_VALUES.map((value) => ({ label: value, value }));
export const DEFAULT_CITY_VALUE = "TP. Hà Nội";
export const DEFAULT_TALENT_TYPE_VALUE = "Người mẫu";

export function normalizeTalentTypeLabel(type: unknown) {
  const value = String(type || "").trim();
  return ["pg", "pb", "pg/pb"].includes(value.toLowerCase()) ? "PG/PB" : value;
}

export function normalizeTalentTypeList(types: unknown) {
  const list = Array.isArray(types) ? types : [];
  return Array.from(new Set(list.map(normalizeTalentTypeLabel).filter(Boolean)));
}

export function normalizeTalentTypeKey(type: string) {
  const normalized = type.toLowerCase().trim();
  return ["pg", "pb", "pg/pb"].includes(normalized) ? "pg/pb" : normalized;
}
