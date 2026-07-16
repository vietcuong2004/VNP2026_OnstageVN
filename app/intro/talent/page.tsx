"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  FileText, 
  ArrowLeft,
  User,
  Zap,
  CheckCircle2
} from "lucide-react";

export default function TalentIntroPage() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-[#02040a] text-slate-200 font-sans overflow-x-hidden w-full max-w-full">
      {/* Background ambient glow effects */}
      <div className="absolute top-0 right-0 left-0 z-0 w-full h-[60vh] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute top-[20%] left-[-10%] h-[400px] w-[400px] rounded-full bg-purple-650/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full border-b border-white/5 bg-[#02040a]/80 backdrop-blur-md">
        <div className="w-full max-w-[1550px] mx-auto flex items-center justify-between py-4 px-4 md:px-8">
          <Link href="/" className="flex items-center hover:opacity-95 transition-opacity">
            <img src="/logo_icon.png" alt="OnstageVN Logo Icon" className="h-10 w-10 object-contain shrink-0" />
            <img src="/logo_text.png" alt="OnstageVN Logo Text" className="h-8 object-contain shrink-0" />
          </Link>
          <Link 
            href="/" 
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại Trang chủ
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center py-12 px-4 max-w-[1200px] mx-auto">
        {/* Breadcrumb / Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 mb-6">
          <Sparkles className="h-3.5 w-3.5 text-[#F0C56B]" />
          <span className="text-[10px] font-bold text-[#F0C56B] uppercase tracking-wider">
            ONSTAGE TALENT — KẾT NỐI TÀI NĂNG VỚI CƠ HỘI
          </span>
        </div>

        {/* Hero title */}
        <h1 className="text-3xl md:text-5xl font-display font-black text-center text-white tracking-tight leading-tight uppercase mb-4">
          TÔN VINH SẮC ĐẸP <br />
          <span className="text-gradient-gold">TÀI NĂNG TỎA SÁNG</span>
        </h1>
        
        <p className="text-sm md:text-base text-slate-400 text-center max-w-3xl mb-12 font-medium leading-relaxed">
          Chào mừng bạn đến với <strong>Onstage Talent</strong> — cổng kết nối và phát triển sự nghiệp chuyên nghiệp dành riêng cho Người mẫu, Hoa hậu, KOL và các Nhà sáng tạo nội dung. Chúng tôi ứng dụng công nghệ hiện đại giúp bạn định vị năng lực bản thân, sở hữu hồ sơ số cao cấp và tiếp cận trực tiếp các cơ hội hợp tác đẳng cấp từ các nhãn hàng hàng đầu.
        </p>

        {/* Features Grid - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
          {/* Card 1: Khảo sát định hướng AI */}
          <div className="p-6 rounded-2xl bg-[#090b16]/65 border border-white/5 hover:border-amber-400/30 transition-all duration-300 backdrop-blur-xl group flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                Định hướng sự nghiệp bằng AI
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed text-justify mb-4">
                Ứng dụng công nghệ phân tích dữ liệu độc quyền để trắc nghiệm năng lực chuyên môn, định hình phong cách cá nhân và đề xuất lộ trình phát triển phù hợp nhất.
              </p>
            </div>
            <ul className="space-y-2 text-[10px] text-slate-450 font-semibold pt-4 border-t border-white/5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Trắc nghiệm năng lực nghệ thuật chuyên biệt</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Gợi ý hướng đi Catwalk, Pageant, KOL/Influencer...</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Hồ sơ số cao cấp */}
          <div className="p-6 rounded-2xl bg-[#090b16]/65 border border-white/5 hover:border-amber-400/30 transition-all duration-300 backdrop-blur-xl group flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-550/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                Hồ sơ sắc đẹp số chuyên nghiệp
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed text-justify mb-4">
                Thay thế hồ sơ giấy truyền thống bằng Digital Portfolio cao cấp. Tích hợp chỉ số hình thể nhân trắc học được xác minh, thư viện ảnh/video trình diễn HD và Rate Card minh bạch.
              </p>
            </div>
            <ul className="space-y-2 text-[10px] text-slate-450 font-semibold pt-4 border-t border-white/5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>Số hóa toàn bộ thông số đo, kỹ năng & Social Link</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>Tự động xuất file Compcard chuẩn quốc tế trong 1-click</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Cơ hội trực tiếp */}
          <div className="p-6 rounded-2xl bg-[#090b16]/65 border border-white/5 hover:border-amber-400/30 transition-all duration-300 backdrop-blur-xl group flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-550/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                Kết nối trực tiếp & Tối ưu cơ hội
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed text-justify mb-4">
                Loại bỏ các khâu trung gian kém minh bạch. Nhận lời mời tham gia các chiến dịch, buổi chụp ảnh quảng cáo, casting sự kiện trực tiếp từ các nhãn hàng và agency chuyên nghiệp.
              </p>
            </div>
            <ul className="space-y-2 text-[10px] text-slate-450 font-semibold pt-4 border-t border-white/5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span>Nhận và phản hồi casting ngay lập tức trên hệ thống</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span>Quản lý lịch diễn thông minh và đồng bộ hóa thời gian</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Call to action panel */}
        <div className="w-full p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#090b16]/90 to-[#0e122b]/90 border border-amber-500/20 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative glowing overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-xl md:text-3xl font-display font-bold text-white mb-3 relative z-10">
            Sẵn sàng kiến tạo tương lai nghệ thuật của bạn?
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto mb-8 relative z-10">
            Gia nhập Onstage Talent ngay hôm nay để thiết lập hồ sơ số chuyên nghiệp và mở rộng cơ hội hợp tác cùng hàng trăm nhãn hàng hàng đầu.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10 w-full sm:w-auto">
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
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 mt-16 text-center text-[10px] font-semibold text-slate-600">
        <p>© {new Date().getFullYear()} ONSTAGE VN. Thiết kế chuyên biệt dành cho Tài năng sắc đẹp & KOLs.</p>
      </footer>
    </div>
  );
}
