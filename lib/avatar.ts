"use client";

function backendAssetBaseUrl() {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080/api").replace(/\/$/, "");
  return apiBase.replace(/\/api$/, "");
}

export function normalizeBackendAssetUrl(value: unknown) {
  let url = String(value || "").trim();
  if (!url) return "";

  const baseUrl = backendAssetBaseUrl();
  if (baseUrl && /^https?:\/\//i.test(baseUrl)) {
    const localStaticUrlRegex = /^https?:\/\/(127\.0\.0\.1|localhost):3000\/static\//i;
    if (localStaticUrlRegex.test(url)) {
      url = url.replace(localStaticUrlRegex, `${baseUrl}/api-manager-kols/`);
    }
    const localAppUrlRegex = /^https?:\/\/(127\.0\.0\.1|localhost):8080/i;
    if (localAppUrlRegex.test(url)) {
      url = url.replace(localAppUrlRegex, baseUrl);
    }
    const localMinioUrlRegex = /^https?:\/\/(127\.0\.0\.1|localhost):9000/i;
    if (localMinioUrlRegex.test(url)) {
      url = url.replace(localMinioUrlRegex, baseUrl);
    }
  }

  if (url.startsWith("data:") || /^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/storage/")) return `${baseUrl}${url}`;
  if (url.startsWith("storage/")) return `${baseUrl}/${url}`;
  if (url.startsWith("/")) return url;
  if (/^(avatars|uploads|media|api-manager-kols)\//i.test(url)) {
    return `${baseUrl}/${url.replace(/^\/+/, "")}`;
  }
  return url;
}

export function getAvatarInitial(name?: string | null, email?: string | null) {
  const source = String(name || email || "U").trim();
  const firstWord = source.split(/\s+/).find(Boolean) || "U";

  return firstWord.charAt(0).toLocaleUpperCase("vi-VN");
}

export function createInitialAvatarDataUrl(name?: string | null, email?: string | null) {
  const initial = getAvatarInitial(name, email);
  const colors = ["#0f172a", "#111827", "#1e1b4b", "#3b2506", "#052e2b", "#3f1020"];
  const index = Math.abs([...String(name || email || "U")].reduce((total, char) => total + char.charCodeAt(0), 0)) % colors.length;
  const background = colors[index];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" rx="80" fill="${background}"/>
      <circle cx="128" cy="32" r="44" fill="#f59e0b" opacity="0.18"/>
      <circle cx="28" cy="132" r="52" fill="#22d3ee" opacity="0.12"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="Inter, Arial, sans-serif" font-size="68" font-weight="800" fill="#f8fafc">${initial}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function avatarFallbackForUser(user?: { name?: string | null; email?: string | null } | null) {
  return createInitialAvatarDataUrl(user?.name, user?.email);
}

export function isUsableAvatarUrl(value: unknown) {
  const url = normalizeBackendAssetUrl(value);

  return Boolean(url)
    && url !== "/avatar.png"
    && url !== "/images/default-avatar.png"
    && !url.startsWith("blob:");
}

export function profileAvatarFromBackend(profile: any) {
  const photos = Array.isArray(profile?.photos) ? profile.photos : [];
  const avatarPhoto = [...photos].reverse().find((photo) => photo?.category === "avatar");
  const photoUrl = normalizeBackendAssetUrl(avatarPhoto?.url || avatarPhoto?.path);

  return isUsableAvatarUrl(photoUrl) ? photoUrl : null;
}
