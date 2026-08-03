"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, LocateFixed, MapPin, RefreshCw, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";

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
    </div>
  );
}
