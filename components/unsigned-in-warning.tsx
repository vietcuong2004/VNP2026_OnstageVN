"use client";

import React from "react";
import { AlertTriangle, LogIn, Megaphone, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type UnsignedInWarningProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  onRegister: () => void;
  onLogin: () => void;
};

const DEFAULT_TITLE = "Bạn cần đăng nhập để thực hiện thao tác này";
const DEFAULT_DESCRIPTION = "Bạn vẫn có thể xem thông tin public. Những thao tác lưu, gửi, tạo mới hoặc cập nhật dữ liệu hệ thống cần tài khoản OnstageVN.";

export function UnsignedInWarning({
  isOpen,
  onClose,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  actionLabel,
  onRegister,
  onLogin,
}: UnsignedInWarningProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[520px] overflow-hidden rounded-[32px] border border-amber-400/25 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_40%),linear-gradient(135deg,#0a0d16,#020408)] shadow-[0_24px_80px_rgba(0,0,0,0.65)] animate-in zoom-in-95 duration-200">
        
        {/* Header section with Alert Icon, App Name & Close button */}
        <div className="relative border-b border-white/5 p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/5 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.08)]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400">
                OnstageVN
              </span>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:border-white/20 hover:text-white"
              aria-label="Đóng"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Heading with Lock & Shield Watermark */}
          <div className="relative mt-6 pr-24">
            <h3 className="text-2xl font-black leading-tight text-white pr-4 tracking-tight">
              {title}
            </h3>
            
            {/* Padlock and Shield Watermark */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-20 opacity-[0.14] pointer-events-none select-none rotate-12">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full text-amber-400">
                <path d="M50 10 C70 15, 85 20, 85 45 C85 70, 50 90, 50 90 C50 90, 15 70, 15 45 C15 20, 30 15, 50 10 Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M38 48 V38 A12 12 0 0 1 62 38 V48" strokeWidth="3.5" strokeLinecap="round" />
                <rect x="32" y="48" width="36" height="24" rx="4" fill="currentColor" className="text-amber-500/20" />
                <circle cx="50" cy="58" r="3" fill="black" />
                <path d="M50 61 V66" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content body with Action block & Description */}
        <div className="space-y-4 p-6">
          {actionLabel && (
            <div className="w-full flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-xs font-bold text-amber-300">
              <Megaphone className="h-4 w-4 text-amber-400 shrink-0" />
              <span>{actionLabel}</span>
            </div>
          )}
          
          <p className="text-xs sm:text-[13px] leading-relaxed text-slate-400 font-medium">
            {description}
          </p>
        </div>

        {/* Bottom Actions section */}
        <div className="flex flex-col gap-3 border-t border-white/5 bg-slate-950/20 p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-2xl border border-white/10 bg-transparent px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-400 transition hover:border-white/20 hover:text-white"
          >
            Để sau
          </button>
          
          <button
            type="button"
            onClick={onRegister}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/5 px-5 py-3 text-xs font-black uppercase tracking-wider text-amber-300 transition hover:bg-amber-400/10 hover:border-amber-400/40"
          >
            <UserPlus className="h-4 w-4 text-amber-400" />
            Đăng ký
          </button>
          
          <button
            type="button"
            onClick={onLogin}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:brightness-110 active:scale-[0.98]"
          >
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </button>
        </div>

      </div>
    </div>
  );
}
