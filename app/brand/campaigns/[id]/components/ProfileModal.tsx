"use client";

import React from "react";
import { X, CheckCircle2 } from "lucide-react";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { type CampaignStage } from "@/lib/brand-mvp-data";

interface ProfileModalProps {
  talent: any;
  currentApplicantItem: any;
  selectedCampaign: any;
  onClose: () => void;
  onMoveApplicant: (campaignId: string, talentId: string, stage: CampaignStage) => void;
}

export default function ProfileModal({
  talent,
  currentApplicantItem,
  selectedCampaign,
  onClose,
  onMoveApplicant,
}: ProfileModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="flex items-center justify-between p-6 border-b border-[#151b2d] bg-slate-950/45">
          <div className="flex items-center gap-3">
            <img
              src={talent.avatar}
              alt={talent.name}
              onError={(event) => {
                event.currentTarget.src = createInitialAvatarDataUrl(talent.name, "");
              }}
              className="h-12 w-12 rounded-xl object-cover border border-white/5 bg-slate-950"
            />
            <div className="text-left">
              <h3 className="text-sm font-black text-white">{talent.name}</h3>
              <p className="text-[10px] text-slate-400">{talent.type} · {talent.city}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left scrollbar-thin">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#050711] border border-white/5 rounded-xl p-3 text-center">
              <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Hạng Profile</span>
              <span className="block text-xs font-black text-amber-400 mt-1">Tier {talent.tier}</span>
            </div>
            <div className="bg-[#050711] border border-white/5 rounded-xl p-3 text-center">
              <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Đánh Giá</span>
              <span className="block text-xs font-black text-white mt-1">{talent.rating} ★</span>
            </div>
            <div className="bg-[#050711] border border-white/5 rounded-xl p-3 text-center">
              <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Hoàn Thành</span>
              <span className="block text-xs font-black text-white mt-1">{talent.completedJobs} Jobs</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chỉ số hình thể</h4>
            <div className="grid grid-cols-5 gap-1 xs:gap-2 bg-[#050711] border border-white/5 rounded-xl p-3 text-center text-[9px] xs:text-[10px]">
              <div>
                <span className="block text-slate-500">Chiều cao</span>
                <span className="font-bold text-white mt-0.5 block">{talent.height} cm</span>
              </div>
              <div>
                <span className="block text-slate-500">Cân nặng</span>
                <span className="font-bold text-white mt-0.5 block">{talent.weight} kg</span>
              </div>
              <div>
                <span className="block text-slate-500">Vòng 1</span>
                <span className="font-bold text-white mt-0.5 block">{talent.bust} cm</span>
              </div>
              <div>
                <span className="block text-slate-500">Vòng 2</span>
                <span className="font-bold text-white mt-0.5 block">{talent.waist} cm</span>
              </div>
              <div>
                <span className="block text-slate-500">Vòng 3</span>
                <span className="font-bold text-white mt-0.5 block">{talent.hips} cm</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kỹ năng nổi bật</span>
              <div className="flex flex-wrap gap-1.5">
                {talent.skills?.map((s: string, idx: number) => (
                  <span key={idx} className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[9.5px] text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Học văn & Ngôn ngữ</span>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">{talent.education}</p>
              <p className="text-[10px] text-slate-400 mt-1">Ngôn ngữ: {talent.languages?.join(", ") || "Tiếng Việt, Tiếng Anh"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bảng Giá Dịch Vụ Cơ Bản (Basic)</h4>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
              {Object.entries(talent.rateCard || {}).map(([key, value]: any) => (
                <div key={key} className="flex justify-between p-2.5 bg-[#050711]/40 border border-white/5 rounded-lg items-center">
                  <span className="text-slate-400">{key}</span>
                  <span className="font-bold text-amber-400 font-mono">từ {value.toLocaleString()}đ</span>
                </div>
              ))}
            </div>
          </div>

          {talent.lifestyleServices && talent.lifestyleServices.some((s: any) => s.enabled) && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dịch Vụ Đồng Hành VIP</h4>
              <div className="space-y-2">
                {talent.lifestyleServices.filter((s: any) => s.enabled).map((service: any) => (
                  <div key={service.id} className="flex justify-between items-start p-3 bg-[#050711] border border-white/5 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-white block">⛳ {service.title}</span>
                      <span className="text-xs text-slate-500 leading-normal block mt-1">{service.description}</span>
                    </div>
                    <span className="text-[10px] font-black text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded shrink-0">
                      {service.rate.toLocaleString()}đ/{service.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lookbook Photos Section */}
          <div className="space-y-3 border-t border-[#151b2d] pt-4">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              📸 Bộ Ảnh Lookbook Nghệ Thuật (4 Ảnh)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600",
                "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600"
              ].map((url, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-md">
                  <img src={url} alt={`Lookbook ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-2 left-2">
                    <span className="inline-block bg-[#f4c430] text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Ảnh {idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 p-6 border-t border-[#151b2d] bg-slate-950/45">
          {currentApplicantItem.stage === "new" ? (
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 transition active:scale-95 cursor-pointer text-xs font-bold flex items-center justify-center"
              >
                Không duyệt
              </button>
              <button
                onClick={() => {
                  onMoveApplicant(selectedCampaign.id, talent.id, "accepted");
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer hover:brightness-105 active:scale-95 transition-all flex items-center justify-center"
              >
                Duyệt ứng viên
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white cursor-pointer flex items-center justify-center"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
