"use client";

import { useState, useEffect, useMemo, useRef, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { X, ImagePlus, ChevronDown, Pencil, Calendar, Plus, Trash2 } from "lucide-react";
import { type Campaign } from "@/lib/brand-mvp-data";
import { createBrandCampaign, publishBrandCampaign, uploadBrandCampaignMedia } from "@/lib/brand-api";
import { cn } from "@/lib/utils";
import { TALENT_TYPE_VALUES } from "@/components/ui/ComboboxOptionValues";
import TimePickerInput from "@/components/ui/TimePickerInput";
import { networkInterfaces } from "os";
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

function normalizeDateTimeLocalToISO(value: string) {
  return value ? value.replace("T", " ") : "";
}

function dateFromDateTimeLocal(value: string) {
  return value ? value.slice(0, 10) : "";
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
  const jobStart = currentDateTimeInputValue();
  const jobEnd = currentDateTimeInputValue(60);

  return {
    ...emptyForm,
    startDate: jobStart,
    endDate: jobEnd,
    deadline: today,
    applicationDeadline: dateFromDateTimeLocal(jobStart),
    eventDate: today,
    campaignEvents: [] as CampaignEventDraft[],
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activePreviewImageIndex, setActivePreviewImageIndex] = useState(0);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
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
    setActivePreviewImageIndex((current) => Math.max(0, Math.min(current, campaignImages.length - 2)));
  };

  const [dateErrors, setDateErrors] = useState<{
    startDate?: string;
    endDate?: string;
    applicationDeadline?: string;
    eventDate?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const TOTAL_STEPS = 4;

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
          name: `Sự kiện ${nextIndex}`,
          startAt: currentDateTimeInputValue(),
          endAt: currentDateTimeInputValue(60),
          location: buildFullLocation(current.address, current.city),
          content: "",
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

  function handleClose() {
    setForm(createDefaultForm());
    setDateErrors({});
    setBudgetFrom("");
    setBudgetTo("");
    setBudgetNegotiable(false);
    setCampaignImages([]);
    setOpenDropdown(null);
    setShowPublishDialog(false);
    setFormStep(1);
    onClose();
  }

  function handleFormSubmit(event: React.FormEvent) {
    event.preventDefault();
    handleNextStep();
  }

  function handlePreviousStep() {
    moveToStep(formStep - 1);
  }

  function handleNextStep() {
    if (formStep < TOTAL_STEPS) {
      moveToStep(formStep + 1);
      return;
    }

    if (!syncJobTimelineBeforeNext() || !syncEventDatesBeforeNext()) {
      return;
    }

    setShowPublishDialog(true);
  }

  async function handleCreateCampaign() {
    if (isSubmitting || formStep !== TOTAL_STEPS) return;

    setIsSubmitting(true);
    setShowPublishDialog(false);
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
    reqParts.push(...splitOptionText(form.requirements));
    const finalRequirements = reqParts.join("; ") || "Chưa có yêu cầu chi tiết.";
    const campaignEventsForPayload = form.campaignEvents.map((event, index) => ({
      name: event.name,
      start_at: event.startAt,
      end_at: event.endAt,
      location: event.location || "",
      content: splitOptionText(event.content),
      sort_order: index,
    }));
    const campaignPositionsForPayload = form.campaignPositions
      .map((position, index) => ({
        talent_type: position.talentType.trim(),
        talent_type_name: position.talentType.trim(),
        quantity: Math.max(Number(position.quantity) || 1, 1),
        requirements: splitOptionText(position.requirements),
        sort_order: index,
      }))
      .filter((position) => position.talent_type);
    const positionNames = campaignPositionsForPayload.map((position) => position.talent_type);
    const updatedForm = {
      ...form,
      roles: positionNames.join("\n") || form.roles || form.targetProfiles,
      targetProfiles: positionNames.join("\n") || form.targetProfiles,
      talentQuantity: String(campaignPositionsForPayload.reduce((sum, position) => sum + position.quantity, 0) || Number(form.talentQuantity) || 1),
      requirements: finalRequirements,
      startDate: normalizeDateTimeLocalToISO(form.startDate),
      endDate: normalizeDateTimeLocalToISO(form.endDate),
      deadline: parseVietnameseDateToYYYYMMDD(form.deadline),
      applicationDeadline: normalizeDateTimeLocalToISO(form.applicationDeadline),
      eventDate: parseVietnameseDateToYYYYMMDD(form.eventDate),
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
    <div className="flex h-full min-h-0 w-full gap-4 bg-[#050711] p-3 animate-in fade-in duration-200">
      <form
        onSubmit={handleFormSubmit}
        className="relative flex h-full min-w-0 flex-1 basis-1/2 flex-col overflow-hidden rounded-2xl border border-amber-500/25 bg-[#0c1021] shadow-[0_0_50px_rgba(245,158,11,0.12)]"
      >
        {/* Top accent glow line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-500 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.6)]" />

        {/* Ambient background glow accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* ── HEADER with step indicator ── */}
        <div className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-slate-800/80 bg-slate-900/40 shrink-0">
          <div className="flex items-start justify-between mb-3.5">
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-white drop-shadow-sm">
                Tạo Job Mới
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                  Bước {formStep}/{TOTAL_STEPS}
                </span>
                <h2 className="text-lg font-black text-white tracking-tight drop-shadow-sm">
                  {currentStepTitle}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-slate-400 hover:text-white cursor-pointer transition-all p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Step dots */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
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

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handlePreviousStep}
                disabled={formStep <= 1}
                className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-200 transition hover:border-amber-400/50 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.35)] transition hover:brightness-110 active:scale-95"
              >
                {formStep === TOTAL_STEPS ? "Hoàn thành" : "Tiếp"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {/* ── STEP CONTENT (scrollable) ── */}
          <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 custom-scrollbar">

            {/* STEP 1: Thông tin cơ bản */}
            {formStep === 1 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="sm:col-span-2">
                  <JobTitleInput
                    label="Tiêu đề job *"
                    value={form.title}
                    onChange={(value) => setForm((c) => ({ ...c, title: value }))}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:col-span-2 xl:grid-cols-3">
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
                <BudgetPaymentSection
                  budgetFrom={budgetFrom}
                  budgetTo={budgetTo}
                  budgetNegotiable={budgetNegotiable}
                  onNegotiableChange={handleBudgetNegotiableChange}
                  onBudgetFromChange={(value) => handleBudgetChange(value, budgetFrom, setBudgetFrom, true)}
                  onBudgetToChange={(value) => handleBudgetChange(value, budgetTo, setBudgetTo, false)}
                />
                <div className="space-y-3 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-md sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    Địa điểm làm việc
                  </span>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormInput label="Thành phố *" value={form.city} onChange={(value) => setForm((c) => ({ ...c, city: value }))} />
                    <FormInput label="Địa điểm cụ thể *" value={form.address} onChange={(value) => setForm((c) => ({ ...c, address: value }))} />
                  </div>
                </div>
                <JobImagesUploadSection
                  campaignImagesCount={campaignImages.length}
                  imagePreviews={imagePreviews}
                  onImagesAdd={handleImagesAdd}
                  onImageReplace={handleImageReplace}
                  onImageDelete={handleImageDelete}
                  onPreviewImage={setActivePreviewImageIndex}
                />
              </div>
            )}

            {/* STEP 2: Thông tin công việc */}
            {formStep === 2 && (
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
                  description="Mỗi dòng là một đầu việc"
                  placeholder={"Ví dụ:\nĐón khách\nChụp ảnh sản phẩm\nGiao lưu khán giả"}
                  value={form.responsibilities}
                  suggestions={RESPONSIBILITY_OPTIONS.slice(0, 8)}
                  onChange={(value) => setForm((c) => ({ ...c, responsibilities: value }))}
                />
                <InlineMultilineTextField
                  label="Quyền lợi / đãi ngộ"
                  description="Mỗi dòng là một quyền lợi hoặc đãi ngộ"
                  placeholder={"Ví dụ:\nHỗ trợ ăn uống\nTài trợ trang điểm\nMở rộng mạng lưới"}
                  value={form.benefits}
                  suggestions={BENEFIT_OPTIONS.slice(0, 8)}
                  onChange={(value) => setForm((c) => ({ ...c, benefits: value }))}
                />
              </div>
            )}

            {/* STEP 3: Yêu cầu tuyển dụng */}
            {formStep === 3 && (
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
            {formStep === 4 && (
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

        {showPublishDialog && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-[#0c1021] p-6 text-left shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black uppercase tracking-tight text-white">
                  Bạn có muốn đăng job này?
                </h3>
                <p className="text-sm font-medium leading-relaxed text-slate-400">
                  Job sẽ được đăng để Talent có thể xem thông tin và ứng tuyển.
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCreateCampaign}
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 px-5 py-3 text-sm font-black uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(245,158,11,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Đang đăng..." : "Đăng ngay"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPublishDialog(false)}
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl border border-slate-700/80 bg-slate-900/80 px-5 py-3 text-sm font-black uppercase tracking-wider text-slate-200 transition hover:border-amber-400/50 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Chỉnh sửa lại
                </button>
              </div>
            </div>
          </div>
        )}

        {isSubmitting && <CreateJobLoadingOverlay />}

      </form>
      <PreviewJob
        form={form}
        imageUrls={imagePreviews}
        activeImageIndex={activePreviewImageIndex}
        onActiveImageIndexChange={setActivePreviewImageIndex}
      />
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

function JobTitleInput({
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
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        rows={2}
        wrap="soft"
        placeholder="Nhập tiêu đề job"
        className="min-h-[3.25rem] w-full resize-y rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs leading-relaxed text-slate-100 outline-none shadow-inner transition-all placeholder:text-slate-500 hover:border-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 break-words [overflow-wrap:anywhere]"
      />
    </label>
  );
}

function InlineCustomChoiceField({
  label,
  description,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  description: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const selectedItems = splitOptionText(value);
  const selectedSet = new Set(selectedItems);
  const optionSet = new Set(options);
  const customItems = selectedItems.filter((item) => !optionSet.has(item));
  const textValue = selectedItems.join(", ");
  const allSelected = options.length > 0 && options.every((option) => selectedSet.has(option));
  const someSelected = options.some((option) => selectedSet.has(option)) && !allSelected;

  function toggleAll() {
    if (allSelected) {
      onChange(joinOptionText(selectedItems.filter((item) => !optionSet.has(item))));
      return;
    }

    onChange(joinOptionText([...options, ...customItems]));
  }

  function toggleOption(option: string) {
    const next = selectedSet.has(option)
      ? selectedItems.filter((item) => item !== option)
      : [...selectedItems, option];

    onChange(joinOptionText(next));
  }

  function handleTextChange(newVal: string) {
    const nextItems = newVal
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .join("\n");

    onChange(nextItems);
  }

  return (
    <section className="space-y-3 rounded-2xl border border-amber-500/30 bg-[#0d1226] p-4 text-left shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
      <div className="space-y-1 border-b border-slate-800 pb-3">
        <span className="block text-[11px] font-black uppercase tracking-wider text-amber-300">
          {label}
        </span>
        <span className="block text-[10px] font-semibold text-slate-400">
          {description}
        </span>
      </div>

      <textarea
        value={textValue}
        onChange={(event) => handleTextChange(event.target.value)}
        rows={4}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 outline-none placeholder:text-sm placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-inner"
      />

      <div className="space-y-3 border-t border-slate-800/80 pt-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Gợi ý
          </span>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs font-bold text-slate-200 transition-colors hover:text-amber-300">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = someSelected;
                }
              }}
              onChange={toggleAll}
              className="h-4 w-4 shrink-0 cursor-pointer rounded accent-amber-400"
            />
            <span>{allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((option) => {
            const checked = selectedSet.has(option);

            return (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all sm:py-2",
                  checked
                    ? "border-amber-400/50 bg-amber-400/15 font-bold text-amber-200 shadow-sm"
                    : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleOption(option)}
                  className="h-4 w-4 shrink-0 cursor-pointer rounded accent-amber-400 sm:h-3.5 sm:w-3.5"
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function InlineMultilineTextField({
  label,
  description,
  placeholder,
  value,
  suggestions = [],
  onChange,
}: {
  label: string;
  description: string;
  placeholder: string;
  value: string;
  suggestions?: string[];
  onChange: (value: string) => void;
}) {
  const selectedItems = splitOptionText(value);
  const selectedSet = new Set(selectedItems);
  const visibleSuggestions = suggestions.slice(0, 8);
  const allSelected = visibleSuggestions.length > 0 && visibleSuggestions.every((suggestion) => selectedSet.has(suggestion));
  const someSelected = visibleSuggestions.some((suggestion) => selectedSet.has(suggestion)) && !allSelected;
  const bulletValue = formatBulletTextareaValue(value);

  function handleTextChange(nextValue: string) {
    onChange(stripBulletTextareaValue(nextValue));
  }

  function handleTextKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const nextDisplayValue = `${target.value.slice(0, start)}\n• ${target.value.slice(end)}`;

    handleTextChange(nextDisplayValue);

    window.requestAnimationFrame(() => {
      const nextPosition = start + 3;
      target.setSelectionRange(nextPosition, nextPosition);
    });
  }

  function toggleSuggestion(suggestion: string) {
    const next = selectedSet.has(suggestion)
      ? selectedItems.filter((item) => item !== suggestion)
      : [...selectedItems, suggestion];

    onChange(joinOptionText(next));
  }

  function toggleAllSuggestions() {
    if (allSelected) {
      onChange(joinOptionText(selectedItems.filter((item) => !visibleSuggestions.includes(item))));
      return;
    }

    onChange(joinOptionText([...selectedItems, ...visibleSuggestions]));
  }

  return (
    <section className="space-y-3 rounded-2xl border border-amber-500/30 bg-[#0d1226] p-4 text-left shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
      <div className="space-y-1 border-b border-slate-800 pb-3">
        <span className="block text-[11px] font-black uppercase tracking-wider text-amber-300">
          {label}
        </span>
        <span className="block text-[10px] font-semibold text-slate-400">
          {description}
        </span>
      </div>

      <textarea
        value={bulletValue}
        onChange={(event) => handleTextChange(event.target.value)}
        onFocus={() => {
          if (!value.trim()) {
            onChange("");
          }
        }}
        onKeyDown={handleTextKeyDown}
        rows={6}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-sm leading-relaxed text-slate-100 outline-none shadow-inner placeholder:text-sm placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
      />

      {visibleSuggestions.length > 0 && (
        <div className="space-y-3 border-t border-slate-800/80 pt-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Gợi ý
            </span>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs font-bold text-slate-200 transition-colors hover:text-amber-300">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someSelected;
                  }
                }}
                onChange={toggleAllSuggestions}
                className="h-4 w-4 shrink-0 cursor-pointer rounded accent-amber-400"
              />
              <span>{allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {visibleSuggestions.map((suggestion) => {
              const checked = selectedSet.has(suggestion);

              return (
                <label
                  key={suggestion}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all sm:py-2",
                    checked
                      ? "border-amber-400/50 bg-amber-400/15 font-bold text-amber-200 shadow-sm"
                      : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSuggestion(suggestion)}
                    className="h-4 w-4 shrink-0 cursor-pointer rounded accent-amber-400 sm:h-3.5 sm:w-3.5"
                  />
                  <span>{suggestion}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </section>
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
    <section className="space-y-4 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 text-left shadow-md">
      <div className="space-y-1 border-b border-slate-800 pb-3">
        <span className="block text-xs font-black uppercase tracking-wider text-amber-300">
          Yêu cầu chung
        </span>
        <span className="block text-[10px] font-semibold text-slate-400">
          Thiết lập các điều kiện cơ bản và nhập thêm yêu cầu riêng nếu cần
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <NumberRequirementInput
          label="Chiều cao tối thiểu (cm)"
          value={heightMin}
          placeholder="Nhập chiều cao"
          onChange={onHeightMinChange}
        />
        <NumberRequirementInput
          label="Cân nặng tối đa (kg)"
          value={weightMax}
          placeholder="Nhập cân nặng"
          onChange={onWeightMaxChange}
        />
        <NumberRequirementInput
          label="Kinh nghiệm tối thiểu (năm)"
          value={experienceMin}
          placeholder="Số năm kinh nghiệm"
          onChange={onExperienceMinChange}
        />
      </div>

      <InlineBulletTextarea
        label="Yêu cầu khác"
        description="Mỗi dòng là một yêu cầu"
        value={requirements}
        placeholder={"Ví dụ:\nCó hình ảnh cá nhân chuyên nghiệp\nCó khả năng làm việc theo brief\nĐúng giờ và phối hợp tốt với ekip"}
        onChange={onRequirementsChange}
      />
    </section>
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
    <section className="space-y-4 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 text-left shadow-md">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-1">
          <span className="block text-xs font-black uppercase tracking-wider text-amber-300">
            Vị trí tuyển dụng
          </span>
          <span className="block text-[10px] font-semibold text-slate-400">
            Mỗi vị trí có số lượng và yêu cầu riêng
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 text-xs font-black uppercase tracking-wider text-amber-200 transition-all hover:bg-amber-400/20 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Thêm vị trí
        </button>
      </div>

      <datalist id="campaign-position-options">
        {TARGET_PROFILE_OPTIONS.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {positions.map((position, index) => (
          <article key={index} className="flex flex-col justify-between rounded-2xl border border-slate-700/80 bg-slate-950/45 p-4">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Vị trí {String(index + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  disabled={positions.length <= 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-400 transition hover:border-red-400/50 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Xóa vị trí"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_6.5rem]">
                <label className="space-y-1.5 block">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Chọn vị trí
                  </span>
                  <input
                    list="campaign-position-options"
                    value={position.talentType}
                    onChange={(event) => onChange(index, { talentType: event.target.value })}
                    placeholder="Ví dụ: KOL, Model, Livestreamer"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 shadow-inner outline-none transition-all placeholder:text-slate-500 hover:border-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  />
                </label>
                <NumberRequirementInput
                  label="Số lượng"
                  value={position.quantity}
                  placeholder="1"
                  onChange={(value) => onChange(index, { quantity: value })}
                />
              </div>

              <div className="mt-4">
                <InlineBulletTextarea
                  label="Yêu cầu riêng"
                  description="Mỗi dòng là một yêu cầu cho vị trí này"
                  value={position.requirements}
                  placeholder={"Ví dụ:\nCó tối thiểu 50.000 follower\nNội dung phù hợp lĩnh vực làm đẹp\nTỷ lệ tương tác tốt"}
                  onChange={(value) => onChange(index, { requirements: value })}
                />
              </div>
            </div>
          </article>
        ))}

        {/* Card bấm để thêm vị trí tuyển dụng mới */}
        <button
          type="button"
          onClick={onAdd}
          className="group flex min-h-[260px] h-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-amber-500/35 bg-amber-500/5 p-6 text-center transition-all hover:border-amber-400 hover:bg-amber-500/10 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] active:scale-[0.99] cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <span className="block text-sm font-black uppercase tracking-wider text-amber-300 group-hover:text-amber-200">
              Thêm vị trí
            </span>
            <span className="block text-xs font-medium text-slate-400 group-hover:text-slate-300">
              Tạo vị trí tuyển dụng tiếp theo
            </span>
          </div>
        </button>
      </div>
    </section>
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
    <section className="space-y-4 text-left">
      <div className="space-y-1">
        <div className="space-y-1">
          <span className="block text-xs font-black uppercase tracking-wider text-amber-300">
            Danh sách các sự kiện
          </span>
          <span className="block text-[10px] font-semibold text-slate-400">
            Nhập thông tin các sự kiện diễn ra trong job/chiến dịch này. Bạn có thể bỏ qua bước này nếu job không có sự kiện chính nào
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {events.map((event, index) => (
          <article key={index} className="rounded-2xl border border-slate-700/80 bg-slate-950/45 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                Sự kiện {String(index + 1).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={false}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-400 transition hover:border-red-400/50 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                title="Xóa sự kiện"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormInput
                label="Tên sự kiện"
                value={event.name}
                onChange={(value) => onChange(index, { name: value })}
                placeholder="Ví dụ: Photoshoot truyền thông"
              />
              <div className="grid grid-cols-1 gap-4">
                <DateTimeSplitInput
                  label="Thời gian bắt đầu"
                  value={event.startAt}
                  onChange={(value) => onChange(index, { startAt: value })}
                />
                <DateTimeSplitInput
                  label="Thời gian kết thúc"
                  value={event.endAt}
                  onChange={(value) => onChange(index, { endAt: value })}
                />
              </div>
              <FormInput
                label="Địa điểm tổ chức"
                value={event.location}
                onChange={(value) => onChange(index, { location: value })}
                placeholder={defaultLocation || "Ví dụ: Studio 102 Nguyễn Huệ, Quận 1, Hồ Chí Minh"}
              />
              <label className="space-y-1.5 block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Nội dung sự kiện
                </span>
                <textarea
                  value={event.content}
                  onChange={(eventChange) => onChange(index, { content: eventChange.target.value })}
                  rows={4}
                  placeholder="Ví dụ: Chụp ảnh sản phẩm, ảnh nhóm và nội dung truyền thông theo concept của thương hiệu."
                  className="w-full resize-y rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-sm leading-relaxed text-slate-100 outline-none shadow-inner placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
              </label>
            </div>
          </article>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="group flex min-h-[320px] h-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-amber-500/35 bg-amber-500/5 p-6 text-center transition-all hover:border-amber-400 hover:bg-amber-500/10 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] active:scale-[0.99] cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <span className="block text-sm font-black uppercase tracking-wider text-amber-300 group-hover:text-amber-200">
              Thêm sự kiện
            </span>
            <span className="block text-xs font-medium text-slate-400 group-hover:text-slate-300">
              Tạo mốc sự kiện tiếp theo
            </span>
          </div>
        </button>
      </div>
    </section>
  );
}

function NumberRequirementInput({
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
    <div className="space-y-1.5 text-left">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
        {label}
      </span>
      <input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 shadow-inner outline-none transition-all placeholder:text-slate-500 hover:border-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
      />
    </div>
  );
}

function InlineBulletTextarea({
  label,
  description,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const bulletValue = formatBulletTextareaValue(value);

  function handleTextChange(nextValue: string) {
    onChange(stripBulletTextareaValue(nextValue));
  }

  function handleTextKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const nextDisplayValue = `${target.value.slice(0, start)}\n• ${target.value.slice(end)}`;

    handleTextChange(nextDisplayValue);

    window.requestAnimationFrame(() => {
      const nextPosition = start + 3;
      target.setSelectionRange(nextPosition, nextPosition);
    });
  }

  return (
    <div className="space-y-2 text-left">
      <div className="space-y-0.5">
        <span className="block text-[11px] font-black uppercase tracking-wider text-amber-300">
          {label}
        </span>
        <span className="block text-[10px] font-semibold text-slate-400">
          {description}
        </span>
      </div>
      <textarea
        value={bulletValue}
        onChange={(event) => handleTextChange(event.target.value)}
        onKeyDown={handleTextKeyDown}
        rows={5}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-sm leading-relaxed text-slate-100 outline-none shadow-inner placeholder:text-sm placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
      />
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
  const customTextValue = customItems.join(", ");
  const [customDraft, setCustomDraft] = useState(customTextValue);

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
    setCustomDraft(newVal);
    const selectedOptions = options.filter((option) => selectedSet.has(option));
    const selectedString = selectedOptions.join("\n");
    const customString = newVal
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .join("\n");

    onChange(selectedString && customString ? `${selectedString}\n${customString}` : selectedString || customString);
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
              {showCustomInput ? (
                <div className="space-y-1 text-left">
                  <span className="block text-xs font-black uppercase tracking-wider text-amber-300">
                    Nhập {label.toLowerCase()}
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-400">
                    Ngăn cách các mục bởi dấu phẩy nếu có nhiều mục
                  </span>
                </div>
              ) : (
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
              )}

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
              {showCustomInput && (
                <div className="space-y-1.5 text-left">
                  <textarea
                    value={customDraft}
                    onChange={(event) => handleTextChange(event.target.value)}
                    rows={4}
                    placeholder="Ví dụ: Beauty, Lifestyle, Sự kiện"
                    className="w-full resize-none rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 outline-none placeholder:text-sm placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-inner"
                  />
                </div>
              )}

              {/* Checkboxes grid */}
              <div className={cn("space-y-3", showCustomInput && "border-t border-slate-800/80 pt-3")}>
                <div className={cn("flex items-center justify-between gap-3", !showCustomInput && "hidden")}>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Gợi ý
                  </span>
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
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
        {label}
      </span>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none shadow-inner transition-all hover:border-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
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
  onPreviewImage: (index: number) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-5 text-left space-y-4 shadow-md sm:col-span-2">
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
          {campaignImagesCount}/10 ảnh
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 custom-scrollbar snap-x">
        {campaignImagesCount < 10 && (
          <label className="group relative flex aspect-[4/5] w-[130px] shrink-0 snap-start cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-amber-400/40 bg-amber-500/5 p-4 text-center transition-all hover:border-amber-400 hover:bg-amber-500/10">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files || []);
                onImagesAdd(files);
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

        {imagePreviews.map((url, index) => (
          <div key={`${url}-${index}`} className="group relative aspect-[4/5] w-[130px] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-md">
            <img
              src={url}
              alt="Campaign preview"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.05] cursor-pointer"
              onClick={() => onPreviewImage(index)}
            />

            <button
              type="button"
              onClick={() => onImageDelete(index)}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-slate-950/80 text-white shadow-lg backdrop-blur transition hover:border-red-500 hover:bg-red-500 cursor-pointer"
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
                  if (file) onImageReplace(index, file);
                }}
                className="hidden"
              />
            </label>

            {index === 0 && (
              <span className="absolute bottom-2 left-2 bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                Cover
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
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
    onChange(`${datePart || dateFromDateTimeLocal(currentDateTimeInputValue())}T${nextTime}`);
  };

  return (
    <label className="space-y-1.5 block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
        {label}
      </span>
      <div className="grid grid-cols-[minmax(0,1fr)_6.75rem] gap-2">
        <input
          type="date"
          value={datePart}
          onChange={(event) => handleDateChange(event.target.value)}
          className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none shadow-inner transition-all hover:border-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        />
        <TimePickerInput value={validTimePart} onChange={handleTimeChange} />
      </div>
    </label>
  );
}
