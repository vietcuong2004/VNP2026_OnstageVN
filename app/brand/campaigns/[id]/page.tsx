"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { campaigns as initialCampaigns, talents, type Campaign, type CampaignStage } from "@/lib/brand-mvp-data";
import { cn } from "@/lib/utils";

const stageLabels: Record<CampaignStage, string> = {
  new: "Mới",
  shortlisted: "Shortlist",
  interview: "Phỏng vấn",
  accepted: "Đã chọn",
  confirmed: "Đã xác nhận",
};

function statusLabel(status: Campaign["status"]) {
  if (status === "published") return "Đang mở";
  if (status === "closed") return "Đã đóng";
  return "Nháp";
}

function nextStage(stage: CampaignStage): CampaignStage {
  if (stage === "new") return "shortlisted";
  if (stage === "shortlisted") return "interview";
  if (stage === "interview") return "accepted";
  return "confirmed";
}

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("onstagevn_campaigns");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return initialCampaigns;
  });

  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("onstagevn_sent_requests");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return {};
  });

  const selectedCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === params.id);
  }, [campaigns, params.id]);

  function updateCampaignStatus(id: string, status: Campaign["status"]) {
    const nextCampaigns = campaigns.map((campaign) =>
      campaign.id === id ? { ...campaign, status } : campaign
    );
    setCampaigns(nextCampaigns);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("onstagevn_campaigns", JSON.stringify(nextCampaigns));
    }
  }

  function moveApplicant(campaignId: string, talentId: string, stage: CampaignStage) {
    const nextCampaigns = campaigns.map((campaign) => {
      if (campaign.id !== campaignId) return campaign;
      return {
        ...campaign,
        applicants: campaign.applicants.map((item) =>
          item.talentId === talentId ? { ...item, stage } : item
        ),
      };
    });

    setCampaigns(nextCampaigns);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("onstagevn_campaigns", JSON.stringify(nextCampaigns));
    }
  }

  function sendContactRequest(campaignId: string, talentId: string) {
    const key = `${campaignId}-${talentId}`;
    const nextRequests = { ...sentRequests, [key]: true };
    setSentRequests(nextRequests);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("onstagevn_sent_requests", JSON.stringify(nextRequests));
    }

    const nextCampaigns = campaigns.map((campaign) =>
      campaign.id === campaignId
        ? { ...campaign, contactRequests: campaign.contactRequests + 1 }
        : campaign
    );
    setCampaigns(nextCampaigns);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("onstagevn_campaigns", JSON.stringify(nextCampaigns));
    }
  }

  if (!selectedCampaign) {
    return (
      <div className="space-y-6 pb-16 text-center py-20">
        <h2 className="text-lg font-black text-white">Không tìm thấy campaign</h2>
        <p className="text-xs text-slate-500 mt-2">Chiến dịch này có thể đã bị xóa hoặc không tồn tại.</p>
        <button
          onClick={() => router.push("/brand/campaigns")}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 px-4 text-xs font-black text-white hover:bg-white/10 cursor-pointer"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <section className="flex flex-col gap-4 border-b border-white/5 pb-5 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <button onClick={() => router.push("/brand/campaigns")} className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-slate-900/30 text-slate-400 hover:text-white cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-400">{selectedCampaign.jobType}</span>
              <span className={cn(
                "rounded px-2 py-0.5 text-[9px] font-black uppercase",
                selectedCampaign.status === "published" ? "bg-emerald-500/10 text-emerald-300" : selectedCampaign.status === "closed" ? "bg-slate-500/10 text-slate-400" : "bg-amber-500/10 text-amber-300"
              )}>
                {statusLabel(selectedCampaign.status)}
              </span>
            </div>
            <h1 className="font-display text-2xl font-black tracking-tight text-white">{selectedCampaign.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{selectedCampaign.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedCampaign.status === "draft" && (
            <button onClick={() => updateCampaignStatus(selectedCampaign.id, "published")} className="flex h-10 items-center rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-4 text-xs font-black text-slate-950 cursor-pointer">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Publish
            </button>
          )}
          {selectedCampaign.status !== "closed" && (
            <button onClick={() => updateCampaignStatus(selectedCampaign.id, "closed")} className="flex h-10 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-xs font-black text-white hover:bg-white/10 cursor-pointer">
              Đóng campaign
            </button>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {[
          { label: "Địa điểm", value: selectedCampaign.address, icon: MapPin, color: "text-amber-300" },
          { label: "Thời gian", value: `${selectedCampaign.startDate} - ${selectedCampaign.endDate}`, icon: Calendar, color: "text-cyan-300" },
          { label: "Deadline", value: selectedCampaign.deadline, icon: Clock, color: "text-purple-300" },
          { label: "Ứng viên", value: `${selectedCampaign.applicants.length}/${selectedCampaign.talentQuantity}`, icon: Users, color: "text-emerald-300" },
          { label: "Lượt xem", value: selectedCampaign.views.toString(), icon: Briefcase, color: "text-rose-300" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-white/5 bg-slate-950/25 p-4">
              <Icon className={cn("mb-3 h-5 w-5", item.color)} />
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">{item.label}</span>
              <span className="text-sm font-black text-white">{item.value}</span>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <aside className="rounded-2xl border border-white/5 bg-slate-950/25 p-5 xl:col-span-4">
          <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-300">MÔ TẢ CHUNG</h2>
          <div className="space-y-4 text-sm">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Ngân sách</span>
              <p className="mt-1 font-black text-amber-300">{selectedCampaign.budget}</p>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Yêu cầu</span>
              <p className="mt-1 leading-relaxed text-slate-300">{selectedCampaign.requirements}</p>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Phúc lợi</span>
              <p className="mt-1 leading-relaxed text-slate-300">{selectedCampaign.benefits}</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-500">
              ATS MVP dùng stage cơ bản: Mới, Shortlist, Phỏng vấn, Đã chọn, Đã xác nhận. Chat, email/SMS automation và payment để phase sau.
            </div>
          </div>
        </aside>

        <main className="space-y-4 xl:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-300">NHÂN SỰ CAMPAIGN</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{selectedCampaign.applicants.length} ứng viên</span>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            {(Object.keys(stageLabels) as CampaignStage[]).map((stage) => {
              const items = selectedCampaign.applicants.filter((item) => item.stage === stage);
              return (
                <div key={stage} className="min-h-52 rounded-2xl border border-white/5 bg-slate-950/25 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stageLabels[stage]}</span>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-white">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const talent = talents.find((candidate) => candidate.id === item.talentId);
                      if (!talent) return null;
                      const requestKey = `${selectedCampaign.id}-${talent.id}`;
                      return (
                        <article key={item.talentId} className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
                          <button onClick={() => router.push(`/brand/talents/${talent.id}`)} className="flex w-full items-center gap-2 text-left cursor-pointer">
                            <img src={talent.avatar} alt={talent.name} className="h-9 w-9 rounded-lg object-cover" />
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-[11px] font-black text-white">{talent.name}</h3>
                              <p className="text-[9px] text-slate-500">{talent.type} · {talent.matchScore}% match</p>
                            </div>
                          </button>
                          <p className="mt-2 line-clamp-2 text-[9px] leading-relaxed text-slate-500">{item.note}</p>
                          <div className="mt-2 flex gap-1">
                            {stage !== "confirmed" && (
                              <button onClick={() => moveApplicant(selectedCampaign.id, talent.id, nextStage(stage))} className="flex-1 rounded-lg bg-white/5 px-2 py-1 text-[8px] font-black uppercase text-slate-300 hover:bg-white/10 cursor-pointer">
                                Chuyển
                              </button>
                            )}
                            <button
                              onClick={() => sendContactRequest(selectedCampaign.id, talent.id)}
                              disabled={sentRequests[requestKey]}
                              className={cn(
                                "flex-1 rounded-lg px-2 py-1 text-[8px] font-black uppercase cursor-pointer",
                                sentRequests[requestKey] ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-400 text-slate-950"
                              )}
                            >
                              {sentRequests[requestKey] ? "Đã gửi" : "Liên hệ"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </section>
    </div>
  );
}
