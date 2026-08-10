"use client";

import React from "react";
import { ArrowLeft, X } from "lucide-react";
import BookingTimeFields from "./BookingTimeFields";
import BookingTextarea from "./BookingTextarea";

export type BookingMCFormProps = {
  jobName: string;
  setJobName: (v: string) => void;
  mcJobDescription: string;
  setMcJobDescription: (v: string) => void;
  workDate: string;
  setWorkDate: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  mcLocation: string;
  setMcLocation: (v: string) => void;
  mcLanguage: string;
  setMcLanguage: (v: string) => void;
  mcExperience: string;
  setMcExperience: (v: string) => void;
  extraRequirements: string;
  setExtraRequirements: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
  handleClose: () => void;
};

export default function BookingMCForm({
  jobName,
  setJobName,
  mcJobDescription,
  setMcJobDescription,
  workDate,
  setWorkDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  mcLocation,
  setMcLocation,
  mcLanguage,
  setMcLanguage,
  mcExperience,
  setMcExperience,
  extraRequirements,
  setExtraRequirements,
  onBack,
  onNext,
  handleClose,
}: BookingMCFormProps) {
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
              Yêu cầu MC
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
            <BookingTextarea
              rows={2}
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="Nhập Tiêu đề công việc..."
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-semibold leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Mô tả công việc:
            </label>
            <BookingTextarea
              rows={3}
              value={mcJobDescription}
              onChange={(e) => setMcJobDescription(e.target.value)}
              placeholder="Nhập mô tả công việc (không bắt buộc)"
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

          {/* Địa điểm (WrapText Multiline) */}
          <div className="space-y-1.5 border-b border-white/5 pb-5">
            <label className="block text-xs font-black uppercase tracking-wider text-amber-300">
              Địa điểm
            </label>
            <BookingTextarea
              rows={2}
              value={mcLocation}
              onChange={(e) => setMcLocation(e.target.value)}
              placeholder="Nhập địa điểm sự kiện..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-medium text-white outline-none focus:border-amber-400 placeholder:text-slate-600 resize-none whitespace-pre-wrap break-words leading-relaxed"
            />
          </div>

          {/* Ngôn ngữ */}
          <div className="space-y-1.5 border-b border-white/5 pb-5">
            <label className="block text-xs font-black uppercase tracking-wider text-amber-300">
              Ngôn ngữ
            </label>
            <select
              value={mcLanguage}
              onChange={(e) => setMcLanguage(e.target.value)}
              className="h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 text-xs font-semibold text-white outline-none focus:border-amber-400"
            >
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
              <option value="Song ngữ Việt - Anh">Song ngữ Việt - Anh</option>
              <option value="Tiếng Trung">Tiếng Trung</option>
              <option value="Tiếng Hàn">Tiếng Hàn</option>
              <option value="Tiếng Nhật">Tiếng Nhật</option>
            </select>
          </div>

          {/* Kinh nghiệm */}
          <div className="space-y-1.5 border-b border-white/5 pb-5">
            <label className="block text-xs font-black uppercase tracking-wider text-amber-300">
              Kinh nghiệm
            </label>
            <select
              value={mcExperience}
              onChange={(e) => setMcExperience(e.target.value)}
              className="h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 text-xs font-semibold text-white outline-none focus:border-amber-400"
            >
              <option value="Không yêu cầu">Không yêu cầu</option>
              <option value="Dưới 1 năm">Dưới 1 năm</option>
              <option value="1 - 3 năm">1 - 3 năm</option>
              <option value="3 - 5 năm">3 - 5 năm</option>
              <option value="Trên 5 năm (Sự kiện lớn)">Trên 5 năm (Sự kiện lớn)</option>
            </select>
          </div>

          {/* Ghi chú thêm (WrapText Multiline) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-amber-300 mb-1.5">
              Ghi chú thêm
            </label>
            <BookingTextarea
              rows={3}
              value={extraRequirements}
              onChange={(e) => setExtraRequirements(e.target.value)}
              placeholder="Nhập ghi chú (không bắt buộc)"
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
