"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Briefcase, BookmarkCheck, Crown, Search, User,
  Sparkles, Trophy, Calendar, MessageSquare, Wallet, Menu, X, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const talentAllItems = [
  { label: "Tổng quan", icon: Home, href: "/talent/dashboard" },
  { label: "Khám phá", icon: Sparkles, href: "/talent/survey" },
  { label: "Hồ sơ số", icon: User, href: "/talent/portfolio" },
  { label: "Cuộc thi", icon: Trophy, href: "/talent/contests" },
  { label: "Chợ việc làm", icon: Briefcase, href: "/talent/jobs" },
  { label: "Quỹ", icon: Crown, href: "/talent/crown" },
  { label: "Lịch trình", icon: Calendar, href: "/talent/calendar" },
  { label: "Tin nhắn", icon: MessageSquare, href: "/talent/messages" },
  { label: "Thu nhập", icon: Wallet, href: "/talent/wallet" },
  { label: "Đăng xuất", icon: LogOut, href: "/" },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Guard: only render the bottom nav inside the app portals.
  if (!pathname.startsWith("/talent") && !pathname.startsWith("/brand")) {
    return null;
  }

  const isBrand = pathname.startsWith("/brand");

  const brandItems = [
    { label: "Tổng quan", icon: Home, href: "/brand/dashboard" },
    { label: "Tìm kiếm", icon: Search, href: "/brand/discover" },
    { label: "Shortlist", icon: BookmarkCheck, href: "/brand/shortlists" },
    { label: "Campaign", icon: Briefcase, href: "/brand/campaigns" },
    { label: "Hồ sơ", icon: User, href: "/brand/settings" },
  ];

  // Active items for the primary bottom row (4 core items + More menu button)
  const talentPrimaryItems = [
    { label: "Tổng quan", icon: Home, href: "/talent/dashboard" },
    { label: "Hồ sơ", icon: User, href: "/talent/portfolio" },
    { label: "Lịch trình", icon: Calendar, href: "/talent/calendar" },
    { label: "Khám phá", icon: Sparkles, href: "/talent/survey" },
  ];

  return (
    <>
      {/* Backdrop overlay for the More menu */}
      <div
        onClick={() => setShowMoreMenu(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          showMoreMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Slide-up Bottom Sheet Menu */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 rounded-t-[2rem] border-t border-white/10 bg-[#070913]/98 p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-transform duration-500 ease-out md:hidden",
          showMoreMenu ? "translate-y-0" : "translate-y-full"
        )}
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
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Grid of all items */}
        <div className="grid grid-cols-4 gap-y-5 gap-x-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {talentAllItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setShowMoreMenu(false)}
                className="flex flex-col items-center text-center group"
              >
                <div className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-br from-amber-200 to-yellow-500 border-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.25)] scale-105"
                    : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-[8px] font-bold mt-1.5 leading-tight uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors block max-w-[70px] truncate",
                  isActive && "text-amber-400 font-extrabold"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-4 md:hidden">
        <nav className="flex h-16 w-full max-w-md items-center justify-around rounded-2xl border border-white/10 bg-slate-950/75 px-2 shadow-2xl backdrop-blur-xl">
          {isBrand ? (
            // Brand Layout: 5 items directly on bottom row
            brandItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/brand/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex flex-col items-center justify-center gap-1 py-1"
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
            })
          ) : (
            // Talent Layout: 4 core items + 1 Menu button
            <>
              {talentPrimaryItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/talent/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group flex flex-col items-center justify-center gap-1 py-1"
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
                className="group flex flex-col items-center justify-center gap-1 py-1 focus:outline-none"
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
            </>
          )}
        </nav>
      </div>
    </>
  );
}
