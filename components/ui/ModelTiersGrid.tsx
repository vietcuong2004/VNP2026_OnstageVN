import React from "react";
import { Award, Crown, ShieldAlert, Star, Trophy } from "lucide-react";

const tiers = [
  {
    icon: Crown,
    eyebrow: "Celeb / Super VIP",
    score: "90 - 100 điểm",
    title: "Hạng S",
    description: "Hoa hậu Quốc gia, Ngôi sao hạng S.",
    cardClass: "border-amber-400/80 bg-gradient-to-br from-amber-500/20 via-[#221a0a]/95 to-[#070913]/98 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
    iconClass: "text-amber-400 fill-amber-400/10",
    textClass: "text-amber-400",
    titleClass: "bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent",
    badgeClass: "border-amber-400/30 bg-amber-400/20 text-amber-300",
  },
  {
    icon: Trophy,
    eyebrow: "High-end Pro",
    score: "70 - 89 điểm",
    title: "Hạng A",
    description: "Á hậu, Hoa khôi lớn, Siêu mẫu Runway chuyên nghiệp, MC VIP.",
    cardClass: "border-slate-300/60 bg-gradient-to-br from-slate-400/10 via-[#171922]/90 to-[#070913]/95 shadow-[0_0_20px_rgba(203,213,225,0.08)]",
    iconClass: "text-slate-300",
    textClass: "text-slate-300",
    titleClass: "bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400 bg-clip-text text-transparent",
    badgeClass: "border-slate-400/30 bg-slate-400/20 text-slate-200",
  },
  {
    icon: Star,
    eyebrow: "Mid Freelance",
    score: "45 - 69 điểm",
    title: "Hạng B",
    description: "Người mẫu ảnh Lookbook, Micro/Mid-tier KOLs, PG VIP sự kiện cao cấp.",
    cardClass: "border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-[#1a1128]/90 to-[#070913]/95 shadow-[0_0_20px_rgba(168,85,247,0.08)]",
    iconClass: "text-purple-400",
    textClass: "text-purple-400",
    titleClass: "bg-gradient-to-r from-purple-200 to-pink-500 bg-clip-text text-transparent",
    badgeClass: "border-purple-500/30 bg-purple-500/20 text-purple-300",
  },
  {
    icon: Award,
    eyebrow: "Entry / Newbie",
    score: "20 - 44 điểm",
    title: "Hạng C",
    description: "Người mẫu tự do mới vào nghề, diễn viên phụ, PG sự kiện đại trà.",
    cardClass: "border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-[#0e1f1e]/90 to-[#070913]/95 shadow-[0_0_20px_rgba(20,184,166,0.08)]",
    iconClass: "text-teal-400",
    textClass: "text-teal-400",
    titleClass: "bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent",
    badgeClass: "border-teal-500/30 bg-teal-500/20 text-teal-300",
  },
];

export default function ModelTiersGrid() {
  return (
    <section className="relative w-full overflow-hidden rounded-2xl border border-white/5 bg-[#070913]/95 p-4 shadow-2xl transition-all duration-500 sm:p-5 md:rounded-3xl md:p-8">
      <div className="pointer-events-none absolute right-0 top-0 -z-10 h-32 w-32 rounded-full bg-amber-400/5 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-32 w-32 rounded-full bg-purple-500/5 blur-2xl" />

      <div className="space-y-4">
        <span className="block max-w-full text-left text-[10px] font-black uppercase leading-relaxed tracking-[0.18em] text-slate-500 sm:tracking-widest">
          Hệ thống phân hạng người mẫu (Onstage Model Tiers)
        </span>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tiers.map((tier) => {
            const Icon = tier.icon;

            return (
              <div
                key={tier.title}
                className={`group relative min-w-0 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 hover:scale-[1.01] ${tier.cardClass}`}
              >
                <div className="pointer-events-none absolute -right-4 -top-4 h-12 w-12 rounded-full bg-current opacity-5 blur-lg" />
                <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${tier.iconClass}`} />
                    <span className={`min-w-0 truncate text-[8px] font-black uppercase tracking-widest ${tier.textClass}`}>
                      {tier.eyebrow}
                    </span>
                  </div>
                  <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${tier.badgeClass}`}>
                    {tier.score}
                  </span>
                </div>
                <span className={`block font-display text-xl font-black uppercase tracking-wide ${tier.titleClass}`}>
                  {tier.title}
                </span>
                <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-300">
                  {tier.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 shadow-[0_0_15px_rgba(244,63,94,0.04)]">
          <ShieldAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-400" />
          <div className="text-left text-[10.5px] leading-relaxed text-slate-400">
            <strong className="font-bold text-rose-300">Lưu ý:</strong> Các hồ sơ có tổng điểm chẩn đoán{" "}
            <strong className="font-bold text-rose-400">dưới 20 điểm</strong> sẽ tự động được phân loại ở trạng thái{" "}
            <strong className="font-bold text-rose-400">"Chưa xếp hạng / Chờ cập nhật" (Potential Profile)</strong>. Đây là mức điểm cho thấy hồ sơ cần bổ sung thêm hình ảnh, số đo chuẩn hóa hoặc liên kết mạng xã hội để kích hoạt hệ thống chẩn đoán phân hạng.
          </div>
        </div>
      </div>
    </section>
  );
}
