"use client";

import React, { useMemo, useState } from "react";
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

export type DistrictItem = {
  label: string;
  value: string;
  count: string;
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
      { label: "Cầu Giấy", value: "cầu giấy", count: "50 công việc" },
      { label: "Tây Hồ", value: "tây hồ", count: "40 công việc" },
      { label: "Đống Đa", value: "đống đa", count: "36 công việc" },
      { label: "Thái Hà", value: "thái hà", count: "32 công việc" },
      { label: "Hoàng Cầu", value: "hoàng cầu", count: "28 công việc" },
      { label: "Ba Đình", value: "ba đình", count: "25 công việc" },
      { label: "Thanh Xuân", value: "thanh xuân", count: "22 công việc" },
      { label: "Hai Bà Trưng", value: "hai bà trưng", count: "20 công việc" },
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
};

export default function TopJobCity({
  open,
  onClose,
  onSelectCity,
  selectedCity,
}: TopJobCityProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCity, setExpandedCity] = useState<string | null>(null);

  const selectedDistrictInfo = parseDistrictLocationValue(selectedCity);

  const filteredCities = useMemo(() => {
    const q = normalizeText(searchQuery);
    let list = TOP_34_JOB_CITIES_LOCATIONS;

    if (q) {
      list = TOP_34_JOB_CITIES_LOCATIONS.filter((city) => {
        const matchCity = normalizeText(city.label).includes(q) || normalizeText(city.value).includes(q);
        const matchDistrict = city.districts.some(
          (d) => normalizeText(d.label).includes(q) || normalizeText(d.value).includes(q)
        );
        return matchCity || matchDistrict;
      });
    }

    return [...list].sort((a, b) => parseCountNumber(b.count) - parseCountNumber(a.count));
  }, [searchQuery]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex h-dvh w-screen flex-col overflow-hidden bg-[#050711] text-white animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#070913] px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-950/60 text-slate-350 hover:bg-white/10 hover:text-white transition"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base sm:text-lg font-black uppercase tracking-wide text-white truncate">
              Nhiều Công Việc Nhất
            </h2>
            <Sparkles className="h-4 w-4 text-[#C9A86A] shrink-0" />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="border-b border-white/5 bg-[#0b0e1a] px-4 py-3 sm:px-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A86A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tỉnh thành hoặc quận/huyện..."
            className="w-full h-10 rounded-full border border-white/10 bg-[#070913]/80 pl-10 pr-9 text-xs sm:text-sm text-white outline-none focus:border-[#C9A86A]/60 placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-3 custom-scrollbar">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A86A]">
            Tất cả {filteredCities.length} tỉnh thành
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {filteredCities.map((city) => {
            const isExpanded = expandedCity === city.value || Boolean(searchQuery.trim());
            const isCitySelected =
              selectedCity === city.value || selectedDistrictInfo?.city === city.value;

            return (
              <div
                key={city.value}
                className={cn(
                  "overflow-hidden rounded-2xl border transition-all duration-200",
                  isCitySelected
                    ? "border-[#C9A86A]/70 bg-[#C9A86A]/10 shadow-[0_0_15px_rgba(201,168,106,0.1)]"
                    : "border-white/10 bg-[#0b0e1a]/85 hover:border-white/20 hover:bg-[#0e1222]"
                )}
              >
                {/* Header item */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedCity((prev) => (prev === city.value ? null : city.value))
                  }
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:scale-[0.99]",
                    isCitySelected ? "text-[#C9A86A]" : "text-white"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                      isCitySelected
                        ? "border-[#C9A86A] bg-[#C9A86A]/20 text-[#C9A86A]"
                        : "border-white/10 bg-white/5 text-slate-400"
                    )}
                  >
                    <MapPin className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{city.label}</span>
                    <span className="block text-[11px] text-slate-400 font-medium">
                      {city.districts.length} khu vực hot
                    </span>
                  </div>

                  <span className="shrink-0 rounded-full bg-slate-900/60 border border-white/5 px-2.5 py-1 text-xs font-bold text-amber-400">
                    {city.count}
                  </span>

                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200",
                      isExpanded && "rotate-180 text-[#C9A86A]"
                    )}
                  />
                </button>

                {/* Expanded District / Location options */}
                {isExpanded && (
                  <div className="space-y-1.5 border-t border-white/5 bg-[#070913]/60 px-3 pb-3 pt-2.5">
                    {/* Option: All City */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCity(city.value);
                        onClose();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-bold transition active:scale-[0.99]",
                        selectedCity === city.value
                          ? "border-[#C9A86A]/70 bg-[#C9A86A]/20 text-[#C9A86A]"
                          : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span>Tất cả {city.label}</span>
                        {selectedCity === city.value && <Check className="h-3.5 w-3.5 text-[#C9A86A]" />}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">{city.count}</span>
                    </button>

                    {/* Specific District / Hot location options */}
                    {city.districts
                      .slice()
                      .sort((a, b) => parseCountNumber(b.count) - parseCountNumber(a.count))
                      .map((district) => {
                        const districtValue = makeDistrictLocationValue(city.value, district.value);
                        const isDistrictSelected = selectedCity === districtValue;

                        return (
                          <button
                            key={district.value}
                            type="button"
                            onClick={() => {
                              onSelectCity(districtValue);
                              onClose();
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-semibold transition active:scale-[0.99]",
                              isDistrictSelected
                                ? "border-[#C9A86A]/70 bg-[#C9A86A]/20 text-[#C9A86A] font-bold"
                                : "border-white/5 bg-[#080b16] text-slate-300 hover:bg-white/[0.06] hover:text-white"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span>{district.label}</span>
                              {isDistrictSelected && <Check className="h-3.5 w-3.5 text-[#C9A86A]" />}
                            </div>
                            <span className="text-[10px] font-medium text-slate-400">{district.count}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}

          {filteredCities.length === 0 && (
            <div className="col-span-full py-12 text-center space-y-2">
              <MapPin className="mx-auto h-8 w-8 text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">
                Không tìm thấy tỉnh thành hoặc khu vực phù hợp
              </p>
              <p className="text-xs text-slate-500">
                Thử tìm kiếm với từ khóa khác như "Hà Nội", "Quận 1", "Tây Hồ", v.v.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
