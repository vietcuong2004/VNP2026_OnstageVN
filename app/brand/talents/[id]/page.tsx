"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Briefcase,
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
  MessageSquare,
  TrendingUp,
  Wallet,
  Image as ImageIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
  BookOpen,
  Plus,
  X,
  Scale,
  Upload,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
} from "lucide-react";
import { campaigns, findTalentById } from "@/lib/brand-mvp-data";
import { cn } from "@/lib/utils";
import RadarChart from "@/components/ui/RadarChart";
import { loadBrandTalent } from "@/lib/brand-api";
import { createInitialAvatarDataUrl, normalizeBackendAssetUrl } from "@/lib/avatar";

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

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

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
  const params = useParams<{ id: string }>();
  const staticTalent = useMemo(() => findTalentById(params.id), [params.id]);
  const [talent, setTalent] = useState<any>(staticTalent);
  const [loading, setLoading] = useState(!staticTalent);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const [addedCampaigns, setAddedCampaigns] = useState<string[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id ?? "");
  const [showInviteModal, setShowInviteModal] = useState(false);

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
      location: talent.district ? `${talent.district}, ${talent.city}` : talent.city,
      hometown: talent.district || "",
      phone: talent.phone || "",
      email: talent.email || "",
      education: talent.education || "",
      experience: talent.yearsOfExperience,
      specialSkills: talent.skills || [],
      skills: talent.skills || [],
      languages: talent.languages || [],
      lifestyleServices: talent.lifestyleServices || [],
      tier: talent.tier,
      score: talent.score,
      aiScore: talent.aiScore || talent.score,
      bio: talent.experience || "",
      skillsScores: talent.skillsScores || {
        catwalk: 85,
        pose: 90,
        mc: 75,
        livestream: 80,
        acting: 70,
        social: 95,
        safety: 90,
        reliability: 96
      },
      surveyScores: talent.surveyScores || { pageant: 50, runway: 45, kol: 95 },
      mainCategory: talent.mainCategory || "KOL / Người mẫu ảnh / Giải trí thế hệ mới",
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
          <h1 className="text-xl font-black text-white">Talent chưa kích hoạt hồ sơ</h1>
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

  function handleAddToCampaign() {
    if (!selectedCampaignId) {
      window.alert("Vui lòng chọn chiến dịch!");
      return;
    }
    const campaign = campaigns.find(c => c.id === selectedCampaignId);
    if (addedCampaigns.includes(selectedCampaignId)) {
      window.alert(`Ứng viên đã được thêm vào chiến dịch ${campaign?.title} trước đó!`);
      return;
    }
    setAddedCampaigns(prev => [...prev, selectedCampaignId]);
    window.alert(`Đã thêm ${talent?.name} vào chiến dịch ${campaign?.title} thành công!`);
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">

      {/* Cover Header */}
      <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#08090f] shadow-xl">
        <div className="relative h-56 w-full overflow-hidden bg-slate-950 md:h-72">
          <img
            src={talent.cover}
            alt={`${talent.name} cover`}
            onError={(event) => {
              event.currentTarget.src = createInitialAvatarDataUrl(talent.name, "");
            }}
            onClick={() => {
              if (talent.cover) setPreviewImage(talent.cover);
            }}
            className="h-full w-full object-cover opacity-65 cursor-pointer hover:opacity-80 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-black/75 pointer-events-none" />
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-4 z-10 flex h-9 items-center rounded-full border border-yellow-400/25 bg-[#0c1120]/80 backdrop-blur-md px-4 text-xs font-black text-yellow-400 hover:text-yellow-300 hover:bg-[#0c1120] hover:border-yellow-400/40 shadow-[0_4px_15px_rgba(0,0,0,0.4)] transition-all duration-300 active:scale-95 cursor-pointer uppercase tracking-wider gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            <span>Quay lại</span>
          </button>
          <div className="absolute right-4 top-4 rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-amber-300">
            Brand view
          </div>
        </div>

        <div className="relative flex flex-col gap-5 pl-6 sm:pl-10 pr-6 pb-2 pt-4 lg:flex-row lg:items-start lg:justify-between">
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
                <h2 className="font-display font-black text-white text-2xl sm:text-3xl tracking-wide uppercase leading-tight flex items-center gap-2 justify-center sm:justify-start">
                  {talent.name}
                  {talent.verified && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold shadow-md select-none" title="Đã xác minh">
                      ✓
                    </span>
                  )}
                </h2>
                
                <p className="text-xs sm:text-[13px] font-black uppercase text-slate-400 tracking-widest text-center sm:text-left">
                  {talent.type || "Người mẫu • KOL • MC"}
                </p>
                
                {/* Location, Email & Phone Contacts Row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-1.5 text-[11px] sm:text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#F0C56B]" />
                    <span className="text-slate-300 font-medium">
                      {talent.district ? `${talent.district}, ${talent.city}` : talent.city || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-[#F0C56B]" />
                    <span className="text-slate-300 font-medium">{profile?.email || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-[#F0C56B]" />
                    <span className="text-slate-300 font-medium font-mono">{profile?.phone || "Chưa cập nhật"}</span>
                  </div>
                </div>

                {/* Bio (Description) Row */}
                <div className="text-[11px] sm:text-xs text-slate-400 font-medium leading-relaxed pt-2.5 border-t border-white/5 mt-1 text-center sm:text-left">
                  {talent.experience || "Chưa cập nhật giới thiệu bản thân."}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Rank Card */}
          <div className="shrink-0 lg:pb-2 w-full lg:w-auto flex flex-col items-center gap-4">
            {profile?.tier && (() => {
              const tier = profile.tier.toUpperCase();
              let tierText = "";
              let tierLabel = "";
              let tierColor = "";
              let tierBadge = "";
              let scoreText = "";

              if (tier === "S") {
                tierText = "HẠNG S";
                tierLabel = "CELEB / SUPER VIP";
                tierColor = "border-amber-400/50 bg-amber-500/5 text-amber-400";
                tierBadge = `${profile.aiScore || profile.score || 95} • AI ĐIỂM`;
                scoreText = "Hoa hậu Quốc gia, Ngôi sao hạng S.";
              } else if (tier === "A") {
                tierText = "HẠNG A";
                tierLabel = "HIGH-END PRO";
                tierColor = "border-slate-300/40 bg-slate-400/5 text-slate-300";
                tierBadge = `${profile.aiScore || profile.score || 85} • AI ĐIỂM`;
                scoreText = "Á hậu, Hoa khôi lớn, Siêu mẫu Runway chuyên nghiệp, MC VIP.";
              } else if (tier === "B") {
                tierText = "HẠNG B";
                tierLabel = "MID FREELANCE";
                tierColor = "border-purple-500/40 bg-purple-500/5 text-purple-400";
                tierBadge = `${profile.aiScore || profile.score || 55} • AI ĐIỂM`;
                scoreText = "Người mẫu ảnh Lookbook, Micro/Mid-tier KOLs, PG VIP sự kiện cao cấp.";
              } else if (tier === "C") {
                tierText = "HẠNG C";
                tierLabel = "ENTRY / MEMBER";
                tierColor = "border-teal-500/30 bg-[#091f1c]/40 text-teal-400";
                tierBadge = `${profile.aiScore || profile.score || 30} • AI ĐIỂM`;
                scoreText = "Người mẫu tự do mới vào nghề, tiềm năng phát triển tốt.";
              }

              return (
                <div className={cn("relative overflow-hidden rounded-2xl border p-4 text-left w-full md:w-64 backdrop-blur-md shadow-soft flex flex-col justify-between min-h-[130px]", tierColor)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black uppercase tracking-widest">{tierLabel}</span>
                    <span className="text-[8px] font-black uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{tierBadge}</span>
                  </div>
                  <span className="block text-xl font-black tracking-wide font-display">{tierText}</span>
                  <p className="mt-2 text-[10px] leading-relaxed opacity-80">{scoreText}</p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Centered Action Buttons Row */}
        <div className="flex items-center justify-center gap-3 px-6 pb-6 pt-4 w-full">
          <button
            onClick={() => router.push(`/brand/messages?talentId=${talent.id}`)}
            className="flex-1 sm:flex-initial flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 px-6 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-950 transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <MessageSquare className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            Nhắn tin
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex-1 sm:flex-initial flex h-10 items-center justify-center rounded-xl border border-[#C9A86A]/30 bg-[#C9A86A]/10 px-6 text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#C9A86A] transition active:scale-95 cursor-pointer hover:bg-[#C9A86A]/20 whitespace-nowrap"
          >
            <Briefcase className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            Thêm vào chiến dịch
          </button>
        </div>
      </section>

      {/* Main Grid Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

        {/* 1. Model Full-Body Photo Card */}
        <div className="col-span-1 rounded-2xl border border-[#151b2d] bg-[#08090f] p-5 space-y-4">
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
                  <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-600">Talent chưa cập nhật ảnh toàn thân.</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090f] via-transparent to-transparent opacity-80 pointer-events-none" />
          </div>
        </div>

        {/* 2. SECTION D: LOOKBOOK PHOTOS & DISPLAY */}
        <div className="lg:col-span-2 rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
          <div className="border-b border-[#151b2d] pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="h-4.5 w-4.5 text-[#f4c430]" /> Bộ sưu tập
              </h3>
              <span className="block text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                Hiển thị bộ sưu tập ảnh của Talent
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
                    <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1 z-10 pointer-events-none text-left">
                      <span className="inline-block bg-[#f4c430] text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {img.label}
                      </span>
                    </div>
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
        </div>

        {/* 3. Physical Measurements Card */}
        <div className="col-span-1 rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-5">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-slate-400" /> Thông tin cơ bản
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {/* Chiều Cao */}
            <div className="rounded-2xl bg-slate-950/40 p-3 border border-white/5 flex flex-col items-center justify-between min-h-[140px] text-center">
              <Ruler className="h-5 w-5 text-[#f4c430]" />
              <div className="space-y-1.5 my-2">
                <span className="block text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider">Chiều Cao</span>
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
                <span className="block text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider">Cân Nặng</span>
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
                <span className="block text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider">Số đo 3 vòng</span>
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
              <span className="font-medium text-slate-400">Khu vực hoạt động</span>
              <span className="font-bold text-white">{profile.location || "Chưa cập nhật"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Quê quán</span>
              <span className="font-bold text-white">{profile.hometown || "Chưa cập nhật"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Số điện thoại</span>
              <span className="font-bold text-white font-mono">{profile.phone || "Chưa cập nhật"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-medium text-slate-400">Email</span>
              <span className="font-bold text-white">{profile.email || "Chưa cập nhật"}</span>
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
                  const skills = profile.specialSkills || profile.skills;
                  return Array.isArray(skills) && skills.length > 0 ? skills.join(", ") : "Chưa cập nhật";
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

        {/* 4. SECTION E: AI SURVEY & RADAR CHART & 20 CAREER ALIGNMENTS */}
        <div className="lg:col-span-2 rounded-2xl border border-purple-500/20 bg-[#08090f] shadow-[0_0_20px_rgba(168,85,247,0.03)] p-6 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#151b2d] pb-4 justify-between flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
              <div>
                <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                  Bản Đồ Năng Lực AI & Xếp Hạng Việc Làm (Radar Chart)
                </h3>
                <span className="block text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                  Định hướng 8 trục chính xác theo nhân trắc học & kỹ năng
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
              <div className="space-y-2">
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-black">Nhóm Tương Thích Nhất</span>
                <h4 className="text-xs font-black text-[#f4c430] leading-relaxed uppercase tracking-wide">
                  {profile.mainCategory}
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Biểu đồ radar 8 trục: <strong>Catwalk, Pose dáng, MC, Livestream, Diễn xuất, Social content, Brand safety, Reliability</strong>.
                </p>
              </div>

              {/* SVG 8-axis Radar */}
              <div className="h-44 w-44 mx-auto my-4 shrink-0 rounded-xl border border-[#151b2d] bg-slate-950 p-2 shadow-inner flex items-center justify-center">
                <RadarChart
                  scores={profile.skillsScores}
                  fillColor="rgba(244,196,48,0.2)"
                  strokeColor="#f4c430"
                  strokeWidth={2}
                  labelFontSize={9}
                  labelFontWeight="black"
                />
              </div>

              {/* Legend description */}
              <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-[8px] text-slate-500 border-t border-white/5 pt-2 font-mono">
                <span>CW: Catwalk</span>
                <span>PS: Pose dáng</span>
                <span>MC: Dẫn chương trình</span>
                <span>LS: Livestream</span>
                <span>AC: Diễn xuất</span>
                <span>SC: Social content</span>
                <span>SF: Brand safety</span>
                <span>RL: Reliability</span>
              </div>
            </div>

            {/* 20 Recommended Roles Column */}
            <div className="md:col-span-7 space-y-3 flex flex-col justify-between">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-black text-left mb-2">Độ Tương Thích Với 20 Vị Trí Công Việc</span>

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
              </div>
            </div>
          </div>
        </div>

        {/* 5. SECTION C: INTERACTIVE AVAILABILITY CALENDAR */}
        <div className="lg:col-span-3 rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-4">
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
          <div className="col-span-1 rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 transition-all duration-300">
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-amber-400" /> Dịch Vụ Đồng Hành (VIP)
            </h3>
            <div className="space-y-5 mt-5">
              <div className="space-y-3.5 text-left">
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
          </div>
        )}

        {/* 7. SECTION F: REPUTATION REVIEWS */}
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


      </div>

      {/* Invite to Campaign Modal Dialog */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-start justify-between p-6 border-b border-[#151b2d]">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Thêm Vào Chiến Dịch</h3>
                <p className="text-[10px] text-slate-500 mt-1">Chọn chiến dịch tuyển dụng cho {talent?.name}</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-4.5 w-4.5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Chọn chiến dịch tuyển dụng</span>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60"
                >
                  <option value="">-- Chọn chiến dịch --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#151b2d] bg-[#050711]">
              <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 rounded-xl border border-[#151b2d] text-xs font-bold text-slate-400 hover:text-white cursor-pointer">Hủy</button>
              <button
                onClick={() => {
                  if (!selectedCampaignId) {
                    window.alert("Vui lòng chọn chiến dịch!");
                    return;
                  }
                  const campaign = campaigns.find(c => c.id === selectedCampaignId);
                  if (addedCampaigns.includes(selectedCampaignId)) {
                    window.alert(`Ứng viên đã được thêm vào chiến dịch ${campaign?.title} trước đó!`);
                    return;
                  }
                  setAddedCampaigns(prev => [...prev, selectedCampaignId]);
                  window.alert(`Đã thêm ${talent?.name} vào chiến dịch ${campaign?.title} thành công!`);
                  setShowInviteModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Xác nhận thêm
              </button>
            </div>
          </div>
        </div>
      )}

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

    </div>
  );
}
