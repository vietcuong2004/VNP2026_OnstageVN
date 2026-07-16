"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  User,
  Briefcase,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  FileText,
  Search,
  ArrowRight,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Send
} from "lucide-react";

export default function RootGatewayPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("onstagevn_auth_token");
    const storedUser = localStorage.getItem("onstagevn_auth_user");

    if (!token || !storedUser) return;

    try {
      const user = JSON.parse(storedUser) as { type?: string };
      router.replace(user.type === "brand" ? "/brand/dashboard" : "/talent/dashboard");
    } catch {
      localStorage.removeItem("onstagevn_auth_user");
    }
  }, [router]);

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
              <Link href="/intro/talent" className="hover:text-[#F0C56B] transition-colors cursor-pointer">Dành cho Talent</Link>
              <Link href="/intro/brand" className="hover:text-[#F0C56B] transition-colors cursor-pointer">Dành cho Doanh nghiệp</Link>
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

        {/* Spacer to push content down below the fixed header */}
        <div className="h-16 md:h-20 w-full shrink-0" />

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

            <h1 className="text-[25px] sm:text-3xl md:text-5xl lg:text-6xl font-display font-black tracking-tight leading-tight uppercase text-white">
              Tôn vinh sắc đẹp <br />
              <span className="text-gradient-gold">Tài năng tỏa sáng</span>
            </h1>

            <div className="p-4 md:p-5 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/5 shadow-xl max-w-lg text-justify mx-auto md:mx-0">
              <p className="text-[13px] sm:text-sm leading-relaxed text-slate-200 font-medium">
                ONSTAGE VN là hệ sinh thái kết nối tài năng sắc đẹp, người mẫu, KOL và doanh nghiệp thông qua công nghệ hiện đại, minh bạch và chuyên nghiệp. Nơi kiến tạo hồ sơ số, định hướng sự nghiệp và mang đến các cơ hội hợp tác tối ưu.
              </p>
            </div>

            {/* Dual call-to-action buttons as shown in mockup */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-2 md:pt-4 w-full sm:w-auto justify-center md:justify-start items-center sm:items-start">
              <Link
                href="/intro/talent"
                className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3.5 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-gold text-slate-950 hover:shadow-[0_0_20px_rgba(240,197,107,0.3)] hover:scale-102 transition-all duration-305 cursor-pointer flex items-center justify-center gap-2"
              >
                Dành cho Talent <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Ultra prominent redesign for "Dành cho Doanh nghiệp" button using ONLY gold, black, and white/gray */}
              <div className="relative w-full sm:w-auto group">
                {/* Gold pulsing background glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4A64A] to-[#F0C56B] rounded-xl blur opacity-60 group-hover:opacity-85 group-hover:blur-md transition-all duration-300 animate-pulse pointer-events-none" />
                <Link
                  href="/intro/brand"
                  className="relative w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3.5 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-950 text-[#F0C56B] hover:text-white hover:scale-102 transition-all duration-305 cursor-pointer flex items-center justify-center gap-2 border border-[#D4A64A]/50 shadow-[0_0_20px_rgba(212,166,74,0.3)]"
                >
                  Dành cho Doanh nghiệp <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
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
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium text-justify">
                Onstage VN được xây dựng với niềm tin rằng mọi tài năng đều xứng đáng có cơ hội tỏa sáng. Trong ngành người mẫu và sắc đẹp, việc tìm kiếm cơ hội thường phụ thuộc nhiều vào các mối quan hệ cá nhân hoặc các đơn vị trung gian thiếu chuẩn hóa.
              </p>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed text-justify">
                Chúng tôi ra đời nhằm tạo nên một hệ sinh thái minh bạch, nơi Talent có thể được nhìn thấy dễ dàng và Brand có thể tìm được đúng người. Từ một hồ sơ cá nhân đơn giản đến một chiến dịch thương hiệu quy mô lớn, mọi cơ hội đều có thể bắt đầu từ Onstage VN.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
              <div className="p-4 md:p-5 rounded-2xl bg-[#071B42]/40 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-300">
                <div className="text-gradient-gold text-lg md:text-2xl font-display font-black mb-1">Professional</div>
                <div className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-wider">Minh bạch & Hệ thống</div>
                <p className="text-[8px] md:text-[9px] text-[#6E7481] mt-2 text-justify">Mọi hoạt động hợp tác đều có chuẩn mực, công bằng và đáng tin cậy.</p>
              </div>

              <div className="p-4 md:p-5 rounded-2xl bg-[#071B42]/40 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-300">
                <div className="text-gradient-gold text-lg md:text-2xl font-display font-black mb-1">Opportunity</div>
                <div className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mở rộng cơ hội</div>
                <p className="text-[8px] md:text-[9px] text-[#6E7481] mt-2 text-justify">Tạo cầu nối trực tiếp loại bỏ trung gian để tối ưu hóa giá trị công việc.</p>
              </div>

              <div className="p-4 md:p-5 rounded-2xl bg-[#071B42]/40 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-300 col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4.5 w-4.5 md:h-5 w-5 text-[#F0C56B]" />
                  <span className="text-[10px] md:text-xs font-black text-slate-200 uppercase tracking-wider">Innovation & Trust</span>
                </div>
                <p className="text-[9px] md:text-[10px] text-slate-400 leading-relaxed text-justify">Ứng dụng công nghệ trí tuệ nhân tạo (AI) để thay đổi cách thức vận hành ngành sắc đẹp, đồng thời xây dựng lòng tin bền vững giữa Talent và các Nhãn hàng.</p>
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
            Giải pháp công nghệ <span className="text-gradient-gold">Nâng tầm thương hiệu</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mb-8 md:mb-10 leading-relaxed font-medium">
            Hệ thống được thiết kế theo phong cách tinh tế, đẳng cấp để mang lại trải nghiệm chuyên nghiệp nhất cho cả Talent và Đối tác Doanh nghiệp.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* Feature 1 */}
            <div className="group relative p-5 md:p-6 rounded-2xl bg-[#071B42]/30 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-300 hover:bg-[#0B245C]/40">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[#D4A64A]/10 text-[#F0C56B] border border-[#D4A64A]/20 mb-4 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="h-4.5 w-4.5 md:h-5 md:w-5" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Định hướng AI thông minh (Onstage AI)</h3>
              <p className="text-[11px] text-slate-450 leading-relaxed text-justify">
                Trắc nghiệm năng lực độc quyền dựa trên dữ liệu giúp phân tích điểm mạnh, định hướng phong cách nghệ thuật và xếp hạng Tier khách quan cho lộ trình sự nghiệp phát triển bền vững.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-5 md:p-6 rounded-2xl bg-[#071B42]/30 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-300 hover:bg-[#0B245C]/40">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[#D4A64A]/10 text-[#F0C56B] border border-[#D4A64A]/20 mb-4 group-hover:scale-105 transition-transform duration-300">
                <FileText className="h-4.5 w-4.5 md:h-5 md:w-5" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Hồ sơ số chuyên nghiệp (DIGITAL Portfolio)</h3>
              <p className="text-[11px] text-slate-450 leading-relaxed text-justify">
                Kiến tạo hồ sơ số điện tử cao cấp thay thế hồ sơ truyền thống. Tích hợp chỉ số hình thể nhân trắc học, thư viện ảnh chất lượng cao, video trình diễn và hiển thị Rate Card minh bạch.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-5 md:p-6 rounded-2xl bg-[#071B42]/30 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-300 hover:bg-[#0B245C]/40">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[#D4A64A]/10 text-[#F0C56B] border border-[#D4A64A]/20 mb-4 group-hover:scale-105 transition-transform duration-300">
                <Search className="h-4.5 w-4.5 md:h-5 md:w-5" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Tìm kiếm & Khớp nối thông minh</h3>
              <p className="text-[11px] text-slate-455 leading-relaxed text-justify">
                Nhãn hàng & Agency dễ dàng tìm đúng người cho đúng cơ hội thông qua bộ lọc thông minh (chỉ số đo, phong cách biểu diễn, độ tương thích chiến dịch) giúp tiết kiệm 90% thời gian tìm kiếm.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative p-5 md:p-6 rounded-2xl bg-[#071B42]/30 border border-white/5 hover:border-[#D4A64A]/20 transition-all duration-300 hover:bg-[#0B245C]/40">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[#D4A64A]/10 text-[#F0C56B] border border-[#D4A64A]/20 mb-4 group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck className="h-4.5 w-4.5 md:h-5 md:w-5" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Bảo chứng thanh toán (Trust Escrow)</h3>
              <p className="text-[11px] text-slate-455 leading-relaxed text-justify">
                Đảm bảo quyền lợi tài chính vững chắc bằng quy trình đặt cọc, ký hợp đồng số nhanh gọn và cơ chế giải ngân an toàn theo tiến độ công việc được phê duyệt trên hệ thống.
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

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight mb-6 md:mb-10">
            Kết nối trực tiếp <span className="text-gradient-gold">Hợp tác bền vững</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative w-full font-sans">
            <div className="relative p-5 md:p-6 rounded-2xl bg-[#071B42]/45 border border-white/10 hover:border-[#D4A64A]/30 hover:scale-[1.02] transition-all duration-300">
              <div className="absolute -top-5 left-5 text-4xl font-display font-black text-[#F0C56B] drop-shadow-[0_2px_8px_rgba(240,197,107,0.3)]">01</div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2 pt-2">Lựa chọn vai trò</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed text-justify">
                Tạo tài khoản và chọn cổng tương ứng: Người mẫu, KOL gia nhập cổng Onstage Talent. Nhãn hàng, Doanh nghiệp & Agency tham gia cổng Onstage Brand.
              </p>
            </div>

            <div className="relative p-5 md:p-6 rounded-2xl bg-[#071B42]/45 border border-white/10 hover:border-[#D4A64A]/30 hover:scale-[1.02] transition-all duration-300">
              <div className="absolute -top-5 left-5 text-4xl font-display font-black text-[#F0C56B] drop-shadow-[0_2px_8px_rgba(240,197,107,0.3)]">02</div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2 pt-2">Thiết lập & Đăng tin</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed text-justify">
                Tài năng xây dựng hồ sơ số và thực hiện khảo sát năng lực AI. Đối tác thiết lập yêu cầu chiến dịch, chỉ số tuyển chọn và công bố ngân sách.
              </p>
            </div>

            <div className="relative p-5 md:p-6 rounded-2xl bg-[#071B42]/45 border border-white/10 hover:border-[#D4A64A]/30 hover:scale-[1.02] transition-all duration-300">
              <div className="absolute -top-5 left-5 text-4xl font-display font-black text-[#F0C56B] drop-shadow-[0_2px_8px_rgba(240,197,107,0.3)]">03</div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2 pt-2">Khớp nối & Giải ngân</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed text-justify">
                Thuật toán khớp nối tự động gợi ý ứng viên tốt nhất. Hai bên tiến hành booking trực tiếp, ký kết hợp đồng số và nhận giải ngân bảo chứng an toàn.
              </p>
            </div>
          </div>
        </section>

        {/* PORTALS SECTION (Scroll target) */}
        <section id="portals" className="w-full mb-16 scroll-mt-24 px-4 text-center max-w-[1550px] mx-auto">
          <div className="flex flex-col items-center space-y-4 mb-10 w-full">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F0C56B] bg-[#D4A64A]/10 px-4 py-1.5 rounded-full border border-[#D4A64A]/20">
              Hệ sinh thái sản phẩm
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight">
              Vào hệ thống của bạn để bắt đầu
            </h2>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Chọn lối vào tương ứng để bắt đầu tối ưu hóa tiềm năng sự nghiệp hoặc chiến dịch thương hiệu của bạn.
            </p>
          </div>

          {/* The two existing portal cards side-by-side, exactly as they are currently styled */}
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-2 text-left font-sans">

            {/* Talent Portal Card */}
            <Link
              href="/intro/talent"
              className="group relative flex flex-col justify-between items-start rounded-3xl bg-[#090b16]/45 border border-white/5 hover:border-amber-400/30 p-5 md:p-8 text-left transition-all duration-500 hover:bg-[#0c0f24]/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.08)] backdrop-blur-xl"
            >
              {/* Subtle gold accent light inside the card */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-amber-400/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="flex justify-between items-center w-full mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300 border border-amber-400/20 group-hover:bg-gradient-to-r group-hover:from-amber-200 group-hover:to-yellow-500 group-hover:text-slate-950 transition-all duration-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:scale-105">
                  <User className="h-6 w-6" />
                </div>

                <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400/15 border border-amber-400/30 px-3 py-1 rounded-full text-amber-300 shadow-sm">
                  Talent Portal
                </span>
              </div>

              <div className="space-y-4 w-full">
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors uppercase tracking-wider">
                    Kênh Người Mẫu & KOLs
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-medium text-justify">
                    Dành cho Model, KOL, Hoa khôi, MC. Khảo sát năng lực, tạo hồ sơ số, Rate Card & nhận lịch diễn tự động.
                  </p>
                </div>

                {/* List of sub-features */}
                <div className="pt-3 border-t border-white/5 space-y-2 text-[10px] text-slate-450 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>Khảo sát định hướng AI thông minh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>Hồ sơ số & Phân hạng Tier chuyên nghiệp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>Nhận booking & Đặt lịch trực tiếp</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-1 text-[10px] font-black text-amber-300 group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                  Khám phá ngay <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* Brand Portal Card */}
            <Link
              href="/intro/brand"
              className="group relative flex flex-col justify-between items-start rounded-3xl bg-[#090b16]/45 border border-white/5 hover:border-[#D4A64A]/30 p-5 md:p-8 text-left transition-all duration-500 hover:bg-[#0c0f24]/60 hover:shadow-[0_0_30px_rgba(212,166,74,0.08)] backdrop-blur-xl"
            >
              {/* Subtle gold accent light inside the card */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-[#D4A64A]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="flex justify-between items-center w-full mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4A64A]/10 text-[#F0C56B] border border-[#D4A64A]/20 group-hover:bg-gradient-to-r group-hover:from-[#ffe599] group-hover:to-[#b8860b] group-hover:text-slate-950 transition-all duration-500 shadow-[0_0_15px_rgba(212,166,74,0.15)] group-hover:scale-105">
                  <Briefcase className="h-6 w-6" />
                </div>

                <span className="text-[9px] font-black uppercase tracking-widest bg-[#D4A64A]/15 border border-[#D4A64A]/30 px-3 py-1 rounded-full text-[#F0C56B] shadow-sm">
                  Brand Portal
                </span>
              </div>

              <div className="space-y-4 w-full">
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-[#F0C56B] transition-colors uppercase tracking-wider">
                    Kênh Nhãn Hàng & Agency
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-medium text-justify">
                    Dành cho Doanh nghiệp, Thương hiệu và Quản lý. Tìm kiếm tài năng bằng bộ lọc AI, khởi tạo chiến dịch & quản lý tài chính.
                  </p>
                </div>

                {/* List of sub-features */}
                <div className="pt-3 border-t border-white/5 space-y-2 text-[10px] text-slate-450 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4A64A] shrink-0" />
                    <span>Tìm kiếm & Lọc hồ sơ Model, KOLs bằng AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4A64A] shrink-0" />
                    <span>Tạo chiến dịch, gom nhóm danh sách tuyển chọn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4A64A] shrink-0" />
                    <span>Đặt cọc an toàn & thanh toán cát-xê tự động</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-1 text-[10px] font-black text-[#F0C56B] group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                  Khám phá ngay <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

          </div>
        </section>

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
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed text-center px-4 font-medium">
              Nền tảng công nghệ tối tân giúp kiến tạo hồ sơ sắc đẹp số chuyên nghiệp, định hướng AI và tự động khớp nối cơ hội hợp tác cho các thế hệ tài năng cùng nhãn hàng.
            </p>
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
                  <li>
                    <Link href="/intro/talent" className="hover:text-[#F0C56B] transition-colors block">Kênh Onstage Talent</Link>
                  </li>
                  <li>
                    <Link href="/intro/brand" className="hover:text-[#F0C56B] transition-colors block">Kênh Onstage Brand</Link>
                  </li>
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
