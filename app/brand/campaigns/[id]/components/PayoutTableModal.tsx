"use client";

import React from "react";
import { X } from "lucide-react";
import { talents } from "@/lib/brand-mvp-data";
import { type BrandCommissionTransaction } from "@/lib/brand-api";

interface PayoutTableModalProps {
  selectedCampaign: any;
  displayTalents: any[];
  commissionData: any;
  isCommissionLoading: boolean;
  onClose: () => void;
  onConfirmDisbursement: (totalBudget: number) => void;
}

const DEFAULT_PLATFORM_FEE_RATE = 5;

function moneyText(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")} VND`;
}

function transactionRole(transaction: BrandCommissionTransaction) {
  if (transaction.source_type === "campaign_payout") {
    if (transaction.level === 1) return "Brand tổ chức";
    return `Talent thực hiện${transaction.metadata?.eligible_talent_count ? ` (${transaction.metadata.eligible_talent_count} talent)` : ""}`;
  }

  if (transaction.source_type === "roster_management") return "Brand quản lý talent";

  return `F${transaction.level}`;
}

function transactionRelatedTalent(transaction: BrandCommissionTransaction, displayTalents: any[]) {
  return transaction.talent?.name
    || transaction.campaign_talent?.profile?.display_name
    || transaction.campaign_talent?.profile?.full_name
    || transaction.campaign_talent?.profile?.user?.name
    || "-";
}

function transactionRow(transaction: BrandCommissionTransaction, displayTalents: any[]) {
  return {
    role: transactionRole(transaction),
    recipient: transaction.receiver?.name || "-",
    relatedTalent: transactionRelatedTalent(transaction, displayTalents),
    base: Number(transaction.base_amount) || 0,
    rate: Number(transaction.rate) || 0,
    amount: Number(transaction.amount) || 0,
    status: transaction.status === "approved" ? "Đã duyệt" : transaction.status === "cancelled" ? "Đã hủy" : "Chờ duyệt",
  };
}

export default function PayoutTableModal({
  selectedCampaign,
  displayTalents,
  commissionData,
  isCommissionLoading,
  onClose,
  onConfirmDisbursement,
}: PayoutTableModalProps) {
  const totalBudget = selectedCampaign.budgetValue || 20000000;

  // Get active applicants
  const activeApplicants = selectedCampaign.applicants.filter(
    (a: any) => a.stage === "accepted" || a.stage === "executing" || a.stage === "completed" || a.stage === "confirmed"
  );

  // Map display applicants
  const displayApplicants = activeApplicants.length > 0 ? activeApplicants.map((a: any) => ({
    talentId: a.talentId,
    referredByTalentId: a.referredByTalentId
  })) : [
    { talentId: "tal-1", referredByTalentId: undefined },
    { talentId: "tal-4", referredByTalentId: "tal-1" },
    { talentId: "tal-5", referredByTalentId: "tal-3" }
  ];

  const N = displayApplicants.length;
  const poolPerTalent = totalBudget / N;

  let campaignRows: any[] = [];
  let referralRows: any[] = [];
  let rosterRows: any[] = [];

  displayApplicants.forEach((appl: any) => {
    const talent = displayTalents.find(t => t.id === appl.talentId) || talents.find(t => t.id === appl.talentId) || { name: appl.talentId };
    const hasReferrer = !!appl.referredByTalentId;
    const referrer = hasReferrer ? (displayTalents.find(t => t.id === appl.referredByTalentId) || talents.find(t => t.id === appl.referredByTalentId)) : null;

    if (hasReferrer && referrer) {
      // Referred candidate
      campaignRows.push({
        role: "Người thực hiện qua giới thiệu - 70%",
        recipient: talent.name,
        relatedTalent: talent.name,
        base: poolPerTalent,
        rate: 70,
        amount: poolPerTalent * 0.7,
        status: "Chờ duyệt"
      });
      campaignRows.push({
        role: "Chủ campaign - 10%",
        recipient: "Nguyễn Ngọc Anh",
        relatedTalent: talent.name,
        base: poolPerTalent,
        rate: 10,
        amount: poolPerTalent * 0.1,
        status: "Chờ duyệt"
      });
      referralRows.push({
        role: "Người giới thiệu campaign - 5%",
        recipient: referrer.name,
        relatedTalent: talent.name,
        base: poolPerTalent,
        rate: 5,
        amount: poolPerTalent * 0.05,
        status: "Chờ duyệt"
      });
    } else {
      // Direct candidate
      campaignRows.push({
        role: "Người thực hiện trực tiếp - 75%",
        recipient: talent.name,
        relatedTalent: talent.name,
        base: poolPerTalent,
        rate: 75,
        amount: poolPerTalent * 0.75,
        status: "Chờ duyệt"
      });
      campaignRows.push({
        role: "Chủ campaign - 10%",
        recipient: "Nguyễn Ngọc Anh",
        relatedTalent: talent.name,
        base: poolPerTalent,
        rate: 10,
        amount: poolPerTalent * 0.1,
        status: "Chờ duyệt"
      });
    }
  });

  if (commissionData?.data?.length) {
    campaignRows = commissionData.data
      .filter((transaction: any) => transaction.source_type === "campaign_payout")
      .map((t: any) => transactionRow(t, displayTalents));
    referralRows = commissionData.data
      .filter((transaction: any) => transaction.source_type === "referral")
      .map((t: any) => transactionRow(t, displayTalents));
    rosterRows = commissionData.data
      .filter((transaction: any) => transaction.source_type === "roster_management")
      .map((t: any) => transactionRow(t, displayTalents));
  }

  const allRows = [...campaignRows, ...referralRows, ...rosterRows];
  const totalCalculatedPayout = commissionData?.data?.length
    ? commissionData.summary.total
    : allRows.reduce((sum, r) => sum + r.amount, 0);
  const pendingPayout = commissionData?.data?.length
    ? commissionData.summary.pending
    : totalCalculatedPayout;
  const shouldShowPlatformFee = Boolean(commissionData);
  const platformFee = commissionData?.platform_fee;
  const platformFeeRate = Number(platformFee?.rate || DEFAULT_PLATFORM_FEE_RATE);
  const platformFeeBaseAmount = Number(platformFee?.base_amount || totalBudget);
  const platformFeeAmount = Number(platformFee?.amount || Math.round(platformFeeBaseAmount * (platformFeeRate / 100)));
  const brandTotalPayable = Number(platformFee?.brand_total_payable || totalBudget + platformFeeAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300 text-left">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#151b2d] bg-slate-950/45">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Đối soát & Chia tiền campaign</h3>
            <p className="text-[10px] text-slate-500 mt-1">Thông tin giải ngân dòng tiền cho đại diện Brand, KOCs và Uplines theo phân bổ MLM</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Summary Stats Row */}
          <div className="space-y-6">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-[#0F1115]/60 border border-white/5 rounded-2xl p-5">
              <div>
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Campaign</span>
                <span className="text-xs font-black text-white mt-1 block truncate">{selectedCampaign.title}</span>
              </div>
              <div className="border-t border-white/5 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Brand</span>
                <span className="text-xs font-black text-white mt-1 block">Nguyễn Ngọc Anh</span>
              </div>
              <div className="border-t border-white/5 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Số dòng</span>
                <span className="text-xs font-black text-white mt-1 block font-mono">{allRows.length}</span>
              </div>
              <div className="border-t border-white/5 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Tổng tiền</span>
                <span className="text-xs font-black text-emerald-400 mt-1 block font-mono">
                  {Math.round(totalCalculatedPayout).toLocaleString("vi-VN")} VND
                </span>
              </div>
              <div className="border-t border-white/5 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Chờ duyệt</span>
                <span className="text-xs font-black text-amber-400 mt-1 block font-mono">
                  {Math.round(pendingPayout).toLocaleString("vi-VN")} VND
                </span>
              </div>
            </div>

            {shouldShowPlatformFee && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0F1115]/60 border border-white/5 rounded-2xl p-5">
                <div>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Phí sàn brand</span>
                  <span className="text-xs font-black text-violet-300 mt-1 block font-mono">
                    {Math.round(platformFeeAmount).toLocaleString("vi-VN")} VND
                  </span>
                </div>
                <div className="border-t border-white/5 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ phí sàn</span>
                  <span className="text-xs font-black text-white mt-1 block font-mono">{platformFeeRate}%</span>
                </div>
                <div className="border-t border-white/5 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Brand cần thanh toán</span>
                  <span className="text-xs font-black text-emerald-400 mt-1 block font-mono">
                    {Math.round(brandTotalPayable).toLocaleString("vi-VN")} VND
                  </span>
                </div>
              </div>
            )}

            {/* Table 1: Chia tiền campaign */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Chia tiền campaign
              </h4>
              <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0F1115]/30">
                <table className="w-full text-left text-xs border-collapse font-medium">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-950/45 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="p-3">Vai trò/F</th>
                      <th className="p-3">Người nhận</th>
                      <th className="p-3">Talent liên quan</th>
                      <th className="p-3">Cơ sở tính</th>
                      <th className="p-3 text-center">Tỷ lệ</th>
                      <th className="p-3 text-right">Số tiền</th>
                      <th className="p-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignRows.map((row, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-semibold text-slate-300">{row.role}</td>
                        <td className="p-3 font-bold text-white">{row.recipient}</td>
                        <td className="p-3 text-slate-400">{row.relatedTalent}</td>
                        <td className="p-3 font-mono text-slate-400">{Math.round(row.base).toLocaleString("vi-VN")} VND</td>
                        <td className="p-3 text-center font-bold text-[#C9A86A]">{row.rate}%</td>
                        <td className="p-3 text-right font-mono font-black text-white">{Math.round(row.amount).toLocaleString("vi-VN")} VND</td>
                        <td className="p-3 text-center">
                          <span className="inline-block rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8.5px] font-bold text-amber-400 uppercase tracking-wide">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Giới thiệu */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Giới thiệu
              </h4>
              <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0F1115]/30">
                <table className="w-full text-left text-xs border-collapse font-medium">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-950/45 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="p-3">Vai trò/F</th>
                      <th className="p-3">Người nhận</th>
                      <th className="p-3">Talent liên quan</th>
                      <th className="p-3">Cơ sở tính</th>
                      <th className="p-3 text-center">Tỷ lệ</th>
                      <th className="p-3 text-right">Số tiền</th>
                      <th className="p-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralRows.map((row, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-semibold text-cyan-400 font-mono">{row.role}</td>
                        <td className="p-3 font-bold text-white">{row.recipient}</td>
                        <td className="p-3 text-slate-400">{row.relatedTalent}</td>
                        <td className="p-3 font-mono text-slate-400">{Math.round(row.base).toLocaleString("vi-VN")} VND</td>
                        <td className="p-3 text-center font-bold text-cyan-400">{row.rate}%</td>
                        <td className="p-3 text-right font-mono font-black text-white">{Math.round(row.amount).toLocaleString("vi-VN")} VND</td>
                        <td className="p-3 text-center">
                          <span className="inline-block rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8.5px] font-bold text-amber-400 uppercase tracking-wide">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {rosterRows.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-violet-400" />
                  Brand quản lý talent
                </h4>
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0F1115]/30">
                  <table className="w-full text-left text-xs border-collapse font-medium">
                    <thead>
                      <tr className="border-b border-white/5 bg-slate-950/45 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="p-3">Vai trò/F</th>
                        <th className="p-3">Người nhận</th>
                        <th className="p-3">Talent liên quan</th>
                        <th className="p-3">Cơ sở tính</th>
                        <th className="p-3 text-center">Tỷ lệ</th>
                        <th className="p-3 text-right">Số tiền</th>
                        <th className="p-3 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rosterRows.map((row, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 font-semibold text-violet-300">{row.role}</td>
                          <td className="p-3 font-bold text-white">{row.recipient}</td>
                          <td className="p-3 text-slate-400">{row.relatedTalent}</td>
                          <td className="p-3 font-mono text-slate-400">{Math.round(row.base).toLocaleString("vi-VN")} VND</td>
                          <td className="p-3 text-center font-bold text-violet-300">{row.rate}%</td>
                          <td className="p-3 text-right font-mono font-black text-white">{Math.round(row.amount).toLocaleString("vi-VN")} VND</td>
                          <td className="p-3 text-center">
                            <span className="inline-block rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8.5px] font-bold text-amber-400 uppercase tracking-wide">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Actions inside Content */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#151b2d]">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => onConfirmDisbursement(totalBudget)}
                disabled={isCommissionLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer hover:brightness-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCommissionLoading ? "Đang xử lý..." : "Xác nhận giải ngân"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
