"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import BookingFlow from "@/app/brand/talents/[id]/booking-talent/BookingFlow";
import { findTalentById } from "@/lib/brand-mvp-data";
import { loadBrandTalent } from "@/lib/brand-api";
import { createInitialAvatarDataUrl } from "@/lib/avatar";

export default function TalentBookingPage() {
  const params = useParams<{ id: string }>();

  const staticTalent = useMemo(() => findTalentById(params.id), [params.id]);
  const [talent, setTalent] = useState<any>(staticTalent);
  const [loading, setLoading] = useState(!staticTalent);

  useEffect(() => {
    let cancelled = false;
    loadBrandTalent(params.id, staticTalent ?? null).then((loaded) => {
      if (!cancelled) {
        if (loaded) setTalent(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [params.id, staticTalent]);

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#070913]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">Đang tải thông tin Idol...</p>
        </div>
      </div>
    );
  }

  const activeTalent = talent || {
    id: params.id,
    name: "Dương Tuyết Vy",
    avatar: createInitialAvatarDataUrl("Dương Tuyết Vy", ""),
    location: "Hà Nội",
    talentTypes: ["Model", "KOL"],
  };

  return (
    <div className="h-dvh overflow-hidden bg-[#070913] text-slate-100">
      <BookingFlow talent={activeTalent} className="h-full min-h-0 w-full" />
    </div>
  );
}
