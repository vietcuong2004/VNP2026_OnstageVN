"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronRight, Crown, Flame, Gem, Heart, MapPin, Search, Sparkles, X } from "lucide-react";
import { cn } from "../../lib/utils";
import TopIdolCity, { TOP_34_CITIES_LOCATIONS } from "../search/all-idols-in-city";

type CityOption = {
  value: string;
  label: string;
};

type TalentFilterCityDialogProps = {
  open: boolean;
  cityOptions?: CityOption[];
  selectedCity: string;
  citySearchQuery?: string;
  setCitySearchQuery?: (value: string) => void;
  onClose: () => void;
  onSelectCity: (value: string) => void;
  onRefreshLocation?: () => void;
  currentLocationLabel?: string;
  currentLocationValue?: string;
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

function isMajorExpandableCity(val?: string): boolean {
  if (!val) return false;
  const n = val.toLowerCase().trim();
  return n === "hà nội" || n === "ha noi" || n === "hồ chí minh" || n === "ho chi minh" || n === "hcm";
}

export default function TalentFilterCityDialog({
  open,
  cityOptions,
  selectedCity,
  citySearchQuery,
  setCitySearchQuery,
  onClose,
  onSelectCity,
  onRefreshLocation,
  currentLocationLabel = "Hà Nội",
  currentLocationValue = "Hà Nội",
}: TalentFilterCityDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypedQuery, setUserTypedQuery] = useState("");
  const [draftCity, setDraftCity] = useState<string>(selectedCity || "all");
  const [collapsedCities, setCollapsedCities] = useState<Record<string, boolean>>({});
  const [isTopIdolCityOpen, setIsTopIdolCityOpen] = useState(false);
  const [topIdolCityInitialCity, setTopIdolCityInitialCity] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setDraftCity(selectedCity || "all");
      setUserTypedQuery("");
      setCollapsedCities({});
    }
  }, [open, selectedCity]);

  const selectedDistrictLocation = parseDistrictLocationValue(draftCity);

  const filteredHotLocations = useMemo(() => {
    let list = TOP_34_CITIES_LOCATIONS;

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
  }, [userTypedQuery]);

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
      aria-labelledby="talent-city-dialog-title"
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
              id="talent-city-dialog-title"
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setUserTypedQuery(event.target.value);
                if (setCitySearchQuery) setCitySearchQuery(event.target.value);
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
                  if (setCitySearchQuery) setCitySearchQuery("");
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
          <div className="grid gap-2">
            {/* Option "Toàn quốc" ở đầu tiên */}
            {(!userTypedQuery.trim() || normalizeSearchText(userTypedQuery).includes("toan quoc")) && (
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
                    setSearchQuery("");
                    setUserTypedQuery("");
                    if (typeof document !== "undefined") {
                      (document.activeElement as HTMLElement)?.blur();
                    }
                  }}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition active:scale-[0.99] cursor-pointer"
                >
                  <MapPin className={cn("h-4 w-4 shrink-0 transition-transform duration-300", (draftCity === "toàn quốc" || draftCity === "all" || !draftCity) ? "text-[#C9A86A]" : "text-slate-400")} />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">Toàn quốc</span>
                  <span className="shrink-0 text-xs font-semibold text-slate-400">Tất cả vị trí</span>
                </button>
              </div>
            )}

            {filteredHotLocations.map((location) => {
              const isMajorCity = isMajorExpandableCity(location.value) || isMajorExpandableCity(location.label);
              const isSelected =
                draftCity === location.value ||
                selectedDistrictLocation?.city === location.value;
              const isExpanded = isMajorCity && !collapsedCities[location.value];
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
                      if (isMajorCity) {
                        setCollapsedCities((prev) => ({
                          ...prev,
                          [location.value]: !prev[location.value],
                        }));
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-3 text-left transition active:scale-[0.99] cursor-pointer",
                      isActive ? "text-[#C9A86A]" : "text-white"
                    )}
                  >
                    <MapPin className={cn("h-4 w-4 shrink-0 transition-transform duration-300", isActive ? "text-[#C9A86A]" : "text-slate-400")} />
                    <span className="truncate text-sm font-bold">{location.label}</span>
                    {isMajorCity && <span className="shrink-0 text-xs font-semibold text-slate-400 ml-auto">{location.count}</span>}
                    {isMajorCity && (
                      <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform", isExpanded && "rotate-180 text-[#C9A86A]")} />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="space-y-1.5 border-t border-white/5 px-3 pb-3 pt-2">
                      {location.districts.slice(0, 3).map((district, idx) => {
                        const districtValue = makeDistrictLocationValue(location.value, district.value);
                        const isDistrictSelected = draftCity === districtValue;
                        const isHanoi = location.value.includes("hà nội") || location.label.includes("Hà Nội");

                        let BadgeIcon = Crown;
                        let badgeStyle = "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-slate-950 shadow-[0_0_8px_rgba(251,191,36,0.4)] border-amber-300/40";

                        if (idx === 0) {
                          BadgeIcon = Crown;
                          badgeStyle = "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-slate-950 shadow-[0_0_8px_rgba(251,191,36,0.4)] border-amber-300/40";
                        } else if (idx === 1) {
                          if (isHanoi) {
                            BadgeIcon = Flame;
                            badgeStyle = "bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 text-white shadow-[0_0_8px_rgba(244,63,94,0.4)] border-rose-400/40";
                          } else {
                            BadgeIcon = Heart;
                            badgeStyle = "bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 text-white shadow-[0_0_8px_rgba(236,72,153,0.4)] border-pink-400/40";
                          }
                        } else {
                          if (isHanoi) {
                            BadgeIcon = Sparkles;
                            badgeStyle = "bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 text-slate-950 shadow-[0_0_8px_rgba(234,179,8,0.4)] border-yellow-200/40";
                          } else {
                            BadgeIcon = Gem;
                            badgeStyle = "bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white shadow-[0_0_8px_rgba(56,189,248,0.4)] border-cyan-300/40";
                          }
                        }

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
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs shadow-sm", badgeStyle)}>
                                <BadgeIcon className="h-3 w-3 fill-current" />
                              </span>
                              <span className="truncate">{district.label}</span>
                            </div>
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
                          setTopIdolCityInitialCity(location.value);
                          setIsTopIdolCityOpen(true);
                        }}
                        className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#C9A86A]/30 bg-[#C9A86A]/10 py-2.5 text-center text-xs font-bold text-[#C9A86A] transition active:scale-[0.98] hover:bg-[#C9A86A]/20 hover:border-[#C9A86A]/50 cursor-pointer"
                      >
                        <span>Xem thêm</span>
                        <ChevronRight className="h-3.5 w-3.5" />
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

      <TopIdolCity
        open={isTopIdolCityOpen}
        onClose={() => setIsTopIdolCityOpen(false)}
        initialExpandedCity={topIdolCityInitialCity}
        onSelectCity={(cityValue) => {
          onSelectCity(cityValue);
          setIsTopIdolCityOpen(false);
          onClose();
        }}
        selectedCity={selectedCity}
      />
    </div>
  );
}
