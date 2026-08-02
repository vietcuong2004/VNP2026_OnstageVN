export type ComboboxOption = {
  label: string;
  value: string;
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
