"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Copy, Loader2, Sparkles, X } from "lucide-react";
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
      router.push("/auth/login?redirect=/talent/profile");
    } catch {
      // Parent displays the error and keeps the dialog open.
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm dark:bg-black/75 md:p-6">
        <div className="relative min-h-0 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#F0D7D3] bg-white text-left text-[#191116] shadow-2xl transition-colors dark:border-amber-400/35 dark:bg-[#080914] dark:text-white dark:shadow-[0_0_55px_rgba(245,158,11,0.18)]">
          {/* Dark Mode Background Radial Accent */}
          <div className="pointer-events-none absolute inset-0 hidden -z-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_34%),linear-gradient(180deg,#0a0b13_0%,#050611_100%)] dark:block" />

          <div className="relative z-10 flex items-start justify-between gap-4 px-6 pb-5 pt-7 md:px-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] dark:border-amber-400/35 dark:bg-black/20 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <span className="font-display text-[11px] font-black uppercase tracking-[0.42em] text-[#8F0709] dark:text-amber-300">
                  OnstageVN
                </span>
              </div>

              <h3 className="max-w-lg font-display text-2xl font-black leading-tight tracking-tight text-[#191116] dark:text-white md:text-3xl">
                Tài khoản của bạn đã sẵn sàng
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] transition-all hover:bg-[#FDE2DF] dark:border-white/10 dark:bg-white/10 dark:text-slate-300 dark:hover:border-white/25 dark:hover:bg-white/15 dark:hover:text-white"
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative z-10 border-y border-[#F0D7D3] px-6 py-6 dark:border-white/5 md:px-8">
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#F0D7D3] bg-[#FFF0EE] px-4 py-2 text-xs font-black text-[#8F0709] dark:border-amber-400/30 dark:bg-amber-400/5 dark:text-amber-300">
              <Sparkles className="h-4 w-4" />
              Hồ sơ đã được lưu
            </div>

            <p className="max-w-xl text-justify text-sm font-medium leading-relaxed text-[#574D54] dark:text-slate-300">
              {showContinueSurvey ? (
                <>
                  Bạn đã hoàn thiện các thông tin cơ bản của hồ sơ, chúng tôi đã lưu thông tin và tạo tài khoản OnstageVN cho bạn, bạn có thể dùng tài khoản phía dưới để đăng nhập vào hệ thống, hoặc &quot;Làm tiếp bài khảo sát&quot; để chúng tôi đánh giá và phân hạng bạn theo{" "}
                  <span className="font-black text-[#8F0709] dark:text-amber-300">&quot;Hệ thống xếp hạng OnstageVN&quot;</span>
                  <button
                    type="button"
                    onClick={() => setIsTierDialogOpen(true)}
                    className="ml-2 inline-flex h-5 w-5 translate-y-[-1px] cursor-pointer items-center justify-center rounded-full border border-[#8F0709]/40 bg-[#FFF0EE] align-middle text-[11px] font-black leading-none text-[#8F0709] transition-all hover:bg-[#FDE2DF] dark:border-amber-400/70 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/20 dark:hover:text-amber-200"
                    aria-label="Xem giải thích hệ thống xếp hạng OnstageVN"
                  >
                    ?
                  </button>
                  .
                </>
              ) : (
                "Bạn đã hoàn thiện các thông tin cơ bản của hồ sơ, chúng tôi đã lưu thông tin và tạo tài khoản OnstageVN cho bạn. Bạn có thể dùng tài khoản phía dưới để đăng nhập vào hệ thống và tiếp tục cập nhật hồ sơ cá nhân."
              )}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#F0D7D3] bg-[#FFFDFC] p-4 dark:border-white/10 dark:bg-black/25">
                <div className="min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-[#8D8088] dark:text-slate-400">Email</span>
                  <span className="mt-1 block break-all text-sm font-black text-[#8F0709] dark:text-amber-300">
                    {normalizedEmail || "Chưa có email"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(normalizedEmail)}
                  disabled={!normalizedEmail}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] transition-all hover:bg-[#FDE2DF] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-amber-400/40 dark:hover:bg-amber-400/10 dark:hover:text-amber-300"
                  aria-label="Copy email"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#F0D7D3] bg-[#FFFDFC] p-4 dark:border-white/10 dark:bg-black/25">
                <div className="min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-[#8D8088] dark:text-slate-400">Mật khẩu</span>
                  <span className="mt-1 block break-all text-sm font-black text-[#8F0709] dark:text-amber-300">
                    {GUEST_SURVEY_PASSWORD}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(GUEST_SURVEY_PASSWORD)}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] transition-all hover:bg-[#FDE2DF] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-amber-400/40 dark:hover:bg-amber-400/10 dark:hover:text-amber-300"
                  aria-label="Copy mật khẩu"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-100">
                {error}
              </div>
            )}
          </div>

          <div className="relative z-10 flex flex-col-reverse gap-3 px-6 py-5 md:flex-row md:justify-end md:px-8">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 cursor-pointer items-center justify-center rounded-full border border-[#F0D7D3] bg-transparent px-6 text-xs font-black uppercase tracking-wider text-[#574D54] transition-all hover:bg-[#FAECEA] hover:text-[#191116] dark:border-white/10 dark:text-slate-400 dark:hover:border-white/25 dark:hover:text-white"
            >
              Để sau
            </button>
            {showContinueSurvey && (
              <button
                type="button"
                onClick={onContinueSurvey}
                className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#8F0709]/30 bg-[#FFF0EE] px-6 text-xs font-black uppercase tracking-wider text-[#8F0709] transition-all hover:bg-[#FDE2DF] dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/15"
              >
                Tiếp tục làm khảo sát
              </button>
            )}
            <button
              type="button"
              onClick={handleLoginNow}
              disabled={isLoginLoading}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-8 text-xs font-black uppercase tracking-wider text-white !text-white light-force-white shadow-md transition-all hover:brightness-110 disabled:cursor-wait disabled:opacity-70 dark:from-amber-300 dark:to-yellow-500 dark:!text-slate-950 dark:shadow-[0_0_22px_rgba(245,158,11,0.22)]"
            >
              {isLoginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin !text-white" /> <span className="!text-white">Đang lưu</span>
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 !text-white" /> <span className="!text-white">Đăng nhập ngay</span>
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

