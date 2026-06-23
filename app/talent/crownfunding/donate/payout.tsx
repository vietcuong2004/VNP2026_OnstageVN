"use client";

import React, { useState } from "react";
import { Coins, Upload, CheckCircle, Clock, AlertCircle, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PayoutRequest } from "@/app/talent/crownfunding/types";
import ProgressBar from "@/components/ui/ProgressBar";

// ==========================================
// Sub-component: MilestoneList (handles Payout requests list & stats)
// ==========================================
interface MilestoneListProps {
  raised: number;
  disbursed: number;
  payouts: PayoutRequest[];
  onRequestPayout: () => void;
}

export function MilestoneList({ raised, disbursed, payouts, onRequestPayout }: MilestoneListProps) {
  const availableToRequest = raised - disbursed;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/7 bg-gradient-to-b from-[#0d101b]/80 to-[#050712]/92 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl animate-in fade-in duration-300">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent"></div>
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
            className="flex h-8 px-3.5 items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 active:scale-98 hover:scale-[1.02] rounded-lg text-[10px] font-black text-[#02040a] uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-lg shadow-emerald-500/10 whitespace-nowrap"
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
// Sub-component: PayoutDialog
// ==========================================
interface PayoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason: string, fileAttached: boolean) => void;
  maxAmount: number;
}

export function PayoutDialog({ isOpen, onClose, onSubmit, maxAmount }: PayoutDialogProps) {
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
            className="px-6 py-2.5 rounded-xl bg-gradient-gold font-display text-xs font-black text-slate-955 hover:shadow-[0_0_20px_rgba(240,197,107,0.35)] hover:scale-[1.02] active:scale-98 transition-all duration-305 cursor-pointer"
          >
            Gửi yêu cầu
          </button>
        </div>
      </form>
    </div>
  );
}
