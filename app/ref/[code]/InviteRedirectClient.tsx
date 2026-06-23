"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api-client";

interface Props {
  code: string;
}

export default function InviteRedirectClient({ code }: Props) {
  const router = useRouter();

  useEffect(() => {
    const trimmedCode = String(code || "").trim();
    if (!trimmedCode) {
      router.replace("/auth/login");
      return;
    }

    const targetPath = `/talent/brands?brand_ref=${encodeURIComponent(trimmedCode)}`;

    if (!getAuthToken()) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(targetPath)}`);
      return;
    }

    router.replace(targetPath);
  }, [code, router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 text-center">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">OnstageVN</p>
        <p className="mt-3 text-sm font-semibold text-slate-300">Đang mở link mời Brand...</p>
      </div>
    </div>
  );
}
