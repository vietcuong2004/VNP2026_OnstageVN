"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const discoveryCards = [
  {
    title: "Tìm Idol phù hợp",
    subtitle: "Khám phá hàng trăm KOL, Model, MC, Creater phù hợp với nhu cầu của bạn. Lọc nhanh - Kết nối dễ dàng",
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
    subtitle: "Tìm hiểu về hệ sinh thái của chúng tôi.",
    href: "/about",
    image: "/hero_bg.png",
  },
];

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    if (mediaQuery.matches) {
      router.replace("/about");
    }
  }, [router]);

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[#03050c] px-4 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] pt-5 md:hidden">
      <div className="mx-auto flex w-full flex-col gap-4">
        <div className="grid gap-4">
          {discoveryCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative aspect-[16/9] overflow-hidden rounded-[1.65rem] border border-[#C9A86A]/35 bg-[#10131d] shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition duration-300 active:scale-[0.99]"
            >
              <Image
                src={card.image}
                alt={card.title}
                fill
                priority
                sizes="100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03050c]/70 via-transparent to-transparent" />

              <div className="absolute inset-0 z-10 flex flex-col justify-between p-5">
                <div>
                  <h2 className="max-w-full whitespace-nowrap text-[1.18rem] font-black leading-none tracking-tight text-white drop-shadow">
                    {card.title}
                  </h2>
                  <p className="mt-2 max-w-[10.75rem] text-[11px] font-semibold leading-relaxed text-white/80">
                    {card.subtitle}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/20 text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md transition duration-300 group-hover:bg-[#F5D76E] group-hover:text-slate-950">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
