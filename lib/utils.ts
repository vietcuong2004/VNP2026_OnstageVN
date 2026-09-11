import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeParseDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const normalized = trimmed.includes(" ") && !trimmed.includes("T")
      ? trimmed.replace(" ", "T")
      : trimmed;
    const d = new Date(normalized);
    if (!Number.isNaN(d.getTime())) return d;
    const microFix = normalized.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})?$/, ".$1$2");
    const d2 = new Date(microFix);
    return Number.isNaN(d2.getTime()) ? null : d2;
  }
  return null;
}

export function getSocialHandle(rawUrl: string, rawPlatform?: string): string {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  let url = rawUrl.trim();

  // If user entered just a handle like @username or username without domain
  if (!url.includes("/") && !url.includes(".")) {
    if (url.startsWith("@")) return url;
    const p = (rawPlatform || "").toLowerCase();
    if (p.includes("tiktok") || p.includes("instagram") || p.includes("youtube") || p.includes("thread")) {
      return `@${url}`;
    }
    return url;
  }

  // Ensure protocol for standard URL parser
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const pathname = parsed.pathname;
    const searchParams = parsed.searchParams;
    const platform = (rawPlatform || "").toLowerCase();

    // 1. TikTok
    if (hostname.includes("tiktok.com") || platform.includes("tiktok")) {
      const match = pathname.match(/@([^/?#]+)/);
      if (match && match[1]) {
        return `@${match[1]}`;
      }
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length > 0) {
        const last = segments[segments.length - 1];
        return last.startsWith("@") ? last : `@${last}`;
      }
      return "TikTok";
    }

    // 2. Facebook
    if (hostname.includes("facebook.com") || hostname.includes("fb.com") || platform.includes("facebook")) {
      if (pathname.includes("profile.php") && searchParams.get("id")) {
        return `ID: ${searchParams.get("id")}`;
      }
      if (pathname.startsWith("/share/")) {
        return "Facebook Profile";
      }
      const segments = pathname.split("/").filter(Boolean);
      const filtered = segments.filter(
        (s) => !["people", "p", "profile.php", "pg", "groups", "share"].includes(s.toLowerCase())
      );
      if (filtered.length > 0) {
        return filtered[0];
      }
      return "Facebook";
    }

    // 3. Instagram
    if (hostname.includes("instagram.com") || platform.includes("instagram")) {
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length > 0) {
        const username = segments[0];
        return username.startsWith("@") ? username : `@${username}`;
      }
      return "Instagram";
    }

    // 4. Threads
    if (hostname.includes("threads.net") || platform.includes("thread")) {
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length > 0) {
        const username = segments[0];
        return username.startsWith("@") ? username : `@${username}`;
      }
      return "Threads";
    }

    // 5. YouTube
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be") || platform.includes("youtube")) {
      const match = pathname.match(/@([^/?#]+)/);
      if (match && match[1]) {
        return `@${match[1]}`;
      }
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length > 0) {
        const last = segments[segments.length - 1];
        return last.startsWith("@") ? last : `@${last}`;
      }
      return "YouTube";
    }

    // Generic fallback: clean pathname, remove query params & hash
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      return segments[segments.length - 1];
    }
    return hostname;
  } catch {
    const clean = rawUrl
      .replace(/^https?:\/\/(www\.)?/, "")
      .split(/[?#]/)[0]
      .replace(/\/$/, "");
    const parts = clean.split("/").filter(Boolean);
    return parts[parts.length - 1] || clean;
  }
}

