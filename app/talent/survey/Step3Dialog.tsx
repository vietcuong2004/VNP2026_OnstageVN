"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

export const GUEST_SURVEY_PASSWORD = "Onstage123";

const PENDING_LOGIN_KEY = "onstagevn_pending_login";

type Step3DialogProps = {
  email: string;
  error?: string;
  showContinueSurvey?: boolean;
  onClose: () => void;
  onContinueSurvey: () => void;
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
  showContinueSurvey = true,
  onClose,
  onContinueSurvey,
}: Step3DialogProps) {
  const router = useRouter();
  const normalizedEmail = email.trim().toLowerCase();

  const handleLoginNow = () => {
    rememberSurveyGuestLogin(normalizedEmail);
    router.push("/auth/login?redirect=/talent/survey");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-amber-400/30 bg-[#090a14] p-6 text-left shadow-[0_0_40px_rgba(245,158,11,0.18)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> OnstageVN
            </div>
            <h3 className="font-display text-lg font-black uppercase tracking-wider text-white">
              Tài khoản của bạn đã sẵn sàng
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition-colors hover:border-white/30 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm font-medium leading-relaxed text-slate-200">
          Bạn đã hoàn thiện các thông tin cơ bản của hồ sơ, chúng tôi đã lưu thông tin và tạo tài khoản OnstageVN cho bạn, bạn có thể dùng tài khoản phía dưới để đăng nhập vào hệ thống, hoặc "Làm tiếp bài khảo sát" để chúng tôi đánh giá và phân hạng bạn theo "Hệ thống xếp hạng OnstageVN".
        </p>

        <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Email</span>
            <span className="mt-1 block rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white">
              {normalizedEmail || "Chưa có email"}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Mật khẩu</span>
            <span className="mt-1 block rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-amber-300">
              {GUEST_SURVEY_PASSWORD}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-100">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={handleLoginNow}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 text-xs font-black uppercase tracking-wider text-slate-950 transition-all hover:brightness-110"
          >
            Đăng nhập ngay
          </button>
          {showContinueSurvey && (
            <button
              type="button"
              onClick={onContinueSurvey}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-white/20 bg-transparent text-xs font-black uppercase tracking-wider text-slate-100 transition-all hover:border-amber-400/50 hover:text-amber-300"
            >
              Tiếp tục làm khảo sát
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
