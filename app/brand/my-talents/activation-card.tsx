"use client";

import React, { useMemo, useState } from "react";
import { Check, Copy, Link2, QrCode, RefreshCw, Search, Send, UserCheck, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { createManagedTalentActivationLink, type ManagedTalentActivationLink } from "@/lib/brand-api";
import { sendMessage } from "@/lib/messaging-api";
import { cn } from "@/lib/utils";
import type { BrandTalentCard, RosterTalent } from "./page";

type ActivationTalentItem = {
  entry: RosterTalent;
  talent: BrandTalentCard;
};

type ActivationCardProps = {
  items: ActivationTalentItem[];
  addToast: (message: string) => void;
};

function formatExpiry(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function ActivationCard({ items, addToast }: ActivationCardProps) {
  const [search, setSearch] = useState("");
  const [selectedRosterId, setSelectedRosterId] = useState(items[0]?.entry.rosterId || "");
  const [activationLinksByRosterId, setActivationLinksByRosterId] = useState<Record<string, ManagedTalentActivationLink>>({});
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("vi");
    if (!term) return items;
    return items.filter(({ talent }) => `${talent.name} ${talent.phone || ""} ${talent.email || ""}`.toLocaleLowerCase("vi").includes(term));
  }, [items, search]);

  const selected = items.find(({ entry }) => entry.rosterId === selectedRosterId) || items[0] || null;
  const selectedRosterIdForLink = selected?.entry.rosterId || "";
  const activationLink = selectedRosterIdForLink
    ? activationLinksByRosterId[selectedRosterIdForLink] ?? selected?.entry.activeActivationLink ?? null
    : null;

  async function handleCreateLink(force = false) {
    const rosterId = selected?.entry.rosterId;
    if (!rosterId) return;

    setLoading(true);
    try {
      const link = await createManagedTalentActivationLink(rosterId, { force });
      setActivationLinksByRosterId((prev) => ({ ...prev, [rosterId]: link }));
      addToast(force ? "Đã tạo lại link kích hoạt." : "Đã tạo link kích hoạt tài khoản.");
    } catch (error) {
      console.error("Cannot create managed talent activation link", error);
      addToast("Không thể tạo link kích hoạt. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }
  async function handleCopy() {
    if (!activationLink?.url) return;
    await navigator.clipboard.writeText(activationLink.url);
    setCopied(true);
    addToast("Đã sao chép link kích hoạt.");
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function handleSendMessage() {
    if (!activationLink?.conversation_id || !activationLink.url) return;

    setSending(true);
    try {
      await sendMessage(Number(activationLink.conversation_id), `Link kích hoạt tài khoản OnstageVN của bạn: ${activationLink.url}`);
      addToast("Đã gửi link kích hoạt qua tin nhắn.");
    } catch (error) {
      console.error("Cannot send activation link message", error);
      addToast("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="rounded-3xl border border-white/8 bg-[#08090f]/70 p-4 md:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">Kích hoạt tài khoản Talent</h3>
            <p className="mt-1 text-xs font-semibold text-slate-400">Tất cả Talent do Brand tạo đã được kích hoạt hoặc chưa có tài khoản cần nhận.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-amber-400/20 bg-[#08090f]/80 p-4 md:p-5 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">Kích hoạt tài khoản Talent</h3>
                <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                  {items.length} chưa kích hoạt
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-400">
                Tạo link riêng cho Talent do Brand tạo hộ để họ tự nhận tài khoản, đặt email/mật khẩu và hoàn thiện hồ sơ.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,320px)]">
            <label className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Chọn Talent</span>
              <select
                value={selectedRosterId}
                onChange={(event) => {
                  setSelectedRosterId(event.target.value);
                }}
                className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 text-xs font-bold text-white outline-none focus:border-amber-400/40"
              >
                {items.map(({ entry, talent }) => (
                  <option key={entry.rosterId || talent.id} value={entry.rosterId || ""}>{talent.name}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tìm nhanh</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tên, email hoặc SĐT..."
                  className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950 pl-9 pr-3 text-xs font-bold text-white outline-none placeholder:text-slate-600 focus:border-amber-400/40"
                />
              </div>
            </label>
          </div>

          {search && filteredItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filteredItems.slice(0, 5).map(({ entry, talent }) => (
                <button
                  key={entry.rosterId || talent.id}
                  type="button"
                  onClick={() => {
                    setSelectedRosterId(entry.rosterId || "");
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all",
                    selectedRosterId === entry.rosterId
                      ? "border-amber-300 bg-amber-300 text-slate-950"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/40 hover:text-white",
                  )}
                >
                  {talent.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full rounded-3xl border border-white/8 bg-slate-950/70 p-3 lg:w-[420px]">
          <div className="flex items-center gap-3">
            <img
              src={selected?.talent.avatar || ""}
              alt={selected?.talent.name || "Talent"}
              className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">{selected?.talent.name}</p>
              <p className="truncate text-xs font-semibold text-slate-500">{selected?.talent.phone || selected?.talent.email || "Chưa có thông tin liên hệ"}</p>
            </div>
            <button
              type="button"
              onClick={() => handleCreateLink(Boolean(activationLink))}
              disabled={loading || !selected?.entry.rosterId}
              className="h-10 shrink-0 rounded-xl bg-gradient-to-r from-amber-200 to-yellow-500 px-4 text-[10px] font-black uppercase tracking-wider text-slate-950 transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang tạo..." : activationLink?.is_expired ? "Tạo lại link" : activationLink ? "Tạo lại" : "Tạo link"}
            </button>
          </div>

          {activationLink && (
            <div className="mt-3 space-y-3 border-t border-white/8 pt-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-black/30 px-3 py-2">
                <Link2 className="h-4 w-4 shrink-0 text-amber-300" />
                <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-bold text-amber-100">{activationLink.url}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleCopy} className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-[10px] font-black uppercase tracking-wider text-white hover:bg-white/10">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5 text-amber-300" />}
                  Sao chép
                </button>
                <button type="button" onClick={() => setShowQr(true)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-[10px] font-black uppercase tracking-wider text-white hover:bg-white/10">
                  <QrCode className="h-3.5 w-3.5 text-cyan-300" /> Hiện QR
                </button>
                {activationLink.conversation_id && (
                  <button type="button" onClick={handleSendMessage} disabled={sending} className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 text-[10px] font-black uppercase tracking-wider text-emerald-200 hover:bg-emerald-400/15 disabled:opacity-60">
                    <Send className="h-3.5 w-3.5" /> {sending ? "Đang gửi" : "Gửi qua tin nhắn"}
                  </button>
                )}
                <button type="button" onClick={() => handleCreateLink(true)} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-[10px] font-black uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-60">
                  <RefreshCw className="h-3.5 w-3.5" /> Tạo lại link
                </button>
              </div>
              <p className="text-[10px] font-semibold text-slate-500">Hết hạn: {formatExpiry(activationLink.expires_at) || "Không xác định"}</p>
            </div>
          )}
        </div>
      </div>

      {showQr && activationLink?.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020408]/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xs rounded-3xl border border-amber-400/20 bg-[#0b0c15] p-6 text-center shadow-2xl">
            <button type="button" onClick={() => setShowQr(false)} className="absolute right-3 top-3 rounded-full border border-white/10 bg-white/5 p-1.5 text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
            <p className="mb-4 text-xs font-black uppercase tracking-wider text-white">QR kích hoạt tài khoản</p>
            <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-3xl bg-white p-4">
              <QRCodeCanvas value={activationLink.url} size={190} bgColor="#ffffff" fgColor="#020617" level="H" includeMargin={false} />
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-400">{selected?.talent.name}</p>
          </div>
        </div>
      )}
    </section>
  );
}
