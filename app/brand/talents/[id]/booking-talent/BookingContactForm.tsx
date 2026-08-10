"use client";

import React from "react";

export type BookingContactFormProps = {
  contactName: string;
  setContactName: (value: string) => void;
  contactPhone: string;
  setContactPhone: (value: string) => void;
  contactEmail: string;
  setContactEmail: (value: string) => void;
};

const inputClassName =
  "h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 text-xs font-semibold text-white outline-none placeholder:text-slate-600 focus:border-amber-400";

export default function BookingContactForm({
  contactName,
  setContactName,
  contactPhone,
  setContactPhone,
  contactEmail,
  setContactEmail,
}: BookingContactFormProps) {
  return (
    <section className="space-y-4 border-t border-white/10 pt-5 text-left">
      <h3 className="text-xs font-black uppercase tracking-wider text-white md:text-sm">
        Thông tin liên hệ
      </h3>

      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
          Họ và tên:
        </label>
        <input
          type="text"
          required
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="Nguyễn Văn A"
          className={inputClassName}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
          Số điện thoại:
        </label>
        <input
          type="tel"
          required
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="0123 456 789"
          className={inputClassName}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-300">
          Email liên hệ:
        </label>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="email@example.com"
          className={inputClassName}
        />
      </div>

      <p className="text-xs font-medium leading-relaxed text-slate-500">
        Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất!
      </p>
    </section>
  );
}
