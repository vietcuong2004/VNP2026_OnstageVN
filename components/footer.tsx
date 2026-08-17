"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const scrollToId = (id: string) => {
    if (typeof window !== "undefined") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = `/about#${id}`;
      }
    }
  };

  return (
    <footer className="w-full border-t border-white/5 bg-[#02040a]/60 backdrop-blur-md pt-10 pb-8 px-4 md:px-8 mt-12 max-w-[1440px] mx-auto rounded-[24px] text-left">
      <div className="grid grid-cols-2 md:grid-cols-12 gap-3 sm:gap-4 md:gap-8 mb-8">
        {/* Left Column: Logo & Tagline */}
        <div className="col-span-2 md:col-span-4 flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center justify-center md:justify-start w-full gap-0">
            <img
              src="/logo_icon.png?v=20260817"
              alt="OnstageVN Logo Icon"
              className="h-12 w-12 sm:h-14 sm:w-14 object-contain shrink-0 p-0 m-0"
            />
            <img
              src="/logo_text.png?v=20260817"
              alt="OnstageVN Logo Text"
              className="h-9 sm:h-10 object-contain shrink-0 p-0 m-0"
            />
          </div>
          <p className="text-xs sm:text-[13px] leading-relaxed text-slate-400 max-w-sm font-medium text-justify w-full">
            Nền tảng công nghệ tối tân giúp kiến tạo hồ sơ sắc đẹp số chuyên nghiệp, định hướng AI và tự động khớp nối cơ hội hợp tác cho các thế hệ idol cùng nhãn hàng.
          </p>
          {/* Social Icons Inline */}
          <div className="flex items-center justify-center md:justify-start w-full gap-3 mt-1">
            <a href="#" className="h-7 w-7 rounded-full border border-white/5 hover:border-[#F0C56B] flex items-center justify-center text-slate-400 hover:text-[#F0C56B] hover:bg-[#F0C56B]/5 transition-all">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
            <a href="#" className="h-7 w-7 rounded-full border border-white/5 hover:border-[#F0C56B] flex items-center justify-center text-slate-400 hover:text-[#F0C56B] hover:bg-[#F0C56B]/5 transition-all">
              <svg className="h-3.5 w-3.5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="#" className="h-7 w-7 rounded-full border border-white/5 hover:border-[#F0C56B] flex items-center justify-center text-slate-400 hover:text-[#F0C56B] hover:bg-[#F0C56B]/5 transition-all">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163c-.272-1.023-1.078-1.83-2.101-2.102C19.516 3.5 12 3.5 12 3.5s-7.516 0-9.397.561C1.58 4.333.773 5.14.502 6.163.003 8.043 0 12 0 12s.003 3.957.502 5.837c.271 1.023 1.077 1.83 2.101 2.102 1.881.562 9.397.562 9.397.562s7.516 0 9.397-.562c1.023-.272 1.829-1.079 2.101-2.102.5-1.88.502-5.837.502-5.837s-.002-3.957-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Center-Right Column: Giới thiệu */}
        <div className="col-span-1 md:col-span-3 border border-white/10 bg-white/[0.02] p-3 sm:p-4 rounded-xl flex flex-col items-start gap-2.5 sm:gap-3 h-full w-full">
          <h4 className="text-[11px] sm:text-sm font-black text-[#F0C56B] uppercase tracking-wider">Giới thiệu</h4>
          <ul className="space-y-2 text-[11px] sm:text-[13px] font-semibold text-slate-400">
            <li>
              <button onClick={() => scrollToId('intro')} className="hover:text-white transition-colors cursor-pointer text-left block">Về chúng tôi</button>
            </li>
            <li>
              <span className="cursor-not-allowed opacity-50 block">Liên hệ hợp tác</span>
            </li>
            <li>
              <span className="cursor-not-allowed opacity-50 block">Điều khoản dịch vụ</span>
            </li>
            <li>
              <span className="cursor-not-allowed opacity-50 block">Chính sách bảo mật</span>
            </li>
          </ul>
        </div>

        {/* Right Column: Contact Info */}
        <div className="col-span-1 md:col-span-5 border border-white/10 bg-white/[0.02] p-3 sm:p-4 rounded-xl flex flex-col items-start gap-2.5 sm:gap-3 h-full w-full">
          <h4 className="text-[11px] sm:text-sm font-black text-[#F0C56B] uppercase tracking-wider">Liên hệ</h4>
          <ul className="space-y-2 text-[11px] sm:text-[13px] font-medium text-slate-400">
            <li className="flex items-center gap-1.5 sm:gap-2">
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#F0C56B] shrink-0" />
              <span className="break-all">contact@onstage.vn</span>
            </li>
            <li className="flex items-center gap-1.5 sm:gap-2">
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#F0C56B] shrink-0" />
              <span>+84 (0) 90 123 4567</span>
            </li>
            <li className="flex items-start gap-1.5 sm:gap-2">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#F0C56B] shrink-0 mt-0.5" />
              <span className="leading-tight sm:leading-relaxed">102 Thái Thịnh, Q.Đống Đa, Hà Nội</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-white/5 pt-4 flex items-center justify-center text-[11px] sm:text-xs font-semibold text-slate-500 text-center">
        <p>© {new Date().getFullYear()} ONSTAGE VN. All rights reserved.</p>
      </div>
    </footer>
  );
}
