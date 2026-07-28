"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookmarkCheck,
  Briefcase,
  Building2,
  CircleHelp,
  HelpCircle,
  Info,
  LogIn,
  Search,
  Settings,
  Sparkles,
  User,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTH_USER_UPDATED_EVENT, getAuthToken } from "@/lib/api-client";
import { getGuestDesktopNavigation } from "@/lib/public-navigation";
import ControlCenterExplanationDialog from "@/components/ui/ControlCenterExplanationDialog";

export const unifiedBrandNavigation = [
  { label: "Tìm kiếm Talent", icon: Search, href: "/brand/search" },
  { label: "Đăng việc làm", icon: Briefcase, href: "/brand/campaigns" },
  { label: "Quản lý Talent", icon: Users2, href: "/brand/my-talents" },
  { label: "Danh sách yêu thích", icon: BookmarkCheck, href: "/brand/shortlists" },
  { label: "Thông tin brand", icon: Building2, href: "/brand/informations" },
];

export const unifiedTalentNavigation = [
  { label: "Chợ việc làm", icon: Briefcase, href: "/talent/jobs" },
  { label: "Hồ sơ Talent", icon: User, href: "/talent/portfolio" },
  { label: "Khảo sát", icon: Sparkles, href: "/talent/survey" },
  { label: "Hợp tác Brand", icon: Users2, href: "/talent/brands" },
];

export const unifiedSettingsNavigation = [
  { label: "Cài đặt", icon: Settings, href: "/settings" },
];

export const unifiedLoggedInNavigationSections = [
  { title: "Dành cho Brand", icon: Briefcase, helpIcon: CircleHelp, items: unifiedBrandNavigation, href: undefined },
  { title: "Dành cho Talent", icon: Sparkles, helpIcon: CircleHelp, items: unifiedTalentNavigation, href: undefined },
  { title: "Cài đặt", icon: Settings, helpIcon: CircleHelp, items: undefined, href: "/settings" },
];

export const unifiedLoggedInMobilePrimaryNavigation = [
  unifiedBrandNavigation[0],
  unifiedBrandNavigation[1],
  unifiedTalentNavigation[0],
  unifiedTalentNavigation[2],
];

export function resolveUnifiedSettingsHref() {
  return "/settings";
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sourcePath, setSourcePath] = useState("");
  const [explanationTab, setExplanationTab] = useState<"talent" | "brand" | null>(null);

  const isGateway = pathname === "/";
  const isAppPath = pathname.startsWith("/talent") || pathname.startsWith("/brand") || pathname === "/about" || pathname === "/settings";
  const guestIconMap = {
    talent: Search,
    jobs: Briefcase,
    about: Info,
    talent_survey: Sparkles,
    login: LogIn,
  };
  const guestMenuItems = getGuestDesktopNavigation().map((item) => ({
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
    const isGuestJobsActive = !isLoggedIn && href === "/talent/jobs" && activePathname.startsWith("/talent/jobs");

    return isGuestTalentActive
      || isGuestJobsActive
      || activePathname === href
      || (href.split("/").length > 3 && activePathname.startsWith(href));
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
            </div>
          ) : (
            unifiedLoggedInNavigationSections.map((section) => (
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
                    <div className="flex items-center justify-between gap-2 px-1 py-1 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <span className="text-amber-400 transition-transform duration-300 hover:rotate-12">
                          <section.icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-[10px] font-black uppercase tracking-[0.18em] text-transparent drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]">
                          {section.title}
                        </span>
                      </div>
                      {section.title !== "Cài đặt" && section.title !== "Hệ thống" && (
                        <button
                          type="button"
                          onClick={() => setExplanationTab(section.title.includes("Brand") ? "brand" : "talent")}
                          className="text-amber-400 hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                          aria-label={`Giải thích ${section.title}`}
                          title={`Giải thích ${section.title}`}
                        >
                          <HelpCircle className="h-4.5 w-4.5" />
                        </button>
                      )}
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
            ))
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
