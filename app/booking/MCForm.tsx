"use client";

import React from "react";
import { ArrowLeft, X } from "lucide-react";
import TimeFields from "./TimeFields";
import TextArea from "@/components/ui/TextArea";
import { cn } from "@/lib/utils";

export type MCFormProps = {
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
  mcGender: string;
  setMcGender: (v: string) => void;
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

export default function MCForm({
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
  mcGender,
  setMcGender,
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
}: MCFormProps) {
  const genderOptions = ["Nam", "Nữ", "Không yêu cầu"];

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
              Mô tả công việc:
            </label>
            <TextArea
              rows={3}
              value={mcJobDescription}
              onChange={(e) => setMcJobDescription(e.target.value)}
              placeholder="Nhập mô tả công việc (không bắt buộc)"
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-semibold leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          {/* Thời lượng & Thời gian */}
          <TimeFields
            workDate={workDate}
            setWorkDate={setWorkDate}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
          />

          {/* Giới tính */}
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-amber-300">
              Giới tính:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {genderOptions.map((g) => {
                const active = mcGender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setMcGender(g)}
                    className={cn(
                      "flex h-11 items-center justify-center rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer",
                      active
                        ? "border-amber-400 bg-amber-400/15 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                        : "border-white/10 bg-slate-950 text-slate-400 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ngôn ngữ dẫn */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Ngôn ngữ dẫn:
            </label>
            <select
              value={mcLanguage}
              onChange={(e) => setMcLanguage(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs font-semibold text-white outline-none focus:border-amber-400"
            >
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="Song ngữ Việt - Anh">Song ngữ Việt - Anh</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
              <option value="Tiếng Trung">Tiếng Trung</option>
              <option value="Tiếng Hàn">Tiếng Hàn</option>
              <option value="Tiếng Nhật">Tiếng Nhật</option>
            </select>
          </div>

          {/* Kinh nghiệm */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Kinh nghiệm:
            </label>
            <select
              value={mcExperience}
              onChange={(e) => setMcExperience(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs font-semibold text-white outline-none focus:border-amber-400"
            >
              <option value="Không yêu cầu">Không yêu cầu</option>
              <option value="Dưới 1 năm">Dưới 1 năm</option>
              <option value="1 - 3 năm">1 - 3 năm</option>
              <option value="Trên 3 năm">Trên 3 năm</option>
            </select>
          </div>

          {/* Địa điểm làm việc */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Địa điểm làm việc:
            </label>
            <TextArea
              rows={2}
              value={mcLocation}
              onChange={(e) => setMcLocation(e.target.value)}
              placeholder="Nhập địa điểm làm việc..."
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-semibold leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          {/* Ghi chú thêm / Yêu cầu thêm */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Ghi chú thêm:
            </label>
            <TextArea
              rows={3}
              value={extraRequirements}
              onChange={(e) => setExtraRequirements(e.target.value)}
              placeholder="Nhập ghi chú (không bắt buộc)"
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-semibold leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>
        </div>

        {/* ── Fixed Footer ── */}
        <div className="z-20 shrink-0 border-t border-white/10 bg-[#070913]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md sm:p-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 h-13 rounded-2xl border border-white/15 bg-white/5 text-xs md:text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4 text-amber-400" />
              Bước trước
            </button>
            <button
              type="button"
              onClick={onNext}
              className="flex-1 h-13 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_4px_25px_rgba(245,158,11,0.35)] transition-all hover:brightness-110 active:scale-[0.98] md:text-sm"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
