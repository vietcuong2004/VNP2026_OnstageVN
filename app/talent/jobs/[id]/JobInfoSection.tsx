import { Award, Calendar, CheckCircle2, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

function sentenceCase(text: string) {
  if (!text) return "";
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

type JobInfoSectionProps = {
  job: any;
  benefits: string[];
  startText: string;
  endText: string;
  showAllBenefits: boolean;
  onToggleBenefits: () => void;
};

export default function JobInfoSection({
  job,
  benefits,
  startText,
  endText,
  showAllBenefits,
  onToggleBenefits,
}: JobInfoSectionProps) {
  const onstageTime = job.onstageTime || job.onstage_time || job.eventTime || job.event_time || "";

  return (
    <div className="rounded-2xl border border-[#F0D6D0] bg-white p-5 space-y-4 shadow-[0_12px_28px_rgba(143,7,9,0.06)] dark:border-[#1b233a] dark:bg-[#0c101d] dark:shadow-none">
      <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#7A1114] uppercase tracking-wider border-b border-[#F0D6D0] pb-2.5 dark:border-[#151b2d] dark:text-white">
        <Layers className="h-4 w-4 text-amber-400" /> Thông tin công việc
      </h4>

      <PillSection
        title="Lĩnh vực công việc"
        items={job.industries?.length > 0 ? job.industries : ["Không có"]}
        className="border-amber-400/20 bg-amber-400/10 text-amber-300"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-[#574D54] dark:text-slate-300">
          <Calendar className="h-4 w-4 text-[#B9861B] shrink-0 dark:text-slate-400" />
          <span className="text-[#574D54] font-medium dark:text-slate-400">Bắt đầu:</span>
          <span className="font-semibold text-[#191116] dark:text-slate-100">{startText}</span>
        </div>
        <div className="flex items-center gap-2 text-[#574D54] dark:text-slate-300">
          <Calendar className="h-4 w-4 text-[#B9861B] shrink-0 dark:text-slate-400" />
          <span className="text-[#574D54] font-medium dark:text-slate-400">Kết thúc:</span>
          <span className="font-semibold text-[#191116] dark:text-slate-100">{endText}</span>
        </div>
        {onstageTime ? (
          <div className="flex items-center gap-2 text-[#574D54] dark:text-slate-300">
            <Calendar className="h-4 w-4 text-[#B9861B] shrink-0 dark:text-slate-400" />
            <span className="text-[#574D54] font-medium dark:text-slate-400">Th?i gian onstage:</span>
            <span className="font-semibold text-[#191116] dark:text-slate-100">{onstageTime}</span>
          </div>
        ) : null}
      </div>

      <div className="space-y-2 pt-2 border-t border-[#F0D6D0] dark:border-[#151b2d]">
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#8F0709] dark:text-slate-400">Đầu việc chính</p>
        {job.responsibilities?.length > 0 ? (
          <ul className="space-y-1.5 text-xs sm:text-sm text-[#574D54] dark:text-slate-200">
            {job.responsibilities.slice(0, 5).map((item: string, idx: number) => (
              <li key={`${item}-${idx}`} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{sentenceCase(item)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs sm:text-sm text-[#8D8088] font-normal dark:text-slate-400">Không có</p>
        )}
      </div>

      <div className="space-y-2 pt-2 border-t border-[#F0D6D0] dark:border-[#151b2d]">
        <p className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#8F0709] dark:text-slate-400">
          <Award className="h-4 w-4 text-emerald-400" /> Quyền lợi & Đãi ngộ
        </p>
        {benefits.length > 0 ? (
          <>
            <ul className="space-y-2 text-xs sm:text-sm text-[#574D54] dark:text-slate-200">
              {(showAllBenefits ? benefits : benefits.slice(0, 5)).map((benefit: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                  <span>{sentenceCase(benefit)}</span>
                </li>
              ))}
            </ul>
            {benefits.length > 5 && (
              <button
                type="button"
                onClick={onToggleBenefits}
                className="flex items-center gap-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#8F0709] hover:text-[#C72524] transition-colors pt-1 cursor-pointer dark:text-amber-300 dark:hover:text-amber-200"
              >
                {showAllBenefits ? (
                  <>Thu gọn <ChevronUp className="h-3.5 w-3.5" /></>
                ) : (
                  <>Xem thêm {benefits.length - 5} phúc lợi <ChevronDown className="h-3.5 w-3.5" /></>
                )}
              </button>
            )}
          </>
        ) : (
          <p className="text-xs sm:text-sm text-[#8D8088] font-normal dark:text-slate-400">Không có</p>
        )}
      </div>
    </div>
  );
}

function PillSection({ title, items, className }: { title: string; items: string[]; className: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#8F0709] dark:text-slate-400">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <span key={`${item}-${idx}`} className={cn("rounded-lg border px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider", className)}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
