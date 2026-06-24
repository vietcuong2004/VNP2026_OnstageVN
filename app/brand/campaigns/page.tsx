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
  Sparkles,
  Users,
  UserCheck,
  ShieldCheck,
  MapPin,
  Calendar,
} from "lucide-react";
import { type Campaign } from "@/lib/brand-mvp-data";
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

function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A";
  const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = datePart.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return datePart;
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    loadBrandCampaigns([]).then((items) => {
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
      <div className="relative overflow-hidden rounded-3xl border border-white/7 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.97))] p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        {/* Glow effects inside the card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-slate-900/50 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10 text-left">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-amber-400/40 bg-amber-400/10 text-amber-300">
                Brand Portal
              </span>
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-yellow-400/20 bg-yellow-400/5 text-yellow-200">
                Campaign Manager
              </span>
            </div>

            <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl">
              QUẢN LÝ <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-600 bg-clip-text text-transparent">CHIẾN DỊCH</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Đăng tuyển job/campaign mới, xem chi tiết và đối soát giải ngân thù lao, hoa hồng Affiliate cho các Talent tham gia chiến dịch.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-6 text-xs font-black uppercase tracking-wider text-slate-950 hover:shadow-[0_0_20px_rgba(240,197,107,0.25)] hover:scale-[1.02] active:scale-98 transition-all cursor-pointer shrink-0"
          >
            <Plus className="mr-2 h-4 w-4 stroke-[3]" />
            Tạo job/campaign
          </button>
        </div>
      </div>

      <section className="flex flex-wrap gap-2 pb-2 text-left">
        {[
          { id: "all", label: "Tất cả" },
          { id: "published", label: "Đang mở" },
          { id: "closed", label: "Đã đóng" },
        ].map((tab) => {
          const count = tab.id === "all"
            ? campaigns.length
            : campaigns.filter((c) => c.status === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CampaignStatusTab)}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-black transition-all duration-300 cursor-pointer border flex items-center gap-1.5",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 border-amber-400/30 shadow-md shadow-amber-500/10 scale-[1.02]"
                  : "bg-[#0c101b]/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "rounded px-1.5 py-0.5 text-[9px] font-black leading-none",
                activeTab === tab.id
                  ? "bg-slate-950/15 text-slate-950"
                  : "bg-white/5 text-slate-400"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCampaigns.map((campaign) => {
          const isPublished = campaign.status === "published";
          const isClosed = campaign.status === "closed";
          
          return (
            <article
              key={campaign.id}
              className={cn(
                "flex flex-col justify-between rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-0.5 flex-1 w-full text-left relative overflow-hidden group h-[320px]",
                isClosed
                  ? "border-white/5 bg-[#0b0c10]/40 hover:border-white/15 hover:shadow-[0_8px_30px_rgba(255,255,255,0.01)]"
                  : "border-[#151b2d] bg-gradient-to-b from-[#111421]/80 to-[#070913]/95 hover:border-amber-400/30 hover:shadow-[0_12px_40px_rgba(245,158,11,0.08)]"
              )}
            >
              {/* Radial gradient shine inside card */}
              {!isClosed && (
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-gradient-to-br from-amber-300 to-yellow-600 transition-opacity duration-300 group-hover:opacity-15 pointer-events-none" />
              )}
              
              <div className="relative z-10">
                <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-white/5 px-2.5 py-1 text-[8.5px] font-black uppercase text-slate-400 tracking-wider">
                      {campaign.jobType}
                    </span>
                    {campaign.escrowed && (
                      <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[8.5px] text-emerald-300 font-extrabold border border-emerald-500/20 uppercase tracking-wider">
                        🛡️ Đã Ký Quỹ
                      </span>
                    )}
                  </div>
                  
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider border",
                      isPublished
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                        : isClosed
                          ? "bg-slate-500/10 text-slate-400 border-white/5"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                    )}
                  >
                    {statusLabel(campaign.status)}
                  </span>
                </div>
                
                <h3 className="line-clamp-1 text-base font-black text-white group-hover:text-amber-300 transition-colors duration-300 leading-snug">
                  {campaign.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 font-medium min-h-[32px]">
                  {campaign.description || "Chưa có mô tả chi tiết."}
                </p>

                {/* Info Metadata Grid */}
                <div className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Briefcase className="h-3.5 w-3.5 text-amber-400/80 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-300 truncate" title={campaign.budget}>{campaign.budget || "Thỏa thuận"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="h-3.5 w-3.5 text-amber-400/80 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-300 truncate">{campaign.city || "Toàn quốc"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Users className="h-3.5 w-3.5 text-amber-400/80 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-300">Tuyển: {campaign.talentQuantity}</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className="h-3.5 w-3.5 text-amber-400/80 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-300 truncate">Hạn: {formatDate(campaign.applicationDeadline || campaign.deadline)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-white/5 pt-3 relative z-10">
                <div className="mb-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div>
                    <span className="block text-[7.5px] font-black uppercase text-slate-500 tracking-widest">Views</span>
                    <span className="font-mono font-black text-amber-300 mt-0.5 block">{campaign.views}</span>
                  </div>
                  <div className="border-l border-white/5">
                    <span className="block text-[7.5px] font-black uppercase text-slate-500 tracking-widest">Ứng viên</span>
                    <span className="font-mono font-black text-emerald-400 mt-0.5 block">{campaign.applicants.length}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
                  className="flex h-10 w-full items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-[9.5px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
                >
                  Xem thông tin <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          );
        })}
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
