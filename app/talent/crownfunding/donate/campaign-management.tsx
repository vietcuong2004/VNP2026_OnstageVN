"use client";

import React, { useState } from "react";
import { List, Radio, TrendingUp, BarChart3, Heart, Eye, CheckCircle, Trash2, Sparkles, X, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DonationCampaign } from "@/app/talent/crownfunding/types";
import ProgressBar from "@/components/ui/ProgressBar";

// ==========================================
// Sub-component: CampaignDialog
// ==========================================
interface CampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campaign: Partial<DonationCampaign>) => void;
  campaign: DonationCampaign | null;
}

export function CampaignDialog({ isOpen, onClose, onSubmit, campaign }: CampaignDialogProps) {
  const [title, setTitle] = useState(() => campaign?.title || "");
  const [description, setDescription] = useState(() => campaign?.description || "");
  const [details, setDetails] = useState(() => campaign?.details || "");
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    () => campaign?.coverImages || (campaign?.coverImage ? [campaign.coverImage] : []),
  );
  const [goal, setGoal] = useState(() => campaign?.goal || 100000000);
  const [endDate, setEndDate] = useState(() => campaign?.endDate || "");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxNewFiles = 5 - uploadedImages.length;
    if (maxNewFiles <= 0) {
      alert("Đã đạt giới hạn tối đa 5 hình ảnh!");
      return;
    }

    const filesArray = Array.from(files).slice(0, maxNewFiles);
    if (filesArray.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setUploadProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);

        const newImages: string[] = [];
        let loadedCount = 0;

        filesArray.forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              newImages.push(reader.result);
            }
            loadedCount++;
            if (loadedCount === filesArray.length) {
              setUploadedImages((prev) => [...prev, ...newImages]);
              setUploading(false);
            }
          };
          reader.readAsDataURL(file);
        });
      }
    }, 150);
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      details,
      coverImage: uploadedImages[0] || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&h=400&q=80",
      coverImages: uploadedImages,
      goal: Number(goal),
      endDate: endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-md animate-in fade-in duration-300">
      <form onSubmit={handleSubmit} className="relative w-full max-w-xl bg-gradient-to-b from-[#0d101b] to-[#04060c] border border-amber-400/20 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden animate-in zoom-in-95 duration-300">
        {uploading && (
          <ProgressBar progress={uploadProgress} message="Đang tải hình ảnh chiến dịch lên..." />
        )}
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#050711]/90 backdrop-blur-md relative z-10">
          <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
            {campaign ? "Chỉnh sửa chiến dịch" : "Khởi tạo chiến dịch nhân ái"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar relative z-10">
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Tiêu đề chiến dịch</label>
            <input
              type="text"
              required
              placeholder="Nhập tiêu đề dự án gây quỹ..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Mô tả ngắn</label>
            <textarea
              required
              placeholder="Mô tả mục đích và ý nghĩa dự án..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Nội dung chi tiết</label>
            <textarea
              placeholder="Nhập thông tin chi tiết, kế hoạch hành động..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] text-slate-400 font-bold uppercase block tracking-widest">Hình ảnh chiến dịch (Tối đa 5 ảnh)</label>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-5 gap-2.5 mb-2">
                {uploadedImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-slate-950 group">
                    <img src={imgUrl} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 h-5 w-5 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-center text-slate-300 py-0.5 font-bold uppercase">
                      {idx === 0 ? "Ảnh bìa" : `Ảnh ${idx + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {uploadedImages.length < 5 ? (
              <label className="flex flex-col items-center justify-center border border-dashed border-white/15 rounded-2xl p-6 bg-slate-950/40 hover:bg-slate-950/60 hover:border-amber-400/30 cursor-pointer transition-all">
                <Upload className="h-6 w-6 text-slate-500 mb-2" />
                <span className="text-[10px] text-slate-300 font-bold">Tải ảnh lên từ thiết bị</span>
                <span className="text-[8px] text-slate-500 mt-1">Hỗ trợ JPG, PNG. Có thể chọn nhiều ảnh. Còn lại {5 - uploadedImages.length} lượt.</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="text-[9px] text-amber-400 font-black text-center bg-amber-500/5 border border-amber-500/20 rounded-xl py-3 tracking-widest uppercase">
                ✓ Đã tải lên tối đa 5 hình ảnh
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Ngân sách mục tiêu (VNĐ)</label>
              <input
                type="number"
                required
                min={1000000}
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Ngày kết thúc</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-white/5 bg-[#050711]/90 backdrop-blur-md relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-gold font-display text-xs font-black text-slate-950 hover:shadow-[0_0_20px_rgba(240,197,107,0.35)] hover:scale-[1.02] active:scale-98 transition-all duration-305 cursor-pointer"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// Sub-component: CampaignListPanel
// ==========================================
interface CampaignListPanelProps {
  campaigns: DonationCampaign[];
  activeCampaignId: string | number | null;
  onSelect: (id: string | number) => void;
  onDelete: (id: string | number) => void;
  onEnd: (id: string | number) => void;
}

export function CampaignListPanel({ campaigns, activeCampaignId, onSelect, onDelete, onEnd }: CampaignListPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const totalRaised = campaigns.reduce((s, c) => s + c.raised, 0);
  const totalGoal = campaigns.reduce((s, c) => s + c.goal, 0);
  const activeCount = campaigns.filter(c => c.status === "active").length;
  const completedCount = campaigns.filter(c => c.status === "closed").length;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/7 bg-gradient-to-b from-[#0d101b]/80 to-[#050712]/92 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/4 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Header */}
      <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 border border-amber-400/20">
            <List className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">Quản lý danh sách chiến dịch</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{campaigns.length} chiến dịch · {activeCount} đang hoạt động · {completedCount} đã kết thúc</p>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
            {[
              { label: "Tổng chiến dịch", val: campaigns.length.toString(), color: "text-white", icon: <List className="h-3.5 w-3.5" /> },
              { label: "Đang hoạt động", val: activeCount.toString(), color: "text-amber-400", icon: <Radio className="h-3.5 w-3.5" /> },
              { label: "Tổng đã nhận", val: totalRaised.toLocaleString() + "đ", color: "text-amber-300", icon: <TrendingUp className="h-3.5 w-3.5" /> },
              { label: "Tổng mục tiêu", val: totalGoal.toLocaleString() + "đ", color: "text-slate-300", icon: <BarChart3 className="h-3.5 w-3.5" /> },
            ].map((s, i) => (
              <div key={i} className="bg-slate-950/50 border border-white/5 rounded-2xl px-2.5 py-2.5 sm:px-3 sm:py-3 flex items-center gap-2 sm:gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#d4af37]">
                  {s.icon}
                </div>
                <div>
                  <span className="block text-[7px] text-slate-500 font-black uppercase tracking-widest">{s.label}</span>
                  <span className={cn("block font-display font-black text-[10px] xs:text-xs mt-0.5", s.color)}>{s.val}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Campaign cards - horizontal scroll on mobile, grid on md+ */}
          {campaigns.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="h-12 w-12 mx-auto rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
                <Heart className="h-6 w-6 text-amber-400/60 animate-pulse" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Chưa có chiến dịch nào. Hãy tạo chiến dịch đầu tiên!</p>
            </div>
          ) : (
            <>
              {/* Mobile: horizontal scroll with snap */}
              <div className="md:hidden -mx-6 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex snap-x snap-mandatory gap-4 pb-3 pl-6 pr-6">
                  {campaigns.map((camp) => {
                    const isActive = camp.id === activeCampaignId;
                    const progressPct = Math.min(100, Math.round((camp.raised / camp.goal) * 100));
                    return (
                      <div
                        key={camp.id}
                        onClick={() => onSelect(camp.id!)}
                        className={cn(
                          "group relative flex-shrink-0 snap-center overflow-hidden rounded-2xl border p-4 transition-all duration-305 bg-gradient-to-b w-[calc(100vw-5.5rem)] cursor-pointer hover:border-white/12",
                          isActive
                            ? "border-amber-400/50 from-[#1a1305]/88 to-[#070913]/96 shadow-[0_0_22px_rgba(245,158,11,0.18)]"
                            : "border-white/8 from-[#0d101b]/80 to-[#050712]/92"
                        )}
                      >
                        {isActive && <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-amber-400/15 blur-xl pointer-events-none" />}
                        <div className="h-36 w-full rounded-xl overflow-hidden mb-3 bg-slate-950 border border-white/5 relative">
                          <img src={camp.coverImage} alt={camp.title} className="w-full h-full object-cover opacity-70" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                            <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider",
                              camp.status === "active" ? "border-amber-400/30 bg-amber-400/15 text-amber-300" : "border-slate-500/30 bg-slate-800/60 text-slate-400")}>
                              <span className={cn("h-1 w-1 rounded-full", camp.status === "active" ? "bg-amber-400 animate-pulse" : "bg-slate-500")} />
                              {camp.status === "active" ? "Đang hoạt động" : "Đã kết thúc"}
                            </span>
                            {isActive && (
                              <span className="inline-flex items-center gap-1 rounded border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-cyan-300">
                                <Eye className="h-2.5 w-2.5" /> Đang xem
                              </span>
                            )}
                          </div>
                        </div>
                        <h4 className="text-[11px] font-extrabold text-white leading-snug mb-1 line-clamp-2">{camp.title}</h4>
                        <p className="text-[9px] text-slate-500 font-mono mb-3">{camp.startDate} → {camp.endDate}</p>
                        <div className="space-y-1.5 mb-3">
                          <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                            <span>{camp.raised.toLocaleString()}đ nhận được</span>
                            <span className="text-amber-400">{progressPct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden border border-white/5">
                            <div className="h-full rounded-full bg-gradient-gold shadow-[0_0_8px_rgba(245,158,11,0.4)] transition-all duration-500" style={{ width: `${progressPct}%` }} />
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-600 font-bold">
                            <span>{camp.supportersCount} lượt ủng hộ</span>
                            <span>Mục tiêu: {camp.goal.toLocaleString()}đ</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(camp.id!);
                            }}
                            className={cn("flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-205 cursor-pointer",
                              isActive ? "bg-amber-400/15 border border-amber-400/30 text-amber-300" : "bg-white/5 border border-white/10 text-slate-400")}
                          >
                            <Eye className="h-3 w-3" /> {isActive ? "Đang xem" : "Xem chi tiết"}
                          </button>
                          {camp.status === "active" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEnd(camp.id!);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition-colors cursor-pointer"
                              title="Kết thúc"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(camp.id!);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tablet/Desktop: grid layout */}
              <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {campaigns.map((camp) => {
                  const isActive = camp.id === activeCampaignId;
                  const progressPct = Math.min(100, Math.round((camp.raised / camp.goal) * 100));
                  return (
                    <div
                      key={camp.id}
                      onClick={() => onSelect(camp.id!)}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border p-4 transition-all duration-305 cursor-pointer bg-gradient-to-b hover:border-white/15 hover:shadow-md",
                        isActive
                          ? "border-amber-400/50 from-[#1a1305]/88 to-[#070913]/96 shadow-[0_0_22px_rgba(245,158,11,0.18)]"
                          : "border-white/8 from-[#0d101b]/80 to-[#050712]/92"
                      )}
                    >
                      {isActive && <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-amber-400/15 blur-xl pointer-events-none" />}
                      <div className="h-28 w-full rounded-xl overflow-hidden mb-3 bg-slate-950 border border-white/5 relative">
                        <img src={camp.coverImage} alt={camp.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-85 transition-opacity duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                          <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider",
                            camp.status === "active" ? "border-amber-400/30 bg-amber-400/15 text-amber-300" : "border-slate-500/30 bg-slate-800/60 text-slate-400")}>
                            <span className={cn("h-1 w-1 rounded-full", camp.status === "active" ? "bg-amber-400 animate-pulse" : "bg-slate-500")} />
                            {camp.status === "active" ? "Đang hoạt động" : "Đã kết thúc"}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 rounded border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-cyan-300">
                              <Eye className="h-2.5 w-2.5" /> Đang xem
                            </span>
                          )}
                        </div>
                      </div>
                      <h4 className="text-[11px] font-extrabold text-white leading-snug mb-1 line-clamp-2 hover:text-amber-300 transition-colors">{camp.title}</h4>
                      <p className="text-[9px] text-slate-500 font-mono mb-3">{camp.startDate} → {camp.endDate}</p>
                      <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                          <span>{camp.raised.toLocaleString()}đ nhận được</span>
                          <span className="text-amber-400">{progressPct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden border border-white/5">
                          <div className="h-full rounded-full bg-gradient-gold shadow-[0_0_8px_rgba(245,158,11,0.4)] transition-all duration-500" style={{ width: `${progressPct}%` }} />
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-600 font-bold">
                          <span>{camp.supportersCount} lượt ủng hộ</span>
                          <span>Mục tiêu: {camp.goal.toLocaleString()}đ</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(camp.id!);
                          }}
                          className={cn("flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer",
                            isActive ? "bg-amber-400/15 border border-amber-400/30 text-amber-300" : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10")}
                        >
                          <Eye className="h-3 w-3" /> {isActive ? "Đang xem" : "Xem chi tiết"}
                        </button>
                        {camp.status === "active" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEnd(camp.id!);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition-colors cursor-pointer"
                            title="Kết thúc chiến dịch"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(camp.id!);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
                          title="Xóa chiến dịch"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
