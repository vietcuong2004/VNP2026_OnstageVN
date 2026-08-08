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
        "rounded-3xl border border-amber-400/20 bg-slate-950/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:col-span-2",
        className
      )}
    >
      <div className="space-y-2">
        <p className="text-[12px] font-black uppercase tracking-wider text-amber-300">
          Chi phí cho mỗi Idol
        </p>
        <p className="text-sm font-semibold leading-relaxed text-slate-200">
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
          <span className="hidden pb-3 text-lg font-black text-amber-300 sm:block">→</span>
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
        "flex h-12 items-center gap-3 rounded-2xl border px-4 text-left text-sm font-black transition-all",
        checked
          ? "border-amber-300 bg-amber-300/10 text-amber-200 shadow-[0_0_18px_rgba(250,204,21,0.14)]"
          : "border-slate-700/80 bg-slate-900/80 text-slate-300 hover:border-amber-300/50 hover:text-white"
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          checked ? "border-amber-300" : "border-slate-500"
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-amber-300" />}
      </span>
      <span>{label}</span>
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
      <span className="block text-[11px] font-black uppercase tracking-wider text-slate-300">
        {label}
      </span>
      <div className="flex h-12 min-w-0 items-center rounded-2xl border border-slate-700/80 bg-slate-900/90 px-3.5 shadow-inner transition-all focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 hover:border-slate-600">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-100 outline-none placeholder:text-slate-500"
          placeholder={placeholder}
          inputMode="numeric"
        />
        {suffix && (
          <span className="ml-2 hidden shrink-0 text-[11px] font-black uppercase tracking-wide text-amber-300 sm:inline">
            {suffix}
          </span>
        )}
      </div>
      {suffix && (
        <span className="block text-[10px] font-bold uppercase tracking-wide text-amber-300 sm:hidden">
          {suffix}
        </span>
      )}
    </label>
  );
}
