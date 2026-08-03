"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";

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
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-filter-dialog-title"
      className="fixed inset-0 z-[999] flex h-dvh w-screen flex-col overflow-hidden bg-[#050711] text-white animate-in fade-in duration-200 md:hidden"
    >
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-white/5 bg-[#070913] px-5">
        <h2
          id="job-filter-dialog-title"
          className="font-display text-base font-black tracking-wide text-white uppercase"
        >
          Bộ lọc Job
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/5 bg-slate-950/60 text-slate-400 transition hover:border-[#C9A86A]/40 hover:text-white"
          aria-label="Đóng bộ lọc"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-32 space-y-4 custom-scrollbar">
        <div className="relative z-0 rounded-[1.4rem] border border-white/5 bg-[#0b0e1a]/85 p-4 shadow-md shadow-black/10 space-y-3.5">
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
                    "min-h-10 rounded-full border px-3 text-xs font-semibold transition-all",
                    isActive
                      ? "border-[#C9A86A] bg-[#C9A86A]/10 text-[#C9A86A] font-bold"
                      : "border-white/10 bg-[#070913]/60 text-slate-350"
                  )}
                >
                  {option === "newest" ? "Mới nhất" : "Cũ nhất"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative z-40 rounded-[1.4rem] border border-white/5 bg-[#0b0e1a]/85 p-4 shadow-md shadow-black/10 space-y-3.5">
          <span className="block text-[11px] font-black uppercase tracking-wider text-[#C9A86A]">
            Địa điểm
          </span>
          <CityCombobox
            value={selectedCity}
            onChange={setSelectedCity}
            options={cityOptions}
          />
        </div>

        <div className="relative z-0 rounded-[1.4rem] border border-white/5 bg-[#0b0e1a]/85 p-4 shadow-md shadow-black/10 space-y-3.5">
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
                    "flex min-h-10 items-center justify-start gap-2.5 rounded-full border px-3 text-xs font-semibold transition-all",
                    isActive
                      ? "border-[#C9A86A] bg-[#C9A86A]/10 text-[#C9A86A] font-bold"
                      : "border-white/10 bg-[#070913]/60 text-slate-350"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
                      isActive
                        ? "border-[#C9A86A] bg-[#C9A86A] text-slate-950"
                        : "border-white/20 bg-slate-950/40 text-transparent"
                    )}
                  >
                    <Check className="h-3 w-3 stroke-[3px]" />
                  </span>
                  <span className="line-clamp-1">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-white/5 bg-[#0b0e1a]/85 p-4 shadow-md shadow-black/10 space-y-3.5">
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
                    "flex min-h-10 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-all",
                    isActive
                      ? "border-[#C9A86A] bg-[#C9A86A]/10 text-[#C9A86A] font-bold"
                      : "border-white/10 bg-[#070913]/60 text-slate-350"
                  )}
                >
                  <span className="line-clamp-1">{stageFilterLabels[option]}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-black",
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

        <div className="rounded-[1.4rem] border border-white/5 bg-[#0b0e1a]/85 p-4 shadow-md shadow-black/10 space-y-3.5">
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
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#070913]/60 px-3 pr-24 text-xs font-semibold text-white outline-none focus:border-[#C9A86A]/60"
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
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#070913]/60 px-3 pr-24 text-xs font-semibold text-white outline-none focus:border-[#C9A86A]/60"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500">
                  VND / ngày
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[1000] border-t border-white/5 bg-[#070913] p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] flex gap-3">
        <button
          type="button"
          onClick={onReset}
          className="flex w-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/40 py-3 text-xs font-semibold uppercase tracking-wider text-slate-350 transition active:scale-95"
        >
          Đặt lại
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex w-1/2 items-center justify-center rounded-full bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg transition active:scale-95"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}
