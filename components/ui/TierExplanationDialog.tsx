import React from "react";
import { X, Award, Crown, Gem, Medal, ShieldCheck, Sparkles } from "lucide-react";
import BadgeTier from "@/components/ui/BadgeTier";

interface TierExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const achievementCards = [
  {
    tier: "S",
    Icon: Gem,
    eyebrow: "Kim cương",
    point: "Top 50 KOL",
    cardClass:
      "border-cyan-200/90 bg-[#F4FAFC] dark:border-cyan-200/40 dark:bg-gradient-to-br dark:from-cyan-100/12 dark:via-sky-400/10 dark:to-blue-500/8",
    iconClass: "text-cyan-700 dark:text-cyan-100",
    eyebrowClass: "text-cyan-950 dark:text-slate-200",
    badgeClass:
      "border-cyan-200 bg-cyan-100/70 text-cyan-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
    pointClass: "text-[#8F0709] dark:text-amber-100",
    description:
      "Dành cho hồ sơ có hiệu suất nổi bật trong tháng, độ phủ tốt, lịch sử hợp tác tích cực và mức độ phù hợp cao với các chiến dịch lớn.",
  },
  {
    tier: "A",
    Icon: Crown,
    eyebrow: "Vàng",
    point: "Nổi bật tháng",
    cardClass:
      "border-amber-200/90 bg-[#FFFDF5] dark:border-amber-300/40 dark:bg-gradient-to-br dark:from-amber-100/12 dark:via-amber-500/10 dark:to-yellow-500/8",
    iconClass: "text-amber-700 dark:text-amber-300",
    eyebrowClass: "text-amber-950 dark:text-slate-200",
    badgeClass:
      "border-amber-200 bg-amber-100/70 text-amber-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
    pointClass: "text-[#8F0709] dark:text-amber-100",
    description:
      "Dành cho hồ sơ hoạt động ổn định, thông tin đầy đủ, phản hồi tốt và thường xuyên phù hợp với nhu cầu tuyển chọn của Khách hàng & Đối tác.",
  },
  {
    tier: "B",
    Icon: Medal,
    eyebrow: "Bạc",
    point: "Đánh giá tốt",
    cardClass:
      "border-slate-200/90 bg-[#F9FAFB] dark:border-slate-100/35 dark:bg-gradient-to-br dark:from-slate-50/10 dark:via-slate-300/10 dark:to-slate-500/8",
    iconClass: "text-slate-700 dark:text-slate-100",
    eyebrowClass: "text-slate-900 dark:text-slate-200",
    badgeClass:
      "border-slate-200 bg-slate-100/80 text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
    pointClass: "text-[#8F0709] dark:text-amber-100",
    description:
      "Dành cho hồ sơ có chất lượng hợp tác tốt, tiềm năng phát triển rõ ràng và có thêm dữ liệu đánh giá từ hoạt động trên hệ thống.",
  },
  {
    tier: "C",
    Icon: Award,
    eyebrow: "Đồng",
    point: "Gương mặt mới",
    cardClass:
      "border-orange-200/90 bg-[#FFF9F5] dark:border-orange-200/35 dark:bg-gradient-to-br dark:from-orange-100/12 dark:via-amber-500/12 dark:to-orange-300/8",
    iconClass: "text-orange-700 dark:text-orange-200",
    eyebrowClass: "text-orange-950 dark:text-slate-200",
    badgeClass:
      "border-orange-200 bg-orange-100/70 text-orange-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
    pointClass: "text-[#8F0709] dark:text-amber-100",
    description:
      "Dành cho hồ sơ mới hoặc hồ sơ đang trong giai đoạn hoàn thiện dữ liệu. Đây là nhóm có thể được đề xuất khi phù hợp tiêu chí cơ bản.",
  },
];

export default function TierExplanationDialog({ isOpen, onClose }: TierExplanationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex h-[100dvh] w-screen items-stretch justify-stretch overflow-hidden bg-white/80 dark:bg-[#080914] p-0 md:items-center md:justify-center md:bg-transparent md:p-4">
      <div
        className="absolute inset-0 bg-black/60 dark:bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative flex h-[100dvh] max-h-[100dvh] w-screen flex-col overflow-hidden rounded-none border-0 bg-white text-[#191116] shadow-2xl animate-in fade-in zoom-in-95 duration-200 dark:bg-[#080914] dark:text-white md:h-auto md:max-h-[90vh] md:w-full md:max-w-2xl md:rounded-3xl md:border md:border-[#F0D7D3] dark:md:border-white/10">
        <div className="flex-1 space-y-6 overflow-y-auto p-5 pb-[96px] md:p-8">
          <div className="flex items-start justify-between gap-4 border-b border-[#F0D7D3] pb-4 text-left dark:border-white/5">
            <div className="min-w-0">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-[#8F0709] dark:text-amber-400 sm:whitespace-nowrap">
                Hệ thống danh hiệu OnstageVN
              </span>
              <h3 className="text-lg font-black uppercase tracking-wider text-[#191116] dark:text-white sm:whitespace-nowrap">
                Danh hiệu hiển thị trên hồ sơ
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="hidden shrink-0 rounded-full border border-[#F0D7D3] bg-[#FFF0EE] p-2 text-[#8F0709] shadow-md transition-all hover:bg-[#FDE2DF] active:scale-95 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-slate-800 dark:hover:text-white md:inline-flex cursor-pointer"
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {achievementCards.map(
              ({
                tier,
                Icon,
                eyebrow,
                point,
                cardClass,
                iconClass,
                eyebrowClass,
                badgeClass,
                pointClass,
                description,
              }) => (
                <div
                  key={tier}
                  className={`rounded-2xl border p-4 text-left shadow-xs ${cardClass}`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-4.5 w-4.5 ${iconClass}`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${eyebrowClass}`}>
                        {eyebrow}
                      </span>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase ${badgeClass}`}>
                      Danh hiệu tháng
                    </span>
                  </div>
                  <BadgeTier badge={{ title: point, description, tier }} tier={tier} variant="gradient" className="mt-1" />
                  <p className={`mt-2 text-xs font-bold leading-relaxed ${pointClass}`}>
                    {point}
                  </p>
                  <p className="mt-1.5 text-justify text-xs leading-relaxed text-[#574D54] dark:text-slate-300">
                    {description}
                  </p>
                </div>
              )
            )}

            <div className="rounded-2xl border border-rose-200 bg-[#FFF5F5] p-4 text-left shadow-xs dark:border-rose-500/20 dark:bg-rose-500/5 md:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-400">
                    Đang cập nhật dữ liệu
                  </span>
                </div>
                <span className="rounded-full border border-rose-200 bg-rose-100 px-2 py-0.5 text-[8px] font-black uppercase text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300">
                  Hồ sơ mới
                </span>
              </div>
              <span className="block text-base font-black tracking-wide text-[#191116] dark:text-white">
                Chưa có danh hiệu tháng
              </span>
              <p className="mt-2 text-justify text-xs leading-relaxed text-[#574D54] dark:text-slate-300">
                Hồ sơ cần bổ sung thêm ảnh, video, thông tin cá nhân, portfolio hoặc dữ liệu hoạt động để hệ thống có đủ tín hiệu đánh giá.
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#F0D7D3] bg-[#FFFDFC] p-5 text-left dark:border-white/5 dark:bg-slate-950/60">
            <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#8F0709] dark:text-amber-400">
              <Sparkles className="h-4 w-4 shrink-0 text-[#8F0709] dark:text-amber-400" />
              Danh hiệu được tính như thế nào?
            </h4>
            <ul className="list-inside list-disc space-y-2.5 text-xs text-[#574D54] dark:text-slate-300">
              <li>
                <strong className="text-[#191116] dark:text-white">Hoàn thiện hồ sơ:</strong> ảnh đại diện, ảnh bìa, ảnh toàn thân, video giới thiệu, bio, số đo, kỹ năng và portfolio.
              </li>
              <li>
                <strong className="text-[#191116] dark:text-white">Tín hiệu hợp tác:</strong> lượt booking, phản hồi từ Khách hàng, tỷ lệ hoàn thành việc và chất lượng trao đổi.
              </li>
              <li>
                <strong className="text-[#191116] dark:text-white">Mạng xã hội:</strong> liên kết TikTok, Facebook, Instagram, follower, engagement và độ phủ nội dung thực tế.
              </li>
              <li>
                <strong className="text-[#191116] dark:text-white">Khảo sát chuyên sâu:</strong> dữ liệu kỹ năng như catwalk, posing, MC, acting, livestream và các lĩnh vực nội dung phù hợp.
              </li>
            </ul>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-[#FFFDF5] p-4 dark:border-amber-300/15 dark:bg-amber-300/5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#8F0709] dark:text-amber-300" />
            <div className="text-justify text-xs leading-relaxed text-[#574D54] dark:text-slate-400">
              <strong className="font-bold text-[#8F0709] dark:text-amber-200">Lưu ý:</strong> Danh hiệu là tín hiệu hiển thị theo từng giai đoạn, không phải nhãn đánh giá cố định về con người. Khi hồ sơ có thêm dữ liệu mới, danh hiệu có thể thay đổi theo tháng.
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-[100000] border-t border-[#F0D7D3] bg-white/95 p-4 pb-[calc(16px+env(safe-area-inset-bottom))] backdrop-blur-md dark:border-white/10 dark:bg-[#080914]/95 md:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-xs font-black uppercase tracking-wider text-white shadow-md transition active:scale-95 dark:from-amber-100 dark:via-amber-300 dark:to-yellow-500 dark:text-slate-950 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
