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

type ReferralCampaignPayload = {
  id?: number | string;
  title?: string | null;
  job_type?: string | null;
  budget_min?: number | string | null;
  budget_max?: number | string | null;
  city?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  application_deadline?: string | null;
  event_date?: string | null;
  max_talents?: number | string | null;
  talent_quantity?: number | string | null;
  benefits?: string | null;
  description?: string | null;
  requirements?: string | null;
  status?: Campaign["status"] | string | null;
};

function formatVND(value?: number | string | null) {
  const amount = Number(value || 0);
  return amount > 0 ? `${new Intl.NumberFormat("vi-VN").format(amount)}đ` : "Thỏa thuận";
}

function formatCampaignDate(value?: string | null) {
  if (!value) return "-";

  const raw = String(value);
  const normalized = raw.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})?$/, ".$1$2");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
    return raw;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function mapReferralCampaign(raw?: ReferralCampaignPayload | null): Campaign | null {
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
    applicationDeadline: raw.application_deadline || "",
    eventDate: raw.event_date || "",
    deadline: raw.application_deadline || raw.end_date || raw.start_date || "Theo lịch Brand",
    talentQuantity: Number(raw.max_talents || raw.talent_quantity || 1),
    benefits: raw.benefits || "Thù lao và quyền lợi theo brief của Brand.",
    description: raw.description || "Brand sẽ cập nhật mô tả chi tiết.",
    requirements: raw.requirements || "Brand sẽ cập nhật yêu cầu chi tiết.",
    status: raw.status === "draft" || raw.status === "closed" ? raw.status : "published",
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
  const donateSuccess = searchParams.get("donate_success") === "1";
  const donationCampaignTitle = (searchParams.get("title") || "").trim();
  const donationAmount = Math.max(1000, Number(searchParams.get("mock_amount") || 100000) || 100000);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [resolvedReferrerName, setResolvedReferrerName] = useState("");
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
          setResolvedReferrerName(resolved?.referrer?.name || resolved?.owner?.name || "KOL đối tác");
        }
      }).catch((error) => {
        console.warn("Cannot resolve campaign referral link", error);
      });
    }

    loadBrandCampaign(campaignId, initialCampaigns).then((loaded) => {
      if (loaded) setCampaign(loaded);
    });

  }, [campaignId, paramId, refId, refNameSlug]);

  const referrerTalent = talents.find(t => t.id === refId);
  const fallbackReferrerName = refNameSlug
    ? refNameSlug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Một KOL uy tín";
  const referrerName = resolvedReferrerName || referrerTalent?.name || fallbackReferrerName;

  const renderDonateSuccessScreen = (campaignTitle: string) => (
    <div className="min-h-screen bg-[#020408] text-slate-100 py-10 px-4 md:px-8 relative overflow-x-hidden">
      <div className="absolute top-[-10%] right-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[160px] pointer-events-none" />

      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/5 p-8 md:p-10 text-center space-y-6 shadow-[0_24px_60px_rgba(16,185,129,0.12)]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 mx-auto">
            <CheckCircle className="h-10 w-10" />
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 border border-emerald-400/20 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Donate Thành Công
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Bạn đã donate thành công
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Cảm ơn bạn đã ủng hộ <span className="font-black text-white">{campaignTitle}</span>.
              Khoản đóng góp <span className="font-black text-emerald-300">{formatVND(donationAmount)}</span> đã được ghi nhận vào chiến dịch.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Chiến dịch</span>
              <span className="mt-2 block text-lg font-black text-white">{campaignTitle}</span>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Số tiền ghi nhận</span>
              <span className="mt-2 block text-lg font-black text-emerald-300">{formatVND(donationAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    if (/^\d+$/.test(String(campaign.id))) {
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

    if (campaign.applicants.some(a => a.talentId === selectedTalentId)) {
      setError("Tài khoản KOL này đã ứng tuyển chiến dịch này rồi.");
      return;
    }

    setCampaign({
      ...campaign,
      applicants: [
        ...campaign.applicants,
        {
          talentId: selectedTalentId,
          stage: "new" as const,
          note,
          referredByTalentId: refId || undefined
        }
      ]
    });
    setIsApplied(true);
    setError("");
  };
  if (!campaign && donateSuccess) {
    return renderDonateSuccessScreen(donationCampaignTitle || "chiến dịch này");
  }

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

  if (donateSuccess) {
    return renderDonateSuccessScreen(donationCampaignTitle || campaign.title);
  }

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
                <span className="text-amber-400 font-bold">{formatCampaignDate(campaign.applicationDeadline || campaign.deadline)}</span>
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
                      <span className="block text-slate-500 text-[9px] uppercase tracking-wider">Sự kiện chính</span>
                      <span className="font-bold text-white text-xs">
                        {campaign.eventDate ? formatCampaignDate(campaign.eventDate) : formatCampaignDate(campaign.startDate)}
                      </span>
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
                  <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Mốc thời gian</h3>
                    <div className="grid grid-cols-1 gap-3 text-[10px] text-slate-400 sm:grid-cols-2">
                      <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-3">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Bắt đầu campaign</span>
                        <span className="mt-1 block text-xs font-black text-cyan-200">{formatCampaignDate(campaign.startDate)}</span>
                      </div>
                      <div className="rounded-xl border border-sky-400/15 bg-sky-400/5 p-3">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Kết thúc campaign</span>
                        <span className="mt-1 block text-xs font-black text-sky-200">{formatCampaignDate(campaign.endDate)}</span>
                      </div>
                      <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-3">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Sự kiện chính</span>
                        <span className="mt-1 block text-xs font-black text-emerald-200">
                          {campaign.eventDate ? formatCampaignDate(campaign.eventDate) : formatCampaignDate(campaign.startDate)}
                        </span>
                      </div>
                      <div className="rounded-xl border border-purple-400/15 bg-purple-400/5 p-3">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Hạn ứng tuyển</span>
                        <span className="mt-1 block text-xs font-black text-purple-200">
                          {formatCampaignDate(campaign.applicationDeadline || campaign.deadline)}
                        </span>
                      </div>
                    </div>
                  </div>
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
