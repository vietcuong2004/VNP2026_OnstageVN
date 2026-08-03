"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, HelpCircle, Info, LogIn, Menu, Search, Settings, Sparkles, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTH_USER_UPDATED_EVENT, getAuthToken, logoutCurrentSession } from "@/lib/api-client";
import { resolveUnifiedSettingsHref, unifiedLoggedInNavigationSections } from "@/components/sidebar";
import { getGuestMoreNavigation, getGuestPrimaryNavigation } from "@/lib/public-navigation";
import ControlCenterExplanationDialog from "@/components/ui/ControlCenterExplanationDialog";

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [explanationTab, setExplanationTab] = useState<"talent" | "brand" | null>(null);

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

  async function handleLogout() {
    setShowMoreMenu(false);
    await logoutCurrentSession();
    router.replace("/auth/login");
  }

  useEffect(() => {
    let prevScrollY = 0;

    const handleScroll = (event: Event) => {
      if (showMoreMenu) return;
      const target = event.target;
      if (!target) return;

      let currentScrollY = 0;
      let scrollHeight = 0;
      let clientHeight = 0;

      if (target === document) {
        currentScrollY = window.scrollY || document.documentElement.scrollTop;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = document.documentElement.clientHeight;
      } else if (target instanceof HTMLElement) {
        currentScrollY = target.scrollTop;
        scrollHeight = target.scrollHeight;
        clientHeight = target.clientHeight;
      } else {
        return;
      }

      const isNearBottom = scrollHeight - (currentScrollY + clientHeight) < 80;

      if (currentScrollY < 10 || isNearBottom) {
        setVisible(true);
      } else if (currentScrollY > prevScrollY) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      prevScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [showMoreMenu]);

  if (!pathname.startsWith("/talent") && !pathname.startsWith("/brand") && pathname !== "/about" && pathname !== "/settings") {
    return null;
  }

  const activePathname = pathname.startsWith("/brand/talents/")
    ? "/brand/search"
    : pathname.startsWith("/talent/jobs/")
      ? "/talent/jobs"
      : pathname;

  const guestIconMap = {
    talent: Search,
    jobs: Briefcase,
    about: Info,
    talent_profile: User,
    talent_survey: Sparkles,
    brand_settings: Settings,
    login: LogIn,
  };

  const guestPrimaryItems = getGuestPrimaryNavigation().map((item) => ({
    ...item,
    icon: guestIconMap[item.key],
  }));

  const guestMoreItems = getGuestMoreNavigation().map((item) => ({
    ...item,
    icon: guestIconMap[item.key],
  }));

  const primaryItems = guestPrimaryItems;
  const allItems = !isLoggedIn ? guestMoreItems : [];

  const isActiveHref = (href: string) => {
    const isGuestTalentActive = !isLoggedIn && href === "/brand/search" && (
      activePathname === "/brand/search" || activePathname.startsWith("/brand/talents/")
    );
    const isGuestJobsActive = !isLoggedIn && href === "/talent/jobs" && activePathname.startsWith("/talent/jobs");

    return isGuestTalentActive
      || isGuestJobsActive
      || activePathname === href
      || activePathname.startsWith(href);
  };

  return (
    <>
      {showMoreMenu && (
        <>
          <div
            onClick={() => setShowMoreMenu(false)}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity duration-300 md:hidden animate-in fade-in"
          />

          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[2rem] border-t border-white/10 bg-[#070913]/98 p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl md:hidden animate-in slide-in-from-bottom duration-300">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Menu className="h-4 w-4 text-amber-400" /> Danh mục tiện ích
              </h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!isLoggedIn ? (
              <div className="grid grid-cols-4 gap-y-5 gap-x-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {allItems.map((item) => {
                  const Icon = item.icon;
                  const isLogin = item.label === "Đăng nhập";
                  const isActive = !isLogin && isActiveHref(item.href);
                  const content = (
                    <>
                      <div className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300",
                        isActive
                          ? "bg-gradient-to-br from-amber-200 to-yellow-500 border-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.25)] scale-105"
                          : isLogin
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.08)]"
                            : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                      )}>
                        <Icon className="h-5 w-5 animate-none" />
                      </div>
                      <span className={cn(
                        "text-[8px] font-bold mt-1.5 leading-tight uppercase tracking-wider transition-colors block max-w-[76px] text-center line-clamp-2 break-words",
                        isActive && "text-amber-400 font-extrabold",
                        isLogin ? "text-emerald-400 group-hover:text-emerald-300 font-black" : "text-slate-400 group-hover:text-white"
                      )}>
                        {item.label}
                      </span>
                    </>
                  );

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setShowMoreMenu(false)}
                      className="flex flex-col items-center text-center group cursor-pointer"
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
                {unifiedLoggedInNavigationSections.map((section) => (
                  <div key={section.title} className="space-y-3">
                    {section.href ? (
                      <>
                        <div className="flex items-center gap-2 rounded-r-lg border-l-2 border-amber-400 bg-gradient-to-r from-amber-500/10 to-transparent py-1 pl-2">
                          <section.icon className="h-3.5 w-3.5 text-amber-400" />
                          <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-[10px] font-black uppercase tracking-[0.15em] text-transparent">
                            {section.title}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-y-4 gap-x-2.5">
                          <Link
                            href={section.href}
                            onClick={() => setShowMoreMenu(false)}
                            className="flex flex-col items-center text-center group cursor-pointer"
                          >
                            <div className={cn(
                              "flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 group-active:scale-95",
                              isActiveHref(section.href)
                                ? "bg-gradient-to-br from-amber-200 to-yellow-500 border-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.25)] scale-105"
                                : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                            )}>
                              <section.icon className="h-5 w-5 animate-none" />
                            </div>
                            <span className={cn(
                              "text-[8px] font-bold mt-1.5 leading-tight uppercase tracking-wider transition-colors block max-w-[76px] text-center line-clamp-2 break-words",
                              isActiveHref(section.href) && "text-amber-400 font-extrabold",
                              "text-slate-400 group-hover:text-white"
                            )}>
                              {section.title}
                            </span>
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 rounded-r-lg border-l-2 border-amber-400 bg-gradient-to-r from-amber-500/10 to-transparent py-1 pl-2">
                          <section.icon className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                          <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-[10px] font-black uppercase tracking-[0.15em] text-transparent">
                            {section.title}
                          </span>
                          {section.title !== "Cài đặt" && section.title !== "Hệ thống" && (
                            <button
                              type="button"
                              onClick={() => setExplanationTab(section.title.includes("Brand") ? "brand" : "talent")}
                              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-amber-400/35 bg-amber-400/10 text-[10px] font-black text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.12)] transition-all hover:scale-105 hover:border-amber-300/70 hover:bg-amber-400/20 hover:text-white active:scale-95 cursor-pointer"
                              aria-label={`Giải thích ${section.title}`}
                              title={`Giải thích ${section.title}`}
                            >
                              <HelpCircle className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-y-4 gap-x-2.5">
                          {section.items?.map((item) => {
                            const Icon = item.icon;
                            const itemHref = item.label === "Cài đặt" ? resolveUnifiedSettingsHref() : item.href;
                            const isActive = isActiveHref(itemHref);
                            const content = (
                              <>
                                <div className={cn(
                                  "flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 group-active:scale-95",
                                  isActive
                                    ? "bg-gradient-to-br from-amber-200 to-yellow-500 border-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.25)] scale-105"
                                    : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                                )}>
                                  <Icon className="h-5 w-5 animate-none" />
                                </div>
                                <span className={cn(
                                  "text-[8px] font-bold mt-1.5 leading-tight uppercase tracking-wider transition-colors block max-w-[76px] text-center line-clamp-2 break-words",
                                  isActive && "text-amber-400 font-extrabold",
                                  "text-slate-400 group-hover:text-white"
                                )}>
                                  {item.label}
                                </span>
                              </>
                            );

                            return (
                              <Link
                                key={item.label}
                                href={itemHref}
                                onClick={() => setShowMoreMenu(false)}
                                className="flex flex-col items-center text-center group cursor-pointer"
                              >
                                {content}
                              </Link>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                <div className="border-t border-white/5 pt-5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="ml-auto flex h-11 items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-5 text-xs font-black uppercase tracking-wider text-red-300 shadow-[0_0_14px_rgba(239,68,68,0.12)]"
                  >
                    <LogIn className="h-4 w-4 rotate-180" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300",
        visible ? "translate-y-0" : "translate-y-full",
      )}>
        <nav className="flex h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] w-full items-center justify-around border-t border-white/10 bg-[#03050c]/95 px-2 shadow-2xl backdrop-blur-xl">
          {primaryItems.map((item) => {
            const isActive = isActiveHref(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col items-center justify-center gap-1 py-1 cursor-pointer"
              >
                <div
                  className={cn(
                    "relative flex h-[34px] w-[34px] items-center justify-center rounded-xl transition-all duration-300 group-active:scale-90",
                    isActive
                      ? "bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.35)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-bold tracking-wider uppercase transition-colors duration-300",
                    isActive ? "text-amber-400 font-black" : "text-slate-500",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {!isLoggedIn ? (
            <Link
              href="/talent/survey"
              className="group flex flex-col items-center justify-center gap-1 py-1 cursor-pointer"
            >
              <div
                className={cn(
                  "relative flex h-[34px] w-[34px] items-center justify-center rounded-xl transition-all duration-300 group-active:scale-90",
                  isActiveHref("/talent/survey")
                    ? "bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.35)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span
                className={cn(
                  "text-[9px] font-bold tracking-wider uppercase transition-colors duration-300",
                  isActiveHref("/talent/survey") ? "text-amber-400 font-black" : "text-slate-500",
                )}
              >
                Khảo sát
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setShowMoreMenu(true)}
              className="group flex flex-col items-center justify-center gap-1 py-1 focus:outline-none cursor-pointer"
            >
              <div
                className={cn(
                  "relative flex h-[34px] w-[34px] items-center justify-center rounded-xl transition-all duration-300 group-active:scale-90",
                  showMoreMenu
                    ? "bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.35)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <Menu className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span
                className={cn(
                  "text-[9px] font-bold tracking-wider uppercase transition-colors duration-300",
                  showMoreMenu ? "text-amber-400 font-black" : "text-slate-500",
                )}
              >
                Thêm
              </span>
            </button>
          )}
        </nav>
      </div>

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
