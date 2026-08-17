"use client";

import React from "react";
import {
  FileText,
  Upload,
  Image as ImageIcon,
  FileSpreadsheet,
  Layers,
  Plus,
  Trash2,
  Lock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sparkles,
  MapPin,
  Clock,
  ListPlus,
  ImagePlus,
  X,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  StepId,
  StepInfo,
  Phase,
  SubActivity,
  Judge,
  Sponsor,
  ConditionItem,
  GeneralInfoState,
  TimelineDataState,
  RegistrationDataState,
  PublicContentState,
  SponsorsDataState
} from "./types";

function UserCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  );
}

interface FormCreateCompetitionProps {
  activeStep: StepId;
  handleStepChange: (stepId: StepId) => void;
  steps: StepInfo[];
  generalInfo: GeneralInfoState;
  setGeneralInfo: React.Dispatch<React.SetStateAction<GeneralInfoState>>;
  timelineData: TimelineDataState;
  setTimelineData: React.Dispatch<React.SetStateAction<TimelineDataState>>;
  registrationData: RegistrationDataState;
  setRegistrationData: React.Dispatch<React.SetStateAction<RegistrationDataState>>;
  publicContent: PublicContentState;
  setPublicContent: React.Dispatch<React.SetStateAction<PublicContentState>>;
  sponsorsData: SponsorsDataState;
  setSponsorsData: React.Dispatch<React.SetStateAction<SponsorsDataState>>;
  handlePublishClick: () => void;
}

export default function FormCreateCompetition({
  activeStep,
  handleStepChange,
  steps,
  generalInfo,
  setGeneralInfo,
  timelineData,
  setTimelineData,
  registrationData,
  setRegistrationData,
  publicContent,
  setPublicContent,
  sponsorsData,
  setSponsorsData,
  handlePublishClick
}: FormCreateCompetitionProps) {
  // Helper to get current date string for <input type="date" /> (YYYY-MM-DD)
  const getCurrentDateStr = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  };

  // Helper handlers for sub-activities
  const handleAddSubActivity = (phaseId: string) => {
    const updatedPhases = timelineData.phases.map((phase: Phase) => {
      if (phase.id === phaseId) {
        const nextStt = (phase.activities.length + 1).toString();
        const nowStr = getCurrentDateStr();
        const newAct: SubActivity = {
          id: `act_${Date.now()}`,
          stt: nextStt,
          title: "Hoạt động / Lịch trình mới",
          location: "Toàn Quốc",
          startDate: nowStr,
          endDate: nowStr
        };
        return { ...phase, activities: [...phase.activities, newAct] };
      }
      return phase;
    });
    setTimelineData({ ...timelineData, phases: updatedPhases });
  };

  const handleUpdateSubActivity = (phaseId: string, actId: string, field: keyof SubActivity, value: string) => {
    const updatedPhases = timelineData.phases.map((phase: Phase) => {
      if (phase.id === phaseId) {
        const updatedActs = phase.activities.map((act: SubActivity) => {
          if (act.id === actId) {
            return { ...act, [field]: value };
          }
          return act;
        });
        return { ...phase, activities: updatedActs };
      }
      return phase;
    });
    setTimelineData({ ...timelineData, phases: updatedPhases });
  };

  const handleDeleteSubActivity = (phaseId: string, actId: string) => {
    const updatedPhases = timelineData.phases.map((phase: Phase) => {
      if (phase.id === phaseId) {
        return { ...phase, activities: phase.activities.filter((act: SubActivity) => act.id !== actId) };
      }
      return phase;
    });
    setTimelineData({ ...timelineData, phases: updatedPhases });
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 border-r border-white/10 bg-[#080d21] overflow-hidden">
      {/* HORIZONTAL STEP SELECTION BAR (4 Steps Grid) */}
      <div className="px-2.5 sm:px-6 pt-3 pb-2.5 border-b border-slate-800/80 bg-[#0c1024] shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 sm:px-2.5 py-0.5 rounded-full">
            Các bước • Bước {activeStep}/4
          </span>
          <span className="text-xs font-bold text-amber-300 truncate max-w-[150px] sm:max-w-none">
            {steps.find((s) => s.id === activeStep)?.title}
          </span>
        </div>

        {/* Grid 4 columns - Responsive for mobile */}
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 w-full">
          {steps.map((step) => {
            const stepNum = step.id;
            const isDone = stepNum < activeStep;
            const isActive = stepNum === activeStep;

            // Short titles for tight mobile spaces
            const shortTitles: Record<number, string> = {
              1: "Thông tin",
              2: "Lịch trình",
              3: "Yêu cầu",
              4: "Thành phần"
            };

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepChange(stepNum)}
                className={cn(
                  "flex items-center justify-center sm:justify-start gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all border cursor-pointer min-w-0 w-full min-h-[40px] sm:min-h-[50px]",
                  isActive
                    ? "bg-gradient-to-r from-amber-400/20 via-yellow-500/10 to-amber-600/5 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold"
                    : isDone
                      ? "bg-slate-900/80 border-amber-500/30 text-amber-400/80 hover:bg-slate-800/80"
                      : "bg-slate-900/50 border-white/10 text-slate-400 hover:border-amber-400/30 hover:text-slate-200"
                )}
              >
                <div
                  className={cn(
                    "h-4 w-4 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-[9px] sm:text-[11px] font-black shrink-0 transition-all",
                    isActive
                      ? "bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)] scale-105"
                      : isDone
                        ? "bg-amber-500/20 text-amber-300 border border-amber-400/50"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                  )}
                >
                  {isDone ? "✓" : stepNum}
                </div>
                <div className="text-left min-w-0">
                  <p className={cn("text-[10px] sm:text-xs font-bold leading-tight truncate", isActive ? "text-amber-300" : isDone ? "text-slate-200" : "text-slate-400")}>
                    <span className="hidden md:inline">{step.title}</span>
                    <span className="md:hidden">{shortTitles[stepNum]}</span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FORM BODY CONTAINER (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* STEP 1: THÔNG TIN CHUNG & ĐƯỜNG DẪN */}
        {activeStep === 1 && (
          <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-400" />
                <span>Bước 1: Thông tin chung cuộc thi</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Nhập các thông tin nhận diện cơ bản để tạo trang giới thiệu và hiển thị khi tìm kiếm.
              </p>
            </div>

            {/* 1.1 Identification */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">1. Thông tin nhận diện</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tên cuộc thi <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={generalInfo.name}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, name: e.target.value })}
                    className="w-full bg-slate-900/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="Ví dụ: Hoa hậu Du lịch Việt Nam 2026"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Slogan cuộc thi</label>
                  <input
                    type="text"
                    value={generalInfo.slogan}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, slogan: e.target.value })}
                    className="w-full bg-slate-900/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="Ví dụ: Tỏa sáng vẻ đẹp Di sản & Văn hóa Việt"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Logo cuộc thi</label>
                  {generalInfo.logoUrl ? (
                    <div className="relative group w-20 h-20 rounded-full shrink-0" style={{ background: 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)', padding: '2px' }}>
                      <div className="w-full h-full rounded-full bg-[#0a0d1a] overflow-hidden flex items-center justify-center">
                        <img src={generalInfo.logoUrl} alt="Competition Logo" className="h-full w-full object-contain" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <label className="p-1.5 rounded-full bg-white/10 text-white hover:bg-amber-400 hover:text-slate-950 cursor-pointer transition-colors">
                          <Pencil className="h-3 w-3" />
                          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setGeneralInfo({ ...generalInfo, logoUrl: URL.createObjectURL(file) }); } }} className="hidden" />
                        </label>
                        <button type="button" onClick={() => setGeneralInfo({ ...generalInfo, logoUrl: "" })} className="p-1.5 rounded-full bg-white/10 text-white hover:bg-red-500 cursor-pointer transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="group w-20 h-20 rounded-full cursor-pointer" style={{ background: 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)', padding: '2px' }}>
                      <div className="w-full h-full rounded-full bg-[#0a0d1a] flex flex-col items-center justify-center gap-1 hover:bg-[#0f1424] transition-colors">
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setGeneralInfo({ ...generalInfo, logoUrl: URL.createObjectURL(file) }); } }} className="hidden" />
                        <Upload className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] text-amber-400/80">Logo</span>
                      </div>
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Loại cuộc thi</label>
                  <select
                    value={generalInfo.category}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, category: e.target.value })}
                    className="w-full bg-slate-900/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  >
                    <option value="Hoa hậu">Hoa hậu / Sắc đẹp</option>
                    <option value="Người mẫu">Người mẫu / Fashion</option>
                    <option value="Âm nhạc">Âm nhạc / Ca hát</option>
                    <option value="Diễn xuất">Diễn xuất / Điện ảnh</option>
                    <option value="Nhảy múa">Nhảy múa / Dance</option>
                    <option value="Sáng tạo nội dung">Sáng tạo nội dung / KOL</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phạm vi tổ chức</label>
                  <select
                    value={generalInfo.scope}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, scope: e.target.value })}
                    className="w-full bg-slate-900/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  >
                    <option value="Toàn quốc">Toàn quốc</option>
                    <option value="Quốc tế">Quốc tế</option>
                    <option value="Miền Bắc">Miền Bắc</option>
                    <option value="Miền Trung">Miền Trung</option>
                    <option value="Miền Nam">Miền Nam</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 1.2 Image Gallery */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">2. Bộ ảnh cuộc thi</h3>
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                  {(generalInfo.images || []).length}/10 ảnh
                </span>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-3 custom-scrollbar snap-x">
                {/* Upload card (only show if < 10 images) */}
                {(generalInfo.images || []).length < 10 && (
                  <label className="group relative flex aspect-video w-[220px] shrink-0 snap-start cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-amber-400/40 bg-amber-500/5 p-4 text-center transition-all hover:border-amber-400 hover:bg-amber-500/10">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const newUrls = files.map((file) => URL.createObjectURL(file));
                        const currentImages = generalInfo.images || (generalInfo.coverDesktop ? [generalInfo.coverDesktop] : []);
                        const nextImages = [...currentImages, ...newUrls].slice(0, 10);
                        setGeneralInfo({
                          ...generalInfo,
                          images: nextImages,
                          coverDesktop: nextImages[0] || "",
                          coverMobile: nextImages[0] || ""
                        });
                      }}
                      className="hidden"
                    />
                    <ImagePlus className="mb-2 h-7 w-7 text-amber-400 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-white">
                      Tải ảnh lên
                    </span>
                    <span className="mt-1 text-[9px] font-medium leading-relaxed text-slate-400">
                      Tỷ lệ 16:9 (PNG, JPG, max 5MB)
                    </span>
                  </label>
                )}

                {/* Previews */}
                {(generalInfo.images || (generalInfo.coverDesktop ? [generalInfo.coverDesktop] : [])).map((url: string, idx: number) => (
                  <div key={idx} className="group relative aspect-video w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-md">
                    <img
                      src={url}
                      alt="Competition preview"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.05]"
                    />

                    {/* Delete button (X) */}
                    <button
                      type="button"
                      onClick={() => {
                        const currentImages = generalInfo.images || (generalInfo.coverDesktop ? [generalInfo.coverDesktop] : []);
                        const nextImages = currentImages.filter((_, i: number) => i !== idx);
                        setGeneralInfo({
                          ...generalInfo,
                          images: nextImages,
                          coverDesktop: nextImages[0] || "",
                          coverMobile: nextImages[0] || ""
                        });
                      }}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-slate-950/80 text-white shadow-lg backdrop-blur transition hover:border-red-500 hover:bg-red-500 cursor-pointer z-10"
                      title="Xóa ảnh"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    {/* Edit button (Pencil) */}
                    <label className="absolute right-12 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-950/80 text-white shadow-lg backdrop-blur transition hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950 z-10">
                      <Pencil className="h-3.5 w-3.5" />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const newUrl = URL.createObjectURL(file);
                            const currentImages = generalInfo.images || (generalInfo.coverDesktop ? [generalInfo.coverDesktop] : []);
                            const nextImages = [...currentImages];
                            nextImages[idx] = newUrl;
                            setGeneralInfo({
                              ...generalInfo,
                              images: nextImages,
                              coverDesktop: nextImages[0] || "",
                              coverMobile: nextImages[0] || ""
                            });
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md z-10">
                        Ảnh bìa
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 1.3 Description */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">3. Nội dung mô tả</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mô tả cuộc thi <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={generalInfo.shortDesc}
                  onChange={(e) => setGeneralInfo({ ...generalInfo, shortDesc: e.target.value, richIntro: e.target.value })}
                  className="w-full bg-slate-900/80 border border-white/15 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  placeholder="Nhập nội dung mô tả chi tiết về thông điệp, sứ mệnh và điểm nổi bật của cuộc thi..."
                />
              </div>
            </div>

            {/* 1.4 Video trailer */}
          </div>
        )}

        {/* STEP 2: LỊCH TRÌNH (Multilevel Phases & Sub-activities) */}
        {activeStep === 2 && (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-400" />
                <span>Bước 2: Lịch trình Chi tiết</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Tạo nhiều giai đoạn (I, II, III, IV), mỗi giai đoạn chứa danh sách các hoạt động con với Nội dung, Địa điểm và Timeline dự kiến.
              </p>
            </div>

            {/* List of Phases */}
            <div className="space-y-6">
              {timelineData.phases.map((phase: Phase) => (
                <div key={phase.id} className="p-4 rounded-2xl border border-amber-500/30 bg-[#090e24] space-y-4 shadow-lg">
                  {/* Phase Header */}
                  <div className="space-y-2.5 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-lg bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 text-xs font-black flex items-center justify-center shrink-0">
                        {phase.code}
                      </span>
                      <input
                        type="text"
                        value={phase.publicName}
                        onChange={(e) => {
                          const updated = timelineData.phases.map((p: Phase) => (p.id === phase.id ? { ...p, publicName: e.target.value, name: e.target.value } : p));
                          setTimelineData({ ...timelineData, phases: updated });
                        }}
                        className="flex-1 bg-slate-900/90 border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400 min-w-0"
                        placeholder="Tên giai đoạn lớn (VD: II. TUYỂN SINH)"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = timelineData.phases.filter((p: Phase) => p.id !== phase.id);
                          setTimelineData({ ...timelineData, phases: updated });
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                        title="Xóa giai đoạn này"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Phase Date Range */}
                    <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 border border-white/10 px-3 py-1.5 rounded-lg text-xs w-fit max-w-full">
                      <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Thời gian Giai đoạn:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-semibold">Từ</span>
                        <input
                          type="date"
                          value={phase.startDate ? phase.startDate.slice(0, 10) : getCurrentDateStr()}
                          onChange={(e) => {
                            const updated = timelineData.phases.map((p: Phase) => (p.id === phase.id ? { ...p, startDate: e.target.value } : p));
                            setTimelineData({ ...timelineData, phases: updated });
                          }}
                          className="bg-transparent text-amber-300 font-semibold text-xs border-none focus:outline-none cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-semibold">Đến</span>
                        <input
                          type="date"
                          value={phase.endDate ? phase.endDate.slice(0, 10) : getCurrentDateStr()}
                          onChange={(e) => {
                            const updated = timelineData.phases.map((p: Phase) => (p.id === phase.id ? { ...p, endDate: e.target.value } : p));
                            setTimelineData({ ...timelineData, phases: updated });
                          }}
                          className="bg-transparent text-amber-300 font-semibold text-xs border-none focus:outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sub-Activities List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <ListPlus className="h-3.5 w-3.5 text-amber-400" />
                        <span>Các lịch trình con trong {phase.code} ({phase.activities.length})</span>
                      </span>
                    </div>

                    {/* Sub-activity items list */}
                    <div className="space-y-2.5">
                      {phase.activities.map((act: SubActivity) => (
                        <div
                          key={act.id}
                          className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-amber-400/40 transition-all space-y-3 shadow-sm"
                        >
                          {/* Row 1: STT + Nội dung + Delete button */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-bold shrink-0">STT:</span>
                            <input
                              type="text"
                              value={act.stt}
                              onChange={(e) => handleUpdateSubActivity(phase.id, act.id, "stt", e.target.value)}
                              className="w-9 bg-slate-950 border border-white/15 rounded px-1 py-1 text-xs text-amber-300 font-extrabold text-center shrink-0"
                            />
                            <textarea
                              value={act.title}
                              onChange={(e) => handleUpdateSubActivity(phase.id, act.id, "title", e.target.value)}
                              className="flex-1 bg-slate-950 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-amber-400 min-w-0 min-h-[46px] resize-y"
                              placeholder="Nội dung hoạt động / lịch trình..."
                              rows={2}
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteSubActivity(phase.id, act.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                              title="Xóa lịch trình này"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Row 2: Địa điểm tổ chức (Riêng 1 dòng) */}
                          <div className="flex items-center gap-2 bg-slate-950/80 border border-white/10 rounded-lg px-3 py-1.5 text-xs">
                            <MapPin className="h-3.5 w-3.5 text-amber-400/90 shrink-0" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Địa điểm:</span>
                            <input
                              type="text"
                              value={act.location}
                              onChange={(e) => handleUpdateSubActivity(phase.id, act.id, "location", e.target.value)}
                              className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
                              placeholder="Nhập địa điểm tổ chức (VD: Khách sạn Sheraton Hanoi West)..."
                            />
                          </div>

                          {/* Row 3: Thời gian Từ - Đến (Riêng 1 dòng) */}
                          <div className="flex flex-wrap items-center gap-3 bg-slate-950/90 border border-white/10 px-3 py-1.5 rounded-lg text-xs w-fit max-w-full">
                            <Calendar className="h-3.5 w-3.5 text-amber-400/90 shrink-0" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Thời gian:</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-semibold">Từ</span>
                              <input
                                type="date"
                                value={act.startDate ? act.startDate.slice(0, 10) : getCurrentDateStr()}
                                onChange={(e) => handleUpdateSubActivity(phase.id, act.id, "startDate", e.target.value)}
                                className="bg-transparent text-amber-300 font-semibold text-xs border-none focus:outline-none cursor-pointer"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-semibold">Đến</span>
                              <input
                                type="date"
                                value={act.endDate ? act.endDate.slice(0, 10) : getCurrentDateStr()}
                                onChange={(e) => handleUpdateSubActivity(phase.id, act.id, "endDate", e.target.value)}
                                className="bg-transparent text-amber-300 font-semibold text-xs border-none focus:outline-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Button at bottom of sub-activities list */}
                    <button
                      type="button"
                      onClick={() => handleAddSubActivity(phase.id)}
                      className="w-full py-2.5 px-3 rounded-xl border border-dashed border-amber-500/30 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-400/10 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer group"
                    >
                      <Plus className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span>Thêm lịch trình con trong {phase.code}</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Button at bottom of all phases list */}
              <button
                type="button"
                onClick={() => {
                  const nextRoman = ["I", "II", "III", "IV", "V", "VI", "VII"][timelineData.phases.length] || `GĐ${timelineData.phases.length + 1}`;
                  const nowStr = getCurrentDateStr();
                  const newPhase: Phase = {
                    id: `p_${Date.now()}`,
                    code: nextRoman,
                    name: "GIAI ĐOẠN MỚI",
                    publicName: "GIAI ĐOẠN MỚI",
                    startDate: nowStr,
                    endDate: nowStr,
                    status: "Sắp diễn ra",
                    isPublic: true,
                    activities: [
                      { id: `act_${Date.now()}`, stt: "1", title: "Nội dung lịch trình đầu tiên", location: "Toàn Quốc", startDate: nowStr, endDate: nowStr }
                    ]
                  };
                  setTimelineData({ ...timelineData, phases: [...timelineData.phases, newPhase] });
                }}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent hover:from-amber-500/20 text-amber-300 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer group"
              >
                <Plus className="h-4 w-4 text-amber-400 group-hover:scale-125 transition-transform" />
                <span>Thêm Giai đoạn chính mới ({["I", "II", "III", "IV", "V", "VI", "VII"][timelineData.phases.length] || `GĐ${timelineData.phases.length + 1}`})</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: YÊU CẦU */}
        {activeStep === 3 && (
          <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheckIcon className="h-5 w-5 text-amber-400" />
                <span>Bước 3: Yêu cầu</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Thời hạn nhận hồ sơ, điều kiện tham gia.</p>
            </div>

            {/* Dates & Hotline */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">1. Thời hạn đăng ký</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mở cổng đăng ký</label>
                  <input
                    type="date"
                    value={registrationData.startDate ? registrationData.startDate.slice(0, 10) : ""}
                    onChange={(e) => setRegistrationData({ ...registrationData, startDate: e.target.value })}
                    className="w-full bg-slate-900/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hạn chót nộp hồ sơ</label>
                  <input
                    type="date"
                    value={registrationData.deadlineDate ? registrationData.deadlineDate.slice(0, 10) : ""}
                    onChange={(e) => setRegistrationData({ ...registrationData, deadlineDate: e.target.value })}
                    className="w-full bg-slate-900/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

              </div>
            </div>

            {/* Candidate Conditions */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/2 space-y-4">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">2. Điều kiện tham gia ({registrationData.conditions.length})</h3>
              </div>

              <div className="space-y-3">
                {registrationData.conditions.map((item: ConditionItem) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-amber-400/40 transition-all flex gap-3 items-start shadow-sm animate-in fade-in duration-200">
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold shrink-0 w-20">Tiêu chuẩn:</span>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const updatedConditions = registrationData.conditions.map((c: ConditionItem) =>
                              c.id === item.id ? { ...c, title: e.target.value } : c
                            );
                            setRegistrationData({ ...registrationData, conditions: updatedConditions });
                          }}
                          className="flex-1 bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                          placeholder="Tên tiêu chuẩn (VD: Độ tuổi, Chiều cao...)"
                        />
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-slate-400 font-bold shrink-0 w-20 mt-1.5">Mô tả:</span>
                        <textarea
                          value={item.desc}
                          onChange={(e) => {
                            const updatedConditions = registrationData.conditions.map((c: ConditionItem) =>
                              c.id === item.id ? { ...c, desc: e.target.value } : c
                            );
                            setRegistrationData({ ...registrationData, conditions: updatedConditions });
                          }}
                          rows={2}
                          className="flex-1 bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400 resize-none"
                          placeholder="Mô tả chi tiết tiêu chuẩn..."
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationData({
                          ...registrationData,
                          conditions: registrationData.conditions.filter((c: ConditionItem) => c.id !== item.id)
                        });
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0 mt-0.5"
                      title="Xóa tiêu chuẩn"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const newC: ConditionItem = { id: `c_${Date.now()}`, title: "", desc: "", mandatory: true };
                  setRegistrationData({ ...registrationData, conditions: [...registrationData.conditions, newC] });
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-amber-500/30 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer group mt-3"
              >
                <Plus className="h-3.5 w-3.5 text-amber-400 group-hover:scale-125 transition-transform" />
                <span>Thêm tiêu chuẩn mới</span>
              </button>
            </div>
          </div>
        )}


        {/* STEP 4: THÀNH PHẦN THAM GIA */}
        {activeStep === 4 && (
          <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <span>Bước 4: Thành phần tham gia</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Quản lý Đơn vị tổ chức, Hội đồng Ban giám khảo, Nhà tài trợ và thông tin liên hệ BTC.</p>
            </div>

            {/* 1. Organizer & Contact Info */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">1. Đơn vị tổ chức & Thông tin liên hệ</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tên đơn vị tổ chức</label>
                  <input
                    type="text"
                    value={sponsorsData.organizer.name}
                    onChange={(e) => setSponsorsData({ ...sponsorsData, organizer: { ...sponsorsData.organizer, name: e.target.value } })}
                    className="w-full bg-slate-900/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hotline liên hệ</label>
                  <input
                    type="text"
                    value={sponsorsData.contact.hotline}
                    onChange={(e) => setSponsorsData({ ...sponsorsData, contact: { ...sponsorsData.contact, hotline: e.target.value } })}
                    className="w-full bg-slate-900/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email liên hệ</label>
                  <input
                    type="text"
                    value={sponsorsData.contact.email}
                    onChange={(e) => setSponsorsData({ ...sponsorsData, contact: { ...sponsorsData.contact, email: e.target.value } })}
                    className="w-full bg-slate-900/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Website</label>
                  <input
                    type="text"
                    value={sponsorsData.organizer.website}
                    onChange={(e) => setSponsorsData({ ...sponsorsData, organizer: { ...sponsorsData.organizer, website: e.target.value } })}
                    className="w-full bg-slate-900/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Địa chỉ văn phòng BTC</label>
                  <input
                    type="text"
                    value={sponsorsData.contact.address}
                    onChange={(e) => setSponsorsData({ ...sponsorsData, contact: { ...sponsorsData.contact, address: e.target.value } })}
                    className="w-full bg-slate-900/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="md:col-span-2 pt-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Logo đơn vị tổ chức</label>
                  {sponsorsData.organizer.logo ? (
                    <div className="relative group w-20 h-20 rounded-full shrink-0" style={{ background: 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)', padding: '2px' }}>
                      <div className="w-full h-full rounded-full bg-[#0a0d1a] overflow-hidden flex items-center justify-center">
                        <img src={sponsorsData.organizer.logo} alt="Organizer Logo" className="h-full w-full object-contain" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <label className="p-1.5 rounded-full bg-white/10 text-white hover:bg-amber-400 hover:text-slate-950 cursor-pointer transition-colors">
                          <Pencil className="h-3 w-3" />
                          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setSponsorsData({ ...sponsorsData, organizer: { ...sponsorsData.organizer, logo: URL.createObjectURL(file) } }); } }} className="hidden" />
                        </label>
                        <button type="button" onClick={() => setSponsorsData({ ...sponsorsData, organizer: { ...sponsorsData.organizer, logo: "" } })} className="p-1.5 rounded-full bg-white/10 text-white hover:bg-red-500 cursor-pointer transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="group w-20 h-20 rounded-full cursor-pointer" style={{ background: 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)', padding: '2px' }}>
                      <div className="w-full h-full rounded-full bg-[#0a0d1a] flex flex-col items-center justify-center gap-1 hover:bg-[#0f1424] transition-colors">
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setSponsorsData({ ...sponsorsData, organizer: { ...sponsorsData.organizer, logo: URL.createObjectURL(file) } }); } }} className="hidden" />
                        <Upload className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] text-amber-400/80">Logo</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Judges List */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/2 space-y-4">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">2. Hội đồng Ban giám khảo</h3>
              </div>

              <div className="space-y-3">
                {publicContent.judges.map((j: Judge) => (
                  <div key={j.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-amber-400/40 transition-all flex gap-4 items-center shadow-sm">
                    {/* Circle Avatar Uploader - gold ring style */}
                    <label className="group relative h-16 w-16 rounded-full shrink-0 cursor-pointer block" style={{ background: 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)', padding: '2px' }}>
                      <div className="w-full h-full rounded-full bg-[#0a0d1a] overflow-hidden flex items-center justify-center">
                        <img src={j.avatar || "/logo_icon.png?v=20260817"} alt="Judge Avatar" className="h-full w-full object-cover" />
                      </div>
                      <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                        <Upload className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-[8px] text-slate-200 mt-0.5">Thay ảnh</span>
                      </div>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const url = URL.createObjectURL(file); const updated = publicContent.judges.map((item: Judge) => item.id === j.id ? { ...item, avatar: url } : item); setPublicContent({ ...publicContent, judges: updated }); } }} className="hidden" />
                    </label>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold shrink-0 w-24">Tên Giám khảo:</span>
                        <input
                          type="text"
                          value={j.name}
                          onChange={(e) => {
                            const updated = publicContent.judges.map((item: Judge) => item.id === j.id ? { ...item, name: e.target.value } : item);
                            setPublicContent({ ...publicContent, judges: updated });
                          }}
                          className="flex-1 bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                          placeholder="Tên Giám khảo..."
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold shrink-0 w-24">Vai trò:</span>
                        <input
                          type="text"
                          value={j.role}
                          onChange={(e) => {
                            const updated = publicContent.judges.map((item: Judge) => item.id === j.id ? { ...item, role: e.target.value } : item);
                            setPublicContent({ ...publicContent, judges: updated });
                          }}
                          className="flex-1 bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-amber-400 font-semibold focus:outline-none focus:border-amber-400"
                          placeholder="Trưởng BGK, Giám khảo chuyên môn..."
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold shrink-0 w-24">Học vị / Danh hiệu:</span>
                        <input
                          type="text"
                          value={j.title}
                          onChange={(e) => {
                            const updated = publicContent.judges.map((item: Judge) => item.id === j.id ? { ...item, title: e.target.value } : item);
                            setPublicContent({ ...publicContent, judges: updated });
                          }}
                          className="flex-1 bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                          placeholder="ThS / Hoa hậu / Nghệ sĩ..."
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPublicContent({ ...publicContent, judges: publicContent.judges.filter((item: Judge) => item.id !== j.id) });
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                      title="Xóa giám khảo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const newJ: Judge = {
                    id: `j_${Date.now()}`,
                    name: "",
                    role: "",
                    title: "",
                    avatar: "/logo_icon.png?v=20260817"
                  };
                  setPublicContent({ ...publicContent, judges: [...publicContent.judges, newJ] });
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-amber-500/30 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
              >
                <Plus className="h-3.5 w-3.5 text-amber-400 group-hover:scale-125 transition-transform" />
                <span>Thêm giám khảo mới</span>
              </button>
            </div>

            {/* 3. Sponsors List */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/2 space-y-4">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">3. Danh sách Nhà tài trợ ({sponsorsData.sponsors.length})</h3>
              </div>

              <div className="space-y-3">
                {sponsorsData.sponsors.map((s: Sponsor) => (
                  <div key={s.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-amber-400/40 transition-all flex gap-4 items-center shadow-sm">
                    {/* Circular Logo Uploader - gold ring style */}
                    <label className="group relative h-16 w-16 rounded-full shrink-0 cursor-pointer block" style={{ background: 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)', padding: '2px' }}>
                      <div className="w-full h-full rounded-full bg-[#0a0d1a] overflow-hidden flex items-center justify-center p-1">
                        <img src={s.logo || "/logo_icon.png?v=20260817"} alt="Sponsor Logo" className="h-full w-full object-contain" />
                      </div>
                      <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                        <Upload className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-[8px] text-slate-200 mt-0.5">Thay logo</span>
                      </div>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const url = URL.createObjectURL(file); const updated = sponsorsData.sponsors.map((item: Sponsor) => item.id === s.id ? { ...item, logo: url } : item); setSponsorsData({ ...sponsorsData, sponsors: updated }); } }} className="hidden" />
                    </label>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold shrink-0 w-24">Nhà tài trợ:</span>
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) => {
                            const updated = sponsorsData.sponsors.map((item: Sponsor) => item.id === s.id ? { ...item, name: e.target.value } : item);
                            setSponsorsData({ ...sponsorsData, sponsors: updated });
                          }}
                          className="flex-1 bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                          placeholder="Tên nhà tài trợ..."
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSponsorsData({ ...sponsorsData, sponsors: sponsorsData.sponsors.filter((item: Sponsor) => item.id !== s.id) });
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                      title="Xóa nhà tài trợ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const newS: Sponsor = {
                    id: `s_${Date.now()}`,
                    name: "",
                    logo: "/logo_icon.png?v=20260817",
                    tier: ""
                  };
                  setSponsorsData({ ...sponsorsData, sponsors: [...sponsorsData.sponsors, newS] });
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-amber-500/30 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
              >
                <Plus className="h-3.5 w-3.5 text-amber-400 group-hover:scale-125 transition-transform" />
                <span>Thêm nhà tài trợ mới</span>
              </button>
            </div>
          </div>
        )}


        {/* FORM FOOTER NAVIGATION BUTTONS */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between max-w-3xl">
          <button
            type="button"
            disabled={activeStep === 1}
            onClick={() => handleStepChange((activeStep - 1) as StepId)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
              activeStep === 1
                ? "opacity-30 border-slate-800 text-slate-500 cursor-not-allowed"
                : "border-white/15 text-slate-300 hover:text-white hover:bg-white/5"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </button>

          {activeStep < 4 ? (
            <button
              type="button"
              onClick={() => handleStepChange((activeStep + 1) as StepId)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 hover:from-amber-200 hover:to-yellow-400 shadow-md transition-all cursor-pointer"
            >
              <span>Tiếp theo</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublishClick}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-amber-200 hover:to-yellow-300 shadow-lg transition-all cursor-pointer"
            >
              <Globe className="h-4 w-4" />
              <span>Hoàn tất & Xuất bản</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
