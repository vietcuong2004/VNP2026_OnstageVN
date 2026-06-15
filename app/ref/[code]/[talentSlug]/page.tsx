"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api-client";

export default function TalentChildInviteRedirectPage() {
  const params = useParams<{ code?: string; talentSlug?: string }>();
  const router = useRouter();

  useEffect(() => {
    const code = String(params.code || "").trim();
    const talentSlug = String(params.talentSlug || "").trim();

    if (!code || !talentSlug) {
      router.replace("/auth/login");
      return;
    }

    const targetPath = `/talent/brands?brand_ref=${encodeURIComponent(code)}&inviter=${encodeURIComponent(talentSlug)}`;

    if (!getAuthToken()) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(targetPath)}`);
      return;
    }

    router.replace(targetPath);
  }, [params.code, params.talentSlug, router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 text-center">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">OnstageVN</p>
        <p className="mt-3 text-sm font-semibold text-slate-300">Dang mo link moi cua Talent...</p>
      </div>
    </div>
  );
}
