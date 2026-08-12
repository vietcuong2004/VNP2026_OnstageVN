"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import BookingFlow from "@/app/brand/talents/[id]/booking-talent/BookingFlow";
import Flow from "./Flow";
import { findTalentById } from "@/lib/brand-mvp-data";
import { loadBrandTalent } from "@/lib/brand-api";

function BookingContent() {
  const searchParams = useSearchParams();
  const talentId = searchParams?.get("talentId") || searchParams?.get("id") || "";

  const staticTalent = useMemo(() => (talentId ? findTalentById(talentId) : null), [talentId]);
  const [talent, setTalent] = useState(staticTalent);

  useEffect(() => {
    if (!talentId) return;

    let cancelled = false;
    loadBrandTalent(talentId, staticTalent ?? null).then((loaded) => {
      if (!cancelled) setTalent(loaded ?? staticTalent ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [talentId, staticTalent]);

  if (talentId) {
    return (
      <div className="h-dvh w-screen overflow-hidden bg-[#070913] md:bg-slate-950/85 md:backdrop-blur-sm flex items-center justify-center p-0 md:p-4 text-slate-100">
        <div className="h-full w-full md:max-w-2xl md:h-[95vh] md:rounded-3xl md:border md:border-white/10 md:bg-[#070913] md:shadow-2xl md:overflow-hidden relative flex flex-col">
          <BookingFlow talent={talent} className="h-full min-h-0 w-full" />
        </div>
      </div>
    );
  }

  const stepParam = searchParams?.get("step");
  const initialStep = stepParam ? Number(stepParam) : undefined;

  return (
    <div className="h-dvh w-screen overflow-hidden bg-[#070913] md:bg-slate-950/85 md:backdrop-blur-sm flex items-center justify-center p-0 md:p-4 text-slate-100">
      <div className="h-full w-full md:max-w-2xl md:h-[95vh] md:rounded-3xl md:border md:border-white/10 md:bg-[#070913] md:shadow-2xl md:overflow-hidden relative flex flex-col">
        <Flow initialStep={initialStep as any} className="h-full min-h-0 w-full" />
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh w-screen items-center justify-center bg-[#070913]">
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
