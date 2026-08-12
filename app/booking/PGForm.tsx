"use client";

import React from "react";
import { ArrowLeft, X } from "lucide-react";
import TimeFields from "./TimeFields";
import TextArea from "@/components/ui/TextArea";

export type PGFormProps = {
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
  pgHeight: string;
  setPgHeight: (v: string) => void;
  pgWeight: string;
  setPgWeight: (v: string) => void;
  pgAppearance: string;
  setPgAppearance: (v: string) => void;
  pgOutfit: string;
  setPgOutfit: (v: string) => void;
  pgExperience: string;
  setPgExperience: (v: string) => void;
  pgSkills: string;
  setPgSkills: (v: string) => void;
  extraRequirements: string;
  setExtraRequirements: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
  handleClose: () => void;
};

export default function PGForm({
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
  pgHeight,
  setPgHeight,
  pgWeight,
  setPgWeight,
  pgAppearance,
  setPgAppearance,
  pgOutfit,
  setPgOutfit,
  pgExperience,
  setPgExperience,
  pgSkills,
  setPgSkills,
  extraRequirements,
  setExtraRequirements,
  onBack,
  onNext,
  handleClose,
}: PGFormProps) {
  const outfitSuggestions = [
    "Áo dài / Trang phục truyền thống",
    "Đầm sự kiện / Dạ hội sang trọng",
    "Đồng phục doanh nghiệp / PG Brand",
    "Trang phục năng động / Thể thao",
    "Tự do / Khác",
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
              Yêu cầu PG / PB
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
              value={pgJobDescription}
              onChange={(e) => setPgJobDescription(e.target.value)}
              placeholder="Nhập mô tả nhiệm vụ (đón khách, phát quà, tư vấn...)"
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

          {/* Ngoại hình section */}
          <div className="space-y-3.5 border-b border-white/5 pb-5">
            <label className="block text-xs font-black uppercase tracking-wider text-amber-300">
              Yêu cầu ngoại hình
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-400">
                  Chiều cao
                </label>
                <select
                  value={pgHeight}
                  onChange={(e) => setPgHeight(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs font-semibold text-white outline-none focus:border-amber-400"
                >
                  <option value="Không yêu cầu">Không yêu cầu</option>
                  <option value="155 - 160 cm">155 - 160 cm</option>
                  <option value="160 - 168 cm">160 - 168 cm</option>
                  <option value="168 - 175 cm">168 - 175 cm</option>
                  <option value="> 175 cm">&gt; 175 cm</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-400">
                  Cân nặng
                </label>
                <select
                  value={pgWeight}
                  onChange={(e) => setPgWeight(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs font-semibold text-white outline-none focus:border-amber-400"
                >
                  <option value="Không yêu cầu">Không yêu cầu</option>
                  <option value="40 - 45 kg">40 - 45 kg</option>
                  <option value="45 - 55 kg">45 - 55 kg</option>
                  <option value="55 - 65 kg">55 - 65 kg</option>
                  <option value="> 65 kg">&gt; 65 kg</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-400">
                Gương mặt / Ngoại hình
              </label>
              <TextArea
                rows={2}
                value={pgAppearance}
                onChange={(e) => setPgAppearance(e.target.value)}
                placeholder="Nhập yêu cầu về gương mặt, ngoại hình (ví dụ: Ưa nhìn, năng động...)"
                className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3 text-xs font-semibold leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
              />
            </div>
          </div>

          {/* Trang phục yêu cầu */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Trang phục yêu cầu:
            </label>
            <input
              type="text"
              value={pgOutfit}
              onChange={(e) => setPgOutfit(e.target.value)}
              placeholder="Váy trắng, giày cao gót, đồng phục Brand..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs font-semibold text-white outline-none focus:border-amber-400"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {outfitSuggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPgOutfit(item)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:border-amber-400/50 hover:text-amber-300"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Kinh nghiệm */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Kinh nghiệm:
            </label>
            <TextArea
              rows={2}
              value={pgExperience}
              onChange={(e) => setPgExperience(e.target.value)}
              placeholder="Nhập yêu cầu kinh nghiệm (ví dụ: Đã từng làm PG/PB, kinh nghiệm > 1 năm...)"
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-semibold leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          {/* Kỹ năng */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
              Kỹ năng:
            </label>
            <TextArea
              rows={2}
              value={pgSkills}
              onChange={(e) => setPgSkills(e.target.value)}
              placeholder="Giao tiếp tốt, ứng biến nhanh..."
              className="w-full resize-none whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-slate-950 p-3.5 text-xs font-semibold leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-amber-400"
            />
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
