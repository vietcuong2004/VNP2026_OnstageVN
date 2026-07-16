const PUBLIC_PREFIXES = ["/auth", "/campaign", "/ref", "/activate-talent", "/setup-talent-login", "/intro"];
const EXACT_PUBLIC_PATHS = ["/brand", "/talent"];

export function normalizePath(path: string) {
  const [withoutQuery] = path.split(/[?#]/);
  return withoutQuery || "/";
}

export function isPublicPath(path: string) {
  const normalizedPath = normalizePath(path);

  if (normalizedPath === "/" || EXACT_PUBLIC_PATHS.includes(normalizedPath)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => (
    normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  ));
}
