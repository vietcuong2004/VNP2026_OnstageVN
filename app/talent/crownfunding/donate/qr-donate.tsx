"use client";

import React from "react";
import { Crown, Users, Copy, Download, Share2, Link as LinkIcon } from "lucide-react";

interface QrDonateProps {
  campaignLink?: string;
  qrCodeSvg?: string;
  showShareMenu: boolean;
  setShowShareMenu: (show: boolean) => void;
  onCopyLink: () => void;
  onDownloadQr: () => void;
  onShareFacebook: () => void;
  onShareInstagram: () => void;
  onShareZalo: () => void;
}

export function QrDonate({
  campaignLink,
  qrCodeSvg,
  showShareMenu,
  setShowShareMenu,
  onCopyLink,
  onDownloadQr,
  onShareFacebook,
  onShareInstagram,
  onShareZalo,
}: QrDonateProps) {
  return (
    <div className="lg:col-span-4 group relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#18130a]/90 to-[#070913]/98 p-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] space-y-6 transition-all duration-300 hover:scale-[1.01] hover:border-amber-400/40 hover:shadow-[0_0_35px_rgba(245,158,11,0.25)] animate-in fade-in slide-in-from-left duration-500">
      {/* Corner lights */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/15 blur-xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="border-b border-white/5 pb-4 text-center">
        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest border-amber-400/40 bg-amber-400/10 text-amber-300 mb-2">
          Bảo Kim QR Gateway
        </span>
        <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center justify-center gap-2">
          <Crown className="h-4.5 w-4.5 text-amber-400 animate-bounce" style={{ animationDuration: "3s" }} /> Mã QR nhận Ủng Hộ (Donate)
        </h3>
      </div>

      {/* Centered Large QR Code */}
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="mx-auto h-48 w-48 rounded-2xl bg-white p-3 flex flex-col items-center justify-center relative shadow-2xl transition-transform duration-305 hover:scale-[1.02] shrink-0">
          {qrCodeSvg ? (
            <div
              className="w-full h-full bg-white rounded-xl overflow-hidden [&_svg]:h-full [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
            />
          ) : (
            <div className="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white">
              <Users className="h-12 w-12 text-amber-400/85 mb-2 animate-pulse" />
              <span className="text-[8px] font-black font-mono tracking-widest text-slate-300">
                ONSTAGE VIETQR
              </span>
              <span className="text-[6px] font-mono text-slate-500 mt-1">Mã QR sẽ xuất hiện sau khi campaign được duyệt.</span>
            </div>
          )}
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
          <span className="truncate">{campaignLink || "Chưa có liên kết chia sẻ"}</span>
          <button
            onClick={onCopyLink}
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
          onClick={onDownloadQr}
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
            onClick={onShareFacebook}
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </button>
          <button
            onClick={onShareInstagram}
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
          >
            <Share2 className="h-5 w-5 text-pink-500" />
            <span>Instagram</span>
          </button>
          <button
            onClick={onShareZalo}
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
          >
            <Share2 className="h-5 w-5 text-sky-400" />
            <span>Zalo</span>
          </button>
          <button
            onClick={onCopyLink}
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
          >
            <LinkIcon className="h-5 w-5 text-[#F0C56B]" />
            <span>Copy Link</span>
          </button>
        </div>
      )}
    </div>
  );
}
