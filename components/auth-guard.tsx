"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_USER_UPDATED_EVENT, getAuthToken } from "@/lib/api-client";
import { isPublicPath } from "@/lib/auth-routes";

function subscribeAuthSession(callback: () => void) {
  window.addEventListener(AUTH_USER_UPDATED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_USER_UPDATED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const currentPath = pathname || "/";
  const isPublic = isPublicPath(currentPath);

  useEffect(() => {
    const syncToken = () => setToken(getAuthToken());
    syncToken();

    return subscribeAuthSession(syncToken);
  }, []);

  useEffect(() => {
    if (token === undefined) return;
    if (isPublic || token) return;

    const query = window.location.search.replace(/^\?/, "");
    const redirectPath = `${currentPath}${query ? `?${query}` : ""}`;
    router.replace(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
  }, [currentPath, isPublic, router, token]);

  if (!isPublic && token === undefined) return null;
  if (!isPublic && !token) return null;

  return <>{children}</>;
}
