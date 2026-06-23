"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CrownFundingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/talent/crownfunding/donate");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="animate-pulse text-xs text-slate-500 uppercase tracking-widest font-black">
        Đang chuyển hướng...
      </div>
    </div>
  );
}
