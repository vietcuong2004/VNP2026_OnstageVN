"use client";

import React, { useState, useEffect } from "react";
import {
  Crown,
  Heart,
  Share2,
  Users,
  Award,
  Plus,
  Download,
  Copy,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  Coins,
  Link as LinkIcon,
  CheckCircle,
  FileText,
  Upload,
  X,
  Image as ImageIcon,
  Clock,
  Sparkles,
  DollarSign,
  Calendar,
  Info,
  Radio,
  ArrowUpRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DonationCampaign, UpdateLog, Supporter, PayoutRequest } from "@/app/talent/crownfunding/types";
import { useCrownfundingToast } from "../_context/toast-context";
import ProgressBar from "@/components/ui/ProgressBar";

// ==========================================
// Sub-component: ActivityLog
// ==========================================
interface ActivityLogProps {
  updates: UpdateLog[];
  onAddUpdate: () => void;
}

function ActivityLog({ updates, onAddUpdate }: ActivityLogProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/7 bg-gradient-to-b from-[#0d101b]/80 to-[#050712]/92 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent"></div>
      {/* Subtle gold accent light */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-3">
        <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-amber-400" /> Nhật ký cập nhật tiến độ
        </h3>
        <div className="flex items-center">
          <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-amber-400/30 bg-amber-400/10 text-amber-300 mr-3">
            Cập Nhật
          </span>
          <button
            onClick={onAddUpdate}
            className="flex h-8 px-3.5 items-center gap-1.5 bg-gradient-gold hover:shadow-[0_0_15px_rgba(240,197,107,0.25)] hover:scale-[1.02] active:scale-98 rounded-lg text-[10px] font-black text-slate-950 uppercase tracking-widest transition-all duration-300 cursor-pointer"
            style={{ color: "#02040a" }}
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" /> Viết cập nhật
          </button>
        </div>
      </div>

      <div className="space-y-6 mt-4">
        {updates.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Chưa có bài đăng nhật ký hoạt động nào.</p>
        ) : (
          updates.map((log) => (
            <div key={log.id} className="border-b border-white/5 last:border-transparent pb-6 last:pb-0 space-y-3 animate-in fade-in duration-300">
              <div className="flex justify-between items-start gap-2">
                <h4 className="text-xs font-extrabold text-white leading-snug hover:text-amber-300 transition-colors">{log.title}</h4>
                <span className="text-[9px] font-mono font-bold text-[#F0C56B] bg-[#071B42]/45 px-2 py-0.5 rounded border border-[#D4A64A]/30 shrink-0">
                  {log.date}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">{log.content}</p>
              {log.image && (
                <div className="h-36 max-w-md rounded-2xl overflow-hidden border border-white/5 bg-slate-950 shadow-lg">
                  <img src={log.image} alt={log.title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// ==========================================
// Sub-component: MilestoneList
// ==========================================
interface MilestoneListProps {
  raised: number;
  disbursed: number;
  payouts: PayoutRequest[];
  onRequestPayout: () => void;
}

function MilestoneList({ raised, disbursed, payouts, onRequestPayout }: MilestoneListProps) {
  const availableToRequest = raised - disbursed;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/7 bg-gradient-to-b from-[#0d101b]/80 to-[#050712]/92 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent"></div>
      {/* Subtle gold accent light */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-3">
        <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
          <Coins className="h-4.5 w-4.5 text-amber-400" /> Luồng giải ngân dòng tiền
        </h3>
        <div className="flex items-center">
          <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-emerald-400/30 bg-emerald-400/10 text-emerald-300 mr-3">
            Tài Chính
          </span>
          <button
            onClick={onRequestPayout}
            disabled={availableToRequest <= 0}
            className="flex h-8 px-3.5 items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 active:scale-98 hover:scale-[1.02] rounded-lg text-[10px] font-black text-slate-955 uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <Upload className="h-3.5 w-3.5 stroke-[3]" /> Gửi yêu cầu giải ngân
          </button>
        </div>
      </div>

      {/* Financial calculation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/50 backdrop-blur-md border border-white/5 rounded-2xl p-5 text-xs font-semibold text-slate-400 mt-4">
        <div className="space-y-1">
          <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest">Tổng quỹ nhận</span>
          <span className="text-white font-mono font-extrabold text-sm">{raised.toLocaleString()}đ</span>
        </div>
        <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-5">
          <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest">Đã giải ngân thực tế</span>
          <span className="text-emerald-400 font-mono font-extrabold text-sm">{disbursed.toLocaleString()}đ</span>
        </div>
        <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-5">
          <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest">Khả dụng có thể xin rút</span>
          <span className="text-amber-300 font-mono font-extrabold text-sm">{availableToRequest.toLocaleString()}đ</span>
        </div>
      </div>

      {/* Payout requests list */}
      <div className="space-y-4 mt-6">
        <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest">Lịch sử yêu cầu giải ngân</span>
        {payouts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Chưa gửi yêu cầu giải ngân nào.</p>
        ) : (
          <div className="space-y-3">
            {payouts.map((pay) => (
              <div key={pay.id} className="flex justify-between items-center gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-4 text-xs hover:border-amber-400/20 transition-all duration-300">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-white">{pay.amount.toLocaleString()}đ</span>
                    <span className="text-[9px] text-slate-500 font-mono font-bold">({pay.date})</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{pay.reason}</p>
                  {pay.filesCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-[8px] text-[#F0C56B] bg-[#071B42]/30 px-2.5 py-0.5 rounded border border-[#D4A64A]/20 font-bold uppercase tracking-wider">
                      <FileText className="h-3 w-3" /> Đính kèm {pay.filesCount} chứng từ
                    </span>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  {pay.status === "approved" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[9px] font-black uppercase text-emerald-400 tracking-wider">
                      <CheckCircle className="h-3 w-3" /> Đã Duyệt
                    </span>
                  )}
                  {pay.status === "pending" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[9px] font-black uppercase text-amber-400 tracking-wider animate-pulse">
                      <Clock className="h-3 w-3" /> Đang Xét
                    </span>
                  )}
                  {pay.status === "rejected" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-[9px] font-black uppercase text-red-400 tracking-wider">
                      <AlertCircle className="h-3 w-3" /> Từ Chối
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ==========================================
// Sub-component: CampaignDialog
// ==========================================
interface CampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campaign: Partial<DonationCampaign>) => void;
  campaign: DonationCampaign | null;
}

function CampaignDialog({ isOpen, onClose, onSubmit, campaign }: CampaignDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [goal, setGoal] = useState(100000000);
  const [endDate, setEndDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (campaign) {
      setTitle(campaign.title);
      setDescription(campaign.description);
      setDetails(campaign.details || "");
      setUploadedImages(campaign.coverImages || (campaign.coverImage ? [campaign.coverImage] : []));
      setGoal(campaign.goal);
      setEndDate(campaign.endDate);
    } else {
      setTitle("");
      setDescription("");
      setDetails("");
      setUploadedImages([]);
      setGoal(100000000);
      setEndDate("");
    }
  }, [campaign, isOpen]);

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
        {/* Subtle gold accent light */}
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

            {/* Grid of existing/preview images */}
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

            {/* Upload button area */}
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
// Sub-component: UpdateDialog
// ==========================================
interface UpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string, image: string) => void;
}

function UpdateDialog({ isOpen, onClose, onSubmit }: UpdateDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setUploadProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setImage(reader.result);
          }
          setUploading(false);
        };
        reader.readAsDataURL(files[0]);
      }
    }, 120);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit(title, content, image);
    // Reset form
    setTitle("");
    setContent("");
    setImage("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-md animate-in fade-in duration-300">
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg bg-gradient-to-b from-[#0d101b] to-[#04060c] border border-amber-400/20 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden animate-in zoom-in-95 duration-300">
        {uploading && (
          <ProgressBar progress={uploadProgress} message="Đang tải hình ảnh hoạt động lên..." />
        )}
        {/* Subtle gold accent light */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#050711]/90 backdrop-blur-md relative z-10">
          <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Plus className="h-4.5 w-4.5 text-amber-400" /> Đăng nhật ký tiến độ dự án
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Tiêu đề bài cập nhật</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Đã nhận hơn 500 cuốn sách đầu tiên..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Nội dung cập nhật chi tiết</label>
            <textarea
              required
              placeholder="Nội dung tiến hành dự án..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] text-slate-400 font-bold uppercase block tracking-widest">Hình ảnh hoạt động (Tải lên từ máy tính hoặc nhập Link)</label>
            
            {image ? (
              <div className="relative aspect-video max-w-xs mx-auto rounded-xl overflow-hidden border border-white/10 bg-slate-950 group">
                <img src={image} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="absolute top-1.5 right-1.5 h-6 w-6 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center border border-dashed border-white/15 rounded-2xl p-4 bg-slate-950/40 hover:bg-slate-950/60 hover:border-amber-400/30 cursor-pointer transition-all">
                  <Upload className="h-5 w-5 text-slate-500 mb-1" />
                  <span className="text-[10px] text-slate-300 font-bold">Chọn ảnh từ máy tính</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Hoặc nhập link ảnh</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <input
                  type="text"
                  placeholder="Nhập URL ảnh (http://...)"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-700"
                />
              </div>
            )}
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
            Đăng bài viết
          </button>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// Sub-component: PayoutDialog
// ==========================================
interface PayoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason: string, fileAttached: boolean) => void;
  maxAmount: number;
}

function PayoutDialog({ isOpen, onClose, onSubmit, maxAmount }: PayoutDialogProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [fileAttached, setFileAttached] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachedFileName, setAttachedFileName] = useState("");
  const [attachedFilePreview, setAttachedFilePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    setUploadProgress(0);
    setAttachedFileName(file.name);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setUploadProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setAttachedFilePreview(reader.result);
          }
          setFileAttached(true);
          setUploading(false);
        };
        reader.readAsDataURL(file);
      }
    }, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const val = Number(amount);
    if (!val || val <= 0) {
      setErrorMsg("Số tiền phải lớn hơn 0");
      return;
    }

    if (val > maxAmount) {
      setErrorMsg("Số tiền yêu cầu vượt quá số dư giải ngân khả dụng!");
      return;
    }

    if (!reason.trim()) {
      setErrorMsg("Vui lòng điền lý do giải ngân");
      return;
    }

    onSubmit(val, reason, fileAttached);
    // Reset form
    setAmount("");
    setReason("");
    setFileAttached(false);
    setAttachedFileName("");
    setAttachedFilePreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-md animate-in fade-in duration-300">
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg bg-gradient-to-b from-[#0d101b] to-[#04060c] border border-amber-400/20 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden animate-in zoom-in-95 duration-300">
        {uploading && (
          <ProgressBar progress={uploadProgress} message="Đang tải chứng từ lên..." colorClass="text-emerald-400" />
        )}
        {/* Subtle gold accent light */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#050711]/90 backdrop-blur-md relative z-10">
          <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Coins className="h-4.5 w-4.5 text-amber-400" /> Tạo yêu cầu giải ngân ngân sách
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 relative z-10">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 font-bold">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Số tiền cần rút giải ngân (VNĐ)</label>
            <input
              type="number"
              required
              min={100000}
              placeholder="Nhập số tiền..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-700"
            />
            <span className="block text-[8.5px] text-slate-500 font-bold uppercase tracking-wider mt-1">
              Số dư tối đa có thể rút: <b className="text-slate-300">{maxAmount.toLocaleString()}đ</b>
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Lý do giải ngân & mục đích sử dụng</label>
            <textarea
              required
              placeholder="Ví dụ: Đóng đợt 2 cho đơn vị thi công lắp đặt kệ tủ sách gỗ tại 5 phòng học..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] text-slate-400 font-bold uppercase block tracking-widest">Đính kèm hóa đơn / chứng từ / ảnh thực tế</label>
            
            <label className="block">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="payout-file-upload"
              />
              <div
                className={cn(
                  "border border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all",
                  fileAttached ? "border-emerald-500 bg-emerald-500/5 text-emerald-400" : "border-white/10 text-slate-400 hover:bg-white/2"
                )}
              >
                {fileAttached ? (
                  <div className="space-y-2">
                    {attachedFilePreview && (attachedFilePreview.startsWith("data:image/") || attachedFileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                      <div className="relative aspect-video max-w-[120px] mx-auto rounded-lg overflow-hidden border border-white/10 bg-slate-950">
                        <img src={attachedFilePreview} alt="payout preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <FileText className="h-6 w-6 mx-auto text-emerald-400" />
                    )}
                    <span className="text-[10px] font-bold block">✓ Đã đính kèm: {attachedFileName}</span>
                    <span className="text-[8px] text-slate-500">(Nhấp để chọn file khác)</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mx-auto mb-2 text-slate-500" />
                    <span className="text-[10px] font-medium block">Tải lên hóa đơn chi phí hoặc hình ảnh triển khai thực địa đính kèm</span>
                    <span className="text-[8px] text-slate-500 mt-1 block">Hỗ trợ các file hình ảnh hoặc tài liệu chứng từ</span>
                  </>
                )}
              </div>
            </label>
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
            Gửi yêu cầu
          </button>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// Sub-component: CampaignStatsGrid
// ==========================================
interface CampaignStatsGridProps {
  raised: number;
  goal: number;
  supportersCount: number;
  disbursed: number;
}

function CampaignStatsGrid({ raised, goal, supportersCount, disbursed }: CampaignStatsGridProps) {
  const stats = [
    {
      label: "Tổng Đã Nhận",
      val: raised.toLocaleString() + "đ",
      desc: "Nạp qua ví Bảo Kim",
      color: "text-amber-400",
      border: "border-amber-400/35 shadow-[0_0_22px_rgba(245,158,11,0.18)]",
      bg: "from-[#1a1305]/88 to-[#070913]/96",
      icon: <Coins className="h-4.5 w-4.5" />
    },
    {
      label: "Mục Tiêu Quỹ",
      val: goal.toLocaleString() + "đ",
      desc: "Kế hoạch định mức",
      color: "text-white",
      border: "border-white/10 shadow-md",
      bg: "from-[#111421]/88 to-[#070913]/96",
      icon: <Crown className="h-4.5 w-4.5" />
    },
    {
      label: "Lượt Ủng Hộ",
      val: supportersCount.toString(),
      desc: "Người ủng hộ",
      color: "text-cyan-400",
      border: "border-cyan-500/30 shadow-[0_0_22px_rgba(34,211,238,0.1)]",
      bg: "from-[#0d1628]/88 to-[#070913]/96",
      icon: <Users className="h-4.5 w-4.5" />
    },
    {
      label: "Đã Giải Ngân",
      val: disbursed.toLocaleString() + "đ",
      desc: "Nghiệm thu thực tế",
      color: "text-emerald-400",
      border: "border-emerald-500/30 shadow-[0_0_22px_rgba(16,185,129,0.1)]",
      bg: "from-[#0a1c17]/88 to-[#070913]/96",
      icon: <CheckCircle className="h-4.5 w-4.5" />
    },
    {
      label: "Còn Khả Dụng",
      val: (raised - disbursed).toLocaleString() + "đ",
      desc: "Số dư khả dụng rút",
      color: "text-[#F0C56B] font-extrabold animate-pulse",
      border: "border-amber-300/40 shadow-[0_0_22px_rgba(245,158,11,0.22)]",
      bg: "from-[#1c180a]/90 to-[#070913]/96",
      icon: <Award className="h-4.5 w-4.5" />
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={cn(
            "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-305 hover:-translate-y-0.5 bg-gradient-to-b hover:scale-[1.02]",
            stat.border,
            stat.bg
          )}
        >
          {/* Glows */}
          <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-10 blur-xl bg-gradient-to-br from-amber-200 to-yellow-600"></div>

          <div className="flex items-start justify-between gap-4">
            <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">
              {stat.label}
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 group-hover:border-amber-400/30 group-hover:bg-amber-400/10 group-hover:text-amber-300 transition-colors">
              {stat.icon}
            </div>
          </div>
          <span className={cn("block font-display font-black text-sm mt-3", stat.color)}>{stat.val}</span>
          <span className="block text-[8px] text-slate-500 mt-0.5 leading-snug font-bold uppercase">{stat.desc}</span>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// Mock initial data
// ==========================================
const initialCampaign: DonationCampaign = {
  title: "Xây dựng 5 tủ sách cộng đồng cho trẻ em vùng cao Hà Giang",
  description: "Chiến dịch gây quỹ mua hơn 2,000 đầu sách giáo khoa, truyện tranh và dụng cụ học tập lắp đặt cho học sinh Trường Tiểu học Đồng Văn, tỉnh Hà Giang, kết hợp làm dự án Nhân Ái đi thi.",
  details: "Dự án tập trung vào việc quyên góp sách và xây dựng không gian đọc sách thân thiện tại 5 lớp học thuộc trường Tiểu học Đồng Văn. Toàn bộ kinh phí sẽ được công khai minh bạch qua cổng chuyển khoản BaoKim và nghiệm thu bằng chứng từ thực tế.",
  coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&h=400&q=80",
  coverImages: [
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&h=400&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&h=400&q=80",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&h=400&q=80"
  ],
  goal: 100000000,
  raised: 72000000,
  supportersCount: 185,
  disbursed: 40000000,
  startDate: "2026-06-01",
  endDate: "2026-09-30",
  status: "active"
};

const initialUpdates: UpdateLog[] = [
  {
    id: "up-1",
    title: "Khảo sát thực tế & chốt vị trí thư viện",
    content: "Đoàn tình nguyện đã đến làm việc trực tiếp với Ban giám hiệu trường Tiểu học Đồng Văn. Đã khảo sát và thống nhất lựa chọn 5 góc phòng học có ánh sáng tốt nhất để chuẩn bị đóng kệ gỗ lắp tủ sách trong tháng tới.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&h=400&q=80",
    date: "2026-06-15"
  },
  {
    id: "up-2",
    title: "Đặt mua hơn 1,000 cuốn sách đầu tiên",
    content: "Đã ký biên bản đặt mua sách truyện, sách giáo khoa từ NXB Kim Đồng và NXB Trẻ với mức chiết khấu hỗ trợ 30%. Sách dự kiến đóng gói chuyển về Hà Nội trước ngày 30/6.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&h=400&q=80",
    date: "2026-06-20"
  }
];

const initialSupporters: Supporter[] = [
  {
    name: "Nguyễn Văn A",
    amount: 2000000,
    message: "Chúc dự án của bạn thành công tốt đẹp!",
    isAnonymous: false,
    date: "09:15 - 23/06/2026"
  },
  {
    name: "Glow Beauty Cosmetics",
    amount: 10000000,
    message: "Chúc chiến dịch nhân ái của Mai Anh đạt được nhiều thành công rực rỡ! Mong các bé sẽ có thêm nhiều niềm vui.",
    isAnonymous: false,
    isBrand: true,
    date: "14:30 - 22/06/2026"
  },
  {
    name: "Ẩn danh",
    amount: 500000,
    message: "Một dự án rất ý nghĩa, chúc em vững bước trên hành trình đi thi.",
    isAnonymous: true,
    date: "20:11 - 22/06/2026"
  },
  {
    name: "CEO Minh Hằng",
    amount: 5000000,
    message: "Rất tự hào khi thấy thế hệ trẻ có tấm lòng nhân ái. Ủng hộ em!",
    isAnonymous: false,
    date: "18:05 - 21/06/2026"
  }
];

const initialPayouts: PayoutRequest[] = [
  {
    id: "pay-1",
    amount: 20000000,
    reason: "Thanh toán đợt 1 đặt cọc mua sách truyện từ Nhà xuất bản",
    filesCount: 2,
    status: "approved",
    date: "2026-06-10"
  },
  {
    id: "pay-2",
    amount: 20000000,
    reason: "Thanh toán tiền đặt đóng kệ gỗ tủ sách tại xưởng địa phương Hà Giang",
    filesCount: 1,
    status: "approved",
    date: "2026-06-14"
  },
  {
    id: "pay-3",
    amount: 15000000,
    reason: "Ứng trước chi phí vận chuyển bưu điện & đoàn tình nguyện di chuyển lên Hà Giang đợt 1",
    filesCount: 3,
    status: "pending",
    date: "2026-06-23"
  }
];

// ==========================================
// Main Component: DonatePage
// ==========================================
export default function DonatePage() {
  const { addToast } = useCrownfundingToast();
  const [campaign, setCampaign] = useState<DonationCampaign | null>(initialCampaign);
  const [updates, setUpdates] = useState<UpdateLog[]>(initialUpdates);
  const [supporters, setSupporters] = useState<Supporter[]>(initialSupporters);
  const [payouts, setPayouts] = useState<PayoutRequest[]>(initialPayouts);

  // Modals state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Dropdown States
  const [showDropdown, setShowDropdown] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Slider State
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `https://onstage.vn/brand/crownfunding?campaign_id=${campaign?.title ? "hagiang_library" : "new"}`
    );
    addToast("Đã sao chép liên kết gây quỹ đến Clipboard!", "info");
  };

  const handleCampaignSubmit = (form: Partial<DonationCampaign>) => {
    setCurrentImageIdx(0);
    if (campaign) {
      // Edit mode
      setCampaign((prev: DonationCampaign | null) =>
        prev
          ? {
            ...prev,
            title: form.title || prev.title,
            description: form.description || prev.description,
            details: form.details || prev.details,
            coverImage: form.coverImage || prev.coverImage,
            coverImages: form.coverImages || prev.coverImages,
            goal: form.goal || prev.goal,
            endDate: form.endDate || prev.endDate
          }
          : null
      );
      addToast("Đã cập nhật thông tin chiến dịch thành công!", "success");
    } else {
      // Create mode
      setCampaign({
        title: form.title || "",
        description: form.description || "",
        details: form.details || "",
        coverImage: form.coverImage || "",
        coverImages: form.coverImages || [],
        goal: form.goal || 100000000,
        raised: 0,
        supportersCount: 0,
        disbursed: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: form.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "active"
      });
      addToast("Khởi tạo chiến dịch Quỹ Vương Miện thành công!", "success");
    }
    setShowCampaignModal(false);
  };

  const handleUpdateSubmit = (title: string, content: string, image: string) => {
    const newUpdate: UpdateLog = {
      id: "up-" + Date.now(),
      title,
      content,
      image: image || undefined,
      date: new Date().toISOString().split("T")[0]
    };
    setUpdates((prev) => [newUpdate, ...prev]);
    setShowUpdateModal(false);
    addToast("Đã đăng bài viết nhật ký tiến độ dự án!", "success");
  };

  const handlePayoutSubmit = (amountVal: number, reasonVal: string, fileAttached: boolean) => {
    const newPayout: PayoutRequest = {
      id: "pay-" + Date.now(),
      amount: amountVal,
      reason: reasonVal,
      filesCount: fileAttached ? 1 : 0,
      status: "pending",
      date: new Date().toISOString().split("T")[0]
    };
    setPayouts((prev) => [newPayout, ...prev]);
    setShowPayoutModal(false);
    addToast("Đã gửi yêu cầu giải ngân. Vui lòng chờ Ban quản trị duyệt!", "success");
  };

  const handleDeleteCampaign = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa chiến dịch này không? Dữ liệu thống kê và lịch sử giải ngân sẽ bị mất."
      )
    ) {
      setCampaign(null);
      setUpdates([]);
      setSupporters([]);
      setPayouts([]);
      addToast("Đã gỡ chiến dịch quyên góp.", "info");
    }
  };

  const handleEndCampaign = () => {
    if (campaign) {
      setCampaign({ ...campaign, status: "completed" });
      addToast("Đã kết thúc chiến dịch gây quỹ thành công!", "success");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      {/* Header Banner - identical dashboard look */}
      <div className="relative overflow-hidden rounded-3xl border border-white/7 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-amber-400/40 bg-amber-400/10 text-amber-300">
                Cổng Quyên Góp
              </span>
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-yellow-400/30 bg-yellow-400/10 text-yellow-200">
                VietQR Gateway
              </span>
            </div>
            <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl uppercase leading-none">
              Chiến Dịch <span className="text-gradient-gold">Gây Quỹ Nhân Ái</span>
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-slate-400 font-medium">
              Thiết lập chiến dịch thiện nguyện để tăng điểm hồ sơ cá nhân và nhận sự đồng hành từ các nhãn hàng đối tác.
            </p>
          </div>
          <button
            onClick={() => {
              setCampaign(null);
              setShowCampaignModal(true);
            }}
            className="shrink-0 flex items-center gap-1.5 px-6 py-3.5 bg-gradient-gold hover:shadow-[0_0_20px_rgba(240,197,107,0.35)] hover:scale-[1.02] active:scale-98 rounded-xl font-display text-[10px] font-black text-slate-950 uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg"
            style={{ color: "#02040a" }}
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Tạo chiến dịch mới
          </button>
        </div>
      </div>

      {!campaign ? (
        /* Empty State with Dashboard luxury design */
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111421]/80 to-[#070913]/96 p-12 text-center flex flex-col items-center justify-center space-y-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          {/* Subtle gold accent light */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="h-16 w-16 rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
            <Heart className="h-8 w-8 text-amber-400 animate-pulse" />
          </div>
          <div className="space-y-2 relative z-10">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Bạn chưa khởi tạo chiến dịch gây quỹ</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
              Để tăng điểm hồ sơ cuộc thi và thu hút sự ủng hộ từ các nhãn hàng, hãy tạo chiến dịch quyên góp quỹ nhân ái của bạn.
            </p>
          </div>
          <button
            onClick={() => setShowCampaignModal(true)}
            className="flex items-center gap-2 px-6 h-12 bg-gradient-gold rounded-xl font-display text-xs font-black text-slate-950 hover:shadow-[0_0_20px_rgba(240,197,107,0.35)] hover:scale-[1.02] active:scale-98 transition-all duration-300 cursor-pointer shadow-lg relative z-10"
            style={{ color: "#02040a" }}
          >
            <Plus className="h-4.5 w-4.5" /> Tạo chiến dịch đầu tiên
          </button>
        </div>
      ) : (
        /* Active Campaign Layout - 2-Column top sections */
        <div className="space-y-8">
          {/* Top Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: QR Donate Card */}
            <div className="lg:col-span-4 group relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#18130a]/90 to-[#070913]/98 p-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] space-y-6 transition-all duration-300 hover:scale-[1.01] hover:border-amber-400/40 hover:shadow-[0_0_35px_rgba(245,158,11,0.25)] animate-in fade-in slide-in-from-left duration-500">
              {/* Corner lights */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/15 blur-xl pointer-events-none" />
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

              <div className="border-b border-white/5 pb-4 text-center">
                <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest border-amber-400/40 bg-amber-400/10 text-amber-300 mb-2">
                  Bảo Kim QR Gateway
                </span>
                <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center justify-center gap-2">
                  <Crown className="h-4.5 w-4.5 text-amber-400 animate-bounce" style={{ animationDuration: '3s' }} /> Mã QR nhận Ủng Hộ (Donate)
                </h3>
              </div>

              {/* Centered Large QR Code */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="mx-auto h-48 w-48 rounded-2xl bg-white p-3 flex flex-col items-center justify-center relative shadow-2xl transition-transform duration-300 hover:scale-[1.02] shrink-0">
                  <div className="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white">
                    <Users className="h-12 w-12 text-amber-400/85 mb-2 animate-pulse" />
                    <span className="text-[8px] font-black font-mono tracking-widest text-slate-300">
                      ONSTAGE VIETQR
                    </span>
                    <span className="text-[6px] font-mono text-slate-500 mt-1">BaoKim QR Gateway #185</span>
                  </div>
                  <div className="absolute h-9 w-9 rounded-full bg-slate-950 border-2 border-white flex items-center justify-center shadow-lg">
                    <span className="text-[8px] font-black text-amber-400">OSN</span>
                  </div>
                </div>
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center mt-1">
                  Quét mã để quyên góp nhanh
                </span>
              </div>

              <div className="text-center text-[10px] text-slate-400 leading-relaxed font-semibold">
                Nhà tài trợ có thể quét mã VietQR bằng bất kỳ ứng dụng Ngân hàng (Mobile Banking) hoặc Ví điện tử nào
                để quyên góp tiền trực tiếp vào chiến dịch nhân ái của bạn.
              </div>

              {/* Link detail */}
              <div className="space-y-2">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest text-left">
                  Đường dẫn chuyển khoản nhanh
                </span>
                <div className="relative rounded-xl border border-white/5 bg-slate-950/60 backdrop-blur-md px-4 py-3 text-[10px] font-mono text-slate-300 flex items-center justify-between gap-2 overflow-hidden truncate">
                  <span className="truncate">https://onstage.vn/brand/crownfunding?campaign_id=hagiang</span>
                  <button
                    onClick={handleCopyLink}
                    className="p-1 hover:text-white text-slate-500 transition-colors cursor-pointer shrink-0"
                    title="Sao chép liên kết"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 text-xs font-bold uppercase tracking-widest">
                <button
                  onClick={() => addToast("Tải ảnh QR VietQR thành công!", "success")}
                  className="w-full sm:w-1/2 flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 text-slate-200 hover:text-white hover:border-slate-400 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" /> Tải QR PNG
                </button>
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-full sm:w-1/2 flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-gold text-slate-955 hover:shadow-[0_0_15px_rgba(240,197,107,0.25)] hover:scale-[1.02] active:scale-98 transition-all duration-300 cursor-pointer shadow-lg"
                  style={{ color: "#02040a" }}
                >
                  <Share2 className="h-4 w-4" /> Chia sẻ quỹ
                </button>
              </div>

              {/* Share menu details */}
              {showShareMenu && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 grid grid-cols-4 gap-2 animate-in fade-in duration-200">
                  <button
                    onClick={() => {
                      addToast("Đã chia sẻ lên Facebook!", "success");
                      setShowShareMenu(false);
                    }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <svg className="h-5 w-5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => {
                      addToast("Đã chia sẻ lên Story Instagram!", "success");
                      setShowShareMenu(false);
                    }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Share2 className="h-5 w-5 text-pink-500" />
                    <span>Instagram</span>
                  </button>
                  <button
                    onClick={() => {
                      addToast("Đã tạo liên kết chia sẻ Zalo!", "success");
                      setShowShareMenu(false);
                    }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Share2 className="h-5 w-5 text-sky-400" />
                    <span>Zalo</span>
                  </button>
                  <button
                    onClick={() => {
                      handleCopyLink();
                      setShowShareMenu(false);
                    }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <LinkIcon className="h-5 w-5 text-[#F0C56B]" />
                    <span>Copy Link</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Campaign Info Card */}
            <div className="lg:col-span-8 group relative overflow-hidden rounded-3xl border border-white/7 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_40%),linear-gradient(135deg,rgba(15,23,42,0.85),rgba(2,6,23,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] space-y-6 backdrop-blur-xl transition-all duration-300 hover:border-white/12 animate-in fade-in slide-in-from-right duration-500">

              {/* Subtle gold accent light */}
              <div className="absolute top-0 left-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

              {/* Corner Manage Dropdown */}
              <div className="absolute top-6 right-6 z-10">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#08090f]/90 text-slate-300 hover:text-white hover:bg-slate-900 hover:border-white/20 transition-all cursor-pointer shadow-md"
                >
                  <MoreVertical className="h-4.5 w-4.5" />
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#08090f]/95 p-1.5 shadow-2xl backdrop-blur-md z-20 animate-in fade-in slide-in-from-top-2 duration-205 text-xs font-semibold text-slate-300">
                      <button
                        onClick={() => {
                          setShowCampaignModal(true);
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white text-left transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" /> Chỉnh sửa
                      </button>
                      <button
                        onClick={() => {
                          handleCopyLink();
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white text-left transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" /> Sao chép liên kết
                      </button>
                      <button
                        onClick={() => {
                          addToast("Tải ảnh QR thành công!", "success");
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white text-left transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" /> Tải QR
                      </button>
                      <button
                        onClick={() => {
                          handleEndCampaign();
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-[#F0C56B] hover:text-amber-300 text-left transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5 text-amber-500" /> Kết thúc chiến dịch
                      </button>
                      <hr className="border-white/5 my-1" />
                      <button
                        onClick={() => {
                          handleDeleteCampaign();
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 text-left transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" /> Xóa chiến dịch
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Campaign Banner image / slider */}
              <div className="h-56 md:h-80 w-full rounded-2xl bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 relative overflow-hidden mb-6 border border-white/5 group">
                <img
                  src={
                    campaign.coverImages && campaign.coverImages.length > 0
                      ? campaign.coverImages[currentImageIdx % campaign.coverImages.length]
                      : campaign.coverImage
                  }
                  alt={campaign.title}
                  className="w-full h-full object-cover opacity-60 transition-all duration-500"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent" />

                {/* Slider navigation arrows if multiple images */}
                {campaign.coverImages && campaign.coverImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentImageIdx((prev) =>
                          prev === 0 ? campaign.coverImages!.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#02040a]/85 border border-white/10 text-slate-350 hover:text-white flex items-center justify-center hover:bg-slate-900 transition-all cursor-pointer select-none z-10 text-lg font-bold"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentImageIdx((prev) =>
                          (prev + 1) % campaign.coverImages!.length
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#02040a]/85 border border-white/10 text-slate-350 hover:text-white flex items-center justify-center hover:bg-slate-900 transition-all cursor-pointer select-none z-10 text-lg font-bold"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Dots indicators */}
                    <div className="absolute bottom-12 inset-x-0 flex justify-center gap-1.5 z-10">
                      {campaign.coverImages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentImageIdx(idx)}
                          className={cn(
                            "h-1.5 rounded-full transition-all cursor-pointer",
                            currentImageIdx % campaign.coverImages!.length === idx
                              ? "w-5 bg-amber-400"
                              : "w-1.5 bg-white/30"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}

                <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
                  <span
                    className={cn(
                      "inline-flex items-center rounded border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider",
                      campaign.status === "active"
                        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                        : "border-slate-500/25 bg-slate-500/10 text-slate-400"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5 shrink-0", campaign.status === "active" ? "bg-amber-400 animate-pulse" : "bg-slate-500")} />
                    {campaign.status === "active" ? "ĐANG HOẠT ĐỘNG" : "ĐÃ KẾT THÚC"}
                  </span>
                </div>
              </div>

              {/* Heading Detail */}
              <div className="space-y-4">
                <h3 className="font-display font-black text-2xl text-white uppercase tracking-wider pr-16 leading-tight hover:text-amber-300 transition-colors">
                  {campaign.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{campaign.description}</p>
                {campaign.details && (
                  <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-5 mt-2">
                    <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">
                      Thông tin chi tiết
                    </span>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{campaign.details}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  <span>
                    Bắt đầu: <strong className="text-slate-300">{campaign.startDate}</strong>
                  </span>
                  <span className="text-slate-700">•</span>
                  <span>
                    Kết thúc: <strong className="text-slate-300">{campaign.endDate}</strong>
                  </span>
                </div>
              </div>

              {/* Progress status */}
              <div className="mt-8 border-t border-white/5 pt-6 space-y-3">
                <div className="flex justify-between items-end text-xs">
                  <div className="space-y-1">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      Tổng số tiền nhận được
                    </span>
                    <span className="font-display font-black text-gradient-gold text-2xl md:text-3xl leading-none">
                      {campaign.raised.toLocaleString()}đ
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      Mục tiêu đề ra
                    </span>
                    <span className="text-slate-400 font-mono font-bold text-lg">
                      {campaign.goal.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-gold shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((campaign.raised / campaign.goal) * 100))}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-1">
                  <span>
                    Tiến độ hiện tại:{" "}
                    <b className="text-amber-400">{Math.round((campaign.raised / campaign.goal) * 100)}%</b>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />{" "}
                    <b>{campaign.supportersCount}</b> lượt quyên góp
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid (5 Items) - extracted into a separate component */}
          <CampaignStatsGrid
            raised={campaign.raised}
            goal={campaign.goal}
            supportersCount={campaign.supportersCount}
            disbursed={campaign.disbursed}
          />

          {/* Donation History (Lịch sử quyên góp) - redesigned as a premium widget */}
          <section className="relative overflow-hidden rounded-3xl border border-white/7 bg-gradient-to-b from-[#0d101b]/80 to-[#050712]/92 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent"></div>
            {/* Subtle gold accent light */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

            <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-amber-400" /> Lịch sử quyên góp từ nhà hảo tâm
              </h3>
              <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-amber-400/30 bg-amber-400/10 text-amber-300 mr-2">
                Nhà hảo tâm
              </span>
            </div>

            <div className="space-y-4 mt-4">
              {supporters.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">Chưa có lượt quyên góp nào.</p>
              ) : (
                supporters.map((sup, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start gap-4 border-b border-white/5 last:border-transparent pb-4 last:pb-0 text-xs font-semibold"
                  >
                    <div className="flex gap-3">
                      {/* Avatar placeholder */}
                      <div className="h-10 w-10 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center shrink-0 text-[10px] text-[#F0C56B] font-black shadow-inner">
                        {sup.isAnonymous ? "ẨN" : sup.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <span
                          className={cn(
                            "block font-extrabold text-white text-xs",
                            sup.isAnonymous && "text-slate-500 font-normal italic"
                          )}
                        >
                          {sup.isAnonymous ? "Nhà hảo tâm ẩn danh" : sup.name}
                          {sup.isBrand && (
                            <span className="ml-2 inline-flex items-center rounded bg-amber-400/15 border border-amber-400/35 px-1.5 py-0.5 text-[7px] font-black uppercase text-[#F0C56B] tracking-widest shrink-0">
                              BRAND
                            </span>
                          )}
                        </span>
                        {sup.message && <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">"{sup.message}"</p>}
                        <span className="block text-[8px] text-slate-500 font-mono uppercase font-bold tracking-wider">
                          {sup.date}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono font-extrabold text-amber-400 shrink-0 text-right text-sm">
                      +{sup.amount.toLocaleString()}đ
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Update Progress diary logs */}
          <ActivityLog updates={updates} onAddUpdate={() => setShowUpdateModal(true)} />

          {/* Payout / Disbursement */}
          <MilestoneList
            raised={campaign.raised}
            disbursed={campaign.disbursed}
            payouts={payouts}
            onRequestPayout={() => setShowPayoutModal(true)}
          />
        </div>
      )}

      {/* Dialog Modals */}
      <CampaignDialog
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onSubmit={handleCampaignSubmit}
        campaign={campaign}
      />

      <UpdateDialog
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateSubmit}
      />

      <PayoutDialog
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onSubmit={handlePayoutSubmit}
        maxAmount={campaign ? campaign.raised - campaign.disbursed : 0}
      />
    </div>
  );
}
