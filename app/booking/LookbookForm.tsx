"use client";

import React from "react";
import { ArrowLeft, X } from "lucide-react";
import TimeFields from "./TimeFields";
import TextArea from "@/components/ui/TextArea";

export type LookbookFormProps = {
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
  lookbookLooks: string;
  setLookbookLooks: (v: string) => void;
  extraRequirements: string;
  setExtraRequirements: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
  handleClose: () => void;
};

export default function LookbookForm({
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
  lookbookLooks,
  setLookbookLooks,
  extraRequirements,
  setExtraRequirements,
  onBack,
  onNext,
  handleClose,
}: LookbookFormProps) {
  const styleSuggestions = [
    "Sang trọng & Dạ hội",
    "Thời trang đường phố",
    "Công sở & Elegance",
    "Ánh sáng tự nhiên",
    "Thể thao & Dynamic",
  ];

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
              Yêu cầu Chụp Lookbook
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

          {/* Chủ đề / Concept (ngay dưới Tiêu đề công việc) */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Chủ đề / Concept:
            </label>
            <TextArea
              rows={2}
              value={lookbookTopic}
              onChange={(e) => setLookbookTopic(e.target.value)}
              placeholder="Thời trang công sở, BST mùa hè..."
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-semibold leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          {/* Thời gian */}
          <TimeFields
            workDate={workDate}
            setWorkDate={setWorkDate}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
          />

          {/* Địa điểm (dùng TextArea.tsx) */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Địa điểm:
            </label>
            <TextArea
              rows={2}
              value={lookbookLocation}
              onChange={(e) => setLookbookLocation(e.target.value)}
              placeholder="Nhập địa điểm chụp, tên Studio hoặc địa điểm ngoại cảnh..."
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-semibold leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          {/* Số lượng look */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Số lượng look:
            </label>
            <select
              value={lookbookLooks}
              onChange={(e) => setLookbookLooks(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs font-semibold text-white outline-none focus:border-amber-400"
            >
              <option value="20 - 30 ảnh">20 - 30 ảnh</option>
              <option value="10 - 20 look">10 - 20 look</option>
              <option value="20 - 30 look">20 - 30 look</option>
              <option value="30 - 50 look">30 - 50 look</option>
              <option value="Không giới hạn">Không giới hạn</option>
            </select>
          </div>

          {/* Phong cách mong muốn / Yêu cầu khác */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Yêu cầu khác / Phong cách:
            </label>
            <input
              type="text"
              value={lookbookStyle}
              onChange={(e) => setLookbookStyle(e.target.value)}
              placeholder="Nhập hoặc chọn yêu cầu..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs font-semibold text-white outline-none focus:border-amber-400"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {styleSuggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLookbookStyle(item)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:border-amber-400/50 hover:text-amber-300"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Ghi chú thêm */}
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
