"use client";

import { useState, useEffect, useMemo, useRef, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { X, ImagePlus, Briefcase, ChevronDown, Pencil, Calendar, Eye, Plus, Trash2 } from "lucide-react";
import { type Campaign } from "@/lib/brand-mvp-data";
import { updateBrandCampaign, uploadBrandCampaignMedia } from "@/lib/brand-api";
import { cn } from "@/lib/utils";
import { TALENT_TYPE_VALUES } from "@/components/ui/ComboboxOptionValues";
import TimePickerInput from "@/components/ui/TimePickerInput";
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
    .map((item) => item.replace(/^[\s•*-]+/, "").trim())
    .filter(Boolean);
}

function joinOptionText(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).join("\n");
}

function parseBudgetInputValue(value: string) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits ? String(Number(digits)) : "";
}

function formatBudgetDigits(digits: string) {
  const normalizedDigits = String(digits || "").replace(/[^\d]/g, "");
  return normalizedDigits ? `${Number(normalizedDigits).toLocaleString("vi-VN")} VND/ngày` : "";
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

function normalizeDateTimeForInput(value: string, fallback = "") {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (trimmed.includes("T")) {
    return trimmed.slice(0, 16);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T08:00`;
  }
  return fallback;
}

function normalizeDateTimeToSql(value?: string | null): string {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";

  const matchMinute = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (matchMinute) {
    const [, y, m, d, h, min, s] = matchMinute;
    return `${y}-${m}-${d} ${h}:${min}:${s || "00"}`;
  }

  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  }

  return trimmed;
}

function cleanCustomRequirements(requirements?: string | null): string {
  if (!requirements) return "";
  const lines = String(requirements)
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      const lower = line.toLowerCase();
      if (lower.startsWith("chiều cao tối thiểu")) return false;
      if (lower.startsWith("cân nặng tối đa")) return false;
      if (lower.startsWith("kinh nghiệm tối thiểu")) return false;
      if (lower === "chưa có yêu cầu chi tiết." || lower === "chưa có yêu cầu chi tiết") return false;
      return true;
    });
  return lines.join("\n");
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

function dateFromDateTimeLocal(value: string) {
  if (!value) return "";
  return value.split("T")[0] || "";
}

function buildFullLocation(address: string, city: string) {
  const parts = [address.trim(), city.trim()].filter(Boolean);
  return parts.join(", ");
}

function currentDateTimeInputValue(offsetMinutes = 0) {
  const now = new Date(Date.now() + offsetMinutes * 60 * 1000);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const emptyForm = {
  title: "",
  jobType: "KOL livestream",
  eventName: "",
  campaignType: "KOL livestream",
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
  weightMax: "",
  experienceMin: "",
  campaignEvents: [] as CampaignEventDraft[],
  campaignPositions: [
    {
      talentType: "KOL",
      quantity: "3",
      requirements: "",
    },
  ] as CampaignPositionDraft[],
};

function campaignToFormState(campaign: Campaign) {
  const campaignWithBudget = campaign as Campaign & {
    budgetMin?: string | number | null;
    budgetMax?: string | number | null;
    budgetNegotiable?: boolean | null;
  };
  let bMin = campaignWithBudget.budgetMin || "";
  let bMax = campaignWithBudget.budgetMax || "";
  if (!bMin && !bMax && campaign.budget) {
    const numbers = campaign.budget.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      bMin = numbers[0];
      bMax = numbers[1];
    } else if (numbers && numbers.length === 1) {
      bMin = numbers[0];
    }
  }

  const parseArrayOrString = (val?: string[] | string) => {
    if (Array.isArray(val)) return val.join("\n");
    return String(val || "");
  };

  const start = normalizeDateTimeForInput(campaign.startDate || "", currentDateTimeInputValue());
  const end = normalizeDateTimeForInput(campaign.endDate || "", currentDateTimeInputValue(24 * 60));
  const app = normalizeDateTimeForInput(campaign.applicationDeadline || campaign.deadline || "", currentDateTimeInputValue(12 * 60));
  const event = parseVietnameseDateToYYYYMMDD(campaign.eventDate || "");
  
  const rawEvents = Array.isArray(campaign.events)
    ? campaign.events
    : Array.isArray((campaign as any).eventSchedules)
      ? (campaign as any).eventSchedules
      : [];
  
  const campaignEvents = rawEvents.map((eventItem: any) => ({
    name: eventItem.name || eventItem.eventName || eventItem.title || campaign.eventName || campaign.title || "Sự kiện",
    startAt: normalizeDateTimeForInput(eventItem.startAt || eventItem.start_at || eventItem.startDate || eventItem.start_date || "", start),
    endAt: normalizeDateTimeForInput(eventItem.endAt || eventItem.end_at || eventItem.endDate || eventItem.end_date || "", end),
    location: eventItem.location || eventItem.address || campaign.address || campaign.city || "",
    content: Array.isArray(eventItem.content)
      ? eventItem.content.join("\n")
      : String(eventItem.content || eventItem.note || eventItem.description || ""),
  }));
  
  const campaignPositions = (campaign.positions || []).map((position) => ({
    talentType: position.talentType || "",
    quantity: String(position.quantity || 1),
    requirements: Array.isArray(position.requirements) ? position.requirements.join("\n") : String(position.requirements || ""),
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
    deadline: dateFromDateTimeLocal(app),
    applicationDeadline: app,
    eventDate: event,
    talentQuantity: String(campaign.talentQuantity || 3),
    budget: campaign.budget || "",
    budgetMin: String(bMin),
    budgetMax: String(bMax),
    budgetNegotiable: Boolean(campaignWithBudget.budgetNegotiable),
    benefits: campaign.benefits || "",
    requirements: cleanCustomRequirements(campaign.requirements),
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

export default function FormEditJobMobile({
  isOpen,
  onClose,
  campaignToEdit,
  onCampaignUpdated,
}: FormEditJobProps) {
  const router = useRouter();
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [campaignImages, setCampaignImages] = useState<File[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [formStep, setFormStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activePreviewImageIndex, setActivePreviewImageIndex] = useState(0);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateErrors, setDateErrors] = useState<{
    startDate?: string;
    endDate?: string;
    applicationDeadline?: string;
    eventDate?: string;
  }>({});
  const TOTAL_STEPS = 4;

  const existingMediaUrls = useMemo(() => {
    return (campaignToEdit?.media || [])
      .map((m) => m.url)
      .filter(Boolean) as string[];
  }, [campaignToEdit]);

  const newImagePreviews = useMemo(
    () => campaignImages.map((file) => URL.createObjectURL(file)),
    [campaignImages]
  );

  const allPreviewUrls = useMemo(
    () => [...existingMediaUrls, ...newImagePreviews],
    [existingMediaUrls, newImagePreviews]
  );

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

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
        setFormStep(1);
        setDateErrors({});
        setCampaignImages([]);
        setActivePreviewImageIndex(0);
        setActiveTab("form");
      }
    }
    prevOpenRef.current = isOpen;
    prevCampaignIdRef.current = campaignToEdit?.id || null;
  }, [isOpen, campaignToEdit]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
      campaignPositions: current.campaignPositions.filter((_, positionIndex) => positionIndex !== index),
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

  function getNormalizedCampaignEvents() {
    const normalizedEvents = form.campaignEvents.map((event) => ({
      ...event,
      name: event.name.trim(),
      location: event.location?.trim() || "",
      content: event.content.trim(),
    }));

    for (const [index, event] of normalizedEvents.entries()) {
      if (!event.name || !event.startAt || !event.endAt) {
        window.alert(`Vui lòng nhập đủ tên, thời gian bắt đầu và thời gian kết thúc cho sự kiện ${index + 1}.`);
        return null;
      }

      if (new Date(event.endAt).getTime() <= new Date(event.startAt).getTime()) {
        window.alert(`Thời gian kết thúc của sự kiện ${index + 1} phải sau thời gian bắt đầu.`);
        return null;
      }
    }

    return normalizedEvents;
  }

  function syncEventDatesBeforeNext() {
    const normalizedEvents = getNormalizedCampaignEvents();
    if (!normalizedEvents) return false;

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

  async function handleUpdateCampaign() {
    if (!campaignToEdit || isSubmitting || formStep !== TOTAL_STEPS) return;

    if (!syncJobTimelineBeforeNext()) {
      return;
    }

    const normalizedEvents = getNormalizedCampaignEvents();
    if (!normalizedEvents) {
      return;
    }

    const normalizedEventDate = normalizedEvents[0]?.startAt
      ? dateFromDateTimeLocal(normalizedEvents[0].startAt)
      : form.eventDate;

    setForm((current) => ({
      ...current,
      campaignEvents: normalizedEvents,
      deadline: dateFromDateTimeLocal(current.applicationDeadline),
      eventDate: normalizedEventDate,
    }));
    setDateErrors({});
    setIsSubmitting(true);
    setShowPublishDialog(false);
    let savedCampaign: Campaign;

    // Save custom requirements without duplicating height, weight, experience which have their own columns
    const customReqLines = splitOptionText(form.requirements)
      .filter((line) => {
        const lower = line.toLowerCase();
        if (lower.startsWith("chiều cao tối thiểu")) return false;
        if (lower.startsWith("cân nặng tối đa")) return false;
        if (lower.startsWith("kinh nghiệm tối thiểu")) return false;
        if (lower === "chưa có yêu cầu chi tiết." || lower === "chưa có yêu cầu chi tiết") return false;
        return true;
      });
    const finalRequirements = customReqLines.join("; ") || "Chưa có yêu cầu chi tiết.";
    
    const campaignEventsForPayload = normalizedEvents.map((event, index) => ({
      name: event.name || `Sự kiện ${index + 1}`,
      start_at: normalizeDateTimeToSql(event.startAt) || event.startAt,
      end_at: normalizeDateTimeToSql(event.endAt) || event.endAt,
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
      startDate: normalizeDateTimeToSql(form.startDate),
      endDate: normalizeDateTimeToSql(form.endDate),
      deadline: parseVietnameseDateToYYYYMMDD(form.deadline),
      applicationDeadline: normalizeDateTimeToSql(form.applicationDeadline),
      eventDate: parseVietnameseDateToYYYYMMDD(normalizedEventDate),
      events: campaignEventsForPayload,
      positions: campaignPositionsForPayload,
    };

    try {
      if (/^\d+$/.test(campaignToEdit.id)) {
        savedCampaign = await updateBrandCampaign(campaignToEdit.id, updatedForm);
      } else {
        savedCampaign = {
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
          events: normalizedEvents.map((event, index) => ({
            id: `event-${index}`,
            name: event.name,
            startAt: event.startAt,
            endAt: event.endAt,
            location: event.location,
            content: splitOptionText(event.content),
            sortOrder: index,
          })),
          positions: form.campaignPositions.map((pos, index) => ({
            id: `pos-${index}`,
            talentType: pos.talentType,
            quantity: Number(pos.quantity) || 1,
            requirements: splitOptionText(pos.requirements),
            sortOrder: index,
          })),
        };
      }

      if (/^\d+$/.test(savedCampaign.id) && campaignImages.length > 0) {
        try {
          const uploadedMedia = await Promise.all(
            campaignImages.map((file, index) => uploadBrandCampaignMedia(savedCampaign.id, file, {
              category: "gallery",
              isPrimary: index === 0 && (!savedCampaign.media || savedCampaign.media.length === 0),
            }))
          );

          const media = uploadedMedia.filter(Boolean) as NonNullable<Campaign["media"]>;
          savedCampaign = {
            ...savedCampaign,
            media: [...(savedCampaign.media || []), ...media],
            coverMedia: savedCampaign.coverMedia || media[0] || null,
          };
        } catch (uploadError) {
          console.warn("Cannot upload campaign images after update", uploadError);
        }
      }
    } catch (error: any) {
      console.error("Cannot update campaign via API:", error);
      if (/^\d+$/.test(campaignToEdit.id)) {
        window.alert(`Không thể lưu thay đổi: ${error?.message || "Lỗi kết nối máy chủ"}`);
        setIsSubmitting(false);
        return;
      }
      savedCampaign = {
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
        benefits: updatedForm.benefits || "Thỏa thuận theo brief",
        status: campaignToEdit.status,
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
        escrowed: updatedForm.escrowed,
        events: normalizedEvents.map((event, index) => ({
          id: `event-${index}`,
          name: event.name,
          startAt: event.startAt,
          endAt: event.endAt,
          location: event.location,
          content: splitOptionText(event.content),
          sortOrder: index,
        })),
        positions: form.campaignPositions.map((pos, index) => ({
          id: `pos-${index}`,
          talentType: pos.talentType,
          quantity: Number(pos.quantity) || 1,
          requirements: splitOptionText(pos.requirements),
          sortOrder: index,
        })),
      };
    } finally {
      setIsSubmitting(false);
    }

    onCampaignUpdated(savedCampaign);
    handleClose();
    router.push(`/brand/manage-jobs/${savedCampaign.id}`);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-0 backdrop-blur-md animate-in fade-in duration-200 md:relative md:inset-auto md:z-auto md:block md:bg-transparent md:p-0 md:backdrop-blur-0">
      <form
        onSubmit={handleFormSubmit}
        className="relative mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden border-0 border-[#F0D7D3] bg-[#FAF7F6] text-[#191116] shadow-2xl sm:rounded-3xl sm:border md:mx-0 md:h-auto md:min-h-[calc(100dvh-9rem)] md:max-w-none md:max-h-none"
      >
        {/* Top accent glow line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#E01B1F] via-[#C72524] to-[#8F0709] shrink-0 shadow-sm" />

        {/* Ambient background glow accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFF0EE] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFF5F3] rounded-full blur-3xl pointer-events-none" />

        {/* ── HEADER with step indicator ── */}
        <div className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-[#F0D7D3] bg-white shrink-0">
          <div className="mb-2 grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-2">
            <div className="grid grid-cols-2 gap-1 rounded-2xl border border-[#F0D7D3] bg-[#FFF7F6] p-1">
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className={cn(
                  "flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                  activeTab === "form"
                    ? "light-force-white bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white shadow-sm"
                    : "text-[#574D54] hover:bg-white hover:text-[#191116]"
                )}
              >
                <Briefcase className="h-4 w-4" />
                Sửa job
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                  activeTab === "preview"
                    ? "light-force-white bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white shadow-sm"
                    : "text-[#574D54] hover:bg-white hover:text-[#191116]"
                )}
              >
                <Eye className="h-4 w-4" />
                Xem trước
              </button>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F0D7D3] bg-white text-[#8F0709] transition-all hover:bg-[#FFF0EE] cursor-pointer shadow-sm"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {activeTab === "form" && (
            <div className="mb-0 flex min-w-0 items-center gap-2">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#F0D7D3] bg-[#FFF0EE] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#8F0709]">
                BƯỚC {formStep}/{TOTAL_STEPS}
              </span>
              <h2 className="min-w-0 truncate text-base font-black text-[#191116] tracking-tight">
                {currentStepTitle}
              </h2>
            </div>
          )}
        </div>

        {/* ── STEP CONTENT (scrollable) ── */}
        <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 custom-scrollbar">
          {activeTab === "preview" && (
            <div className="-mx-1 h-full min-h-[calc(100dvh-12rem)] animate-in fade-in slide-in-from-right-4 duration-300">
              <PreviewJob
                form={form}
                imageUrls={allPreviewUrls}
                activeImageIndex={activePreviewImageIndex}
                onActiveImageIndexChange={setActivePreviewImageIndex}
              />
            </div>
          )}

          {/* STEP 1: Tổng quan */}
          {activeTab === "form" && formStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="rounded-2xl border border-[#F0D7D3] bg-white p-4 shadow-sm text-[#191116]">
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

              <div className="space-y-3 rounded-2xl border border-[#F0D7D3] bg-white p-4 shadow-sm text-[#191116]">
                <span className="text-xs font-black uppercase tracking-wider text-[#8F0709]">
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
                campaignImagesCount={allPreviewUrls.length}
                imagePreviews={allPreviewUrls}
                onImagesAdd={handleImagesAdd}
                onImageReplace={handleImageReplace}
                onImageDelete={handleImageDelete}
                onPreviewImage={setActivePreviewImageIndex}
              />
            </div>
          )}

          {/* STEP 2: Thông tin */}
          {activeTab === "form" && formStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="space-y-1.5 block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#574D54]">Mô tả công việc *</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  rows={5}
                  placeholder="Mô tả tổng quan về job, mục tiêu, timeline và nội dung cần talent tham gia..."
                  className="w-full resize-none rounded-xl border border-[#F0D7D3] bg-[#FFF7F6] px-3.5 py-2.5 text-xs text-[#191116] outline-none focus:border-[#8F0709] focus:ring-2 focus:ring-[#8F0709]/10 placeholder:text-[#9A8B88] leading-relaxed hover:border-[#8F0709]/40 transition-all shadow-sm"
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
          <div className="relative z-10 flex items-center justify-between gap-3 border-t border-[#F0D7D3] bg-white px-4 sm:px-6 py-3.5 sm:py-4 shrink-0">
            <button
              type="button"
              onClick={() => formStep > 1 ? moveToStep(formStep - 1) : handleClose()}
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#F0D7D3] bg-white px-6 text-xs font-bold text-[#191116] hover:bg-[#FFF0EE] cursor-pointer transition-all shadow-sm"
              disabled={isSubmitting}
            >
              {formStep > 1 ? "← Bước trước" : "Hủy"}
            </button>

            <div className="flex items-center gap-3">
              {/* Progress bar */}
              <div className="hidden sm:flex h-2 w-24 rounded-full bg-[#FFF7F6] overflow-hidden border border-[#F0D7D3] p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#E01B1F] via-[#C72524] to-[#8F0709] transition-all duration-500 shadow-sm"
                  style={{ width: `${(formStep / TOTAL_STEPS) * 100}%` }}
                />
              </div>

              {formStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={() => moveToStep(formStep + 1)}
                  className="light-force-white flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-8 text-xs font-black uppercase tracking-wider !text-white text-white hover:brightness-110 active:scale-95 cursor-pointer transition-all shadow-md"
                >
                  TIẾP TỤC
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleUpdateCampaign}
                  disabled={isSubmitting}
                  className="light-force-white flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-8 text-xs font-black uppercase tracking-wider !text-white text-white hover:brightness-110 active:scale-95 cursor-pointer transition-all shadow-md disabled:opacity-40"
                >
                  <Briefcase className="h-4 w-4" />
                  {isSubmitting ? "Đang lưu..." : "LƯU THAY ĐỔI"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showPublishDialog && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl border border-[#F0D7D3] bg-white p-6 text-left shadow-2xl">
              <div className="space-y-2 border-b border-[#F0D7D3] pb-4">
                <h3 className="text-xl font-black uppercase tracking-tight text-[#8F0709]">
                  Bạn có muốn lưu thay đổi cho job này?
                </h3>
                <p className="text-sm font-semibold leading-relaxed text-[#574D54]">
                  Thông tin chiến dịch sẽ được cập nhật đồng bộ trên toàn hệ thống.
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleUpdateCampaign}
                  disabled={isSubmitting}
                  className="light-force-white flex-1 rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-5 py-3 text-sm font-black uppercase tracking-wider !text-white text-white shadow-md hover:brightness-110 active:scale-95 transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? "Đang lưu..." : "Xác nhận lưu"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPublishDialog(false)}
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl border border-[#F0D7D3] bg-white px-5 py-3 text-sm font-bold uppercase tracking-wider text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  Chỉnh sửa lại
                </button>
              </div>
            </div>
          </div>
        )}

        {isSubmitting && <EditJobLoadingOverlay />}

      </form>
    </div>
  );
}

function EditJobLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/75 px-6 text-center backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-[#F0D7D3] bg-white p-7 shadow-2xl">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#8F0709] border-t-transparent" />
        <h3 className="mt-5 text-base font-black uppercase tracking-wide text-[#8F0709]">
          Đang cập nhật job
        </h3>
        <p className="mt-2 text-sm font-semibold text-[#574D54]">
          Vui lòng chờ, hệ thống đang lưu thông tin và tải ảnh lên.
        </p>
      </div>
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
  const [inputValue, setInputValue] = useState("");

  const addOption = (option: string) => {
    const items = option
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!items.length) return;

    const existingLower = new Set(selected.map((item) => item.toLowerCase()));
    const newItems = items.filter((item) => !existingLower.has(item.toLowerCase()));
    if (!newItems.length) return;

    onChange(joinOptionText([...selected, ...newItems]));
  };

  const removeOption = (option: string) => {
    onChange(joinOptionText(selected.filter((item) => item.toLowerCase() !== option.toLowerCase())));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addOption(inputValue);
      setInputValue("");
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addOption(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="space-y-3 rounded-3xl border border-[#F0D7D3] bg-white p-4 shadow-sm text-[#191116]">
      <div>
        <span className="block text-xs font-black uppercase tracking-wider text-[#8F0709]">{label}:</span>
        {description && <span className="mt-1 block text-xs font-semibold text-[#574D54]">{description}</span>}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="w-full rounded-2xl border border-[#F0D7D3] bg-white px-3.5 py-2.5 text-xs font-bold text-[#191116] outline-none placeholder:text-[#9A8B88] focus:border-[#8F0709] focus:ring-2 focus:ring-[#8F0709]/10 shadow-sm"
      />
      <div className="flex flex-wrap gap-2">
        {options.slice(0, 12).map((option) => {
          const isSelected = selected.some((item) => item.toLowerCase() === option.toLowerCase());
          return (
            <button
              key={option}
              type="button"
              onClick={() => (isSelected ? removeOption(option) : addOption(option))}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                isSelected
                  ? "bg-[#8F0709] text-white shadow-xs"
                  : "border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] hover:bg-[#FFE5E2]"
              )}
            >
              {option} {isSelected ? "✓" : "+"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InlineMultilineTextField({
  label,
  description,
  value,
  suggestions = [],
  placeholder,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  suggestions?: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const selected = splitOptionText(value);

  const addSuggestion = (suggestion: string) => {
    const existingLower = new Set(selected.map((item) => item.toLowerCase()));
    if (existingLower.has(suggestion.toLowerCase())) return;
    onChange(joinOptionText([...selected, suggestion]));
  };

  const removeSuggestion = (suggestion: string) => {
    onChange(joinOptionText(selected.filter((item) => item.toLowerCase() !== suggestion.toLowerCase())));
  };

  return (
    <div className="space-y-3 rounded-3xl border border-[#F0D7D3] bg-white p-4 shadow-sm text-[#191116]">
      <div>
        <span className="block text-xs font-black uppercase tracking-wider text-[#8F0709]">{label}:</span>
        {description && <span className="mt-1 block text-xs font-semibold text-[#574D54]">{description}</span>}
      </div>
      <textarea
        rows={4}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[#F0D7D3] bg-white px-3.5 py-2.5 text-xs font-bold text-[#191116] outline-none placeholder:text-[#9A8B88] focus:border-[#8F0709] focus:ring-2 focus:ring-[#8F0709]/10 shadow-sm leading-relaxed"
      />
      {suggestions.length > 0 && (
        <div className="space-y-2 border-t border-[#F0D7D3] pt-3">
          <span className="block text-[11px] font-black uppercase tracking-wider text-[#574D54]">Gợi ý nhanh:</span>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => {
              const isSelected = selected.some((item) => item.toLowerCase() === suggestion.toLowerCase());
              return (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => (isSelected ? removeSuggestion(suggestion) : addSuggestion(suggestion))}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer text-left",
                    isSelected
                      ? "bg-[#8F0709] text-white shadow-xs"
                      : "border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] hover:bg-[#FFE5E2]"
                  )}
                >
                  {suggestion} {isSelected ? "✓" : "+"}
                </button>
              );
            })}
          </div>
        </div>
      )}
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
    <section className="space-y-4 rounded-3xl border border-[#F0D7D3] bg-white p-4 shadow-sm text-[#191116]">
      <div>
        <span className="block text-xs font-black uppercase tracking-wider text-[#8F0709]">Yêu cầu chung:</span>
        <span className="mt-1 block text-xs font-semibold text-[#574D54]">Các tiêu chí cơ bản để talent ứng tuyển</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <NumberRequirementInput
          label="Chiều cao tối thiểu (cm)"
          value={heightMin}
          placeholder="165"
          onChange={onHeightMinChange}
        />
        <NumberRequirementInput
          label="Cân nặng tối đa (kg)"
          value={weightMax}
          placeholder="55"
          onChange={onWeightMaxChange}
        />
        <NumberRequirementInput
          label="Kinh nghiệm tối thiểu (năm)"
          value={experienceMin}
          placeholder="1"
          onChange={onExperienceMinChange}
        />
      </div>

      <InlineBulletTextarea
        label="Yêu cầu chi tiết khác"
        description="Mỗi dòng là một yêu cầu cụ thể"
        value={requirements}
        placeholder={"Ví dụ:\nCó khả năng giao tiếp lưu loát trước ống kính\nKinh nghiệm làm việc chuyên nghiệp, đúng giờ"}
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
    <section className="space-y-4 rounded-3xl border border-[#F0D7D3] bg-white p-4 shadow-sm text-[#191116]">
      <div className="flex items-center justify-between border-b border-[#F0D7D3] pb-3">
        <div>
          <span className="block text-xs font-black uppercase tracking-wider text-[#8F0709]">Vị trí tuyển dụng:</span>
          <span className="mt-0.5 block text-[11px] font-semibold text-[#574D54]">Thêm các vị trí talent cần tuyển</span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#8F0709] bg-[#FFF0EE] px-3.5 py-1.5 text-xs font-bold text-[#8F0709] hover:bg-[#FFE5E2] cursor-pointer transition shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm vị trí</span>
        </button>
      </div>

      <div className="space-y-4">
        {positions.map((position, index) => (
          <div key={index} className="space-y-3 rounded-2xl border border-[#F0D7D3] bg-[#FAF7F6] p-3.5">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-[#F0D7D3] bg-[#FFF0EE] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#8F0709]">
                Vị trí {String(index + 1).padStart(2, "0")}
              </span>
              {positions.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#F0D7D3] bg-white text-red-500 hover:bg-red-50 cursor-pointer shadow-xs"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_8rem]">
              <label className="space-y-1 block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#574D54]">Chọn vị trí *</span>
                <div className="relative">
                  <select
                    value={position.talentType}
                    onChange={(e) => onChange(index, { talentType: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-[#F0D7D3] bg-white px-3.5 py-2.5 pr-9 text-xs font-bold text-[#191116] outline-none hover:border-[#8F0709]/40 focus:border-[#8F0709] shadow-sm cursor-pointer"
                  >
                    <option value="" disabled>-- Chọn vị trí tuyển dụng --</option>
                    {TARGET_PROFILE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F0709]" />
                </div>
              </label>

              <NumberRequirementInput
                label="Số lượng"
                value={position.quantity}
                placeholder="1"
                onChange={(value) => onChange(index, { quantity: value })}
              />
            </div>

            <InlineBulletTextarea
              label="Yêu cầu riêng"
              value={position.requirements}
              placeholder={"Ví dụ:\nƯu tiên ứng viên có phong cách thanh lịch"}
              onChange={(value) => onChange(index, { requirements: value })}
            />
          </div>
        ))}
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
    <section className="space-y-4 rounded-3xl border border-[#F0D7D3] bg-white p-4 shadow-sm text-[#191116]">
      <div className="flex items-center justify-between border-b border-[#F0D7D3] pb-3">
        <div>
          <span className="block text-xs font-black uppercase tracking-wider text-[#8F0709]">Lịch trình & Hoạt động:</span>
          <span className="mt-0.5 block text-[11px] font-semibold text-[#574D54]">Các mốc sự kiện/lịch trình diễn ra</span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#8F0709] bg-[#FFF0EE] px-3.5 py-1.5 text-xs font-bold text-[#8F0709] hover:bg-[#FFE5E2] cursor-pointer transition shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm lịch</span>
        </button>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="space-y-3 rounded-2xl border border-[#F0D7D3] bg-[#FAF7F6] p-3.5">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-[#F0D7D3] bg-[#FFF0EE] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#8F0709]">
                Lịch trình {String(index + 1).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#F0D7D3] bg-white text-red-500 hover:bg-red-50 cursor-pointer shadow-xs"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <FormInput
              label="Tên hoạt động *"
              value={event.name}
              placeholder="Ví dụ: Rehearsal sân khấu"
              onChange={(value) => onChange(index, { name: value })}
              required
            />

            <div className="grid grid-cols-1 gap-3">
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
              label="Địa điểm hoạt động"
              value={event.location}
              placeholder={defaultLocation || "Địa điểm tổ chức"}
              onChange={(value) => onChange(index, { location: value })}
            />

            <InlineBulletTextarea
              label="Nội dung hoạt động"
              value={event.content}
              placeholder={"Ví dụ:\nCheck-in và chạy đường dây chương trình"}
              onChange={(value) => onChange(index, { content: value })}
            />
          </div>
        ))}
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
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#574D54]">{label}</span>
      <input
        type="number"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[#F0D7D3] bg-white px-3.5 py-2.5 text-xs font-bold text-[#191116] outline-none placeholder:text-[#9A8B88] focus:border-[#8F0709] focus:ring-2 focus:ring-[#8F0709]/10 shadow-sm"
      />
    </label>
  );
}

function formatBulletTextareaValue(value: string) {
  if (!value) return "";
  return value
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return `• ${trimmed.replace(/^[\s•*-]+/, "").trim()}`;
      }
      return `• ${trimmed}`;
    })
    .join("\n");
}

function stripBulletTextareaValue(value: string) {
  if (!value) return "";
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s•*-]+/, "").trim())
    .filter(Boolean)
    .join("\n");
}

function InlineBulletTextarea({
  label,
  description,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  description?: string;
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
    <label className="space-y-1 block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#574D54]">{label}</span>
      {description && <span className="block text-[10px] font-semibold text-[#574D54]">{description}</span>}
      <textarea
        rows={4}
        value={bulletValue}
        placeholder={placeholder}
        onChange={(e) => handleTextChange(e.target.value)}
        onFocus={() => {
          if (!value.trim()) onChange("");
        }}
        onKeyDown={handleTextKeyDown}
        className="w-full resize-none rounded-2xl border border-[#F0D7D3] bg-white px-3.5 py-2.5 text-xs font-bold text-[#191116] outline-none placeholder:text-[#9A8B88] focus:border-[#8F0709] focus:ring-2 focus:ring-[#8F0709]/10 shadow-sm leading-relaxed"
      />
    </label>
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
  error = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label className="space-y-1 block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#574D54] flex items-center gap-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-2xl border border-[#F0D7D3] bg-white px-3.5 py-2.5 text-xs font-bold text-[#191116] placeholder:text-[#9A8B88] outline-none transition-all shadow-sm",
          error
            ? "border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
            : "focus:border-[#8F0709] focus:ring-2 focus:ring-[#8F0709]/10 hover:border-[#8F0709]/40"
        )}
      />
      {error && (
        <span className="mt-1 block text-[11px] font-medium text-red-500 leading-snug animate-in fade-in duration-200">
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
    <label className="space-y-1 block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#574D54]">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[#F0D7D3] bg-white px-3.5 py-2.5 text-xs font-bold text-[#191116] outline-none shadow-sm transition-all hover:border-[#8F0709]/40 focus:border-[#8F0709] focus:ring-2 focus:ring-[#8F0709]/10"
      />
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
    <section className="rounded-3xl border border-[#F0D7D3] bg-white p-4 shadow-sm text-[#191116] space-y-3">
      <div className="flex items-center justify-between border-b border-[#F0D7D3] pb-3">
        <div>
          <span className="block text-xs font-black uppercase tracking-wider text-[#8F0709]">Bộ ảnh Job:</span>
          <span className="mt-0.5 block text-[10px] font-semibold text-[#574D54]">Tải lên hình ảnh cho job (Tối đa 10 ảnh)</span>
        </div>
        <span className="rounded-full border border-[#F0D7D3] bg-[#FFF0EE] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#8F0709]">
          {campaignImagesCount}/10 ảnh
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
        {campaignImagesCount < 10 && (
          <label className="group relative flex aspect-[4/5] w-[110px] shrink-0 snap-start cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#F0D7D3] bg-[#FFF0EE]/40 p-3 text-center transition-all hover:border-[#8F0709] hover:bg-[#FFF0EE]">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                onImagesAdd(files);
              }}
              className="hidden"
            />
            <ImagePlus className="mb-1.5 h-6 w-6 text-[#8F0709]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8F0709]">Tải ảnh lên</span>
            <span className="text-[8px] font-medium text-[#574D54]">JPG, PNG</span>
          </label>
        )}

        {imagePreviews.map((url, index) => (
          <div key={`${url}-${index}`} className="group relative aspect-[4/5] w-[110px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[#F0D7D3] bg-[#FAF7F6] shadow-sm">
            <img
              src={url}
              alt="Campaign preview"
              className="h-full w-full object-cover cursor-pointer"
              onClick={() => onPreviewImage(index)}
            />

            <button
              type="button"
              onClick={() => onImageDelete(index)}
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#F0D7D3] bg-white text-[#574D54] shadow-sm hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>

            <label className="absolute right-9 top-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#F0D7D3] bg-white text-[#574D54] shadow-sm hover:text-[#8F0709]">
              <Pencil className="h-3 w-3" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImageReplace(index, file);
                }}
                className="hidden"
              />
            </label>

            {index === 0 && (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-2 py-0.5 text-[8px] font-black uppercase text-white shadow-xs">
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
    <label className="space-y-1 block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#574D54]">{label}</span>
      <div className="grid grid-cols-[minmax(0,1fr)_6.5rem] gap-2">
        <input
          type="date"
          value={datePart}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full rounded-2xl border border-[#F0D7D3] bg-white px-3.5 py-2.5 text-xs font-bold text-[#191116] outline-none shadow-sm transition-all hover:border-[#8F0709]/40 focus:border-[#8F0709] focus:ring-2 focus:ring-[#8F0709]/10"
        />
        <TimePickerInput value={validTimePart} onChange={handleTimeChange} />
      </div>
    </label>
  );
}
