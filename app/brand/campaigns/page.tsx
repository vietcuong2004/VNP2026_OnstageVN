"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  ImagePlus,
  Plus,
  X,
} from "lucide-react";
import { campaigns as initialCampaigns, type Campaign } from "@/lib/brand-mvp-data";
import { createBrandCampaign, loadBrandCampaigns, publishBrandCampaign, uploadBrandCampaignMedia } from "@/lib/brand-api";
import { cn } from "@/lib/utils";

type CampaignStatusTab = "all" | Campaign["status"];

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

function statusLabel(status: Campaign["status"]) {
  if (status === "published") return "Đang mở";
  if (status === "closed") return "Đã đóng";
  return "Nháp";
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);

  useEffect(() => {
    loadBrandCampaigns(initialCampaigns).then((items) => {
      setCampaigns(items);
    });
  }, []);
  const [activeTab, setActiveTab] = useState<CampaignStatusTab>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [campaignImages, setCampaignImages] = useState<File[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  function closeCreateForm() {
    setIsCreating(false);
    setCampaignImages([]);
    setOpenDropdown(null);
  }

  const filteredCampaigns = useMemo(() => {
    if (activeTab === "all") return campaigns;
    return campaigns.filter((campaign) => campaign.status === activeTab);
  }, [activeTab, campaigns]);

  async function handleCreateCampaign(event: React.FormEvent) {
    event.preventDefault();

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
    }

    const nextCampaigns = [newCampaign, ...campaigns];
    setCampaigns(nextCampaigns);
    setIsCreating(false);
    setForm(emptyForm);
    setCampaignImages([]);

    // Redirect to dynamic route details page of the newly created campaign
    router.push(`/brand/campaigns/${newCampaign.id}`);
  }

  return (
    <div className="space-y-6 pb-16">
      <section className="flex flex-col gap-4 border-b border-white/5 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
              DANH SÁCH CAMPAIGN
            </span>
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight text-white">
            QUẢN LÝ CÁC CHIẾN DỊCH CỦA BRAND
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Đăng job/campaign, theo dõi ứng viên theo stage và gửi yêu cầu liên hệ.
          </p>
        </div>

        <button onClick={() => setIsCreating(true)} className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-5 text-xs font-black text-slate-950 cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Tạo job/campaign
        </button>
      </section>

      <section className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
        {[
          { id: "all", label: "Tất cả" },
          { id: "published", label: "Đang mở" },
          { id: "closed", label: "Đã đóng" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as CampaignStatusTab)} className={cn("rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer", activeTab === tab.id ? "bg-white/10 text-white" : "text-slate-500 hover:text-white")}>
            {tab.label}
          </button>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCampaigns.map((campaign) => (
          <article key={campaign.id} className="flex flex-col justify-between rounded-2xl border border-white/5 bg-slate-950/25 p-5 transition hover:border-white/10">
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-400">{campaign.jobType}</span>
                  {campaign.escrowed && (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-400 font-extrabold border border-emerald-500/20 uppercase tracking-wider">
                      🛡️ Đã Ký Quỹ
                    </span>
                  )}
                </div>
                <span className={cn("rounded px-2 py-0.5 text-[9px] font-black uppercase", campaign.status === "published" ? "bg-emerald-500/10 text-emerald-300" : campaign.status === "closed" ? "bg-slate-500/10 text-slate-400" : "bg-amber-500/10 text-amber-300")}>
                  {statusLabel(campaign.status)}
                </span>
              </div>
              <h3 className="line-clamp-1 text-base font-black text-white">{campaign.title}</h3>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500">{campaign.description}</p>
            </div>

            <div className="mt-5 border-t border-white/5 pt-4">
              <div className="mb-4 grid grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="block text-[8px] font-bold uppercase text-slate-500">Views</span>
                  <span className="font-bold text-white">{campaign.views}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold uppercase text-slate-500">Ứng viên</span>
                  <span className="font-bold text-white">{campaign.applicants.length}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold uppercase text-slate-500">Shortlist</span>
                  <span className="font-bold text-amber-300">{campaign.shortlistedTalentIds.length}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold uppercase text-slate-500">Liên hệ</span>
                  <span className="font-bold text-emerald-300">{campaign.contactRequests}</span>
                </div>
              </div>
              <button onClick={() => router.push(`/brand/campaigns/${campaign.id}`)} className="flex h-10 w-full items-center justify-center rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-wider text-white hover:bg-white/10 cursor-pointer">
                Xem thông tin <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        ))}
      </section>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <form onSubmit={handleCreateCampaign} className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#070913] p-6 shadow-2xl">
            <button type="button" onClick={closeCreateForm} className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer">
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Job posting form</span>
              <h2 className="mt-1 text-lg font-black text-white">Tạo job/campaign mới</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormInput label="Tiêu đề job *" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} required />
              <FormInput label="Tên sự kiện / chương trình" value={form.eventName} onChange={(value) => setForm((current) => ({ ...current, eventName: value }))} />
              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Loại hình *</span>
                <select value={form.jobType} onChange={(event) => setForm((current) => ({ ...current, jobType: event.target.value }))} className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60">
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
              <FormInput label="Nhóm chiến dịch" value={form.campaignType} onChange={(value) => setForm((current) => ({ ...current, campaignType: value }))} />
              <FormInput label="Số lượng cần tuyển *" type="number" value={form.talentQuantity} onChange={(value) => setForm((current) => ({ ...current, talentQuantity: value }))} />
              <FormInput label="Thành phố *" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} />
              <FormInput label="Địa điểm *" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} />
              <FormInput label="Tên địa điểm tổ chức" value={form.venueName} onChange={(value) => setForm((current) => ({ ...current, venueName: value }))} />
              <FormInput label="Địa chỉ tổ chức chi tiết" value={form.venueAddress} onChange={(value) => setForm((current) => ({ ...current, venueAddress: value }))} />
              <FormInput label="Ngân sách" value={form.budget} onChange={(value) => setForm((current) => ({ ...current, budget: value }))} />
              <FormInput label="Ngày bắt đầu" type="date" value={form.startDate} onChange={(value) => setForm((current) => ({ ...current, startDate: value }))} />
              <FormInput label="Ngày kết thúc" type="date" value={form.endDate} onChange={(value) => setForm((current) => ({ ...current, endDate: value }))} />
              <FormInput label="Hạn ứng tuyển" type="date" value={form.applicationDeadline} onChange={(value) => setForm((current) => ({ ...current, applicationDeadline: value, deadline: value }))} />
              <FormInput label="Ngày sự kiện chính" type="date" value={form.eventDate} onChange={(value) => setForm((current) => ({ ...current, eventDate: value }))} />
              <MultiChoiceField
                id="roles"
                label="Vị trí tuyển dụng"
                value={form.roles}
                options={ROLE_OPTIONS}
                placeholder={"Nhập thêm vị trí khác, mỗi dòng một mục"}
                onChange={(value) => setForm((current) => ({ ...current, roles: value }))}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />

              <MultiChoiceField
                id="benefits"
                label="Quyền lợi / đãi ngộ"
                value={form.benefits}
                options={BENEFIT_OPTIONS}
                placeholder={"Nhập thêm quyền lợi khác, mỗi dòng một mục"}
                onChange={(value) => setForm((current) => ({ ...current, benefits: value }))}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />

              <MultiChoiceField
                id="responsibilities"
                label="Mô tả đầu việc"
                value={form.responsibilities}
                options={RESPONSIBILITY_OPTIONS}
                placeholder={"Nhập thêm đầu việc khác, mỗi dòng một mục"}
                onChange={(value) => setForm((current) => ({ ...current, responsibilities: value }))}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                showCustomInput
              />

              <MultiChoiceField
                id="industries"
                label="Lĩnh vực liên quan"
                value={form.industries}
                options={INDUSTRY_OPTIONS}
                placeholder={"Nhập thêm lĩnh vực khác, mỗi dòng một mục"}
                onChange={(value) => setForm((current) => ({ ...current, industries: value }))}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />

              <MultiChoiceField
                id="targetProfiles"
                label="Nhóm Talent phù hợp"
                value={form.targetProfiles}
                options={TARGET_PROFILE_OPTIONS}
                placeholder={"Nhập thêm nhóm Talent khác, mỗi dòng một mục"}
                onChange={(value) => setForm((current) => ({ ...current, targetProfiles: value }))}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />
              <FormInput label="Ghi chú ứng tuyển" value={form.contactNote} onChange={(value) => setForm((current) => ({ ...current, contactNote: value }))} />

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-slate-900/30 p-2.5 md:col-span-2 hover:bg-slate-900/50 transition-colors">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    🛡️ Ký quỹ chiến dịch (Escrow Payment)
                  </span>
                  <span className="text-[9.5px] text-slate-500 font-medium leading-normal">
                    Tạm giữ chi phí thù lao trên hệ thống để bảo chứng thanh toán tự động khi nghiệm thu (Khuyên dùng).
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={form.escrowed}
                  onChange={(e) => setForm(current => ({ ...current, escrowed: e.target.checked }))}
                  className="rounded accent-amber-400 h-4 w-4 shrink-0 cursor-pointer"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Yêu cầu *</span>
                <textarea value={form.requirements} onChange={(event) => setForm((current) => ({ ...current, requirements: event.target.value }))} required rows={3} className="w-full resize-none rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mô tả công việc *</span>
                <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required rows={4} className="w-full resize-none rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
              </label>

              <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-slate-900/60 p-5 text-center transition-all hover:border-amber-400 hover:bg-slate-900 md:col-span-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(event) => setCampaignImages(Array.from(event.target.files || []))}
                />
                <ImagePlus className="mb-2 h-7 w-7 text-slate-400 transition-colors group-hover:text-amber-300" />
                <span className="text-xs font-extrabold text-slate-100">Ảnh chiến dịch</span>
                <span className="mt-1 text-[10px] font-medium text-slate-500">
                  {campaignImages.length > 0
                    ? `${campaignImages.length} ảnh đã chọn. Ảnh đầu tiên sẽ dùng làm ảnh đại diện.`
                    : "Tải poster, moodboard hoặc ảnh brief. Có thể chọn nhiều ảnh."}
                </span>
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-3 border-t border-white/5 pt-5">
              <button type="button" onClick={closeCreateForm} className="h-10 rounded-xl border border-white/10 px-4 text-xs font-black text-white hover:bg-white/5 cursor-pointer">Hủy</button>
              <button type="submit" className="flex h-10 items-center rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-5 text-xs font-black text-slate-950 cursor-pointer">
                <Briefcase className="mr-2 h-4 w-4" />
                Tạo Job
              </button>
            </div>
          </form>
        </div>
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
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
    </label>
  );
}
