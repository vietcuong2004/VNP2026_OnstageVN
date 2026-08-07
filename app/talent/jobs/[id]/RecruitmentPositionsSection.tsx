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
  total: number;
};

export default function RecruitmentPositionsSection({ positions, total }: RecruitmentPositionsSectionProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1b233a] bg-[#0c101d]">
      <div className="flex flex-col gap-2 border-b border-[#151b2d] bg-gradient-to-r from-amber-400/[0.08] via-[#0c101d] to-cyan-400/[0.05] p-5 sm:flex-row sm:items-start sm:justify-between">
        <h4 className="flex items-center gap-2 text-sm font-black text-white uppercase tracking-wider">
          <FileText className="h-4 w-4 text-amber-400" /> Vị trí & Yêu cầu tuyển dụng
        </h4>
      </div>

      <div className="space-y-4 p-5">
        {positions.map((position) => (
          <article
            key={position.id}
            className="rounded-2xl border border-[#232a42] bg-[#090c17] p-4 transition-colors hover:border-amber-400/25"
          >
            <div className="flex items-start justify-between gap-3">
              <h5 className="text-base sm:text-lg font-black text-white leading-snug">
                {position.title}
              </h5>
              <span className="shrink-0 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11px] sm:text-xs font-black text-amber-300">
                Cần tuyển {position.count} người
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                Yêu cầu
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
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
