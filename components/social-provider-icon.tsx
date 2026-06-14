"use client";

import { cn } from "@/lib/utils";

type SocialProvider = "google" | "facebook";

type SocialProviderIconProps = {
  provider: SocialProvider;
  className?: string;
};

export function SocialProviderIcon({ provider, className }: SocialProviderIconProps) {
  if (provider === "google") {
    return (
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white text-slate-950 shadow-sm sm:h-11 sm:w-11", className)}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[21px] w-[21px] sm:h-5 sm:w-5">
          <path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.3c1.9-1.8 3-4.3 3-7.4z" />
          <path fill="#34A853" d="M12 22c2.7 0 5-0.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0 0 12 22z" />
          <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3A10 10 0 0 0 3 16.6L6.4 14z" />
          <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10 10 0 0 0-9 5.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" />
        </svg>
      </span>
    );
  }

  return (
    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/30 bg-[#1877F2] text-white shadow-sm sm:h-11 sm:w-11", className)}>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 sm:h-[22px] sm:w-[22px]">
        <path fill="currentColor" d="M15.1 8.1h2.1V4.6c-.4-.1-1.7-.2-3.2-.2-3.2 0-5.3 1.9-5.3 5.5v3.1H5.3v3.9h3.4V24h4.1v-7.1h3.4l.5-3.9h-3.9v-2.7c0-1.1.3-2.2 2.3-2.2z" />
      </svg>
    </span>
  );
}
