import { CONTENT_SKILL_VALUES } from "@/components/ui/ComboboxOptionValues";

export type TalentPresetGroup = {
  title: string;
  keywords?: readonly string[];
  options: readonly string[];
};

export const SPECIALTY_PRESET_GROUPS: TalentPresetGroup[] = [
  {
    title: "KOL",
    keywords: ["kol"],
    options: [
      ...CONTENT_SKILL_VALUES,
      "Review sản phẩm",
      "Unbox sản phẩm",
      "Sáng tạo nội dung ngắn",
      "Affiliate content",
      "Lifestyle vlog",
      "Chụp ảnh lifestyle",
    ],
  },
  {
    title: "KOC",
    keywords: ["koc"],
    options: [
      "Review sản phẩm",
      "Unbox sản phẩm",
      "So sánh sản phẩm",
      "Trải nghiệm dịch vụ",
      "Affiliate content",
      "Beauty",
      "Food",
      "Lifestyle",
      "Đồ gia dụng",
      "Mẹ và bé",
    ],
  },
  {
    title: "Livestreamer",
    keywords: ["livestreamer"],
    options: [
      "Livestream bán hàng",
      "Livestream giải trí",
      "Giới thiệu sản phẩm",
      "Chốt đơn livestream",
      "Tương tác khán giả",
      "Mini game livestream",
      "Host phiên live",
    ],
  },
  {
    title: "Diễn viên",
    keywords: ["diễn viên", "dien vien", "actor"],
    options: [
      "Diễn viên nhí",
      "Diễn viên teen",
      "Diễn viên trẻ",
      "Diễn viên trung niên",
      "Điện ảnh",
      "Truyền hình",
      "Web drama",
      "TVC",
      "Giọng miền Bắc",
      "Giọng miền Nam",
      "Diễn biến cảm xúc",
    ],
  },
  {
    title: "MC",
    keywords: ["mc"],
    options: [
      "MC song ngữ",
      "MC tiếng Anh",
      "MC tiếng Hàn",
      "MC tiếng Trung",
      "MC sự kiện",
      "MC hoạt náo",
      "MC truyền hình",
      "MC khai trương",
      "MC du lịch",
      "MC game show",
    ],
  },
  {
    title: "PG / PB",
    keywords: ["pg", "pb", "pg/pb"],
    options: [
      "PG sampling",
      "PG inline",
      "PG event",
      "PB event",
      "Activation",
      "Roadshow",
      "Booth event",
      "Lễ tân sự kiện",
      "Tư vấn sản phẩm",
    ],
  },
  {
    title: "Người mẫu",
    keywords: ["người mẫu", "nguoi mau", "model"],
    options: [
      "Mẫu nhí",
      "Mẫu teen",
      "Mẫu lookbook",
      "Mẫu thể thao",
      "Mẫu thời trang công sở",
      "Mẫu tay",
      "Catwalk",
      "Pose dáng",
      "Beauty shot",
      "Runway",
    ],
  },
  {
    title: "Hoa hậu",
    keywords: ["hoa hậu", "hoa hau"],
    options: [
      "Đại sứ thương hiệu",
      "Trình diễn sân khấu",
      "Kỹ năng ứng xử",
      "Hoạt động cộng đồng",
      "Public speaking",
      "Sự kiện thảm đỏ",
      "Photoshoot pageant",
      "Giao tiếp truyền thông",
    ],
  },
];

export const SOCIAL_HIGHLIGHT_PRESET_GROUPS: TalentPresetGroup[] = [
  {
    title: "KOL / KOC",
    keywords: ["kol", "koc"],
    options: [
      "1K+ Followers",
      "5K+ Followers",
      "10K+ Followers",
      "50K+ Followers",
      "100K+ Views",
      "1000+ Likes",
      "Từng review sản phẩm",
      "Từng làm affiliate",
      "Tỷ lệ tương tác tốt",
    ],
  },
  {
    title: "Livestreamer",
    keywords: ["livestreamer"],
    options: [
      "Livestream 20+ người xem",
      "Livestream 50+ người xem",
      "Từng live 2+ giờ",
      "Từng chốt 20+ đơn/live",
      "10+ phiên livestream",
      "Tương tác chat tốt",
    ],
  },
  {
    title: "Diễn viên",
    keywords: ["diễn viên", "dien vien", "actor"],
    options: [
      "Từng tham gia phim ngắn",
      "Từng tham gia TVC",
      "Từng tham gia web drama",
      "3+ vai diễn",
      "Từng qua casting",
      "Có showreel diễn xuất",
    ],
  },
  {
    title: "MC / sự kiện",
    keywords: ["mc"],
    options: [
      "5+ sự kiện",
      "10+ sự kiện",
      "Từng dẫn sân khấu 100+ khách",
      "MC song ngữ",
      "Có video demo MC",
      "Có giải thưởng liên quan",
    ],
  },
  {
    title: "PG / PB",
    keywords: ["pg", "pb", "pg/pb"],
    options: [
      "5+ ca activation",
      "10+ ca activation",
      "Từng làm sampling",
      "Từng làm roadshow",
      "Từng trực booth",
      "Feedback khách hàng tốt",
    ],
  },
  {
    title: "Người mẫu / Hoa hậu",
    keywords: ["người mẫu", "nguoi mau", "model", "hoa hậu", "hoa hau"],
    options: [
      "Từng chụp lookbook",
      "Từng chụp beauty shot",
      "Từng trình diễn thời trang",
      "Có kinh nghiệm catwalk",
      "Có ảnh profile chuyên nghiệp",
      "Từng tham gia cuộc thi nhan sắc",
      "Từng hoạt động cộng đồng",
    ],
  },
  {
    title: "Newbie / mới bắt đầu",
    options: [
      "Sẵn sàng nhận job đầu tiên",
      "Đang xây kênh cá nhân",
      "Có portfolio cá nhân",
      "Sẵn sàng đi casting",
      "Từng tham gia CLB/đội nhóm",
      "Đã hoàn thành khóa học kỹ năng",
      "Có thiết bị quay/chụp cơ bản",
      "Có lịch rảnh linh hoạt",
    ],
  },
];

function normalizePresetLookup(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function resolveTalentPresetGroups(groups: readonly TalentPresetGroup[], selectedTypes: readonly string[]) {
  const selectedKeys = selectedTypes.map(normalizePresetLookup).filter(Boolean);
  const typedGroups = groups.filter((group) => group.keywords?.length);
  const fallbackGroups = typedGroups.length ? typedGroups : [...groups];
  const alwaysGroups = groups.filter((group) => !group.keywords?.length);

  if (!selectedKeys.length) {
    return [...fallbackGroups, ...alwaysGroups];
  }

  const matchedGroups = typedGroups.filter((group) => group.keywords?.some((keyword) => {
    const normalizedKeyword = normalizePresetLookup(keyword);
    return selectedKeys.some((selectedKey) => selectedKey.includes(normalizedKeyword) || normalizedKeyword.includes(selectedKey));
  }));

  return [...(matchedGroups.length ? matchedGroups : fallbackGroups), ...alwaysGroups];
}

export function flattenTalentPresetOptions(groups: readonly TalentPresetGroup[], selectedTypes: readonly string[]) {
  return Array.from(new Set(resolveTalentPresetGroups(groups, selectedTypes).flatMap((group) => group.options)));
}
