"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type TimePickerInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

function normalizeTimeInput(value: string) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{1,2})(?::?(\d{0,2}))?$/);

  if (!match) return "";

  const hour = Math.min(Number(match[1] || 0), 23);
  const minute = Math.min(Number(match[2] || 0), 59);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export default function TimePickerInput({ value, onChange, className }: TimePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const validValue = /^\d{2}:\d{2}$/.test(value) ? value : "00:00";
  const [selectedHour, selectedMinute] = validValue.split(":");
  const hours = useMemo(() => Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0")), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0")), []);

  function chooseTimePart(part: "hour" | "minute", nextValue: string) {
    const nextHour = part === "hour" ? nextValue : selectedHour;
    const nextMinute = part === "minute" ? nextValue : selectedMinute;
    onChange(`${nextHour}:${nextMinute}`);
  }

  function handleManualChange(nextValue: string) {
    const sanitized = nextValue.replace(/[^\d:]/g, "").slice(0, 5);
    onChange(sanitized);
  }

  function handleBlur() {
    const normalized = normalizeTimeInput(value);
    onChange(normalized || validValue);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex w-full items-center gap-2 rounded-2xl border bg-white px-3.5 py-2.5 text-xs text-[#191116] outline-none shadow-sm transition-all focus-within:border-[#8F0709] focus-within:ring-2 focus-within:ring-[#8F0709]/10",
          isOpen ? "border-[#8F0709] ring-2 ring-[#8F0709]/10" : "border-[#F0D7D3]"
        )}
      >
        <input
          type="text"
          value={value}
          onChange={(event) => handleManualChange(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder="08:00"
          inputMode="numeric"
          className="min-w-0 flex-1 bg-transparent font-mono text-xs font-bold text-[#191116] outline-none placeholder:text-[#9A8B88]"
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setIsOpen((open) => !open)}
          className="shrink-0 rounded-md p-0.5 text-[#8F0709] transition hover:bg-[#FFF0EE]"
          aria-label="Chọn giờ"
        >
          <Clock className="h-4 w-4 text-[#8F0709]" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full z-[120] mt-2 w-36 overflow-hidden rounded-2xl border border-[#F0D7D3] bg-white shadow-xl animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150">
          <div className="grid grid-cols-2 border-b border-[#F0D7D3] bg-[#FFF7F6] px-1.5 py-1.5 text-center text-[10px] font-black uppercase tracking-wider text-[#8F0709]">
            <span>Giờ</span>
            <span>Phút</span>
          </div>
          <div className="grid max-h-44 grid-cols-2 overflow-hidden">
            <div className="max-h-44 overflow-y-auto border-r border-[#F0D7D3] p-1 custom-scrollbar">
              {hours.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseTimePart("hour", hour)}
                  className={cn(
                    "flex h-7 w-full items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer",
                    hour === selectedHour
                      ? "bg-[#FAF5E6] text-[#8F0709] border border-[#E5C178]"
                      : "text-[#574D54] hover:bg-[#FFF7F6] hover:text-[#191116]"
                  )}
                >
                  {hour}
                </button>
              ))}
            </div>
            <div className="max-h-44 overflow-y-auto p-1 custom-scrollbar">
              {minutes.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseTimePart("minute", minute)}
                  className={cn(
                    "flex h-7 w-full items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer",
                    minute === selectedMinute
                      ? "bg-[#FAF5E6] text-[#8F0709] border border-[#E5C178]"
                      : "text-[#574D54] hover:bg-[#FFF7F6] hover:text-[#191116]"
                  )}
                >
                  {minute}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setIsOpen(false)}
            className="light-force-white h-8 w-full border-t border-[#F0D7D3] bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-[11px] font-black uppercase tracking-wider !text-white text-white transition hover:brightness-110 cursor-pointer"
          >
            Xong
          </button>
        </div>
      )}
    </div>
  );
}
