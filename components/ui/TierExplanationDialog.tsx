import React from "react";
import { X, Crown, Trophy, Star, Award, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import BadgeTier from "@/components/ui/BadgeTier";

interface TierExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TierExplanationDialog({ isOpen, onClose }: TierExplanationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex h-[100dvh] w-screen items-stretch justify-stretch overflow-hidden bg-[#080914] p-0 md:items-center md:justify-center md:bg-transparent md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Content */}
      <div className="relative flex h-[100dvh] max-h-[100dvh] w-screen flex-col overflow-hidden rounded-none border-0 bg-[#080914] shadow-2xl animate-in fade-in zoom-in-95 duration-200 md:h-auto md:max-h-[90vh] md:w-full md:max-w-2xl md:rounded-3xl md:border md:border-white/10">

        <div className="flex-1 space-y-6 overflow-y-auto p-5 pb-[96px] md:p-8">
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
              className="hidden text-slate-300 hover:text-white bg-slate-900 border border-white/10 hover:border-white/20 hover:bg-slate-800 transition-all cursor-pointer p-2 rounded-full shadow-md active:scale-95 shrink-0 md:inline-flex"
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* TIER S */}
            <div className="rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-100/12 via-amber-500/10 to-yellow-500/8 p-4 text-left shadow-[0_0_24px_rgba(245,158,11,0.08)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Crown className="h-4.5 w-4.5 text-amber-300 fill-amber-300/15" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">
                    CELEB / SUPER VIP
                  </span>
                </div>
                <span className="rounded-full border border-amber-300/50 bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-2 py-0.5 text-[8px] font-black uppercase text-slate-950">
                  90 - 100 ĐIỂM
                </span>
              </div>
              <BadgeTier tier="S" variant="gradient" className="mt-1" />
              <p className="mt-2 text-xs text-slate-300 leading-relaxed text-justify">
                Hoa hậu Quốc gia, Ngôi sao hạng S, Nghệ sĩ nổi tiếng có sức ảnh hưởng cực lớn.
              </p>
            </div>

            {/* TIER A */}
            <div className="rounded-2xl border border-slate-100/35 bg-gradient-to-br from-slate-50/10 via-slate-300/10 to-slate-500/8 p-4 text-left shadow-[0_0_24px_rgba(203,213,225,0.08)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4.5 w-4.5 text-slate-100" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-100">
                    HIGH-END PRO
                  </span>
                </div>
                <span className="rounded-full border border-slate-100/50 bg-gradient-to-r from-slate-50 via-slate-300 to-slate-500 px-2 py-0.5 text-[8px] font-black uppercase text-slate-950">
                  70 - 89 ĐIỂM
                </span>
              </div>
              <BadgeTier tier="A" variant="gradient" className="mt-1" />
              <p className="mt-2 text-xs text-slate-300 leading-relaxed text-justify">
                Á hậu, Hoa khôi lớn, Siêu mẫu Runway chuyên nghiệp, MC VIP sự kiện tầm cỡ.
              </p>
            </div>

            {/* TIER B */}
            <div className="rounded-2xl border border-orange-200/35 bg-gradient-to-br from-orange-100/12 via-amber-500/12 to-orange-300/8 p-4 text-left shadow-[0_0_24px_rgba(180,104,46,0.1)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4.5 w-4.5 text-orange-200" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-orange-200">
                    MID FREELANCE
                  </span>
                </div>
                <span className="rounded-full border border-orange-200/50 bg-gradient-to-r from-orange-100 via-amber-500 to-orange-300 px-2 py-0.5 text-[8px] font-black uppercase text-slate-950">
                  45 - 69 ĐIỂM
                </span>
              </div>
              <BadgeTier tier="B" variant="gradient" className="mt-1" />
              <p className="mt-2 text-xs text-slate-300 leading-relaxed text-justify">
                Người mẫu ảnh Lookbook, Micro/Mid-tier KOLs, PG VIP sự kiện cao cấp.
              </p>
            </div>

            {/* TIER C */}
            <div className="rounded-2xl border border-teal-100/35 bg-gradient-to-br from-teal-100/12 via-emerald-400/12 to-teal-700/10 p-4 text-left shadow-[0_0_24px_rgba(20,184,166,0.08)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Award className="h-4.5 w-4.5 text-teal-100" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-teal-100">
                    ENTRY / MEMBER
                  </span>
                </div>
                <span className="rounded-full border border-teal-100/50 bg-gradient-to-r from-teal-100 via-emerald-400 to-teal-700 px-2 py-0.5 text-[8px] font-black uppercase text-slate-950">
                  20 - 44 ĐIỂM
                </span>
              </div>
              <BadgeTier tier="C" variant="gradient" className="mt-1" />
              <p className="mt-2 text-xs text-slate-300 leading-relaxed text-justify">
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
              <p className="mt-2 text-xs text-slate-300 leading-relaxed text-justify">
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
            <ul className="space-y-2.5 text-xs text-slate-300 list-disc list-inside">
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

          <div className="overflow-hidden rounded-2xl border border-amber-300/15 bg-slate-950/60 text-left">
            <div className="border-b border-white/5 bg-gradient-to-r from-amber-100/10 via-amber-500/10 to-orange-300/10 px-4 py-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                Bảng tiêu chí tính điểm
              </h4>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-400 text-justify">
                Điểm tier được tổng hợp từ hồ sơ, khảo sát AI, độ tin cậy và tín hiệu mạng xã hội.
              </p>
            </div>

            <div className="divide-y divide-white/5">
              {[
                ["Hoàn thiện hồ sơ", "30%", "30 điểm", "Ảnh đại diện, ảnh bìa, ảnh toàn thân, bio, số đo, kinh nghiệm, kỹ năng và portfolio."],
                ["Khảo sát AI chuyên sâu", "40%", "40 điểm", "Điểm Pageant, Runway, KOL và các nhóm kỹ năng như catwalk, posing, MC, acting, livestream."],
                ["Xác thực & uy tín", "15%", "15 điểm", "Xác thực CCCD, trạng thái tài khoản, lịch sử hoạt động và độ tin cậy khi hợp tác."],
                ["Mạng xã hội & độ phủ", "15%", "15 điểm", "Liên kết TikTok, Facebook, Instagram, follower, engagement và tín hiệu ảnh hưởng thực tế."],
              ].map(([name, weight, maxScore, description]) => (
                <div key={name} className="grid grid-cols-[1fr_72px_86px] gap-3 px-4 py-3 sm:grid-cols-[150px_72px_86px_1fr]">
                  <span className="text-xs font-black text-white">{name}</span>
                  <span className="inline-flex h-9 w-[72px] items-center justify-center rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-center text-[9px] font-black text-slate-950">
                    {weight}
                  </span>
                  <span className="inline-flex h-9 w-[86px] items-center justify-center rounded-full border border-white/10 bg-white/5 text-center text-[9px] font-black text-slate-200">
                    {maxScore}
                  </span>
                  <span className="col-span-3 text-xs font-medium leading-relaxed text-slate-400 text-justify sm:col-span-1">
                    {description}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 px-4 py-3 text-xs font-medium leading-relaxed text-slate-500 text-justify">
              Công thức gợi ý: tổng điểm tối đa 100 = hồ sơ 30 điểm + khảo sát AI 40 điểm + xác thực/uy tín 15 điểm + mạng xã hội 15 điểm.
            </div>
          </div>

          {/* Warning Note */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 leading-relaxed text-justify">
              <strong className="text-rose-300 font-bold">Lưu ý:</strong> Phân hạng (Tier) được tính toán tự động dựa trên mức độ hoàn thiện hồ sơ, số đo hình thể chuẩn hóa, hoạt động xã hội và các chứng chỉ/kinh nghiệm thực tế của Talent trên hệ thống.
            </div>
          </div>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-[100000] border-t border-white/10 bg-[#080914]/95 p-4 pb-[calc(16px+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(245,158,11,0.2)] transition active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
