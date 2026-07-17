const DEFAULT_SITE_URL = "https://onstagevn.vercel.app";

export function getSiteUrl() {
  const rawUrl = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).trim().replace(/\/+$/, "");
  const urlWithProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

  try {
    return new URL(urlWithProtocol).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}
