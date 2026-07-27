"use client";

import { BarChart3, TrendingUp, Users, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      {/* Header */}
      <section className="flex flex-col gap-4 border-b border-[#2B313D] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md border border-[#C9A86A]/30 bg-[#C9A86A]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
              Báo cáo thông minh
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Hệ thống phân tích</span>
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl">
            BÁO CÁO & <span className="bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 bg-clip-text text-transparent">PHÂN TÍCH</span>
          </h1>
          <p className="mt-2 max-w-2xl text-xs font-semibold leading-relaxed text-slate-400 uppercase tracking-wide">
            Đo lường hiệu quả các chiến dịch tuyển dụng, theo dõi ROI và tối ưu hóa chi phí.
          </p>
        </div>
        <button
          onClick={() => router.push("/brand/search")}
          className="flex h-10 items-center justify-center rounded-xl border border-[#2B313D] bg-[#171A21] px-4 text-xs font-black text-slate-400 hover:text-white transition-all cursor-pointer uppercase tracking-wider"
        >
          <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
          Quay lại
        </button>
      </section>

      {/* KPI Row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Lượt xem chiến dịch", value: "860 lượt", hint: "+24% so với tháng trước", icon: BarChart3, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
          { label: "Tỷ lệ chuyển đổi", value: "10.2%", hint: "Mục tiêu: >10%", icon: TrendingUp, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
          { label: "Thời gian tuyển TB (Time to fill)", value: "5.2 ngày", hint: "Mục tiêu dưới 7 ngày", icon: Clock, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
          { label: "Chi phí mỗi lượt tuyển (Cost per hire)", value: "344,000đ", hint: "-15% tiết kiệm chi phí", icon: DollarSign, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" }
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{kpi.label}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{kpi.value}</div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">{kpi.hint}</p>
            </div>
          );
        })}
      </section>

      {/* Charts Grid */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sourcing Channels Chart */}
        <div className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-6 space-y-5">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A]">Nguồn ứng viên hiệu quả</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Phân tích các kênh tìm kiếm và chuyển đổi</p>
          </div>
          <div className="space-y-4">
            {[
              { label: "Chủ động tìm kiếm (Headhunting)", value: "55%", count: "135 ứng viên", color: "from-amber-400 to-[#C9A86A]" },
              { label: "KOL đề xuất từ hệ thống AI", value: "30%", count: "74 ứng viên", color: "from-cyan-400 to-blue-500" },
              { label: "Lời mời trực tiếp", value: "15%", count: "36 ứng viên", color: "from-emerald-400 to-teal-500" }
            ].map((channel, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-white">{channel.label}</span>
                  <span className="font-bold text-slate-400">{channel.count} ({channel.value})</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${channel.color}`} style={{ width: channel.value }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Tracking */}
        <div className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-6 space-y-5">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A]">Theo dõi ngân sách sử dụng</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Tổng chi tiêu thực tế so với hạn mức</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/5 bg-[#0F1115]/50 p-4 text-center">
              <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Ngân sách tổng</span>
              <span className="text-xl font-black text-white mt-1 block">100,000,000đ</span>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#0F1115]/50 p-4 text-center">
              <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Thực tế đã chi</span>
              <span className="text-xl font-black text-[#C9A86A] mt-1 block">35,500,000đ</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Đã chi: 35.5%</span>
              <span>Còn lại: 64.5% (64,500,000đ)</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-[#C9A86A]" style={{ width: "35.5%" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Top Campaigns Performance */}
      <section className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A] mb-5">Hiệu quả theo chiến dịch</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2B313D] text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <th className="pb-3">Chiến dịch</th>
                <th className="pb-3">Lượt xem</th>
                <th className="pb-3">Ứng viên</th>
                <th className="pb-3">Tỷ lệ chuyển đổi</th>
                <th className="pb-3 text-right">Chi phí ước tính</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: "Beauty Mega Live 06/2026", views: 420, applicants: 5, rate: "12.5%", cost: "8,500,000đ" },
                { name: "Lookbook Summer Fashion", views: 180, applicants: 3, rate: "8.9%", cost: "12,000,000đ" },
                { name: "PG Event Khai Trương", views: 260, applicants: 8, rate: "15.3%", cost: "15,000,000đ" }
              ].map((c, i) => (
                <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-3 font-extrabold text-white">{c.name}</td>
                  <td className="py-3 text-slate-300 font-mono">{c.views}</td>
                  <td className="py-3 text-slate-300 font-mono">{c.applicants}</td>
                  <td className="py-3 text-cyan-400 font-bold font-mono">{c.rate}</td>
                  <td className="py-3 text-right text-amber-300 font-mono font-bold">{c.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
