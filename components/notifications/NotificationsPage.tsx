"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Briefcase, CheckCheck, LoaderCircle, MessageSquare, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { getStoredAuthUser, isUnauthenticatedError } from "@/lib/api-client";
import {
  UserNotification,
  deleteNotification,
  loadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notifyNotificationsUpdated,
} from "@/lib/messaging-api";
import { getRealtimeClient } from "@/lib/realtime";

type Props = {
  portal: "brand" | "talent";
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function notificationTarget(portal: Props["portal"], notification: UserNotification) {
  if (notification.data.type === "new_message" && notification.data.conversation_id) {
    return `/${portal}/messages?conversationId=${notification.data.conversation_id}`;
  }

  if (notification.data.type === "campaign_invitation" && notification.data.campaign_id) {
    return portal === "talent"
      ? `/talent/jobs?campaignId=${notification.data.campaign_id}`
      : `/brand/manage-jobs/${notification.data.campaign_id}`;
  }

  if (notification.data.type === "campaign_application" && notification.data.campaign_id) {
    return `/brand/manage-jobs/${notification.data.campaign_id}`;
  }

  if (notification.data.type === "campaign_application_approved" && notification.data.campaign_id) {
    return `/talent/jobs/${notification.data.campaign_id}`;
  }

  if (notification.data.type === "brand_roster_invitation") {
    return portal === "talent" ? "/talent/brands" : "/brand/my-talents";
  }

  if (typeof notification.data.link === "string" && notification.data.link) {
    return notification.data.link;
  }

  return null;
}

function notificationIcon(type?: string) {
  if (type === "new_message") return <MessageSquare className="h-5 w-5" />;
  if (type === "campaign_invitation") return <Briefcase className="h-5 w-5" />;
  if (type === "campaign_application") return <Briefcase className="h-5 w-5" />;
  if (type === "campaign_application_approved") return <Briefcase className="h-5 w-5" />;
  if (type === "brand_roster_invitation") return <Users className="h-5 w-5" />;
  return <Bell className="h-5 w-5" />;
}

export default function NotificationsPage({ portal }: Props) {
  const router = useRouter();
  const authUser = getStoredAuthUser<{ id: number }>();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    const response = await loadNotifications();
    setNotifications(response.data);
    setUnreadCount(response.unread_count);
  };

  useEffect(() => {
    refresh()
      .catch((reason) => {
        if (!isUnauthenticatedError(reason)) {
          setError(reason instanceof Error ? reason.message : "Không tải được thông báo.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!authUser?.id) return;
    const echo = getRealtimeClient();
    if (!echo) return;

    const channel = echo.private(`users.${authUser.id}`);
    const handleNotification = () => {
      refresh().catch(() => undefined);
    };

    channel.notification(handleNotification);

    return () => {
      channel.stopListeningForNotification(handleNotification);
    };
  }, [authUser?.id]);

  const handleRead = async (notification: UserNotification) => {
    try {
      if (!notification.read_at) {
        const response = await markNotificationRead(notification.id);
        setUnreadCount(response.unread_count);
        notifyNotificationsUpdated(response.unread_count);
        setNotifications((current) => current.map((item) => (
          item.id === notification.id ? response.data : item
        )));
      }
    } catch (reason) {
      if (!isUnauthenticatedError(reason)) {
        setError(reason instanceof Error ? reason.message : "Không thể cập nhật thông báo.");
      }
      return;
    }

    const target = notificationTarget(portal, notification);
    if (target) {
      router.push(target);
    }
  };

  const handleReadAll = async () => {
    try {
      const response = await markAllNotificationsRead();
      setUnreadCount(0);
      notifyNotificationsUpdated(response.unread_count);
      setNotifications((current) => current.map((item) => ({
        ...item,
        read_at: item.read_at || new Date().toISOString(),
      })));
    } catch (reason) {
      if (!isUnauthenticatedError(reason)) {
        setError(reason instanceof Error ? reason.message : "Không thể đánh dấu đã đọc.");
      }
    }
  };

  const handleDelete = async (notification: UserNotification) => {
    try {
      const response = await deleteNotification(notification.id);
      setUnreadCount(response.unread_count);
      notifyNotificationsUpdated(response.unread_count);
      setNotifications((current) => current.filter((item) => item.id !== notification.id));
    } catch (reason) {
      if (!isUnauthenticatedError(reason)) {
        setError(reason instanceof Error ? reason.message : "Không thể xóa thông báo.");
      }
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      <header className="flex flex-col gap-4 border-b border-[#F2DBD7] dark:border-[#2B313D] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#8F0709] dark:text-[#C9A86A]">Hệ thống thông báo</p>
          <h1 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-[#191116] dark:text-white">Thông báo</h1>
          <p className="mt-2 text-xs text-[#574D54] dark:text-slate-400">{unreadCount} thông báo chưa đọc.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReadAll}
            disabled={!unreadCount}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#F2DBD7] bg-white px-4 text-xs font-bold text-[#191116] hover:bg-[#FFF0EE] hover:border-[#C72524]/40 disabled:opacity-50 dark:border-[#2B313D] dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <CheckCheck className="h-4 w-4 text-[#C72524] dark:text-amber-400" /> Đánh dấu đã đọc
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${portal}/dashboard`)}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#F2DBD7] bg-[#FFF8F7] px-4 text-xs font-bold text-[#191116] hover:bg-[#FFF0EE] dark:border-[#2B313D] dark:bg-[#171A21] dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </button>
        </div>
      </header>

      {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-300">{error}</div>}

      <section className="overflow-hidden rounded-2xl border border-[#F2DBD7] bg-white shadow-xs dark:border-[#2B313D] dark:bg-[#171A21]">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center text-[#574D54] dark:text-slate-500">
            <LoaderCircle className="h-6 w-6 animate-spin text-[#C72524] dark:text-amber-400" />
          </div>
        ) : notifications.length ? (
          <div className="divide-y divide-[#F2DBD7] dark:divide-[#2B313D]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex w-full items-start gap-3 p-4 transition-colors hover:bg-[#FFF8F7] dark:hover:bg-white/[0.03] ${
                  notification.read_at ? "bg-transparent" : "bg-[#FFF0EE]/50 dark:bg-amber-400/[0.04]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleRead(notification)}
                  className="flex min-w-0 flex-1 gap-4 text-left cursor-pointer"
                >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C72524]/20 bg-[#FFF0EE] text-[#C72524] dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-400">
                  {notificationIcon(notification.data.type)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <strong className="text-xs font-bold text-[#191116] dark:text-white">{notification.data.title || "Thông báo mới"}</strong>
                    <time className="shrink-0 text-[9px] text-[#574D54] dark:text-slate-500">{formatTime(notification.created_at)}</time>
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-[#574D54] dark:text-slate-400">{notification.data.body || ""}</span>
                </span>
                </button>
                {!notification.read_at && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C72524] dark:bg-amber-400" />}
                <button
                  type="button"
                  onClick={() => handleDelete(notification)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#F2DBD7] text-[#574D54] transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-600 dark:border-white/5 dark:text-slate-500 dark:hover:border-red-400/30 dark:hover:bg-red-500/10 dark:hover:text-red-300 cursor-pointer"
                  aria-label="Xóa thông báo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-xs text-[#574D54] dark:text-slate-500">
            <Bell className="h-8 w-8 text-[#C72524] dark:text-slate-500" />
            Chưa có thông báo nào.
          </div>
        )}
      </section>
    </div>
  );
}

