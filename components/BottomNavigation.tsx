"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Briefcase, BookmarkCheck, Search, User,
  Sparkles, Calendar, MessageSquare, Menu, X, LogOut,
  Users, Bell, Settings, LogIn, Info, HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutCurrentSession, AUTH_USER_UPDATED_EVENT, getAuthToken } from "@/lib/api-client";
import { getGuestMoreNavigation, getGuestPrimaryNavigation } from "@/lib/public-navigation";
import ControlCenterExplanationDialog from "@/components/ui/ControlCenterExplanationDialog";

const talentAllItems = [
  { label: "Tổng quan", icon: Home, href: "/talent/dashboard" },
  { label: "Hồ sơ Talent", icon: User, href: "/talent/portfolio" },
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
  { label: "Đã lưu", icon: BookmarkCheck, href: "/brand/shortlists" },
  { label: "Đăng việc làm", icon: Briefcase, href: "/brand/campaigns" },
  { label: "Tin nhắn", icon: MessageSquare, href: "/brand/messages" },
  // { label: "Báo cáo", icon: BarChart3, href: "/brand/analytics" },
  { label: "Quản lý Talent", icon: Users, href: "/brand/my-talents" },
  // { label: "Thanh toán", icon: Wallet, href: "/brand/billing" },
  // { label: "Thông báo", icon: Bell, href: "/brand/notifications" },
  { label: "Thông tin brand", icon: Settings, href: "/brand/settings" },
  { label: "Đăng xuất", icon: LogOut, href: "/" },
];

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

  // Guard: only render the bottom nav inside the app-like public/portal pages.
  if (!pathname.startsWith("/talent") && !pathname.startsWith("/brand") && pathname !== "/about") {
    return null;
  }

  const isBrand = pathname.startsWith("/brand");
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

  const activeBrandItems = brandAllItems.filter(item =>
    item.label !== "Tổng quan" &&
    item.label !== "Tin nhắn" &&
    item.label !== "Đăng xuất"
  );

  const activeTalentItems = talentAllItems.filter(item =>
    item.label !== "Tổng quan" &&
    item.label !== "Lịch trình" &&
    item.label !== "Tin nhắn" &&
    item.label !== "Đăng xuất"
  );

  const renderItemLink = (item: typeof brandAllItems[number]) => {
    const Icon = item.icon;
    const isLogout = item.label === "Đăng xuất";
    const isLogin = item.label === "Đăng nhập";
    const isGuestTalentActive = !isLoggedIn && item.href === "/brand/search" && (
      activePathname === "/brand/search" || activePathname.startsWith("/brand/talents/")
    );
    const isGuestJobsActive = !isLoggedIn && item.href === "/talent/jobs" && activePathname.startsWith("/talent/jobs");
    const isActive = !isLogout && !isLogin && (
      isGuestTalentActive || isGuestJobsActive || activePathname === item.href || (item.href !== "/brand/dashboard" && item.href !== "/talent/dashboard" && activePathname.startsWith(item.href))
    );

    const content = (
      <>
        <div className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 group-active:scale-95",
          isActive
            ? "bg-gradient-to-br from-amber-200 to-yellow-500 border-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.25)] scale-105"
            : isLogout
              ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.08)]"
              : isLogin
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.08)]"
                : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
        )}>
          <Icon className="h-5 w-5 animate-none" />
        </div>
        <span className={cn(
          "text-[8px] font-bold mt-1.5 leading-tight uppercase tracking-wider transition-colors block max-w-[70px] truncate",
          isActive && "text-amber-400 font-extrabold",
          isLogout ? "text-red-400 group-hover:text-red-300 font-black" :
            isLogin ? "text-emerald-400 group-hover:text-emerald-300 font-black" :
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
  };

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
            {isLoggedIn ? (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                {/* Dành cho Brand */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-l-2 border-yellow-500 pl-2 bg-gradient-to-r from-yellow-500/10 to-transparent py-1 rounded-r-lg">
                    <Briefcase className="h-3.5 w-3.5 text-yellow-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] bg-gradient-to-r from-amber-100 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                      Dành cho Brand
                    </span>
                    <button
                      type="button"
                      onClick={() => setExplanationTab("brand")}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-yellow-500/35 bg-yellow-500/10 text-[10px] font-black text-yellow-300 shadow-[0_0_8px_rgba(234,179,8,0.12)] transition-all hover:scale-105 active:scale-95 cursor-pointer hover:border-yellow-400/70 hover:bg-yellow-500/20 hover:text-white"
                      aria-label="Giải thích Dành cho Brand"
                      title="Giải thích Dành cho Brand"
                    >
                      <HelpCircle className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-y-4 gap-x-2.5">
                    {activeBrandItems.map((item) => renderItemLink(item))}
                  </div>
                </div>

                {/* Dành cho Talent */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-l-2 border-amber-400 pl-2 bg-gradient-to-r from-amber-500/10 to-transparent py-1 rounded-r-lg">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                      Dành cho Talent
                    </span>
                    <button
                      type="button"
                      onClick={() => setExplanationTab("talent")}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-amber-400/35 bg-amber-400/10 text-[10px] font-black text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.12)] transition-all hover:scale-105 active:scale-95 cursor-pointer hover:border-amber-300/70 hover:bg-amber-400/20 hover:text-white"
                      aria-label="Giải thích Dành cho Talent"
                      title="Giải thích Dành cho Talent"
                    >
                      <HelpCircle className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-y-4 gap-x-2.5">
                    {activeTalentItems.map((item) => renderItemLink(item))}
                  </div>
                </div>

                {/* Actions / Logout */}
                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-y-5 gap-x-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {guestMoreItems.map((item) => renderItemLink(item))}
              </div>
            )}
          </div>
          {explanationTab && (
            <ControlCenterExplanationDialog
              isOpen
              defaultTab={explanationTab}
              onClose={() => setExplanationTab(null)}
            />
          )}
        </>
      )}

      {/* Main Bottom Navigation Bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300",
        visible ? "translate-y-0" : "translate-y-full"
      )}>
        <nav className="flex h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] w-full items-center justify-around border-t border-white/10 bg-[#03050c]/95 px-2 shadow-2xl backdrop-blur-xl">
          {primaryItems.map((item) => {
            const isGuestTalentActive = !isLoggedIn && item.href === "/brand/search" && (
              activePathname === "/brand/search" || activePathname.startsWith("/brand/talents/")
            );
            const isGuestJobsActive = !isLoggedIn && item.href === "/talent/jobs" && activePathname.startsWith("/talent/jobs");
            const isActive = isGuestTalentActive || isGuestJobsActive || activePathname === item.href || (item.href !== "/brand/dashboard" && item.href !== "/talent/dashboard" && activePathname.startsWith(item.href));
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
