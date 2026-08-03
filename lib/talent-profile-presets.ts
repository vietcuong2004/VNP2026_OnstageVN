import { CONTENT_SKILL_VALUES, SOCIAL_HIGHLIGHT_PRESET_GROUPS as SHARED_SOCIAL_HIGHLIGHT_PRESET_GROUPS } from "@/components/ui/ComboboxOptionValues";
import type { ComboboxPresetGroup } from "@/components/ui/ComboboxOptionValues";

export type TalentPresetGroup = ComboboxPresetGroup;

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

export const SOCIAL_HIGHLIGHT_PRESET_GROUPS = SHARED_SOCIAL_HIGHLIGHT_PRESET_GROUPS;

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
