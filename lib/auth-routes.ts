const PUBLIC_PREFIXES = ["/auth", "/booking", "/campaign", "/ref", "/activate-talent", "/setup-talent-login", "/intro", "/landing", "/about", "/brand", "/talent"];
const APP_SHELL_PREFIXES = ["/about", "/booking", "/brand", "/talent"];

export function normalizePath(path: string) {
  const [withoutQuery] = path.split(/[?#]/);
  return withoutQuery || "/";
}

function matchesPrefix(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function isPublicPath(path: string) {
  const normalizedPath = normalizePath(path);

  return normalizedPath === "/" || PUBLIC_PREFIXES.some((prefix) => matchesPrefix(normalizedPath, prefix));
}

export function usesAppShell(path: string) {
  const normalizedPath = normalizePath(path);

  return normalizedPath === "/" || APP_SHELL_PREFIXES.some((prefix) => matchesPrefix(normalizedPath, prefix));
}

export function isStandalonePublicPath(path: string) {
  return isPublicPath(path) && !usesAppShell(path);
}
