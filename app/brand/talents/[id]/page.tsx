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
  Image,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
  BookOpen,
  Plus,
  X,
} from "lucide-react";
import { campaigns, findTalentById, savedTalentIds } from "@/lib/brand-mvp-data";
import { cn } from "@/lib/utils";
import RadarChart from "@/components/ui/RadarChart";
import { loadTalentProfile } from "@/lib/talent-api";

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
  { id: 15, title: "Sứ giả chiến dịch cộng đồng", desc: "Lan tỏa các giá trị nhân văn và dự án từ thiện", weights: { pageant: 0.8, runway: 0.1, kol: 0.1 } },
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

  useEffect(() => {
    let cancelled = false;

    if (params.id === "tal-1") {
      loadTalentProfile().then((parsed) => {
        if (cancelled || !parsed) return;

        setTalent({
          ...staticTalent,
          name: parsed.name || staticTalent?.name,
          avatar: parsed.avatar || staticTalent?.avatar,
          cover: parsed.cover || staticTalent?.cover,
          height: parsed.height !== undefined ? Number(parsed.height) : staticTalent?.height,
          weight: parsed.weight !== undefined ? Number(parsed.weight) : staticTalent?.weight,
          bust: parsed.bust !== undefined ? Number(parsed.bust) : staticTalent?.bust,
          waist: parsed.waist !== undefined ? Number(parsed.waist) : staticTalent?.waist,
          hips: parsed.hips !== undefined ? Number(parsed.hips) : staticTalent?.hips,
          gender: parsed.gender || staticTalent?.gender,
          district: parsed.location || staticTalent?.district,
          education: parsed.education || staticTalent?.education,
          languages: parsed.languages || staticTalent?.languages,
          skills: parsed.skills || staticTalent?.skills,
          rateCard: parsed.rateCard || staticTalent?.rateCard,
          lifestyleServices: parsed.lifestyleServices || staticTalent?.lifestyleServices,
          yearsOfExperience: parsed.experience !== undefined ? Number(parsed.experience) : staticTalent?.yearsOfExperience,
          verified: parsed.verifiedLevel === "Elite" || parsed.verifiedLevel === "Pro" || parsed.verifiedLevel === "Basic" || staticTalent?.verified,
          tier: parsed.tier || staticTalent?.tier,
        });
      });
    }

    return () => {
      cancelled = true;
    };
  }, [params.id, staticTalent]);

  const [addedCampaigns, setAddedCampaigns] = useState<string[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id ?? "");
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Lookbook photos metadata
  const lookbookPhotos = [
    {
      id: 1,
      label: "Ảnh 1",
      title: "Beauty Portrait",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
      photographer: "Lê Huy Studio",
      concept: "Classic High-Fashion",
      date: "20/05/2026",
      device: "Fujifilm GFX 100S"
    },
    {
      id: 2,
      label: "Ảnh 2",
      title: "Runway Pose",
      url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600",
      photographer: "Minh Trần Portfolio",
      concept: "Avant-Garde Runway",
      date: "22/05/2026",
      device: "Sony A7R V"
    },
    {
      id: 3,
      label: "Ảnh 3",
      title: "Close-up",
      url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600",
      photographer: "Kien Nguyen",
      concept: "Editorial Makeup Glow",
      date: "25/05/2026",
      device: "Hasselblad X2D"
    },
    {
      id: 4,
      label: "Ảnh 4",
      title: "Streetwear Style",
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600",
      photographer: "Alex Pham",
      concept: "Cyberpunk Neon Street",
      date: "28/05/2026",
      device: "Canon EOS R5"
    }
  ];

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

  if (!talent) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="rounded-2xl border border-white/5 bg-slate-950/30 p-8 text-center">
          <h1 className="text-xl font-black text-white">Không tìm thấy hồ sơ talent</h1>
          <button onClick={() => router.push("/brand/search")} className="mt-5 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white">
            Quay lại tìm kiếm
          </button>
        </div>
      </div>
    );
  }

  const getDayStatus = (dateStr: string) => {
    if (talent.availabilityDates.includes(dateStr)) {
      return "available";
    }
    const parts = dateStr.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return "maybe"; // Weekends
    }
    return "busy"; // Weekdays
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

  // Calculate mock values based on talent age for DOB
  const dobYear = 2026 - talent.age;
  const mockDob = `15/05/${dobYear}`;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* Cover Header */}
      <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#08090f] shadow-xl">
        <div className="relative h-56 w-full overflow-hidden bg-slate-950 md:h-72">
          <img src={talent.cover} alt={`${talent.name} cover`} className="h-full w-full object-cover opacity-65" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-black/75" />
          <button
            onClick={() => router.push("/brand/search")}
            className="absolute left-4 top-4 flex h-10 items-center rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs font-bold text-slate-200 backdrop-blur hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại tìm kiếm
          </button>
          <div className="absolute right-4 top-4 rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-amber-300">
            Brand view
          </div>
        </div>

        <div className="relative flex flex-col gap-5 px-6 pb-6 pt-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-5 md:flex-row md:items-end">
            <div className="-mt-20 h-32 w-32 shrink-0 rounded-2xl border-4 border-[#08090f] bg-slate-900 p-0.5 shadow-2xl">
              <img src={talent.avatar} alt={talent.name} className="h-full w-full rounded-xl object-cover" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-black tracking-wide text-white md:text-3xl">{talent.name}</h1>
                {talent.verified && <ShieldCheck className="h-6 w-6 text-amber-400" />}
                <span className="rounded bg-amber-400 px-2 py-1 text-[10px] font-black uppercase text-slate-950">Hạng {talent.tier}</span>
              </div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
                <MapPin className="h-4 w-4 text-slate-500" />
                {talent.district}, {talent.city} · {talent.type}
              </p>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-400">{talent.experience}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push(`/brand/messages?talentId=${talent.id}`)}
              className="flex h-10 items-center rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 px-4 text-xs font-black uppercase tracking-wider text-slate-950 transition active:scale-95 cursor-pointer"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Nhắn tin
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex h-10 items-center rounded-xl border border-[#C9A86A]/30 bg-[#C9A86A]/10 px-4 text-xs font-black uppercase tracking-wider text-[#C9A86A] transition active:scale-95 cursor-pointer hover:bg-[#C9A86A]/20"
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Thêm vào chiến dịch
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid Portfolio: Left (Physique / Info) + Right (Tabs content) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Physical details & rates */}
        <div className="space-y-6 md:space-y-8 lg:col-span-1">
          
          {/* Model Full-Body Photo Card */}
          <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-5 space-y-4">
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-amber-400" /> Ảnh Người Mẫu (Full-body)
            </h3>

            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-inner">
              <img
                src={talent.fullBodyImage || talent.avatar}
                alt="Model Full-body portrait"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090f] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div>
                  <span className="text-[8px] font-mono tracking-widest text-[#f4c430] font-bold uppercase">POLAROID BOOK</span>
                  <h4 className="text-xs font-black text-white mt-0.5">{talent.name.toUpperCase()}</h4>
                </div>
                <div className="text-[8px] font-mono bg-black/40 border border-white/10 px-2 py-0.5 rounded text-slate-300">
                  Ratio: 3:4
                </div>
              </div>
            </div>
          </div>

          {/* Physical Measurements Card */}
          <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-5">
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-slate-400" /> Chỉ Số Ngoại Hình
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-950 p-3.5 text-center border border-white/2">
                <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Chiều Cao</span>
                <span className="text-sm font-extrabold text-white mt-1 block">{talent.height} cm</span>
              </div>
              <div className="rounded-xl bg-slate-950 p-3.5 text-center border border-white/2">
                <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Cân Nặng</span>
                <span className="text-sm font-extrabold text-white mt-1 block">{talent.weight} kg</span>
              </div>
            </div>

            <div className="space-y-3.5 border-t border-[#151b2d] pt-4 text-left">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span className="font-medium text-slate-400">Giới tính</span>
                <span className="font-bold text-white">{talent.gender}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span className="font-medium text-slate-400">Ngày sinh (Dự kiến)</span>
                <span className="font-bold text-white font-mono">{mockDob}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300 border-t border-dashed border-[#151b2d]/50 pt-2">
                <span className="font-medium text-slate-400">Số đo Vòng 1</span>
                <span className="font-bold text-white font-mono">{talent.bust} cm</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span className="font-medium text-slate-400">Số đo Vòng 2</span>
                <span className="font-bold text-white font-mono">{talent.waist} cm</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span className="font-medium text-slate-400">Số đo Vòng 3</span>
                <span className="font-bold text-white font-mono">{talent.hips} cm</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300 border-t border-dashed border-[#151b2d]/50 pt-2">
                <span className="font-medium text-slate-400">Màu da</span>
                <span className="font-bold text-white">{talent.skinTone || "Sáng"}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span className="font-medium text-slate-400">Màu tóc</span>
                <span className="font-bold text-white">{talent.hairColor}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span className="font-medium text-slate-400">Kinh nghiệm</span>
                <span className="font-bold text-white">{talent.yearsOfExperience} năm</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span className="font-medium text-slate-400">Tình trạng hôn nhân</span>
                <span className="font-bold text-white">Độc thân</span>
              </div>
            </div>
          </div>

          {/* Education, Languages & Skills */}
          <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-5">
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
              <GraduationCap className="h-4.5 w-4.5 text-slate-400" /> Học Vấn & Kỹ Năng
            </h3>

            <div className="space-y-4 text-xs text-slate-300 text-left">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                  <GraduationCap className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="block font-bold text-white">Học vấn</span>
                  <span className="block text-[10px] text-slate-400 mt-1">{talent.education}</span>
                </div>
              </div>

              <div className="flex gap-3 border-t border-[#151b2d] pt-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                  <BookOpen className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="block font-bold text-white">Ngoại ngữ</span>
                  <span className="block text-[10px] text-slate-400 mt-1 leading-normal">
                    {talent.languages.join(", ")}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 border-t border-[#151b2d] pt-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="block font-bold text-white">Kỹ năng</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {talent.skills.map((skill: string, sIdx: number) => (
                      <span key={sIdx} className="bg-white/5 border border-white/10 text-slate-300 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Card Table */}
          <div className="rounded-2xl border border-amber-500/10 bg-[#08090f] p-6 space-y-4">
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
              <DollarSign className="h-4.5 w-4.5 text-amber-400" /> Bảng Giá Tham Khảo
            </h3>
            <div className="space-y-3">
              {Object.entries(talent.rateCard || {}).map(([key, value]: any) => (
                <div key={key} className="flex justify-between py-1.5 text-xs border-b border-[#151b2d]/50 items-center">
                  <span className="font-medium text-slate-400">{key}</span>
                  <span className="font-extrabold text-amber-400 font-mono">từ {formatNumber(value)}đ</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lifestyle Co-Space Companion Services Card */}
          {talent.lifestyleServices && talent.lifestyleServices.some((s: any) => s.enabled) && (
            <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-5">
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-[#151b2d] pb-3 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-amber-400" /> Dịch Vụ Đồng Hành VIP (Lifestyle)
              </h3>
              <div className="space-y-3.5">
                {talent.lifestyleServices.filter((s: any) => s.enabled).map((service: any) => {
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
                          {formatNumber(service.rate)}đ/{service.unit}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">{service.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Safety Guarantees Area */}
              <div className="border-t border-[#151b2d] pt-4 space-y-3">
                <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider text-left">🔒 Cam Kết Bảo Mật & An Toàn Giao Dịch</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-slate-950/80 p-2 text-center border border-white/2">
                    <span className="block text-[14px] mb-1">✍️</span>
                    <span className="block text-[8px] font-black text-slate-300 uppercase tracking-wide">Smart Contract</span>
                    <span className="block text-[6.5px] text-slate-500 mt-0.5 font-medium leading-none">Ký số lịch trình</span>
                  </div>
                  <div className="rounded-lg bg-slate-950/80 p-2 text-center border border-white/2">
                    <span className="block text-[14px] mb-1">📍</span>
                    <span className="block text-[8px] font-black text-slate-300 uppercase tracking-wide">Real-time GPS</span>
                    <span className="block text-[6.5px] text-slate-500 mt-0.5 font-medium leading-none">Check-in điểm hẹn</span>
                  </div>
                  <div className="rounded-lg bg-slate-950/80 p-2 text-center border border-white/2">
                    <span className="block text-[14px] mb-1">💰</span>
                    <span className="block text-[8px] font-black text-slate-300 uppercase tracking-wide">Escrow Payment</span>
                    <span className="block text-[6.5px] text-slate-500 mt-0.5 font-medium leading-none">Đặt cọc hệ thống</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Performance, Lookbook, Calendar, Charts, Reviews */}
        <div className="space-y-6 md:space-y-8 lg:col-span-2">
          
          {/* SECTION A: DISPLAY PERFORMANCE ANALYTICS */}
          <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-4">
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#151b2d] pb-3">
              <TrendingUp className="h-4.5 w-4.5 text-cyan-400" /> Báo Cáo Hiệu Quả Hiển Thị
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-950 p-4 border border-white/2">
                <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Followers</span>
                <h4 className="text-base font-extrabold text-white mt-1.5">{talent.followers}</h4>
                <span className="text-[8px] text-slate-400 block mt-1">Nền tảng chính: {talent.platforms[0]}</span>
              </div>
              <div className="rounded-xl bg-slate-950 p-4 border border-white/2">
                <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Đã hoàn thành</span>
                <h4 className="text-base font-extrabold text-white mt-1.5">{talent.completedJobs} job</h4>
                <span className="text-[8px] text-emerald-400 font-bold block mt-1">Độ uy tín cao</span>
              </div>
              <div className="rounded-xl bg-slate-950 p-4 border border-white/2">
                <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Tỷ lệ tương tác</span>
                <h4 className="text-base font-extrabold text-cyan-400 mt-1.5">{talent.engagementRate}%</h4>
                <span className="text-[8px] text-cyan-400 font-bold block mt-1">Hạng xuất sắc A+</span>
              </div>
              <div className="rounded-xl bg-slate-950 p-4 border border-white/2">
                <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Tỷ lệ phản hồi</span>
                <h4 className="text-base font-extrabold text-white mt-1.5">{talent.responseRate}%</h4>
                <span className="text-[8px] text-slate-400 block mt-1">Thời gian: &lt; 30 phút</span>
              </div>
            </div>
          </div>

          {/* SECTION B: BRAND VIEW SPECIFIC METRICS */}
          <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-4">
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#151b2d] pb-3">
              <Wallet className="h-4.5 w-4.5 text-emerald-400" /> Chỉ Số Đánh Giá & Sự Uy Tín
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Reliability */}
              <div className="rounded-xl bg-slate-950 p-4 border border-emerald-500/20 relative overflow-hidden bg-gradient-to-br from-emerald-950/10 to-transparent">
                <div className="absolute top-2 right-2 opacity-15">
                  <ShieldCheck className="h-10 w-10 text-emerald-400" />
                </div>
                <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Chỉ Số Tin Cậy (Reliability)</span>
                <h4 className="text-xl font-black text-emerald-400 mt-2 font-mono">{talent.reliability || 96}%</h4>
                <span className="text-[8.5px] text-emerald-500 block mt-1.5 font-bold">● Top talent chuyên nghiệp</span>
              </div>

              {/* Completed Campaigns */}
              <div className="rounded-xl bg-slate-950 p-4 border border-purple-500/20 relative overflow-hidden bg-gradient-to-br from-purple-950/10 to-transparent">
                <div className="absolute top-2 right-2 opacity-15">
                  <Briefcase className="h-10 w-10 text-purple-400" />
                </div>
                <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Đã Tham Gia Chiến Dịch</span>
                <h4 className="text-xl font-black text-purple-400 mt-2 font-mono">{talent.completedJobs} Brand Jobs</h4>
                <span className="text-[8.5px] text-purple-400 block mt-1.5 font-bold">100% đánh giá 5 sao từ Brand</span>
              </div>

              {/* Average Rating */}
              <div className="rounded-xl bg-slate-950 p-4 border border-amber-500/20 relative overflow-hidden bg-gradient-to-br from-amber-950/10 to-transparent">
                <div className="absolute top-2 right-2 opacity-15">
                  <Star className="h-10 w-10 text-amber-400" />
                </div>
                <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Đánh Giá Trung Bình</span>
                <h4 className="text-xl font-black text-amber-400 mt-2 font-mono">{talent.rating} ★</h4>
                <span className="text-[8.5px] text-amber-400 block mt-1.5 font-bold">🔒 Elite Verified Account</span>
              </div>
            </div>
          </div>

          {/* SECTION C: INTERACTIVE AVAILABILITY CALENDAR */}
          <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#151b2d] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-slate-400" /> 
                <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                  Lịch Rảnh Của Talent (Tháng {currentMonth < 10 ? `0${currentMonth}` : currentMonth}/{currentYear})
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
              <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-slate-500 font-black uppercase">
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
                        "flex flex-col items-center justify-between p-1.5 h-12 rounded-xl border text-center transition-all",
                        status === "available" && "border-emerald-400/40 bg-emerald-400/5 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.1)]",
                        status === "maybe" && "border-yellow-500/30 bg-yellow-500/5 text-yellow-300 shadow-[0_0_8px_rgba(234,179,8,0.1)]",
                        status === "busy" && "border-red-500/40 bg-red-500/5 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.1)]"
                      )}
                    >
                      <span className="text-[9px] font-mono font-bold block">{dayStr}</span>
                      <span className="text-[6.5px] font-black uppercase tracking-wider scale-90">
                        {status === "available" ? "Rảnh" : status === "maybe" ? "Chưa có lịch" : "Bận"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[9.5px] text-slate-400 border-t border-white/5 pt-3 mt-1">
                <span>🟢 Rảnh</span>
                <span>🔴 Bận</span>
                <span>🟡 Chưa có lịch (Cuối tuần)</span>
              </div>
            </div>
          </div>

          {/* SECTION D: LOOKBOOK PHOTOS & VIDEOS DISPLAY */}
          <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
            <div className="border-b border-[#151b2d] pb-3 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
                  <Image className="h-4.5 w-4.5 text-[#f4c430]" /> Bộ Ảnh Lookbook & Video
                </h3>
                <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                  Hiển thị bộ ảnh Lookbook nghệ thuật và các video giới thiệu, trình diễn thực tế của Talent
                </span>
              </div>
            </div>

            {/* Sub-grid 1: 4 Lookbook Photos */}
            <div className="space-y-3">
              <span className="block text-[9px] text-[#f4c430] font-black uppercase tracking-wider">
                📸 Bộ Ảnh Lookbook Nghệ Thuật (4 Ảnh)
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lookbookPhotos.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-md"
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85" />

                    {/* Labeled overlay info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
                      <span className="inline-block bg-[#f4c430] text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {img.label}
                      </span>
                      <h4 className="text-[10px] font-black text-white">{img.title}</h4>
                      <div className="text-[7.5px] text-slate-400 space-y-0.5 leading-normal opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p>📷 {img.photographer}</p>
                        <p>👗 Concept: {img.concept}</p>
                        <p>⚙️ {img.device}</p>
                        <p>📅 Ngày chụp: {img.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-grid 2: 3 Videos (Intro, Catwalk, MC/Live Demo) */}
            <div className="space-y-3 border-t border-[#151b2d] pt-4">
              <span className="block text-[9px] text-cyan-400 font-black uppercase tracking-wider">
                🎥 Video Giới Thiệu & Demo Thực Tế (3 Videos)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Video 1: Intro */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-md flex flex-col justify-between">
                  <div className="h-full w-full relative">
                    <video
                      src="https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-smiling-at-the-camera-40898-large.mp4"
                      className="h-full w-full object-cover"
                      playsInline
                      loop
                      muted
                      autoPlay
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3.5 space-y-1">
                    <span className="inline-block bg-cyan-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                      INTRO VIDEO
                    </span>
                    <h4 className="text-[10px] font-black text-white">Video Giới Thiệu Bản Thân</h4>
                    <p className="text-[7.5px] text-slate-400">Độ phân giải: 1080p • Vertical</p>
                  </div>
                </div>

                {/* Video 2: Catwalk */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-md flex flex-col justify-between">
                  <div className="h-full w-full relative">
                    <video
                      src="https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-on-a-runway-show-39871-large.mp4"
                      className="h-full w-full object-cover"
                      playsInline
                      loop
                      muted
                      autoPlay
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3.5 space-y-1">
                    <span className="inline-block bg-cyan-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                      CATWALK POLAROID
                    </span>
                    <h4 className="text-[10px] font-black text-white">Video Trình Diễn Sàn Runway</h4>
                    <p className="text-[7.5px] text-slate-400">Độ phân giải: 1080p • Vertical</p>
                  </div>
                </div>

                {/* Video 3: MC/Livestream */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-md flex flex-col justify-between">
                  <div className="h-full w-full relative">
                    <video
                      src="https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-to-camera-in-interview-42358-large.mp4"
                      className="h-full w-full object-cover"
                      playsInline
                      loop
                      muted
                      autoPlay
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3.5 space-y-1">
                    <span className="inline-block bg-cyan-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                      DEMO MC / LIVE
                    </span>
                    <h4 className="text-[10px] font-black text-white">Dẫn Chương Trình / Live Bán Hàng</h4>
                    <p className="text-[7.5px] text-slate-400">Độ phân giải: 1080p • Vertical</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* SECTION E: AI SURVEY & RADAR CHART & 20 CAREER ALIGNMENTS */}
          <div className="rounded-2xl border border-purple-500/20 bg-[#08090f] shadow-[0_0_20px_rgba(168,85,247,0.03)] p-6 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-[#151b2d] pb-4 justify-between flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                <div>
                  <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                    Bản Đồ Năng Lực AI & Xếp Hạng Việc Làm (Radar Chart)
                  </h3>
                  <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                    Định hướng 8 trục chính xác theo nhân trắc học & kỹ năng
                  </span>
                </div>
              </div>
              <div className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-wide">
                AI Powered
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Radar Chart Summary Column */}
              <div className="md:col-span-5 flex flex-col justify-between p-4 rounded-xl border border-white/2 bg-slate-950/40">
                <div className="space-y-2">
                  <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black">Nhóm Tương Thích Nhất</span>
                  <h4 className="text-xs font-black text-amber-300 leading-relaxed uppercase tracking-wide">
                    KOL / Người mẫu ảnh / Giải trí thế hệ mới
                  </h4>
                  <p className="text-[9.5px] text-slate-400 leading-normal">
                    Biểu đồ radar 8 trục: <strong>Catwalk, Pose dáng, MC, Livestream, Diễn xuất, Social content, Brand safety, Reliability</strong>.
                  </p>
                </div>

                {/* SVG 8-axis Radar */}
                <div className="h-44 w-44 mx-auto my-4 shrink-0 rounded-xl border border-[#151b2d] bg-slate-950 p-2 shadow-inner flex items-center justify-center">
                  <RadarChart
                    scores={(talent as any).skillsScores || {
                      catwalk: 85,
                      pose: 90,
                      mc: 75,
                      livestream: 80,
                      acting: 70,
                      social: 95,
                      safety: 90,
                      reliability: 96
                    }}
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
                  <span>MC: Dẫn CT</span>
                  <span>LS: Live</span>
                  <span>AC: Diễn xuất</span>
                  <span>SC: Social</span>
                  <span>SF: Safety</span>
                  <span>RL: Reliable</span>
                </div>
              </div>

              {/* 20 Recommended Roles Column */}
              <div className="md:col-span-7 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black text-left mb-2">Độ Tương Thích Với 20 Vị Trí Công Việc</span>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {(() => {
                      const scores = { pageant: 50, runway: 45, kol: 95 };
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
          </div>

          {/* SECTION F: REPUTATION REVIEWS */}
          <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#151b2d] pb-3">
              <ShieldCheck className="h-4.5 w-4.5 text-cyan-400" /> Đánh Giá Từ Đối Tác & Độ Uy Tín
            </h3>
            <div className="space-y-4">
              {[
                { brand: "L'Oréal Paris Vietnam", rating: 5, date: "15/05/2026", comment: `${talent.name} làm việc vô cùng chuyên nghiệp, đúng giờ và hoàn thành tốt KPI chiến dịch truyền thông của nhãn hàng. Rất mong tiếp tục hợp tác.` },
                { brand: "Gucci Beauty Event", rating: 5, date: "29/04/2026", comment: "Thần thái xuất sắc, hình ảnh high-fashion phù hợp tiêu chuẩn quốc tế. Cảm ơn vì sự hỗ trợ nhiệt tình." },
                { brand: "Vogue Vietnam Editorial", rating: 5, date: "12/04/2026", comment: "Thái độ làm việc nghiêm túc, tạo dáng xuất sắc và có kiến thức chuyên môn cao. Rất khuyên dùng." }
              ].map((rev, idx) => (
                <div key={idx} className="rounded-xl bg-slate-950 p-4 border border-white/2 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-white text-xs block">{rev.brand}</span>
                      <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">Ngày hợp tác: {rev.date}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, sIdx) => (
                        <Star key={sIdx} className="h-3 w-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION G: ADD TO CAMPAIGN FOR BRANDS */}
          <div className="rounded-2xl border border-[#C9A86A]/20 bg-[#C9A86A]/5 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Briefcase className="mt-0.5 h-5 w-5 shrink-0 text-amber-300 animate-pulse" />
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">Thêm Vào Chiến Dịch Tuyển Dụng</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Chọn một chiến dịch tuyển dụng đang hoạt động của bạn để thêm ứng viên này vào danh sách ứng tuyển/shortlist.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
              <select value={selectedCampaignId} onChange={(event) => setSelectedCampaignId(event.target.value)} className="h-11 rounded-xl border border-white/5 bg-slate-950/60 px-3 text-xs text-white outline-none focus:border-amber-400/60">
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
                ))}
              </select>
              <button
                onClick={handleAddToCampaign}
                className={cn(
                  "flex h-11 items-center justify-center rounded-xl px-5 text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer",
                  addedCampaigns.includes(selectedCampaignId) 
                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300" 
                    : "bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 shadow-[0_0_12px_rgba(201,168,106,0.15)]"
                )}
              >
                <Plus className="mr-2 h-4 w-4" />
                {addedCampaigns.includes(selectedCampaignId) ? "Đã thêm vào chiến dịch" : "Thêm vào chiến dịch"}
              </button>
            </div>
          </div>

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

    </div>
  );
}
