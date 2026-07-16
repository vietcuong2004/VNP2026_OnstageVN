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
  Home
} from "lucide-react";

export default function TalentIntroPage() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-[#02040a] text-slate-200 font-sans overflow-x-hidden w-full max-w-full">
      {/* Background ambient glow effects */}
      <div className="absolute top-0 right-0 left-0 z-0 w-full h-[80vh] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[150px]" />
        <div className="absolute top-[20%] left-[-15%] h-[500px] w-[500px] rounded-full bg-purple-650/5 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 w-full bg-[#02040a]/80 backdrop-blur-md border-b border-white/5">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between py-4 px-4 md:px-8">
          <Link href="/" className="flex items-center hover:opacity-95 transition-opacity">
            <img src="/logo_icon.png" alt="OnstageVN Logo Icon" className="h-10 w-10 object-contain shrink-0" />
            <img src="/logo_text.png" alt="OnstageVN Logo Text" className="h-8 object-contain shrink-0" />
          </Link>
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Quay lại trang chủ
            </Link>
            <Link
              href="/talent/dashboard"
              className="px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-gold text-slate-950 hover:shadow-[0_0_20px_rgba(240,197,107,0.3)] hover:scale-102 transition-all flex items-center gap-1.5"
            >
              Vào cổng Talent <User className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-10 md:pt-16 pb-16 flex flex-col lg:flex-row items-center justify-between gap-12">
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
          <div className="absolute left-4 top-[10%] w-[160px] md:w-[190px] rounded-2xl border border-white/5 bg-[#090b16]/40 p-3 backdrop-blur-md rotate-[-8deg] shadow-2xl opacity-60 pointer-events-none transform -translate-x-12 select-none">
            <div className="h-[120px] rounded-xl overflow-hidden bg-slate-900 mb-2">
              <img src="/avatar.png" alt="" className="w-full h-full object-cover grayscale opacity-70" />
            </div>
            <div className="h-2 w-12 bg-slate-800 rounded mb-1" />
            <div className="h-1.5 w-20 bg-slate-800 rounded" />
          </div>

          {/* Back floating card Right */}
          <div className="absolute right-4 bottom-[15%] w-[160px] md:w-[190px] rounded-2xl border border-white/5 bg-[#090b16]/40 p-3 backdrop-blur-md rotate-[8deg] shadow-2xl opacity-60 pointer-events-none transform translate-x-12 select-none">
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
      <section className="relative z-10 w-full max-w-[1200px] mx-auto px-4 text-center mt-8 mb-12">
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
      <section className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {/* Card 1: Định hướng sự nghiệp bằng AI */}
        <div className="p-6 md:p-8 rounded-2xl bg-[#090b16]/45 border border-white/5 hover:border-amber-500/20 hover:bg-[#0c0f24]/60 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Định hướng <br className="hidden md:block" /> sự nghiệp bằng AI
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed text-justify">
              Ứng dụng công nghệ phân tích dữ liệu độc quyền để trắc nghiệm năng lực chuyên môn, định hình phong cách cá nhân và đề xuất lộ trình phát triển phù hợp nhất.
            </p>
            <ul className="space-y-2.5 text-[10px] text-slate-450 font-semibold pt-4 border-t border-white/5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Trắc nghiệm năng lực nghệ thuật chuyên biệt</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Gợi ý hướng đi Catwalk, Pageant, KOL/Influencer...</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Đề xuất lộ trình phát triển cá nhân</span>
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <button
              onClick={() => router.push("/talent/dashboard")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Khám phá <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Hồ sơ sắc đẹp số */}
        <div className="p-6 md:p-8 rounded-2xl bg-[#090b16]/45 border border-white/5 hover:border-amber-500/20 hover:bg-[#0c0f24]/60 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Hồ sơ sắc đẹp số <br className="hidden md:block" /> chuyên nghiệp
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed text-justify">
              Thay thế hồ sơ giấy truyền thống bằng Digital Portfolio cao cấp. Tích hợp chỉ số hình thể nhân trắc học được xác minh, thư viện ảnh/video trình diễn HD và Rate Card minh bạch.
            </p>
            <ul className="space-y-2.5 text-[10px] text-slate-450 font-semibold pt-4 border-t border-white/5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Số hóa toàn bộ thông số đo, kỹ năng & Social Link</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Tự động xuất file Compcard chuẩn quốc tế trong 1-click</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Cập nhật dễ dàng, chia sẻ chuyên nghiệp</span>
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <button
              onClick={() => router.push("/talent/dashboard")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Khám phá <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Kết nối trực tiếp */}
        <div className="p-6 md:p-8 rounded-2xl bg-[#090b16]/45 border border-white/5 hover:border-amber-500/20 hover:bg-[#0c0f24]/60 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Kết nối trực tiếp <br className="hidden md:block" /> & tối ưu cơ hội
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed text-justify">
              Loại bỏ các khâu trung gian kém minh bạch. Nhận lời mời tham gia các chiến dịch, buổi chụp ảnh quảng cáo, casting sự kiện trực tiếp từ các nhãn hàng và agency chuyên nghiệp.
            </p>
            <ul className="space-y-2.5 text-[10px] text-slate-450 font-semibold pt-4 border-t border-white/5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span className="leading-tight">Nhận và phản hồi casting ngay lập tức trên hệ thống</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Quản lý lịch diễn thông minh và đồng bộ hóa thời gian</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-tight">Theo dõi tiến độ & thanh toán minh bạch</span>
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <button
              onClick={() => router.push("/talent/dashboard")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Khám phá <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Bottom CTA Panel */}
      <section className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-8 mb-20">
        <div className="w-full p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#090b16]/90 to-[#0e122b]/90 border border-amber-500/20 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
          {/* Decorative glowing overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Left: Models Collage */}
          <div className="w-full lg:w-[45%] flex items-center justify-center relative min-h-[220px]">
            {/* Image 1 - back left */}
            <div className="absolute left-[5%] bottom-0 w-[110px] h-[160px] rounded-xl overflow-hidden border border-white/5 bg-slate-900 shadow-xl z-10 select-none">
              <img src="/avatar.png" alt="" className="w-full h-full object-cover" />
            </div>
            {/* Image 2 - center */}
            <div className="absolute left-[30%] -top-4 w-[130px] h-[190px] rounded-xl overflow-hidden border border-[#D4A64A]/30 bg-slate-900 shadow-2xl z-20 select-none">
              <img src="/fullbody_model.png" alt="" className="w-full h-full object-cover" />
            </div>
            {/* Image 3 - right */}
            <div className="absolute right-[5%] bottom-0 w-[110px] h-[160px] rounded-xl overflow-hidden border border-white/5 bg-slate-900 shadow-xl z-10 select-none">
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
              Sẵn sàng kiến tạo <br /> tương lai nghệ thuật của bạn?
            </h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-xl">
              Gia nhập Onstage Talent ngay hôm nay để thiết lập hồ sơ số chuyên nghiệp và mở rộng cơ hội hợp tác cùng hàng trăm nhãn hàng hàng đầu.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center w-full sm:w-auto">
              <Link
                href="/talent/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-gold text-slate-950 hover:shadow-[0_0_25px_rgba(240,197,107,0.4)] hover:scale-102 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                Vào cổng Talent <User className="h-4.5 w-4.5" />
              </Link>

              <Link
                href="/"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-xs font-bold text-white border border-white/10 hover:border-white/35 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Về trang chủ <Home className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Brand Logos Footer */}
      <section className="relative z-10 w-full max-w-[1200px] mx-auto px-4 text-center pb-12 border-t border-white/5 pt-12">
        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-8">
          Được tin dùng bởi hàng trăm thương hiệu và agency hàng đầu
        </h4>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-16 select-none opacity-40 hover:opacity-60 transition-opacity duration-300">
          <span className="font-serif font-bold text-xl tracking-[0.2em] text-slate-400">L'ORÉAL</span>
          <span className="font-sans font-black text-lg tracking-tighter text-slate-400">SAMSUNG</span>
          <span className="font-sans font-bold text-lg tracking-wide text-slate-400">VINFAST</span>
          <span className="font-sans font-black text-lg text-slate-400">Shopee</span>
          <span className="font-sans font-extrabold text-lg text-slate-400 flex items-center gap-0.5">
            <span className="text-[#FF0050] font-bold">T</span>
            <span className="text-[#00F2FE] font-bold">i</span>kTok
          </span>
          <span className="font-serif font-black text-lg tracking-widest text-slate-400">PNJ</span>
          <span className="font-serif italic font-bold text-xl tracking-[0.1em] text-slate-400">VOGUE</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 text-center text-[10px] font-semibold text-slate-600">
        <p>© {new Date().getFullYear()} ONSTAGE VN. Thiết kế chuyên biệt dành cho Tài năng sắc đẹp & KOLs.</p>
      </footer>
    </div>
  );
}
