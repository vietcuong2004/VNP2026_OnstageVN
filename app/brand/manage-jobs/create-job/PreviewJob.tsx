"use client";

import type { ElementType, ReactNode } from "react";
import { Bookmark, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Clock, DollarSign, FileText, Info, Layers, MapPin, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type CampaignEventDraft = {
  name: string;
  startAt: string;
  endAt: string;
  location: string;
  content: string;
};

type CampaignPositionDraft = {
  talentType: string;
  quantity: string;
  requirements: string;
};

type JobPreviewForm = {
  title: string;
  city: string;
  address: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  budget: string;
  budgetUnit?: string;
  budgetNegotiable: boolean;
  benefits: string;
  description: string;
  roles: string;
  requirements: string;
  responsibilities: string;
  industries: string;
  targetProfiles: string;
  heightMin: string;
  weightMax: string;
  experienceMin: string;
  talentQuantity: string;
  campaignEvents: CampaignEventDraft[];
  campaignPositions: CampaignPositionDraft[];
};

type PreviewJobProps = {
  form: JobPreviewForm;
  imageUrls: string[];
  activeImageIndex?: number;
  onActiveImageIndexChange?: (index: number) => void;
};

function splitItems(value: string) {
  return String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLines(value: string) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.replace(/^[\s•*-]+/, "").trim())
    .filter(Boolean);
}

function sentenceCase(text: string) {
  if (!text) return "";
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function formatDateTime(value: string) {
  if (!value) return "Chưa có";
  const [datePart = "", timePart = ""] = value.split("T");
  const [year, month, day] = datePart.split("-");
  const dateText = year && month && day ? `${day}/${month}/${year}` : datePart;
  return timePart ? `${timePart} ${dateText}` : dateText || "Chưa có";
}

function formatRange(start: string, end: string) {
  const startText = formatDateTime(start);
  const endText = formatDateTime(end);
  if (startText === "Chưa có") return endText;
  if (endText === "Chưa có") return startText;
  return `${startText} - ${endText}`;
}

function buildRequirementList(form: JobPreviewForm) {
  const items: string[] = [];
  if (form.heightMin) items.push(`Chiều cao tối thiểu: ${form.heightMin} cm`);
  if (form.weightMax) items.push(`Cân nặng tối đa: ${form.weightMax} kg`);
  if (form.experienceMin) items.push(`Kinh nghiệm tối thiểu: ${form.experienceMin} năm`);
  items.push(...splitLines(form.requirements));
  return items.length > 0 ? items : ["Chưa có yêu cầu chi tiết"];
}

function formatBudgetPreview(value: string, isNegotiable: boolean, unit: string = "day") {
  if (isNegotiable) return "Thỏa thuận";

  const numbers = String(value || "")
    .match(/\d[\d.]*/g)
    ?.map((item) => Number(item.replace(/\./g, "")))
    .filter((item) => Number.isFinite(item) && item > 0) || [];

  if (numbers.length === 0) return "Chưa có";

  const suffix = unit === "hour" ? "/giờ" : unit === "job" ? "/job" : "/ngày";

  const formatAmount = (amount: number) => {
    if (amount >= 1_000_000) {
      const million = amount / 1_000_000;
      const text = million.toLocaleString("vi-VN", {
        minimumFractionDigits: million % 1 === 0 ? 0 : 1,
        maximumFractionDigits: 1,
      });
      return { text: `${text} triệu`, isMillion: true };
    }
    if (amount >= 1_000) {
      const thousands = amount / 1_000;
      const text = Number.isInteger(thousands)
        ? String(thousands)
        : thousands.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
      return { text: `${text}k`, isMillion: false };
    }
    return { text: `${amount.toLocaleString("vi-VN")}đ`, isMillion: false };
  };

  if (numbers.length === 1 || numbers[0] === numbers[1]) {
    return `${formatAmount(numbers[0]).text}${suffix}`;
  }

  const first = formatAmount(numbers[0]);
  const second = formatAmount(numbers[1]);

  if (first.isMillion && second.isMillion) {
    const firstClean = first.text.replace(/\s*triệu/i, "");
    return `${firstClean} - ${second.text}${suffix}`;
  }

  if (!first.isMillion && !second.isMillion) {
    const firstClean = first.text.replace(/k$/i, "");
    return `${firstClean} - ${second.text}${suffix}`;
  }

  return `${first.text} - ${second.text}${suffix}`;
}

export default function PreviewJob({
  form,
  imageUrls,
  activeImageIndex,
  onActiveImageIndexChange,
}: PreviewJobProps) {
  const [internalActiveImageIndex, setInternalActiveImageIndex] = useState(0);
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);
  const industries = splitItems(form.industries);
  const benefits = splitLines(form.benefits);
  const responsibilities = splitLines(form.responsibilities);
  const roles = splitItems(form.roles);
  const targetProfiles = splitItems(form.targetProfiles);
  const images = imageUrls.length > 0 ? imageUrls : ["/brand_cover_default.png"];
  const currentActiveImageIndex = Math.min(activeImageIndex ?? internalActiveImageIndex, images.length - 1);
  const setCurrentActiveImageIndex = onActiveImageIndexChange ?? setInternalActiveImageIndex;
  const location = [form.address, form.city].filter(Boolean).join(", ") || "Chưa có";
  const budget = formatBudgetPreview(form.budget, form.budgetNegotiable, form.budgetUnit || "day");
  const positionCards = form.campaignPositions.length > 0
    ? form.campaignPositions
    : (roles.length > 0 ? roles : targetProfiles).map((position) => ({
        talentType: position,
        quantity: form.talentQuantity || "1",
        requirements: "",
      }));
  const requirements = buildRequirementList(form);
  const activeImage = images[currentActiveImageIndex] || images[0];

  useEffect(() => {
    setCurrentActiveImageIndex(Math.min(currentActiveImageIndex, Math.max(images.length - 1, 0)));
  }, [currentActiveImageIndex, images.length, setCurrentActiveImageIndex]);

  const showImageNavigation = images.length > 1;
  const goToPrevImage = () => {
    setCurrentActiveImageIndex((currentActiveImageIndex - 1 + images.length) % images.length);
  };
  const goToNextImage = () => {
    setCurrentActiveImageIndex((currentActiveImageIndex + 1) % images.length);
  };

  return (
    <>
    <aside className="flex h-full min-h-0 min-w-0 flex-1 basis-1/2 flex-col overflow-hidden rounded-2xl border border-[#F0D6D0] bg-[#FAF7F6] text-[#191116] dark:border-slate-800/80 dark:bg-[#080a12] dark:text-white">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div
          className="relative h-56 cursor-zoom-in overflow-hidden border-b border-[#F0D6D0] bg-white dark:border-[#151b2d] dark:bg-[#050711]"
          role="button"
          tabIndex={0}
          onClick={() => setIsImageLightboxOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsImageLightboxOpen(true);
            }
          }}
          aria-label="Xem ảnh job"
        >
          <img
            src={activeImage}
            alt={form.title || "Campaign preview"}
            className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/brand_cover_default.png";
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FAF7F6] via-[#FAF7F6]/20 to-transparent dark:from-[#080a12] dark:via-[#080a12]/20" />
          {showImageNavigation && (
            <div
              className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full border border-[#F0D6D0] bg-white/90 p-1 backdrop-blur shadow-md dark:border-white/10 dark:bg-black/45"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={goToPrevImage}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF0EE] text-[#8F0709] transition hover:bg-[#FFE5E2] cursor-pointer dark:bg-white/10 dark:text-white/85 dark:hover:bg-white/25"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-10 text-center text-[11px] font-black text-[#191116] dark:text-white">
                {currentActiveImageIndex + 1}/{images.length}
              </span>
              <button
                type="button"
                onClick={goToNextImage}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF0EE] text-[#8F0709] transition hover:bg-[#FFE5E2] cursor-pointer dark:bg-white/10 dark:text-white/85 dark:hover:bg-white/25"
                aria-label="Ảnh sau"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-5 p-5">
          <section className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {(industries.length > 0 ? industries : ["Chưa phân loại"]).map((industry) => (
                <span
                  key={industry}
                  className="rounded-full border border-[#E8C8C2] bg-[#FFF3F1] px-3 py-1 text-xs font-black uppercase text-[#8F0709] dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300"
                >
                  {industry}
                </span>
              ))}
            </div>

            <h3 className="min-w-0 whitespace-normal break-words font-display text-2xl font-black uppercase leading-tight tracking-tight text-[#191116] dark:text-white [overflow-wrap:anywhere]">
              {form.title || "Tên job sẽ hiển thị tại đây"}
            </h3>

            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#574D54] dark:text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A8B88] dark:text-slate-500">Thương hiệu:</span>
              <span className="font-bold text-[#8F0709] dark:text-amber-300">OnstageVN Brand</span>
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              <MetricCard icon={DollarSign} label="Thù lao" value={budget} highlight />
              <MetricCard icon={Clock} label="Hạn ứng tuyển" value={formatDateTime(form.applicationDeadline)} />
              <MetricCard icon={MapPin} label="Địa điểm làm việc" value={location} cyan />
              <MetricCard icon={Clock} label="Thời gian onstage" value={(form as any).onstageTime || "Chưa có"} />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button type="button" disabled className="light-force-white min-w-64 rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-6 py-4 text-sm font-black uppercase tracking-wider !text-white text-white shadow-md opacity-90 cursor-not-allowed">
                Ứng tuyển ngay
              </button>
              <button type="button" disabled className="inline-flex min-w-64 items-center justify-center gap-2 rounded-2xl border border-[#F0D6D0] bg-white px-6 py-4 text-sm font-black uppercase tracking-wider text-[#191116] shadow-sm opacity-90 cursor-not-allowed dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100">
                <Bookmark className="h-4 w-4 text-[#8F0709] dark:text-white" />
                Lưu công việc
              </button>
            </div>
          </section>

          <PreviewSection icon={Info} title="Mô tả công việc">
            <p className="min-w-0 whitespace-pre-line break-words text-xs sm:text-sm font-normal leading-relaxed text-[#574D54] dark:text-slate-300 [overflow-wrap:anywhere]">
              {form.description || "Mô tả tổng quan về job, campaign, mục tiêu và kế hoạch sẽ hiển thị tại đây."}
            </p>
          </PreviewSection>

          <PreviewSection icon={Layers} title="Thông tin công việc">
            <PillBlock
              title="Lĩnh vực công việc"
              items={industries.length > 0 ? industries : ["Không có"]}
              className="border-[#E8C8C2] bg-[#FFF3F1] text-[#8F0709] dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300"
            />
            <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
              <InfoLine icon={Calendar} label="Bắt đầu" value={formatDateTime(form.startDate)} />
              <InfoLine icon={Calendar} label="Kết thúc" value={formatDateTime(form.endDate)} />
              {(form as any).onstageTime && (
                <InfoLine icon={Clock} label="Thời gian onstage" value={(form as any).onstageTime} />
              )}
            </div>
            <ListBlock title="Đầu việc chính" items={responsibilities.length > 0 ? responsibilities : ["Chưa có"]} marker="check" />
            <ListBlock title="Quyền lợi & Đãi ngộ" items={benefits.length > 0 ? benefits : ["Chưa có"]} marker="dot" />
          </PreviewSection>

          <PreviewSection icon={FileText} title="Vị trí & Yêu cầu tuyển dụng" flush>
            <div className="space-y-3">
              <GeneralRequirementsPreview items={requirements} />
              {(positionCards.length > 0 ? positionCards : [{ talentType: "Vị trí tuyển dụng", quantity: form.talentQuantity || "1", requirements: "" }]).map((position, index) => (
                <article key={`${position.talentType}-${index}`} className="rounded-2xl border border-[#F0D6D0] bg-white p-4 transition-colors hover:border-[#C72524]/30 shadow-sm dark:border-[#232a42] dark:bg-[#090c17] dark:hover:border-amber-400/25">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-base font-black leading-snug text-[#7A1114] dark:text-white">{position.talentType || `Vị trí ${index + 1}`}</h4>
                    <span className="shrink-0 rounded-full border border-[#E8C8C2] bg-[#FFF3F1] px-3 py-1 text-[11px] font-black text-[#8F0709] dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
                      Cần tuyển {Number(position.quantity) || 1} người
                    </span>
                  </div>
                  <ListBlock title="" items={splitLines(position.requirements).length > 0 ? splitLines(position.requirements) : ["Chưa có"]} marker="check" compact />
                </article>
              ))}
            </div>
          </PreviewSection>

          {form.campaignEvents.length > 0 && (
            <PreviewSection icon={Sparkles} title="Thông tin sự kiện" badge={`${form.campaignEvents.length} sự kiện`} flush>
              <div className="space-y-3">
                {form.campaignEvents.map((event, index) => (
                  <article key={`${event.name}-${index}`} className="rounded-2xl border border-[#F0D6D0] bg-white p-4 transition-colors hover:border-[#C72524]/30 shadow-sm dark:border-[#232a42] dark:bg-[#090c17] dark:hover:border-amber-400/25">
                    <div className="flex flex-col gap-2">
                      <h4 className="text-base font-black leading-snug text-[#8F0709] dark:text-amber-300">
                        {event.name || `Sự kiện ${index + 1}`}
                      </h4>
                      <span className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-[#E8C8C2] bg-[#FFF3F1] px-2.5 py-1 text-[11px] font-black text-[#8F0709] dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
                        <Clock className="h-3.5 w-3.5 text-[#8F0709] dark:text-cyan-300" />
                        {formatRange(event.startAt, event.endAt)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-start gap-2 text-xs sm:text-sm font-semibold text-[#574D54] dark:text-slate-300">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <span className="leading-relaxed">{event.location || location}</span>
                    </div>
                    <ListBlock title="" items={splitLines(event.content).length > 0 ? splitLines(event.content) : ["Chưa có"]} marker="plain" compact />
                  </article>
                ))}
              </div>
            </PreviewSection>
          )}
        </div>
      </div>
    </aside>
    {isImageLightboxOpen && (
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setIsImageLightboxOpen(false)}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsImageLightboxOpen(false);
          }}
          className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Đóng xem ảnh"
        >
          <X className="h-6 w-6" />
        </button>
        <img
          src={activeImage}
          alt={form.title || "Campaign preview"}
          className="max-h-[82vh] max-w-[76vw] rounded-xl object-contain shadow-2xl"
          onClick={(event) => event.stopPropagation()}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/brand_cover_default.png";
          }}
        />
      </div>
    )}
    </>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  highlight = false,
  cyan = false,
  className,
}: {
  icon: ElementType;
  label: string;
  value: string;
  highlight?: boolean;
  cyan?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-24 rounded-2xl border p-4 shadow-[0_12px_28px_rgba(143,7,9,0.06)] transition-all",
        highlight
          ? "border-[#E8C8C2] bg-[#FFF3F1] text-[#8F0709] dark:border-amber-500/35 dark:bg-gradient-to-br dark:from-amber-500/10 dark:via-[#0e1322] dark:to-[#080a12]"
          : "border-[#F0D6D0] bg-white text-[#191116] dark:border-[#1b233a] dark:bg-[#0c101d]",
        className
      )}
    >
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#8F0709] dark:text-slate-400">
        <Icon className={cn("h-4 w-4 shrink-0", highlight ? "text-[#8F0709] dark:text-amber-400" : cyan ? "text-[#8F0709] dark:text-cyan-400" : "text-[#8F0709] dark:text-amber-400")} />
        {label}
      </div>
      <div className={cn("mt-3 min-w-0 text-base font-black leading-snug break-words [overflow-wrap:anywhere]", highlight ? "text-[#8F0709] dark:text-amber-300" : "text-[#191116] dark:text-slate-100")}>
        {value}
      </div>
    </div>
  );
}

function PreviewSection({
  icon: Icon,
  title,
  badge,
  children,
  flush = false,
}: {
  icon: ElementType;
  title: string;
  badge?: string;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-[#F0D6D0] bg-white shadow-[0_12px_28px_rgba(143,7,9,0.06)] dark:border-[#1b233a] dark:bg-[#0c101d]", !flush && "p-5")}>
      <div className={cn("flex items-center justify-between gap-3", flush && "border-b border-[#F0D6D0] bg-gradient-to-r from-[#FFF7F6] via-white to-[#FFFDFC] p-5 dark:border-[#151b2d] dark:from-amber-400/[0.08] dark:via-[#0c101d] dark:to-cyan-400/[0.05]")}>
        <h4 className={cn("flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#7A1114] dark:text-white", !flush && "border-b border-[#F0D6D0] pb-2.5 dark:border-[#151b2d]")}>
          <Icon className="h-4 w-4 text-amber-400" />
          {title}
        </h4>
        {badge && (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#E8C8C2] bg-[#FFF3F1] px-3 py-1.5 text-xs font-black text-[#8F0709] dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
            <Calendar className="h-3.5 w-3.5" />
            {badge}
          </span>
        )}
      </div>
      <div className={cn("space-y-4", flush && "p-5")}>{children}</div>
    </section>
  );
}

function PillBlock({ title, items, className }: { title: string; items: string[]; className: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-bold uppercase tracking-wider text-[#8F0709] dark:text-slate-400">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className={cn("rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider", className)}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function InfoLine({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[#574D54] dark:text-slate-300">
      <Icon className="h-4 w-4 shrink-0 text-[#8F0709] dark:text-slate-400" />
      <span className="font-medium text-[#574D54] dark:text-slate-400">{label}:</span>
      <span className="font-semibold text-[#191116] dark:text-slate-100">{value}</span>
    </div>
  );
}

function GeneralRequirementsPreview({ items }: { items: string[] }) {
  return (
    <article className="rounded-2xl border border-[#F0D6D0] bg-[#FFF7F6] p-4 transition-colors hover:border-[#C72524]/35 dark:border-amber-400/25 dark:bg-amber-400/[0.04] dark:hover:border-amber-400/35">
      <h4 className="text-base font-black leading-snug text-[#8F0709] dark:text-amber-300">Yêu cầu chung</h4>
      <ListBlock title="" items={items.length > 0 ? items : ["Chưa có"]} marker="check" compact />
    </article>
  );
}

function ListBlock({
  title,
  items,
  marker,
  compact = false,
}: {
  title: string;
  items: string[];
  marker: "check" | "dot" | "plain";
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-2", compact && "mt-4")}>
      {title && <p className="text-xs font-bold uppercase tracking-wider text-[#8F0709] dark:text-slate-400">{title}</p>}
      <ul className="space-y-1.5 text-xs sm:text-sm text-[#574D54] dark:text-slate-200">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className={cn("flex items-start gap-2", marker === "plain" && "list-disc")}>
            {marker === "check" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />}
            {marker === "dot" && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />}
            {marker === "plain" && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8F0709] dark:bg-white" />}
            <span className="leading-relaxed">{sentenceCase(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
