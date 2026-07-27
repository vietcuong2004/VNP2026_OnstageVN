"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TalentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/talent/jobs");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#02040a]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
    </div>
  );
}
