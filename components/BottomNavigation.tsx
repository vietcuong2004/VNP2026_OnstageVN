"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Briefcase, BookmarkCheck, Crown, Search, User,
  Sparkles, Trophy, Calendar, MessageSquare, Wallet, Menu, X, LogOut,
  BarChart3, Users, Bell, Settings, Share2, LogIn, ArrowLeftRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutCurrentSession, AUTH_USER_UPDATED_EVENT, getAuthToken } from "@/lib/api-client";

const talentAllItems = [
  { label: "Tổng quan", icon: Home, href: "/talent/dashboard" },
  { label: "Hồ sơ", icon: User, href: "/talent/portfolio" },
  { label: "Chợ việc làm", icon: Briefcase, href: "/talent/jobs" },
  { label: "Lịch trình", icon: Calendar, href: "/talent/calendar" },
  { label: "Khảo sát", icon: Sparkles, href: "/talent/survey" },
  // { label: "Cuộc thi", icon: Trophy, href: "/talent/contests" },
  // { label: "Chiến dịch Affiliate", icon: Share2, href: "/talent/affiliate" },
  { label: "Hợp tác Brand", icon: Users, href: "/talent/brands" },
  // { label: "Crowdfunding", icon: Crown, href: "/talent/crownfunding" },
  { label: "Tin nhắn", icon: MessageSquare, href: "/talent/messages" },
  // { label: "Thu nhập", icon: Wallet, href: "/talent/wallet" },
  { label: "Đăng xuất", icon: LogOut, href: "/" },
];

const brandAllItems = [
  { label: "Tổng quan", icon: Home, href: "/brand/dashboard" },
  { label: "Tìm kiếm", icon: Search, href: "/brand/search" },
  { label: "Shortlist", icon: BookmarkCheck, href: "/brand/shortlists" },
  { label: "Đăng việc làm", icon: Briefcase, href: "/brand/campaigns" },
  { label: "Tin nhắn", icon: MessageSquare, href: "/brand/messages" },
  // { label: "Báo cáo", icon: BarChart3, href: "/brand/analytics" },
  { label: "Quản lý Talent", icon: Users, href: "/brand/my-talents" },
  // { label: "Thanh toán", icon: Wallet, href: "/brand/billing" },
  { label: "Thông báo", icon: Bell, href: "/brand/notifications" },
  { label: "Thông tin brand", icon: Settings, href: "/brand/settings" },
  { label: "Đăng xuất", icon: LogOut, href: "/" },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

      // Check if user is near the bottom of the scroll container (within 80px)
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

  // Guard: only render the bottom nav inside the app portals.
  if (!pathname.startsWith("/talent") && !pathname.startsWith("/brand")) {
    return null;
  }

  const isBrand = pathname.startsWith("/brand");

  const brandPrimaryItems = [
    { label: "Tổng quan", icon: Home, href: "/brand/dashboard" },
    { label: "Đăng việc làm", icon: Briefcase, href: "/brand/campaigns" },
    { label: "Quản lý Talent", icon: Users, href: "/brand/my-talents" },
    { label: "Tin nhắn", icon: MessageSquare, href: "/brand/messages" },
  ];

  const talentPrimaryItems = [
    { label: "Tổng quan", icon: Home, href: "/talent/dashboard" },
    { label: "Hồ sơ", icon: User, href: "/talent/portfolio" },
    { label: "Đăng việc làm", icon: Briefcase, href: "/talent/jobs" },
    { label: "Lịch trình", icon: Calendar, href: "/talent/calendar" },
  ];

  const primaryItems = isBrand ? brandPrimaryItems : talentPrimaryItems;
  const allItems = isBrand
    ? [
        ...brandAllItems.filter(item => item.label !== "Đăng xuất"),
        ...(isLoggedIn
          ? [{ label: "Đăng xuất", icon: LogOut, href: "/" }]
          : [
              { label: "Sang Talent", icon: ArrowLeftRight, href: "/talent/dashboard" },
              { label: "Đăng nhập", icon: LogIn, href: "/auth/login" }
            ]
        )
      ]
    : [
        ...talentAllItems.filter(item => item.label !== "Đăng xuất"),
        ...(isLoggedIn
          ? [{ label: "Đăng xuất", icon: LogOut, href: "/" }]
          : [
              { label: "Sang Brand", icon: ArrowLeftRight, href: "/brand/dashboard" },
              { label: "Đăng nhập", icon: LogIn, href: "/auth/login" }
            ]
        )
      ];

  return (
    <>

      {showMoreMenu && (
        <>
          {/* Backdrop overlay for the More menu */}
          <div
            onClick={() => setShowMoreMenu(false)}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity duration-300 md:hidden animate-in fade-in"
          />

          {/* Slide-up Bottom Sheet Menu */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[2rem] border-t border-white/10 bg-[#070913]/98 p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl md:hidden animate-in slide-in-from-bottom duration-300"
          >
            {/* Drag Indicator handle bar */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

            {/* Modal Header */}
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

            {/* Grid of all items */}
            <div className="grid grid-cols-4 gap-y-5 gap-x-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {allItems.map((item) => {
                const Icon = item.icon;
                const isLogout = item.label === "Đăng xuất";
                const isLogin = item.label === "Đăng nhập";
                const isSwitch = item.label === "Sang Brand" || item.label === "Sang Talent";
                const isActive = !isLogout && !isLogin && !isSwitch && (pathname === item.href || (item.href !== "/brand/dashboard" && item.href !== "/talent/dashboard" && pathname.startsWith(item.href)));
                const content = (
                  <>
                    <div className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-br from-amber-200 to-yellow-500 border-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.25)] scale-105"
                        : isLogout
                          ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.08)]"
                          : isLogin
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.08)]"
                            : isSwitch
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.08)]"
                              : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    )}>
                      <Icon className="h-5 w-5 animate-none" />
                    </div>
                    <span className={cn(
                      "text-[8px] font-bold mt-1.5 leading-tight uppercase tracking-wider transition-colors block max-w-[70px] truncate",
                      isActive && "text-amber-400 font-extrabold",
                      isLogout ? "text-red-400 group-hover:text-red-300 font-black" :
                        isLogin ? "text-emerald-400 group-hover:text-emerald-300 font-black" :
                          isSwitch ? "text-amber-400 group-hover:text-amber-300 font-black" :
                            "text-slate-400 group-hover:text-white"
                    )}>
                      {item.label}
                    </span>
                  </>
                );

                if (isLogout) {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={handleLogout}
                      className="flex flex-col items-center text-center group cursor-pointer"
                    >
                      {content}
                    </button>
                  );
                }

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
          </div>
        </>
      )}

      {/* Main Bottom Navigation Bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300",
        visible ? "translate-y-0" : "translate-y-full"
      )}>
        <nav className="flex h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] w-full items-center justify-around border-t border-white/10 bg-[#03050c]/95 px-2 shadow-2xl backdrop-blur-xl">
          {primaryItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/brand/dashboard" && item.href !== "/talent/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col items-center justify-center gap-1 py-1 cursor-pointer"
              >
                <div
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-active:scale-90",
                    isActive
                      ? "bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.35)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-bold tracking-wider uppercase transition-colors duration-300",
                    isActive ? "text-amber-400 font-black" : "text-slate-500"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More Menu Action Button */}
          <button
            type="button"
            onClick={() => setShowMoreMenu(true)}
            className="group flex flex-col items-center justify-center gap-1 py-1 focus:outline-none cursor-pointer"
          >
            <div
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-active:scale-90",
                showMoreMenu
                  ? "bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.35)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Menu className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span
              className={cn(
                "text-[9px] font-bold tracking-wider uppercase transition-colors duration-300",
                showMoreMenu ? "text-amber-400 font-black" : "text-slate-500"
              )}
            >
              Thêm
            </span>
          </button>
        </nav>
      </div>
    </>
  );
}
