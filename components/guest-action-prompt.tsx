"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, UserPlus, X } from "lucide-react";
import { getAuthToken } from "@/lib/api-client";

type GuestActionPromptOptions = {
  title?: string;
  description?: string;
  actionLabel?: string;
};

const DEFAULT_TITLE = "Bạn cần đăng nhập để thực hiện thao tác này";
const DEFAULT_DESCRIPTION = "Bạn vẫn có thể xem thông tin public. Những thao tác lưu, gửi, tạo mới hoặc cập nhật dữ liệu hệ thống cần tài khoản OnstageVN.";

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
    if (!prompt) return null;

    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/20 bg-[#080b13] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
          <div className="flex items-start justify-between border-b border-white/8 p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">OnstageVN</p>
              <h3 className="mt-2 text-lg font-black text-white">{prompt.title || DEFAULT_TITLE}</h3>
            </div>
            <button
              type="button"
              onClick={closePrompt}
              className="cursor-pointer rounded-full border border-white/10 p-2 text-slate-400 transition hover:border-white/20 hover:text-white"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 p-5">
            {prompt.actionLabel && (
              <div className="rounded-2xl border border-amber-400/15 bg-amber-400/8 px-4 py-3 text-xs font-bold text-amber-100">
                {prompt.actionLabel}
              </div>
            )}
            <p className="text-sm leading-relaxed text-slate-300">
              {prompt.description || DEFAULT_DESCRIPTION}
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/8 bg-slate-950/35 p-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closePrompt}
              className="cursor-pointer rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              Để sau
            </button>
            <button
              type="button"
              onClick={() => goAuth("/auth/register")}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-amber-200 transition hover:bg-amber-300/15"
            >
              <UserPlus className="h-4 w-4" />
              Đăng ký
            </button>
            <button
              type="button"
              onClick={() => goAuth("/auth/login")}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:brightness-110"
            >
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }, [closePrompt, goAuth, prompt]);

  return { requireAuthAction, GuestActionPrompt };
}
