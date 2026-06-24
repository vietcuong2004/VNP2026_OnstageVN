"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Users,
  Eye,
  Coins,
  XCircle,
  Lock,
} from "lucide-react";
import { type Campaign } from "@/lib/brand-mvp-data";
import { cn } from "@/lib/utils";

interface HeroProps {
  selectedCampaign: Campaign;
  onBack: () => void;
  onOpenPayoutModal: () => void;
  onUpdateStatus: (status: "published" | "closed") => Promise<void> | void;
}

function sentenceCaseText(value: string) {
  const text = String(value || "").trim();
  if (!text) return "";

  const firstLetterIndex = text.search(/\p{L}/u);
  if (firstLetterIndex < 0) return text;

  return `${text.slice(0, firstLetterIndex)}${text.charAt(firstLetterIndex).toLocaleUpperCase("vi-VN")}${text.slice(firstLetterIndex + 1)}`;
}

function statusLabel(status: Campaign["status"]) {
  if (status === "published") return "Đang mở";
  if (status === "closed") return "Đã đóng";
  return "Nháp";
}

export default function Hero({
  selectedCampaign,
  onBack,
  onOpenPayoutModal,
  onUpdateStatus,
}: HeroProps) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleConfirmClose = async () => {
    setIsUpdating(true);
    try {
      await onUpdateStatus("closed");
      setShowCloseConfirm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {/* 1. HERO MỞ RỘNG (HERO + KPI) */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_40%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.97))] p-4 sm:py-5 sm:px-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between relative z-10 text-left">
          {/* Main Info */}
          <div className="flex-1 min-w-0 w-full">
            <button
              onClick={onBack}
              className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Quay lại
            </button>

            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-white/5 px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider text-slate-400">
                {selectedCampaign.jobType}
              </span>
              <span className={cn(
                "rounded-full border px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider",
                selectedCampaign.status === "published"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : selectedCampaign.status === "closed"
                    ? "bg-slate-500/10 text-slate-400 border-white/5"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/20"
              )}>
                {statusLabel(selectedCampaign.status)}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {selectedCampaign.title}
            </h1>

            {(selectedCampaign.eventName || selectedCampaign.campaignType) && (
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-amber-300">
                {[selectedCampaign.eventName, selectedCampaign.campaignType].filter(Boolean).join(" · ")}
              </p>
            )}

          </div>

          {/* Action buttons */}
          <div className="flex flex-row gap-2 w-full md:w-auto md:shrink-0 md:flex-wrap [&>*]:flex-1 sm:[&>*]:flex-none">
            {selectedCampaign.status === "draft" && (
              <button
                disabled={isUpdating}
                onClick={() => onUpdateStatus("published")}
                className="flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-3 sm:px-5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-950 hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <CheckCircle2 className="mr-2 h-4 w-4 stroke-[3]" />
                Publish
              </button>
            )}
            {selectedCampaign.status !== "closed" && (
              <>
                <button
                  onClick={onOpenPayoutModal}
                  className="flex h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 px-3 sm:px-5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-950 hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-300/20"
                >
                  <Coins className="h-4 w-4 stroke-[2.5]" />
                  Quyết Toán
                </button>
                <button
                  onClick={() => setShowCloseConfirm(true)}
                  className="flex h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 sm:px-5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-red-400 hover:bg-red-500/20 hover:border-red-500/40 active:scale-95 transition-all cursor-pointer"
                >
                  <XCircle className="h-4 w-4 stroke-[2.5]" />
                  Đóng campaign
                </button>
              </>
            )}
          </div>
        </div>

        {/* Divider line inside Hero */}
        <div className="my-3 border-t border-white/5 relative z-10" />

        {/* Integrated KPI quick stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 relative z-10 text-left">
          {[
            {
              label: "Địa điểm",
              value: selectedCampaign.venueName || selectedCampaign.address,
              titleText: selectedCampaign.venueName || selectedCampaign.address,
              icon: MapPin,
              color: "text-amber-300",
            },
            {
              label: "Ứng viên",
              value: (
                <>
                  {selectedCampaign.applicants.length}/{selectedCampaign.talentQuantity}
                  <span className="hidden sm:inline"> ứng viên</span>
                </>
              ),
              titleText: `${selectedCampaign.applicants.length}/${selectedCampaign.talentQuantity} ứng viên`,
              icon: Users,
              color: "text-emerald-300",
            },
            {
              label: "Lượt xem",
              value: (
                <>
                  {selectedCampaign.views}
                  <span className="hidden sm:inline"> lượt xem</span>
                </>
              ),
              titleText: `${selectedCampaign.views} lượt xem`,
              icon: Eye,
              color: "text-rose-300",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-slate-900/30">
                  <Icon className={cn("h-4 w-4", item.color)} />
                </div>
                <div className="min-w-0">
                  <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">{item.label}</span>
                  <span className="block text-[10px] sm:text-[11px] font-extrabold text-white mt-0.5 leading-tight whitespace-normal sm:whitespace-nowrap sm:truncate" title={item.titleText}>
                    {item.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Confirmation Dialog for Close Campaign */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm flex flex-col bg-[#0b0c15] border border-[#1d2238] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] p-6 text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                <Lock className="h-5 w-5 text-red-400 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Đóng chiến dịch</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Bạn có xác nhận đóng campaign này?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                disabled={isUpdating}
                onClick={() => setShowCloseConfirm(false)}
                className="h-9 px-4 rounded-xl border border-white/5 bg-white/5 text-xs font-black uppercase text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                disabled={isUpdating}
                onClick={handleConfirmClose}
                className="h-9 px-4 rounded-xl bg-red-500 text-xs font-black uppercase text-white hover:bg-red-600 active:scale-95 cursor-pointer transition-all shadow-[0_0_12px_rgba(239,68,68,0.25)] disabled:opacity-50"
              >
                {isUpdating ? "Đang đóng..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
