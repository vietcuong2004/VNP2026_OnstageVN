"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Flow from "./Flow";
import { findTalentById } from "@/lib/brand-mvp-data";
import { loadBrandTalent } from "@/lib/brand-api";
import { createInitialAvatarDataUrl } from "@/lib/avatar";

function BookingContent() {
  const searchParams = useSearchParams();
  const talentId = searchParams?.get("talentId") || searchParams?.get("id") || "";

  const staticTalent = useMemo(() => (talentId ? findTalentById(talentId) : null), [talentId]);
  const [talent, setTalent] = useState<any>(staticTalent);
  const [loading, setLoading] = useState(Boolean(talentId && !staticTalent));

  useEffect(() => {
    if (!talentId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    loadBrandTalent(talentId, staticTalent ?? null).then((loaded) => {
      if (!cancelled) {
        if (loaded) setTalent(loaded);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [talentId, staticTalent]);

  if (loading) {
    return (
      <div className="booking-flow flex h-dvh w-screen items-center justify-center bg-[#070913] md:bg-slate-950/85 md:backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-[#070913] p-8 border border-white/10 shadow-2xl">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">Đang tải thông tin Idol...</p>
        </div>
      </div>
    );
  }

  const activeTalent = talent || (talentId ? {
    id: talentId,
    name: "Idol",
    avatar: createInitialAvatarDataUrl("Idol", ""),
    location: "Hà Nội",
    talentTypes: ["Model", "KOL"],
  } : null);

  const stepParam = searchParams?.get("step");
  const initialStep = stepParam ? Number(stepParam) : undefined;

  return (
    <div className="booking-flow h-dvh w-screen overflow-hidden bg-[#070913] md:bg-slate-950/85 md:backdrop-blur-sm flex items-center justify-center p-0 md:p-4 text-slate-100">
      <div className="h-full w-full md:max-w-2xl md:h-[95vh] md:rounded-3xl md:border md:border-white/10 md:bg-[#070913] md:shadow-2xl md:overflow-hidden relative flex flex-col">
        <Flow talent={activeTalent} initialStep={initialStep as any} className="h-full min-h-0 w-full" />
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="booking-flow flex h-dvh w-screen items-center justify-center bg-[#070913]">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-[#070913] p-8 border border-white/10 shadow-2xl">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
            <p className="text-xs font-semibold text-slate-400">Đang tải trang Booking...</p>
          </div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
