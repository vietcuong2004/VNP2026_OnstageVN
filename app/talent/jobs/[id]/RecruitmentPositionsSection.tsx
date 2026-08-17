import { CheckCircle2, FileText } from "lucide-react";

type RecruitmentPosition = {
  id: string;
  title: string;
  count: number;
  requirements: string[];
};

function sentenceCase(text: string) {
  if (!text) return "";
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

type RecruitmentPositionsSectionProps = {
  positions: RecruitmentPosition[];
  generalRequirements: string[];
  total: number;
};

export default function RecruitmentPositionsSection({ positions, generalRequirements, total }: RecruitmentPositionsSectionProps) {
  if (positions.length === 0 && generalRequirements.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#F0D6D0] bg-white shadow-[0_12px_28px_rgba(143,7,9,0.06)] dark:border-[#1b233a] dark:bg-[#0c101d] dark:shadow-none">
      <div className="flex flex-col gap-2 border-b border-[#F0D6D0] bg-gradient-to-r from-[#FFF7F6] via-white to-[#FFFDFC] p-5 sm:flex-row sm:items-start sm:justify-between dark:border-[#151b2d] dark:from-amber-400/[0.08] dark:via-[#0c101d] dark:to-cyan-400/[0.05]">
        <h4 className="flex items-center gap-2 text-sm font-black text-[#7A1114] uppercase tracking-wider dark:text-white">
          <FileText className="h-4 w-4 text-amber-400" /> Vị trí & Yêu cầu tuyển dụng
        </h4>
      </div>

      <div className="space-y-4 p-5">
        {generalRequirements.length > 0 && (
          <article className="rounded-2xl border border-[#F0D6D0] bg-[#FFF7F6] p-4 transition-colors hover:border-[#C72524]/35 dark:border-amber-400/25 dark:bg-amber-400/[0.04] dark:hover:border-amber-400/35">
            <h5 className="text-base sm:text-lg font-black text-[#8F0709] leading-snug dark:text-amber-300">
              Yêu cầu chung
            </h5>
            <ul className="mt-4 space-y-2 text-xs sm:text-sm text-[#574D54] dark:text-slate-200">
              {generalRequirements.map((item, idx) => (
                <li key={`general-requirement-${idx}`} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <span className="leading-relaxed">{sentenceCase(item)}</span>
                </li>
              ))}
            </ul>
          </article>
        )}

        {positions.map((position) => (
          <article
            key={position.id}
            className="rounded-2xl border border-[#F0D6D0] bg-white p-4 transition-colors hover:border-[#C72524]/30 dark:border-[#232a42] dark:bg-[#090c17] dark:hover:border-amber-400/25"
          >
            <div className="flex items-start justify-between gap-3">
              <h5 className="text-base sm:text-lg font-black text-[#7A1114] leading-snug dark:text-white">
                {position.title}
              </h5>
              <span className="shrink-0 rounded-full border border-[#E8C8C2] bg-[#FFF3F1] px-3 py-1 text-[11px] sm:text-xs font-black text-[#8F0709] dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
                Cần tuyển {position.count} người
              </span>
            </div>

            <div className="mt-4">
              <ul className="space-y-2 text-xs sm:text-sm text-[#574D54] dark:text-slate-200">
                {position.requirements.map((item, idx) => (
                  <li key={`${position.id}-${idx}`} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <span className="leading-relaxed">{sentenceCase(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
