"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Globe2, Mail, MapPin, Phone, Save, UserRound, Lock } from "lucide-react";
import { partnerProfile } from "@/lib/brand-mvp-data";
import { loadBrandPartnerProfile, mapBackendPartnerProfile, saveBrandPartnerProfile } from "@/lib/brand-api";
import { getSocialLinkUrl, getStoredAuthUser, loadSocialConnections, SocialConnection, unlinkSocialConnection, updateAuthEmail, apiJson, storeAuthUser } from "@/lib/api-client";
import { SocialProviderIcon } from "@/components/social-provider-icon";
import { loadTalentProfile, uploadTalentPhoto } from "@/lib/talent-api";
import ProgressBar from "@/components/ui/ProgressBar";

type AuthUser = {
  id: number;
  name?: string | null;
  email?: string | null;
  type?: "talent" | "brand";
  external_avatar_url?: string | null;
};

const fallbackProfile = mapBackendPartnerProfile({
  organization_name: partnerProfile.organizationName,
  organization_type: partnerProfile.organizationType,
  industry: partnerProfile.industry,
  website_url: "https://loreal.vn",
  fanpage_url: "https://facebook.com/lorealparisvietnam",
  contact_name: partnerProfile.contactName,
  contact_phone: partnerProfile.contactPhone,
  contact_email: partnerProfile.contactEmail,
  city: partnerProfile.city,
  description: "Nhãn hàng mỹ phẩm và chăm sóc sắc đẹp, thường xuyên tìm KOL, model, MC và PG cho campaign marketing.",
  verification_status: partnerProfile.verificationStatus,
});

export default function BrandSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(fallbackProfile);
  const [saving, setSaving] = useState(false);
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [missingEmailFromQuery, setMissingEmailFromQuery] = useState(false);
  const needsEmail = !authUser?.email;
  const missingEmail = missingEmailFromQuery && needsEmail;

  // Avatar upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profileId, setProfileId] = useState<number | null>(null);

  // Change password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const user = getStoredAuthUser<AuthUser>();
      setAuthUser(user);
      setEmailInput(user?.email ?? "");
      setMissingEmailFromQuery(new URLSearchParams(window.location.search).get("missingEmail") === "1");
    }, 0);

    loadBrandPartnerProfile(fallbackProfile).then(setProfile);
    loadSocialConnections()
      .then(setConnections)
      .catch(() => {
        // Keep settings usable if auth API is not ready.
      });

    loadTalentProfile().then((p) => {
      if (p?.backendProfileId) {
        setProfileId(p.backendProfileId);
      }
    });

    return () => window.clearTimeout(timeout);
  }, []);

  const isLinked = (provider: SocialConnection["provider"]) => {
    return connections.some((connection) => connection.provider === provider);
  };

  const linkSocial = (provider: SocialConnection["provider"]) => {
    window.location.assign(getSocialLinkUrl(provider));
  };

  const unlinkSocial = async (provider: SocialConnection["provider"]) => {
    setSocialLoading(true);
    try {
      await unlinkSocialConnection(provider);
      setConnections((current) => current.filter((connection) => connection.provider !== provider));
      window.alert(`Đã hủy liên kết ${provider}.`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Chưa thể hủy liên kết.");
    } finally {
      setSocialLoading(false);
    }
  };

  async function saveAuthEmail() {
    setEmailSaving(true);
    try {
      const user = await updateAuthEmail(emailInput.trim());
      setAuthUser(user);
      setEmailInput(user.email ?? "");
      setMissingEmailFromQuery(false);
      setProfile((current) => ({
        ...current,
        contactEmail: current.contactEmail || user.email || "",
      }));
      window.alert("Đã cập nhật email đăng nhập.");
      router.replace("/brand/settings");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Chưa thể cập nhật email.");
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!profileId) {
      window.alert("Hồ sơ chưa được đồng bộ, vui lòng thử lại sau.");
      return;
    }

    setUploadingAvatar(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = window.setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);

    try {
      const uploaded = await uploadTalentPhoto(profileId, file, "avatar");
      window.clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Delay slightly so the user sees 100% complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (uploaded?.url && authUser) {
        const updatedUser = { ...authUser, external_avatar_url: uploaded.url };
        setAuthUser(updatedUser);
        storeAuthUser(updatedUser);
        window.alert("Đã cập nhật ảnh đại diện.");
      }
    } catch (error) {
      window.clearInterval(progressInterval);
      window.alert(error instanceof Error ? error.message : "Chưa thể tải ảnh đại diện lên.");
    } finally {
      setUploadingAvatar(false);
      setUploadProgress(0);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      window.alert("Mật khẩu mới và xác nhận mật khẩu không trùng khớp.");
      return;
    }
    setPasswordSaving(true);
    try {
      await apiJson("/auth/password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword || undefined,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });
      window.alert("Đã thay đổi mật khẩu thành công.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Chưa thể đổi mật khẩu.");
    } finally {
      setPasswordSaving(false);
    }
  }

  function updateField(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await saveBrandPartnerProfile(profile);
      setProfile(saved);
      window.alert("Đã lưu hồ sơ.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Chưa thể lưu hồ sơ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-16">
      <section className="flex flex-col gap-4 border-b border-white/5 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
              THÔNG TIN BRAND
            </span>
            <span className="text-[10px] font-semibold text-slate-500">Brand / Agency / Recruiter</span>
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight text-white">
            THÔNG TIN CHI TIẾT <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent">BRAND</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Thông tin liên hệ của brand. Có thể thay đổi nhưng phải được Admin kiểm duyệt
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{profile.verificationStatus}</span>
          </div>
          <div className="mt-1 text-lg font-black text-white">{partnerProfile.completion}% hoàn thiện</div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="h-fit rounded-2xl border border-white/10 bg-slate-950/45 p-6 lg:col-span-4 shadow-xl shadow-black/30 backdrop-blur-sm">
          <div className="mb-5 flex items-start gap-4 border-b border-white/5 pb-5">
            <div className="relative group h-28 w-28 shrink-0 rounded-3xl overflow-hidden border-2 border-amber-500/20 bg-[#08090f] p-[3px] transition-all duration-300 hover:border-amber-400/50 shadow-lg shadow-amber-500/5">
              <img
                src={authUser?.external_avatar_url || "/logo.png"}
                alt={profile.organizationName}
                className="h-full w-full rounded-[22px] object-cover"
              />
              <label htmlFor="brand-avatar-upload" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer gap-1">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest text-center">Tải ảnh lên</span>
                <span className="text-[8px] text-slate-300 uppercase tracking-wider">Từ thiết bị</span>
              </label>
              <input
                type="file"
                id="brand-avatar-upload"
                accept="image/*"
                className="hidden"
                disabled={uploadingAvatar}
                onChange={handleAvatarUpload}
              />
              {uploadingAvatar && (
                <ProgressBar progress={uploadProgress} message="Đang tải..." />
              )}
            </div>
            <div className="pt-2 flex-1 min-w-0">
              <h2 className="text-base font-black text-white leading-tight break-words">{profile.organizationName}</h2>
              {profile.industry && (
                <span className="mt-1.5 inline-block rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-slate-400 max-w-full truncate">
                  {profile.industry}
                </span>
              )}
              <p className="mt-2 text-xs text-slate-500 font-medium">Brand Partner</p>
              
              {/* Mobile/Tablet Change Avatar Button */}
              <div className="mt-3 block lg:hidden">
                <label
                  htmlFor="brand-avatar-upload"
                  className={`inline-flex items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-300 transition-colors hover:bg-amber-400/20 active:bg-amber-400/30 cursor-pointer ${
                    uploadingAvatar ? "opacity-55 pointer-events-none cursor-wait" : ""
                  }`}
                >
                  Đổi ảnh đại diện
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <UserRound className="h-4 w-4 text-amber-300" />
              {profile.contactName}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="h-4 w-4 text-amber-300" />
              {profile.contactPhone}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="h-4 w-4 text-amber-300" />
              {profile.contactEmail}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="h-4 w-4 text-amber-300" />
              {profile.city}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Globe2 className="h-4 w-4 text-amber-300" />
              {profile.websiteUrl}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-500">
            Thông tin liên hệ của doanh nghiệp. Vui lòng cập nhật đầy đủ thông tin để tăng tính xác thực với các KOL, Model, MC, PG
          </div>
        </aside>

        <div className="space-y-6 lg:col-span-8">
          <form onSubmit={saveProfile} className="rounded-2xl border border-white/5 bg-slate-950/25 p-6">
            <div className="mb-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-300">Thông tin tổ chức</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tên tổ chức / cá nhân tuyển dụng *</span>
                <input name="organizationName" value={profile.organizationName} onChange={updateField} required className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Loại tổ chức *</span>
                <select name="organizationType" value={profile.organizationType} onChange={updateField} required className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60">
                  <option value="brand">Brand</option>
                  <option value="agency">Agency</option>
                  <option value="recruiter">Nhà tuyển dụng</option>
                  <option value="event_organizer">Event organizer</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ngành hàng</span>
                <input name="industry" value={profile.industry} onChange={updateField} className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Thành phố *</span>
                <input name="city" value={profile.city} onChange={updateField} required className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Website</span>
                <input name="websiteUrl" value={profile.websiteUrl} onChange={updateField} className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fanpage</span>
                <input name="fanpageUrl" value={profile.fanpageUrl} onChange={updateField} className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Người phụ trách *</span>
                <input name="contactName" value={profile.contactName} onChange={updateField} required className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Số điện thoại *</span>
                <input name="contactPhone" value={profile.contactPhone} onChange={updateField} required className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email công việc *</span>
                <input type="email" name="contactEmail" value={profile.contactEmail} onChange={updateField} required className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mô tả ngắn</span>
                <textarea name="description" value={profile.description} onChange={updateField} rows={4} className="w-full resize-none rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
              </label>
            </div>

            <div className="mt-6 flex justify-end border-t border-white/5 pt-5">
              <button type="submit" disabled={saving} className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-5 text-xs font-black text-slate-950 disabled:cursor-wait disabled:opacity-70">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Đang lưu..." : "Lưu hồ sơ"}
              </button>
            </div>
          </form>

          {/* Thông tin tài khoản (Email đăng nhập + Đổi mật khẩu) */}
          <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-6 space-y-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
                <Lock className="h-4.5 w-4.5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-white">Thông tin tài khoản</h2>
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                  Quản lý email đăng nhập và mật khẩu bảo mật của bạn
                </p>
              </div>
            </div>

            {/* Email đăng nhập */}
            <div className={`rounded-xl border p-4 ${missingEmail ? "border-amber-400/30 bg-amber-400/5" : "border-white/5 bg-white/[0.03]"}`}>
              <div className="mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-300" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email đăng nhập</h3>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-slate-500">
                {missingEmail
                  ? "Facebook chưa trả email. Hãy cập nhật email để nhận thông báo và khôi phục đăng nhập."
                  : "Email dùng để đăng nhập vào hệ thống. Không thể thay đổi email này."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  disabled={!needsEmail}
                  required
                  placeholder="ban@example.com"
                  className={`h-10 flex-1 rounded-xl border px-3 text-xs outline-none transition-all ${
                    !needsEmail
                      ? "border-white/5 bg-slate-950/40 text-slate-400 cursor-not-allowed"
                      : "border-white/5 bg-slate-900/50 text-white focus:border-amber-400/60"
                  }`}
                />
                {needsEmail && (
                  <button
                    type="button"
                    disabled={emailSaving}
                    onClick={saveAuthEmail}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-amber-400 px-6 text-xs font-black text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60 shrink-0"
                  >
                    {emailSaving ? "Đang lưu..." : "Lưu email"}
                  </button>
                )}
              </div>
            </div>

            {/* Đổi mật khẩu */}
            <form onSubmit={handleChangePassword} className="border-t border-white/5 pt-6 space-y-4">
              <div className="text-xs font-black uppercase tracking-widest text-slate-300">Thay đổi mật khẩu</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mật khẩu hiện tại</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mật khẩu mới</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    required
                    className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Xác nhận mật khẩu mới</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60"
                  />
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-5 text-xs font-black text-slate-950 disabled:cursor-wait disabled:opacity-70"
                >
                  {passwordSaving ? "Đang lưu..." : "Cập nhật mật khẩu"}
                </button>
              </div>
            </form>
          </div>

          {/* Liên kết đăng nhập */}
          <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-6">
            <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Liên kết đăng nhập</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(["google", "facebook"] as const).map((provider) => {
                const linked = isLinked(provider);
                const label = provider === "google" ? "Google" : "Facebook";

                return (
                  <div
                    key={`new-${provider}`}
                    className="rounded-xl border border-white/5 bg-slate-950/40 p-3 transition-colors hover:border-amber-400/30"
                  >
                    <div className="flex items-start gap-3">
                      <SocialProviderIcon provider={provider} className="h-10 w-10 rounded-lg shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-white">{label}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                          Dùng tài khoản {label} để đăng nhập vào cùng một tài khoản OnstageVN.
                        </span>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {linked ? (
                            <>
                              <span className="inline-flex h-8 items-center justify-center rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 text-[10px] font-black text-emerald-300">
                                Đã liên kết
                              </span>
                              <button
                                type="button"
                                disabled={socialLoading}
                                onClick={() => unlinkSocial(provider)}
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 text-[10px] font-black text-rose-300 transition-colors hover:bg-rose-500/15 disabled:cursor-wait disabled:opacity-60"
                              >
                                Huỷ liên kết
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              disabled={socialLoading}
                              onClick={() => linkSocial(provider)}
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-amber-400/25 bg-amber-400 px-3 text-[10px] font-black text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
                            >
                              Liên kết
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

