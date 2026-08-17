"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { apiJson, getAuthToken, logoutCurrentSession, storeAuthSession } from "@/lib/api-client";

type ActivationPayload = {
  token: string;
  url: string;
  expires_at?: string | null;
  brand?: { id?: number | string; name?: string | null; avatar_url?: string | null } | null;
  talent?: { id?: number | string; name?: string | null; email?: string | null; phone?: string | null; is_ghost?: boolean } | null;
};

export default function TalentActivationPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = String(params?.token || "");

  const [data, setData] = useState<ActivationPayload | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [hasExistingSession, setHasExistingSession] = useState(false);

  useEffect(() => {
    setHasExistingSession(Boolean(getAuthToken()));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLink() {
      setLoading(true);
      setError("");
      try {
        const response = await apiJson<{ data: ActivationPayload }>(`/managed-talent-activation-links/${encodeURIComponent(token)}`, {
          clearAuthOnUnauthorized: false,
        });
        if (cancelled) return;
        setData(response.data);
        setEmail(response.data.talent?.email || "");
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Link kích hoạt không hợp lệ hoặc đã hết hạn.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (token) void loadLink();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleLogoutForActivation() {
    await logoutCurrentSession();
    setHasExistingSession(false);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await apiJson<{ user: unknown; token: string }>(`/managed-talent-activation-links/${encodeURIComponent(token)}/claim`, {
        method: "POST",
        clearAuthOnUnauthorized: false,
        body: JSON.stringify({
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      storeAuthSession(response.token, response.user);
      setDone(true);
      window.setTimeout(() => router.push("/talent"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể kích hoạt tài khoản. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#03050c] px-4 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <section className="w-full rounded-3xl border border-amber-400/20 bg-[#080b15] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)] md:p-8">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">OnstageVN</p>
              <h1 className="mt-1 font-display text-xl font-black uppercase tracking-tight text-white">Kích hoạt tài khoản Talent</h1>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-400">
                Nhận tài khoản Talent đã được Brand tạo sẵn và đặt thông tin đăng nhập của bạn.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-sm font-bold text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang kiểm tra link...
            </div>
          ) : error && !data ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-semibold text-red-200">{error}</div>
          ) : done ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-emerald-300" />
              <p className="mt-3 text-sm font-black text-white">Tài khoản đã được kích hoạt.</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Đang chuyển bạn về trang tổng quan Talent...</p>
            </div>
          ) : hasExistingSession ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                  <div>
                    <p className="text-sm font-black text-white">Bạn đang đăng nhập một tài khoản khác.</p>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">
                      Link này dùng để kích hoạt tài khoản Talent được Brand tạo sẵn. Nếu tài khoản hiện tại đã dùng được hệ thống, bạn không cần kích hoạt lại.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleLogoutForActivation}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 text-xs font-black uppercase tracking-wider text-red-100 transition hover:bg-red-500/15"
                >
                  <LogOut className="h-4 w-4" /> Đăng xuất để kích hoạt
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/talent")}
                  className="flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-200 to-yellow-500 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:brightness-105"
                >
                  Về trang hiện tại
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Talent</p>
                <p className="mt-1 text-lg font-black text-white">{data?.talent?.name || "Talent"}</p>
                <p className="mt-2 text-xs font-semibold text-slate-400">Brand mời: <span className="text-amber-200">{data?.brand?.name || "OnstageVN Brand"}</span></p>
              </div>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email đăng nhập</span>
                <input
                  type="email"
                  name="activation_email"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm font-bold text-[#C72524] outline-none focus:border-amber-400/50"
                  placeholder="ten@email.com"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mật khẩu</span>
                <input
                  type="password"
                  name="activation_password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm font-bold text-[#C72524] outline-none focus:border-amber-400/50"
                  placeholder="Tối thiểu 8 ký tự"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nhập lại mật khẩu</span>
                <input
                  type="password"
                  name="activation_password_confirmation"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm font-bold text-[#C72524] outline-none focus:border-amber-400/50"
                  placeholder="Nhập lại mật khẩu"
                />
              </label>

              {error && <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-xs font-semibold text-red-200">{error}</div>}

              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-200 to-yellow-500 text-xs font-black uppercase tracking-wider text-slate-950 transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Đang kích hoạt..." : "Kích hoạt tài khoản"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}


