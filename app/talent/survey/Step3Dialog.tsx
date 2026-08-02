"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Copy, Loader2, LockKeyhole, Sparkles, X } from "lucide-react";
import TierExplanationDialog from "@/components/ui/TierExplanationDialog";

export const GUEST_SURVEY_PASSWORD = "Onstage123";

const PENDING_LOGIN_KEY = "onstagevn_pending_login";

type Step3DialogProps = {
  email: string;
  error?: string;
  isLoginLoading?: boolean;
  showContinueSurvey?: boolean;
  onClose: () => void;
  onContinueSurvey: () => void;
  onLoginNow?: () => Promise<void> | void;
};

export function rememberSurveyGuestLogin(email: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify({
    email: email.trim().toLowerCase(),
    password: GUEST_SURVEY_PASSWORD,
    syncGuestDraft: true,
  }));
}

export default function Step3Dialog({
  email,
  error = "",
  isLoginLoading = false,
  showContinueSurvey = true,
  onClose,
  onContinueSurvey,
  onLoginNow,
}: Step3DialogProps) {
  const router = useRouter();
  const normalizedEmail = email.trim().toLowerCase();
  const [isTierDialogOpen, setIsTierDialogOpen] = useState(false);

  const copyToClipboard = async (value: string) => {
    if (!value || typeof navigator === "undefined") return;
    await navigator.clipboard?.writeText(value);
  };

  const handleLoginNow = async () => {
    if (isLoginLoading) return;

    try {
      await onLoginNow?.();
      rememberSurveyGuestLogin(normalizedEmail);
      router.push("/auth/login?redirect=/talent/survey");
    } catch {
      // Parent displays the error and keeps the dialog open.
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 backdrop-blur-sm md:flex md:items-center md:justify-center md:px-3 md:py-6">
      <div className="relative min-h-dvh w-full overflow-hidden rounded-none border-y border-amber-400/35 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_34%),linear-gradient(180deg,#0a0b13_0%,#050611_100%)] text-left shadow-[0_0_55px_rgba(245,158,11,0.18)] md:min-h-0 md:max-w-2xl md:rounded-[2rem] md:border">
        <div className="pointer-events-none absolute right-8 top-24 hidden text-amber-400/10 md:block">
          <LockKeyhole className="h-24 w-24 stroke-[1.5]" />
        </div>

        <div className="flex items-start justify-between gap-4 px-6 pb-6 pt-7 md:px-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/35 bg-black/20 text-amber-300">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <span className="font-display text-[11px] font-black uppercase tracking-[0.42em] text-amber-300">
                OnstageVN
              </span>
            </div>

            <h3 className="max-w-lg font-display text-2xl font-black leading-tight tracking-tight text-white md:text-3xl">
              Tài khoản của bạn đã sẵn sàng
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-300 transition-all hover:border-white/25 hover:bg-white/15 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-y border-white/5 px-6 py-7 md:px-8">
          <div className="mb-6 flex items-center gap-3 rounded-full border border-amber-400/30 bg-amber-400/5 px-5 py-3 text-sm font-black text-amber-300">
            <Sparkles className="h-4 w-4" />
            Hồ sơ khảo sát đã được lưu
          </div>

          <p className="max-w-xl text-justify text-sm font-semibold leading-relaxed text-slate-300">
            Bạn đã hoàn thiện các thông tin cơ bản của hồ sơ, chúng tôi đã lưu thông tin và tạo tài khoản OnstageVN cho bạn, bạn có thể dùng tài khoản phía dưới để đăng nhập vào hệ thống, hoặc "Làm tiếp bài khảo sát" để chúng tôi đánh giá và phân hạng bạn theo{" "}
            <span className="font-black text-amber-300">"Hệ thống xếp hạng OnstageVN"</span>
            <button
              type="button"
              onClick={() => setIsTierDialogOpen(true)}
              className="ml-2 inline-flex h-5 w-5 translate-y-[-1px] items-center justify-center rounded-full border border-amber-400/70 bg-amber-400/10 align-middle text-[11px] font-black leading-none text-amber-300 transition-all hover:bg-amber-400/20 hover:text-amber-200"
              aria-label="Xem giải thích hệ thống xếp hạng OnstageVN"
            >
              ?
            </button>
            .
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="min-w-0">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Email</span>
                <span className="mt-1 block break-all text-sm font-black text-amber-300">
                  {normalizedEmail || "Chưa có email"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(normalizedEmail)}
                disabled={!normalizedEmail}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Copy email"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="min-w-0">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Mật khẩu</span>
                <span className="mt-1 block break-all text-sm font-black text-amber-300">
                  {GUEST_SURVEY_PASSWORD}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(GUEST_SURVEY_PASSWORD)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300"
                aria-label="Copy mật khẩu"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-100">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 px-6 py-5 md:flex-row md:justify-end md:px-8">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 items-center justify-center rounded-full border border-white/10 bg-transparent px-6 text-xs font-black uppercase tracking-wider text-slate-400 transition-all hover:border-white/25 hover:text-white"
          >
            Để sau
          </button>
          {showContinueSurvey && (
            <button
              type="button"
              onClick={onContinueSurvey}
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-amber-400/35 bg-amber-400/10 px-6 text-xs font-black uppercase tracking-wider text-amber-300 transition-all hover:bg-amber-400/15"
            >
              Tiếp tục làm khảo sát
            </button>
          )}
          <button
            type="button"
            onClick={handleLoginNow}
            disabled={isLoginLoading}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-yellow-500 px-8 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_22px_rgba(245,158,11,0.22)] transition-all hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
          >
            {isLoginLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" /> Đăng nhập ngay
              </>
            )}
          </button>
        </div>
        </div>
      </div>

      <TierExplanationDialog
        isOpen={isTierDialogOpen}
        onClose={() => setIsTierDialogOpen(false)}
      />
    </>
  );
}
