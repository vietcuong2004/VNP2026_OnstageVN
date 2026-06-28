const PUBLIC_PREFIXES = ["/auth", "/campaign", "/ref", "/activate-talent"];

export function normalizePath(path: string) {
  const [withoutQuery] = path.split(/[?#]/);
  return withoutQuery || "/";
}

export function isPublicPath(path: string) {
  const normalizedPath = normalizePath(path);

  return normalizedPath === "/" || PUBLIC_PREFIXES.some((prefix) => (
    normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  ));
}
