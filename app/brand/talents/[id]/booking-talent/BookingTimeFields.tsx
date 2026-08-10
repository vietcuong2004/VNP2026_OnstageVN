"use client";

import React from "react";
import TimePickerInput from "@/components/ui/TimePickerInput";

export type BookingTimeFieldsProps = {
  workDate: string;
  setWorkDate: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
};

const dateInputClassName =
  "h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 text-xs font-semibold text-white outline-none focus:border-amber-400";

export default function BookingTimeFields({
  workDate,
  setWorkDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
}: BookingTimeFieldsProps) {
  return (
    <div className="space-y-3.5 border-b border-white/5 pb-5">
      <label className="block text-xs font-black uppercase tracking-wider text-amber-300">
        Thời gian
      </label>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-bold text-slate-400">
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
