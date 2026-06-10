"use client";

import React, { useState, useEffect } from "react";
import { 
  Share2, Sparkles, CheckCircle, AlertCircle, Copy, Check, Info,
  TrendingUp, Users2, DollarSign, ArrowUpRight, Trophy, Briefcase, Award, ShieldCheck, HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { campaigns as initialCampaigns, talents, Campaign } from "@/lib/brand-mvp-data";
import Link from "next/link";

type StageFilter = "all" | "new" | "accepted" | "executing" | "completed" | "confirmed";

const stageLabels: Record<StageFilter, string> = {
  all: "Tất cả trạng thái",
  new: "Chờ duyệt (F2)",
  accepted: "Đã duyệt (F2)",
  executing: "Đang làm việc (F2)",
  completed: "Nghiệm thu (F2)",
  confirmed: "Đã quyết toán (F2)",
};

const stageColors: Record<StageFilter, { text: string; bg: string; border: string; dot: string }> = {
  all: { text: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", dot: "bg-slate-400" },
  new: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400" },
  accepted: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", dot: "bg-blue-400" },
  executing: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", dot: "bg-cyan-400" },
  completed: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", dot: "bg-purple-400" },
  confirmed: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400" },
};

export default function TalentAffiliatePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: "success" | "info" }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pastedUrl, setPastedUrl] = useState("");

  // Load from localStorage & sync
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("onstagevn_campaigns");
      let loadedCampaigns: Campaign[] = [];
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Campaign[];
          if (Array.isArray(parsed)) {
            loadedCampaigns = parsed;
          }
        } catch (e) {
          console.error("Failed to parse campaigns:", e);
        }
      }
      
      // If empty or missing initial campaigns, merge
      if (loadedCampaigns.length === 0) {
        loadedCampaigns = [...initialCampaigns];
        window.localStorage.setItem("onstagevn_campaigns", JSON.stringify(loadedCampaigns));
      } else {
        // Ensure initialCampaigns are merged in case brand-mvp-data has new items
        const parsedIds = new Set(loadedCampaigns.map(c => c.id));
        const missing = initialCampaigns.filter(c => !parsedIds.has(c.id));
        if (missing.length > 0) {
          loadedCampaigns = [...loadedCampaigns, ...missing];
          window.localStorage.setItem("onstagevn_campaigns", JSON.stringify(loadedCampaigns));
        }
      }

      setCampaigns(loadedCampaigns);
    }
  }, []);

  // Filter campaigns where "tal-1" is in accepted, executing, completed, or confirmed stage
  useEffect(() => {
    const active = campaigns.filter(c => 
      c.applicants?.some(a => a.talentId === "tal-1" && ["accepted", "executing", "completed", "confirmed"].includes(a.stage))
    );
    setActiveCampaigns(active);
  }, [campaigns]);

  // Filter campaigns where "tal-1" joined via someone else's referral (F2 role)
  const [joinedViaReferral, setJoinedViaReferral] = useState<Campaign[]>([]);

  useEffect(() => {
    const joined = campaigns.filter(c => 
      c.applicants?.some(a => a.talentId === "tal-1" && a.referredByTalentId)
    );
    setJoinedViaReferral(joined);
  }, [campaigns]);

  const addToast = (msg: string, type: "success" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleCopyLink = (campaignId: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(campaignId);
    addToast("Đã copy link giới thiệu chiến dịch!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleJoinCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedUrl) return;

    try {
      let urlStr = pastedUrl.trim();
      if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
        urlStr = "https://" + urlStr;
      }
      
      const urlObj = new URL(urlStr);
      const pathname = urlObj.pathname;
      const searchParams = urlObj.searchParams;
      const refId = searchParams.get("ref") || "";

      if (!pathname.includes("/campaign/")) {
        addToast("Đường dẫn không chứa '/campaign/'. Vui lòng dán đúng link Affiliate.", "info");
        return;
      }

      const pathParts = pathname.split("/campaign/");
      const campaignPart = pathParts[pathParts.length - 1];
      
      let campaignId = campaignPart.split("-").slice(-2).join("-") === "camp-1" || 
                       campaignPart.split("-").slice(-2).join("-") === "camp-2" || 
                       campaignPart.split("-").slice(-2).join("-") === "camp-3" || 
                       campaignPart.split("-").slice(-2).join("-") === "camp-4"
                       ? campaignPart.split("-").slice(-2).join("-")
                       : campaignPart.split("-").pop() || "";

      if (campaignId === "c1") campaignId = "camp-1";
      if (campaignId === "c2") campaignId = "camp-2";
      if (campaignId === "c3") campaignId = "camp-3";
      if (campaignId === "c4") campaignId = "camp-4";

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

      const targetCamp = allCampaigns.find(c => c.id === campaignId);
      if (!targetCamp) {
        addToast("Không tìm thấy chiến dịch trong dữ liệu hệ thống.", "info");
        return;
      }

      if (targetCamp.applicants?.some(a => a.talentId === "tal-1")) {
        addToast("Bạn đã ứng tuyển hoặc đang tham gia chiến dịch này rồi.", "info");
        return;
      }

      const updatedCampaigns = allCampaigns.map(c => {
        const matchesCurrentId = c.id === campaignId;
        const matchesMockId1 = (campaignId === "camp-1" && c.id === "c1") || (campaignId === "c1" && c.id === "camp-1");
        const matchesMockId2 = (campaignId === "camp-2" && c.id === "c2") || (campaignId === "c2" && c.id === "camp-2");
        const matchesMockId3 = (campaignId === "camp-3" && c.id === "c3") || (campaignId === "c3" && c.id === "camp-3");
        const matchesMockId4 = (campaignId === "camp-4" && c.id === "c4") || (campaignId === "c4" && c.id === "camp-4");

        if (matchesCurrentId || matchesMockId1 || matchesMockId2 || matchesMockId3 || matchesMockId4) {
          const apps = c.applicants || [];
          return {
            ...c,
            applicants: [
              ...apps,
              {
                talentId: "tal-1",
                stage: "accepted" as const,
                note: "Đăng ký tham gia qua link giới thiệu Affiliate của đối tác.",
                referredByTalentId: refId || undefined
              }
            ]
          };
        }
        return c;
      });

      window.localStorage.setItem("onstagevn_campaigns", JSON.stringify(updatedCampaigns));
      setCampaigns(updatedCampaigns);
      setPastedUrl("");
      
      const referrerTalent = talents.find(t => t.id === refId);
      const referrerName = referrerTalent ? referrerTalent.name : "KOL đối tác";
      addToast(`Đăng ký tham gia thành công qua giới thiệu của ${referrerName}!`, "success");
    } catch (err) {
      try {
        let urlStr = pastedUrl.trim();
        if (urlStr.includes("campaign/")) {
          const parts = urlStr.split("campaign/");
          const rightPart = parts[parts.length - 1];
          const cleanPart = rightPart.split("?")[0];
          const queryPart = rightPart.includes("?") ? rightPart.split("?")[1] : "";
          
          let campaignId = cleanPart.split("-").slice(-2).join("-") === "camp-1" || 
                           cleanPart.split("-").slice(-2).join("-") === "camp-2" || 
                           cleanPart.split("-").slice(-2).join("-") === "camp-3" || 
                           cleanPart.split("-").slice(-2).join("-") === "camp-4"
                           ? cleanPart.split("-").slice(-2).join("-")
                           : cleanPart.split("-").pop() || "";

          if (campaignId === "c1") campaignId = "camp-1";
          if (campaignId === "c2") campaignId = "camp-2";
          if (campaignId === "c3") campaignId = "camp-3";
          if (campaignId === "c4") campaignId = "camp-4";

          const queryParams = new URLSearchParams(queryPart);
          const refId = queryParams.get("ref") || "";

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

          const targetCamp = allCampaigns.find(c => c.id === campaignId);
          if (!targetCamp) {
            addToast("Không tìm thấy chiến dịch trong dữ liệu hệ thống.", "info");
            return;
          }

          if (targetCamp.applicants?.some(a => a.talentId === "tal-1")) {
            addToast("Bạn đã ứng tuyển hoặc đang tham gia chiến dịch này rồi.", "info");
            return;
          }

          const updatedCampaigns = allCampaigns.map(c => {
            const matchesCurrentId = c.id === campaignId;
            const matchesMockId1 = (campaignId === "camp-1" && c.id === "c1") || (campaignId === "c1" && c.id === "camp-1");
            const matchesMockId2 = (campaignId === "camp-2" && c.id === "c2") || (campaignId === "c2" && c.id === "camp-2");
            const matchesMockId3 = (campaignId === "camp-3" && c.id === "c3") || (campaignId === "c3" && c.id === "camp-3");
            const matchesMockId4 = (campaignId === "camp-4" && c.id === "c4") || (campaignId === "c4" && c.id === "camp-4");

            if (matchesCurrentId || matchesMockId1 || matchesMockId2 || matchesMockId3 || matchesMockId4) {
              const apps = c.applicants || [];
              return {
                ...c,
                applicants: [
                  ...apps,
                  {
                    talentId: "tal-1",
                    stage: "accepted" as const,
                    note: "Đăng ký tham gia qua link giới thiệu Affiliate của đối tác.",
                    referredByTalentId: refId || undefined
                  }
                ]
              };
            }
            return c;
          });

          window.localStorage.setItem("onstagevn_campaigns", JSON.stringify(updatedCampaigns));
          setCampaigns(updatedCampaigns);
          setPastedUrl("");
          
          const referrerTalent = talents.find(t => t.id === refId);
          const referrerName = referrerTalent ? referrerTalent.name : "KOL đối tác";
          addToast(`Đăng ký tham gia thành công qua giới thiệu của ${referrerName}!`, "success");
          return;
        }
      } catch (e) {}
      
      addToast("Đường dẫn không hợp lệ. Vui lòng kiểm tra lại.", "info");
    }
  };

  // Helper helper to slugify campaign title
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Overall statistics calculation
  const totalCampaigns = activeCampaigns.length;
  let totalF2Referred = 0;
  let totalExpectedPayout = 0;

  activeCampaigns.forEach(c => {
    const rawBudget = c.budget || "10.000.000đ";
    const cleanBudget = parseInt(rawBudget.replace(/[^0-9]/g, ""), 10) || 10000000;
    const poolVal = cleanBudget / (c.applicants?.length || 1);
    const f2Applicants = c.applicants?.filter(a => a.referredByTalentId === "tal-1") || [];
    
    totalF2Referred += f2Applicants.length;
    // F1 receives 5% of F2's contract payout value (poolVal)
    totalExpectedPayout += f2Applicants.reduce((sum) => sum + (poolVal * 0.05), 0);
  });

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value) + "đ";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER SECTION */}
      <div className="border-b border-white/5 pb-6">
        <div className="mb-2 flex items-center gap-2">
          <Share2 className="h-5 w-5 text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-500/20">
            KOL Affiliate Hub
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
          Chiến dịch Affiliate
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 max-w-2xl font-medium">
          Dành riêng cho KOL đối tác. Sử dụng link giới thiệu để mời các KOL khác (F2) tham gia chiến dịch. Nhận ngay hoa hồng quản lý <span className="text-amber-400 font-extrabold">5%</span> trên mỗi buổi biểu diễn/job của F2 khi chiến dịch được Brand quyết toán.
        </p>
      </div>

      {/* STATS SUMMARY BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#08090f] p-6 shadow-xl flex items-center gap-4.5">
          <div className="absolute top-0 right-0 h-20 w-20 bg-amber-400/2.5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Chiến dịch khả dụng</p>
            <p className="text-2xl font-black text-white mt-1 leading-none">{totalCampaigns}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#08090f] p-6 shadow-xl flex items-center gap-4.5">
          <div className="absolute top-0 right-0 h-20 w-20 bg-cyan-400/2.5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <Users2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Số lượng F2 mời được</p>
            <p className="text-2xl font-black text-white mt-1 leading-none">{totalF2Referred} KOLs</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-amber-500/10 bg-gradient-to-br from-[#0a0d1a] to-[#08090f] p-6 shadow-xl flex items-center gap-4.5">
          <div className="absolute top-0 right-0 h-20 w-20 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-500/30 text-amber-400 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Hoa hồng dự kiến nhận (5%)</p>
            <p className="text-2xl font-black text-amber-400 mt-1 leading-none">{formatVND(totalExpectedPayout)}</p>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LIST OF ACTIVE CAMPAIGNS (LEFT COLUMN - 2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
            <Briefcase className="h-4.5 w-4.5 text-amber-400" /> Danh sách chiến dịch của bạn
          </h2>

          {activeCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-white/5 bg-[#08090f]/40 px-6">
              <Briefcase className="h-12 w-12 text-slate-700 mb-4 animate-pulse" />
              <p className="text-slate-400 font-black text-sm uppercase tracking-wider">Không có chiến dịch hoạt động</p>
              <p className="text-slate-500 text-xs mt-2 max-w-md">
                Chỉ những chiến dịch mà bạn đã nộp đơn ứng tuyển và được Brand duyệt duyệt tham gia (Trạng thái: "Đã duyệt", "Đang tham gia", "Nghiệm thu", "Thành công") mới được cấp link Affiliate.
              </p>
              <Link
                href="/talent/jobs"
                className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-950 hover:from-amber-300 hover:to-yellow-400 transition-all duration-300 shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:scale-[1.02]"
              >
                Khám phá Chợ việc làm <ArrowUpRight className="h-4 w-4 text-slate-950" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {activeCampaigns.map(c => {
                const rawBudget = c.budget || "10.000.000đ";
                const cleanBudget = parseInt(rawBudget.replace(/[^0-9]/g, ""), 10) || 10000000;
                const poolVal = cleanBudget / (c.applicants?.length || 1);
                
                const f2Applicants = c.applicants?.filter(a => a.referredByTalentId === "tal-1") || [];
                const expectedComm = f2Applicants.reduce((sum) => sum + (poolVal * 0.05), 0);

                // Generate referral URL
                const referralUrl = typeof window !== "undefined"
                  ? `${window.location.origin}/campaign/${slugify(c.title || "chien-dich")}-${c.id}?ref=tal-1&name=nguyen-mai-anh`
                  : `https://onstage.vn/campaign/${slugify(c.title || "chien-dich")}-${c.id}?ref=tal-1&name=nguyen-mai-anh`;

                return (
                  <div key={c.id} className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#08090f] p-6 hover:border-amber-500/20 transition-all duration-300 shadow-lg space-y-5">
                    
                    {/* Campaign Info Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                      <div>
                        <h3 className="text-base font-black text-white tracking-wide">{c.title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                          Thương hiệu: <span className="text-slate-300 font-extrabold">{c.id.startsWith("camp-") ? "L'Oréal Vietnam" : "Brand đối tác"}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[9px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded-lg">
                          {c.jobType}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg">
                          Cát-xê chia đều: {formatVND(poolVal)}
                        </span>
                      </div>
                    </div>

                    {/* Affiliate Link Display & Copy */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Link Affiliate giới thiệu (Campaign)
                      </label>
                      <div className="flex items-center gap-2 bg-[#03050c] border border-white/5 rounded-xl p-2.5 pl-3.5 relative group">
                        <span className="text-xs text-amber-300/90 truncate font-mono flex-1 select-all tracking-tight">
                          {referralUrl}
                        </span>
                        <button
                          onClick={() => handleCopyLink(c.id, referralUrl)}
                          className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95",
                            copiedId === c.id 
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                              : "bg-amber-400 text-slate-950 hover:bg-amber-300 border border-transparent shadow-[0_2px_10px_rgba(245,158,11,0.1)]"
                          )}
                        >
                          {copiedId === c.id ? (
                            <>
                              <Check className="h-3 w-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy Link
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-500 font-semibold italic">
                        * Mẹo: Chia sẻ link này cho các KOL/KOC trong network của bạn. Khi họ đăng ký & được duyệt, bạn nhận ngay 5% hoa hồng từ việc làm của họ.
                      </p>
                    </div>

                    {/* Referred F2 KOL List */}
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Users2 className="h-3.5 w-3.5 text-cyan-400" /> KOL F2 được bạn mời ({f2Applicants.length})
                        </h4>
                        {f2Applicants.length > 0 && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-500/10">
                            Hoa hồng từ campaign: +{formatVND(expectedComm)}
                          </span>
                        )}
                      </div>

                      {f2Applicants.length === 0 ? (
                        <div className="text-center py-6 rounded-xl border border-dashed border-white/5 bg-[#03050c]/30">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chưa có KOL nào đăng ký qua link của bạn</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {f2Applicants.map((applicant, idx) => {
                            const talentObj = talents.find(t => t.id === applicant.talentId);
                            const name = talentObj?.name || `KOL F2 #${applicant.talentId.split("-")[1] || idx}`;
                            const avatar = talentObj?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80";
                            const stageKey = applicant.stage as StageFilter;
                            const colors = stageColors[stageKey] || stageColors.new;

                            return (
                              <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#03050c]/50 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={avatar} 
                                    alt={name} 
                                    className="h-8 w-8 rounded-lg object-cover border border-white/10" 
                                  />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-black text-white">{name}</p>
                                      <span className="text-[8px] font-black uppercase text-cyan-400 px-1 py-0.2 rounded bg-cyan-400/10">
                                        KOL F2
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                                      Hoa hồng giới thiệu: <span className="text-amber-400 font-bold font-mono">+{formatVND(poolVal * 0.05)}</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={cn("text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border flex items-center gap-1.5", colors.text, colors.bg, colors.border)}>
                                    <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
                                    {stageLabels[stageKey] || applicant.stage}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* JOINED VIA REFERRAL CAMPAIGNS (F2 ROLE) */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
              <Award className="h-4.5 w-4.5 text-amber-400 animate-none" /> Chiến dịch tham gia qua giới thiệu (F2)
            </h2>

            {joinedViaReferral.length === 0 ? (
              <div className="text-center py-10 rounded-2xl border border-dashed border-white/5 bg-[#08090f]/30 px-6">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Bạn chưa tham gia chiến dịch nào qua link giới thiệu
                </p>
                <p className="text-[9px] text-slate-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Hãy nhập link Affiliate nhận được từ đồng nghiệp ở ô "Tham gia qua giới thiệu" để đăng ký tham gia chiến dịch của họ.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#08090f] shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#151b2d] bg-[#050711]/60 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="p-4">Chiến dịch</th>
                        <th className="p-4">KOL giới thiệu (F1)</th>
                        <th className="p-4 text-right">Cát-xê của bạn (70%)</th>
                        <th className="p-4 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {joinedViaReferral.map((c, idx) => {
                        const applicantInfo = c.applicants?.find(a => a.talentId === "tal-1");
                        const referrerId = applicantInfo?.referredByTalentId || "";
                        const referrerTalent = talents.find(t => t.id === referrerId);
                        const referrerName = referrerTalent ? referrerTalent.name : `KOL #${referrerId.split("-")[1] || idx}`;
                        const referrerAvatar = referrerTalent?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80";
                        
                        const rawBudget = c.budget || "10.000.000đ";
                        const cleanBudget = parseInt(rawBudget.replace(/[^0-9]/g, ""), 10) || 10000000;
                        const poolVal = cleanBudget / (c.applicants?.length || 1);
                        const yourPayout = poolVal * 0.70;

                        const stageKey = (applicantInfo?.stage || "new") as StageFilter;
                        const colors = stageColors[stageKey] || stageColors.new;
                        const statusLabelText = stageLabels[stageKey] || "Chờ duyệt";

                        return (
                          <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                            <td className="p-4">
                              <span className="block font-bold text-white hover:text-amber-300 transition-colors cursor-pointer">{c.title}</span>
                              <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{c.jobType}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <img src={referrerAvatar} alt={referrerName} className="h-6 w-6 rounded-full object-cover border border-white/10" />
                                <span className="font-semibold text-slate-350">{referrerName}</span>
                              </div>
                            </td>
                            <td className="p-4 text-right font-mono font-black text-amber-400">
                              {formatVND(yourPayout)}
                            </td>
                            <td className="p-4 text-center">
                              <span className={cn("inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded border", colors.text, colors.bg, colors.border)}>
                                <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
                                {statusLabelText}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* COMMISSION POLICY / RULES (RIGHT COLUMN - 1/3 width) */}
        <div className="space-y-6">
          
          {/* JOIN CAMPAIGN VIA REFERRAL LINK */}
          <div className="rounded-2xl border border-amber-500/10 bg-gradient-to-br from-[#0a0d1a] to-[#08090f] p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Tham gia qua giới thiệu
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              Bạn nhận được link Affiliate từ đồng nghiệp? Dán link vào đây để đăng ký trực tiếp và trở thành F2 của họ trong chiến dịch đó.
            </p>
            <form onSubmit={handleJoinCampaign} className="space-y-2.5">
              <input
                type="text"
                value={pastedUrl}
                onChange={(e) => setPastedUrl(e.target.value)}
                placeholder="Dán link chiến dịch tại đây..."
                className="w-full bg-[#03050c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500/40 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!pastedUrl.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] cursor-pointer"
              >
                Tham gia ngay <ArrowUpRight className="h-4 w-4 text-slate-950" />
              </button>
            </form>
          </div>

          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
            <Info className="h-4.5 w-4.5 text-amber-400" /> Cơ chế & Chính sách
          </h2>

          <div className="rounded-2xl border border-white/5 bg-[#08090f] p-5 space-y-6 shadow-xl">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <TrendingUp className="h-4 w-4 text-amber-400" /> Tỷ lệ phân bổ hoa hồng
              </h3>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                Khi KOL F2 (do bạn giới thiệu) hoàn thành công việc và được Brand quyết toán, tổng thù lao (ví dụ: <span className="text-slate-300 font-bold">10.000.000đ</span>) sẽ tự động phân phối như sau:
              </p>
            </div>

            {/* Visual breakdown bars */}
            <div className="space-y-3.5">
              
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-300">KOL F2 (Người thực hiện)</span>
                  <span className="text-cyan-400 font-extrabold">70% (7.000.000đ)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full w-[70%] bg-cyan-500" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-300">KOL F1 (Bạn - Người giới thiệu)</span>
                  <span className="text-amber-400 font-extrabold">5% (500.000đ)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full w-[5%] bg-amber-400" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-300">Brand quản lý (F0)</span>
                  <span className="text-emerald-400 font-extrabold">10% (1.000.000đ)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full w-[10%] bg-emerald-500" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-300">Nền tảng OnStage</span>
                  <span className="text-purple-400 font-extrabold">15% (1.500.000đ)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full w-[15%] bg-purple-500" />
                </div>
              </div>

            </div>

            {/* Important Notes */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Quy tắc & Minh bạch
              </h4>
              <ul className="text-[10px] text-slate-400 space-y-2 list-disc pl-4 font-semibold leading-relaxed">
                <li>
                  <strong className="text-slate-300">Tính độc lập:</strong> Hoa hồng F1 chỉ nhận được giới hạn trong phạm vi các job thuộc chiến dịch cụ thể mà bạn chia sẻ link.
                </li>
                <li>
                  <strong className="text-slate-300">Thanh toán tự động:</strong> Dòng tiền được tự động chi trả real-time thông qua hệ thống bảo chứng khi Brand nghiệm thu & bấm quyết toán chiến dịch.
                </li>
                <li>
                  <strong className="text-slate-300">Không phí ẩn:</strong> Mọi chi tiết phân chia dòng tiền đều được hiển thị rõ ràng trên Smart Contract của chiến dịch.
                </li>
              </ul>
            </div>

            {/* Help / Q&A Card */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 flex gap-3">
              <HelpCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-wide">Bạn cần hỗ trợ thêm?</h4>
                <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                  Liên hệ với Quản lý chiến dịch hoặc bộ phận Hỗ trợ đối tác của OnStage qua Chat để giải đáp mọi thắc mắc về kỹ thuật hay dòng tiền.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              "animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-xl border px-4 py-3 text-xs font-bold shadow-xl flex items-center gap-2",
              t.type === "success"
                ? "bg-emerald-950 border-emerald-500/30 text-emerald-300"
                : "bg-slate-900 border-slate-700 text-slate-300"
            )}
          >
            {t.type === "success" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 text-slate-450 shrink-0" />}
            {t.msg}
          </div>
        ))}
      </div>

    </div>
  );
}
