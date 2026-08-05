"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, MapPin, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";
import TopJobCity from "../search/TopJobCity";

type StageFilter = "apply" | "pending" | "approved" | "all";
type SortOrder = "newest" | "oldest";

type FilterOption = {
  value: string;
  label: string;
};

type JobFilterDialogProps = {
  open: boolean;
  onClose: () => void;
  cityOptions: FilterOption[];
  jobTypeOptions: FilterOption[];
  stageFilterOptions: StageFilter[];
  stageFilterLabels: Record<StageFilter, string>;
  stageCounts: Record<StageFilter, number>;
  selectedCity: string;
  setSelectedCity: React.Dispatch<React.SetStateAction<string>>;
  selectedJobType: string;
  setSelectedJobType: React.Dispatch<React.SetStateAction<string>>;
  selectedStageFilter: StageFilter;
  setSelectedStageFilter: React.Dispatch<React.SetStateAction<StageFilter>>;
  sortOrder: SortOrder;
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
  minBudget: number;
  setMinBudget: React.Dispatch<React.SetStateAction<number>>;
  maxBudget: number;
  setMaxBudget: React.Dispatch<React.SetStateAction<number>>;
  onReset: () => void;
  onApply: () => void;
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

function parseDistrictLocationValue(value?: string) {
  if (!value || !value.startsWith(DISTRICT_FILTER_PREFIX)) return null;
  const [city = "", district = ""] = value.slice(DISTRICT_FILTER_PREFIX.length).split(":");
  if (!city || !district) return null;
  return {
    city: decodeURIComponent(city),
    district: decodeURIComponent(district),
  };
}

function parseVNDNumber(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function formatVNDNumber(value: number): string {
  if (!value || value <= 0) return "";
  return value.toLocaleString("vi-VN");
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

function CityCombobox({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  options: FilterOption[];
}) {
  const comboboxRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const selectedDistrict = parseDistrictLocationValue(value);
  const selectedOption = options.find((option) => option.value === value) ||
    (selectedDistrict
      ? {
          value,
          label: `${options.find((option) => option.value === selectedDistrict.city)?.label || selectedDistrict.city}, ${selectedDistrict.district}`,
        }
      : options[0]);

  const filteredOptions = useMemo(() => {
    const keyword = normalizeSearchText(searchInput);
    if (!keyword) return options;

    return options.filter((option) => {
      const label = normalizeSearchText(option.label);
      const optionValue = normalizeSearchText(option.value);
      return label.includes(keyword) || optionValue.includes(keyword);
    });
  }, [options, searchInput]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!comboboxRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchInput("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={comboboxRef} className="relative">
      <div
        className={cn(
          "relative flex h-11 items-center rounded-2xl border border-white/10 bg-[#070913]/70 transition-all",
          isOpen && "border-[#C9A86A]/60 bg-slate-950/80"
        )}
      >
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A86A]" />
        <input
          type="text"
          value={isOpen ? searchInput : selectedOption?.label || ""}
          onFocus={() => {
            setIsOpen(true);
            setSearchInput("");
          }}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setIsOpen(true);
          }}
          placeholder="Tìm kiếm tỉnh thành..."
          className="h-full min-w-0 flex-1 rounded-2xl bg-transparent pl-10 pr-10 text-xs font-semibold text-white outline-none placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen((current) => !current);
            setSearchInput("");
          }}
          className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/5 hover:text-white"
          aria-label="Mở danh sách tỉnh thành"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180 text-[#C9A86A]")} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[1001] mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#080b15] p-1.5 shadow-2xl">
          <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1 custom-scrollbar">
            {filteredOptions.map((option) => {
              const isActive = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setSearchInput("");
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition",
                    isActive
                      ? "bg-[#C9A86A]/15 text-[#C9A86A]"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isActive && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              <div className="px-3 py-4 text-center text-xs font-semibold text-slate-500">
                Không tìm thấy tỉnh thành
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobFilterDialog({
  open,
  onClose,
  cityOptions,
  jobTypeOptions,
  stageFilterOptions,
  stageFilterLabels,
  stageCounts,
  selectedCity,
  setSelectedCity,
  selectedJobType,
  setSelectedJobType,
  selectedStageFilter,
  setSelectedStageFilter,
  sortOrder,
  setSortOrder,
  minBudget,
  setMinBudget,
  maxBudget,
  setMaxBudget,
  onReset,
  onApply,
}: JobFilterDialogProps) {
  const [expandedHotLocation, setExpandedHotLocation] = useState<string | null>(null);
  const [isTopJobCityOpen, setIsTopJobCityOpen] = useState(false);
  const selectedDistrictLocation = parseDistrictLocationValue(selectedCity);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-filter-dialog-title"
      className="fixed inset-0 z-[1000] flex h-dvh w-screen flex-col overflow-hidden bg-[#050711] text-white animate-in fade-in duration-200"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-[#070913] px-5 py-4">
        <h2
          id="job-filter-dialog-title"
          className="font-display text-base font-black tracking-wide text-white uppercase"
        >
          Bộ lọc Job
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/5 bg-slate-950/60 text-slate-400 hover:text-white"
          aria-label="Đóng bộ lọc"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Địa điểm Card (Matching TalentFilterDialog) */}
        <div className="relative z-40 p-4 rounded-3xl border border-white/5 bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/10">
          <span className="block text-[11px] font-black uppercase tracking-wider text-[#C9A86A]">
            Địa điểm
          </span>
          <CityCombobox
            value={selectedCity}
            onChange={setSelectedCity}
            options={cityOptions}
          />
          <div className="space-y-2 pt-1">
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
                              onClick={() => setSelectedCity(districtValue)}
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
                          onClick={() => setSelectedCity(location.value)}
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
        </div>

        {/* Sắp xếp theo Card */}
        <div className="relative z-0 p-4 rounded-3xl border border-white/5 bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/10">
          <span className="block text-[11px] font-black uppercase tracking-wider text-[#C9A86A]">
            Sắp xếp theo
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(["newest", "oldest"] as SortOrder[]).map((option) => {
              const isActive = sortOrder === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSortOrder(option)}
                  className={cn(
                    "py-2.5 px-3 rounded-full border text-xs font-semibold text-center transition-all truncate",
                    isActive
                      ? "border-[#C9A86A] bg-[#C9A86A]/10 text-[#C9A86A] font-bold shadow-[0_0_12px_rgba(201,168,106,0.1)]"
                      : "border-white/10 bg-[#070913]/60 text-slate-350"
                  )}
                >
                  {option === "newest" ? "Mới nhất" : "Cũ nhất"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loại hình job Card */}
        <div className="p-4 rounded-3xl border border-white/5 bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/10">
          <span className="block text-[11px] font-black uppercase tracking-wider text-[#C9A86A]">
            Loại hình job
          </span>
          <div className="grid grid-cols-2 gap-2">
            {jobTypeOptions.map((option) => {
              const isActive = selectedJobType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedJobType(option.value)}
                  className={cn(
                    "py-2.5 px-3 rounded-full border text-xs font-semibold flex items-center justify-start gap-2.5 transition-all truncate",
                    isActive
                      ? "border-[#C9A86A] bg-[#C9A86A]/10 text-[#C9A86A] font-bold shadow-[0_0_12px_rgba(201,168,106,0.1)]"
                      : "border-white/10 bg-[#070913]/60 text-slate-350"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all",
                      isActive
                        ? "border-[#C9A86A] bg-[#C9A86A] text-slate-950"
                        : "border-white/20 bg-slate-950/40 text-transparent"
                    )}
                  >
                    <Check className="h-3 w-3 stroke-[3px]" />
                  </div>
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trạng thái Card */}
        <div className="p-4 rounded-3xl border border-white/5 bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/10">
          <span className="block text-[11px] font-black uppercase tracking-wider text-[#C9A86A]">
            Trạng thái
          </span>
          <div className="grid grid-cols-2 gap-2">
            {stageFilterOptions.map((option) => {
              const isActive = selectedStageFilter === option;
              const count = stageCounts[option];
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedStageFilter(option)}
                  className={cn(
                    "py-2.5 px-3 rounded-full border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all truncate",
                    isActive
                      ? "border-[#C9A86A] bg-[#C9A86A]/10 text-[#C9A86A] font-bold shadow-[0_0_12px_rgba(201,168,106,0.1)]"
                      : "border-white/10 bg-[#070913]/60 text-slate-350"
                  )}
                >
                  <span className="truncate">{stageFilterLabels[option]}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-black shrink-0",
                        isActive ? "bg-[#C9A86A]/20" : "bg-white/5 text-slate-500"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Thù lao Card */}
        <div className="p-4 rounded-3xl border border-white/5 bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/10">
          <span className="block text-[11px] font-black uppercase tracking-wider text-[#C9A86A]">
            Thù lao
          </span>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tối thiểu
              </span>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={minBudget ? formatVNDNumber(minBudget) : ""}
                  onChange={(event) => setMinBudget(parseVNDNumber(event.target.value))}
                  placeholder="VD: 700.000"
                  className="h-9 w-full rounded-full border border-white/10 bg-[#070913]/60 px-3 pr-24 text-xs font-semibold text-white outline-none focus:border-[#C9A86A]/60"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500">
                  VND / ngày
                </span>
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tối đa
              </span>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={maxBudget ? formatVNDNumber(maxBudget) : ""}
                  onChange={(event) => setMaxBudget(parseVNDNumber(event.target.value))}
                  placeholder="VD: 1.000.000"
                  className="h-9 w-full rounded-full border border-white/10 bg-[#070913]/60 px-3 pr-24 text-xs font-semibold text-white outline-none focus:border-[#C9A86A]/60"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500">
                  VND / ngày
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-white/5 bg-[#070913] p-4 flex gap-3 z-10 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <button
          type="button"
          onClick={onReset}
          className="w-1/2 py-3 rounded-full border border-white/10 bg-slate-900/40 text-slate-350 text-xs font-semibold uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5"
        >
          Đặt lại
        </button>
        <button
          type="button"
          onClick={onApply}
          className="w-1/2 py-3 rounded-full bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-lg flex items-center justify-center gap-1.5"
        >
          Áp dụng
        </button>
      </div>

      <TopJobCity
        open={isTopJobCityOpen}
        onClose={() => setIsTopJobCityOpen(false)}
        onSelectCity={(cityValue) => setSelectedCity(cityValue)}
        selectedCity={selectedCity}
      />
    </div>
  );
}
