"use client";

import React from "react";
import { ArrowLeft, X } from "lucide-react";
import BookingTimeFields from "./BookingTimeFields";

export type BookingPGFormProps = {
  jobName: string;
  setJobName: (v: string) => void;
  pgJobDescription: string;
  setPgJobDescription: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  setWorkDate: (v: string) => void;
  pgOutfit: string;
  setPgOutfit: (v: string) => void;
  pgSkills: string;
  setPgSkills: (v: string) => void;
  extraRequirements: string;
  setExtraRequirements: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
  handleClose: () => void;
};

export default function BookingPGForm({
  jobName,
  setJobName,
  pgJobDescription,
  setPgJobDescription,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  setWorkDate,
  pgOutfit,
  setPgOutfit,
  pgSkills,
  setPgSkills,
  extraRequirements,
  setExtraRequirements,
  onBack,
  onNext,
  handleClose,
}: BookingPGFormProps) {
  return (
    <div className="h-dvh w-full animate-in fade-in duration-300">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-[#070913]">
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
            <h2 className="text-lg font-black tracking-tight text-white md:text-xl">
              Yêu cầu chi tiết - PG
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

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 pb-8 text-left sm:p-7 sm:pb-10">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Tên công việc:
            </label>
            <textarea
              rows={2}
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="Nhập tên công việc..."
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-semibold leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Mô tả công việc:
            </label>
            <textarea
              rows={3}
              value={pgJobDescription}
              onChange={(e) => setPgJobDescription(e.target.value)}
              placeholder="Nhập mô tả công việc (không bắt buộc)"
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-medium leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          <BookingTimeFields
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            setWorkDate={setWorkDate}
          />

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Trang phục:
            </label>
            <textarea
              rows={2}
              value={pgOutfit}
              onChange={(e) => setPgOutfit(e.target.value)}
              placeholder="Mô tả trang phục yêu cầu..."
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-medium leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Kỹ năng (tùy chọn):
            </label>
            <textarea
              rows={2}
              value={pgSkills}
              onChange={(e) => setPgSkills(e.target.value)}
              placeholder="Ví dụ: Giao tiếp tốt, ngoại ngữ, đứng booth..."
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-medium leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Yêu cầu thêm (tùy chọn):
            </label>
            <textarea
              rows={3}
              value={extraRequirements}
              onChange={(e) => setExtraRequirements(e.target.value)}
              placeholder="Ví dụ: Kinh nghiệm dự sự kiện lớn, yêu cầu khác..."
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-medium leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>
        </div>

        <div className="z-20 shrink-0 border-t border-white/10 bg-[#070913]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md sm:p-5">
          <button
            type="button"
            onClick={onNext}
            className="flex h-13 w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_4px_25px_rgba(245,158,11,0.35)] transition-all hover:brightness-110 active:scale-[0.98] md:text-sm"
          >
            Tiếp theo
          </button>
        </div>
      </div>
    </div>
  );
}
