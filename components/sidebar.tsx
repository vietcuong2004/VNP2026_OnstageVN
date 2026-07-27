"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Briefcase, HelpCircle, Info, LogIn, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTH_USER_UPDATED_EVENT, getAuthToken } from "@/lib/api-client";
import { unifiedLoggedInNavigationSections } from "@/lib/app-navigation";
import { getGuestDesktopNavigation } from "@/lib/public-navigation";
import ControlCenterExplanationDialog from "@/components/ui/ControlCenterExplanationDialog";

export default function Sidebar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sourcePath, setSourcePath] = useState("");
  const [explanationTab, setExplanationTab] = useState<"talent" | "brand" | null>(null);

  const isGateway = pathname === "/";
  const isAppPath = pathname.startsWith("/talent") || pathname.startsWith("/brand") || pathname === "/about";
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
              <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/[0.02] to-transparent px-3.5 py-2 shadow-[0_2px_10px_rgba(245,158,11,0.03)] transition-all duration-300 hover:border-amber-400/30">
                <div className="flex items-center gap-3">
                  <span className="flex h-5.5 w-5.5 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 transition-transform duration-300 hover:rotate-12">
                    <section.icon className="h-3 w-3" />
                  </span>
                  <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-[10px] font-black uppercase tracking-[0.18em] text-transparent drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]">
                    {section.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setExplanationTab(section.title.includes("Brand") ? "brand" : "talent")}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-400/35 bg-amber-400/10 text-[11px] font-black text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.12)] transition-all duration-300 hover:scale-105 hover:border-amber-300/70 hover:bg-amber-400/20 hover:text-white hover:shadow-[0_0_16px_rgba(245,158,11,0.25)] active:scale-95 cursor-pointer"
                  aria-label={`Giải thích ${section.title}`}
                  title={`Giải thích ${section.title}`}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2 px-0.5">
              {section.items.map((item) => {
                const isActive = isActiveHref(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3.5 rounded-xl border px-4 py-3 text-sm font-semibold tracking-wide transition-all duration-300",
                      isActive
                        ? "border-amber-500/20 bg-gradient-to-r from-amber-400/10 to-yellow-600/5 text-amber-300 shadow-[0_4px_12px_rgba(245,158,11,0.05)]"
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
