"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Lock, Mail, User, X } from "lucide-react";
import { storeAuthSession } from "@/lib/api-client";
import { syncGuestDraftsAfterNewRegistration } from "@/lib/guest-draft";

type AuthMode = "login" | "register";
type AccountType = "user" | "admin" | string;

const pendingLoginKey = "onstagevn_pending_login";

type AuthResponse = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    type: AccountType;
    status: string;
    external_avatar_url?: string | null;
  };
};

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080/api").replace(/\/$/, "");
}

function getRedirectPath() {
  return "/brand/search";
}

function getStoredAuthUser() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("onstagevn_auth_token");
  const storedUser = localStorage.getItem("onstagevn_auth_user");
  if (!token || !storedUser) return null;

  try {
    return JSON.parse(storedUser) as AuthResponse["user"];
  } catch {
    localStorage.removeItem("onstagevn_auth_user");
    return null;
  }
}

async function parseError(response: Response) {
  const fallback = "Không thể xử lý yêu cầu. Vui lòng thử lại.";

  try {
    const data = await response.json();
    const errors = data?.errors;

    if (errors && typeof errors === "object") {
      const firstError = Object.values(errors).flat().find(Boolean);
      if (typeof firstError === "string") {
        return firstError;
      }
    }

    if (typeof data?.message === "string") {
      return data.message;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const pendingLogin = useMemo(() => {
    if (typeof window === "undefined" || isRegister) {
      return { email: "", password: "", syncGuestDraft: false };
    }

    const stored = sessionStorage.getItem(pendingLoginKey);
    if (!stored) {
      return { email: "", password: "", syncGuestDraft: false };
    }

    try {
      const parsed = JSON.parse(stored) as { email?: string; password?: string; syncGuestDraft?: boolean };
      return {
        email: parsed.email || "",
        password: parsed.password || "",
        syncGuestDraft: parsed.syncGuestDraft === true,
      };
    } catch {
      return { email: "", password: "", syncGuestDraft: false };
    } finally {
      sessionStorage.removeItem(pendingLoginKey);
    }
  }, [isRegister]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(() => pendingLogin.email);
  const [password, setPassword] = useState(() => pendingLogin.password);
  const [shouldSyncGuestDraftAfterLogin] = useState(() => pendingLogin.syncGuestDraft === true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsContent, setTermsContent] = useState("");
  const [hasReadToBottom, setHasReadToBottom] = useState(false);

  useEffect(() => {
    if (showTerms && !termsContent) {
      fetch("/DieuKhoanSuDung.md")
        .then((res) => res.text())
        .then((text) => setTermsContent(text))
        .catch((err) => console.error("Error loading terms:", err));
    }
  }, [showTerms, termsContent]);

  useEffect(() => {
    if (showTerms) {
      setHasReadToBottom(false);
    }
  }, [showTerms]);

  const formatTermsContent = (text: string) => {
    if (!text) return <div className="text-slate-500 animate-pulse text-center py-8">Đang tải điều khoản sử dụng...</div>;

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      const isHeader = /^\d+\.\s+\S+/.test(trimmed);
      if (isHeader) {
        return (
          <h2 key={idx} className="text-sm font-black text-[#F0C56B] uppercase tracking-wider mt-6 mb-3 border-b border-white/5 pb-2">
            {trimmed}
          </h2>
        );
      }

      const isBullet = trimmed.startsWith("-");
      if (isBullet) {
        return (
          <div key={idx} className="flex gap-2 text-xs text-slate-350 ml-4 mb-2 items-start">
            <span className="text-[#F0C56B] select-none shrink-0">•</span>
            <span className="flex-1 text-slate-300 leading-relaxed">{trimmed.substring(1).trim()}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-2.5">
          {trimmed}
        </p>
      );
    });
  };

  const apiUrl = useMemo(() => getApiBaseUrl(), []);

  useEffect(() => {
    const storedUser = getStoredAuthUser();
    if (!storedUser) return;

    const redirectPath = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("redirect")
      : null;

    router.replace(redirectPath?.startsWith("/") ? redirectPath : getRedirectPath());
  }, [router]);


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    const payload = isRegister
      ? {
        name,
        email: normalizedEmail,
        password,
        password_confirmation: password,
      }
      : {
        email: normalizedEmail,
        password,
      };

    try {
      const response = await fetch(`${apiUrl}/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError(await parseError(response));
        return;
      }

      const data = (await response.json()) as AuthResponse;

      if (isRegister) {
        sessionStorage.setItem(pendingLoginKey, JSON.stringify({ email: normalizedEmail, password, syncGuestDraft: true }));
        router.push("/auth/login");
        return;
      }

      storeAuthSession(data.token, data.user);
      if (shouldSyncGuestDraftAfterLogin) {
        await syncGuestDraftsAfterNewRegistration();
      }
      const redirectPath = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("redirect")
        : null;
      router.replace(redirectPath?.startsWith("/") ? redirectPath : getRedirectPath());
    } catch {
      setError("Không kết nối được backend Laravel. Hãy kiểm tra API server đã chạy chưa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-svh flex-col animate-in fade-in duration-700 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/hero_bg.png')" }}
    >
      {/* Dark overlay so the form stays readable */}
      <div className="absolute inset-0 -z-10 bg-[#03050c]/70" />

      {/* Form centred in remaining vertical space */}
      <div className="flex flex-1 flex-col items-center justify-center w-full px-6">

        <div className="w-full max-w-md rounded-2xl glass-panel border-glow-gold p-6 md:p-8 relative">
          {/* Back to Home button */}
          <Link
            href="/"
            className="absolute left-6 top-6 md:left-8 md:top-8 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all duration-300 hover:border-amber-400 hover:bg-amber-500/20 hover:text-amber-300 hover:scale-105 active:scale-95"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="mb-8 text-center">
            {/* App icon — click to go home */}
            <Link href="/" className="inline-flex flex-col items-center gap-0 mb-5 group">
              <img
                src="/icon.png"
                alt="OnstageVN icon"
                className="h-20 w-20 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <img
                src="/logo_text.png"
                alt="OnstageVN"
                className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">
              {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {isRegister
                ? "Bắt đầu với một tài khoản dùng được cả Talent và Brand."
                : "Truy cập không gian quản lý hồ sơ và chiến dịch của bạn."}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Họ tên</span>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-transparent px-4 focus-within:border-amber-400/50">
                  <User className="h-4 w-4 text-amber-300" />
                  <input
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-full flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Email</span>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-transparent px-4 focus-within:border-amber-400/50">
                <Mail className="h-4 w-4 text-amber-300" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-full flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  placeholder="you@example.com"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Mật khẩu</span>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-transparent px-4 focus-within:border-amber-400/50">
                <Lock className="h-4 w-4 text-amber-300" />
                <input
                  required
                  minLength={8}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-full flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  placeholder="Tối thiểu 8 ký tự"
                />
              </div>
            </label>

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 font-bold text-slate-950 shadow-[0_4px_20px_rgba(245,158,11,0.25)] transition-all duration-300 hover:shadow-[0_4px_25px_rgba(245,158,11,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {isRegister ? "Đăng ký" : "Đăng nhập"}
              {!loading ? <ArrowRight className="h-5 w-5" /> : null}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hoặc</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={`${apiUrl}/auth/social/google/redirect`}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 text-xs font-bold uppercase tracking-wider text-slate-200 transition-colors hover:border-amber-400/40 hover:text-amber-300"
            >
              <span className="text-base font-black">G</span>
              Google
            </a>
            <a
              href={`${apiUrl}/auth/social/facebook/redirect`}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 text-xs font-bold uppercase tracking-wider text-slate-200 transition-colors hover:border-blue-400/40 hover:text-blue-300"
            >
              <span className="text-base font-black">f</span>
              Facebook
            </a>
          </div>

          <div className="mt-6 text-center text-sm text-slate-400">
            {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
            <Link href={isRegister ? "/auth/login" : "/auth/register"} className="font-bold text-amber-300 hover:text-amber-200">
              {isRegister ? "Đăng nhập" : "Đăng ký"}
            </Link>
          </div>

          {/* Terms of Use Link */}
          {!isRegister && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-[11px] font-bold text-white hover:text-amber-300 uppercase tracking-widest transition-all cursor-pointer underline hover:scale-105 active:scale-95 duration-200"
              >
                Điều khoản sử dụng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Terms of Use Fullscreen Dialog */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03050c]/90 backdrop-blur-md animate-in fade-in duration-300 p-0 md:p-6">
          <div className="relative w-full h-full md:max-w-4xl md:h-[90svh] md:rounded-2xl border border-white/10 bg-[#08090f] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/15 bg-slate-950/80">
              <div>
                <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                  Điều khoản sử dụng
                </h3>
              </div>
              <button
                onClick={() => setShowTerms(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 hover:border-amber-400 bg-white/5 hover:bg-amber-400/10 text-slate-400 hover:text-amber-400 transition-all cursor-pointer focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              onScroll={(e) => {
                const target = e.currentTarget;
                const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 15;
                if (isAtBottom) {
                  setHasReadToBottom(true);
                }
              }}
              className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-2 text-left bg-gradient-to-b from-[#08090f] to-[#04050a]"
            >
              {formatTermsContent(termsContent)}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/15 bg-slate-950/80 flex justify-end">
              <button
                disabled={!hasReadToBottom}
                onClick={() => setShowTerms(false)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  hasReadToBottom
                    ? "bg-gradient-to-r from-amber-200 to-yellow-600 hover:brightness-110 active:scale-95 text-slate-950 cursor-pointer hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                Tôi đã hiểu và đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
