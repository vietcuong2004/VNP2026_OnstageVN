"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Bookmark, Briefcase, CalendarCheck, Heart, Home, Info, LogIn, Megaphone, Menu, Plus, Search, Settings, Sparkles, User, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTH_USER_UPDATED_EVENT, getAuthToken, logoutCurrentSession } from "@/lib/api-client";
import { resolveUnifiedSettingsHref, unifiedLoggedInNavigationSections } from "@/components/sidebar";
import { getGuestMoreNavigation } from "@/lib/public-navigation";
import ControlCenterExplanationDialog from "@/components/ui/ControlCenterExplanationDialog";

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [explanationTab, setExplanationTab] = useState<"talent" | "brand" | null>(null);

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartYRef = useRef(0);
  const isMouseDownRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMoreMenu) {
      setDragY(0);
      setIsDragging(false);
    }
  }, [showMoreMenu]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartYRef.current;
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;

    if (deltaY > 0 && scrollTop <= 0) {
      setDragY(deltaY);
    } else if (deltaY < 0 && dragY > 0) {
      setDragY(Math.max(0, deltaY));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 80) {
      setShowMoreMenu(false);
    }
    setDragY(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    touchStartYRef.current = e.clientY;
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;
      const deltaY = e.clientY - touchStartYRef.current;
      if (deltaY > 0) {
        setDragY(deltaY);
      }
    };

    const handleMouseUp = () => {
      if (!isMouseDownRef.current) return;
      isMouseDownRef.current = false;
      setIsDragging(false);
      setDragY((current) => {
        if (current > 80) {
          setShowMoreMenu(false);
        }
        return 0;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

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
    setShowCreateMenu(false);
    await logoutCurrentSession();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      router.replace("/");
    } else {
      router.replace("/brand/search");
    }
  }

  useEffect(() => {
    if (pathname === "/talent/jobs/saved-jobs") {
      setVisible(true);
      return;
    }

    let prevScrollY = 0;

    const handleScroll = (event: Event) => {
      if (showMoreMenu || showCreateMenu) return;
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
  }, [pathname, showMoreMenu, showCreateMenu]);

  if (!pathname.startsWith("/talent") && !pathname.startsWith("/brand") && pathname !== "/" && pathname !== "/about" && pathname !== "/settings") {
    return null;
  }

  const activePathname = pathname.startsWith("/brand/talents/")
    ? "/brand/search"
    : pathname === "/talent/jobs/saved-jobs"
      ? "/talent/jobs/saved-jobs"
      : pathname.startsWith("/talent/jobs/")
      ? "/talent/jobs"
      : pathname;

  const guestIconMap = {
    discover: Home,
    talent: Search,
    jobs: Briefcase,
    booking: CalendarCheck,
    about: Info,
    talent_profile: User,
    talent_survey: Sparkles,
    saved_idols: Heart,
    saved_jobs: Bookmark,
    brand_settings: Settings,
    login: LogIn,
  };

  const guestMoreItems = getGuestMoreNavigation().map((item) => ({
    ...item,
    icon: guestIconMap[item.key],
  }));

  const allItems = !isLoggedIn ? guestMoreItems : [];
  const bottomNavItems = [
    { label: "Khám phá", href: "/", icon: Home },
    { label: "Tìm Idol", href: "/brand/search", icon: Search },
    { label: "Tìm job", href: "/talent/jobs", icon: Briefcase },
  ];

  const handleJoinSystem = () => {
    setShowCreateMenu(false);
    router.push("/talent/survey?form=1&from=/brand/search");
  };

  const handleCreateJob = () => {
    setShowCreateMenu(false);
    router.push("/brand/manage-jobs/create-job");
  };

  const isActiveHref = (href: string) => {
    if (href === "/") return activePathname === "/";

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

          <div
            style={{
              transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
              transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="fixed bottom-0 left-0 right-0 top-[74px] z-50 flex min-h-0 flex-col rounded-t-[2rem] border-t border-white/10 bg-[#070913]/98 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl md:hidden animate-in slide-in-from-bottom duration-300"
          >
            <div
              onMouseDown={handleMouseDown}
              className="mx-auto mb-3 -mt-2 flex w-full max-w-[200px] flex-col items-center py-2 cursor-grab active:cursor-grabbing touch-none select-none"
            >
              <div className="h-1.5 w-12 rounded-full bg-white/30 hover:bg-amber-400 transition-colors" />
            </div>

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
              <div ref={scrollContainerRef} className="grid min-h-0 flex-1 grid-cols-4 content-start gap-x-2.5 gap-y-5 overflow-y-auto pr-1">
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
              <div ref={scrollContainerRef} className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
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

      {showCreateMenu && (
        <>
          <div
            onClick={() => setShowCreateMenu(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden animate-in fade-in"
          />
          <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-50 mx-auto w-full rounded-t-[2rem] border-t border-white/10 bg-[#070913]/98 px-5 pb-5 pt-4 shadow-[0_-14px_42px_rgba(0,0,0,0.62)] backdrop-blur-2xl md:hidden animate-in slide-in-from-bottom duration-300">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
            <div className="mb-4 text-center">
              <h3 className="font-display text-base font-black text-white">Bạn muốn làm gì?</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">Chọn một hành động để bắt đầu</p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleJoinSystem}
                className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition-all active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#C9A86A]/35 bg-[#C9A86A]/12 text-[#F0C56B] shadow-[0_0_16px_rgba(201,168,106,0.12)]">
                  <UserPlus className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black text-white">Tham gia hệ thống</span>
                  <span className="mt-1 block text-xs font-semibold leading-relaxed text-slate-400">Tạo hồ sơ để bắt đầu nhận job phù hợp</span>
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400">
                  <Plus className="h-4 w-4" />
                </span>
              </button>

              <button
                type="button"
                onClick={handleCreateJob}
                className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition-all active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#C9A86A]/35 bg-[#C9A86A]/12 text-[#F0C56B] shadow-[0_0_16px_rgba(201,168,106,0.12)]">
                  <Megaphone className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black text-white">Đăng tuyển</span>
                  <span className="mt-1 block text-xs font-semibold leading-relaxed text-slate-400">Tạo tin tuyển dụng mới và tìm kiếm ứng viên</span>
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400">
                  <Plus className="h-4 w-4" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowCreateMenu(false)}
                className="flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xs font-black uppercase tracking-wider text-slate-300 transition-all active:scale-[0.99]"
              >
                Hủy
              </button>
            </div>
          </div>
        </>
      )}

      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300",
        visible ? "translate-y-0" : "translate-y-full",
      )}>
        <nav className="grid h-[calc(4.25rem+env(safe-area-inset-bottom,0px))] w-full grid-cols-5 items-center border-t border-white/10 bg-[#03050c]/95 px-2 pb-[env(safe-area-inset-bottom,0px)] shadow-2xl backdrop-blur-xl">
          {bottomNavItems.slice(0, 2).map((item) => {
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
                    "text-[9px] font-bold tracking-wider transition-colors duration-300",
                    isActive ? "text-amber-400 font-black" : "text-slate-500",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setShowMoreMenu(false);
              setShowCreateMenu((prev) => !prev);
            }}
            className="group relative -mt-8 flex flex-col items-center justify-center gap-1 py-1 focus:outline-none cursor-pointer"
          >
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full border border-[#C9A86A]/45 bg-[#03050c] text-[#F0C56B] shadow-[0_0_18px_rgba(201,168,106,0.18)] transition-all duration-300 group-active:scale-95",
              showCreateMenu && "border-[#F0C56B]/70 bg-[#C9A86A]/12 text-[#F0C56B] shadow-[0_0_22px_rgba(201,168,106,0.24)]"
            )}>
              {showCreateMenu ? <X className="h-6 w-6" /> : <Plus className="h-7 w-7" />}
            </div>
            <span className={cn(
              "text-[9px] font-black tracking-wider transition-colors duration-300",
              showCreateMenu ? "text-amber-400" : "text-slate-500"
            )}>
              Tạo mới
            </span>
          </button>

          {bottomNavItems.slice(2).map((item) => {
            const isActive = isActiveHref(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setShowCreateMenu(false)}
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
                    "text-[9px] font-bold tracking-wider transition-colors duration-300",
                    isActive ? "text-amber-400 font-black" : "text-slate-500",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {(() => {
            const isPrimaryActive = bottomNavItems.some((item) => isActiveHref(item.href));
            const isMenuActive = showMoreMenu || !isPrimaryActive;

            return (
              <button
                type="button"
                onClick={() => {
                  setShowCreateMenu(false);
                  setShowMoreMenu((prev) => !prev);
                }}
                className="group flex flex-col items-center justify-center gap-1 py-1 focus:outline-none cursor-pointer"
              >
                <div
                  className={cn(
                    "relative flex h-[34px] w-[34px] items-center justify-center rounded-xl transition-all duration-300 group-active:scale-90",
                    isMenuActive
                      ? "bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.35)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Menu className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-bold tracking-wider transition-colors duration-300",
                    isMenuActive ? "text-amber-400 font-black" : "text-slate-500",
                  )}
                >
                  Menu
                </span>
              </button>
            );
          })()}
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
