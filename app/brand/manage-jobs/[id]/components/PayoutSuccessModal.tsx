"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { talents } from "@/lib/brand-mvp-data";

interface PayoutSuccessModalProps {
  payoutDetails: any;
  selectedCampaign: any;
  displayTalents: any[];
  onClose: () => void;
}

function moneyText(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")} VND`;
}

export default function PayoutSuccessModal({
  payoutDetails,
  selectedCampaign,
  displayTalents,
  onClose,
}: PayoutSuccessModalProps) {
  const rawBudget = payoutDetails.budget;
  const cleanBudgetStr = rawBudget.split("-").pop().replace(/[^0-9]/g, "");
  const parsedVal = parseInt(cleanBudgetStr, 10) || 10000000;
  const poolVal = parsedVal / (selectedCampaign.applicants.length || 1);

  const appEntry = selectedCampaign.applicants.find((a: any) => {
    const t = displayTalents.find((dt) => dt.id === a.talentId) || talents.find((dt) => dt.id === a.talentId);
    return t && t.name === payoutDetails.talentName;
  });

  const hasReferrer = appEntry ? !!appEntry.referredByTalentId : false;
  const referrer = (appEntry && appEntry.referredByTalentId)
    ? (displayTalents.find((t) => t.id === appEntry.referredByTalentId) || talents.find((t) => t.id === appEntry.referredByTalentId))
    : null;

  const talentAmount = hasReferrer ? poolVal * 0.70 : poolVal * 0.75;
  const brandAmount = poolVal * 0.10;
  const referralAmount = hasReferrer ? poolVal * 0.05 : 0;
  const platformAmount = poolVal * 0.15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md flex flex-col bg-[#08090f] border border-emerald-500/30 rounded-3xl shadow-[0_24px_60px_rgba(16,185,129,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 text-left">
        <div className="flex items-center gap-3 p-6 border-b border-[#151b2d] bg-emerald-500/5">
          <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Nghiệm Thu & Giải Ngân Thành Công</h3>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">Hợp đồng thông minh đã tự động phân bổ dòng tiền</p>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="space-y-1 bg-[#050711] border border-white/5 rounded-xl p-3.5">
            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Thông tin thanh toán</span>
            <div className="flex justify-between items-center mt-1">
              <span className="text-slate-300 font-medium">Thù lao người thực hiện ({hasReferrer ? "qua giới thiệu" : "trực tiếp"}):</span>
              <span className="font-extrabold text-white font-mono text-sm text-emerald-400">+{moneyText(talentAmount)}</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">Đã cộng vào ví khả dụng của: <b>{payoutDetails.talentName}</b></p>
          </div>

          <div className="space-y-3 bg-[#050711] border border-white/5 rounded-xl p-3.5">
            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Phân bổ hoa hồng chi tiết (Job Affiliate)</span>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Phí quản lý chủ job (10%):</span>
                <span className="font-bold text-amber-400 font-mono">+{moneyText(brandAmount)}</span>
              </div>
              {hasReferrer && referrer && (
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Hoa hồng người giới thiệu ({referrer.name} - 5%):</span>
                  <span className="font-bold text-cyan-400 font-mono">+{moneyText(referralAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Phí nền tảng OnStage Platform (15%):</span>
                <span className="font-bold text-slate-450 font-mono">+{moneyText(platformAmount)}</span>
              </div>
            </div>
            <div className="border-t border-[#151b2d] pt-2 text-[9px] text-slate-500 italic">
              * Áp dụng quy tắc trích thưởng và giải ngân tự động từ số dư bảo chứng (Escrow).
            </div>
          </div>

          <div className="flex gap-2 items-start text-[9.5px] text-slate-400 bg-amber-400/5 border border-amber-400/10 rounded-xl p-3">
            <span>🛡️</span>
            <p className="leading-normal">
              <b>Lịch sử giao dịch (Audit Logs)</b> đã được ghi nhận: <i>"Quyết toán thù lao cho {payoutDetails.talentName} thuộc chiến dịch {payoutDetails.campaignTitle}"</i>.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end p-6 border-t border-[#151b2d] bg-[#050711]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer hover:brightness-105 active:scale-95 transition-all"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}
