"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_USER_UPDATED_EVENT, clearAuthSession, getAuthToken } from "@/lib/api-client";
import { isPublicPath } from "@/lib/auth-routes";

function subscribeAuthSession(callback: () => void) {
  window.addEventListener(AUTH_USER_UPDATED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_USER_UPDATED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getAuthTokenSnapshot() {
  return getAuthToken() || "";
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useSyncExternalStore(subscribeAuthSession, getAuthTokenSnapshot, () => "");
  const currentPath = pathname || "/";
  const isPublic = isPublicPath(currentPath);

  useEffect(() => {
    if (isPublic || token) return;

    clearAuthSession();

    const query = window.location.search.replace(/^\?/, "");
    const redirectPath = `${currentPath}${query ? `?${query}` : ""}`;
    router.replace(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
  }, [currentPath, isPublic, router, token]);

  if (!isPublic && !token) return null;

  return <>{children}</>;
}
