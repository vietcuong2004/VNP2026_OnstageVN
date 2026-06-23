"use client";

import React, { useState } from "react";
import { FileText, Plus, X, Upload } from "lucide-react";
import { UpdateLog } from "@/app/talent/crownfunding/types";
import ProgressBar from "@/components/ui/ProgressBar";

// ==========================================
// Sub-component: ActivityLog
// ==========================================
interface ActivityLogProps {
  updates: UpdateLog[];
  onAddUpdate: () => void;
}

export function ActivityLog({ updates, onAddUpdate }: ActivityLogProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/7 bg-gradient-to-b from-[#0d101b]/80 to-[#050712]/92 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-in fade-in duration-300">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent"></div>
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
            className="flex h-8 px-3.5 items-center gap-1.5 bg-gradient-gold hover:shadow-[0_0_15px_rgba(240,197,107,0.25)] hover:scale-[1.02] active:scale-98 rounded-lg text-[10px] font-black text-slate-950 uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap"
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
              <p className="text-xs text-slate-400 leading-relaxed font-medium text-justify">{log.content}</p>
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
// Sub-component: UpdateDialog
// ==========================================
interface UpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string, image: string) => void;
}

export function UpdateDialog({ isOpen, onClose, onSubmit }: UpdateDialogProps) {
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
