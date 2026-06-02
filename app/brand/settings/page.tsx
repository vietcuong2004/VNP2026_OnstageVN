"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Globe2, Mail, MapPin, Phone, Save, UserRound } from "lucide-react";
import { partnerProfile } from "@/lib/brand-mvp-data";

export default function BrandSettingsPage() {
  const [profile, setProfile] = useState({
    organizationName: partnerProfile.organizationName,
    organizationType: partnerProfile.organizationType,
    industry: partnerProfile.industry,
    websiteUrl: "https://loreal.vn",
    fanpageUrl: "https://facebook.com/lorealparisvietnam",
    contactName: partnerProfile.contactName,
    contactPhone: partnerProfile.contactPhone,
    contactEmail: partnerProfile.contactEmail,
    city: partnerProfile.city,
    description: "Nhãn hàng mỹ phẩm và chăm sóc sắc đẹp, thường xuyên tìm KOL, model, MC và PG cho campaign marketing.",
  });

  function updateField(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    window.alert("Đã lưu hồ sơ.");
  }

  return (
    <div className="space-y-6 pb-16">
      <section className="flex flex-col gap-4 border-b border-white/5 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
              HỒ SƠ DOANH NGHIỆP
            </span>
            <span className="text-[10px] font-semibold text-slate-500">Brand / Agency / Recruiter</span>
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight text-white">
            THÔNG TIN CHI TIẾT <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent">DOANH NGHIỆP</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Thông tin liên hệ của doanh nghiệp. Có thể thay đổi nhưng phải được Admin kiểm duyệt
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{partnerProfile.verificationStatus}</span>
          </div>
          <div className="mt-1 text-lg font-black text-white">{partnerProfile.completion}% hoàn thiện</div>
        </div>
      </section>

      <form onSubmit={saveProfile} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="h-fit rounded-2xl border border-white/5 bg-slate-950/25 p-5 lg:col-span-4">
          <div className="mb-5 flex items-center gap-4 border-b border-white/5 pb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">{profile.organizationName}</h2>
              <p className="mt-1 text-xs text-slate-500">{profile.industry}</p>
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

        <main className="rounded-2xl border border-white/5 bg-slate-950/25 p-6 lg:col-span-8">
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ngành hàng *</span>
              <input name="industry" value={profile.industry} onChange={updateField} required className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60" />
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
            <button type="submit" className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-5 text-xs font-black text-slate-950">
              <Save className="mr-2 h-4 w-4" />
              Lưu hồ sơ
            </button>
          </div>
        </main>
      </form>
    </div>
  );
}

