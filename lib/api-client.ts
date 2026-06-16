"use client";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080/api").replace(/\/$/, "");
export const AUTH_USER_UPDATED_EVENT = "onstagevn_auth_user_updated";
const TALENT_PROFILE_UPDATED_EVENT = "vnp_talent_profile_updated";

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("onstagevn_auth_token");
}

export function getStoredAuthUser<T = unknown>() {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem("onstagevn_auth_user");
  if (!stored) return null;

  try {
    return JSON.parse(stored) as T;
  } catch {
    window.localStorage.removeItem("onstagevn_auth_user");
    return null;
  }
}

export function storeAuthUser(user: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("onstagevn_auth_user", JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_USER_UPDATED_EVENT));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("onstagevn_auth_token");
  window.localStorage.removeItem("onstagevn_auth_user");
  window.localStorage.removeItem("vnp_talent_profile");
  window.localStorage.removeItem("onstagevn_sent_requests");
  window.sessionStorage.removeItem("onstagevn_pending_login");
  window.dispatchEvent(new Event(AUTH_USER_UPDATED_EVENT));
  window.dispatchEvent(new Event(TALENT_PROFILE_UPDATED_EVENT));
}

export async function logoutCurrentSession() {
  const token = getAuthToken();

  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Local logout still clears the browser session when API is offline.
    }
  }

  clearAuthSession();
}

export async function parseApiError(response: Response) {
  const fallback = "Không thể xử lý yêu cầu. Vui lòng thử lại.";

  try {
    const data = await response.json();
    const errors = data?.errors;

    let message = fallback;
    if (errors && typeof errors === "object") {
      const firstError = Object.values(errors).flat().find(Boolean);
      if (typeof firstError === "string") message = firstError;
    } else if (typeof data?.message === "string") {
      message = data.message;
    }

    if (message === "validation.max.file") {
      return "Dung lượng ảnh vượt quá giới hạn cho phép (tối đa 5MB).";
    }
    return message;
  } catch {
    return fallback;
  }
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function portalHeader() {
  if (typeof window === "undefined") return {};

  if (window.location.pathname.startsWith("/brand")) {
    return { "X-Onstage-Portal": "brand" };
  }

  if (window.location.pathname.startsWith("/talent")) {
    return { "X-Onstage-Portal": "talent" };
  }

  return {};
}

function buildHeaders(defaultHeaders: Record<string, string>, extraHeaders?: HeadersInit) {
  const headers = new Headers(extraHeaders);

  Object.entries(defaultHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  Object.entries(authHeaders()).forEach(([key, value]) => {
    headers.set(key, value);
  });

  Object.entries(portalHeader()).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return headers;
}

async function parseApiResponse<T>(response: Response) {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

type ApiRequestInit = RequestInit & {
  clearAuthOnUnauthorized?: boolean;
};

export async function apiJson<T>(path: string, init: ApiRequestInit = {}) {
  const { clearAuthOnUnauthorized = true, ...requestInit } = init;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    headers: buildHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }, requestInit.headers),
  });

  if (!response.ok) {
    if (response.status === 401 && clearAuthOnUnauthorized) clearAuthSession();
    throw new Error(await parseApiError(response));
  }

  return parseApiResponse<T>(response);
}

export async function switchCurrentPlatform(type: "talent" | "brand") {
  const response = await apiJson<{
    user: {
      id: number;
      name: string;
      email: string | null;
      type: "talent" | "brand";
      status: string;
      capabilities?: Array<"talent" | "brand">;
      external_avatar_url?: string | null;
    };
  }>("/auth/platform", {
    method: "PUT",
    body: JSON.stringify({ type }),
  });

  storeAuthUser(response.user);

  return response.user;
}

export async function updateAuthEmail(email: string) {
  const response = await apiJson<{
    user: {
      id: number;
      name: string;
      email: string | null;
      type: "talent" | "brand";
      status: string;
      capabilities?: Array<"talent" | "brand">;
      external_avatar_url?: string | null;
    };
  }>("/auth/email", {
    method: "PUT",
    body: JSON.stringify({ email }),
  });

  storeAuthUser(response.user);

  return response.user;
}

export type SocialConnection = {
  provider: "google" | "facebook";
  email?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
};

export async function loadSocialConnections() {
  const response = await apiJson<{ connections: SocialConnection[] }>("/auth/social/connections");

  return response.connections;
}

export async function unlinkSocialConnection(provider: SocialConnection["provider"]) {
  return apiJson<{ message: string }>(`/auth/social/connections/${provider}`, {
    method: "DELETE",
  });
}

export function getSocialLinkUrl(provider: SocialConnection["provider"]) {
  const token = getAuthToken();
  const query = new URLSearchParams({ mode: "link" });

  if (token) {
    query.set("token", token);
  }

  return `${API_BASE_URL}/auth/social/${provider}/redirect?${query.toString()}`;
}

export async function apiForm<T>(path: string, formData: FormData, init: ApiRequestInit = {}) {
  const { clearAuthOnUnauthorized = true, ...requestInit } = init;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    method: requestInit.method ?? "POST",
    headers: buildHeaders({
      Accept: "application/json",
    }, requestInit.headers),
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401 && clearAuthOnUnauthorized) clearAuthSession();
    throw new Error(await parseApiError(response));
  }

  return parseApiResponse<T>(response);
}
