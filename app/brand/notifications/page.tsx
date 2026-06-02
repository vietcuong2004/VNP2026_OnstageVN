"use client";

import { Bell, MessageSquare, Briefcase, Calendar, CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      {/* Header */}
      <section className="flex flex-col gap-4 border-b border-[#2B313D] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md border border-[#C9A86A]/30 bg-[#C9A86A]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
              Hệ thống thông báo
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Thông báo</span>
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl">
            DANH SÁCH <span className="bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 bg-clip-text text-transparent">THÔNG BÁO</span>
          </h1>
          <p className="mt-2 max-w-2xl text-xs font-semibold leading-relaxed text-slate-400 uppercase tracking-wide">
            Cập nhật tức thời về tình trạng ứng tuyển, lời mời, tin nhắn từ KOL/Model và hạn chót chiến dịch.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.alert("Đã đánh dấu đọc tất cả thông báo.")}
            className="flex h-10 items-center justify-center rounded-xl bg-slate-900 border border-[#2B313D] px-4 text-xs font-black text-slate-300 hover:text-white transition-all cursor-pointer uppercase tracking-wider"
          >
            Đánh dấu đọc tất cả
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

      {/* Notifications List */}
      <section className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.28)] space-y-4">
        <div className="flex items-center justify-between border-b border-[#2B313D] pb-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#C9A86A]">Danh sách thông báo</span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Hiển thị 4 thông báo mới nhất</span>
        </div>

        <div className="space-y-4">
          {[
            {
              type: "applicant",
              title: "Có ứng viên mới ứng tuyển",
              desc: "Nguyễn Mai Anh đã ứng tuyển vào chiến dịch 'Beauty Mega Live 06/2026' với điểm phù hợp 98%.",
              time: "10 phút trước",
              unread: true,
              icon: Briefcase,
              color: "text-amber-400 border-amber-400/20 bg-amber-400/10"
            },
            {
              type: "message",
              title: "Tin nhắn mới từ talent",
              desc: "Lê Ngọc Hân gửi tin nhắn: 'Tôi đã nhận được lịch hẹn phỏng vấn ngày 17/06, xin cảm ơn...'.",
              time: "1 giờ trước",
              unread: true,
              icon: MessageSquare,
              color: "text-cyan-400 border-cyan-400/20 bg-cyan-400/10"
            },
            {
              type: "expiration",
              title: "Chiến dịch sắp hết hạn nhận hồ sơ",
              desc: "Chiến dịch 'Beauty Mega Live 06/2026' chỉ còn 3 ngày nữa là đến deadline ứng tuyển (05/06/2026).",
              time: "1 ngày trước",
              unread: false,
              icon: Calendar,
              color: "text-purple-400 border-purple-400/20 bg-purple-400/10"
            },
            {
              type: "feedback",
              title: "Talent phản hồi lời mời",
              desc: "Khánh Linh đã đồng ý lưu thông tin liên hệ và tham gia shortlist mặc định của L'Oréal Việt Nam.",
              time: "3 ngày trước",
              unread: false,
              icon: CheckCircle2,
              color: "text-emerald-400 border-emerald-400/20 bg-emerald-500/10"
            }
          ].map((notif, idx) => {
            const Icon = notif.icon;
            return (
              <div
                key={idx}
                className={`flex gap-4 p-4 rounded-xl border transition-all ${notif.unread ? "bg-white/[0.02] border-amber-500/25" : "bg-[#0F1115]/30 border-white/5"
                  }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${notif.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-xs font-black text-white">{notif.title}</h4>
                    <span className="text-[9px] text-slate-500 font-bold uppercase shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium mt-1">
                    {notif.desc}
                  </p>
                </div>
                {notif.unread && (
                  <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
