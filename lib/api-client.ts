"use client";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080/api").replace(/\/$/, "");

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
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("onstagevn_auth_token");
  window.localStorage.removeItem("onstagevn_auth_user");
}

export async function parseApiError(response: Response) {
  const fallback = "Không thể xử lý yêu cầu. Vui lòng thử lại.";

  try {
    const data = await response.json();
    const errors = data?.errors;

    if (errors && typeof errors === "object") {
      const firstError = Object.values(errors).flat().find(Boolean);
      if (typeof firstError === "string") return firstError;
    }

    if (typeof data?.message === "string") return data.message;
  } catch {
    return fallback;
  }

  return fallback;
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildHeaders(defaultHeaders: Record<string, string>, extraHeaders?: HeadersInit) {
  const headers = new Headers(extraHeaders);

  Object.entries(defaultHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  Object.entries(authHeaders()).forEach(([key, value]) => {
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

export async function apiJson<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
    }, init.headers),
  });

  if (!response.ok) {
    if (response.status === 401) clearAuthSession();
    throw new Error(await parseApiError(response));
  }

  return parseApiResponse<T>(response);
}

export async function switchCurrentPlatform(type: "talent" | "brand") {
  const response = await apiJson<{
    user: {
      id: number;
      name: string;
      email: string;
      type: "talent" | "brand";
      status: string;
      external_avatar_url?: string | null;
    };
  }>("/auth/platform", {
    method: "PUT",
    body: JSON.stringify({ type }),
  });

  storeAuthUser(response.user);

  return response.user;
}

export async function apiForm<T>(path: string, formData: FormData, init: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method: init.method ?? "POST",
    headers: buildHeaders({
      Accept: "application/json",
    }, init.headers),
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) clearAuthSession();
    throw new Error(await parseApiError(response));
  }

  return parseApiResponse<T>(response);
}
