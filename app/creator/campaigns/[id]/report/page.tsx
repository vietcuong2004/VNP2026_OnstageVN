"use client";

import { use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Download, 
  FileSpreadsheet, 
  Sparkles,
  ExternalLink,
  Award
} from "lucide-react";
import { MOCK_CREATOR_CAMPAIGNS } from "@/app/creator/mock-data";
import { CreatorCampaignItem, CreatorAssignment } from "@/app/creator/types";

export default function CreatorCampaignReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const campaign: CreatorCampaignItem = MOCK_CREATOR_CAMPAIGNS.find((c: CreatorCampaignItem) => c.id === resolvedParams.id) || MOCK_CREATOR_CAMPAIGNS[0];

  const totalDeliveredViews = campaign.deliveredViews || 534200;
  const targetViews = campaign.targetViews || 500000;
  const completionRate = Math.round((totalDeliveredViews / targetViews) * 100);

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  const handleExportPDF = () => {
    alert("Đang khởi tạo bản in PDF báo cáo chiến dịch...");
    window.print();
  };

  const handleExportExcel = () => {
    alert("Đang tải xuống tệp dữ liệu chi tiết Excel (.xlsx)...");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 print:p-0">
      {/* Header & Breadcrumb */}
      <div className="print:hidden">
        <Link
          href={`/creator/campaigns/${campaign.id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại chi tiết chiến dịch</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Báo Cáo Hiệu Quả & Nghiệm Thu Chiến Dịch
              </h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                Đạt 106.8% Mục Tiêu
              </span>
            </div>
            <p className="text-zinc-500 text-sm mt-1">
              Mã: <span className="font-mono font-semibold">{campaign.campaignCode}</span> • {campaign.title}
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Báo Cáo PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-md">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Award className="w-4 h-4" />
          <span>Tổng Kết Cam Kết Hiệu Quả Đầu Ra</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <div className="text-xs text-zinc-400">Mục tiêu Cam kết</div>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-200 mt-1">
              {formatNumber(targetViews)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Lượt xem cam kết</div>
          </div>

          <div>
            <div className="text-xs text-zinc-400">Thực tế Đạt được</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              {formatNumber(totalDeliveredViews)}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-semibold">
              Đạt {completionRate}% cam kết
            </div>
          </div>

          <div>
            <div className="text-xs text-zinc-400">Quy mô Thực hiện</div>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
              20 / 20
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Creators & Videos</div>
          </div>

          <div>
            <div className="text-xs text-zinc-400">Tổng Lượt Tương tác</div>
            <div className="text-2xl sm:text-3xl font-bold text-rose-400 mt-1">
              42.500
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Likes, Comments, Shares</div>
          </div>
        </div>
      </div>

      {/* Top 3 Video Viral nhất */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Top Video Có Hiệu Suất Tốt Nhất</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {campaign.creators.slice(0, 3).map((cr: CreatorAssignment, idx: number) => (
            <div key={cr.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm relative">
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow">
                #{idx + 1}
              </div>

              <div className="flex items-center space-x-3 mb-3">
                <img src={cr.avatar} alt={cr.creatorName} className="w-10 h-10 rounded-full object-cover border" />
                <div>
                  <div className="font-bold text-sm text-zinc-900 dark:text-white">{cr.creatorName}</div>
                  <div className="text-xs text-zinc-500">{cr.creatorHandle}</div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Lượt xem đạt:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(cr.actualViews)} Views</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tương tác:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatNumber((cr.likes || 0) + (cr.comments || 0))} lượt</span>
                </div>
              </div>

              {cr.publishedUrl && (
                <a
                  href={cr.publishedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 w-full py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center space-x-1 transition"
                >
                  <span>Xem trên TikTok</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bảng phân tích chi tiết từng Video theo ngày */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            Bảng Đo Lường Tăng Trưởng Views Từng Video (Snapshot D1 - D14)
          </h2>
          <span className="text-xs text-zinc-500">Thời gian đo: 14 ngày/video</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 font-semibold text-zinc-500 uppercase border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3">Creator / Video</th>
                <th className="px-5 py-3">Ngày đăng</th>
                <th className="px-5 py-3">Views Ngày 1</th>
                <th className="px-5 py-3">Views Ngày 3</th>
                <th className="px-5 py-3">Views Ngày 7</th>
                <th className="px-5 py-3">Views Chốt (D14)</th>
                <th className="px-5 py-3">Tương tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {campaign.creators.map((cr: CreatorAssignment) => (
                <tr key={cr.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-zinc-900 dark:text-white">{cr.creatorName}</div>
                    <div className="text-[11px] text-zinc-500">{cr.creatorHandle}</div>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-300 font-mono">{cr.publishDate || "18/08/2026"}</td>
                  <td className="px-5 py-3.5 font-mono">{formatNumber(cr.viewsD1 || 12000)}</td>
                  <td className="px-5 py-3.5 font-mono">{formatNumber(cr.viewsD3 || 26000)}</td>
                  <td className="px-5 py-3.5 font-mono">{formatNumber(cr.viewsD7 || cr.actualViews)}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatNumber(cr.actualViews)}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500">
                    {formatNumber((cr.likes || 0) + (cr.comments || 0) + (cr.shares || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
