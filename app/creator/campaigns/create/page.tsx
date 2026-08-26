"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Check, 
  Plus, 
  X, 
  CheckCircle2, 
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateCreatorCampaignWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Thông tin cơ bản
    campaignTitle: "Serum ABC – Review tháng 8",
    brandName: "ABC Cosmetics",
    category: "Làm đẹp – Chăm sóc da",
    platform: "TikTok",
    measurementDays: "14 ngày sau khi đăng",
    deadline: "2026-08-30",

    // Step 2: Thông tin sản phẩm
    productName: "Serum ABC Vitamin C",
    productDescription: "Serum chứa Vitamin C giúp sáng da, mờ thâm, chống oxy hóa và cấp ẩm.",
    productUrl: "https://abc.com/serum-abc",
    sellingPrice: "450000",
    productImages: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80"
    ],

    // Step 3: Hình thức xuất hiện
    campaignType: "review" as "placement" | "review",

    // Step 4: Yêu cầu nội dung chi tiết
    videoDuration: "15 - 30 giây",
    mandatoryChecklist: {
      mentionBrand: true,
      showProduct: true,
      ctaBio: true,
      hashtag: true
    },
    brandMentionText: "Serum ABC",
    hashtagText: "#SerumABC #Onstage",
    talkingPoints: "Thành phần Vitamin C | Dưỡng sáng da | Mờ thâm | Kiểm soát dầu | Phù hợp da nhạy cảm",
    referenceFiles: [] as string[],

    // Step 5: Gói lượt xem & ngân sách
    targetViews: 500000,
  });

  // Calculate estimated budget
  const calculateEstimatedBudget = () => {
    const views = formData.targetViews;
    let baseMin = 0;
    let baseMax = 0;

    if (formData.campaignType === "placement") {
      if (views <= 50000) { baseMin = 8000000; baseMax = 12000000; }
      else if (views <= 100000) { baseMin = 15000000; baseMax = 22000000; }
      else if (views <= 300000) { baseMin = 39000000; baseMax = 57000000; }
      else if (views <= 500000) { baseMin = 60000000; baseMax = 85000000; }
      else { baseMin = 110000000; baseMax = 150000000; }
    } else {
      if (views <= 50000) { baseMin = 12000000; baseMax = 18000000; }
      else if (views <= 100000) { baseMin = 20000000; baseMax = 30000000; }
      else if (views <= 300000) { baseMin = 50000000; baseMax = 75000000; }
      else if (views <= 500000) { baseMin = 75000000; baseMax = 110000000; }
      else { baseMin = 135000000; baseMax = 200000000; }
    }

    return {
      min: baseMin,
      max: baseMax,
      estimatedCreators: views <= 100000 ? "5 – 10 Creator" : views <= 300000 ? "10 – 20 Creator" : "15 – 30 Creator"
    };
  };

  const estimated = calculateEstimatedBudget();

  const handleNext = () => {
    if (currentStep === 1 && !formData.campaignTitle.trim()) {
      alert("Vui lòng nhập tên chiến dịch.");
      return;
    }
    if (currentStep === 2 && !formData.productName.trim()) {
      alert("Vui lòng nhập tên sản phẩm.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }, 1000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4 rounded-2xl border border-[#F0D7D3] bg-white dark:border-white/10 dark:bg-[#070913] p-8 shadow-xs">
        <div className="w-14 h-14 bg-[#FFF0EE] text-[#C72524] rounded-full flex items-center justify-center mx-auto mb-5 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#191116] dark:text-white">
          Yêu cầu Chiến dịch đã được gửi thành công!
        </h2>
        <p className="text-xs text-[#574D54] dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          Đội ngũ Onstage sẽ thẩm định và gửi báo giá chính thức kèm danh sách Creator phù hợp trong vòng <strong>24 giờ làm việc</strong>.
        </p>

        <div className="mt-7 flex items-center justify-center">
          <Link
            href="/creator/campaigns"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#C72524] hover:bg-[#A31818] text-white font-bold text-xs px-6 shadow-md transition active:scale-95"
          >
            Về Danh sách Chiến dịch
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-16">
      {/* Quay lại */}
      <div>
        <Link
          href="/creator/campaigns"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#574D54] hover:text-[#C72524] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại Quản lý Chiến dịch</span>
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="rounded-2xl border border-[#F0D7D3] bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-[#070913] space-y-6">
        {/* Step Indicator Header */}
        <div className="space-y-4 pb-5 border-b border-[#F0D7D3] dark:border-white/10">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-black text-[#191116] dark:text-white tracking-tight">
              Tạo chiến dịch mới
            </h1>
            <span className="text-xs font-bold text-[#C72524]">
              Bước {currentStep} / 5
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 text-xs font-semibold text-[#574D54]">
            {[
              { step: 1, label: "Thông tin" },
              { step: 2, label: "Sản phẩm" },
              { step: 3, label: "Hình thức" },
              { step: 4, label: "Yêu cầu" },
              { step: 5, label: "Ngân sách" },
            ].map((s, idx) => (
              <div key={s.step} className="flex items-center space-x-1.5">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition",
                    currentStep === s.step
                      ? "bg-[#C72524] text-white ring-2 ring-[#C72524]/20"
                      : currentStep > s.step
                      ? "bg-emerald-600 text-white"
                      : "bg-[#FFF0EE] text-[#C72524] dark:bg-white/5 dark:text-slate-400"
                  )}
                >
                  {currentStep > s.step ? <Check className="w-3 h-3" /> : s.step}
                </div>
                <span className={cn("hidden sm:inline", currentStep === s.step ? "text-[#191116] dark:text-white font-bold" : "text-[#574D54] dark:text-slate-400")}>
                  {s.label}
                </span>
                {idx < 4 && <span className="text-zinc-300 dark:text-zinc-700">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* BƯỚC 1: Thông tin cơ bản */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#191116] dark:text-zinc-300 mb-1.5">
                Tên chiến dịch <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập tên chiến dịch..."
                value={formData.campaignTitle}
                onChange={(e) => setFormData({ ...formData, campaignTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8F7] dark:bg-zinc-800/80 border border-[#F0D7D3] dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#C72524]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191116] dark:text-zinc-300 mb-1.5">
                Thương hiệu <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8F7] dark:bg-zinc-800/80 border border-[#F0D7D3] dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#C72524] font-medium"
              >
                <option value="ABC Cosmetics">ABC Cosmetics</option>
                <option value="PureSun Skincare">PureSun Skincare</option>
                <option value="GlowMax Beauty">GlowMax Beauty</option>
                <option value="Khác">Thương hiệu khác...</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191116] dark:text-zinc-300 mb-1.5">
                Ngành hàng <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8F7] dark:bg-zinc-800/80 border border-[#F0D7D3] dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#C72524] font-medium"
              >
                <option value="Làm đẹp – Chăm sóc da">Làm đẹp – Chăm sóc da</option>
                <option value="Trang điểm & Son môi">Trang điểm & Son môi</option>
                <option value="Thời trang & Phụ kiện">Thời trang & Phụ kiện</option>
                <option value="Mẹ & Bé">Mẹ & Bé</option>
                <option value="Thực phẩm & Đồ uống">Thực phẩm & Đồ uống</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191116] dark:text-zinc-300 mb-1.5">
                Nền tảng chính <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8F7] dark:bg-zinc-800/80 border border-[#F0D7D3] dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#C72524] font-medium"
              >
                <option value="TikTok">TikTok</option>
                <option value="Facebook Reels">Facebook Reels</option>
                <option value="YouTube Shorts">YouTube Shorts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191116] dark:text-zinc-300 mb-1.5">
                Thời gian đo lường lượt xem <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.measurementDays}
                onChange={(e) => setFormData({ ...formData, measurementDays: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8F7] dark:bg-zinc-800/80 border border-[#F0D7D3] dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#C72524] font-medium"
              >
                <option value="14 ngày sau khi đăng">14 ngày sau khi đăng</option>
                <option value="7 ngày sau khi đăng">7 ngày sau khi đăng</option>
                <option value="30 ngày sau khi đăng">30 ngày sau khi đăng</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191116] dark:text-zinc-300 mb-1.5">
                Deadline đăng video <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8F7] dark:bg-zinc-800/80 border border-[#F0D7D3] dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#C72524] font-medium"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={handleNext}
                className="h-10 px-6 bg-[#C72524] hover:bg-[#A31818] text-white rounded-xl font-bold text-xs shadow-xs transition active:scale-95"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )}

        {/* BƯỚC 2: Chọn & nhập sản phẩm */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#191116] dark:text-white">Thông tin sản phẩm</h2>
              <p className="text-[11px] text-[#574D54] dark:text-slate-400">Nhập chi tiết sản phẩm sẽ review</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191116] dark:text-zinc-300 mb-1.5">
                Tên sản phẩm <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Serum ABC Vitamin C"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8F7] dark:bg-zinc-800/80 border border-[#F0D7D3] dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#C72524]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-[#191116] dark:text-zinc-300">
                  Mô tả ngắn <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-zinc-400">
                  {formData.productDescription.length}/200
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={200}
                placeholder="Mô tả công dụng chính của sản phẩm..."
                value={formData.productDescription}
                onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8F7] dark:bg-zinc-800/80 border border-[#F0D7D3] dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#C72524]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191116] dark:text-zinc-300 mb-1.5">
                Link sản phẩm <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                placeholder="https://abc.com/serum-abc"
                value={formData.productUrl}
                onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8F7] dark:bg-zinc-800/80 border border-[#F0D7D3] dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#C72524]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191116] dark:text-zinc-300 mb-1.5">
                Giá bán lẻ (VNĐ)
              </label>
              <input
                type="number"
                placeholder="450000"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8F7] dark:bg-zinc-800/80 border border-[#F0D7D3] dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#C72524]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191116] dark:text-zinc-300 mb-2">
                Ảnh sản phẩm
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {formData.productImages.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#F0D7D3] group">
                    <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          productImages: formData.productImages.filter((_, i) => i !== idx)
                        });
                      }}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-[#F0D7D3] hover:border-[#C72524] flex flex-col items-center justify-center text-[#C72524] cursor-pointer bg-[#FFF0EE]/50 transition">
                  <Plus className="w-5 h-5" />
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={handlePrev}
                className="h-10 px-5 bg-[#FFF0EE] text-[#C72524] rounded-xl font-bold text-xs hover:bg-[#FFE5E2] transition"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="h-10 px-6 bg-[#C72524] hover:bg-[#A31818] text-white rounded-xl font-bold text-xs shadow-xs transition active:scale-95"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )}

        {/* BƯỚC 3: Hình thức xuất hiện sản phẩm */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#191116] dark:text-white">Hình thức xuất hiện sản phẩm</h2>
              <p className="text-[11px] text-[#574D54] dark:text-slate-400">Chọn cách sản phẩm xuất hiện trong video</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Placement */}
              <div
                onClick={() => setFormData({ ...formData, campaignType: 'placement' })}
                className={cn(
                  "p-4 rounded-2xl border-2 cursor-pointer transition-all",
                  formData.campaignType === 'placement'
                    ? 'border-[#C72524] bg-[#FFF0EE]/40 shadow-xs'
                    : 'border-[#F0D7D3] hover:border-zinc-300'
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-[#191116] dark:text-white">
                      Chỉ xuất hiện / nhắc đến (Placement)
                    </h3>
                    <p className="text-[11px] text-[#574D54] dark:text-slate-400 mt-1 leading-relaxed">
                      Sản phẩm hoặc tên sản phẩm xuất hiện trong video, không cần gửi hàng mẫu.
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border",
                    formData.campaignType === 'placement'
                      ? 'bg-[#C72524] text-white border-[#C72524]'
                      : 'border-zinc-300'
                  )}>
                    {formData.campaignType === 'placement' && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </div>

              {/* Direct Review */}
              <div
                onClick={() => setFormData({ ...formData, campaignType: 'review' })}
                className={cn(
                  "p-4 rounded-2xl border-2 cursor-pointer transition-all",
                  formData.campaignType === 'review'
                    ? 'border-[#C72524] bg-[#FFF0EE]/40 shadow-xs'
                    : 'border-[#F0D7D3] hover:border-zinc-300'
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-[#191116] dark:text-white">
                      Trải nghiệm & Review trực tiếp
                    </h3>
                    <p className="text-[11px] text-[#574D54] dark:text-slate-400 mt-1 leading-relaxed">
                      Creator nhận sản phẩm mẫu, mở hộp, trải nghiệm và chia sẻ thực tế.
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border",
                    formData.campaignType === 'review'
                      ? 'bg-[#C72524] text-white border-[#C72524]'
                      : 'border-zinc-300'
                  )}>
                    {formData.campaignType === 'review' && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={handlePrev}
                className="h-10 px-5 bg-[#FFF0EE] text-[#C72524] rounded-xl font-bold text-xs hover:bg-[#FFE5E2] transition"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="h-10 px-6 bg-[#C72524] hover:bg-[#A31818] text-white rounded-xl font-bold text-xs shadow-xs transition active:scale-95"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )}

        {/* BƯỚC 4: Yêu cầu nội dung chi tiết */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#191116] dark:text-white">Yêu cầu nội dung chi tiết</h2>
              <p className="text-[11px] text-[#574D54] dark:text-slate-400">Nhập yêu cầu nội dung cụ thể cho Creator</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191116] dark:text-zinc-300 mb-1.5">
                Độ dài video mong muốn
              </label>
              <select
                value={formData.videoDuration}
                onChange={(e) => setFormData({ ...formData, videoDuration: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8F7] dark:bg-zinc-800/80 border border-[#F0D7D3] dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#C72524] font-medium"
              >
                <option value="15 - 30 giây">15 – 30 giây</option>
                <option value="30 - 60 giây">30 – 60 giây</option>
                <option value="Trên 60 giây">Trên 60 giây</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#191116] dark:text-zinc-300">
                Nội dung bắt buộc
              </label>
              <div className="space-y-2 bg-[#FFF8F7] p-3.5 rounded-xl border border-[#F0D7D3] text-xs">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mandatoryChecklist.mentionBrand}
                    onChange={(e) => setFormData({
                      ...formData,
                      mandatoryChecklist: { ...formData.mandatoryChecklist, mentionBrand: e.target.checked }
                    })}
                    className="accent-[#C72524] rounded"
                  />
                  <span>Nhắc tên sản phẩm: <strong>{formData.brandMentionText}</strong></span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mandatoryChecklist.showProduct}
                    onChange={(e) => setFormData({
                      ...formData,
                      mandatoryChecklist: { ...formData.mandatoryChecklist, showProduct: e.target.checked }
                    })}
                    className="accent-[#C72524] rounded"
                  />
                  <span>Hiển thị sản phẩm trong video</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mandatoryChecklist.ctaBio}
                    onChange={(e) => setFormData({
                      ...formData,
                      mandatoryChecklist: { ...formData.mandatoryChecklist, ctaBio: e.target.checked }
                    })}
                    className="accent-[#C72524] rounded"
                  />
                  <span>CTA: Tham khảo sản phẩm tại link bio</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mandatoryChecklist.hashtag}
                    onChange={(e) => setFormData({
                      ...formData,
                      mandatoryChecklist: { ...formData.mandatoryChecklist, hashtag: e.target.checked }
                    })}
                    className="accent-[#C72524] rounded"
                  />
                  <span>Hashtag: <strong>{formData.hashtagText}</strong></span>
                </label>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-[#191116] dark:text-zinc-300">
                  Nội dung / Điểm cần nhấn mạnh
                </label>
                <span className="text-[10px] text-zinc-400">
                  {formData.talkingPoints.length}/300
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={300}
                placeholder="Thành phần Vitamin C | Dưỡng sáng da | Mờ thâm..."
                value={formData.talkingPoints}
                onChange={(e) => setFormData({ ...formData, talkingPoints: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FFF8F7] dark:bg-zinc-800/80 border border-[#F0D7D3] dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#C72524]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={handlePrev}
                className="h-10 px-5 bg-[#FFF0EE] text-[#C72524] rounded-xl font-bold text-xs hover:bg-[#FFE5E2] transition"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="h-10 px-6 bg-[#C72524] hover:bg-[#A31818] text-white rounded-xl font-bold text-xs shadow-xs transition active:scale-95"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )}

        {/* BƯỚC 5: Gói lượt xem & ngân sách */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#191116] dark:text-white">Gói Lượt xem Mục tiêu & Dự toán Ngân sách</h2>
              <p className="text-[11px] text-[#574D54] dark:text-slate-400">Cam kết tổng lượt xem toàn chiến dịch đo trong 14 ngày</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[50000, 100000, 300000, 500000, 1000000].map((views) => (
                <div
                  key={views}
                  onClick={() => setFormData({ ...formData, targetViews: views })}
                  className={cn(
                    "p-3 rounded-xl border-2 text-center cursor-pointer transition-all",
                    formData.targetViews === views
                      ? 'border-[#C72524] bg-[#FFF0EE] shadow-xs'
                      : 'border-[#F0D7D3] hover:border-zinc-300'
                  )}
                >
                  <div className="text-base font-black text-[#191116] dark:text-white">
                    {formatNumber(views)}
                  </div>
                  <div className="text-[10px] text-[#574D54] dark:text-slate-400">Views cam kết</div>
                </div>
              ))}
            </div>

            {/* Estimated Budget Box */}
            <div className="rounded-2xl border border-[#F0D7D3] bg-[#FFF8F7] p-4.5 space-y-3 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex items-center space-x-1.5 text-[#C72524] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dự toán Ngân sách Ước tính</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pb-3 border-b border-[#F0D7D3] dark:border-white/10">
                <div>
                  <div className="text-[10px] text-[#574D54] dark:text-slate-400">Mục tiêu</div>
                  <div className="font-bold text-[#191116] dark:text-white">{formatNumber(formData.targetViews)} Views</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#574D54] dark:text-slate-400">Số Creator</div>
                  <div className="font-bold text-[#191116] dark:text-white">{estimated.estimatedCreators}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#574D54] dark:text-slate-400">Hình thức</div>
                  <div className="font-bold text-[#191116] dark:text-white">
                    {formData.campaignType === 'review' ? 'Direct Review' : 'Placement'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <span className="text-[11px] text-[#574D54] dark:text-slate-400">Khoảng ngân sách dự kiến:</span>
                  <div className="text-lg font-black text-[#C72524]">
                    {formatCurrency(estimated.min)} – {formatCurrency(estimated.max)}
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 italic">
                  * Onstage sẽ gửi báo giá chính thức trong 24h.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={handlePrev}
                className="h-10 px-5 bg-[#FFF0EE] text-[#C72524] rounded-xl font-bold text-xs hover:bg-[#FFE5E2] transition"
              >
                Quay lại
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="h-10 px-6 bg-[#C72524] hover:bg-[#A31818] text-white rounded-xl font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi Yêu Cầu Chiến Dịch"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
