"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { 
  CheckCircle, Calendar, MapPin, DollarSign, AlertCircle, 
  Sparkles, Award, ArrowLeft, Send, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { campaigns as initialCampaigns, talents, Campaign } from "@/lib/brand-mvp-data";
import { loadBrandCampaign } from "@/lib/brand-api";
import { getAuthToken } from "@/lib/api-client";
import { applyTalentCampaign, resolveCampaignReferralLink } from "@/lib/talent-api";

function formatVND(value?: number | string | null) {
  const amount = Number(value || 0);
  return amount > 0 ? `${new Intl.NumberFormat("vi-VN").format(amount)}đ` : "Thỏa thuận";
}

function mapReferralCampaign(raw: any): Campaign | null {
  if (!raw?.id) return null;

  return {
    id: String(raw.id),
    title: raw.title || "Chiến dịch",
    jobType: raw.job_type || "Campaign",
    budget: raw.budget_min || raw.budget_max ? `${formatVND(raw.budget_min)} - ${formatVND(raw.budget_max)}` : "Thỏa thuận",
    budgetValue: Number(raw.budget_max || raw.budget_min || 0),
    city: raw.city || raw.location || "Linh hoạt",
    address: raw.location || raw.city || "Linh hoạt",
    startDate: raw.start_date || "",
    endDate: raw.end_date || "",
    deadline: raw.end_date || raw.start_date || "Theo lịch Brand",
    talentQuantity: Number(raw.max_talents || raw.talent_quantity || 1),
    benefits: raw.benefits || "Thù lao và quyền lợi theo brief của Brand.",
    description: raw.description || "Brand sẽ cập nhật mô tả chi tiết.",
    requirements: raw.requirements || "Brand sẽ cập nhật yêu cầu chi tiết.",
    status: raw.status || "published",
    shortlistedTalentIds: [],
    applicants: [],
    contactRequests: 0,
    views: 0,
    sponsorships: [],
    escrowed: true,
  };
}

export default function CampaignReferralPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const refId = searchParams.get("ref") || "";
  const refNameSlug = searchParams.get("name") || "";

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [referrerName, setReferrerName] = useState("");
  const [selectedTalentId, setSelectedTalentId] = useState("tal-2");
  const [note, setNote] = useState("Tôi rất quan tâm và mong muốn thực hiện chiến dịch này qua giới thiệu.");
  const [isApplied, setIsApplied] = useState(false);
  const [error, setError] = useState("");
  const [resolvedReferralCode, setResolvedReferralCode] = useState("");

  // Parse campaign ID from slug (e.g. "beauty-mega-live-camp-1" -> "camp-1")
  const paramId = params.id || "";
  let campaignId = paramId.split("-").slice(-2).join("-") === "camp-1" || 
                     paramId.split("-").slice(-2).join("-") === "camp-2" || 
                     paramId.split("-").slice(-2).join("-") === "camp-3" || 
                     paramId.split("-").slice(-2).join("-") === "camp-4"
                     ? paramId.split("-").slice(-2).join("-")
                     : paramId.split("-").pop() || "";

  // Map talent page mock IDs to brand database campaign IDs
  if (campaignId === "c1") campaignId = "camp-1";
  if (campaignId === "c2") campaignId = "camp-2";
  if (campaignId === "c3") campaignId = "camp-3";
  if (campaignId === "c4") campaignId = "camp-4";

  useEffect(() => {
    if (refId) {
      resolveCampaignReferralLink(refId).then((resolved) => {
        if (resolved?.type === "campaign") {
          setResolvedReferralCode(resolved.code || refId);
          const resolvedCampaign = mapReferralCampaign(resolved.campaign);
          if (resolvedCampaign) setCampaign(resolvedCampaign);
          setReferrerName(resolved?.referrer?.name || resolved?.owner?.name || "KOL đối tác");
        }
      }).catch((error) => {
        console.warn("Cannot resolve campaign referral link", error);
      });
    }

    // 1. Get campaign details
    let currentCampaign: Campaign | undefined;
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("onstagevn_campaigns");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Campaign[];
          currentCampaign = parsed.find(c => c.id === campaignId || c.id === paramId);
        } catch (e) {
          console.error("Failed to parse campaigns from localStorage:", e);
        }
      }
    }

    if (!currentCampaign) {
      currentCampaign = initialCampaigns.find(c => c.id === campaignId || c.id === paramId);
    }

    if (currentCampaign) {
      setCampaign(currentCampaign);
    } else {
      // Fetch from API for backend campaigns
      loadBrandCampaign(campaignId).then((loaded) => {
        if (loaded) {
          setCampaign(loaded);
          // Save back to localStorage
          if (typeof window !== "undefined") {
            const stored = window.localStorage.getItem("onstagevn_campaigns");
            let all: Campaign[] = [];
            if (stored) {
              try {
                all = JSON.parse(stored) as Campaign[];
              } catch (e) {
                all = [];
              }
            }
            if (!all.some(c => c.id === loaded.id)) {
              all.push(loaded);
              window.localStorage.setItem("onstagevn_campaigns", JSON.stringify(all));
            }
          }
        }
      });
    }

    // 2. Format referrer name
    const referrerTalent = talents.find(t => t.id === refId);
    if (referrerTalent) {
      setReferrerName(referrerTalent.name);
    } else if (refNameSlug) {
      const formatted = refNameSlug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setReferrerName(formatted);
    } else {
      setReferrerName("Một KOL uy tín");
    }
  }, [campaignId, paramId, refId, refNameSlug]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    if (refId && /^\d+$/.test(String(campaign.id))) {
      if (!getAuthToken()) {
        router.push(`/auth/login?redirect=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`);
        return;
      }

      try {
        await applyTalentCampaign(campaign.id, note, resolvedReferralCode || refId);
        setIsApplied(true);
        setError("");
        return;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Không thể ứng tuyển qua link giới thiệu.");
        return;
      }
    }

    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("onstagevn_campaigns");
      let allCampaigns: Campaign[] = [];
      if (stored) {
        try {
          allCampaigns = JSON.parse(stored) as Campaign[];
        } catch (err) {
          allCampaigns = [...initialCampaigns];
        }
      } else {
        allCampaigns = [...initialCampaigns];
      }

      // Check if already applied
      const currentCamp = allCampaigns.find(c => c.id === campaign.id);
      if (currentCamp) {
        if (currentCamp.applicants.some(a => a.talentId === selectedTalentId)) {
          setError("Tài khoản KOL này đã ứng tuyển chiến dịch này rồi.");
          return;
        }

        const updatedCampaigns = allCampaigns.map(c => {
          const matchesCurrentId = c.id === campaign.id;
          const matchesMockId1 = (campaign.id === "camp-1" && c.id === "c1") || (campaign.id === "c1" && c.id === "camp-1");
          const matchesMockId2 = (campaign.id === "camp-2" && c.id === "c2") || (campaign.id === "c2" && c.id === "camp-2");
          const matchesMockId3 = (campaign.id === "camp-3" && c.id === "c3") || (campaign.id === "c3" && c.id === "camp-3");
          const matchesMockId4 = (campaign.id === "camp-4" && c.id === "c4") || (campaign.id === "c4" && c.id === "camp-4");

          if (matchesCurrentId || matchesMockId1 || matchesMockId2 || matchesMockId3 || matchesMockId4) {
            if (c.applicants.some((a: any) => a.talentId === selectedTalentId)) {
              return c;
            }
            return {
              ...c,
              applicants: [
                ...c.applicants,
                {
                  talentId: selectedTalentId,
                  stage: "new" as const,
                  note: note,
                  referredByTalentId: refId || undefined
                }
              ]
            };
          }
          return c;
        });

        window.localStorage.setItem("onstagevn_campaigns", JSON.stringify(updatedCampaigns));
        setIsApplied(true);
        setError("");
      }
    }
  };

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020408] text-slate-100 p-6">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Không tìm thấy chiến dịch</h2>
          <p className="text-slate-400 font-medium">Đường liên kết có thể đã hết hạn hoặc không đúng. Vui lòng kiểm tra lại.</p>
          <button 
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-xs font-black uppercase transition-all"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Get selected talent's name for success view
  const applicantName = talents.find(t => t.id === selectedTalentId)?.name || "KOL";

  return (
    <div className="min-h-screen bg-[#020408] text-slate-100 py-10 px-4 md:px-8 relative overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] right-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[160px] pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Personalized Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center shadow-2xl">
          <div className="absolute top-0 right-0 h-32 w-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-500/30 text-amber-400 shrink-0">
            <Sparkles className="h-8 w-8 animate-pulse" />
          </div>
          <div className="text-center md:text-left space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1 text-[10px] font-black uppercase text-amber-400">
              <Award className="h-3 w-3" /> Campaign Referral Link
            </span>
            <h2 className="text-lg md:text-xl font-black text-white">
              <span className="text-amber-400">{referrerName}</span> mời bạn tham gia chiến dịch!
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Khi tham gia qua link giới thiệu, bạn sẽ nhận được thù lao lên tới <b>70%</b> giá trị job sau khi hoàn thành. F1 giới thiệu nhận 5% và Brand Manager (F0) nhận 10% quản lý.
            </p>
          </div>
        </div>

        {isApplied ? (
          /* Success Screen */
          <div className="glass-panel border-emerald-500/30 bg-emerald-500/5 rounded-3xl p-8 text-center space-y-6 shadow-[0_20px_50px_rgba(16,185,129,0.1)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mx-auto">
              <CheckCircle className="h-10 w-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-wider">Ứng Tuyển Thành Công!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Hồ sơ của <b>{applicantName}</b> đã được lưu vào danh sách ứng viên chiến dịch <b>{campaign.title}</b>.
              </p>
            </div>
            <div className="bg-[#050711] border border-white/5 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Chiến dịch:</span>
                <span className="text-white font-bold">{campaign.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Người giới thiệu (F1):</span>
                <span className="text-cyan-400 font-bold">{referrerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hạn duyệt:</span>
                <span className="text-amber-400 font-bold">{campaign.deadline}</span>
              </div>
              <div className="border-t border-white/5 pt-2 text-[10px] text-emerald-400/80 italic text-center">
                * Brand Manager (F0) sẽ nhận được thông báo giới thiệu của bạn trong danh sách ứng tuyển.
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => router.push("/talent/jobs")}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                Xem danh sách Job đã nộp
              </button>
            </div>
          </div>
        ) : (
          /* Main Campaign Content & Apply Form */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Campaign Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="glass-panel border-white/5 bg-slate-900/10 rounded-3xl p-6 space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">{campaign.title}</h1>
                  <p className="text-xs text-amber-400 mt-1">Phân khúc: {campaign.jobType}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                    <div>
                      <span className="block text-slate-500 text-[9px] uppercase tracking-wider">Cát-xê dự án</span>
                      <span className="font-bold text-white text-xs font-mono">{campaign.budget}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                    <div>
                      <span className="block text-slate-500 text-[9px] uppercase tracking-wider">Địa điểm</span>
                      <span className="font-bold text-white text-xs">{campaign.city}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                    <div>
                      <span className="block text-slate-500 text-[9px] uppercase tracking-wider">Thời gian</span>
                      <span className="font-bold text-white text-xs">{campaign.startDate} ~ {campaign.endDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="block text-slate-500 text-[9px] uppercase tracking-wider">Bảo chứng</span>
                      <span className="font-extrabold text-emerald-400 text-xs uppercase tracking-wider">Escrowed</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6 space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider font-bold">Mô tả công việc</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">{campaign.description}</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider font-bold">Yêu cầu ứng viên</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">{campaign.requirements}</p>
                  </div>

                  {campaign.sponsorships && campaign.sponsorships.length > 0 && (
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2 font-bold">Quyền lợi tài trợ kèm theo</h3>
                      <div className="space-y-1.5">
                        {campaign.sponsorships.map((spons, index) => (
                          <div key={index} className="flex gap-2 text-xs items-start bg-white/2 border border-white/5 rounded-xl p-2.5">
                            <span className="text-amber-400">🎁</span>
                            <div>
                              <span className="font-bold text-slate-200 block text-[11px]">{spons.category}</span>
                              <span className="text-slate-400 text-[10.5px] leading-relaxed mt-0.5 block">{spons.details}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Apply Form Panel */}
            <div className="space-y-6">
              <form onSubmit={handleApply} className="glass-panel border-amber-500/20 bg-slate-900/10 rounded-3xl p-6 space-y-5 sticky top-6">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-bold">Ứng Tuyển Chiến Dịch</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Mô phỏng tài khoản KOL F2 ứng tuyển</p>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex gap-2 text-rose-400 text-[10.5px]">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Chọn KOL ứng tuyển (Mô phỏng F2)
                  </label>
                  <select
                    value={selectedTalentId}
                    onChange={(e) => setSelectedTalentId(e.target.value)}
                    className="w-full bg-[#050711] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {talents
                      .filter(t => t.id !== refId) // cannot refer self
                      .map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.type})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Lời nhắn gửi Brand (F0)
                  </label>
                  <textarea
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-[#050711] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                <div className="bg-amber-400/5 border border-amber-400/10 rounded-xl p-3.5 space-y-1.5">
                  <span className="block text-[8px] font-bold text-amber-400 uppercase tracking-wider">Tóm tắt dòng tiền MLM</span>
                  <div className="space-y-1 text-[10px] text-slate-400 font-medium">
                    <div className="flex justify-between">
                      <span>KOL F2 (Bạn):</span>
                      <span className="text-white font-bold">70% Cát-xê</span>
                    </div>
                    <div className="flex justify-between">
                      <span>KOL F1 (Giới thiệu):</span>
                      <span className="text-cyan-400 font-bold">5% Cát-xê</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Brand F0 (Quản lý):</span>
                      <span className="text-amber-400 font-bold">10% Cát-xê</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-105 active:scale-[0.98] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" /> Gửi hồ sơ ứng tuyển
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
