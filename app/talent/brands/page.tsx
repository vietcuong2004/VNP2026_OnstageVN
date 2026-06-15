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
interface BrandInvitation {
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
  invitedBy?: string;
  acceptedInviteLink?: string;
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
const MOCK_INVITATIONS: BrandInvitation[] = [
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
    invitedBy: "Nguyễn Minh Thư (KOL Elite)",
    acceptedInviteLink: "https://onstage.vn/ref/diamond-luxury/minh-thu",
    inviteLink: "https://onstage.vn/ref/diamond-luxury/maianh",
  },
];

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

function usableText(value: unknown) {
  const text = String(value || "").trim();
  if (!text || text.toLowerCase() === "talent") return "";
  return text;
}

function mapBackendInvitation(item: Record<string, unknown>): BrandInvitation {
  const brand = (item.brand || {}) as Record<string, unknown>;
  const partner = (brand.partner_profile || brand.partnerProfile || {}) as Record<string, unknown>;
  const activeTerm = (item.active_term || item.activeTerm || {}) as Record<string, unknown>;
  const parent = (item.parent || item.inviter || {}) as Record<string, unknown>;
  const parentProfile = (parent.talent_profile || parent.talentProfile || {}) as Record<string, unknown>;
  const inviterName = String(parentProfile.display_name || parentProfile.full_name || parent.name || "");
  const usedLink = String(item.used_link || item.usedLink || ((item.accepted_invite_link || item.acceptedInviteLink || {}) as Record<string, unknown>).url || "");
  const statusMap: Record<string, BrandInvitation["status"]> = {
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
    invitedBy: inviterName || undefined,
    acceptedInviteLink: usedLink || undefined,
    members: Array.isArray(item.members || item.children)
      ? ((item.members || item.children) as unknown[]).map((child) => {
        const childRecord = child as Record<string, unknown>;
        const profile = (childRecord.talent_profile || childRecord.talentProfile || {}) as Record<string, unknown>;
        const user = (profile.user || {}) as Record<string, unknown>;
        const parentUser = (user.parent || {}) as Record<string, unknown>;
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
          invitedBy: String(parentUser.name || ""),
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

export default function TalentBrandsPage() {
  const acceptedQueryCodeRef = useRef("");
  const toastIdRef = useRef(0);
  const [invitations, setInvitations] = useState<BrandInvitation[]>([]);
  const [inviteLinkValue, setInviteLinkValue] = useState("");
  const [isAcceptingLink, setIsAcceptingLink] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<BrandInvitation | null>(null);
  const [isLoadingInviteLink, setIsLoadingInviteLink] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: "success" | "info" }[]>([]);

  const loadInvitations = useCallback(async () => {
    try {
      const items = await loadTalentBrandInvitations();
      const mapped = items?.length ? items.map(mapBackendInvitation) : MOCK_INVITATIONS;
      setInvitations(mapped);

      // Pre-load invite links for accepted partnerships in the background
      const acceptedItems = mapped.filter((i) => i.status === "accepted");
      for (const item of acceptedItems) {
        if (item.inviteLink) continue;
        try {
          const link = await loadTalentBrandInviteLink(item.managerId);
          setInvitations((current) =>
            current.map((i) =>
              i.id === item.id
                ? {
                  ...i,
                  inviteLink: link.url,
                  childCount: Number(link.child_count || link.childCount || i.childCount || 0),
                  members: mapBackendInvitation({ ...i, members: link.members || link.children || [] }).members,
                }
                : i
            )
          );
        } catch (error) {
          console.warn("Failed to pre-load invite link for", item.id, error);
        }
      }
    } catch {
      setInvitations(MOCK_INVITATIONS);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadInvitations);
  }, [loadInvitations]);

  const save = (items: BrandInvitation[]) => {
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

  const handleOpenDetails = async (invitation: BrandInvitation) => {
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

  const pending = invitations.filter(i => i.status === "pending");
  const accepted = invitations.filter(i => i.status === "accepted");
  const declined = invitations.filter(i => i.status === "declined");

  const statusConfig = {
    pending: { label: "Đang chờ phản hồi", dot: "bg-amber-400 animate-pulse", text: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/20" },
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

      {/* ── Top Layout Grid ── */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Cột Trái: Nhập link tham gia Brand */}
        <form
          onSubmit={handleAcceptInviteLink}
          className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-gradient-to-b from-[#221809] via-[#0f0e13] to-[#070913] border border-amber-500/40 p-5 md:p-6 shadow-[0_0_50px_rgba(245,158,11,0.06)] relative overflow-hidden group hover:border-amber-400/60 hover:shadow-[0_0_60px_rgba(245,158,11,0.12)] transition-all duration-300 min-h-[340px]"
        >
          {/* Decorative radial gradient glow */}
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-start">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/25 to-yellow-600/10 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-amber-400">
                <Link2 className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-amber-300">
                  Nhập link tham gia Brand
                </h3>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-400 mt-1 inline-block">
                  BRAND PARTNERSHIP
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              Dán đường dẫn giới thiệu dạng <code className="text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono text-[10px]">onstage.vn/ref/ten-brand</code> hoặc nhập mã mời của Brand để tự động gia nhập mạng lưới đối tác đặc quyền của Brand Manager.
            </p>
          </div>

          <div className="space-y-3.5 mt-6 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-amber-400/80 uppercase tracking-widest mb-1.5 px-0.5">
                Đường dẫn giới thiệu / Mã mời:
              </label>
              <input
                value={inviteLinkValue}
                onChange={(event) => setInviteLinkValue(event.target.value)}
                placeholder="https://onstage.vn/ref/ten-brand"
                className="h-12 w-full rounded-xl border border-amber-500/25 bg-black/55 px-4 text-xs font-semibold text-white outline-none placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all shadow-inner text-amber-100"
              />
            </div>

            <button
              type="submit"
              disabled={isAcceptingLink}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-xs font-black uppercase tracking-widest text-slate-950 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.35)]"
            >
              <Send className="h-4 w-4" />
              {isAcceptingLink ? "Đang xử lý..." : "Tham gia ngay"}
            </button>
          </div>
        </form>

        {/* Cột Phải: Thông tin & Phân bổ thù lao */}
        <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
          {/* Info Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-5 relative overflow-hidden flex-1 flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(244,196,48,0.1)]">
                <Network className="h-5.5 w-5.5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest">Hợp tác Brand là gì?</h3>
                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed font-medium">
                  Khi bạn tham gia vào <strong className="text-white">mạng lưới hợp tác của một Brand Manager</strong>, họ sẽ đại diện giới thiệu bạn với nhiều nhãn hàng đối tác lớn và quản lý các booking trực tiếp. Manager nhận <strong className="text-amber-400 font-bold">10% hoa hồng</strong> từ thù lao job do họ mang lại — phần thù lao còn lại <strong className="text-emerald-400 font-bold">75% hoàn toàn thuộc về bạn</strong> (nền tảng OnStage thu phí 15% phí vận hành & ký quỹ bảo chứng).
                </p>
              </div>
            </div>
          </div>

          {/* Commission breakdown visual */}
          <div className="rounded-2xl bg-[#08090f] border border-[#151b2d] p-5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 leading-relaxed">
              <DollarSign className="h-4 w-4 text-emerald-400" /> Phân bổ thù lao (Ví dụ: Job trị giá 10.000.000đ)
            </h3>
            <div className="space-y-3.5">
              {[
                { label: "KOL nhận trực tiếp (75%)", value: "7.500.000đ", pct: 75, color: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]", textColor: "text-emerald-400" },
                { label: "Manager nhận (10%)", value: "1.000.000đ", pct: 10, color: "bg-amber-400 shadow-[0_0_10px_rgba(244,196,48,0.2)]", textColor: "text-amber-400" },
                { label: "Phí nền tảng (15%)", value: "1.500.000đ", pct: 15, color: "bg-slate-600", textColor: "text-slate-400" },
              ].map(row => (
                <div key={row.label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 w-44 shrink-0">{row.label}</p>
                  <div className="flex-1 h-2 bg-[#151b2d] rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", row.color)} style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className={cn("text-xs font-black font-mono w-24 text-right sm:text-right shrink-0", row.textColor)}>{row.value}</span>
                </div>
              ))}
            </div>
            <p className="text-[9.5px] text-slate-500 mt-4 text-center font-semibold uppercase tracking-wider leading-relaxed">
              💡 Bạn vẫn tự do nhận job ngoài — Hợp tác Brand là kênh tăng thêm cơ hội được booking trực tiếp từ các Agency lớn.
            </p>
          </div>
        </div>
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
            <div
              key={inv.id}
              className="group relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#1b1509] via-[#0d0f1a] to-[#070913] p-5 md:p-6 transition-all duration-500 hover:scale-[1.01] hover:border-amber-400/60 hover:shadow-[0_0_40px_rgba(245,158,11,0.22)]"
            >
              {/* Luxury gradient background accents */}
              <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none group-hover:bg-amber-500/15 transition-all duration-500" />
              <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-500" />

              {/* Shimmer light effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-amber-400/40 bg-gradient-to-br from-amber-400/20 to-transparent p-[2px] shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300">
                      <img src={inv.managerAvatar} alt={inv.managerName} className="h-full w-full rounded-[12px] object-cover" />
                    </div>
                    <div className="absolute -bottom-1.5 -right-1.5 h-6.5 w-6.5 rounded-full bg-[#08090f] border border-amber-400/40 flex items-center justify-center shadow-lg">
                      <Crown className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[8px] font-black uppercase tracking-wider bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded text-amber-300 shadow-sm">
                        {inv.managerTier}
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#F0C56B] bg-[#071B42]/60 border border-[#D4A64A]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5 text-amber-400" /> {inv.sentAt}
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-black text-white group-hover:text-amber-300 transition-colors leading-snug tracking-tight">
                      {inv.managerBrand}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400">
                      Người phụ trách: <span className="font-extrabold text-[#F0C56B]">{inv.managerName}</span>
                    </p>
                  </div>
                </div>

                {/* Terms preview section */}
                <div className="flex md:flex-col items-start justify-between md:justify-center md:items-end p-3 rounded-2xl bg-[#08090f]/90 border border-white/5 md:border-0 md:bg-transparent w-full md:w-auto shrink-0 gap-2 shadow-inner md:shadow-none">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mức hoa hồng đề xuất</span>
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400/20 to-amber-500/10 border border-amber-400/30 px-3.5 py-2 rounded-xl text-amber-300 text-xs font-black uppercase tracking-widest shadow-md">
                    <TrendingUp className="h-4 w-4 text-amber-400" /> {Math.round(inv.commissionRate * 100)}% / JOB
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full relative z-10">
                <button
                  onClick={() => handleOpenDetails(inv)}
                  className="w-full sm:w-auto px-6 h-12 rounded-xl border border-amber-400/30 bg-amber-400/5 text-amber-300 text-xs font-black uppercase tracking-wider hover:bg-amber-400 hover:text-black active:scale-[0.98] cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 shrink-0 shadow-md"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Xem chi tiết
                </button>
                <div className="flex-1 w-full flex items-center gap-3">
                  <button
                    onClick={() => handleAccept(inv.id)}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-400 to-green-600 text-xs font-black uppercase tracking-wider text-slate-950 hover:brightness-110 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] active:scale-[0.98] cursor-pointer shadow-md transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-4.5 w-4.5 stroke-[2.5]" /> Chấp nhận
                  </button>
                  <button
                    onClick={() => handleDecline(inv.id)}
                    className="flex-1 h-12 rounded-xl bg-[#050711] border border-[#151b2d] text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white hover:border-slate-700/50 cursor-pointer active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    <X className="h-4.5 w-4.5" /> Từ chối
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Accepted rosters ── */}
      {accepted.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" /> Các Brand đang hợp tác
          </h2>
          {accepted.map(inv => (
            <div
              key={inv.id}
              className="group relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0a2318] via-[#080d16] to-[#070913] p-5 md:p-6 transition-all duration-500 hover:scale-[1.01] hover:border-emerald-400/60 hover:shadow-[0_0_40px_rgba(16,185,129,0.22)]"
            >
              {/* Luxury gradient background accents */}
              <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500" />
              <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-500" />

              {/* Shimmer light effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-emerald-400/40 bg-gradient-to-br from-emerald-400/20 to-transparent p-[2px] shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300">
                      <img src={inv.managerAvatar} alt={inv.managerName} className="h-full w-full rounded-[12px] object-cover" />
                    </div>
                    <div className="absolute -bottom-1.5 -right-1.5 h-6.5 w-6.5 rounded-full bg-[#08090f] border border-emerald-400/40 flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400/20" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-400">
                        Đang hợp tác
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-black text-white group-hover:text-emerald-300 transition-colors leading-snug tracking-tight">
                      {inv.managerBrand}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400">
                      Người phụ trách: <span className="font-extrabold text-white">{inv.managerName}</span>
                    </p>
                  </div>
                </div>

                {/* Terms preview section */}
                <div className="flex md:flex-col items-start justify-between md:justify-center md:items-end p-3 rounded-2xl bg-[#08090f]/90 border border-white/5 md:border-0 md:bg-transparent w-full md:w-auto shrink-0 gap-2 shadow-inner md:shadow-none">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hoa hồng hợp tác</span>
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-400/20 to-emerald-500/10 border border-emerald-400/30 px-3.5 py-2 rounded-xl text-emerald-300 text-xs font-black uppercase tracking-widest shadow-md">
                    <TrendingUp className="h-4 w-4 text-emerald-400" /> {Math.round(inv.commissionRate * 100)}% / JOB
                  </div>
                </div>
              </div>

              {/* Inviter & Used Link Row */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2 relative z-10 border-t border-white/5 pt-4">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Người giới thiệu vào Brand</span>
                  <span className="text-xs font-bold text-slate-350 flex items-center gap-1.5">
                    <Users2 className="h-4 w-4 text-emerald-450 shrink-0" /> {inv.invitedBy || "Trực tiếp từ Brand"}
                  </span>
                </div>
                <div className="space-y-1 text-left min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Link đã dùng để tham gia (từ người mời)</span>
                  <span className="text-xs font-mono font-medium text-slate-400 truncate block bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/5 select-all cursor-pointer" title="Click to select all">
                    {inv.acceptedInviteLink || "Không qua link mời"}
                  </span>
                </div>
              </div>

              {/* Personal Invite Link Row (To invite other KOLs) */}
              <div className="mt-4 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 space-y-2.5 relative z-10 text-left">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-emerald-400" />
                  <p className="text-xs font-black uppercase tracking-widest text-[#F0C56B]">Mời người khác cùng tham gia Brand</p>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-400">
                  Link này đưa talent mới vào cùng mạng lưới liên kết của Brand, đồng thời gắn talent mới dưới sự giới thiệu của bạn. Link này không liên quan đến referral campaign.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    readOnly
                    value={inv.inviteLink || "Đang tải link..."}
                    className="h-10 min-w-0 flex-1 rounded-xl border border-white/5 bg-[#050711] px-3 text-xs font-mono font-semibold text-slate-300 outline-none focus:border-emerald-400/50"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={!inv.inviteLink}
                      onClick={() => {
                        if (!inv.inviteLink) return;
                        navigator.clipboard.writeText(inv.inviteLink).then(
                          () => addToast("Đã sao chép link mời riêng.", "success"),
                          () => addToast("Không sao chép được link, hãy copy thủ công.", "info")
                        );
                      }}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-amber-300 transition disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      <Copy className="h-4 w-4" />
                      Sao chép link
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(inv)}
                      className="px-5 h-10 rounded-xl border border-emerald-400/30 bg-emerald-400/5 text-emerald-350 text-xs font-black uppercase tracking-wider hover:bg-emerald-400 hover:text-black active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      Chi tiết <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
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
                  <p className="text-xs font-black text-white">{inv.managerBrand}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Người phụ trách: {inv.managerName}</p>
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
          <div className="flex min-h-full items-end justify-center md:items-start lg:items-center animate-in fade-in duration-300">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-[#151b2d] bg-[#08090f] px-5 pt-5 pb-8 shadow-2xl md:max-h-[calc(100vh-2rem)] md:rounded-3xl md:px-6 md:pt-6 md:pb-10 relative">
              <div className="absolute top-0 right-1/4 w-48 h-48 bg-gradient-to-br from-amber-500/5 to-transparent blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between gap-4 border-b border-[#151b2d] pb-4">
                <div>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.22em]",
                    selectedInvitation.status === "pending" ? "text-amber-400" : "text-emerald-300"
                  )}>
                    {selectedInvitation.status === "pending" ? "Lời mời hợp tác Brand" : "Chi tiết hợp tác Brand"}
                  </p>
                  <h3 className="mt-2 text-base md:text-lg font-black text-white">{selectedInvitation.managerBrand}</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-405">Quản lý trực tiếp: <span className="text-white font-bold">{selectedInvitation.managerName}</span> ({selectedInvitation.managerTier})</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInvitation(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className={cn(
                  "rounded-2xl border p-4 transition-all duration-300",
                  selectedInvitation.status === "pending"
                    ? "border-amber-500/20 bg-amber-500/5"
                    : selectedInvitation.status === "accepted"
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-red-500/20 bg-red-500/5"
                )}>
                  <p className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    selectedInvitation.status === "pending" ? "text-amber-400" : selectedInvitation.status === "accepted" ? "text-emerald-300" : "text-red-400"
                  )}>Trạng thái</p>
                  <p className="mt-2 text-sm font-black text-white">
                    {selectedInvitation.status === "pending" ? "Chờ phản hồi" : selectedInvitation.status === "accepted" ? "Đang hợp tác" : "Đã từ chối"}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-amber-300">Hoa hồng</p>
                  <p className="mt-2 text-sm font-black text-white">{Math.round(selectedInvitation.commissionRate * 100)}% / JOB</p>
                </div>
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-cyan-300">Talent của Brand</p>
                  <p className="mt-2 text-sm font-black text-white">{selectedInvitation.members?.length || selectedInvitation.childCount || 0}</p>
                </div>
              </div>

              {/* ── Quyền lợi & Điều khoản hợp tác (Hiển thị cho cả 2 trạng thái) ── */}
              <div className="mt-5 rounded-2xl border border-amber-500/20 bg-[#150f02]/45 p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-amber-500/15 pb-3">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <p className="text-xs font-black uppercase tracking-widest text-amber-300">Quyền lợi & Điều khoản hợp tác</p>
                </div>
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-amber-400/10 p-1">
                      <Building2 className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-white">Mạng lưới Agency chuyên nghiệp</p>
                      <p className="text-[10.5px] leading-relaxed text-slate-400">
                        Được đại diện và giới thiệu trực tiếp bởi <strong className="text-white">{selectedInvitation.managerName}</strong> ({selectedInvitation.managerTier}) đến các chiến dịch lớn của <strong className="text-white">{selectedInvitation.managerBrand}</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-amber-400/10 p-1">
                      <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-white">Tỷ lệ chia sẻ thù lao hấp dẫn</p>
                      <p className="text-[10.5px] leading-relaxed text-slate-400">
                        Nhận <strong className="text-emerald-400 font-bold">75% thù lao thực tế</strong> từ Job. Manager chỉ nhận <strong className="text-amber-400">{Math.round(selectedInvitation.commissionRate * 100)}%</strong> phí quản lý & vận hành khi kết nối thành công.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-amber-400/10 p-1">
                      <Shield className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-white">Hợp đồng & Thanh toán Bảo chứng</p>
                      <p className="text-[10.5px] leading-relaxed text-slate-400">
                        Mọi hợp đồng booking được quản lý minh bạch, thanh toán được OnStage ký quỹ bảo vệ quyền lợi 100% cho Talent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>



              {/* ── Danh sách Talent của Brand (Hiển thị cho cả 2 trạng thái ở dưới cùng) ── */}
              <div className="mt-5 rounded-2xl border border-[#151b2d] bg-[#050711] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white">Danh sách Talent của Brand</p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Tất cả Talent đang thuộc mạng lưới liên kết của Brand này, dù được mời bởi Brand hay Talent khác.
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
                      <p className="text-xs font-bold text-slate-400">Brand này chưa có Talent nào trong mạng lưới liên kết.</p>
                      <p className="mt-1 text-[10px] text-slate-650">Khi có Talent tham gia, danh sách sẽ hiển thị tại đây.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Hộp hành động Chấp nhận/Từ chối (Chỉ hiển thị cho trạng thái Đang chờ/Pending) ── */}
              {selectedInvitation.status === "pending" && (
                <div className="mt-6 flex items-center gap-3 border-t border-[#151b2d] pt-5">
                  <button
                    onClick={() => {
                      handleAccept(selectedInvitation.id);
                      setSelectedInvitation(null);
                    }}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-400 to-green-600 text-xs font-black uppercase tracking-wider text-slate-950 hover:brightness-110 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] active:scale-[0.98] shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-4.5 w-4.5 stroke-[2.5]" /> Chấp nhận lời mời
                  </button>
                  <button
                    onClick={() => {
                      handleDecline(selectedInvitation.id);
                      setSelectedInvitation(null);
                    }}
                    className="flex-1 h-12 rounded-xl bg-[#050711] border border-[#151b2d] text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white hover:border-slate-700/50 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" /> Từ chối
                  </button>
                </div>
              )}
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
