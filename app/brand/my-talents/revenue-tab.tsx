"use client";

import React, { useState } from "react";
import {
  BarChart3, Users2, Network, Wallet, ArrowUpRight,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RosterTalent } from "./roster-tab";

interface RevenueTabProps {
  roster: RosterTalent[];
  totalF1Commission: number;
  passiveMLM: number;
  totalRevenue: number;
  formatVND: (n: number) => string;
}

export default function RevenueTab({
  roster,
  totalF1Commission,
  passiveMLM,
  totalRevenue,
  formatVND,
}: RevenueTabProps) {
  const [timeframe, setTimeframe] = useState<"month" | "quarter" | "year">("month");

  const acceptedRoster = roster.filter((r) => r.status === "accepted");

  // Multipliers for Quarter & Year stats
  const multiplier = timeframe === "month" ? 1 : timeframe === "quarter" ? 3.2 : 12.5;

  const displayF1Commission = totalF1Commission * multiplier;
  const displayPassiveMLM = passiveMLM * multiplier;
  const displayTotalRevenue = displayF1Commission + displayPassiveMLM;

  return (
    <div className="space-y-6">
      {/* ── Timeframe Selector ── */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-xl p-0.5 border border-[#151b2d] bg-[#050711]">
          {(["month", "quarter", "year"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={cn(
                "rounded-lg px-4.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                timeframe === t
                  ? "bg-gradient-to-r from-amber-400/20 to-yellow-600/10 text-amber-300 border border-amber-500/20"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {t === "month" ? "Tháng này" : t === "quarter" ? "Quý này" : "Năm nay"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left side: Revenue Chart & Payouts (Span 2) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Breakdown */}
          <div className="rounded-2xl bg-[#08090f] border border-[#151b2d] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-amber-400" /> Báo cáo doanh thu ({timeframe === "month" ? "Tháng 06/2026" : timeframe === "quarter" ? "Quý 2/2026" : "Năm 2026"})
              </h2>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-white/5 border border-white/5 rounded-md px-2 py-0.5">
                Đã cập nhật: Vừa xong
              </span>
            </div>

            <div className="space-y-5">
              {[
                {
                  label: "Hoa hồng F1 (Talent hợp tác)",
                  sublabel: `Nhận 10% từ các booking của ${acceptedRoster.length} Talent hợp tác`,
                  value: displayF1Commission,
                  barWidth: Math.round((displayF1Commission / displayTotalRevenue) * 100) || 0,
                  color: "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
                  textColor: "text-amber-400",
                  icon: Users2,
                },
                {
                  label: "Hoa hồng thụ động (MLM)",
                  sublabel: "F2 nhận hoa hồng 5% từ tuyến dưới của Talent trong mạng lưới của Brand",
                  value: displayPassiveMLM,
                  barWidth: Math.round((displayPassiveMLM / displayTotalRevenue) * 100) || 0,
                  color: "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.3)]",
                  textColor: "text-amber-300",
                  icon: Network,
                },
              ].map((row) => (
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
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Tổng thu nhập dự kiến</span>
                <span className="text-2xl font-black text-white font-mono tracking-tighter bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
                  {formatVND(displayTotalRevenue)}
                </span>
              </div>
            </div>
          </div>

          {/* Payout History */}
          <div className="rounded-2xl bg-[#08090f] border border-[#151b2d] p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-amber-400" /> Lịch sử rút tiền & thanh toán
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[#151b2d] bg-[#050711]/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#151b2d] bg-slate-950/45 text-[9px] font-bold uppercase tracking-wider text-slate-450">
                    <th className="p-3.5">Mã giao dịch</th>
                    <th className="p-3.5">Ngày yêu cầu</th>
                    <th className="p-3.5">Hình thức</th>
                    <th className="p-3.5 text-right">Số tiền</th>
                    <th className="p-3.5 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: "TX-9210", date: "2026-06-02", method: "Chuyển khoản (Techcombank)", amount: 8400000, status: "Thành công" },
                    { id: "TX-8823", date: "2026-05-15", method: "Chuyển khoản (Techcombank)", amount: 16900000, status: "Thành công" },
                    { id: "TX-7241", date: "2026-04-18", method: "Rút về ví OnStage", amount: 5300000, status: "Thành công" },
                  ].map((payout) => (
                    <tr key={payout.id} className="border-b border-[#151b2d] hover:bg-white/[0.01] transition-colors">
                      <td className="p-3.5 font-mono text-slate-400 font-semibold">{payout.id}</td>
                      <td className="p-3.5 text-slate-350">{payout.date}</td>
                      <td className="p-3.5 text-slate-400 font-medium">{payout.method}</td>
                      <td className="p-3.5 text-right font-mono font-black text-white">{formatVND(payout.amount)}</td>
                      <td className="p-3.5 text-center">
                        <span className="inline-block rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8.5px] font-bold text-amber-400 uppercase tracking-wide">
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Right side: Payout CTA ── */}
        <div className="space-y-6">
          {/* Payout CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <Wallet className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Số dư khả dụng </p>
                <p className="text-xl font-black text-amber-400 font-mono tracking-tight mt-0.5">
                  {formatVND(Math.round(displayTotalRevenue * 0.72))}
                </p>
              </div>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:brightness-105 cursor-pointer active:scale-[0.98] transition-all duration-300">
              <ArrowUpRight className="h-4 w-4" /> Rút tiền về ví
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
