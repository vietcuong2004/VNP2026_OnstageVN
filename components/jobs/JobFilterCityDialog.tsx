"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronRight, Crown, Flame, Gem, MapPin, Search, Star, X } from "lucide-react";
import { cn } from "../../lib/utils";
import TopJobCity, { TOP_34_JOB_CITIES_LOCATIONS } from "../search/all-jobs-in-city";

type CityOption = {
  value: string;
  label: string;
};

type JobFilterCityDialogProps = {
  open: boolean;
  options: CityOption[];
  selectedCity: string;
  onSelectCity: (value: string) => void;
  onClose: () => void;
  currentLocationValue?: string;
  currentLocationLabel?: string;
  onRefreshLocation?: () => void;
};

const DISTRICT_FILTER_PREFIX = "district:";

function makeDistrictLocationValue(city: string, district: string) {
  return `${DISTRICT_FILTER_PREFIX}${encodeURIComponent(city)}:${encodeURIComponent(district)}`;
}

function parseDistrictLocationValue(value: string) {
  if (!value.startsWith(DISTRICT_FILTER_PREFIX)) return null;
  const [city = "", district = ""] = value.slice(DISTRICT_FILTER_PREFIX.length).split(":");
  if (!city || !district) return null;
  return {
    city: decodeURIComponent(city),
    district: decodeURIComponent(district),
  };
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function isAllLocation(val?: string): boolean {
  if (!val) return true;
  const n = val.toLowerCase().trim();
  return n === "all" || n === "toàn quốc" || n === "toan quoc" || n === "tất cả" || n === "tat ca";
}

type CityCategoryTab = "all" | "capital" | "hot" | "top_quality" | "vip";

const CITY_CATEGORY_TABS: Array<{
  id: CityCategoryTab;
  label: string;
  activeClass: string;
  inactiveClass: string;
}> = [
  {
    id: "all",
    label: "Tất cả",
    activeClass: "bg-gradient-to-r from-slate-100 via-amber-200 to-amber-400 text-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.4)] border-amber-200",
    inactiveClass: "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white",
  },
  {
    id: "capital",
    label: "👑 Thủ phủ Công việc",
    activeClass: "bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.5)] border-amber-100",
    inactiveClass: "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white",
  },
  {
    id: "hot",
    label: "🔥 Thành phố Hot",
    activeClass: "bg-gradient-to-r from-amber-200 via-orange-400 to-rose-500 text-slate-950 shadow-[0_0_14px_rgba(249,115,22,0.5)] border-orange-100",
    inactiveClass: "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white",
  },
  {
    id: "top_quality",
    label: "⭐ Chất lượng hàng đầu",
    activeClass: "bg-gradient-to-r from-fuchsia-200 via-pink-400 to-purple-600 text-slate-950 shadow-[0_0_14px_rgba(217,70,239,0.5)] border-fuchsia-100",
    inactiveClass: "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white",
  },
  {
    id: "vip",
    label: "💎 Công việc Cao cấp nhất",
    activeClass: "bg-gradient-to-r from-teal-100 via-cyan-300 to-blue-500 text-slate-950 shadow-[0_0_14px_rgba(6,182,212,0.5)] border-cyan-100",
    inactiveClass: "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white",
  },
];

const CATEGORY_ICONS: Record<CityCategoryTab, React.ComponentType<any>> = {
  all: MapPin,
  capital: Crown,
  hot: Flame,
  top_quality: Star,
  vip: Gem,
};

function getCategoryTabCities(locations: typeof TOP_34_JOB_CITIES_LOCATIONS, tab: CityCategoryTab) {
  if (tab === "all") return locations;

  let cityKeys: string[] = [];

  if (tab === "capital") {
    cityKeys = ["hà nội", "hồ chí minh", "khánh hòa"];
  } else if (tab === "hot") {
    cityKeys = ["hà nội", "hồ chí minh", "đà nẵng"];
  } else if (tab === "top_quality") {
    cityKeys = ["hà nội", "hồ chí minh", "quảng ninh"];
  } else if (tab === "vip") {
    cityKeys = ["hà nội", "hồ chí minh", "lâm đồng"];
  }

  return locations
    .filter((loc) => cityKeys.some((k) => loc.label.toLowerCase().includes(k) || loc.value.toLowerCase().includes(k)))
    .slice(0, 3);
}

export default function JobFilterCityDialog({
  open,
  options,
  selectedCity,
  onSelectCity,
  onClose,
  currentLocationValue = "Hà Nội",
  currentLocationLabel = "Hà Nội",
  onRefreshLocation,
}: JobFilterCityDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypedQuery, setUserTypedQuery] = useState("");
  const [draftCity, setDraftCity] = useState<string>(selectedCity || "all");
  const [activeCategoryTab, setActiveCategoryTab] = useState<CityCategoryTab>("all");
  const [expandedHotLocation, setExpandedHotLocation] = useState<string | null>(null);
  const [collapsedCities, setCollapsedCities] = useState<Record<string, boolean>>({});
  const [isTopJobCityOpen, setIsTopJobCityOpen] = useState(false);
  const [topJobCityInitialCity, setTopJobCityInitialCity] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setDraftCity(selectedCity || "all");
      setUserTypedQuery("");
      setActiveCategoryTab("all");
      setCollapsedCities({});
    }
  }, [open, selectedCity]);

  useEffect(() => {
    setCollapsedCities({});
  }, [activeCategoryTab]);

  const selectedDistrictLocation = parseDistrictLocationValue(draftCity);
  const ActiveLocationIcon = CATEGORY_ICONS[activeCategoryTab] || MapPin;

  const filteredHotLocations = useMemo(() => {
    let list = TOP_34_JOB_CITIES_LOCATIONS;

    if (activeCategoryTab !== "all") {
      list = getCategoryTabCities(list, activeCategoryTab);
    }

    const keyword = normalizeSearchText(userTypedQuery);
    if (!keyword || keyword === "toan quoc") return list;

    let regex: RegExp | null = null;
    try {
      regex = new RegExp(userTypedQuery.trim(), "i");
    } catch {
      regex = null;
    }

    return list.filter((loc) => {
      const locNorm = normalizeSearchText(loc.label);
      const matchesLoc = regex ? regex.test(loc.label) || locNorm.includes(keyword) : locNorm.includes(keyword);
      const matchesDistrict = loc.districts.some((d) => {
        const dNorm = normalizeSearchText(d.label);
        return regex ? regex.test(d.label) || dNorm.includes(keyword) : dNorm.includes(keyword);
      });
      return matchesLoc || matchesDistrict;
    });
  }, [userTypedQuery, activeCategoryTab]);

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-city-dialog-title"
      className="fixed inset-0 z-[999] flex h-dvh w-screen flex-col overflow-hidden bg-[#050711] text-white animate-in fade-in duration-200"
    >
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
              id="job-city-dialog-title"
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setUserTypedQuery(event.target.value);
              }}
              placeholder="Nhập địa điểm..."
              className="h-10 w-full rounded-full border border-white/10 bg-slate-950/55 pl-9 pr-9 text-sm font-medium text-white outline-none placeholder:text-slate-500 focus:border-[#C9A86A]/60"
              autoFocus
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

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] custom-scrollbar space-y-4">
        {/* Danh sách toàn bộ tỉnh thành & quận huyện trực tiếp */}
        <div className="space-y-2">
          <div className="relative group">
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar no-scrollbar scroll-smooth pr-10">
              {CITY_CATEGORY_TABS.map((tab) => {
                const isActive = activeCategoryTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategoryTab(tab.id)}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-black uppercase tracking-wider border transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap",
                      isActive ? tab.activeClass : tab.inactiveClass
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Lớp phủ mờ dần (Gradient Mask) & Mũi tên chỉ hướng cuộn (Animated Chevron Icon) */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 flex items-center justify-end pr-1 bg-gradient-to-l from-[#050711] via-[#050711]/85 to-transparent z-10">
              <ChevronRight className="h-4 w-4 text-[#C9A86A] animate-pulse drop-shadow-[0_0_8px_rgba(201,168,106,0.6)]" />
            </div>
          </div>
          <div className="grid gap-2">
            {/* Option "Toàn quốc" ở đầu tiên - Chỉ hiển thị khi ở Tab Tất cả */}
            {activeCategoryTab === "all" && (!userTypedQuery.trim() || normalizeSearchText(userTypedQuery).includes("toan quoc")) && (
              <div
                className={cn(
                  "overflow-hidden rounded-2xl border transition",
                  draftCity === "toàn quốc" || draftCity === "all" || !draftCity
                    ? "border-[#C9A86A]/70 bg-[#C9A86A]/10 text-[#C9A86A]"
                    : "border-white/8 bg-white/[0.03] text-white"
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    setDraftCity("all");
                    setSearchQuery("Toàn quốc");
                    setUserTypedQuery("");
                  }}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition active:scale-[0.99] cursor-pointer"
                >
                  <ActiveLocationIcon className={cn("h-4 w-4 shrink-0 transition-transform duration-300", (draftCity === "toàn quốc" || draftCity === "all" || !draftCity) ? "text-[#C9A86A]" : "text-slate-400")} />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">Toàn quốc</span>
                  <span className="shrink-0 text-xs font-semibold text-slate-400">Tất cả vị trí</span>
                </button>
              </div>
            )}

            {filteredHotLocations.map((location) => {
              const isSelected =
                draftCity === location.value ||
                selectedDistrictLocation?.city === location.value;
              const isExpanded =
                activeCategoryTab !== "all"
                  ? !collapsedCities[location.value]
                  : expandedHotLocation === location.value || (userTypedQuery.trim() !== "" && filteredHotLocations.length <= 3);
              const isActive = isSelected || isExpanded;

              return (
                <div
                  key={location.label}
                  className={cn(
                    "overflow-hidden rounded-2xl border transition",
                    isActive
                      ? "border-[#C9A86A]/70 bg-[#C9A86A]/10"
                      : "border-white/8 bg-white/[0.03]"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setDraftCity(location.value);
                      setSearchQuery(location.label);
                      setUserTypedQuery("");
                      if (activeCategoryTab !== "all") {
                        setCollapsedCities((prev) => ({
                          ...prev,
                          [location.value]: !prev[location.value],
                        }));
                      } else {
                        setExpandedHotLocation((current) => (current === location.value ? null : location.value));
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-3 text-left transition active:scale-[0.99] cursor-pointer",
                      isActive ? "text-[#C9A86A]" : "text-white"
                    )}
                  >
                    <ActiveLocationIcon className={cn("h-4 w-4 shrink-0 transition-transform duration-300", isActive ? "text-[#C9A86A]" : "text-slate-400")} />
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">{location.label}</span>
                    <span className="shrink-0 text-xs font-semibold text-slate-400">{location.count}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform", isExpanded && "rotate-180 text-[#C9A86A]")} />
                  </button>

                  {isExpanded && (
                    <div className="space-y-1.5 border-t border-white/5 px-3 pb-3 pt-2">
                      {location.districts.slice(0, 3).map((district) => {
                        const districtValue = makeDistrictLocationValue(location.value, district.value);
                        const isDistrictSelected = draftCity === districtValue;

                        return (
                          <button
                            key={district.label}
                            type="button"
                            onClick={() => {
                              setDraftCity(districtValue);
                              setSearchQuery(`${location.label}, ${district.label}`);
                              setUserTypedQuery("");
                            }}
                            className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-[#070913]/55 px-3 py-2 text-left text-xs font-bold text-slate-200 transition active:scale-[0.99] cursor-pointer hover:border-white/15 hover:text-white"
                          >
                            <span className="truncate">{district.label}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-semibold text-slate-500">{district.count}</span>
                              {isDistrictSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => {
                          setTopJobCityInitialCity(location.value);
                          setIsTopJobCityOpen(true);
                        }}
                        className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-[#070913]/55 px-3 py-2 text-left text-xs font-bold text-slate-200 transition active:scale-[0.99] cursor-pointer hover:border-white/15 hover:text-white"
                      >
                        <span className="truncate">Tất cả {location.label}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-semibold text-slate-500">{location.count}</span>
                          {draftCity === location.value && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredHotLocations.length === 0 && (
              <div className="py-10 text-center text-sm font-semibold text-slate-500">
                Không tìm thấy địa điểm phù hợp
              </div>
            )}
          </div>
        </div>
      </div>

      <TopJobCity
        open={isTopJobCityOpen}
        onClose={() => setIsTopJobCityOpen(false)}
        initialExpandedCity={topJobCityInitialCity}
        onSelectCity={(cityValue) => {
          onSelectCity(cityValue);
          setIsTopJobCityOpen(false);
          onClose();
        }}
        selectedCity={selectedCity}
      />
    </div>
  );
}
