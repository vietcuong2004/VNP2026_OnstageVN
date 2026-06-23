"use client";

import React, { useState } from "react";
import { Users, Clock, RefreshCw } from "lucide-react";
import { useCrownfundingToast } from "../_context/toast-context";

export default function RewardsPage() {
  const { addToast } = useCrownfundingToast();

  const [rewardTiers] = useState([
    {
      id: "rw-1",
      amount: 100000,
      title: "Thiệp Điện Tử Tri Ân",
      claimed: 42,
      limit: 100,
      desc: "Thiệp điện tử cảm ơn kèm chữ ký số độc quyền của Talent gửi qua email."
    },
    {
      id: "rw-2",
      amount: 500000,
      title: "Photobook Kỷ Niệm",
      claimed: 18,
      limit: 50,
      desc: "Quyển Photobook ghi lại toàn bộ hành trình chuẩn bị đi thi và ký tặng trực tiếp."
    },
    {
      id: "rw-3",
      amount: 2000000,
      title: "Vé VIP Chung Kết",
      claimed: 5,
      limit: 10,
      desc: "Vé VIP tham gia Đêm chung kết cuộc thi sắc đẹp ngồi hàng đầu cùng Ban tổ chức."
    }
  ]);

  const [rewardClaims, setRewardClaims] = useState([
    {
      id: "cl-1",
      name: "Nguyễn Hoàng Nam",
      phone: "0987xxx321",
      address: "Hà Nội",
      tier: "Photobook Kỷ Niệm",
      amount: 500000,
      tracking: "VN987265",
      status: "shipped"
    },
    {
      id: "cl-2",
      name: "Lê Minh Trí",
      phone: "0912xxx888",
      address: "TP.HCM",
      tier: "Thiệp Điện Tử Tri Ân",
      amount: 100000,
      tracking: "",
      status: "processing"
    }
  ]);

  const handleUpdateTracking = (claimId: string) => {
    const tracking = prompt("Nhập mã vận đơn bưu điện gửi quà:");
    if (tracking) {
      setRewardClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, tracking, status: "shipped" } : c))
      );
      addToast(`Đã cập nhật mã vận đơn ${tracking} cho đơn hàng!`, "success");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Rewards overview grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rewardTiers.map((tier) => (
          <div
            key={tier.id}
            className="rounded-2xl border border-white/5 bg-[#08090f] p-5 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">
                  Gói: {tier.amount.toLocaleString()}đ
                </span>
                <span className="text-[8px] text-slate-500 font-bold uppercase">
                  Đã mua: {tier.claimed}/{tier.limit} suất
                </span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase">{tier.title}</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{tier.desc}</p>
            </div>
            <button
              onClick={() =>
                addToast("Tính năng sửa gói quà tri ân sẽ được cập nhật trong phiên tiếp theo.", "info")
              }
              className="w-full h-9 border border-white/10 hover:border-slate-500 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer transition-all"
            >
              Chỉnh sửa gói
            </button>
          </div>
        ))}
      </div>

      {/* Backer Orders List */}
      <div className="rounded-2xl border border-white/5 bg-[#08090f] p-6 space-y-6">
        <div className="border-b border-white/5 pb-3">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-cyan-400" /> Quản lý đơn giao nhận quà tri ân
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-400 border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] text-slate-500 uppercase font-black tracking-wider">
                <th className="pb-3">Tên Nhà Tài Trợ</th>
                <th className="pb-3">Gói Đăng Ký</th>
                <th className="pb-3">Địa Chỉ Giao Nhận</th>
                <th className="pb-3">Vận Đơn / Mã</th>
                <th className="pb-3 text-right">Trạng Thái Dòng Tiền</th>
              </tr>
            </thead>
            <tbody>
              {rewardClaims.map((claim) => (
                <tr key={claim.id} className="border-b border-white/5 last:border-transparent">
                  <td className="py-4 font-bold text-white">
                    <span>{claim.name}</span>
                    <span className="block text-[8px] text-slate-500 font-mono mt-0.5">{claim.phone}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-[10px] font-bold text-amber-400">{claim.tier}</span>
                    <span className="block text-[8px] text-slate-500 font-mono mt-0.5">
                      {claim.amount.toLocaleString()}đ
                    </span>
                  </td>
                  <td className="py-4 max-w-[150px] truncate">{claim.address}</td>
                  <td className="py-4">
                    {claim.tracking ? (
                      <span className="font-mono text-white bg-slate-900 border border-white/5 px-2 py-0.5 rounded text-[10px]">
                        {claim.tracking}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleUpdateTracking(claim.id)}
                        className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                      >
                        + Nhập mã vận đơn
                      </button>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    {claim.status === "shipped" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-amber-400 animate-pulse">
                        <Clock className="h-3 w-3" /> ESCROWED (Tạm giữ)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-blue-400">
                        <RefreshCw className="h-3 w-3" /> Chờ chuẩn bị
                      </span>
                    )}
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
