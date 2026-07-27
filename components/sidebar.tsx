"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  BookmarkCheck,
  Briefcase,
  Calendar,
  HelpCircle,
  Home,
  Info,
  LayoutDashboard,
  LogIn,
  MessageSquare,
  Search,
  Sparkles,
  User,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTH_USER_UPDATED_EVENT, getAuthToken } from "@/lib/api-client";
import { getGuestDesktopNavigation } from "@/lib/public-navigation";
import ControlCenterExplanationDialog from "@/components/ui/ControlCenterExplanationDialog";

const talentMenuItems = [
  // { label: "Tổng quan", icon: Home, href: "/talent/dashboard" },
  { label: "Chợ việc làm", icon: Briefcase, href: "/talent/jobs" },
  { label: "Hồ sơ Talent", icon: User, href: "/talent/portfolio" },
  { label: "Khảo sát", icon: Sparkles, href: "/talent/survey" },
  // { label: "Lịch trình", icon: Calendar, href: "/talent/calendar" },
  { label: "Hợp tác Brand", icon: Users2, href: "/talent/brands" },
  // { label: "Tin nhắn", icon: MessageSquare, href: "/talent/messages" },
];

const brandMenuItems = [
  // { label: "Tổng quan", icon: LayoutDashboard, href: "/brand/dashboard" },
  { label: "Tìm kiếm Talent", icon: Search, href: "/brand/search" },
  { label: "Đăng việc làm", icon: Briefcase, href: "/brand/campaigns" },
  { label: "Quản lý Talent", icon: Users2, href: "/brand/my-talents" },
  { label: "Danh sách yêu thích", icon: BookmarkCheck, href: "/brand/shortlists" },
  // { label: "Tin nhắn", icon: MessageSquare, href: "/brand/messages" },
  // { label: "Thông báo", icon: Bell, href: "/brand/notifications" },
  { label: "Thông tin brand", icon: User, href: "/brand/settings" },
];

type SidebarItem = (typeof brandMenuItems)[number];

export default function Sidebar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sourcePath, setSourcePath] = useState("");
  const [explanationTab, setExplanationTab] = useState<"talent" | "brand" | null>(null);

  const isAppPath = pathname.startsWith("/talent") || pathname.startsWith("/brand");
  const isGateway = pathname === "/";

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
    if (!pathname.startsWith("/brand/talents/") && !pathname.startsWith("/talent/jobs/")) {
      setSourcePath("");
      return;
    }

    setSourcePath(new URLSearchParams(window.location.search).get("from") || "");
  }, [pathname]);

  if (isGateway || !isAppPath) {
    return null;
  }

  const renderMenuItems = (items: SidebarItem[]) => items.map((item) => {
    const isGuestTalentActive = !isLoggedIn && item.href === "/brand/search" && (
      activePathname === "/brand/search" || activePathname.startsWith("/brand/talents/")
    );
    const isGuestJobsActive = !isLoggedIn && item.href === "/talent/jobs" && activePathname.startsWith("/talent/jobs");
    const isActive = isGuestTalentActive || isGuestJobsActive || activePathname === item.href || (item.href.split("/").length > 3 && activePathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        key={`${item.href}-${item.label}`}
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3.5 rounded-xl border px-4 py-3 text-sm font-semibold tracking-wide transition-all duration-300",
          isActive
            ? "border-amber-500/20 bg-gradient-to-r from-amber-400/10 to-yellow-600/5 text-amber-300 shadow-[0_4px_12px_rgba(245,158,11,0.05)]"
            : "border-transparent text-slate-400 hover:bg-white/2 hover:text-slate-100"
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-1/3 bottom-1/3 w-0.5 rounded bg-amber-400" />
        )}
        <Icon className={cn("h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-100")} />
        <span>{item.label}</span>
      </Link>
    );
  });

  const renderSection = (title: string, items: SidebarItem[], tab: "talent" | "brand") => {
    const isTalent = tab === "talent";
    const Icon = isTalent ? Sparkles : Briefcase;

    return (
      <section className="space-y-3">
        <div
          className={cn(
            "flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl border transition-all duration-300",
            isTalent
              ? "border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/[0.02] to-transparent shadow-[0_2px_10px_rgba(245,158,11,0.03)] hover:border-amber-400/30"
              : "border-yellow-600/20 bg-gradient-to-r from-yellow-600/10 via-yellow-600/[0.02] to-transparent shadow-[0_2px_10px_rgba(202,138,4,0.03)] hover:border-yellow-500/30"
          )}
        >
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex h-5.5 w-5.5 items-center justify-center rounded-lg border text-[10px] transition-transform duration-300 hover:rotate-12",
              isTalent
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
            )}>
              <Icon className="h-3 w-3" />
            </div>
            <p className={cn(
              "text-[10px] font-black uppercase tracking-[0.18em]",
              isTalent
                ? "bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]"
                : "bg-gradient-to-r from-amber-100 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(234,179,8,0.25)]"
            )}>
              {title}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExplanationTab(tab)}
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-black transition-all duration-300 hover:scale-105 active:scale-95",
              isTalent
                ? "border-amber-400/35 bg-amber-400/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.12)] hover:border-amber-300/70 hover:bg-amber-400/20 hover:text-white hover:shadow-[0_0_16px_rgba(245,158,11,0.25)]"
                : "border-yellow-500/35 bg-yellow-500/10 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.12)] hover:border-yellow-400/70 hover:bg-yellow-500/20 hover:text-white hover:shadow-[0_0_16px_rgba(234,179,8,0.25)]"
            )}
            aria-label={`Giải thích ${title}`}
            title={`Giải thích ${title}`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-2 px-0.5">{renderMenuItems(items)}</div>
      </section>
    );
  };

  return (
    <>
      <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-white/5 bg-[#050711] p-6 overflow-y-auto">
        <nav className="flex-1 space-y-7 overflow-y-auto pr-1">
          {isLoggedIn ? (
            <>
              {renderSection("Dành cho Brand", brandMenuItems, "brand")}
              {renderSection("Dành cho Talent", talentMenuItems, "talent")}
            </>
          ) : (
            <div className="space-y-2">
              {renderMenuItems(guestMenuItems)}
            </div>
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
