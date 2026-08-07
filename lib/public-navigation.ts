export type PublicNavigationItem = {
  key:
    | "discover"
    | "talent"
    | "jobs"
    | "about"
    | "talent_profile"
    | "talent_survey"
    | "saved_idols"
    | "saved_jobs"
    | "brand_settings"
    | "login";
  label: string;
  href: string;
};

const guestPrimaryNavigation: PublicNavigationItem[] = [
  { key: "discover", label: "Khám phá", href: "/" },
  { key: "talent", label: "Tìm kiếm Idol", href: "/brand/search" },
  { key: "jobs", label: "Cơ hội việc làm", href: "/talent/jobs" },
];

const guestMoreNavigation: PublicNavigationItem[] = [
  { key: "saved_idols", label: "Idol đã lưu", href: "/brand/shortlists" },
  { key: "saved_jobs", label: "Việc làm đã lưu", href: "/talent/jobs/saved-jobs" },
  { key: "talent_survey", label: "Khảo sát", href: "/talent/survey" },
  { key: "about", label: "Về chúng tôi", href: "/about" },
  { key: "login", label: "Đăng nhập", href: "/auth/login" },
];

const guestDesktopNavigation: PublicNavigationItem[] = [
  { key: "talent", label: "Tìm kiếm Idol", href: "/brand/search" },
  { key: "jobs", label: "Cơ hội việc làm", href: "/talent/jobs" },
  { key: "saved_idols", label: "Idol đã lưu", href: "/brand/shortlists" },
  { key: "saved_jobs", label: "Việc làm đã lưu", href: "/talent/jobs/saved-jobs" },
  { key: "talent_survey", label: "Khảo sát", href: "/talent/survey" },
  { key: "about", label: "Về chúng tôi", href: "/about" },
  { key: "login", label: "Đăng nhập", href: "/auth/login" },
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
    || pathname === "/brand/shortlists"
    || pathname === "/talent/jobs"
    || pathname === "/talent/jobs/saved-jobs"
    || pathname.startsWith("/talent/jobs/");
}
