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
  { label: "Cơ hội việc làm", icon: Briefcase, href: "/talent/jobs" },
  { label: "Booking", icon: CalendarCheck, href: "/booking" },
  { label: "Idol đã lưu", icon: Heart, href: "/brand/shortlists" },
  { label: "Việc làm đã lưu", icon: Bookmark, href: "/talent/jobs/saved-jobs" },
];

export const unifiedManagementNavigation = [
  { label: "Quản lý Booking", icon: CalendarCheck, href: "/brand/my-bookings" },
  { label: "Quản lý việc làm", icon: Briefcase, href: "/brand/manage-jobs" },
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

  const isGateway = pathname === "/";
  const isAppPath = pathname.startsWith("/talent") || pathname.startsWith("/brand") || pathname === "/about" || pathname === "/settings";
  const guestIconMap = {
    discover: Sparkles,
    talent: Search,
    jobs: Briefcase,
    booking: CalendarCheck,
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
    : pathname.startsWith("/talent/jobs/") && sourcePath.startsWith("/talent/")
      ? sourcePath
      : pathname.startsWith("/brand/talents/")
        ? "/brand/search"
        : pathname.startsWith("/talent/jobs/")
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

  if (isGateway || !isAppPath) {
    return null;
  }

  const isActiveHref = (href: string) => {
    const isGuestTalentActive = !isLoggedIn && href === "/brand/search" && (
      activePathname === "/brand/search" || activePathname.startsWith("/brand/talents/")
    );
    const isGuestJobsActive = !isLoggedIn && href === "/talent/jobs" && (
      activePathname === "/talent/jobs" || activePathname.startsWith("/talent/jobs/")
    ) && activePathname !== "/talent/jobs/saved-jobs";
    const isGuestSavedJobsActive = !isLoggedIn && href === "/talent/jobs/saved-jobs" && activePathname === "/talent/jobs/saved-jobs";

    return isGuestTalentActive
      || isGuestJobsActive
      || isGuestSavedJobsActive
      || activePathname === href
      || (href.split("/").length > 3 && activePathname.startsWith(href));
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
      <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-white/5 bg-[#050711] p-6 overflow-y-auto">
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
                        ? "bg-gradient-to-r from-amber-400/10 to-yellow-600/5 text-amber-300 border border-amber-500/20 shadow-[0_4px_12px_rgba(245,158,11,0.05)]"
                        : "text-slate-400 hover:bg-white/2 hover:text-slate-100 border border-transparent",
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/3 bottom-1/3 w-0.5 rounded bg-amber-400" />
                    )}
                    <Icon className={cn("h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-100")} />
                    <span>{item.label}</span>
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
                          ? "border-amber-500/20 bg-gradient-to-r from-amber-400/10 to-yellow-600/5 shadow-[0_4px_12px_rgba(245,158,11,0.055)] text-amber-300"
                          : "border-transparent text-slate-400 hover:bg-white/2 hover:text-slate-100",
                      )}
                    >
                      {isActiveHref(section.href) && (
                        <div className="absolute left-0 top-1/3 bottom-1/3 w-0.5 rounded bg-amber-400" />
                      )}
                      <section.icon className="h-4.5 w-4.5 text-amber-400 transition-transform duration-300 group-hover:scale-110" />
                      <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-[10px] font-black uppercase tracking-[0.18em] text-transparent drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]">
                        {section.title}
                      </span>
                    </Link>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 px-1 py-1 transition-all duration-300">
                        <span className="text-amber-400 transition-transform duration-300 hover:rotate-12">
                          <section.icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-[10px] font-black uppercase tracking-[0.18em] text-transparent drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]">
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
                                  ? "border-amber-500/20 bg-gradient-to-r from-amber-400/10 to-yellow-600/5 text-amber-300 shadow-[0_4px_12px_rgba(245,158,11,0.055)]"
                                  : "border-transparent text-slate-400 hover:bg-white/2 hover:text-slate-100",
                              )}
                            >
                              {isActive && (
                                <div className="absolute left-0 top-1/3 bottom-1/3 w-0.5 rounded bg-amber-400" />
                              )}
                              <Icon className={cn("h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-100")} />
                              <span>{item.label}</span>
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

