import { Metadata } from "next";

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

  const trimmed = url.trim();
  if (!trimmed) return defaultFallback;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${getSiteBaseUrl()}${cleanPath}`;
}

function formatBudgetRange(min?: number | string | null, max?: number | string | null, unit: string = "ngày"): string {
  const minNum = Number(min || 0);
  const maxNum = Number(max || 0);

  const formatNum = (num: number) => {
    if (num >= 1_000_000) {
      const v = (num / 1_000_000).toFixed(1).replace(/\.0$/, "");
      return `${v} triệu`;
    }
    if (num >= 1_000) {
      const v = (num / 1_000).toFixed(0);
      return `${v}k`;
    }
    return num > 0 ? `${num.toLocaleString("vi-VN")}đ` : "";
  };

  if (minNum > 0 && maxNum > 0) {
    if (minNum === maxNum) return `${formatNum(minNum)}/${unit}`;
    return `${formatNum(minNum)} - ${formatNum(maxNum)}/${unit}`;
  }
  if (minNum > 0) return `Từ ${formatNum(minNum)}/${unit}`;
  if (maxNum > 0) return `Tới ${formatNum(maxNum)}/${unit}`;
  return "Thỏa thuận";
}

export async function generateReferralMetadata(options: {
  code?: string;
  campaignSlug?: string;
  referrerSlug?: string;
}): Promise<Metadata> {
  const siteUrl = getSiteBaseUrl();
  const defaultTitle = "Chiến dịch | Onstage VN";
  const defaultDescription = "Khám phá và tham gia các chiến dịch biểu diễn, livestream, đại sứ thương hiệu hấp dẫn dành cho Idol, KOL, KOC tại OnstageVN.";
  const defaultImage = `${siteUrl}/og_job_banner_default.png`;

  let title = defaultTitle;
  let description = defaultDescription;
  let imageUrl = defaultImage;

  try {
    const apiBase = getServerApiBaseUrl();
    let endpoint = "";

    if (options.campaignSlug && options.referrerSlug) {
      endpoint = `${apiBase}/referral-links/campaign/${encodeURIComponent(options.campaignSlug)}/${encodeURIComponent(options.referrerSlug)}`;
    } else if (options.code) {
      endpoint = `${apiBase}/referral-links/${encodeURIComponent(options.code)}`;
    }

    if (endpoint) {
      const res = await fetch(endpoint, {
        next: { revalidate: 60 },
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json?.data || json;

        if (data?.type === "campaign" && data.campaign) {
          const camp = data.campaign;
          const campTitle = camp.title || "Chiến dịch mới";

          title = `${campTitle} | Onstage VN`;

          const details: string[] = [];
          const location = camp.city || camp.location;
          if (location) details.push(`📍 ${location}`);

          const budgetStr = formatBudgetRange(camp.budget_min, camp.budget_max, camp.budget_unit || "ngày");
          if (budgetStr) details.push(`💰 ${budgetStr}`);

          if (camp.application_deadline) {
            const d = new Date(camp.application_deadline);
            if (!isNaN(d.getTime())) {
              const formattedDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
              details.push(`⏰ Hạn: ${formattedDate}`);
            }
          }

          const rawDesc = String(camp.description || "").replace(/\s+/g, " ").trim();
          const isPlaceholder = !rawDesc || /chưa có mô tả/i.test(rawDesc);
          const cleanDesc = !isPlaceholder ? (rawDesc.length > 130 ? `${rawDesc.slice(0, 127)}...` : rawDesc) : "";

          const prefix = details.join(" | ");
          description = prefix
            ? (cleanDesc ? `${prefix}. ${cleanDesc}` : `${prefix}. Ứng tuyển ngay tại OnstageVN.`)
            : cleanDesc || defaultDescription;

          const rawCover = camp.cover_media?.url || camp.cover_url || camp.cover || camp.media?.[0]?.url;
          imageUrl = normalizeAbsoluteImageUrl(rawCover);
        } else if (data?.type === "brand" && data.brand) {
          const brandName = data.brand.name || "Brand đối tác";
          title = `${brandName} | Onstage VN`;
          description = `Kết nối và hợp tác trực tiếp cùng ${brandName} trên nền tảng OnstageVN. Nhận các cơ hội booking, biểu diễn và tài trợ hấp dẫn.`;
          imageUrl = normalizeAbsoluteImageUrl(data.brand.avatar_url || data.brand.logo_url);
        }
      }
    }
  } catch (error) {
    console.warn("Failed to generate referral metadata:", error);
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
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
  };
}
