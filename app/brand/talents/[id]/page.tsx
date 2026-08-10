"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import BookingFlow from "@/app/brand/talents/[id]/booking-talent/BookingFlow";
import { findTalentById } from "@/lib/brand-mvp-data";
import { cn } from "@/lib/utils";
import RadarChart from "@/components/ui/RadarChart";
import TierExplanationDialog from "@/components/ui/TierExplanationDialog";
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

const FacebookIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
  </svg>
);

const TiktokIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.24-.11-.47-.24-.7-.37v5.52c.03 2.16-.76 4.38-2.3 5.89-1.58 1.58-3.9 2.37-6.14 2.11-2.4-.21-4.73-1.74-5.69-3.97-.98-2.18-.73-4.9.72-6.79 1.34-1.79 3.63-2.73 5.85-2.5v4.03c-1.44-.19-3 .42-3.66 1.74-.53.97-.33 2.27.46 3.01.78.78 2.05.94 3.01.4 1-.53 1.54-1.67 1.53-2.84V.02z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const ThreadIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.48 13.9c-.83.09-1.58-.2-2-.84-.33-.51-.39-1.12-.39-2.22 0-1.89.87-2.92 2.32-2.92 1.41 0 2.22.99 2.22 2.76 0 1.94-.89 2.97-2.15 3.22zm2.09-6.3c-.63-.61-1.54-.95-2.57-.95-1.95 0-3.34 1.34-3.34 3.79s1.39 3.79 3.34 3.79c.8 0 1.51-.2 2.03-.59.18-.13.43-.1.58.07l.79.9c.28.32.18.84-.2 1.04-1 .55-2.14.78-3.2.78-3.33 0-5.74-2.17-5.74-5.99s2.41-5.99 5.74-5.99c1.67 0 3.2.53 4.31 1.49.27.23.31.63.09.91l-.88 1.13c-.15.2-.42.24-.62.08z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const getSocialPlatformInfo = (rawPlatform: string, url: string) => {
  const p = (rawPlatform || "").toLowerCase().trim();
  const u = (url || "").toLowerCase().trim();

  if (p.includes("facebook") || p.includes("fb") || u.includes("facebook.com") || u.includes("fb.com")) {
    return {
      platformKey: "Facebook",
      icon: <FacebookIcon />,
      colorClass: "hover:text-[#1877F2] hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 text-[#1877F2]",
    };
  }
  if (p.includes("tiktok") || u.includes("tiktok.com")) {
    return {
      platformKey: "Tiktok",
      icon: <TiktokIcon />,
      colorClass: "hover:text-[#FE2C55] hover:border-[#FE2C55]/50 hover:bg-[#FE2C55]/10 text-[#FE2C55]",
    };
  }
  if (p.includes("instagram") || p.includes("insta") || u.includes("instagram.com") || u.includes("instagr.am")) {
    return {
      platformKey: "Instagram",
      icon: <InstagramIcon />,
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
  if (p.includes("linkedin") || u.includes("linkedin.com")) {
    return {
      platformKey: "Linkedin",
      icon: <LinkedinIcon />,
      colorClass: "hover:text-[#0A66C2] hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10 text-[#0A66C2]",
    };
  }
  if (p.includes("youtube") || u.includes("youtube.com") || u.includes("youtu.be")) {
    return {
      platformKey: "Youtube",
      icon: (
        <svg className="h-4 w-4 shrink-0 fill-current text-[#FF0000]" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      colorClass: "hover:text-[#FF0000] hover:border-[#FF0000]/50 hover:bg-[#FF0000]/10 text-[#FF0000]",
    };
  }

  return {
    platformKey: rawPlatform || "Globe",
    icon: <Globe className="h-4 w-4 shrink-0 text-amber-400" />,
    colorClass: "hover:text-amber-300 hover:border-amber-400/50 hover:bg-amber-400/10 text-amber-400",
  };
};

const getSocialHandle = (url: string, platform: string) => {
  try {
    const trimmed = url.trim().replace(/\/$/, "");
    const parts = trimmed.split("/");
    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      if (lastPart.startsWith("@")) return lastPart;
      if (platform === "Linkedin" && lastPart === "in" && parts.length > 2) {
        return parts[parts.length - 2];
      }
      return platform === "Tiktok" ? `@${lastPart}` : lastPart;
    }
  } catch (e) { }
  return url.replace(/https?:\/\/(www\.)?/, "");
};

function ContactInfoCard({ profile }: ContactInfoCardProps) {
  const parseSocialAccounts = (prof: any): { platform: string; url: string }[] => {
    let list: { platform: string; url: string }[] = [];

    if (Array.isArray(prof?.socialAccounts) && prof.socialAccounts.length > 0) {
      list = prof.socialAccounts
        .map((account: any) => ({
          platform: String(account.platform || "").trim(),
          url: String(account.url || "").trim(),
        }))
        .filter((account: { platform: string; url: string }) => account.url);
    }

    const legacyFields: { name: string; key: string }[] = [
      { name: "Tiktok", key: "tiktok" },
      { name: "Facebook", key: "facebook" },
      { name: "Instagram", key: "instagram" },
      { name: "Thread", key: "thread" },
      { name: "Thread", key: "threads" },
      { name: "Linkedin", key: "linkedin" },
      { name: "Youtube", key: "youtube" },
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

    return list;
  };

  const socialAccounts = parseSocialAccounts(profile);
  const portfolioLinks = portfolioLinksFromProfile(profile);
  const portfolioOwnerName = String(profile?.name || "Idol").trim().replace(/\s+/g, "_");

  return (
    <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6 text-left">
      <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
        <FileText className="h-4.5 w-4.5 text-[#f4c430]" /> Portfolio & Mạng xã hội
      </h3>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-3 bg-slate-950/50 border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:border-amber-400/20">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 text-left">
            <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider leading-none mb-1">
              Portfolio
            </span>
            {portfolioLinks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {portfolioLinks.map((link, index) => (
                  <a
                    key={`${link}-${index}`}
                    href={portfolioHref(link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-1 text-xs font-bold text-slate-200 transition-colors hover:border-amber-400/40 hover:text-amber-400"
                    title={link}
                  >
                    <span className="truncate">{`Portfolio${index + 1}_${portfolioOwnerName}`}</span>
                  </a>
                ))}
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-400 block">
                Không có portfolio
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Social Accounts Area */}
      {socialAccounts.length > 0 ? (
        <div className="border-t border-[#151b2d]/50 pt-5 space-y-3">
          <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">
            Liên kết mạng xã hội
          </span>
          <div className="flex flex-wrap gap-2.5">
            {socialAccounts.map((account, idx) => {
              const info = getSocialPlatformInfo(account.platform, account.url);
              const handle = getSocialHandle(account.url, info.platformKey);
              return (
                <a
                  key={`${account.platform}-${idx}`}
                  href={account.url.startsWith("http") ? account.url : `https://${account.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-200 transition-all duration-300 active:scale-95 shadow-sm ${info.colorClass}`}
                  title={account.url}
                >
                  {info.icon}
                  <span>{handle}</span>
                </a>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center text-xs text-slate-300 border-t border-[#151b2d] pt-3.5">
          <span className="font-medium text-slate-400">Mạng xã hội</span>
          <span className="font-bold text-white">Chưa cập nhật</span>
        </div>
      )}
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isTierDialogOpen, setIsTierDialogOpen] = useState(false);
  const [isAddingToBrand, setIsAddingToBrand] = useState(false);
  const [isAddedToBrand, setIsAddedToBrand] = useState(false);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; tone: "success" | "error" }[]>([]);

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
        { brand: "Vogue Vietnam Editorial", rating: 5, date: "12/04/2026", comment: "Thái độ làm việc nghiêm túc, tạo dáng xuất sắc và có kiến thức chuyên môn cao. Rất khuyên dùng." }
      ] as any[]
    };
  }, [talent]);


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
          onClick={() => router.back()}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/30 bg-[#0c1120]/85 backdrop-blur-md text-amber-400 hover:text-amber-300 hover:bg-[#0c1120] hover:border-amber-500/50 shadow-[0_4px_15px_rgba(0,0,0,0.4)] transition-all duration-300 active:scale-95 cursor-pointer"
          aria-label="Quay lại"
          title="Quay lại"
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
        </button>

        <div className="relative pointer-events-auto">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/30 bg-[#0c1120]/85 backdrop-blur-md text-amber-400 hover:text-amber-300 hover:bg-[#0c1120] hover:border-amber-500/50 shadow-[0_4px_15px_rgba(0,0,0,0.4)] transition-all duration-300 active:scale-95 cursor-pointer"
            aria-label="Thao tác"
            title="Thao tác"
          >
            <MoreVertical className="h-5 w-5 shrink-0" />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/5 bg-[#0c1120]/95 backdrop-blur-md p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleAddToBrand();
                  }}
                  disabled={isAddingToBrand || isAddedToBrand}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <Users className="h-4 w-4 text-amber-400" />
                  <span>{isAddedToBrand ? "Đã thêm vào danh sách quản lý" : "Thêm vào danh sách quản lý"}</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push(`/brand/talents/${params.id}/booking-talent`);
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition duration-200 text-left"
                >
                  <CalendarCheck className="h-4 w-4 text-amber-400" />
                  <span>Đặt ngay</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleAddToWishlist();
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition duration-200 text-left"
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
                "flex h-10 items-center justify-center rounded-xl border px-2 text-[9.5px] font-black uppercase tracking-wider transition active:scale-95",
                portfolioLinks.length > 0
                  ? "cursor-pointer border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  : "cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-500"
              )}
            >
              <Eye className="mr-1 h-3.5 w-3.5 shrink-0 text-current" />
              <span className="truncate">Portfolio</span>
            </button>
            <button
              type="button"
              onClick={() => router.push(`/brand/talents/${params.id}/booking-talent`)}
              className="flex h-10 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-400/25 via-yellow-500/20 to-amber-500/30 px-2 text-[9.5px] font-black uppercase tracking-wider text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)] transition active:scale-95 cursor-pointer"
            >
              <CalendarCheck className="mr-1 h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span className="truncate">Đặt ngay</span>
            </button>
            <button
              type="button"
              onClick={handleAddToWishlist}
              className={cn(
                "flex h-10 items-center justify-center rounded-xl px-2 text-[9.5px] font-black uppercase tracking-wider shadow-md transition-all duration-300 active:scale-95",
                isInWishlist
                  ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 shadow-[0_0_15px_rgba(201,168,106,0.2)]"
              )}
            >
              {isInWishlist ? (
                <>
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span className="truncate">Đã lưu</span>
                </>
              ) : (
                <>
                  <Heart className="mr-1 h-3.5 w-3.5 shrink-0 fill-slate-950 text-slate-950" />
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
              "flex-1 sm:flex-initial flex h-10 items-center justify-center rounded-full border px-6 text-[10px] sm:text-xs font-black uppercase tracking-wider transition active:scale-95 whitespace-nowrap duration-300",
              portfolioLinks.length > 0
                ? "cursor-pointer border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                : "cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-500"
            )}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5 shrink-0 text-current" />
            Xem Portfolio
          </button>
          <button
            type="button"
            onClick={() => router.push(`/brand/talents/${params.id}/booking-talent`)}
            className="flex-1 sm:flex-initial flex h-10 items-center justify-center rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-400/25 via-yellow-500/20 to-amber-500/30 px-6 text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <CalendarCheck className="mr-2 h-4 w-4 shrink-0 text-amber-400" />
            <span>Đặt ngay</span>
          </button>
          <button
            type="button"
            onClick={handleAddToWishlist}
            className={cn(
              "flex-1 sm:flex-initial flex h-10 items-center justify-center rounded-full px-6 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer whitespace-nowrap shadow-md",
              isInWishlist
                ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                : "bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 hover:brightness-110 shadow-[0_0_15px_rgba(201,168,106,0.2)]"
            )}
          >
            {isInWishlist ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 shrink-0 text-emerald-400" />
                <span>ĐÃ LƯU</span>
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4 shrink-0 fill-slate-950 text-slate-950" />
                <span>LƯU THÔNG TIN</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Main Grid Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

        {/* 1. Model Full-Body Photo Card */}
        <div className="order-[10] col-span-1 h-full rounded-2xl border border-[#151b2d] bg-[#08090f] p-5 space-y-4">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-amber-400" /> Ảnh Toàn Thân (Full-body)
          </h3>

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
            <div>
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="h-4.5 w-4.5 text-[#f4c430]" /> Bộ sưu tập
              </h3>
              <span className="block text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                Bộ sưu tập hình ảnh, video tốt nhất của idol
              </span>
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
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-slate-400" /> Thông tin cơ bản
          </h3>

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

        {/* RIGHT COLUMN wrapper: Contact Info and AI Career Alignment Map */}
        <div className="contents">
          <div className="order-[20] lg:col-span-3">
            <ContactInfoCard profile={profile} />
          </div>

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
        <div className="order-[40] lg:col-span-3 rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#151b2d] pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-slate-400" />
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                Lịch Làm Việc (Tháng {currentMonth < 10 ? `0${currentMonth}` : currentMonth}/{currentYear})
              </h3>
            </div>
            <div className="flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/5 border border-amber-400/20 text-amber-400 hover:bg-amber-400 hover:text-slate-950 hover:border-transparent hover:shadow-[0_0_12px_rgba(244,196,48,0.3)] transition-all cursor-pointer"
                title="Tháng trước"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/5 border border-amber-400/20 text-amber-400 hover:bg-amber-400 hover:text-slate-950 hover:border-transparent hover:shadow-[0_0_12px_rgba(244,196,48,0.3)] transition-all cursor-pointer"
                title="Tháng sau"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500 font-black uppercase">
              <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {/* Pad empty days */}
              {Array.from({ length: getFirstDayPad(currentYear, currentMonth) }).map((_, pIdx) => (
                <div key={`pad-${pIdx}`} className="h-12 border border-transparent" />
              ))}

              {/* Real days */}
              {Array.from({ length: getDaysInMonth(currentYear, currentMonth) }).map((_, idx) => {
                const dayNumber = idx + 1;
                const dayStr = dayNumber < 10 ? `0${dayNumber}` : `${dayNumber}`;
                const monthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
                const dateKey = `${currentYear}-${monthStr}-${dayStr}`;
                const status = getDayStatus(dateKey);

                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 p-1 h-16 rounded-xl border text-center transition-all overflow-hidden",
                      status === "available" && "border-emerald-400/40 bg-emerald-400/5 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.1)]",
                      status === "busy" && "border-red-500/40 bg-red-500/5 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.1)]"
                    )}
                  >
                    <span className="text-[11px] font-mono font-bold leading-none">{dayStr}</span>
                    <span className="text-[8px] font-black uppercase tracking-wide leading-tight text-center block w-full px-0.5">
                      {status === "available" ? "Rảnh" : "Bận"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400 border-t border-white/5 pt-3 mt-1">
              <span>🟢 Rảnh</span>
              <span>🔴 Bận</span>
            </div>
          </div>
        </div>

        {/* 6. Lifestyle Co-Space Companion Services Card */}
        {profile.lifestyleServices && profile.lifestyleServices.some((s: any) => s.enabled) && (
          <div className="order-[60] lg:col-span-3 rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 transition-all duration-300">
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-amber-400" /> Dịch Vụ Đồng Hành (VIP)
            </h3>
            <div className="space-y-5 mt-5">
              <div className="space-y-3.5 text-left">
                {profile.lifestyleServices.filter((s: any) => s.enabled).map((service: any) => {
                  let icon = "💼";
                  if (service.id === "golf") icon = "⛳";
                  else if (service.id === "pickleball") icon = "🎾";
                  else if (service.id === "dining") icon = "ðŸ·";
                  else if (service.id === "cafe") icon = "☕";
                  else if (service.id === "travel") icon = "💼";
                  else if (service.id === "redcarpet") icon = "✨";
                  else if (service.id === "shopping") icon = "ðŸ›ï¸";
                  else if (service.id === "art") icon = "🎨";
                  else if (service.id === "escort") icon = "ðŸ›¥ï¸";
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
                    <span className="block text-[14px] mb-1">ðŸ“</span>
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
          </div>
        )}

        {/* 7. SECTION F: REPUTATION REVIEWS (Commented out) */}
        {/* 
        <div className="lg:col-span-2 rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#151b2d] pb-3">
            <ShieldCheck className="h-4.5 w-4.5 text-cyan-400" /> Đánh Giá
          </h3>
          {profile.reviews.length > 0 ? (
            <div className="space-y-4">
              {profile.reviews.map((rev, idx) => (
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


      </div>

      <GuestActionPrompt />
      {/* Full Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020408]/90 backdrop-blur-md transition-all duration-300 animate-in fade-in cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-black/60 border border-white/10 text-white hover:bg-black/80 hover:text-[#f4c430] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewImage}
              alt="Talent Photo Preview"
              className="max-h-[85vh] max-w-full object-contain select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Tier Explanation Dialog */}
      <TierExplanationDialog
        isOpen={isTierDialogOpen}
        onClose={() => setIsTierDialogOpen(false)}
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
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-[#f4c430]" />
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
