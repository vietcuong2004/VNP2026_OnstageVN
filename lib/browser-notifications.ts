"use client";

const DEFAULT_ICON = "/logo_icon.png";

type BrowserNotificationInput = {
  body?: string;
  tag?: string;
  title: string;
  url?: string | null;
};

function supportsBrowserNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function ensureBrowserNotificationPermission() {
  if (!supportsBrowserNotifications()) return "denied";
  if (Notification.permission !== "default") return Notification.permission;

  return Notification.requestPermission();
}

function shouldShowBrowserNotification() {
  if (!supportsBrowserNotifications()) return false;
  if (Notification.permission !== "granted") return false;

  return document.hidden || !document.hasFocus();
}

export function showBrowserNotification({ body, tag, title, url }: BrowserNotificationInput) {
  if (!shouldShowBrowserNotification()) return null;

  const notification = new Notification(title, {
    body,
    data: { url },
    icon: DEFAULT_ICON,
    tag,
  });

  notification.onclick = () => {
    window.focus();

    const targetUrl = typeof notification.data?.url === "string" ? notification.data.url : null;
    if (targetUrl) {
      window.location.assign(targetUrl);
    }

    notification.close();
  };

  return notification;
}
