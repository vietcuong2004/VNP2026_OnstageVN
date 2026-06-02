"use client";

import { Users, UserPlus, Shield, Activity, Clock, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TeamPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      {/* Header */}
      <section className="flex flex-col gap-4 border-b border-[#2B313D] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md border border-[#C9A86A]/30 bg-[#C9A86A]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
              Cộng tác viên & Nhân sự
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Quản lý thành viên</span>
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl">
            THÀNH VIÊN & <span className="bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 bg-clip-text text-transparent">QUYỀN HẠN</span>
          </h1>
          <p className="mt-2 max-w-2xl text-xs font-semibold leading-relaxed text-slate-400 uppercase tracking-wide">
            Phân quyền quản trị cho các hiring manager, chia sẻ wishlist và theo dõi lịch sử hoạt động.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.alert("Tính năng mời thành viên sẽ được cập nhật trong Phase 2.")}
            className="flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 px-4 text-xs font-black text-slate-950 shadow-md hover:brightness-105 transition-all cursor-pointer uppercase tracking-wider"
          >
            <UserPlus className="mr-2 h-4 w-4 shrink-0" />
            Mời thành viên
          </button>
          <button
            onClick={() => router.push("/brand/dashboard")}
            className="flex h-10 items-center justify-center rounded-xl border border-[#2B313D] bg-[#171A21] px-4 text-xs font-black text-slate-400 hover:text-white transition-all cursor-pointer uppercase tracking-wider"
          >
            <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
            Quay lại
          </button>
        </div>
      </section>

      {/* Main Layout Grid */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Members List - Left (8/12) */}
        <div className="lg:col-span-8 rounded-2xl border border-[#2B313D] bg-[#171A21] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.28)] space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A]">Danh sách thành viên</h3>
            <span className="text-[9px] font-bold text-slate-500 uppercase">3 thành viên</span>
          </div>

          <div className="divide-y divide-white/5">
            {[
              { name: "Nguyễn Văn Hùng", email: "contact@loreal-vietnam.com", role: "Admin", active: "Đang hoạt động", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80" },
              { name: "Lê Thị Thu Hương", email: "huong.le@loreal-vietnam.com", role: "Hiring Manager", active: "Hoạt động 10 phút trước", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80" },
              { name: "Trần Minh Đức", email: "duc.tran@loreal-vietnam.com", role: "Viewer", active: "Hoạt động 2 ngày trước", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" }
            ].map((member, i) => (
              <div key={i} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-xl object-cover border border-white/5" />
                  <div>
                    <h4 className="text-xs font-black text-white">{member.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
                      <Shield className="h-3 w-3" /> {member.role}
                    </span>
                    <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{member.active}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log - Right (4/12) */}
        <div className="lg:col-span-4 rounded-2xl border border-[#2B313D] bg-[#171A21] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.28)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#C9A86A]" />
              <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A]">Nhật ký hoạt động</h3>
            </div>
            
            <div className="space-y-4 relative border-l border-white/5 ml-2 pl-4">
              {[
                { time: "10 phút trước", user: "Hương Lê", action: "Đã chuyển Nguyễn Mai Anh sang stage 'Phỏng vấn'" },
                { time: "2 giờ trước", user: "Hùng Nguyễn", action: "Đã tạo chiến dịch 'Lookbook Summer Fashion'" },
                { time: "Hôm qua", user: "Hương Lê", action: "Đã thêm 3 talent vào wishlist 'Summer 2026'" }
              ].map((log, i) => (
                <div key={i} className="relative space-y-1">
                  <span className="absolute -left-[21px] top-1 flex h-2.5 w-2.5 rounded-full bg-[#171A21] border border-amber-400" />
                  <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase">
                    <Clock className="h-3 w-3" />
                    <span>{log.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium">
                    <strong className="text-white">{log.user}:</strong> {log.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <button className="w-full text-center py-2 text-[9px] font-black uppercase tracking-wider border border-white/5 bg-slate-950/20 rounded-xl hover:bg-white/5 text-slate-400 mt-6 cursor-pointer">
            Xem toàn bộ nhật ký
          </button>
        </div>
      </section>
    </div>
  );
}
