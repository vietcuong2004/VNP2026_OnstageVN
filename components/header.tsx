"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  Building2,
  ChevronDown,
  Heart,
  LogIn,
  LogOut,
  Settings,
  ShieldAlert,
  User,
} from "lucide-react";
import { resolveUnifiedSettingsHref } from "@/components/sidebar";
import { loadTalentProfile, TALENT_PROFILE_UPDATED_EVENT } from "@/lib/talent-api";
import { API_BASE_URL, AUTH_USER_UPDATED_EVENT, logoutCurrentSession } from "@/lib/api-client";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { loadNotifications, NOTIFICATIONS_UPDATED_EVENT } from "@/lib/messaging-api";
import { ensureBrowserNotificationPermission, showBrowserNotification } from "@/lib/browser-notifications";
import { getRealtimeClient } from "@/lib/realtime";
import { loadBrandWishlists } from "@/lib/brand-api";
import { loadGuestSavedTalentIds, SAVED_TALENTS_UPDATED_EVENT } from "@/lib/guest-saved-talents";
import { loadSavedJobsForSession, SAVED_JOBS_UPDATED_EVENT } from "@/lib/saved-jobs";

type AuthUser = {
  id: number;
  name: string;
  email: string | null;
  type?: "user" | "admin" | string | null;
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
  const [open, setOpen] = useState(false);
  const authUserJson = useSyncExternalStore(subscribeAuthUser, authUserSnapshot, () => "");
  const user = authUserJson ? (JSON.parse(authUserJson) as AuthUser) : null;
  const [talentAvatar, setTalentAvatar] = useState<string | null>(null);
  const [talentName, setTalentName] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [savedTalentCount, setSavedTalentCount] = useState(0);
  const [savedJobCount, setSavedJobCount] = useState(0);

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
    ? { name: talentName || user.name, subtitle: user.email || "" }
    : { name: "Khách truy cập", subtitle: "Chưa đăng nhập" };
  const fallbackAvatarSrc = createInitialAvatarDataUrl(label.name, user?.email || label.subtitle);
  const headerAvatarSrc = user
    ? (talentAvatar || user.external_avatar_url || fallbackAvatarSrc)
    : fallbackAvatarSrc;

  useEffect(() => {
    if (!user) return;

    const currentUser = user;
    let cancelled = false;

    async function loadProfileAvatar() {
      try {
        const profile = await loadTalentProfile();
        if (cancelled) return;
        setTalentAvatar(profile?.avatar || fallbackAvatarSrc);
        setTalentName(profile?.name || null);
      } catch {
        if (!cancelled) {
          setTalentAvatar(currentUser.external_avatar_url || fallbackAvatarSrc);
          setTalentName(null);
        }
      }
    }

    loadProfileAvatar();

    return () => {
      cancelled = true;
    };
  }, [fallbackAvatarSrc, user]);

  useEffect(() => {
    if (!user?.id) {
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
    const handleNotification = (notification: RealtimeNotificationPayload) => {
      refreshUnreadCount();

      if (!notification.sent_by_admin_id || !notification.title) return;

      showBrowserNotification({
        title: notification.title,
        body: notification.body,
        tag: `admin-notification-${notification.type ?? "general"}`,
        url: notification.link || "/brand/notifications",
      });
    };
    const handleMessageSent = (event: RealtimeMessageEvent) => {
      refreshUnreadCount();

      const senderName = event.message.sender?.name || "Tin nhắn mới";

      showBrowserNotification({
        title: senderName,
        body: event.message.body,
        tag: `message-${event.message.conversation_id}`,
        url: `/talent/messages?conversationId=${event.message.conversation_id}`,
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
  }, [pathname, user?.id]);

  useEffect(() => {
    if (!user) {
      function refreshGuestSavedTalentCount() {
        setSavedTalentCount(loadGuestSavedTalentIds().length);
      }

      function handleGuestSavedTalentsUpdated(event: Event) {
        const count = (event as CustomEvent<{ count?: number }>).detail?.count;
        if (typeof count === "number") {
          setSavedTalentCount(count);
          return;
        }

        refreshGuestSavedTalentCount();
      }

      window.addEventListener(SAVED_TALENTS_UPDATED_EVENT, handleGuestSavedTalentsUpdated);
      window.addEventListener("storage", refreshGuestSavedTalentCount);
      refreshGuestSavedTalentCount();

      return () => {
        window.removeEventListener(SAVED_TALENTS_UPDATED_EVENT, handleGuestSavedTalentsUpdated);
        window.removeEventListener("storage", refreshGuestSavedTalentCount);
      };
    }

    if (!user.id || !user.capabilities?.includes("brand")) {
      setSavedTalentCount(0);
      return;
    }

    let cancelled = false;

    function refreshSavedTalentCount() {
      loadBrandWishlists([])
        .then((wishlists) => {
          if (cancelled) return;
          setSavedTalentCount(wishlists[0]?.savedIds?.length || 0);
        })
        .catch(() => {
          if (!cancelled) setSavedTalentCount(0);
        });
    }

    function handleSavedTalentsUpdated(event: Event) {
      const count = (event as CustomEvent<{ count?: number }>).detail?.count;
      if (typeof count === "number") {
        setSavedTalentCount(count);
        return;
      }

      refreshSavedTalentCount();
    }

    window.addEventListener(SAVED_TALENTS_UPDATED_EVENT, handleSavedTalentsUpdated);
    refreshSavedTalentCount();

    return () => {
      cancelled = true;
      window.removeEventListener(SAVED_TALENTS_UPDATED_EVENT, handleSavedTalentsUpdated);
    };
  }, [pathname, user?.capabilities, user?.id]);

  useEffect(() => {
    if (user && !user.capabilities?.includes("talent")) {
      setSavedJobCount(0);
      return;
    }

    async function refreshSavedJobCount() {
      const jobs = await loadSavedJobsForSession();
      setSavedJobCount(jobs.length);
    }

    function handleSavedJobsUpdated(event: Event) {
      const count = (event as CustomEvent<{ count?: number }>).detail?.count;
      if (typeof count === "number") {
        setSavedJobCount(count);
        return;
      }

      void refreshSavedJobCount();
    }

    window.addEventListener(SAVED_JOBS_UPDATED_EVENT, handleSavedJobsUpdated);
    window.addEventListener("storage", refreshSavedJobCount);
    void refreshSavedJobCount();

    return () => {
      window.removeEventListener(SAVED_JOBS_UPDATED_EVENT, handleSavedJobsUpdated);
      window.removeEventListener("storage", refreshSavedJobCount);
    };
  }, [user?.capabilities]);

  async function handleLogout() {
    await logoutCurrentSession();
    router.replace("/auth/login");
  }

  async function handleStopImpersonation() {
    await logoutCurrentSession();
    window.location.href = API_BASE_URL.replace(/\/api$/, "") + "/admin";
  }

  const dropdownItems = user
    ? [
        ...(user.capabilities?.includes("talent")
          ? [{ label: "Hồ sơ idol", href: "/talent/profile", icon: User }]
          : []),
        ...(user.capabilities?.includes("brand")
          ? [{ label: "Thông tin Brand", href: "/brand/informations", icon: Building2 }]
          : []),
        { label: "Cài đặt", href: resolveUnifiedSettingsHref(), icon: Settings },
      ]
    : [];
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
            onClick={() => router.push("/about")}
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

        <div className="ml-6 hidden md:flex items-center gap-6">
          {[
            { label: "Idol", href: "/brand/search" },
            { label: "Cơ hội việc làm", href: "/talent/jobs" },
            { label: "Về chúng tôi", href: "/about" },
          ].map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                className={`text-[10px] md:text-[11px] font-display font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "text-amber-300 underline decoration-amber-400 decoration-[2px] underline-offset-6"
                    : "text-slate-400 hover:text-amber-300"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          {(!user || user.capabilities?.includes("brand")) && (
            <button
              type="button"
              onClick={() => router.push("/brand/shortlists")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#C9A86A]/45 bg-[#C9A86A]/12 text-[#C9A86A] shadow-[0_0_14px_rgba(201,168,106,0.12)] transition hover:border-[#C9A86A]/70 hover:bg-[#C9A86A]/18 hover:text-amber-200 active:scale-95"
              aria-label="Idol đã lưu"
              title="Idol đã lưu"
            >
              <Heart className="h-4.5 w-4.5 fill-current" />
              {savedTalentCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-[#070913] bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-1 text-[9px] font-black text-slate-950">
                  {savedTalentCount > 99 ? "99+" : savedTalentCount}
                </span>
              )}
            </button>
          )}

          {(!user || user.capabilities?.includes("talent")) && (
            <button
              type="button"
              onClick={() => router.push("/talent/jobs/saved-jobs")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#C9A86A]/45 bg-[#C9A86A]/12 text-[#C9A86A] shadow-[0_0_14px_rgba(201,168,106,0.12)] transition hover:border-[#C9A86A]/70 hover:bg-[#C9A86A]/18 hover:text-amber-200 active:scale-95"
              aria-label="Việc làm đã lưu"
              title="Việc làm đã lưu"
            >
              <Bookmark className="h-4.5 w-4.5 fill-current" />
              {savedJobCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-[#070913] bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-1 text-[9px] font-black text-slate-950">
                  {savedJobCount > 99 ? "99+" : savedJobCount}
                </span>
              )}
            </button>
          )}

          {user && (
            <button
              type="button"
              onClick={() => router.push("/brand/notifications")}
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
          )}

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
              <ChevronDown className={`hidden h-4 w-4 text-slate-500 transition-transform sm:block ${open ? "rotate-180" : ""}`} />
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

                {user && dropdownItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => {
                        router.push(item.href);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <Icon className="h-4 w-4 text-slate-400" />
                      {item.label}
                    </button>
                  );
                })}

                {user && <div className="border-t border-white/5 my-1.5" />}

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
