"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Globe2, Mail, MapPin, Phone, Save, Upload, UserRound } from "lucide-react";
import { loadBrandPartnerProfile, mapBackendPartnerProfile, saveBrandPartnerProfile, uploadBrandProfileCover, uploadBrandProfileLogo } from "@/lib/brand-api";
import { getStoredAuthUser, storeAuthUser } from "@/lib/api-client";
import ProgressBar from "@/components/ui/ProgressBar";
import { useGuestActionPrompt } from "@/components/guest-action-prompt";

type AuthUser = {
  id: number;
  name?: string | null;
  email?: string | null;
  type?: "user" | "admin" | string | null;
  external_avatar_url?: string | null;
};

const fallbackProfile = mapBackendPartnerProfile({
  verification_status: "pending",
});

function displayText(value: string | null | undefined) {
  return value?.trim() || "Chưa cập nhật";
}

function calculateCompletion(profile: typeof fallbackProfile) {
  const fields = [
    profile.organizationName,
    profile.organizationType,
    profile.industry,
    profile.city,
    profile.websiteUrl,
    profile.fanpageUrl,
    profile.contactName,
    profile.contactPhone,
    profile.contactEmail,
    profile.description,
    profile.logoUrl,
    profile.coverUrl,
  ];
  const completed = fields.filter((value) => String(value || "").trim()).length;

  return Math.round((completed / fields.length) * 100);
}

export default function BrandSettingsPage() {
  const { requireAuthAction, GuestActionPrompt } = useGuestActionPrompt();
  const [profile, setProfile] = useState(fallbackProfile);
  const [saving, setSaving] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const profileCompletion = calculateCompletion(profile);

  // Avatar upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Cover photo upload states
  const [coverUrl, setCoverUrl] = useState("/brand_cover_default.png");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);

  // Custom toast notification states
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const user = getStoredAuthUser<AuthUser>();
      setAuthUser(user);
    }, 0);

    loadBrandPartnerProfile(fallbackProfile).then((loadedProfile) => {
      setProfile(loadedProfile);
      if (loadedProfile.coverUrl) {
        setCoverUrl(loadedProfile.coverUrl);
      }
      if (loadedProfile.logoUrl) {
        setAuthUser((current) => (
          current ? { ...current, external_avatar_url: loadedProfile.logoUrl } : current
        ));
      }
    });
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (!authUser) return;

    const storedUser = getStoredAuthUser<AuthUser>();
    const nextSerialized = JSON.stringify(authUser);
    const currentSerialized = storedUser ? JSON.stringify(storedUser) : "";

    if (nextSerialized !== currentSerialized) {
      storeAuthUser(authUser);
    }
  }, [authUser]);


  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!requireAuthAction({ actionLabel: "Tải logo Brand lên hệ thống" })) {
      event.currentTarget.value = "";
      return;
    }

    setUploadingAvatar(true);
    setUploadProgress(0);

    const progressInterval = window.setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);

    try {
      const savedProfile = await uploadBrandProfileLogo(file);
      window.clearInterval(progressInterval);
      setUploadProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setProfile(savedProfile);

      if (savedProfile.logoUrl) {
        setAuthUser((current) => (
          current ? { ...current, external_avatar_url: savedProfile.logoUrl } : current
        ));
      }

      showToast("Cập nhật ảnh đại diện thành công!", "success");
    } catch (error) {
      window.clearInterval(progressInterval);
      showToast(error instanceof Error ? error.message : "Chưa thể tải ảnh đại diện lên.", "error");
    } finally {
      setUploadingAvatar(false);
      setUploadProgress(0);
    }
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!requireAuthAction({ actionLabel: "Tải ảnh bìa Brand lên hệ thống" })) {
      event.currentTarget.value = "";
      return;
    }

    setUploadingCover(true);
    setCoverProgress(0);

    const progressInterval = window.setInterval(() => {
      setCoverProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);

    try {
      const savedProfile = await uploadBrandProfileCover(file);
      window.clearInterval(progressInterval);
      setCoverProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setProfile(savedProfile);
      setCoverUrl(savedProfile.coverUrl || "/brand_cover_default.png");
      showToast("Cập nhật ảnh bìa thành công!", "success");
    } catch (error) {
      window.clearInterval(progressInterval);
      showToast(error instanceof Error ? error.message : "Chưa thể tải ảnh bìa lên.", "error");
    } finally {
      setUploadingCover(false);
      setCoverProgress(0);
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
      showToast("Đã lưu hồ sơ thành công.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Chưa thể lưu hồ sơ. Vui lòng thử lại.", "error");
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
          <div className="mt-1 text-lg font-black text-white">{profileCompletion}% hoàn thiện</div>
        </div>
      </section>

      {/* Brand Cover Banner Area */}
      <div className="relative h-44 md:h-60 w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-lg group">
        <img
          src={coverUrl}
          alt="Brand Cover Banner"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        
        {/* Upload Button overlay / floating */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <label
            htmlFor="brand-cover-upload"
            className="flex items-center gap-2 rounded-xl bg-slate-950/80 border border-white/10 px-4 py-2 text-xs font-black text-white hover:bg-slate-900 hover:border-amber-400/55 transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-sm"
          >
            <Upload className="h-4 w-4 text-amber-300" />
            <span>TẢI ẢNH BÌA LÊN</span>
          </label>
          <input
            type="file"
            id="brand-cover-upload"
            accept="image/*"
            className="hidden"
            disabled={uploadingCover}
            onChange={handleCoverUpload}
          />
        </div>
        
        {/* Cover upload progress */}
        {uploadingCover && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
            <ProgressBar progress={coverProgress} message="Đang tải ảnh bìa..." />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="h-fit rounded-2xl border border-white/10 bg-slate-950/45 p-6 lg:col-span-4 shadow-xl shadow-black/30 backdrop-blur-sm">
          <div className="mb-5 flex items-start gap-4 border-b border-white/5 pb-5">
            <div className="relative group h-28 w-28 shrink-0 rounded-3xl overflow-hidden border-2 border-amber-500/20 bg-[#08090f] p-[3px] transition-all duration-300 hover:border-amber-400/50 shadow-lg shadow-amber-500/5">
              <img
                src={profile.logoUrl || authUser?.external_avatar_url || "/logo.png"}
                alt={profile.organizationName || "Brand logo"}
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
              <h2 className="text-base font-black text-white leading-tight break-words">{displayText(profile.organizationName)}</h2>
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
              {displayText(profile.contactName)}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="h-4 w-4 text-amber-300" />
              {displayText(profile.contactPhone)}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="h-4 w-4 text-amber-300" />
              {displayText(profile.contactEmail)}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="h-4 w-4 text-amber-300" />
              {displayText(profile.city)}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Globe2 className="h-4 w-4 text-amber-300" />
              {displayText(profile.websiteUrl)}
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

        </div>
      </div>

      <GuestActionPrompt />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#0b0c16]/95 px-6 py-3.5 shadow-2xl shadow-black/80 backdrop-blur-md">
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
            )}
            <span className="text-xs font-semibold text-white tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

