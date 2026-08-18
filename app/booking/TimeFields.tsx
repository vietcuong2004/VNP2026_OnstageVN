"use client";

import React from "react";
import TimePickerInput from "@/components/ui/TimePickerInput";

export type TimeFieldsProps = {
  workDate: string;
  setWorkDate: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
};

const dateInputClassName =
  "h-12 w-full rounded-xl border border-[#F0D7D3] bg-white px-3.5 text-xs font-semibold text-[#191116] outline-none shadow-xs transition-all hover:border-[#8F0709]/40 focus:border-[#8F0709] focus:ring-2 focus:ring-[#8F0709]/20 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:border-amber-400";

export default function TimeFields({
  workDate,
  setWorkDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
}: TimeFieldsProps) {
  return (
    <div className="space-y-3.5 border-b border-[#F0D7D3]/60 pb-5 dark:border-white/5">
      <label className="block text-xs font-black uppercase tracking-wider text-[#8F0709] dark:text-amber-300">
        Thời gian
      </label>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-bold text-[#574D54] dark:text-slate-400">
            Ngày làm việc
          </label>
          <input
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            className={dateInputClassName}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <label className="mb-1 block text-[11px] font-bold text-slate-400">
              Giờ bắt đầu
            </label>
            <TimePickerInput value={startTime || "00:00"} onChange={setStartTime} />
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-[11px] font-bold text-slate-400">
              Giờ kết thúc
            </label>
            <TimePickerInput value={endTime || "00:00"} onChange={setEndTime} />
          </div>
        </div>
      </div>
    </div>
  );
}
