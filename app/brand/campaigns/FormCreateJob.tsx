"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ImagePlus, Briefcase, ChevronDown } from "lucide-react";
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const TOTAL_STEPS = 5;

  const STEP_LABELS = ["Cơ bản", "Địa điểm", "Mô tả", "Quyền lợi", "Hoàn tất"];

  const isStepValid = () => {
    if (formStep === 1) return form.title.trim() !== "";
    if (formStep === 2) return true;
    if (formStep === 3) return form.description.trim() !== "" || form.requirements.trim() !== "";
    return true;
  };

  function handleClose() {
    setForm(emptyForm);
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

    try {
      const createdCampaign = await createBrandCampaign(form);
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
        title: form.title || "Campaign mới",
        jobType: form.jobType,
        eventName: form.eventName,
        campaignType: form.campaignType,
        city: form.city,
        address: form.address || form.city,
        startDate: form.startDate,
        endDate: form.endDate,
        deadline: form.applicationDeadline || form.deadline,
        applicationDeadline: form.applicationDeadline || form.deadline,
        eventDate: form.eventDate,
        venueName: form.venueName,
        venueAddress: form.venueAddress || form.address,
        talentQuantity: Number(form.talentQuantity) || 1,
        budget: form.budget,
        budgetValue: 40000000,
        benefits: form.benefits || "Thỏa thuận theo brief",
        status: "published",
        shortlistedTalentIds: [],
        applicants: [],
        contactRequests: 0,
        views: 0,
        description: form.description || "Chưa có mô tả brief.",
        requirements: form.requirements || "Chưa có yêu cầu chi tiết.",
        roles: splitOptionText(form.roles),
        responsibilities: splitOptionText(form.responsibilities),
        industries: splitOptionText(form.industries),
        targetProfiles: splitOptionText(form.targetProfiles),
        contactNote: form.contactNote,
        sponsorships: [],
        escrowed: form.escrowed,
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
                {formStep === 4 && "Phân loại & Quyền lợi"}
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
                    onClick={() => stepNum <= formStep && setFormStep(stepNum)}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-black transition-all",
                      isDone
                        ? "bg-amber-400/20 border border-amber-400/40 text-amber-300 cursor-pointer"
                        : isActive
                          ? "bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                          : "bg-white/5 border border-white/10 text-slate-600 cursor-default"
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
              <FormInput label="Nhóm chiến dịch" value={form.campaignType} onChange={(value) => setForm((c) => ({ ...c, campaignType: value }))} />
              <FormInput label="Tên sự kiện / chương trình" value={form.eventName} onChange={(value) => setForm((c) => ({ ...c, eventName: value }))} />
              <FormInput label="Số lượng cần tuyển *" type="number" value={form.talentQuantity} onChange={(value) => setForm((c) => ({ ...c, talentQuantity: value }))} />
              <FormInput label="Ngân sách" value={form.budget} onChange={(value) => setForm((c) => ({ ...c, budget: value }))} />
            </div>
          )}

          {/* STEP 2: Địa điểm & Thời gian */}
          {formStep === 2 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <FormInput label="Thành phố *" value={form.city} onChange={(value) => setForm((c) => ({ ...c, city: value }))} />
              <FormInput label="Địa điểm *" value={form.address} onChange={(value) => setForm((c) => ({ ...c, address: value }))} />
              <FormInput label="Tên địa điểm tổ chức" value={form.venueName} onChange={(value) => setForm((c) => ({ ...c, venueName: value }))} />
              <FormInput label="Địa chỉ tổ chức chi tiết" value={form.venueAddress} onChange={(value) => setForm((c) => ({ ...c, venueAddress: value }))} />
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Yêu cầu *</span>
                <textarea
                  value={form.requirements}
                  onChange={(e) => setForm((c) => ({ ...c, requirements: e.target.value }))}
                  rows={4}
                  placeholder="Mô tả các yêu cầu về kinh nghiệm, kỹ năng, ngoại hình..."
                  className="w-full resize-none rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60 placeholder:text-slate-600 leading-relaxed"
                />
              </label>
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
              <FormInput label="Ghi chú ứng tuyển" value={form.contactNote} onChange={(value) => setForm((c) => ({ ...c, contactNote: value }))} />
            </div>
          )}

          {/* STEP 5: Hoàn tất */}
          {formStep === 5 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-slate-900/60 p-8 text-center transition-all hover:border-amber-400/50 hover:bg-slate-900">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => setCampaignImages(Array.from(e.target.files || []))}
                />
                <ImagePlus className="mb-3 h-8 w-8 text-slate-400 transition-colors group-hover:text-amber-300" />
                <span className="text-sm font-black text-slate-100">Ảnh chiến dịch</span>
                <span className="mt-1.5 text-[10px] font-medium text-slate-500">
                  {campaignImages.length > 0
                    ? `✅ ${campaignImages.length} ảnh đã chọn. Ảnh đầu tiên sẽ làm ảnh đại diện.`
                    : "Tải poster, moodboard hoặc ảnh brief. Có thể chọn nhiều ảnh."}
                </span>
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/5 bg-slate-900/30 p-4 hover:bg-slate-900/50 transition-colors">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    🛡️ Ký quỹ chiến dịch (Escrow Payment)
                  </span>
                  <span className="text-[9.5px] text-slate-500 font-medium leading-normal">
                    Tạm giữ chi phí thù lao để bảo chứng thanh toán tự động khi nghiệm thu (Khuyên dùng).
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={form.escrowed}
                  onChange={(e) => setForm((c) => ({ ...c, escrowed: e.target.checked }))}
                  className="rounded accent-amber-400 h-4 w-4 shrink-0 cursor-pointer"
                />
              </label>

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
                onClick={() => isStepValid() && setFormStep(formStep + 1)}
                disabled={!isStepValid()}
                className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-5 text-xs font-black text-slate-950 hover:brightness-105 active:scale-95 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
  const customValue = customItems.join("\n");
  const summary = selectedItems.length > 0
    ? selectedItems.slice(0, 2).join(", ") + (selectedItems.length > 2 ? ` +${selectedItems.length - 2}` : "")
    : "Chọn từ danh sách";

  function toggleOption(option: string) {
    const next = selectedSet.has(option)
      ? selectedItems.filter((item) => item !== option)
      : [...selectedItems, option];

    onChange(joinOptionText(next));
  }

  function updateCustomItems(nextValue: string) {
    const selectedOptions = options.filter((option) => selectedSet.has(option));
    onChange(joinOptionText([...selectedOptions, ...splitOptionText(nextValue)]));
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
                value={customValue}
                onChange={(event) => updateCustomItems(event.target.value)}
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
          value={customValue}
          onChange={(event) => updateCustomItems(event.target.value)}
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
