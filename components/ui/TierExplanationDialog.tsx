import React from "react";
import { X, Crown, Trophy, Star, Award, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TierExplanationDialog({ isOpen, onClose }: TierExplanationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Content */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#080914] p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        <div className="space-y-6">
          {/* Modal Header */}
          <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4 text-left">
            <div className="min-w-0">
              <span className="block text-[10px] text-amber-400 uppercase tracking-widest font-black mb-1 sm:whitespace-nowrap">
                Onstage Tier System
              </span>
              <h3 className="text-lg font-black text-white uppercase tracking-wider sm:whitespace-nowrap">
                Chi tiết các phân hạng
              </h3>
            </div>
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white bg-slate-900 border border-white/10 hover:border-white/20 hover:bg-slate-800 transition-all cursor-pointer p-2 rounded-full shadow-md active:scale-95 shrink-0"
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* TIER S */}
            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/5 p-4 text-left shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Crown className="h-4.5 w-4.5 text-amber-400 fill-amber-400/10" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                    CELEB / SUPER VIP
                  </span>
                </div>
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[8px] font-black uppercase text-amber-300">
                  90 - 100 ĐIỂM
                </span>
              </div>
              <span className="block text-base font-black text-white tracking-wide">
                TIER S
              </span>
              <p className="mt-1 text-[10.5px] text-slate-300 leading-normal">
                Hoa hậu Quốc gia, Ngôi sao hạng S, Nghệ sĩ nổi tiếng có sức ảnh hưởng cực lớn.
              </p>
            </div>

            {/* TIER A */}
            <div className="rounded-2xl border border-slate-300/20 bg-slate-400/5 p-4 text-left shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4.5 w-4.5 text-slate-300" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                    HIGH-END PRO
                  </span>
                </div>
                <span className="rounded-full bg-slate-400/20 px-2 py-0.5 text-[8px] font-black uppercase text-slate-200">
                  70 - 89 ĐIỂM
                </span>
              </div>
              <span className="block text-base font-black text-white tracking-wide">
                TIER A
              </span>
              <p className="mt-1 text-[10.5px] text-slate-300 leading-normal">
                Á hậu, Hoa khôi lớn, Siêu mẫu Runway chuyên nghiệp, MC VIP sự kiện tầm cỡ.
              </p>
            </div>

            {/* TIER B */}
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 text-left shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4.5 w-4.5 text-purple-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">
                    MID FREELANCE
                  </span>
                </div>
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[8px] font-black uppercase text-purple-300">
                  45 - 69 ĐIỂM
                </span>
              </div>
              <span className="block text-base font-black text-white tracking-wide">
                TIER B
              </span>
              <p className="mt-1 text-[10.5px] text-slate-300 leading-normal">
                Người mẫu ảnh Lookbook, Micro/Mid-tier KOLs, PG VIP sự kiện cao cấp.
              </p>
            </div>

            {/* TIER C */}
            <div className="rounded-2xl border border-teal-500/20 bg-[#0e1f1e]/40 p-4 text-left shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Award className="h-4.5 w-4.5 text-teal-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-teal-400">
                    ENTRY / MEMBER
                  </span>
                </div>
                <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[8px] font-black uppercase text-teal-300">
                  20 - 44 ĐIỂM
                </span>
              </div>
              <span className="block text-base font-black text-white tracking-wide">
                TIER C
              </span>
              <p className="mt-1 text-[10.5px] text-slate-300 leading-normal">
                Người mẫu tự do mới vào nghề, diễn viên phụ, PG/PB sự kiện đại trà, tiềm năng phát triển.
              </p>
            </div>

            {/* POTENTIAL / CHƯA XẾP HẠNG */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-left shadow-sm md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="h-4.5 w-4.5 text-rose-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-400">
                    POTENTIAL PROFILE
                  </span>
                </div>
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[8px] font-black uppercase text-rose-300 border border-rose-500/30">
                  DƯỚI 20 ĐIỂM
                </span>
              </div>
              <span className="block text-base font-black text-white tracking-wide">
                CHƯA XẾP HẠNG
              </span>
              <p className="mt-1 text-[10.5px] text-slate-300 leading-normal">
                Chưa xếp hạng / Chờ cập nhật hồ sơ. Hồ sơ cần bổ sung hình ảnh, số đo chuẩn hóa hoặc liên kết mạng xã hội để kích hoạt hệ thống chẩn đoán phân hạng.
              </p>
            </div>

          </div>

          {/* Làm thế nào để nâng hạng? */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-3 text-left">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              Làm thế nào để nâng hạng (Tier Up)?
            </h4>
            <ul className="space-y-2 text-[10.5px] text-slate-300 list-disc list-inside">
              <li>
                <strong className="text-white">Hoàn thiện 100% hồ sơ:</strong> Cập nhật đầy đủ ảnh đại diện, ảnh bìa, ảnh toàn thân, video giới thiệu và tiểu sử (Bio).
              </li>
              <li>
                <strong className="text-white">Xác thực tài khoản (CCCD):</strong> Định danh tài khoản thật để nhận Tích xanh/Tích vàng Elite giúp tăng điểm uy tín.
              </li>
              <li>
                <strong className="text-white">Liên kết Mạng xã hội:</strong> Thêm nhiều liên kết mạng xã hội (Tiktok, Facebook, Instagram...) để hệ thống AI đánh giá chỉ số phủ sóng.
              </li>
              <li>
                <strong className="text-white">Tham gia Khảo sát AI chuyên sâu:</strong> Hoàn thành khảo sát để đo lường các chỉ số kỹ năng (Catwalk, Pose, MC, Acting...) giúp hệ thống xếp hạng chính xác năng lực thực tế.
              </li>
            </ul>
          </div>

          {/* Warning Note */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-400 leading-relaxed text-left">
              <strong className="text-rose-300 font-bold">Lưu ý:</strong> Phân hạng (Tier) được tính toán tự động dựa trên mức độ hoàn thiện hồ sơ, số đo hình thể chuẩn hóa, hoạt động xã hội và các chứng chỉ/kinh nghiệm thực tế của Talent trên hệ thống.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
