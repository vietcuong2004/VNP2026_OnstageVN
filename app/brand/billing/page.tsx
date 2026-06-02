"use client";

import { CreditCard, Wallet, Calendar, ShieldCheck, Check, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      {/* Header */}
      <section className="flex flex-col gap-4 border-b border-[#2B313D] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md border border-[#C9A86A]/30 bg-[#C9A86A]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
              Gói dịch vụ & Hóa đơn
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Thanh toán</span>
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl">
            THANH TOÁN & <span className="bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 bg-clip-text text-transparent">GÓI CƯỚC</span>
          </h1>
          <p className="mt-2 max-w-2xl text-xs font-semibold leading-relaxed text-slate-400 uppercase tracking-wide">
            Quản lý gói thành viên doanh nghiệp, xem hạn mức sử dụng và lịch sử giao dịch.
          </p>
        </div>
        <button
          onClick={() => router.push("/brand/dashboard")}
          className="flex h-10 items-center justify-center rounded-xl border border-[#2B313D] bg-[#171A21] px-4 text-xs font-black text-slate-400 hover:text-white transition-all cursor-pointer uppercase tracking-wider"
        >
          <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
          Quay lại
        </button>
      </section>

      {/* Subscription Info & Usage */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Current Plan - Left (7/12) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#2B313D] bg-[#171A21] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.28)] flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gói dịch vụ hiện tại</span>
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
                <ShieldCheck className="h-3.5 w-3.5" /> Gói Gold
              </span>
            </div>
            
            <div>
              <h3 className="text-2xl font-black text-[#C9A86A]">2,499,000đ <span className="text-xs text-slate-500 font-bold uppercase">/ Tháng</span></h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Chu kỳ tiếp theo: 25/06/2026 (Tự động gia hạn)</p>
            </div>

            <div className="space-y-2 border-t border-white/5 pt-4">
              <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Quyền lợi gói Gold</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  "Mở khóa 100 thông tin liên hệ/tháng",
                  "Không giới hạn số chiến dịch tạo",
                  "Mở khóa tính năng so sánh Talent",
                  "Phân quyền quản trị cho 5 thành viên"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6 border-t border-white/5 pt-4">
            <button onClick={() => window.alert("Tính năng nâng cấp gói sẽ mở ở Phase 2.")} className="flex-1 text-center py-2.5 text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 rounded-xl text-slate-950 shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer">
              Nâng cấp gói Diamond
            </button>
            <button onClick={() => window.alert("Tính năng hủy gia hạn sẽ mở ở Phase 2.")} className="px-4 text-center py-2.5 text-[9px] font-black uppercase tracking-wider border border-white/5 bg-slate-950/20 rounded-xl hover:bg-white/5 text-slate-400 cursor-pointer">
              Hủy gia hạn
            </button>
          </div>
        </div>

        {/* Usage statistics - Right (5/12) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#2B313D] bg-[#171A21] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.28)] space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A]">Hạn mức sử dụng trong tháng</h3>
          
          <div className="space-y-4">
            {[
              { label: "Mở khóa thông tin liên hệ", used: 35, limit: 100, unit: "lượt", color: "from-amber-400 to-[#C9A86A]" },
              { label: "Số chiến dịch hoạt động", used: 3, limit: 10, unit: "campaign", color: "from-cyan-400 to-blue-500" },
              { label: "Thành viên workspace", used: 3, limit: 5, unit: "người", color: "from-purple-400 to-pink-500" }
            ].map((usage, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-end text-xs font-bold">
                  <span className="text-slate-400">{usage.label}</span>
                  <span className="text-white font-mono">{usage.used} / {usage.limit} {usage.unit}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${usage.color}`} style={{ width: `${(usage.used / usage.limit) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Invoice History */}
      <section className="rounded-2xl border border-[#2B313D] bg-[#171A21] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A86A] mb-5">Lịch sử thanh toán</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2B313D] text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <th className="pb-3">Mã hóa đơn</th>
                <th className="pb-3">Ngày thanh toán</th>
                <th className="pb-3">Gói cước</th>
                <th className="pb-3 text-center">Hình thức</th>
                <th className="pb-3 text-right">Giá trị</th>
                <th className="pb-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { id: "INV-2026-005", date: "25/05/2026", plan: "Gói Gold (Tháng 5)", method: "Credit Card", amount: "2,499,000đ", status: "Thành công" },
                { id: "INV-2026-004", date: "25/04/2026", plan: "Gói Gold (Tháng 4)", method: "Credit Card", amount: "2,499,000đ", status: "Thành công" },
                { id: "INV-2026-003", date: "25/03/2026", plan: "Gói Gold (Tháng 3)", method: "Credit Card", amount: "2,499,000đ", status: "Thành công" }
              ].map((inv, i) => (
                <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-3 font-extrabold text-white font-mono">{inv.id}</td>
                  <td className="py-3 text-slate-400 font-mono font-medium">{inv.date}</td>
                  <td className="py-3 text-slate-300 font-medium">{inv.plan}</td>
                  <td className="py-3 text-center text-slate-400 font-medium">{inv.method}</td>
                  <td className="py-3 text-right text-amber-300 font-mono font-bold">{inv.amount}</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-black text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
