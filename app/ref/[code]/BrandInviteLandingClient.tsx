"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api-client";
import { resolveBrandTalentInviteLink, acceptBrandTalentInviteLink } from "@/lib/talent-api";
import { Shield, CheckCircle, Clock, Sparkles, Building2, ChevronRight, Award, Info, Users, Star, ArrowLeft, Globe, MapPin, UserPlus, Check, X, ArrowRight } from "lucide-react";
import { createInitialAvatarDataUrl, normalizeBackendAssetUrl } from "@/lib/avatar";

interface Props {
  code: string;
  talentSlug?: string | null;
}
export default function BrandInviteLandingClient({ code, talentSlug }: Props) {
  const router = useRouter();
  const [inviteData, setInviteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    resolveBrandTalentInviteLink(code, talentSlug)
      .then((data) => {
        setInviteData(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error resolving invite link:", err);
        setError("Đường liên kết mời không tồn tại, đã hết hạn hoặc chưa được kích hoạt.");
      })
      .finally(() => setLoading(false));
  }, [code, talentSlug]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isPending = localStorage.getItem("pendingInviteCode") === code;
      if (isPending && getAuthToken()) {
        setShowConfirmDialog(true);
      }
    }
  }, [code, inviteData]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#02040a] text-center px-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-amber-400 border-r-2 border-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F0C56B]">VNP</span>
          </div>
        </div>
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">
          Đang tải thông tin lời mời...
        </p>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#02040a] text-center px-4 relative overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute top-0 right-0 left-0 z-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <img src="/hero_bg.png" alt="Background" className="w-full h-full object-cover" />
        </div>

        <div className="max-w-md rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 shadow-2xl backdrop-blur-md relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-450">
            <X className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-lg font-black uppercase tracking-wider text-white">Liên kết không hợp lệ</h2>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            {error || "Đường liên kết mời không tồn tại hoặc đã hết hạn. Vui lòng liên hệ Brand Manager để nhận liên kết mới."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 border border-white/10 px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-900"
          >
            Trang chủ
          </button>
        </div>
      </div>
    );
  }

  const brand = inviteData.brand || {};
  const partner = brand.partner_profile || brand.partnerProfile || {};
  const brandName = partner.organization_name || brand.name || "Brand Partner";
  const brandLogo =
    normalizeBackendAssetUrl(
      partner.logo_url || brand.logo_url || brand.logo || brand.external_avatar_url || brand.avatar_url || "",
    ) || "/favicon.png";
  const photos = brand.photos || partner.photos || [];
  const coverPhotoRecord = [...photos].reverse().find((photo: any) => photo.category === "cover");
  const brandCover =
    normalizeBackendAssetUrl(partner.cover_url || "")
    || (coverPhotoRecord ? normalizeBackendAssetUrl(coverPhotoRecord.url || coverPhotoRecord.path) : "")
    || "/cover_image.png";
  const brandDesc = partner.description || "Thành viên đối tác tin cậy của OnstageVN. Đang tìm kiếm các Talent, Model, MC và PG tiềm năng để đồng hành trong các chiến dịch quảng cáo và truyền thông.";
  const brandIndustry = partner.industry || "Thời trang & Đời sống";
  const brandCity = partner.city || "Hà Nội";
  const brandWebsite = partner.website_url || "";
  const isVerified = partner.verification_status !== "unverified";
  const commissionRate = 10;
  const inviter = inviteData.inviter;

  const handleJoinClick = () => {
    if (!getAuthToken()) {
      localStorage.setItem("pendingInviteCode", code);
      if (talentSlug) {
        localStorage.setItem("pendingInviteInviter", talentSlug);
      }
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmJoin = async () => {
    setIsAccepting(true);
    try {
      await acceptBrandTalentInviteLink(code, talentSlug);
      localStorage.removeItem("pendingInviteCode");
      localStorage.removeItem("pendingInviteInviter");
      setSuccess(true);
      setShowConfirmDialog(false);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi tham gia Brand.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    localStorage.removeItem("pendingInviteCode");
    localStorage.removeItem("pendingInviteInviter");
    router.replace("/");
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#02040a] text-center px-4 relative overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute top-0 right-0 left-0 z-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <img src="/hero_bg.png" alt="Background" className="w-full h-full object-cover" />
        </div>

        <div className="max-w-md w-full rounded-3xl border border-[#D4A64A]/30 bg-[#092318]/25 p-8 shadow-2xl backdrop-blur-md relative z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-gold text-slate-950 shadow-lg shadow-amber-500/25">
            <Check className="h-9 w-9 stroke-[3]" />
          </div>

          <h2 className="mt-6 font-display text-xl md:text-2xl font-black uppercase tracking-wider text-white">🎉 Chúc mừng!</h2>
          <p className="mt-2 text-xs font-bold text-[#F0C56B] uppercase tracking-widest">Bạn đã gia nhập thành công</p>

          <div className="mt-5 rounded-2xl border border-white/5 bg-slate-950/70 p-4 flex items-center gap-3 text-left">
            <img src={brandLogo} alt={brandName} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = createInitialAvatarDataUrl(brandName, ""); }} className="h-11 w-11 rounded-xl object-cover border border-[#D4A64A]/30" />
            <div className="min-w-0">
              <p className="text-sm font-black text-white truncate">{brandName}</p>
              <p className="text-[10px] text-slate-500 font-semibold truncate">{brandIndustry} • {brandCity}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-left text-xs text-slate-350 font-medium">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-450 shrink-0" />
              <span>Hồ sơ của bạn đã liên kết với {brandName}.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-450 shrink-0" />
              <span>Sẵn sàng nhận các đề xuất và lời mời tham gia campaign.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-450 shrink-0" />
              <span>Làm việc trực tiếp và bảo chứng thanh toán qua hệ thống.</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/talent/brands")}
            className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-gold text-xs font-black uppercase tracking-widest text-slate-950 shadow-lg shadow-amber-500/10 transition hover:brightness-110 active:scale-[0.99] cursor-pointer"
          >
            Đi tới Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Immersive Mockup Background Image & Gradient Overlays (z-0 to prevent background-color overlap) */}
      <div className="absolute top-0 right-0 left-0 z-0 w-full h-[70vh] md:h-[105vh] overflow-hidden pointer-events-none">
        <img
          src="/hero_bg.png"
          alt="OnstageVN Background Graphics"
          className="w-full h-full object-cover object-right md:object-center absolute right-0 top-0 opacity-40"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-[#02040a]/75 pointer-events-none" />
      </div>

      {/* Additional ambient glows matching root app/page.tsx */}
      <div className="absolute top-[400px] right-10 -z-10 h-[450px] w-[450px] rounded-full bg-purple-650/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[200px] left-1/2 -translate-x-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-[#D4A64A]/5 blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#02040a]/80 backdrop-blur-md border-b border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="w-full max-w-[1550px] mx-auto flex items-center justify-between py-3 md:py-4 px-4 md:px-8">
          <div className="flex items-center hover:opacity-95 transition-opacity cursor-pointer" onClick={() => router.push("/")}>
            <img src="/logo_icon.png" alt="OnstageVN Logo Icon" className="h-8 w-8 md:h-11 md:w-11 object-contain shrink-0" />
            <img src="/logo_text.png" alt="OnstageVN Logo Text" className="h-6 md:h-9 object-contain shrink-0 ml-2" />
            <span className="ml-2.5 rounded bg-amber-400/10 border border-amber-400/25 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-300 hidden sm:inline-block">
              INVITE
            </span>
          </div>
          <div>
            <button
              onClick={() => router.push("/")}
              className="px-3.5 py-1.5 md:px-5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-300 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Trang chủ
            </button>
          </div>
        </div>
      </header>

      {/* Spacer to push content down below fixed header */}
      <div className="h-20 md:h-24 w-full shrink-0 relative z-10" />

      {/* Main Content Wrapper (z-10 to stay on top of background graphics) */}
      <main className="relative z-10 w-full max-w-[1550px] mx-auto px-4 md:px-8 py-6 md:py-10 flex-1 grid gap-8 lg:grid-cols-12 items-start">

        {/* Left Column - Details */}
        <section className="lg:col-span-8 space-y-8 text-left">

          {/* Brand Hero Card (Home page aesthetic) */}
          <div className="rounded-3xl border border-white/5 bg-[#090b16]/45 backdrop-blur-xl overflow-hidden shadow-2xl relative group hover:border-[#D4A64A]/20 transition-all duration-300">
            {/* Banner block containing default brand cover image */}
            <div className="h-40 md:h-56 relative overflow-hidden border-b border-white/5">
              <img
                src={brandCover}
                alt="Brand Cover Banner"
                onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/cover_image.png"; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            </div>

            {/* Profile Content block */}
            <div className="p-6 md:p-8 relative">
              {/* Header row: Avatar & details side-by-side on desktop, stacked on mobile, offset into banner */}
              <div className="flex flex-col md:flex-row items-start md:items-end gap-5 -mt-16 md:-mt-20 relative z-10">
                {/* Avatar position with gold glowing border */}
                <div className="relative h-24 w-24 md:h-28 md:w-28 shrink-0 rounded-3xl overflow-hidden border-4 border-[#02040a] bg-slate-950 p-[3px] shadow-2xl shadow-black/80 group-hover:border-[#D4A64A]/30 transition-colors duration-300">
                  <img src={brandLogo} alt={brandName} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = createInitialAvatarDataUrl(brandName, ""); }} className="h-full w-full rounded-2xl object-cover bg-slate-900" />
                </div>

                {/* Text details */}
                <div className="flex-1 space-y-2 min-w-0 pb-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="font-display text-xl md:text-2xl font-black tracking-tight text-white uppercase leading-none">
                      {brandName}
                    </h1>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 rounded bg-[#071B42]/60 border border-[#D4A64A]/30 px-2.5 py-1 text-[9px] font-black uppercase text-[#F0C56B] shadow-sm">
                        <Check className="h-2.5 w-2.5 stroke-[3]" /> Verified Partner
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-[9px] font-black text-[#F0C56B] uppercase tracking-widest bg-[#071B42]/85 border border-[#D4A64A]/30 px-2.5 py-1 rounded">
                      {brandIndustry}
                    </span>
                    <span className="text-[9px] font-black text-slate-350 uppercase tracking-widest bg-slate-950/70 border border-white/10 px-2.5 py-1 rounded flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-amber-400" /> {brandCity}
                    </span>
                    <span className="text-slate-550 font-semibold text-[10px] uppercase tracking-wider">
                      Brand Partner • OnstageVN Ecosystem
                    </span>
                  </div>
                </div>
              </div>

              {/* Brand Description */}
              <div className="mt-6 p-5 rounded-2xl bg-slate-950/50 border border-white/5 text-slate-200 text-xs md:text-sm leading-relaxed text-justify">
                {brandDesc}
              </div>

              {brandWebsite && (
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#F0C56B] hover:text-white transition-colors">
                  <Globe className="h-4 w-4" />
                  <a href={brandWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {brandWebsite.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Upline Inviter Pill (Tag styling matching homepage) */}
          {inviter && (
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full border border-[#D4A64A]/30 bg-[#071B42]/45 backdrop-blur-md max-w-full">
              <span className="h-2 w-2 rounded-full bg-[#F0C56B] animate-pulse shrink-0" />
              <span className="text-[10px] md:text-xs font-bold text-[#F0C56B] uppercase tracking-wider flex items-center gap-2 truncate">
                Được giới thiệu bởi Talent: <strong className="text-white font-black">{inviter.name}</strong>
              </span>
            </div>
          )}

          {/* Benefits Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-[#D4A64A]/50" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-[#F0C56B]">Quyền lợi khi gia nhập</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: "Campaign nhận trực tiếp", desc: "Nhận các lời mời hợp tác trực tiếp từ Brand Manager với mức hoa hồng và chính sách minh bạch." },
                { title: "Thương lượng chuyên nghiệp", desc: "Đội ngũ chuyên môn hỗ trợ đàm phán hợp đồng, mức cát-xê tối ưu cho các chiến dịch KOL lớn." },
                { title: "Bảo chứng thanh toán", desc: "Ký quỹ OnstageVN đảm bảo giải ngân thù lao nhanh chóng, an toàn sau khi hoàn tất công việc." },
                { title: "Hỗ trợ pháp lý & Hợp đồng", desc: "Tất cả điều khoản hợp tác được bảo vệ pháp lý, giảm thiểu tối đa các rủi ro phát sinh tranh chấp." }
              ].map((benefit, i) => (
                <div key={i} className="group relative p-5 rounded-2xl bg-[#071B42]/30 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-300 hover:bg-[#0c0f24]/50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4A64A]/10 border border-[#D4A64A]/20 text-[#F0C56B] mb-3 group-hover:scale-105 transition-transform duration-300">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">{benefit.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed text-justify">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column - Action Card (Sticky) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 text-left">

          <div className="rounded-3xl border border-white/5 bg-[#090b16]/45 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden hover:border-[#D4A64A]/25 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

            <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400/15 border border-amber-400/30 px-3 py-1 rounded-full text-amber-300 shadow-sm inline-block mb-4">
              THAM GIA MẠNG LƯỚI
            </span>

            {/* Commission display */}
            <div className="p-5 rounded-2xl bg-[#071B42]/40 border border-[#D4A64A]/20 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mức hoa hồng đề xuất</span>
              <span className="text-2xl font-black text-gradient-gold mt-1 block tracking-tight font-mono">{commissionRate}% / JOB</span>
              <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-1.5 block leading-relaxed">
                Áp dụng cho các job phát sinh từ Brand Manager
              </span>
            </div>

            {/* Permissions summary */}
            <div className="mt-5 rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-3.5 text-[11px] leading-relaxed">
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 text-[#F0C56B] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-black uppercase tracking-wider text-slate-350 block">Truy cập hồ sơ</span>
                  <p className="text-slate-450 mt-1">
                    Khi tham gia, Brand Manager được quyền xem thông tin liên hệ, chỉ số kênh và portfolio để tuyển chọn.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-white/5 pt-3.5">
                <Shield className="h-4 w-4 text-[#F0C56B] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-black uppercase tracking-wider text-slate-350 block">Chính sách bảo vệ</span>
                  <p className="text-slate-450 mt-1">
                    Bạn luôn giữ quyền tự do thương thảo và có thể rời khỏi mạng lưới Brand theo chính sách bảo chứng.
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="mt-6 hidden lg:flex flex-col gap-4">
              <button
                onClick={handleJoinClick}
                className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-gold text-slate-950 hover:shadow-[0_0_20px_rgba(240,197,107,0.3)] hover:scale-102 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                Chấp nhận <ArrowRight className="h-4 w-4" />
              </button>

              <div className="relative w-full group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4A64A] to-[#F0C56B] rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300 pointer-events-none" />
                <button
                  onClick={handleDecline}
                  className="relative w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-950 text-[#F0C56B] hover:text-white hover:scale-102 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border border-[#D4A64A]/50 shadow-[0_0_15px_rgba(212,166,74,0.2)]"
                >
                  Không, cảm ơn
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-4 border-t border-white/5 bg-[#02040a]/90 backdrop-blur-md shadow-2xl flex items-center gap-3">
        <button
          onClick={handleDecline}
          className="flex-1 h-11 rounded-xl bg-slate-950 border border-[#D4A64A]/40 text-[10px] font-black uppercase tracking-widest text-[#F0C56B] active:scale-[0.98] transition cursor-pointer"
        >
          Từ chối
        </button>
        <button
          onClick={handleJoinClick}
          className="flex-[2] h-11 rounded-xl bg-gradient-gold text-[10px] font-black uppercase tracking-widest text-slate-950 active:scale-[0.98] transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          Chấp nhận <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-[#02040a]/80 backdrop-blur-md pt-16 pb-24 md:pb-12 px-4 md:px-8 mt-16 max-w-[1550px] mx-auto text-center">
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <img src="/logo_icon.png" alt="OnstageVN Logo Icon" className="h-12 w-12 object-contain shrink-0" />
            <img src="/logo_text.png" alt="OnstageVN Logo Text" className="h-10 object-contain shrink-0" />
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed text-center px-4 font-medium">
            Nền tảng công nghệ tối tân giúp kiến tạo hồ sơ sắc đẹp số chuyên nghiệp, định hướng AI và tự động khớp nối cơ hội hợp tác cho các thế hệ tài năng cùng nhãn hàng.
          </p>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col items-center gap-3 text-[10px] font-semibold text-slate-500">
          <p>© {new Date().getFullYear()} ONSTAGE VN. All rights reserved.</p>
          <p>Designed with excellence for beauty and brand matching.</p>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl border border-[#D4A64A]/30 bg-[#02040a] p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 border border-[#D4A64A]/30 text-amber-400 mx-auto">
              <UserPlus className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-center font-display text-lg font-black uppercase tracking-wider text-white">Xác nhận tham gia</h3>
            <p className="mt-2 text-center text-xs text-slate-400 leading-relaxed font-medium">
              Bạn chuẩn bị tham gia mạng lưới của <strong className="text-white">{brandName}</strong>.
            </p>

            <div className="mt-5 rounded-2xl border border-white/5 bg-slate-950/70 p-4 space-y-2.5 text-xs text-left text-slate-350 font-medium">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-amber-450 shrink-0 mt-0.5" />
                <span>Hồ sơ Talent của bạn sẽ được hiển thị cho Brand.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-amber-450 shrink-0 mt-0.5" />
                <span>Mức hoa hồng chia sẻ đề xuất {commissionRate}% cho các job được giới thiệu.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-amber-450 shrink-0 mt-0.5" />
                <span>Nhận các lời mời hợp tác trực tiếp từ Manager của {brandName}.</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                disabled={isAccepting}
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 h-11 rounded-xl bg-slate-900 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                disabled={isAccepting}
                onClick={handleConfirmJoin}
                className="flex-1 h-11 items-center justify-center gap-1.5 rounded-xl bg-gradient-gold text-xs font-black uppercase tracking-widest text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/15 disabled:opacity-50 transition cursor-pointer"
              >
                {isAccepting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
