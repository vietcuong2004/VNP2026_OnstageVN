"use client";

import React from "react";
import { ArrowLeft, X } from "lucide-react";
import BookingTimeFields from "./BookingTimeFields";
import TextArea from "@/components/ui/TextArea";

export type BookingPGFormProps = {
  jobName: string;
  setJobName: (v: string) => void;
  pgJobDescription: string;
  setPgJobDescription: (v: string) => void;
  workDate: string;
  setWorkDate: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
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
  workDate,
  setWorkDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
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
    <div className="h-full w-full animate-in fade-in duration-300">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#070913]">

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
              Yêu cầu PG/PB
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
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 pb-8 text-left sm:p-7 sm:pb-10">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Tiêu đề công việc:
            </label>
            <TextArea
              rows={2}
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="Nhập Tiêu đề công việc..."
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-semibold leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Mô tả công việc PG/PB:
            </label>
            <TextArea
              rows={3}
              value={pgJobDescription}
              onChange={(e) => setPgJobDescription(e.target.value)}
              placeholder="Nhập mô tả nhiệm vụ (đón khách, phát quà, tư vấn...)"
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-semibold leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          {/* Thời gian */}
          <BookingTimeFields
            workDate={workDate}
            setWorkDate={setWorkDate}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
          />

          {/* Trang phục */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Yêu cầu trang phục:
            </label>
            <input
              type="text"
              value={pgOutfit}
              onChange={(e) => setPgOutfit(e.target.value)}
              placeholder="Váy dạ hội, áo dài, đồng phục Brand..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs font-semibold text-white outline-none focus:border-amber-400"
            />
          </div>

          {/* Kỹ năng */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#C9A86A]">
              Kỹ năng / Ngoại hình:
            </label>
            <input
              type="text"
              value={pgSkills}
              onChange={(e) => setPgSkills(e.target.value)}
              placeholder="Giao tiếp tốt, cao 1m68 trở lên..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs font-semibold text-white outline-none focus:border-[#C9A86A]"
            />
          </div>

          {/* Yêu cầu thêm */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Yêu cầu thêm:
            </label>
            <TextArea
              rows={3}
              value={extraRequirements}
              onChange={(e) => setExtraRequirements(e.target.value)}
              placeholder="Ghi chú thêm nếu có..."
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-semibold leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>
        </div>

        {/* ── Fixed Footer ── */}
        <div className="z-20 shrink-0 border-t border-white/10 bg-[#070913]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md sm:p-5">
          <button
            type="button"
            onClick={onNext}
            className="flex h-13 w-full cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_4px_25px_rgba(245,158,11,0.35)] transition-all hover:brightness-110 active:scale-[0.98] md:text-sm"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}
