import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";

type EventSchedule = {
  id: string;
  title: string;
  timeText: string;
  location: string;
  note: string;
};

type EventInformationSectionProps = {
  events: EventSchedule[];
};

function noteItems(note: string) {
  return String(note || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function EventInformationSection({ events }: EventInformationSectionProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#1b233a] bg-[#0c101d]">
      <div className="flex flex-col gap-2 border-b border-[#151b2d] bg-gradient-to-r from-amber-400/[0.08] via-[#0c101d] to-cyan-400/[0.05] p-5 sm:flex-row sm:items-start sm:justify-between">
        <h4 className="flex items-center gap-2 text-sm font-black text-white uppercase tracking-wider">
          <Sparkles className="h-4 w-4 text-amber-400" /> Thông tin sự kiện
        </h4>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 text-xs font-black text-amber-300">
          <Calendar className="h-3.5 w-3.5" />
          {events.length} sự kiện
        </span>
      </div>

      <div className="p-5">
        <div className="space-y-0">
          {events.map((event, index) => (
            <article
              key={event.id}
              className="relative pb-6 last:pb-0"
            >
              <div className="min-w-0 rounded-2xl border border-[#232a42] bg-[#090c17] p-4 transition-colors hover:border-amber-400/25">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h5 className="text-base sm:text-lg font-black leading-snug text-amber-300">
                    {event.title}
                  </h5>
                  <span className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-black text-cyan-200">
                    <Clock className="h-3.5 w-3.5 text-cyan-300" />
                    <span className="whitespace-normal text-left leading-snug sm:whitespace-nowrap">
                      {event.timeText || "Theo lịch sự kiện"}
                    </span>
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs sm:text-sm font-semibold text-slate-300">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <span className="leading-relaxed">{event.location || "Không có"}</span>
                </div>

                {noteItems(event.note).length > 0 ? (
                  <ul className="mt-3 list-disc space-y-1.5 border-t border-[#151b2d] pl-5 pt-3 text-xs sm:text-sm font-semibold leading-relaxed text-slate-300 marker:text-white">
                    {noteItems(event.note).map((item, itemIndex) => (
                      <li key={`${event.id}-note-${itemIndex}`} className="pl-1">
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 border-t border-[#151b2d] pt-3 text-xs sm:text-sm font-semibold leading-relaxed text-slate-300">
                    Không có
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
