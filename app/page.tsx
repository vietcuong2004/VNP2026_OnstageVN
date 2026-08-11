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
    <div className="min-h-[calc(100dvh-4rem)] bg-[#03050c] px-4 py-6 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Discovery Cards Grid */}
        <div className="grid gap-4 grid-cols-1">
          {discoveryCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative aspect-[16/9] overflow-hidden rounded-2xl border border-[#C9A86A]/35 bg-[#10131d] shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition-all duration-300 active:scale-[0.99]"
            >
              <Image
                src={card.image}
                alt={card.title}
                fill
                priority
                sizes="100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03050c]/80 via-transparent to-transparent" />

              <div className="absolute inset-0 z-10 flex flex-col justify-between p-5 text-left">
                <div>
                  <h2 className="text-[1.2rem] font-black leading-tight tracking-tight text-white drop-shadow">
                    {card.title}
                  </h2>
                  <p className="mt-2 max-w-[14rem] text-xs font-semibold leading-relaxed text-white/80">
                    {card.subtitle}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 group-hover:bg-[#F5D76E] group-hover:text-slate-950">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
