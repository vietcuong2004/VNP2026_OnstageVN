"use client";

import React from "react";
import { X } from "lucide-react";

interface ChecklistModalProps {
  reviewApplicant: any;
  onClose: () => void;
  onConfirm: (talentId: string) => void;
}

export default function ChecklistModal({
  reviewApplicant,
  onClose,
  onConfirm,
}: ChecklistModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300 text-left">
        <div className="flex items-center justify-between p-6 border-b border-[#151b2d] bg-slate-950/45">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Nghiệm Thu Kết Quả Job</h3>
            <p className="text-[10px] text-slate-500 mt-1">Đối soát hình ảnh và lịch trình thực tế của {reviewApplicant.talentName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-4.5 w-4.5" /></button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="bg-[#050711] border border-white/5 rounded-xl p-3.5 space-y-2">
            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Đối soát hành trình GPS</span>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400">Địa điểm check-in:</span>
              <span className="text-white font-semibold">📍 Studio Cầu Giấy, Hà Nội</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400">Thời gian làm việc:</span>
              <span className="text-white font-mono font-semibold">08/06/2026 (08:00 - 12:00)</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400">Hợp đồng thông minh:</span>
              <span className="text-emerald-400 font-semibold">✍️ Đã ký số NDA & Lịch trình</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Hình ảnh check-in thực tế</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-white/5">
                <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80" alt="Check-in 1" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 bg-black/75 px-1 rounded text-[7px] text-white">Check-in bắt đầu</span>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-white/5">
                <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80" alt="Check-out 1" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 bg-black/75 px-1 rounded text-[7px] text-white">Báo cáo hoàn thành</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-start text-[9.5px] text-slate-400 bg-amber-400/5 border border-amber-400/10 rounded-xl p-3">
            <span>🔔</span>
            <p className="leading-normal">
              Bấm <b>"Xác nhận nghiệm thu"</b> để kết thúc công việc của ứng viên này, tự động giải ngân cát-xê ký quỹ và thực hiện cascade hoa hồng đa cấp.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#151b2d] bg-[#050711]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-[#151b2d] text-xs font-bold text-slate-400 hover:text-white cursor-pointer">Hủy</button>
          <button
            onClick={() => {
              onConfirm(reviewApplicant.talentId);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer hover:brightness-105 active:scale-95 transition-all"
          >
            Xác nhận nghiệm thu
          </button>
        </div>
      </div>
    </div>
  );
}
