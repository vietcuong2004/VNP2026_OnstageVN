"use client";

import React from "react";
import { User, Phone, Mail, ShieldCheck } from "lucide-react";

export type ContactFormProps = {
  contactName: string;
  setContactName: (value: string) => void;
  contactPhone: string;
  setContactPhone: (value: string) => void;
  contactEmail: string;
  setContactEmail: (value: string) => void;
};

export default function ContactForm({
  contactName,
  setContactName,
  contactPhone,
  setContactPhone,
  contactEmail,
  setContactEmail,
}: ContactFormProps) {
  return (
    <section className="space-y-6 text-left">
      {/* Description header */}
      <div className="space-y-1">
        <h3 className="text-base md:text-lg font-black text-white">
          Thông tin liên hệ
        </h3>
        <p className="text-xs font-semibold text-slate-400">
          Để Onstage liên hệ tư vấn và xác nhận yêu cầu booking
        </p>
      </div>

      {/* Main card */}
      <div className="rounded-3xl border border-white/10 bg-[#121522] p-5 space-y-4 shadow-xl">
        {/* Họ và tên */}
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
            Họ và tên <span className="text-red-500 font-bold">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Nhập họ và tên..."
              className="h-12 w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 text-xs font-semibold text-white outline-none placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
            />
          </div>
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
            Số điện thoại <span className="text-red-500 font-bold">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <Phone className="h-4 w-4" />
            </div>
            <input
              type="tel"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="0901 234 567"
              className="h-12 w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 text-xs font-semibold text-white outline-none placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
            Email <span className="text-slate-500 text-[11px] font-medium lowercase">(không bắt buộc)</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="example@email.com"
              className="h-12 w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 text-xs font-semibold text-white outline-none placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
            />
          </div>
        </div>
      </div>

      {/* Security note card */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950/60 p-3.5">
        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
        <p className="text-xs font-medium leading-relaxed text-slate-400">
          Thông tin của bạn được bảo mật tuyệt đối và chỉ dùng cho mục đích xác nhận booking.
        </p>
      </div>
    </section>
  );
}
