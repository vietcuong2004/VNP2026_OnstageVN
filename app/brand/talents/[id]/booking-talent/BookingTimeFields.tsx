"use client";

import React from "react";
import TimePickerInput from "@/components/ui/TimePickerInput";

export type BookingTimeFieldsProps = {
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
  setWorkDate?: (value: string) => void;
};

const dateInputClassName =
  "h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 text-xs font-semibold text-white outline-none focus:border-amber-400";

function splitDateTime(value: string) {
  const [date = "", time = ""] = value.split("T");
  return { date, time };
}

function joinDateTime(date: string, time: string) {
  if (!date && !time) return "";
  return `${date || ""}T${time || ""}`;
}

export default function BookingTimeFields({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  setWorkDate,
}: BookingTimeFieldsProps) {
  const start = splitDateTime(startTime);
  const end = splitDateTime(endTime);

  return (
    <div className="space-y-3.5 border-b border-white/5 pb-5">
      <label className="block text-xs font-black uppercase tracking-wider text-amber-300">
        Thời gian
      </label>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-bold text-slate-400">
            Thời gian bắt đầu
          </label>
          <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
            <input
              type="date"
              value={start.date}
              onChange={(e) => {
                setStartTime(joinDateTime(e.target.value, start.time));
                setWorkDate?.(e.target.value);
              }}
              className={dateInputClassName}
            />
            <TimePickerInput
              value={start.time || "00:00"}
              onChange={(value) => setStartTime(joinDateTime(start.date, value))}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold text-slate-400">
            Thời gian kết thúc
          </label>
          <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
            <input
              type="date"
              value={end.date}
              onChange={(e) => setEndTime(joinDateTime(e.target.value, end.time))}
              className={dateInputClassName}
            />
            <TimePickerInput
              value={end.time || "00:00"}
              onChange={(value) => setEndTime(joinDateTime(end.date, value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
