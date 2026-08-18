"use client";

import { cn } from "@/lib/utils";

type KeywordSuggestion = {
  label: string;
  meta?: string;
  query?: string;
  searchQuery?: string;
  type?: string;
  city?: string;
};

type KeywordSuggestionsDropdownProps = {
  open: boolean;
  suggestions: KeywordSuggestion[];
  onPick: (suggestion: KeywordSuggestion) => void;
  className?: string;
};

export default function KeywordSuggestionsDropdown({
  open,
  suggestions,
  onPick,
  className,
}: KeywordSuggestionsDropdownProps) {
  if (!open || suggestions.length === 0) return null;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 top-full z-[95] mt-2 overflow-hidden rounded-2xl border border-[#F0D7D3] bg-white p-1.5 shadow-xl dark:border-[#C9A86A]/25 dark:bg-[#070913] text-left",
        className,
      )}
    >
      <div className="px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#8F0709] dark:text-[#C9A86A]">
        Gợi ý tìm kiếm
      </div>
      <div className="max-h-72 overflow-y-auto space-y-1">
        {suggestions.map((suggestion) => (
          <button
            key={`${suggestion.label}-${suggestion.meta || "suggest"}`}
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              onPick(suggestion);
            }}
            className="flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-left transition hover:bg-[#FFF0EE] focus:bg-[#FFF0EE] focus:outline-none dark:hover:bg-[#C9A86A]/12 dark:focus:bg-[#C9A86A]/12"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-[#191116] dark:text-white">{suggestion.label}</span>
              {suggestion.meta && (
                <span className="mt-0.5 block truncate text-[10px] font-semibold text-[#574D54] dark:text-slate-400">
                  {suggestion.meta}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
