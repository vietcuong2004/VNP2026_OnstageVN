"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { X, ImagePlus, Briefcase, ChevronDown, Pencil, Calendar, Eye, Plus, Trash2 } from "lucide-react";
import { type Campaign } from "@/lib/brand-mvp-data";
import { updateBrandCampaign, uploadBrandCampaignMedia } from "@/lib/brand-api";
import { cn } from "@/lib/utils";
import { TALENT_TYPE_VALUES } from "@/components/ui/ComboboxOptionValues";
import BudgetPaymentSection from "../../create-job/BudgetPaymentSection";
import PreviewJob from "../../create-job/PreviewJob";

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

function normalizeDateTimeForInput(value: string, fallback: string) {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  return raw.includes("T") ? raw.slice(0, 16) : raw.replace(" ", "T").slice(0, 16);
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
    campaignPositions: [
      {
        talentType: "KOL",
        quantity: "3",
        requirements: "",
      },
    ],
  };
}

function campaignToFormState(campaign: Campaign) {
  const start = normalizeVietnameseDateDisplay(campaign.startDate || "");
  const end = normalizeVietnameseDateDisplay(campaign.endDate || "");
  const app = normalizeVietnameseDateDisplay(campaign.applicationDeadline || campaign.deadline || "");
  const event = normalizeVietnameseDateDisplay(campaign.eventDate || "");
  const campaignWithBudget = campaign as Campaign & {
    budgetMin?: string | number | null;
    budgetMax?: string | number | null;
    budgetNegotiable?: boolean | null;
  };
  const parseArrayOrString = (value?: string[] | string | null) => (
    Array.isArray(value) ? value.join("\n") : String(value || "")
  );

  let budgetMin = campaignWithBudget.budgetMin || "";
  let budgetMax = campaignWithBudget.budgetMax || "";
  if (!budgetMin && !budgetMax && campaign.budget) {
    const numbers = campaign.budget.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      budgetMin = numbers[0];
      budgetMax = numbers[1];
    } else if (numbers && numbers.length === 1) {
      budgetMin = numbers[0];
    }
  }

  const fallbackStartAt = buildDateTimeFromDate(campaign.eventDate || campaign.startDate, "08:00").replace(" ", "T");
  const fallbackEndAt = buildDateTimeFromDate(campaign.eventDate || campaign.endDate || campaign.startDate, "22:00").replace(" ", "T");
  const campaignEvents = (campaign.events || []).map((eventItem) => ({
    name: eventItem.name || campaign.eventName || campaign.title || "Job",
    startAt: normalizeDateTimeForInput(eventItem.startAt || "", fallbackStartAt),
    endAt: normalizeDateTimeForInput(eventItem.endAt || "", fallbackEndAt),
    location: eventItem.location || campaign.address || campaign.city || "",
    content: Array.isArray(eventItem.content) ? eventItem.content.join("\n") : "",
  }));
  const campaignPositions = (campaign.positions || []).map((position) => ({
    talentType: position.talentType || "",
    quantity: String(position.quantity || 1),
    requirements: Array.isArray(position.requirements) ? position.requirements.join("\n") : "",
  }));
  const fallbackPositions = splitOptionText(parseArrayOrString(campaign.roles || campaign.targetProfiles || campaign.jobType)).map((talentType, index) => ({
    talentType,
    quantity: index === 0 ? String(campaign.talentQuantity || 1) : "1",
    requirements: campaign.requirements || "",
  }));

  return {
    ...emptyForm,
    title: campaign.title || "",
    jobType: campaign.jobType || "KOL livestream",
    eventName: campaign.eventName || "",
    campaignType: campaign.campaignType || campaign.jobType || "KOL livestream",
    city: campaign.city || "Hà Nội",
    address: campaign.address || "",
    startDate: start,
    endDate: end,
    deadline: app,
    applicationDeadline: app,
    eventDate: event,
    talentQuantity: String(campaign.talentQuantity || 3),
    budget: campaign.budget || "",
    budgetMin: String(budgetMin || ""),
    budgetMax: String(budgetMax || ""),
    budgetNegotiable: Boolean(campaignWithBudget.budgetNegotiable),
    benefits: campaign.benefits || "",
    requirements: campaign.requirements || "",
    description: campaign.description || "",
    roles: parseArrayOrString(campaign.roles),
    responsibilities: parseArrayOrString(campaign.responsibilities),
    industries: parseArrayOrString(campaign.industries),
    targetProfiles: parseArrayOrString(campaign.targetProfiles),
    contactNote: campaign.contactNote || "",
    escrowed: campaign.escrowed || false,
    heightMin: campaign.heightMinCm ? String(campaign.heightMinCm) : "",
    weightMax: campaign.weightMaxKg ? String(campaign.weightMaxKg) : "",
    experienceMin: campaign.experienceMinYears ? String(campaign.experienceMinYears) : "",
    campaignEvents,
    campaignPositions: campaignPositions.length > 0
      ? campaignPositions
      : fallbackPositions.length > 0
        ? fallbackPositions
        : [{ talentType: campaign.jobType || "KOL", quantity: String(campaign.talentQuantity || 1), requirements: campaign.requirements || "" }],
  };
}

interface FormEditJobProps {
  isOpen: boolean;
  onClose: () => void;
  campaignToEdit: Campaign | null;
  onCampaignUpdated: (campaign: Campaign) => void;
}

export default function FormEditJob({
  isOpen,
  onClose,
  campaignToEdit,
  onCampaignUpdated,
}: FormEditJobProps) {
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
  const prevOpenRef = useRef(false);
  const prevCampaignIdRef = useRef<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen && campaignToEdit) {
      const justOpened = !prevOpenRef.current && isOpen;
      const campaignIdChanged = prevCampaignIdRef.current !== campaignToEdit.id;

      if (justOpened || campaignIdChanged) {
        const initialForm = campaignToFormState(campaignToEdit);
        setForm(initialForm);
        setBudgetFrom(formatBudgetDigits(initialForm.budgetMin));
        setBudgetTo(formatBudgetDigits(initialForm.budgetMax));
        setBudgetNegotiable(initialForm.budgetNegotiable);
        setCampaignImages([]);
        setDateErrors({});
        setOpenDropdown(null);
        setActiveTab("form");
        setFormStep(1);
        finalStepSubmitReadyAt.current = 0;
      }
    }

    prevOpenRef.current = isOpen;
    prevCampaignIdRef.current = campaignToEdit?.id || null;
  }, [isOpen, campaignToEdit]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
        { talentType: "", quantity: "1", requirements: "" },
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
    const normalizedEvents = form.campaignEvents
      .map((event, index) => ({
        name: event.name.trim() || `${form.title || "Job"} - ${index + 1}`,
        start_at: normalizeDateTimeLocalToISO(event.startAt) || buildDateTimeFromDate(form.eventDate || form.startDate, "08:00"),
        end_at: normalizeDateTimeLocalToISO(event.endAt) || buildDateTimeFromDate(form.eventDate || form.endDate || form.startDate, "22:00"),
        location: event.location.trim() || buildFullLocation(form.address, form.city),
        content: splitOptionText(event.content || form.responsibilities),
        sort_order: index,
      }))
      .filter((event) => event.start_at && event.end_at);

    if (normalizedEvents.length > 0) return normalizedEvents;

    const startAt = buildDateTimeFromDate(form.eventDate || form.startDate, "08:00");
    const endAt = buildDateTimeFromDate(form.eventDate || form.endDate || form.startDate, "22:00");

    return startAt && endAt
      ? [{
          name: form.eventName || form.title || "Job",
          start_at: startAt,
          end_at: endAt,
          location: buildFullLocation(form.address, form.city),
          content: splitOptionText(form.responsibilities || form.description),
          sort_order: 0,
        }]
      : [];
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

  async function handleUpdateCampaign() {
    if (!campaignToEdit || isSubmitting || formStep !== TOTAL_STEPS || Date.now() < finalStepSubmitReadyAt.current) return;

    setIsSubmitting(true);
    let updatedCampaign: Campaign;

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
    const finalRequirements = reqParts.length > 0 ? reqParts.join("; ") : (form.requirements || "Chưa có yêu cầu chi tiết.");
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
      if (/^\d+$/.test(campaignToEdit.id)) {
        updatedCampaign = await updateBrandCampaign(campaignToEdit.id, updatedForm);
      } else {
        updatedCampaign = {
          ...campaignToEdit,
          title: updatedForm.title || campaignToEdit.title,
          jobType: updatedForm.jobType,
          eventName: updatedForm.eventName,
          campaignType: updatedForm.campaignType || updatedForm.jobType || "Job",
          city: updatedForm.city,
          address: updatedForm.address || updatedForm.city,
          startDate: updatedForm.startDate,
          endDate: updatedForm.endDate,
          deadline: updatedForm.applicationDeadline || updatedForm.deadline,
          applicationDeadline: updatedForm.applicationDeadline || updatedForm.deadline,
          eventDate: updatedForm.eventDate,
          talentQuantity: Number(updatedForm.talentQuantity) || 1,
          budget: updatedForm.budget || campaignToEdit.budget,
          benefits: updatedForm.benefits,
          requirements: updatedForm.requirements,
          description: updatedForm.description,
          roles: splitOptionText(updatedForm.roles),
          responsibilities: splitOptionText(updatedForm.responsibilities),
          industries: splitOptionText(updatedForm.industries),
          targetProfiles: splitOptionText(updatedForm.targetProfiles),
          contactNote: updatedForm.contactNote,
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
      }

      if (/^\d+$/.test(updatedCampaign.id) && campaignImages.length > 0) {
        try {
          const uploadedMedia = await Promise.all(
            campaignImages.map((file, index) => uploadBrandCampaignMedia(updatedCampaign.id, file, {
              category: "gallery",
              isPrimary: index === 0,
            }))
          );

          const media = uploadedMedia.filter(Boolean) as NonNullable<Campaign["media"]>;
          if (media.length > 0) {
            updatedCampaign = {
              ...updatedCampaign,
              media: [...(updatedCampaign.media || []), ...media],
              coverMedia: updatedCampaign.coverMedia || media[0] || null,
            };
          }
        } catch (uploadError) {
          console.warn("Cannot upload campaign images after update", uploadError);
        }
      }
    } catch (error) {
      console.warn("Cannot update campaign from API, using local fallback", error);
      updatedCampaign = {
        ...campaignToEdit,
        title: updatedForm.title || campaignToEdit.title,
        jobType: updatedForm.jobType,
        eventName: updatedForm.eventName,
        campaignType: updatedForm.campaignType || updatedForm.jobType || "Job",
        city: updatedForm.city,
        address: updatedForm.address || updatedForm.city,
        startDate: updatedForm.startDate,
        endDate: updatedForm.endDate,
        deadline: updatedForm.applicationDeadline || updatedForm.deadline,
        applicationDeadline: updatedForm.applicationDeadline || updatedForm.deadline,
        eventDate: updatedForm.eventDate,
        talentQuantity: Number(updatedForm.talentQuantity) || 1,
        budget: updatedForm.budget || campaignToEdit.budget,
        budgetValue: Number(updatedForm.budgetMax || updatedForm.budgetMin) || 0,
        benefits: updatedForm.benefits,
        description: updatedForm.description,
        requirements: updatedForm.requirements,
        heightMinCm: Number(updatedForm.heightMin) || null,
        weightMaxKg: Number(updatedForm.weightMax) || null,
        experienceMinYears: Number(updatedForm.experienceMin) || null,
        roles: splitOptionText(updatedForm.roles),
        responsibilities: splitOptionText(updatedForm.responsibilities),
        industries: splitOptionText(updatedForm.industries),
        targetProfiles: splitOptionText(updatedForm.targetProfiles),
        contactNote: updatedForm.contactNote,
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

    onCampaignUpdated(updatedCampaign);
    handleClose();
  }

  if (!isOpen || !campaignToEdit) return null;

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
                Sửa job
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
                form={{
                  ...form,
                  campaignEvents: [],
                  campaignPositions: [],
                }}
                imageUrls={imagePreviews}
                activeImageIndex={activePreviewImageIndex}
                onActiveImageIndexChange={setActivePreviewImageIndex}
              />
            </div>
          )}

          {/* STEP 1: Thông tin cơ bản */}
          {activeTab === "form" && formStep === 1 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="sm:col-span-2">
                <FormInput label="Tiêu đề job *" value={form.title} onChange={(value) => setForm((c) => ({ ...c, title: value }))} required />
              </div>
              <MultiChoiceField
                id="industries"
                label="Lĩnh vực công việc"
                value={form.industries}
                options={INDUSTRY_OPTIONS}
                placeholder={"Nhập thêm lĩnh vực khác, mỗi dòng một mục"}
                onChange={(value) => setForm((c) => ({ ...c, industries: value }))}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />
              <BudgetPaymentSection
                budgetFrom={budgetFrom}
                budgetTo={budgetTo}
                budgetNegotiable={budgetNegotiable}
                onNegotiableChange={handleBudgetNegotiableChange}
                onBudgetFromChange={(value: string) => handleBudgetChange(value, budgetFrom, setBudgetFrom, true)}
                onBudgetToChange={(value: string) => handleBudgetChange(value, budgetTo, setBudgetTo, false)}
              />
            </div>
          )}

          {/* STEP 2: Địa điểm & Thời gian */}
          {activeTab === "form" && formStep === 2 && (
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
          {activeTab === "form" && formStep === 3 && (
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
          {activeTab === "form" && formStep === 4 && (
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
                id="targetProfiles"
                label="Nhóm Talent phù hợp"
                value={form.targetProfiles}
                options={TARGET_PROFILE_OPTIONS}
                placeholder={"Nhập thêm nhóm Talent khác, mỗi dòng một mục"}
                onChange={(value) => setForm((c) => ({ ...c, targetProfiles: value }))}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />

              <CampaignPositionsSection
                positions={form.campaignPositions}
                onAdd={addCampaignPosition}
                onRemove={removeCampaignPosition}
                onChange={updateCampaignPosition}
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
          {activeTab === "form" && formStep === 5 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <CampaignEventsSection
                events={form.campaignEvents}
                defaultLocation={buildFullLocation(form.address, form.city)}
                onAdd={addCampaignEvent}
                onRemove={removeCampaignEvent}
                onChange={updateCampaignEvent}
              />

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
                      <SummaryList label="Lĩnh vực công việc" items={splitOptionText(form.industries)} />
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
                  onClick={handleUpdateCampaign}
                  disabled={isSubmitting}
                  className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-5 text-xs font-black text-slate-950 hover:brightness-110 active:scale-95 cursor-pointer transition-all shadow-[0_0_25px_rgba(245,158,11,0.45)] disabled:opacity-40"
                >
                  <Briefcase className="h-4 w-4" />
                  {isSubmitting ? "Đang lưu..." : "Lưu Job"}
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
              <FormInput
                label="Loại talent"
                value={position.talentType}
                placeholder="KOL, Model, MC..."
                onChange={(value) => onChange(index, { talentType: value })}
              />
              <FormInput
                label="Số lượng"
                type="number"
                value={position.quantity}
                onChange={(value) => onChange(index, { quantity: value })}
              />
            </div>
            <label className="space-y-1.5 block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Yêu cầu riêng
              </span>
              <textarea
                value={position.requirements}
                onChange={(event) => onChange(index, { requirements: event.target.value })}
                rows={3}
                placeholder="Mỗi dòng là một yêu cầu riêng cho vị trí này"
                className="w-full resize-none rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </label>
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
          Đang lưu job
        </h3>
        <p className="mt-2 text-sm font-semibold text-slate-300">
          Vui lòng chờ, hệ thống đang cập nhật thông tin và tải ảnh lên.
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
