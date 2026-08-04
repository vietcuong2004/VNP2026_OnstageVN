"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";

type TalentSortOption = "near_me" | "rating" | "newest" | "oldest" | "name_asc" | "name_desc";

const HOT_TALENT_LOCATIONS = [
  { label: "Hà Nội", value: "hà nội", count: "100+ idol" },
  { label: "Hồ Chí Minh", value: "hồ chí minh", count: "100+ idol" },
  { label: "Đà Nẵng", value: "đà nẵng", count: "40+ idol" },
  { label: "Hải Phòng", value: "hải phòng", count: "30+ idol" },
  { label: "Cần Thơ", value: "cần thơ", count: "20+ idol" },
];

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
  const selectedOption = options.find((option) => option.value === value) || options[0];

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#050711] text-white animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-white/5 bg-[#070913] px-5 py-4">
        <h2 className="font-display text-base font-black tracking-wide text-white uppercase">
          Bộ lọc Idol
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/5 bg-slate-950/60 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="relative z-0 p-4 rounded-3xl border border-white/5 bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/10">
          <span className="block text-[11px] font-black uppercase tracking-wider text-[#C9A86A]">
            Sắp xếp theo
          </span>
          <div className="grid grid-cols-2 gap-2">
            {sortOptions.map((option) => {
              const isActive = sortOption === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSortOption(option.value as TalentSortOption)}
                  className={cn(
                    "py-2.5 px-3 rounded-full border text-xs font-semibold text-center transition-all truncate",
                    isActive
                      ? "border-[#C9A86A] bg-[#C9A86A]/10 text-[#C9A86A] font-bold shadow-[0_0_12px_rgba(201,168,106,0.1)]"
                      : "border-white/10 bg-[#070913]/60 text-slate-350"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

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
              {HOT_TALENT_LOCATIONS.map((location) => {
                const isSelected = selectedCity === location.value;
                return (
                  <button
                    key={location.label}
                    type="button"
                    onClick={() => setSelectedCity(location.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition active:scale-[0.99]",
                      isSelected
                        ? "border-[#C9A86A]/70 bg-[#C9A86A]/12 text-[#C9A86A]"
                        : "border-white/8 bg-white/[0.03] text-white"
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">{location.label}</span>
                    <span className="shrink-0 text-xs font-semibold text-slate-400">{location.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative z-0 p-4 rounded-3xl border border-white/5 bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/10">
          <span className="block text-[11px] font-black uppercase tracking-wider text-[#C9A86A]">
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
                    "py-2.5 px-3 rounded-full border text-xs font-semibold text-center transition-all truncate",
                    isActive
                      ? "border-[#C9A86A] bg-[#C9A86A]/10 text-[#C9A86A] font-bold shadow-[0_0_12px_rgba(201,168,106,0.1)]"
                      : "border-white/10 bg-[#070913]/60 text-slate-350"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 rounded-3xl border border-white/5 bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/10">
          <span className="block text-[11px] font-black uppercase tracking-wider text-[#C9A86A]">
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
                    "py-2 px-3 rounded-full border text-xs font-semibold flex items-center justify-start gap-2.5 transition-all truncate",
                    isActive
                      ? "border-[#C9A86A] bg-[#C9A86A]/10 text-[#C9A86A] font-bold shadow-[0_0_12px_rgba(201,168,106,0.1)]"
                      : "border-white/10 bg-[#070913]/60 text-slate-355"
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

        <div className="p-4 rounded-3xl border border-white/5 bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/10">
          <span className="block text-[11px] font-black uppercase tracking-wider text-[#C9A86A]">
            Chiều cao ({minHeight} - {maxHeight}cm)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Từ:</span>
              <input
                type="number"
                min={140}
                max={200}
                value={minHeight}
                onChange={(event) => setMinHeight(Number(event.target.value))}
                className="w-full h-9 rounded-full border border-white/10 bg-[#070913]/60 px-3 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center font-semibold"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Đến:</span>
              <input
                type="number"
                min={140}
                max={200}
                value={maxHeight}
                onChange={(event) => setMaxHeight(Number(event.target.value))}
                className="w-full h-9 rounded-full border border-white/10 bg-[#070913]/60 px-3 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl border border-white/5 bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3.5 shadow-md shadow-black/10">
          <span className="block text-[11px] font-black uppercase tracking-wider text-[#C9A86A]">
            Cân nặng ({minWeight} - {maxWeight}kg)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Từ:</span>
              <input
                type="number"
                min={35}
                max={120}
                value={minWeight}
                onChange={(event) => setMinWeight(Number(event.target.value))}
                className="w-full h-9 rounded-full border border-white/10 bg-[#070913]/60 px-3 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center font-semibold"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Đến:</span>
              <input
                type="number"
                min={35}
                max={120}
                value={maxWeight}
                onChange={(event) => setMaxWeight(Number(event.target.value))}
                className="w-full h-9 rounded-full border border-white/10 bg-[#070913]/60 px-3 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 bg-[#070913] p-4 flex gap-3 z-10">
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
    </div>
  );
}
