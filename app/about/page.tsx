"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Sparkles,
  ShieldCheck,
  FileText,
  Search,
  ArrowRight,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Send,
  Brain,
  Zap,
  CheckCircle2,
  Clipboard,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

type LandingPageProps = {
  showLandingHeader?: boolean;
  showHeroCta?: boolean;
  compactHeroTitle?: boolean;
  showPortals?: boolean;
  redirectAuthenticatedUsers?: boolean;
  showFeaturesExplanation?: boolean;
};

export default function AboutPage({
  showLandingHeader = false,
  showHeroCta = false,
  compactHeroTitle = true,
  showPortals = false,
  redirectAuthenticatedUsers = false,
  showFeaturesExplanation = true,
}: LandingPageProps = {}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"talent" | "brand">("talent");
  const [activeTabExplanation, setActiveTabExplanation] = useState<"talent" | "brand">("talent");

  useEffect(() => {
    if (!redirectAuthenticatedUsers) return;

    const token = localStorage.getItem("onstagevn_auth_token");
    const storedUser = localStorage.getItem("onstagevn_auth_user");

    if (!token || !storedUser) return;

    try {
      JSON.parse(storedUser);
      router.replace("/brand/dashboard");
    } catch {
      localStorage.removeItem("onstagevn_auth_user");
    }
  }, [redirectAuthenticatedUsers, router]);

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSelectPortal = (type: "talent" | "brand") => {
    setActiveTab(type);
    scrollToId("portals");
  };

  return (
    <div className="relative flex flex-col items-center text-center px-0 md:px-2 py-0 w-full font-sans bg-[#02040a] min-h-screen homepage-container overflow-x-hidden max-w-full">

      {/* Immersive Mockup Background Image & Gradient Overlays (z-0 to prevent background-color overlap) */}
      <div className="absolute top-0 right-0 left-0 z-0 w-full h-[70vh] md:h-[105vh] overflow-hidden pointer-events-none">
        <img
          src="/hero_bg.png"
          alt="OnstageVN Background Graphics"
          className="w-full h-full object-cover object-right md:object-center absolute right-0 top-0"
        />
        {/* Mobile-only dark overlay for text readability, hidden on desktop */}
        <div className="absolute inset-0 bg-[#02040a]/65 md:bg-transparent pointer-events-none" />
      </div>

      {/* Additional ambient glows for subsequent sections */}
      <div className="absolute top-[800px] right-10 -z-10 h-[450px] w-[450px] rounded-full bg-purple-650/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[1500px] left-10 -z-10 h-[450px] w-[450px] rounded-full bg-blue-650/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[200px] left-1/2 -translate-x-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-[#D4A64A]/5 blur-[130px] pointer-events-none" />

      {/* Main Content Wrapper (z-10 to stay on top of the background image) */}
      <div className="relative z-10 w-full flex flex-col items-center">

        {/* Full-width Mockup Header - Fixed at the top of viewport spanning 100% width with glassmorphism */}
        {showLandingHeader && (
        <header className="fixed top-0 left-0 w-full z-50 bg-[#02040a]/80 backdrop-blur-md border-b border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="w-full max-w-[1550px] mx-auto flex items-center justify-between py-3 md:py-4 px-4 md:px-8">
            <div className="flex items-center">
              <button
                onClick={() => scrollToId('intro')}
                className="flex items-center hover:opacity-95 transition-opacity focus:outline-none cursor-pointer animate-in fade-in duration-300"
              >
                <img
                  src="/logo_icon.png"
                  alt="OnstageVN Logo Icon"
                  className="h-11 w-11 object-contain shrink-0"
                />
                <img
                  src="/logo_text.png"
                  alt="OnstageVN Logo Text"
                  className="h-9 object-contain shrink-0"
                />
              </button>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold text-slate-300">
              <button onClick={() => scrollToId('intro')} className="relative hover:text-white transition-colors cursor-pointer pb-1">
                Trang chủ
                <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-gradient-to-r from-[#F0C56B] to-[#A87418] shadow-[0_0_6px_rgba(212,166,74,0.6)]" />
              </button>
              <button onClick={() => scrollToId('intro')} className="hover:text-white transition-colors cursor-pointer">Về chúng tôi</button>
              <button onClick={() => handleSelectPortal('talent')} className="hover:text-[#F0C56B] transition-colors cursor-pointer">Dành cho Talent</button>
              <button onClick={() => handleSelectPortal('brand')} className="hover:text-[#F0C56B] transition-colors cursor-pointer">Dành cho Doanh nghiệp</button>
              <button onClick={() => scrollToId('process')} className="hover:text-white transition-colors cursor-pointer">Quy trình</button>
            </nav>
            <div>
              <Link
                href="/auth/login"
                className="px-6 py-2 rounded-full text-[11px] font-bold text-white border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </header>
        )}

        {/* Spacer to push content down below the fixed header */}
        {showLandingHeader && <div className="h-16 md:h-20 w-full shrink-0" />}

        {/* HERO SECTION - Left content layout matching mockup */}
        <section className="flex flex-col md:flex-row items-center justify-between min-h-0 md:min-h-[80vh] w-full mb-6 md:mb-10 px-1 md:px-4 max-w-[1550px] mx-auto relative text-center md:text-left">

          {/* Left Column: Copy & Actions */}
          <div className="w-full md:w-[50%] flex flex-col items-center md:items-start space-y-4 md:space-y-6 z-10 py-4 md:py-10">

            {/* Top small pill tag */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#D4A64A]/30 bg-[#071B42]/45 backdrop-blur-md max-w-full">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F0C56B] animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-bold text-[#F0C56B] uppercase tracking-normal sm:tracking-widest truncate sm:whitespace-normal">
                Nền tảng quản lý & kết nối Talent hàng đầu Việt Nam
              </span>
            </div>

            <h1
              className={cn(
                "text-[25px] sm:text-3xl font-display font-black tracking-tight leading-tight uppercase text-white",
                compactHeroTitle ? "md:text-4xl lg:text-[46px] xl:text-5xl" : "md:text-5xl lg:text-6xl",
              )}
            >
              <span className={cn("block", compactHeroTitle && "md:whitespace-nowrap")}>Tôn vinh sắc đẹp</span>
              <span className={cn("block text-gradient-gold", compactHeroTitle && "md:whitespace-nowrap")}>Tài năng tỏa sáng</span>
            </h1>

            <div className="p-4 md:p-5 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/5 shadow-xl max-w-lg text-justify mx-auto md:mx-0">
              <p className="text-[13px] sm:text-sm leading-relaxed text-slate-200 font-medium">
                ONSTAGE VN là hệ sinh thái kết nối tài năng sắc đẹp, người mẫu, KOL và doanh nghiệp thông qua công nghệ hiện đại, minh bạch và chuyên nghiệp. Nơi kiến tạo hồ sơ số, định hướng sự nghiệp và mang đến các cơ hội hợp tác tối ưu.
              </p>
            </div>

            {showHeroCta && (
            <div className="flex pt-2 md:pt-4 w-full sm:w-auto justify-center md:justify-start items-center sm:items-start">
              <Link
                href="/brand/search"
                className="w-full sm:w-auto px-7 md:px-10 py-3 md:py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-gold text-slate-950 hover:shadow-[0_0_20px_rgba(240,197,107,0.3)] hover:scale-102 transition-all duration-305 cursor-pointer flex items-center justify-center gap-2"
              >
                Truy cập nền tảng <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            )}
          </div>

          {/* Right Column: Empty spacer to let the background image skyline and face show cleanly without double emblem rendering */}
          <div className="hidden md:block md:w-[45%] h-full min-h-[450px]" />
        </section>

        {/* HIGHLIGHTS BAR - Matching bottom of mockup */}
        <div className="w-full max-w-[1550px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4 md:px-6 py-4 md:py-6 border-y border-white/5 bg-[#02040a]/40 backdrop-blur-md rounded-2xl mb-16 md:mb-24 text-left">
          <div className="flex items-start gap-3 p-1">
            <div className="h-8 w-8 rounded-lg bg-[#D4A64A]/10 border border-[#D4A64A]/20 flex items-center justify-center text-[#F0C56B] shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Xác thực danh tính</h4>
              <p className="text-[9px] text-[#6E7481] mt-0.5">Minh bạch & đáng tin cậy</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-1">
            <div className="h-8 w-8 rounded-lg bg-[#D4A64A]/10 border border-[#D4A64A]/20 flex items-center justify-center text-[#F0C56B] shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider">AI Matching</h4>
              <p className="text-[9px] text-[#6E7481] mt-0.5">Tìm đúng người, đúng nhu cầu</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-1">
            <div className="h-8 w-8 rounded-lg bg-[#D4A64A]/10 border border-[#D4A64A]/20 flex items-center justify-center text-[#F0C56B] shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Quản lý toàn diện</h4>
              <p className="text-[9px] text-[#6E7481] mt-0.5">Từ tìm kiếm đến booking</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-1">
            <div className="h-8 w-8 rounded-lg bg-[#D4A64A]/10 border border-[#D4A64A]/20 flex items-center justify-center text-[#F0C56B] shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Hiệu quả & chuyên nghiệp</h4>
              <p className="text-[9px] text-[#6E7481] mt-0.5">Tối ưu thời gian & chi phí</p>
            </div>
          </div>
        </div>

        {/* INTRODUCTION SECTION */}
        <section id="intro" className="w-full mb-16 md:mb-24 text-left scroll-mt-24 px-4 max-w-[1550px] mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-[#D4A64A]/50" />
            <span className="text-[10px] font-black text-[#F0C56B] uppercase tracking-widest">Câu chuyện thương hiệu</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight mb-4 md:mb-8">
            Hệ sinh thái kết nối <span className="text-gradient-gold">Tài năng & Cơ hội</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start">
            <div className="space-y-4">
              <p className="text-xs sm:text-[13px] md:text-sm text-slate-300 leading-relaxed font-medium text-justify">
                Onstage VN được xây dựng với niềm tin rằng mọi tài năng đều xứng đáng có cơ hội tỏa sáng. Trong ngành người mẫu và sắc đẹp, việc tìm kiếm cơ hội thường phụ thuộc nhiều vào các mối quan hệ cá nhân hoặc các đơn vị trung gian thiếu chuẩn hóa.
              </p>
              <p className="text-xs sm:text-[13px] md:text-sm text-slate-300 leading-relaxed font-medium text-justify">
                Chúng tôi ra đời nhằm tạo nên một hệ sinh thái minh bạch, nơi Talent có thể được nhìn thấy dễ dàng và Brand có thể tìm được đúng người. Từ một hồ sơ cá nhân đơn giản đến một chiến dịch thương hiệu quy mô lớn, mọi cơ hội đều có thể bắt đầu từ Onstage VN.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
              <div className="p-4 md:p-5 rounded-2xl bg-[#071B42]/40 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-305">
                <div className="text-gradient-gold text-lg md:text-2xl font-display font-black mb-1">Professional</div>
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider">Minh bạch & Hệ thống</div>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-2 text-justify font-medium leading-relaxed">Mọi hoạt động hợp tác đều có chuẩn mực, công bằng và đáng tin cậy.</p>
              </div>

              <div className="p-4 md:p-5 rounded-2xl bg-[#071B42]/40 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-305">
                <div className="text-gradient-gold text-lg md:text-2xl font-display font-black mb-1">Opportunity</div>
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider">Mở rộng cơ hội</div>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-2 text-justify font-medium leading-relaxed">Tạo cầu nối trực tiếp loại bỏ trung gian để tối ưu hóa giá trị công việc.</p>
              </div>

              <div className="p-4 md:p-5 rounded-2xl bg-[#071B42]/40 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-305 col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4.5 w-4.5 md:h-5 w-5 text-[#F0C56B]" />
                  <span className="text-[10px] md:text-xs font-black text-slate-200 uppercase tracking-wider">Innovation & Trust</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed text-justify font-medium">Ứng dụng công nghệ trí tuệ nhân tạo (AI) để thay đổi cách thức vận hành ngành sắc đẹp, đồng thời xây dựng lòng tin bền vững giữa Talent và các Nhãn hàng.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CORE FEATURES SECTION */}
        <section id="features" className="w-full mb-16 md:mb-24 text-left scroll-mt-24 px-4 max-w-[1550px] mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-[#D4A64A]/50" />
            <span className="text-[10px] font-black text-[#F0C56B] uppercase tracking-widest">Định vị giá trị cốt lõi</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight mb-4">
            Giải pháp công nghệ <br className="hidden sm:block" />
            <span className="text-gradient-gold">Đồng hành cùng Talent và Brand trên một nền tảng thống nhất</span>
          </h2>
          <p className="text-xs sm:text-[13px] md:text-sm text-slate-300 max-w-4xl mb-8 md:mb-10 leading-relaxed font-medium">
            Onstage ứng dụng công nghệ để đơn giản hóa quá trình xây dựng hồ sơ, quản lý chiến dịch và kết nối hợp tác giữa Talent, Brand và Agency. Mọi thông tin được tập trung trên một nền tảng hiện đại, giúp nâng cao hiệu quả làm việc và mở rộng cơ hội phát triển.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* Feature 1 */}
            <div className="group relative p-5 md:p-6 rounded-2xl bg-[#071B42]/30 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-300 hover:bg-[#0B245C]/40">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[#D4A64A]/10 text-[#F0C56B] border border-[#D4A64A]/20 mb-4 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="h-4.5 w-4.5 md:h-5 md:w-5" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Định hướng phát triển bằng AI</h3>
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed text-justify font-medium">
                Ứng dụng AI hỗ trợ phân tích thông tin hồ sơ, đánh giá điểm mạnh và gợi ý định hướng phát triển phù hợp, giúp Talent xây dựng lộ trình phát triển sự nghiệp hiệu quả hơn.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-5 md:p-6 rounded-2xl bg-[#071B42]/30 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-300 hover:bg-[#0B245C]/40">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[#D4A64A]/10 text-[#F0C56B] border border-[#D4A64A]/20 mb-4 group-hover:scale-105 transition-transform duration-300">
                <FileText className="h-4.5 w-4.5 md:h-5 md:w-5" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Hồ sơ số chuyên nghiệp (Digital Portfolio)</h3>
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed text-justify font-medium">
                Thay thế hồ sơ truyền thống bằng hồ sơ số hiện đại, tích hợp đầy đủ thông tin cá nhân, hình ảnh, video, kỹ năng và mạng xã hội để sẵn sàng chia sẻ với Brand và Agency.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-5 md:p-6 rounded-2xl bg-[#071B42]/30 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-300 hover:bg-[#0B245C]/40">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[#D4A64A]/10 text-[#F0C56B] border border-[#D4A64A]/20 mb-4 group-hover:scale-105 transition-transform duration-300">
                <Search className="h-4.5 w-4.5 md:h-5 md:w-5" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Tìm kiếm & Kết nối Talent</h3>
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed text-justify font-medium">
                Brand và Agency có thể dễ dàng tìm kiếm Talent theo các tiêu chí phù hợp, xem hồ sơ chi tiết và gửi lời mời hợp tác trực tiếp ngay trên hệ thống.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative p-5 md:p-6 rounded-2xl bg-[#071B42]/30 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-300 hover:bg-[#0B245C]/40">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[#D4A64A]/10 text-[#F0C56B] border border-[#D4A64A]/20 mb-4 group-hover:scale-105 transition-transform duration-300">
                <Briefcase className="h-4.5 w-4.5 md:h-5 md:w-5" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Quản lý chiến dịch & Hợp tác</h3>
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed text-justify font-medium">
                Tạo chiến dịch, quản lý danh sách Talent và theo dõi quá trình hợp tác trên một nền tảng duy nhất, giúp việc kết nối giữa Brand và Talent trở nên nhanh chóng, rõ ràng và hiệu quả hơn.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="process" className="w-full mb-16 md:mb-24 text-left scroll-mt-24 px-4 max-w-[1550px] mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-[#D4A64A]/50" />
            <span className="text-[10px] font-black text-[#F0C56B] uppercase tracking-widest">Quy trình vận hành</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight mb-3">
            Đơn giản hóa quy trình <span className="text-gradient-gold">kết nối Talent & Brand</span>
          </h2>
          <p className="text-xs sm:text-[13px] md:text-sm text-slate-355 max-w-2xl mb-8 md:mb-12 leading-relaxed font-medium">
            Chỉ với ba bước, Talent và Brand có thể nhanh chóng kết nối, tạo cơ hội hợp tác và quản lý toàn bộ quá trình trên cùng một nền tảng.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative w-full font-sans">
            {/* Card 01 */}
            <div className="relative p-5 md:p-6 rounded-2xl bg-[#071B42]/45 border border-white/10 hover:border-[#D4A64A]/30 hover:scale-[1.02] transition-all duration-305 flex flex-col justify-start">
              <div className="absolute -top-5 left-5 text-4xl font-display font-black text-[#F0C56B] drop-shadow-[0_2px_8px_rgba(240,197,107,0.3)]">01</div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 pt-2">Lựa chọn vai trò</h3>
              <ul className="text-xs sm:text-[13px] text-slate-300 leading-relaxed text-justify space-y-3 pt-1">
                <li className="flex items-start gap-2">
                  <span className="text-[#F0C56B] font-bold select-none shrink-0 mt-0.5">•</span>
                  <span>Đăng ký tài khoản và lựa chọn cổng phù hợp với nhu cầu của bạn.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F0C56B] font-bold select-none shrink-0 mt-0.5">•</span>
                  <span>Talent tham gia Onstage Talent để xây dựng hồ sơ, phát triển thương hiệu cá nhân và nhận cơ hội hợp tác.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F0C56B] font-bold select-none shrink-0 mt-0.5">•</span>
                  <span>Brand & Agency tham gia Onstage Brand để tạo chiến dịch, tìm kiếm và quản lý mạng lưới Talent.</span>
                </li>
              </ul>
            </div>

            {/* Card 02 */}
            <div className="relative p-5 md:p-6 rounded-2xl bg-[#071B42]/45 border border-white/10 hover:border-[#D4A64A]/30 hover:scale-[1.02] transition-all duration-305 flex flex-col justify-start">
              <div className="absolute -top-5 left-5 text-4xl font-display font-black text-[#F0C56B] drop-shadow-[0_2px_8px_rgba(240,197,107,0.3)]">02</div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 pt-2">Hoàn thiện hồ sơ & Tạo chiến dịch</h3>
              <ul className="text-xs sm:text-[13px] text-slate-300 leading-relaxed text-justify space-y-3 pt-1">
                <li className="flex items-start gap-2">
                  <span className="text-[#F0C56B] font-bold select-none shrink-0 mt-0.5">•</span>
                  <span>Talent xây dựng hồ sơ số với đầy đủ thông tin, hình ảnh, kỹ năng và mạng xã hội để sẵn sàng giới thiệu với đối tác.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F0C56B] font-bold select-none shrink-0 mt-0.5">•</span>
                  <span>Brand tạo chiến dịch tuyển dụng, thiết lập yêu cầu, thời gian và ngân sách nhằm tìm kiếm những Talent phù hợp.</span>
                </li>
              </ul>
            </div>

            {/* Card 03 */}
            <div className="relative p-5 md:p-6 rounded-2xl bg-[#071B42]/45 border border-white/10 hover:border-[#D4A64A]/30 hover:scale-[1.02] transition-all duration-305 flex flex-col justify-start">
              <div className="absolute -top-5 left-5 text-4xl font-display font-black text-[#F0C56B] drop-shadow-[0_2px_8px_rgba(240,197,107,0.3)]">03</div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 pt-2">Kết nối & Bắt đầu hợp tác</h3>
              <ul className="text-xs sm:text-[13px] text-slate-300 leading-relaxed text-justify space-y-3 pt-1">
                <li className="flex items-start gap-2">
                  <span className="text-[#F0C56B] font-bold select-none shrink-0 mt-0.5">•</span>
                  <span>Brand tìm kiếm hoặc gửi lời mời trực tiếp đến Talent thông qua hệ thống.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F0C56B] font-bold select-none shrink-0 mt-0.5">•</span>
                  <span>Talent xem thông tin chiến dịch, phản hồi lời mời và cùng Brand bắt đầu quá trình hợp tác trên Onstage.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* PORTALS SECTION (Scroll target) */}
        {showPortals && (
        <section id="portals" className="w-full mb-20 scroll-mt-24 px-4 text-center max-w-[1550px] mx-auto">
          <div className="flex flex-col items-center space-y-4 mb-10 w-full">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F0C56B] bg-[#D4A64A]/10 px-4 py-1.5 rounded-full border border-[#D4A64A]/20">
              Hệ sinh thái sản phẩm
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight">
              Khám phá các tính năng của bạn
            </h2>
            <p className="text-xs text-slate-355 max-w-md leading-relaxed font-medium">
              Chọn vai trò phù hợp bên dưới để tìm hiểu chi tiết các tính năng nền tảng Onstage mang lại cho sự nghiệp hoặc doanh nghiệp của bạn.
            </p>
          </div>

          {/* Toggle Tabs Redesign */}
          <div className="inline-flex p-1 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-md mb-16 relative shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <button
              onClick={() => setActiveTab("talent")}
              className={cn(
                "px-8 py-3.5 rounded-full text-[10px] md:text-xs font-display font-black uppercase tracking-wider transition-all duration-305 cursor-pointer relative z-10",
                activeTab === "talent"
                  ? "bg-gradient-gold text-slate-950 shadow-[0_4px_15px_rgba(240,197,107,0.3)] scale-100"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Kênh Người mẫu & KOLs
            </button>
            <button
              onClick={() => setActiveTab("brand")}
              className={cn(
                "px-8 py-3.5 rounded-full text-[10px] md:text-xs font-display font-black uppercase tracking-wider transition-all duration-305 cursor-pointer relative z-10",
                activeTab === "brand"
                  ? "bg-gradient-gold text-slate-950 shadow-[0_4px_15px_rgba(240,197,107,0.3)] scale-100"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Kênh Nhãn hàng & Agency
            </button>
          </div>

          {/* Tab Content */}
          <div className="w-full max-w-6xl mx-auto font-sans">
            {activeTab === "talent" ? (
              <div className="space-y-12 animate-in fade-in duration-500">
                {/* Intro banner Redesign */}
                <div className="relative overflow-hidden text-left bg-gradient-to-br from-[#0b0e22] to-[#04060f] border border-white/10 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_15px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl group/banner">
                  {/* Glowing background effects */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-400/10 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none group-hover/banner:opacity-80 transition-opacity duration-500" />
                  <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Subtle geometric grid background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                  <div className="relative z-10 space-y-4 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-display font-black uppercase tracking-widest bg-amber-400/15 border border-amber-400/30 px-3 py-1 rounded-full text-amber-300 shadow-sm">
                        CỔNG TÀI NĂNG
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[10px] font-medium text-slate-450">Onstage Talent Network</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight leading-tight">
                      Không gian chuyên nghiệp <br className="hidden sm:inline" />
                      <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">dành cho những tài năng muốn phát triển bền vững</span>
                    </h3>
                    <p className="text-xs sm:text-[13px] md:text-sm text-[#B4BCCB] leading-relaxed text-justify font-medium">
                      Dành cho người mẫu, diễn viên, KOL, KOC, MC, PG, Hoa hậu và các tài năng sáng tạo. Onstage Talent giúp bạn xây dựng hồ sơ số chuyên nghiệp, định hướng phát triển bằng AI và kết nối trực tiếp với các Brand, Agency để mở rộng cơ hội hợp tác trên một nền tảng hiện đại.
                    </p>
                  </div>
                  <Link
                    href="/talent/dashboard"
                    className="relative z-10 shrink-0 px-8 py-4 rounded-2xl text-xs font-display font-black uppercase tracking-widest bg-gradient-gold text-slate-950 shadow-[0_4px_20px_rgba(240,197,107,0.3)] hover:shadow-[0_8px_30px_rgba(240,197,107,0.5)] hover:scale-103 active:scale-98 transition-all duration-300 flex items-center gap-2 group/btn"
                  >
                    Vào cổng Talent
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* 3 Detail Cards Redesign */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  {/* Talent Card 1 */}
                  <Link href="/talent/portfolio" className="group relative block p-6 md:p-8 rounded-3xl bg-[#090b16]/45 border border-white/5 hover:border-amber-400/30 hover:bg-[#0c0f24]/70 transition-all duration-500 backdrop-blur-xl cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-amber-400/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute top-4 right-6 text-6xl font-display font-black text-white/[0.02] group-hover:text-amber-400/[0.04] transition-colors pointer-events-none">01</div>
                    <div className="space-y-4 relative z-10">
                      <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-gradient-gold group-hover:text-slate-950 transition-all duration-300">
                        <FileText className="h-6 w-6" />
                      </div>
                      <h3 className="text-base md:text-lg font-display font-black text-white uppercase tracking-wider group-hover:text-amber-300 transition-colors">
                        Hồ sơ Talent chuyên nghiệp
                      </h3>
                      <p className="text-xs sm:text-[13px] text-[#B4BCCB] leading-relaxed text-justify font-medium">
                        Xây dựng hồ sơ số toàn diện để giới thiệu bản thân với Brand và Agency. Tập trung mọi thông tin quan trọng như hình ảnh, video, kỹ năng, kinh nghiệm và mạng xã hội trong một hồ sơ chuyên nghiệp, dễ dàng chia sẻ và luôn sẵn sàng cho mọi cơ hội hợp tác.
                      </p>
                      <div className="pt-4 border-t border-white/5">
                        <ul className="space-y-3 text-[11px] md:text-xs text-slate-355 font-semibold">
                          <li className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Hồ sơ số chuyên nghiệp với hình ảnh, video và Social Link</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Quản lý thông tin cá nhân, kỹ năng và kinh nghiệm tập trung</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Chia sẻ hồ sơ nhanh chóng chỉ với một liên kết</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Link>

                  {/* Talent Card 2 */}
                  <Link href="/talent/survey" className="group relative block p-6 md:p-8 rounded-3xl bg-[#090b16]/45 border border-white/5 hover:border-amber-400/30 hover:bg-[#0c0f24]/70 transition-all duration-500 backdrop-blur-xl cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-amber-400/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute top-4 right-6 text-6xl font-display font-black text-white/[0.02] group-hover:text-amber-400/[0.04] transition-colors pointer-events-none">02</div>
                    <div className="space-y-4 relative z-10">
                      <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-gradient-gold group-hover:text-slate-950 transition-all duration-300">
                        <Brain className="h-6 w-6" />
                      </div>
                      <h3 className="text-base md:text-lg font-display font-black text-white uppercase tracking-wider group-hover:text-amber-300 transition-colors">
                        AI hỗ trợ định hướng phát triển
                      </h3>
                      <p className="text-xs sm:text-[13px] text-[#B4BCCB] leading-relaxed text-justify font-medium">
                        Ứng dụng AI để hỗ trợ đánh giá năng lực, định hướng phong cách nghệ thuật phù hợp và gợi ý lộ trình phát triển dựa trên thông tin hồ sơ của bạn, giúp bạn hiểu rõ điểm mạnh và xây dựng thương hiệu cá nhân hiệu quả hơn.
                      </p>
                      <div className="pt-4 border-t border-white/5">
                        <ul className="space-y-3 text-[11px] md:text-xs text-slate-355 font-semibold">
                          <li className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Gợi ý định hướng phát triển phù hợp với hồ sơ</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Hỗ trợ đánh giá điểm mạnh và tiềm năng</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Đề xuất lộ trình phát triển cá nhân</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Link>

                  {/* Talent Card 3 */}
                  <Link href="/talent/jobs" className="group relative block p-6 md:p-8 rounded-3xl bg-[#090b16]/45 border border-white/5 hover:border-amber-400/30 hover:bg-[#0c0f24]/70 transition-all duration-500 backdrop-blur-xl cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-amber-400/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute top-4 right-6 text-6xl font-display font-black text-white/[0.02] group-hover:text-amber-400/[0.04] transition-colors pointer-events-none">03</div>
                    <div className="space-y-4 relative z-10">
                      <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-gradient-gold group-hover:text-slate-950 transition-all duration-300">
                        <Zap className="h-6 w-6" />
                      </div>
                      <h3 className="text-base md:text-lg font-display font-black text-white uppercase tracking-wider group-hover:text-amber-300 transition-colors">
                        Kết nối Brand & Cơ hội hợp tác
                      </h3>
                      <p className="text-xs sm:text-[13px] text-[#B4BCCB] leading-relaxed text-justify font-medium">
                        Nhận lời mời từ các Brand và Agency, theo dõi những chiến dịch đang tham gia và quản lý toàn bộ quá trình hợp tác ngay trên hệ thống. Onstage giúp rút ngắn khoảng cách giữa Talent và đối tác, tạo nên quy trình kết nối nhanh chóng và chuyên nghiệp.
                      </p>
                      <div className="pt-4 border-t border-white/5">
                        <ul className="space-y-3 text-[11px] md:text-xs text-slate-355 font-semibold">
                          <li className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Nhận lời mời tham gia chiến dịch từ Brand và Agency</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Theo dõi trạng thái lời mời và các chiến dịch đang tham gia</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Quản lý lịch sử hợp tác trên một nền tảng duy nhất</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in duration-500">
                {/* Intro banner Redesign */}
                <div className="relative overflow-hidden text-left bg-gradient-to-br from-[#0d0f1a] to-[#04060f] border border-white/10 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_15px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl group/banner">
                  {/* Glowing background effects */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#D4A64A]/10 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none group-hover/banner:opacity-80 transition-opacity duration-500" />
                  <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#D4A64A]/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Subtle geometric grid background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                  <div className="relative z-10 space-y-4 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-display font-black uppercase tracking-widest bg-[#D4A64A]/15 border border-[#D4A64A]/30 px-3 py-1 rounded-full text-[#F0C56B] shadow-sm">
                        CỔNG DOANH NGHIỆP
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D4A64A] animate-pulse" />
                      <span className="text-[10px] font-medium text-slate-450">Onstage Brand Network</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight leading-tight">
                      Công nghệ định hình & <br className="hidden sm:inline" />
                      <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">tối ưu hóa chiến dịch</span>
                    </h3>
                    <p className="text-xs sm:text-[13px] md:text-sm text-[#B4BCCB] leading-relaxed text-justify font-medium">
                      Onstage cung cấp giải pháp casting trực tiếp bằng cách loại bỏ các quy trình thủ công phức tạp. Giúp các thương hiệu, nhãn hàng & agency đăng tin chiến dịch, tìm kiếm ứng viên thích hợp bằng AI và quản lý giao dịch an toàn.
                    </p>
                  </div>
                  <Link
                    href="/brand/dashboard"
                    className="relative z-10 shrink-0 px-8 py-4 rounded-2xl text-xs font-display font-black uppercase tracking-widest bg-gradient-gold text-slate-950 shadow-[0_4px_20px_rgba(240,197,107,0.3)] hover:shadow-[0_8px_30px_rgba(240,197,107,0.5)] hover:scale-103 active:scale-98 transition-all duration-300 flex items-center gap-2 group/btn"
                  >
                    Vào cổng Brand
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* 3 Detail Cards Redesign */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  {/* Brand Card 1 */}
                  <Link href="/brand/campaigns" className="group relative block p-6 md:p-8 rounded-3xl bg-[#090b16]/45 border border-white/5 hover:border-[#D4A64A]/30 hover:bg-[#0c0f24]/70 transition-all duration-500 backdrop-blur-xl cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A64A]/70">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-[#D4A64A]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute top-4 right-6 text-6xl font-display font-black text-white/[0.02] group-hover:text-amber-400/[0.04] transition-colors pointer-events-none">01</div>
                    <div className="space-y-4 relative z-10">
                      <div className="h-12 w-12 rounded-2xl bg-[#D4A64A]/10 border border-[#D4A64A]/20 flex items-center justify-center text-[#F0C56B] group-hover:bg-gradient-gold group-hover:text-slate-950 transition-all duration-300">
                        <Clipboard className="h-6 w-6" />
                      </div>
                      <h3 className="text-base md:text-lg font-display font-black text-white uppercase tracking-wider group-hover:text-[#F0C56B] transition-colors">
                        Tạo chiến dịch tuyển dụng
                      </h3>
                      <p className="text-xs sm:text-[13px] text-[#B4BCCB] leading-relaxed text-justify font-medium">
                        Tạo nhanh chiến dịch tuyển Talent với đầy đủ thông tin về mục tiêu, yêu cầu, thời gian và thù lao. Đưa chiến dịch đến với hàng ngàn tài năng đã được định dạng và phân tier chất lượng.
                      </p>
                      <ul className="space-y-3 text-[11px] md:text-xs text-slate-355 font-semibold pt-4 border-t border-white/5">
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Khởi tạo Campaign chi tiết chỉ trong vài phút</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Thiết lập chi tiết yêu cầu, độ tuổi, chiều cao và kịch bản</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Quản lý các hồ sơ đã ứng tuyển hiệu quả</span>
                        </li>
                      </ul>
                    </div>
                  </Link>

                  {/* Brand Card 2 */}
                  <Link href="/brand/search" className="group relative block p-6 md:p-8 rounded-3xl bg-[#090b16]/45 border border-white/5 hover:border-[#D4A64A]/30 hover:bg-[#0c0f24]/70 transition-all duration-500 backdrop-blur-xl cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A64A]/70">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-[#D4A64A]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute top-4 right-6 text-6xl font-display font-black text-white/[0.02] group-hover:text-amber-400/[0.04] transition-colors pointer-events-none">02</div>
                    <div className="space-y-4 relative z-10">
                      <div className="h-12 w-12 rounded-2xl bg-[#D4A64A]/10 border border-[#D4A64A]/20 flex items-center justify-center text-[#F0C56B] group-hover:bg-gradient-gold group-hover:text-slate-950 transition-all duration-300">
                        <Search className="h-6 w-6" />
                      </div>
                      <h3 className="text-base md:text-lg font-display font-black text-white uppercase tracking-wider group-hover:text-[#F0C56B] transition-colors">
                        Tìm kiếm Talent phù hợp
                      </h3>
                      <p className="text-xs sm:text-[13px] text-[#B4BCCB] leading-relaxed text-justify font-medium">
                        Khám phá hàng nghìn Talent thuộc nhiều lĩnh vực như KOL, KOC, người mẫu, diễn viên, MC, PG... với bộ lọc thông minh trực quan giúp nhanh chóng tìm được ứng viên phù hợp cho từng chiến dịch.
                      </p>
                      <ul className="space-y-3 text-[11px] md:text-xs text-slate-355 font-semibold pt-4 border-t border-white/5">
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Lọc theo chiều cao, cân nặng, số đo & Social Link</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Xem hồ sơ Talent đầy đủ trước khi gửi lời mời</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Gửi lời mời trực tiếp đến ứng viên bạn ưng ý nhất</span>
                        </li>
                      </ul>
                    </div>
                  </Link>

                  {/* Brand Card 3 */}
                  <Link href="/brand/my-talents" className="group relative block p-6 md:p-8 rounded-3xl bg-[#090b16]/45 border border-white/5 hover:border-[#D4A64A]/30 hover:bg-[#0c0f24]/70 transition-all duration-500 backdrop-blur-xl cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A64A]/70">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-[#D4A64A]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute top-4 right-6 text-6xl font-display font-black text-white/[0.02] group-hover:text-amber-400/[0.04] transition-colors pointer-events-none">03</div>
                    <div className="space-y-4 relative z-10">
                      <div className="h-12 w-12 rounded-2xl bg-[#D4A64A]/10 border border-[#D4A64A]/20 flex items-center justify-center text-[#F0C56B] group-hover:bg-gradient-gold group-hover:text-slate-950 transition-all duration-300">
                        <Users className="h-6 w-6" />
                      </div>
                      <h3 className="text-base md:text-lg font-display font-black text-white uppercase tracking-wider group-hover:text-[#F0C56B] transition-colors">
                        Xây dựng mạng lưới Talent riêng
                      </h3>
                      <p className="text-xs sm:text-[13px] text-[#B4BCCB] leading-relaxed text-justify font-medium">
                        Mời Talent gia nhập mạng lưới của Brand thông qua liên kết hoặc mã QR. Quản lý danh sách Talent đã hợp tác để dễ dàng kết nối và sử dụng cho các chiến dịch trong tương lai.
                      </p>
                      <ul className="space-y-3 text-[11px] md:text-xs text-slate-355 font-semibold pt-4 border-t border-white/5">
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Mời Talent gia nhập bằng Link hoặc mã QR</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Đồng bộ liên hệ và xây dựng tệp ứng viên ưa thích</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-tight text-slate-300 group-hover:text-white transition-colors">Lịch sử tương tác và hợp tác được số hóa toàn bộ</span>
                        </li>
                      </ul>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
        )}

        {showFeaturesExplanation && (
          <section className="w-full max-w-[1200px] mx-auto px-4 md:px-8 mt-20 mb-8 text-center animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-10 text-center flex flex-col items-center">
              <div className="flex items-center gap-2 mb-3 justify-center">
                <span className="h-px w-8 bg-[#D4A64A]/50" />
                <span className="text-[10px] font-black text-[#F0C56B] uppercase tracking-widest">Hệ sinh thái Onstage</span>
                <span className="h-px w-8 bg-[#D4A64A]/50" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                Tính Năng Chi Tiết <span className="text-gradient-gold">Theo Vai Trò</span>
              </h2>
              <p className="mt-3 text-xs text-[#B4BCCB] font-semibold max-w-xl mx-auto leading-relaxed">
                Khám phá các giải pháp công nghệ vượt trội được thiết kế riêng biệt để đáp ứng nhu cầu phát triển của cả Talent nghệ thuật và Brand/Agency tuyển dụng.
              </p>
            </div>

            {/* Tab Swapper */}
            <div className="flex flex-col md:flex-row p-1 gap-2 md:gap-0 rounded-2xl md:rounded-xl bg-[#090b16]/80 border border-white/5 backdrop-blur-md relative shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] w-full max-w-md mx-auto mb-12">
              <button
                type="button"
                onClick={() => setActiveTabExplanation("talent")}
                className={cn(
                  "w-full md:flex-1 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer relative z-10",
                  activeTabExplanation === "talent"
                    ? "bg-gradient-gold text-slate-950 shadow-[0_4px_12px_rgba(240,197,107,0.3)]"
                    : "text-slate-400 hover:text-white"
                )}
              >
                Talent (Người Mẫu & KOLs...)
              </button>
              <button
                type="button"
                onClick={() => setActiveTabExplanation("brand")}
                className={cn(
                  "w-full md:flex-1 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer relative z-10",
                  activeTabExplanation === "brand"
                    ? "bg-gradient-gold text-slate-950 shadow-[0_4px_12px_rgba(240,197,107,0.3)]"
                    : "text-slate-400 hover:text-white"
                )}
              >
                Brand (Nhãn Hàng & Agency...)
              </button>
            </div>

            {/* Content box */}
            <div className="space-y-8 text-left max-w-4xl mx-auto">
              {activeTabExplanation === "talent" ? (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* Who are Talents */}
                  <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-500/[0.04] to-amber-600/[0.01] border border-amber-500/20 shadow-2xl backdrop-blur-md">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-[#F0C56B]" />
                      <h4 className="text-xs font-black text-[#F0C56B] uppercase tracking-widest font-display">
                        Bệ phóng vững chắc cho tài năng nghệ thuật
                      </h4>
                    </div>
                    
                    <p className="text-xs md:text-sm text-slate-200 leading-relaxed text-justify font-medium">
                      Onstage VN là hệ sinh thái kết nối và số hóa hồ sơ chuyên nghiệp dành riêng cho các tài năng hoạt động trong lĩnh vực nghệ thuật, giải trí và thời trang. Dù bạn là <strong className="text-white font-black">Người mẫu (Runway/Lookbook)</strong>, <strong className="text-white font-black">Diễn viên</strong>, <strong className="text-white font-black">KOLs/KOCs</strong> sở hữu sức ảnh hưởng lớn, <strong className="text-white font-black">MC</strong> dẫn dắt lôi cuốn hay <strong className="text-white font-black">PG/PB</strong> đại diện hình ảnh – Onstage VN mang lại công nghệ chuẩn hóa, đánh giá Tier khách quan và mở ra cơ hội nhận job trực tiếp không qua trung gian.
                    </p>
                  </div>

                  {/* Core Features */}
                  <div className="space-y-5">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
                      🚀 CÁC TÍNH NĂNG NỔI BẬT DÀNH CHO TALENT
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Feature 1 */}
                      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.02] hover:border-[#D4A64A]/40 hover:bg-[#D4A64A]/[0.03] hover:scale-[1.02] transition-all duration-300 p-5 flex flex-col h-full min-h-[220px]">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mb-4 shadow-inner">
                          <FileText className="h-5 w-5" />
                        </div>
                        <h5 className="text-sm font-black text-white uppercase tracking-wide min-h-[38px] flex items-center mb-2">
                          Hồ sơ số chuyên nghiệp
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed flex-1 text-justify">
                          Tích hợp hình ảnh, video toàn thân, số đo chuẩn hóa, liên kết mạng xã hội (TikTok, Instagram) chỉ trong một link chia sẻ.
                        </p>
                      </div>

                      {/* Feature 2 */}
                      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.02] hover:border-[#D4A64A]/40 hover:bg-[#D4A64A]/[0.03] hover:scale-[1.02] transition-all duration-300 p-5 flex flex-col h-full min-h-[220px]">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mb-4 shadow-inner">
                          <Zap className="h-5 w-5" />
                        </div>
                        <h5 className="text-sm font-black text-white uppercase tracking-wide min-h-[38px] flex items-center mb-2">
                          AI chẩn đoán & xếp hạng
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed flex-1 text-justify">
                          Tự động tính toán điểm chuyên môn dựa trên khảo sát và hồ sơ, phân hạng Tier (S/A/B/C) để tăng độ uy tín với nhà tuyển dụng.
                        </p>
                      </div>

                      {/* Feature 3 */}
                      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.02] hover:border-[#D4A64A]/40 hover:bg-[#D4A64A]/[0.03] hover:scale-[1.02] transition-all duration-300 p-5 flex flex-col h-full min-h-[220px]">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mb-4 shadow-inner">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <h5 className="text-sm font-black text-white uppercase tracking-wide min-h-[38px] flex items-center mb-2">
                          Nhận Job & Ứng tuyển
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed flex-1 text-justify">
                          Chủ động ứng tuyển các chiến dịch tuyển dụng từ nhãn hàng uy tín hoặc nhận lời mời trực tiếp thông qua hệ thống Onstage.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* Who are Brands */}
                  <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#C9A86A]/[0.04] to-[#C9A86A]/[0.01] border border-[#C9A86A]/30 shadow-2xl backdrop-blur-md">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A86A]/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="h-5 w-5 text-[#F0C56B]" />
                      <h4 className="text-xs font-black text-[#F0C56B] uppercase tracking-widest font-display">
                        Giải pháp tối ưu hóa casting & quản lý cho doanh nghiệp
                      </h4>
                    </div>

                    <p className="text-xs md:text-sm text-slate-200 leading-relaxed text-justify font-medium">
                      Dành cho các <strong className="text-white font-black">Nhãn hàng tiêu dùng</strong>, <strong className="text-white font-black">Thương hiệu thời trang</strong>, <strong className="text-white font-black">Agency quảng cáo</strong>, <strong className="text-white font-black">Nhà thiết kế</strong> và các <strong className="text-white font-black">Đơn vị tổ chức sự kiện</strong> có nhu cầu tìm kiếm gương mặt đại diện hoặc nhân sự hỗ trợ chiến dịch. Onstage VN cung cấp công cụ tối ưu hóa quy trình tuyển chọn tài năng, bộ lọc nâng cao theo Tier chuẩn hóa, hệ thống giao dịch đặt cọc an toàn và quản lý lịch trình làm việc chặt chẽ trên một nền tảng thống nhất.
                    </p>
                  </div>

                  {/* Core Features */}
                  <div className="space-y-5">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
                      🚀 CÁC TÍNH NĂNG NỔI BẬT DÀNH CHO BRAND
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Feature 1 */}
                      <div className="rounded-2xl border border-[#C9A86A]/20 bg-[#C9A86A]/[0.02] hover:border-[#D4A64A]/40 hover:bg-[#D4A64A]/[0.03] hover:scale-[1.02] transition-all duration-305 p-5 flex flex-col h-full min-h-[220px]">
                        <div className="h-10 w-10 rounded-xl bg-[#C9A86A]/10 border border-[#C9A86A]/20 flex items-center justify-center text-[#F0C56B] shrink-0 mb-4 shadow-inner">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <h5 className="text-sm font-black text-white uppercase tracking-wide min-h-[38px] flex items-center mb-2">
                          Tạo chiến dịch tuyển dụng
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed flex-1 text-justify">
                          Khởi tạo casting brief nhanh chóng với kịch bản cụ thể, thiết lập yêu cầu số đo ngoại hình, độ tuổi, khu vực và ngân sách thù lao rõ ràng.
                        </p>
                      </div>

                      {/* Feature 2 */}
                      <div className="rounded-2xl border border-[#C9A86A]/20 bg-[#C9A86A]/[0.02] hover:border-[#D4A64A]/40 hover:bg-[#D4A64A]/[0.03] hover:scale-[1.02] transition-all duration-305 p-5 flex flex-col h-full min-h-[220px]">
                        <div className="h-10 w-10 rounded-xl bg-[#C9A86A]/10 border border-[#C9A86A]/20 flex items-center justify-center text-[#F0C56B] shrink-0 mb-4 shadow-inner">
                          <Search className="h-5 w-5" />
                        </div>
                        <h5 className="text-sm font-black text-white uppercase tracking-wide min-h-[38px] flex items-center mb-2">
                          Tìm kiếm Talent
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed flex-1 text-justify">
                          Lọc thông minh qua hàng ngàn hồ sơ Talent theo chiều cao, cân nặng, số đo, lượt follow mạng xã hội hoặc phân hạng Tier (S/A/B/C) chuẩn hóa.
                        </p>
                      </div>

                      {/* Feature 3 */}
                      <div className="rounded-2xl border border-[#C9A86A]/20 bg-[#C9A86A]/[0.02] hover:border-[#D4A64A]/40 hover:bg-[#D4A64A]/[0.03] hover:scale-[1.02] transition-all duration-305 p-5 flex flex-col h-full min-h-[220px]">
                        <div className="h-10 w-10 rounded-xl bg-[#C9A86A]/10 border border-[#C9A86A]/20 flex items-center justify-center text-[#F0C56B] shrink-0 mb-4 shadow-inner">
                          <Users className="h-5 w-5" />
                        </div>
                        <h5 className="text-sm font-black text-white uppercase tracking-wide min-h-[38px] flex items-center mb-2">
                          Quản lý mạng lưới Talent
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed flex-1 text-justify">
                          Tích hợp tính năng quản lý danh sách Talent yêu thích, gửi link hoặc mã QR mời Talent tham gia hợp tác trực tiếp không qua trung gian.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="w-full border-t border-white/5 bg-[#02040a]/80 backdrop-blur-md pt-16 pb-12 px-4 md:px-8 mt-16 max-w-[1550px] mx-auto text-center">

          {/* Top Brand Info - Centered like TLU Document */}
          <div className="flex flex-col items-center mb-12 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-3 justify-center">
              <img
                src="/logo_icon.png"
                alt="OnstageVN Logo Icon"
                className="h-12 w-12 object-contain shrink-0"
              />
              <img
                src="/logo_text.png"
                alt="OnstageVN Logo Text"
                className="h-10 object-contain shrink-0"
              />
            </div>
          </div>

          {/* 4 Cards Grid - Matches layout style from the image but dark gold theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 text-left">

            {/* Card 1: LIÊN HỆ */}
            <div className="p-6 rounded-2xl bg-[#090b16]/60 border border-white/5 shadow-xl hover:border-[#D4A64A]/25 transition-colors duration-300 flex flex-col justify-between">
              <div>
                <h4 className="text-[11px] font-black text-[#F0C56B] uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Liên hệ</h4>
                <ul className="space-y-3.5 text-[11px] font-medium text-slate-400">
                  <li className="flex items-start gap-3">
                    <Mail className="h-4.5 w-4.5 text-[#F0C56B] shrink-0 mt-0.5" />
                    <span className="break-all">contact@onstage.vn</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone className="h-4.5 w-4.5 text-[#F0C56B] shrink-0 mt-0.5" />
                    <span>+84 (0) 90 123 4567</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="h-4.5 w-4.5 text-[#F0C56B] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">102 Thái Thịnh, Q.Đống Đa, TP.Hà Nội, Việt Nam</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2: HỆ SINH THÁI */}
            <div className="p-6 rounded-2xl bg-[#090b16]/60 border border-white/5 shadow-xl hover:border-[#D4A64A]/25 transition-colors duration-300 flex flex-col justify-between">
              <div>
                <h4 className="text-[11px] font-black text-[#F0C56B] uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Hệ sinh thái</h4>
                <ul className="space-y-3 text-[11px] font-semibold text-slate-400">
                  {showPortals && (
                    <>
                      <li>
                        <Link href="/intro/talent" className="hover:text-[#F0C56B] transition-colors block">Kênh Onstage Talent</Link>
                      </li>
                      <li>
                        <Link href="/intro/brand" className="hover:text-[#F0C56B] transition-colors block">Kênh Onstage Brand</Link>
                      </li>
                    </>
                  )}
                  <li>
                    <button onClick={() => scrollToId('features')} className="hover:text-white transition-colors cursor-pointer text-left block">Định hướng AI</button>
                  </li>
                  <li>
                    <button onClick={() => scrollToId('process')} className="hover:text-white transition-colors cursor-pointer text-left block">Quy trình vận hành</button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 3: GIỚI THIỆU */}
            <div className="p-6 rounded-2xl bg-[#090b16]/60 border border-white/5 shadow-xl hover:border-[#D4A64A]/25 transition-colors duration-300 flex flex-col justify-between">
              <div>
                <h4 className="text-[11px] font-black text-[#F0C56B] uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Giới thiệu</h4>
                <ul className="space-y-3 text-[11px] font-semibold text-slate-400">
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
            </div>

            {/* Card 4: KẾT NỐI */}
            <div className="p-6 rounded-2xl bg-[#090b16]/60 border border-white/5 shadow-xl hover:border-[#D4A64A]/25 transition-colors duration-300 flex flex-col justify-between gap-4">
              <div>
                <h4 className="text-[11px] font-black text-[#F0C56B] uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Kết nối</h4>
                <div className="flex items-center gap-3">
                  <a href="#" className="h-8 w-8 rounded-full border border-white/10 hover:border-[#F0C56B] flex items-center justify-center text-slate-400 hover:text-[#F0C56B] hover:bg-[#F0C56B]/5 transition-all">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                    </svg>
                  </a>
                  <a href="#" className="h-8 w-8 rounded-full border border-white/10 hover:border-[#F0C56B] flex items-center justify-center text-slate-400 hover:text-[#F0C56B] hover:bg-[#F0C56B]/5 transition-all">
                    <svg className="h-4 w-4 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  <a href="#" className="h-8 w-8 rounded-full border border-white/10 hover:border-[#F0C56B] flex items-center justify-center text-slate-400 hover:text-[#F0C56B] hover:bg-[#F0C56B]/5 transition-all">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.163c-.272-1.023-1.078-1.83-2.101-2.102C19.516 3.5 12 3.5 12 3.5s-7.516 0-9.397.561C1.58 4.333.773 5.14.502 6.163.003 8.043 0 12 0 12s.003 3.957.502 5.837c.271 1.023 1.077 1.83 2.101 2.102 1.881.562 9.397.562 9.397.562s7.516 0 9.397-.562c1.023-.272 1.829-1.079 2.101-2.102.5-1.88.502-5.837.502-5.837s-.002-3.957-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
              </div>

              <button
                onClick={() => alert("Cảm ơn ý kiến đóng góp của bạn!")}
                className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gradient-gold text-slate-950 hover:shadow-[0_0_15px_rgba(240,197,107,0.3)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Send className="h-3.5 w-3.5" /> Gửi phản hồi
              </button>
            </div>

          </div>

          {/* Bottom Copyright centered */}
          <div className="border-t border-white/5 pt-8 flex flex-col items-center gap-3 text-[10px] font-semibold text-slate-500">
            <p>© {new Date().getFullYear()} ONSTAGE VN. All rights reserved.</p>
            <p>Designed with excellence for beauty and brand matching.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
