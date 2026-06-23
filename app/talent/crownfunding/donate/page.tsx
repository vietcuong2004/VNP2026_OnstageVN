"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MoreVertical,
  Plus,
  Radio,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DonationCampaign,
  DonationCampaignStatus,
  PayoutRequest,
  Supporter,
  UpdateLog,
} from "@/app/talent/crownfunding/types";
import { useCrownfundingToast } from "../_context/toast-context";
import {
  createDonationCampaign,
  createDonationPayoutRequest,
  createDonationUpdate,
  downloadDonationQrSvg,
  getDonationShareLink,
  isDonationCampaignEditable,
  loadDonationPayoutRequests,
  loadDonationSupporters,
  loadDonationUpdates,
  loadMyDonationCampaigns,
  submitDonationCampaignReview,
  updateDonationCampaign,
} from "@/lib/donation-api";
import { CampaignDialog, CampaignListPanel } from "./campaign-management";
import { QrDonate } from "./qr-donate";
import { DonationHistory } from "./donation-history";
import { ActivityLog, UpdateDialog } from "./activity-log";
import { MilestoneList, PayoutDialog } from "./payout";
import { CampaignStatsGrid } from "./ui-layout";

type CampaignId = string | number;

function statusLabel(status: DonationCampaignStatus) {
  switch (status) {
    case "draft":
      return "Bản nháp";
    case "pending_review":
      return "Chờ duyệt";
    case "active":
      return "Đang hoạt động";
    case "paused":
      return "Tạm dừng";
    case "closed":
      return "Đã kết thúc";
    case "rejected":
      return "Bị từ chối";
    default:
      return "Chưa xác định";
  }
}

function statusTone(status: DonationCampaignStatus) {
  if (status === "active") {
    return {
      badge: "border-amber-400/20 bg-amber-400/10 text-amber-300",
      dot: "bg-amber-400 animate-pulse",
    };
  }

  if (status === "pending_review") {
    return {
      badge: "border-sky-400/20 bg-sky-400/10 text-sky-300",
      dot: "bg-sky-400 animate-pulse",
    };
  }

  if (status === "rejected") {
    return {
      badge: "border-red-400/20 bg-red-400/10 text-red-300",
      dot: "bg-red-400",
    };
  }

  return {
    badge: "border-slate-500/25 bg-slate-500/10 text-slate-400",
    dot: "bg-slate-500",
  };
}

function replaceCampaign(list: DonationCampaign[], next: DonationCampaign) {
  const nextId = next.id;
  if (nextId == null) {
    return [next, ...list];
  }

  const existed = list.some((item) => item.id === nextId);
  if (!existed) {
    return [next, ...list];
  }

  return list.map((item) => (item.id === nextId ? next : item));
}

export default function DonatePage() {
  const { addToast } = useCrownfundingToast();
  const [allCampaigns, setAllCampaigns] = useState<DonationCampaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<CampaignId | null>(null);
  const [updates, setUpdates] = useState<UpdateLog[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const campaign = useMemo(
    () => allCampaigns.find((item) => item.id === activeCampaignId) ?? null,
    [activeCampaignId, allCampaigns],
  );

  const campaignTone = campaign ? statusTone(campaign.status) : null;
  const campaignImages = campaign?.coverImages?.length
    ? campaign.coverImages
    : campaign?.coverImage
      ? [campaign.coverImage]
      : [];

  const loadCampaignDetails = useCallback(async (nextCampaign: DonationCampaign | null) => {
    if (!nextCampaign?.id) {
      setUpdates([]);
      setSupporters([]);
      setPayouts([]);
      return;
    }

    try {
      const [nextUpdates, nextSupporters, nextPayouts] = await Promise.all([
        loadDonationUpdates(Number(nextCampaign.id)),
        loadDonationSupporters(Number(nextCampaign.id)),
        loadDonationPayoutRequests(Number(nextCampaign.id)),
      ]);

      setUpdates(nextUpdates);
      setSupporters(nextSupporters);
      setPayouts(nextPayouts);
    } catch (error) {
      console.warn(error);
      setUpdates([]);
      setSupporters([]);
      setPayouts([]);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      setIsLoading(true);

      try {
        const nextCampaigns = await loadMyDonationCampaigns();
        if (!active) return;

        if (nextCampaigns.length > 0) {
          const [firstCampaign] = nextCampaigns;
          setAllCampaigns(nextCampaigns);
          setActiveCampaignId(firstCampaign.id ?? null);
          await loadCampaignDetails(firstCampaign);
        } else {
          setAllCampaigns([]);
          setActiveCampaignId(null);
          setUpdates([]);
          setSupporters([]);
          setPayouts([]);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [loadCampaignDetails]);

  const handleSelectCampaign = async (id: CampaignId) => {
    const nextCampaign = allCampaigns.find((item) => item.id === id) ?? null;
    setActiveCampaignId(id);
    setCurrentImageIdx(0);
    await loadCampaignDetails(nextCampaign);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getDonationShareLink(campaign));
      addToast("Đã sao chép liên kết gây quỹ vào clipboard.", "info");
    } catch {
      addToast("Không thể sao chép liên kết lúc này.", "info");
    }
  };

  const handleDownloadQr = () => {
    if (downloadDonationQrSvg(campaign)) {
      addToast("Đã tải mã QR chiến dịch.", "success");
      return;
    }

    addToast("Chiến dịch chưa có mã QR để tải.", "info");
  };

  const handleCampaignSubmit = async (form: Partial<DonationCampaign>) => {
    setCurrentImageIdx(0);

    try {
      if (campaign?.id != null) {
        if (!isDonationCampaignEditable(campaign)) {
          addToast("Chiến dịch đang hoạt động hoặc chờ duyệt nên chưa thể chỉnh sửa từ màn này.", "info");
          return;
        }

        const updatedCampaign = await updateDonationCampaign(Number(campaign.id), {
          ...campaign,
          ...form,
        });
        const submittedCampaign = await submitDonationCampaignReview(Number(updatedCampaign.id));
        const nextCampaign = {
          ...submittedCampaign,
          coverImage: form.coverImage || campaign.coverImage,
          coverImages: form.coverImages?.length ? form.coverImages : campaign.coverImages,
        };

        setAllCampaigns((prev) => replaceCampaign(prev, nextCampaign));
        setActiveCampaignId(nextCampaign.id ?? null);
        await loadCampaignDetails(nextCampaign);
        addToast("Đã cập nhật chiến dịch và gửi lại để chờ duyệt.", "success");
      } else {
        const createdCampaign = await createDonationCampaign({
          ...form,
          startDate: new Date().toISOString().slice(0, 10),
        });
        const submittedCampaign = await submitDonationCampaignReview(Number(createdCampaign.id));
        const nextCampaign = {
          ...submittedCampaign,
          coverImage: form.coverImage || createdCampaign.coverImage,
          coverImages: form.coverImages?.length ? form.coverImages : createdCampaign.coverImages,
        };

        setAllCampaigns((prev) => replaceCampaign(prev, nextCampaign));
        setActiveCampaignId(nextCampaign.id ?? null);
        await loadCampaignDetails(nextCampaign);
        addToast("Đã tạo chiến dịch và gửi lên hệ thống để chờ duyệt.", "success");
      }

      setShowCampaignModal(false);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Không thể lưu chiến dịch lúc này.", "info");
    }
  };

  const handleUpdateSubmit = async (title: string, content: string) => {
    if (!campaign?.id) {
      addToast("Bạn cần tạo chiến dịch trước khi đăng cập nhật.", "info");
      return;
    }

    try {
      const newUpdate = await createDonationUpdate(Number(campaign.id), { title, content });
      setUpdates((prev) => [newUpdate, ...prev]);
      setShowUpdateModal(false);
      addToast("Đã đăng bài cập nhật tiến độ.", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Không thể đăng cập nhật lúc này.", "info");
    }
  };

  const handlePayoutSubmit = async (amountVal: number, reasonVal: string) => {
    if (!campaign?.id) {
      addToast("Bạn cần có chiến dịch trước khi gửi yêu cầu giải ngân.", "info");
      return;
    }

    try {
      const newPayout = await createDonationPayoutRequest(Number(campaign.id), {
        amount: amountVal,
        reason: reasonVal,
      });
      setPayouts((prev) => [newPayout, ...prev]);
      setShowPayoutModal(false);
      addToast("Đã gửi yêu cầu giải ngân. Vui lòng chờ quản trị viên duyệt.", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Không thể gửi yêu cầu giải ngân lúc này.", "info");
    }
  };

  const handleDeleteCampaign = () => {
    addToast("Backend hiện chưa hỗ trợ xóa campaign donate từ giao diện talent.", "info");
  };

  const handleEndCampaign = () => {
    addToast("Backend hiện chưa hỗ trợ kết thúc campaign donate từ giao diện talent.", "info");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/7 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-amber-400/40 bg-amber-400/10 text-amber-300">
                Cổng quyên góp
              </span>
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-yellow-400/30 bg-yellow-400/10 text-yellow-200">
                VietQR Gateway
              </span>
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                {allCampaigns.length} chiến dịch
              </span>
            </div>
            <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl uppercase leading-none">
              Chiến dịch <span className="text-gradient-gold">Gây quỹ nhân ái</span>
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-slate-400 font-medium">
              Thiết lập chiến dịch thiện nguyện để tăng điểm hồ sơ cá nhân và nhận sự đồng hành từ các nhãn hàng đối tác.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveCampaignId(null);
              setShowCampaignModal(true);
            }}
            className="shrink-0 flex items-center gap-1.5 px-6 py-3.5 bg-gradient-gold hover:shadow-[0_0_20px_rgba(240,197,107,0.35)] hover:scale-[1.02] active:scale-98 rounded-xl font-display text-[10px] font-black text-slate-950 uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg"
            style={{ color: "#02040a" }}
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Tạo chiến dịch mới
          </button>
        </div>
      </div>

      <CampaignListPanel
        campaigns={allCampaigns}
        activeCampaignId={activeCampaignId}
        onSelect={handleSelectCampaign}
        onDelete={handleDeleteCampaign}
        onEnd={handleEndCampaign}
      />

      {campaign && (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
          <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
            <Eye className="h-3 w-3" /> Chi tiết chiến dịch đang xem
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
        </div>
      )}

      {isLoading ? (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111421]/80 to-[#070913]/96 p-12 text-center flex flex-col items-center justify-center space-y-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="h-16 w-16 rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
            <Radio className="h-8 w-8 text-amber-400 animate-pulse" />
          </div>
          <div className="space-y-2 relative z-10">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Đang tải chiến dịch gây quỹ</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
              Hệ thống đang đồng bộ dữ liệu campaign donate, lịch sử quyên góp và các yêu cầu giải ngân của bạn.
            </p>
          </div>
        </div>
      ) : !campaign ? (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111421]/80 to-[#070913]/96 p-12 text-center flex flex-col items-center justify-center space-y-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="h-16 w-16 rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
            <Heart className="h-8 w-8 text-amber-400 animate-pulse" />
          </div>
          <div className="space-y-2 relative z-10">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Bạn chưa khởi tạo chiến dịch gây quỹ</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
              Để tăng điểm hồ sơ cuộc thi và thu hút sự ủng hộ từ các nhãn hàng, hãy tạo chiến dịch quyên góp nhân ái của bạn.
            </p>
          </div>
          <button
            onClick={() => setShowCampaignModal(true)}
            className="flex items-center gap-2 px-6 h-12 bg-gradient-gold rounded-xl font-display text-xs font-black text-slate-950 hover:shadow-[0_0_20px_rgba(240,197,107,0.35)] hover:scale-[1.02] active:scale-98 transition-all duration-300 cursor-pointer shadow-lg relative z-10"
            style={{ color: "#02040a" }}
          >
            <Plus className="h-4.5 w-4.5" /> Tạo chiến dịch đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <QrDonate
              campaignLink={getDonationShareLink(campaign)}
              qrCodeSvg={campaign.qrCodeSvg}
              showShareMenu={showShareMenu}
              setShowShareMenu={setShowShareMenu}
              onCopyLink={handleCopyLink}
              onDownloadQr={handleDownloadQr}
              onShareFacebook={() => {
                addToast("Đã chia sẻ lên Facebook!", "success");
                setShowShareMenu(false);
              }}
              onShareInstagram={() => {
                addToast("Đã chia sẻ lên Instagram!", "success");
                setShowShareMenu(false);
              }}
              onShareZalo={() => {
                addToast("Đã tạo liên kết chia sẻ Zalo!", "success");
                setShowShareMenu(false);
              }}
            />

            <div className="lg:col-span-8 group relative overflow-hidden rounded-3xl border border-white/7 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_40%),linear-gradient(135deg,rgba(15,23,42,0.85),rgba(2,6,23,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] space-y-6 backdrop-blur-xl transition-all duration-300 hover:border-white/12 animate-in fade-in slide-in-from-right duration-500">
              <div className="absolute top-0 left-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

              <div className="absolute top-6 right-6 z-10">
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#08090f]/90 text-slate-300 hover:text-white hover:bg-slate-900 hover:border-white/20 transition-all cursor-pointer shadow-md"
                >
                  <MoreVertical className="h-4.5 w-4.5" />
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#08090f]/95 p-1.5 shadow-2xl backdrop-blur-md z-20 animate-in fade-in slide-in-from-top-2 duration-200 text-xs font-semibold text-slate-300">
                      <button
                        onClick={() => {
                          setShowCampaignModal(true);
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white text-left transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> Chỉnh sửa
                      </button>
                      <button
                        onClick={() => {
                          handleCopyLink();
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white text-left transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" /> Sao chép liên kết
                      </button>
                      <button
                        onClick={() => {
                          handleDownloadQr();
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white text-left transition-colors"
                      >
                        <ChevronRight className="h-3.5 w-3.5" /> Tải QR
                      </button>
                      <button
                        onClick={() => {
                          handleEndCampaign();
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-[#F0C56B] hover:text-amber-300 text-left transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5 text-amber-500" /> Kết thúc chiến dịch
                      </button>
                      <hr className="border-white/5 my-1" />
                      <button
                        onClick={() => {
                          handleDeleteCampaign();
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 text-left transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" /> Xóa chiến dịch
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider", campaignTone?.badge)}>
                    <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", campaignTone?.dot)} />
                    {statusLabel(campaign.status)}
                  </span>
                  {campaign.approvedAt && (
                    <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                      Đã duyệt
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="font-display text-2xl font-black text-white leading-tight uppercase">{campaign.title}</h2>
                  <p className="mt-3 max-w-3xl text-xs leading-relaxed text-slate-400 font-medium">
                    {campaign.description}
                  </p>
                </div>
              </div>

              {campaignImages.length > 0 && (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-slate-950">
                    <div className="aspect-[16/8] w-full">
                      <img
                        src={campaignImages[currentImageIdx] || campaignImages[0]}
                        alt={campaign.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {campaignImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIdx((prev) => (prev === 0 ? campaignImages.length - 1 : prev - 1))}
                          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white hover:bg-black/65 transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIdx((prev) => (prev === campaignImages.length - 1 ? 0 : prev + 1))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white hover:bg-black/65 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {campaignImages.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {campaignImages.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          onClick={() => setCurrentImageIdx(index)}
                          className={cn(
                            "relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl border transition-all",
                            currentImageIdx === index ? "border-amber-400/60 shadow-[0_0_18px_rgba(245,158,11,0.2)]" : "border-white/10 opacity-70 hover:opacity-100",
                          )}
                        >
                          <img src={image} alt={`${campaign.title}-${index + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <CampaignStatsGrid
            raised={campaign.raised}
            goal={campaign.goal}
            supportersCount={campaign.supportersCount}
            disbursed={campaign.disbursed}
          />

          <DonationHistory supporters={supporters} />
          <ActivityLog updates={updates} onAddUpdate={() => setShowUpdateModal(true)} />
          <MilestoneList
            raised={campaign.raised}
            disbursed={campaign.disbursed}
            payouts={payouts}
            onRequestPayout={() => setShowPayoutModal(true)}
          />
        </div>
      )}

      <CampaignDialog
        key={`${campaign?.id ?? "new"}-${showCampaignModal ? "open" : "closed"}`}
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onSubmit={handleCampaignSubmit}
        campaign={campaign}
      />
      <UpdateDialog
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateSubmit}
      />
      <PayoutDialog
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onSubmit={handlePayoutSubmit}
        maxAmount={Math.max((campaign?.raised || 0) - (campaign?.disbursed || 0), 0)}
      />
    </div>
  );
}
