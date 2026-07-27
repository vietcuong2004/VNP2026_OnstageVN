export type PublicNavigationItem = {
  key: "talent" | "jobs" | "about" | "talent_profile" | "talent_survey" | "brand_settings" | "login";
  label: string;
  href: string;
};

const guestPrimaryNavigation: PublicNavigationItem[] = [
  { key: "talent", label: "Talent", href: "/brand/search" },
  { key: "jobs", label: "Việc làm", href: "/talent/jobs" },
  { key: "about", label: "Về chúng tôi", href: "/about" },
];

const guestMoreNavigation: PublicNavigationItem[] = [
  { key: "talent_survey", label: "Khảo sát", href: "/talent/survey" },
  { key: "login", label: "Đăng nhập", href: "/auth/login" },
];

const guestDesktopNavigation: PublicNavigationItem[] = [
  ...guestPrimaryNavigation,
  ...guestMoreNavigation,
];

export function getGuestPrimaryNavigation(): PublicNavigationItem[] {
  return guestPrimaryNavigation;
}

export function getGuestMoreNavigation(): PublicNavigationItem[] {
  return guestMoreNavigation;
}

export function getGuestDesktopNavigation(): PublicNavigationItem[] {
  return guestDesktopNavigation;
}

export function getGuestDefaultPath(): string {
  return guestPrimaryNavigation[0].href;
}

export function isGuestMarketplacePath(path: string): boolean {
  const [pathname] = path.split(/[?#]/);

  return pathname === "/brand/search"
    || pathname.startsWith("/brand/talents/")
    || pathname === "/talent/jobs"
    || pathname.startsWith("/talent/jobs/");
}
