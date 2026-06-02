"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import { campaigns as initialCampaigns, type Campaign } from "@/lib/brand-mvp-data";
import { cn } from "@/lib/utils";

type CampaignStatusTab = "all" | Campaign["status"];

const emptyForm = {
  title: "",
  jobType: "KOL livestream",
  city: "Hà Nội",
  address: "",
  startDate: "2026-06-15",
  endDate: "2026-06-30",
  deadline: "2026-06-10",
  talentQuantity: "3",
  budget: "20.000.000đ - 40.000.000đ",
  benefits: "",
  requirements: "",
  description: "",
};

function statusLabel(status: Campaign["status"]) {
  if (status === "published") return "Đang mở";
  if (status === "closed") return "Đã đóng";
  return "Nháp";
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("onstagevn_campaigns");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) { }
      }
    }
    return initialCampaigns;
  });
  const [activeTab, setActiveTab] = useState<CampaignStatusTab>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filteredCampaigns = useMemo(() => {
    if (activeTab === "all") return campaigns;
    return campaigns.filter((campaign) => campaign.status === activeTab);
  }, [activeTab, campaigns]);

  function handleCreateCampaign(event: React.FormEvent) {
    event.preventDefault();

    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      title: form.title || "Campaign mới",
      jobType: form.jobType,
      city: form.city,
      address: form.address || form.city,
      startDate: form.startDate,
      endDate: form.endDate,
      deadline: form.deadline,
      talentQuantity: Number(form.talentQuantity) || 1,
      budget: form.budget,
      budgetValue: 40000000,
      benefits: form.benefits || "Thỏa thuận theo brief",
      status: "draft",
      shortlistedTalentIds: [],
      applicants: [],
      contactRequests: 0,
      views: 0,
      description: form.description || "Chưa có mô tả brief.",
      requirements: form.requirements || "Chưa có yêu cầu chi tiết.",
    };

    const nextCampaigns = [newCampaign, ...campaigns];
    setCampaigns(nextCampaigns);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("onstagevn_campaigns", JSON.stringify(nextCampaigns));
    }
    setIsCreating(false);
    setForm(emptyForm);

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
          { id: "draft", label: "Nháp" },
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
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-400">{campaign.jobType}</span>
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
            <button type="button" onClick={() => setIsCreating(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer">
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Job posting form</span>
              <h2 className="mt-1 text-lg font-black text-white">Tạo job/campaign mới</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormInput label="Tiêu đề job *" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} required />
              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Loại hình *</span>
                <select value={form.jobType} onChange={(event) => setForm((current) => ({ ...current, jobType: event.target.value }))} className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60">
                  <option>KOL livestream</option>
                  <option>Model lookbook</option>
                  <option>PG event</option>
                  <option>MC sự kiện</option>
                  <option>Dancer performance</option>
                </select>
              </label>
              <FormInput label="Số lượng cần tuyển *" type="number" value={form.talentQuantity} onChange={(value) => setForm((current) => ({ ...current, talentQuantity: value }))} />
              <FormInput label="Thành phố *" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} />
              <FormInput label="Địa điểm *" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} />
              <FormInput label="Ngân sách" value={form.budget} onChange={(value) => setForm((current) => ({ ...current, budget: value }))} />
              <FormInput label="Ngày bắt đầu" type="date" value={form.startDate} onChange={(value) => setForm((current) => ({ ...current, startDate: value }))} />
              <FormInput label="Ngày kết thúc" type="date" value={form.endDate} onChange={(value) => setForm((current) => ({ ...current, endDate: value }))} />
              <FormInput label="Deadline ứng tuyển" type="date" value={form.deadline} onChange={(value) => setForm((current) => ({ ...current, deadline: value }))} />
              <FormInput label="Phúc lợi" value={form.benefits} onChange={(value) => setForm((current) => ({ ...current, benefits: value }))} />
              <label className="space-y-1 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Yêu cầu *</span>
                <textarea value={form.requirements} onChange={(event) => setForm((current) => ({ ...current, requirements: event.target.value }))} required rows={3} className="w-full resize-none rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mô tả công việc *</span>
                <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required rows={4} className="w-full resize-none rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-3 border-t border-white/5 pt-5">
              <button type="button" onClick={() => setIsCreating(false)} className="h-10 rounded-xl border border-white/10 px-4 text-xs font-black text-white hover:bg-white/5 cursor-pointer">Hủy</button>
              <button type="submit" className="flex h-10 items-center rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-5 text-xs font-black text-slate-950 cursor-pointer">
                <Briefcase className="mr-2 h-4 w-4" />
                Lưu nháp
              </button>
            </div>
          </form>
        </div>
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
