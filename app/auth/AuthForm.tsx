"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import { storeAuthSession } from "@/lib/api-client";

type AuthMode = "login" | "register";
type AccountType = "talent" | "brand";

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

function getRedirectPath(type: AccountType) {
  return type === "talent" ? "/talent/dashboard" : "/brand/dashboard";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = useMemo(() => getApiBaseUrl(), []);

  useEffect(() => {
    const storedUser = getStoredAuthUser();
    if (!storedUser) return;

    const redirectPath = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("redirect")
      : null;

    router.replace(redirectPath?.startsWith("/") ? redirectPath : getRedirectPath(storedUser.type));
  }, [router]);

  useEffect(() => {
    if (isRegister) return;

    const stored = sessionStorage.getItem(pendingLoginKey);
    if (!stored) return;

    try {
      const pendingLogin = JSON.parse(stored) as { email?: string; password?: string };
      setEmail(pendingLogin.email || "");
      setPassword(pendingLogin.password || "");
    } catch {
      // Ignore invalid temporary data.
    } finally {
      sessionStorage.removeItem(pendingLoginKey);
    }
  }, [isRegister]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const payload = isRegister
      ? {
          name,
          email,
          password,
          password_confirmation: password,
        }
      : {
          email,
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
        sessionStorage.setItem(pendingLoginKey, JSON.stringify({ email, password }));
        router.push("/auth/login");
        return;
      }

      storeAuthSession(data.token, data.user);
      const redirectPath = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("redirect")
        : null;
      router.replace(redirectPath?.startsWith("/") ? redirectPath : getRedirectPath(data.user.type));
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

      <div className="w-full max-w-md rounded-2xl glass-panel border-glow-gold p-6 md:p-8">
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
      </div>
      </div>
    </div>
  );
}
