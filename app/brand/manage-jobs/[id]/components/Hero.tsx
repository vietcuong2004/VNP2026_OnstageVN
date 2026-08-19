"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Users,
  Eye,
  Coins,
  Lock,
  MoreVertical,
  Pencil,
  Trash2,
  Link2,
  Copy,
  Check,
  QrCode,
  DollarSign,
  Clock,
} from "lucide-react";
import { type Campaign } from "@/lib/brand-mvp-data";
import { cn } from "@/lib/utils";

interface HeroProps {
  selectedCampaign: Campaign;
  onBack: () => void;
  onOpenPayoutModal: () => void;
  onUpdateStatus: (status: "published" | "closed") => Promise<void> | void;
  onDeleteCampaign?: () => Promise<void> | void;
  onEditCampaign?: () => void;
  referralLink?: string;
  copiedLink?: boolean;
  isGeneratingLink?: boolean;
  onCopyReferralLink?: () => void;
  onOpenQrModal?: () => void;
}

function displayCampaignDateTime(value?: string | null, explicitTime?: string | null) {
  if (!value && !explicitTime) return "Chưa cập nhật";

  const raw = String(value || "").trim();
  const timeMatch = raw.match(/T(\d{2}:\d{2})/i) || raw.match(/\s+(\d{2}:\d{2})/);
  const time = explicitTime?.trim() || (timeMatch ? timeMatch[1] : "");

  let dateStr = "";
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})/) || raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (dateOnly) {
    if (dateOnly[1].length === 4) {
      dateStr = `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
    } else {
      dateStr = `${dateOnly[1]}/${dateOnly[2]}/${dateOnly[3]}`;
    }
  } else if (raw) {
    const normalized = raw.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})?$/, ".$1$2");
    const date = new Date(normalized);
    if (!Number.isNaN(date.getTime())) {
      dateStr = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } else {
      dateStr = raw;
    }
  }

  if (time && dateStr && dateStr !== "Chưa cập nhật") {
    return `${time} ${dateStr}`;
  }
  return dateStr || time || "Chưa cập nhật";
}

function displayCampaignDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";

  const raw = String(value);
  const normalized = raw.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})?$/, ".$1$2");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
    return raw;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
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
  onDeleteCampaign,
  onEditCampaign,
  referralLink,
  copiedLink = false,
  isGeneratingLink = false,
  onCopyReferralLink,
  onOpenQrModal,
}: HeroProps) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleConfirmDelete = async () => {
    setIsUpdating(true);
    try {
      if (onDeleteCampaign) {
        await onDeleteCampaign();
      }
      setShowDeleteConfirm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const industriesList = useMemo(() => {
    const raw = (selectedCampaign as any).industries;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.filter(Boolean);
    }
    if (typeof raw === "string" && raw.trim()) {
      return raw.split(/[,;\n]+/).map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  }, [selectedCampaign]);

  return (
    <>
      {/* 1. HERO MỞ RỘNG (HERO + 3 THẺ THÔNG TIN NỔI BẬT) */}
      <section className="relative rounded-3xl border border-[#F0D7D3] bg-white p-4 sm:py-5 sm:px-6 shadow-sm text-[#191116] dark:border-white/5 dark:bg-[#070913] dark:text-white">
        {/* Ambient background glow inside clipped container */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFF0EE] rounded-full blur-3xl dark:bg-amber-500/5" />
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between relative z-30 text-left">
          {/* Main Info */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center justify-between gap-2 mb-3">
              {/* Top-left: Quay lại button */}
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-xl border border-[#F0D7D3] bg-[#FFF0EE] px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-[#8F0709] hover:bg-[#FFE5E2] transition-all duration-200 cursor-pointer shadow-sm active:scale-95 group dark:border-white/15 dark:bg-slate-900/90 dark:text-slate-200"
              >
                <ArrowLeft className="h-4 w-4 text-[#8F0709] group-hover:-translate-x-0.5 transition-transform dark:text-amber-400" />
                <span>Quay lại</span>
              </button>

              {/* Top-right: QR Code + Circular 3-dots menu button */}
              <div className="relative z-50 flex items-center gap-2" ref={menuRef}>
                {onOpenQrModal && (
                  <button
                    type="button"
                    onClick={onOpenQrModal}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F0D7D3] bg-white text-[#8F0709] hover:bg-[#FFF0EE] hover:border-[#8F0709] cursor-pointer transition-all shadow-xs active:scale-95 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-amber-300"
                    title="Hiện mã QR ứng tuyển"
                    aria-label="Hiện mã QR ứng tuyển"
                  >
                    <QrCode className="h-4 w-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F0D7D3] bg-white text-[#8F0709] hover:bg-[#FFF0EE] hover:border-[#8F0709] cursor-pointer transition-all shadow-xs active:scale-95 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-amber-300"
                  title="Tùy chọn khác"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-[#F0D7D3] bg-white p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150 text-left dark:border-amber-500/30 dark:bg-[#0d1226]">
                    {onEditCampaign && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onEditCampaign();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#191116] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition-colors cursor-pointer dark:text-slate-200 dark:hover:bg-amber-500/15 dark:hover:text-amber-300"
                      >
                        <Pencil className="h-4 w-4 text-[#8F0709] dark:text-amber-400" />
                        <span>Sửa job</span>
                      </button>
                    )}

                    {selectedCampaign.status !== "closed" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setShowCloseConfirm(true);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#191116] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition-colors cursor-pointer dark:text-slate-200 dark:hover:bg-amber-500/15 dark:hover:text-amber-300"
                      >
                        <Lock className="h-4 w-4 text-[#8F0709] dark:text-amber-400" />
                        <span>Đóng job</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onUpdateStatus("published");
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#191116] hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer dark:text-slate-200 dark:hover:bg-amber-500/15 dark:hover:text-amber-300"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Mở lại job</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-t border-[#F0D7D3] mt-1 pt-2 dark:border-slate-800/80"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span>Xóa job</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-2 flex flex-wrap items-center gap-2">
              {industriesList.length > 0 ? (
                industriesList.map((ind: string, idx: number) => (
                  <span
                    key={`${ind}-${idx}`}
                    className="rounded-full border border-[#F0D7D3] bg-[#FFF0EE] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#8F0709] dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300"
                  >
                    {ind}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-[#F0D7D3] bg-[#FFF0EE] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#8F0709] dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300">
                  Toàn ngành
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-[#191116] leading-tight dark:text-white">
              {selectedCampaign.title}
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto md:shrink-0 justify-end relative z-40">
            {selectedCampaign.status === "draft" && (
              <button
                disabled={isUpdating}
                onClick={() => onUpdateStatus("published")}
                className="light-force-white flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-3 sm:px-5 text-[10px] sm:text-xs font-black uppercase tracking-wider !text-white text-white hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <CheckCircle2 className="mr-2 h-4 w-4 stroke-[3]" />
                Publish
              </button>
            )}
          </div>
        </div>

        {/* Divider line inside Hero */}
        <div className="my-3.5 border-t border-[#F0D7D3] relative z-0 dark:border-white/5" />

        {/* Integrated Quick Stats (Thù lao, Hạn ứng tuyển, Địa điểm làm việc) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 relative z-0 text-left">
          {[
            {
              label: "Thù lao",
              value: selectedCampaign.budget || "Thỏa thuận",
              titleText: selectedCampaign.budget || "Thỏa thuận",
              icon: DollarSign,
              color: "text-[#8F0709] dark:text-amber-300",
            },
            {
              label: "Hạn ứng tuyển",
              value: displayCampaignDateTime(selectedCampaign.applicationDeadline || selectedCampaign.deadline || selectedCampaign.endDate),
              titleText: displayCampaignDateTime(selectedCampaign.applicationDeadline || selectedCampaign.deadline || selectedCampaign.endDate),
              icon: Clock,
              color: "text-[#8F0709] dark:text-amber-300",
            },
            {
              label: "Địa điểm làm việc",
              value: selectedCampaign.address && selectedCampaign.city
                ? (selectedCampaign.address.includes(selectedCampaign.city) ? selectedCampaign.address : `${selectedCampaign.address}, ${selectedCampaign.city}`)
                : selectedCampaign.address || selectedCampaign.city || "Toàn quốc",
              titleText: selectedCampaign.address && selectedCampaign.city
                ? (selectedCampaign.address.includes(selectedCampaign.city) ? selectedCampaign.address : `${selectedCampaign.address}, ${selectedCampaign.city}`)
                : selectedCampaign.address || selectedCampaign.city || "Toàn quốc",
              icon: MapPin,
              color: "text-[#8F0709] dark:text-rose-300",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#F0D7D3] bg-[#FFF0EE] dark:border-white/5 dark:bg-slate-900/30">
                  <Icon className={cn("h-4 w-4", item.color)} />
                </div>
                <div className="min-w-0">
                  <span className="block text-[8.5px] font-bold uppercase tracking-wider text-[#574D54] dark:text-slate-500">{item.label}</span>
                  <span className="block text-[11px] sm:text-xs font-extrabold text-[#191116] mt-0.5 leading-tight whitespace-normal sm:whitespace-nowrap sm:truncate dark:text-white" title={item.titleText}>
                    {item.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Confirmation Dialog for Close Job */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm flex flex-col bg-white border border-[#F0D7D3] rounded-2xl shadow-2xl p-6 text-left animate-in zoom-in-95 duration-200 dark:bg-[#0b0c15] dark:border-[#1d2238]">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                <Lock className="h-5 w-5 text-red-500 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-[#8F0709] uppercase tracking-wider dark:text-white">Đóng job</h3>
                <p className="text-xs text-[#574D54] mt-2 leading-relaxed dark:text-slate-400">
                  Bạn có xác nhận đóng job này?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                disabled={isUpdating}
                onClick={() => setShowCloseConfirm(false)}
                className="h-9 px-4 rounded-xl border border-[#F0D7D3] bg-white text-xs font-black uppercase text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] cursor-pointer transition-all disabled:opacity-50 dark:border-white/5 dark:bg-white/5 dark:text-slate-400"
              >
                Hủy
              </button>
              <button
                disabled={isUpdating}
                onClick={handleConfirmClose}
                className="h-9 px-4 rounded-xl bg-red-500 text-xs font-black uppercase text-white hover:bg-red-600 active:scale-95 cursor-pointer transition-all shadow-md disabled:opacity-50"
              >
                {isUpdating ? "Đang đóng..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Delete Job */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm flex flex-col bg-white border border-[#F0D7D3] rounded-2xl shadow-2xl p-6 text-left animate-in zoom-in-95 duration-200 dark:bg-[#0b0c15] dark:border-[#1d2238]">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-500 animate-bounce" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-[#8F0709] uppercase tracking-wider dark:text-white">Xóa job</h3>
                <p className="text-xs text-[#574D54] mt-2 leading-relaxed dark:text-slate-400">
                  Bạn có chắc chắn muốn xóa job này? Thao tác này không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                disabled={isUpdating}
                onClick={() => setShowDeleteConfirm(false)}
                className="h-9 px-4 rounded-xl border border-[#F0D7D3] bg-white text-xs font-black uppercase text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] cursor-pointer transition-all disabled:opacity-50 dark:border-white/5 dark:bg-white/5 dark:text-slate-400"
              >
                Hủy
              </button>
              <button
                disabled={isUpdating}
                onClick={handleConfirmDelete}
                className="h-9 px-4 rounded-xl bg-red-600 text-xs font-black uppercase text-white hover:bg-red-700 active:scale-95 cursor-pointer transition-all shadow-md disabled:opacity-50"
              >
                {isUpdating ? "Đang xóa..." : "Xóa job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
