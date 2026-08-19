"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api-client";
import { resolveBrandTalentInviteLink, acceptBrandTalentInviteLink } from "@/lib/talent-api";
import { Shield, CheckCircle, Sparkles, AlertCircle, ArrowLeft, Globe, MapPin, UserPlus, Check, X, ArrowRight } from "lucide-react";
import { createInitialAvatarDataUrl, normalizeBackendAssetUrl } from "@/lib/avatar";
import Header from "@/components/header";
import Footer from "@/components/footer";

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F6] text-center px-4">
        <div className="relative">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#8F0709] border-t-transparent"></div>
        </div>
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-[#8F0709] animate-pulse">
          Đang tải thông tin lời mời...
        </p>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F6] text-center px-4 relative overflow-hidden text-[#191116]">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 shadow-2xl relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <X className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-lg font-black uppercase tracking-wider text-[#8F0709]">Liên kết không hợp lệ</h2>
          <p className="mt-3 text-xs leading-relaxed text-[#574D54]">
            {error || "Đường liên kết mời không tồn tại hoặc đã hết hạn. Vui lòng liên hệ người gửi link để nhận liên kết mới."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl border border-[#F0D7D3] bg-white px-6 text-xs font-black uppercase tracking-widest text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition shadow-xs cursor-pointer"
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
    || "/brand_cover_default.png";
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F6] text-center px-4 relative overflow-hidden text-[#191116]">
        <div className="max-w-md w-full rounded-3xl border border-[#F0D7D3] bg-white p-8 shadow-2xl relative z-10 overflow-hidden">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF7EE] text-[#0A6C3B] border border-[#A6E9BD] shadow-sm">
            <Check className="h-9 w-9 stroke-[3]" />
          </div>

          <h2 className="mt-6 font-display text-xl md:text-2xl font-black uppercase tracking-wider text-[#8F0709]">🎉 Chúc mừng!</h2>
          <p className="mt-2 text-xs font-bold text-[#0A6C3B] uppercase tracking-widest">Bạn đã gia nhập thành công</p>

          <div className="mt-5 rounded-2xl border border-[#F0D7D3] bg-[#FFF7F6] p-4 flex items-center gap-3 text-left">
            <img src={brandLogo} alt={brandName} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = createInitialAvatarDataUrl(brandName, ""); }} className="h-11 w-11 rounded-xl object-cover border border-[#F0D7D3]" />
            <div className="min-w-0">
              <p className="text-sm font-black text-[#191116] truncate">{brandName}</p>
              <p className="text-[10px] text-[#574D54] font-semibold truncate">{brandIndustry} • {brandCity}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-left text-xs text-[#574D54] font-medium">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-[#0A6C3B] shrink-0" />
              <span>Hồ sơ của bạn đã liên kết với {brandName}.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-[#0A6C3B] shrink-0" />
              <span>Sẵn sàng nhận các đề xuất và lời mời tham gia campaign.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-[#0A6C3B] shrink-0" />
              <span>Làm việc trực tiếp và bảo chứng thanh toán qua hệ thống.</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/talent/brands")}
            className="light-force-white mt-8 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-xs font-black uppercase tracking-widest !text-white text-white shadow-md transition hover:brightness-110 active:scale-[0.99] cursor-pointer"
          >
            Đi tới Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F6] text-[#191116] flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFF0EE] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFF5F3] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-[1550px] mx-auto px-4 md:px-8 py-6 md:py-8 flex-1 grid gap-8 lg:grid-cols-12 items-start">

        {/* Left Column - Details */}
        <section className="lg:col-span-8 space-y-6 text-left">

          {/* Brand Hero Card */}
          <div className="rounded-3xl border border-[#F0D7D3] bg-white overflow-hidden shadow-sm relative group hover:border-[#8F0709]/40 transition-all duration-300">
            <div className="h-40 md:h-56 relative overflow-hidden border-b border-[#F0D7D3]">
              <img
                src={brandCover}
                alt="Brand Cover Banner"
                onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/brand_cover_default.png"; }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 md:p-8 relative">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-5 -mt-16 md:-mt-20 relative z-10">
                <div className="relative h-24 w-24 md:h-28 md:w-28 shrink-0 rounded-3xl overflow-hidden border-4 border-white bg-white p-[3px] shadow-lg ring-1 ring-[#F0D7D3]">
                  <img src={brandLogo} alt={brandName} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = createInitialAvatarDataUrl(brandName, ""); }} className="h-full w-full rounded-2xl object-cover bg-[#FFF7F6]" />
                </div>

                <div className="flex-1 space-y-2 min-w-0 pb-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="font-display text-xl md:text-2xl font-black tracking-tight text-[#191116] uppercase leading-none">
                      {brandName}
                    </h1>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF7EE] border border-[#A6E9BD] px-3 py-1 text-[9px] font-black uppercase text-[#0A6C3B]">
                        <Check className="h-2.5 w-2.5 stroke-[3]" /> Verified Partner
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-[9px] font-black text-[#8F0709] uppercase tracking-widest bg-[#FFF0EE] border border-[#F0D7D3] px-2.5 py-1 rounded-full">
                      {brandIndustry}
                    </span>
                    <span className="text-[9px] font-bold text-[#574D54] uppercase tracking-widest bg-white border border-[#F0D7D3] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-[#8F0709]" /> {brandCity}
                    </span>
                    <span className="text-[#574D54] font-semibold text-[10px] uppercase tracking-wider">
                      Brand Partner • OnstageVN
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-5 rounded-2xl bg-[#FFF7F6] border border-[#F0D7D3] text-[#574D54] text-xs md:text-sm leading-relaxed text-justify font-medium">
                {brandDesc}
              </div>

              {brandWebsite && (
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#8F0709] hover:underline">
                  <Globe className="h-4 w-4" />
                  <a href={brandWebsite} target="_blank" rel="noopener noreferrer">
                    {brandWebsite.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Upline Inviter Pill */}
          {inviter && (
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full border border-[#F0D7D3] bg-[#FFF0EE] shadow-xs max-w-full">
              <span className="h-2 w-2 rounded-full bg-[#E01B1F] animate-pulse shrink-0" />
              <span className="text-[10px] md:text-xs font-bold text-[#8F0709] uppercase tracking-wider flex items-center gap-2 truncate">
                Được giới thiệu bởi: <strong className="text-[#191116] font-black">{inviter.name}</strong>
              </span>
            </div>
          )}

          {/* Benefits Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F0D7D3] pb-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-[#8F0709]">Quyền lợi khi gia nhập</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: "Campaign nhận trực tiếp", desc: "Nhận các lời mời hợp tác trực tiếp với mức hoa hồng và chính sách minh bạch." },
                { title: "Thương lượng chuyên nghiệp", desc: "Đội ngũ chuyên môn hỗ trợ đàm phán hợp đồng, mức cát-xê tối ưu cho các chiến dịch KOL lớn." },
                { title: "Bảo chứng thanh toán", desc: "Ký quỹ OnstageVN đảm bảo giải ngân thù lao nhanh chóng, an toàn sau khi hoàn tất công việc." },
                { title: "Hỗ trợ pháp lý & Hợp đồng", desc: "Tất cả điều khoản hợp tác được bảo vệ pháp lý, giảm thiểu tối đa các rủi ro phát sinh tranh chấp." }
              ].map((benefit, i) => (
                <div key={i} className="group relative p-5 rounded-2xl bg-white border border-[#F0D7D3] shadow-xs hover:border-[#8F0709]/40 transition-all duration-300">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0EE] border border-[#F0D7D3] text-[#8F0709] mb-3 group-hover:scale-105 transition-transform duration-300">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#191116]">{benefit.title}</h3>
                  <p className="text-[11px] text-[#574D54] mt-2 leading-relaxed text-justify font-medium">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column - Action Card */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 text-left">
          <div className="rounded-3xl border border-[#F0D7D3] bg-white p-6 shadow-sm relative overflow-hidden">
            <span className="text-[9px] font-black uppercase tracking-widest bg-[#FFF0EE] border border-[#F0D7D3] px-3 py-1 rounded-full text-[#8F0709] inline-block mb-4">
              THAM GIA MẠNG LƯỚI
            </span>

            {/* Commission display */}
            <div className="p-5 rounded-2xl bg-[#FFF7F6] border border-[#F0D7D3] text-center">
              <span className="text-[10px] text-[#574D54] font-bold uppercase tracking-wider block">Mức hoa hồng đề xuất</span>
              <span className="text-2xl font-black text-[#8F0709] mt-1 block tracking-tight font-mono">{commissionRate}% / JOB</span>
              <span className="text-[9px] text-[#574D54] font-semibold uppercase tracking-wider mt-1.5 block leading-relaxed">
                Áp dụng cho các job phát sinh từ mạng lưới hợp tác
              </span>
            </div>

            {/* Permissions summary */}
            <div className="mt-5 rounded-2xl border border-[#F0D7D3] bg-[#FFF0EE]/40 p-4 space-y-3.5 text-[11px] leading-relaxed">
              <div className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-[#8F0709] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-black uppercase tracking-wider text-[#8F0709] block">Truy cập hồ sơ</span>
                  <p className="text-[#574D54] font-medium mt-1">
                    Khi tham gia, đối tác được quyền xem thông tin liên hệ, chỉ số kênh và portfolio để tuyển chọn.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-[#F0D7D3] pt-3.5">
                <Shield className="h-4 w-4 text-[#8F0709] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-black uppercase tracking-wider text-[#8F0709] block">Chính sách bảo vệ</span>
                  <p className="text-[#574D54] font-medium mt-1">
                    Bạn luôn giữ quyền tự do thương thảo và có thể rời khỏi mạng lưới hợp tác theo chính sách bảo chứng.
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="mt-6 hidden lg:flex flex-col gap-3">
              <button
                onClick={handleJoinClick}
                className="light-force-white w-full h-12 rounded-2xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white shadow-md hover:brightness-110 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                Chấp nhận <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleDecline}
                className="w-full h-12 rounded-2xl text-xs font-black uppercase tracking-widest bg-white text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border border-[#F0D7D3] shadow-xs"
              >
                Không, cảm ơn
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-4 border-t border-[#F0D7D3] bg-white/95 backdrop-blur-md shadow-2xl flex items-center gap-3">
        <button
          onClick={handleDecline}
          className="flex-1 h-11 rounded-2xl bg-white border border-[#F0D7D3] text-[10px] font-black uppercase tracking-widest text-[#574D54] hover:bg-[#FFF0EE] active:scale-[0.98] transition cursor-pointer shadow-xs"
        >
          Từ chối
        </button>
        <button
          onClick={handleJoinClick}
          className="light-force-white flex-[1.4] h-11 rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-[10px] font-black uppercase tracking-widest !text-white text-white active:scale-[0.98] transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          Chấp nhận <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Footer */}
      <div className="w-full px-4 md:px-8 max-w-[1550px] mx-auto pb-20 md:pb-6 relative z-10">
        <Footer />
      </div>

      {/* Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl border border-[#F0D7D3] bg-white p-6 shadow-2xl relative overflow-hidden text-[#191116]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0EE] border border-[#F0D7D3] text-[#8F0709] mx-auto">
              <UserPlus className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-center font-display text-lg font-black uppercase tracking-wider text-[#8F0709]">Xác nhận tham gia</h3>
            <p className="mt-2 text-center text-xs text-[#574D54] leading-relaxed font-medium">
              Bạn chuẩn bị tham gia mạng lưới hợp tác của <strong className="text-[#191116]">{brandName}</strong>.
            </p>

            <div className="mt-5 rounded-2xl border border-[#F0D7D3] bg-[#FFF7F6] p-4 space-y-2.5 text-xs text-left text-[#574D54] font-medium">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#0A6C3B] shrink-0 mt-0.5" />
                <span>Hồ sơ Talent của bạn sẽ được hiển thị cho Brand.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#0A6C3B] shrink-0 mt-0.5" />
                <span>Mức hoa hồng chia sẻ đề xuất {commissionRate}% cho các job được giới thiệu.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#0A6C3B] shrink-0 mt-0.5" />
                <span>Nhận các lời mời hợp tác trực tiếp từ Manager của {brandName}.</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                disabled={isAccepting}
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 h-11 rounded-2xl bg-white border border-[#F0D7D3] text-xs font-bold uppercase tracking-widest text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] transition cursor-pointer shadow-xs"
              >
                Hủy
              </button>
              <button
                disabled={isAccepting}
                onClick={handleConfirmJoin}
                className="light-force-white flex-1 h-11 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] text-xs font-black uppercase tracking-widest !text-white text-white hover:brightness-110 shadow-md disabled:opacity-50 transition cursor-pointer"
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
