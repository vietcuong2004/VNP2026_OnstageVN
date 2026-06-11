"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api-client";

export default function BrandInviteRedirectPage() {
  const params = useParams<{ code?: string }>();
  const router = useRouter();

  useEffect(() => {
    const code = String(params.code || "").trim();
    if (!code) {
      router.replace("/auth/login");
      return;
    }

    const targetPath = `/talent/roster?brand_ref=${encodeURIComponent(code)}`;

    if (!getAuthToken()) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(targetPath)}`);
      return;
    }

    router.replace(targetPath);
  }, [params.code, router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 text-center">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">OnstageVN</p>
        <p className="mt-3 text-sm font-semibold text-slate-300">Đang mở link mời Brand...</p>
      </div>
    </div>
  );
}
