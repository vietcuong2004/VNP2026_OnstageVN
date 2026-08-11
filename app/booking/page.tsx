"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import BookingFlow from "@/app/brand/talents/[id]/booking-talent/BookingFlow";
import { findTalentById } from "@/lib/brand-mvp-data";
import { loadBrandTalent } from "@/lib/brand-api";

function BookingContent() {
  const searchParams = useSearchParams();
  const talentIdParam = searchParams?.get("talentId") || "";
  const staticTalent = useMemo(() => (talentIdParam ? findTalentById(talentIdParam) : null), [talentIdParam]);
  const [talent, setTalent] = useState(staticTalent);

  useEffect(() => {
    if (!talentIdParam) return;

    let cancelled = false;
    loadBrandTalent(talentIdParam, staticTalent ?? null).then((loaded) => {
      if (!cancelled) setTalent(loaded ?? staticTalent ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [talentIdParam, staticTalent]);

  return (
    <div className="h-dvh w-screen overflow-hidden bg-[#070913] md:bg-slate-950/85 md:backdrop-blur-sm flex items-center justify-center p-0 md:p-4 text-slate-100">
      <div className="h-full w-full md:max-w-2xl md:h-[95vh] md:rounded-3xl md:border md:border-white/10 md:bg-[#070913] md:shadow-2xl md:overflow-hidden relative flex flex-col">
        <BookingFlow talent={talent} className="h-full min-h-0 w-full" />
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070913] flex items-center justify-center text-amber-400 text-xs font-bold uppercase">
        Đang tải trang Booking...
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
