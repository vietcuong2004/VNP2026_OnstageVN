"use client";

import React, { useState } from "react";
import {
  Crown,
  Heart,
  Plus,
  Copy,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DonationCampaign, UpdateLog, Supporter, PayoutRequest } from "@/app/talent/crownfunding/types";
import { useCrownfundingToast } from "../_context/toast-context";

// Import split sub-components
import { CampaignDialog, CampaignListPanel } from "./campaign-management";
import { QrDonate } from "./qr-donate";
import { DonationHistory } from "./donation-history";
import { ActivityLog, UpdateDialog } from "./activity-log";
import { MilestoneList, PayoutDialog } from "./payout";
import { CampaignStatsGrid } from "./ui-layout";

// ==========================================
// Mock initial data
// ==========================================
const initialCampaigns: DonationCampaign[] = [
  {
    id: "camp-1",
    title: "Xây dựng 5 tủ sách cộng đồng cho trẻ em vùng cao Hà Giang",
    description: "Chiến dịch gây quỹ mua hơn 2,000 đầu sách giáo khoa, truyện tranh và dụng cụ học tập lắp đặt cho học sinh Trường Tiểu học Đồng Văn, tỉnh Hà Giang, kết hợp làm dự án Nhân Ái đi thi.",
    details: "Dự án tập trung vào việc quyên góp sách và xây dựng không gian đọc sách thân thiện tại 5 lớp học thuộc trường Tiểu học Đồng Văn. Toàn bộ kinh phí sẽ được công khai minh bạch qua cổng chuyển khoản BaoKim và nghiệm thu bằng chứng từ thực tế.",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&h=400&q=80",
    coverImages: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&h=400&q=80",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&h=400&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&h=400&q=80"
    ],
    goal: 100000000,
    raised: 72000000,
    supportersCount: 185,
    disbursed: 40000000,
    startDate: "2026-06-01",
    endDate: "2026-09-30",
    status: "active"
  },
  {
    id: "camp-2",
    title: "Mổ mắt nhân đạo cho 50 bệnh nhân nghèo tỉnh Hòa Bình",
    description: "Hỗ trợ chi phí phẫu thuật mắt miễn phí cho bệnh nhân nghèo có hoàn cảnh khó khăn tại vùng núi phía Bắc.",
    details: "",
    coverImage: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&h=400&q=80",
    coverImages: ["https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&h=400&q=80"],
    goal: 150000000,
    raised: 150000000,
    supportersCount: 312,
    disbursed: 150000000,
    startDate: "2025-10-01",
    endDate: "2026-01-31",
    status: "completed"
  }
];

const initialUpdates: UpdateLog[] = [
  {
    id: "up-1",
    title: "Khảo sát thực tế & chốt vị trí thư viện",
    content: "Đoàn tình nguyện đã đến làm việc trực tiếp với Ban giám hiệu trường Tiểu học Đồng Văn. Đã khảo sát và thống nhất lựa chọn 5 góc phòng học có ánh sáng tốt nhất để chuẩn bị đóng kệ gỗ lắp tủ sách trong tháng tới.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&h=400&q=80",
    date: "2026-06-15"
  },
  {
    id: "up-2",
    title: "Đặt mua hơn 1,000 cuốn sách đầu tiên",
    content: "Đã ký biên bản đặt mua sách truyện, sách giáo khoa từ NXB Kim Đồng và NXB Trẻ với mức chiết khấu hỗ trợ 30%. Sách dự kiến đóng gói chuyển về Hà Nội trước ngày 30/6.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&h=400&q=80",
    date: "2026-06-20"
  }
];

const initialSupporters: Supporter[] = [
  { name: "Nguyễn Văn A", amount: 2000000, message: "Chúc dự án của bạn thành công tốt đẹp!", isAnonymous: false, date: "09:15 - 23/06/2026" },
  { name: "Glow Beauty Cosmetics", amount: 10000000, message: "Chúc chiến dịch nhân ái của Mai Anh đạt được nhiều thành công rực rỡ! Mong các bé sẽ có thêm nhiều niềm vui.", isAnonymous: false, isBrand: true, date: "14:30 - 22/06/2026" },
  { name: "Ẩn danh", amount: 500000, message: "Một dự án rất ý nghĩa, chúc em vững bước trên hành trình đi thi.", isAnonymous: true, date: "20:11 - 22/06/2026" },
  { name: "CEO Minh Hằng", amount: 5000000, message: "Rất tự hào khi thấy thế hệ trẻ có tấm lòng nhân ái. Ủng hộ em!", isAnonymous: false, date: "18:05 - 21/06/2026" }
];

const initialPayouts: PayoutRequest[] = [
  { id: "pay-1", amount: 20000000, reason: "Thanh toán đợt 1 đặt cọc mua sách truyện từ Nhà xuất bản", filesCount: 2, status: "approved", date: "2026-06-10" },
  { id: "pay-2", amount: 20000000, reason: "Thanh toán tiền đặt đóng kệ gỗ tủ sách tại xưởng địa phương Hà Giang", filesCount: 1, status: "approved", date: "2026-06-14" },
  { id: "pay-3", amount: 15000000, reason: "Ứng trước chi phí vận chuyển bưu điện & đoàn tình nguyện di chuyển lên Hà Giang đợt 1", filesCount: 3, status: "pending", date: "2026-06-23" }
];

export default function DonatePage() {
  const { addToast } = useCrownfundingToast();

  // Campaign list state
  const [allCampaigns, setAllCampaigns] = useState<DonationCampaign[]>(initialCampaigns);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>("camp-1");

  // Derived: active campaign object
  const campaign = allCampaigns.find(c => c.id === activeCampaignId) ?? null;

  const [updates, setUpdates] = useState<UpdateLog[]>(initialUpdates);
  const [supporters, setSupporters] = useState<Supporter[]>(initialSupporters);
  const [payouts, setPayouts] = useState<PayoutRequest[]>(initialPayouts);

  // Modals state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Dropdown States
  const [showDropdown, setShowDropdown] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Slider State
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `https://onstage.vn/brand/crownfunding?campaign_id=${campaign?.title ? "hagiang_library" : "new"}`
    );
    addToast("Đã sao chép liên kết gây quỹ đến Clipboard!", "info");
  };

  const handleCampaignSubmit = (form: Partial<DonationCampaign>) => {
    setCurrentImageIdx(0);
    if (campaign) {
      // Edit mode
      setAllCampaigns(prev => prev.map(c =>
        c.id === campaign.id
          ? {
            ...c,
            title: form.title || c.title,
            description: form.description || c.description,
            details: form.details || c.details,
            coverImage: form.coverImage || c.coverImage,
            coverImages: form.coverImages || c.coverImages,
            goal: form.goal || c.goal,
            endDate: form.endDate || c.endDate
          }
          : c
      ));
      addToast("Đã cập nhật thông tin chiến dịch thành công!", "success");
    } else {
      // Create mode
      const newId = "camp-" + Date.now();
      const newCampaign: DonationCampaign = {
        id: newId,
        title: form.title || "",
        description: form.description || "",
        details: form.details || "",
        coverImage: form.coverImage || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&h=400&q=80",
        coverImages: form.coverImages || [],
        goal: form.goal || 100000000,
        raised: 0,
        supportersCount: 0,
        disbursed: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: form.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "active"
      };
      setAllCampaigns(prev => [newCampaign, ...prev]);
      setActiveCampaignId(newId);
      setUpdates([]);
      setSupporters([]);
      setPayouts([]);
      addToast("Khởi tạo chiến dịch Quỹ Vương Miện thành công!", "success");
    }
    setShowCampaignModal(false);
  };

  const handleUpdateSubmit = (title: string, content: string, image: string) => {
    const newUpdate: UpdateLog = {
      id: "up-" + Date.now(),
      title,
      content,
      image: image || undefined,
      date: new Date().toISOString().split("T")[0]
    };
    setUpdates((prev) => [newUpdate, ...prev]);
    setShowUpdateModal(false);
    addToast("Đã đăng bài viết nhật ký tiến độ dự án!", "success");
  };

  const handlePayoutSubmit = (amountVal: number, reasonVal: string, fileAttached: boolean) => {
    const newPayout: PayoutRequest = {
      id: "pay-" + Date.now(),
      amount: amountVal,
      reason: reasonVal,
      filesCount: fileAttached ? 1 : 0,
      status: "pending",
      date: new Date().toISOString().split("T")[0]
    };
    setPayouts((prev) => [newPayout, ...prev]);
    setShowPayoutModal(false);
    addToast("Đã gửi yêu cầu giải ngân. Vui lòng chờ Ban quản trị duyệt!", "success");
  };

  const handleDeleteCampaign = (id?: string) => {
    const targetId = id ?? activeCampaignId;
    if (!targetId) return;
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa chiến dịch này không? Dữ liệu thống kê và lịch sử giải ngân sẽ bị mất."
      )
    ) {
      setAllCampaigns(prev => prev.filter(c => c.id !== targetId));
      if (activeCampaignId === targetId) {
        const remaining = allCampaigns.filter(c => c.id !== targetId);
        setActiveCampaignId(remaining.length > 0 ? remaining[0].id : null);
        setUpdates([]);
        setSupporters([]);
        setPayouts([]);
      }
      addToast("Đã xóa chiến dịch quyên góp.", "info");
    }
  };

  const handleEndCampaign = (id?: string) => {
    const targetId = id ?? activeCampaignId;
    if (!targetId) return;
    setAllCampaigns(prev => prev.map(c =>
      c.id === targetId ? { ...c, status: "completed" } : c
    ));
    addToast("Đã kết thúc chiến dịch gây quỹ thành công!", "success");
  };

  const handleSelectCampaign = (id: string) => {
    setActiveCampaignId(id);
    setUpdates(id === "camp-1" ? initialUpdates : []);
    setSupporters(id === "camp-1" ? initialSupporters : []);
    setPayouts(id === "camp-1" ? initialPayouts : []);
    setCurrentImageIdx(0);
    addToast("Đã chuyển sang xem chiến dịch được chọn.", "info");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      {/* Header Banner - identical dashboard look */}
      <div className="relative overflow-hidden rounded-3xl border border-white/7 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-amber-400/40 bg-amber-400/10 text-amber-300">
                Cổng Quyên Góp
              </span>
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-yellow-400/30 bg-yellow-400/10 text-yellow-200">
                VietQR Gateway
              </span>
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                {allCampaigns.length} Chiến dịch
              </span>
            </div>
            <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl uppercase leading-none">
              Chiến Dịch <span className="text-gradient-gold">Gây Quỹ Nhân Ái</span>
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

      {/* Campaign List Management Panel */}
      <CampaignListPanel
        campaigns={allCampaigns}
        activeCampaignId={activeCampaignId}
        onSelect={handleSelectCampaign}
        onCreate={() => {
          setActiveCampaignId(null);
          setShowCampaignModal(true);
        }}
        onDelete={(id) => handleDeleteCampaign(id)}
        onEnd={(id) => handleEndCampaign(id)}
      />

      {/* Divider with active campaign label */}
      {campaign && (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
          <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
            <Eye className="h-3 w-3" /> Chi tiết chiến dịch đang xem
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
        </div>
      )}

      {!campaign ? (
        /* Empty State: no campaign selected / no campaigns exist */
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111421]/80 to-[#070913]/96 p-12 text-center flex flex-col items-center justify-center space-y-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="h-16 w-16 rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
            <Heart className="h-8 w-8 text-amber-400 animate-pulse" />
          </div>
          <div className="space-y-2 relative z-10">
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              {allCampaigns.length === 0 ? "Bạn chưa khởi tạo chiến dịch gây quỹ" : "Chọn một chiến dịch để xem chi tiết"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
              {allCampaigns.length === 0
                ? "Để tăng điểm hồ sơ cuộc thi và thu hút sự ủng hộ từ các nhãn hàng, hãy tạo chiến dịch quyên góp quỹ nhân ái của bạn."
                : "Nhấn \"Xem chi tiết\" trên thẻ chiến dịch ở trên để xem nội dung chi tiết, thống kê và quản lý giải ngân."}
            </p>
          </div>
          {allCampaigns.length === 0 && (
            <button
              onClick={() => setShowCampaignModal(true)}
              className="flex items-center gap-2 px-6 h-12 bg-gradient-gold rounded-xl font-display text-xs font-black text-slate-950 hover:shadow-[0_0_20px_rgba(240,197,107,0.35)] hover:scale-[1.02] active:scale-98 transition-all duration-300 cursor-pointer shadow-lg relative z-10"
              style={{ color: "#02040a" }}
            >
              <Plus className="h-4.5 w-4.5" /> Tạo chiến dịch đầu tiên
            </button>
          )}
        </div>
      ) : (
        /* Active Campaign Layout - 2-Column top sections */
        <div className="space-y-8">
          {/* Top Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: QR Donate Card */}
            <QrDonate
              campaignTitle={campaign.title}
              showShareMenu={showShareMenu}
              setShowShareMenu={setShowShareMenu}
              onCopyLink={handleCopyLink}
              onDownloadQr={() => addToast("Tải ảnh QR VietQR thành công!", "success")}
              onShareFacebook={() => {
                addToast("Đã chia sẻ lên Facebook!", "success");
                setShowShareMenu(false);
              }}
              onShareInstagram={() => {
                addToast("Đã chia sẻ lên Story Instagram!", "success");
                setShowShareMenu(false);
              }}
              onShareZalo={() => {
                addToast("Đã tạo liên kết chia sẻ Zalo!", "success");
                setShowShareMenu(false);
              }}
            />

            {/* Right Column: Campaign Info Card */}
            <div className="lg:col-span-8 group relative overflow-hidden rounded-3xl border border-white/7 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_40%),linear-gradient(135deg,rgba(15,23,42,0.85),rgba(2,6,23,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] space-y-6 backdrop-blur-xl transition-all duration-300 hover:border-white/12 animate-in fade-in slide-in-from-right duration-500">

              <div className="absolute top-0 left-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

              {/* Corner Manage Dropdown */}
              <div className="absolute top-6 right-6 z-10">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#08090f]/90 text-slate-300 hover:text-white hover:bg-slate-900 hover:border-white/20 transition-all cursor-pointer shadow-md"
                >
                  <MoreVertical className="h-4.5 w-4.5" />
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#08090f]/95 p-1.5 shadow-2xl backdrop-blur-md z-20 animate-in fade-in slide-in-from-top-2 duration-205 text-xs font-semibold text-slate-300">
                      <button
                        onClick={() => {
                          setShowCampaignModal(true);
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white text-left transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" /> Chỉnh sửa
                      </button>
                      <button
                        onClick={() => {
                          handleCopyLink();
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white text-left transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" /> Sao chép liên kết
                      </button>
                      <button
                        onClick={() => {
                          addToast("Tải ảnh QR thành công!", "success");
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white text-left transition-colors"
                      >
                        Tải QR
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

              {/* Campaign Banner image / slider */}
              <div className="h-56 md:h-80 w-full rounded-2xl bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 relative overflow-hidden mb-6 border border-white/5 group">
                <img
                  src={
                    campaign.coverImages && campaign.coverImages.length > 0
                      ? campaign.coverImages[currentImageIdx % campaign.coverImages.length]
                      : campaign.coverImage
                  }
                  alt={campaign.title}
                  className="w-full h-full object-cover opacity-60 transition-all duration-505"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent" />

                {campaign.coverImages && campaign.coverImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentImageIdx((prev) =>
                          prev === 0 ? campaign.coverImages!.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#02040a]/85 border border-white/10 text-slate-350 hover:text-white flex items-center justify-center hover:bg-slate-900 transition-all cursor-pointer select-none z-10 text-lg font-bold"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentImageIdx((prev) =>
                          (prev + 1) % campaign.coverImages!.length
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#02040a]/85 border border-white/10 text-slate-350 hover:text-white flex items-center justify-center hover:bg-slate-900 transition-all cursor-pointer select-none z-10 text-lg font-bold"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-12 inset-x-0 flex justify-center gap-1.5 z-10">
                      {campaign.coverImages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentImageIdx(idx)}
                          className={cn(
                            "h-1.5 rounded-full transition-all cursor-pointer",
                            currentImageIdx % campaign.coverImages!.length === idx
                              ? "w-5 bg-amber-400"
                              : "w-1.5 bg-white/30"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}

                <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
                  <span
                    className={cn(
                      "inline-flex items-center rounded border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider",
                      campaign.status === "active"
                        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                        : "border-slate-500/25 bg-slate-500/10 text-slate-400"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5 shrink-0", campaign.status === "active" ? "bg-amber-400 animate-pulse" : "bg-slate-500")} />
                    {campaign.status === "active" ? "ĐANG HOẠT ĐỘNG" : "ĐÃ KẾT THÚC"}
                  </span>
                </div>
              </div>

              {/* Heading Detail */}
              <div className="space-y-4">
                <h3 className="font-display font-black text-2xl text-white uppercase tracking-wider pr-16 leading-tight hover:text-amber-300 transition-colors">
                  {campaign.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{campaign.description}</p>
                {campaign.details && (
                  <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-5 mt-2">
                    <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">
                      Thông tin chi tiết
                    </span>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{campaign.details}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  <span>
                    Bắt đầu: <strong className="text-slate-300">{campaign.startDate}</strong>
                  </span>
                  <span className="text-slate-700">•</span>
                  <span>
                    Kết thúc: <strong className="text-slate-300">{campaign.endDate}</strong>
                  </span>
                </div>
              </div>

              {/* Progress status */}
              <div className="mt-8 border-t border-white/5 pt-6 space-y-3">
                <div className="flex justify-between items-end text-xs">
                  <div className="space-y-1">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      Tổng số tiền nhận được
                    </span>
                    <span className="font-display font-black text-gradient-gold text-2xl md:text-3xl leading-none">
                      {campaign.raised.toLocaleString()}đ
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      Mục tiêu đề ra
                    </span>
                    <span className="text-slate-400 font-mono font-bold text-lg">
                      {campaign.goal.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-gold shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((campaign.raised / campaign.goal) * 100))}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-1">
                  <span>
                    Tiến độ hiện tại:{" "}
                    <b className="text-amber-400">{Math.round((campaign.raised / campaign.goal) * 100)}%</b>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />{" "}
                    <b>{campaign.supportersCount}</b> lượt quyên góp
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid (5 Items) */}
          <CampaignStatsGrid
            raised={campaign.raised}
            goal={campaign.goal}
            supportersCount={campaign.supportersCount}
            disbursed={campaign.disbursed}
          />

          {/* Donation History */}
          <DonationHistory supporters={supporters} />

          {/* Update Progress diary logs */}
          <ActivityLog updates={updates} onAddUpdate={() => setShowUpdateModal(true)} />

          {/* Payout / Disbursement */}
          <MilestoneList
            raised={campaign.raised}
            disbursed={campaign.disbursed}
            payouts={payouts}
            onRequestPayout={() => setShowPayoutModal(true)}
          />
        </div>
      )}

      {/* Dialog Modals */}
      <CampaignDialog
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
        maxAmount={campaign ? campaign.raised - campaign.disbursed : 0}
      />
    </div>
  );
}
