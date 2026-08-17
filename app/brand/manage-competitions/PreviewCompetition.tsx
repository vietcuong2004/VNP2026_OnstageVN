"use client";

import React from "react";
import {
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Sparkles,
  Users,
  Target,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  Globe,
  FileText,
  ChevronRight,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GeneralInfoState,
  TimelineDataState,
  RegistrationDataState,
  PublicContentState,
  SponsorsDataState
} from "./types";

interface PreviewCompetitionProps {
  generalInfo: GeneralInfoState;
  timelineData: TimelineDataState;
  registrationData: RegistrationDataState;
  publicContent: PublicContentState;
  sponsorsData: SponsorsDataState;
  previewDevice: "desktop" | "tablet" | "mobile";
  setPreviewDevice: React.Dispatch<React.SetStateAction<"desktop" | "tablet" | "mobile">>;
  setIsFullscreenPreview: (value: boolean) => void;
  previewScrollRef: React.RefObject<HTMLDivElement | null>;
  isMobileView?: boolean;
}

const formatDateStr = (s?: string) => {
  if (!s) return "";
  const [d] = s.split("T");
  if (!d) return s;
  const parts = d.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return s;
};

export const formatDateRange = (startStr?: string, endStr?: string, legacyTimeline?: string) => {
  if (startStr && endStr) {
    if (startStr === endStr) return formatDateStr(startStr);
    return `${formatDateStr(startStr)} - ${formatDateStr(endStr)}`;
  }
  if (startStr || endStr) return formatDateStr(startStr || endStr);
  return legacyTimeline || "Chưa thiết lập";
};

export default function PreviewCompetition({
  generalInfo,
  timelineData,
  registrationData,
  publicContent,
  sponsorsData,
  previewDevice,
  setPreviewDevice,
  setIsFullscreenPreview,
  previewScrollRef,
  isMobileView = false
}: PreviewCompetitionProps) {
  const getPreviewDeviceWidthClass = () => {
    if (isMobileView) return "w-full max-w-lg mx-auto";
    switch (previewDevice) {
      case "tablet":
        return "w-[768px] max-w-full";
      case "mobile":
        return "w-[375px] max-w-full";
      default:
        return "w-full";
    }
  };

  return (
    <section
      className={cn(
        "shrink-0 flex flex-col bg-[#04060f] border-l border-white/10",
        isMobileView ? "w-full flex-1" : "hidden lg:flex w-[460px] xl:w-[530px] 2xl:w-[600px]"
      )}
    >
      {/* Preview Toolbar (Shown only on Desktop view) */}
      {!isMobileView && (
        <div className="h-12 border-b border-white/10 bg-[#090d1f] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Eye className="h-4 w-4" />
            <span>Xem trước Landing Page</span>
          </div>

          {/* Device switcher */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={cn("p-1.5 rounded-md text-xs transition-colors cursor-pointer", previewDevice === "desktop" ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white")}
              title="Màn hình Desktop"
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("tablet")}
              className={cn("p-1.5 rounded-md text-xs transition-colors cursor-pointer", previewDevice === "tablet" ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white")}
              title="Màn hình Tablet"
            >
              <Tablet className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={cn("p-1.5 rounded-md text-xs transition-colors cursor-pointer", previewDevice === "mobile" ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white")}
              title="Màn hình Mobile"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreenPreview(true)}
            className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Mở toàn màn hình"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Device Mockup Wrapper */}
      <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-[#020308]">
        <div
          className={cn(
            "bg-[#050711] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col h-full",
            getPreviewDeviceWidthClass()
          )}
        >
          <div ref={previewScrollRef} className="flex-1 overflow-y-auto space-y-8 pb-12">
            {/* 1. Header Bar */}
            <header className="p-4 border-b border-white/10 flex items-center justify-between bg-[#050711]/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-2 min-w-0">
                <div className="shrink-0" style={{ background: 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)', padding: '1.5px', borderRadius: '50%' }}>
                  <div className="h-7 w-7 rounded-full bg-[#0a0d1a] overflow-hidden flex items-center justify-center">
                    <img src={generalInfo.logoUrl || "/logo_icon.png?v=20260817"} alt="Logo" className="h-full w-full object-contain" />
                  </div>
                </div>
                <span className="text-xs font-bold text-white truncate">{generalInfo.name}</span>
              </div>
              <button className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-md hover:from-amber-300 hover:to-yellow-400 transition-all">
                Đăng ký ngay
              </button>
            </header>

            {/* 2. Hero Section */}
            <section id="preview-hero" className="relative px-5 pt-3">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 p-6 flex flex-col items-center justify-end min-h-[220px] aspect-[16/9] w-full">
                <img src={generalInfo.coverDesktop} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-45" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050711] via-[#050711]/75 to-transparent" />

                <div className="relative z-10 space-y-2.5 text-center w-full">
                  {generalInfo.category && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold bg-amber-400/15 border border-amber-400/30 text-amber-300 uppercase tracking-wider">
                      <Trophy className="h-3 w-3" />
                      {generalInfo.category}
                    </span>
                  )}
                  <h1 className="text-lg sm:text-xl font-black text-white leading-tight">{generalInfo.name}</h1>
                  {generalInfo.slogan && (
                    <p className="text-[11px] text-amber-300 italic font-medium">"{generalInfo.slogan}"</p>
                  )}
                  {generalInfo.shortDesc && (
                    <p className="text-[10px] text-slate-300 max-w-md mx-auto line-clamp-3 leading-relaxed">{generalInfo.shortDesc}</p>
                  )}

                  {/* Metadata Tags Container */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 text-[9px] font-bold">
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-slate-300 rounded-md flex items-center gap-1">
                      <Globe className="h-3 w-3 text-amber-400 shrink-0" />
                      <span>{generalInfo.scope || "Toàn quốc"}</span>
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. About Section: Category + Mô tả cuộc thi */}
            {(generalInfo.category || generalInfo.richIntro || generalInfo.shortDesc) && (
              <section id="preview-about" className="px-5 space-y-3">

                {/* Rich intro or fallback to shortDesc */}
                {(generalInfo.richIntro || generalInfo.shortDesc) && (
                  <div className="p-3.5 rounded-xl border border-white/5 bg-slate-900/40 space-y-1.5">
                    <p className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Giới thiệu cuộc thi</p>
                    <p className="text-[10.5px] text-slate-300 leading-relaxed">
                      {generalInfo.richIntro || generalInfo.shortDesc}
                    </p>
                  </div>
                )}
              </section>
            )}


            {/* 4. Hierarchical Timeline Section */}
            {timelineData.phases && timelineData.phases.length > 0 && (
              <section id="preview-timeline" className="px-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    <span>Lịch trình & Tiến độ</span>
                  </h3>
                </div>

                <div className="space-y-4">
                  {timelineData.phases.map((phase) => (
                    <div key={phase.id} className="rounded-xl border border-amber-500/20 bg-slate-900/90 overflow-hidden space-y-2">
                      {/* Main Phase Banner */}
                      <div className="px-3 py-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shrink-0">
                            {phase.code}
                          </span>
                          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">{phase.publicName}</h4>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-300 bg-black/40 px-2 py-0.5 rounded border border-white/10 w-fit shrink-0">
                          {formatDateRange(phase.startDate, phase.endDate, phase.timeline)}
                        </span>
                      </div>

                      {/* Sub-activities List */}
                      <div className="p-2.5 space-y-2">
                        {phase.activities && phase.activities.length > 0 ? (
                          phase.activities.map((act) => (
                            <div key={act.id} className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                              <div className="flex items-start gap-2">
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded shrink-0">
                                  {act.stt}
                                </span>
                                <p className="text-[11px] font-semibold text-white leading-snug">{act.title}</p>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 pl-7">
                                {act.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                                    <span>{act.location}</span>
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-amber-300/80 font-medium">
                                  <Clock className="h-3 w-3 text-amber-400/80 shrink-0" />
                                  <span>{formatDateRange(act.startDate, act.endDate, act.timeline)}</span>
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10.5px] text-slate-500 italic text-center py-1">Chưa thiết lập hoạt động</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 5. Step 3 – Thời hạn & Điều kiện tham gia */}
            {(registrationData.startDate || registrationData.deadlineDate ||
              (registrationData.conditions && registrationData.conditions.length > 0)) && (
                <section id="preview-requirements" className="px-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-amber-400" />
                      <span>Yêu cầu</span>
                    </h3>
                  </div>

                  {/* Registration period row */}
                  {(registrationData.startDate || registrationData.deadlineDate) && (
                    <div className="flex flex-wrap gap-2.5">
                      {registrationData.startDate && (
                        <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-900/60 text-[9.5px] text-slate-300 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-amber-400 shrink-0" />
                          <span className="text-slate-500 mr-0.5">Mở cổng:</span>
                          <span className="font-bold text-white">{formatDateStr(registrationData.startDate)}</span>
                        </div>
                      )}
                      {registrationData.deadlineDate && (
                        <div className="px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-[9.5px] text-slate-300 flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-amber-400 shrink-0" />
                          <span className="text-slate-500 mr-0.5">Hạn chót:</span>
                          <span className="font-bold text-amber-300">{formatDateStr(registrationData.deadlineDate)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Conditions list */}
                  {registrationData.conditions && registrationData.conditions.length > 0 && (
                    <div className="space-y-2">
                      {registrationData.conditions.map((cond) => (
                        <div key={cond.id} className="p-2.5 rounded-xl border border-white/5 bg-slate-900/60 flex gap-2.5 items-start">
                          <ShieldCheck className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                          <div className="space-y-0.5 flex-1">
                            <h5 className="text-[10.5px] font-bold text-white leading-tight">{cond.title}</h5>
                            {cond.desc && <p className="text-[9.5px] text-slate-400 leading-relaxed">{cond.desc}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

            {/* 6. Judges List (Step 4: publicContent.judges) */}
            {publicContent.judges && publicContent.judges.length > 0 && (
              <section id="preview-judges" className="px-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span>Hội đồng Ban giám khảo</span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {publicContent.judges.map((j) => (
                    <div key={j.id} className="p-3 rounded-xl border border-white/5 bg-slate-900/60 flex flex-col items-center text-center space-y-2 shadow-sm">
                      <div className="h-14 w-14 shrink-0" style={{ background: 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)', padding: '2px', borderRadius: '50%' }}>
                        <div className="w-full h-full rounded-full bg-[#0a0d1a] overflow-hidden flex items-center justify-center">
                          <img src={j.avatar || "/logo_icon.png?v=20260817"} alt={j.name} className="h-full w-full object-cover" />
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-[11px] font-bold text-white line-clamp-1 leading-snug">{j.name}</h4>
                        {j.role && (
                          <p className="text-[9px] font-semibold text-amber-400 line-clamp-1 leading-none">{j.role}</p>
                        )}
                        {j.title && (
                          <p className="text-[8.5px] text-slate-400 line-clamp-1 leading-tight">{j.title}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 7. Registration Call to Action */}
            <section id="preview-registration-cta" className="px-5">
              <div className="p-4.5 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-yellow-600/5 to-slate-950 space-y-3.5 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-amber-400/5 rounded-full blur-2xl" />
                <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">Cổng đăng ký đang mở</h3>
                <p className="text-[10px] text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Các hồ sơ nộp trực tuyến hợp lệ sẽ được chuyển thẳng tới Hội đồng Tuyển sinh kiểm duyệt. Hãy đăng ký ngay trước khi cổng tuyển sinh đóng lại!
                </p>
                <div className="text-[10px] text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg w-fit mx-auto">
                  Hạn nhận hồ sơ: {formatDateStr(registrationData.deadlineDate)}
                </div>

                <div className="pt-1.5">
                  <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer">
                    Nộp hồ sơ trực tuyến ngay
                  </button>
                </div>
              </div>
            </section>

            {/* 8. Gallery Section */}
            {generalInfo.images && generalInfo.images.length > 0 && (
              <section id="preview-gallery" className="px-5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-amber-400" />
                    <span>Bộ ảnh cuộc thi</span>
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {generalInfo.images.slice(0, 6).map((img, i) => (
                    <div key={i} className="aspect-video rounded-xl overflow-hidden border border-white/5 bg-slate-950 shadow-inner group cursor-pointer relative">
                      <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 9. Organizers & Sponsors Section */}
            <section id="preview-sponsors" className="px-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-400" />
                  <span>Đồng hành cùng cuộc thi</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Organizer */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex gap-3 items-center">
                  <div className="shrink-0" style={{ background: 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)', padding: '2px', borderRadius: '50%' }}>
                    <div className="h-10 w-10 rounded-full bg-[#0a0d1a] overflow-hidden flex items-center justify-center p-0.5">
                      <img src={sponsorsData.organizer.logo || "/logo_icon.png?v=20260817"} alt="Organizer" className="h-full w-full object-contain" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-wide">Đơn vị tổ chức</p>
                    <h4 className="text-[11px] font-bold text-white leading-tight truncate">{sponsorsData.organizer.name}</h4>
                  </div>
                </div>

                {/* Contact Simple Info */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-center space-y-1 text-[9.5px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Phone className="h-3 w-3 text-amber-400 shrink-0" />
                    <span className="font-semibold">{sponsorsData.contact.hotline}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Mail className="h-3 w-3 text-amber-400 shrink-0" />
                    <span className="truncate">{sponsorsData.contact.email}</span>
                  </div>
                </div>
              </div>

              {/* Sponsors list */}
              {sponsorsData.sponsors && sponsorsData.sponsors.length > 0 && (
                <div className="space-y-2 text-center pt-2">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Nhà tài trợ chính thức</p>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {sponsorsData.sponsors.map((s) => (
                      <div key={s.id} className="py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 shadow-sm">
                        <div className="shrink-0" style={{ background: 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)', padding: '1.5px', borderRadius: '50%' }}>
                          <div className="h-8 w-8 rounded-full bg-[#0a0d1a] overflow-hidden flex items-center justify-center p-0.5">
                            <img src={s.logo || "/logo_icon.png?v=20260817"} alt={s.name} className="h-full w-full object-contain" />
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-bold text-white leading-tight">{s.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 10. Footer */}
            <footer className="px-5 pt-6 border-t border-white/10 text-center space-y-2 text-[9px] text-slate-500">
              {sponsorsData.contact.address && (
                <p className="max-w-md mx-auto leading-relaxed">Địa chỉ: {sponsorsData.contact.address}</p>
              )}
              <p>© 2026 {generalInfo.name || "BTC"}. Bản quyền thuộc về Đơn vị tổ chức.</p>
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
}
