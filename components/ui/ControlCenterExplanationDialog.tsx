import React, { useState } from "react";
import { X, Sparkles, FileText, Search, Users, Briefcase, Zap, CheckCircle2, Building2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlCenterExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "talent" | "brand";
}

export default function ControlCenterExplanationDialog({
  isOpen,
  onClose,
  defaultTab = "talent"
}: ControlCenterExplanationDialogProps) {
  const [activeTab, setActiveTab] = useState<"talent" | "brand">(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Content */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#D4A64A]/30 bg-[radial-gradient(circle_at_top,rgba(212,166,74,0.12),transparent_45%),linear-gradient(to_bottom,#080914,#04050a)] p-6 md:p-8 shadow-[0_0_50px_rgba(212,166,74,0.15)] overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Ambient Top Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-32 w-3/4 rounded-full bg-[#D4A64A]/10 blur-3xl pointer-events-none" />

        <div className="space-y-6">
          {/* Modal Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#D4A64A]/10 pb-4 text-left">
            <div className="min-w-0">
              <span className="block text-[10px] text-amber-400 uppercase tracking-widest font-black mb-1">
                Onstage Ecosystem Guide
              </span>
              <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-amber-400 shrink-0" />
                Tìm hiểu vai trò thành viên
              </h3>
            </div>
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white bg-slate-900 border border-white/10 hover:border-[#D4A64A]/30 hover:bg-slate-800 transition-all cursor-pointer p-2 rounded-full shadow-md active:scale-95 shrink-0"
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Role Switching Tabs */}
          <div className="flex flex-col md:flex-row p-1 gap-2 md:gap-0 rounded-2xl md:rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-md relative shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] w-full">
            <button
              onClick={() => setActiveTab("talent")}
              className={cn(
                "w-full md:flex-1 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer relative z-10",
                activeTab === "talent"
                  ? "bg-gradient-gold text-slate-950 shadow-[0_4px_12px_rgba(240,197,107,0.3)]"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Idol (Người Mẫu & KOLs...)
            </button>
            <button
              onClick={() => setActiveTab("brand")}
              className={cn(
                "w-full md:flex-1 py-3 rounded-xl md:rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer relative z-10",
                activeTab === "brand"
                  ? "bg-gradient-gold text-slate-950 shadow-[0_4px_12px_rgba(240,197,107,0.3)]"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Nhà tuyển dụng & Khách hàng
            </button>
          </div>

          {/* Content Area */}
          <div className="space-y-6 text-left">
            {activeTab === "talent" ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Who are Talents */}
                <div className="p-5 rounded-2xl bg-amber-500/[0.03] border border-amber-400/25">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                    <h4 className="text-xs font-black text-amber-450 uppercase tracking-wider">
                      ĐỐI TƯỢNG IDOL LÀ NHỮNG AI?
                    </h4>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed text-justify">
                    Dành cho các cá nhân hoạt động trong lĩnh vực nghệ thuật, giải trí và thời trang bao gồm:{" "}
                    <strong className="text-white font-bold">Người mẫu ảnh/Runway, Diễn viên, KOLs, KOCs, MCs, PG/PB</strong>, người tìm kiếm cơ hội việc làm tự do hoặc các idol sáng tạo có mong muốn xây dựng thương hiệu cá nhân bền vững.
                  </p>
                </div>

                {/* Core Features */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    CÁC TÍNH NĂNG NỔI BẬT DÀNH CHO IDOL
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Feature 1 */}
                    <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.02] hover:border-amber-400/40 hover:bg-amber-500/[0.04] transition-all duration-300 p-4 flex flex-col h-full min-h-[200px]">
                      <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mb-3">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <h5 className="text-xs md:text-sm font-black text-white uppercase tracking-wide min-h-[36px] flex items-center mb-1">
                        Hồ sơ số chuyên nghiệp
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed flex-1 text-justify">
                        Tích hợp hình ảnh, video toàn thân, số đo chuẩn hóa, liên kết mạng xã hội (TikTok, Instagram) chỉ trong một link chia sẻ.
                      </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.02] hover:border-amber-400/40 hover:bg-amber-500/[0.04] transition-all duration-300 p-4 flex flex-col h-full min-h-[200px]">
                      <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mb-3">
                        <Zap className="h-4.5 w-4.5" />
                      </div>
                      <h5 className="text-xs md:text-sm font-black text-white uppercase tracking-wide min-h-[36px] flex items-center mb-1">
                        AI chẩn đoán & danh hiệu
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed flex-1 text-justify">
                        Tự động tính toán điểm chuyên môn dựa trên khảo sát và hồ sơ, sau đó gợi ý danh hiệu hiển thị theo từng giai đoạn.
                      </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.02] hover:border-amber-400/40 hover:bg-amber-500/[0.04] transition-all duration-300 p-4 flex flex-col h-full min-h-[200px]">
                      <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mb-3">
                        <Briefcase className="h-4.5 w-4.5" />
                      </div>
                      <h5 className="text-xs md:text-sm font-black text-white uppercase tracking-wide min-h-[36px] flex items-center mb-1">
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
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Who are Brands */}
                <div className="p-5 rounded-2xl bg-[#C9A86A]/[0.03] border border-[#C9A86A]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-[#C9A86A] shrink-0" />
                    <h4 className="text-xs font-black text-[#C9A86A] uppercase tracking-wider">
                      ĐỐI TƯỢNG TUYỂN DỤNG LÀ NHỮNG AI?
                    </h4>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed text-justify">
                    Dành cho các đơn vị, cá nhân có nhu cầu tuyển dụng nhân sự/idol nghệ thuật bao gồm:{" "}
                    <strong className="text-white font-bold">Thương hiệu thời trang, nhãn hàng tiêu dùng, người đăng việc làm, Agency quảng cáo, nhà thiết kế thời trang</strong>, hoặc các đơn vị tổ chức sự kiện muốn tìm kiếm gương mặt đại diện và nhân sự hỗ trợ chiến dịch quảng bá.
                  </p>
                </div>

                {/* Core Features */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    CÁC TÍNH NĂNG NỔI BẬT DÀNH CHO NHÀ TUYỂN DỤNG
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Feature 1 */}
                    <div className="rounded-xl border border-[#C9A86A]/20 bg-[#C9A86A]/[0.02] hover:border-[#C9A86A]/40 hover:bg-[#C9A86A]/[0.04] transition-all duration-300 p-4 flex flex-col h-full min-h-[200px]">
                      <div className="h-9 w-9 rounded-lg bg-[#C9A86A]/10 border border-[#C9A86A]/20 flex items-center justify-center text-[#F0C56B] shrink-0 mb-3">
                        <Briefcase className="h-4.5 w-4.5" />
                      </div>
                      <h5 className="text-xs md:text-sm font-black text-white uppercase tracking-wide min-h-[36px] flex items-center mb-1">
                        Tạo chiến dịch tuyển dụng
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed flex-1 text-justify">
                        Khởi tạo casting brief nhanh chóng với kịch bản cụ thể, thiết lập yêu cầu số đo ngoại hình, độ tuổi, khu vực và ngân sách thù lao rõ ràng.
                      </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="rounded-xl border border-[#C9A86A]/20 bg-[#C9A86A]/[0.02] hover:border-[#C9A86A]/40 hover:bg-[#C9A86A]/[0.04] transition-all duration-300 p-4 flex flex-col h-full min-h-[200px]">
                      <div className="h-9 w-9 rounded-lg bg-[#C9A86A]/10 border border-[#C9A86A]/20 flex items-center justify-center text-[#F0C56B] shrink-0 mb-3">
                        <Search className="h-4.5 w-4.5" />
                      </div>
                      <h5 className="text-xs md:text-sm font-black text-white uppercase tracking-wide min-h-[36px] flex items-center mb-1">
                        Tìm kiếm Idol
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed flex-1 text-justify">
                        Lọc thông minh qua hàng ngàn hồ sơ Idol theo chiều cao, cân nặng, số đo, lượt follow mạng xã hội hoặc danh hiệu nổi bật.
                      </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="rounded-xl border border-[#C9A86A]/20 bg-[#C9A86A]/[0.02] hover:border-[#C9A86A]/40 hover:bg-[#C9A86A]/[0.04] transition-all duration-300 p-4 flex flex-col h-full min-h-[200px]">
                      <div className="h-9 w-9 rounded-lg bg-[#C9A86A]/10 border border-[#C9A86A]/20 flex items-center justify-center text-[#F0C56B] shrink-0 mb-3">
                        <Users className="h-4.5 w-4.5" />
                      </div>
                      <h5 className="text-xs md:text-sm font-black text-white uppercase tracking-wide min-h-[36px] flex items-center mb-1">
                        Quản lý mạng lưới Idol
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed flex-1 text-justify">
                        Tích hợp tính năng quản lý danh sách Idol đã lưu, gửi link hoặc mã QR mời Idol tham gia hợp tác trực tiếp không qua trung gian.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
