"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Sparkles, Shield, ArrowRight } from "lucide-react";
import { loadTalentProfile } from "@/lib/talent-api";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loadTalentProfile()
      .then((profile) => {
        if (cancelled) return;

        if (profile?.isOnboarded) {
          router.replace("/talent/dashboard");
          return;
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center animate-in fade-in duration-500">
      {/* Glowing Logo Icon */}
      <div className="relative mb-2 flex items-center justify-center group">
        <div className="absolute inset-0 -z-10 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl group-hover:scale-125 transition-transform duration-1000 animate-pulse pointer-events-none" />
        <img 
          src="/logo_icon.png" 
          alt="OnstageVN Logo Icon" 
          className="h-24 w-24 object-contain relative z-10 transition-transform duration-700 hover:scale-105" 
        />
      </div>

      <img 
        src="/logo_text.png" 
        alt="OnstageVN Logo Text" 
        className="h-12 md:h-14 object-contain mb-4" 
      />
      
      <p className="mx-auto mb-10 max-w-sm text-sm leading-relaxed text-slate-400">
        Trợ lý phát triển sự nghiệp cá nhân, giúp kiến tạo hồ sơ số chuyên nghiệp và kết nối nhãn hàng tự động.
      </p>

      {/* Feature cards */}
      <div className="mb-10 w-full space-y-3">
        <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-slate-900/30 p-4 text-left backdrop-blur-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Định Hướng AI</h3>
            <p className="text-xs text-slate-400">Khảo sát & đề xuất hướng đi Pageant, Người mẫu sàn diễn, KOL phù hợp.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-slate-900/30 p-4 text-left backdrop-blur-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Hồ Sơ Sắc Đẹp Số</h3>
            <p className="text-xs text-slate-400">Xếp hạng Tier tự động và lưu trữ Rate Card cá nhân.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-slate-900/30 p-4 text-left backdrop-blur-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Bảo Vệ Giao Dịch</h3>
            <p className="text-xs text-slate-400">Tiền cát-xê đặt cọc an toàn, thanh toán minh bạch 48h.</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push("/talent/survey")}
        className="flex h-14 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 font-display font-bold text-slate-950 shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.35)] active:scale-98 transition-all duration-300"
      >
        Bắt Đầu Khám Phá Tiềm Năng <ArrowRight className="ml-2 h-5 w-5" />
      </button>
    </div>
  );
}
