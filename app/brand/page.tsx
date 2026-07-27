"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BrandRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/brand/search");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#02040a]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4A64A] border-t-transparent" />
    </div>
  );
}
