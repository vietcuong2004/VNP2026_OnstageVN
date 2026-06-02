"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, User, Briefcase, Crown, MessageSquare, Calendar, Wallet, Settings,
  Sparkles, BookmarkCheck, LogOut, LayoutDashboard, ChevronRight, Trophy,
  Search, BarChart3, Users, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const talentMenuItems = [
  { label: "Tổng quan", icon: Home, href: "/talent/dashboard" },
  { label: "Khám phá bản thân", icon: Sparkles, href: "/talent/survey" },
  { label: "Hồ sơ cá nhân", icon: User, href: "/talent/portfolio" },
  { label: "Lịch trình", icon: Calendar, href: "/talent/calendar" },
  { label: "Danh sách cuộc thi", icon: Trophy, href: "/talent/contests" },
  { label: "Chợ việc làm", icon: Briefcase, href: "/talent/jobs" },
  { label: "Quỹ vương miện", icon: Crown, href: "/talent/crown" },
  { label: "Tin nhắn", icon: MessageSquare, href: "/talent/messages" },
  { label: "Thu nhập", icon: Wallet, href: "/talent/wallet" },
];

const brandMenuItems = [
  { label: "Tổng quan", icon: LayoutDashboard, href: "/brand/dashboard" },
  { label: "Tìm kiếm Talent", icon: Search, href: "/brand/search" },
  { label: "Danh sách đã lưu", icon: BookmarkCheck, href: "/brand/shortlists" },
  { label: "Chiến dịch", icon: Briefcase, href: "/brand/campaigns" },
  { label: "Tin nhắn", icon: MessageSquare, href: "/brand/messages" },
  { label: "Báo cáo & Phân tích", icon: BarChart3, href: "/brand/analytics" },
  { label: "Quản lý thanh toán", icon: Wallet, href: "/brand/billing" },
  { label: "Thông báo", icon: Bell, href: "/brand/notifications" },
  { label: "Cài đặt", icon: Settings, href: "/brand/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isTalent = pathname.startsWith("/talent");
  const isBrand = pathname.startsWith("/brand");
  const isGateway = pathname === "/";

  async function handleLogout() {
    const token = localStorage.getItem("onstagevn_auth_token");

    if (token) {
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api").replace(/\/$/, "");
        await fetch(`${baseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // Local logout still clears browser session
      }
    }

    localStorage.removeItem("onstagevn_auth_token");
    localStorage.removeItem("onstagevn_auth_user");
    router.push("/auth/login");
  }

  const currentMenuItems = isTalent ? talentMenuItems : isBrand ? brandMenuItems : [];

  if (isGateway || currentMenuItems.length === 0) {
    return null;
  }

  return (
    <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-white/5 bg-[#050711] p-6 overflow-y-auto">
      {/* Sidebar Navigation Links */}
      <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
        {currentMenuItems.map((item) => {
          const isActive = pathname === item.href || (item.href.split("/").length > 3 && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 group relative",
                isActive
                  ? "bg-gradient-to-r from-amber-400/10 to-yellow-600/5 text-amber-300 border border-amber-500/20 shadow-[0_4px_12px_rgba(245,158,11,0.05)]"
                  : "text-slate-400 hover:bg-white/2 hover:text-slate-100 border border-transparent"
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
      </nav>

      {/* Footer Logout */}
      <div className="border-t border-white/5 pt-4 mt-auto">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-[11px] font-bold text-red-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <LogOut className="h-4 w-4 text-red-500" /> Đăng xuất
          </span>
          <ChevronRight className="h-3 w-3 text-red-450" />
        </button>
      </div>
    </aside>
  );
}
