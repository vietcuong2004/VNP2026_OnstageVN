"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Globe,
  X,
  Plus,
  Trophy,
  Users,
  Calendar,
  MapPin,
  MoreVertical,
  Pencil,
  Lock,
  Trash2,
  ChevronRight,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  StepId,
  StepInfo,
  Phase,
  Judge,
  Candidate,
  Sponsor,
  Partner,
  ConditionItem,
  DocumentItem,
  GeneralInfoState,
  TimelineDataState,
  RegistrationDataState,
  PublicContentState,
  SponsorsDataState
} from "./types";
import FormCreateCompetition from "./FormCreateCompetition";
import PreviewCompetition from "./PreviewCompetition";

export type CompetitionItem = {
  id: string;
  name: string;
  season: string;
  category: string;
  status: "published" | "draft" | "closed";
  candidatesCount: number;
  views: number;
  startDate: string;
  deadline: string;
  scope: string;
  banner: string;
  phasesCount: number;
};

const INITIAL_COMPETITIONS: CompetitionItem[] = [
  {
    id: "comp_1",
    name: "Hoa hậu Du lịch Việt Nam 2026",
    season: "Mùa 3 - 2026",
    category: "Hoa hậu",
    status: "published",
    candidatesCount: 154,
    views: 3420,
    startDate: "01/03/2026",
    deadline: "10/04/2026",
    scope: "Toàn quốc",
    banner: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
    phasesCount: 4
  },
  {
    id: "comp_2",
    name: "Ngôi sao Âm nhạc Onstage 2026",
    season: "Mùa 1",
    category: "Âm nhạc",
    status: "published",
    candidatesCount: 88,
    views: 1850,
    startDate: "15/02/2026",
    deadline: "20/03/2026",
    scope: "Toàn quốc",
    banner: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
    phasesCount: 3
  },
  {
    id: "comp_3",
    name: "Hoa khôi Học đường 2026",
    season: "2026",
    category: "Người đẹp",
    status: "draft",
    candidatesCount: 0,
    views: 120,
    startDate: "01/05/2026",
    deadline: "15/06/2026",
    scope: "Hà Nội & TP.HCM",
    banner: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    phasesCount: 2
  }
];

export default function ManageCompetitionsPage() {
  // Page mode state: list dashboard OR creation/edit form
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft" | "closed">("all");
  const [competitionList, setCompetitionList] = useState<CompetitionItem[]>(INITIAL_COMPETITIONS);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // --- STATE FOR CREATE/EDIT FORM ---
  const [activeStep, setActiveStep] = useState<StepId>(1);
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("14:35");
  const [publishStatus, setPublishStatus] = useState<"draft" | "incomplete" | "ready" | "published">("ready");

  const previewScrollRef = useRef<HTMLDivElement>(null);

  // STEP 1: General Info
  const [generalInfo, setGeneralInfo] = useState<GeneralInfoState>({
    name: "Hoa hậu Du lịch Việt Nam 2026",
    shortName: "HHDLVN 2026",
    season: new Date().getFullYear().toString(),
    slogan: "Tỏa sáng vẻ đẹp Di sản & Văn hóa Việt",
    category: "Hoa hậu",
    logoUrl: "/logo_icon.png",
    coverDesktop: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
    coverMobile: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80"
    ],
    videoUrl: "https://www.youtube.com/watch?v=example",
    shortDesc: "Cuộc thi tôn vinh vẻ đẹp trí tuệ, bản lĩnh và lòng yêu nước của người phụ nữ Việt Nam, gắn liền với sứ mệnh quảng bá du lịch quốc gia.",
    richIntro: "Hoa hậu Du lịch Việt Nam 2026 là sự kiện văn hóa nghệ thuật quy mô toàn quốc nhằm tìm kiếm gương mặt đại diện quảng bá vẻ đẹp thiên nhiên, di sản văn hóa và con người Việt Nam đến với bạn bè quốc tế.",
    goals: "Thúc đẩy phát triển du lịch địa phương, bảo tồn giá trị di sản và truyền cảm hứng sống tích cực cho thế hệ trẻ.",
    targetCandidates: "Nữ công dân Việt Nam từ 18 - 27 tuổi, chiều cao từ 1m65 trở lên, có niềm đam mê với văn hóa và du lịch.",
    scope: "Toàn quốc",
    startDate: "2026-04-01",
    endDate: "2026-08-30",
    primaryLocation: "Trung tâm Hội nghị Quốc gia, Hà Nội",
    cities: ["Hà Nội", "TP. Hồ Chí Minh", "Quảng Ninh", "Thanh Hóa"],
    format: "Kết hợp",
    slug: "hoa-hau-du-lich-viet-nam-2026",
    seoTitle: "Hoa hậu Du lịch Việt Nam 2026 | Trang thông tin & Đăng ký chính thức",
    seoDesc: "Trang đăng ký và cập nhật lịch trình chính thức cuộc thi Hoa hậu Du lịch Việt Nam 2026. Tìm hiểu thể lệ, giải thưởng và nộp hồ sơ trực tuyến."
  });

  // STEP 2: Timeline & Excel
  const [timelineData, setTimelineData] = useState<TimelineDataState>({
    importMode: "excel",
    isExcelLoaded: true,
    excelFileName: "Ke_Hoach_Timeline_HHDLVN_2026.xlsx",
    phases: [
      {
        id: "p1",
        code: "I",
        name: "HỌP BÁO CÔNG BỐ KHỞI ĐỘNG CUỘC THI",
        publicName: "HỌP BÁO CÔNG BỐ KHỞI ĐỘNG CUỘC THI",
        startDate: "2026-05-01T08:00",
        endDate: "2026-05-31T18:00",
        timeline: "Tháng 05/2026",
        status: "Sắp diễn ra",
        isPublic: true,
        activities: [
          { id: "a1_1", stt: "1", title: "Thông cáo báo chí tới các cơ quan thông tấn, báo chí trên toàn quốc", location: "BTC Hoa Hậu Du Lịch", startDate: "2026-05-01T08:00", endDate: "2026-05-05T17:00", timeline: "01 - 05/05/2026" },
          { id: "a1_2", stt: "2", title: "Tổ chức tại Khách Sạn Sheraton Hanoi West", location: "Tp Hà Nội", startDate: "2026-05-15T08:00", endDate: "2026-05-15T18:00", timeline: "15/05/2026" }
        ]
      },
      {
        id: "p2",
        code: "II",
        name: "TUYỂN SINH",
        publicName: "TUYỂN SINH TOÀN QUỐC",
        startDate: "2026-06-01T08:00",
        endDate: "2026-08-31T18:00",
        timeline: "Tháng 06/2026 - 08/2026",
        status: "Đang diễn ra",
        isPublic: true,
        activities: [
          { id: "a2_1", stt: "1", title: "Thông báo tuyển sinh thí sinh trên phạm vi toàn quốc", location: "Toàn Quốc", startDate: "2026-06-01T08:00", endDate: "2026-06-30T18:00", timeline: "Tháng 06/2026" },
          { id: "a2_2", stt: "2", title: 'Vòng thi Online chủ đề "The Face of Tourism"', location: "Toàn Quốc", startDate: "2026-07-01T08:00", endDate: "2026-07-15T18:00", timeline: "Tháng 07/2026" },
          { id: "a2_3", stt: "3", title: "Phối hợp với các trường Cao Đẳng, Đại Học, BTC các cuộc thi Hoa Khôi, Người đẹp cấp tỉnh", location: "Toàn Quốc", startDate: "2026-07-15T08:00", endDate: "2026-07-31T18:00", timeline: "Tháng 07/2026" },
          { id: "a2_4", stt: "4", title: "Thời gian tiếp nhận hồ sơ, địa điểm và các hình thức nhận hồ sơ online qua fanpage cuộc thi và Văn phòng BTC", location: "Toàn Quốc", startDate: "2026-08-01T08:00", endDate: "2026-08-20T18:00", timeline: "Tháng 08/2026" },
          { id: "a2_5", stt: "5", title: "Tổng hợp danh sách hồ sơ thí sinh được đặc cách tại các cuộc thi Hoa Khôi, Người đẹp cấp tỉnh", location: "Toàn Quốc", startDate: "2026-08-20T08:00", endDate: "2026-08-25T18:00", timeline: "Tháng 08/2026" },
          { id: "a2_6", stt: "6", title: "Tổng hợp danh sách hồ sơ các thí sinh để check thông tin và thông báo timeline lịch trình Vòng sơ khảo 2 miền Bắc - Nam", location: "Tp Hà Nội - Tp.HCM", startDate: "2026-08-25T08:00", endDate: "2026-08-31T18:00", timeline: "Tháng 08/2026" }
        ]
      },
      {
        id: "p3",
        code: "III",
        name: "HỌP BÁO VÀ VÒNG THI SƠ KHẢO 02 MIỀN BẮC & MIỀN NAM",
        publicName: "HỌP BÁO VÀ SƠ KHẢO 02 MIỀN BẮC & MIỀN NAM",
        startDate: "2026-09-01T08:00",
        endDate: "2026-09-30T18:00",
        timeline: "Tháng 09/2026",
        status: "Sắp diễn ra",
        isPublic: true,
        activities: [
          { id: "a3_1", stt: "A", title: "HỌP BÁO & SƠ KHẢO MIỀN BẮC", location: "Khách sạn Sheraton Hanoi West", startDate: "2026-09-05T08:00", endDate: "2026-09-15T18:00", timeline: "05 - 15/09/2026" },
          { id: "a3_2", stt: "B", title: "HỌP BÁO & SƠ KHẢO MIỀN NAM", location: "Nhà hát Hòa Bình - Tp.HCM", startDate: "2026-09-20T08:00", endDate: "2026-09-30T18:00", timeline: "20 - 30/09/2026" }
        ]
      },
      {
        id: "p4",
        code: "IV",
        name: "VÒNG BÁN KẾT & CHUNG KẾT TOÀN QUỐC",
        publicName: "VÒNG BÁN KẾT & CHUNG KẾT TOÀN QUỐC",
        startDate: "2026-10-01T08:00",
        endDate: "2026-11-30T18:00",
        timeline: "Tháng 10 - 11/2026",
        status: "Sắp diễn ra",
        isPublic: true,
        activities: [
          { id: "a4_1", stt: "1", title: "Vòng Bán Kết Toàn Quốc - Hạ Long", location: "Vinpearl Resort & Spa Hạ Long", startDate: "2026-10-10T08:00", endDate: "2026-10-25T18:00", timeline: "10 - 25/10/2026" },
          { id: "a4_2", stt: "2", title: "Đêm Chung Kết & Đăng Quang", location: "Sân vận động Quân khu 7 - TP. HCM", startDate: "2026-11-15T08:00", endDate: "2026-11-30T18:00", timeline: "15 - 30/11/2026" }
        ]
      }
    ]
  });

  // STEP 3: Registration & Terms
  const [registrationData, setRegistrationData] = useState<RegistrationDataState>({
    isOpenRegistration: true,
    status: "Đang mở",
    startDate: "2026-03-01T08:00",
    deadlineDate: "2026-04-10T23:59",
    maxCandidates: 500,
    method: "onstage",
    externalUrl: "",
    qrUrl: "",
    hotline: "1900 888 999",
    email: "dangky@hhdlyvn.vn",
    conditions: [
      { id: "1", title: "Độ tuổi", desc: "Nữ công dân Việt Nam từ 18 đến 27 tuổi.", mandatory: true },
      { id: "2", title: "Chiều cao & Thể hình", desc: "Từ 1m65 trở lên, ngoại hình cân đối, không phẫu thuật thẩm mỹ.", mandatory: true }
    ],
    documents: [
      { id: "d1", name: "Ảnh chân dung & toàn thân", desc: "Ảnh chụp trong vòng 3 tháng gần nhất", mandatory: true }
    ],
    downloadableFiles: [
      { id: "f1", name: "The_Le_Cuoc_Thi_Chinh_Thuc_2026.pdf", type: "Thể lệ", isPublic: true }
    ]
  });

  // STEP 4: Public Content
  const [publicContent, setPublicContent] = useState<PublicContentState>({
    enabledSections: { announcements: true, judges: true, candidates: true, results: true, news: true, gallery: true },
    announcements: [],
    judges: [
      { id: "j1", name: "ThS. Trịnh Mỹ Linh", role: "Trưởng Ban Giám Khảo", title: "Hoa hậu / NTK", avatar: "/logo_icon.png" }
    ],
    candidates: [],
    news: [],
    gallery: []
  });

  // STEP 5: Sponsors & Contact
  const [sponsorsData, setSponsorsData] = useState<SponsorsDataState>({
    organizer: { name: "VNP Onstage Media Group", englishName: "VNP ONSTAGE MEDIA JOINT STOCK COMPANY", logo: "/logo_icon.png", role: "Đơn vị Tổ chức & Bản quyền", website: "https://onstage.vn" },
    sponsors: [{ id: "s1", name: "Tập đoàn Du lịch VinPearl", logo: "/logo_icon.png", tier: "Kim cương" }],
    partners: [],
    contact: { hotline: "0909 123 456", email: "contact@hhdlyvn.vn", address: "Số 88 Nguyễn Chí Thanh, Đống Đa, Hà Nội", supportHours: "8:00 - 18:00" }
  });

  const steps: StepInfo[] = [
    { id: 1, title: "Thông tin chung", subtitle: "Tên & hình ảnh", status: "complete" },
    { id: 2, title: "Lịch trình", subtitle: "Các giai đoạn & lịch trình", status: "complete" },
    { id: 3, title: "Yêu cầu", subtitle: "Điều kiện & tài liệu", status: "complete" },
    { id: 4, title: "Thành phần tham gia", subtitle: "Đơn vị tổ chức & Giám khảo", status: "complete" }
  ];

  const filteredCompetitions = useMemo(() => {
    if (activeTab === "all") return competitionList;
    return competitionList.filter((item) => item.status === activeTab);
  }, [activeTab, competitionList]);

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      const time = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      setLastSaved(time);
    }, 600);
  };

  const handlePublishClick = () => {
    // Save new competition to list and return to list dashboard
    const newComp: CompetitionItem = {
      id: `comp_${Date.now()}`,
      name: generalInfo.name || "Cuộc thi mới",
      season: generalInfo.season || "2026",
      category: generalInfo.category || "Hoa hậu",
      status: "published",
      candidatesCount: 0,
      views: 1,
      startDate: generalInfo.startDate || "01/04/2026",
      deadline: "30/08/2026",
      scope: generalInfo.scope || "Toàn quốc",
      banner: generalInfo.coverDesktop || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
      phasesCount: timelineData.phases.length
    };
    setCompetitionList([newComp, ...competitionList]);
    setIsCreating(false);
  };

  const scrollToPreviewSection = (sectionId: string) => {
    const el = document.getElementById(`preview-${sectionId}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleStepChange = (stepId: StepId) => {
    setActiveStep(stepId);
    const sectionMap: Record<StepId, string> = { 1: "hero", 2: "timeline", 3: "registration", 4: "judges" };
    scrollToPreviewSection(sectionMap[stepId]);
  };

  // ==========================================
  // SCENARIO 1: LIST DASHBOARD (DEFAULT VIEW MATCHING /brand/campaigns)
  // ==========================================
  if (!isCreating) {
    return (
      <div className="space-y-6 pb-16">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.15),transparent_40%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10 text-left">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-amber-400/40 bg-amber-400/10 text-amber-300">
                  Brand Portal
                </span>
                <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-yellow-400/20 bg-yellow-400/5 text-yellow-200">
                  Competition Manager
                </span>
              </div>
              <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl">
                QUẢN LÝ <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent">CUỘC THI</span>
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Tạo mới các cuộc thi sắc đẹp, âm nhạc, nghệ thuật, tự động nhận diện lịch trình Excel, quản lý hội đồng giám khảo và danh sách thí sinh đăng ký trực tuyến.
              </p>
            </div>

            <button
              onClick={() => setIsCreating(true)}
              className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 px-6 text-xs font-black uppercase tracking-wider text-slate-950 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-98 transition-all cursor-pointer shrink-0"
            >
              <Plus className="mr-2 h-4 w-4 stroke-[3]" />
              Tạo cuộc thi mới
            </button>
          </div>
        </div>

        {/* Filter Status Tabs */}
        <section className="flex flex-wrap gap-2 pb-2 text-left">
          {[
            { id: "all", label: "Tất cả" },
            { id: "published", label: "Đang mở" },
            { id: "draft", label: "Bản nháp" },
            { id: "closed", label: "Đã đóng" }
          ].map((tab) => {
            const count = tab.id === "all" ? competitionList.length : competitionList.filter((c) => c.status === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-black transition-all duration-300 cursor-pointer border flex items-center gap-1.5",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 border-amber-400/30 shadow-md scale-[1.02]"
                    : "bg-[#0c101b]/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <span>{tab.label}</span>
                <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-black leading-none", activeTab === tab.id ? "bg-slate-950/15 text-slate-950" : "bg-white/5 text-slate-400")}>
                  {count}
                </span>
              </button>
            );
          })}
        </section>

        {/* Competition Cards Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompetitions.map((comp) => {
            const isPublished = comp.status === "published";
            const isDraft = comp.status === "draft";

            return (
              <article
                key={comp.id}
                className="flex flex-col justify-between rounded-3xl border border-[#151b2d] bg-gradient-to-b from-[#111421]/90 to-[#070913]/95 hover:border-amber-400/40 hover:shadow-[0_12px_40px_rgba(245,158,11,0.1)] transition-all duration-300 relative group overflow-hidden text-left"
              >
                {/* Image Banner */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img src={comp.banner} alt={comp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-[#070913]/40 to-transparent" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded bg-black/60 backdrop-blur-md px-2.5 py-1 text-[9px] font-black uppercase text-amber-300 border border-amber-400/30">
                      {comp.category} • {comp.season}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border backdrop-blur-md",
                        isPublished ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : isDraft ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-slate-500/20 text-slate-400 border-slate-600"
                      )}
                    >
                      {isPublished ? "Đang mở" : isDraft ? "Bản nháp" : "Đã đóng"}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors line-clamp-1">{comp.name}</h3>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="text-[11px] font-semibold truncate">{comp.phasesCount} Giai đoạn</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="text-[11px] font-semibold truncate">{comp.scope}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300 col-span-2">
                      <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="text-[11px] font-semibold">Hạn đăng ký: {comp.deadline}</span>
                    </div>
                  </div>



                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => setIsCreating(true)}
                      className="flex-1 flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-amber-400/20 to-yellow-500/10 border border-amber-500/30 hover:bg-amber-400/30 text-[10px] font-bold uppercase tracking-wider text-amber-300 transition-all cursor-pointer"
                    >
                      Quản lý & Sửa <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCompetitionList(competitionList.filter((item) => item.id !== comp.id));
                      }}
                      className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Xóa cuộc thi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    );
  }

  // ==========================================
  // SCENARIO 2: CREATE / EDIT COMPETITION FORM (2-COLUMN EDITOR VIEW)
  // ==========================================
  return (
    <div className="fixed inset-0 z-50 flex flex-col h-screen w-full bg-[#050711] text-slate-100 overflow-hidden font-sans">
      {/* 1. TOP HEADER BAR */}
      <header className="h-14 sm:h-16 shrink-0 border-b border-white/10 bg-[#090d1f] px-3 sm:px-6 flex items-center justify-between z-30">
        {/* Left: Back to List & Title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-amber-400 transition-colors p-1.5 sm:py-1.5 sm:px-2.5 rounded-lg border border-white/10 hover:border-amber-500/30 bg-white/5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Quay lại danh sách</span>
          </button>
          <div className="h-5 w-px bg-white/10 hidden sm:block" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-base font-bold text-white truncate max-w-[130px] xs:max-w-[190px] sm:max-w-[320px] md:max-w-[420px]">
                {generalInfo.name || "Tên cuộc thi chưa đặt"}
              </h1>
              <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 hidden xs:inline-flex">
                {publishStatus === "published" ? "Đã xuất bản" : "Bản nháp"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsFullscreenPreview(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 bg-white/5 hover:bg-amber-500/10 transition-all cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 text-amber-400" />
            <span>Xem toàn màn hình</span>
          </button>

          <button
            type="button"
            onClick={handlePublishClick}
            className="flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-amber-200 hover:to-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-slate-950" />
            <span>Xuất bản</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden border-b border-white/10 bg-[#090d21] p-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab("form")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            mobileTab === "form" ? "bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <span>📝 Chỉnh sửa Form</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            mobileTab === "preview" ? "bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <span>👁️ Xem trước Landing Page</span>
        </button>
      </div>

      {/* 2. MAIN LAYOUT (2 Columns on Desktop) */}
      <div className="flex flex-1 min-h-0 relative overflow-hidden">
        <div className={cn("flex-1 flex flex-col min-w-0 h-full", mobileTab === "preview" ? "hidden lg:flex" : "flex")}>
          <FormCreateCompetition
            activeStep={activeStep}
            handleStepChange={handleStepChange}
            steps={steps}
            generalInfo={generalInfo}
            setGeneralInfo={setGeneralInfo}
            timelineData={timelineData}
            setTimelineData={setTimelineData}
            registrationData={registrationData}
            setRegistrationData={setRegistrationData}
            publicContent={publicContent}
            setPublicContent={setPublicContent}
            sponsorsData={sponsorsData}
            setSponsorsData={setSponsorsData}
            handlePublishClick={handlePublishClick}
          />
        </div>

        <div className={cn("h-full", mobileTab === "form" ? "hidden lg:flex" : "flex w-full")}>
          <PreviewCompetition
            generalInfo={generalInfo}
            timelineData={timelineData}
            registrationData={registrationData}
            publicContent={publicContent}
            sponsorsData={sponsorsData}
            previewDevice={previewDevice}
            setPreviewDevice={setPreviewDevice}
            setIsFullscreenPreview={setIsFullscreenPreview}
            previewScrollRef={previewScrollRef}
            isMobileView={mobileTab === "preview"}
          />
        </div>
      </div>

      {/* 3. FULLSCREEN PREVIEW MODAL */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-[#050711] flex flex-col">
          <div className="h-14 border-b border-white/10 bg-[#090d1f] px-4 sm:px-6 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-amber-300 truncate">
              Xem toàn màn hình Landing Page: {generalInfo.name}
            </span>
            <button
              onClick={() => setIsFullscreenPreview(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-xs font-semibold text-slate-200 hover:bg-white/20 cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" /> <span className="hidden sm:inline">Đóng xem trước</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-8 sm:space-y-12">
            <div className="relative h-64 sm:h-96 rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/30 flex flex-col justify-end p-4 sm:p-8">
              <img src={generalInfo.coverDesktop} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050711] via-[#050711]/60 to-transparent" />
              <div className="relative z-10 space-y-2 sm:space-y-3">
                <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold bg-amber-400 text-slate-950 uppercase">
                  {generalInfo.category} • {generalInfo.season}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-white">{generalInfo.name}</h1>
                <p className="text-xs sm:text-base text-amber-300 italic">{generalInfo.slogan}</p>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">{generalInfo.shortDesc}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-amber-400">Lịch trình & Tiến độ Cuộc thi</h2>
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-900/60">
                <div className="grid grid-cols-12 bg-amber-500/20 px-3 sm:px-4 py-3 text-[10px] sm:text-xs font-bold text-amber-300 border-b border-white/10">
                  <div className="col-span-1">STT</div>
                  <div className="col-span-5">Nội dung</div>
                  <div className="col-span-3">Địa điểm tổ chức</div>
                  <div className="col-span-3 text-right">Timeline dự kiến</div>
                </div>
                <div className="divide-y divide-white/5 text-[11px] sm:text-xs">
                  {timelineData.phases.map((phase) => (
                    <React.Fragment key={phase.id}>
                      <div className="grid grid-cols-12 px-3 sm:px-4 py-2.5 bg-amber-500/10 font-bold text-amber-300 items-center">
                        <div className="col-span-1">{phase.code}</div>
                        <div className="col-span-8 uppercase tracking-wide">{phase.publicName}</div>
                        <div className="col-span-3 text-right text-slate-300">{phase.timeline}</div>
                      </div>
                      {phase.activities.map((act) => (
                        <div key={act.id} className="grid grid-cols-12 px-3 sm:px-4 py-2.5 text-slate-200 hover:bg-white/5 items-center">
                          <div className="col-span-1 text-slate-400 font-semibold">{act.stt}</div>
                          <div className="col-span-5 font-medium">{act.title}</div>
                          <div className="col-span-3 text-slate-400">{act.location}</div>
                          <div className="col-span-3 text-right font-semibold text-amber-400/90">{act.timeline}</div>
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
