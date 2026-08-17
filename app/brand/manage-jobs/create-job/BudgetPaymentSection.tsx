"use client";

import { cn } from "@/lib/utils";

type BudgetPaymentSectionProps = {
  budgetFrom: string;
  budgetTo: string;
  budgetNegotiable: boolean;
  onNegotiableChange: (checked: boolean) => void;
  onBudgetFromChange: (value: string) => void;
  onBudgetToChange: (value: string) => void;
  className?: string;
};

export default function BudgetPaymentSection({
  budgetFrom,
  budgetTo,
  budgetNegotiable,
  onNegotiableChange,
  onBudgetFromChange,
  onBudgetToChange,
  className,
}: BudgetPaymentSectionProps) {
  const isRangeMode = !budgetNegotiable;

  return (
    <section
      className={cn(
        "rounded-3xl border border-[#F0D7D3] bg-white p-4 text-[#191116] shadow-sm sm:col-span-2",
        className
      )}
    >
      <div className="space-y-1.5">
        <p className="text-xs font-black uppercase tracking-wider text-[#8F0709]">
          CHI PHÍ CHO MỖI IDOL:
        </p>
        <p className="text-xs font-semibold leading-relaxed text-[#574D54]">
          Bạn dự kiến trả bao nhiêu cho 1 Idol trong 1 ngày làm việc?
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BudgetModeOption
          label="Nhập khoảng chi trả"
          checked={isRangeMode}
          onClick={() => onNegotiableChange(false)}
        />
        <BudgetModeOption
          label="Thỏa thuận"
          checked={budgetNegotiable}
          onClick={() => onNegotiableChange(true)}
        />
      </div>

      {isRangeMode && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end sm:gap-4">
          <BudgetAmountInput
            label="Từ"
            value={budgetFrom}
            placeholder="700.000"
            onChange={onBudgetFromChange}
          />
          <span className="hidden pb-3 text-lg font-black text-[#8F0709] sm:block">→</span>
          <BudgetAmountInput
            label="Đến"
            value={budgetTo}
            placeholder="1.000.000"
            onChange={onBudgetToChange}
            suffix="VNĐ/người/ngày"
          />
        </div>
      )}
    </section>
  );
}

function BudgetModeOption({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-12 items-center gap-3 rounded-2xl border px-4 text-left text-xs font-bold transition-all cursor-pointer",
        checked
          ? "border-[#E5C178] bg-[#FAF5E6] text-[#8F0709] shadow-sm"
          : "border-[#F0D7D3] bg-white text-[#574D54] hover:border-[#8F0709]/40 hover:text-[#191116]"
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          checked ? "border-[#8F0709]" : "border-[#F0D7D3]"
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-[#8F0709]" />}
      </span>
      <span className={cn(checked ? "text-[#8F0709]" : "text-[#574D54]")}>
        {label}
      </span>
    </button>
  );
}

function BudgetAmountInput({
  label,
  value,
  placeholder,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  suffix?: string;
}) {
  return (
    <label className="min-w-0 space-y-1.5">
      <span className="block text-xs font-semibold text-[#574D54]">
        {label}
      </span>
      <div className="flex h-12 min-w-0 items-center rounded-2xl border border-[#F0D7D3] bg-white px-3.5 shadow-sm transition-all focus-within:border-[#8F0709] focus-within:ring-2 focus-within:ring-[#8F0709]/10">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-xs font-bold text-[#191116] outline-none placeholder:text-[#9A8B88]"
          placeholder={placeholder}
          inputMode="numeric"
        />
        {suffix && (
          <span className="ml-2 hidden shrink-0 text-[11px] font-bold uppercase tracking-wide text-[#8F0709] sm:inline">
            {suffix}
          </span>
        )}
      </div>
      {suffix && (
        <span className="block text-[10px] font-bold uppercase tracking-wide text-[#8F0709] sm:hidden">
          {suffix}
        </span>
      )}
    </label>
  );
}
