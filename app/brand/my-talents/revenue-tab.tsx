"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Calendar,
  Network,
  Users2,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BrandCommissionTransaction } from "@/lib/brand-api";
import type { RosterTalent } from "./roster-tab";

type Timeframe = "month" | "quarter" | "year";

interface RevenueTabProps {
  roster: RosterTalent[];
  transactions: BrandCommissionTransaction[];
  loading?: boolean;
  formatVND: (n: number) => string;
}

type RevenueRow = {
  label: string;
  sublabel: string;
  value: number;
  barWidth: number;
  color: string;
  textColor: string;
  icon: typeof Briefcase;
};

function toDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isInTimeframe(date: Date | null, timeframe: Timeframe) {
  if (!date) return false;

  const now = new Date();
  if (timeframe === "year") {
    return date.getFullYear() === now.getFullYear();
  }

  if (timeframe === "quarter") {
    const nowQuarter = Math.floor(now.getMonth() / 3);
    const dateQuarter = Math.floor(date.getMonth() / 3);
    return date.getFullYear() === now.getFullYear() && dateQuarter === nowQuarter;
  }

  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function timeframeLabel(timeframe: Timeframe) {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  if (timeframe === "year") return `Năm ${year}`;
  if (timeframe === "quarter") return `Quý ${Math.floor(now.getMonth() / 3) + 1}/${year}`;
  return `Tháng ${month}/${year}`;
}

function formatDate(value?: string | null) {
  const date = toDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function statusLabel(status: BrandCommissionTransaction["status"]) {
  if (status === "approved") return "Đã duyệt";
  if (status === "cancelled") return "Đã hủy";
  return "Chờ duyệt";
}

function statusClass(status: BrandCommissionTransaction["status"]) {
  if (status === "approved") return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
  if (status === "cancelled") return "bg-rose-500/10 border-rose-500/20 text-rose-300";
  return "bg-amber-500/10 border-amber-500/20 text-amber-400";
}

function sourceLabel(sourceType: BrandCommissionTransaction["source_type"]) {
  if (sourceType === "campaign_payout") return "Chia tiền campaign";
  if (sourceType === "referral") return "Giới thiệu campaign";
  if (sourceType === "roster_management") return "Quản lý talent";
  return "Khác";
}

export default function RevenueTab({
  roster,
  transactions,
  loading = false,
  formatVND,
}: RevenueTabProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("month");
  const acceptedRoster = roster.filter((item) => item.status === "accepted");

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        isInTimeframe(toDate(transaction.calculated_at), timeframe),
      ),
    [timeframe, transactions],
  );

  const totals = useMemo(() => {
    const activeTransactions = filteredTransactions.filter((item) => item.status !== "cancelled");
    const approvedTransactions = filteredTransactions.filter((item) => item.status === "approved");

    const campaignRevenue = activeTransactions
      .filter((item) => item.source_type === "campaign_payout")
      .reduce((sum, item) => sum + item.amount, 0);

    const referralRevenue = activeTransactions
      .filter((item) => item.source_type === "referral")
      .reduce((sum, item) => sum + item.amount, 0);

    const rosterRevenue = activeTransactions
      .filter((item) => item.source_type === "roster_management")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalRevenue = campaignRevenue + referralRevenue + rosterRevenue;
    const availableBalance = approvedTransactions.reduce((sum, item) => sum + item.amount, 0);
    const pendingRevenue = activeTransactions
      .filter((item) => item.status === "pending")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      campaignRevenue,
      referralRevenue,
      rosterRevenue,
      totalRevenue,
      availableBalance,
      pendingRevenue,
    };
  }, [filteredTransactions]);

  const revenueRows: RevenueRow[] = [
    {
      label: "Chia tiền campaign",
      sublabel: "Phần Brand nhận trực tiếp từ cấu hình chia tiền campaign.",
      value: totals.campaignRevenue,
      barWidth: totals.totalRevenue ? Math.round((totals.campaignRevenue / totals.totalRevenue) * 100) : 0,
      color: "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
      textColor: "text-amber-400",
      icon: Briefcase,
    },
    {
      label: "Hoa hồng giới thiệu campaign",
      sublabel: "Khoản nhận khi Brand nằm trong chuỗi giới thiệu của talent tham gia campaign.",
      value: totals.referralRevenue,
      barWidth: totals.totalRevenue ? Math.round((totals.referralRevenue / totals.totalRevenue) * 100) : 0,
      color: "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]",
      textColor: "text-cyan-300",
      icon: Network,
    },
    {
      label: "Hoa hồng quản lý talent",
      sublabel: `Khoản Brand quản lý nhận từ ${acceptedRoster.length} talent đang hoạt động trong roster.`,
      value: totals.rosterRevenue,
      barWidth: totals.totalRevenue ? Math.round((totals.rosterRevenue / totals.totalRevenue) * 100) : 0,
      color: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]",
      textColor: "text-emerald-300",
      icon: Users2,
    },
  ];

  const latestTransactions = [...filteredTransactions]
    .sort((a, b) => (toDate(b.calculated_at)?.getTime() || 0) - (toDate(a.calculated_at)?.getTime() || 0))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="inline-flex rounded-xl p-0.5 border border-[#151b2d] bg-[#050711]">
          {(["month", "quarter", "year"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setTimeframe(item)}
              className={cn(
                "rounded-lg px-4.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                timeframe === item
                  ? "bg-gradient-to-r from-amber-400/20 to-yellow-600/10 text-amber-300 border border-amber-500/20"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {item === "month" ? "Tháng này" : item === "quarter" ? "Quý này" : "Năm nay"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-[#08090f] border border-[#151b2d] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-amber-400" /> Báo cáo doanh thu ({timeframeLabel(timeframe)})
              </h2>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-white/5 border border-white/5 rounded-md px-2 py-0.5">
                {loading ? "Đang tải" : "Dữ liệu thực"}
              </span>
            </div>

            {loading ? (
              <div className="rounded-xl border border-[#151b2d] bg-[#050711]/45 px-4 py-10 text-center text-xs font-semibold text-slate-500">
                Đang tổng hợp giao dịch doanh thu từ các campaign...
              </div>
            ) : revenueRows.every((row) => row.value === 0) ? (
              <div className="rounded-xl border border-dashed border-[#2a3349] bg-[#050711]/45 px-4 py-10 text-center text-xs font-semibold text-slate-500">
                Chưa có giao dịch doanh thu phù hợp trong khoảng thời gian này.
              </div>
            ) : (
              <div className="space-y-5">
                {revenueRows.map((row) => (
                  <div key={row.label} className="bg-[#050711]/45 p-4 rounded-xl border border-[#151b2d]/60 hover:border-amber-500/20 transition-colors">
                    <div className="flex items-start justify-between mb-2 gap-4">
                      <div className="flex items-start gap-2.5">
                        <div className={cn("p-1.5 rounded-lg border border-white/5 bg-[#08090f] mt-0.5", row.textColor)}>
                          <row.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-wider">{row.label}</p>
                          <p className="text-[9.5px] text-slate-500 font-semibold mt-0.5">{row.sublabel}</p>
                        </div>
                      </div>
                      <span className={cn("text-base font-black font-mono tracking-tight", row.textColor)}>
                        {formatVND(row.value)}
                      </span>
                    </div>
                    <div className="h-2 bg-[#151b2d] rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-1000", row.color)}
                        style={{ width: `${row.barWidth}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-[#151b2d] flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Tổng doanh thu ghi nhận</span>
                  <span className="text-2xl font-black text-white font-mono tracking-tighter bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
                    {formatVND(totals.totalRevenue)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-[#08090f] border border-[#151b2d] p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-amber-400" /> Lịch sử ghi nhận doanh thu
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[#151b2d] bg-[#050711]/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#151b2d] bg-slate-950/45 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-3.5">Mã giao dịch</th>
                    <th className="p-3.5">Campaign</th>
                    <th className="p-3.5">Nguồn thu</th>
                    <th className="p-3.5">Ngày ghi nhận</th>
                    <th className="p-3.5 text-right">Số tiền</th>
                    <th className="p-3.5 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 font-semibold">
                        Đang tải dữ liệu giao dịch...
                      </td>
                    </tr>
                  ) : latestTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 font-semibold">
                        Chưa có giao dịch doanh thu trong khoảng thời gian này.
                      </td>
                    </tr>
                  ) : (
                    latestTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-[#151b2d] hover:bg-white/[0.01] transition-colors">
                        <td className="p-3.5 font-mono text-slate-400 font-semibold">TX-{transaction.id}</td>
                        <td className="p-3.5 text-slate-300 font-medium">{transaction.campaign?.title || "-"}</td>
                        <td className="p-3.5 text-slate-400">{sourceLabel(transaction.source_type)}</td>
                        <td className="p-3.5 text-slate-400">{formatDate(transaction.calculated_at)}</td>
                        <td className="p-3.5 text-right font-mono font-black text-white">{formatVND(transaction.amount)}</td>
                        <td className="p-3.5 text-center">
                          <span className={cn("inline-block rounded border px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wide", statusClass(transaction.status))}>
                            {statusLabel(transaction.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <Wallet className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Số dư khả dụng</p>
                <p className="text-xl font-black text-amber-400 font-mono tracking-tight mt-0.5">
                  {formatVND(totals.availableBalance)}
                </p>
              </div>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:brightness-105 cursor-pointer active:scale-[0.98] transition-all duration-300">
              <ArrowUpRight className="h-4 w-4" /> Rút tiền về ví
            </button>
          </div>

          <div className="rounded-2xl bg-[#08090f] border border-[#151b2d] p-6 space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tổng quan nhanh</h3>
            <div className="flex items-center justify-between rounded-xl border border-[#151b2d] bg-[#050711]/45 px-4 py-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Chờ duyệt</span>
              <span className="font-mono text-sm font-black text-amber-300">{formatVND(totals.pendingRevenue)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#151b2d] bg-[#050711]/45 px-4 py-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Campaign có doanh thu</span>
              <span className="font-mono text-sm font-black text-white">
                {new Set(filteredTransactions.map((transaction) => transaction.campaign_id).filter(Boolean)).size}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#151b2d] bg-[#050711]/45 px-4 py-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Talent roster hoạt động</span>
              <span className="font-mono text-sm font-black text-white">{acceptedRoster.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
