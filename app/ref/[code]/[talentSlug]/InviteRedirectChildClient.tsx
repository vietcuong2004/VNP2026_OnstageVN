"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api-client";

interface Props {
  code: string;
  talentSlug: string;
}

export default function InviteRedirectChildClient({ code, talentSlug }: Props) {
  const router = useRouter();

  useEffect(() => {
    const trimmedCode = String(code || "").trim();
    const trimmedSlug = String(talentSlug || "").trim();

    if (!trimmedCode || !trimmedSlug) {
      router.replace("/auth/login");
      return;
    }

    const targetPath = `/talent/brands?brand_ref=${encodeURIComponent(trimmedCode)}&inviter=${encodeURIComponent(trimmedSlug)}`;

    if (!getAuthToken()) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(targetPath)}`);
      return;
    }

    router.replace(targetPath);
  }, [code, talentSlug, router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 text-center">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">OnstageVN</p>
        <p className="mt-3 text-sm font-semibold text-slate-300">Đang mở link mời của Talent...</p>
      </div>
    </div>
  );
}
