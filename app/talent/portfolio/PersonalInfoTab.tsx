"use client";

import React, { useState } from "react";
import {
  Award, User,
  ShieldCheck, Calendar, Image as ImageIcon, Sparkles,
  ChevronLeft, ChevronRight, Upload, ChevronDown, ChevronUp, Camera,
  Ruler, Scale, Mail, Phone, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import RadarChart from "@/components/ui/RadarChart";
import ProgressBar from "@/components/ui/ProgressBar";
import { ensureTalentProfile, persistTalentProfile, uploadTalentPhoto } from "@/lib/talent-api";
import { normalizeBackendAssetUrl } from "@/lib/avatar";
import { getTalentDayStatus, toggleManualBusyDate } from "@/lib/talent-calendar";

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

const formatHeight = (h: number | string) => {
  const val = Number(h);
  if (!val) return "—";
  const m = Math.floor(val / 100);
  const cm = val % 100;
  return `${m}m${String(cm).padStart(2, '0')}`;
};

interface ContactInfoCardProps {
  profile: any;
}

const FacebookIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
  </svg>
);

const TiktokIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.24-.11-.47-.24-.7-.37v5.52c.03 2.16-.76 4.38-2.3 5.89-1.58 1.58-3.9 2.37-6.14 2.11-2.4-.21-4.73-1.74-5.69-3.97-.98-2.18-.73-4.9.72-6.79 1.34-1.79 3.63-2.73 5.85-2.5v4.03c-1.44-.19-3 .42-3.66 1.74-.53.97-.33 2.27.46 3.01.78.78 2.05.94 3.01.4 1-.53 1.54-1.67 1.53-2.84V.02z"/>
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
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.48 13.9c-.83.09-1.58-.2-2-.84-.33-.51-.39-1.12-.39-2.22 0-1.89.87-2.92 2.32-2.92 1.41 0 2.22.99 2.22 2.76 0 1.94-.89 2.97-2.15 3.22zm2.09-6.3c-.63-.61-1.54-.95-2.57-.95-1.95 0-3.34 1.34-3.34 3.79s1.39 3.79 3.34 3.79c.8 0 1.51-.2 2.03-.59.18-.13.43-.1.58.07l.79.9c.28.32.18.84-.2 1.04-1 .55-2.14.78-3.2.78-3.33 0-5.74-2.17-5.74-5.99s2.41-5.99 5.74-5.99c1.67 0 3.2.53 4.31 1.49.27.23.31.63.09.91l-.88 1.13c-.15.2-.42.24-.62.08z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

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
  } catch (e) {}
  return url.replace(/https?:\/\/(www\.)?/, "");
};

function ContactInfoCard({ profile }: ContactInfoCardProps) {
  const parseSocialAccounts = (prof: any): { platform: string; url: string }[] => {
    if (!Array.isArray(prof?.socialAccounts)) return [];

    return prof.socialAccounts
      .map((account: any) => ({ platform: String(account.platform || ""), url: String(account.url || "") }))
      .filter((account: { platform: string; url: string }) => account.platform && account.url);
  };

  const socialAccounts = parseSocialAccounts(profile);

  // Group accounts by platform
  const groupedAccounts = socialAccounts.reduce((acc: Record<string, string[]>, curr) => {
    acc[curr.platform] = acc[curr.platform] || [];
    acc[curr.platform].push(curr.url);
    return acc;
  }, {});

  return (
    <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6 text-left">
      <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
        <Mail className="h-4.5 w-4.5 text-[#f4c430]" /> THÔNG TIN LIÊN HỆ
      </h3>

      {/* Phone & Email Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone */}
        <div className="flex items-center gap-3 bg-slate-950/50 border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:border-amber-400/20">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
            <Phone className="h-5 w-5" />
          </div>
          <div className="min-w-0 text-left">
            <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider leading-none mb-1">
              Số điện thoại
            </span>
            <span className="text-xs font-bold text-slate-200 block font-mono">
              {profile.phone || "Chưa cập nhật"}
            </span>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-3 bg-slate-950/50 border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:border-amber-400/20">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
            <Mail className="h-5 w-5" />
          </div>
          <div className="min-w-0 text-left">
            <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider leading-none mb-1">
              Email
            </span>
            <a 
              href={profile.email ? `mailto:${profile.email}` : undefined}
              className={`text-xs font-bold block truncate transition-colors ${profile.email ? 'text-slate-200 hover:text-amber-400' : 'text-slate-400'}`}
            >
              {profile.email || "Chưa cập nhật"}
            </a>
          </div>
        </div>
      </div>

      {profile.portfolio_url ? (
        <div className="border-t border-[#151b2d]/50 pt-5">
          <a
            href={profile.portfolio_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-slate-950/60 px-3.5 py-2.5 text-xs font-bold text-slate-300 transition-all duration-300 hover:border-amber-400/40 hover:bg-amber-400/5 hover:text-amber-300"
            title={profile.portfolio_url}
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span className="truncate">{profile.portfolio_url.replace(/https?:\/\/(www\.)?/, "")}</span>
          </a>
        </div>
      ) : null}

      {/* Social Accounts Area */}
      {Object.keys(groupedAccounts).length > 0 ? (
        <div className="border-t border-[#151b2d]/50 pt-5 space-y-3">
          <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">
            Liên kết mạng xã hội
          </span>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(groupedAccounts).flatMap(([platform, urls]) => 
              urls.map((url, idx) => {
                let brandColorClass = "";
                if (platform === "Facebook") {
                  brandColorClass = "hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5";
                } else if (platform === "Tiktok") {
                  brandColorClass = "hover:text-[#FE2C55] hover:border-[#FE2C55]/40 hover:bg-[#FE2C55]/5";
                } else if (platform === "Instagram") {
                  brandColorClass = "hover:text-[#E1306C] hover:border-[#E1306C]/40 hover:bg-[#E1306C]/5";
                } else if (platform === "Thread") {
                  brandColorClass = "hover:text-[#ffffff] hover:border-[#ffffff]/40 hover:bg-[#ffffff]/5";
                } else if (platform === "Linkedin") {
                  brandColorClass = "hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/5";
                }

                const renderSocialIcon = () => {
                  if (platform === "Facebook") return <FacebookIcon />;
                  if (platform === "Tiktok") return <TiktokIcon />;
                  if (platform === "Instagram") return <InstagramIcon />;
                  if (platform === "Thread") return <ThreadIcon />;
                  if (platform === "Linkedin") return <LinkedinIcon />;
                  return <Globe className="h-4 w-4 shrink-0" />;
                };

                return (
                  <a
                    key={`${platform}-${idx}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 bg-slate-950/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-300 transition-all duration-300 active:scale-95 ${brandColorClass}`}
                    title={url}
                  >
                    {renderSocialIcon()}
                    <span>{getSocialHandle(url, platform)}</span>
                  </a>
                );
              })
            )}
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

  const [uploadingState, setUploadingState] = useState<{
    [key: string]: {
      progress: number;
      fileName: string;
      status: "uploading" | "done" | "error" | "idle";
    };
  }>({});

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

      const updatedProfile = persistTalentProfile({ ...syncedProfile, ...profile, [type]: photoUrl });
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

  const portfolioPhotoUrls = Array.from(new Set(
    (profile.photos || [])
      .map((url: string) => normalizeBackendAssetUrl(url))
      .filter(Boolean),
  ));

  const lookbookPhotos = Array.from({ length: 8 }, (_, index) => {
    const id = index + 1;
    const explicitUrl = normalizeBackendAssetUrl(profile["lookbook" + id]);
    const url = explicitUrl || portfolioPhotoUrls[index] || "";

    if (!url) return null;

    return {
      id,
      label: "Ảnh " + id,
      url,
    };
  }).filter(Boolean) as Array<{ id: number; label: string; url: string }>;

  const nextLookbookSlot = lookbookPhotos.length < 8 ? lookbookPhotos.length + 1 : null;
  const reviews: ProfileReview[] = Array.isArray(profile.reviews) ? profile.reviews : [];

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

  if (!profile.isOnboarded) {
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
            Bạn chưa thực hiện bài khảo sát định hướng và cập nhật thông tin cá nhân. Hãy hoàn thành khảo sát để mở khóa chỉ số ngoại hình, học vấn, hạng người mẫu, các dịch vụ đồng hành và báo cáo hiệu quả.
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">

      {/* Model Full-Body Photo Card */}
      <div className="lg:col-span-1 rounded-2xl border border-[#151b2d] bg-[#08090f] p-5 space-y-4">
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
            <div className="absolute bottom-3 right-3 z-20">
              <label className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0C56B] hover:brightness-110 text-slate-950 active:scale-95 cursor-pointer shadow-lg transition-all border border-slate-950/20">
                <Camera className="h-4.5 w-4.5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={!!uploadingState["fullBody"]}
                  onChange={(e) => handleImageUpload(e, "fullBody")}
                />
              </label>
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

      {/* SECTION D: LOOKBOOK PHOTOS & VIDEOS DISPLAY */}
      <div className="lg:col-span-2 rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
        <div className="border-b border-[#151b2d] pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="h-4.5 w-4.5 text-[#f4c430]" /> BỘ SƯU TẬP
            </h3>
            <span className="block text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
              HIỂN THỊ BỘ SƯU TẬP ẢNH CỦA TALENT
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090f]/70 via-transparent to-transparent pointer-events-none" />

                {/* Camera edit button in bottom-right corner */}
                <div className="absolute bottom-3 right-3 z-20">
                  <label className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F0C56B] hover:brightness-110 text-slate-950 active:scale-95 cursor-pointer shadow-lg transition-all border border-slate-950/20">
                    <Camera className="h-3.5 w-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!!uploadingState[`lookbook-${img.id}`]}
                      onChange={(e) => handleLookbookUpload(e, img.id)}
                    />
                  </label>
                </div>

                {uploadingState[`lookbook-${img.id}`] && (
                  <ProgressBar
                    progress={uploadingState[`lookbook-${img.id}`].progress}
                    message="Đang tải ảnh lên..."
                  />
                )}

                <div className="absolute bottom-3 left-3 z-10 pointer-events-none text-left">
                  <span className="inline-block bg-[#f4c430] text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {img.label}
                  </span>
                </div>
              </div>
            ))}

            {nextLookbookSlot && (
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950/70 border border-dashed border-white/10 hover:border-amber-400/70 transition-colors">
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-slate-500 hover:text-amber-400 transition-colors">
                  <Upload className="h-7 w-7" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Tải ảnh lên</span>
                  <span className="rounded bg-[#f4c430] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-950">
                    Ảnh {nextLookbookSlot}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!!uploadingState[`lookbook-${nextLookbookSlot}`]}
                    onChange={(e) => handleLookbookUpload(e, nextLookbookSlot)}
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
      </div>

      {/* LEFT COLUMN wrapper */}
      <div className="lg:col-span-1 space-y-6 md:space-y-8">
        {/* Physical Measurements Card */}
        <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-5">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-[#f4c430]" /> THÔNG TIN CƠ BẢN
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {/* Chiều Cao */}
            <div className="rounded-2xl bg-slate-950/40 p-3 border border-white/5 flex flex-col items-center justify-between min-h-[140px] text-center">
              <Ruler className="h-5 w-5 text-[#f4c430]" />
              <div className="space-y-1.5 my-2">
                <span className="block text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider">CHIỀU CAO</span>
                <span className="text-sm sm:text-base font-extrabold text-[#f4c430] block">
                  {profile.height ? formatHeight(profile.height) : "—"}
                </span>
              </div>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">CM</span>
            </div>

            {/* Cân Nặng */}
            <div className="rounded-2xl bg-slate-950/40 p-3 border border-white/5 flex flex-col items-center justify-between min-h-[140px] text-center">
              <Scale className="h-5 w-5 text-[#f4c430]" />
              <div className="space-y-1.5 my-2">
                <span className="block text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider">CÂN NẶNG</span>
                <span className="text-sm sm:text-base font-extrabold text-[#f4c430] block">
                  {profile.weight ? profile.weight : "—"}
                </span>
              </div>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">KG</span>
            </div>

            {/* Số đo 3 vòng */}
            <div className="rounded-2xl bg-slate-950/40 p-3 border border-white/5 flex flex-col items-center justify-between min-h-[140px] text-center">
              <User className="h-5 w-5 text-[#f4c430]" />
              <div className="space-y-1.5 my-2">
                <span className="block text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider">SỐ ĐO 3 VÒNG</span>
                <span className="text-sm sm:text-base font-extrabold text-[#f4c430] block">
                  {profile.bust && profile.waist && profile.hips
                    ? `${profile.bust}-${profile.waist}-${profile.hips}`
                    : "—"}
                </span>
              </div>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">CM</span>
            </div>
          </div>

          <div className="space-y-3.5 border-t border-[#151b2d] pt-4 text-left">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Họ và tên</span>
              <span className="font-bold text-white">{profile.name || "Chưa cập nhật"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Giới tính</span>
              <span className="font-bold text-white">{profile.gender || "Chưa cập nhật"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Ngày sinh</span>
              <span className="font-bold text-white font-mono">{profile.dob ? convertToDisplayDate(profile.dob) : "Chưa cập nhật"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Tuổi</span>
              <span className="font-bold text-white font-mono">
                {(() => {
                  if (!profile.dob) return "Chưa cập nhật";
                  let birthYear: number | null = null;
                  if (profile.dob.includes("/")) {
                    const parts = profile.dob.split("/");
                    if (parts.length === 3) birthYear = parseInt(parts[2], 10);
                  } else if (profile.dob.includes("-")) {
                    const parts = profile.dob.split("-");
                    if (parts.length === 3 && parts[0].length === 4) birthYear = parseInt(parts[0], 10);
                  }
                  if (!birthYear || isNaN(birthYear)) return "Chưa cập nhật";
                  const currentYear = new Date().getFullYear();
                  return `${currentYear - birthYear} tuổi`;
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Mức giá</span>
              <span className="font-bold text-white">
                {profile.price ? profile.price : "Chưa cập nhật"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Khu vực hoạt động</span>
              <span className="font-bold text-white">{profile.location || "Chưa cập nhật"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Quê quán</span>
              <span className="font-bold text-white">{profile.hometown || "Chưa cập nhật"}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Học vấn</span>
              <span className="font-bold text-white text-right max-w-[160px] truncate" title={profile.education || "Chưa cập nhật"}>{profile.education || "Chưa cập nhật"}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-300 border-t border-dashed border-[#151b2d]/50 pt-2">
              <span className="font-medium text-slate-400">Kinh nghiệm</span>
              <span className="font-bold text-white">{profile.experience !== undefined && profile.experience !== "" && profile.experience !== null ? `${profile.experience} năm` : "Chưa cập nhật"}</span>
            </div>
            <div className="flex justify-between items-start text-xs text-slate-300">
              <span className="font-medium text-slate-400 shrink-0">Lĩnh vực hoạt động</span>
              <span className="font-bold text-white text-right max-w-[160px] leading-normal">
                {(() => {
                  const talentTypes = profile.talentTypes || profile.talent_types || profile.specialSkills || profile.skills;
                  return Array.isArray(talentTypes) && talentTypes.length > 0 ? talentTypes.join(", ") : "Chưa cập nhật";
                })()}
              </span>
            </div>
            <div className="flex justify-between items-start text-xs text-slate-300">
              <span className="font-medium text-slate-400 shrink-0">Ngôn ngữ</span>
              <span className="font-bold text-white text-right max-w-[160px] leading-normal">
                {(() => {
                  const langs = profile.languages;
                  return Array.isArray(langs) && langs.length > 0 ? langs.join(", ") : "Chưa cập nhật";
                })()}
              </span>
            </div>
          </div>
        </div>



        {/* Lifestyle Co-Space Companion Services Card */}
        {profile.lifestyleServices && profile.lifestyleServices.some((s: any) => s.enabled) && (
          <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 transition-all duration-300">
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

      {/* RIGHT COLUMN wrapper: Contact Info and AI Career Alignment Map */}
      <div className="lg:col-span-2 space-y-6 md:space-y-8">
        <ContactInfoCard profile={profile} />

        {/* SECTION E: AI SURVEY & RADAR CHART & 20 CAREER ALIGNMENTS */}
        <div className="rounded-2xl border border-purple-500/20 bg-[#08090f] shadow-[0_0_20px_rgba(168,85,247,0.03)] p-6 space-y-6">
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
      <div className="lg:col-span-3 rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#151b2d] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-slate-400" />
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
              LỊCH LÀM VIỆC (THÁNG {currentMonth < 10 ? `0${currentMonth}` : currentMonth}/{currentYear})
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
                <button
                  key={idx}
                  onClick={() => handleCalendarDayClick(dateKey)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 p-1 h-16 rounded-xl border text-center transition-all cursor-pointer hover:scale-102 overflow-hidden",
                    status === "available" && "border-emerald-500/80 bg-emerald-500/5 text-emerald-400 hover:border-emerald-400",
                    status === "busy" && "border-red-500/80 bg-red-500/5 text-red-400 hover:border-red-400"
                  )}
                >
                  <span className="text-[11px] font-mono font-bold leading-none">{dayStr}</span>
                  <span className="text-[8px] font-black uppercase tracking-wide leading-tight text-center block w-full px-0.5">
                    {status === "available" ? "RẢNH" : "BẬN"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400 border-t border-white/5 pt-3 mt-1">
            <span>🟢 Rảnh</span>
            <span>🔴 Bận</span>
          </div>
        </div>
      </div>

      {/* SECTION F: REPUTATION REVIEWS */}
      <div className="lg:col-span-3 rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
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

    </div>
  );
}

