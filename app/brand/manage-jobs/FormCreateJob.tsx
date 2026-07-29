"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ImagePlus, Briefcase, ChevronDown, Pencil, Calendar } from "lucide-react";
import { type Campaign } from "@/lib/brand-mvp-data";
import { createBrandCampaign, publishBrandCampaign, uploadBrandCampaignMedia } from "@/lib/brand-api";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = [
  "CTV Take Care nghệ sĩ",
  "CTV điều phối sự kiện",
  "CTV check-in & đón tiếp khách mời",
  "Người mẫu",
  "Người dẫn chương trình",
  "Ca sĩ",
  "KOL/KOC",
  "Beauty Blogger",
  "Fashion Blogger",
  "Đại sứ thương hiệu",
  "Nhân vật truyền cảm hứng",
];

const BENEFIT_OPTIONS = [
  "Hỗ trợ ăn uống trong chương trình",
  "Nhận giấy chứng nhận sau khi hoàn thành",
  "Cơ hội tham gia dự án trong lĩnh vực giải trí/sự kiện",
  "Đào tạo kỹ năng vận hành, điều phối và quản lý",
  "Mở rộng quan hệ với nghệ sĩ, KOLs, khách mời và đối tác",
  "Tích lũy kinh nghiệm thực tế",
  "Trải nghiệm thương hiệu cao cấp",
  "Mở rộng mạng lưới kết nối",
  "Ưu tiên sản xuất nội dung",
  "Cơ hội trở thành đại sứ thương hiệu",
  "Vinh danh tại chương trình",
  "Hỗ trợ thù lao phụ",
  "Tài trợ trang điểm",
  "Tài trợ làm tóc",
  "Tài trợ trang phục dạ hội",
  "Tài trợ áo dài truyền thống",
  "Tài trợ trang phục thường ngày",
  "Tài trợ trang phục thể thao",
  "Tài trợ trang sức cao cấp",
  "Tài trợ mỹ phẩm dưỡng da",
  "Tài trợ khách sạn/lưu trú VIP",
  "Tài trợ vé máy bay khứ hồi",
  "Tài trợ xe đưa đón",
  "Tài trợ ăn uống",
  "Tài trợ thẻ tập Gym & Fitness",
  "Tài trợ chăm sóc nha khoa",
  "Tài trợ thẩm mỹ viện & skincare",
  "Tài trợ chụp ảnh & studio",
  "Tài trợ gói truyền thông PR/báo chí",
  "Tài trợ phụ kiện thời trang",
  "Tài trợ giày cao gót NTK",
  "Tài trợ voucher nghỉ dưỡng & spa",
  "Tài trợ bảo hiểm sức khỏe sự kiện",
  "Tài trợ đào tạo MC & kỹ năng",
];

const RESPONSIBILITY_OPTIONS = [
  "Hỗ trợ vận hành chương trình, sự kiện và các hoạt động sản xuất",
  "Phối hợp cùng bộ phận điều phối để đảm bảo tiến độ chương trình",
  "Hỗ trợ nghệ sĩ, khách mời, đối tác và khán giả trong quá trình diễn ra sự kiện",
  "Thực hiện các nhiệm vụ điều phối, check-in và hậu cần theo phân công",
  "Góp phần đảm bảo chương trình diễn ra chỉn chu, chuyên nghiệp và đúng timeline",
  "Đồng hành trong các hoạt động truyền thông và lan tỏa hình ảnh chiến dịch",
  "Tham gia sản xuất nội dung hậu trường hoặc review sản phẩm theo brief",
];

const INDUSTRY_OPTIONS = [
  "Thời trang",
  "Làm đẹp",
  "Giải trí",
  "Sự kiện",
  "Truyền thông",
  "Mỹ phẩm cao cấp",
  "Công nghệ làm đẹp",
  "Viện thẩm mỹ quốc tế",
  "Spa & Wellness",
  "Training & Academy",
  "Nhãn hàng đồng hành",
];

const TARGET_PROFILE_OPTIONS = [
  "Diễn viên",
  "Người mẫu",
  "KOL",
  "KOC",
  "Livestreamer",
  "MC",
  "PG",
  "Hoa hậu",
  "Người đẹp",
  "Đại sứ",
];

function splitOptionText(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinOptionText(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).join("\n");
}

function parseBudgetInputValue(value: string) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits ? String(Number(digits)) : "";
}

function formatBudgetInputValue(value: string) {
  const numericValue = parseBudgetInputValue(value);
  return numericValue ? `${Number(numericValue).toLocaleString("vi-VN")} VND/ngày` : "";
}

function formatBudgetDigits(digits: string) {
  const normalizedDigits = String(digits || "").replace(/[^\d]/g, "");
  return normalizedDigits ? `${Number(normalizedDigits).toLocaleString("vi-VN")} VND/ngày` : "";
}

const emptyForm = {
  title: "",
  jobType: "KOL livestream",
  eventName: "",
  campaignType: "",
  city: "Hà Nội",
  address: "",
  startDate: "",
  endDate: "",
  deadline: "",
  applicationDeadline: "",
  eventDate: "",
  talentQuantity: "3",
  budget: "",
  budgetMin: "",
  budgetMax: "",
  budgetNegotiable: false,
  benefits: "",
  requirements: "",
  description: "",
  roles: "",
  responsibilities: "",
  industries: "",
  targetProfiles: "",
  contactNote: "",
  escrowed: false,
  heightMin: "",
  heightMax: "",
  weightMin: "",
  weightMax: "",
  experienceMin: "",
  experienceMax: "",
};

function currentDateInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${day}/${month}/${year}`;
}

function parseVietnameseDateToYYYYMMDD(dateStr: string): string {
  if (!dateStr) return "";
  let trimmed = dateStr.trim();
  if (trimmed.includes("T")) {
    trimmed = trimmed.split("T")[0];
  }
  const match = trimmed.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})/);
  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  const ymdMatch = trimmed.match(/^(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, "0");
    const day = ymdMatch[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return trimmed;
}

function isValidVietnameseDate(dateStr: string): boolean {
  if (!dateStr) return true;
  return /^\d{1,2}[/\-]\d{1,2}[/\-]\d{4}$/.test(dateStr.trim());
}

function normalizeVietnameseDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  const match = trimmed.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);
  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3];
    return `${day}/${month}/${year}`;
  }
  return trimmed;
}

function validateDateFields(currentForm: typeof emptyForm) {
  const errors: {
    startDate?: string;
    endDate?: string;
    applicationDeadline?: string;
    eventDate?: string;
  } = {};

  const normStart = normalizeVietnameseDateDisplay(currentForm.startDate);
  const normEnd = normalizeVietnameseDateDisplay(currentForm.endDate);
  const normApp = normalizeVietnameseDateDisplay(currentForm.applicationDeadline);
  const normEvent = normalizeVietnameseDateDisplay(currentForm.eventDate);

  if (normStart && !isValidVietnameseDate(normStart)) {
    errors.startDate = "Định dạng phải là dd/mm/yyyy (ví dụ: 22/07/2026)";
  }
  if (normEnd && !isValidVietnameseDate(normEnd)) {
    errors.endDate = "Định dạng phải là dd/mm/yyyy (ví dụ: 22/07/2026)";
  }
  if (normApp && !isValidVietnameseDate(normApp)) {
    errors.applicationDeadline = "Định dạng phải là dd/mm/yyyy (ví dụ: 22/07/2026)";
  }
  if (normEvent && !isValidVietnameseDate(normEvent)) {
    errors.eventDate = "Định dạng phải là dd/mm/yyyy (ví dụ: 22/07/2026)";
  }

  const ymdStart = parseVietnameseDateToYYYYMMDD(normStart);
  const ymdEnd = parseVietnameseDateToYYYYMMDD(normEnd);
  const ymdApp = parseVietnameseDateToYYYYMMDD(normApp);
  const ymdEvent = parseVietnameseDateToYYYYMMDD(normEvent);

  if (!errors.endDate && ymdStart && ymdEnd && ymdEnd < ymdStart) {
    errors.endDate = "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu";
  }

  if (!errors.applicationDeadline && ymdStart && ymdEnd && ymdApp) {
    if (ymdApp < ymdStart || ymdApp > ymdEnd) {
      errors.applicationDeadline = "Hạn ứng tuyển phải nằm trong khoảng từ ngày bắt đầu đến ngày kết thúc";
    }
  }

  if (!errors.eventDate && ymdStart && ymdEnd && ymdEvent) {
    if (ymdEvent < ymdStart || ymdEvent > ymdEnd) {
      errors.eventDate = "Ngày sự kiện chính phải nằm trong khoảng từ ngày bắt đầu đến ngày kết thúc";
    }
  }

  return { errors, normStart, normEnd, normApp, normEvent };
}

function createDefaultForm() {
  const today = currentDateInputValue();

  return {
    ...emptyForm,
    startDate: today,
    endDate: today,
    deadline: today,
    applicationDeadline: today,
    eventDate: today,
  };
}

interface FormCreateJobProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: (campaign: Campaign) => void;
}

export default function FormCreateJob({ isOpen, onClose, onCampaignCreated }: FormCreateJobProps) {
  const router = useRouter();
  const [form, setForm] = useState(createDefaultForm);
  const [campaignImages, setCampaignImages] = useState<File[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [formStep, setFormStep] = useState(1);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const finalStepSubmitReadyAt = useRef(0);
  const imagePreviews = useMemo(
    () => campaignImages.map((file) => URL.createObjectURL(file)),
    [campaignImages]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleImagesAdd = (files: File[]) => {
    setCampaignImages((prev) => {
      const next = [...prev, ...files];
      return next.slice(0, 10);
    });
  };

  const handleImageReplace = (index: number, file: File) => {
    setCampaignImages((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  };

  const handleImageDelete = (index: number) => {
    setCampaignImages((prev) => prev.filter((_, i) => i !== index));
  };

  const [dateErrors, setDateErrors] = useState<{
    startDate?: string;
    endDate?: string;
    applicationDeadline?: string;
    eventDate?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const TOTAL_STEPS = 5;

  function moveToStep(nextStep: number) {
    if (formStep === 2 && nextStep > 2) {
      const { errors, normStart, normEnd, normApp, normEvent } = validateDateFields(form);

      setForm((c) => ({
        ...c,
        startDate: normStart,
        endDate: normEnd,
        applicationDeadline: normApp,
        deadline: normApp,
        eventDate: normEvent,
      }));

      setDateErrors(errors);

      if (Object.keys(errors).length > 0) {
        return;
      }
    }
    const boundedStep = Math.min(Math.max(nextStep, 1), TOTAL_STEPS);
    finalStepSubmitReadyAt.current = boundedStep === TOTAL_STEPS ? Date.now() + 450 : 0;
    setFormStep(boundedStep);
  }

  const STEP_LABELS = ["Cơ bản", "Địa điểm", "Mô tả", "Yêu cầu", "Hoàn tất"];

  const [budgetFrom, setBudgetFrom] = useState("");
  const [budgetTo, setBudgetTo] = useState("");
  const [budgetNegotiable, setBudgetNegotiable] = useState(false);

  const updateBudgetState = (fromVal: string, toVal: string) => {
    const minValue = parseBudgetInputValue(fromVal);
    const maxValue = parseBudgetInputValue(toVal);

    let budgetString = "";
    if (fromVal && toVal) {
      budgetString = `${fromVal} - ${toVal}`;
    } else if (fromVal) {
      budgetString = fromVal;
    } else if (toVal) {
      budgetString = toVal;
    }
    setForm((c) => ({ ...c, budget: budgetString, budgetMin: minValue, budgetMax: maxValue, budgetNegotiable: false }));
  };

  const handleBudgetChange = (
    val: string,
    oldVal: string,
    setter: (v: string) => void,
    isFrom: boolean
  ) => {
    if (budgetNegotiable) return;

    const oldDigits = parseBudgetInputValue(oldVal);
    let nextDigits = parseBudgetInputValue(val);

    if (oldDigits && nextDigits === oldDigits && val.length < oldVal.length) {
      nextDigits = oldDigits.slice(0, -1);
    }

    const formatted = formatBudgetDigits(nextDigits);
    const nextFrom = isFrom ? formatted : budgetFrom;
    const nextTo = isFrom ? budgetTo : formatted;
    setter(formatted);
    updateBudgetState(nextFrom, nextTo);
  };

  const handleBudgetNegotiableChange = (checked: boolean) => {
    setBudgetNegotiable(checked);

    if (checked) {
      setBudgetFrom("");
      setBudgetTo("");
      setForm((current) => ({
        ...current,
        budget: "Thỏa thuận",
        budgetMin: "",
        budgetMax: "",
        budgetNegotiable: true,
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      budget: "",
      budgetMin: "",
      budgetMax: "",
      budgetNegotiable: false,
    }));
  };

  function handleClose() {
    setForm(createDefaultForm());
    setDateErrors({});
    setBudgetFrom("");
    setBudgetTo("");
    setBudgetNegotiable(false);
    setCampaignImages([]);
    setOpenDropdown(null);
    finalStepSubmitReadyAt.current = 0;
    setFormStep(1);
    onClose();
  }

  function handleFormSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (formStep < TOTAL_STEPS) {
      moveToStep(formStep + 1);
    }
  }

  async function handleCreateCampaign() {
    if (isSubmitting || formStep !== TOTAL_STEPS || Date.now() < finalStepSubmitReadyAt.current) return;

    setIsSubmitting(true);
    let newCampaign: Campaign;

    // Build requirements string from separate height, weight, experience fields
    const reqParts: string[] = [];
    if (form.heightMin) {
      reqParts.push(`Chiều cao tối thiểu: ${form.heightMin} cm`);
    }
    if (form.weightMax) {
      reqParts.push(`Cân nặng tối đa: ${form.weightMax} kg`);
    }
    if (form.experienceMin) {
      reqParts.push(`Kinh nghiệm tối thiểu: ${form.experienceMin} năm`);
    }
    const finalRequirements = reqParts.join("; ") || "Chưa có yêu cầu chi tiết.";
    const updatedForm = {
      ...form,
      requirements: finalRequirements,
      startDate: parseVietnameseDateToYYYYMMDD(form.startDate),
      endDate: parseVietnameseDateToYYYYMMDD(form.endDate),
      deadline: parseVietnameseDateToYYYYMMDD(form.deadline),
      applicationDeadline: parseVietnameseDateToYYYYMMDD(form.applicationDeadline),
      eventDate: parseVietnameseDateToYYYYMMDD(form.eventDate),
    };

    try {
      const createdCampaign = await createBrandCampaign(updatedForm);
      newCampaign = /^\d+$/.test(createdCampaign.id)
        ? await publishBrandCampaign(createdCampaign.id)
        : createdCampaign;

      if (/^\d+$/.test(newCampaign.id) && campaignImages.length > 0) {
        try {
          const uploadedMedia = await Promise.all(
            campaignImages.map((file, index) => uploadBrandCampaignMedia(newCampaign.id, file, {
              category: "gallery",
              isPrimary: index === 0,
            }))
          );

          const media = uploadedMedia.filter(Boolean) as NonNullable<Campaign["media"]>;
          newCampaign = {
            ...newCampaign,
            media,
            coverMedia: media[0] || null,
          };
        } catch (uploadError) {
          console.warn("Cannot upload campaign images after creation", uploadError);
        }
      }
    } catch (error) {
      console.warn("Cannot create campaign from API, using local fallback", error);
      newCampaign = {
        id: `camp-${Date.now()}`,
        title: updatedForm.title || "Campaign mới",
        jobType: updatedForm.jobType,
        eventName: updatedForm.eventName,
        campaignType: updatedForm.campaignType || updatedForm.jobType || "Campaign",
        city: updatedForm.city,
        address: updatedForm.address || updatedForm.city,
        startDate: updatedForm.startDate,
        endDate: updatedForm.endDate,
        deadline: updatedForm.applicationDeadline || updatedForm.deadline,
        applicationDeadline: updatedForm.applicationDeadline || updatedForm.deadline,
        eventDate: updatedForm.eventDate,
        talentQuantity: Number(updatedForm.talentQuantity) || 1,
        budget: updatedForm.budget,
        budgetValue: Number(updatedForm.budgetMax || updatedForm.budgetMin) || 0,
        benefits: updatedForm.benefits || "Thỏa thuận theo brief",
        status: "published",
        shortlistedTalentIds: [],
        applicants: [],
        contactRequests: 0,
        views: 0,
        description: updatedForm.description || "Chưa có mô tả brief.",
        requirements: updatedForm.requirements || "Chưa có yêu cầu chi tiết.",
        heightMinCm: Number(updatedForm.heightMin) || null,
        weightMaxKg: Number(updatedForm.weightMax) || null,
        experienceMinYears: Number(updatedForm.experienceMin) || null,
        roles: splitOptionText(updatedForm.roles),
        responsibilities: splitOptionText(updatedForm.responsibilities),
        industries: splitOptionText(updatedForm.industries),
        targetProfiles: splitOptionText(updatedForm.targetProfiles),
        contactNote: updatedForm.contactNote,
        sponsorships: [],
        escrowed: updatedForm.escrowed,
      };
    } finally {
      setIsSubmitting(false);
    }

    onCampaignCreated(newCampaign);
    handleClose();
    router.push(`/brand/manage-jobs/${newCampaign.id}`);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <form
        onSubmit={handleFormSubmit}
        className="relative w-full max-w-2xl rounded-3xl border border-amber-500/30 bg-[#0c1021] shadow-[0_0_50px_rgba(245,158,11,0.15),0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top accent glow line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-500 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.6)]" />

        {/* Ambient background glow accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* ── HEADER with step indicator ── */}
        <div className="relative z-10 px-6 pt-5 pb-4 border-b border-slate-800/80 bg-slate-900/40 shrink-0">
          <div className="flex items-start justify-between mb-3.5">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                Bước {formStep}/{TOTAL_STEPS}
              </span>
              <h2 className="mt-2 text-xl font-black text-white tracking-tight drop-shadow-sm">
                {formStep === 1 && "Thông tin cơ bản"}
                {formStep === 2 && "Địa điểm & Thời gian"}
                {formStep === 3 && "Mô tả công việc"}
                {formStep === 4 && "Yêu cầu & Quyền lợi"}
                {formStep === 5 && "Hoàn tất chiến dịch"}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-slate-400 hover:text-white cursor-pointer transition-all p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((label, idx) => {
              const stepNum = idx + 1;
              const isDone = stepNum < formStep;
              const isActive = stepNum === formStep;
              return (
                <div key={label} className="flex items-center gap-2 flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={() => moveToStep(stepNum)}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black transition-all cursor-pointer",
                      isDone
                        ? "bg-amber-500/20 border border-amber-400/60 text-amber-300 hover:bg-amber-500/30"
                        : isActive
                          ? "bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-110 font-black"
                          : "bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:border-amber-400/40 hover:text-slate-200"
                    )}
                  >
                    {isDone ? "✓" : stepNum}
                  </button>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider hidden sm:block whitespace-nowrap transition-colors",
                    isActive ? "text-amber-300 drop-shadow-sm" : isDone ? "text-slate-300" : "text-slate-500"
                  )}>{label}</span>
                  {idx < STEP_LABELS.length - 1 && (
                    <div className={cn(
                      "h-0.5 flex-1 min-w-[12px] hidden sm:block transition-colors rounded-full",
                      isDone ? "bg-amber-400/40" : "bg-slate-800"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── STEP CONTENT (scrollable) ── */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">

          {/* STEP 1: Thông tin cơ bản */}
          {formStep === 1 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="sm:col-span-2">
                <FormInput label="Tiêu đề job *" value={form.title} onChange={(value) => setForm((c) => ({ ...c, title: value }))} required />
              </div>
              <label className="space-y-1.5 block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Loại hình *</span>
                <select
                  value={form.jobType}
                  onChange={(e) => setForm((c) => ({ ...c, jobType: e.target.value }))}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 hover:border-slate-600 transition-all shadow-inner"
                >
                  <option className="bg-slate-900 text-slate-100">Tuyển cộng tác viên</option>
                  <option className="bg-slate-900 text-slate-100">Tuyển đại sứ</option>
                  <option className="bg-slate-900 text-slate-100">Beauty KOL/KOC</option>
                  <option className="bg-slate-900 text-slate-100">KOL livestream</option>
                  <option className="bg-slate-900 text-slate-100">Model lookbook</option>
                  <option className="bg-slate-900 text-slate-100">PG event</option>
                  <option className="bg-slate-900 text-slate-100">MC sự kiện</option>
                  <option className="bg-slate-900 text-slate-100">Dancer performance</option>
                </select>
              </label>
              <FormInput label="Số lượng cần tuyển *" type="number" value={form.talentQuantity} onChange={(value) => setForm((c) => ({ ...c, talentQuantity: value }))} />
              <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/80 bg-slate-900/90 p-3.5 sm:col-span-2 cursor-pointer hover:border-amber-400/50 transition-all shadow-sm">
                <div>
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-amber-300">Thù lao thỏa thuận</span>
                  <span className="mt-0.5 block text-[11px] font-medium text-slate-400">Chọn nếu brand sẽ trao đổi mức thù lao trực tiếp với talent.</span>
                </div>
                <input
                  type="checkbox"
                  checked={budgetNegotiable}
                  onChange={(e) => handleBudgetNegotiableChange(e.target.checked)}
                  className="h-4.5 w-4.5 shrink-0 cursor-pointer accent-amber-400 rounded"
                />
              </label>
              <label className="space-y-1.5 block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Thù lao tối thiểu</span>
                <input
                  type="text"
                  value={budgetFrom}
                  onChange={(e) => handleBudgetChange(e.target.value, budgetFrom, setBudgetFrom, true)}
                  disabled={budgetNegotiable}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 disabled:cursor-not-allowed disabled:opacity-45 hover:border-slate-600 transition-all shadow-inner placeholder:text-slate-500"
                  placeholder="700.000 VND/ngày"
                />
              </label>
              <label className="space-y-1.5 block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Thù lao tối đa</span>
                <input
                  type="text"
                  value={budgetTo}
                  onChange={(e) => handleBudgetChange(e.target.value, budgetTo, setBudgetTo, false)}
                  disabled={budgetNegotiable}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 disabled:cursor-not-allowed disabled:opacity-45 hover:border-slate-600 transition-all shadow-inner placeholder:text-slate-500"
                  placeholder="1.000.000 VND/ngày"
                />
              </label>
            </div>
          )}

          {/* STEP 2: Địa điểm & Thời gian */}
          {formStep === 2 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <FormInput label="Thành phố *" value={form.city} onChange={(value) => setForm((c) => ({ ...c, city: value }))} />
              <FormInput label="Địa điểm *" value={form.address} onChange={(value) => setForm((c) => ({ ...c, address: value }))} />
              <FormInput
                label="Ngày bắt đầu"
                placeholder="dd/mm/yyyy"
                value={form.startDate}
                onChange={(value) => {
                  setForm((c) => ({ ...c, startDate: value }));
                  if (dateErrors.startDate) setDateErrors((prev) => ({ ...prev, startDate: undefined }));
                }}
                onBlur={() => {
                  const norm = normalizeVietnameseDateDisplay(form.startDate);
                  const updated = { ...form, startDate: norm };
                  setForm((c) => ({ ...c, startDate: norm }));
                  setDateErrors(validateDateFields(updated).errors);
                }}
                error={dateErrors.startDate}
                isDateField
              />
              <FormInput
                label="Ngày kết thúc"
                placeholder="dd/mm/yyyy"
                value={form.endDate}
                onChange={(value) => {
                  setForm((c) => ({ ...c, endDate: value }));
                  if (dateErrors.endDate) setDateErrors((prev) => ({ ...prev, endDate: undefined }));
                }}
                onBlur={() => {
                  const norm = normalizeVietnameseDateDisplay(form.endDate);
                  const updated = { ...form, endDate: norm };
                  setForm((c) => ({ ...c, endDate: norm }));
                  setDateErrors(validateDateFields(updated).errors);
                }}
                error={dateErrors.endDate}
                isDateField
              />
              <FormInput
                label="Hạn ứng tuyển"
                placeholder="dd/mm/yyyy"
                value={form.applicationDeadline}
                onChange={(value) => {
                  setForm((c) => ({ ...c, applicationDeadline: value, deadline: value }));
                  if (dateErrors.applicationDeadline) setDateErrors((prev) => ({ ...prev, applicationDeadline: undefined }));
                }}
                onBlur={() => {
                  const norm = normalizeVietnameseDateDisplay(form.applicationDeadline);
                  const updated = { ...form, applicationDeadline: norm, deadline: norm };
                  setForm((c) => ({ ...c, applicationDeadline: norm, deadline: norm }));
                  setDateErrors(validateDateFields(updated).errors);
                }}
                error={dateErrors.applicationDeadline}
                isDateField
              />
              <FormInput
                label="Ngày sự kiện chính"
                placeholder="dd/mm/yyyy"
                value={form.eventDate}
                onChange={(value) => {
                  setForm((c) => ({ ...c, eventDate: value }));
                  if (dateErrors.eventDate) setDateErrors((prev) => ({ ...prev, eventDate: undefined }));
                }}
                onBlur={() => {
                  const norm = normalizeVietnameseDateDisplay(form.eventDate);
                  const updated = { ...form, eventDate: norm };
                  setForm((c) => ({ ...c, eventDate: norm }));
                  setDateErrors(validateDateFields(updated).errors);
                }}
                error={dateErrors.eventDate}
                isDateField
              />
            </div>
          )}

          {/* STEP 3: Mô tả công việc */}
          {formStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="space-y-1.5 block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Mô tả công việc *</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  rows={4}
                  placeholder="Mô tả tổng quan về job, campaign, mục tiêu và kế hoạch..."
                  className="w-full resize-none rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 placeholder:text-slate-500 leading-relaxed hover:border-slate-600 transition-all shadow-inner"
                />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                <div className="md:col-span-7">
                  <MultiChoiceField
                    id="responsibilities"
                    label="Đầu việc chi tiết"
                    value={form.responsibilities}
                    options={RESPONSIBILITY_OPTIONS}
                    placeholder={"Nhập thêm đầu việc khác, mỗi dòng một mục"}
                    onChange={(value) => setForm((c) => ({ ...c, responsibilities: value }))}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                    showCustomInput
                  />
                </div>
                <div className="md:col-span-5 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 flex flex-col justify-start h-full shadow-md">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    Xem trước đầu việc ({splitOptionText(form.responsibilities).length})
                  </span>
                  <div className="overflow-y-auto max-h-[220px] custom-scrollbar mt-3 space-y-2 pr-1 flex-1 border-t border-slate-800 pt-2.5">
                    {splitOptionText(form.responsibilities).length === 0 ? (
                      <span className="text-xs text-slate-400 italic block py-2">
                        Chưa chọn đầu việc nào.
                      </span>
                    ) : (
                      <ul className="list-none space-y-2">
                        {splitOptionText(form.responsibilities).map((item, index) => (
                          <li key={index} className="text-xs text-slate-200 leading-relaxed flex items-start gap-2 bg-slate-800/40 p-2 rounded-lg border border-slate-700/40">
                            <span className="text-amber-400 font-bold shrink-0 select-none">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Phân loại & Quyền lợi */}
          {formStep === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <MultiChoiceField
                id="roles"
                label="Vị trí tuyển dụng"
                value={form.roles}
                options={ROLE_OPTIONS}
                placeholder={"Nhập thêm vị trí khác, mỗi dòng một mục"}
                onChange={(value) => setForm((c) => ({ ...c, roles: value }))}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />
              <MultiChoiceField
                id="benefits"
                label="Quyền lợi / đãi ngộ"
                value={form.benefits}
                options={BENEFIT_OPTIONS}
                placeholder={"Nhập thêm quyền lợi khác, mỗi dòng một mục"}
                onChange={(value) => setForm((c) => ({ ...c, benefits: value }))}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />
              <MultiChoiceField
                id="industries"
                label="Lĩnh vực liên quan"
                value={form.industries}
                options={INDUSTRY_OPTIONS}
                placeholder={"Nhập thêm lĩnh vực khác, mỗi dòng một mục"}
                onChange={(value) => setForm((c) => ({ ...c, industries: value }))}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />
              <MultiChoiceField
                id="targetProfiles"
                label="Nhóm Talent phù hợp"
                value={form.targetProfiles}
                options={TARGET_PROFILE_OPTIONS}
                placeholder={"Nhập thêm nhóm Talent khác, mỗi dòng một mục"}
                onChange={(value) => setForm((c) => ({ ...c, targetProfiles: value }))}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />

              {/* Yêu cầu ngoại hình */}
              <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-md">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 block mb-3 text-left">
                  Yêu cầu ngoại hình
                </span>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Chiều cao */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      Chiều cao tối thiểu (cm)
                    </span>
                    <input
                      type="number"
                      placeholder="Nhập chiều cao (cm)"
                      value={form.heightMin}
                      onChange={(e) => setForm((c) => ({ ...c, heightMin: e.target.value }))}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 hover:border-slate-600 transition-all shadow-inner"
                    />
                  </div>

                  {/* Cân nặng */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      Cân nặng tối đa (kg)
                    </span>
                    <input
                      type="number"
                      placeholder="Nhập cân nặng (kg)"
                      value={form.weightMax}
                      onChange={(e) => setForm((c) => ({ ...c, weightMax: e.target.value }))}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 hover:border-slate-600 transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Kinh nghiệm */}
              <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-md flex flex-col justify-start">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 block mb-3 text-left">
                  Yêu cầu kinh nghiệm
                </span>
                <div className="space-y-1.5 text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Kinh nghiệm tối thiểu (năm)
                  </span>
                  <input
                    type="number"
                    placeholder="Số năm kinh nghiệm"
                    value={form.experienceMin}
                    onChange={(e) => setForm((c) => ({ ...c, experienceMin: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 hover:border-slate-600 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Hoàn tất */}
          {formStep === 5 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-5 text-left space-y-4 shadow-md">
                {/* Header */}
                <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-start sm:justify-between text-left">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/15 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                      <ImagePlus className="h-5 w-5 text-amber-300" />
                    </div>
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-white">Bộ ảnh job</h2>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Tải lên các hình ảnh bạn muốn dùng cho job (Tối đa 10 ảnh)
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 shrink-0">
                    {campaignImages.length}/10 ảnh
                  </span>
                </div>

                {/* Horizontal Scroll List */}
                <div className="flex gap-4 overflow-x-auto pb-3 custom-scrollbar snap-x">
                  {/* Upload card (only show if < 10 images) */}
                  {campaignImages.length < 10 && (
                    <label className="group relative flex aspect-[4/5] w-[130px] shrink-0 snap-start cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-amber-400/40 bg-amber-500/5 p-4 text-center transition-all hover:border-amber-400 hover:bg-amber-500/10">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          handleImagesAdd(files);
                        }}
                        className="hidden"
                      />
                      <ImagePlus className="mb-2 h-7 w-7 text-amber-400 transition-transform duration-200 group-hover:scale-110" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">
                        Tải ảnh lên
                      </span>
                      <span className="mt-1 text-[9px] font-medium leading-relaxed text-slate-400">
                        JPG, PNG hoặc WebP
                      </span>
                    </label>
                  )}

                  {/* Previews */}
                  {imagePreviews.map((url, idx) => (
                    <div key={idx} className="group relative aspect-[4/5] w-[130px] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-md">
                      <img
                        src={url}
                        alt="Campaign preview"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.05] cursor-pointer"
                        onClick={() => setPreviewImage(url)}
                      />

                      {/* Delete button (X) */}
                      <button
                        type="button"
                        onClick={() => handleImageDelete(idx)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-slate-950/80 text-white shadow-lg backdrop-blur transition hover:border-red-500 hover:bg-red-500 cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>

                      {/* Edit button (Pencil) */}
                      <label className="absolute right-12 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-950/80 text-white shadow-lg backdrop-blur transition hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950">
                        <Pencil className="h-3.5 w-3.5" />
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageReplace(idx, file);
                          }}
                          className="hidden"
                        />
                      </label>

                      {idx === 0 && (
                        <span className="absolute bottom-2 left-2 bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary preview */}
              <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-4 space-y-4 shadow-md">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  Tóm tắt chiến dịch
                </span>
                <div className="space-y-4 border-t border-slate-800 pt-4">
                  <SummarySection title="Thông tin cơ bản">
                    <SummaryGrid>
                      <SummaryField label="Tiêu đề job" value={form.title} wide />
                      <SummaryField label="Loại hình" value={form.jobType} />
                      <SummaryField label="Số lượng cần tuyển" value={form.talentQuantity} />
                      <SummaryField label="Thù lao" value={form.budgetNegotiable ? "Thỏa thuận" : form.budget} wide />
                    </SummaryGrid>
                  </SummarySection>

                  <SummarySection title="Địa điểm & thời gian">
                    <SummaryGrid>
                      <SummaryField label="Thành phố" value={form.city} />
                      <SummaryField label="Địa điểm" value={form.address} />
                      <SummaryField label="Ngày bắt đầu" value={form.startDate} />
                      <SummaryField label="Ngày kết thúc" value={form.endDate} />
                      <SummaryField label="Hạn ứng tuyển" value={form.applicationDeadline} />
                      <SummaryField label="Ngày sự kiện chính" value={form.eventDate} />
                    </SummaryGrid>
                  </SummarySection>

                  <SummarySection title="Mô tả công việc">
                    <SummaryGrid>
                      <SummaryField label="Mô tả công việc" value={form.description} wide multiline />
                      <SummaryList label="Đầu việc chi tiết" items={splitOptionText(form.responsibilities)} />
                    </SummaryGrid>
                  </SummarySection>

                  <SummarySection title="Yêu cầu">
                    <SummaryGrid>
                      <SummaryList label="Vị trí tuyển" items={splitOptionText(form.roles)} />
                      <SummaryList label="Quyền lợi / đãi ngộ" items={splitOptionText(form.benefits)} />
                      <SummaryList label="Lĩnh vực liên quan" items={splitOptionText(form.industries)} />
                      <SummaryList label="Nhóm Talent phù hợp" items={splitOptionText(form.targetProfiles)} />
                      <SummaryField label="Chiều cao tối thiểu" value={form.heightMin ? `${form.heightMin} cm` : ""} />
                      <SummaryField label="Cân nặng tối đa" value={form.weightMax ? `${form.weightMax} kg` : ""} />
                      <SummaryField label="Kinh nghiệm tối thiểu" value={form.experienceMin ? `${form.experienceMin} năm` : ""} />
                    </SummaryGrid>
                  </SummarySection>

                  <SummarySection title="Hình ảnh chiến dịch">
                    <SummaryGrid>
                      <SummaryField label="Số ảnh đã tải lên" value={`${campaignImages.length}/10 ảnh`} />
                      <SummaryField label="Ảnh cover" value={campaignImages.length > 0 ? "Ảnh đầu tiên trong danh sách" : ""} />
                    </SummaryGrid>
                  </SummarySection>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER navigation ── */}
        <div className="relative z-10 flex items-center justify-between gap-3 border-t border-slate-800/80 bg-slate-900/40 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={() => formStep > 1 ? moveToStep(formStep - 1) : handleClose()}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-white cursor-pointer transition-all shadow-sm"
            disabled={isSubmitting}
          >
            {formStep > 1 ? "← Quay lại" : "Hủy"}
          </button>

          <div className="flex items-center gap-3">
            {/* Progress bar */}
            <div className="hidden sm:flex h-2 w-24 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                style={{ width: `${(formStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>

            {formStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => moveToStep(formStep + 1)}
                className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-5 text-xs font-black text-slate-950 hover:brightness-110 active:scale-95 cursor-pointer transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)]"
              >
                Tiếp theo →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateCampaign}
                disabled={isSubmitting}
                className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-5 text-xs font-black text-slate-950 hover:brightness-110 active:scale-95 cursor-pointer transition-all shadow-[0_0_25px_rgba(245,158,11,0.45)] disabled:opacity-40"
              >
                <Briefcase className="h-4 w-4" />
                {isSubmitting ? "Đang tạo..." : "Tạo Job"}
              </button>
            )}
          </div>
        </div>
        {/* Full Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020408]/90 backdrop-blur-md transition-all duration-300 animate-in fade-in cursor-zoom-out"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl animate-in zoom-in-95 duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(null);
                }}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-black/60 border border-white/10 text-white hover:bg-black/80 hover:text-[#f4c430] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={previewImage}
                alt="Preview"
                className="max-h-[85vh] max-w-full object-contain select-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

      </form>
    </div>
  );
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-300">{title}</h3>
      {children}
    </section>
  );
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {children}
    </div>
  );
}

function SummaryField({
  label,
  value,
  wide = false,
  multiline = false,
}: {
  label: string;
  value?: string | number | null;
  wide?: boolean;
  multiline?: boolean;
}) {
  const displayValue = String(value || "").trim();

  return (
    <div className={cn("rounded-xl border border-slate-700/40 bg-slate-800/40 p-2.5", wide && "sm:col-span-2")}>
      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className={cn("mt-1 block text-xs font-semibold leading-relaxed text-slate-100 break-words", multiline && "whitespace-pre-line")}>
        {displayValue || "—"}
      </span>
    </div>
  );
}

function SummaryList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-2.5 sm:col-span-2">
      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1.5 text-xs font-semibold leading-relaxed text-slate-100">
          {items.map((item, index) => (
            <li key={`${label}-${item}-${index}`} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              <span className="break-words">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <span className="mt-1 block text-xs font-semibold text-slate-100">—</span>
      )}
    </div>
  );
}

function MultiChoiceField({
  id,
  label,
  value,
  options,
  placeholder,
  onChange,
  openDropdown,
  setOpenDropdown,
  showCustomInput = false,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
  openDropdown: string | null;
  setOpenDropdown: (value: string | null) => void;
  showCustomInput?: boolean;
}) {
  const open = openDropdown === id;
  const selectedItems = splitOptionText(value);
  const selectedSet = new Set(selectedItems);
  const optionSet = new Set(options);
  const customItems = selectedItems.filter((item) => !optionSet.has(item));
  const customTextValue = customItems.join("\n");

  const summary = selectedItems.length > 0
    ? id === "responsibilities"
      ? `Đã chọn ${selectedItems.length} đầu việc`
      : id === "roles"
        ? `Đã chọn ${selectedItems.length} vị trí`
        : id === "benefits"
          ? `Đã chọn ${selectedItems.length} quyền lợi`
          : id === "industries"
            ? `Đã chọn ${selectedItems.length} lĩnh vực`
            : id === "targetProfiles"
              ? `Đã chọn ${selectedItems.length} nhóm`
              : `Đã chọn ${selectedItems.length} mục`
    : "Chọn từ danh sách";

  const allSelected = options.every((option) => selectedSet.has(option));
  const someSelected = options.some((option) => selectedSet.has(option)) && !allSelected;

  function toggleAll() {
    if (allSelected) {
      const next = selectedItems.filter((item) => !optionSet.has(item));
      onChange(joinOptionText(next));
    } else {
      const next = [...options, ...customItems];
      onChange(joinOptionText(next));
    }
  }

  function toggleOption(option: string) {
    const next = selectedSet.has(option)
      ? selectedItems.filter((item) => item !== option)
      : [...selectedItems, option];

    onChange(joinOptionText(next));
  }

  function handleTextChange(newVal: string) {
    const selectedOptions = options.filter((option) => selectedSet.has(option));
    const selectedString = selectedOptions.join("\n");

    onChange(selectedString ? `${selectedString}\n${newVal}` : newVal);
  }

  return (
    <div className="space-y-1.5 md:col-span-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(open ? null : id)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-xl border bg-slate-900/90 px-3.5 py-2.5 text-left text-xs outline-none transition-all shadow-inner",
            open
              ? "border-amber-400 ring-2 ring-amber-400/20"
              : "border-slate-700/80 hover:border-amber-400/50"
          )}
        >
          <span className={cn("truncate font-medium", selectedItems.length > 0 ? "text-amber-300 font-semibold" : "text-slate-400")}>
            {summary}
          </span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-amber-400 transition-transform duration-200", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full z-[70] mt-2 rounded-2xl border border-amber-500/30 bg-[#0d1226] p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-slate-800">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs font-bold text-slate-200 hover:text-amber-300 transition-colors">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }}
                  onChange={toggleAll}
                  className="h-4 w-4 shrink-0 rounded accent-amber-400 cursor-pointer"
                />
                <span>{allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}</span>
              </label>
              <button
                type="button"
                onClick={() => setOpenDropdown(null)}
                className="shrink-0 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Xong
              </button>
            </div>
            <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 custom-scrollbar">
              {options.map((option) => {
                const checked = selectedSet.has(option);

                return (
                  <label
                    key={option}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                      checked
                        ? "border-amber-400/50 bg-amber-400/15 text-amber-200 font-bold shadow-sm"
                        : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOption(option)}
                      className="h-3.5 w-3.5 shrink-0 rounded accent-amber-400 cursor-pointer"
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
            {!showCustomInput && (
              <textarea
                value={customTextValue}
                onChange={(event) => handleTextChange(event.target.value)}
                rows={2}
                placeholder={placeholder}
                className="mt-3 w-full resize-none rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            )}
          </div>
        )}
      </div>
      {showCustomInput && (
        <textarea
          value={customTextValue}
          onChange={(event) => handleTextChange(event.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full resize-none rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-inner"
        />
      )}
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  required = false,
  placeholder = "",
  isDateField = false,
  error = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  isDateField?: boolean;
  error?: string;
}) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      try {
        if (typeof dateInputRef.current.showPicker === "function") {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.focus();
        }
      } catch {
        dateInputRef.current.focus();
      }
    }
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const yyyymmdd = e.target.value;
    if (yyyymmdd) {
      const [y, m, d] = yyyymmdd.split("-");
      if (y && m && d) {
        const formatted = `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
        onChange(formatted);
      }
    }
  };

  const pickerValue = isDateField ? parseVietnameseDateToYYYYMMDD(value) : "";

  return (
    <label className="space-y-1.5 block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
        {label}
      </span>
      <div className="relative flex items-center">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          required={required}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-xl border bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-all shadow-inner",
            error
              ? "border-red-500/80 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
              : "border-slate-700/80 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 hover:border-slate-600",
            isDateField && "pr-10"
          )}
        />
        {isDateField && (
          <>
            <button
              type="button"
              onClick={handleCalendarClick}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-amber-300 cursor-pointer transition-colors rounded-lg hover:bg-slate-800/80"
              title="Mở lịch chọn ngày"
            >
              <Calendar className="h-4 w-4" />
            </button>
            <input
              ref={dateInputRef}
              type="date"
              value={pickerValue}
              onChange={handleDatePickerChange}
              className="sr-only absolute pointer-events-none opacity-0 w-0 h-0"
              tabIndex={-1}
            />
          </>
        )}
      </div>
      {error && (
        <span className="mt-1 block text-[11px] font-medium text-red-400 leading-snug animate-in fade-in duration-200">
          {error}
        </span>
      )}
    </label>
  );
}
