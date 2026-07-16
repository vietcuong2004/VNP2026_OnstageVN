"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Briefcase, 
  ShieldCheck, 
  ArrowLeft,
  Search,
  Users,
  CheckCircle2
} from "lucide-react";

export default function BrandIntroPage() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-[#02040a] text-slate-200 font-sans overflow-x-hidden w-full max-w-full">
      {/* Background ambient glow effects */}
      <div className="absolute top-0 right-0 left-0 z-0 w-full h-[60vh] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#D4A64A]/5 blur-[120px]" />
        <div className="absolute top-[20%] left-[-10%] h-[400px] w-[400px] rounded-full bg-blue-650/5 blur-[120px]" />
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
      <main className="relative z-10 w-full flex-1 flex flex-col items-center py-12 px-4 max-w-5xl mx-auto">
        {/* Breadcrumb / Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4A64A]/30 bg-[#D4A64A]/5 mb-6">
          <Briefcase className="h-3.5 w-3.5 text-[#F0C56B]" />
          <span className="text-[10px] font-bold text-[#F0C56B] uppercase tracking-wider">
            DÀNH CHO DOANH NGHIỆP / THƯƠNG HIỆU / AGENCY
          </span>
        </div>

        {/* Hero title */}
        <h1 className="text-3xl md:text-5xl font-display font-black text-center text-white tracking-tight leading-tight uppercase mb-4">
          Giải pháp công nghệ <br />
          <span className="text-gradient-gold">Nâng tầm thương hiệu</span>
        </h1>
        
        <p className="text-sm md:text-base text-slate-400 text-center max-w-2xl mb-12 font-medium leading-relaxed">
          OnstageVN kết nối doanh nghiệp của bạn trực tiếp với cộng đồng tài năng chuyên nghiệp thông qua thuật toán AI lọc tìm kiếm thông minh, quản lý chiến dịch tập trung và thanh toán bảo chứng tối ưu.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-16">
          {/* Card 1: AI Search & Matching */}
          <div className="p-6 rounded-2xl bg-[#090b16]/65 border border-white/5 hover:border-[#D4A64A]/30 transition-all duration-300 backdrop-blur-xl group">
            <div className="h-12 w-12 rounded-xl bg-[#D4A64A]/10 text-[#F0C56B] border border-[#D4A64A]/25 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">
              Bộ lọc & Tìm kiếm Talent bằng AI
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed text-justify mb-4">
              Dễ dàng lọc và tìm đúng gương mặt đại diện, người mẫu hoặc KOL phù hợp nhất cho chiến dịch. Lọc nâng cao theo chỉ số đo hình thể, độ phủ mạng xã hội, xếp hạng Tier và độ tương thích chiến dịch.
            </p>
            <ul className="space-y-2 text-[11px] text-slate-450 font-semibold">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#F0C56B] shrink-0" />
                <span>Tìm kiếm theo chỉ số đo nhân trắc học chính xác</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#F0C56B] shrink-0" />
                <span>AI chấm điểm tương thích với định hướng thương hiệu</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Quản lý campaign */}
          <div className="p-6 rounded-2xl bg-[#090b16]/65 border border-white/5 hover:border-[#D4A64A]/30 transition-all duration-300 backdrop-blur-xl group">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-550/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">
              Khởi tạo brief & Quản lý chiến dịch
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed text-justify mb-4">
              Đăng tin tuyển dụng (brief) chi tiết, thiết lập tiêu chí tuyển chọn rõ ràng. Nhận hồ sơ ứng tuyển từ các tài năng trực tiếp trên hệ thống và duyệt qua giao diện casting trực tuyến trực quan.
            </p>
            <ul className="space-y-2 text-[11px] text-slate-450 font-semibold">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span>Soạn thảo brief casting trực tuyến chuẩn hóa</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span>Quản lý shortlist, chấm điểm và phân loại ứng viên</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Roster & Quản lý nhóm */}
          <div className="p-6 rounded-2xl bg-[#090b16]/65 border border-white/5 hover:border-[#D4A64A]/30 transition-all duration-300 backdrop-blur-xl group">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-550/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">
              Quản lý danh sách Talent (Roster)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed text-justify mb-4">
              Quản lý các tài năng ruột, đối tác lâu năm hoặc danh sách yêu thích một cách có hệ thống. Đồng bộ hóa lịch trình làm việc và ghi nhận đánh giá hiệu suất của từng talent sau mỗi chiến dịch.
            </p>
            <ul className="space-y-2 text-[11px] text-slate-450 font-semibold">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>Lưu trữ thông tin liên hệ và lịch sử hợp tác</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>Quản lý tiến trình công việc và chấm sao đánh giá</span>
              </li>
            </ul>
          </div>

          {/* Card 4: Escrow Bảo chứng thanh toán */}
          <div className="p-6 rounded-2xl bg-[#090b16]/65 border border-white/5 hover:border-[#D4A64A]/30 transition-all duration-300 backdrop-blur-xl group">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-550/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">
              Bảo chứng thanh toán (Trust Escrow)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed text-justify mb-4">
              Đảm bảo giao dịch minh bạch, giảm thiểu rủi ro pháp lý. Ký hợp đồng số tích hợp chữ ký điện tử. Cát-xê được ký quỹ an toàn và giải ngân chính xác theo từng giai đoạn nghiệm thu của chiến dịch.
            </p>
            <ul className="space-y-2 text-[11px] text-slate-450 font-semibold">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Ký kết hợp đồng số pháp lý chặt chẽ</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Báo cáo hóa đơn, nghiệm thu minh bạch trên app</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Call to action panel */}
        <div className="w-full p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#090b16]/90 to-[#0e122b]/90 border border-[#D4A64A]/20 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative glowing overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4A64A]/5 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-xl md:text-3xl font-display font-bold text-white mb-3 relative z-10">
            Khởi động chiến dịch tuyển chọn Talent ngay hôm nay?
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto mb-8 relative z-10">
            Truy cập cổng Onstage Brand để bắt đầu tìm kiếm ứng viên tiềm năng, lên brief chiến dịch và tối ưu hóa ngân sách booking của bạn.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10 w-full sm:w-auto">
            <Link
              href="/brand/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-gold text-slate-950 hover:shadow-[0_0_25px_rgba(240,197,107,0.4)] hover:scale-102 transition-all duration-305 cursor-pointer flex items-center justify-center gap-2"
            >
              Vào cổng Doanh nghiệp <Briefcase className="h-4.5 w-4.5" />
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
        <p>© {new Date().getFullYear()} ONSTAGE VN. Giải pháp kết nối sắc đẹp & doanh nghiệp.</p>
      </footer>
    </div>
  );
}
