"use client";

import React, { useEffect, useState } from "react";
import {
  Award, User,
  ShieldCheck, Calendar, Image as ImageIcon, Sparkles,
  ChevronLeft, ChevronRight, Upload, ChevronDown, ChevronUp, Camera,
  Ruler, Scale, Globe, FileText, Video, Link as LinkIcon, ExternalLink, Trash2, Plus,
  Trophy, ShoppingCart, Coins, Star, Info, Users, Eye, Heart, BarChart2, PlayCircle, Film, Copy
} from "lucide-react";
import { cn, getSocialHandle, getVideoThumbnail } from "@/lib/utils";
import RadarChart from "@/components/ui/RadarChart";
import ProgressBar from "@/components/ui/ProgressBar";
import OnstagePerformanceExplanationDialog from "@/components/ui/OnstagePerformanceExplanationDialog";
import { createTalentVideoLink, deleteTalentPhoto, deleteTalentPhotoCategory, deleteTalentVideo, ensureTalentProfile, persistTalentProfile, uploadTalentPhoto, uploadTalentVideo } from "@/lib/talent-api";
import { normalizeBackendAssetUrl } from "@/lib/avatar";
import { getTalentDayStatus, toggleManualBusyDate } from "@/lib/talent-calendar";

const formatHeight = (h: number | string) => {
  const val = Number(h);
  if (!val) return "—";
  return `${val} cm`;
};

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

function getStringList(value: unknown) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return Array.from(new Set(list.map((item) => String(item).trim()).filter(Boolean)));
}

function hasBasicProfileData(profile: any) {
  const textFields = [
    profile?.name,
    profile?.display_name,
    profile?.location,
    profile?.city,
    profile?.height,
    profile?.weight,
    profile?.price,
    profile?.experienceText,
    profile?.bio,
  ];

  const listFields = [
    profile?.talentTypes,
    profile?.skills,
    profile?.specialSkills,
    profile?.socialHighlights,
    profile?.portfolioLinks,
    profile?.socialAccounts,
  ];

  return (
    textFields.some((value) => {
      const text = String(value ?? "").trim();
      return text && text !== "Chưa cập nhật" && text !== "Chua cap nhat";
    }) ||
    listFields.some((value) => Array.isArray(value) && value.length > 0)
  );
}

interface ContactInfoCardProps {
  profile: any;
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
  const [periodTab, setPeriodTab] = useState<"all" | "recent_3m">("all");

  const seedString = String(profile?.id || profile?.slug || profile?.name || "idol");
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash * 31 + seedString.charCodeAt(i)) >>> 0;
  }

  // All time metrics
  const allCampaigns = (1200 + (hash % 1600)).toLocaleString("vi-VN") + "+";
  const allOrders = (5 + ((hash % 80) / 10)).toFixed(1) + "K";
  const allGmv = `₫${(0.8 + ((hash % 120) / 100)).toFixed(1)}B`;
  const allRating = (4.7 + ((hash % 3) / 10)).toFixed(1) + "/5";
  const allReviews = 180 + (hash % 240);

  // Recent 3 months metrics
  const recentCampaigns = (140 + ((hash * 7) % 220)).toLocaleString("vi-VN") + "+";
  const recentOrders = (1.2 + (((hash * 13) % 25) / 10)).toFixed(1) + "K";
  const recentGmv = `₫${(160 + ((hash * 17) % 280)).toLocaleString("vi-VN")}M`;
  const recentRating = (4.8 + (((hash * 3) % 3) / 10)).toFixed(1) + "/5";
  const recentReviews = 35 + ((hash * 5) % 45);

  const isRecent = periodTab === "recent_3m";
  const campaignsCount = isRecent ? recentCampaigns : allCampaigns;
  const ordersCount = isRecent ? recentOrders : allOrders;
  const netGmv = isRecent ? recentGmv : allGmv;
  const gmvLabel = isRecent ? "Doanh thu 3 tháng" : "Tổng doanh thu";
  const brandRating = isRecent ? recentRating : allRating;
  const brandReviewCount = isRecent ? recentReviews : allReviews;

  return (
    <div className="rounded-2xl border border-[#F0D7D3] bg-white p-3 sm:p-4 shadow-[0_8px_24px_rgba(143,7,9,0.04)] dark:border-[#151b2d] dark:bg-[#08090f] dark:shadow-xl space-y-3 text-left">
      {/* Header with Title (Left) & Info Icon (Right) */}
      <div className="flex items-center justify-between border-b border-[#F0D7D3]/80 pb-2.5 dark:border-white/10">
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
          className="flex h-7 w-7 items-center justify-center rounded-full text-[#7B6866] hover:text-[#8F0709] hover:bg-[#FFF0EE] dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition cursor-pointer"
          title="Xem giải thích chi tiết các chỉ số hiệu suất"
        >
          <Info className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Full-width Underline Tab Switcher: "Tổng quan" & "3 tháng gần đây" */}
      <div className="grid grid-cols-2 border-b border-[#F0D7D3]/70 dark:border-white/10 w-full pt-0.5">
        <button
          type="button"
          onClick={() => setPeriodTab("all")}
          className={`flex items-center justify-center pb-2 text-xs sm:text-sm font-black transition-all cursor-pointer border-b-2 -mb-[1px] ${
            periodTab === "all"
              ? "text-[#C72524] border-[#C72524] dark:text-rose-400 dark:border-rose-400"
              : "text-slate-500 hover:text-[#191116] border-transparent dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <span>Tổng quan</span>
        </button>
        <button
          type="button"
          onClick={() => setPeriodTab("recent_3m")}
          className={`flex items-center justify-center pb-2 text-xs sm:text-sm font-black transition-all cursor-pointer border-b-2 -mb-[1px] ${
            periodTab === "recent_3m"
              ? "text-[#C72524] border-[#C72524] dark:text-rose-400 dark:border-rose-400"
              : "text-slate-500 hover:text-[#191116] border-transparent dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <span>3 tháng gần đây</span>
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {/* Card 1: Chiến dịch/đơn đã thực hiện */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#F0D7D3]/70 bg-[#FFFDFB] p-2 sm:p-2.5 text-center dark:border-white/5 dark:bg-slate-900/80 shadow-2xs transition-all duration-200">
          <FileText className="h-4 w-4 text-[#C72524] dark:text-rose-400 mb-0.5" />
          <span className="text-sm sm:text-base font-black text-[#8F0709] dark:text-white leading-tight">
            {campaignsCount}
          </span>
          <span className="mt-0.5 text-[9.5px] sm:text-[10px] font-medium text-[#574D54] dark:text-slate-400 leading-snug">
            Chiến dịch/đơn đã thực hiện
          </span>
        </div>

        {/* Card 2: Đơn hàng tạo ra */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#F0D7D3]/70 bg-[#FFFDFB] p-2 sm:p-2.5 text-center dark:border-white/5 dark:bg-slate-900/80 shadow-2xs transition-all duration-200">
          <ShoppingCart className="h-4 w-4 text-[#C72524] dark:text-rose-400 mb-0.5" />
          <span className="text-sm sm:text-base font-black text-[#8F0709] dark:text-white leading-tight">
            {ordersCount}
          </span>
          <span className="mt-0.5 text-[9.5px] sm:text-[10px] font-medium text-[#574D54] dark:text-slate-400 leading-snug">
            Đơn hàng tạo ra
          </span>
        </div>

        {/* Card 3: Doanh thu */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#F0D7D3]/70 bg-[#FFFDFB] p-2 sm:p-2.5 text-center dark:border-white/5 dark:bg-slate-900/80 shadow-2xs transition-all duration-200">
          <Coins className="h-4 w-4 text-[#C72524] dark:text-rose-400 mb-0.5" />
          <span className="text-sm sm:text-base font-black text-[#8F0709] dark:text-white leading-tight">
            {netGmv}
          </span>
          <span className="mt-0.5 text-[9.5px] sm:text-[10px] font-medium text-[#574D54] dark:text-slate-400 leading-snug">
            {gmvLabel}
          </span>
        </div>

        {/* Card 4: Đánh giá từ Brand */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#F0D7D3]/70 bg-[#FFFDFB] p-2 sm:p-2.5 text-center dark:border-white/5 dark:bg-slate-900/80 shadow-2xs transition-all duration-200">
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

  if (hasCustomRecent || hasCustomFeatured) {
    const mapVideo = (v: any, idx: number, prefix: string): SocialVideoItem => {
      let viewCount = String(v.views || v.views_count || "").trim();
      if (!viewCount) {
        viewCount = generateVideoViews(`${seed}-${platformKey}-${prefix}`, idx);
      }
      return {
        id: String(v.id || `custom-${prefix}-${idx}`),
        views: viewCount,
        thumbnail: v.thumbnail || v.thumbnail_url || getVideoThumbnail(v.url) || (isDirectVideoUrl(v.url) ? v.url : "/video_thumb.png"),
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
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={video.thumbnail}
                alt={video.title || "Video thumbnail"}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}

            {/* Dark gradient for view count readability */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

            {/* Top Right Icon Badge */}
            {video.topRightIcon && (
              <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 backdrop-blur-xs text-white">
                {video.topRightIcon}
              </div>
            )}

            {/* Bottom View Count & Duration */}
            <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-white text-[10px] sm:text-xs font-black">
              <span className="flex items-center gap-1 drop-shadow-md">
                <PlayCircle className="h-3.5 w-3.5 fill-white text-black" />
                {video.views}
              </span>
              {video.duration && (
                <span className="text-[9px] sm:text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-slate-200">
                  {video.duration}
                </span>
              )}
            </div>
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

    const seen = new Set<string>();
    const uniqueList: typeof list = [];
    for (const item of list) {
      const key = (item.url || item.handle || '').toLowerCase().trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        uniqueList.push(item);
      } else if (!key) {
        uniqueList.push(item);
      }
    }

    return uniqueList;
  };

  const socialAccounts = parseSocialAccounts(profile);
  if (!socialAccounts || socialAccounts.length === 0) {
    return (
      <div className="rounded-3xl border border-[#F0D7D3] bg-white p-4 sm:p-6 shadow-[0_12px_36px_rgba(143,7,9,0.06)] dark:border-[#151b2d] dark:bg-[#08090f] dark:shadow-xl space-y-4 text-left">
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
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
          <Globe className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-xs font-semibold">Chưa có liên kết mạng xã hội nào.</p>
        </div>
      </div>
    );
  }

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

      {/* Platform Cards Grid */}
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
  { id: 15, title: "Sứ giả chiến dịch cộng đồng", desc: "Lan tỏa các giá trị nhân văn và dự án từ thiện", weights: { pageant: 0.8, runway: 0.1, kol: 0.1 } },
  { id: 16, title: "Vlogger du lịch & trải nghiệm", desc: "Quảng bá điểm đến, khách sạn, resort cao cấp", weights: { pageant: 0.2, runway: 0.1, kol: 0.7 } },
  { id: 17, title: "Người mẫu ảnh nghệ thuật", desc: "Hợp tác chụp ảnh thời trang Fine-art", weights: { pageant: 0.2, runway: 0.6, kol: 0.2 } },
  { id: 18, title: "Nhà sáng tạo nội dung tri thức", desc: "Chia sẻ kỹ năng mềm, kiến thức làm đẹp", weights: { pageant: 0.4, runway: 0.1, kol: 0.5 } },
  { id: 19, title: "Đại sứ Game / Esports", desc: "Hình ảnh đại diện cho các dự án game lớn", weights: { pageant: 0.1, runway: 0.1, kol: 0.8 } },
  { id: 20, title: "Người mẫu ảo / Metaverse", desc: "Scan 3D hình ảnh số để làm mẫu ảo", weights: { pageant: 0.1, runway: 0.6, kol: 0.3 } }
];

interface PersonalInfoTabProps {
  profile: any;
  setProfile: (profile: any) => void;
  addToast: (message: string, type?: "success" | "info") => void;
  onPreviewImage?: (url: string) => void;
}

function normalizeTalentTypeLabel(type: unknown) {
  const value = String(type || "").trim();
  return ["pg", "pb", "pg/pb"].includes(value.toLowerCase()) ? "PG/PB" : value;
}

type ProfileReview = {
  id?: string | number;
  brand?: string;
  brandName?: string;
  date?: string;
  reviewedAt?: string;
  rating?: number | string;
  comment?: string;
  content?: string;
};

export default function PersonalInfoTab({
  profile,
  setProfile,
  addToast,
  onPreviewImage
}: PersonalInfoTabProps) {

  const [isLifestyleExpanded, setIsLifestyleExpanded] = useState(false);
  const [videoLinkInput, setVideoLinkInput] = useState("");
  const [isFullBodyImageMenuOpen, setIsFullBodyImageMenuOpen] = useState(false);
  const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false);

  const portfolioLinks = portfolioLinksFromProfile(profile);
  const portfolioOwnerName = String(profile?.name || "Idol").trim().replace(/\s+/g, "_");

  const [uploadingState, setUploadingState] = useState<{
    [key: string]: {
      progress: number;
      fileName: string;
      status: "uploading" | "done" | "error" | "idle";
    };
  }>({});

  useEffect(() => {
    if (!isFullBodyImageMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-full-body-image-action-menu]")) return;
      setIsFullBodyImageMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFullBodyImageMenuOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover" | "fullBody") => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setProfile((current: any) => ({ ...current, [type]: previewUrl }));

    setUploadingState(prev => ({
      ...prev,
      [type]: {
        progress: 0,
        fileName: file.name,
        status: "uploading"
      }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 8;
      if (progress > 95) progress = 95;
      setUploadingState(prev => {
        if (!prev[type]) return prev;
        return {
          ...prev,
          [type]: {
            ...prev[type],
            progress
          }
        };
      });
    }, 150);

    try {
      const syncedProfile = await ensureTalentProfile(profile);

      if (!syncedProfile.backendProfileId) {
        clearInterval(interval);
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
        addToast("Vui lòng đăng nhập để tải ảnh lên.", "info");
        URL.revokeObjectURL(previewUrl);
        return;
      }

      const category = type === "fullBody" ? "full_body" : type;
      const photo = await uploadTalentPhoto(syncedProfile.backendProfileId, file, category);
      const photoUrl = photo.url || photo.path;

      if (!photoUrl) {
        clearInterval(interval);
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
        addToast("Backend chưa trả về URL ảnh.", "info");
        URL.revokeObjectURL(previewUrl);
        return;
      }

      const updatedProfile = persistTalentProfile({
        ...syncedProfile,
        ...profile,
        [type]: photoUrl,
        isOnboarded: true,
        tier: profile.tier || "Potential",
      });
      setProfile(updatedProfile);
      URL.revokeObjectURL(previewUrl);

      clearInterval(interval);
      setUploadingState(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          progress: 100,
          status: "done"
        }
      }));

      setTimeout(() => {
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
      }, 800);

      let typeName = "";
      if (type === "avatar") typeName = "Ảnh đại diện";
      else if (type === "cover") typeName = "Ảnh bìa";
      else if (type === "fullBody") typeName = "Ảnh toàn thân (Full-body)";

      addToast(`Cập nhật ${typeName} thành công!`, "success");
    } catch (error) {
      clearInterval(interval);
      setUploadingState(prev => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không tải được ảnh lên, vui lòng thử lại.", "info");
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleRemoveFullBodyImage = async () => {
    setIsFullBodyImageMenuOpen(false);
    try {
      const syncedProfile = await ensureTalentProfile(profile);
      if (syncedProfile.backendProfileId) {
        await deleteTalentPhotoCategory(syncedProfile.backendProfileId, "full_body");
      }

      const updatedProfile = persistTalentProfile({
        ...syncedProfile,
        ...profile,
        fullBody: "",
      });
      setProfile(updatedProfile);
      addToast("Đã xóa ảnh toàn thân.", "info");
    } catch (error) {
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không xóa được ảnh toàn thân, vui lòng thử lại.", "info");
    }
  };

  const handleLookbookUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const stateKey = `lookbook-${id}`;
    const fieldKey = `lookbook${id}`;
    const previewUrl = URL.createObjectURL(file);
    setProfile((current: any) => {
      const nextPhotos = [...(current?.photos || [])];
      nextPhotos[id - 1] = previewUrl;
      return { ...current, [fieldKey]: previewUrl, photos: nextPhotos.filter(Boolean) };
    });

    setUploadingState(prev => ({
      ...prev,
      [stateKey]: {
        progress: 0,
        fileName: file.name,
        status: "uploading"
      }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 8;
      if (progress > 95) progress = 95;
      setUploadingState(prev => {
        if (!prev[stateKey]) return prev;
        return {
          ...prev,
          [stateKey]: {
            ...prev[stateKey],
            progress
          }
        };
      });
    }, 150);

    try {
      const syncedProfile = await ensureTalentProfile(profile);

      if (!syncedProfile.backendProfileId) {
        clearInterval(interval);
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[stateKey];
          return next;
        });
        addToast("Vui lòng đăng nhập để tải ảnh lên", "info");
        URL.revokeObjectURL(previewUrl);
        return;
      }

      const photo = await uploadTalentPhoto(syncedProfile.backendProfileId, file, "portfolio");
      const photoUrl = photo.url || photo.path;

      if (!photoUrl) {
        clearInterval(interval);
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[stateKey];
          return next;
        });
        addToast("Backend chưa trả về URL ảnh.", "info");
        URL.revokeObjectURL(previewUrl);
        return;
      }

      const nextPhotos = [...(profile.photos || [])];
      nextPhotos[id - 1] = photoUrl;
      const updatedProfile = persistTalentProfile({
        ...syncedProfile,
        ...profile,
        [fieldKey]: photoUrl,
        photos: nextPhotos.filter(Boolean),
        isOnboarded: true,
        tier: profile.tier || "Potential",
      });
      setProfile(updatedProfile);
      URL.revokeObjectURL(previewUrl);

      clearInterval(interval);
      setUploadingState(prev => ({
        ...prev,
        [stateKey]: {
          ...prev[stateKey],
          progress: 100,
          status: "done"
        }
      }));

      setTimeout(() => {
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[stateKey];
          return next;
        });
      }, 800);

      addToast(`Cập nhật Ảnh ${id} thành công!`, "success");
    } catch (error) {
      clearInterval(interval);
      setUploadingState(prev => {
        const next = { ...prev };
        delete next[stateKey];
        return next;
      });
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không tải được ảnh lên, vui lòng thử lại.", "info");
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleLookbookMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const selectedFiles = Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/"));
    e.target.value = "";
    if (selectedFiles.length === 0) return;

    const remainingSlots = Math.max(0, 9 - id);
    const files = selectedFiles.slice(0, remainingSlots);

    if (selectedFiles.length > remainingSlots) {
      addToast("Chỉ được tải tối đa 8 ảnh trong bộ sưu tập.", "info");
    }

    const previews = files.map((file) => URL.createObjectURL(file));
    const stateKeys = files.map((_, index) => `lookbook-${id + index}`);

    setProfile((current: any) => {
      const nextPhotos = [...(current?.photos || [])];
      const updates: Record<string, string> = {};

      previews.forEach((previewUrl, index) => {
        const slot = id + index;
        nextPhotos[slot - 1] = previewUrl;
        updates[`lookbook${slot}`] = previewUrl;
      });

      return { ...current, ...updates, photos: nextPhotos.filter(Boolean) };
    });

    setUploadingState(prev => {
      const next = { ...prev };
      files.forEach((file, index) => {
        next[stateKeys[index]] = {
          progress: 10,
          fileName: file.name,
          status: "uploading"
        };
      });
      return next;
    });

    try {
      const syncedProfile = await ensureTalentProfile(profile);

      if (!syncedProfile.backendProfileId) {
        setUploadingState(prev => {
          const next = { ...prev };
          stateKeys.forEach((key) => delete next[key]);
          return next;
        });
        previews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
        addToast("Vui lòng đăng nhập để tải ảnh lên", "info");
        return;
      }

      const uploadedUrls: string[] = [];
      const uploadedRecords: any[] = [];

      for (let index = 0; index < files.length; index++) {
        const photo = await uploadTalentPhoto(syncedProfile.backendProfileId, files[index], "portfolio");
        const photoUrl = photo.url || photo.path;

        if (!photoUrl) {
          throw new Error("Backend chưa trả về URL ảnh.");
        }

        uploadedUrls[index] = photoUrl;
        uploadedRecords[index] = photo;
        setUploadingState(prev => ({
          ...prev,
          [stateKeys[index]]: {
            ...prev[stateKeys[index]],
            progress: 100,
            status: "done"
          }
        }));
      }

      const nextPhotos = [...(profile.photos || [])];
      const updates: Record<string, string> = {};

      uploadedUrls.forEach((photoUrl, index) => {
        const slot = id + index;
        nextPhotos[slot - 1] = photoUrl;
        updates[`lookbook${slot}`] = photoUrl;
      });

      const updatedProfile = persistTalentProfile({
        ...syncedProfile,
        ...profile,
        ...updates,
        photos: nextPhotos.filter(Boolean),
        photoRecords: [
          ...(Array.isArray(profile.photoRecords) ? profile.photoRecords : []),
          ...uploadedRecords,
        ],
        isOnboarded: true,
        tier: profile.tier || "Potential",
      });
      setProfile(updatedProfile);
      previews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));

      setTimeout(() => {
        setUploadingState(prev => {
          const next = { ...prev };
          stateKeys.forEach((key) => delete next[key]);
          return next;
        });
      }, 800);

      addToast(`Cập nhật ${uploadedUrls.length} ảnh thành công!`, "success");
    } catch (error) {
      setUploadingState(prev => {
        const next = { ...prev };
        stateKeys.forEach((key) => delete next[key]);
        return next;
      });
      previews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không tải được ảnh lên, vui lòng thử lại.", "info");
    }
  };

  const handleRemoveLookbookPhotoLocal = (id: number) => {
    const fieldKey = `lookbook${id}`;
    const nextPhotos = [...(profile.photos || [])];
    nextPhotos[id - 1] = "";

    const updatedProfile = persistTalentProfile({
      ...profile,
      [fieldKey]: "",
      photos: nextPhotos.filter(Boolean),
    });
    setProfile(updatedProfile);
    addToast(`Đã xóa Ảnh ${id}.`, "info");
  };

  const handleRemoveLookbookPhoto = async (id: number, photoId?: number | string) => {
    const numericPhotoId = Number(photoId);

    try {
      const syncedProfile = await ensureTalentProfile(profile);

      if (syncedProfile.backendProfileId && Number.isFinite(numericPhotoId) && numericPhotoId > 0) {
        await deleteTalentPhoto(syncedProfile.backendProfileId, numericPhotoId);
      }

      const fieldKey = `lookbook${id}`;
      const nextPhotos = [...(profile.photos || [])];
      nextPhotos[id - 1] = "";
      const nextPhotoRecords = Array.isArray(profile.photoRecords)
        ? profile.photoRecords.filter((photo: any) => Number(photo.id) !== numericPhotoId)
        : profile.photoRecords;

      const updatedProfile = persistTalentProfile({
        ...profile,
        [fieldKey]: "",
        photos: nextPhotos.filter(Boolean),
        photoRecords: nextPhotoRecords,
      });

      setProfile(updatedProfile);
      addToast(`Đã xóa Ảnh ${id}.`, "info");
    } catch (error) {
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không xóa được ảnh, vui lòng thử lại.", "info");
    }
  };

  const normalizeVideoUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const currentVideos = Array.isArray(profile.videos) ? profile.videos : [];
    if (currentVideos.length >= 4) {
      addToast("Chỉ được tải tối đa 4 video.", "info");
      return;
    }

    const stateKey = "portfolio-video";
    const previewUrl = URL.createObjectURL(file);

    setUploadingState(prev => ({
      ...prev,
      [stateKey]: {
        progress: 0,
        fileName: file.name,
        status: "uploading"
      }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 8;
      if (progress > 95) progress = 95;
      setUploadingState(prev => {
        if (!prev[stateKey]) return prev;
        return {
          ...prev,
          [stateKey]: {
            ...prev[stateKey],
            progress
          }
        };
      });
    }, 150);

    try {
      const syncedProfile = await ensureTalentProfile(profile);

      if (!syncedProfile.backendProfileId) {
        clearInterval(interval);
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[stateKey];
          return next;
        });
        addToast("Vui lòng đăng nhập để tải video lên", "info");
        URL.revokeObjectURL(previewUrl);
        return;
      }

      const video = await uploadTalentVideo(syncedProfile.backendProfileId, file, file.name.replace(/\.[^.]+$/, ""));
      const nextVideos = [...currentVideos, video].slice(0, 4);
      const updatedProfile = persistTalentProfile({
        ...syncedProfile,
        ...profile,
        videos: nextVideos,
        isOnboarded: true,
        tier: profile.tier || "Potential",
      });
      setProfile(updatedProfile);
      URL.revokeObjectURL(previewUrl);

      clearInterval(interval);
      setUploadingState(prev => ({
        ...prev,
        [stateKey]: {
          ...prev[stateKey],
          progress: 100,
          status: "done"
        }
      }));

      setTimeout(() => {
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[stateKey];
          return next;
        });
      }, 800);

      addToast("Cập nhật video thành công!", "success");
    } catch (error) {
      clearInterval(interval);
      setUploadingState(prev => {
        const next = { ...prev };
        delete next[stateKey];
        return next;
      });
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không tải được video lên, vui lòng thử lại.", "info");
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleAddVideoLink = async () => {
    const currentVideos = Array.isArray(profile.videos) ? profile.videos : [];
    if (currentVideos.length >= 4) {
      addToast("Chỉ được thêm tối đa 4 video.", "info");
      return;
    }

    const url = normalizeVideoUrl(videoLinkInput);
    if (!url) return;

    try {
      let nextVideo: any = {
        id: `local-video-${Date.now()}`,
        url,
        title: `Video ${currentVideos.length + 1}`,
        video_type: "portfolio",
      };

      const syncedProfile = await ensureTalentProfile(profile);
      if (syncedProfile.backendProfileId) {
        nextVideo = await createTalentVideoLink(syncedProfile.backendProfileId, url, `Video ${currentVideos.length + 1}`);
      }

      const updatedProfile = persistTalentProfile({
        ...syncedProfile,
        ...profile,
        videos: [...currentVideos, nextVideo].slice(0, 4),
        isOnboarded: true,
        tier: profile.tier || "Potential",
      });
      setProfile(updatedProfile);
      setVideoLinkInput("");
      addToast("Đã thêm video vào bộ sưu tập.", "success");
    } catch (error) {
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không thêm được video, vui lòng thử lại.", "info");
    }
  };

  const handleRemoveVideo = async (videoId: string | number | undefined, index: number) => {
    const currentVideos = Array.isArray(profile.videos) ? profile.videos : [];
    const targetVideo = currentVideos.find((video: any, idx: number) => idx === index || video.id === videoId);

    try {
      const syncedProfile = await ensureTalentProfile(profile);
      const numericVideoId = Number(targetVideo?.id ?? videoId);

      if (syncedProfile.backendProfileId && Number.isFinite(numericVideoId)) {
        await deleteTalentVideo(syncedProfile.backendProfileId, numericVideoId);
      }

      const updatedProfile = persistTalentProfile({
        ...syncedProfile,
        ...profile,
        videos: currentVideos.filter((video: any, idx: number) => idx !== index && video.id !== videoId),
      });
      setProfile(updatedProfile);
      addToast("Đã xóa video khỏi bộ sưu tập.", "info");
    } catch (error) {
      console.error(error);
      addToast(error instanceof Error ? error.message : "Không xóa được video, vui lòng thử lại.", "info");
    }
  };

  const portfolioPhotoUrls = Array.from(new Set(
    (profile.photos || [])
      .map((url: string) => normalizeBackendAssetUrl(url))
      .filter(Boolean),
  ));
  const portfolioPhotoRecords = Array.isArray(profile.photoRecords)
    ? profile.photoRecords
      .map((photo: any) => ({
        ...photo,
        url: normalizeBackendAssetUrl(photo.url || photo.path),
      }))
      .filter((photo: any) => photo.url)
    : [];

  const lookbookPhotos = Array.from({ length: 8 }, (_, index) => {
    const id = index + 1;
    const explicitUrl = normalizeBackendAssetUrl(profile["lookbook" + id]);
    const url = explicitUrl || portfolioPhotoUrls[index] || "";
    const photoRecord = portfolioPhotoRecords.find((photo: any) => photo.url === url);

    if (!url) return null;

    return {
      id,
      label: "Ảnh " + id,
      url,
      photoId: photoRecord?.id,
    };
  }).filter(Boolean) as Array<{ id: number; label: string; url: string; photoId?: number | string }>;

  const nextLookbookSlot = lookbookPhotos.length < 8 ? lookbookPhotos.length + 1 : null;
  const portfolioVideos: Array<{ id: string | number; title: string; url: string }> = (Array.isArray(profile.videos) ? profile.videos : [])
    .map((video: any, index: number) => ({
      id: video.id ?? `video-${index}`,
      title: video.title || `Video ${index + 1}`,
      url: String(video.url || "").trim(),
    }))
    .filter((video: { url: string }) => video.url)
    .slice(0, 4);
  const canAddVideo = portfolioVideos.length < 4;
  const reviews: ProfileReview[] = Array.isArray(profile.reviews) ? profile.reviews : [];
  const profileSkills = getStringList(profile.skills ?? profile.specialSkills);
  const profileSocialHighlights = getStringList(profile.socialHighlights ?? profile.social_highlights);

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
    // Monday start:
    // Sunday (0) -> pad 6, Monday (1) -> pad 0, Tuesday (2) -> pad 1...
    return firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  };

  const getDayStatus = (dateStr: string) =>
    getTalentDayStatus(dateStr, profile.availabilityCalendar, profile.busyDates);

  const handleCalendarDayClick = (dateStr: string) => {
    const dayNum = dateStr.split("-")[2];
    const nextAvailabilityCalendar = toggleManualBusyDate(
      dateStr,
      profile.availabilityCalendar,
      profile.busyDates,
    );

    if (Array.isArray(profile.busyDates) && profile.busyDates.includes(dateStr)) {
      addToast(`Ngày ${dayNum}/${currentMonth} đang bận do lịch campaign hoặc công việc đã tạo.`, "info");
      return;
    }

    const updatedProfile = persistTalentProfile({
      ...profile,
      availabilityCalendar: nextAvailabilityCalendar,
    });
    setProfile(updatedProfile);
    addToast(
      `Đã chuyển ngày ${dayNum}/${currentMonth} thành trạng thái ${nextAvailabilityCalendar.includes(dateStr) ? "Bận" : "Rảnh"}.`,
      nextAvailabilityCalendar.includes(dateStr) ? "info" : "success",
    );
  };

  if (!profile.isOnboarded && !hasBasicProfileData(profile)) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 py-16 rounded-3xl border border-white/10 bg-[#08090f] shadow-2xl relative overflow-hidden backdrop-blur-xl min-h-[50vh] max-w-xl mx-auto w-full animate-in fade-in duration-500">
        <div className="absolute top-0 right-0 -z-10 h-32 w-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -z-10 h-32 w-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 mb-6">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>

        <div className="space-y-3 max-w-sm">
          <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
            Hồ Sơ Chưa Được Kích Hoạt
          </h3>
          <p className="text-xs text-slate-450 leading-relaxed">
            Bạn chưa thực hiện bài khảo sát định hướng và cập nhật thông tin cá nhân. Hãy hoàn thành khảo sát để mở khóa chỉ số ngoại hình, học vấn, danh hiệu hồ sơ, các dịch vụ đồng hành và báo cáo hiệu quả.
          </p>
        </div>

        <button
          onClick={() => window.location.href = "/talent/survey"}
          className="mt-8 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gradient-gold text-slate-950 hover:shadow-[0_0_20px_rgba(240,197,107,0.35)] hover:scale-[1.02] active:scale-98 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
        >
          Làm Khảo Sát Ngay
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-300">

      {/* 1. HIỆU SUẤT TRÊN ONSTAGE (Cho lên đầu) */}
      <div className="order-[1] lg:col-span-3">
        <OnstagePerformanceCard
          profile={profile}
          onOpenExplanation={() => setIsPerformanceDialogOpen(true)}
        />
      </div>

      {/* 2. MẠNG XÃ HỘI */}
      <div className="order-[2] lg:col-span-3">
        <SocialMediaStatsCard profile={profile} onPreviewImage={onPreviewImage} />
      </div>

      {/* LEFT COLUMN: Full-body photo and basic info */}
      <div className="order-[10] lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Model Full-Body Photo Card */}
        <div className="h-full rounded-2xl border border-[#F0D7D3] bg-white p-5 space-y-4 shadow-sm dark:border-[#151b2d] dark:bg-[#08090f]">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-[#f4c430]" /> ẢNH TOÀN THÂN (FULL-BODY)
          </h3>

          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-inner">
            {normalizeBackendAssetUrl(profile.fullBody) ? (
              <img
                src={normalizeBackendAssetUrl(profile.fullBody)}
                alt="Model Full-body portrait"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] cursor-pointer"
                onClick={() => onPreviewImage?.(normalizeBackendAssetUrl(profile.fullBody))}
              />
            ) : (
              <label className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-600 cursor-pointer hover:bg-slate-900/10 transition-colors">
                <Upload className="h-10 w-10 text-slate-500 hover:text-amber-400 transition-colors" />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Chưa có ảnh full-body</p>
                  <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-600">Tải ảnh lên để hoàn thiện hồ sơ người mẫu.</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={!!uploadingState["fullBody"]}
                  onChange={(e) => handleImageUpload(e, "fullBody")}
                />
              </label>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090f] via-transparent to-transparent opacity-80 pointer-events-none" />

            {/* Camera edit button in bottom-right corner */}
            {normalizeBackendAssetUrl(profile.fullBody) && (
              <div className="absolute bottom-3 right-3 z-20" data-full-body-image-action-menu>
                <button
                  type="button"
                  onClick={() => setIsFullBodyImageMenuOpen(!isFullBodyImageMenuOpen)}
                  className="light-force-white flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white hover:brightness-110 active:scale-95 cursor-pointer shadow-lg transition-all dark:bg-[#F0C56B] dark:!text-slate-950 dark:text-slate-950"
                >
                  <Camera className="h-4.5 w-4.5 !text-white dark:!text-slate-950" />
                </button>
                {isFullBodyImageMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-2 z-50 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#08090f] shadow-2xl">
                    <label className="flex cursor-pointer items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-[#F0C56B]">
                      <Upload className="h-4 w-4 shrink-0" />
                      Chọn ảnh mới
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!!uploadingState["fullBody"]}
                        onChange={(e) => {
                          setIsFullBodyImageMenuOpen(false);
                          handleImageUpload(e, "fullBody");
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveFullBodyImage}
                      className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs font-bold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                    >
                      <Trash2 className="h-4 w-4 shrink-0" />
                      Xóa ảnh
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Progress bar overlay */}
            {uploadingState["fullBody"] && (
              <ProgressBar
                progress={uploadingState["fullBody"].progress}
                message="Đang tải ảnh toàn thân lên..."
              />
            )}


          </div>
        </div>

        {/* Physical Measurements Card */}
        <div className="lg:col-span-2 h-full rounded-2xl border border-[#F0D7D3] bg-white p-6 space-y-5 shadow-sm dark:border-[#151b2d] dark:bg-[#08090f]">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-[#f4c430]" /> THÔNG TIN CƠ BẢN
          </h3>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {/* Chiều Cao */}
              <div className="rounded-2xl bg-slate-950/40 p-3 border border-white/5 min-h-[90px] text-center">
                <div className="mb-1 flex items-center justify-center gap-1.5">
                  <Ruler className="h-4 w-4 text-[#f4c430]" />
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider">Chiều Cao</span>
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
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider">Cân Nặng</span>
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
            {/* Họ và tên */}
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
            <span className="font-bold text-white text-left">{profile.experience !== undefined && profile.experience !== "" && profile.experience !== null ? `${profile.experience} năm` : "Chưa cập nhật"}</span>

            {/* Loại hình Idol */}
            <span className="font-medium text-slate-400">Loại hình Idol</span>
            <span className="font-bold text-white text-left break-words leading-normal">
              {(() => {
                const talentTypes = profile.talentTypes || profile.talent_types;
                return Array.isArray(talentTypes) && talentTypes.length > 0
                  ? Array.from(new Set(talentTypes.map(normalizeTalentTypeLabel).filter(Boolean))).join(", ")
                  : "Chưa cập nhật";
              })()}
            </span>

            <span className="font-medium text-slate-400">Lĩnh vực chuyên sâu</span>
            <span className="font-bold text-white text-left break-words leading-normal">
              {profileSkills.length > 0 ? profileSkills.join(", ") : "Chưa cập nhật"}
            </span>

            <span className="font-medium text-slate-400">Chỉ số nổi bật</span>
            <span className="font-bold text-white text-left break-words leading-normal">
              {profileSocialHighlights.length > 0 ? profileSocialHighlights.join(", ") : "Chưa cập nhật"}
            </span>

            {/* Ngôn ngữ */}
            <span className="font-medium text-slate-400">Ngôn ngữ</span>
            <span className="font-bold text-white text-left break-words leading-normal">
              {formatLanguageList(profile.languages)}
            </span>
          </div>
        </div>



        {/* Lifestyle Co-Space Companion Services Card */}
        {profile.lifestyleServices && profile.lifestyleServices.some((s: any) => s.enabled) && (
          <div className="rounded-2xl border border-[#F0D7D3] bg-white p-6 transition-all duration-300 shadow-sm dark:border-[#151b2d] dark:bg-[#08090f]">
            <button
              onClick={() => setIsLifestyleExpanded(!isLifestyleExpanded)}
              className="w-full flex items-center justify-between text-left focus:outline-none group/title"
            >
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-amber-400" /> Dịch Vụ Đồng Hành (VIP)
              </h3>
              {isLifestyleExpanded ? (
                <ChevronUp className="h-4.5 w-4.5 text-slate-400 group-hover/title:text-white transition-colors" />
              ) : (
                <ChevronDown className="h-4.5 w-4.5 text-slate-400 group-hover/title:text-white transition-colors" />
              )}
            </button>

            {isLifestyleExpanded && (
              <div className="space-y-5 mt-5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-3.5 text-left border-t border-[#151b2d] pt-4">
                  {profile.lifestyleServices.filter((s: any) => s.enabled).map((service: any) => {
                    let icon = "💼";
                    if (service.id === "golf") icon = "⛳";
                    else if (service.id === "pickleball") icon = "🎾";
                    else if (service.id === "dining") icon = "🍷";
                    else if (service.id === "cafe") icon = "☕";
                    else if (service.id === "travel") icon = "💼";
                    else if (service.id === "redcarpet") icon = "✨";
                    else if (service.id === "shopping") icon = "🛍️";
                    else if (service.id === "art") icon = "🎨";
                    else if (service.id === "escort") icon = "🛥️";
                    else if (service.id === "content") icon = "📱";

                    return (
                      <div key={service.id} className="rounded-xl border border-white/5 bg-slate-950/40 p-3.5 space-y-2 hover:border-amber-400/30 transition-all text-left">
                        <div className="flex justify-between items-start flex-wrap gap-1">
                          <span className="font-bold text-xs text-white flex items-center gap-1.5">
                            <span>{icon}</span> {service.title}
                          </span>
                          <span className="font-black text-[10px] text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded">
                            {(service.rate || 0).toLocaleString()}đ/{service.unit}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">{service.description}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Safety Guarantees Area */}
                <div className="border-t border-[#151b2d] pt-4 space-y-3">
                  <span className="block text-[10px] text-slate-500 font-black uppercase tracking-wider text-left">🔒 Cam Kết Bảo Mật & An Toàn Giao Dịch</span>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-slate-950/80 p-2 text-center border border-white/2">
                      <span className="block text-[14px] mb-1">✍️</span>
                      <span className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Smart Contract</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5 font-medium leading-none">Ký số lịch trình</span>
                    </div>
                    <div className="rounded-lg bg-slate-950/80 p-2 text-center border border-white/2">
                      <span className="block text-[14px] mb-1">📍</span>
                      <span className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Real-time GPS</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5 font-medium leading-none">Check-in điểm hẹn</span>
                    </div>
                    <div className="rounded-lg bg-slate-950/80 p-2 text-center border border-white/2">
                      <span className="block text-[14px] mb-1">💰</span>
                      <span className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Escrow Payment</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5 font-medium leading-none">Đặt cọc hệ thống</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}



      </div>

      {/* SECTION D: LOOKBOOK PHOTOS & VIDEOS DISPLAY */}
      <div className="order-[30] lg:col-span-3 rounded-2xl border border-[#F0D7D3] bg-white p-6 space-y-6 shadow-sm dark:border-[#151b2d] dark:bg-[#08090f]">
        <div className="border-b border-[#151b2d] pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="h-4.5 w-4.5 text-[#f4c430]" /> BỘ SƯU TẬP
            </h3>
            <span className="block text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
              HIỂN THỊ BỘ SƯU TẬP ẢNH, VIDEO CỦA IDOL
            </span>
          </div>
        </div>

        {/* Sub-grid 1: Lookbook Photos */}
        <div className="space-y-3">
          <span className="block text-[11px] text-[#f4c430] font-black uppercase tracking-wider">
            ({lookbookPhotos.length}/8 Ảnh)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {lookbookPhotos.map((img) => (
              <div key={img.id} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-md">
                <img
                  src={normalizeBackendAssetUrl(img.url)}
                  alt={img.label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                  onClick={() => onPreviewImage?.(normalizeBackendAssetUrl(img.url))}
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLookbookPhoto(img.id, img.photoId);
                  }}
                  className="light-force-white absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/70 !text-white text-white shadow-lg transition-all hover:border-rose-400/50 hover:bg-rose-500 hover:!text-white hover:text-white active:scale-95 cursor-pointer"
                  title="Xóa ảnh"
                >
                  <Trash2 className="h-4 w-4 !text-white text-white" />
                </button>

                {/* Camera edit button in bottom-right corner */}
                <div className="absolute bottom-3 right-3 z-20">
                  <label className="light-force-white flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white hover:brightness-110 active:scale-95 cursor-pointer shadow-lg transition-all dark:bg-[#F0C56B] dark:!text-slate-950 dark:text-slate-950">
                    <Camera className="h-3.5 w-3.5 !text-white dark:!text-slate-950" />
                    <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={!!uploadingState[`lookbook-${img.id}`]}
                    onChange={(e) => handleLookbookMultiUpload(e, img.id)}
                    />
                  </label>
                </div>

                {uploadingState[`lookbook-${img.id}`] && (
                  <ProgressBar
                    progress={uploadingState[`lookbook-${img.id}`].progress}
                    message="Đang tải ảnh lên..."
                  />
                )}

              </div>
            ))}

            {nextLookbookSlot && (
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950/70 border border-dashed border-white/10 hover:border-amber-400/70 transition-colors">
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-slate-500 hover:text-amber-400 transition-colors">
                  <Upload className="h-7 w-7" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Tải ảnh lên</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={!!uploadingState[`lookbook-${nextLookbookSlot}`]}
                    onChange={(e) => handleLookbookMultiUpload(e, nextLookbookSlot)}
                  />
                </label>
                {uploadingState[`lookbook-${nextLookbookSlot}`] && (
                  <ProgressBar
                    progress={uploadingState[`lookbook-${nextLookbookSlot}`].progress}
                    message="Đang tải ảnh lên..."
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#151b2d] pt-5 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="block text-[11px] text-[#f4c430] font-black uppercase tracking-wider">
              ({portfolioVideos.length}/4 Video)
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Gắn link hoặc tải trực tiếp từ thiết bị
            </span>
          </div>

          {portfolioVideos.length > 0 || canAddVideo ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {portfolioVideos.map((video, index) => (
                <div key={`${video.id}-${index}`} className="relative aspect-[9/16] overflow-hidden rounded-xl border border-white/5 bg-slate-950 shadow-md group">
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
                        src={normalizeBackendAssetUrl((video as any).thumbnailUrl || (video as any).thumbnail_url || getVideoThumbnail(video.url) || "/video_thumb.png")}
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
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-slate-950/80 text-white shadow-lg transition-all hover:border-amber-400/50 hover:text-amber-300 active:scale-95"
                    title="Mở video"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveVideo(video.id, index);
                    }}
                    className="light-force-white absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/70 !text-white text-white shadow-lg transition-all hover:border-rose-400/50 hover:bg-rose-500 hover:!text-white hover:text-white active:scale-95 cursor-pointer"
                    title="Xóa video"
                  >
                    <Trash2 className="h-4 w-4 !text-white text-white" />
                  </button>

                </div>
              ))}
              {canAddVideo && (
                <label className="flex aspect-[9/16] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-slate-950/70 text-slate-500 transition-colors hover:border-amber-400/70 hover:text-amber-400">
                  <Upload className="h-7 w-7" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Tải video</span>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska"
                    className="hidden"
                    disabled={!!uploadingState["portfolio-video"]}
                    onChange={handleVideoFileUpload}
                  />
                </label>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/50 p-5 text-center">
              <Video className="mx-auto mb-2 h-7 w-7 text-slate-500" />
              <p className="text-xs font-semibold text-slate-450">Chưa có video trong bộ sưu tập.</p>
            </div>
          )}

          {canAddVideo && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="space-y-1.5 md:col-span-10">
                <label className="block text-[9px] font-black uppercase tracking-wider text-[#8F0709] dark:text-slate-400">
                  Đường dẫn video
                </label>
                <div className="relative">
                  <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F0709] dark:text-slate-500" />
                  <input
                    type="url"
                    value={videoLinkInput}
                    onChange={(e) => setVideoLinkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddVideoLink();
                      }
                    }}
                    placeholder="https://..."
                    className="h-10 w-full rounded-xl border border-[#F0D7D3] bg-white pl-9 pr-3.5 text-xs font-semibold text-[#191116] shadow-sm outline-none transition-colors placeholder:text-[#9A8B88] focus:border-[#8F0709] dark:border-white/20 dark:bg-[#060918] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handleAddVideoLink}
                  style={{ color: "#ffffff" }}
                  className="light-force-white flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-4 text-[10px] font-black uppercase tracking-wider !text-white text-white shadow-md transition-all hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[3] !text-white text-white" />
                  <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">Thêm link</span>
                </button>
              </div>

              {uploadingState["portfolio-video"] && (
                <div className="md:col-span-12">
                  <ProgressBar
                    progress={uploadingState["portfolio-video"].progress}
                    message="Đang tải video lên..."
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN wrapper: AI Career Alignment Map */}
      <div className="contents">

        {/* SECTION E: AI SURVEY & RADAR CHART & 20 CAREER ALIGNMENTS */}
        <div className="hidden order-[50] lg:col-span-3 rounded-2xl border border-purple-500/20 bg-[#08090f] shadow-[0_0_20px_rgba(168,85,247,0.03)] p-6 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#151b2d] pb-4 justify-between flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
              <div>
                <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                  ĐỊNH HƯỚNG SỰ NGHIỆP
                </h3>
                <span className="block text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                  ĐỊNH HƯỚNG 3 TRỤC CHÍNH XÁC THEO NHÂN TRẮC HỌC & KỸ NĂNG
                </span>
              </div>
            </div>
            <div className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-wide">
              AI Powered
            </div>
          </div>

          {!profile.isOnboarded ? (
            <div className="flex flex-col items-center justify-center text-center p-8 py-12 rounded-xl border border-purple-500/15 bg-slate-950/45 max-w-md mx-auto space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Sparkles className="h-5.5 w-5.5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Kích Hoạt Bản Đồ Năng Lực AI</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Vui lòng thực hiện bài khảo sát định hướng gồm 20 câu hỏi định tính để mở khóa bản đồ năng lực 3 trục, biểu đồ radar & độ tương thích chi tiết với 20 vị trí công việc.
                </p>
              </div>
              <button
                onClick={() => window.location.href = "/talent/survey"}
                className="h-9 px-5 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 text-[10px] font-black text-white hover:brightness-105 active:scale-98 transition-all uppercase tracking-wider cursor-pointer"
              >
                Làm Khảo Sát Ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* Radar Chart Summary Column */}
              <div className="md:col-span-5 flex flex-col justify-between p-4 rounded-xl border border-white/2 bg-slate-950/40">
                <div className="space-y-2">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-black">NHÓM TƯƠNG THÍCH NHẤT</span>
                  <h4 className="text-xs font-black text-amber-300 leading-relaxed uppercase tracking-wide">
                    {profile.mainCategory}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Biểu đồ radar 3 trục: <strong>Pageant, Runway, KOL</strong>.
                  </p>
                </div>

                {/* SVG 3-axis Radar */}
                <div className="h-44 w-44 mx-auto my-4 shrink-0 rounded-xl border border-[#151b2d] bg-slate-950 p-2 shadow-inner flex items-center justify-center">
                  <RadarChart
                    scores={profile.surveyScores}
                  />
                </div>
              </div>

              {/* 20 Recommended Roles Column */}
              <div className="md:col-span-7 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-black text-left mb-2">ĐỘ TƯƠNG THÍCH VỚI 20 VỊ TRÍ CÔNG VIỆC</span>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {(() => {
                      const scores = profile.surveyScores || { pageant: 50, runway: 45, kol: 95 };
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
                              <p className="text-[8px] text-slate-500 truncate mt-0.5">{job.desc}</p>
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION C: INTERACTIVE AVAILABILITY CALENDAR */}
      <div className="order-[40] lg:col-span-3 rounded-2xl border border-[#F0D7D3] bg-white p-5 sm:p-6 space-y-5 shadow-xs dark:border-[#151b2d] dark:bg-[#08090f]">
        <div className="flex items-center justify-between border-b border-[#F0D7D3] pb-3.5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF3F1] text-[#8F0709] border border-[#F0D7D3] dark:bg-white/5 dark:text-[#f4c430] dark:border-white/10">
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
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCalendarDayClick(dateKey)}
                  className={cn(
                    "group relative aspect-square w-full rounded-xl sm:rounded-2xl border flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs select-none active:scale-95",
                    isAvailable
                      ? "border-emerald-300/70 bg-[#ECFDF5] text-[#047857] hover:border-emerald-400 hover:bg-[#D1FAE5] dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                      : "border-rose-300/70 bg-[#FFF1F2] text-[#BE123C] hover:border-rose-400 hover:bg-[#FFE4E6] dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50"
                  )}
                  title={`Ngày ${dayStr}/${monthStr}: ${isAvailable ? "Rảnh (Nhấn để chuyển sang bận)" : "Bận (Nhấn để chuyển sang rảnh)"}`}
                >
                  <span className="text-xs sm:text-sm font-bold font-mono leading-none">
                    {dayStr}
                  </span>
                </button>
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
            <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
              Nhấn vào ngày để đổi trạng thái
            </span>
          </div>
        </div>
      </div>

      {/* SECTION F: REPUTATION REVIEWS (Commented out) */}
      {/* 
      <div className="lg:col-span-3 rounded-2xl border border-[#F0D7D3] bg-white p-6 space-y-6 shadow-sm dark:border-[#151b2d] dark:bg-[#08090f]">
        <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#151b2d] pb-3">
          <ShieldCheck className="h-4.5 w-4.5 text-cyan-400" /> ĐÁNH GIÁ
        </h3>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((rev, idx) => (
              <div key={rev.id || idx} className="rounded-xl bg-slate-950 p-4 border border-white/2 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-white text-xs block">{rev.brand || rev.brandName || "Thương hiệu"}</span>
                    <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">Ngày hợp tác: {rev.date || rev.reviewedAt || "Chưa cập nhật"}</span>
                  </div>
                  <span className="text-[10px] font-black text-amber-400">{Number(rev.rating || 0).toFixed(1)}/5</span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-300 leading-relaxed italic">
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
      */}

      {/* Onstage Performance Explanation Dialog */}
      <OnstagePerformanceExplanationDialog
        isOpen={isPerformanceDialogOpen}
        onClose={() => setIsPerformanceDialogOpen(false)}
      />

    </div>
  );
}
