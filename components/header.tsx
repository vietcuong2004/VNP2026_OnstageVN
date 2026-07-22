"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Calendar, ChevronDown, LogIn, LogOut, Search, UserCircle, Building2, Settings, ShieldAlert } from "lucide-react";
import { loadTalentProfile, TALENT_PROFILE_UPDATED_EVENT } from "@/lib/talent-api";
import { API_BASE_URL, AUTH_USER_UPDATED_EVENT, logoutCurrentSession, switchCurrentPlatform } from "@/lib/api-client";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { loadNotifications, NOTIFICATIONS_UPDATED_EVENT } from "@/lib/messaging-api";
import { ensureBrowserNotificationPermission, showBrowserNotification } from "@/lib/browser-notifications";
import { getRealtimeClient } from "@/lib/realtime";

type AuthUser = {
  id: number;
  name: string;
  email: string | null;
  type: "talent" | "brand";
  status: string;
  capabilities?: Array<"talent" | "brand">;
  external_avatar_url?: string | null;
  impersonation?: {
    active: boolean;
    admin?: {
      id: number;
      name: string | null;
      email: string | null;
    };
  };
};

type RealtimeNotificationPayload = {
  type?: string;
  title?: string;
  body?: string;
  link?: string | null;
  conversation_id?: number;
  sender_user_id?: number;
  sent_by_admin_id?: number;
};

type RealtimeMessageEvent = {
  message: {
    id: number;
    body: string;
    conversation_id: number;
    sender?: {
      id: number;
      name?: string | null;
    };
  };
};

type TalentProfileStorage = {
  avatar?: string | null;
  name?: string | null;
};

function readTalentProfileHeader() {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem("vnp_talent_profile");
  if (!stored) return null;

  try {
    const profile = JSON.parse(stored) as TalentProfileStorage;
    return {
      avatar: profile.avatar || null,
      name: profile.name || null,
    };
  } catch {
    return null;
  }
}

function readAuthUser() {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem("onstagevn_auth_user");
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    window.localStorage.removeItem("onstagevn_auth_user");
    return null;
  }
}

function authUserSnapshot() {
  const user = readAuthUser();
  return user ? JSON.stringify(user) : "";
}

function subscribeAuthUser(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AUTH_USER_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AUTH_USER_UPDATED_EVENT, onStoreChange);
  };
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isBrandPath = pathname.startsWith("/brand");
  const [open, setOpen] = useState(false);
  const authUserJson = useSyncExternalStore(subscribeAuthUser, authUserSnapshot, () => "");
  const user = authUserJson ? (JSON.parse(authUserJson) as AuthUser) : null;
  const [talentAvatar, setTalentAvatar] = useState<string | null>(null);
  const [talentName, setTalentName] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  // Header remains always visible

  useEffect(() => {
    function syncTalentProfileHeader() {
      const profile = readTalentProfileHeader();
      setTalentAvatar(profile?.avatar || null);
      setTalentName(profile?.name || null);
    }

    syncTalentProfileHeader();
    window.addEventListener(TALENT_PROFILE_UPDATED_EVENT, syncTalentProfileHeader);
    window.addEventListener("storage", syncTalentProfileHeader);

    return () => {
      window.removeEventListener(TALENT_PROFILE_UPDATED_EVENT, syncTalentProfileHeader);
      window.removeEventListener("storage", syncTalentProfileHeader);
    };
  }, []);

  const label = user
    ? { name: !isBrandPath && talentName ? talentName : user.name, subtitle: user.email || "" }
    : { name: "Khách truy cập", subtitle: "Chưa đăng nhập" };
  const fallbackAvatarSrc = createInitialAvatarDataUrl(label.name, user?.email || label.subtitle);
  const headerAvatarSrc = user
    ? (isBrandPath ? (user.external_avatar_url || "/logo.png") : (talentAvatar || fallbackAvatarSrc))
    : fallbackAvatarSrc;
  const nextPlatform = isBrandPath ? "talent" : "brand";
  const nextPlatformPath = nextPlatform === "brand" ? "/brand/dashboard" : "/talent/dashboard";
  const nextPlatformLabel = nextPlatform === "brand" ? "Chuyển sang Brand" : "Chuyển sang Talent";

  async function handleSwitchPlatform() {
    if (!user) return;

    setOpen(false);

    try {
      await switchCurrentPlatform(nextPlatform);
      router.push(nextPlatformPath);
    } catch (error) {
      console.error("Failed to switch platform", error);
    }
  }

  useEffect(() => {
    if (!user || isBrandPath) return;

    let cancelled = false;

    async function loadProfileAvatar() {
      try {
        const profile = await loadTalentProfile();
        if (cancelled) return;
        setTalentAvatar(profile?.avatar || fallbackAvatarSrc);
        setTalentName(profile?.name || null);
      } catch {
        if (!cancelled) {
          setTalentAvatar(fallbackAvatarSrc);
          setTalentName(null);
        }
      }
    }

    loadProfileAvatar();

    return () => {
      cancelled = true;
    };
  }, [fallbackAvatarSrc, isBrandPath, user]);

  useEffect(() => {
    if (!user?.id) {
      setUnreadNotifications(0);
      return;
    }

    let cancelled = false;

    async function refreshUnreadCount() {
      try {
        const response = await loadNotifications();
        if (!cancelled) setUnreadNotifications(response.unread_count);
      } catch {
        if (!cancelled) setUnreadNotifications(0);
      }
    }

    const handleNotificationsUpdated = (event: Event) => {
      const unreadCount = (event as CustomEvent<{ unreadCount?: number }>).detail?.unreadCount;
      if (typeof unreadCount === "number") {
        setUnreadNotifications(unreadCount);
        return;
      }

      refreshUnreadCount();
    };

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);

    refreshUnreadCount();
    ensureBrowserNotificationPermission().catch(() => undefined);

    const echo = getRealtimeClient();
    const channel = echo?.private(`users.${user.id}`);
    const portal = isBrandPath ? "brand" : "talent";
    const handleNotification = (notification: RealtimeNotificationPayload) => {
      refreshUnreadCount();

      if (!notification.sent_by_admin_id || !notification.title) return;

      showBrowserNotification({
        title: notification.title,
        body: notification.body,
        tag: `admin-notification-${notification.type ?? "general"}`,
        url: notification.link || `/${portal}/notifications`,
      });
    };
    const handleMessageSent = (event: RealtimeMessageEvent) => {
      refreshUnreadCount();

      const senderName = event.message.sender?.name || "Tin nhắn mới";

      showBrowserNotification({
        title: senderName,
        body: event.message.body,
        tag: `message-${event.message.conversation_id}`,
        url: `/${portal}/messages?conversationId=${event.message.conversation_id}`,
      });
    };

    channel?.notification(handleNotification);
    channel?.listen(".message.sent", handleMessageSent);

    return () => {
      cancelled = true;
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);
      channel?.stopListeningForNotification(handleNotification);
      channel?.stopListening(".message.sent", handleMessageSent);
    };
  }, [isBrandPath, pathname, user?.id]);

  async function handleLogout() {
    await logoutCurrentSession();
    router.replace("/auth/login");
  }

  async function handleStopImpersonation() {
    await logoutCurrentSession();
    window.location.href = API_BASE_URL.replace(/\/api$/, "") + "/admin";
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
    {user?.impersonation?.active && (
      <div className="relative z-[60] flex min-h-10 w-full items-center justify-between gap-3 border-b border-amber-400/20 bg-amber-400 px-4 py-2 text-slate-950 md:px-8">
        <div className="flex min-w-0 items-center gap-2 text-xs font-black uppercase tracking-wide">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span className="truncate">
            Đang đăng nhập với tư cách {label.name}
            {user.impersonation.admin?.name ? ` bởi ${user.impersonation.admin.name}` : ""}
          </span>
        </div>
        <button
          type="button"
          onClick={handleStopImpersonation}
          className="shrink-0 rounded-lg border border-slate-950/20 bg-slate-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-amber-200 transition-colors hover:bg-slate-900"
        >
          Thoát giả lập
        </button>
      </div>
    )}
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b border-white/5 bg-[#070913] px-4 md:px-8 transform translate-z-0">
      <div className="flex w-auto md:w-72 shrink-0 items-center">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 hover:opacity-95 transition-opacity focus:outline-none cursor-pointer"
        >
          <img
            src="/logo_new.png"
            alt="OnstageVN Logo Icon"
            className="h-9 w-auto sm:h-10 object-contain shrink-0"
          />
          <img
            src="/logo_text.png"
            alt="OnstageVN Logo Text"
            className="h-6 w-auto sm:h-7 object-contain shrink-0"
          />
        </button>
      </div>

      <div className="ml-4 hidden md:flex max-w-md flex-1 items-center gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm tài năng, chiến dịch, giao dịch..."
            className="w-full rounded-xl border border-white/5 bg-slate-900/30 py-2 pl-9 pr-4 text-xs text-white transition-all focus:border-amber-400/50 focus:bg-slate-900/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <button
          type="button"
          onClick={() => router.push(isBrandPath ? "/brand/notifications" : "/talent/notifications")}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-slate-900/30 text-slate-400 transition-colors hover:text-white"
          aria-label="Thông báo"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadNotifications > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
              {unreadNotifications > 99 ? "99+" : unreadNotifications}
            </span>
          )}
        </button>

        <div className="relative border-l border-white/5 pl-3.5 md:pl-6">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-3 rounded-xl px-2 py-1 text-left transition-colors hover:bg-white/5"
          >
            <img
              src={headerAvatarSrc}
              alt="Profile avatar"
              onError={(event) => {
                event.currentTarget.src = fallbackAvatarSrc;
              }}
              className="h-9 w-9 rounded-full border border-amber-400/30 object-cover bg-slate-950"
            />
            <div className="hidden sm:block">
              <span className="block text-xs font-bold text-white">{label.name}</span>
              {label.subtitle && <span className="block max-w-32 truncate text-[10px] text-slate-500">{label.subtitle}</span>}
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-64 rounded-xl border border-white/10 bg-[#080b16] p-2 shadow-2xl">
              <div className="flex items-center gap-3 rounded-lg px-3 py-3 border-b border-white/5 mb-1.5">
                <img
                  src={headerAvatarSrc}
                  alt="Profile avatar"
                  onError={(event) => {
                    event.currentTarget.src = fallbackAvatarSrc;
                  }}
                  className="h-9 w-9 rounded-full border border-amber-400/30 object-cover bg-slate-950"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{label.name}</p>
                  <p className="truncate text-xs text-slate-500">{label.subtitle}</p>
                </div>
              </div>

              {/* Navigation Links based on user role */}
              {isBrandPath ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/brand/settings");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Building2 className="h-4 w-4 text-slate-400" />
                    Thông tin brand
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/brand/dashboard");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Tổng quan
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/talent/settings");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Cài đặt
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/talent/portfolio");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <UserCircle className="h-4 w-4 text-slate-400" />
                    Hồ sơ cá nhân
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/talent/calendar");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Lịch trình
                  </button>
                </>
              )}

              <div className="border-t border-white/5 my-1.5" />

              <button
                type="button"
                onClick={user ? handleSwitchPlatform : () => {
                  setOpen(false);
                  router.push(nextPlatformPath);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-400/10 hover:text-amber-100"
              >
                {nextPlatform === "brand" ? <Building2 className="h-4 w-4 text-amber-300" /> : <UserCircle className="h-4 w-4 text-amber-300" />}
                {nextPlatformLabel}
              </button>

              <div className="border-t border-white/5 my-1.5" />

              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-red-200 transition-colors hover:bg-red-500/10 hover:text-red-100"
                >
                  <LogOut className="h-4 w-4 text-red-400" />
                  Đăng xuất
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(pathname || "/")}`)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-400/10 hover:text-amber-100"
                >
                  <LogIn className="h-4 w-4 text-amber-300" />
                  Đăng nhập / Đăng ký
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  );
}
