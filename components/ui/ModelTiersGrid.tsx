import React from "react";
import { Crown, Trophy, Star, Award, ShieldAlert } from "lucide-react";

export default function ModelTiersGrid() {
  return (
    <div className="w-full bg-[#070913]/95 p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden transition-all duration-500">
      <div className="absolute top-0 right-0 -z-10 h-32 w-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-32 w-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-4">
        <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-black text-left">
          Hệ Thống Phân Hạng Người Mẫu (Onstage Model Tiers)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* TIER S */}
          <div className="group relative overflow-hidden rounded-2xl border border-amber-400/80 bg-gradient-to-br from-amber-500/20 via-[#221a0a]/95 to-[#070913]/98 p-4 text-left shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]">
            <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-amber-500/15 blur-lg pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Crown className="h-4.5 w-4.5 text-amber-400 fill-amber-400/10 animate-bounce" style={{ animationDuration: '3s' }} />
                <span className="text-[8px] font-black uppercase tracking-widest text-amber-400">
                  CELEB / SUPER VIP
                </span>
              </div>
              <span className="inline-flex items-center rounded-full bg-amber-400/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-300 border border-amber-400/30">
                90 - 100 ĐIỂM
              </span>
            </div>
            <span className="block text-xl font-black tracking-wide font-display bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              HẠNG S
            </span>
            <p className="mt-1.5 text-[10.5px] text-slate-300 leading-normal">
              Hoa hậu Quốc gia, Ngôi sao hạng S.
            </p>
          </div>

          {/* TIER A */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-300/60 bg-gradient-to-br from-slate-400/10 via-[#171922]/90 to-[#070913]/95 p-4 text-left shadow-[0_0_20px_rgba(203,213,225,0.08)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(203,213,225,0.18)]">
            <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-slate-400/10 blur-lg pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4.5 w-4.5 text-slate-300" />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">
                  HIGH-END PRO
                </span>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-400/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-200 border border-slate-400/30">
                70 - 89 ĐIỂM
              </span>
            </div>
            <span className="block text-xl font-black tracking-wide font-display bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400 bg-clip-text text-transparent">
              HẠNG A
            </span>
            <p className="mt-1.5 text-[10.5px] text-slate-300 leading-normal">
              Á hậu, Hoa khôi lớn, Siêu mẫu Runway chuyên nghiệp, MC VIP.
            </p>
          </div>

          {/* TIER B */}
          <div className="group relative overflow-hidden rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-[#1a1128]/90 to-[#070913]/95 p-4 text-left shadow-[0_0_20px_rgba(168,85,247,0.08)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(168,85,247,0.18)]">
            <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-purple-500/10 blur-lg pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Star className="h-4.5 w-4.5 text-purple-400" />
                <span className="text-[8px] font-black uppercase tracking-widest text-purple-400">
                  MID FREELANCE
                </span>
              </div>
              <span className="inline-flex items-center rounded-full bg-purple-500/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-purple-300 border border-purple-500/30">
                45 - 69 ĐIỂM
              </span>
            </div>
            <span className="block text-xl font-black tracking-wide font-display bg-gradient-to-r from-purple-200 to-pink-500 bg-clip-text text-transparent">
              HẠNG B
            </span>
            <p className="mt-1.5 text-[10.5px] text-slate-300 leading-normal">
              Người mẫu ảnh Lookbook, Micro/Mid-tier KOLs, PG VIP sự kiện cao cấp.
            </p>
          </div>

          {/* TIER C */}
          <div className="group relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-[#0e1f1e]/90 to-[#070913]/95 p-4 text-left shadow-[0_0_20px_rgba(20,184,166,0.08)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(20,184,166,0.18)]">
            <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-teal-500/10 blur-lg pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Award className="h-4.5 w-4.5 text-teal-400" />
                <span className="text-[8px] font-black uppercase tracking-widest text-teal-400">
                  ENTRY / NEWBIE
                </span>
              </div>
              <span className="inline-flex items-center rounded-full bg-teal-500/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-teal-300 border border-teal-500/30">
                20 - 44 ĐIỂM
              </span>
            </div>
            <span className="block text-xl font-black tracking-wide font-display bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent">
              HẠNG C
            </span>
            <p className="mt-1.5 text-[10.5px] text-slate-300 leading-normal">
              Người mẫu tự do mới vào nghề, diễn viên phụ, PG sự kiện đại trà.
            </p>
          </div>

        </div>

        {/* Technical potential profile warning note */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 flex items-start gap-2.5 shadow-[0_0_15px_rgba(244,63,94,0.04)]">
          <ShieldAlert className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-[10.5px] text-slate-400 leading-relaxed text-left">
            <strong className="text-rose-300 font-bold">Lưu ý:</strong> Các hồ sơ có tổng điểm chẩn đoán <strong className="text-rose-400 font-bold">dưới 20 điểm</strong> sẽ tự động được phân loại ở trạng thái <strong className="text-rose-400 font-bold">"Chưa xếp hạng / Chờ cập nhật" (Potential Profile)</strong>. Đây là mức điểm cho thấy hồ sơ cần bổ sung thêm hình ảnh, số đo chuẩn hóa hoặc liên kết mạng xã hội để kích hoạt hệ thống chẩn đoán phân hạng.
          </div>
        </div>
      </div>
    </div>
  );
}
