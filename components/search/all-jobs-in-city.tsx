"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronDown, MapPin, Search, Sparkles, X } from "lucide-react";
import { cn } from "../../lib/utils";

const DISTRICT_FILTER_PREFIX = "district:";

function makeDistrictLocationValue(city: string, district: string) {
  return `${DISTRICT_FILTER_PREFIX}${encodeURIComponent(city)}:${encodeURIComponent(district)}`;
}

function parseDistrictLocationValue(value?: string) {
  if (!value || !value.startsWith(DISTRICT_FILTER_PREFIX)) return null;
  const [city = "", district = ""] = value.slice(DISTRICT_FILTER_PREFIX.length).split(":");
  if (!city || !district) return null;
  return {
    city: decodeURIComponent(city),
    district: decodeURIComponent(district),
  };
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function parseCountNumber(countStr: string): number {
  const match = countStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export type WardItem = {
  label: string;
  value: string;
  count?: string;
};

export type DistrictItem = {
  label: string;
  value: string;
  count: string;
  wards?: WardItem[];
};

export type CityLocationItem = {
  label: string;
  value: string;
  count: string;
  districts: DistrictItem[];
};

export const TOP_34_JOB_CITIES_LOCATIONS: CityLocationItem[] = [
  {
    label: "Hà Nội",
    value: "hà nội",
    count: "100+ công việc",
    districts: [
      { label: "Ba Đình", value: "ba đình", count: "32 công việc" },
      { label: "Bạch Mai", value: "bạch mai", count: "25 công việc" },
      { label: "Cầu Giấy", value: "cầu giấy", count: "50 công việc" },
      { label: "Cửa Nam", value: "cửa nam", count: "20 công việc" },
      { label: "Đại Mỗ", value: "đại mỗ", count: "18 công việc" },
      { label: "Đống Đa", value: "đống đa", count: "36 công việc" },
      { label: "Dương Nội", value: "dương nội", count: "15 công việc" },
      { label: "Giảng Võ", value: "giảng võ", count: "22 công việc" },
      { label: "Hai Bà Trưng", value: "hai bà trưng", count: "25 công việc" },
      { label: "Hoàn Kiếm", value: "hoàn kiếm", count: "30 công việc" },
      { label: "Hoàng Liệt", value: "hoàng liệt", count: "20 công việc" },
      { label: "Hồng Hà", value: "hồng hà", count: "16 công việc" },
      { label: "Khương Đình", value: "khương đình", count: "18 công việc" },
      { label: "Kim Liên", value: "kim liên", count: "22 công việc" },
      { label: "Láng", value: "láng", count: "24 công việc" },
      { label: "Long Biên", value: "long biên", count: "18 công việc" },
      { label: "Minh Khai", value: "minh khai", count: "20 công việc" },
      { label: "Mỹ Đình", value: "mỹ đình", count: "35 công việc" },
      { label: "Nghĩa Đô", value: "nghĩa đô", count: "20 công việc" },
      { label: "Ngọc Hà", value: "ngọc hà", count: "18 công việc" },
      { label: "Ô Chợ Dừa", value: "ô chợ dừa", count: "26 công việc" },
      { label: "Phú Diễn", value: "phú diễn", count: "16 công việc" },
      { label: "Phú Thượng", value: "phú thượng", count: "18 công việc" },
      { label: "Phú Xuyên", value: "phú xuyên", count: "12 công việc" },
      { label: "Phúc Diễn", value: "phúc diễn", count: "15 công việc" },
      { label: "Phúc La", value: "phúc la", count: "14 công việc" },
      { label: "Phương Liệt", value: "phương liệt", count: "18 công việc" },
      { label: "Tây Hồ", value: "tây hồ", count: "40 công việc" },
      { label: "Thanh Liệt", value: "thanh liệt", count: "16 công việc" },
      { label: "Thanh Xuân", value: "thanh xuân", count: "28 công việc" },
      { label: "Thượng Cát", value: "thượng cát", count: "14 công việc" },
      { label: "Từ Liêm", value: "từ liêm", count: "30 công việc" },
      { label: "Văn Miếu - Quốc Tử Giám", value: "văn miếu - quốc tử giám", count: "20 công việc" },
      { label: "Việt Hưng", value: "việt hưng", count: "16 công việc" },
      { label: "Vĩnh Hưng", value: "vĩnh hưng", count: "15 công việc" },
      { label: "Vĩnh Tuy", value: "vĩnh tuy", count: "18 công việc" },
      { label: "Xuân Đỉnh", value: "xuân đỉnh", count: "22 công việc" },
      { label: "Xuân Phương", value: "xuân phương", count: "16 công việc" },
      { label: "Yên Hòa", value: "yên hòa", count: "24 công việc" },
    ],
  },
  {
    label: "Hồ Chí Minh",
    value: "hồ chí minh",
    count: "100+ công việc",
    districts: [
      { label: "Quận 1", value: "quận 1", count: "45 công việc" },
      { label: "Thảo Điền", value: "thảo điền", count: "38 công việc" },
      { label: "Bình Thạnh", value: "bình thạnh", count: "34 công việc" },
      { label: "Phú Nhuận", value: "phú nhuận", count: "31 công việc" },
      { label: "Quận 7", value: "quận 7", count: "29 công việc" },
      { label: "TP. Thủ Đức", value: "thủ đức", count: "26 công việc" },
      { label: "Quận 3", value: "quận 3", count: "24 công việc" },
      { label: "Quận 10", value: "quận 10", count: "18 công việc" },
    ],
  },
  {
    label: "Khánh Hòa",
    value: "khánh hòa",
    count: "45+ công việc",
    districts: [
      { label: "Nha Trang (Trung tâm)", value: "nha trang", count: "28 công việc" },
      { label: "Vĩnh Hải", value: "vĩnh hải", count: "12 công việc" },
      { label: "Cam Ranh", value: "cam ranh", count: "10 công việc" },
      { label: "Ninh Hòa", value: "ninh hòa", count: "6 công việc" },
    ],
  },
  {
    label: "Đà Nẵng",
    value: "đà nẵng",
    count: "40+ công việc",
    districts: [
      { label: "Hải Châu", value: "hải châu", count: "18 công việc" },
      { label: "Sơn Trà", value: "sơn trà", count: "16 công việc" },
      { label: "Phú Mỹ An", value: "phú mỹ an", count: "14 công việc" },
      { label: "Thanh Khê", value: "thanh khê", count: "12 công việc" },
      { label: "Ngũ Hành Sơn", value: "ngũ hành sơn", count: "10 công việc" },
      { label: "Liên Chiểu", value: "liên chiểu", count: "8 công việc" },
    ],
  },
  {
    label: "Lâm Đồng",
    value: "lâm đồng",
    count: "38+ công việc",
    districts: [
      { label: "TP. Đà Lạt", value: "đà lạt", count: "25 công việc" },
      { label: "Bảo Lộc", value: "bảo lộc", count: "14 công việc" },
      { label: "Đức Trọng", value: "đức trọng", count: "8 công việc" },
    ],
  },
  {
    label: "Quảng Ninh",
    value: "quảng ninh",
    count: "35+ công việc",
    districts: [
      { label: "Hạ Long", value: "hạ long", count: "22 công việc" },
      { label: "Cẩm Phả", value: "cẩm phả", count: "10 công việc" },
      { label: "Uông Bí", value: "uông bí", count: "8 công việc" },
      { label: "Móng Cái", value: "móng cái", count: "6 công việc" },
    ],
  },
  {
    label: "Hải Phòng",
    value: "hải phòng",
    count: "30+ công việc",
    districts: [
      { label: "Lê Chân", value: "lê chân", count: "14 công việc" },
      { label: "Ngô Quyền", value: "ngô quyền", count: "12 công việc" },
      { label: "Hồng Bàng", value: "hồng bàng", count: "10 công việc" },
      { label: "Hải An", value: "hải an", count: "9 công việc" },
      { label: "Đồ Sơn", value: "đồ sơn", count: "8 công việc" },
    ],
  },
  {
    label: "Thanh Hóa",
    value: "thanh hóa",
    count: "30+ công việc",
    districts: [
      { label: "TP. Thanh Hóa", value: "thành phố thanh hóa", count: "18 công việc" },
      { label: "Sầm Sơn", value: "sầm sơn", count: "12 công việc" },
      { label: "Bỉm Sơn", value: "bỉm sơn", count: "6 công việc" },
    ],
  },
  {
    label: "Bắc Ninh",
    value: "bắc ninh",
    count: "28+ công việc",
    districts: [
      { label: "TP. Bắc Ninh", value: "thành phố bắc ninh", count: "16 công việc" },
      { label: "Từ Sơn", value: "từ sơn", count: "12 công việc" },
      { label: "Yên Phong", value: "yên phong", count: "7 công việc" },
    ],
  },
  {
    label: "Nghệ An",
    value: "nghệ an",
    count: "28+ công việc",
    districts: [
      { label: "TP. Vinh", value: "vinh", count: "18 công việc" },
      { label: "Cửa Lò", value: "cửa lò", count: "10 công việc" },
      { label: "Thái Hòa", value: "thái hòa", count: "6 công việc" },
    ],
  },
  {
    label: "Đồng Nai",
    value: "đồng nai",
    count: "26+ công việc",
    districts: [
      { label: "TP. Biên Hòa", value: "biên hòa", count: "16 công việc" },
      { label: "Long Thành", value: "long thành", count: "8 công việc" },
      { label: "Nhơn Trạch", value: "nhơn trạch", count: "6 công việc" },
    ],
  },
  {
    label: "Thừa Thiên Huế",
    value: "huế",
    count: "25+ công việc",
    districts: [
      { label: "Thuận Hóa (Trung tâm)", value: "thuận hóa", count: "15 công việc" },
      { label: "Hương Thủy", value: "hương thủy", count: "8 công việc" },
      { label: "Hương Trà", value: "hương trà", count: "5 công việc" },
    ],
  },
  {
    label: "Thái Nguyên",
    value: "thái nguyên",
    count: "24+ công việc",
    districts: [
      { label: "TP. Thái Nguyên", value: "thành phố thái nguyên", count: "16 công việc" },
      { label: "Sông Công", value: "sông công", count: "8 công việc" },
    ],
  },
  {
    label: "Ninh Bình",
    value: "ninh bình",
    count: "22+ công việc",
    districts: [
      { label: "TP. Ninh Bình", value: "thành phố ninh bình", count: "14 công việc" },
      { label: "Tam Điệp", value: "tam điệp", count: "8 công việc" },
    ],
  },
  {
    label: "Phú Thọ",
    value: "phú thọ",
    count: "20+ công việc",
    districts: [
      { label: "TP. Việt Trì", value: "việt trì", count: "14 công việc" },
      { label: "Thị xã Phú Thọ", value: "thị xã phú thọ", count: "6 công việc" },
    ],
  },
  {
    label: "Lào Cai",
    value: "lào cai",
    count: "20+ công việc",
    districts: [
      { label: "Sa Pa", value: "sa pa", count: "12 công việc" },
      { label: "TP. Lào Cai", value: "thành phố lào cai", count: "8 công việc" },
    ],
  },
  {
    label: "Cần Thơ",
    value: "cần thơ",
    count: "20+ công việc",
    districts: [
      { label: "Ninh Kiều", value: "ninh kiều", count: "12 công việc" },
      { label: "Cái Răng", value: "cái răng", count: "9 công việc" },
      { label: "Bình Thủy", value: "bình thủy", count: "8 công việc" },
      { label: "Ô Môn", value: "ô môn", count: "6 công việc" },
      { label: "Thốt Nốt", value: "thốt nốt", count: "5 công việc" },
    ],
  },
  {
    label: "Đồng Tháp",
    value: "đồng tháp",
    count: "18+ công việc",
    districts: [
      { label: "TP. Cao Lãnh", value: "cao lãnh", count: "10 công việc" },
      { label: "Sa Đéc", value: "sa đéc", count: "8 công việc" },
    ],
  },
  {
    label: "An Giang",
    value: "an giang",
    count: "18+ công việc",
    districts: [
      { label: "TP. Long Xuyên", value: "long xuyên", count: "11 công việc" },
      { label: "Châu Đốc", value: "châu đốc", count: "7 công việc" },
    ],
  },
  {
    label: "Gia Lai",
    value: "gia lai",
    count: "16+ công việc",
    districts: [
      { label: "TP. Pleiku", value: "pleiku", count: "12 công việc" },
      { label: "An Khê", value: "an khê", count: "4 công việc" },
    ],
  },
  {
    label: "Hưng Yên",
    value: "hưng yên",
    count: "16+ công việc",
    districts: [
      { label: "TP. Hưng Yên", value: "thành phố hưng yên", count: "9 công việc" },
      { label: "Văn Giang", value: "văn giang", count: "7 công việc" },
    ],
  },
  {
    label: "Tây Ninh",
    value: "tây ninh",
    count: "16+ công việc",
    districts: [
      { label: "TP. Tây Ninh", value: "thành phố tây ninh", count: "10 công việc" },
      { label: "Trảng Bàng", value: "trảng bàng", count: "6 công việc" },
    ],
  },
  {
    label: "Quảng Ngãi",
    value: "quảng ngãi",
    count: "16+ công việc",
    districts: [
      { label: "TP. Quảng Ngãi", value: "thành phố quảng ngãi", count: "10 công việc" },
      { label: "Bình Sơn", value: "bình sơn", count: "6 công việc" },
    ],
  },
  {
    label: "Đắc Lắk",
    value: "đắc lắk",
    count: "15+ công việc",
    districts: [
      { label: "TP. Buôn Ma Thuột", value: "buôn ma thuột", count: "11 công việc" },
      { label: "Cư M'gar", value: "cư m'gar", count: "4 công việc" },
    ],
  },
  {
    label: "Vĩnh Long",
    value: "vĩnh long",
    count: "15+ công việc",
    districts: [
      { label: "TP. Vĩnh Long", value: "thành phố vĩnh long", count: "10 công việc" },
      { label: "Bình Minh", value: "bình minh", count: "5 công việc" },
    ],
  },
  {
    label: "Hà Tĩnh",
    value: "hà tĩnh",
    count: "15+ công việc",
    districts: [
      { label: "TP. Hà Tĩnh", value: "thành phố hà tĩnh", count: "10 công việc" },
      { label: "Kỳ Anh", value: "kỳ anh", count: "5 công việc" },
    ],
  },
  {
    label: "Cà Mau",
    value: "cà mau",
    count: "14+ công việc",
    districts: [
      { label: "TP. Cà Mau", value: "thành phố cà mau", count: "9 công việc" },
      { label: "Nam Căn", value: "nam căn", count: "5 công việc" },
    ],
  },
  {
    label: "Lạng Sơn",
    value: "lạng sơn",
    count: "14+ công việc",
    districts: [
      { label: "TP. Lạng Sơn", value: "thành phố lạng sơn", count: "9 công việc" },
      { label: "Hữu Lũng", value: "hữu lũng", count: "5 công việc" },
    ],
  },
  {
    label: "Quảng Trị",
    value: "quảng trị",
    count: "14+ công việc",
    districts: [
      { label: "TP. Đông Hà", value: "đông hà", count: "9 công việc" },
      { label: "Quảng Trị", value: "thị xã quảng trị", count: "5 công việc" },
    ],
  },
  {
    label: "Sơn La",
    value: "sơn la",
    count: "13+ công việc",
    districts: [
      { label: "Mộc Châu", value: "mộc châu", count: "8 công việc" },
      { label: "TP. Sơn La", value: "thành phố sơn la", count: "5 công việc" },
    ],
  },
  {
    label: "Điện Biên",
    value: "điện biên",
    count: "12+ công việc",
    districts: [
      { label: "TP. Điện Biên Phủ", value: "điện biên phủ", count: "8 công việc" },
      { label: "Tuần Giáo", value: "tuần giáo", count: "4 công việc" },
    ],
  },
  {
    label: "Tuyên Quang",
    value: "tuyên quang",
    count: "12+ công việc",
    districts: [
      { label: "TP. Tuyên Quang", value: "thành phố tuyên quang", count: "8 công việc" },
      { label: "Sơn Dương", value: "sơn dương", count: "4 công việc" },
    ],
  },
  {
    label: "Cao Bằng",
    value: "cao bằng",
    count: "10+ công việc",
    districts: [
      { label: "TP. Cao Bằng", value: "thành phố cao bằng", count: "6 công việc" },
      { label: "Trùng Khánh", value: "trùng khánh", count: "4 công việc" },
    ],
  },
  {
    label: "Lai Châu",
    value: "lai châu",
    count: "8+ công việc",
    districts: [
      { label: "TP. Lai Châu", value: "thành phố lai châu", count: "5 công việc" },
      { label: "Phong Thổ", value: "phong thổ", count: "3 công việc" },
    ],
  },
];

export type TopJobCityProps = {
  open: boolean;
  onClose: () => void;
  onSelectCity: (cityValue: string) => void;
  selectedCity?: string;
  initialExpandedCity?: string;
};

function isAllLocation(val?: string): boolean {
  if (!val) return true;
  const n = val.toLowerCase().trim();
  return n === "all" || n === "toàn quốc" || n === "toan quoc" || n === "tất cả" || n === "tat ca";
}

export default function TopJobCity({
  open,
  onClose,
  onSelectCity,
  selectedCity,
  initialExpandedCity,
}: TopJobCityProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypedQuery, setUserTypedQuery] = useState("");
  const [draftCity, setDraftCity] = useState<string>(selectedCity || initialExpandedCity || "all");

  useEffect(() => {
    if (open) {
      setDraftCity(selectedCity || initialExpandedCity || "all");
      setUserTypedQuery("");
    }
  }, [open, selectedCity, initialExpandedCity]);

  const targetCityValue = initialExpandedCity || selectedCity || draftCity;
  const targetCityObj = useMemo(() => {
    if (!targetCityValue || targetCityValue === "all" || targetCityValue === "toàn quốc") {
      return TOP_34_JOB_CITIES_LOCATIONS[0];
    }
    const parsed = parseDistrictLocationValue(targetCityValue);
    const cityKey = parsed ? parsed.city : targetCityValue;
    const normKey = normalizeText(cityKey);
    return TOP_34_JOB_CITIES_LOCATIONS.find(
      (c) => normalizeText(c.value) === normKey || normalizeText(c.label) === normKey
    ) || TOP_34_JOB_CITIES_LOCATIONS[0];
  }, [targetCityValue]);

  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);

  const filteredDistricts = useMemo(() => {
    const q = normalizeText(userTypedQuery);
    if (!targetCityObj) return [];
    if (!q) return targetCityObj.districts;

    return targetCityObj.districts.filter(
      (d) =>
        normalizeText(d.label).includes(q) ||
        normalizeText(d.value).includes(q) ||
        d.wards?.some((w) => normalizeText(w.label).includes(q) || normalizeText(w.value).includes(q))
    );
  }, [targetCityObj, userTypedQuery]);

  if (!open) return null;

  const handleApplyFilter = () => {
    if (isAllLocation(draftCity) || isAllLocation(searchQuery)) {
      onSelectCity("all");
    } else {
      onSelectCity(draftCity);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex h-dvh w-screen flex-col overflow-hidden bg-[#050711] text-white animate-in fade-in duration-200">
      {/* Header */}
      <div className="shrink-0 border-b border-white/5 bg-[#070913] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-slate-950/40 text-white transition active:scale-95 cursor-pointer"
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A86A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setUserTypedQuery(e.target.value);
              }}
              placeholder="Nhập địa điểm..."
              className="h-10 w-full rounded-full border border-white/10 bg-slate-950/55 pl-9 pr-9 text-sm font-medium text-white outline-none placeholder:text-slate-500 focus:border-[#C9A86A]/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setUserTypedQuery("");
                  setDraftCity("all");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition active:scale-95 cursor-pointer"
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleApplyFilter}
            className="shrink-0 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-md hover:brightness-110 cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* Content list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-3 custom-scrollbar">
        {targetCityObj && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A86A]">
                Tất cả việc làm tại {targetCityObj.label} ({filteredDistricts.length})
              </span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {/* Districts list */}
              {filteredDistricts.map((district) => {
                const districtValue = makeDistrictLocationValue(targetCityObj.value, district.value);
                const isDistrictSelected = draftCity === districtValue;

                return (
                  <button
                    key={district.value}
                    type="button"
                    onClick={() => {
                      setDraftCity(districtValue);
                      setSearchQuery(`${targetCityObj.label}, ${district.label}`);
                      setUserTypedQuery("");
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#0b0e1a]/85 px-4 py-3.5 text-left text-xs font-bold text-slate-200 transition active:scale-[0.99] cursor-pointer hover:border-white/20 hover:bg-[#0e1222]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MapPin className="h-4 w-4 shrink-0 text-[#C9A86A]" />
                      <span className="truncate text-sm font-bold text-white">{district.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-slate-400">{district.count}</span>
                      {isDistrictSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}

              {filteredDistricts.length === 0 && (
                <div className="col-span-full py-12 text-center space-y-2">
                  <MapPin className="mx-auto h-8 w-8 text-slate-600" />
                  <p className="text-sm font-semibold text-slate-400">
                    Không tìm thấy quận/huyện phù hợp tại {targetCityObj.label}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
