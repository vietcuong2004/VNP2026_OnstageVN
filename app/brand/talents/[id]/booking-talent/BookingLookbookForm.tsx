"use client";

import React from "react";
import { ArrowLeft, X } from "lucide-react";
import BookingTimeFields from "./BookingTimeFields";
import BookingTextarea from "./BookingTextarea";

export type BookingLookbookFormProps = {
  jobName: string;
  setJobName: (v: string) => void;
  workDate: string;
  setWorkDate: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  lookbookTopic: string;
  setLookbookTopic: (v: string) => void;
  lookbookStyle: string;
  setLookbookStyle: (v: string) => void;
  lookbookLocation: string;
  setLookbookLocation: (v: string) => void;
  extraRequirements: string;
  setExtraRequirements: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
  handleClose: () => void;
};

export default function BookingLookbookForm({
  jobName,
  setJobName,
  workDate,
  setWorkDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  lookbookTopic,
  setLookbookTopic,
  lookbookStyle,
  setLookbookStyle,
  lookbookLocation,
  setLookbookLocation,
  extraRequirements,
  setExtraRequirements,
  onBack,
  onNext,
  handleClose,
}: BookingLookbookFormProps) {
  const styleSuggestions = [
    "Sang trọng & Dạ hội",
    "Thời trang đường phố",
    "Công sở & Elegance",
    "Thể thao & Dynamic",
  ];

  return (
    <div className="h-dvh w-full animate-in fade-in duration-300">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-[#070913]">

        {/* ── Fixed Header ── */}
        <div className="z-20 flex h-[88px] shrink-0 items-center justify-between border-b border-white/10 bg-[#070913]/95 px-5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-300 transition hover:bg-white/10 active:scale-95"
              title="Quay lại"
            >
              <ArrowLeft className="h-5 w-5 text-amber-400" />
            </button>
            <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
              Yêu cầu chi tiết - Lookbook
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-slate-300 transition hover:bg-white/15 hover:text-white active:scale-95"
            title="Thoát"
          >
            <X className="h-5 w-5 text-amber-400" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 pb-8 text-left sm:p-7 sm:pb-10">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Tiêu đề công việc:
            </label>
            <BookingTextarea
              rows={2}
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="Nhập Tiêu đề công việc..."
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-semibold leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          {/* Chủ đề */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-amber-300 mb-1.5">
              Chủ đề:
            </label>
            <BookingTextarea
              rows={2}
              value={lookbookTopic}
              onChange={(e) => setLookbookTopic(e.target.value)}
              placeholder="Nhập chủ đề cần chụp/quay"
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-medium text-white outline-none focus:border-amber-400 placeholder:text-slate-600 resize-none whitespace-pre-wrap break-words leading-relaxed"
            />
          </div>

          <BookingTimeFields
            workDate={workDate}
            setWorkDate={setWorkDate}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Phong cách */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-amber-300 mb-1.5">
                Phong cách:
              </label>
              <input
                type="text"
                value={lookbookStyle}
                onChange={(e) => setLookbookStyle(e.target.value)}
                placeholder="Nhập phong cách hoặc chọn gợi ý..."
                className="h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-xs font-semibold text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
              />
              <datalist id="lookbook-style-suggestions">
                <option value="Sang trọng & Dạ hội">Sang trọng & Dạ hội</option>
                <option value="Thời trang đường phố">Thời trang đường phố</option>
                <option value="Công sở & Elegance">Công sở & Elegance</option>
                <option value="Thể thao & Dynamic">Thể thao & Dynamic</option>
              </datalist>
              <div className="mt-2 flex flex-wrap gap-2">
                {styleSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setLookbookStyle(suggestion)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-slate-300 transition hover:border-amber-400/50 hover:text-amber-200 active:scale-95"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Địa điểm (tùy chọn) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-amber-300 mb-1.5">
                Địa điểm (tùy chọn):
              </label>
              <BookingTextarea
                rows={2}
                value={lookbookLocation}
                onChange={(e) => setLookbookLocation(e.target.value)}
                placeholder="Nhập địa điểm studio/outdoor"
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-medium text-white outline-none focus:border-amber-400 placeholder:text-slate-600 resize-none whitespace-pre-wrap break-words leading-relaxed"
              />
            </div>
          </div>

          {/* Yêu cầu thêm (tùy chọn) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-amber-300 mb-1.5">
              Yêu cầu thêm (tùy chọn):
            </label>
            <BookingTextarea
              rows={3}
              value={extraRequirements}
              onChange={(e) => setExtraRequirements(e.target.value)}
              placeholder="Ví dụ: Số lượng bộ trang phục, thợ trang điểm..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-medium text-white outline-none focus:border-amber-400 placeholder:text-slate-600 resize-none whitespace-pre-wrap break-words leading-relaxed"
            />
          </div>
        </div>

        {/* ── Fixed Footer ── */}
        <div className="z-20 shrink-0 border-t border-white/10 bg-[#070913]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md sm:p-5">
          <button
            type="button"
            onClick={onNext}
            className="w-full h-13 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-slate-950 text-xs md:text-sm font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_25px_rgba(245,158,11,0.35)]"
          >
            Tiếp theo
          </button>
        </div>

      </div>
    </div>
  );
}
