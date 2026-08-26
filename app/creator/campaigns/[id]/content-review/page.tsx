"use client";

import { useState, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  MessageSquare
} from "lucide-react";
import { MOCK_CREATOR_CAMPAIGNS } from "@/app/creator/mock-data";
import { CreatorCampaignItem, CreatorAssignment } from "@/app/creator/types";

export default function CreatorContentReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const campaign: CreatorCampaignItem = MOCK_CREATOR_CAMPAIGNS.find((c: CreatorCampaignItem) => c.id === resolvedParams.id) || MOCK_CREATOR_CAMPAIGNS[0];
  const pendingCreator: CreatorAssignment = campaign.creators.find((c: CreatorAssignment) => c.status === 'draft_submitted') || campaign.creators[0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [checklist, setChecklist] = useState({
    productVisible: true,
    brandMentioned: true,
    hashtagIncluded: true,
    ctaIncluded: false,
    durationValid: true,
    noProhibitedClaims: true
  });

  const [feedbackNote, setFeedbackNote] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"pending" | "approved" | "revision_requested">("pending");

  const handleApprove = () => {
    setReviewStatus("approved");
    alert("Đã duyệt video thành công! Creator đã nhận được thông báo để đăng video chính thức.");
  };

  const handleRequestRevision = () => {
    if (!feedbackNote.trim()) {
      alert("Vui lòng nhập nội dung góp ý cần sửa trước khi gửi yêu cầu.");
      return;
    }
    setReviewStatus("revision_requested");
    alert("Đã gửi yêu cầu chỉnh sửa kèm góp ý tới Creator.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/creator/campaigns/${campaign.id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại chi tiết chiến dịch</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Duyệt Video / Bản Nháp Creator
            </h1>
            <p className="text-zinc-500 text-xs mt-1">
              Chiến dịch: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{campaign.title}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {reviewStatus === "approved" && (
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã Duyệt Cho Phép Đăng</span>
              </span>
            )}
            {reviewStatus === "revision_requested" && (
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">
                <RotateCcw className="w-4 h-4" />
                <span>Đã Gửi Yêu Cầu Sửa</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Video Player & Captions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Video Player */}
          <div className="bg-black rounded-3xl overflow-hidden aspect-[9/16] sm:aspect-video relative flex items-center justify-center border border-zinc-800 shadow-lg group">
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1000&auto=format&fit=crop&q=80"
              alt="Video thumbnail"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:scale-110 transition shadow-lg z-10"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1 fill-white" />}
            </button>

            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white text-xs z-10">
              <span className="font-mono">00:24 / 00:48</span>
              <div className="flex items-center space-x-3">
                <button className="hover:text-rose-400 transition flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Tải bản gốc (48MB)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Caption & Metadata card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Nội dung Caption & Hashtags dự kiến
            </h3>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 font-sans">
              Hè này đi biển hay hoạt động ngoài trời không lo đen sạm nữa nhé cả nhà! Em kem chống nắng PureSun Watery này mỏng nhẹ tênh, nâng tone siêu tự nhiên không hề bị vón cục tí nào luôn. Mua ngay trên giỏ hàng góc trái video để nhận ưu đãi mua 1 tặng 1 nha! ✨🔥
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs text-rose-600 font-medium">
              <span className="bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">#PureSun</span>
              <span className="bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">#KemChongNangHe</span>
              <span className="bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">#ReviewLamDep</span>
              <span className="bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">@puresunofficial</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Checklist & Feedback Box (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Creator Information Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center space-x-3.5">
              <img
                src={pendingCreator.avatar}
                alt={pendingCreator.creatorName}
                className="w-12 h-12 rounded-full object-cover border border-zinc-200"
              />
              <div>
                <div className="font-bold text-zinc-900 dark:text-white">{pendingCreator.creatorName}</div>
                <div className="text-xs text-zinc-500 font-mono">{pendingCreator.creatorHandle} • 85K Followers</div>
                <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Bản nháp Phiên bản 2 (Version 2)</div>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Checklist Tiêu Chuẩn Duyệt</span>
              <span className="text-[11px] text-emerald-600 font-normal">Đạt 5/6 mục</span>
            </h3>

            <div className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.productVisible}
                  onChange={(e) => setChecklist({ ...checklist, productVisible: e.target.checked })}
                  className="accent-rose-600 rounded"
                />
                <span>Xuất hiện bao bì sản phẩm rõ nét (&gt;3 giây)</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.brandMentioned}
                  onChange={(e) => setChecklist({ ...checklist, brandMentioned: e.target.checked })}
                  className="accent-rose-600 rounded"
                />
                <span>Đọc đúng tên thương hiệu PureSun</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.hashtagIncluded}
                  onChange={(e) => setChecklist({ ...checklist, hashtagIncluded: e.target.checked })}
                  className="accent-rose-600 rounded"
                />
                <span>Gắn đủ hashtags bắt buộc trong caption</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.ctaIncluded}
                  onChange={(e) => setChecklist({ ...checklist, ctaIncluded: e.target.checked })}
                  className="accent-rose-600 rounded"
                />
                <span className={checklist.ctaIncluded ? "" : "text-rose-600 font-semibold"}>
                  Thiếu kêu gọi mã giảm giá &apos;PURE20&apos; ở cuối video
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.durationValid}
                  onChange={(e) => setChecklist({ ...checklist, durationValid: e.target.checked })}
                  className="accent-rose-600 rounded"
                />
                <span>Thời lượng đạt chuẩn (48s &gt; 30s)</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.noProhibitedClaims}
                  onChange={(e) => setChecklist({ ...checklist, noProhibitedClaims: e.target.checked })}
                  className="accent-rose-600 rounded"
                />
                <span>Không vi phạm thông điệp cấm</span>
              </label>
            </div>
          </div>

          {/* Feedback input */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Góp ý chỉnh sửa (Feedback)</span>
            </h3>
            <textarea
              rows={3}
              placeholder="Ví dụ: Đoạn 00:15 Creator nói nhỏ, cần chèn thêm text chữ voucher PURE20 to rõ hơn..."
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleRequestRevision}
                className="w-full py-2.5 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl transition"
              >
                Yêu Cầu Sửa
              </button>

              <button
                type="button"
                onClick={handleApprove}
                className="w-full py-2.5 text-xs font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl shadow-md transition"
              >
                Duyệt Video Này
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
