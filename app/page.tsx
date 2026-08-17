"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const discoveryCards = [
  {
    title: "Tìm Idol phù hợp",
    subtitle: "Khám phá hàng trăm KOL, Model, MC, Creator phù hợp với nhu cầu của bạn. Lọc nhanh - Kết nối dễ dàng",
    href: "/brand/search",
    image: "/discovery-idols.png",
  },
  {
    title: "Cơ hội việc làm",
    subtitle: "Hàng trăm Job mới mỗi ngày từ các thương hiệu uy tín. Tìm cơ hội phù hợp và bứt phá sự nghiệp.",
    href: "/talent/jobs",
    image: "/discovery-jobs.png",
  },
  {
    title: "Về OnstageVN",
    subtitle: "Tìm hiểu về hệ sinh thái và giải pháp kết nối giải trí hàng đầu của chúng tôi.",
    href: "/about",
    image: "/hero_bg.png",
  },
];

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      router.replace("/brand/search");
    }
  }, [router]);

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-white px-4 py-6 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] dark:bg-[#03050c] md:hidden">
      <div className="pointer-events-none fixed inset-x-0 top-16 h-56 bg-white dark:bg-transparent" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Discovery Cards Grid */}
        <div className="grid grid-cols-1 gap-5">
          {discoveryCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative aspect-[16/9] overflow-hidden rounded-[1.55rem] border border-[#E8CF91]/70 bg-white shadow-[0_18px_42px_rgba(25,17,22,0.06)] transition-all duration-300 active:scale-[0.99] dark:rounded-2xl dark:border-[#C9A86A]/35 dark:bg-[#10131d] dark:shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
            >
              <Image
                src={card.image}
                alt={card.title}
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-[0.88] transition duration-700 group-hover:scale-105 dark:opacity-100"
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

                <div className="light-keep-white flex h-12 w-12 items-center justify-center rounded-full border border-[#E8CF91]/70 bg-[linear-gradient(135deg,#8F0709_0%,#A91416_50%,#C72524_100%)] text-white shadow-[0_10px_22px_rgba(25,17,22,0.12)] transition-all duration-300 group-hover:scale-105 dark:h-10 dark:w-10 dark:border-white/20 dark:bg-white/10 dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] dark:backdrop-blur-md dark:group-hover:bg-[#F5D76E] dark:group-hover:text-slate-950">
                  <ArrowRight className="h-5 w-5 text-current" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
