import { Metadata } from "next";
import { findTalentById } from "@/lib/brand-mvp-data";

function getSiteBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://onstage.vn";
  return siteUrl.replace(/\/$/, "");
}

function getApiEndpoints(id: string): string[] {
  const cleanId = encodeURIComponent(id.trim());
  const urls: string[] = [];

  const internalApi = process.env.INTERNAL_API_URL || process.env.BACKEND_API_URL;
  if (internalApi && internalApi.startsWith("http")) {
    urls.push(`${internalApi.replace(/\/$/, "")}/talents/${cleanId}`);
  }

  const proxyTarget = process.env.API_PROXY_TARGET;
  if (proxyTarget && proxyTarget.startsWith("http")) {
    urls.push(`${proxyTarget.replace(/\/$/, "")}/api/talents/${cleanId}`);
  }

  const publicApi = process.env.NEXT_PUBLIC_API_URL;
  if (publicApi && publicApi.startsWith("http")) {
    urls.push(`${publicApi.replace(/\/$/, "")}/talents/${cleanId}`);
  }

  const siteUrl = getSiteBaseUrl();
  urls.push(`${siteUrl}/api/talents/${cleanId}`);
  urls.push(`https://api.onstage.vn/api/talents/${cleanId}`);
  urls.push(`https://onstage.vn/api/talents/${cleanId}`);
  urls.push(`http://127.0.0.1:8080/api/talents/${cleanId}`);

  return Array.from(new Set(urls));
}

function normalizeAbsoluteImageUrl(url?: string | null): string {
  const siteUrl = getSiteBaseUrl();
  const defaultFallback = `${siteUrl}/og_job_banner_default.png`;
  if (!url || typeof url !== "string") return defaultFallback;

  let trimmed = url.trim();
  if (!trimmed) return defaultFallback;

  // Clean local dev urls
  const localAppUrlRegex = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i;
  if (localAppUrlRegex.test(trimmed)) {
    trimmed = trimmed.replace(localAppUrlRegex, "");
  }

  const localMinioUrlRegex = /^\/api-manager-kols\//i;
  if (localMinioUrlRegex.test(trimmed)) {
    trimmed = trimmed.replace(localMinioUrlRegex, "/static/");
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/Talent_Image/")) {
    return `${siteUrl}${trimmed}`;
  }
  if (trimmed.startsWith("/static/")) {
    return `${siteUrl}${trimmed}`;
  }
  if (trimmed.startsWith("/storage/")) {
    return `${siteUrl}${trimmed}`;
  }
  if (trimmed.startsWith("storage/")) {
    return `${siteUrl}/${trimmed}`;
  }
  if (trimmed.startsWith("avatars/") || trimmed.startsWith("uploads/") || trimmed.startsWith("media/")) {
    return `${siteUrl}/static/${trimmed}`;
  }

  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${siteUrl}${cleanPath}`;
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
  const endpoints = getApiEndpoints(id);

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(endpoint, {
        next: { revalidate: 60 },
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const data = json?.data || json;
        if (data && (data.display_name || data.id || data.user || data.full_name)) {
          profile = data;
          break;
        }
      }
    } catch {
      // Try next endpoint
    }
  }

  // 1. Tên idol (profiles.display_name prioritized)
  const rawName = profile?.display_name
    || profile?.user?.name
    || profile?.full_name
    || staticFallback?.name
    || "Idol";
  const talentName = repairMojibake(rawName).trim() || "Idol";

  // 2. Metadata Title: "<tên idol> - OnstageVN" (Ví dụ: "Trần Ngọc Diệp - OnstageVN")
  const title = talentName && talentName !== "Idol"
    ? `${talentName} - OnstageVN`
    : "Idol - OnstageVN";

  // 3. Meta Description: bio của profile
  const rawBio = profile?.bio || profile?.experience || staticFallback?.experience || "";
  const cleanBio = repairMojibake(rawBio).replace(/\s+/g, " ").trim();
  const description = cleanBio && cleanBio.length > 0
    ? (cleanBio.length > 250 ? `${cleanBio.slice(0, 247)}...` : cleanBio)
    : `Xem thông tin chi tiết hồ sơ, hình ảnh, video và đặt lịch biểu diễn cùng ${talentName} trên OnstageVN.`;

  // 4. Meta Image: cover image từ bảng photos
  const photos = Array.isArray(profile?.photos) ? profile.photos : [];
  
  // Ưu tiên ảnh category cover hoặc có cờ is_cover
  const coverPhotoObj = [...photos].reverse().find((p: any) => 
    p?.category === "cover" || p?.is_cover === true || p?.is_cover === 1 || p?.is_cover === "1"
  );
  
  // Fallback sang lookbook / full_body
  const lookbookPhotoObj = [...photos].reverse().find((p: any) => 
    p?.category === "lookbook" || p?.category === "full_body"
  );

  // Fallback sang ảnh khác bất kỳ (không phải avatar nếu có nhiều ảnh)
  const nonAvatarPhotoObj = [...photos].reverse().find((p: any) => 
    p?.category !== "avatar"
  );

  // Fallback sang avatar hoặc ảnh đầu tiên
  const primaryPhotoObj = photos.find((p: any) => p?.is_primary) || photos[0];

  const selectedPhotoObj = coverPhotoObj || lookbookPhotoObj || nonAvatarPhotoObj || primaryPhotoObj;

  const rawCoverUrl = selectedPhotoObj?.url
    || selectedPhotoObj?.path
    || profile?.cover_photo_url
    || profile?.cover_photo
    || profile?.cover_url
    || profile?.cover
    || profile?.avatar_url
    || profile?.user?.external_avatar_url
    || staticFallback?.cover
    || staticFallback?.avatar
    || "/og_job_banner_default.png";

  const imageUrl = normalizeAbsoluteImageUrl(rawCoverUrl);

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
