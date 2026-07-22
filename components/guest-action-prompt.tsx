"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api-client";
import { UnsignedInWarning } from "./unsigned-in-warning";

type GuestActionPromptOptions = {
  title?: string;
  description?: string;
  actionLabel?: string;
};

export function useGuestActionPrompt() {
  const router = useRouter();
  const pathname = usePathname();
  const [prompt, setPrompt] = useState<GuestActionPromptOptions | null>(null);

  const requireAuthAction = useCallback((options: GuestActionPromptOptions = {}) => {
    if (getAuthToken()) return true;

    setPrompt(options);
    return false;
  }, []);

  const closePrompt = useCallback(() => setPrompt(null), []);

  const goAuth = useCallback((path: "/auth/login" | "/auth/register") => {
    const redirect = typeof window !== "undefined"
      ? `${pathname || "/"}${window.location.search || ""}`
      : pathname || "/";

    router.push(`${path}?redirect=${encodeURIComponent(redirect)}`);
  }, [pathname, router]);

  const GuestActionPrompt = useCallback(() => {
    return (
      <UnsignedInWarning
        isOpen={prompt !== null}
        onClose={closePrompt}
        title={prompt?.title}
        description={prompt?.description}
        actionLabel={prompt?.actionLabel}
        onRegister={() => goAuth("/auth/register")}
        onLogin={() => goAuth("/auth/login")}
      />
    );
  }, [closePrompt, goAuth, prompt]);

  return { requireAuthAction, GuestActionPrompt };
}
