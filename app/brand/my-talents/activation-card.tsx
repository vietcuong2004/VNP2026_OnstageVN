"use client";

import React, { useState } from "react";
import { Check, Copy, Download, Link2, QrCode, RefreshCw, Send, UserCheck, X, ChevronDown, ChevronUp } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { createManagedTalentActivationLink, type ManagedTalentActivationLink } from "@/lib/brand-api";
import { sendMessage } from "@/lib/messaging-api";
import { cn } from "@/lib/utils";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import type { BrandTalentCard, RosterTalent } from "./page";

type ActivationTalentItem = {
  entry: RosterTalent;
  talent: BrandTalentCard;
};

type ActivationCardProps = {
  items: ActivationTalentItem[];
  addToast: (message: string, tone?: "success" | "error") => void;
};

function formatExpiry(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function makeQrFilename(name?: string | null) {
  const normalized = String(name || "talent")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `qr-kich-hoat-${normalized || "talent"}.png`;
}

export default function ActivationCard({ items, addToast }: ActivationCardProps) {
  const [activationLinksByRosterId, setActivationLinksByRosterId] = useState<Record<string, ManagedTalentActivationLink>>({});
  const [dismissedRosterIds, setDismissedRosterIds] = useState<string[]>([]);
  const [loadingRosterId, setLoadingRosterId] = useState<string | null>(null);
  const [sendingRosterId, setSendingRosterId] = useState<string | null>(null);
  const [copiedRosterId, setCopiedRosterId] = useState<string | null>(null);
  const [showQrUrl, setShowQrUrl] = useState<string | null>(null);
  const [showQrName, setShowQrName] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  async function handleCreateLink(rosterId: string, force = false) {
    if (!rosterId) return;

    setLoadingRosterId(rosterId);
    try {
      const link = await createManagedTalentActivationLink(rosterId, { force });
      setActivationLinksByRosterId((prev) => ({ ...prev, [rosterId]: link }));
      addToast(force ? "Đã tạo lại link kích hoạt." : "Đã tạo link kích hoạt tài khoản.");
    } catch (error) {
      console.error("Cannot create managed talent activation link", error);
      setDismissedRosterIds((prev) => prev.includes(rosterId) ? prev : [...prev, rosterId]);
      addToast("Idol này đã kích hoạt tài khoản hoặc không phải tài khoản do Brand tạo.", "error");
    } finally {
      setLoadingRosterId(null);
    }
  }

  async function handleCopy(rosterId: string, url: string) {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopiedRosterId(rosterId);
    addToast("Đã sao chép link kích hoạt.");
    window.setTimeout(() => setCopiedRosterId(null), 1800);
  }

  async function handleSendMessage(rosterId: string, conversationId: string, url: string) {
    if (!conversationId || !url) return;

    setSendingRosterId(rosterId);
    try {
      await sendMessage(Number(conversationId), `Link kích hoạt tài khoản OnstageVN của bạn: ${url}`);
      addToast("Đã gửi link kích hoạt qua tin nhắn.");
    } catch (error) {
      console.error("Cannot send activation link message", error);
      addToast("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSendingRosterId(null);
    }
  }

  function handleDownloadQr() {
    const canvas = document.getElementById("managed-talent-activation-qr") as HTMLCanvasElement | null;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = makeQrFilename(showQrName);
    link.click();
  }

  const visibleItems = items.filter(({ entry }) => !dismissedRosterIds.includes(entry.rosterId || ""));

  if (visibleItems.length === 0) {
    return (
      <section className="rounded-3xl border border-white/8 bg-[#08090f]/70 p-4 md:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">Kích hoạt tài khoản Idol</h3>
            <p className="mt-1 text-xs font-semibold text-slate-400">Tất cả Idol do Brand tạo đã được kích hoạt hoặc chưa có tài khoản cần nhận.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-amber-400/20 bg-[#08090f]/80 p-4 md:p-5 shadow-[0_20px_80px_rgba(0,0,0,0.25)] animate-in fade-in duration-300">
      <div className="space-y-4">
        {/* Header row with Collapse/Uncollapse button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">Kích hoạt tài khoản Idol</h3>
                <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                  {visibleItems.length} chưa kích hoạt
                </span>
              </div>
              {!isCollapsed && (
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-400">
                  Khi sử dụng tính năng Thêm Idol mới, idol này vẫn chưa có tài khoản/hồ sơ trên hệ thống Onstage VN. Nhấn "Tạo link" và gửi link này cho idol bạn vừa tạo để họ vào kích hoạt tài khoản trên hệ thống Onstage VN
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(v => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#0F1115]/60 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer shrink-0"
            title={isCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            {isCollapsed ? <ChevronDown className="h-4.5 w-4.5" /> : <ChevronUp className="h-4.5 w-4.5" />}
          </button>
        </div>

        {/* Grid of activation cards - hidden when collapsed */}
        {!isCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 animate-in fade-in duration-300">
            {visibleItems.map(({ entry, talent }) => {
              const rosterId = entry.rosterId || "";
              const activationLink = activationLinksByRosterId[rosterId] ?? entry.activeActivationLink ?? null;
              const isLoading = loadingRosterId === rosterId;
              const isSending = sendingRosterId === rosterId;
              const isCopied = copiedRosterId === rosterId;

              return (
                <div 
                  key={rosterId || talent.id}
                  className="rounded-3xl border border-white/8 bg-[#0a0c14] p-4 flex flex-col justify-between transition-all hover:border-amber-400/20"
                >
                  <div>
                    {/* Row 1: Avatar, Info, Action Button */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={talent.avatar || createInitialAvatarDataUrl(talent.name, talent.email)}
                          alt={talent.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = createInitialAvatarDataUrl(talent.name, talent.email);
                          }}
                          className="h-12 w-12 rounded-2xl border border-white/10 object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-white">{talent.name}</p>
                          <p className="truncate text-xs font-semibold text-slate-500">{talent.phone || talent.email || "Chưa có thông tin liên hệ"}</p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleCreateLink(rosterId, Boolean(activationLink))}
                        disabled={isLoading || !rosterId}
                        className="h-10 shrink-0 rounded-xl bg-gradient-to-r from-amber-200 to-yellow-500 px-4 text-[10px] font-black uppercase tracking-wider text-slate-950 transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                      >
                        {isLoading ? "Đang tạo..." : activationLink?.is_expired ? "Tạo lại" : activationLink ? "Tạo lại" : "Tạo link"}
                      </button>
                    </div>

                    {activationLink && (
                      <div className="mt-3.5 space-y-3 border-t border-white/5 pt-3.5">
                        <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-black/35 px-3 py-2">
                          <Link2 className="h-4 w-4 shrink-0 text-amber-300 animate-pulse" />
                          <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-bold text-amber-100">{activationLink.url}</span>
                        </div>
                        <div className="space-y-2">
                          {/* Core actions in exactly 1 row */}
                          <div className="flex items-center gap-1.5 w-full">
                            <button 
                              type="button" 
                              onClick={() => handleCopy(rosterId, activationLink.url)} 
                              className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-wider text-white hover:bg-white/10 cursor-pointer active:scale-95 transition"
                            >
                              {isCopied ? <Check className="h-3 w-3 text-emerald-300 shrink-0" /> : <Copy className="h-3 w-3 text-amber-300 shrink-0" />}
                              <span className="whitespace-nowrap">Sao chép</span>
                            </button>
                            <button 
                              type="button" 
                              onClick={() => {
                                setShowQrUrl(activationLink.url);
                                setShowQrName(talent.name);
                              }} 
                              className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-wider text-white hover:bg-white/10 cursor-pointer active:scale-95 transition"
                            >
                              <QrCode className="h-3 w-3 text-cyan-300 shrink-0" />
                              <span className="whitespace-nowrap">Hiện QR</span>
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleCreateLink(rosterId, true)} 
                              disabled={isLoading} 
                              className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-60 cursor-pointer active:scale-95 transition"
                            >
                              <RefreshCw className="h-3 w-3 shrink-0" />
                              <span className="whitespace-nowrap">Tạo lại link</span>
                            </button>
                          </div>

                          {/* Chat message action below it if available */}
                          {activationLink.conversation_id && (
                            <button 
                              type="button" 
                              onClick={() => handleSendMessage(rosterId, String(activationLink.conversation_id), activationLink.url)} 
                              disabled={isSending} 
                              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-[9px] font-black uppercase tracking-wider text-emerald-200 hover:bg-emerald-400/15 disabled:opacity-60 cursor-pointer active:scale-95 transition"
                            >
                              <Send className="h-3.5 w-3.5 shrink-0" />
                              <span>{isSending ? "Đang gửi..." : "Gửi qua tin nhắn chat"}</span>
                            </button>
                          )}
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                          Hết hạn: {formatExpiry(activationLink.expires_at) || "Không xác định"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showQrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020408]/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xs rounded-3xl border border-amber-400/20 bg-[#0b0c15] p-6 text-center shadow-2xl">
            <button 
              type="button" 
              onClick={() => {
                setShowQrUrl(null);
                setShowQrName(null);
              }} 
              className="absolute right-3 top-3 rounded-full border border-white/10 bg-white/5 p-1.5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="mb-4 text-xs font-black uppercase tracking-wider text-white">QR kích hoạt tài khoản</p>
            <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-3xl bg-white p-4">
              <QRCodeCanvas id="managed-talent-activation-qr" value={showQrUrl} size={190} bgColor="#ffffff" fgColor="#020617" level="H" includeMargin={false} />
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-400">{showQrName}</p>
            <button
              type="button"
              onClick={handleDownloadQr}
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-200 to-yellow-500 px-4 text-[10px] font-black uppercase tracking-wider text-slate-950 transition hover:brightness-105 active:scale-95"
            >
              <Download className="h-4 w-4" />
              Tải QR
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
