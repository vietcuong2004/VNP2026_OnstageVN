"use client";

import React, { useState } from "react";
import { Plus, FileText, ShieldCheck, CheckCircle } from "lucide-react";
import { useCrownfundingToast } from "../_context/toast-context";

export default function EquityPage() {
  const { addToast } = useCrownfundingToast();

  const [equityPitches] = useState([
    {
      id: "eq-1",
      title: "Gọi vốn đầu tư xây dựng thương hiệu cá nhân",
      goal: 500000000,
      raised: 200000000,
      shareRate: 20,
      status: "active"
    }
  ]);
  const [bccContracts] = useState([
    {
      id: "bcc-1",
      investorName: "Unimedia Agency",
      investment: 200000000,
      shareRate: 20,
      startDate: "2026-06-10",
      endDate: "2028-06-10",
      status: "active"
    }
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Equity campaign pitches list */}
      <div className="rounded-2xl border border-white/5 bg-[#08090f] p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-cyan-400" /> Hồ sơ gọi vốn thương hiệu (BCC Pitching)
          </h3>
          <button
            onClick={() =>
              addToast(
                "Tính năng thêm hồ sơ Pitching mới sẽ được cập nhật trong kỳ kiểm thử tiếp theo.",
                "info"
              )
            }
            className="flex h-8 px-3 items-center gap-1 bg-cyan-500 hover:bg-cyan-400 active:scale-95 rounded-lg text-[10px] font-black text-slate-950 uppercase tracking-wider transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Đăng Pitching mới
          </button>
        </div>

        {equityPitches.map((pitch) => (
          <div
            key={pitch.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/20 border border-white/5 rounded-2xl p-4 text-xs font-semibold"
          >
            <div className="space-y-1">
              <h4 className="font-bold text-white uppercase leading-snug">{pitch.title}</h4>
              <p className="text-[10px] text-slate-500 font-medium">
                Kêu gọi gói tài trợ lớn phục vụ thiết lập hình ảnh VIP đại sứ.
              </p>
            </div>
            <div className="flex gap-6 shrink-0 text-slate-400">
              <div className="space-y-1">
                <span className="block text-[8px] text-slate-500 font-bold uppercase">Mục tiêu gọi</span>
                <span className="text-white font-mono font-extrabold">{pitch.goal.toLocaleString()}đ</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[8px] text-slate-500 font-bold uppercase">Đã góp thực</span>
                <span className="text-amber-400 font-mono font-extrabold">{pitch.raised.toLocaleString()}đ</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[8px] text-slate-500 font-bold uppercase">Tỷ lệ trích doanh thu</span>
                <span className="text-cyan-400 font-mono font-extrabold">{pitch.shareRate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active BCC Contracts */}
      <div className="rounded-2xl border border-white/5 bg-[#08090f] p-6 space-y-6">
        <div className="border-b border-white/5 pb-3">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" /> Danh sách hợp đồng BCC ký kết hoạt động
          </h3>
        </div>

        <div className="space-y-4">
          {bccContracts.map((contract) => (
            <div
              key={contract.id}
              className="flex justify-between items-center gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-4 text-xs font-semibold"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white uppercase">{contract.investorName}</span>
                  <span className="text-[9px] font-mono font-bold text-slate-500">
                    ({contract.startDate} - {contract.endDate})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span>
                    Số tiền rót vốn:{" "}
                    <strong className="text-white font-mono font-extrabold">
                      {contract.investment.toLocaleString()}đ
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Doanh thu chia sẻ: <strong className="text-cyan-400">{contract.shareRate}%</strong> tổng job
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[9px] font-black uppercase text-emerald-400 tracking-wider">
                <CheckCircle className="h-3.5 w-3.5" /> ACTIVE (Hiệu Lực)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
