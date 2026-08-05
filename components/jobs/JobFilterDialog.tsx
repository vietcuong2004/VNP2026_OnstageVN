"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "../../lib/utils";

type StageFilter = "apply" | "pending" | "approved" | "all";
type SortOrder = "newest" | "oldest" | "deadline_asc" | "near_me" | "selected_city" | string;

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

        {/* Sắp xếp Card */}
        <div className="relative z-0 p-4 rounded-3xl border border-white/5 bg-[#0b0e1a]/85 backdrop-blur-sm space-y-3 shadow-md shadow-black/10">
          <span className="block text-[11px] font-black uppercase tracking-wider text-[#C9A86A]">
            SẮP XẾP
          </span>
          <div className="space-y-2">
            {[
              { value: "deadline_asc", label: "Hạn tuyển gần nhất" },
              { value: "near_me", label: "Gần vị trí hiện tại" },
              { value: "selected_city", label: "Gần thành phố đã chọn" },
            ].map((option) => {
              const isActive =
                sortOrder === option.value ||
                (sortOrder === "newest" && option.value === "deadline_asc");
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSortOrder(option.value as SortOrder)}
                  className={cn(
                    "w-full px-4 py-3 rounded-2xl border text-xs md:text-sm font-semibold flex items-center justify-between transition-all cursor-pointer text-left",
                    isActive
                      ? "border-[#C9A86A] bg-[#C9A86A]/10 text-[#C9A86A] font-bold shadow-[0_0_12px_rgba(201,168,106,0.12)]"
                      : "border-white/10 bg-[#070913]/60 text-slate-300 hover:border-white/20 hover:text-white"
                  )}
                >
                  <span>{option.label}</span>
                  {isActive && <Check className="h-4 w-4 text-[#C9A86A] shrink-0 stroke-[3px]" />}
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
    </div>
  );
}
