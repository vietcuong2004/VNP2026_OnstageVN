"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase, Search, Star } from "lucide-react";
import Footer from "@/components/footer";

const discoveryCards = [
  {
    id: "idols",
    title: "Tìm Idol phù hợp",
    subtitle: "Khám phá hàng trăm KOL, Model, MC, Creator phù hợp với nhu cầu của bạn.",
    href: "/brand/search",
    image: "/discovery-idols.png",
    lightImage: "/discovery-idols-light.jpg",
    icon: Search,
  },
  {
    id: "jobs",
    title: "Cơ hội việc làm",
    subtitle: "Hàng trăm Job mới mỗi ngày từ các thương hiệu uy tín. Tìm cơ hội phù hợp và bứt phá sự nghiệp.",
    href: "/talent/jobs",
    image: "/discovery-jobs.png",
    lightImage: "/discovery-jobs-light.jpg",
    icon: Briefcase,
  },
  {
    id: "about",
    title: "Về OnstageVN",
    subtitle: "Tìm hiểu về hệ sinh thái và giải pháp kết nối giữa tài năng đỉnh cao và những cơ hội tỏa sáng.",
    href: "/about",
    image: "/hero_bg.png",
    lightImage: "/hero_bg.png",
    icon: Star,
  },
];

export default function RootPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F6] text-[#191116] dark:bg-[#03050c] dark:text-white transition-colors duration-300">
      {/* ── MOBILE HOMEPAGE (UNTOUCHED) ── */}
      <div className="min-h-[calc(100dvh-4rem)] bg-white px-4 py-6 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] dark:bg-[#03050c] md:hidden">
        <div className="pointer-events-none fixed inset-x-0 top-16 h-56 bg-white dark:bg-transparent" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="grid grid-cols-1 gap-5">
            {discoveryCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group relative aspect-[16/9] overflow-hidden rounded-[1.55rem] border border-[#E8CF91]/70 bg-white shadow-[0_18px_42px_rgba(25,17,22,0.06)] transition-all duration-300 active:scale-[0.99] dark:rounded-2xl dark:border-[#C9A86A]/35 dark:bg-[#10131d] dark:shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
              >
                <Image
                  src={card.lightImage}
                  alt={card.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover opacity-[0.92] transition duration-700 group-hover:scale-105 dark:hidden"
                />
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="100vw"
                  className="hidden object-cover opacity-100 transition duration-700 group-hover:scale-105 dark:block"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.9)_38%,rgba(255,255,255,0.18)_74%,rgba(255,255,255,0)_100%)] dark:bg-gradient-to-t dark:from-black/90 dark:via-black/50 dark:to-black/20" />
                <div className="absolute inset-0 bg-transparent dark:bg-gradient-to-t dark:from-[#03050c]/80 dark:via-transparent dark:to-transparent" />

                <div className="absolute inset-0 z-10 flex flex-col justify-between p-5 text-left">
                  <div>
                    <h2 className="max-w-[11rem] text-[1.28rem] font-black leading-tight tracking-tight text-[#8F0709] dark:text-white dark:drop-shadow">
                      {card.title}
                    </h2>
                    <p className="mt-3 max-w-[13.2rem] text-[0.78rem] font-bold leading-relaxed text-[#574D54] dark:text-white/80">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E8CF91]/70 bg-[linear-gradient(135deg,#8F0709_0%,#A91416_50%,#C72524_100%)] text-white shadow-[0_10px_22px_rgba(25,17,22,0.12)] transition-all duration-300 group-hover:scale-105 dark:h-10 dark:w-10 dark:border-white/20 dark:bg-white/10 dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] dark:backdrop-blur-md dark:group-hover:bg-[#F5D76E] dark:group-hover:text-slate-950">
                    <ArrowRight className="h-5 w-5 !text-white" style={{ color: "#ffffff" }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── DESKTOP HOMEPAGE ── */}
      <div className="hidden md:block max-w-6xl mx-auto px-6 py-10 space-y-7">
        {discoveryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              className="group relative overflow-hidden rounded-[2rem] border border-[#F0D7D3] bg-white shadow-sm transition-all duration-500 hover:border-[#8F0709] hover:shadow-xl dark:border-white/10 dark:bg-[#0c0d14]"
            >
              {/* Right Side Cover Image with Left Edge Fading Gradient */}
              <div className="absolute right-0 top-0 bottom-0 w-[58%] overflow-hidden">
                <Image
                  src={card.lightImage}
                  alt={card.title}
                  fill
                  priority={card.id === "idols"}
                  className="object-cover object-right transition-transform duration-700 group-hover:scale-105 dark:hidden"
                />
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="hidden object-cover object-right transition-transform duration-700 group-hover:scale-105 dark:block"
                />
                {/* Gradient overlay to blend left white card into image */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#0c0d14] dark:via-[#0c0d14]/80 dark:to-transparent" />
              </div>

              {/* Left Content Area */}
              <div className="relative z-10 p-8 lg:p-10 max-w-[50%] flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0EE] border border-[#F0D7D3] text-[#8F0709] shadow-xs transition-transform duration-300 group-hover:scale-110 dark:bg-amber-400/10 dark:border-amber-400/20 dark:text-amber-300">
                      <Icon className="h-5 w-5 stroke-[2.2]" />
                    </div>
                    <h2 className="font-serif text-2xl lg:text-3xl font-extrabold text-[#8F0709] tracking-tight leading-snug dark:text-white">
                      {card.title}
                    </h2>
                  </div>
                  <p className="mt-3 text-xs lg:text-sm font-medium leading-relaxed text-[#574D54] dark:text-slate-400">
                    {card.subtitle}
                  </p>
                </div>

                <Link
                  href={card.href}
                  className="mt-6 inline-flex items-center gap-3 w-fit group/btn"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-white shadow-md transition-transform duration-300 group-hover/btn:scale-110 dark:bg-amber-400 dark:text-slate-950">
                    <ArrowRight className="h-4.5 w-4.5 stroke-[2.5] !text-white" style={{ color: "#ffffff" }} />
                  </div>
                  <span className="text-xs lg:text-sm font-black uppercase tracking-wider text-[#8F0709] transition-colors group-hover/btn:underline dark:text-white">
                    Khám phá ngay
                  </span>
                </Link>
              </div>
            </div>
          );
        })}

        {/* ── DESKTOP FOOTER ── */}
        <Footer />
      </div>
    </div>
  );
}
