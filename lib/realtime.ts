"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { API_BASE_URL, getAuthToken } from "@/lib/api-client";

let echo: Echo<"reverb"> | null = null;

export function getRealtimeClient() {
  if (typeof window === "undefined") return null;
  if (echo) return echo;

  const token = getAuthToken();
  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
  if (!token || !key) return null;

  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http";
  const forceTLS = scheme === "https";
  const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? (forceTLS ? 443 : 8081));
  const wsPath = process.env.NEXT_PUBLIC_REVERB_PATH;

  window.Pusher = Pusher;
  echo = new Echo({
    broadcaster: "reverb",
    key,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "127.0.0.1",
    wsPort: port,
    wssPort: port,
    wsPath,
    forceTLS,
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${API_BASE_URL.replace(/\/api$/, "")}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  });

  return echo;
}

export function disconnectRealtimeClient() {
  echo?.disconnect();
  echo = null;
}

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}
