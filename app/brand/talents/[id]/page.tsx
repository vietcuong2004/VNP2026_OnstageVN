"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  DollarSign,
  GraduationCap,
  Languages,
  MapPin,
  Ruler,
  ShieldCheck,
  Star,
  Users,
  Heart,
  MessageSquare,
  TrendingUp,
  Wallet,
  Image as ImageIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
  BookOpen,
  X,
  Scale,
  Upload,
  ChevronDown,
  ChevronUp,
  Mail,
  Globe,
  FileText,
  Video,
  Eye,
  MoreVertical,
  BookmarkCheck,
  ExternalLink,
  CalendarCheck,
  ShoppingBag,
  Flame,
  Zap,
  PackageCheck,
  Clock,
  Trophy,
  ShoppingCart,
  Coins,
  Info,
  Store,
  BarChart2,
  PlayCircle,
  Play,
  Film,
  Layers,
  Copy,
} from "lucide-react";
import BookingFlow from "@/app/brand/talents/[id]/booking-talent/BookingFlow";
import { findTalentById } from "@/lib/brand-mvp-data";
import { cn, getSocialHandle } from "@/lib/utils";
import RadarChart from "@/components/ui/RadarChart";
import TierExplanationDialog from "@/components/ui/TierExplanationDialog";
import OnstagePerformanceExplanationDialog from "@/components/ui/OnstagePerformanceExplanationDialog";
import BadgeTier, { getPrimaryAchievementBadge } from "@/components/ui/BadgeTier";
import { addBrandRosterTalent, loadBrandRosterTalents, loadBrandTalent, loadBrandWishlists, addTalentToWishlist, removeTalentFromWishlist, createBrandWishlist } from "@/lib/brand-api";
import { createInitialAvatarDataUrl, normalizeBackendAssetUrl } from "@/lib/avatar";
import { useGuestActionPrompt } from "@/components/guest-action-prompt";
import { getAuthToken } from "@/lib/api-client";
import { notifySavedTalentsUpdated } from "@/lib/guest-saved-talents";
import { addViewedTalentId } from "@/lib/talent-view-history";

const convertToDisplayDate = (dateStr: string) => {
  if (!dateStr) return "Chưa cập nhật";
  const dateOnly = dateStr.split(/[T ]/)[0];
  if (dateOnly.includes("-")) {
    const parts = dateOnly.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    }
  }
  return dateOnly;
};

interface ContactInfoCardProps {
  profile: any;
}

function portfolioLinksFromProfile(profile: any): string[] {
  const rawLinks = profile?.portfolioLinks ?? profile?.portfolio_links ?? profile?.portfolio_url ?? "";
  const links = Array.isArray(rawLinks)
    ? rawLinks
    : String(rawLinks).split(/[\n,;]+/);

  return Array.from(new Set(
    links
      .map((link: unknown) => String(link).trim())
      .filter(Boolean),
  ));
}

function portfolioHref(link: string): string {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|mov|m4v|webm|ogg)(\?|#|$)/i.test(url);
}

function formatLanguageList(value: unknown) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  const labels = list
    .map((item) => {
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const name = String(record.language || record.name || record.label || "").trim();
        const proficiency = String(record.proficiency || record.level || record.proficiency_level || "").trim();
        if (name && proficiency && !name.includes("(")) return `${name} (${proficiency})`;
        return name || proficiency;
      }

      return String(item || "").trim();
    })
    .filter(Boolean);

  return labels.length > 0 ? labels.join(", ") : "Chưa cập nhật";
}

const FacebookLogo = ({ className = "h-5 w-5 shrink-0 object-contain" }: { className?: string }) => (
  <img src="/social/facebook.png" alt="Facebook" className={className} />
);

const TiktokLogo = ({ className = "h-5 w-5 shrink-0 object-contain" }: { className?: string }) => (
  <img src="/social/tiktok.png" alt="TikTok" className={className} />
);

const InstagramLogo = ({ className = "h-5 w-5 shrink-0 object-contain" }: { className?: string }) => (
  <img src="/social/instagram.png" alt="Instagram" className={className} />
);

const YoutubeLogo = ({ className = "h-5 w-5 shrink-0 object-contain" }: { className?: string }) => (
  <img src="/social/youtube.png" alt="YouTube" className={className} />
);

const ThreadIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.48 13.9c-.83.09-1.58-.2-2-.84-.33-.51-.39-1.12-.39-2.22 0-1.89.87-2.92 2.32-2.92 1.41 0 2.22.99 2.22 2.76 0 1.94-.89 2.97-2.15 3.22zm2.09-6.3c-.63-.61-1.54-.95-2.57-.95-1.95 0-3.34 1.34-3.34 3.79s1.39 3.79 3.34 3.79c.8 0 1.51-.2 2.03-.59.18-.13.43-.1.58.07l.79.9c.28.32.18.84-.2 1.04-1 .55-2.14.78-3.2.78-3.33 0-5.74-2.17-5.74-5.99s2.41-5.99 5.74-5.99c1.67 0 3.2.53 4.31 1.49.27.23.31.63.09.91l-.88 1.13c-.15.2-.42.24-.62.08z" />
  </svg>
);

const getSocialPlatformInfo = (rawPlatform: string, url: string) => {
  const p = (rawPlatform || "").toLowerCase().trim();
  const u = (url || "").toLowerCase().trim();

  if (p.includes("facebook") || p.includes("fb") || u.includes("facebook.com") || u.includes("fb.com")) {
    return {
      platformKey: "Facebook",
      icon: <FacebookLogo className="h-9 w-9 shrink-0 object-contain" />,
      colorClass: "hover:text-[#1877F2] hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 text-[#1877F2]",
    };
  }
  if (p.includes("tiktok") || u.includes("tiktok.com")) {
    return {
      platformKey: "Tiktok",
      icon: <TiktokLogo className="h-9 w-9 shrink-0 object-contain" />,
      colorClass: "hover:text-[#FE2C55] hover:border-[#FE2C55]/50 hover:bg-[#FE2C55]/10 text-[#FE2C55]",
    };
  }
  if (p.includes("instagram") || p.includes("insta") || u.includes("instagram.com") || u.includes("instagr.am")) {
    return {
      platformKey: "Instagram",
      icon: <InstagramLogo className="h-9 w-9 shrink-0 object-contain" />,
      colorClass: "hover:text-[#E1306C] hover:border-[#E1306C]/50 hover:bg-[#E1306C]/10 text-[#E1306C]",
    };
  }
  if (p.includes("thread") || u.includes("threads.net")) {
    return {
      platformKey: "Thread",
      icon: <ThreadIcon />,
      colorClass: "hover:text-[#ffffff] hover:border-[#ffffff]/50 hover:bg-[#ffffff]/10 text-white",
    };
  }
  if (p.includes("youtube") || p.includes("yt") || u.includes("youtube.com") || u.includes("youtu.be") || p.includes("linkedin") || u.includes("linkedin.com")) {
    return {
      platformKey: "Youtube",
      icon: <YoutubeLogo className="h-9 w-9 shrink-0 object-contain" />,
      colorClass: "hover:text-[#FF0000] hover:border-[#FF0000]/50 hover:bg-[#FF0000]/10 text-[#FF0000]",
    };
  }

  return {
    platformKey: rawPlatform || "Globe",
    icon: <Globe className="h-5 w-5 shrink-0 text-amber-400" />,
    colorClass: "hover:text-amber-300 hover:border-amber-400/50 hover:bg-amber-400/10 text-amber-400",
  };
};



function OnstagePerformanceCard({
  profile,
  onOpenExplanation,
}: {
  profile: any;
  onOpenExplanation?: () => void;
}) {
  const seedString = String(profile?.id || profile?.slug || profile?.name || "idol");
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash * 31 + seedString.charCodeAt(i)) >>> 0;
  }

  const campaignsCount = (1200 + (hash % 1600)).toLocaleString("vi-VN") + "+";
  const ordersCount = (5 + ((hash % 80) / 10)).toFixed(1) + "K";
  const netGmv = `₫${(0.8 + ((hash % 120) / 100)).toFixed(1)}B`;
  const brandRating = (4.7 + ((hash % 3) / 10)).toFixed(1) + "/5";
  const brandReviewCount = 180 + (hash % 240);

  return (
    <div className="rounded-2xl border border-[#F0D7D3] bg-white p-3 sm:p-4 shadow-[0_8px_24px_rgba(143,7,9,0.04)] dark:border-[#151b2d] dark:bg-[#08090f] dark:shadow-xl space-y-2.5 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0D7D3]/80 pb-2 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0EE] text-[#8F0709] border border-[#F0D7D3] dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20 shrink-0">
            <Trophy className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-display font-black text-sm text-[#191116] uppercase tracking-wider dark:text-white leading-none">
            Hiệu suất trên Onstage
          </h3>
        </div>
        <button
          type="button"
          onClick={onOpenExplanation}
          className="text-[#7B6866] hover:text-[#8F0709] dark:text-slate-400 dark:hover:text-white transition cursor-pointer p-0.5"
          title="Xem giải thích chi tiết các chỉ số hiệu suất"
        >
          <Info className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {/* Card 1: Chiến dịch/đơn đã thực hiện */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#F0D7D3]/70 bg-[#FFFDFB] p-2 sm:p-2.5 text-center dark:border-white/5 dark:bg-slate-900/80 shadow-2xs">
          <FileText className="h-4 w-4 text-[#C72524] dark:text-rose-400 mb-0.5" />
          <span className="text-sm sm:text-base font-black text-[#8F0709] dark:text-white leading-tight">
            {campaignsCount}
          </span>
          <span className="mt-0.5 text-[9.5px] sm:text-[10px] font-medium text-[#574D54] dark:text-slate-400 leading-snug">
            Chiến dịch/đơn đã thực hiện
          </span>
        </div>

        {/* Card 2: Đơn hàng tạo ra */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#F0D7D3]/70 bg-[#FFFDFB] p-2 sm:p-2.5 text-center dark:border-white/5 dark:bg-slate-900/80 shadow-2xs">
          <ShoppingCart className="h-4 w-4 text-[#C72524] dark:text-rose-400 mb-0.5" />
          <span className="text-sm sm:text-base font-black text-[#8F0709] dark:text-white leading-tight">
            {ordersCount}
          </span>
          <span className="mt-0.5 text-[9.5px] sm:text-[10px] font-medium text-[#574D54] dark:text-slate-400 leading-snug">
            Đơn hàng tạo ra
          </span>
        </div>

        {/* Card 3: Tổng doanh thu */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#F0D7D3]/70 bg-[#FFFDFB] p-2 sm:p-2.5 text-center dark:border-white/5 dark:bg-slate-900/80 shadow-2xs">
          <Coins className="h-4 w-4 text-[#C72524] dark:text-rose-400 mb-0.5" />
          <span className="text-sm sm:text-base font-black text-[#8F0709] dark:text-white leading-tight">
            {netGmv}
          </span>
          <span className="mt-0.5 text-[9.5px] sm:text-[10px] font-medium text-[#574D54] dark:text-slate-400 leading-snug">
            Tổng doanh thu
          </span>
        </div>

        {/* Card 4: Đánh giá từ Brand */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#F0D7D3]/70 bg-[#FFFDFB] p-2 sm:p-2.5 text-center dark:border-white/5 dark:bg-slate-900/80 shadow-2xs">
          <Star className="h-4 w-4 text-[#C72524] fill-[#C72524] dark:text-amber-400 dark:fill-amber-400 mb-0.5" />
          <span className="text-sm sm:text-base font-black text-[#8F0709] dark:text-white leading-tight">
            {brandRating}
          </span>
          <span className="mt-0.5 text-[9.5px] sm:text-[10px] font-medium text-[#574D54] dark:text-slate-400 leading-snug">
            Đánh giá từ Brand ({brandReviewCount}+)
          </span>
        </div>
      </div>
    </div>
  );
}

interface SocialMetricItem {
  icon: React.ReactNode;
  value: string;
  unit?: string;
  label: string;
}

interface PlatformData {
  platformName: string;
  metrics: SocialMetricItem[];
  shopTitle: string;
  buttonLabel: string;
}

function getPlatformStats(platformKey: string, account: any, seed: string): PlatformData {
  const realFollowers = account?.followers_count || account?.followers;
  const realLikes = account?.likes_count || account?.likes;

  let hash = 0;
  const key = `${seed}-${platformKey}-${account?.url || ""}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }

  const formatK = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toLocaleString("vi-VN");
  };

  const p = platformKey.toLowerCase();
  let baseStats: PlatformData;

  if (p.includes("facebook") || p.includes("fb")) {
    const followers = realFollowers ? Number(realFollowers) : 128000 + (hash % 15000);
    const latestReelView = Math.round(34600 + (hash % 1200));
    const latestEngage = Math.round(2600 + (hash % 300));

    baseStats = {
      platformName: "Facebook",
      buttonLabel: "Xem trang",
      shopTitle: "Có kênh bán hàng",
      metrics: [
        { icon: <Users className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: formatK(followers), label: "Followers" },
        { icon: <Eye className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: formatK(latestReelView), unit: "view/vid", label: "10 video gần đây" },
        { icon: <Heart className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: formatK(latestEngage), label: "Tương tác gần nhất" },
      ],
    };
  } else if (p.includes("tiktok")) {
    const followers = realFollowers ? Number(realFollowers) : 143600 + (hash % 20000);
    const totalLikes = realLikes ? Number(realLikes) : 2600000 + (hash % 300000);
    const latestView = Math.round(34500 + (hash % 1500));

    baseStats = {
      platformName: "TikTok",
      buttonLabel: "Xem kênh",
      shopTitle: "Đã liên kết TikTok Shop",
      metrics: [
        { icon: <Users className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: formatK(followers), label: "Followers" },
        { icon: <Eye className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: formatK(latestView), unit: "view/vid", label: "10 video gần đây" },
        { icon: <Heart className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: formatK(totalLikes), label: "Tổng lượt thích" },
      ],
    };
  } else if (p.includes("instagram") || p.includes("insta")) {
    const followers = realFollowers ? Number(realFollowers) : 145000 + (hash % 25000);
    const reach30d = Math.round(507400 + (hash % 30000));
    const latestReelView = Math.round(18800 + (hash % 1200));

    baseStats = {
      platformName: "Instagram",
      buttonLabel: "Xem trang",
      shopTitle: "Đã liên kết Instagram Shop",
      metrics: [
        { icon: <Users className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: formatK(followers), label: "Followers" },
        { icon: <Eye className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: formatK(latestReelView), unit: "view/vid", label: "10 video gần đây" },
        { icon: <BarChart2 className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: formatK(reach30d), label: "Reach 30 ngày" },
      ],
    };
  } else if (p.includes("youtube")) {
    const subs = realFollowers ? Number(realFollowers) : 65000 + (hash % 15000);
    const avgShortsViews = Math.round(48100 + (hash % 2500));
    const totalViews = Math.round(1000000 + (hash % 200000));

    baseStats = {
      platformName: "YouTube",
      buttonLabel: "Xem kênh",
      shopTitle: "Có YouTube Shopping",
      metrics: [
        { icon: <Users className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: formatK(subs), label: "Subscribers" },
        { icon: <Eye className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: formatK(avgShortsViews), unit: "view/vid", label: "10 video gần đây" },
        { icon: <PlayCircle className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: formatK(totalViews), label: "Tổng lượt xem" },
      ],
    };
  } else {
    const followers = realFollowers ? Number(realFollowers) : 10000 + (hash % 50000);
    baseStats = {
      platformName: platformKey || "Mạng xã hội",
      buttonLabel: "Xem trang",
      shopTitle: "Có kênh bán hàng",
      metrics: [
        { icon: <Users className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: formatK(followers), label: "Followers" },
        { icon: <Eye className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: formatK(Math.round(followers * 0.25)), unit: "view/vid", label: "10 video gần đây" },
        { icon: <Heart className="h-5 w-5 text-[#191116] dark:text-white shrink-0" />, value: "Tốt", label: "Tương tác" },
      ],
    };
  }

  // Override with custom metrics from backend if set
  if (account?.metrics?.followers_text) {
    baseStats.metrics[0].value = account.metrics.followers_text;
  }
  if (account?.metrics?.avg_views) {
    baseStats.metrics[1].value = account.metrics.avg_views;
  }
  if (account?.metrics?.interaction) {
    baseStats.metrics[2].value = account.metrics.interaction;
  }

  return baseStats;
}

interface SocialVideoItem {
  id: string;
  title?: string;
  views: string;
  isPinned?: boolean;
  duration?: string;
  overlayText?: string;
  topRightIcon?: React.ReactNode;
  thumbnail: string;
  url?: string;
}

interface PlatformVideosData {
  recent: SocialVideoItem[];
  featured: SocialVideoItem[];
}

function generateVideoViews(seedKey: string, idx: number): string {
  let hash = 0;
  const str = `${seedKey}-video-${idx}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  const tier = hash % 10;
  if (tier === 0 || tier === 1) {
    const base = 1.1 + ((hash % 28) / 10);
    return `${base.toFixed(1)}M`;
  } else if (tier >= 2 && tier <= 5) {
    const val = 100 + (hash % 790);
    const decimal = (hash >> 3) % 10;
    return decimal > 0 ? `${val}.${decimal}K` : `${val}K`;
  } else {
    const val = 15 + (hash % 84);
    const decimal = ((hash >> 2) % 9) + 1;
    return `${val}.${decimal}K`;
  }
}

function getPlatformVideos(platformKey: string, account: any, seed: string, profile: any): PlatformVideosData {
  const hasCustomRecent = Array.isArray(account?.recent_videos) && account.recent_videos.length > 0;
  const hasCustomFeatured = Array.isArray(account?.featured_videos) && account.featured_videos.length > 0;

  // If custom recent_videos or featured_videos exist in backend data, use them directly
  if (hasCustomRecent || hasCustomFeatured) {
    const mapVideo = (v: any, idx: number, prefix: string): SocialVideoItem => {
      let viewCount = String(v.views || v.views_count || "").trim();
      if (!viewCount || viewCount.toUpperCase() === "10K" || viewCount === "0") {
        viewCount = generateVideoViews(`${seed}-${platformKey}-${prefix}`, idx);
      }
      return {
        id: String(v.id || `custom-${prefix}-${idx}`),
        views: viewCount,
        thumbnail: v.thumbnail || v.thumbnail_url || (isDirectVideoUrl(v.url) ? v.url : "/video_thumb.png"),
        url: v.url,
        title: v.title,
        topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
      };
    };

    const customRecent = hasCustomRecent
      ? account.recent_videos.map((v: any, idx: number) => mapVideo(v, idx, "recent"))
      : (hasCustomFeatured ? account.featured_videos.map((v: any, idx: number) => mapVideo(v, idx, "featured")) : []);

    const customFeatured = hasCustomFeatured
      ? account.featured_videos.map((v: any, idx: number) => mapVideo(v, idx, "featured"))
      : customRecent;

    return {
      recent: customRecent,
      featured: customFeatured,
    };
  }
  const p = platformKey.toLowerCase();
  let hash = 0;
  const key = `${seed}-${platformKey}-${account?.url || ""}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }

  // Curated vertical and horizontal images matching the reference screenshot
  const imgGlasses = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";
  const imgCloseUp = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80";
  const imgGarden = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80";
  const imgMirror = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&auto=format&fit=crop&q=80";
  const imgPeace = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80";
  const imgHat = "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&auto=format&fit=crop&q=80";
  const imgSunset = "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=500&auto=format&fit=crop&q=80";
  const imgCat = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=80";

  if (p.includes("facebook") || p.includes("fb")) {
    return {
      recent: [
        {
          id: "fb-1",
          views: "31.7K",
          thumbnail: imgGlasses,
          topRightIcon: <Copy className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "fb-2",
          views: "468.9K",
          thumbnail: imgCloseUp,
          topRightIcon: <Copy className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "fb-3",
          views: "2.6M",
          thumbnail: imgGarden,
          topRightIcon: <Copy className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "fb-4",
          views: "125.4K",
          thumbnail: imgMirror,
          topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
      ],
      featured: [
        {
          id: "fb-f1",
          isPinned: true,
          views: "2.6M",
          thumbnail: imgGarden,
          topRightIcon: <Copy className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "fb-f2",
          isPinned: true,
          views: "1.2M",
          thumbnail: imgCloseUp,
          topRightIcon: <Copy className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "fb-f3",
          views: "890K",
          thumbnail: imgGlasses,
          topRightIcon: <Copy className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "fb-f4",
          views: "540K",
          thumbnail: imgMirror,
          topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
      ],
    };
  }

  if (p.includes("tiktok")) {
    return {
      recent: [
        {
          id: "tt-1",
          isPinned: true,
          views: "120.4K",
          thumbnail: imgGlasses,
          topRightIcon: <Copy className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "tt-2",
          isPinned: true,
          views: "1.2M",
          thumbnail: imgCloseUp,
          topRightIcon: <Copy className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "tt-3",
          views: "532.7K",
          thumbnail: imgPeace,
          topRightIcon: <Copy className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "tt-4",
          views: "96.3K",
          thumbnail: imgMirror,
          topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
      ],
      featured: [
        {
          id: "tt-f1",
          isPinned: true,
          views: "2.8M",
          thumbnail: imgCloseUp,
          topRightIcon: <Copy className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "tt-f2",
          isPinned: true,
          views: "1.9M",
          thumbnail: imgPeace,
          topRightIcon: <Copy className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "tt-f3",
          views: "1.2M",
          thumbnail: imgGlasses,
          topRightIcon: <Copy className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "tt-f4",
          views: "850K",
          thumbnail: imgMirror,
          topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
      ],
    };
  }

  if (p.includes("instagram") || p.includes("insta")) {
    return {
      recent: [
        {
          id: "ig-1",
          views: "28.4K",
          thumbnail: imgMirror,
          topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "ig-2",
          views: "93.1K",
          thumbnail: imgHat,
          topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "ig-3",
          views: "412.6K",
          thumbnail: imgSunset,
          topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "ig-4",
          views: "67.8K",
          thumbnail: imgCloseUp,
          topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
      ],
      featured: [
        {
          id: "ig-f1",
          isPinned: true,
          views: "890.5K",
          thumbnail: imgSunset,
          topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "ig-f2",
          isPinned: true,
          views: "640.2K",
          thumbnail: imgHat,
          topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "ig-f3",
          views: "520K",
          thumbnail: imgCloseUp,
          topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
        {
          id: "ig-f4",
          views: "380K",
          thumbnail: imgMirror,
          topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
        },
      ],
    };
  }

  // YouTube / Other
  return {
    recent: [
      {
        id: "yt-1",
        views: "215.4K",
        duration: "12:34",
        thumbnail: imgCloseUp,
        topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
      },
      {
        id: "yt-2",
        views: "84.7K",
        duration: "8:21",
        thumbnail: imgHat,
        topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
      },
      {
        id: "yt-3",
        views: "1.2M",
        duration: "15:06",
        overlayText: "ĐÀ NẴNG VLOG",
        thumbnail: imgSunset,
        topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
      },
      {
        id: "yt-4",
        views: "320.6K",
        duration: "10:18",
        thumbnail: imgCat,
        topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
      },
    ],
    featured: [
      {
        id: "yt-f1",
        isPinned: true,
        views: "2.4M",
        duration: "18:22",
        overlayText: "SUMMER TRIP",
        thumbnail: imgSunset,
        topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
      },
      {
        id: "yt-f2",
        isPinned: true,
        views: "1.8M",
        duration: "14:15",
        thumbnail: imgCloseUp,
        topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
      },
      {
        id: "yt-f3",
        views: "950K",
        duration: "11:05",
        thumbnail: imgHat,
        topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
      },
      {
        id: "yt-f4",
        views: "780K",
        duration: "09:40",
        thumbnail: imgCat,
        topRightIcon: <Film className="h-3.5 w-3.5 text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} />,
      },
    ],
  };
}

function SocialPlatformCardItem({
  account,
  info,
  handle,
  stats,
  videos,
  onPreviewImage,
}: {
  account: any;
  info: any;
  handle: string;
  stats: PlatformData;
  videos: PlatformVideosData;
  onPreviewImage?: (url: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"recent" | "featured">("recent");
  const currentVideos = (activeTab === "recent" ? videos.recent : videos.featured).slice(0, 3);
  const displayHandle = handle.startsWith("@") || stats.platformName === "Facebook" ? handle : `@${handle}`;

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-[#F1DBD7] bg-white p-4 sm:p-5 transition hover:border-[#C72524]/40 dark:border-white/10 dark:bg-slate-950/70 shadow-xs space-y-4 text-left">
      {/* Top Row: Logo, Full Handle (No Truncation), Action Buttons (Right) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full overflow-hidden shadow-2xs">
            {info.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h4
              className="text-sm sm:text-base font-black text-[#191116] dark:text-white break-words leading-tight"
              title={displayHandle}
            >
              {displayHandle}
            </h4>
          </div>
        </div>

        {/* Top Right Action Buttons: Icon only for [↗] and [🛒] */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={account.url.startsWith("http") ? account.url : `https://${account.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#191116] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 shadow-2xs cursor-pointer"
            title={stats.buttonLabel}
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          {account.shop_url && account.shop_url.trim() ? (
            <a
              href={account.shop_url.trim().startsWith("http") ? account.shop_url.trim() : `https://${account.shop_url.trim()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#F6E1DC] bg-[#FFF8F7] text-[#C72524] hover:bg-[#C72524] hover:text-white transition active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-rose-400 shadow-2xs cursor-pointer"
              title={stats.shopTitle}
            >
              <ShoppingCart className="h-4.5 w-4.5" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200/60 bg-slate-100/50 text-slate-400 dark:border-white/5 dark:bg-white/5 dark:text-slate-600 opacity-35 grayscale cursor-not-allowed select-none shadow-none"
              title="Chưa gắn link giỏ hàng"
            >
              <ShoppingCart className="h-4 w-4 stroke-[1.8]" />
            </button>
          )}
        </div>
      </div>

      {/* Middle Row: 3 Stat Columns - Clean, Centered, No 3-dot Truncation */}
      <div className="grid grid-cols-3 divide-x divide-[#F4E1DE]/70 border-t border-[#F4E1DE]/70 pt-3 dark:divide-white/10 dark:border-white/5">
        {stats.metrics.map((m, mIdx) => (
          <div
            key={mIdx}
            className="flex flex-col items-center justify-center text-center px-1.5 first:pl-0 last:pr-0"
          >
            <div className="flex items-baseline justify-center gap-1 flex-wrap">
              <span className="text-sm sm:text-base font-black text-[#C72524] dark:text-rose-400 leading-tight">
                {m.value}
              </span>
              {m.unit && (
                <span className="text-[10px] sm:text-xs font-bold text-[#191116] dark:text-slate-200 leading-tight">
                  {m.unit}
                </span>
              )}
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5 break-words">
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* Video Tabs Row (No Wrapping on Tabs or Link) */}
      <div className="flex items-center justify-between border-b border-[#F4E1DE]/60 dark:border-white/10 pb-1.5 pt-1 gap-2">
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("recent")}
            className={cn(
              "px-2.5 sm:px-3.5 py-1 text-xs sm:text-sm transition cursor-pointer rounded-t-md font-bold whitespace-nowrap",
              activeTab === "recent"
                ? "bg-[#FFF0EE]/90 text-[#C72524] dark:bg-rose-500/10 dark:text-rose-400 border-b-2 border-[#C72524]"
                : "text-slate-500 hover:text-[#191116] dark:text-slate-400 dark:hover:text-white font-medium"
            )}
          >
            <span>Video gần đây</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("featured")}
            className={cn(
              "px-2.5 sm:px-3.5 py-1 text-xs sm:text-sm transition cursor-pointer rounded-t-md font-bold whitespace-nowrap",
              activeTab === "featured"
                ? "bg-[#FFF0EE]/90 text-[#C72524] dark:bg-rose-500/10 dark:text-rose-400 border-b-2 border-[#C72524]"
                : "text-slate-500 hover:text-[#191116] dark:text-slate-400 dark:hover:text-white font-medium"
            )}
          >
            <span>Video nổi bật</span>
          </button>
        </div>

        <a
          href={account.url.startsWith("http") ? account.url : `https://${account.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm font-bold text-[#C72524] dark:text-rose-400 flex items-center gap-0.5 hover:underline cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Xem tất cả</span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </a>
      </div>

      {/* Video Grid (Enlarged vertical aspect-[9/16], clean without top tags/badges) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {currentVideos.map((video) => (
          <div
            key={video.id}
            data-overlay-white="true"
            onClick={() => {
              const targetUrl = video.url || account.url;
              if (targetUrl) {
                window.open(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`, "_blank");
              } else if (onPreviewImage) {
                onPreviewImage(video.thumbnail);
              }
            }}
            className="group relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-[#F0D7D3]/70 dark:border-white/10 shadow-sm hover:shadow-md transition cursor-pointer select-none"
          >
            {/* Thumbnail image or video */}
            {isDirectVideoUrl(video.url || video.thumbnail) ? (
              <video
                src={video.url || video.thumbnail}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                preload="metadata"
                controls
              />
            ) : (
              <img
                src={video.thumbnail}
                alt={video.title || "Video"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            )}

            {/* Clean bottom gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />

            {/* Center Media Player Button - No border, subtle blurred glass */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-black/50"
              >
                <Play
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 translate-x-0.5 opacity-90"
                  style={{ fill: "#ffffff", color: "#ffffff", stroke: "none" }}
                />
              </div>
            </div>

            {/* View count at bottom-right */}
            {video.views && (
              <div
                className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 flex items-center gap-1 text-[9.5px] sm:text-[10.5px] font-black z-20 bg-black/65 backdrop-blur-[2px] px-1.5 py-0.5 rounded-full drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                style={{ color: "#ffffff" }}
              >
                <Play
                  className="h-2.5 w-2.5 shrink-0"
                  style={{ fill: "#ffffff", color: "#ffffff", stroke: "none" }}
                />
                <span
                  style={{ color: "#ffffff", fontSize: "10px", fontWeight: 800 }}
                  className="leading-none"
                >
                  {video.views}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialMediaStatsCard({
  profile,
  onPreviewImage,
}: {
  profile: any;
  onPreviewImage?: (url: string) => void;
}) {
  const parseSocialAccounts = (prof: any): { platform: string; url: string; handle?: string; shop_url?: string; followers_count?: number; likes_count?: number; metrics?: any; recent_videos?: any[]; featured_videos?: any[] }[] => {
    let list: { platform: string; url: string; handle?: string; shop_url?: string; followers_count?: number; likes_count?: number; metrics?: any; recent_videos?: any[]; featured_videos?: any[] }[] = [];

    if (Array.isArray(prof?.socialAccounts) && prof.socialAccounts.length > 0) {
      list = prof.socialAccounts
        .map((account: any) => ({
          platform: String(account.platform || "").trim(),
          handle: account.handle || account.username || "",
          url: String(account.url || "").trim(),
          shop_url: String(account.shop_url || "").trim(),
          followers_count: account.followers_count || account.followers,
          likes_count: account.likes_count || account.likes,
          metrics: account.metrics || null,
          recent_videos: account.recent_videos || null,
          featured_videos: account.featured_videos || null,
        }))
        .filter((account: { platform: string; url: string }) => account.url);
    }

    const legacyFields: { name: string; key: string }[] = [
      { name: "Facebook", key: "facebook" },
      { name: "Tiktok", key: "tiktok" },
      { name: "Instagram", key: "instagram" },
      { name: "Youtube", key: "youtube" },
      { name: "Thread", key: "thread" },
      { name: "Thread", key: "threads" },
    ];

    legacyFields.forEach(({ name, key }) => {
      if (prof?.[key] && typeof prof[key] === "string" && prof[key].trim()) {
        const val = prof[key].trim();
        const url = val.startsWith("http") ? val : `https://${key === 'thread' || key === 'threads' ? 'threads.net' : key + '.com'}/${val.replace(/^@/, "")}`;
        if (!list.some((item) => item.url === url)) {
          list.push({ platform: name, url });
        }
      }
    });

    // Ensure all 4 main platforms exist so the UI is fully complete as designed
    const defaultPlatforms = ["Facebook", "TikTok", "Instagram", "YouTube"];
    const baseSlug = String(prof?.slug || prof?.id || "ngo-thao-nhi-1028");
    defaultPlatforms.forEach((pName) => {
      const pKey = pName.toLowerCase();
      if (!list.some((item) => getSocialPlatformInfo(item.platform, item.url).platformKey.toLowerCase() === pKey)) {
        list.push({
          platform: pName,
          url: `https://${pKey === 'youtube' ? 'youtube.com/@' : pKey + '.com/'}${baseSlug}`,
        });
      }
    });

    // Strictly deduplicate by platformKey so each platform only appears ONCE
    const seen = new Set<string>();
    const uniqueList: typeof list = [];
    for (const item of list) {
      const pKey = getSocialPlatformInfo(item.platform, item.url).platformKey.toLowerCase();
      if (!seen.has(pKey)) {
        seen.add(pKey);
        uniqueList.push(item);
      }
    }

    return uniqueList;
  };

  const socialAccounts = parseSocialAccounts(profile);
  const seedString = String(profile?.id || profile?.slug || profile?.name || "idol");

  return (
    <div className="rounded-3xl border border-[#F0D7D3] bg-white p-4 sm:p-6 shadow-[0_12px_36px_rgba(143,7,9,0.06)] dark:border-[#151b2d] dark:bg-[#08090f] dark:shadow-xl space-y-4 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0D7D3]/80 pb-3 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0EE] text-[#8F0709] border border-[#F0D7D3] dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20 shrink-0">
            <Globe className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-display font-black text-sm text-[#191116] uppercase tracking-wider dark:text-white leading-none">
              Mạng xã hội
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1 leading-none">
              Kết nối các nền tảng để cập nhật số liệu mới nhất
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer p-1"
          title="Thông tin về số liệu mạng xã hội"
        >
          <Info className="h-5 w-5" />
        </button>
      </div>

      {/* Platform Cards Grid: 1 column on mobile, 2 columns on desktop to save vertical space */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {socialAccounts.map((account, idx) => {
          const info = getSocialPlatformInfo(account.platform, account.url);
          const handle = getSocialHandle(account.url, info.platformKey);
          const stats = getPlatformStats(info.platformKey, account, seedString);
          const videos = getPlatformVideos(info.platformKey, account, seedString, profile);

          return (
            <SocialPlatformCardItem
              key={`${account.platform}-${idx}`}
              account={account}
              info={info}
              handle={handle}
              stats={stats}
              videos={videos}
              onPreviewImage={onPreviewImage}
            />
          );
        })}
      </div>
    </div>
  );
}

const formatHeight = (h: number | string) => {
  const val = Number(h);
  if (!val) return "—";
  return `${val} cm`;
};

const formatMeasurements = (profile: any) => {
  if (profile?.bust && profile?.waist && profile?.hips) {
    return `${profile.bust}-${profile.waist}-${profile.hips}`;
  }

  return "Chưa biết";
};

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

function formatDisplayName(name: string) {
  return name
    .toLocaleLowerCase("vi-VN")
    .replace(/(^|[\s'-])([^\s'-])/g, (match, prefix, char) => `${prefix}${char.toLocaleUpperCase("vi-VN")}`);
}

function getTalentTypes(talent: unknown) {
  const record = talent && typeof talent === "object" ? talent as Record<string, unknown> : {};
  const normalizeType = (type: unknown) => {
    const value = String(type).trim();
    return ["pg", "pb", "pg/pb"].includes(value.toLowerCase()) ? "PG/PB" : value;
  };

  if (Array.isArray(record.talentTypes) && record.talentTypes.length) {
    return Array.from(new Set(record.talentTypes.map(normalizeType).filter(Boolean)));
  }

  if (Array.isArray(record.talent_types) && record.talent_types.length) {
    return Array.from(new Set(record.talent_types.map(normalizeType).filter(Boolean)));
  }

  return record.type ? [normalizeType(record.type)] : [];
}

function getStringList(value: unknown) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return Array.from(new Set(list.map((item) => String(item).trim()).filter(Boolean)));
}

const JOBS_LIST = [
  { id: 1, title: "Đại sứ thương hiệu", desc: "Gương mặt đại diện thương hiệu luxury", weights: { pageant: 0.4, runway: 0.2, kol: 0.4 } },
  { id: 2, title: "KOLs/Influencer quảng cáo", desc: "Sáng tạo nội dung video ngắn", weights: { pageant: 0.1, runway: 0.1, kol: 0.8 } },
  { id: 3, title: "KOC Livestream bán hàng", desc: "Thực hiện livestream bán hàng trực tiếp", weights: { pageant: 0.05, runway: 0.05, kol: 0.9 } },
  { id: 4, title: "Gương mặt trang bìa", desc: "Chụp ảnh bìa tạp chí, lookbook, ảnh PR", weights: { pageant: 0.3, runway: 0.5, kol: 0.2 } },
  { id: 5, title: "Người mẫu sàn diễn (Runway)", desc: "Trình diễn các bộ sưu tập thời trang cao cấp", weights: { pageant: 0.1, runway: 0.8, kol: 0.1 } },
  { id: 6, title: "Người mẫu quảng cáo", desc: "Diễn xuất trong các TVC quảng cáo", weights: { pageant: 0.2, runway: 0.3, kol: 0.5 } },
  { id: 7, title: "Diễn viên MV ca nhạc", desc: "Đóng vai nữ chính/nam chính MV ca nhạc", weights: { pageant: 0.2, runway: 0.2, kol: 0.6 } },
  { id: 8, title: "KOL sự kiện / Khách mời VIP", desc: "Tham dự thảm đỏ và sự kiện thương hiệu", weights: { pageant: 0.6, runway: 0.2, kol: 0.2 } },
  { id: 9, title: "Người dẫn chương trình (MC)", desc: "Dẫn dắt các sự kiện và chương trình giải trí", weights: { pageant: 0.7, runway: 0.1, kol: 0.2 } },
  { id: 10, title: "VIP Promotion Girl (PG)", desc: "Lễ tân đón tiếp khách tại sự kiện lớn", weights: { pageant: 0.4, runway: 0.3, kol: 0.3 } },
  { id: 11, title: "Huấn luyện viên Catwalk", desc: "Đào tạo kỹ thuật đi catwalk cho học viên", weights: { pageant: 0.1, runway: 0.8, kol: 0.1 } },
  { id: 12, title: "CEO thương hiệu riêng", desc: "Kinh doanh nhãn hàng thời trang, mỹ phẩm", weights: { pageant: 0.5, runway: 0.2, kol: 0.3 } },
  { id: 13, title: "Giám khảo cuộc thi sắc đẹp", desc: "Chấm điểm các cuộc thi hoa hậu, hoa khôi", weights: { pageant: 0.7, runway: 0.2, kol: 0.1 } },
  { id: 14, title: "Giám đốc hình ảnh / Stylist", desc: "Cố vấn định hình phong cách và trang phục", weights: { pageant: 0.1, runway: 0.6, kol: 0.3 } },
  { id: 15, title: "Sứ giải chiến dịch cộng đồng", desc: "Lan tỏa các giá trị nhân văn và dự án từ thiện", weights: { pageant: 0.8, runway: 0.1, kol: 0.1 } },
  { id: 16, title: "Vlogger du lịch & trải nghiệm", desc: "Quảng bá điểm đến, khách sạn, resort cao cấp", weights: { pageant: 0.2, runway: 0.1, kol: 0.7 } },
  { id: 17, title: "Người mẫu ảnh nghệ thuật", desc: "Hợp tác chụp ảnh thời trang Fine-art", weights: { pageant: 0.2, runway: 0.6, kol: 0.2 } },
  { id: 18, title: "Nhà sáng tạo nội dung tri thức", desc: "Chia sẻ kỹ năng mềm, kiến thức làm đẹp", weights: { pageant: 0.4, runway: 0.1, kol: 0.5 } },
  { id: 19, title: "Đại sứ Game / Esports", desc: "Hình ảnh đại diện cho các dự án game lớn", weights: { pageant: 0.1, runway: 0.1, kol: 0.8 } },
  { id: 20, title: "Người mẫu ảo / Metaverse", desc: "Scan 3D hình ảnh số để làm mẫu ảo", weights: { pageant: 0.1, runway: 0.6, kol: 0.3 } }
];

export default function BrandTalentProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { requireAuthAction, GuestActionPrompt } = useGuestActionPrompt();
  const params = useParams<{ id: string }>();

  const scrollToBooking = () => {
    const el = document.getElementById("booking-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };
  const staticTalent = useMemo(() => findTalentById(params.id), [params.id]);
  const [talent, setTalent] = useState<any>(staticTalent);
  const [loading, setLoading] = useState(!staticTalent);
  const [mounted, setMounted] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isTierDialogOpen, setIsTierDialogOpen] = useState(false);
  const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false);
  const [isAddingToBrand, setIsAddingToBrand] = useState(false);
  const [isAddedToBrand, setIsAddedToBrand] = useState(false);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; tone: "success" | "error" }[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (previewImage) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [previewImage]);

  function pushToast(message: string, tone: "success" | "error" = "success") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }

  useEffect(() => {
    addViewedTalentId(params.id);
  }, [params.id]);

  useEffect(() => {
    let cancelled = false;
    if (!staticTalent) {
      setLoading(true);
    }

    loadBrandTalent(params.id, staticTalent ?? null).then((loaded) => {
      if (!cancelled) {
        if (loaded) {
          setTalent(loaded);
        } else if (!staticTalent) {
          setTalent(null);
        }
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [params.id, staticTalent]);

  useEffect(() => {
    let cancelled = false;

    if (!getAuthToken()) {
      return () => {
        cancelled = true;
      };
    }

    loadBrandRosterTalents().then((items) => {
      if (cancelled) return;

      const currentProfileId = String(params.id);
      const hasTalent = items.some((item: any) => {
        const rosterProfileId = String(item.talent_profile_id || item.talentProfile?.id || item.talent_profile?.id || "");
        return rosterProfileId === currentProfileId;
      });

      setIsAddedToBrand(hasTalent);
    }).catch(() => {
      if (!cancelled) setIsAddedToBrand(false);
    });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  useEffect(() => {
    let cancelled = false;

    if (!getAuthToken()) {
      return () => {
        cancelled = true;
      };
    }

    loadBrandWishlists([]).then((lists) => {
      if (cancelled) return;
      setWishlists(lists);
      const primaryWishlist = lists[0];
      if (primaryWishlist) {
        const item = primaryWishlist.items?.find((i: any) => String(i.profile_id || i.profile?.id || "") === String(params.id));
        if (item) {
          setIsInWishlist(true);
          setWishlistItemId(String(item.id));
        } else {
          setIsInWishlist(false);
          setWishlistItemId(null);
        }
      }
    }).catch(() => { });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  useEffect(() => {
    if (searchParams?.get("tab") === "booking" || searchParams?.get("booking") === "true") {
      setTimeout(() => {
        scrollToBooking();
      }, 500);
    }
  }, [searchParams]);

  const profile = useMemo(() => {
    if (!talent) return null;
    return {
      isOnboarded: true,
      fullBody: talent.fullBodyImage,
      photos: talent.portfolio || [],
      height: talent.height,
      weight: talent.weight,
      bust: talent.bust,
      waist: talent.waist,
      hips: talent.hips,
      name: talent.name,
      gender: talent.gender,
      dob: talent.dob,
      age: talent.age,
      location: talent.city || "",
      hometown: talent.district || "",
      phone: talent.phone || "",
      email: talent.email || "",
      education: talent.education || "",
      experience: talent.yearsOfExperience,
      talentTypes: talent.talentTypes || [],
      specialSkills: talent.skills || [],
      skills: talent.skills || [],
      socialHighlights: talent.socialHighlights || [],
      languages: talent.languages || [],
      lifestyleServices: talent.lifestyleServices || [],
      tier: talent.tier,
      badges: talent.badges,
      active_badges: talent.active_badges,
      isOwner: talent.isOwner || talent.is_owner || false,
      canBook: talent.canBook !== false && talent.can_book !== false,
      score: talent.matchScore,
      aiScore: (talent as any).aiScore || talent.matchScore,
      bio: talent.experience || "",
      surveyScores: (talent as any).surveyScores || null,
      mainCategory: (talent as any).mainCategory || "",
      price: talent.price,
      portfolio_url: talent.portfolio_url,
      videos: talent.videos || [],
      socialAccounts: talent.socialAccounts || [],
      reviews: [
        { brand: "L'Oréal Paris Vietnam", rating: 5, date: "15/05/2026", comment: `${talent.name} làm việc vô cùng chuyên nghiệp, đúng giờ và hoàn thành tốt KPI chiến dịch truyền thông của nhãn hàng. Rất mong tiếp tục hợp tác.` },
        { brand: "Gucci Beauty Event", rating: 5, date: "29/04/2026", comment: "Thần thái xuất sắc, hình ảnh high-fashion phù hợp tiêu chuẩn quốc tế. Cảm ơn vì sự hỗ trợ nhiệt tình." },
        { brand: "Vogue Vietnam Editorial", rating: 5, date: "12/04/2026", comment: "Thái độ làm việc nghiêm túc, tạo dáng xuất sắc và có kiến thức chuyên môn cao. Rất nên hợp tác." }
      ] as any[]
    };
  }, [talent]);

  useEffect(() => {
    const talentName = profile?.name || talent?.name;
    if (talentName) {
      document.title = `Onstage VN - ${talentName}`;
    } else {
      document.title = "Onstage VN - Chi tiết Idol";
    }
  }, [profile?.name, talent?.name]);

  const isOwnProfile = Boolean(talent?.isOwner || talent?.is_owner || talent?.canBook === false || talent?.can_book === false);

  const lookbookPhotos = useMemo(() => {
    if (!profile) return [];
    const portfolioPhotoUrls = Array.from(new Set(
      (profile.photos || [])
        .map((url: string) => normalizeBackendAssetUrl(url))
        .filter(Boolean),
    ));

    return Array.from({ length: 8 }, (_, index) => {
      const id = index + 1;
      const explicitUrl = normalizeBackendAssetUrl((profile as any)["lookbook" + id]);
      const url = explicitUrl || portfolioPhotoUrls[index] || "";

      if (!url) return null;

      return {
        id,
        label: "Ảnh " + id,
        url,
      };
    }).filter(Boolean) as Array<{ id: number; label: string; url: string }>;
  }, [profile]);

  const portfolioVideos = useMemo<Array<{ id: string | number; title: string; url: string; path?: string | null; disk?: string | null }>>(() => {
    if (!profile || !Array.isArray((profile as any).videos)) return [];

    return (profile as any).videos
      .map((video: any, index: number) => ({
        id: video?.id ?? `video-${index + 1}`,
        title: String(video?.title || `Video ${index + 1}`),
        url: normalizeBackendAssetUrl(video?.url || ""),
        path: video?.path ?? null,
        disk: video?.disk ?? null,
      }))
      .filter((video: { url: string }) => Boolean(video.url))
      .slice(0, 4);
  }, [profile]);

  // State for Month-switching Calendar
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // Default June 2026

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayPad = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    return firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (!talent || !profile) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="rounded-2xl border border-white/5 bg-slate-950/30 p-8 text-center">
          <h1 className="text-xl font-black text-white">Idol chưa kích hoạt hồ sơ</h1>
          <button onClick={() => router.back()} className="mt-5 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const getDayStatus = (dateStr: string) => {
    return talent.availabilityDates?.includes(dateStr) ? "busy" : "available";
  };
  const talentTypes = getTalentTypes(talent);
  const profileSkills = getStringList(profile.skills ?? profile.specialSkills);
  const profileSocialHighlights = getStringList(profile.socialHighlights);
  const portfolioLinks = portfolioLinksFromProfile(profile);
  const portfolioOwnerName = String(profile?.name || "Idol").trim().replace(/\s+/g, "_");
  const primaryBadge = getPrimaryAchievementBadge(profile);

  function openPortfolioLink(link: string) {
    window.open(portfolioHref(link), "_blank", "noopener,noreferrer");
  }

  function handleViewPortfolio() {
    if (portfolioLinks.length === 0) {
      pushToast("Chưa có portfolio", "error");
      return;
    }

    if (portfolioLinks.length === 1) {
      openPortfolioLink(portfolioLinks[0]);
      return;
    }

    setIsPortfolioDialogOpen(true);
  }

  async function handleAddToBrand() {
    if (!requireAuthAction({ actionLabel: "Thêm talent vào Brand" })) return;
    if (!talent?.id || isAddingToBrand || isAddedToBrand) return;

    setIsAddingToBrand(true);
    try {
      await addBrandRosterTalent(String(talent.id), "Thêm từ hồ sơ talent.");
      setIsAddedToBrand(true);
      pushToast(`Đã thêm ${talent.name} vào Brand thành công!`, "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể thêm talent vào Brand. Vui lòng thử lại.";
      if (/already|exists|duplicate|đã|ton tai|tồn tại/i.test(message)) {
        setIsAddedToBrand(true);
        pushToast(`${talent.name} đã có trong Brand.`, "success");
        return;
      }
      pushToast(message, "error");
    } finally {
      setIsAddingToBrand(false);
    }
  }

  async function handleAddToWishlist() {
    if (!requireAuthAction({ actionLabel: "Thêm vào danh sách yêu thích" })) return;

    if (isInWishlist && wishlists[0]?.id && wishlistItemId) {
      try {
        await removeTalentFromWishlist(wishlists[0].id, wishlistItemId);
        setIsInWishlist(false);
        setWishlistItemId(null);
        notifySavedTalentsUpdated(Math.max(0, (wishlists[0]?.savedIds?.length || 1) - 1));
        pushToast("Đã xóa khỏi danh sách yêu thích.", "success");
      } catch (err) {
        pushToast("Lỗi khi xóa khỏi danh sách yêu thích.", "error");
      }
      return;
    }

    try {
      let wishlistId = wishlists[0]?.id;
      if (!wishlistId) {
        const newWishlist = await createBrandWishlist("Danh sách yêu thích");
        wishlistId = newWishlist.id;
        setWishlists([newWishlist]);
      }

      const item = await addTalentToWishlist(wishlistId, String(params.id));
      setIsInWishlist(true);
      setWishlistItemId(String(item.id));
      notifySavedTalentsUpdated((wishlists[0]?.savedIds?.length || 0) + 1);
      pushToast("Đã thêm vào danh sách yêu thích.", "success");
    } catch (err) {
      pushToast("Lỗi khi thêm vào danh sách yêu thích.", "error");
    }
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 -mt-5 md:-mt-7 lg:-mt-8 -mx-4 md:-mx-8 lg:-mx-10 px-4 md:px-8 lg:px-10 pt-3 bg-transparent pointer-events-none flex items-center justify-between h-0 overflow-visible">
        <button
          onClick={() => {
            const from = searchParams.get("from");
            if (from) {
              router.push(from);
            } else {
              router.back();
            }
          }}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E8C8C2] bg-white/90 backdrop-blur-md text-[#8F0709] shadow-[0_8px_22px_rgba(143,7,9,0.12)] transition-all duration-300 hover:border-[#C72524]/45 hover:bg-[#FFF3F1] active:scale-95 cursor-pointer dark:border-amber-500/30 dark:bg-[#0c1120]/85 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-[#0c1120] dark:hover:border-amber-500/50 dark:shadow-[0_4px_15px_rgba(0,0,0,0.4)]"
          aria-label="Quay lại"
          title="Quay lại"
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
        </button>

        <div className="relative pointer-events-auto">

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E8C8C2] bg-white/90 backdrop-blur-md text-[#8F0709] shadow-[0_8px_22px_rgba(143,7,9,0.12)] transition-all duration-300 hover:border-[#C72524]/45 hover:bg-[#FFF3F1] hover:text-[#C72524] active:scale-95 cursor-pointer dark:border-amber-500/30 dark:bg-[#0c1120]/85 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-[#0c1120] dark:hover:border-amber-500/50 dark:shadow-[0_4px_15px_rgba(0,0,0,0.4)]"
            aria-label="Thao tác"
            title="Thao tác"
          >
            <MoreVertical className="h-5 w-5 shrink-0" />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#E8C8C2] bg-white/95 backdrop-blur-md p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 dark:border-white/5 dark:bg-[#0c1120]/95">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleAddToBrand();
                  }}
                  disabled={isAddingToBrand || isAddedToBrand || isOwnProfile}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-[#574D54] hover:bg-[#FFF3F1] hover:text-[#8F0709] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <Users className="h-4 w-4 text-amber-400" />
                  <span>{isAddedToBrand ? "Đã thêm vào danh sách quản lý" : "Thêm vào danh sách quản lý"}</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (isOwnProfile) return;
                    router.push(`/booking?talentId=${encodeURIComponent(String(params.id))}`);
                  }}
                  disabled={isOwnProfile}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-[#574D54] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#FFF3F1] hover:text-[#8F0709] transition duration-200 text-left dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <CalendarCheck className="h-4 w-4 text-amber-400" />
                  <span>Đặt ngay</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleAddToWishlist();
                  }}
                  disabled={isOwnProfile}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-[#574D54] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#FFF3F1] hover:text-[#8F0709] transition duration-200 text-left dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  {isInWishlist ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 text-amber-400" />
                      <span>Xóa khỏi "Idol đã lưu"</span>
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 text-amber-400" />
                      <span>Lưu thông tin</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cover Header */}
      <section className="relative overflow-hidden rounded-[24px] border border-white/5 bg-[#08090f] p-0 shadow-xl md:rounded-[32px] md:p-6">
        <div className="group relative h-44 w-full overflow-hidden rounded-t-[24px] border-b border-white/5 bg-[#05070e] shadow-inner sm:h-56 md:h-72 md:rounded-2xl md:border">
          <img
            src={talent.cover || "/brand_cover_default.png"}
            alt={`${talent.name} cover`}
            onError={(event) => {
              event.currentTarget.src = "/brand_cover_default.png";
            }}
            onClick={() => {
              setPreviewImage(talent.cover || "/brand_cover_default.png");
            }}
            className="h-full w-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-[1.01]"
          />
        </div>

        <div className="relative z-20 px-4 pb-4 md:hidden">
          <div className="-mt-6 flex items-start gap-3">
            <div className="shrink-0 rounded-full bg-[#08090f] p-1 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
              <div className="h-24 w-24 rounded-full bg-gradient-gold p-[3px] shadow-[0_0_20px_rgba(240,197,107,0.35)]">
                <img
                  src={talent.avatar}
                  alt={talent.name}
                  onError={(event) => {
                    event.currentTarget.src = createInitialAvatarDataUrl(talent.name, "");
                  }}
                  className="h-full w-full rounded-full border border-black/10 object-cover"
                  onClick={() => {
                    const url = normalizeBackendAssetUrl(talent.avatar);
                    if (url) setPreviewImage(url);
                  }}
                />
              </div>
            </div>

            <div className="min-w-0 flex-1 pt-7">
              <h2 className="font-display text-lg font-black leading-tight tracking-wide text-white">
                <span>{formatDisplayName(talent.name)}</span>
                {talent.verified && (
                  <span className="ml-2 inline-flex h-4 w-4 select-none items-center justify-center rounded-full bg-amber-400 align-middle text-[9px] font-extrabold text-slate-950 shadow-md" title="Đã xác minh">
                    ✓
                  </span>
                )}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-extrabold leading-snug text-slate-200">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-[#F0C56B]" />
                  {profile?.location || "Chưa cập nhật"}
                </span>
                {primaryBadge && (
                  <button
                    type="button"
                    onClick={() => setIsTierDialogOpen(true)}
                    className="inline-flex items-center gap-1 rounded-full transition active:scale-95"
                    title="Xem chi tiết danh hiệu"
                  >
                    <BadgeTier badge={primaryBadge} tier={profile.tier} seed={profile.email || profile.name} variant="gradient" size="xs" />
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[10px] font-black text-white">
                      ?
                    </span>
                  </button>
                )}
              </div>

            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-1.5 text-[10px] font-black leading-snug text-[#F0C56B]">
            <span className="inline-flex min-w-0 items-center justify-center gap-1 rounded-full border border-[#F0C56B]/20 bg-[#F0C56B]/10 px-2 py-1">
              <Ruler className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{profile?.height ? formatHeight(profile.height) : "Chưa biết"}</span>
            </span>
            <span className="inline-flex min-w-0 items-center justify-center gap-1 rounded-full border border-[#F0C56B]/20 bg-[#F0C56B]/10 px-2 py-1">
              <Scale className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{profile?.weight ? `${profile.weight} kg` : "Chưa biết"}</span>
            </span>
            <span className="inline-flex min-w-0 items-center justify-center gap-1 rounded-full border border-[#F0C56B]/20 bg-[#F0C56B]/10 px-2 py-1 font-mono">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{formatMeasurements(profile)}</span>
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {talentTypes.length ? (
              talentTypes.map((type) => (
                <span key={type} className="inline-flex rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
                  {type}
                </span>
              ))
            ) : (
              <span className="inline-flex rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
                Chưa cập nhật
              </span>
            )}

            {profileSocialHighlights.map((highlight) => (
              <span key={highlight} className="inline-flex rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
                {highlight}
              </span>
            ))}

            {profileSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-3 border-t border-white/5 pt-3 text-left text-xs font-medium leading-relaxed text-slate-400">
            {talent.experience || "Chưa cập nhật giới thiệu bản thân."}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              aria-disabled={portfolioLinks.length === 0}
              onClick={handleViewPortfolio}
              className={cn(
                "light-force-white flex h-10 items-center justify-center rounded-xl border border-[#C72524]/35 bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-2 text-[9.5px] font-black uppercase tracking-wider text-white shadow-[0_10px_22px_rgba(143,7,9,0.18)] transition-all duration-300 hover:brightness-110 active:scale-95 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-400/40 dark:from-amber-400/25 dark:via-yellow-500/20 dark:to-amber-500/30 dark:text-amber-300 dark:shadow-[0_0_12px_rgba(245,158,11,0.2)]",
                portfolioLinks.length > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-60"
              )}
            >
              <Eye className="mr-1 h-3.5 w-3.5 shrink-0 text-current" />
              <span className="truncate">PORTFOLIO</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (isOwnProfile) return;
                router.push(`/booking?talentId=${encodeURIComponent(String(params.id))}`);
              }}
              disabled={isOwnProfile}
              className="light-force-white flex h-10 items-center justify-center rounded-xl border border-[#C72524]/35 bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-2 text-[9.5px] font-black uppercase tracking-wider text-white shadow-[0_10px_22px_rgba(143,7,9,0.18)] transition active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-400/40 dark:from-amber-400/25 dark:via-yellow-500/20 dark:to-amber-500/30 dark:text-amber-300 dark:shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            >
              <CalendarCheck className="mr-1 h-3.5 w-3.5 shrink-0 text-current" />
              <span className="truncate">Đặt ngay</span>
            </button>
            <button
              type="button"
              onClick={handleAddToWishlist}
              disabled={isOwnProfile}
              className={cn(
                "flex h-10 items-center justify-center rounded-xl px-2 text-[9.5px] font-black uppercase tracking-wider shadow-md transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
                isInWishlist
                  ? "light-force-white border border-[#C72524]/55 bg-[#C72524] text-white shadow-[0_10px_22px_rgba(143,7,9,0.16)] dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-400 dark:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "light-force-white bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-white shadow-[0_10px_22px_rgba(143,7,9,0.18)] dark:from-amber-100 dark:via-[#C9A86A] dark:to-yellow-600 dark:text-slate-950 dark:shadow-[0_0_15px_rgba(201,168,106,0.2)]"
              )}
            >
              {isInWishlist ? (
                <>
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5 shrink-0 text-current" />
                  <span className="truncate">Đã lưu</span>
                </>
              ) : (
                <>
                  <Heart className="mr-1 h-3.5 w-3.5 shrink-0 fill-current text-current" />
                  <span className="truncate">Lưu</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="relative z-20 hidden w-full flex-col items-start gap-6 px-3 pt-6 text-left md:flex sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left w-full">
              {/* Avatar block */}
              <div className="shrink-0 relative z-20">
                <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-gradient-gold p-[3.5px] shadow-[0_0_25px_rgba(240,197,107,0.45)] relative">
                  <img
                    src={talent.avatar}
                    alt={talent.name}
                    onError={(event) => {
                      event.currentTarget.src = createInitialAvatarDataUrl(talent.name, "");
                    }}
                    className="h-full w-full rounded-full object-cover border border-black/10 cursor-pointer"
                    onClick={() => {
                      const url = normalizeBackendAssetUrl(talent.avatar);
                      if (url) setPreviewImage(url);
                    }}
                  />
                </div>
              </div>

              {/* Details stack next to Avatar */}
              <div className="space-y-2.5 flex-1 min-w-0">
                <h2 className="font-display font-black text-white text-2xl sm:text-3xl tracking-wide leading-tight text-center sm:text-left">
                  <span>{formatDisplayName(talent.name)}</span>
                  {talent.verified && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold shadow-md select-none ml-2 align-middle" title="Đã xác minh">
                      ✓
                    </span>
                  )}
                </h2>

                <div className="flex flex-wrap justify-center items-center gap-1.5 sm:justify-start">
                  {talentTypes.length ? (
                    talentTypes.map((type) => (
                      <span key={type} className="inline-flex rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
                      Chưa cập nhật
                    </span>
                  )}

                  {profileSocialHighlights.map((highlight) => (
                    <span key={highlight} className="inline-flex rounded-md border border-[#C9A86A]/25 bg-[#C9A86A]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
                      {highlight}
                    </span>
                  ))}

                  {primaryBadge && (
                    <button
                      type="button"
                      onClick={() => setIsTierDialogOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-full transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-98 cursor-pointer select-none"
                      title="Xem chi tiết danh hiệu"
                    >
                      <BadgeTier badge={primaryBadge} tier={profile.tier} seed={profile.email || profile.name} variant="gradient" />
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[8px] font-black text-white transition-colors hover:bg-white/25">
                        ?
                      </span>
                    </button>
                  )}
                </div>

                {/* Location & Measurements Row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-1.5 text-[11px] sm:text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#F0C56B]" />
                    <span className="text-slate-300 font-medium">
                      {profile?.location || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Ruler className="h-4 w-4 text-[#F0C56B]" />
                    <span className="text-slate-300 font-medium">{profile?.height ? formatHeight(profile.height) : "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-[#F0C56B]" />
                    <span className="text-slate-300 font-medium">{profile?.weight ? `${profile.weight} kg` : "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-[#F0C56B]" />
                    <span className="text-slate-300 font-medium font-mono">{formatMeasurements(profile)}</span>
                  </div>
                </div>

                {profileSkills.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                    {profileSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bio (Description) Row */}
                <div className="text-[11px] sm:text-xs text-slate-400 font-medium leading-relaxed pt-2.5 border-t border-white/5 mt-1 text-center sm:text-left">
                  {talent.experience || "Chưa cập nhật giới thiệu bản thân."}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Placeholder or empty) */}
          <div className="shrink-0 lg:pb-2 w-full lg:w-auto flex justify-center lg:justify-end" />
        </div>

        {/* Centered Action Buttons Row */}
        <div className="hidden flex-wrap items-center justify-center gap-3 px-6 pb-6 pt-4 w-full md:flex">
          <button
            type="button"
            aria-disabled={portfolioLinks.length === 0}
            onClick={handleViewPortfolio}
            className={cn(
              "light-force-white flex-1 sm:flex-initial flex h-10 items-center justify-center rounded-full border border-[#C72524]/35 bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-6 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-[0_10px_22px_rgba(143,7,9,0.18)] transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-95 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-400/40 dark:from-amber-400/25 dark:via-yellow-500/20 dark:to-amber-500/30 dark:text-amber-300 dark:shadow-[0_0_15px_rgba(245,158,11,0.25)]",
              portfolioLinks.length > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-60"
            )}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5 shrink-0 text-current" />
            <span>PORTFOLIO</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (isOwnProfile) return;
              router.push(`/booking?talentId=${encodeURIComponent(String(params.id))}`);
            }}
            disabled={isOwnProfile}
            className="light-force-white flex-1 sm:flex-initial flex h-10 items-center justify-center rounded-full border border-[#C72524]/35 bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-6 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-[0_10px_22px_rgba(143,7,9,0.18)] transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-95 cursor-pointer whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-400/40 dark:from-amber-400/25 dark:via-yellow-500/20 dark:to-amber-500/30 dark:text-amber-300 dark:shadow-[0_0_15px_rgba(245,158,11,0.25)]"
          >
            <CalendarCheck className="mr-2 h-4 w-4 shrink-0 text-current" />
            <span>Đặt ngay</span>
          </button>
          <button
            type="button"
            onClick={handleAddToWishlist}
            disabled={isOwnProfile}
            className={cn(
              "flex-1 sm:flex-initial flex h-10 items-center justify-center rounded-full px-6 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer whitespace-nowrap shadow-md disabled:cursor-not-allowed disabled:opacity-50",
              isInWishlist
                ? "light-force-white border border-[#C72524]/55 bg-[#C72524] text-white hover:bg-[#A40E10] shadow-[0_10px_22px_rgba(143,7,9,0.16)] dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 dark:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                : "light-force-white bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-white hover:brightness-110 shadow-[0_10px_22px_rgba(143,7,9,0.18)] dark:from-amber-100 dark:via-[#C9A86A] dark:to-yellow-600 dark:text-slate-950 dark:shadow-[0_0_15px_rgba(201,168,106,0.2)]"
            )}
          >
            {isInWishlist ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 shrink-0 text-current" />
                <span>ĐÃ LƯU</span>
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4 shrink-0 fill-current text-current" />
                <span>LƯU THÔNG TIN</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Main Grid Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

        {/* 1. HIỆU SUẤT TRÊN ONSTAGE (Cho lên đầu) */}
        <div className="order-[1] lg:col-span-3">
          <OnstagePerformanceCard
            profile={profile}
            onOpenExplanation={() => setIsPerformanceDialogOpen(true)}
          />
        </div>

        {/* 2. MẠNG XÃ HỘI */}
        <div className="order-[2] lg:col-span-3">
          <SocialMediaStatsCard profile={profile} onPreviewImage={setPreviewImage} />
        </div>

        {/* 1. Model Full-Body Photo Card */}
        <div className="order-[10] col-span-1 h-full rounded-2xl border border-[#151b2d] bg-[#08090f] p-5 space-y-4">
          <div className="border-b border-[#151b2d] pb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0EE] text-[#8F0709] border border-[#F0D7D3] dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20 shrink-0">
              <Award className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
              Ảnh Toàn Thân (Full-body)
            </h3>
          </div>

          <div
            onClick={() => {
              const url = normalizeBackendAssetUrl(profile.fullBody);
              if (url) setPreviewImage(url);
            }}
            className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-inner cursor-pointer"
          >
            {normalizeBackendAssetUrl(profile.fullBody) ? (
              <img
                src={normalizeBackendAssetUrl(profile.fullBody)}
                alt="Model Full-body portrait"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-600">
                <Upload className="h-10 w-10 text-slate-500" />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Chưa có ảnh full-body</p>
                  <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-600">Idol chưa cập nhật ảnh toàn thân.</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090f] via-transparent to-transparent opacity-80 pointer-events-none" />
          </div>
        </div>

        {/* 2. SECTION D: LOOKBOOK PHOTOS & DISPLAY */}
        <div className="order-[30] lg:col-span-3 rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
          <div className="border-b border-[#151b2d] pb-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0EE] text-[#8F0709] border border-[#F0D7D3] dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20 shrink-0">
                <ImageIcon className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                  Bộ sưu tập
                </h3>
                <span className="block text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                  Bộ sưu tập hình ảnh, video tốt nhất của idol
                </span>
              </div>
            </div>
          </div>

          {/* Sub-grid 1: Lookbook Photos */}
          <div className="space-y-3">
            <span className="block text-[11px] text-[#f4c430] font-black uppercase tracking-wider">
              ({lookbookPhotos.length}/8 Ảnh)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {lookbookPhotos.map((img) => (
                <div key={img.id} className="flex flex-col gap-2">
                  <div
                    onClick={() => setPreviewImage(normalizeBackendAssetUrl(img.url))}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-md cursor-pointer hover:border-[#f4c430]/30 transition-all duration-300"
                  >
                    <img
                      src={normalizeBackendAssetUrl(img.url)}
                      alt={img.label}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85" />
                  </div>
                </div>
              ))}
              {lookbookPhotos.length === 0 && (
                <div className="col-span-4 rounded-xl border border-dashed border-white/10 bg-slate-950/50 p-5 text-center">
                  <p className="text-xs font-semibold text-slate-450">Chưa có ảnh trong bộ sưu tập.</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-[#151b2d] pt-5 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="block text-[11px] text-[#f4c430] font-black uppercase tracking-wider">
                ({portfolioVideos.length}/4 Video)
              </span>
            </div>

            {portfolioVideos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {portfolioVideos.map((video, index) => (
                  <div
                    key={`${video.id}-${index}`}
                    className="relative aspect-[9/16] overflow-hidden rounded-xl border border-white/5 bg-slate-950 shadow-md group"
                  >
                    {isDirectVideoUrl(video.url) ? (
                      <video
                        src={video.url}
                        controls
                        preload="metadata"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block h-full w-full bg-slate-950"
                      >
                        <img
                          src="/video_thumb.png"
                          alt="Video thumbnail"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </a>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08090f]/70 via-transparent to-transparent" />
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute left-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-slate-950/80 text-white shadow-lg transition-all hover:border-amber-400/50 hover:text-amber-300 active:scale-95"
                      title="Mở video"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/50 p-5 text-center">
                <Video className="mx-auto mb-2 h-7 w-7 text-slate-500" />
                <p className="text-xs font-semibold text-slate-450">Chưa có video trong bộ sưu tập.</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Physical Measurements Card */}
        <div className="order-[10] lg:col-span-2 h-full rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-5">
          <div className="border-b border-[#151b2d] pb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0EE] text-[#8F0709] border border-[#F0D7D3] dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20 shrink-0">
              <User className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
              Thông tin cơ bản
            </h3>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {/* Chiều Cao */}
              <div className="rounded-2xl bg-slate-950/40 p-3 border border-white/5 min-h-[90px] text-center">
                <div className="mb-1 flex items-center justify-center gap-1.5">
                  <Ruler className="h-4 w-4 text-[#f4c430]" />
                  <span className="block text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider">Chiều Cao</span>
                </div>
                <div className="flex min-h-[40px] items-center justify-center">
                  <span className="text-sm sm:text-base font-extrabold text-[#f4c430] block">
                    {profile.height ? formatHeight(profile.height) : "—"}
                  </span>
                </div>
              </div>

              {/* Cân Nặng */}
              <div className="rounded-2xl bg-slate-950/40 p-3 border border-white/5 min-h-[90px] text-center">
                <div className="mb-1 flex items-center justify-center gap-1.5">
                  <Scale className="h-4 w-4 text-[#f4c430]" />
                  <span className="block text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider">Cân Nặng</span>
                </div>
                <div className="flex min-h-[40px] items-center justify-center">
                  <span className="text-sm sm:text-base font-extrabold text-[#f4c430] block">
                    {profile.weight ? `${profile.weight} kg` : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Số đo 3 vòng */}
            <div className="rounded-2xl bg-slate-950/40 p-3 border border-white/5 text-center">
              <div className="mb-2 flex items-center justify-center gap-1.5">
                <User className="h-4 w-4 text-[#f4c430]" />
                <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider">Số đo 3 vòng (cm)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["B", profile.bust],
                  ["W", profile.waist],
                  ["H", profile.hips],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/5 bg-slate-950/40 px-2 py-2">
                    <span className="block text-[8px] font-black uppercase tracking-wider text-slate-500">{label}</span>
                    <span className="mt-1 block text-sm sm:text-base font-extrabold text-[#f4c430]">{value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-x-3.5 gap-y-3.5 border-t border-[#151b2d] pt-4 text-left text-xs text-slate-300">
            {/* Nghệ danh */}
            <span className="font-medium text-slate-400">Nghệ danh</span>
            <span className="font-bold text-white text-left break-words">{profile.name || "Chưa cập nhật"}</span>

            {/* Giới tính */}
            <span className="font-medium text-slate-400">Giới tính</span>
            <span className="font-bold text-white text-left">{profile.gender || "Chưa cập nhật"}</span>

            {/* Phí booking */}
            <span className="font-medium text-slate-400">Phí booking</span>
            <span className="font-bold text-white text-left break-words">
              {profile.price ? profile.price : "Chưa cập nhật"}
            </span>

            {/* Địa chỉ */}
            <span className="font-medium text-slate-400">Địa chỉ</span>
            <span className="font-bold text-white text-left break-words leading-normal">
              {(() => {
                const parts = [profile.hometown, profile.location].filter(Boolean);
                return parts.length > 0 ? parts.join(", ") : "Chưa cập nhật";
              })()}
            </span>

            {/* Kinh nghiệm */}
            <span className="font-medium text-slate-400">Kinh nghiệm</span>
            <span className="font-bold text-white text-left">
              {profile.experience !== undefined && profile.experience !== "" && profile.experience !== null ? `${profile.experience} năm` : "Chưa cập nhật"}
            </span>

            {/* Loại hình Idol */}
            <span className="font-medium text-slate-400">Loại hình Idol</span>
            <span className="font-bold text-white text-left break-words leading-normal">
              {(() => {
                const talentTypes = profile.talentTypes;
                return Array.isArray(talentTypes) && talentTypes.length > 0 ? talentTypes.join(", ") : "Chưa cập nhật";
              })()}
            </span>

            <span className="font-medium text-slate-400">Lĩnh vực chuyên sâu</span>
            <span className="font-bold text-white text-left break-words leading-normal">
              {profileSkills.length > 0 ? profileSkills.join(", ") : "Chưa cập nhật"}
            </span>

            {/* Ngôn ngữ */}
            <span className="font-medium text-slate-400">Ngôn ngữ</span>
            <span className="font-bold text-white text-left break-words leading-normal">
              {formatLanguageList(profile.languages)}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN wrapper: AI Career Alignment Map */}
        <div className="contents">

          {/* 4. SECTION E: AI SURVEY & RADAR CHART & 20 CAREER ALIGNMENTS */}
          <div className="hidden order-[50] lg:col-span-3 rounded-2xl border border-purple-500/20 bg-[#08090f] shadow-[0_0_20px_rgba(168,85,247,0.03)] p-6 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-[#151b2d] pb-4 justify-between flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                <div>
                  <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                    BẢN ĐỒ NĂNG LỰC AI & DANH HIỆU PHÙ HỢP (RADAR CHART)
                  </h3>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                    ĐỊNH HƯỚNG 3 TRỤC THEO NHÂN TRẮC HỌC & KỸ NĂNG
                  </span>
                </div>
              </div>
              <div className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-wide">
                AI Powered
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* Radar Chart Summary Column */}
              <div className="md:col-span-5 flex flex-col justify-between p-4 rounded-xl border border-white/2 bg-slate-950/40">
                {profile.surveyScores ? (
                  <>
                    <div className="space-y-2">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-black">NHÓM TƯƠNG THÍCH NHẤT</span>
                      <h4 className="text-xs font-black text-[#f4c430] leading-relaxed uppercase tracking-wide">
                        {profile.mainCategory || "Chưa xác định"}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Biểu đồ radar 3 trục: <strong>Pageant, Runway, KOL</strong>.
                      </p>
                    </div>

                    {/* SVG 3-axis Radar */}
                    <div className="h-44 w-44 mx-auto my-4 shrink-0 rounded-xl border border-[#151b2d] bg-slate-950 p-2 shadow-inner flex items-center justify-center">
                      <RadarChart scores={profile.surveyScores} />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-center gap-3">
                    <Sparkles className="h-8 w-8 text-purple-400/40" />
                    <p className="text-[11px] text-slate-500 leading-relaxed">Idol chưa hoàn thành bài khảo sát AI.<br />Dữ liệu radar sẽ hiển thị sau khi có kết quả khảo sát.</p>
                  </div>
                )}
              </div>

              {/* 20 Recommended Roles Column */}
              <div className="md:col-span-7 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-black text-left mb-2">Độ Tương Thích Với 20 Vị Trí Công Việc</span>

                  {profile.surveyScores ? (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {(() => {
                        const scores = profile.surveyScores;
                        const calculatedJobs = JOBS_LIST.map((job) => {
                          const matchScore = Math.round(
                            scores.pageant * job.weights.pageant +
                            scores.runway * job.weights.runway +
                            scores.kol * job.weights.kol
                          );
                          return { ...job, matchScore };
                        }).sort((a, b) => b.matchScore - a.matchScore);

                        return calculatedJobs.map((job, idx) => {
                          const isHigh = job.matchScore >= 80;
                          const isMid = job.matchScore >= 50 && job.matchScore < 80;

                          return (
                            <div
                              key={job.id}
                              className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-950 p-2.5 hover:bg-slate-900/20 hover:border-white/10 transition-all duration-300 group"
                            >
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[9px] font-bold text-slate-400 group-hover:bg-amber-400/10 group-hover:text-amber-400 transition-colors">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-[10px] sm:text-[11px] font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                                    {job.title}
                                  </h4>
                                  <span className={cn(
                                    "font-display text-[9px] font-extrabold",
                                    isHigh ? "text-amber-400" : isMid ? "text-purple-400" : "text-slate-500"
                                  )}>
                                    {job.matchScore}% Match
                                  </span>
                                </div>
                                <p className="text-[8px] text-[#f4c430] truncate mt-0.5">{job.desc}</p>
                                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden mt-1">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all duration-500",
                                      isHigh ? "bg-gradient-to-r from-amber-200 to-amber-500" : isMid ? "bg-purple-500" : "bg-slate-700"
                                    )}
                                    style={{ width: `${job.matchScore}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 rounded-xl border border-dashed border-white/10 bg-slate-950/50">
                      <p className="text-[11px] text-slate-500 text-center px-4">Chưa có dữ liệu khảo sát để tính độ tương thích nghề nghiệp.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. SECTION C: INTERACTIVE AVAILABILITY CALENDAR */}
        <div className="order-[40] lg:col-span-3 rounded-2xl border border-[#F0D7D3] bg-white p-5 sm:p-6 space-y-5 shadow-xs dark:border-[#151b2d] dark:bg-[#08090f]">
          <div className="flex items-center justify-between border-b border-[#F0D7D3] pb-3.5 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0EE] text-[#8F0709] border border-[#F0D7D3] dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20 shrink-0">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-display font-black text-xs sm:text-sm text-[#191116] uppercase tracking-wider dark:text-white">
                  Lịch làm việc
                </h3>
                <span className="block text-[11px] font-bold text-[#8F0709] dark:text-[#f4c430] mt-0.5">
                  Tháng {currentMonth}/{currentYear}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#F0D7D3] bg-[#FFF7F6] text-[#8F0709] hover:bg-[#8F0709] hover:text-white transition-all cursor-pointer shadow-2xs dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                title="Tháng trước"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#F0D7D3] bg-[#FFF7F6] text-[#8F0709] hover:bg-[#8F0709] hover:text-white transition-all cursor-pointer shadow-2xs dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                title="Tháng sau"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="max-w-xl mx-auto space-y-3 w-full">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dayName) => (
                <div
                  key={dayName}
                  className="py-1 text-xs font-bold text-slate-400 dark:text-slate-500"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Pad empty days */}
              {Array.from({ length: getFirstDayPad(currentYear, currentMonth) }).map((_, pIdx) => (
                <div key={`pad-${pIdx}`} className="aspect-square w-full opacity-0 pointer-events-none" />
              ))}

              {/* Real days */}
              {Array.from({ length: getDaysInMonth(currentYear, currentMonth) }).map((_, idx) => {
                const dayNumber = idx + 1;
                const dayStr = dayNumber < 10 ? `0${dayNumber}` : `${dayNumber}`;
                const monthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
                const dateKey = `${currentYear}-${monthStr}-${dayStr}`;
                const status = getDayStatus(dateKey);
                const isAvailable = status === "available";

                return (
                  <div
                    key={idx}
                    className={cn(
                      "group relative aspect-square w-full rounded-xl sm:rounded-2xl border flex items-center justify-center transition-all duration-200 shadow-2xs select-none",
                      isAvailable
                        ? "border-emerald-300/70 bg-[#ECFDF5] text-[#047857] dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-rose-300/70 bg-[#FFF1F2] text-[#BE123C] dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300"
                    )}
                  >
                    <span className="text-xs sm:text-sm font-bold font-mono leading-none">
                      {dayStr}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0D7D3] pt-3 mt-3 dark:border-white/10">
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Rảnh
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Bận
                </span>
              </div>
            </div>
          </div>
        </div>



        {/* 7. SECTION F: REPUTATION REVIEWS (Chuyển xuống cuối cùng) */}
        <div className="order-[99] lg:col-span-3 rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
          <div className="border-b border-[#151b2d] pb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0EE] text-[#8F0709] border border-[#F0D7D3] dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20 shrink-0">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
              Đánh Giá Từ Thương Hiệu
            </h3>
          </div>
          {profile.reviews && profile.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.reviews.map((rev: any, idx: number) => (
                <div key={rev.id || idx} className="rounded-xl bg-slate-950/80 p-4 border border-white/5 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-white text-xs block">{rev.brand || rev.brandName || "Thương hiệu"}</span>
                      <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Ngày hợp tác: {rev.date || rev.reviewedAt || "Chưa cập nhật"}</span>
                    </div>
                    <span className="text-[11px] font-black text-amber-400">★ {Number(rev.rating || 0).toFixed(1)}/5</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed italic">
                    &quot;{rev.comment || rev.content || "Chưa có nội dung đánh giá."}&quot;
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/50 p-5 text-center">
              <p className="text-xs font-semibold text-slate-400">Chưa có đánh giá từ thương hiệu.</p>
            </div>
          )}
        </div>



      </div>

      <GuestActionPrompt />
      {/* Full Image Preview Modal */}
      {mounted && previewImage && typeof document !== "undefined" && createPortal(
        <div
          id="talent-image-preview-modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100dvh",
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            zIndex: 999999,
          }}
          className="fixed inset-0 z-[999999] flex h-[100dvh] w-screen items-center justify-center p-3 sm:p-4 backdrop-blur-md transition-all duration-300 animate-in fade-in cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[92vh] max-w-[95vw] overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl animate-in zoom-in-95 duration-300"
            style={{ backgroundColor: "#000000" }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
              style={{
                backgroundColor: "rgba(18, 18, 22, 0.85)",
                borderColor: "rgba(255, 255, 255, 0.35)",
                color: "#ffffff",
              }}
              className="light-keep-white light-force-white absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border shadow-xl transition-all duration-200 hover:bg-black hover:scale-110 active:scale-95 cursor-pointer"
              title="Đóng ảnh"
            >
              <X className="h-5 w-5 !text-white text-white" style={{ stroke: "#ffffff", color: "#ffffff" }} strokeWidth={2.5} />
            </button>
            <img
              src={previewImage}
              alt="Talent Photo Preview"
              className="max-h-[88vh] max-w-full object-contain select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Tier Explanation Dialog */}
      <TierExplanationDialog
        isOpen={isTierDialogOpen}
        onClose={() => setIsTierDialogOpen(false)}
      />

      {/* Onstage Performance Explanation Dialog */}
      <OnstagePerformanceExplanationDialog
        isOpen={isPerformanceDialogOpen}
        onClose={() => setIsPerformanceDialogOpen(false)}
      />

      {isPortfolioDialogOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setIsPortfolioDialogOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#2B313D] bg-[#08090f] p-5 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-[#151b2d] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0EE] text-[#8F0709] border border-[#F0D7D3] dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20 shrink-0">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-display text-xs font-black uppercase tracking-wider text-white">Chọn portfolio</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPortfolioDialogOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {portfolioLinks.map((link, index) => (
                <button
                  key={`${link}-${index}`}
                  type="button"
                  onClick={() => {
                    setIsPortfolioDialogOpen(false);
                    openPortfolioLink(link);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-left text-xs font-bold text-slate-200 transition hover:border-amber-400/40 hover:bg-amber-400/5 hover:text-amber-300"
                  title={link}
                >
                  <FileText className="h-4 w-4 shrink-0 text-[#f4c430]" />
                  <span className="truncate">{`Portfolio${index + 1}_${portfolioOwnerName}`}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-xl px-4 py-3 text-xs font-bold shadow-xl flex items-center gap-2 border",
              toast.tone === "error"
                ? "bg-rose-950 border-rose-500/30 text-rose-300"
                : "bg-emerald-950 border-emerald-500/30 text-emerald-300"
            )}
          >
            {toast.tone === "error" ? (
              <X className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
