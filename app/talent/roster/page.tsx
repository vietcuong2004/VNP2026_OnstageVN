"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Users2, CheckCircle, X, Clock, Building2, Shield, Star,
  ChevronRight, Sparkles, Gift, DollarSign, TrendingUp, Crown,
  Bell, Check, AlertCircle, Link2, Network, Send, Copy, UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createInitialAvatarDataUrl, isUsableAvatarUrl, profileAvatarFromBackend } from "@/lib/avatar";
import { acceptBrandTalentInviteLink, loadTalentBrandInvitations, loadTalentBrandInviteLink, updateTalentBrandInvitation } from "@/lib/talent-api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RosterInvitation {
  id: string;
  managerId: string;
  managerName: string;
  managerBrand: string;
  managerAvatar: string;
  managerTier: string;       // how many KOL they manage
  commissionRate: number;    // e.g. 0.10
  sentAt: string;
  status: "pending" | "accepted" | "declined";
  inviteLink?: string;
  childCount?: number;
  members?: Array<{
    id: string;
    name: string;
    avatar: string;
    joinedAt: string;
    status: string;
    invitedBy?: string;
  }>;
}

// ─── Mock invitations (as if received from Brands) ────────────────────────────
const MOCK_INVITATIONS: RosterInvitation[] = [
  {
    id: "inv-1",
    managerId: "mgr-loreal",
    managerName: "Nguyễn Văn Hùng",
    managerBrand: "L'Oréal Vietnam Cosmetics",
    managerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80",
    managerTier: "Agency A+",
    commissionRate: 0.10,
    sentAt: "2026-06-08",
    status: "pending",
  },
  {
    id: "inv-2",
    managerId: "mgr-diamond",
    managerName: "Trần Thị Lan",
    managerBrand: "Diamond Luxury Fashion",
    managerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80",
    managerTier: "Agency S",
    commissionRate: 0.10,
    sentAt: "2026-06-05",
    status: "accepted",
  },
];

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

function usableText(value: unknown) {
  const text = String(value || "").trim();
  if (!text || text.toLowerCase() === "talent") return "";
  return text;
}

function mapBackendInvitation(item: Record<string, unknown>): RosterInvitation {
  const brand = (item.brand || {}) as Record<string, unknown>;
  const partner = (brand.partner_profile || brand.partnerProfile || {}) as Record<string, unknown>;
  const activeTerm = (item.active_term || item.activeTerm || {}) as Record<string, unknown>;
  const statusMap: Record<string, RosterInvitation["status"]> = {
    invited: "pending",
    active: "accepted",
    inactive: "declined",
    blocked: "declined",
  };

  return {
    id: String(item.id),
    managerId: String(brand.id || item.brand_user_id || ""),
    managerName: String(brand.name || partner.contact_name || "Brand Manager"),
    managerBrand: String(partner.organization_name || brand.name || "Brand"),
    managerAvatar: String(brand.external_avatar_url || "/avatar.png"),
    managerTier: String(partner.organization_type || "Brand"),
    commissionRate: Number(activeTerm.commission_rate || 10) / 100,
    sentAt: String(item.created_at || item.joined_at || new Date().toISOString()).slice(0, 10),
    status: statusMap[String(item.status)] || "pending",
    inviteLink: String(((item.invite_link || item.inviteLink || {}) as Record<string, unknown>).url || ""),
    childCount: Number(item.child_count || item.childCount || 0),
    members: Array.isArray(item.members || item.children)
      ? ((item.members || item.children) as unknown[]).map((child) => {
          const childRecord = child as Record<string, unknown>;
          const profile = (childRecord.talent_profile || childRecord.talentProfile || {}) as Record<string, unknown>;
          const user = (profile.user || {}) as Record<string, unknown>;
          const parent = (user.parent || {}) as Record<string, unknown>;
          const name =
            usableText(profile.display_name) ||
            usableText(profile.full_name) ||
            usableText(profile.name) ||
            usableText(user.name) ||
            usableText(user.email) ||
            `Talent #${String(profile.id || user.id || childRecord.id || "").trim() || "mới"}`;
          const avatar = String(profileAvatarFromBackend(profile) || profile.avatar_url || user.external_avatar_url || "");

          return {
            id: String(childRecord.id || profile.id || user.id || ""),
            name,
            avatar: isUsableAvatarUrl(avatar) ? avatar : createInitialAvatarDataUrl(name, String(user.email || "")),
            joinedAt: String(childRecord.joined_at || childRecord.created_at || "").slice(0, 10),
            status: String(childRecord.status || "active"),
            invitedBy: String(parent.name || ""),
          };
        })
      : [],
  };
}

function extractInviteParts(value: string) {
  const rawValue = value.trim();
  if (!rawValue) return { code: "", talentSlug: "" };

  try {
    const parsed = new URL(rawValue);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const refIndex = segments.findIndex((segment) => segment.toLowerCase() === "ref");
    if (refIndex >= 0 && segments[refIndex + 1]) {
      return {
        code: decodeURIComponent(segments[refIndex + 1]),
        talentSlug: segments[refIndex + 2] ? decodeURIComponent(segments[refIndex + 2]) : "",
      };
    }

    const refParam = parsed.searchParams.get("ref") || parsed.searchParams.get("code");
    if (refParam) {
      return {
        code: refParam.trim(),
        talentSlug: parsed.searchParams.get("inviter")?.trim() || "",
      };
    }

    return {
      code: decodeURIComponent(segments.at(-2) || segments.at(-1) || ""),
      talentSlug: segments.length > 1 ? decodeURIComponent(segments.at(-1) || "") : "",
    };
  } catch {
    const cleaned = rawValue
      .replace(/^https?:\/\/[^/]+\/?/i, "")
      .replace(/^ref\//i, "")
      .replace(/[?#].*$/, "")
      .replace(/\/$/, "")
      .trim();
    const [code = "", talentSlug = ""] = cleaned.split("/").filter(Boolean);

    return { code, talentSlug };
  }
}

export default function TalentRosterPage() {
  const acceptedQueryCodeRef = useRef("");
  const toastIdRef = useRef(0);
  const [invitations, setInvitations] = useState<RosterInvitation[]>([]);
  const [inviteLinkValue, setInviteLinkValue] = useState("");
  const [isAcceptingLink, setIsAcceptingLink] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<RosterInvitation | null>(null);
  const [isLoadingInviteLink, setIsLoadingInviteLink] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: "success" | "info" }[]>([]);

  const loadInvitations = useCallback(async () => {
    try {
      const items = await loadTalentBrandInvitations();
      if (items?.length) {
        const mapped = items.map(mapBackendInvitation);
        setInvitations(mapped);
        return;
      }

      setInvitations(MOCK_INVITATIONS);
    } catch {
      setInvitations(MOCK_INVITATIONS);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadInvitations);
  }, [loadInvitations]);

  const save = (items: RosterInvitation[]) => {
    setInvitations(items);
  };

  const addToast = (msg: string, type: "success" | "info" = "success") => {
    toastIdRef.current += 1;
    const id = toastIdRef.current.toString();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const handleAccept = async (invId: string) => {
    try {
      const updated = await updateTalentBrandInvitation(invId, "active");
      const mapped = mapBackendInvitation(updated);
      save(invitations.map(i => i.id === invId ? mapped : i));
    } catch (error) {
      console.warn("Cannot accept brand invitation from backend", error);
      save(invitations.map(i => i.id === invId ? { ...i, status: "accepted" as const } : i));
    }
    addToast("Đã chấp nhận lời mời hợp tác Brand! Manager sẽ sớm liên hệ với bạn.", "success");
  };

  const handleDecline = async (invId: string) => {
    try {
      const updated = await updateTalentBrandInvitation(invId, "inactive");
      const mapped = mapBackendInvitation(updated);
      save(invitations.map(i => i.id === invId ? mapped : i));
    } catch (error) {
      console.warn("Cannot decline brand invitation from backend", error);
      save(invitations.map(i => i.id === invId ? { ...i, status: "declined" as const } : i));
    }
    addToast("Đã từ chối lời mời.", "info");
  };

  const handleOpenDetails = async (invitation: RosterInvitation) => {
    setSelectedInvitation(invitation);

    if (invitation.inviteLink) return;

    setIsLoadingInviteLink(true);
    try {
      const link = await loadTalentBrandInviteLink(invitation.managerId);
      const nextInvitation = {
        ...invitation,
        inviteLink: link.url,
        childCount: Number(link.child_count || link.childCount || invitation.childCount || 0),
        members: mapBackendInvitation({ ...invitation, members: link.members || link.children || [] }).members,
      };

      setSelectedInvitation(nextInvitation);
      setInvitations((current) => current.map((item) => item.id === invitation.id ? nextInvitation : item));
    } catch (error) {
      console.warn("Cannot load talent child invite link", error);
      addToast("Chưa thể tải link mời riêng cho Brand này.", "info");
    } finally {
      setIsLoadingInviteLink(false);
    }
  };

  const handleCopyChildInviteLink = () => {
    if (!selectedInvitation?.inviteLink) return;

    navigator.clipboard.writeText(selectedInvitation.inviteLink).then(
      () => addToast("Đã sao chép link mời riêng.", "success"),
      () => addToast("Không sao chép được link, hãy copy thủ công.", "info"),
    );
  };

  const acceptInviteCode = useCallback(async (code: string, talentSlug = "") => {
    if (!code || isAcceptingLink) return;

    setIsAcceptingLink(true);
    try {
      const acceptedInvitation = await acceptBrandTalentInviteLink(code, talentSlug);
      const mapped = mapBackendInvitation(acceptedInvitation);

      setInviteLinkValue("");
      save([
        mapped,
        ...invitations.filter((invitation) => invitation.id !== mapped.id),
      ]);

      await loadInvitations();
      addToast("Đã tham gia mạng lưới Brand từ link mời.", "success");
    } catch (error) {
      console.warn("Cannot accept brand invite link", error);
      addToast("Link mời không hợp lệ hoặc đã hết hạn.", "info");
    } finally {
      setIsAcceptingLink(false);
    }
  }, [invitations, isAcceptingLink, loadInvitations]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const codeFromQuery = params.get("brand_ref") || params.get("ref");
    const talentSlugFromQuery = params.get("inviter") || "";
    if (!codeFromQuery) return;
    const queryKey = `${codeFromQuery}/${talentSlugFromQuery}`;
    if (acceptedQueryCodeRef.current === queryKey) return;

    acceptedQueryCodeRef.current = queryKey;
    acceptInviteCode(codeFromQuery, talentSlugFromQuery);
  }, [acceptInviteCode]);

  const handleAcceptInviteLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { code, talentSlug } = extractInviteParts(inviteLinkValue);
    if (!code) {
      addToast("Vui lòng nhập link hoặc mã mời Brand.", "info");
      return;
    }

    await acceptInviteCode(code, talentSlug);
  };

  const pending  = invitations.filter(i => i.status === "pending");
  const accepted = invitations.filter(i => i.status === "accepted");
  const declined = invitations.filter(i => i.status === "declined");

  const statusConfig = {
    pending:  { label: "Đang chờ phản hồi", dot: "bg-amber-400 animate-pulse", text: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/20" },
    accepted: { label: "Đã hợp tác Brand", dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/20" },
    declined: { label: "Đã từ chối", dot: "bg-red-400", text: "text-red-400", bg: "bg-red-500/5 border-red-500/10" },
  };

  return (
    <div className="space-y-5 pb-20 md:space-y-8 md:pb-0 animate-in fade-in duration-300">
      {/* ── Header ── */}
      <div className="border-b border-white/5 pb-4 md:pb-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
            HỢP TÁC BRAND
          </span>
        </div>
        <h1 className="font-display text-xl md:text-2xl font-black text-white tracking-tight uppercase leading-none">
          Hợp tác Brand
        </h1>
        <p className="text-[11px] md:text-xs text-slate-400 mt-2 font-medium leading-relaxed">
          Xem lời mời từ các Brand Manager muốn thêm bạn vào mạng lưới hợp tác của họ.
        </p>
      </div>

      {/* ── Info Banner ── */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 p-4 md:p-6 flex flex-col md:flex-row md:items-start gap-3 md:gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(244,196,48,0.1)]">
          <Network className="h-5.5 w-5.5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest">Hợp tác Brand là gì?</h3>
          <p className="text-[10.5px] md:text-[11px] text-slate-300 mt-1.5 leading-relaxed font-medium">
            Khi bạn tham gia vào <strong className="text-white">mạng lưới hợp tác của một Brand Manager</strong>, họ sẽ đại diện giới thiệu bạn với nhiều nhãn hàng đối tác lớn và quản lý các booking trực tiếp. Manager nhận <strong className="text-amber-400">10% hoa hồng</strong> từ thù lao job do họ mang lại — phần thù lao còn lại <strong className="text-emerald-400 font-bold">75% hoàn toàn thuộc về bạn</strong> (nền tảng OnStage thu phí 15% phí vận hành & ký quỹ bảo chứng).
          </p>
        </div>
      </div>

      <form
        onSubmit={handleAcceptInviteLink}
        className="rounded-2xl bg-[#08090f] border border-[#151b2d] p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-center"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <Link2 className="h-5 w-5 text-cyan-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-white uppercase tracking-widest">Nhập link mời Brand</p>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
            Dán link dạng onstage.vn/ref/ten-brand hoặc mã mời để tự tham gia mạng lưới của Brand.
          </p>
        </div>
        <input
          value={inviteLinkValue}
          onChange={(event) => setInviteLinkValue(event.target.value)}
          placeholder="https://onstage.vn/ref/ten-brand"
          className="h-11 w-full min-w-0 rounded-xl border border-[#151b2d] bg-[#050711] px-3 text-xs font-semibold text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50 md:max-w-md md:flex-1"
        />
        <button
          type="submit"
          disabled={isAcceptingLink}
          className="flex h-11 w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 text-xs font-black uppercase tracking-wider text-slate-950 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {isAcceptingLink ? "Đang xử lý" : "Tham gia"}
        </button>
      </form>

      {/* ── Commission breakdown visual ── */}
      <div className="rounded-2xl bg-[#08090f] border border-[#151b2d] p-4 md:p-6">
        <h3 className="text-[11px] md:text-xs font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2 leading-relaxed">
          <DollarSign className="h-4 w-4 text-emerald-400" /> Phân bổ thù lao (Ví dụ: Job trị giá 10.000.000đ)
        </h3>
        <div className="space-y-4">
          {[
            { label: "KOL nhận trực tiếp (75%)", value: "7.500.000đ", pct: 75, color: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]", textColor: "text-emerald-400" },
            { label: "Manager nhận (10%)", value: "1.000.000đ", pct: 10, color: "bg-amber-400 shadow-[0_0_10px_rgba(244,196,48,0.2)]", textColor: "text-amber-400" },
            { label: "Phí nền tảng (15%)", value: "1.500.000đ", pct: 15, color: "bg-slate-600", textColor: "text-slate-400" },
          ].map(row => (
            <div key={row.label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 w-48 shrink-0">{row.label}</p>
              <div className="flex-1 h-2 bg-[#151b2d] rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000", row.color)} style={{ width: `${row.pct}%` }} />
              </div>
              <span className={cn("text-xs font-black font-mono w-28 text-right sm:text-right shrink-0", row.textColor)}>{row.value}</span>
            </div>
          ))}
        </div>
        <p className="text-[9px] md:text-[9.5px] text-slate-500 mt-4 text-center font-semibold uppercase tracking-wider leading-relaxed">
          💡 Bạn vẫn tự do nhận job ngoài — Hợp tác Brand là kênh tăng thêm cơ hội được booking trực tiếp từ các Agency lớn.
        </p>
      </div>

      {/* ── Pending invitations ── */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-400 animate-bounce" />
            <h2 className="text-sm font-black text-white uppercase tracking-widest">
              Lời mời đang chờ phản hồi
              <span className="ml-2.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-slate-950 shadow-md">{pending.length}</span>
            </h2>
          </div>
          {pending.map(inv => (
            <div key={inv.id} className={cn("rounded-2xl border p-4 md:p-6 bg-[#08090f] hover:border-amber-500/30 transition-all duration-300", "border-amber-500/25 shadow-[0_0_20px_rgba(245,158,11,0.03)]")}>
              <div className="flex items-start gap-3 md:gap-4">
                <div className="relative shrink-0">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden border border-amber-500/20 bg-amber-500/5 p-[2px]">
                    <img src={inv.managerAvatar} alt={inv.managerName} className="h-full w-full rounded-[12px] object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#08090f] border border-[#151b2d] flex items-center justify-center">
                    <Shield className="h-3 w-3 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-white">{inv.managerName}</h3>
                    <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-400">
                      {inv.managerTier}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{inv.managerBrand}</p>
                  <div className="mt-3 flex flex-col gap-1.5 text-[10px] text-slate-500 font-medium sm:flex-row sm:items-center sm:gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-500" /> Ngày gửi: {inv.sentAt}
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-black uppercase tracking-wider">
                      <TrendingUp className="h-3.5 w-3.5" /> Hoa hồng: {Math.round(inv.commissionRate * 100)}%/job
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                <button
                  onClick={() => handleAccept(inv.id)}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-600 text-xs font-black uppercase tracking-wider text-slate-950 hover:brightness-105 active:scale-[0.98] cursor-pointer shadow-md transition-all duration-300"
                >
                  <Check className="h-4 w-4" /> Chấp nhận
                </button>
                <button
                  onClick={() => handleDecline(inv.id)}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#050711] border border-[#151b2d] text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white hover:border-slate-700/50 cursor-pointer active:scale-[0.98] transition-all duration-300"
                >
                  <X className="h-4 w-4" /> Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Accepted rosters ── */}
      {accepted.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" /> Đang hợp tác Brand
          </h2>
          {accepted.map(inv => (
            <div key={inv.id} className={cn("rounded-2xl border p-4 md:p-5 bg-[#08090f] border-emerald-500/25 hover:border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.02)] transition-all duration-300")}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="h-12 w-12 rounded-xl overflow-hidden border border-emerald-500/20 bg-emerald-500/5 p-[2px] shrink-0">
                  <img src={inv.managerAvatar} alt={inv.managerName} className="h-full w-full rounded-[10px] object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-black text-white">{inv.managerName}</h3>
                    <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-400">
                      Đang liên kết
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{inv.managerBrand}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                    Hoa hồng Manager: <span className="text-amber-400 font-mono font-bold">{Math.round(inv.commissionRate * 100)}%</span> thù lao từ job
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenDetails(inv)}
                  className="flex h-10 w-full items-center justify-center gap-1 rounded-xl border border-[#151b2d] bg-[#050711] text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-white cursor-pointer transition-colors sm:w-auto sm:border-0 sm:bg-transparent"
                >
                  Chi tiết <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Declined ── */}
      {declined.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Đã từ chối</h2>
          {declined.map(inv => (
            <div key={inv.id} className={cn("rounded-2xl border p-4 bg-[#08090f]/50 border-red-500/10 opacity-50 hover:opacity-75 transition-opacity")}>
              <div className="flex items-center gap-3">
                <img src={inv.managerAvatar} alt={inv.managerName} className="h-10 w-10 rounded-xl object-cover border border-[#151b2d]" />
                <div>
                  <p className="text-xs font-black text-white">{inv.managerName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{inv.managerBrand}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {invitations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-white/5 bg-[#08090f]/40">
          <Users2 className="h-12 w-12 text-slate-700 mb-4 animate-pulse" />
          <p className="text-slate-400 font-black text-sm uppercase tracking-wider">Không có lời mời nào</p>
          <p className="text-slate-550 text-xs mt-1 max-w-sm">
            Khi Brand Manager gửi lời mời hợp tác Brand, danh sách sẽ hiển thị tại đây.
          </p>
        </div>
      )}

      {/* ── Toast Notifications ── */}
      {selectedInvitation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-0 backdrop-blur-sm md:p-4">
          <div className="flex min-h-full items-end justify-center md:items-start lg:items-center">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-[#151b2d] bg-[#08090f] p-5 shadow-2xl md:max-h-[calc(100vh-2rem)] md:rounded-3xl md:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-[#151b2d] pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">Chi tiết hợp tác Brand</p>
                <h3 className="mt-2 text-base font-black text-white">{selectedInvitation.managerBrand}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">Quản lý trực tiếp: {selectedInvitation.managerName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvitation(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300">Trạng thái</p>
                <p className="mt-2 text-sm font-black text-white">Đang hợp tác</p>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-300">Hoa hồng</p>
                <p className="mt-2 text-sm font-black text-white">5%/booking</p>
              </div>
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-cyan-300">Talent của Brand</p>
                <p className="mt-2 text-sm font-black text-white">{selectedInvitation.members?.length || selectedInvitation.childCount || 0}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#151b2d] bg-[#050711] p-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-amber-300" />
                <p className="text-xs font-black uppercase tracking-widest text-white">Link mời riêng của bạn</p>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                Link này đưa talent mới vào cùng roster Brand, đồng thời gắn talent mới dưới trướng của bạn. Link này không liên quan đến referral campaign.
              </p>
              <div className="mt-3 flex flex-col gap-2 md:flex-row">
                <input
                  readOnly
                  value={selectedInvitation.inviteLink || (isLoadingInviteLink ? "Đang tải link..." : "Chưa có link")}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-white/5 bg-slate-950 px-3 text-xs font-semibold text-slate-200 outline-none"
                />
                <button
                  type="button"
                  disabled={!selectedInvitation.inviteLink}
                  onClick={handleCopyChildInviteLink}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  Sao chép link
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#151b2d] bg-[#050711] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white">Danh sách Talent của Brand</p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Tất cả Talent đang thuộc roster của Brand này, dù được mời bởi Brand hay Talent khác.
                  </p>
                </div>
                <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[10px] font-black text-cyan-300">
                  {selectedInvitation.members?.length || 0}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {selectedInvitation.members?.length ? (
                  selectedInvitation.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-950/60 p-3">
                      <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black text-white">{member.name}</p>
                        <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                          Tham gia: {member.joinedAt || "Chưa cập nhật"}
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                          Được mời bởi: <span className="font-bold text-slate-300">{member.invitedBy || "Brand"}</span>
                        </p>
                      </div>
                      <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-black uppercase text-emerald-300">
                        {member.status === "active" ? "Đang hoạt động" : member.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-center">
                    <p className="text-xs font-bold text-slate-400">Brand này chưa có Talent nào trong roster.</p>
                    <p className="mt-1 text-[10px] text-slate-600">Khi có Talent tham gia, danh sách sẽ hiển thị tại đây.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-24 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              "animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-xl border px-4 py-3 text-xs font-bold shadow-xl flex items-center gap-2",
              t.type === "success"
                ? "bg-emerald-950 border-emerald-500/30 text-emerald-300"
                : "bg-slate-900 border-slate-700 text-slate-300"
            )}
          >
            {t.type === "success" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
