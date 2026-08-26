"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ArrowUpRight,
  BarChart3,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_CREATOR_CAMPAIGNS, STATUS_MAP } from "../mock-data";
import { CreatorCampaignItem } from "../types";

const STATUS_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "running", label: "Đang chạy" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "completed", label: "Hoàn tất" },
];

export default function CreatorCampaignsDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const filteredCampaigns = useMemo(() => {
    return MOCK_CREATOR_CAMPAIGNS.filter((c: CreatorCampaignItem) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.product.name.toLowerCase().includes(q) ||
        c.campaignCode.toLowerCase().includes(q);

      if (activeTab === "running") {
        return matchSearch && (c.status === 'measuring' || c.status === 'producing' || c.status === 'recruiting');
      }
      if (activeTab === "pending") {
        return matchSearch && (c.status === 'quotation_sent' || c.status === 'content_review' || c.status === 'submitted');
      }
      if (activeTab === "completed") {
        return matchSearch && c.status === 'completed';
      }
      return matchSearch;
    });
  }, [searchQuery, activeTab]);

  return (
    <div className="space-y-6 pb-16">
      {/* ── HEADER (Không viền xám bao quanh) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#191116] dark:text-white">
            Quản lý Chiến dịch Creator
          </h1>
          <p className="text-xs text-[#574D54] dark:text-slate-400 mt-1">
            Theo dõi tiến độ sản xuất nội dung, duyệt video và cam kết lượt xem thời gian thực.
          </p>
        </div>

        <Link
          href="/creator/campaigns/create"
          style={{ color: "#ffffff" }}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#C72524] hover:bg-[#A31818] !text-white px-5 text-xs font-bold shadow-md shadow-red-900/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4 !text-white" />
          <span className="!text-white">Tạo chiến dịch mới</span>
        </Link>
      </div>

      {/* ── BỘ LỌC & TÌM KIẾM (Không viền xám hộp) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C72524] dark:text-[#C9A86A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên chiến dịch, mã hoặc sản phẩm..."
            className="w-full h-10 rounded-full border border-[#F0D7D3] bg-white pl-9.5 pr-8 text-xs font-medium text-[#191116] outline-none focus:border-[#C72524] placeholder:text-[#9A8B88] transition shadow-xs dark:border-white/10 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8B88] hover:text-[#C72524]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                style={isActive ? { color: "#ffffff" } : undefined}
                className={cn(
                  "h-9 shrink-0 rounded-full px-4 text-xs font-bold transition active:scale-95 cursor-pointer",
                  isActive
                    ? "bg-[#C72524] !text-white shadow-xs"
                    : "bg-[#FFF0EE] text-[#C72524] hover:bg-[#FFE5E2] dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── BẢNG DANH SÁCH CHIẾN DỊCH ── */}
      <div className="rounded-2xl border border-[#F0D7D3] bg-white overflow-hidden shadow-xs dark:border-white/10 dark:bg-[#070913]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#F0D7D3] bg-[#FFF8F7] text-[11px] font-bold uppercase tracking-wider text-[#574D54] dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-400">
                <th className="px-5 py-3.5">Chiến dịch / Sản phẩm</th>
                <th className="px-4 py-3.5">Hình thức</th>
                <th className="px-5 py-3.5">Tiến độ Lượt xem</th>
                <th className="px-4 py-3.5">Ngân sách</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0D7D3]/70 dark:divide-white/5 font-medium">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#574D54] dark:text-slate-400">
                    Không tìm thấy chiến dịch nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((camp: CreatorCampaignItem) => {
                  const statusInfo = STATUS_MAP[camp.status] || { label: camp.status, color: 'text-zinc-600', bg: 'bg-zinc-100' };
                  const percent = Math.min(Math.round((camp.deliveredViews / camp.targetViews) * 100), 100);

                  return (
                    <tr 
                      key={camp.id} 
                      className="hover:bg-[#FFF8F7]/60 dark:hover:bg-white/[0.02] transition"
                    >
                      {/* Cột 1: Chiến dịch & Sản phẩm */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={camp.product.images[0] || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&auto=format&fit=crop&q=80"}
                            alt={camp.product.name}
                            className="h-12 w-12 shrink-0 rounded-xl object-cover border border-[#F0D7D3] dark:border-white/10"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/creator/campaigns/${camp.id}`}
                                className="font-bold text-sm text-[#191116] hover:text-[#C72524] transition dark:text-white dark:hover:text-[#F0C56B]"
                              >
                                {camp.title}
                              </Link>
                              <span className="font-mono text-[10px] font-bold text-[#C72524] bg-[#FFF0EE] px-1.5 py-0.5 rounded dark:bg-amber-400/10 dark:text-amber-300">
                                {camp.campaignCode}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#574D54] dark:text-slate-400">
                              Sản phẩm: <span className="text-[#191116] dark:text-slate-200 font-semibold">{camp.product.name}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Hình thức */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {camp.campaignType === 'review' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FFF0EE] text-[#C72524] border border-[#F0D7D3] dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40">
                            Review trực tiếp
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/40">
                            Nhắc tên / Logo
                          </span>
                        )}
                      </td>

                      {/* Cột 3: Tiến độ Views */}
                      <td className="px-5 py-4 min-w-[200px]">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-[#191116] dark:text-white">{formatNumber(camp.deliveredViews)}</span>
                            <span className="text-[#574D54] dark:text-slate-400">/ {formatNumber(camp.targetViews)} Views</span>
                          </div>
                          <div className="w-full bg-zinc-200/80 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                percent >= 100 
                                  ? "bg-emerald-500" 
                                  : "bg-[#C72524]"
                              )}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-[#574D54] dark:text-slate-400">
                            <span>Đạt: <strong>{percent}%</strong></span>
                            <span className={statusInfo.color}>{statusInfo.label}</span>
                          </div>
                        </div>
                      </td>

                      {/* Cột 4: Ngân sách */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-bold text-[#191116] dark:text-slate-100 text-xs">
                          {formatCurrency(camp.budget)}
                        </span>
                      </td>

                      {/* Cột 5: Thao tác (Chỉ có Xem chi tiết) */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Link
                          href={`/creator/campaigns/${camp.id}`}
                          style={{ color: "#ffffff" }}
                          className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#C72524] hover:bg-[#A31818] !text-white px-3 text-xs font-bold shadow-xs active:scale-95 transition"
                        >
                          <span className="!text-white">Xem chi tiết</span>
                          <ChevronRight className="h-3.5 w-3.5 !text-white" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
