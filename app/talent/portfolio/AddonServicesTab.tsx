"use client";

import React from "react";
import { Zap, Camera, Edit3, PhoneCall, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddonServicesTabProps {
  profile: any;
  setProfile: (profile: any) => void;
  addToast: (message: string, type?: "success" | "info") => void;
  rankingScore: number;
}

export default function AddonServicesTab({
  profile,
  setProfile,
  addToast,
  rankingScore
}: AddonServicesTabProps) {
  
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* SECTION A: SEARCH ALGORITHM RANK BOOSTING */}
      <div className="rounded-2xl border border-amber-400/20 bg-[#08090f] shadow-[0_0_20px_rgba(245,158,11,0.03)] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#151b2d] pb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400 animate-pulse" />
            <div>
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                Trung Tâm Đẩy Top Hồ Sơ (Profile Boosting Center)
              </h3>
              <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                Gia tăng tỷ lệ hiển thị ưu tiên hàng đầu khi Brand tìm kiếm ứng viên
              </span>
            </div>
          </div>
          
          {/* Auto renewal switch simulator */}
          <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5 hover:border-amber-400/30 transition-all select-none">
            <input 
              type="checkbox" 
              className="rounded border-[#151b2d] text-amber-400 focus:ring-0 focus:ring-offset-0 bg-transparent h-3.5 w-3.5 cursor-pointer"
              defaultChecked
              onChange={(e) => {
                if (e.target.checked) {
                  addToast("Đã kích hoạt Tự Động Gia Hạn đẩy top (Tiết kiệm 10% chi phí)", "info");
                } else {
                  addToast("Đã hủy Tự Động Gia Hạn đẩy top", "info");
                }
              }}
            />
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-wider">Tự động gia hạn (-10%)</span>
          </label>
        </div>

        {/* Algorithmic ranking details widget */}
        <div className="rounded-xl bg-slate-950 p-4 border border-white/2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Điểm Xếp Hạng Hiện Tại:</span>
              <span className="text-xs font-black text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded">{rankingScore} Điểm</span>
            </div>
            <p className="text-[9px] text-slate-500 leading-normal max-w-lg">
              `Score = (Boost_Level × 100) + (Profile_Quality × 50) + (Response_Rate × 30) + (Rating × 20)`
              <br />
              Gói hiện hành: <strong>{profile.isSuperBoosted ? "Super Boost (Hạng 1 hiển thị)" : profile.isPremiumBoosted ? "Premium Boost (Hạng 3 hiển thị)" : "Mặc định (Hạng 50+)"}</strong>.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[8px] text-slate-500 uppercase font-black">Xếp hạng tìm kiếm</span>
            <span className="text-sm font-black text-white block mt-1">
              {profile.isSuperBoosted ? "Vị trí Hạng 1" : profile.isPremiumBoosted ? "Vị trí Hạng 3" : "Vị trí Hạng 50+"}
            </span>
          </div>
        </div>

        {/* Boosting packages grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 text-xs">
          {[
            { id: "trial", name: "Trial Boost", duration: "3 ngày", original: "99.000đ", price: 49000, desc: "Hiển thị trong Top 20 tìm kiếm. Phù hợp thử nghiệm.", promo: "49.000đ" },
            { id: "weekly", name: "Weekly Boost", duration: "7 ngày", original: "199.000đ", price: 149000, desc: "Hiển thị trong Top 10 tìm kiếm. Tăng booking nhanh.", promo: "149.000đ" },
            { id: "monthly", name: "Monthly Boost", duration: "30 ngày", original: "599.000đ", price: 499000, desc: "Hiển thị trong Top 5 tìm kiếm. Gia tăng lượng reach đều đặn.", promo: "499.000đ" },
            { id: "premium", name: "Premium Boost", duration: "30 ngày", original: "999.000đ", price: 799000, desc: "Hiển thị trong Top 3 tìm kiếm + Nhãn '🔥 Hot' trên avatar.", promo: "799.000đ", hotBadge: true },
            { id: "super", name: "Super Boost", duration: "30 ngày", original: "1.499.000đ", price: 1199000, desc: "Hiển thị Top 1 tìm kiếm + Banner nổi bật động đầu trang tìm kiếm.", promo: "1.199.000đ", maxBadge: true }
          ].map((pkg) => {
            const isActive = pkg.id === "super" ? profile.isSuperBoosted : pkg.id === "premium" ? profile.isPremiumBoosted : false;
            
            return (
              <div 
                key={pkg.id} 
                className={cn(
                  "rounded-xl border p-4 bg-slate-950 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group",
                  isActive 
                    ? "border-amber-400 bg-gradient-to-b from-amber-400/5 to-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.1)]" 
                    : "border-white/5 hover:border-white/10"
                )}
              >
                {pkg.hotBadge && (
                  <div className="absolute -right-10 -top-10 h-20 w-20 bg-gradient-to-br from-red-500 to-amber-500 rotate-45 flex items-end justify-center pb-2.5">
                    <span className="text-[7px] font-black text-white uppercase tracking-widest">HOT</span>
                  </div>
                )}
                {pkg.maxBadge && (
                  <div className="absolute -right-10 -top-10 h-20 w-20 bg-gradient-to-br from-blue-500 to-cyan-500 rotate-45 flex items-end justify-center pb-2.5">
                    <span className="text-[7px] font-black text-white uppercase tracking-widest">MAX</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[11px] font-black text-white uppercase tracking-wider">{pkg.name}</h4>
                      <span className="text-[8px] text-slate-500 font-bold block mt-0.5">Thời hạn: {pkg.duration}</span>
                    </div>
                    <span className="inline-flex items-center rounded bg-amber-400/10 border border-amber-400/25 px-1.5 py-0.5 text-[7px] font-extrabold text-amber-300 uppercase">
                      {pkg.id === "super" ? "TOP 1" : pkg.id === "premium" ? "TOP 3" : pkg.id === "monthly" ? "TOP 5" : "TOP 20"}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 leading-normal font-medium">{pkg.desc}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#151b2d] flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 line-through block font-mono">{pkg.original}</span>
                    <span className="text-[11px] font-black text-amber-400 block font-mono">{pkg.promo}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        addToast(`Gói ${pkg.name} đang ở trạng thái kích hoạt!`, "info");
                        return;
                      }
                      const updated = { ...profile };
                      if (pkg.id === "super") {
                        updated.isSuperBoosted = true;
                        updated.isPremiumBoosted = false;
                        updated.tier = "S";
                      } else if (pkg.id === "premium") {
                        updated.isSuperBoosted = false;
                        updated.isPremiumBoosted = true;
                        updated.tier = "A";
                      } else {
                        updated.isSuperBoosted = false;
                        updated.isPremiumBoosted = false;
                      }
                      setProfile(updated);
                      localStorage.setItem("vnp_talent_profile", JSON.stringify(updated));
                      addToast(`Kích hoạt thành công gói ${pkg.name}!`, "success");
                    }}
                    className={cn(
                      "h-7 px-3.5 rounded-lg font-display text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer",
                      isActive
                        ? "bg-amber-400/10 border border-amber-400/20 text-amber-300 cursor-not-allowed"
                        : "bg-white text-slate-950 hover:bg-amber-400 hover:text-slate-950 active:scale-95"
                    )}
                  >
                    {isActive ? "Đang đẩy top" : "Kích hoạt"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION B: B2C ADD-ON SERVICES */}
      <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6 text-xs">
        <div className="flex items-center gap-2 border-b border-[#151b2d] pb-4">
          <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
          <div>
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
              Dịch Vụ Đề Xuất & Sản Xuất (B2C Value-Add Marketplace)
            </h3>
            <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
              Đặt lịch các studio liên kết chụp ảnh & dịch vụ viết mô tả profile chuyên nghiệp
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Studio shoot bookings */}
          <div className="rounded-xl border border-white/5 bg-slate-950 p-5 space-y-4">
            <h4 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="h-4.5 w-4.5 text-purple-400" /> Professional Photoshoot (Gói chụp ảnh liên kết)
            </h4>
            <p className="text-[9.5px] text-slate-400 leading-normal font-medium">
              Hợp tác liên kết cùng các Studio/Makeup artist chuyên nghiệp. App trung gian bảo trợ chất lượng sản phẩm (App nhận 30% hoa hồng liên kết).
            </p>
            <div className="space-y-2">
              {[
                { name: "Basic Package (Chụp Studio)", price: "1.990.000đ", desc: "50 ảnh beauty chỉnh sửa chuyên sâu." },
                { name: "Premium Package (Lookbook/Runway)", price: "3.990.000đ", desc: "100 ảnh + 1 video catwalk 30s chuyên nghiệp." },
                { name: "Elite Package (Trọn Gói Concept)", price: "6.990.000đ", desc: "200 ảnh + 3 video + Makeup artist riêng trọn gói." }
              ].map((photo, pIdx) => (
                <div key={pIdx} className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-white/2 text-[10px] gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">{photo.name}</span>
                    <span className="text-[8px] text-slate-400 block">{photo.desc}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => addToast(`Đã đăng ký gói ${photo.name}. Studio liên kết sẽ liên hệ chọn ngày chụp với bạn!`, "success")}
                    className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-1 rounded hover:bg-purple-500 hover:text-white transition-all text-[8px] font-black uppercase tracking-wider cursor-pointer shrink-0"
                  >
                    {photo.price}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Optimization & Advisors */}
          <div className="space-y-4 flex flex-col justify-between">
            
            {/* Optimization */}
            <div className="rounded-xl border border-white/5 bg-slate-950 p-5 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="h-4.5 w-4.5 text-cyan-400" /> Tối Ưu Mô Tả Profile chuyên sâu
                </h4>
                <p className="text-[9.5px] text-slate-400 leading-normal font-medium">
                  Chuyên gia của OnstageVN viết phần giới thiệu, chọn lọc bộ ảnh portfolio chuẩn high-fashion, tư vấn thiết kế Rate Card cạnh tranh.
                </p>
              </div>
              <div className="flex items-center justify-between pt-3.5 border-t border-[#151b2d] mt-2">
                <span className="text-[11px] font-black text-cyan-400 font-mono">299.000đ/lần</span>
                <button 
                  type="button"
                  onClick={() => addToast("Đăng ký thành công Dịch vụ Tối ưu Mô tả. Chuyên gia sẽ liên hệ bạn sớm!", "success")}
                  className="bg-white text-slate-950 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-cyan-400 hover:text-slate-950 transition-all cursor-pointer"
                >
                  Đăng Ký
                </button>
              </div>
            </div>

            {/* Mentoring */}
            <div className="rounded-xl border border-white/5 bg-slate-950 p-5 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <PhoneCall className="h-4.5 w-4.5 text-amber-400" /> Tư Vấn Sự Nghiệp 1-1 (Priority Support)
                </h4>
                <p className="text-[9.5px] text-slate-400 leading-normal font-medium">
                  Hotline hỗ trợ riêng tư, kết nối và nhận 2 phiên tư vấn định hướng trực tiếp từ các cựu siêu mẫu kỳ cựu định kỳ hàng tháng.
                </p>
              </div>
              <div className="flex items-center justify-between pt-3.5 border-t border-[#151b2d] mt-2">
                <span className="text-[11px] font-black text-amber-400 font-mono">99.000đ/tháng</span>
                <button 
                  type="button"
                  onClick={() => addToast("Kích hoạt thành công Gói Tư Vấn Sự Nghiệp 1-1 Priority!", "success")}
                  className="bg-gradient-to-r from-amber-200 to-yellow-600 text-slate-950 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer"
                >
                  Kích Hoạt
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
