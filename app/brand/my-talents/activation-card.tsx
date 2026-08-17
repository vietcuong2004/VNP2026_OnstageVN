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
      <section className="rounded-3xl border border-[#F0D7D3] bg-white p-4 md:p-5 shadow-sm dark:border-white/8 dark:bg-[#08090f]/70">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-[#191116] dark:text-white">Kích hoạt tài khoản Idol</h3>
            <p className="mt-1 text-xs font-semibold text-[#574D54] dark:text-slate-400">Tất cả Idol do Brand tạo đã được kích hoạt hoặc chưa có tài khoản cần nhận.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[#F0D7D3] bg-white p-4 md:p-5 shadow-sm dark:border-amber-400/20 dark:bg-[#08090f]/80 animate-in fade-in duration-300">
      <div className="space-y-4">
        {/* Header row with Collapse/Uncollapse button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-sm font-black uppercase tracking-wider text-[#191116] dark:text-white">Kích hoạt tài khoản Idol</h3>
                <span className="rounded-full border border-[#F0D7D3] bg-[#FFF0EE] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#8F0709] shadow-sm dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
                  {visibleItems.length} chưa kích hoạt
                </span>
              </div>
              {!isCollapsed && (
                <p className="mt-1 text-xs font-semibold leading-relaxed text-[#574D54] dark:text-slate-400">
                  Khi sử dụng tính năng Thêm Idol mới, idol này vẫn chưa có tài khoản/hồ sơ trên hệ thống Onstage VN. Nhấn "Tạo link" và gửi link này cho idol bạn vừa tạo để họ vào kích hoạt tài khoản trên hệ thống Onstage VN
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(v => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#F0D7D3] bg-white text-[#574D54] hover:text-[#8F0709] hover:bg-[#FFF0EE] active:scale-95 transition-all cursor-pointer shrink-0 shadow-sm dark:border-white/10 dark:bg-[#0F1115]/60 dark:text-slate-400 dark:hover:text-white"
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
                  className="rounded-3xl border border-[#F0D7D3] bg-[#FAF7F6] p-4 flex flex-col justify-between transition-all hover:border-[#8F0709] shadow-sm dark:border-white/8 dark:bg-[#0a0c14] dark:hover:border-amber-400/20"
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
                          className="h-12 w-12 rounded-2xl border border-[#F0D7D3] object-cover shrink-0 dark:border-white/10"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[#191116] dark:text-white">{talent.name}</p>
                          <p className="truncate text-xs font-semibold text-[#574D54] dark:text-slate-500">{talent.email || "Chưa có email liên hệ"}</p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        style={{ color: "#ffffff" }}
                        onClick={() => handleCreateLink(rosterId, Boolean(activationLink))}
                        disabled={isLoading || !rosterId}
                        className="light-force-white h-10 shrink-0 rounded-xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white px-4 text-[10px] font-black uppercase tracking-wider shadow-md transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                      >
                        <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">{isLoading ? "Đang tạo..." : activationLink?.is_expired ? "Tạo lại" : activationLink ? "Tạo lại" : "Tạo link"}</span>
                      </button>
                    </div>

                    {activationLink && (
                      <div className="mt-3.5 space-y-3 border-t border-[#F0D7D3] pt-3.5 dark:border-white/5">
                        <div className="flex items-center gap-2 rounded-2xl border border-[#F0D7D3] bg-[#FFF0EE] px-3 py-2">
                          <Link2 className="h-4 w-4 shrink-0 text-[#8F0709] animate-pulse dark:text-amber-300" />
                          <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-bold text-[#8F0709] dark:text-amber-100">{activationLink.url}</span>
                        </div>
                        <div className="space-y-2">
                          {/* Core actions in exactly 1 row */}
                          <div className="flex items-center gap-1.5 w-full">
                            <button 
                              type="button" 
                              onClick={() => handleCopy(rosterId, activationLink.url)} 
                              className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-xl border border-[#F0D7D3] bg-white text-[9px] font-black uppercase tracking-wider text-[#574D54] hover:border-[#8F0709] hover:text-[#8F0709] shadow-sm cursor-pointer active:scale-95 transition dark:border-white/10 dark:bg-white/5 dark:text-white"
                            >
                              {isCopied ? <Check className="h-3 w-3 text-emerald-600 shrink-0" /> : <Copy className="h-3 w-3 text-[#8F0709] shrink-0 dark:text-amber-300" />}
                              <span className="whitespace-nowrap">Sao chép</span>
                            </button>
                            <button 
                              type="button" 
                              onClick={() => {
                                setShowQrUrl(activationLink.url);
                                setShowQrName(talent.name);
                              }} 
                              className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-xl border border-[#F0D7D3] bg-white text-[9px] font-black uppercase tracking-wider text-[#574D54] hover:border-[#8F0709] hover:text-[#8F0709] shadow-sm cursor-pointer active:scale-95 transition dark:border-white/10 dark:bg-white/5 dark:text-white"
                            >
                              <QrCode className="h-3 w-3 text-cyan-600 shrink-0 dark:text-cyan-300" />
                              <span className="whitespace-nowrap">Hiện QR</span>
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleCreateLink(rosterId, true)} 
                              disabled={isLoading} 
                              className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-xl border border-[#F0D7D3] bg-white text-[9px] font-black uppercase tracking-wider text-[#574D54] hover:border-[#8F0709] hover:text-[#8F0709] shadow-sm disabled:opacity-60 cursor-pointer active:scale-95 transition dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
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
                              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50 text-[9px] font-black uppercase tracking-wider text-emerald-800 hover:bg-emerald-100 disabled:opacity-60 cursor-pointer active:scale-95 transition dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200"
                            >
                              <Send className="h-3.5 w-3.5 shrink-0" />
                              <span>{isSending ? "Đang gửi..." : "Gửi qua tin nhắn chat"}</span>
                            </button>
                          )}
                        </div>
                        <p className="text-[9px] font-bold text-[#574D54] uppercase tracking-wide dark:text-slate-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191116]/60 p-4 backdrop-blur-sm dark:bg-[#020408]/85">
          <div className="relative w-full max-w-xs rounded-3xl border border-[#F0D7D3] bg-white p-6 text-center shadow-2xl dark:border-amber-400/20 dark:bg-[#0b0c15]">
            <button 
              type="button" 
              onClick={() => {
                setShowQrUrl(null);
                setShowQrName(null);
              }} 
              className="absolute right-3 top-3 rounded-full border border-[#F0D7D3] bg-[#FFF0EE] p-1.5 text-[#574D54] hover:text-[#8F0709] cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="mb-4 text-xs font-black uppercase tracking-wider text-[#191116] dark:text-white">QR kích hoạt tài khoản</p>
            <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-3xl bg-white p-4 border border-[#F0D7D3] shadow-sm">
              <QRCodeCanvas id="managed-talent-activation-qr" value={showQrUrl} size={190} bgColor="#ffffff" fgColor="#020617" level="H" includeMargin={false} />
            </div>
            <p className="mt-4 text-xs font-semibold text-[#574D54] dark:text-slate-400">{showQrName}</p>
            <button
              type="button"
              style={{ color: "#ffffff" }}
              onClick={handleDownloadQr}
              className="light-force-white mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white px-4 text-[10px] font-black uppercase tracking-wider shadow-md transition hover:brightness-105 active:scale-95"
            >
              <Download className="h-4 w-4 stroke-[3] !text-white text-white" />
              <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">Tải QR</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
