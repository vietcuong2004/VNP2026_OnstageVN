import { Metadata } from "next";
import { findTalentById } from "@/lib/brand-mvp-data";

function getServerApiBaseUrl() {
  if (process.env.API_PROXY_TARGET) {
    return `${process.env.API_PROXY_TARGET.replace(/\/$/, "")}/api`;
  }
  const publicApi = process.env.NEXT_PUBLIC_API_URL;
  if (publicApi && publicApi.startsWith("http")) {
    return publicApi.replace(/\/$/, "");
  }
  return "http://127.0.0.1:8080/api";
}

function getSiteBaseUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://onstage.vn";
  return siteUrl.replace(/\/$/, "");
}

function normalizeAbsoluteImageUrl(url?: string | null): string {
  const defaultFallback = `${getSiteBaseUrl()}/og_job_banner_default.png`;
  if (!url || typeof url !== "string") return defaultFallback;

  let trimmed = url.trim();
  if (!trimmed) return defaultFallback;

  // Replace localhost and dev ports with relative paths for public metadata URL construction
  const localAppUrlRegex = /^https?:\/\/(127\.0\.0\.1|localhost):8080/i;
  if (localAppUrlRegex.test(trimmed)) {
    trimmed = trimmed.replace(localAppUrlRegex, "");
  }
  const localMinioUrlRegex = /^https?:\/\/(127\.0\.0\.1|localhost):9000\/api-manager-kols\//i;
  if (localMinioUrlRegex.test(trimmed)) {
    trimmed = trimmed.replace(localMinioUrlRegex, "/static/");
  }
  const localStaticUrlRegex = /^https?:\/\/(127\.0\.0\.1|localhost):3000\/static\//i;
  if (localStaticUrlRegex.test(trimmed)) {
    trimmed = trimmed.replace(localStaticUrlRegex, "/static/");
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${getSiteBaseUrl()}${cleanPath}`;
}

const MOJIBAKE_MARKER_PATTERN = /[\u00c2-\u00c6]|\u00e1[\u00ba\u00bb]/;
const MOJIBAKE_MARKER_PATTERN_GLOBAL = /[\u00c2-\u00c6]|\u00e1[\u00ba\u00bb]/g;

function repairMojibake(value: unknown): string {
  if (typeof value !== "string" || !value) return typeof value === "string" ? value : "";
  const text = value.trim();
  if (!MOJIBAKE_MARKER_PATTERN.test(text)) return text;
  try {
    const bytes = Uint8Array.from(Array.from(text).map((char) => char.charCodeAt(0) & 0xff));
    const repaired = new TextDecoder("utf-8").decode(bytes).trim();
    if (!repaired) return text;
    const beforeNoise = (text.match(MOJIBAKE_MARKER_PATTERN_GLOBAL) || []).length;
    const afterNoise = (repaired.match(MOJIBAKE_MARKER_PATTERN_GLOBAL) || []).length;
    return afterNoise < beforeNoise ? repaired : text;
  } catch {
    return text;
  }
}

export async function generateTalentProfileMetadata(id: string): Promise<Metadata> {
  const siteUrl = getSiteBaseUrl();
  const pageUrl = `${siteUrl}/brand/talents/${id}`;
  const staticFallback = findTalentById(id);

  let profile: any = null;

  try {
    const apiBase = getServerApiBaseUrl();
    const endpoint = `${apiBase}/talents/${encodeURIComponent(id)}`;
    const res = await fetch(endpoint, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const json = await res.json();
      profile = json?.data || json;
    }
  } catch (error) {
    console.warn("Failed to fetch talent profile for metadata:", error);
  }

  const rawName = profile?.user?.name || profile?.display_name || profile?.full_name || staticFallback?.name || "Idol";
  const talentName = repairMojibake(rawName).trim() || "Idol";

  // Title format requested: "Hồ sơ idol <tên idol> | OnstageVN"
  const title = `Hồ sơ idol ${talentName} | OnstageVN`;

  // Description format requested: bio
  const rawBio = profile?.bio || profile?.experience || staticFallback?.experience || "";
  const cleanBio = repairMojibake(rawBio).replace(/\s+/g, " ").trim();
  const description = cleanBio && cleanBio.length > 0
    ? (cleanBio.length > 250 ? `${cleanBio.slice(0, 247)}...` : cleanBio)
    : `Xem thông tin chi tiết hồ sơ, hình ảnh, video và đặt lịch biểu diễn cùng ${talentName} trên OnstageVN.`;

  // Meta image: cover image of profile
  const photos = Array.isArray(profile?.photos) ? profile.photos : [];
  const coverPhoto = [...photos].reverse().find((p: any) => p?.category === "cover")?.url
    || [...photos].reverse().find((p: any) => p?.category === "cover")?.path
    || profile?.cover_photo_url
    || profile?.cover_photo
    || profile?.cover_url
    || profile?.cover
    || [...photos].reverse().find((p: any) => p?.category === "lookbook" || p?.category === "full_body")?.url
    || photos[0]?.url
    || profile?.avatar_url
    || profile?.user?.external_avatar_url
    || staticFallback?.cover
    || staticFallback?.avatar
    || "/og_job_banner_default.png";

  const imageUrl = normalizeAbsoluteImageUrl(coverPhoto);

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "OnstageVN",
      type: "profile",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    other: {
      "zalo:title": title,
      "zalo:description": description,
      "zalo:image": imageUrl,
    },
  };
}
