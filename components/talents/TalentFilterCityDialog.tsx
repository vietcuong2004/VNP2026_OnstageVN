"use client";

import React, { useState } from "react";
import { ArrowLeft, ChevronDown, Locate, MapPin, RefreshCw, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";
import TopIdolCity from "../search/TopIdolCity";

const HOT_TALENT_LOCATIONS = [
  {
    label: "Hà Nội",
    value: "hà nội",
    count: "100+ idol",
    districts: [
      { label: "Tây Hồ", value: "tây hồ", count: "40 idol" },
      { label: "Thái Hà", value: "thái hà", count: "32 idol" },
      { label: "Hoàng Cầu", value: "hoàng cầu", count: "28 idol" },
      { label: "Cầu Giấy", value: "cầu giấy", count: "50 idol" },
      { label: "Đống Đa", value: "đống đa", count: "36 idol" },
    ],
  },
  {
    label: "Hồ Chí Minh",
    value: "hồ chí minh",
    count: "100+ idol",
    districts: [
      { label: "Quận 1", value: "quận 1", count: "45 idol" },
      { label: "Thảo Điền", value: "thảo điền", count: "38 idol" },
      { label: "Bình Thạnh", value: "bình thạnh", count: "34 idol" },
      { label: "Phú Nhuận", value: "phú nhuận", count: "31 idol" },
      { label: "Quận 7", value: "quận 7", count: "29 idol" },
    ],
  },
  {
    label: "Đà Nẵng",
    value: "đà nẵng",
    count: "40+ idol",
    districts: [
      { label: "Hải Châu", value: "hải châu", count: "18 idol" },
      { label: "Sơn Trà", value: "sơn trà", count: "16 idol" },
      { label: "Phú Mỹ An", value: "phú mỹ an", count: "14 idol" },
      { label: "Thanh Khê", value: "thanh khê", count: "12 idol" },
      { label: "Liên Chiểu", value: "liên chiểu", count: "10 idol" },
    ],
  },
  {
    label: "Hải Phòng",
    value: "hải phòng",
    count: "30+ idol",
    districts: [
      { label: "Lê Chân", value: "lê chân", count: "14 idol" },
      { label: "Ngô Quyền", value: "ngô quyền", count: "12 idol" },
      { label: "Hồng Bàng", value: "hồng bàng", count: "10 idol" },
      { label: "Hải An", value: "hải an", count: "9 idol" },
      { label: "Đồ Sơn", value: "đồ sơn", count: "8 idol" },
    ],
  },
  {
    label: "Cần Thơ",
    value: "cần thơ",
    count: "20+ idol",
    districts: [
      { label: "Ninh Kiều", value: "ninh kiều", count: "12 idol" },
      { label: "Cái Răng", value: "cái răng", count: "9 idol" },
      { label: "Bình Thủy", value: "bình thủy", count: "8 idol" },
      { label: "Ô Môn", value: "ô môn", count: "6 idol" },
      { label: "Thốt Nốt", value: "thốt nốt", count: "5 idol" },
    ],
  },
];

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

type CityOption = {
  label: string;
  value: string;
};

type TalentFilterCityDialogProps = {
  open: boolean;
  cityOptions: CityOption[];
  selectedCity: string;
  citySearchQuery: string;
  setCitySearchQuery: (value: string) => void;
  onClose: () => void;
  onSelectCity: (value: string) => void;
  onRefreshLocation: () => void;
  currentLocationLabel?: string;
  currentLocationValue?: string;
};

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
  const [expandedHotLocation, setExpandedHotLocation] = useState<string | null>(null);
  const [isTopIdolCityOpen, setIsTopIdolCityOpen] = useState(false);

  const selectedDistrictLocation = parseDistrictLocationValue(selectedCity);

  if (!open) return null;

  const filteredCityOptions = cityOptions.filter((option) =>
    option.label.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#050711] text-white animate-in fade-in duration-200">
      <div className="flex items-center gap-3 border-b border-white/5 bg-[#070913] px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/5 bg-slate-950/60 text-slate-350 hover:text-white"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A86A]" />
          <input
            type="text"
            value={citySearchQuery}
            onChange={(event) => setCitySearchQuery(event.target.value)}
            placeholder="Tìm kiếm tỉnh thành..."
            className="w-full h-9 rounded-full border border-white/10 bg-slate-950/60 pl-8.5 pr-8 text-xs text-white outline-none focus:border-[#C9A86A]/60 placeholder:text-slate-500"
          />
          {citySearchQuery && (
            <button
              type="button"
              onClick={() => setCitySearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        <div className="space-y-2">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Vị trí hiện tại
          </span>
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <button
              type="button"
              onClick={() => onSelectCity(currentLocationValue)}
              className="flex items-center gap-3 text-left focus:outline-none"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A86A]/10 text-[#C9A86A]">
                <Locate className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-white font-display">{currentLocationLabel}</span>
              </div>
            </button>
            <button
              type="button"
              onClick={onRefreshLocation}
              className="flex items-center gap-1.5 text-xs text-[#C9A86A] font-semibold hover:text-[#C9A86A]/80 transition active:scale-95"
            >
              <RefreshCw className="h-3 w-3 animate-spin duration-3000" />
              Cập nhật vị trí
            </button>
          </div>
        </div>

        {!citySearchQuery.trim() && (
          <div className="space-y-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Nổi bật
            </span>
            <div className="grid gap-2">
              {HOT_TALENT_LOCATIONS.map((location) => {
                const isExpanded = expandedHotLocation === location.value;
                const isSelected =
                  selectedCity === location.value ||
                  selectedDistrictLocation?.city === location.value;
                return (
                  <div
                    key={location.label}
                    className={cn(
                      "overflow-hidden rounded-2xl border transition",
                      isSelected
                        ? "border-[#C9A86A]/70 bg-[#C9A86A]/10"
                        : "border-white/8 bg-white/[0.03]"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedHotLocation(isExpanded ? null : location.value)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-3 text-left transition active:scale-[0.99]",
                        isSelected ? "text-[#C9A86A]" : "text-white"
                      )}
                    >
                      <MapPin className={cn("h-4 w-4 shrink-0", isSelected ? "text-[#C9A86A]" : "text-slate-400")} />
                      <span className="min-w-0 flex-1 truncate text-sm font-bold">{location.label}</span>
                      <span className="shrink-0 text-xs font-semibold text-slate-400">{location.count}</span>
                      <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform", isExpanded && "rotate-180 text-[#C9A86A]")} />
                    </button>

                    {isExpanded && (
                      <div className="space-y-1.5 border-t border-white/5 px-3 pb-3 pt-2">
                        {location.districts.map((district) => {
                          const districtValue = makeDistrictLocationValue(location.value, district.value);
                          const isDistrictSelected = selectedCity === districtValue;

                          return (
                            <button
                              key={district.label}
                              type="button"
                              onClick={() => onSelectCity(districtValue)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-bold transition active:scale-[0.99]",
                                isDistrictSelected
                                  ? "border-[#C9A86A]/70 bg-[#C9A86A]/15 text-[#C9A86A]"
                                  : "border-white/8 bg-[#070913]/55 text-slate-200"
                              )}
                            >
                              <span>{district.label}</span>
                              <span className="text-[10px] font-semibold text-slate-500">{district.count}</span>
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => onSelectCity(location.value)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-bold transition active:scale-[0.99]",
                            selectedCity === location.value
                              ? "border-[#C9A86A]/70 bg-[#C9A86A]/15 text-[#C9A86A]"
                              : "border-white/8 bg-[#070913]/55 text-slate-200"
                          )}
                        >
                          <span>Tất cả {location.label}</span>
                          <span className="text-[10px] font-semibold text-slate-500">{location.count}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setIsTopIdolCityOpen(true)}
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/10 py-2.5 px-4 text-xs font-bold text-slate-200 transition hover:border-white/25 hover:bg-white/20 hover:text-white active:scale-[0.98]"
              >
                <span>Xem tất cả</span>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Tất cả tỉnh thành
          </span>
          {filteredCityOptions.map((option) => {
            const isSelected = selectedCity === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelectCity(option.value)}
                className={cn(
                  "flex w-full items-center gap-3 py-3 text-left border-b border-white/5 focus:outline-none transition-colors",
                  isSelected ? "text-[#C9A86A]" : "text-white hover:text-[#C9A86A]"
                )}
              >
                <MapPin className={cn("h-4.5 w-4.5 shrink-0", isSelected ? "text-[#C9A86A]" : "text-slate-400")} />
                <span className="text-sm font-semibold">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <TopIdolCity
        open={isTopIdolCityOpen}
        onClose={() => setIsTopIdolCityOpen(false)}
        onSelectCity={(cityValue) => {
          onSelectCity(cityValue);
          setIsTopIdolCityOpen(false);
        }}
        selectedCity={selectedCity}
      />
    </div>
  );
}
