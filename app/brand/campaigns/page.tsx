"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ChevronRight,
  Plus,
  Users,
  MapPin,
  Calendar,
} from "lucide-react";
import { type Campaign } from "@/lib/brand-mvp-data";
import { loadBrandCampaigns } from "@/lib/brand-api";
import { cn } from "@/lib/utils";
import FormCreateJob from "./FormCreateJob";

type CampaignStatusTab = "all" | Campaign["status"];

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
  const filteredCampaigns = useMemo(() => {
    if (activeTab === "all") return campaigns;
    return campaigns.filter((campaign) => campaign.status === activeTab);
  }, [activeTab, campaigns]);

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

      <FormCreateJob
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onCampaignCreated={(newCampaign) => setCampaigns((prev) => [newCampaign, ...prev])}
      />
    </div>
  );
}
