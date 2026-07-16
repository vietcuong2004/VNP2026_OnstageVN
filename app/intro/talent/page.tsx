"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  FileText,
  ArrowLeft,
  User,
  Zap,
  CheckCircle2,
  Brain,
  Shield,
  Briefcase,
  ChevronRight,
  Home,
  Mail,
  Phone,
  MapPin,
  Send
} from "lucide-react";

export default function TalentIntroPage() {
  const router = useRouter();

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-[#02040a] text-slate-200 font-sans w-full max-w-full">
      {/* Background ambient glow effects */}
      <div className="absolute top-0 right-0 left-0 z-0 w-full h-[80vh] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[150px]" />
        <div className="absolute top-[20%] left-[-15%] h-[500px] w-[500px] rounded-full bg-purple-650/5 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-[#02040a]/80 backdrop-blur-md border-b border-white/5">
        <div className="w-full max-w-[1550px] mx-auto flex items-center justify-between py-4 px-4 md:px-8">
          <Link href="/" className="flex items-center hover:opacity-95 transition-opacity">
            <img src="/logo_icon.png" alt="OnstageVN Logo Icon" className="h-10 w-10 object-contain shrink-0" />
            <img src="/logo_text.png" alt="OnstageVN Logo Text" className="h-8 object-contain shrink-0" />
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="px-4 py-2 rounded-full text-[11px] font-bold text-slate-300 hover:text-white border border-white/10 hover:border-white/35 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Về trang chủ <Home className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-[1550px] mx-auto px-4 md:px-8 pt-10 md:pt-16 pb-16 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left column: Copy & Buttons */}
        <div className="w-full lg:w-[50%] flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 shadow-[0_0_12px_rgba(240,197,107,0.1)]">
            <Sparkles className="h-3.5 w-3.5 text-[#F0C56B]" />
            <span className="text-[9px] font-black text-[#F0C56B] uppercase tracking-wider">
              ONSTAGE TALENT — KẾT NỐI TÀI NĂNG VỚI CƠ HỘI
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight leading-tight uppercase text-white">
            Tôn vinh sắc đẹp <br />
            <span className="text-gradient-gold whitespace-nowrap">Tài năng tỏa sáng</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs md:text-sm text-slate-350 max-w-lg leading-relaxed font-medium">
            Xây dựng hồ sơ chuyên nghiệp, định hướng bằng AI và kết nối trực tiếp với Brand. Tất cả trong một nền tảng dành riêng cho bạn.
          </p>

          {/* Primary CTA */}
          <div className="pt-2">
            <Link
              href="/talent/dashboard"
              className="px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-gold text-slate-950 hover:shadow-[0_0_25px_rgba(240,197,107,0.4)] hover:scale-102 active:scale-98 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Vào cổng Talent <User className="h-4.5 w-4.5" />
            </Link>
          </div>

          {/* Icon Badges Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-8 max-w-lg lg:max-w-none">
            <div className="flex items-center gap-3 p-1 text-left">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="text-[11px] font-bold text-white leading-tight">
                Miễn phí<br />tạo hồ sơ
              </div>
            </div>
            <div className="flex items-center gap-3 p-1 text-left">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Brain className="h-6 w-6" />
              </div>
              <div className="text-[11px] font-bold text-white leading-tight">
                AI định hướng<br />sự nghiệp
              </div>
            </div>
            <div className="flex items-center gap-3 p-1 text-left">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="text-[11px] font-bold text-white leading-tight">
                Nhận booking<br />từ Brand
              </div>
            </div>
            <div className="flex items-center gap-3 p-1 text-left">
              <div className="h-12 w-12 rounded-xl bg-[#D4A64A]/10 border border-[#D4A64A]/20 flex items-center justify-center text-[#F0C56B] shrink-0">
                <Shield className="h-6 w-6" />
              </div>
              <div className="text-[11px] font-bold text-white leading-tight">
                Minh bạch<br />& an toàn
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Phone & Portfolios Mockup */}
        <div className="w-full lg:w-[45%] flex items-center justify-center relative min-h-[460px] md:min-h-[500px]">
          {/* Back floating card Left */}
          <div className="hidden sm:block absolute left-4 top-[10%] w-[160px] md:w-[190px] rounded-2xl border border-white/5 bg-[#090b16]/40 p-3 backdrop-blur-md rotate-[-8deg] shadow-2xl opacity-60 pointer-events-none transform -translate-x-12 select-none">
            <div className="h-[120px] rounded-xl overflow-hidden bg-slate-900 mb-2">
              <img src="/avatar.png" alt="" className="w-full h-full object-cover grayscale opacity-70" />
            </div>
            <div className="h-2 w-12 bg-slate-800 rounded mb-1" />
            <div className="h-1.5 w-20 bg-slate-800 rounded" />
          </div>

          {/* Back floating card Right */}
          <div className="hidden sm:block absolute right-4 bottom-[15%] w-[160px] md:w-[190px] rounded-2xl border border-white/5 bg-[#090b16]/40 p-3 backdrop-blur-md rotate-[8deg] shadow-2xl opacity-60 pointer-events-none transform translate-x-12 select-none">
            <div className="h-[120px] rounded-xl overflow-hidden bg-slate-900 mb-2">
              <img src="/fullbody_model.png" alt="" className="w-full h-full object-cover grayscale opacity-70" />
            </div>
            <div className="h-2 w-16 bg-slate-800 rounded mb-1" />
            <div className="h-1.5 w-10 bg-slate-800 rounded" />
          </div>

          {/* Glowing ring stage underneath phone */}
          <div className="absolute bottom-[2%] w-60 h-60 rounded-full border border-[#D4A64A]/10 bg-gradient-to-t from-[#D4A64A]/5 to-transparent rotateX-80 blur-sm pointer-events-none" />

          {/* Phone Frame */}
          <div className="relative z-10 w-[260px] md:w-[290px] h-[480px] md:h-[530px] rounded-[2.8rem] border-[10px] border-slate-800 bg-[#02040a] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between p-4 pb-6">

            {/* Dynamic Island / Speaker notch */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-35 flex items-center justify-between px-3 text-[7px] text-slate-600 font-bold select-none">
              <span>9:41</span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              <div className="flex gap-1">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Inner App Content */}
            <div className="flex-1 flex flex-col justify-between pt-5">
              {/* Internal Mini Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5 select-none">
                <img src="/logo_icon.png" className="h-5 w-5" alt="" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">PORTFOLIO SỐ</span>
                <div className="w-4 h-4 rounded-full bg-white/10" />
              </div>

              {/* Model Avatar Shot */}
              <div className="relative h-[200px] rounded-2xl overflow-hidden bg-slate-900 my-2 select-none shadow-inner">
                <img src="/cover_image.png" alt="Model Avatar" className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent" />
              </div>

              {/* Model Profile Details */}
              <div className="text-left space-y-1.5">
                <div className="flex items-center gap-1">
                  <h3 className="text-xs font-black text-white">Nguyễn Mai Anh</h3>
                  <span className="h-3 w-3 rounded-full bg-blue-500 text-[6px] text-white flex items-center justify-center font-bold">✓</span>
                </div>
                <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400">
                  <span>Model</span>
                  <span>•</span>
                  <span>KOL</span>
                  <span>•</span>
                  <span>MC</span>
                </div>
                <div className="text-[8px] font-medium text-slate-500 flex items-center gap-1">
                  <span>📍 Hà Nội, Việt Nam</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-1.5 bg-[#090b16]/70 border border-white/5 rounded-xl p-2 text-center my-2.5 select-none">
                <div>
                  <h4 className="text-[10px] font-black text-white">175</h4>
                  <p className="text-[6px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Chiều cao (cm)</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white">52</h4>
                  <p className="text-[6px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Cân nặng (kg)</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white">83-60-90</h4>
                  <p className="text-[6px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Số đo 3 vòng</p>
                </div>
              </div>

              {/* Compatibility Match Indicator */}
              <div className="flex items-center justify-between border-t border-white/5 pt-2 select-none">
                <div className="text-left">
                  <p className="text-[8px] font-semibold text-slate-500">Chỉ số phù hợp</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-[11px] font-black text-amber-400">85%</span>
                    <span className="text-[7px] text-slate-400">Model Fashion</span>
                  </div>
                </div>

                {/* Micro Radar chart */}
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
                    <polygon points="50,10 88,38 73,82 27,82 12,38" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                    <polygon points="50,25 78,46 67,76 33,76 22,46" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
                    <line x1="50" y1="50" x2="50" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                    <line x1="50" y1="50" x2="88" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                    <line x1="50" y1="50" x2="73" y2="82" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                    <line x1="50" y1="50" x2="27" y2="82" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                    <line x1="50" y1="50" x2="12" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                    <polygon points="50,20 80,40 68,74 35,76 20,42" fill="rgba(240, 197, 107, 0.4)" stroke="#F0C56B" strokeWidth="2" />
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Mid section divider / Title */}
      <section className="relative z-10 w-full max-w-[1550px] mx-auto px-4 text-center mt-8 mb-12">
        <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-wider">
          Khám phá các tính năng nổi bật
        </h2>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#D4A64A]" />
          <span className="text-[#F0C56B] text-[8px]">✦</span>
          <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#D4A64A]" />
        </div>
      </section>

      {/* Detailed Features Grid */}
      <section className="relative z-10 w-full max-w-[1550px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {/* Card 1: Định hướng sự nghiệp bằng AI */}
        <div className="p-6 md:p-8 rounded-2xl bg-[#090b16]/45 border border-white/5 hover:border-amber-500/20 hover:bg-[#0c0f24]/60 transition-all duration-300 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-base md:text-lg font-black text-white uppercase tracking-wider">
              Định hướng sự nghiệp bằng AI
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed text-justify">
              Ứng dụng công nghệ phân tích dữ liệu độc quyền để trắc nghiệm năng lực chuyên môn, định hình phong cách cá nhân và đề xuất lộ trình phát triển phù hợp nhất.
            </p>
            <ul className="space-y-3 text-[11px] md:text-xs text-slate-300 font-semibold pt-4 border-t border-white/5">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Trắc nghiệm năng lực nghệ thuật chuyên biệt</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Gợi ý hướng đi Catwalk, Pageant, KOL/Influencer...</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Đề xuất lộ trình phát triển cá nhân</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Card 2: Hồ sơ sắc đẹp số */}
        <div className="p-6 md:p-8 rounded-2xl bg-[#090b16]/45 border border-white/5 hover:border-amber-500/20 hover:bg-[#0c0f24]/60 transition-all duration-300 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-base md:text-lg font-black text-white uppercase tracking-wider">
              Hồ sơ sắc đẹp số chuyên nghiệp
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed text-justify">
              Thay thế hồ sơ giấy truyền thống bằng Digital Portfolio cao cấp. Tích hợp chỉ số hình thể nhân trắc học được xác minh, thư viện ảnh/video trình diễn HD và Rate Card minh bạch.
            </p>
            <ul className="space-y-3 text-[11px] md:text-xs text-slate-300 font-semibold pt-4 border-t border-white/5">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Số hóa toàn bộ thông số đo, kỹ năng & Social Link</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Tự động xuất file Compcard chuẩn quốc tế trong 1-click</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Cập nhật dễ dàng, chia sẻ chuyên nghiệp</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Card 3: Kết nối trực tiếp */}
        <div className="p-6 md:p-8 rounded-2xl bg-[#090b16]/45 border border-white/5 hover:border-amber-500/20 hover:bg-[#0c0f24]/60 transition-all duration-300 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-base md:text-lg font-black text-white uppercase tracking-wider">
              Kết nối trực tiếp & tối ưu cơ hội
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed text-justify">
              Loại bỏ các khâu trung gian kém minh bạch. Nhận lời mời tham gia các chiến dịch, buổi chụp ảnh quảng cáo, casting sự kiện trực tiếp từ các nhãn hàng và agency chuyên nghiệp.
            </p>
            <ul className="space-y-3 text-[11px] md:text-xs text-slate-300 font-semibold pt-4 border-t border-white/5">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Nhận và phản hồi casting ngay lập tức trên hệ thống</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Quản lý lịch diễn thông minh và đồng bộ hóa thời gian</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Theo dõi tiến độ & thanh toán minh bạch</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom CTA Panel */}
      <section className="relative z-10 w-full max-w-[1550px] mx-auto px-4 md:px-8 mb-20">
        <div className="w-full p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#090b16]/90 to-[#0e122b]/90 border border-amber-500/20 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
          {/* Decorative glowing overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Left: Models Collage */}
          <div className="w-full lg:w-[45%] flex items-center justify-center relative min-h-[220px]">
            {/* Image 1 - back left */}
            <div className="absolute left-[2%] sm:left-[5%] bottom-0 w-[90px] sm:w-[110px] h-[130px] sm:h-[160px] rounded-xl overflow-hidden border border-white/5 bg-slate-900 shadow-xl z-10 select-none">
              <img src="/avatar.png" alt="" className="w-full h-full object-cover" />
            </div>
            {/* Image 2 - center */}
            <div className="absolute left-[28%] sm:left-[30%] -top-4 w-[110px] sm:w-[130px] h-[160px] sm:h-[190px] rounded-xl overflow-hidden border border-[#D4A64A]/30 bg-slate-900 shadow-2xl z-20 select-none">
              <img src="/fullbody_model.png" alt="" className="w-full h-full object-cover" />
            </div>
            {/* Image 3 - right */}
            <div className="absolute right-[2%] sm:right-[5%] bottom-0 w-[90px] sm:w-[110px] h-[130px] sm:h-[160px] rounded-xl overflow-hidden border border-white/5 bg-slate-900 shadow-xl z-10 select-none">
              <img src="/cover_image.png" alt="" className="w-full h-full object-cover" />
            </div>

            {/* Overlaid stats card in the corner */}
            <div className="absolute bottom-[2%] right-[2%] bg-[#02040a]/85 backdrop-blur-md border border-white/10 rounded-xl p-2.5 z-30 flex flex-col space-y-1 shadow-2xl select-none max-w-[130px]">
              <span className="text-[10px] font-black text-emerald-400 flex items-center gap-0.5">+32%</span>
              <span className="text-[7px] font-bold text-slate-350 leading-tight uppercase">Cơ hội nhận casting tháng này</span>
              {/* Mini visual wave chart */}
              <div className="h-4 flex items-end gap-0.5 pt-1 w-full">
                <span className="h-1.5 w-1.5 bg-emerald-500/40 rounded-full" />
                <span className="h-2 w-1.5 bg-emerald-500/60 rounded-full" />
                <span className="h-3.5 w-1.5 bg-emerald-500 rounded-full" />
                <span className="h-2 w-1.5 bg-emerald-500/70 rounded-full" />
                <span className="h-3 w-1.5 bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* Right: Text & Actions */}
          <div className="w-full lg:w-[50%] text-center lg:text-left space-y-6 relative z-10">
            <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase leading-tight tracking-tight">
              Bắt đầu hành trình trở thành <br /> Talent chuyên nghiệp
            </h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-xl">
              Gia nhập Onstage Talent ngay hôm nay để thiết lập hồ sơ số chuyên nghiệp và mở rộng cơ hội hợp tác cùng hàng trăm nhãn hàng hàng đầu.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center w-full sm:w-auto">
              <Link
                href="/talent/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-gold text-slate-950 hover:shadow-[0_0_25px_rgba(240,197,107,0.4)] hover:scale-102 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                Trải nghiệm ngay <User className="h-4.5 w-4.5" />
              </Link>

              <Link
                href="/"
                className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-bold text-white border border-white/10 hover:border-white/35 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Về trang chủ <Home className="h-4 w-4" />
              </Link>
            </div>
          </div>
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
  );
}
