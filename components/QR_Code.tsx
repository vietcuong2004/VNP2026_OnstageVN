"use client";

import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Crown, Users, Copy, Download, Share2, Link as LinkIcon, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRCodeProps {
  campaignLink?: string;
  qrPayload?: string;
  qrCodeSvg?: string; // Optional raw SVG string
  qrImageUrl?: string; // Optional direct image URL
  title?: string;
  subtitle?: string;
  badgeText?: string;
  shareButtonLabel?: string;
  onCopyLink?: () => void;
  onDownloadQr?: () => void;
  onShareFacebook?: () => void;
  onShareInstagram?: () => void;
  onShareZalo?: () => void;
  className?: string;
}

export default function QRCodeContainer({
  campaignLink = "",
  qrPayload: rawQrPayload,
  qrCodeSvg,
  qrImageUrl,
  title = "Mã QR nhận Ủng Hộ (Donate)",
  subtitle = "Quét mã để quyên góp nhanh",
  badgeText = "Bảo Kim QR Gateway",
  shareButtonLabel = "Chia sẻ",
  onCopyLink,
  onDownloadQr,
  onShareFacebook,
  onShareInstagram,
  onShareZalo,
  className,
}: QRCodeProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const qrPayload = React.useMemo(() => {
    const directPayload = String(rawQrPayload || "").trim();
    if (directPayload) return directPayload;

    const rawLink = campaignLink.trim();
    if (!rawLink) return "";
    if (rawLink.startsWith("/") && typeof window !== "undefined") {
      return `${window.location.origin}${rawLink}`;
    }
    return rawLink;
  }, [campaignLink, rawQrPayload]);

  const defaultCopyLink = () => {
    if (!qrPayload) return;
    if (onCopyLink) {
      onCopyLink();
    } else {
      navigator.clipboard.writeText(qrPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const defaultDownloadQr = async () => {
    if (!qrPayload) return;

    const canvas = qrCanvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (onDownloadQr) {
      onDownloadQr();
      return;
    }

    const targetUrl = qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrPayload)}`;
    try {
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Failed to download QR code directly, opening in new tab:", err);
      window.open(targetUrl, "_blank");
    }
  };

  const defaultShareFacebook = () => {
    if (onShareFacebook) {
      onShareFacebook();
    } else if (qrPayload) {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(qrPayload)}`, "_blank");
    }
  };

  const defaultShareInstagram = () => {
    if (onShareInstagram) {
      onShareInstagram();
    } else if (qrPayload) {
      navigator.clipboard.writeText(qrPayload);
      alert("Đã sao chép liên kết! Bạn có thể chia sẻ lên Instagram.");
    }
  };

  const defaultShareZalo = () => {
    if (onShareZalo) {
      onShareZalo();
    } else if (qrPayload) {
      window.open(`https://sp.zalo.me/share?vt=1&url=${encodeURIComponent(qrPayload)}`, "_blank");
    }
  };

  const defaultShare = () => {
    if (!qrPayload) return;
    if (navigator.share) {
      navigator.share({
        title: title || "Chia sẻ",
        url: qrPayload,
      }).catch(() => { });
    } else {
      setShowShareMenu(true);
    }
  };

  const createInitialAvatarDataUrl = (name: string, email?: string) => {
    const text = String(name || "").trim();
    const initials = text ? text.split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase() : "QR";
    const colors = [
      "#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4",
      "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"
    ];
    let hash = 0;
    const str = email || text;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];

    // Server-friendly inline SVG generator
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${encodeURIComponent(color)}"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="36" font-weight="bold" fill="white">${encodeURIComponent(initials)}</text></svg>`;
  };

  const resolvedQrImageUrl = qrImageUrl;

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-3xl border border-[#F0D7D3] bg-white p-6 shadow-sm space-y-6 transition-all duration-300 dark:border-amber-500/30 dark:bg-gradient-to-br dark:from-amber-500/10 dark:via-[#18130a]/90 dark:to-[#070913]/98",
      className
    )}>
      {/* Corner lights */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/15 blur-xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="border-b border-[#F0D7D3] pb-4 text-center dark:border-white/5">
        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] mb-2 shadow-sm dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300">
          {badgeText}
        </span>
        <h3 className="font-display font-black text-sm text-[#191116] uppercase tracking-wider flex items-center justify-center gap-2 dark:text-white">
          <Crown className="h-4.5 w-4.5 text-[#8F0709] animate-bounce dark:text-amber-400" style={{ animationDuration: "3s" }} /> {title}
        </h3>
      </div>

      {/* Centered Large QR Code */}
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="mx-auto h-48 w-48 rounded-2xl bg-white p-3 flex flex-col items-center justify-center relative shadow-md border border-[#F0D7D3] transition-transform duration-300 hover:scale-[1.02] shrink-0 dark:border-transparent dark:shadow-2xl">
          {qrCodeSvg ? (
            <div
              className="w-full h-full bg-white rounded-xl overflow-hidden [&_svg]:h-full [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
            />
          ) : resolvedQrImageUrl ? (
            <img
              src={resolvedQrImageUrl}
              alt="Campaign QR Code"
              className="w-full h-full object-contain rounded-xl"
            />
          ) : qrPayload ? (
            <QRCodeCanvas
              ref={qrCanvasRef}
              value={qrPayload}
              size={168}
              bgColor="#ffffff"
              fgColor="#020617"
              level="H"
              includeMargin={false}
              className="h-full w-full rounded-xl"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-2">
              <Users className="h-12 w-12 text-[#8F0709] mb-2 animate-pulse dark:text-amber-400/85" />
              <span className="text-[8px] font-black font-mono tracking-widest text-[#574D54] dark:text-slate-350">
                ONSTAGE QR
              </span>
              <span className="text-[6px] font-mono text-[#9A8B88] mt-1 text-center dark:text-slate-500">Mã QR sẽ xuất hiện sau khi campaign được duyệt.</span>
            </div>
          )}
          <div className="absolute h-9 w-9 rounded-full bg-slate-950 border-2 border-white flex items-center justify-center shadow-lg overflow-hidden">
            <img
              src="/logo_icon.png?v=20260817"
              alt="OSN"
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                const parent = event.currentTarget.parentElement;
                if (parent) {
                  const span = document.createElement("span");
                  span.className = "text-[8px] font-black text-amber-400";
                  span.innerText = "OSN";
                  parent.appendChild(span);
                }
              }}
            />
          </div>
        </div>
        <span className="block text-[8px] font-bold text-[#574D54] uppercase tracking-widest text-center mt-1 dark:text-slate-500">
          {subtitle}
        </span>
      </div>


      {/* Action buttons */}
      <div className="flex flex-row items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
        <button
          onClick={defaultDownloadQr}
          disabled={!qrPayload}
          className="flex-1 flex h-11 items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-[#F0D7D3] bg-white text-[#574D54] hover:border-[#8F0709] hover:text-[#8F0709] shadow-sm transition-all cursor-pointer disabled:opacity-50 px-2 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:text-white"
        >
          <Download className="h-4 w-4 shrink-0" /> Tải về
        </button>
        <button
          style={{ color: "#ffffff" }}
          onClick={defaultShare}
          disabled={!qrPayload}
          className="light-force-white flex-1 flex h-11 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md hover:brightness-110 active:scale-98 disabled:opacity-50 px-2 dark:bg-[#F0C56B] dark:text-[#02040a]"
        >
          <Share2 className="h-4 w-4 stroke-[3] !text-white text-white shrink-0" />
          <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">{shareButtonLabel}</span>
        </button>
      </div>

      {/* Share menu Dialog Modal (prevents card height expansion) */}
      {showShareMenu && qrPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#191116]/60 backdrop-blur-sm animate-in fade-in duration-200 dark:bg-[#020408]/80">
          <div className="relative w-full max-w-sm flex flex-col bg-white border border-[#F0D7D3] rounded-2xl shadow-2xl p-6 text-left animate-in zoom-in-95 duration-200 dark:bg-[#0b0c15] dark:border-[#1d2238]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F0D7D3] pb-3.5 mb-4 dark:border-white/5">
              <h3 className="text-sm font-black text-[#191116] uppercase tracking-wider dark:text-white">
                {shareButtonLabel}
              </h3>
              <button
                onClick={() => setShowShareMenu(false)}
                className="text-[#574D54] hover:text-[#8F0709] cursor-pointer transition-colors dark:text-slate-400 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#574D54] font-semibold mb-5 leading-normal dark:text-slate-400">
              Chọn nền tảng để chia sẻ liên kết:
            </p>

            {/* Grid of options */}
            <div className="grid grid-cols-4 gap-2 text-[10px] font-black uppercase tracking-widest text-[#574D54] text-center dark:text-slate-450">
              <button
                onClick={() => {
                  defaultShareFacebook();
                  setShowShareMenu(false);
                }}
                className="flex flex-col items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F6] border border-[#F0D7D3] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition-colors cursor-pointer text-[#574D54] dark:bg-white/[0.02] dark:border-white/5 dark:hover:bg-white/5 dark:text-slate-400 dark:hover:text-white"
              >
                <svg className="h-6 w-6 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-[8px] mt-1">Facebook</span>
              </button>
              <button
                onClick={() => {
                  defaultShareInstagram();
                  setShowShareMenu(false);
                }}
                className="flex flex-col items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F6] border border-[#F0D7D3] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition-colors cursor-pointer text-[#574D54] dark:bg-white/[0.02] dark:border-white/5 dark:hover:bg-white/5 dark:text-slate-400 dark:hover:text-white"
              >
                <Share2 className="h-6 w-6 text-pink-500" />
                <span className="text-[8px] mt-1">Instagram</span>
              </button>
              <button
                onClick={() => {
                  defaultShareZalo();
                  setShowShareMenu(false);
                }}
                className="flex flex-col items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F6] border border-[#F0D7D3] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition-colors cursor-pointer text-[#574D54] dark:bg-white/[0.02] dark:border-white/5 dark:hover:bg-white/5 dark:text-slate-400 dark:hover:text-white"
              >
                <Share2 className="h-6 w-6 text-sky-500" />
                <span className="text-[8px] mt-1">Zalo</span>
              </button>
              <button
                onClick={() => {
                  defaultCopyLink();
                  setShowShareMenu(false);
                }}
                className="flex flex-col items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F6] border border-[#F0D7D3] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition-colors cursor-pointer text-[#574D54] dark:bg-white/[0.02] dark:border-white/5 dark:hover:bg-white/5 dark:text-slate-400 dark:hover:text-white"
              >
                <LinkIcon className="h-6 w-6 text-[#8F0709] dark:text-[#F0C56B]" />
                <span className="text-[8px] mt-1">Copy Link</span>
              </button>
            </div>

            {/* Cancel button */}
            <button
              onClick={() => setShowShareMenu(false)}
              className="mt-6 w-full h-10 rounded-xl border border-[#F0D7D3] bg-white text-xs font-black uppercase text-[#574D54] hover:border-[#8F0709] hover:text-[#8F0709] cursor-pointer transition-all shadow-sm dark:border-white/5 dark:bg-white/5 dark:text-slate-400 dark:hover:text-white"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
