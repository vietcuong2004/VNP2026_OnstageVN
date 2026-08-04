"use client";

import React, { useState } from "react";
import { Coins, ShieldCheck, Clock } from "lucide-react";
import { useCrownfundingToast } from "../_context/toast-context";

export default function LendingPage() {
  const { addToast } = useCrownfundingToast();

  const [creditScore] = useState({ score: 88, tier: "B", maxLoan: 100000000 });
  const [activeLoans] = useState([
    {
      id: "ln-1",
      amount: 30000000,
      totalDue: 36000000,
      repaid: 12500000,
      rate: 25,
      status: "active",
      date: "2026-06-05"
    }
  ]);
  const [deductions] = useState([
    {
      id: "ded-1",
      jobTitle: "Chụp ảnh Lookbook BST Mùa Hè - Brand HN",
      jobAmount: 10000000,
      deduction: 2250000,
      date: "2026-06-18"
    },
    {
      id: "ded-2",
      jobTitle: "Livestream Review Mỹ phẩm Glow Beauty",
      jobAmount: 15000000,
      deduction: 3375000,
      date: "2026-06-22"
    }
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Credit Scoring info card */}
      <div className="rounded-3xl border border-white/7 bg-gradient-to-r from-[#0a0d1d] to-[#04060f] p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 rounded bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 text-[9px] font-black uppercase text-cyan-400 tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" /> Talent Credit Score (Hạng Tín Nhiệm)
          </span>
          <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
            Đánh giá uy tín tín dụng cá nhân
          </h3>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed font-medium">
            Hạn mức cho vay được tính toán tự động dựa trên danh hiệu hồ sơ, uy tín thực tế hoàn thành job trên app và tỷ lệ tăng trưởng social của bạn.
          </p>
        </div>

        <div className="flex gap-4 items-center shrink-0">
          <div className="h-16 w-16 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <span className="font-display font-black text-2xl text-slate-950">{creditScore.tier}</span>
          </div>
          <div className="space-y-1">
            <span className="block text-[8px] text-slate-500 font-bold uppercase">Hạn mức tối đa khả dụng</span>
            <span className="block font-mono font-extrabold text-white text-base">
              {creditScore.maxLoan.toLocaleString()}đ
            </span>
            <span className="block text-[8.5px] text-slate-400 font-semibold">
              Điểm uy tín: <b>{creditScore.score}/100</b>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Active loans list */}
        <div className="lg:col-span-8 rounded-2xl border border-white/5 bg-[#08090f] p-6 space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Coins className="h-4.5 w-4.5 text-amber-400" /> Các khoản vay tín chấp hoạt động (ISA)
            </h3>
          </div>

          {activeLoans.map((loan) => {
            const repayPercent = Math.round((loan.repaid / loan.totalDue) * 100);
            return (
              <div key={loan.id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-950/30 border border-white/5 rounded-2xl p-4 font-semibold">
                  <div className="space-y-1">
                    <span className="block text-[8px] text-slate-500 font-bold uppercase">Khoản Vay Gốc</span>
                    <span className="text-white font-mono font-extrabold">{loan.amount.toLocaleString()}đ</span>
                    <span className="block text-[8.5px] text-slate-500">Khởi tạo: {loan.date}</span>
                  </div>

                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/5 pt-2 sm:pt-0 sm:pl-4">
                    <span className="block text-[8px] text-slate-500 font-bold uppercase">
                      Hạn mức hoàn trả (Gốc+Phí)
                    </span>
                    <span className="text-amber-400 font-mono font-extrabold">{loan.totalDue.toLocaleString()}đ</span>
                    <span className="block text-[8.5px] text-slate-500">
                      Tỷ lệ trích thu nhập: <b>{loan.rate}%</b> cát-xê
                    </span>
                  </div>

                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/5 pt-2 sm:pt-0 sm:pl-4">
                    <span className="block text-[8px] text-slate-500 font-bold uppercase">Đã trả tích lũy</span>
                    <span className="text-emerald-400 font-mono font-extrabold">{loan.repaid.toLocaleString()}đ</span>
                    <span className="block text-[8.5px] text-slate-500">
                      Còn lại: <b>{(loan.totalDue - loan.repaid).toLocaleString()}đ</b>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    <span>Tiến trình hoàn trả nợ</span>
                    <span>{repayPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                      style={{ width: `${repayPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Repay deductions log */}
        <div className="lg:col-span-4 rounded-2xl border border-white/5 bg-[#08090f] p-6 space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-slate-400" /> Nhật ký trích nợ tự động
            </h3>
          </div>

          <div className="space-y-4">
            {deductions.map((ded) => (
              <div
                key={ded.id}
                className="text-xs border-b border-white/5 last:border-transparent pb-3 last:pb-0 space-y-1 font-semibold"
              >
                <h5 className="font-bold text-white line-clamp-1">{ded.jobTitle}</h5>
                <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                  <span>Cát-xê: {ded.jobAmount.toLocaleString()}đ</span>
                  <span className="text-red-400 font-mono">-{ded.deduction.toLocaleString()}đ</span>
                </div>
                <span className="block text-[8px] text-slate-500 font-mono">{ded.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
