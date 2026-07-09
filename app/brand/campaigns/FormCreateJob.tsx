"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ImagePlus, Briefcase, ChevronDown, Upload, Pencil } from "lucide-react";
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
  "Người mẫu",
  "Người dẫn chương trình",
  "Ca sĩ",
  "KOL/KOC",
  "Beauty Blogger",
  "Fashion Blogger",
  "Doanh nhân / Nhà đầu tư",
  "Chuyên gia làm đẹp",
  "Nhà thiết kế",
  "Hoa hậu / Nghệ sĩ",
  "Nhân vật truyền cảm hứng",
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

const emptyForm = {
  title: "",
  jobType: "KOL livestream",
  eventName: "",
  campaignType: "Tuyển cộng tác viên",
  city: "Hà Nội",
  address: "",
  startDate: "2026-06-15",
  endDate: "2026-06-30",
  deadline: "2026-06-10",
  applicationDeadline: "2026-06-10",
  eventDate: "2026-07-11",
  venueName: "",
  venueAddress: "",
  talentQuantity: "3",
  budget: "20.000.000đ - 40.000.000đ",
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

interface FormCreateJobProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: (campaign: Campaign) => void;
}

export default function FormCreateJob({ isOpen, onClose, onCampaignCreated }: FormCreateJobProps) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [campaignImages, setCampaignImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [formStep, setFormStep] = useState(1);

  useEffect(() => {
    const urls = campaignImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [campaignImages]);

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const TOTAL_STEPS = 5;

  const STEP_LABELS = ["Cơ bản", "Địa điểm", "Mô tả", "Yêu cầu", "Hoàn tất"];

  const [budgetFrom, setBudgetFrom] = useState("20.000.000đ");
  const [budgetTo, setBudgetTo] = useState("40.000.000đ");

  const updateBudgetState = (fromVal: string, toVal: string, isFrom: boolean) => {
    const f = isFrom ? fromVal : budgetFrom;
    const t = isFrom ? budgetTo : toVal;

    let budgetString = "";
    if (f && t) {
      budgetString = `${f} - ${t}`;
    } else if (f) {
      budgetString = f;
    } else if (t) {
      budgetString = t;
    }
    setForm((c) => ({ ...c, budget: budgetString }));
  };

  const handleBudgetChange = (
    val: string,
    oldVal: string,
    setter: (v: string) => void,
    otherVal: string,
    isFrom: boolean
  ) => {
    if (oldVal.endsWith("đ") && !val.endsWith("đ") && val === oldVal.slice(0, -1)) {
      const digits = val.replace(/[^\d]/g, "");
      const nextDigits = digits.slice(0, -1);
      const formatted = nextDigits ? Number(nextDigits).toLocaleString("vi-VN") + "đ" : "";
      setter(formatted);
      updateBudgetState(formatted, otherVal, isFrom);
      return;
    }

    const digits = val.replace(/[^\d]/g, "");
    const formatted = digits ? Number(digits).toLocaleString("vi-VN") + "đ" : "";
    setter(formatted);
    updateBudgetState(formatted, otherVal, isFrom);
  };

  const isStepValid = () => {
    if (formStep === 1) return form.title.trim() !== "";
    if (formStep === 2) return true;
    if (formStep === 3) return form.description.trim() !== "";
    return true;
  };

  function handleClose() {
    setForm(emptyForm);
    setBudgetFrom("20.000.000đ");
    setBudgetTo("40.000.000đ");
    setCampaignImages([]);
    setOpenDropdown(null);
    setFormStep(1);
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSubmitting) return;

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
    const updatedForm = { ...form, requirements: finalRequirements };

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
        campaignType: updatedForm.campaignType,
        city: updatedForm.city,
        address: updatedForm.address || updatedForm.city,
        startDate: updatedForm.startDate,
        endDate: updatedForm.endDate,
        deadline: updatedForm.applicationDeadline || updatedForm.deadline,
        applicationDeadline: updatedForm.applicationDeadline || updatedForm.deadline,
        eventDate: updatedForm.eventDate,
        venueName: updatedForm.venueName,
        venueAddress: updatedForm.venueAddress || updatedForm.address,
        talentQuantity: Number(updatedForm.talentQuantity) || 1,
        budget: updatedForm.budget,
        budgetValue: 40000000,
        benefits: updatedForm.benefits || "Thỏa thuận theo brief",
        status: "published",
        shortlistedTalentIds: [],
        applicants: [],
        contactRequests: 0,
        views: 0,
        description: updatedForm.description || "Chưa có mô tả brief.",
        requirements: updatedForm.requirements || "Chưa có yêu cầu chi tiết.",
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
    router.push(`/brand/campaigns/${newCampaign.id}`);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#070913] shadow-[0_32px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* ── HEADER with step indicator ── */}
        <div className="relative z-10 px-6 pt-6 pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                Bước {formStep}/{TOTAL_STEPS}
              </span>
              <h2 className="mt-0.5 text-lg font-black text-white">
                {formStep === 1 && "Thông tin cơ bản"}
                {formStep === 2 && "Địa điểm & Thời gian"}
                {formStep === 3 && "Mô tả công việc"}
                {formStep === 4 && "Yêu cầu"}
                {formStep === 5 && "Hoàn tất"}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-slate-400 hover:text-white cursor-pointer transition-colors mt-1 p-1 rounded-lg hover:bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {STEP_LABELS.map((label, idx) => {
              const stepNum = idx + 1;
              const isDone = stepNum < formStep;
              const isActive = stepNum === formStep;
              return (
                <div key={label} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormStep(stepNum)}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-black transition-all cursor-pointer",
                      isDone
                        ? "bg-amber-400/20 border border-amber-400/40 text-amber-300"
                        : isActive
                          ? "bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                          : "bg-white/5 border border-white/10 text-slate-400 hover:border-white/20"
                    )}
                  >
                    {isDone ? "✓" : stepNum}
                  </button>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider hidden sm:block",
                    isActive ? "text-amber-300" : "text-slate-600"
                  )}>{label}</span>
                  {idx < STEP_LABELS.length - 1 && (
                    <div className={cn(
                      "h-px flex-1 min-w-[12px] mx-1 hidden sm:block transition-colors",
                      isDone ? "bg-amber-400/30" : "bg-white/5"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── STEP CONTENT (scrollable) ── */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* STEP 1: Thông tin cơ bản */}
          {formStep === 1 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="sm:col-span-2">
                <FormInput label="Tiêu đề job *" value={form.title} onChange={(value) => setForm((c) => ({ ...c, title: value }))} required />
              </div>
              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Loại hình *</span>
                <select value={form.jobType} onChange={(e) => setForm((c) => ({ ...c, jobType: e.target.value }))} className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60">
                  <option>Tuyển cộng tác viên</option>
                  <option>Tuyển đại sứ</option>
                  <option>Beauty KOL/KOC</option>
                  <option>KOL livestream</option>
                  <option>Model lookbook</option>
                  <option>PG event</option>
                  <option>MC sự kiện</option>
                  <option>Dancer performance</option>
                </select>
              </label>
              {/* <FormInput label="Nhóm chiến dịch" value={form.campaignType} onChange={(value) => setForm((c) => ({ ...c, campaignType: value }))} /> */}
              {/* <FormInput label="Tên sự kiện / chương trình" value={form.eventName} onChange={(value) => setForm((c) => ({ ...c, eventName: value }))} /> */}
              <FormInput label="Số lượng cần tuyển *" type="number" value={form.talentQuantity} onChange={(value) => setForm((c) => ({ ...c, talentQuantity: value }))} />
              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ngân sách tối thiểu</span>
                <input
                  type="text"
                  value={budgetFrom}
                  onChange={(e) => handleBudgetChange(e.target.value, budgetFrom, setBudgetFrom, budgetTo, true)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60"
                  placeholder="Từ"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ngân sách tối đa</span>
                <input
                  type="text"
                  value={budgetTo}
                  onChange={(e) => handleBudgetChange(e.target.value, budgetTo, setBudgetTo, budgetFrom, false)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60"
                  placeholder="Đến"
                />
              </label>
            </div>
          )}

          {/* STEP 2: Địa điểm & Thời gian */}
          {formStep === 2 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <FormInput label="Thành phố *" value={form.city} onChange={(value) => setForm((c) => ({ ...c, city: value }))} />
              <FormInput label="Địa điểm *" value={form.address} onChange={(value) => setForm((c) => ({ ...c, address: value }))} />
              <FormInput label="Ngày bắt đầu" type="date" value={form.startDate} onChange={(value) => setForm((c) => ({ ...c, startDate: value }))} />
              <FormInput label="Ngày kết thúc" type="date" value={form.endDate} onChange={(value) => setForm((c) => ({ ...c, endDate: value }))} />
              <FormInput label="Hạn ứng tuyển" type="date" value={form.applicationDeadline} onChange={(value) => setForm((c) => ({ ...c, applicationDeadline: value, deadline: value }))} />
              <FormInput label="Ngày sự kiện chính" type="date" value={form.eventDate} onChange={(value) => setForm((c) => ({ ...c, eventDate: value }))} />
            </div>
          )}

          {/* STEP 3: Mô tả công việc */}
          {formStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="space-y-1.5 block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mô tả công việc *</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  rows={4}
                  placeholder="Mô tả tổng quan về job, campaign, mục tiêu và kế hoạch..."
                  className="w-full resize-none rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60 placeholder:text-slate-600 leading-relaxed"
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
                <div className="md:col-span-5 rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-start h-full">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                    Xem trước đầu việc ({splitOptionText(form.responsibilities).length})
                  </span>
                  <div className="overflow-y-auto max-h-[220px] custom-scrollbar mt-3 space-y-2 pr-1 flex-1">
                    {splitOptionText(form.responsibilities).length === 0 ? (
                      <span className="text-[11px] text-slate-500 italic block">
                        Chưa chọn đầu việc nào.
                      </span>
                    ) : (
                      <ul className="list-none space-y-2">
                        {splitOptionText(form.responsibilities).map((item, index) => (
                          <li key={index} className="text-[11px] text-slate-300 leading-normal flex items-start gap-1.5">
                            <span className="text-amber-400 shrink-0 select-none">•</span>
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
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block mb-3 text-left">
                    Yêu cầu ngoại hình
                  </span>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Chiều cao */}
                    <div className="space-y-1.5 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Chiều cao tối thiểu (cm)
                      </span>
                      <input
                        type="number"
                        placeholder="Nhập chiều cao (cm)"
                        value={form.heightMin}
                        onChange={(e) => setForm((c) => ({ ...c, heightMin: e.target.value }))}
                        className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60 placeholder:text-slate-600"
                      />
                    </div>

                    {/* Cân nặng */}
                    <div className="space-y-1.5 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Cân nặng tối đa (kg)
                      </span>
                      <input
                        type="number"
                        placeholder="Nhập cân nặng (kg)"
                        value={form.weightMax}
                        onChange={(e) => setForm((c) => ({ ...c, weightMax: e.target.value }))}
                        className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60 placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Kinh nghiệm */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 block mb-3 text-left">
                    Yêu cầu kinh nghiệm
                  </span>
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Kinh nghiệm tối thiểu (năm)
                    </span>
                    <input
                      type="number"
                      placeholder="Số năm kinh nghiệm"
                      value={form.experienceMin}
                      onChange={(e) => setForm((c) => ({ ...c, experienceMin: e.target.value }))}
                      className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60 placeholder:text-slate-600"
                    />
                  </div>
                </div>
            </div>
          )}

          {/* STEP 5: Hoàn tất */}
          {formStep === 5 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5 text-left space-y-4">
                {/* Header */}
                <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between text-left">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
                      <ImagePlus className="h-4.5 w-4.5 text-amber-300" />
                    </div>
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-white">Bộ ảnh chiến dịch</h2>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        Tải lên các hình ảnh bạn muốn dùng cho chiến dịch (Tối đa 10 ảnh)
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400 shrink-0">
                    {campaignImages.length}/10 ảnh
                  </span>
                </div>

                {/* Horizontal Scroll List */}
                <div className="flex gap-4 overflow-x-auto pb-3 custom-scrollbar snap-x">
                  {/* Upload card (only show if < 10 images) */}
                  {campaignImages.length < 10 && (
                    <label className="group relative flex aspect-[4/5] w-[130px] shrink-0 snap-start cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-slate-900/60 p-4 text-center transition-all hover:border-amber-400 hover:bg-slate-900">
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
                      <ImagePlus className="mb-2 h-7 w-7 text-slate-400 transition-colors group-hover:text-amber-300" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-100">
                        Tải ảnh lên
                      </span>
                      <span className="mt-1 text-[8px] font-medium leading-relaxed text-slate-500">
                        JPG, PNG hoặc WebP
                      </span>
                    </label>
                  )}

                  {/* Previews */}
                  {imagePreviews.map((url, idx) => (
                    <div key={idx} className="group relative aspect-[4/5] w-[130px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
                      <img
                        src={url}
                        alt="Campaign preview"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />

                      {/* Delete button (X) */}
                      <button
                        type="button"
                        onClick={() => handleImageDelete(idx)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white opacity-100 shadow-lg backdrop-blur transition hover:border-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>

                      {/* Edit button (Pencil) */}
                      <label className="absolute right-12 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/60 text-white opacity-100 shadow-lg backdrop-blur transition hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950">
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
                        <span className="absolute bottom-2 left-2 bg-amber-400 text-slate-950 text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>


              {/* Summary preview */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">Tóm tắt chiến dịch</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                  {[
                    { label: "Tiêu đề", value: form.title },
                    { label: "Loại hình", value: form.jobType },
                    { label: "Thành phố", value: form.city },
                    { label: "Ngân sách", value: form.budget },
                    { label: "Ngày bắt đầu", value: form.startDate },
                    { label: "Hạn ứng tuyển", value: form.applicationDeadline },
                  ].map((row) => (
                    <div key={row.label}>
                      <span className="text-[8.5px] font-bold text-slate-600 uppercase tracking-wider block">{row.label}</span>
                      <span className="text-[10px] font-semibold text-slate-300 truncate block">{row.value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER navigation ── */}
        <div className="relative z-10 flex items-center justify-between gap-3 border-t border-white/5 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={() => formStep > 1 ? setFormStep(formStep - 1) : handleClose()}
            className="flex h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-black text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer transition-all"
            disabled={isSubmitting}
          >
            {formStep > 1 ? "← Quay lại" : "Hủy"}
          </button>

          <div className="flex items-center gap-2">
            {/* Progress bar */}
            <div className="hidden sm:flex h-1.5 w-20 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-300 to-yellow-500 transition-all duration-500"
                style={{ width: `${(formStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>

            {formStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => setFormStep(formStep + 1)}
                className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-5 text-xs font-black text-slate-950 hover:brightness-105 active:scale-95 cursor-pointer transition-all"
              >
                Tiếp theo →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-5 text-xs font-black text-slate-950 hover:brightness-105 active:scale-95 cursor-pointer transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-40"
              >
                <Briefcase className="h-4 w-4" />
                {isSubmitting ? "Đang tạo..." : "Tạo Job"}
              </button>
            )}
          </div>
        </div>
      </form>
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

  const [localText, setLocalText] = useState("");

  useEffect(() => {
    const currentCustomValue = customItems.join("\n");
    const cleanLocal = splitOptionText(localText).join("\n");

    if (currentCustomValue !== cleanLocal) {
      setLocalText(currentCustomValue);
    }
  }, [value, options]);

  const summary = selectedItems.length > 0
    ? id === "responsibilities"
      ? `Đã chọn ${selectedItems.length} đầu việc`
      : selectedItems.slice(0, 2).join(", ") + (selectedItems.length > 2 ? ` +${selectedItems.length - 2}` : "")
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
    setLocalText(newVal);

    const selectedOptions = options.filter((option) => selectedSet.has(option));
    const selectedString = selectedOptions.join("\n");

    onChange(selectedString ? `${selectedString}\n${newVal}` : newVal);
  }

  return (
    <div className="space-y-2 md:col-span-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(open ? null : id)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-xl border bg-slate-900/50 px-3 py-2.5 text-left text-xs outline-none transition-colors",
            open ? "border-amber-400/60" : "border-white/5 hover:border-white/15"
          )}
        >
          <span className={cn("truncate", selectedItems.length > 0 ? "text-white" : "text-slate-500")}>
            {summary}
          </span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform", open && "rotate-180 text-amber-300")} />
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full z-[70] mt-2 rounded-xl border border-white/10 bg-[#070913] p-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }}
                  onChange={toggleAll}
                  className="h-3.5 w-3.5 shrink-0 rounded accent-amber-400"
                />
                <span>{allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}</span>
              </label>
            </div>
            <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 custom-scrollbar">
              {options.map((option) => {
                const checked = selectedSet.has(option);

                return (
                  <label
                    key={option}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-semibold transition-colors",
                      checked
                        ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
                        : "border-white/5 bg-slate-950/60 text-slate-300 hover:border-white/15 hover:bg-white/[0.04]"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOption(option)}
                      className="h-3.5 w-3.5 shrink-0 rounded accent-amber-400"
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
            {!showCustomInput && (
              <textarea
                value={localText}
                onChange={(event) => handleTextChange(event.target.value)}
                rows={2}
                placeholder={placeholder}
                className="mt-3 w-full resize-none rounded-lg border border-white/5 bg-slate-950/70 px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-amber-400/60"
              />
            )}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setOpenDropdown(null)}
                className="rounded-lg bg-amber-300 px-3 py-1.5 text-[10px] font-black uppercase text-slate-950"
              >
                Xong
              </button>
            </div>
          </div>
        )}
      </div>
      {showCustomInput && (
        <textarea
          value={localText}
          onChange={(event) => handleTextChange(event.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full resize-none rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-600 focus:border-amber-400/60"
        />
      )}
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60"
      />
    </label>
  );
}
