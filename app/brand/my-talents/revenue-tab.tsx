"use client";

import React, { useState } from "react";
import {
  BarChart3, Users2, Link2, Network, Wallet, ArrowUpRight, Check, Copy, Sparkles,
  Calendar, QrCode, GitMerge
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RosterTalent } from "./roster-tab";

interface RevenueTabProps {
  roster: RosterTalent[];
  totalF1Commission: number;
  affiliateBrandBonus: number;
  passiveMLM: number;
  totalRevenue: number;
  affiliateLink: string;
  copiedLink: boolean;
  handleCopyLink: () => void;
  formatVND: (n: number) => string;
}

export default function RevenueTab({
  roster,
  totalF1Commission,
  affiliateBrandBonus,
  passiveMLM,
  totalRevenue,
  affiliateLink,
  copiedLink,
  handleCopyLink,
  formatVND,
}: RevenueTabProps) {
  const [timeframe, setTimeframe] = useState<"month" | "quarter" | "year">("month");
  const [showQR, setShowQR] = useState(false);

  const acceptedRoster = roster.filter((r) => r.status === "accepted");

  // Multipliers for Quarter & Year stats
  const multiplier = timeframe === "month" ? 1 : timeframe === "quarter" ? 3.2 : 12.5;

  const displayF1Commission = totalF1Commission * multiplier;
  const displayBrandBonus = affiliateBrandBonus * multiplier;
  const displayPassiveMLM = passiveMLM * multiplier;
  const displayTotalRevenue = displayF1Commission + displayBrandBonus + displayPassiveMLM;

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
                  label: "Hoa hồng F1 (Roster Jobs)",
                  sublabel: `Nhận 10% từ các booking của ${acceptedRoster.length} Talent trong Roster`,
                  value: displayF1Commission,
                  barWidth: Math.round((displayF1Commission / displayTotalRevenue) * 100) || 0,
                  color: "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
                  textColor: "text-amber-400",
                  icon: Users2,
                },
                {
                  label: "Affiliate (Brand Referral)",
                  sublabel: "Hoa hồng giới thiệu các đối tác thương hiệu mới đăng ký",
                  value: displayBrandBonus,
                  barWidth: Math.round((displayBrandBonus / displayTotalRevenue) * 100) || 0,
                  color: "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]",
                  textColor: "text-yellow-400",
                  icon: Link2,
                },
                {
                  label: "Hoa hồng thụ động (MLM)",
                  sublabel: "F2 nhận hoa hồng 5% từ tuyến dưới của Talent trong Roster của bạn",
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

        {/* ── Right side: Affiliate Link, QR Code ── */}
        <div className="space-y-6">
          {/* Payout CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <Wallet className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Số dư khả dụng rút</p>
                <p className="text-xl font-black text-amber-400 font-mono tracking-tight mt-0.5">
                  {formatVND(Math.round(displayTotalRevenue * 0.72))}
                </p>
              </div>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:brightness-105 cursor-pointer active:scale-[0.98] transition-all duration-300">
              <ArrowUpRight className="h-4 w-4" /> Rút tiền về ví
            </button>
          </div>

          {/* Affiliate Link & QR Code display */}
          <div className="rounded-2xl bg-[#08090f] border border-[#151b2d] p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-yellow-600/10 border border-amber-500/20">
                <Link2 className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">Affiliate Link</h2>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Mời đối tác mới đăng ký — nhận hoa hồng MLM</p>
              </div>
            </div>

            {/* Link Copy */}
            <div className="flex items-center gap-2 rounded-xl bg-[#050711] border border-[#151b2d] p-3">
              <Link2 className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="flex-1 text-[11px] font-mono text-slate-400 truncate">{affiliateLink}</span>
              <button
                onClick={handleCopyLink}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border shrink-0",
                  copiedLink
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40"
                )}
              >
                {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedLink ? "Đã chép" : "Copy"}
              </button>
            </div>

            {/* Offline QR Code Trigger */}
            <div className="pt-2 border-t border-[#151b2d]/50">
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex w-full items-center justify-between rounded-xl bg-[#050711] border border-[#151b2d] px-4 py-3 hover:border-amber-500/30 transition-all"
              >
                <span className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  <QrCode className="h-4 w-4 text-amber-400" />
                  QR Code
                </span>
                <span className="text-[9px] font-black text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/15">
                  {showQR ? "ẨN" : "XEM"}
                </span>
              </button>

              {/* QR Code Container */}
              {showQR && (
                <div className="mt-4 flex flex-col items-center justify-center p-5 bg-[#050711] border border-amber-500/10 rounded-2xl animate-in slide-in-from-top-3 duration-300">
                  <div className="bg-white p-3.5 rounded-xl border border-white shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    <svg width="120" height="120" viewBox="0 0 100 100" className="text-slate-950">
                      <rect width="100" height="100" fill="white" />
                      <rect x="5" y="5" width="25" height="25" fill="black" />
                      <rect x="10" y="10" width="15" height="15" fill="white" />
                      <rect x="13" y="13" width="9" height="9" fill="black" />
                      <rect x="70" y="5" width="25" height="25" fill="black" />
                      <rect x="75" y="10" width="15" height="15" fill="white" />
                      <rect x="78" y="13" width="9" height="9" fill="black" />
                      <rect x="5" y="70" width="25" height="25" fill="black" />
                      <rect x="10" y="75" width="15" height="15" fill="white" />
                      <rect x="13" y="78" width="9" height="9" fill="black" />
                      <rect x="75" y="75" width="10" height="10" fill="black" />
                      <rect x="77" y="77" width="6" height="6" fill="white" />
                      <rect x="79" y="79" width="2" height="2" fill="black" />
                      <rect x="35" y="10" width="5" height="5" fill="black" /><rect x="45" y="5" width="10" height="5" fill="black" />
                      <rect x="40" y="15" width="5" height="5" fill="black" /><rect x="55" y="10" width="5" height="10" fill="black" />
                      <rect x="35" y="30" width="15" height="5" fill="black" /><rect x="60" y="25" width="5" height="15" fill="black" />
                      <rect x="10" y="35" width="5" height="15" fill="black" /><rect x="25" y="45" width="5" height="5" fill="black" />
                      <rect x="40" y="50" width="10" height="10" fill="black" /><rect x="55" y="45" width="15" height="5" fill="black" />
                      <rect x="15" y="60" width="10" height="5" fill="black" /><rect x="30" y="65" width="5" height="10" fill="black" />
                      <rect x="70" y="40" width="10" height="15" fill="black" /><rect x="85" y="50" width="10" height="5" fill="black" />
                      <rect x="45" y="70" width="5" height="20" fill="black" /><rect x="55" y="80" width="15" height="10" fill="black" />
                      <rect x="60" y="70" width="10" height="5" fill="black" /><rect x="35" y="80" width="5" height="5" fill="black" />
                    </svg>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-3 font-semibold text-center uppercase tracking-wider">
                    Quét mã giới thiệu đại diện
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Network Tree (Sơ đồ mạng lưới MLM) ── */}
      <div className="rounded-2xl bg-[#08090f] border border-[#151b2d] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <GitMerge className="h-4.5 w-4.5 text-amber-400" /> Sơ đồ mạng lưới liên kết (Network Tree)
            </h2>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">Mạng lưới kết nối trực tiếp F1 & gián tiếp F2</p>
          </div>
          <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            F1: 10% | F2: 5%
          </span>
        </div>

        {/* Tree visual diagram block - 100% Responsive HTML/CSS */}
        <div className="p-6 bg-[#050711]/60 border border-[#151b2d] rounded-2xl overflow-x-auto">
          <div className="min-w-[650px] flex flex-col items-center">

            {/* Level 0: You (Manager) */}
            <div className="flex flex-col items-center">
              <div className="relative rounded-2xl bg-gradient-to-r from-amber-450 to-yellow-500 p-[1.5px] shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                <div className="rounded-[14px] bg-[#050711] px-5 py-3 text-center min-w-[150px]">
                  <span className="rounded bg-amber-450/15 border border-amber-400/30 px-2 py-0.5 text-[8px] font-black uppercase text-amber-300 tracking-wider">
                    Bạn (Manager F1)
                  </span>
                  <p className="text-xs font-black text-white mt-1.5">L'Oréal Vietnam</p>
                  <p className="text-[10px] text-amber-400 font-mono font-black mt-1">{formatVND(displayTotalRevenue)}</p>
                </div>
              </div>

              {/* Vertical line going down from Parent */}
              <div className="h-6 w-0.5 bg-amber-500/40" />
            </div>

            {/* Level 1: Horizontal Connector Bar using absolute borders */}
            <div className="w-full flex relative h-[1px]">
              {/* Left half of first card to center */}
              <div className="w-1/3 relative">
                <div className="absolute top-0 right-0 left-1/2 border-t border-amber-500/40" />
              </div>
              {/* Center card span */}
              <div className="w-1/3 relative">
                <div className="absolute top-0 left-0 right-0 border-t border-amber-500/40" />
              </div>
              {/* Center to right half of last card */}
              <div className="w-1/3 relative">
                <div className="absolute top-0 left-0 right-1/2 border-t border-amber-500/40" />
              </div>
            </div>

            {/* Level 1: F1 Talents */}
            <div className="grid grid-cols-3 gap-6 w-full text-center">

              {/* Node F1.1: Nguyễn Mai Anh */}
              <div className="flex flex-col items-center">
                {/* Vertical line down from horizontal connector */}
                <div className="h-6 w-0.5 bg-amber-500/40" />

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 min-w-[140px] text-center hover:border-amber-500/50 hover:bg-amber-500/10 transition-all shadow-[0_4px_12px_rgba(245,158,11,0.03)]">
                  <span className="block text-[8px] font-black text-amber-400 uppercase tracking-widest">KOL F1</span>
                  <span className="text-xs font-bold text-white block mt-1">Nguyễn Mai Anh</span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold mt-1 block">Đã nhận: 2.4Mđ</span>
                </div>

                {/* Vertical line down to F2 */}
                <div className="h-6 w-0.5 bg-amber-500/30" />

                {/* Level 2: Horizontal Connector Bar for F2 */}
                <div className="w-full flex relative h-[1px]">
                  <div className="w-1/2 relative">
                    <div className="absolute top-0 right-0 left-1/2 border-t border-amber-500/30" />
                  </div>
                  <div className="w-1/2 relative">
                    <div className="absolute top-0 left-0 right-1/2 border-t border-amber-500/30" />
                  </div>
                </div>

                {/* Level 2 children nodes */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-0.5 bg-amber-500/30" />
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-center min-w-[85px] hover:border-amber-500/40 transition-colors">
                      <span className="text-[9px] text-amber-300 font-black block">Lê Mai (F2)</span>
                      <span className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-wider block mt-0.5">5% MLM</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-4 w-0.5 bg-amber-500/30" />
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-center min-w-[85px] hover:border-amber-500/40 transition-colors">
                      <span className="text-[9px] text-amber-300 font-black block">Hoàng Nam (F2)</span>
                      <span className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-wider block mt-0.5">5% MLM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Node F1.2: Khánh Linh */}
              <div className="flex flex-col items-center">
                {/* Vertical line down from horizontal connector */}
                <div className="h-6 w-0.5 bg-amber-500/40" />

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 min-w-[140px] text-center hover:border-amber-500/50 hover:bg-amber-500/10 transition-all shadow-[0_4px_12px_rgba(245,158,11,0.03)]">
                  <span className="block text-[8px] font-black text-amber-400 uppercase tracking-widest">KOL F1</span>
                  <span className="text-xs font-bold text-white block mt-1">Khánh Linh</span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold mt-1 block">Đã nhận: 1.8Mđ</span>
                </div>

                {/* Vertical line down to F2 (Single child) */}
                <div className="h-6 w-0.5 bg-amber-500/30" />

                <div className="flex flex-col items-center">
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-center min-w-[90px] hover:border-amber-500/40 transition-colors">
                    <span className="text-[9px] text-amber-300 font-black block">Trần Tiến (F2)</span>
                    <span className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-wider block mt-0.5">5% MLM</span>
                  </div>
                </div>
              </div>

              {/* Node F1.3: Bảo Nguyễn */}
              <div className="flex flex-col items-center">
                {/* Vertical line down from horizontal connector */}
                <div className="h-6 w-0.5 bg-amber-500/40" />

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 min-w-[140px] text-center hover:border-amber-500/50 hover:bg-amber-500/10 transition-all shadow-[0_4px_12px_rgba(245,158,11,0.03)]">
                  <span className="block text-[8px] font-black text-amber-400 uppercase tracking-widest">KOL F1</span>
                  <span className="text-xs font-bold text-white block mt-1">Bảo Nguyễn</span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold mt-1 block">Đã nhận: 950Kđ</span>
                </div>

                {/* Vertical line down to F2 (Single child) */}
                <div className="h-6 w-0.5 bg-amber-500/30" />

                <div className="flex flex-col items-center">
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-center min-w-[90px] hover:border-amber-500/40 transition-colors">
                    <span className="text-[9px] text-amber-300 font-black block">Kiều Anh (F2)</span>
                    <span className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-wider block mt-0.5">5% MLM</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Commission Model Info Card ── */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300" /> Mô hình phân phối dòng tiền hoa hồng
        </h3>
        <div className="grid grid-cols-4 gap-3 text-center">
          {[
            { label: "Platform", pct: "15%", desc: "Phí vận hành hệ thống & ký quỹ bảo chứng", color: "text-slate-400" },
            { label: "KOL (F0)", pct: "75%", desc: "Nhận thù lao booking trực tiếp", color: "text-emerald-400" },
            { label: "Manager (F1)", pct: "10%", desc: "Hoa hồng quản lý & chiết khấu", color: "text-amber-400" },
            { label: "Upline (F2)", pct: "5%", desc: "Hoa hồng thụ động tuyến trên giới thiệu", color: "text-amber-300" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-[#050711]/90 border border-amber-500/10 p-3.5 hover:border-amber-500/30 transition-colors">
              <p className={cn("text-2xl font-black font-mono", item.color)}>{item.pct}</p>
              <p className="text-[10px] text-white font-bold mt-1 uppercase tracking-wider">{item.label}</p>
              <p className="text-[8.5px] text-slate-500 mt-0.5 leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-4 text-center font-bold uppercase tracking-wider bg-[#050711]/60 py-2.5 rounded-lg border border-[#151b2d]">
          Ví dụ: Booking thù lao 10.000.000đ → Bạn nhận <span className="text-amber-400 font-black font-mono">1.000.000đ</span> (10% F1) → Upline của bạn nhận <span className="text-amber-400 font-black font-mono">500.000đ</span> (5% F2)
        </p>
      </div>
    </div>
  );
}
