"use client";

export function safeSetLocalStorage(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;

  const json = typeof value === "string" ? value : JSON.stringify(value);

  try {
    window.localStorage.setItem(key, json);
    return true;
  } catch (error) {
    console.warn(`[localStorage Quota Exceeded] Failed to set item for key "${key}". Sanitizing large media files...`, error);

    if (value && typeof value === "object") {
      try {
        const copy = JSON.parse(JSON.stringify(value)) as Record<string, unknown>;

        const sanitizeObject = (obj: any) => {
          if (!obj || typeof obj !== "object") return;
          for (const k of Object.keys(obj)) {
            const v = obj[k];
            if (typeof v === "string" && v.startsWith("data:") && v.length > 30000) {
              delete obj[k];
            } else if (Array.isArray(v)) {
              obj[k] = v.filter((item) => typeof item !== "string" || !item.startsWith("data:") || item.length <= 30000);
            } else if (v && typeof v === "object") {
              sanitizeObject(v);
            }
          }
        };

        sanitizeObject(copy);
        window.localStorage.setItem(key, JSON.stringify(copy));
        return true;
      } catch (fallbackError) {
        console.error(`[localStorage Quota Exceeded] Sanitized save also failed for key "${key}".`, fallbackError);
      }
    }

    return false;
  }
}
