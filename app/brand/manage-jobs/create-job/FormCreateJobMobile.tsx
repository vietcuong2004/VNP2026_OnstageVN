"use client";

import { useState, useEffect, useMemo, useRef, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { X, ImagePlus, Briefcase, ChevronDown, Pencil, Calendar, Eye, Plus, Trash2 } from "lucide-react";
import { type Campaign } from "@/lib/brand-mvp-data";
import { createBrandCampaign, publishBrandCampaign, uploadBrandCampaignMedia } from "@/lib/brand-api";
import { cn } from "@/lib/utils";
import { TALENT_TYPE_VALUES } from "@/components/ui/ComboboxOptionValues";
import TimePickerInput from "@/components/ui/TimePickerInput";
import BudgetPaymentSection from "./BudgetPaymentSection";
import PreviewJob from "./PreviewJob";

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
  ...TALENT_TYPE_VALUES,
  "Người đẹp",
  "Đại sứ",
];

const POSITION_TYPE_OPTIONS = Array.from(new Set([
  "Diễn viên",
  "Người mẫu",
  "KOL",
  "KOC",
  "Livestreamer",
  "PG/PB",
  "MC",
  "Người đẹp",
  "Hoa hậu",
  ...TALENT_TYPE_VALUES,
]));

function splitOptionText(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.replace(/^[\s•*-]+/, "").trim())
    .filter(Boolean);
}

function joinOptionText(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).join("\n");
}

function stripBulletTextareaValue(value: string) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.replace(/^[\s•*-]+/, ""))
    .join("\n");
}

function formatBulletTextareaValue(value: string) {
  const text = String(value || "");
  if (!text) return "";

  return text
    .split(/\r?\n/)
    .map((item) => item.replace(/^[\s•*-]+/, ""))
    .map((item) => `• ${item}`)
    .join("\n");
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
  return normalizedDigits ? Number(normalizedDigits).toLocaleString("vi-VN") : "";
}

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

function normalizeDateTimeLocalToISO(value: string) {
  return value ? value.replace("T", " ") : "";
}

function formatDateTimeInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function currentDateTimeInputValue(offsetMinutes = 0) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + offsetMinutes);
  return formatDateTimeInputValue(date);
}

function dateFromDateTimeLocal(value: string) {
  return value ? value.slice(0, 10) : "";
}

function buildDateTimeFromDate(value: string, fallbackTime: "08:00" | "22:00") {
  const normalizedDate = parseVietnameseDateToYYYYMMDD(value);
  return normalizedDate ? `${normalizedDate} ${fallbackTime}` : "";
}

function buildFullLocation(address: string, city: string) {
  const normalizedAddress = String(address || "").trim();
  const normalizedCity = String(city || "").trim();

  if (normalizedAddress && normalizedCity && !normalizedAddress.toLowerCase().includes(normalizedCity.toLowerCase())) {
    return `${normalizedAddress}, ${normalizedCity}`;
  }

  return normalizedAddress || normalizedCity;
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
  campaignEvents: [] as CampaignEventDraft[],
  campaignPositions: [] as CampaignPositionDraft[],
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
  let trimmed = dateStr.trim();
  if (trimmed.includes("T")) {
    trimmed = trimmed.split("T")[0];
  }
  return /^\d{1,2}[/\-]\d{1,2}[/\-]\d{4}$/.test(trimmed) || /^\d{4}[/\-]\d{1,2}[/\-]\d{1,2}$/.test(trimmed);
}

function normalizeVietnameseDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (/^\d{4}[/\-]\d{1,2}[/\-]\d{1,2}/.test(trimmed)) {
    return trimmed.includes("T") ? trimmed.slice(0, 16) : parseVietnameseDateToYYYYMMDD(trimmed);
  }
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
  const jobStart = currentDateTimeInputValue();
  const jobEnd = currentDateTimeInputValue(60);

  return {
    ...emptyForm,
    startDate: jobStart,
    endDate: jobEnd,
    deadline: today,
    applicationDeadline: dateFromDateTimeLocal(jobStart),
    eventDate: today,
    campaignPositions: [
      {
        talentType: "KOL",
        quantity: "3",
        requirements: "",
      },
    ],
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
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activePreviewImageIndex, setActivePreviewImageIndex] = useState(0);
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
  const TOTAL_STEPS = 4;

  function syncJobTimelineBeforeNext() {
    if (!form.startDate || !form.endDate) {
      window.alert("Vui lòng chọn thời gian bắt đầu và kết thúc job.");
      return false;
    }

    if (new Date(form.endDate).getTime() <= new Date(form.startDate).getTime()) {
      window.alert("Thời gian kết thúc job phải sau thời gian bắt đầu job.");
      return false;
    }

    if (!form.applicationDeadline) {
      window.alert("Vui lòng chọn hạn ứng tuyển.");
      return false;
    }

    setForm((current) => ({
      ...current,
      deadline: dateFromDateTimeLocal(current.applicationDeadline),
    }));
    setDateErrors({});

    return true;
  }

  function syncPositionsBeforeNext() {
    const normalizedPositions = form.campaignPositions
      .map((position) => ({
        ...position,
        talentType: position.talentType.trim(),
        quantity: String(Math.max(Number(position.quantity) || 1, 1)),
        requirements: splitOptionText(position.requirements).join("\n"),
      }))
      .filter((position) => position.talentType);

    if (normalizedPositions.length === 0) {
      window.alert("Vui lòng thêm ít nhất 1 vị trí tuyển dụng.");
      return false;
    }

    setForm((current) => ({
      ...current,
      campaignPositions: normalizedPositions,
      talentQuantity: String(normalizedPositions.reduce((sum, position) => sum + (Number(position.quantity) || 1), 0)),
      roles: normalizedPositions.map((position) => position.talentType).join("\n"),
      targetProfiles: normalizedPositions.map((position) => position.talentType).join("\n"),
    }));

    return true;
  }

  function syncEventDatesBeforeNext() {
    const normalizedEvents = form.campaignEvents.map((event) => ({
      ...event,
      name: event.name.trim(),
      location: event.location?.trim() || "",
      content: event.content.trim(),
    }));

    for (const [index, event] of normalizedEvents.entries()) {
      if (!event.name || !event.startAt || !event.endAt) {
        window.alert(`Vui lòng nhập đủ tên, thời gian bắt đầu và thời gian kết thúc cho sự kiện ${index + 1}.`);
        return false;
      }

      if (new Date(event.endAt).getTime() <= new Date(event.startAt).getTime()) {
        window.alert(`Thời gian kết thúc của sự kiện ${index + 1} phải sau thời gian bắt đầu.`);
        return false;
      }
    }

    setForm((current) => ({
      ...current,
      campaignEvents: normalizedEvents,
      deadline: dateFromDateTimeLocal(current.applicationDeadline),
      eventDate: normalizedEvents[0]?.startAt ? dateFromDateTimeLocal(normalizedEvents[0].startAt) : current.eventDate,
    }));
    setDateErrors({});

    return true;
  }

  function moveToStep(nextStep: number) {
    if (formStep === 1 && nextStep > 1) {
      if (!syncJobTimelineBeforeNext()) {
        return;
      }
    }
    if (formStep === 3 && nextStep > 3) {
      if (!syncPositionsBeforeNext()) {
        return;
      }
    }
    if (formStep === 4 && nextStep > 4) {
      if (!syncEventDatesBeforeNext()) {
        return;
      }
    }
    const boundedStep = Math.min(Math.max(nextStep, 1), TOTAL_STEPS);
    finalStepSubmitReadyAt.current = boundedStep === TOTAL_STEPS ? Date.now() + 450 : 0;
    setFormStep(boundedStep);
  }

  const STEP_LABELS = ["Tổng quan", "Thông tin", "Yêu cầu", "Sự kiện"];
  const currentStepTitle =
    formStep === 1 ? "Tổng quan"
      : formStep === 2 ? "Thông tin"
        : formStep === 3 ? "Yêu cầu tuyển dụng"
          : "Danh sách các sự kiện";

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

  function updateCampaignEvent(index: number, patch: Partial<CampaignEventDraft>) {
    setForm((current) => ({
      ...current,
      campaignEvents: current.campaignEvents.map((event, eventIndex) =>
        eventIndex === index ? { ...event, ...patch } : event
      ),
    }));
  }

  function addCampaignEvent() {
    const nextIndex = form.campaignEvents.length + 1;

    setForm((current) => ({
      ...current,
      campaignEvents: [
        ...current.campaignEvents,
        {
          name: `${current.title || "Job"} - ${nextIndex}`,
          startAt: buildDateTimeFromDate(current.eventDate || current.startDate, "08:00").replace(" ", "T"),
          endAt: buildDateTimeFromDate(current.eventDate || current.endDate || current.startDate, "22:00").replace(" ", "T"),
          location: buildFullLocation(current.address, current.city),
          content: current.responsibilities,
        },
      ],
    }));
  }

  function removeCampaignEvent(index: number) {
    setForm((current) => ({
      ...current,
      campaignEvents: current.campaignEvents.filter((_, eventIndex) => eventIndex !== index),
    }));
  }

  function updateCampaignPosition(index: number, patch: Partial<CampaignPositionDraft>) {
    setForm((current) => ({
      ...current,
      campaignPositions: current.campaignPositions.map((position, positionIndex) =>
        positionIndex === index ? { ...position, ...patch } : position
      ),
    }));
  }

  function addCampaignPosition() {
    setForm((current) => ({
      ...current,
      campaignPositions: [
        ...current.campaignPositions,
        {
          talentType: "",
          quantity: "1",
          requirements: "",
        },
      ],
    }));
  }

  function removeCampaignPosition(index: number) {
    setForm((current) => ({
      ...current,
      campaignPositions: current.campaignPositions.length > 1
        ? current.campaignPositions.filter((_, positionIndex) => positionIndex !== index)
        : current.campaignPositions,
    }));
  }

  function buildCampaignEventsForPayload() {
    return form.campaignEvents
      .map((event, index) => ({
        name: event.name.trim() || `${form.title || "Job"} - ${index + 1}`,
        start_at: normalizeDateTimeLocalToISO(event.startAt),
        end_at: normalizeDateTimeLocalToISO(event.endAt),
        location: event.location.trim() || buildFullLocation(form.address, form.city),
        content: splitOptionText(event.content),
        sort_order: index,
      }))
      .filter((event) => event.start_at && event.end_at);
  }

  function buildCampaignPositionsForPayload() {
    const normalizedPositions = form.campaignPositions
      .map((position, index) => ({
        talent_type: position.talentType.trim(),
        talent_type_name: position.talentType.trim(),
        quantity: Math.max(1, Number(position.quantity) || 1),
        requirements: splitOptionText(position.requirements || form.requirements),
        sort_order: index,
      }))
      .filter((position) => position.talent_type);

    if (normalizedPositions.length > 0) return normalizedPositions;

    const fallbackTypes = splitOptionText(form.roles || form.targetProfiles || form.jobType);
    return (fallbackTypes.length > 0 ? fallbackTypes : [form.jobType || "KOL"]).map((talentType, index) => ({
      talent_type: talentType,
      talent_type_name: talentType,
      quantity: index === 0 ? Math.max(1, Number(form.talentQuantity) || 1) : 1,
      requirements: splitOptionText(form.requirements),
      sort_order: index,
    }));
  }

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
    if (isSubmitting || formStep !== TOTAL_STEPS) return;
    if (!syncJobTimelineBeforeNext() || !syncPositionsBeforeNext() || !syncEventDatesBeforeNext()) return;

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
    const finalRequirements = [...reqParts, ...splitOptionText(form.requirements)].join("; ") || "Chưa có yêu cầu chi tiết.";
    const campaignEventsForPayload = buildCampaignEventsForPayload();
    const campaignPositionsForPayload = buildCampaignPositionsForPayload();
    const positionNames = campaignPositionsForPayload.map((position) => position.talent_type);
    const updatedForm = {
      ...form,
      requirements: finalRequirements,
      startDate: parseVietnameseDateToYYYYMMDD(form.startDate),
      endDate: parseVietnameseDateToYYYYMMDD(form.endDate),
      deadline: parseVietnameseDateToYYYYMMDD(form.deadline),
      applicationDeadline: parseVietnameseDateToYYYYMMDD(form.applicationDeadline),
      eventDate: parseVietnameseDateToYYYYMMDD(form.eventDate),
      talentQuantity: String(campaignPositionsForPayload.reduce((sum, position) => sum + position.quantity, 0) || Number(form.talentQuantity) || 1),
      roles: positionNames.length > 0 ? positionNames.join("\n") : form.roles,
      targetProfiles: positionNames.length > 0 ? positionNames.join("\n") : form.targetProfiles,
      events: campaignEventsForPayload,
      positions: campaignPositionsForPayload,
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
        events: campaignEventsForPayload.map((event) => ({
          name: event.name,
          startAt: event.start_at,
          endAt: event.end_at,
          location: event.location,
          content: event.content,
          sortOrder: event.sort_order,
        })),
        positions: campaignPositionsForPayload.map((position) => ({
          talentType: position.talent_type,
          quantity: position.quantity,
          requirements: position.requirements,
          sortOrder: position.sort_order,
        })),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-0 backdrop-blur-md animate-in fade-in duration-200 md:relative md:inset-auto md:z-auto md:block md:bg-transparent md:p-0 md:backdrop-blur-0">
      <form
        onSubmit={handleFormSubmit}
        className="relative mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden border-0 border-amber-500/30 bg-[#0c1021] shadow-[0_0_50px_rgba(245,158,11,0.15),0_25px_60px_rgba(0,0,0,0.9)] sm:rounded-3xl sm:border md:mx-0 md:h-auto md:min-h-[calc(100dvh-9rem)] md:max-w-none md:max-h-none"
      >
        {/* Top accent glow line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-500 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.6)]" />

        {/* Ambient background glow accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* ── HEADER with step indicator ── */}
        <div className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-slate-800/80 bg-slate-900/40 shrink-0">
          <div className="mb-2 grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-2">
            <div className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-800 bg-slate-950/60 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className={cn(
                  "flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                  activeTab === "form"
                    ? "bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.35)]"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                )}
              >
                <Briefcase className="h-4 w-4" />
                Tạo job
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                  activeTab === "preview"
                    ? "bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.35)]"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                )}
              >
                <Eye className="h-4 w-4" />
                Xem trước
              </button>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-400 transition-all hover:bg-slate-700/80 hover:text-white"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {activeTab === "form" && <div className="mb-0 flex min-w-0 items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                Bước {formStep}/{TOTAL_STEPS}
              </span>
              <h2 className="min-w-0 truncate text-sm font-black text-white tracking-tight drop-shadow-sm">
                {currentStepTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="hidden text-slate-400 hover:text-white cursor-pointer transition-all p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>}

          {/* Step dots */}
          {false && activeTab === "form" && <div className="flex items-center gap-2">
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
          </div>}
        </div>

        {/* ── STEP CONTENT (scrollable) ── */}
        <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 custom-scrollbar">
          {activeTab === "preview" && (
            <div className="-mx-1 h-full min-h-[calc(100dvh-12rem)] animate-in fade-in slide-in-from-right-4 duration-300">
              <PreviewJob
                form={form}
                imageUrls={imagePreviews}
                activeImageIndex={activePreviewImageIndex}
                onActiveImageIndexChange={setActivePreviewImageIndex}
              />
            </div>
          )}

          {/* STEP 1: Tổng quan */}
          {activeTab === "form" && formStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-md">
                <div className="space-y-4">
                  <FormInput
                    label="Tiêu đề job *"
                    value={form.title}
                    onChange={(value) => setForm((c) => ({ ...c, title: value }))}
                    required
                  />
                  <div className="grid grid-cols-1 gap-4">
                    <DateTimeSplitInput
                      label="Thời gian bắt đầu"
                      value={form.startDate}
                      onChange={(value) => setForm((c) => ({ ...c, startDate: value }))}
                    />
                    <DateTimeSplitInput
                      label="Thời gian kết thúc"
                      value={form.endDate}
                      onChange={(value) => setForm((c) => ({ ...c, endDate: value }))}
                    />
                    <DateOnlyInput
                      label="Hạn ứng tuyển"
                      value={form.applicationDeadline}
                      onChange={(value) => setForm((c) => ({ ...c, applicationDeadline: value, deadline: value }))}
                    />
                  </div>
                </div>
              </div>

              <BudgetPaymentSection
                budgetFrom={budgetFrom}
                budgetTo={budgetTo}
                budgetNegotiable={budgetNegotiable}
                onNegotiableChange={handleBudgetNegotiableChange}
                onBudgetFromChange={(value) => handleBudgetChange(value, budgetFrom, setBudgetFrom, true)}
                onBudgetToChange={(value) => handleBudgetChange(value, budgetTo, setBudgetTo, false)}
              />

              <div className="space-y-3 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-md">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Địa điểm làm việc
                </span>
                <FormInput
                  label="Thành phố *"
                  value={form.city}
                  onChange={(value) => setForm((c) => ({ ...c, city: value }))}
                />
                <FormInput
                  label="Địa điểm cụ thể *"
                  value={form.address}
                  onChange={(value) => setForm((c) => ({ ...c, address: value }))}
                />
              </div>

              <JobImagesUploadSection
                campaignImagesCount={campaignImages.length}
                imagePreviews={imagePreviews}
                onImagesAdd={handleImagesAdd}
                onImageReplace={handleImageReplace}
                onImageDelete={handleImageDelete}
                onPreviewImage={setPreviewImage}
              />
            </div>
          )}

          {/* STEP 2: Thông tin */}
          {activeTab === "form" && formStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="space-y-1.5 block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Mô tả công việc *</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  rows={5}
                  placeholder="Mô tả tổng quan về job, mục tiêu, timeline và nội dung cần talent tham gia..."
                  className="w-full resize-none rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 placeholder:text-slate-500 leading-relaxed hover:border-slate-600 transition-all shadow-inner"
                />
              </label>
              <InlineCustomChoiceField
                label="Lĩnh vực công việc"
                description="Ngăn cách các lĩnh vực bởi dấu phẩy nếu có nhiều lĩnh vực"
                placeholder="Ví dụ: Beauty, Lifestyle, Sự kiện"
                value={form.industries}
                options={INDUSTRY_OPTIONS}
                onChange={(value) => setForm((c) => ({ ...c, industries: value }))}
              />
              <InlineMultilineTextField
                label="Đầu việc chi tiết"
                description="Mỗi dòng là một đầu việc. Có thể nhập nội dung dài, dấu câu và xuống dòng."
                placeholder={"Ví dụ:\nĐón khách tại khu vực check-in\nLivestream giới thiệu sản phẩm theo kịch bản\nChụp ảnh hậu trường sau sự kiện"}
                value={form.responsibilities}
                suggestions={RESPONSIBILITY_OPTIONS.slice(0, 8)}
                onChange={(value) => setForm((c) => ({ ...c, responsibilities: value }))}
              />
              <InlineMultilineTextField
                label="Quyền lợi / Đãi ngộ"
                description="Mỗi dòng là một quyền lợi hoặc đãi ngộ."
                placeholder={"Ví dụ:\nHỗ trợ ăn uống\nTài trợ trang điểm\nNhận thù lao sau khi hoàn thành job"}
                value={form.benefits}
                suggestions={BENEFIT_OPTIONS.slice(0, 8)}
                onChange={(value) => setForm((c) => ({ ...c, benefits: value }))}
              />
            </div>
          )}

          {/* STEP 3: Yêu cầu tuyển dụng */}
          {activeTab === "form" && formStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <GeneralRequirementsSection
                heightMin={form.heightMin}
                weightMax={form.weightMax}
                experienceMin={form.experienceMin}
                requirements={form.requirements}
                onHeightMinChange={(value) => setForm((c) => ({ ...c, heightMin: value }))}
                onWeightMaxChange={(value) => setForm((c) => ({ ...c, weightMax: value }))}
                onExperienceMinChange={(value) => setForm((c) => ({ ...c, experienceMin: value }))}
                onRequirementsChange={(value) => setForm((c) => ({ ...c, requirements: value }))}
              />
              <CampaignPositionsSection
                positions={form.campaignPositions}
                onAdd={addCampaignPosition}
                onRemove={removeCampaignPosition}
                onChange={updateCampaignPosition}
              />
            </div>
          )}

          {/* STEP 4: Danh sách các sự kiện */}
          {activeTab === "form" && formStep === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <CampaignEventsSection
                events={form.campaignEvents}
                defaultLocation={buildFullLocation(form.address, form.city)}
                onAdd={addCampaignEvent}
                onRemove={removeCampaignEvent}
                onChange={updateCampaignEvent}
              />
            </div>
          )}


        </div>

        {/* ── FOOTER navigation ── */}
        {!openDropdown && activeTab === "form" && (
          <div className="relative z-10 flex items-center justify-between gap-3 border-t border-slate-800/80 bg-slate-900/40 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
            <button
              type="button"
              onClick={() => formStep > 1 ? moveToStep(formStep - 1) : handleClose()}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-white cursor-pointer transition-all shadow-sm"
              disabled={isSubmitting}
            >
              {formStep > 1 ? "← Bước trước" : "Hủy"}
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
        )}
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

        {isSubmitting && <CreateJobLoadingOverlay />}

      </form>
    </div>
  );
}

function InlineCustomChoiceField({
  label,
  description,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const selected = splitOptionText(value);

  const addOption = (option: string) => {
    const normalized = option.trim();
    if (!normalized) return;
    onChange(joinOptionText([...selected, normalized]));
  };

  const removeOption = (option: string) => {
    onChange(joinOptionText(selected.filter((item) => item.toLowerCase() !== option.toLowerCase())));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" && event.key !== ",") return;
    event.preventDefault();
    const current = event.currentTarget;
    addOption(current.value);
    current.value = "";
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-md">
      <div>
        <span className="block text-xs font-black uppercase tracking-wider text-amber-300">{label}</span>
        {description && <span className="mt-1 block text-[11px] font-medium text-slate-400">{description}</span>}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          addOption(event.currentTarget.value);
          event.currentTarget.value = "";
        }}
        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3.5 py-2.5 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
      />
      <div className="flex flex-wrap gap-2">
        {options.slice(0, 12).map((option) => {
          const isSelected = selected.some((item) => item.toLowerCase() === option.toLowerCase());

          return (
            <button
              key={option}
              type="button"
              onClick={() => isSelected ? removeOption(option) : addOption(option)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition",
                isSelected
                  ? "border-amber-400/60 bg-amber-400/15 text-amber-200"
                  : "border-slate-700 bg-slate-950/70 text-slate-300 hover:border-amber-400/40 hover:text-white"
              )}
            >
              {isSelected ? "✓ " : "+ "}{option}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Đã chọn</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {selected.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => removeOption(item)}
                className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold text-amber-200"
              >
                {item} ×
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InlineMultilineTextField({
  label,
  description,
  value,
  suggestions,
  placeholder,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  suggestions: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const items = splitOptionText(value);

  const addSuggestion = (suggestion: string) => {
    onChange(joinOptionText([...items, suggestion]));
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-md">
      <div>
        <span className="block text-xs font-black uppercase tracking-wider text-amber-300">{label}</span>
        {description && <span className="mt-1 block text-[11px] font-medium text-slate-400">{description}</span>}
      </div>
      <textarea
        value={stripBulletTextareaValue(value)}
        onChange={(event) => onChange(stripBulletTextareaValue(event.target.value))}
        onBlur={(event) => onChange(stripBulletTextareaValue(event.target.value))}
        rows={5}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-slate-700/80 bg-slate-950/70 px-3.5 py-2.5 text-xs leading-relaxed text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
      />
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => {
          const isSelected = items.some((item) => item.toLowerCase() === suggestion.toLowerCase());

          return (
            <button
              key={suggestion}
              type="button"
              onClick={() => addSuggestion(suggestion)}
              disabled={isSelected}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[10px] font-bold transition",
                isSelected
                  ? "cursor-not-allowed border-amber-400/35 bg-amber-400/10 text-amber-200/70"
                  : "border-slate-700 bg-slate-950/70 text-slate-300 hover:border-amber-400/40 hover:text-white"
              )}
            >
              + {suggestion}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GeneralRequirementsSection({
  heightMin,
  weightMax,
  experienceMin,
  requirements,
  onHeightMinChange,
  onWeightMaxChange,
  onExperienceMinChange,
  onRequirementsChange,
}: {
  heightMin: string;
  weightMax: string;
  experienceMin: string;
  requirements: string;
  onHeightMinChange: (value: string) => void;
  onWeightMaxChange: (value: string) => void;
  onExperienceMinChange: (value: string) => void;
  onRequirementsChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-md">
      <div>
        <span className="block text-xs font-black uppercase tracking-wider text-amber-300">Yêu cầu chung</span>
        <span className="mt-1 block text-[11px] font-medium text-slate-400">
          Lưu vào trường yêu cầu chung của job.
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <NumberRequirementInput label="Chiều cao tối thiểu" suffix="cm" value={heightMin} onChange={onHeightMinChange} />
        <NumberRequirementInput label="Cân nặng tối đa" suffix="kg" value={weightMax} onChange={onWeightMaxChange} />
        <NumberRequirementInput label="Kinh nghiệm tối thiểu" suffix="năm" value={experienceMin} onChange={onExperienceMinChange} />
      </div>
      <InlineBulletTextarea
        label="Yêu cầu khác"
        value={requirements}
        placeholder={"Ví dụ:\nCó khả năng livestream tự nhiên\nĐúng giờ và chủ động phối hợp\nCó portfolio hoặc sản phẩm đã tham gia"}
        onChange={onRequirementsChange}
      />
    </div>
  );
}

function NumberRequirementInput({
  label,
  suffix,
  value,
  onChange,
}: {
  label: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">{label}</span>
      <div className="flex items-center rounded-xl border border-slate-700/80 bg-slate-950/70 px-3.5 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-xs text-slate-100 outline-none placeholder:text-slate-500"
        />
        <span className="shrink-0 text-[11px] font-bold text-slate-500">{suffix}</span>
      </div>
    </label>
  );
}

function InlineBulletTextarea({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">{label}</span>
      <textarea
        value={stripBulletTextareaValue(value)}
        onChange={(event) => onChange(stripBulletTextareaValue(event.target.value))}
        rows={4}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-slate-700/80 bg-slate-950/70 px-3.5 py-2.5 text-xs leading-relaxed text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
      />
    </label>
  );
}

function CampaignPositionsSection({
  positions,
  onAdd,
  onRemove,
  onChange,
}: {
  positions: CampaignPositionDraft[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, patch: Partial<CampaignPositionDraft>) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="block text-xs font-black uppercase tracking-wider text-amber-300">
            Vị trí tuyển dụng
          </span>
          <span className="mt-1 block text-[11px] font-medium text-slate-400">
            Có thể thêm nhiều loại talent cho cùng một job.
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300 transition hover:bg-amber-400/20"
          title="Thêm vị trí"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {positions.map((position, index) => (
          <div key={`position-${index}`} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                Vị trí #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={positions.length <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/10 text-red-300 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                title="Xóa vị trí"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Loại talent</span>
                <input
                  list={`position-type-options-${index}`}
                  value={position.talentType}
                  placeholder="KOL, Model, MC..."
                  onChange={(event) => onChange(index, { talentType: event.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
                <datalist id={`position-type-options-${index}`}>
                  {POSITION_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </label>
              <FormInput
                label="Số lượng"
                type="number"
                value={position.quantity}
                onChange={(value) => onChange(index, { quantity: value })}
              />
            </div>
            <InlineBulletTextarea
              label="Yêu cầu riêng"
              value={position.requirements}
              placeholder="Mỗi dòng là một yêu cầu riêng cho vị trí này"
              onChange={(value) => onChange(index, { requirements: value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignEventsSection({
  events,
  defaultLocation,
  onAdd,
  onRemove,
  onChange,
}: {
  events: CampaignEventDraft[];
  defaultLocation: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, patch: Partial<CampaignEventDraft>) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="block text-xs font-black uppercase tracking-wider text-amber-300">
            Sự kiện trong job
          </span>
          <span className="mt-1 block text-[11px] font-medium text-slate-400">
            Không thêm sự kiện thì hệ thống sẽ dùng thời gian chính của job.
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300 transition hover:bg-amber-400/20"
          title="Thêm sự kiện"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-[11px] font-semibold text-slate-400">
          Chưa thêm sự kiện riêng. Khi lưu, job vẫn có một sự kiện mặc định từ thời gian và địa điểm đã nhập.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={`event-${index}`} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                  Sự kiện #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/10 text-red-300 transition hover:bg-red-400/20"
                  title="Xóa sự kiện"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <FormInput
                label="Tên sự kiện"
                value={event.name}
                placeholder="Casting, Livestream, Chụp lookbook..."
                onChange={(value) => onChange(index, { name: value })}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 block">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Bắt đầu</span>
                  <input
                    type="datetime-local"
                    value={event.startAt}
                    onChange={(e) => onChange(index, { startAt: e.target.value })}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  />
                </label>
                <label className="space-y-1.5 block">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Kết thúc</span>
                  <input
                    type="datetime-local"
                    value={event.endAt}
                    onChange={(e) => onChange(index, { endAt: e.target.value })}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  />
                </label>
              </div>
              <FormInput
                label="Địa điểm sự kiện"
                value={event.location}
                placeholder={defaultLocation || "Địa điểm tổ chức"}
                onChange={(value) => onChange(index, { location: value })}
              />
              <label className="space-y-1.5 block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Nội dung sự kiện</span>
                <textarea
                  value={event.content}
                  onChange={(e) => onChange(index, { content: e.target.value })}
                  rows={3}
                  placeholder="Mỗi dòng là một nội dung cần tham gia"
                  className="w-full resize-none rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateJobLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-[#020408]/90 px-6 text-center backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl border border-amber-400/25 bg-[#0c1021] p-7 shadow-[0_0_60px_rgba(245,158,11,0.2)]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
        <h3 className="mt-5 text-base font-black uppercase tracking-wide text-white">
          Đang tạo job
        </h3>
        <p className="mt-2 text-sm font-semibold text-slate-300">
          Vui lòng chờ, hệ thống đang lưu thông tin và tải ảnh lên.
        </p>
      </div>
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

  const allSelected = options.length > 0 && options.every((option) => selectedSet.has(option));
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
          <div className="fixed inset-0 z-[100] sm:absolute sm:inset-auto sm:left-0 sm:right-0 sm:top-full sm:z-[70] sm:mt-2 h-full sm:h-auto max-h-full sm:max-h-[85vh] rounded-none sm:rounded-2xl border-0 sm:border border-amber-500/30 bg-[#0c1021] sm:bg-[#0d1226] p-4 sm:p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-in fade-in sm:zoom-in-95 duration-150 flex flex-col justify-between overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800 shrink-0">
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 px-5 py-2 sm:py-1.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Xong
                </button>
              </div>
            </div>

            {/* Content area scrollable */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {/* Checkboxes grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {options.map((option) => {
                  const checked = selectedSet.has(option);

                  return (
                    <label
                      key={option}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 sm:py-2 text-xs font-medium transition-all",
                        checked
                          ? "border-amber-400/50 bg-amber-400/15 text-amber-200 font-bold shadow-sm"
                          : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOption(option)}
                        className="h-4 w-4 sm:h-3.5 sm:w-3.5 shrink-0 rounded accent-amber-400 cursor-pointer"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>

              {/* Multiline textarea for entering custom items inside popover */}
              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-left">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  Nhập thêm tùy chỉnh (mỗi dòng 1 mục):
                </span>
                <textarea
                  value={customTextValue}
                  onChange={(event) => handleTextChange(event.target.value)}
                  rows={4}
                  placeholder={placeholder || "Nhập thêm tùy chỉnh, mỗi dòng 1 mục..."}
                  className="w-full resize-none rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-inner"
                />
              </div>
            </div>

            {/* Bottom sticky confirm button for mobile */}
            <div className="pt-3 mt-3 border-t border-slate-800 shrink-0 sm:hidden">
              <button
                type="button"
                onClick={() => setOpenDropdown(null)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer"
              >
                Hoàn tất chọn
              </button>
            </div>
          </div>
        )}
      </div>
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

function DateOnlyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">{label}</span>
      <div className="relative">
        <input
          type="date"
          value={parseVietnameseDateToYYYYMMDD(value)}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        />
      </div>
    </label>
  );
}

function JobImagesUploadSection({
  campaignImagesCount,
  imagePreviews,
  onImagesAdd,
  onImageReplace,
  onImageDelete,
  onPreviewImage,
}: {
  campaignImagesCount: number;
  imagePreviews: string[];
  onImagesAdd: (files: File[]) => void;
  onImageReplace: (index: number, file: File) => void;
  onImageDelete: (index: number) => void;
  onPreviewImage: (url: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 text-left shadow-md">
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="block text-xs font-black uppercase tracking-wider text-amber-300">Bộ ảnh job</span>
          <span className="mt-1 block text-[11px] font-medium text-slate-400">
            Tải tối đa 10 ảnh. Ảnh đầu tiên sẽ là cover.
          </span>
        </div>
        <span className="shrink-0 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
          {campaignImagesCount}/10 ảnh
        </span>
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
        {campaignImagesCount < 10 && (
          <label className="group relative flex aspect-[4/5] w-[116px] shrink-0 snap-start cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-amber-400/40 bg-amber-500/5 p-4 text-center transition-all hover:border-amber-400 hover:bg-amber-500/10">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => onImagesAdd(Array.from(event.target.files || []))}
              className="hidden"
            />
            <ImagePlus className="mb-2 h-7 w-7 text-amber-400 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-[10px] font-black uppercase tracking-wider text-white">Tải ảnh</span>
            <span className="mt-1 text-[9px] font-medium leading-relaxed text-slate-400">JPG, PNG, WebP</span>
          </label>
        )}
        {imagePreviews.map((url, idx) => (
          <div key={url} className="group relative aspect-[4/5] w-[116px] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-md">
            <img
              src={url}
              alt="Job preview"
              className="h-full w-full cursor-pointer object-cover transition duration-300 group-hover:scale-[1.05]"
              onClick={() => onPreviewImage(url)}
            />
            <button
              type="button"
              onClick={() => onImageDelete(idx)}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-slate-950/80 text-white shadow-lg backdrop-blur transition hover:border-red-500 hover:bg-red-500"
              title="Xóa ảnh"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <label className="absolute right-12 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-950/80 text-white shadow-lg backdrop-blur transition hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950">
              <Pencil className="h-3.5 w-3.5" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onImageReplace(idx, file);
                }}
                className="hidden"
              />
            </label>
            {idx === 0 && (
              <span className="absolute bottom-2 left-2 rounded-full bg-gradient-to-r from-amber-300 to-yellow-500 px-2 py-0.5 text-[9px] font-black uppercase text-slate-950 shadow-md">
                Cover
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DateTimeSplitInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [datePart = "", timePart = ""] = String(value || "").split("T");
  const validTimePart = /^\d{2}:\d{2}$/.test(timePart) ? timePart : timePart || "00:00";

  const handleDateChange = (nextDate: string) => {
    onChange(`${nextDate}T${validTimePart}`);
  };

  const handleTimeChange = (nextTime: string) => {
    onChange(`${datePart || currentDateTimeInputValue().slice(0, 10)}T${nextTime}`);
  };

  return (
    <label className="space-y-1.5 block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">{label}</span>
      <div className="grid grid-cols-[minmax(0,1fr)_6.75rem] gap-2">
        <input
          type="date"
          value={datePart}
          onChange={(event) => handleDateChange(event.target.value)}
          className="min-w-0 w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none shadow-inner transition-all hover:border-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        />
        <TimePickerInput value={validTimePart} onChange={handleTimeChange} />
      </div>
    </label>
  );
}
