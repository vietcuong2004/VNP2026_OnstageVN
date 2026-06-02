"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  ArrowRight,
  BookmarkCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Search,
  Send,
  UserRoundCheck,
  Wallet,
  Eye,
  Star,
  X,
  Heart,
  MapPin,
  MessageSquare
} from "lucide-react";
import { campaigns, contactRequests, partnerProfile, savedTalentIds, talents } from "@/lib/brand-mvp-data";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Chiến dịch đang hoạt động",
    value: "3 chiến dịch",
    hint: "+1 so với tháng trước",
    icon: Briefcase,
    color: "text-amber-300 border-amber-500/25 bg-amber-500/10",
  },
  {
    label: "Ứng viên nhận được",
    value: "25 ứng viên",
    hint: "+12% tăng trưởng",
    icon: BookmarkCheck,
    color: "text-cyan-300 border-cyan-500/25 bg-cyan-500/10",
  },
  {
    label: "Đã tuyển thành công",
    value: "10 xác nhận",
    hint: "KOL/Model/MC đã chốt",
    icon: UserRoundCheck,
    color: "text-emerald-300 border-emerald-500/25 bg-emerald-500/10",
  },
  {
    label: "Ngân sách sử dụng",
    value: "35.5M / 100M",
    hint: "Còn lại 64.5M trong quỹ",
    icon: Wallet,
    color: "text-[#C9A86A] border-[#C9A86A]/25 bg-[#C9A86A]/10",
  },
];

const nextActions = [
  {
    title: "Hoàn thiện hồ sơ đối tác",
    description: "Bổ sung ngành hàng, người phụ trách và kênh liên hệ để sẵn sàng gửi yêu cầu.",
    href: "/brand/settings",
    icon: UserRoundCheck,
  },
  {
    title: "Tìm talent phù hợp",
    description: "Lọc theo vai trò, thành phố, tier, chiều cao và trạng thái xác minh.",
    href: "/brand/search",
    icon: Search,
  },
  {
    title: "Tạo campaign mới",
    description: "Ghi nhận brief tuyển dụng để quản lý shortlist theo từng nhu cầu.",
    href: "/brand/campaigns",
    icon: Briefcase,
  },
];

const RECOMMENDED_TALENTS = [
  {
    id: "tal-1",
    name: "Nguyễn Mai Anh",
    type: "KOL",
    city: "Hà Nội",
    followers: "120K",
    matchScore: 98,
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&h=500&q=80",
    verified: true,
  },
  {
    id: "tal-2",
    name: "Khánh Linh",
    type: "Model",
    city: "TP. Hồ Chí Minh",
    followers: "85K",
    matchScore: 95,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&h=500&q=80",
    verified: true,
  },
  {
    id: "tal-3",
    name: "Lê Ngọc Hân",
    type: "MC",
    city: "TP. Hồ Chí Minh",
    followers: "240K",
    matchScore: 92,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&h=500&q=80",
    verified: true,
  },
  {
    id: "tal-4",
    name: "Trần Thu Thảo",
    type: "PG",
    city: "Hà Nội",
    followers: "36K",
    matchScore: 86,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&h=500&q=80",
    verified: false,
  },
  {
    id: "tal-5",
    name: "Phạm Minh Anh",
    type: "Dancer",
    city: "Đà Nẵng",
    followers: "62K",
    matchScore: 84,
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=500&h=500&q=80",
    verified: true,
  },
  {
    id: "tal-6",
    name: "Lê Mỹ Linh",
    type: "KOL",
    city: "TP. Hồ Chí Minh",
    followers: "150K",
    matchScore: 97,
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=500&h=500&q=80",
    verified: true,
  },
  {
    id: "tal-7",
    name: "Hoàng Bích Phương",
    type: "Model",
    city: "Hà Nội",
    followers: "110K",
    matchScore: 94,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&h=500&q=80",
    verified: true,
  },
  {
    id: "tal-8",
    name: "Vũ Thùy Chi",
    type: "MC",
    city: "Hải Phòng",
    followers: "95K",
    matchScore: 91,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&h=500&q=80",
    verified: true,
  },
  {
    id: "tal-9",
    name: "Đặng Thu Thủy",
    type: "PG",
    city: "TP. Hồ Chí Minh",
    followers: "45K",
    matchScore: 89,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&h=500&q=80",
    verified: false,
  },
  {
    id: "tal-10",
    name: "Nguyễn Hoàng Yến",
    type: "Dancer",
    city: "Cần Thơ",
    followers: "70K",
    matchScore: 88,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=500&h=500&q=80",
    verified: true,
  }
];

export default function BrandDashboard() {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<string[]>(savedTalentIds);

  const [campaignsList] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("onstagevn_campaigns");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return campaigns;
  });

  const openCampaigns = useMemo(() => {
    return campaignsList.filter((c) => c.status === "published");
  }, [campaignsList]);

  const toggleSaved = (id: string) => {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      {/* Header */}
      <section className="flex flex-col gap-5 border-b border-[#2B313D] pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md border border-[#C9A86A]/30 bg-[#C9A86A]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
              Onstage VN - Model Management System
            </span>
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl uppercase">
            CHÀO MỪNG QUAY LẠI, <span className="bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 bg-clip-text text-transparent">L'ORÉAL VIETNAM</span>!
          </h1>
          <p className="mt-2 max-w-2xl text-xs font-semibold leading-relaxed text-slate-400 uppercase tracking-wide">
            Chào mừng bạn đến với hệ thống quản trị, kết nối và vận hành chiến dịch tuyển chọn tài năng thông minh.
          </p>
        </div>

        <button
          onClick={() => router.push("/brand/search")}
          className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 px-5 text-xs font-black text-slate-950 shadow-[0_4px_20px_rgba(201,168,106,0.18)] transition hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
        >
          <Search className="mr-2 h-4 w-4 shrink-0" />
          Tìm Talent Ngay
        </button>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.28)]">
              <div className="mb-4 flex items-start justify-between gap-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border shrink-0", stat.color)}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="text-2xl font-black tracking-tight text-white">{stat.value}</div>
              <div className="mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.hint}</div>
            </div>
          );
        })}
      </section>

      {/* Funnel & Interview Calendar */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Funnel - Left (8/12) */}
        <div className="lg:col-span-8 rounded-2xl border border-[#2B313D] bg-[#171A21] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.28)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A]">Phễu Tuyển Dụng Campaign</h3>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tổng cộng: 25 ứng viên</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Ứng tuyển", count: 25, percentage: "100%", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
                { label: "Đã chọn lọc", count: 12, percentage: "48%", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
                { label: "Phỏng vấn", count: 8, percentage: "32%", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                { label: "Đã duyệt", count: 10, percentage: "40%", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
                { label: "Đã xác nhận", count: 10, percentage: "40%", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center p-3 rounded-xl border border-white/5 bg-[#0F1115]/50 relative group">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider text-center">{step.label}</span>
                  <span className="text-2xl font-black text-white mt-2 font-mono">{step.count}</span>
                  <span className="text-[8px] font-bold text-slate-400 mt-1">Tỷ lệ: {step.percentage}</span>
                  <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-[#C9A86A]" style={{ width: step.percentage }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-white/5 pt-4 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>Hiệu quả chuyển đổi trung bình: 40%</span>
            <button onClick={() => router.push("/brand/campaigns")} className="text-[#C9A86A] hover:underline flex items-center gap-1">
              Quản lý ATS Kanban &rarr;
            </button>
          </div>
        </div>

        {/* Interview Calendar - Right (4/12) */}
        <div className="lg:col-span-4 rounded-2xl border border-[#2B313D] bg-[#171A21] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.28)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A]">Lịch Phỏng Vấn</h3>
              <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">2 sự kiện</span>
            </div>

            <div className="space-y-3">
              {[
                { date: "15/06", day: "T2", time: "14:00", talent: "Nguyễn Mai Anh", role: "KOL", type: "Livestream" },
                { date: "17/06", day: "T4", time: "09:30", talent: "Lê Ngọc Hân", role: "MC", type: "Talkshow" }
              ].map((meeting, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-[#0F1115]/50">
                  <div className="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-[#C9A86A] shrink-0 font-mono">
                    <span className="text-[9px] font-black leading-none">{meeting.date}</span>
                    <span className="text-[7px] font-semibold uppercase leading-none mt-1">{meeting.day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-extrabold text-white truncate">{meeting.talent}</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">{meeting.role} · {meeting.type} · {meeting.time}</p>
                  </div>
                  <span className="text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    Đã hẹn
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => router.push("/brand/search")} className="w-full text-center py-2 text-[9px] font-black uppercase tracking-wider border border-white/5 bg-slate-950/20 rounded-xl hover:bg-white/5 text-slate-400 mt-4">
            Xem toàn bộ lịch trình
          </button>
        </div>
      </section>

      {/* Main Grid: Recommended Talents & Newest Applications */}
      <section className="space-y-8">

        {/* Recommended Talents Slider/Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A]">KOL/Model Được Đề Xuất</h3>
              <span className="text-[9px] font-bold text-slate-500 bg-white/5 border border-white/5 rounded-lg px-2 py-0.5 uppercase tracking-wider">
                Top 10 Phù Hợp AI
              </span>
            </div>
            <button onClick={() => router.push("/brand/search")} className="text-[10px] font-black uppercase text-[#C9A86A] hover:underline">
              Khám phá tất cả &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {RECOMMENDED_TALENTS.map((talent) => {
              const fullTalent = talents.find(t => t.id === talent.id);
              const tier = fullTalent?.tier ?? (talent.matchScore >= 95 ? "S" : talent.matchScore >= 90 ? "A" : talent.matchScore >= 85 ? "B" : "C");
              const district = fullTalent?.district ?? "Quận 1";
              const city = fullTalent?.city ?? talent.city;
              const type = fullTalent?.type ?? talent.type;
              const age = fullTalent?.age ?? 23;
              const height = fullTalent?.height ?? 170;
              const weight = fullTalent?.weight ?? 50;
              const followers = fullTalent?.followers ?? talent.followers;
              const engagementRate = fullTalent?.engagementRate ?? 4.5;
              const experience = fullTalent?.experience ?? "Đã có kinh nghiệm làm việc với nhiều nhãn hàng lớn nhỏ.";
              const verified = fullTalent?.verified ?? talent.verified;
              const status = talent.id === "tal-1" || talent.id === "tal-2" ? "available" : talent.id === "tal-3" ? "busy" : "maybe";
              const isSaved = savedIds.includes(talent.id);

              return (
                <article key={talent.id} className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-3.5 shadow-lg hover:border-[#C9A86A]/30 transition-all duration-300 group flex flex-col justify-between min-w-0">
                  <div>
                    {/* Image Top Area */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border border-white/5 mb-3.5">
                      <img src={talent.avatar} alt={talent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                      {/* Overlay top badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                        <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[8.5px] font-black uppercase text-slate-950 shadow-md">
                          Hạng {tier}
                        </span>
                      </div>

                      {/* Floating Wishlist Heart */}
                      <button
                        onClick={() => toggleSaved(talent.id)}
                        className={cn(
                          "absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full border shadow-lg backdrop-blur-sm transition active:scale-90 cursor-pointer",
                          isSaved
                            ? "border-red-500 bg-red-500 text-white"
                            : "border-white/10 bg-[#0F1115]/60 text-slate-300 hover:text-white"
                        )}
                        title={isSaved ? "Bỏ lưu" : "Lưu vào shortlist"}
                      >
                        <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
                      </button>

                      {/* Floating calendar status at bottom of image */}
                      <div className="absolute bottom-2 left-2">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded bg-[#0F1115]/80 border backdrop-blur-sm px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white",
                          status === "available" && "border-emerald-500/30 text-emerald-400",
                          status === "busy" && "border-red-500/30 text-red-400",
                          status === "maybe" && "border-yellow-500/30 text-yellow-400"
                        )}>
                          <span className={cn(
                            "h-1 w-1 rounded-full",
                            status === "available" && "bg-emerald-400",
                            status === "busy" && "bg-red-400",
                            status === "maybe" && "bg-yellow-400"
                          )} />
                          {status === "available" ? "Rảnh" : status === "busy" ? "Bận" : "Chưa có lịch"}
                        </span>
                      </div>
                    </div>

                    {/* Header details */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="text-xs font-black text-white truncate flex-1">{talent.name}</h3>
                        {verified && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                      </div>

                      <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{district}, {city}</span>
                      </div>
                    </div>

                    {/* Info badges row */}
                    <div className="my-2.5 flex flex-wrap gap-1">
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{type}</span>
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{age} tuổi</span>
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{height}cm</span>
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">{weight}kg</span>
                    </div>

                    {/* Social stats row */}
                    <div className="grid grid-cols-2 gap-2 bg-[#0F1115]/50 border border-white/5 rounded-xl p-2 text-center text-[10px] my-3">
                      <div>
                        <span className="block text-[7px] font-bold uppercase text-slate-500 tracking-wider">Followers</span>
                        <span className="font-mono font-black text-amber-300 mt-0.5 block">{followers}</span>
                      </div>
                      <div className="border-l border-white/5">
                        <span className="block text-[7px] font-bold uppercase text-slate-500 tracking-wider">Engagement</span>
                        <span className="font-mono font-black text-cyan-300 mt-0.5 block">{engagementRate}%</span>
                      </div>
                    </div>

                    {/* Bio brief */}
                    <p className="line-clamp-2 text-[10px] leading-relaxed text-slate-400 mt-2 min-h-7">{experience}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3.5 border-t border-white/5 flex gap-2">
                    <button
                      onClick={() => router.push(`/brand/talents/${talent.id}`)}
                      className="flex h-10 px-4 items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white transition active:scale-90 cursor-pointer text-[10px] font-black uppercase tracking-wider"
                      title="Xem hồ sơ chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Xem</span>
                    </button>
                    <button
                      onClick={() => router.push(`/brand/messages?talentId=${talent.id}`)}
                      className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 font-black text-[10px] uppercase tracking-wider transition active:scale-95 cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Nhắn tin
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between mb-5 border-b border-[#2B313D] pb-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A]">Chiến Dịch Đang Hoạt Động (Đang Mở)</h3>
            <button onClick={() => router.push("/brand/campaigns")} className="text-[10px] font-black uppercase text-[#C9A86A] hover:underline">
              Xem tất cả &rarr;
            </button>
          </div>
          
          {openCampaigns.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-10 text-center">
              <Briefcase className="mx-auto mb-3 h-8 w-8 text-slate-600" />
              <h3 className="text-sm font-black text-white">Chưa có chiến dịch nào đang hoạt động</h3>
              <p className="mt-2 text-xs text-slate-500">Hãy tạo chiến dịch mới hoặc xuất bản chiến dịch nháp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {openCampaigns.map((campaign) => (
                <article key={campaign.id} className="flex flex-col justify-between rounded-2xl border border-[#2B313D] bg-[#171A21] p-5 shadow-md hover:border-[#C9A86A]/30 transition-all duration-300 group">
                  <div>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-400">{campaign.jobType}</span>
                      <span className="rounded bg-emerald-500/10 text-emerald-350 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase">
                        Đang mở
                      </span>
                    </div>
                    <h3 className="line-clamp-1 text-base font-black text-white group-hover:text-[#C9A86A] transition-colors">{campaign.title}</h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-450">{campaign.description}</p>
                  </div>

                  <div className="mt-5 border-t border-white/5 pt-4">
                    <div className="mb-4 grid grid-cols-4 gap-2 text-center text-xs">
                      <div>
                        <span className="block text-[8px] font-bold uppercase text-slate-500">Views</span>
                        <span className="font-mono font-bold text-white mt-0.5 block">{campaign.views}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold uppercase text-slate-500">Ứng viên</span>
                        <span className="font-mono font-bold text-white mt-0.5 block">{campaign.applicants?.length ?? 0}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold uppercase text-slate-500">Shortlist</span>
                        <span className="font-mono font-bold text-amber-300 mt-0.5 block">{campaign.shortlistedTalentIds?.length ?? 0}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold uppercase text-slate-500">Liên hệ</span>
                        <span className="font-mono font-bold text-emerald-300 mt-0.5 block">{campaign.contactRequests ?? 0}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
                      className="flex h-10 w-full items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-wider text-white hover:bg-white/10 transition active:scale-95 cursor-pointer"
                    >
                      Xem ATS & brief &rarr;
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* Suggested Actions Section */}
      <section className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A] mb-5">Hành Động Khuyên Dùng</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {nextActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={() => router.push(action.href)}
                className="group rounded-2xl border border-white/5 bg-slate-950/30 p-5 text-left transition hover:border-[#C9A86A]/30 hover:bg-[#C9A86A]/[0.02] cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#C9A86A]/20 bg-[#C9A86A]/10 text-[#C9A86A]">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-sm font-black text-white">{action.title}</h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{action.description}</p>
                </div>
                <div className="mt-4 flex items-center text-[10px] font-black uppercase tracking-widest text-[#C9A86A] group-hover:underline">
                  Mở màn hình <ArrowRight className="ml-1.5 h-3 w-3 transition group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

    </div>
  );
}
