"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, LocateFixed, MapPin, RefreshCw, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";
import TopJobCity from "../search/TopJobCity";

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

const HOT_JOB_LOCATIONS = [
  {
    label: "Hà Nội",
    value: "hà nội",
    count: "100+ công việc",
    districts: [
      { label: "Tây Hồ", value: "tây hồ", count: "40 công việc" },
      { label: "Thái Hà", value: "thái hà", count: "32 công việc" },
      { label: "Hoàng Cầu", value: "hoàng cầu", count: "28 công việc" },
      { label: "Cầu Giấy", value: "cầu giấy", count: "50 công việc" },
      { label: "Đống Đa", value: "đống đa", count: "36 công việc" },
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
      { label: "Liên Chiểu", value: "liên chiểu", count: "10 công việc" },
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

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
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
  const [expandedHotLocation, setExpandedHotLocation] = useState<string | null>(null);
  const [isTopJobCityOpen, setIsTopJobCityOpen] = useState(false);

  const selectedDistrictLocation = parseDistrictLocationValue(selectedCity);

  const filteredOptions = useMemo(() => {
    const keyword = normalizeSearchText(searchQuery);
    if (!keyword) return options;

    return options.filter((option) => {
      const label = normalizeSearchText(option.label);
      const value = normalizeSearchText(option.value);
      return label.includes(keyword) || value.includes(keyword);
    });
  }, [options, searchQuery]);

  if (!open) return null;

  const handleSelect = (value: string) => {
    onSelectCity(value);
    setSearchQuery("");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-city-dialog-title"
      className="fixed inset-0 z-[999] flex h-dvh w-screen flex-col overflow-hidden bg-[#050711] text-white animate-in fade-in duration-200 md:hidden"
    >
      <div className="shrink-0 border-b border-white/5 bg-[#070913] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-slate-950/40 text-white transition active:scale-95"
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
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm kiếm tỉnh thành..."
              className="h-10 w-full rounded-full border border-white/10 bg-slate-950/55 pl-9 pr-9 text-sm font-medium text-white outline-none placeholder:text-slate-500 focus:border-[#C9A86A]/60"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition active:scale-95"
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] custom-scrollbar">
        <div className="space-y-2">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Vị trí hiện tại
          </span>
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <button
              type="button"
              onClick={() => handleSelect(currentLocationValue)}
              className="flex min-w-0 items-center gap-3 text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C9A86A]/10 text-[#C9A86A]">
                <LocateFixed className="h-4.5 w-4.5" />
              </span>
              <span className="truncate font-display text-sm font-black text-white">
                {currentLocationLabel}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onRefreshLocation?.();
              }}
              className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#C9A86A] transition active:scale-95"
            >
              <RefreshCw className="h-3 w-3" />
              Cập nhật vị trí
            </button>
          </div>
        </div>

        {!searchQuery.trim() && (
          <div className="mt-4 space-y-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Nổi bật
            </span>
            <div className="grid gap-2">
              {HOT_JOB_LOCATIONS.map((location) => {
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
                              onClick={() => handleSelect(districtValue)}
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
                          onClick={() => handleSelect(location.value)}
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
                onClick={() => setIsTopJobCityOpen(true)}
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/10 py-2.5 px-4 text-xs font-bold text-slate-200 transition hover:border-white/25 hover:bg-white/20 hover:text-white active:scale-[0.98]"
              >
                <span>Xem tất cả</span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-1">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Tất cả tỉnh thành
          </span>
          {filteredOptions.map((option) => {
            const isSelected = selectedCity === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-white/5 py-3 text-left transition-colors active:text-[#C9A86A]",
                  isSelected ? "text-[#C9A86A]" : "text-white"
                )}
              >
                <MapPin className={cn("h-4.5 w-4.5 shrink-0", isSelected ? "text-[#C9A86A]" : "text-slate-400")} />
                <span className="truncate text-sm font-semibold">{option.label}</span>
              </button>
            );
          })}

          {filteredOptions.length === 0 && (
            <div className="py-10 text-center text-sm font-semibold text-slate-500">
              Không tìm thấy tỉnh thành
            </div>
          )}
        </div>
      </div>

      <TopJobCity
        open={isTopJobCityOpen}
        onClose={() => setIsTopJobCityOpen(false)}
        onSelectCity={(cityValue) => {
          handleSelect(cityValue);
          setIsTopJobCityOpen(false);
        }}
        selectedCity={selectedCity}
      />
    </div>
  );
}
