"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Key, LogOut, RefreshCw, CheckCircle, Sparkles, Mail, MessageCircle, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { createZaloLinkCode, getSocialLinkUrl, getStoredAuthUser, loadSocialConnections, loadZaloLinkStatus, logoutCurrentSession, SocialConnection, unlinkSocialConnection, updateAuthEmail, ZaloLinkStatus } from "@/lib/api-client";
import { SocialProviderIcon } from "@/components/social-provider-icon";

type AuthUser = {
  id: number;
  name?: string | null;
  email?: string | null;
  type?: "talent" | "brand";
};

export default function SettingsPage() {
  const router = useRouter();
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "info" }[]>([]);
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [zaloLink, setZaloLink] = useState<ZaloLinkStatus | null>(null);
  const [zaloLoading, setZaloLoading] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [missingEmailFromQuery, setMissingEmailFromQuery] = useState(false);
  const toastIdRef = useRef(0);
  const needsEmail = !authUser?.email;
  const missingEmail = missingEmailFromQuery && needsEmail;

  const addToast = (message: string, type: "success" | "info" = "success") => {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const user = getStoredAuthUser<AuthUser>();
      setAuthUser(user);
      setEmailInput(user?.email ?? "");
      setMissingEmailFromQuery(new URLSearchParams(window.location.search).get("missingEmail") === "1");
    }, 0);

    loadSocialConnections()
      .then(setConnections)
      .catch(() => {
        // Settings should still render if backend auth is not ready.
      });

    loadZaloLinkStatus()
      .then(setZaloLink)
      .catch(() => {
        // Zalo linking is optional while backend deployments roll forward.
      });

    return () => window.clearTimeout(timeout);
  }, []);

  const isLinked = (provider: SocialConnection["provider"]) => {
    return connections.some((connection) => connection.provider === provider);
  };

  const handleLinkSocial = (provider: SocialConnection["provider"]) => {
    window.location.assign(getSocialLinkUrl(provider));
  };

  const handleUnlinkSocial = async (provider: SocialConnection["provider"]) => {
    setSocialLoading(true);
    try {
      await unlinkSocialConnection(provider);
      setConnections((current) => current.filter((connection) => connection.provider !== provider));
      addToast(`Đã hủy liên kết ${provider}.`, "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Chưa thể hủy liên kết.", "info");
    } finally {
      setSocialLoading(false);
    }
  };

  const handleCreateZaloCode = async () => {
    setZaloLoading(true);
    try {
      const status = await createZaloLinkCode();
      setZaloLink(status);
      addToast("Đã tạo mã liên kết Zalo. Hãy nhắn mã này cho Zalo bot.", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Chưa thể tạo mã liên kết Zalo.", "info");
    } finally {
      setZaloLoading(false);
    }
  };

  const handleCopyZaloCode = async () => {
    if (!zaloLink?.code) return;

    try {
      await navigator.clipboard.writeText(zaloLink.code);
      addToast("Đã copy mã liên kết Zalo.", "success");
    } catch {
      addToast("Không thể copy tự động, bạn copy thủ công giúp mình nhé.", "info");
    }
  };

  const handleSaveEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailSaving(true);
    try {
      const user = await updateAuthEmail(emailInput.trim());
      setAuthUser(user);
      setEmailInput(user.email ?? "");
      setMissingEmailFromQuery(false);
      addToast("Đã cập nhật email đăng nhập.", "success");
      router.replace("/talent/settings");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Chưa thể cập nhật email.", "info");
    } finally {
      setEmailSaving(false);
    }
  };

  const handleLogout = async () => {
    addToast("Đang đăng xuất khỏi tài khoản...", "info");
    await logoutCurrentSession();
    router.replace("/auth/login");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push("/talent/dashboard")} 
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#151b2d] bg-[#08090f] text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-tight uppercase leading-none">Cài Đặt</h1>
          <p className="text-xs text-slate-400 mt-2 font-medium">Thiết lập bảo mật tài khoản, thông báo đẩy & tùy chọn hiển thị.</p>
        </div>
      </div>

      <form onSubmit={handleSaveEmail} className={cn(
        "rounded-2xl border bg-[#08090f] p-5 shadow-2xl",
        missingEmail ? "border-amber-400/30" : "border-[#151b2d]",
      )}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Email đăng nhập</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {missingEmail
                  ? "Facebook chưa trả email. Hãy cập nhật email để nhận thông báo và có thể đăng nhập bằng email sau này."
                  : "Email này được dùng cho tài khoản, thông báo và khôi phục đăng nhập."}
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[360px] sm:flex-row">
            <input
              type="email"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              required
              placeholder="ban@example.com"
              className="h-10 min-w-0 flex-1 rounded-xl border border-white/5 bg-slate-900/50 px-3 text-xs text-white outline-none focus:border-amber-400/60"
            />
            <button
              type="submit"
              disabled={emailSaving}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 px-4 text-xs font-black text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
            >
              {emailSaving ? "Đang lưu..." : "Lưu email"}
            </button>
          </div>
        </div>
      </form>

      {/* Settings Options container - styled like dashboard.htm tables */}
      <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] divide-y divide-[#151b2d]/50 overflow-hidden shadow-2xl">
        
        {/* Switch portal */}
        <div 
          onClick={() => {
            addToast("Đang chuyển đổi cổng portal...", "info");
            setTimeout(() => router.push("/"), 800);
          }}
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-950/40 transition-colors duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
              <RefreshCw className="h-4.5 w-4.5 animate-spin-slow" />
            </div>
            <div>
              <span className="block text-xs font-bold text-white">Đổi Cổng Portal</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">Chuyển đổi giao diện sang cổng Nhãn hàng (Brand) hoặc Admin</span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div 
          onClick={() => addToast("Chức năng đổi mật khẩu đang được đồng bộ hóa với hệ thống xác thực.", "info")}
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-950/40 transition-colors duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
              <Key className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-white">Cập Nhật Mật Khẩu</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">Thay đổi mật khẩu đăng nhập tài khoản của bạn để tăng độ bảo mật</span>
            </div>
          </div>
        </div>

        {/* Zalo assistant link */}
        <div className="flex flex-col gap-4 p-5 transition-colors duration-300 hover:bg-slate-950/40 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-400/10 text-sky-300">
              <MessageCircle className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="block text-sm font-black text-white">Liên kết Zalo Assistant</span>
                {zaloLink?.linked ? (
                  <span className="inline-flex h-7 items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                    Đã liên kết
                  </span>
                ) : zaloLink?.status === "pending" ? (
                  <span className="inline-flex h-7 items-center rounded-full border border-amber-400/25 bg-amber-400/10 px-3 text-[10px] font-black uppercase tracking-wider text-amber-300">
                    Chờ xác nhận
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Dùng Zalo bot để tự động gửi thông tin, link social và ảnh portfolio vào đúng hồ sơ OnstageVN của bạn.
              </p>

              {zaloLink?.linked ? (
                <p className="mt-3 text-xs font-semibold text-emerald-300">
                  Zalo đã được liên kết{zaloLink.zalo_account?.display_name ? ` với ${zaloLink.zalo_account.display_name}` : ""}. Tin nhắn tiếp theo với bot sẽ cập nhật vào tài khoản này.
                </p>
              ) : zaloLink?.code ? (
                <div className="mt-4 rounded-2xl border border-sky-400/15 bg-sky-400/[0.04] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sky-200">Mã liên kết của bạn</p>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <code className="inline-flex w-fit rounded-xl border border-white/10 bg-slate-950 px-4 py-2 font-mono text-lg font-black tracking-[0.3em] text-white">
                      {zaloLink.code}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyZaloCode}
                      className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-sky-400/25 bg-sky-400/10 px-4 text-xs font-black text-sky-200 transition-colors hover:bg-sky-400/15"
                    >
                      <Copy className="h-4 w-4" />
                      Copy mã
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    Mở Zalo, nhắn mã này cho tài khoản Zalo bot của OnstageVN. Mã sẽ hết hạn sau khoảng 15 phút.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {!zaloLink?.linked && (
            <button
              type="button"
              disabled={zaloLoading}
              onClick={handleCreateZaloCode}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-sky-400 px-4 text-xs font-black text-slate-950 transition-colors hover:bg-sky-300 disabled:cursor-wait disabled:opacity-60"
            >
              {zaloLoading ? "Đang tạo..." : zaloLink?.code ? "Tạo mã mới" : "Tạo mã liên kết"}
            </button>
          )}
        </div>

        {(["google", "facebook"] as const).map((provider) => {
          const linked = isLinked(provider);
          const label = provider === "google" ? "Google" : "Facebook";

          return (
            <div
              key={`new-${provider}`}
              className="flex gap-3 p-5 transition-colors duration-300 hover:bg-slate-950/40 sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                <SocialProviderIcon provider={provider} />
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-black text-white">{label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                    Dùng tài khoản {label} để đăng nhập vào cùng một tài khoản OnstageVN.
                  </span>
                  <div className="mt-3 flex flex-wrap items-center gap-2 sm:hidden">
                    {linked ? (
                      <>
                        <span className="inline-flex h-8 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 text-[11px] font-black text-emerald-300">
                          Đã liên kết
                        </span>
                        <button
                          type="button"
                          disabled={socialLoading}
                          onClick={() => handleUnlinkSocial(provider)}
                          className="inline-flex h-8 items-center justify-center rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 text-[11px] font-black text-rose-300 transition-colors hover:bg-rose-500/15 disabled:cursor-wait disabled:opacity-60"
                        >
                          Hủy liên kết
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={socialLoading}
                        onClick={() => handleLinkSocial(provider)}
                        className="inline-flex h-8 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400 px-4 text-[11px] font-black text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
                      >
                        Liên kết
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                {linked ? (
                  <>
                    <span className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 text-xs font-black text-emerald-300">
                      Đã liên kết
                    </span>
                    <button
                      type="button"
                      disabled={socialLoading}
                      onClick={() => handleUnlinkSocial(provider)}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 text-xs font-black text-rose-300 transition-colors hover:bg-rose-500/15 disabled:cursor-wait disabled:opacity-60"
                    >
                      Huỷ liên kết
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={socialLoading}
                    onClick={() => handleLinkSocial(provider)}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400 px-4 text-xs font-black text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
                  >
                    Liên kết
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Push Notifications */}
        <div 
          onClick={() => addToast("Cài đặt thông báo đã được lưu thành công.", "success")}
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-950/40 transition-colors duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/25 bg-purple-400/10 text-purple-300">
              <Bell className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-white">Thông Báo Hệ Thống</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">Tùy chỉnh thông báo đẩy qua Email hoặc Điện thoại khi có Brand booking</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div 
          onClick={handleLogout}
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-rose-500/5 transition-colors duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-400">
              <LogOut className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-rose-400">Đăng Xuất Tài Khoản</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">Xóa cookie đăng nhập, phiên hoạt động và rời khỏi hệ thống</span>
            </div>
          </div>
        </div>

      </div>

      {/* Toast system */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`glass-panel border-l-4 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 min-w-[280px] max-w-[400px] ${
              toast.type === "success" ? "border-l-emerald-500" : "border-l-cyan-500"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            ) : (
              <Sparkles className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
            )}
            <p className="text-xs font-semibold text-white leading-snug">{toast.message}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
