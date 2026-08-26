"use client";

import { useState, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle2, 
  ThumbsUp,
  MessageCircle,
  ExternalLink
} from "lucide-react";
import { MOCK_CREATOR_CAMPAIGNS, STATUS_MAP } from "@/app/creator/mock-data";
import { CreatorCampaignItem, CreatorAssignment } from "@/app/creator/types";

export default function CreatorCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const campaign: CreatorCampaignItem = MOCK_CREATOR_CAMPAIGNS.find((c: CreatorCampaignItem) => c.id === resolvedParams.id) || MOCK_CREATOR_CAMPAIGNS[0];
  const [activeTab, setActiveTab] = useState<"overview" | "creators" | "brief">("overview");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  const percent = Math.min(Math.round((campaign.deliveredViews / campaign.targetViews) * 100), 100);
  const statusInfo = STATUS_MAP[campaign.status] || { label: campaign.status, color: 'text-zinc-600', bg: 'bg-zinc-100' };

  return (
    <div className="space-y-8">
      {/* Header & Breadcrumb */}
      <div>
        <Link
          href="/creator/campaigns"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách chiến dịch</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {campaign.title}
              </h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-zinc-500 text-sm mt-1">
              Mã: <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">{campaign.campaignCode}</span> • Sản phẩm: {campaign.product.name}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href={`/creator/campaigns/${campaign.id}/quotation`}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#FFF0EE] text-[#C72524] hover:bg-[#FFE5E2] border border-[#F0D7D3] transition"
            >
              Xem Báo Giá
            </Link>

            <Link
              href={`/creator/campaigns/${campaign.id}/content-review`}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#C72524] hover:bg-[#A31818] text-white transition shadow-xs"
            >
              Duyệt Video ({campaign.creators.filter((c: CreatorAssignment) => c.status === 'draft_submitted').length})
            </Link>

            <Link
              href={`/creator/campaigns/${campaign.id}/report`}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#C72524] hover:bg-[#A31818] text-white transition shadow-xs"
            >
              Xem Báo Cáo
            </Link>
          </div>
        </div>
      </div>

      {/* Milestone Progress Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-5">
          Tiến Độ Triển Khai Chiến Dịch
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { step: "1. Duyệt giá", status: "done", desc: "Đã cọc 50%" },
            { step: "2. Tuyển Creator", status: "done", desc: "20/20 Creator" },
            { step: "3. Giao sản phẩm", status: "done", desc: "20/20 Đã nhận" },
            { step: "4. Duyệt nháp", status: "active", desc: "19/20 Đã duyệt" },
            { step: "5. Đăng bài", status: "active", desc: "16/20 Đã đăng" },
            { step: "6. Đo Views", status: "active", desc: `${percent}% mục tiêu` },
            { step: "7. Quyết toán", status: "pending", desc: "Hạn 15/09" },
          ].map((m, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                  m.status === "done"
                    ? "bg-emerald-500 text-white"
                    : m.status === "active"
                    ? "bg-amber-500 text-white ring-4 ring-amber-500/20"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400"
                }`}
              >
                {m.status === "done" ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">{m.step}</span>
              <span className="text-[11px] text-zinc-500 mt-0.5">{m.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 flex space-x-6">
        {[
          { id: "overview", label: "Tổng quan & Tiến độ Views" },
          { id: "creators", label: `Danh sách Creator & Video (${campaign.creators.length})` },
          { id: "brief", label: "Thông tin Brief & Cam kết" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-bold border-b-2 transition ${
              activeTab === tab.id
                ? "border-rose-600 text-rose-600 dark:text-rose-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TỔNG QUAN & TIẾN ĐỘ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Progress Views Box */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <span className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Tiến độ Cam kết Lượt xem</span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                  {formatNumber(campaign.deliveredViews)} <span className="text-lg font-normal text-zinc-400">/ {formatNumber(campaign.targetViews)} Views</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400">Tỷ lệ hoàn thành</span>
                <div className="text-2xl font-black text-amber-400">{percent}%</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-1000"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-400 mt-2">
                <span>Bắt đầu: 18/08/2026</span>
                <span>Đang đo lường (Ngày 7 / 14 ngày)</span>
                <span>Kết thúc đo: 01/09/2026</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="text-xs text-zinc-500">Creator đã đăng video</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                {campaign.creators.filter((c: CreatorAssignment) => c.status === 'published').length} / {campaign.creators.length}
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="text-xs text-zinc-500">Tổng lượt tương tác (Like/Cmt/Share)</div>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {formatNumber(campaign.creators.reduce((acc: number, c: CreatorAssignment) => acc + (c.likes || 0) + (c.comments || 0) + (c.shares || 0), 0))}
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="text-xs text-zinc-500">Lượt xem trung bình / Video</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatNumber(Math.round(campaign.deliveredViews / (campaign.creators.filter((c: CreatorAssignment) => c.status === 'published').length || 1)))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DANH SÁCH CREATOR & VIDEO */}
      {activeTab === "creators" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-xs font-semibold text-zinc-500 uppercase border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5">Creator</th>
                  <th className="px-6 py-3.5">Followers</th>
                  <th className="px-6 py-3.5">Views Ghi nhận</th>
                  <th className="px-6 py-3.5">Tương tác</th>
                  <th className="px-6 py-3.5">Trạng thái</th>
                  <th className="px-6 py-3.5 text-right">Video</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {campaign.creators.map((cr: CreatorAssignment) => (
                  <tr key={cr.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={cr.avatar}
                          alt={cr.creatorName}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                        />
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-white">{cr.creatorName}</div>
                          <div className="text-xs text-zinc-500 font-mono">{cr.creatorHandle}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300 font-medium">
                      {formatNumber(cr.followers)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatNumber(cr.actualViews)}
                      </span>
                      <span className="text-xs text-zinc-400 ml-1">/ {formatNumber(cr.expectedViews)} dự kiến</span>
                    </td>

                    <td className="px-6 py-4 text-xs text-zinc-500 space-x-3">
                      <span className="inline-flex items-center"><ThumbsUp className="w-3.5 h-3.5 mr-1" /> {formatNumber(cr.likes || 0)}</span>
                      <span className="inline-flex items-center"><MessageCircle className="w-3.5 h-3.5 mr-1" /> {formatNumber(cr.comments || 0)}</span>
                    </td>

                    <td className="px-6 py-4">
                      {cr.status === 'published' ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold">
                          Đã đăng video
                        </span>
                      ) : cr.status === 'draft_submitted' ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-semibold">
                          Chờ duyệt bản nháp
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                          Đang sản xuất
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {cr.publishedUrl ? (
                        <a
                          href={cr.publishedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-500 transition"
                        >
                          <span>Xem video</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : cr.status === 'draft_submitted' ? (
                        <Link
                          href={`/creator/campaigns/${campaign.id}/content-review`}
                          className="inline-flex items-center space-x-1 text-xs font-bold px-3 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition"
                        >
                          <span>Duyệt nháp</span>
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BRIEF & CAM KẾT */}
      {activeTab === "brief" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Thông tin sản phẩm</span>
              <div className="font-bold text-zinc-900 dark:text-white mt-1 text-base">{campaign.product.name}</div>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{campaign.product.description}</p>
            </div>

            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Điểm bán hàng độc nhất (USP)</span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed">{campaign.product.usp}</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Thông điệp được phép nói</span>
              <ul className="text-xs text-emerald-900 list-disc list-inside mt-2 space-y-1">
                {campaign.product.allowedClaims.map((c: string, i: number) => <li key={i}>{c}</li>)}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-200">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Thông điệp cấm nói</span>
              <ul className="text-xs text-rose-900 list-disc list-inside mt-2 space-y-1">
                {campaign.product.prohibitedClaims.map((c: string, i: number) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
