"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Award,
  Bookmark,
  Briefcase,
  Building2,
  CalendarCheck,
  CircleHelp,
  HelpCircle,
  Heart,
  Info,
  LogIn,
  LogOut,
  Search,
  Settings,
  Sparkles,
  Trophy,
  User,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTH_USER_UPDATED_EVENT, getAuthToken, logoutCurrentSession } from "@/lib/api-client";
import { getGuestDesktopNavigation } from "@/lib/public-navigation";
import ControlCenterExplanationDialog from "@/components/ui/ControlCenterExplanationDialog";

export const unifiedDiscoveryNavigation = [
  { label: "Tìm kiếm Idol", icon: Search, href: "/brand/search" },
  { label: "Booking", icon: CalendarCheck, href: "/booking" },
  { label: "Cơ hội việc làm", icon: Briefcase, href: "/talent/jobs" },
  { label: "Idol đã lưu", icon: Heart, href: "/brand/shortlists" },
  { label: "Việc làm đã lưu", icon: Bookmark, href: "/talent/jobs/saved-jobs" },
];

export const unifiedManagementNavigation = [
  { label: "Yêu cầu của tôi", icon: CalendarCheck, href: "/brand/my-bookings" },
  { label: "Tạo Job", icon: Briefcase, href: "/brand/manage-jobs" },
  { label: "Quản lý Idol", icon: Users2, href: "/brand/my-talents" },
  { label: "Hợp tác", icon: Users2, href: "/talent/brands" },
];

export const unifiedSystemNavigation = [
  { label: "Hồ sơ cá nhân", icon: User, href: "/talent/profile" },
  { label: "Khảo sát", icon: Sparkles, href: "/talent/survey" },
  { label: "Về chúng tôi", icon: Info, href: "/about" },
  { label: "Cài đặt", icon: Settings, href: "/settings" },
];

export const unifiedBrandNavigation = [
  ...unifiedDiscoveryNavigation,
  ...unifiedManagementNavigation,
];

export const unifiedTalentNavigation = [
  ...unifiedSystemNavigation,
];

export const unifiedLoggedInNavigationSections = [
  { title: "Khám phá & Booking", icon: Search, helpIcon: CircleHelp, items: unifiedDiscoveryNavigation, href: undefined },
  { title: "Quản lý & Hợp tác", icon: Briefcase, helpIcon: CircleHelp, items: unifiedManagementNavigation, href: undefined },
  { title: "Tài khoản & Hệ thống", icon: Settings, helpIcon: CircleHelp, items: unifiedSystemNavigation, href: undefined },
];

export const unifiedLoggedInMobilePrimaryNavigation = [
  unifiedDiscoveryNavigation[0],
  unifiedDiscoveryNavigation[1],
  unifiedDiscoveryNavigation[2],
  unifiedDiscoveryNavigation[3],
];

export function resolveUnifiedSettingsHref() {
  return "/settings";
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sourcePath, setSourcePath] = useState("");
  const [explanationTab, setExplanationTab] = useState<"talent" | "brand" | null>(null);

  const isAppPath = pathname === "/" || pathname.startsWith("/talent") || pathname.startsWith("/brand") || pathname === "/about" || pathname === "/settings";
  const guestIconMap = {
    discover: Sparkles,
    talent: Search,
    booking: CalendarCheck,
    my_bookings: CalendarCheck,
    jobs: Briefcase,
    about: Info,
    talent_survey: Sparkles,
    saved_idols: Heart,
    saved_jobs: Bookmark,
    login: LogIn,
  };
  const guestMenuItems = getGuestDesktopNavigation()
    .filter((item) => item.key !== "login")
    .map((item) => ({
      ...item,
      icon: guestIconMap[item.key as keyof typeof guestIconMap],
    }));
  const activePathname = pathname.startsWith("/brand/talents/") && sourcePath.startsWith("/brand/")
    ? sourcePath
    : pathname.startsWith("/talent/jobs/") && sourcePath.startsWith("/talent/") && pathname !== "/talent/jobs/saved-jobs"
      ? sourcePath
      : pathname.startsWith("/brand/talents/")
        ? "/brand/search"
        : pathname.startsWith("/talent/jobs/") && pathname !== "/talent/jobs/saved-jobs"
          ? "/talent/jobs"
          : pathname;

  useEffect(() => {
    const syncToken = () => setIsLoggedIn(!!getAuthToken());
    syncToken();
    window.addEventListener(AUTH_USER_UPDATED_EVENT, syncToken);
    window.addEventListener("storage", syncToken);
    return () => {
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, syncToken);
      window.removeEventListener("storage", syncToken);
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!pathname.startsWith("/brand/talents/") && !pathname.startsWith("/talent/jobs/")) {
        setSourcePath("");
        return;
      }

      setSourcePath(new URLSearchParams(window.location.search).get("from") || "");
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  if (!isAppPath) {
    return null;
  }

  const isActiveHref = (href: string) => {
    if (href === "/") return activePathname === "/";

    if (href === "/talent/jobs/saved-jobs") {
      return activePathname === "/talent/jobs/saved-jobs";
    }

    if (href === "/talent/jobs") {
      if (activePathname === "/talent/jobs/saved-jobs") return false;
      return activePathname === "/talent/jobs" || activePathname.startsWith("/talent/jobs/");
    }

    if (href === "/brand/search") {
      return activePathname === "/brand/search" || activePathname.startsWith("/brand/talents/");
    }

    if (href === "/brand/manage-jobs") {
      return activePathname.startsWith("/brand/manage-jobs");
    }

    if (href === "/brand/shortlists") {
      return activePathname.startsWith("/brand/shortlists");
    }

    if (href === "/brand/my-bookings") {
      return activePathname.startsWith("/brand/my-bookings");
    }

    if (href === "/brand/my-talents") {
      return activePathname.startsWith("/brand/my-talents");
    }

    if (href === "/talent/brands") {
      return activePathname.startsWith("/talent/brands");
    }

    if (href === "/talent/profile") {
      return activePathname.startsWith("/talent/profile");
    }

    if (href === "/talent/survey") {
      return activePathname.startsWith("/talent/survey");
    }

    if (href === "/about") {
      return activePathname === "/about";
    }

    if (href === "/settings") {
      return activePathname.startsWith("/settings");
    }

    return activePathname === href || (href !== "/" && activePathname.startsWith(`${href}/`));
  };

  const handleLogout = async () => {
    await logoutCurrentSession();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      router.replace("/");
    } else {
      router.replace("/brand/search");
    }
  };

  return (
    <>
      <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-[#F0D7D3] bg-white p-6 overflow-y-auto dark:border-white/5 dark:bg-[#050711]">
        <nav className="flex-1 space-y-7 overflow-y-auto pr-1">
          {!isLoggedIn ? (
            <div className="space-y-2">
              {guestMenuItems.map((item) => {
                const isActive = isActiveHref(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 group relative",
                      isActive
                        ? "bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white shadow-md border border-transparent dark:border-amber-500/20 dark:bg-gradient-to-r dark:from-amber-400/10 dark:to-yellow-600/5 dark:text-amber-300"
                        : "text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] border border-transparent dark:text-slate-400 dark:hover:bg-white/2 dark:hover:text-slate-100",
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/3 bottom-1/3 w-1 rounded-r-full bg-[#F0C56B] dark:bg-amber-400" />
                    )}
                    <Icon className={cn("h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110", isActive ? "!text-white text-white dark:text-amber-400" : "text-[#574D54] group-hover:text-[#8F0709] dark:text-slate-400 dark:group-hover:text-slate-100")} />
                    <span className={cn(isActive ? "!text-white text-white font-bold dark:text-amber-300" : "")}>{item.label}</span>
                  </Link>
                );
              })}

              <Link
                href="/auth/login"
                className="mt-4 flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 px-5 text-sm font-black tracking-wide text-slate-950 shadow-[0_10px_26px_rgba(201,168,106,0.18)] transition-all duration-300 hover:brightness-110 active:scale-95"
              >
                <LogIn className="h-4.5 w-4.5" />
                <span>Đăng nhập</span>
              </Link>
            </div>
          ) : (
            <>
              {unifiedLoggedInNavigationSections.map((section) => (
                <section key={section.title} className="space-y-3">
                  {section.href ? (
                    <Link
                      href={section.href}
                      className={cn(
                        "group relative flex items-center gap-3.5 rounded-xl border px-4 py-3 text-sm font-semibold tracking-wide transition-all duration-300",
                        isActiveHref(section.href)
                          ? "bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white shadow-md border-transparent dark:border-amber-500/20 dark:bg-gradient-to-r dark:from-amber-400/10 dark:to-yellow-600/5 dark:text-amber-300"
                          : "border-transparent text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] dark:text-slate-400 dark:hover:bg-white/2 dark:hover:text-slate-100",
                      )}
                    >
                      {isActiveHref(section.href) && (
                        <div className="absolute left-0 top-1/3 bottom-1/3 w-1 rounded-r-full bg-[#F0C56B] dark:bg-amber-400" />
                      )}
                      <section.icon className={cn("h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110", isActiveHref(section.href) ? "!text-white text-white dark:text-amber-400" : "text-[#C72524] dark:text-amber-400")} />
                      <span className={cn(isActiveHref(section.href) ? "!text-white text-white font-bold dark:text-amber-300" : "text-[#8F0709] dark:bg-gradient-to-r dark:from-amber-200 dark:via-yellow-400 dark:to-amber-500 dark:bg-clip-text text-[10px] font-black uppercase tracking-[0.18em] dark:text-transparent")}>
                        {section.title}
                      </span>
                    </Link>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 px-1 py-1 transition-all duration-300">
                        <span className="text-[#C72524] dark:text-amber-400 transition-transform duration-300 hover:rotate-12">
                          <section.icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-[#8F0709] dark:bg-gradient-to-r dark:from-amber-200 dark:via-yellow-400 dark:to-amber-500 dark:bg-clip-text text-[10px] font-black uppercase tracking-[0.18em] dark:text-transparent dark:drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]">
                          {section.title}
                        </span>
                      </div>
                      <div className="space-y-2 px-0.5">
                        {section.items?.map((item) => {
                          const itemHref = item.label === "Cài đặt" ? resolveUnifiedSettingsHref() : item.href;
                          const isActive = isActiveHref(itemHref);
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.label}
                              href={itemHref}
                              className={cn(
                                "group relative flex items-center gap-3.5 rounded-xl border px-4 py-3 text-sm font-semibold tracking-wide transition-all duration-300",
                                isActive
                                  ? "bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white shadow-md border-transparent dark:border-amber-500/20 dark:bg-gradient-to-r dark:from-amber-400/10 dark:to-yellow-600/5 dark:text-amber-300"
                                  : "border-transparent text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] dark:text-slate-400 dark:hover:bg-white/2 dark:hover:text-slate-100",
                              )}
                            >
                              {isActive && (
                                <div className="absolute left-0 top-1/3 bottom-1/3 w-1 rounded-r-full bg-[#F0C56B] dark:bg-amber-400" />
                              )}
                              <Icon className={cn("h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110", isActive ? "!text-white text-white dark:text-amber-400" : "text-[#574D54] group-hover:text-[#8F0709] dark:text-slate-400 dark:group-hover:text-slate-100")} />
                              <span className={cn(isActive ? "!text-white text-white font-bold dark:text-amber-300" : "")}>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  )}
                </section>
              ))}

              <button
                onClick={handleLogout}
                className="mt-4 flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 px-5 text-sm font-black tracking-wide text-slate-950 shadow-[0_10px_26px_rgba(201,168,106,0.18)] transition-all duration-300 hover:brightness-110 active:scale-95 cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Đăng xuất</span>
              </button>
            </>
          )}
        </nav>
      </aside>

      {explanationTab && (
        <ControlCenterExplanationDialog
          isOpen
          defaultTab={explanationTab}
          onClose={() => setExplanationTab(null)}
        />
      )}
    </>
  );
}

