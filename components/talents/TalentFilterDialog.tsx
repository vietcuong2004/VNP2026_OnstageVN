"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, MapPin, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";
import TopIdolCity, { TOP_34_CITIES_LOCATIONS } from "../search/all-idols-in-city";

type TalentSortOption = "near_me" | "rating" | "newest" | "oldest" | "name_asc" | "name_desc";

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

type FilterOption = {
  label: string;
  value: string;
};

type TalentFilterDialogProps = {
  open: boolean;
  onClose: () => void;
  genderOptions: FilterOption[];
  cityOptions: FilterOption[];
  typeOptions: FilterOption[];
  sortOptions: FilterOption[];
  allValue: string;
  selectedGender: string;
  setSelectedGender: (value: string) => void;
  selectedCity: string;
  setSelectedCity: React.Dispatch<React.SetStateAction<string>>;
  selectedType: string;
  setSelectedType: (value: string) => void;
  sortOption: TalentSortOption;
  setSortOption: (value: TalentSortOption) => void;
  minHeight: number;
  setMinHeight: (value: number) => void;
  maxHeight: number;
  setMaxHeight: (value: number) => void;
  minWeight: number;
  setMinWeight: (value: number) => void;
  maxWeight: number;
  setMaxWeight: (value: number) => void;
  onReset: () => void;
  onApply: () => void;
};

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
          "relative flex h-11 items-center rounded-2xl border border-[#F2DBD7] bg-[#FFF8F7] dark:border-white/10 dark:bg-[#070913]/70 transition-all",
          isOpen && "border-[#C72524] bg-white dark:border-[#C9A86A]/60 dark:bg-slate-950/80"
        )}
      >
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C72524] dark:text-[#C9A86A]" />
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
          className="h-full min-w-0 flex-1 rounded-2xl bg-transparent pl-10 pr-10 text-xs font-semibold text-[#191116] outline-none placeholder:text-[#574D54] dark:text-white dark:placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen((current) => !current);
            setSearchInput("");
          }}
          className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#574D54] transition hover:bg-[#FFF0EE] hover:text-[#C72524] dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          aria-label="Mở danh sách tỉnh thành"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180 text-[#C72524] dark:text-[#C9A86A]")} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[1001] mt-2 overflow-hidden rounded-2xl border border-[#F2DBD7] bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#080b15]">
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
                      ? "bg-[#FFF0EE] text-[#8F0709] font-bold dark:bg-[#C9A86A]/15 dark:text-[#C9A86A]"
                      : "text-[#191116] hover:bg-[#FFF8F7] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isActive && <Check className="h-4 w-4 shrink-0 text-[#C72524] dark:text-[#C9A86A]" />}
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              <div className="px-3 py-4 text-center text-xs font-semibold text-[#574D54] dark:text-slate-500">
                Không tìm thấy tỉnh thành
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TalentFilterDialog({
  open,
  onClose,
  genderOptions,
  cityOptions,
  typeOptions,
  sortOptions,
  allValue,
  selectedGender,
  setSelectedGender,
  selectedCity,
  setSelectedCity,
  selectedType,
  setSelectedType,
  sortOption,
  setSortOption,
  minHeight,
  setMinHeight,
  maxHeight,
  setMaxHeight,
  minWeight,
  setMinWeight,
  maxWeight,
  setMaxWeight,
  onReset,
  onApply,
}: TalentFilterDialogProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartYRef = useRef(0);
  const isMouseDownRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setDragY(0);
      setIsDragging(false);
    }
  }, [open]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartYRef.current;
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;

    if (deltaY > 0 && scrollTop <= 0) {
      setDragY(deltaY);
    } else if (deltaY < 0 && dragY > 0) {
      setDragY(Math.max(0, deltaY));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 80) {
      onClose();
    }
    setDragY(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    touchStartYRef.current = e.clientY;
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;
      const deltaY = e.clientY - touchStartYRef.current;
      if (deltaY > 0) {
        setDragY(deltaY);
      }
    };

    const handleMouseUp = () => {
      if (!isMouseDownRef.current) return;
      isMouseDownRef.current = false;
      setIsDragging(false);
      setDragY((current) => {
        if (current > 80) {
          onClose();
        }
        return 0;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onClose]);

  const dialogSortOptions = sortOptions.map((option) => {
    if (option.value === "oldest") return { ...option, label: "Top đánh giá" };
    if (option.value === "name_asc") return { ...option, label: "Top tháng" };
    if (option.value === "name_desc") return { ...option, label: "Top booking" };
    if (option.value === "newest") return { ...option, label: "Gương mặt mới" };
    return option;
  });

  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-x-0 bottom-0 top-[62px] z-[1050] bg-black/75 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      {/* Bottom Sheet Dialog */}
      <div
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
          backgroundColor: "var(--dialog-bg, #FAF7F6)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="fixed inset-x-0 bottom-0 top-[62px] h-[calc(100dvh-62px)] z-[1051] flex flex-col rounded-t-[2rem] border-t border-[#F2DBD7] bg-[#FAF7F6] text-[#191116] dark:border-white/10 dark:!bg-[#070913] dark:text-white p-6 pb-0 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden"
      >
        {/* Top Drag Handle Indicator */}
        <div
          onMouseDown={handleMouseDown}
          className="mx-auto mb-3 -mt-2 flex w-full max-w-[200px] flex-col items-center py-2 cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <div className="h-1.5 w-12 rounded-full bg-[#574D54]/30 hover:bg-[#C72524] dark:bg-white/30 dark:hover:bg-amber-400 transition-colors" />
        </div>

        {/* Dialog Header */}
        <div className="flex shrink-0 items-center justify-between pb-3 border-b border-[#F2DBD7] dark:border-white/5 mb-4">
          <h2 className="font-display text-base font-black tracking-wide text-[#191116] dark:text-white uppercase">
            Bộ lọc Idol
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#F2DBD7] bg-white text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#C72524] dark:border-white/5 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:text-white cursor-pointer transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-1 py-1 pb-4 space-y-4 custom-scrollbar">
          <div className="relative z-0 p-4 rounded-3xl border border-[#F2DBD7] bg-white shadow-xs dark:border-white/5 dark:bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/5">
            <span className="block text-[11px] font-black uppercase tracking-wider text-[#8F0709] dark:text-[#C9A86A]">
              Lọc theo
            </span>
            <div className="grid grid-cols-2 gap-2">
              {dialogSortOptions.map((option) => {
                const isActive = sortOption === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortOption(option.value as TalentSortOption)}
                    className={cn(
                      "py-2.5 px-3 rounded-full border text-xs font-semibold text-center transition-all truncate cursor-pointer",
                      isActive
                        ? "border-[#C72524] bg-[#FFF0EE] text-[#8F0709] font-bold shadow-xs dark:border-[#C9A86A] dark:bg-[#C9A86A]/10 dark:text-[#C9A86A]"
                        : "border-[#F2DBD7] bg-[#FFF8F7] text-[#191116] hover:bg-[#FFF0EE] dark:border-white/10 dark:bg-[#070913]/60 dark:text-slate-350"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative z-0 p-4 rounded-3xl border border-[#F2DBD7] bg-white shadow-xs dark:border-white/5 dark:bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/5">
            <span className="block text-[11px] font-black uppercase tracking-wider text-[#8F0709] dark:text-[#C9A86A]">
              Giới tính
            </span>
            <div className="grid grid-cols-3 gap-2">
              {genderOptions.map((option) => {
                const isActive = selectedGender === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedGender(option.value)}
                    className={cn(
                      "py-2.5 px-3 rounded-full border text-xs font-semibold text-center transition-all truncate cursor-pointer",
                      isActive
                        ? "border-[#C72524] bg-[#FFF0EE] text-[#8F0709] font-bold shadow-xs dark:border-[#C9A86A] dark:bg-[#C9A86A]/10 dark:text-[#C9A86A]"
                        : "border-[#F2DBD7] bg-[#FFF8F7] text-[#191116] hover:bg-[#FFF0EE] dark:border-white/10 dark:bg-[#070913]/60 dark:text-slate-350"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-3xl border border-[#F2DBD7] bg-white shadow-xs dark:border-white/5 dark:bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/5">
            <span className="block text-[11px] font-black uppercase tracking-wider text-[#8F0709] dark:text-[#C9A86A]">
              Loại hình
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {typeOptions.map((option) => {
                const isAll = option.value === allValue;
                const isActive = isAll
                  ? selectedType === allValue
                  : selectedType !== allValue && selectedType.split(",").includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (isAll) {
                        setSelectedType(allValue);
                        return;
                      }

                      const currentList = selectedType === allValue
                        ? []
                        : selectedType.split(",").filter(Boolean);
                      const newList = currentList.includes(option.value)
                        ? currentList.filter((type) => type !== option.value)
                        : [...currentList, option.value];

                      setSelectedType(newList.length === 0 ? allValue : newList.join(","));
                    }}
                    className={cn(
                      "py-2 px-3 rounded-full border text-xs font-semibold flex items-center justify-start gap-2.5 transition-all truncate cursor-pointer",
                      isActive
                        ? "border-[#C72524] bg-[#FFF0EE] text-[#8F0709] font-bold shadow-xs dark:border-[#C9A86A] dark:bg-[#C9A86A]/10 dark:text-[#C9A86A]"
                        : "border-[#F2DBD7] bg-[#FFF8F7] text-[#191116] hover:bg-[#FFF0EE] dark:border-white/10 dark:bg-[#070913]/60 dark:text-slate-355"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all",
                        isActive
                          ? "border-[#C72524] bg-[#C72524] text-white dark:border-[#C9A86A] dark:bg-[#C9A86A] dark:text-slate-950"
                          : "border-[#F2DBD7] bg-white text-transparent dark:border-white/20 dark:bg-slate-950/40"
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

          <div className="p-4 rounded-3xl border border-[#F2DBD7] bg-white shadow-xs dark:border-white/5 dark:bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/5">
            <span className="block text-[11px] font-black uppercase tracking-wider text-[#8F0709] dark:text-[#C9A86A]">
              Chiều cao ({minHeight} - {maxHeight}cm)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#574D54] dark:text-slate-500 font-semibold">Từ:</span>
                <input
                  type="number"
                  min={140}
                  max={200}
                  value={minHeight}
                  onChange={(event) => setMinHeight(Number(event.target.value))}
                  className="w-full h-9 rounded-full border border-[#F2DBD7] bg-[#FFF8F7] px-3 text-xs text-[#191116] outline-none focus:border-[#C72524] text-center font-semibold dark:border-white/10 dark:bg-[#070913]/60 dark:text-white dark:focus:border-[#C9A86A]/60"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#574D54] dark:text-slate-500 font-semibold">Đến:</span>
                <input
                  type="number"
                  min={140}
                  max={200}
                  value={maxHeight}
                  onChange={(event) => setMaxHeight(Number(event.target.value))}
                  className="w-full h-9 rounded-full border border-[#F2DBD7] bg-[#FFF8F7] px-3 text-xs text-[#191116] outline-none focus:border-[#C72524] text-center font-semibold dark:border-white/10 dark:bg-[#070913]/60 dark:text-white dark:focus:border-[#C9A86A]/60"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-3xl border border-[#F2DBD7] bg-white shadow-xs dark:border-white/5 dark:bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/5">
            <span className="block text-[11px] font-black uppercase tracking-wider text-[#8F0709] dark:text-[#C9A86A]">
              Cân nặng ({minWeight} - {maxWeight}kg)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#574D54] dark:text-slate-500 font-semibold">Từ:</span>
                <input
                  type="number"
                  min={35}
                  max={120}
                  value={minWeight}
                  onChange={(event) => setMinWeight(Number(event.target.value))}
                  className="w-full h-9 rounded-full border border-[#F2DBD7] bg-[#FFF8F7] px-3 text-xs text-[#191116] outline-none focus:border-[#C72524] text-center font-semibold dark:border-white/10 dark:bg-[#070913]/60 dark:text-white dark:focus:border-[#C9A86A]/60"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#574D54] dark:text-slate-500 font-semibold">Đến:</span>
                <input
                  type="number"
                  min={35}
                  max={120}
                  value={maxWeight}
                  onChange={(event) => setMaxWeight(Number(event.target.value))}
                  className="w-full h-9 rounded-full border border-[#F2DBD7] bg-[#FFF8F7] px-3 text-xs text-[#191116] outline-none focus:border-[#C72524] text-center font-semibold dark:border-white/10 dark:bg-[#070913]/60 dark:text-white dark:focus:border-[#C9A86A]/60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 border-t border-[#F2DBD7] bg-white dark:border-white/10 dark:bg-[#070913] -mx-6 px-6 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] flex gap-3 z-10">
          <button
            type="button"
            onClick={onReset}
            className="w-1/2 py-3 rounded-full border border-[#F2DBD7] bg-[#FFF8F7] text-[#191116] hover:bg-[#FFF0EE] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Đặt lại
          </button>
          <button
            type="button"
            onClick={() => {
              onApply();
              onClose();
            }}
            className="w-1/2 py-3 rounded-full bg-[#C72524] hover:bg-[#8F0709] !text-white text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer dark:bg-gradient-to-r dark:from-amber-100 dark:via-[#C9A86A] dark:to-yellow-600"
          >
            <span className="!text-white dark:text-slate-950 font-black">Áp dụng</span>
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
