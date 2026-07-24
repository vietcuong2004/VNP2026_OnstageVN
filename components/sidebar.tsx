"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, User, Briefcase, Crown, MessageSquare, Calendar, Wallet, Settings,
  Sparkles, BookmarkCheck, LayoutDashboard, ChevronRight, Trophy,
  Search, BarChart3, Users, Bell, Users2, Share2, ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const talentMenuItems = [
  { label: "Tổng quan", icon: Home, href: "/talent/dashboard" },
  { label: "Việc làm", icon: Briefcase, href: "/talent/jobs" },
  { label: "Hồ sơ cá nhân", icon: User, href: "/talent/portfolio" },
  { label: "Khảo sát", icon: Sparkles, href: "/talent/survey" },
  { label: "Lịch trình", icon: Calendar, href: "/talent/calendar" },
  // { label: "Chiến dịch Affiliate", icon: Share2, href: "/talent/affiliate" },
  { label: "Hợp tác Brand", icon: Users2, href: "/talent/brands" },
  // { label: "Danh sách cuộc thi", icon: Trophy, href: "/talent/contests" },
  // { label: "Crowdfunding", icon: Crown, href: "/talent/crownfunding" },
  { label: "Tin nhắn", icon: MessageSquare, href: "/talent/messages" },
  // { label: "Thu nhập", icon: Wallet, href: "/talent/wallet" },
];

const brandMenuItems = [
  { label: "Tổng quan", icon: LayoutDashboard, href: "/brand/dashboard" },
  { label: "Tìm kiếm Talent", icon: Search, href: "/brand/search" },
  { label: "Đăng việc làm", icon: Briefcase, href: "/brand/campaigns" },
  { label: "Quản lý Talent", icon: Users2, href: "/brand/my-talents" },
  { label: "Danh sách đã lưu", icon: BookmarkCheck, href: "/brand/shortlists" },
  { label: "Tin nhắn", icon: MessageSquare, href: "/brand/messages" },
  // { label: "Báo cáo & Phân tích", icon: BarChart3, href: "/brand/analytics" },
  // { label: "Quản lý thanh toán", icon: Wallet, href: "/brand/billing" },
  { label: "Thông báo", icon: Bell, href: "/brand/notifications" },
  { label: "Thông tin brand", icon: User, href: "/brand/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isTalent = pathname.startsWith("/talent");
  const isBrand = pathname.startsWith("/brand");
  const isGateway = pathname === "/";

  const currentMenuItems = isTalent ? talentMenuItems : isBrand ? brandMenuItems : [];

  if (isGateway || currentMenuItems.length === 0) {
    return null;
  }

  const targetRolePath = isTalent ? "/brand/dashboard" : "/talent/jobs";
  const switchLabel = isTalent ? "Chuyển sang Brand" : "Chuyển sang Talent";

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

      {/* Footer Mode Switch */}
      <div className="border-t border-white/5 pt-4 mt-auto">
        <Link
          href={targetRolePath}
          className="flex h-11 w-full items-center justify-between rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 px-5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_4px_20px_rgba(245,197,24,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-slate-950" />
            {switchLabel}
          </span>
          <ChevronRight className="h-4 w-4 text-slate-950" />
        </Link>
      </div>
    </aside>
  );
}
