"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/footer";
import {
  BarChart3,
  BriefcaseBusiness,
  ChevronRight,
  Clock3,
  Heart,
  Info,
  Link2,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SurveyForm from "./SurveyForm";
import { loadTalentSurveyHistory, type TalentSurveyHistoryEntry } from "@/lib/talent-api";

export default function SurveyPage() {
  const router = useRouter();
  const [isSurveyActive, setIsSurveyActive] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<TalentSurveyHistoryEntry | null>(null);
  const [historyList, setHistoryList] = useState<TalentSurveyHistoryEntry[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!isSurveyActive) {
      loadTalentSurveyHistory().then((items) => {
        if (!cancelled) {
          setHistoryList(items);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [isSurveyActive]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isFormMode = new URLSearchParams(window.location.search).get("form") === "1";
    if (isFormMode) {
      setIsSurveyActive(true);
    }

    const token = localStorage.getItem("onstagevn_auth_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const setSurveyFormMode = (enabled: boolean) => {
    if (typeof window === "undefined") return;
    window.history.replaceState(null, "", enabled ? "/talent/survey?form=1" : "/talent/survey");
    window.dispatchEvent(new Event("onstage:survey-form-mode"));
  };

  const handleStartSurvey = () => {
    setViewingEntry(null);
    setIsSurveyActive(true);
    setSurveyFormMode(true);
  };

  const handleViewHistoryDetail = (entry: TalentSurveyHistoryEntry) => {
    setViewingEntry(entry);
    setIsSurveyActive(true);
    setSurveyFormMode(true);
  };

  const handleBackToSurveyHome = () => {
    setIsSurveyActive(false);
    setViewingEntry(null);
    setSurveyFormMode(false);
  };

  const intakeCards = [
    {
      number: "01",
      icon: User,
      title: "Thông tin cơ bản",
      items: [
        "Họ tên, email liên hệ, ảnh đại diện",
        "Giới tính, khu vực sinh sống",
        "Các chỉ số ngoại hình",
      ],
    },
    {
      number: "02",
      icon: BriefcaseBusiness,
      title: "Nghề nghiệp",
      items: [
        "Phí booking và loại hình Idol",
        "Lĩnh vực nội dung / kỹ năng chuyên sâu",
        "Số năm kinh nghiệm và mô tả kinh nghiệm",
      ],
    },
    {
      number: "03",
      icon: Link2,
      title: "Portfolio & mạng xã hội",
      items: [
        "Link portfolio của bạn",
        "Chỉ số nổi bật như followers, viewers, likes",
        "Facebook, TikTok, Instagram, LinkedIn",
      ],
    },
  ];

  const resultItems = [
    { icon: User, label: "Hồ sơ Idol chuyên nghiệp" },
    { icon: Heart, label: "Sẵn sàng nhận lời mời booking" },
    { icon: Search, label: "Xuất hiện trong kết quả tìm kiếm Idol" },
  ];

  return (
    <div
      className={cn(
        "flex min-h-dvh w-full max-w-full flex-col items-stretch justify-start overflow-x-hidden",
        isSurveyActive
          ? "py-0 md:min-h-[85vh] md:py-6"
          : "space-y-6 px-4 pb-8 pt-8 md:min-h-[85vh] md:space-y-8 md:px-0 md:py-6",
      )}
    >
      {!isSurveyActive && (
        <div className="relative mx-auto flex w-full max-w-[1440px] animate-in flex-col gap-6 overflow-hidden fade-in duration-500">
          {/* Welcome Intro Section */}
          <section className="relative flex min-h-[260px] overflow-hidden rounded-[28px] border border-white/5 bg-[radial-gradient(circle_at_18%_18%,rgba(7,27,66,0.65),transparent_34%),radial-gradient(circle_at_74%_20%,rgba(212,166,74,0.12),transparent_30%),linear-gradient(135deg,#02040a,#071124_48%,#02040a)] px-5 py-8 md:min-h-[300px] md:px-12 md:py-10">
            <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:72px_72px]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D4A64A]/25 shadow-[0_0_70px_rgba(212,166,74,0.16)] md:h-60 md:w-60" />
            {["left-10 top-10", "right-12 top-16", "left-[18%] bottom-12", "right-[20%] bottom-16"].map((pos) => (
              <Sparkles key={pos} className={cn("absolute h-4 w-4 text-[#F0C56B]/80", pos)} />
            ))}

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center text-center">
              <h1 className="font-display text-[clamp(1.75rem,8.6vw,2.7rem)] font-black uppercase leading-[0.98] tracking-tight text-white md:whitespace-nowrap md:text-[clamp(2.25rem,3.9vw,3.75rem)]">
                Đăng ký hồ sơ <span className="block text-gradient-gold md:inline">Idol</span>
              </h1>
              <p className="mt-4 max-w-3xl text-balance text-sm leading-relaxed text-slate-200 md:text-base">
                Chỉ cần vài phút để làm khảo sát cung cấp thông tin cơ bản, chúng tôi sẽ tạo hồ sơ cho bạn.
                <br className="hidden md:block" />
                Hồ sơ càng đầy đủ, thương hiệu càng dễ tìm thấy và mời hợp tác.
              </p>

              <div className="mt-5 flex flex-col items-center justify-center gap-2.5 text-center text-xs font-semibold text-slate-200 sm:flex-row md:text-sm">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-[#F0C56B]" />
                  Mất khoảng 3 phút
                </span>
                <span className="hidden h-5 w-px bg-white/20 sm:block" />
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#F0C56B]" />
                  Thông tin của bạn được bảo mật
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartSurvey}
                className="mt-5 flex w-full max-w-[20rem] cursor-pointer items-center justify-center gap-3 rounded-full bg-gradient-gold px-6 py-4 font-display text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_0_28px_rgba(240,197,107,0.24)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_38px_rgba(240,197,107,0.38)] active:scale-98 sm:w-auto sm:max-w-[24rem] sm:px-14 sm:text-sm"
              >
                Bắt đầu đăng ký
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </section>

          {/* Intake Info Cards */}
          <section className="relative overflow-hidden rounded-[28px] border border-white/5 bg-[#02040a]/80 p-5 shadow-2xl shadow-black/30 md:p-8">
            <div className="absolute inset-x-10 top-11 hidden h-px bg-gradient-to-r from-transparent via-[#D4A64A]/40 to-transparent md:block" />
            <h2 className="relative z-10 font-display text-lg font-black text-white md:text-2xl">
              Bạn sẽ cung cấp những thông tin sau
              <span className="ml-2 text-[#F0C56B]">•</span>
            </h2>

            <div className="relative z-10 mt-7 grid grid-cols-1 gap-5 md:grid-cols-3">
              {intakeCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article key={card.number} className="relative min-h-[250px] rounded-2xl border border-white/5 bg-[#071B42]/35 p-6 text-[#F0C56B] shadow-xl shadow-black/25 transition-all duration-300 hover:border-[#D4A64A]/25 hover:bg-[#0B245C]/40">
                    <span className="absolute left-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D4A64A]/20 bg-[#D4A64A]/10 font-display text-sm font-black text-white">
                      {card.number}
                    </span>
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#D4A64A]/25 bg-[#D4A64A]/10 shadow-[0_0_28px_rgba(212,166,74,0.2)]">
                      <Icon className="h-11 w-11" />
                    </div>
                    <h3 className="mt-5 text-center font-display text-xl font-black text-white">
                      {card.title}
                    </h3>
                    <ul className="mt-5 space-y-2 text-sm leading-relaxed text-slate-200">
                      {card.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F0C56B]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>

            <div className="relative z-10 mt-7 overflow-hidden rounded-2xl border border-[#D4A64A]/20 bg-[#071B42]/25 p-5 md:flex md:items-center md:justify-between md:px-7">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#D4A64A]/30 bg-[#D4A64A]/10 text-[#F0C56B]">
                  <Info className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-base font-semibold leading-relaxed text-slate-100 md:text-xl">
                    Hồ sơ càng đầy đủ thì càng <span className="text-[#F0C56B]">dễ được thương hiệu tìm thấy và mời hợp tác.</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400 md:text-base">
                    Bạn có thể cập nhật và chỉnh sửa thông tin bất kỳ lúc nào.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Info Card */}
          <section className="relative overflow-hidden rounded-[28px] border border-white/5 bg-[#02040a]/80 p-6 md:p-10 shadow-2xl shadow-black/30">
            <div className="pointer-events-none absolute right-0 top-0 -z-10 h-64 w-64 rounded-full bg-[#D4A64A]/5 blur-3xl opacity-50" />
            <div className="pointer-events-none absolute left-0 bottom-0 -z-10 h-64 w-64 rounded-full bg-[#071B42]/40 blur-3xl opacity-50" />

            <h2 className="font-display text-lg font-black uppercase tracking-wider text-white md:text-2xl text-center mb-8">
              Sau khi hoàn tất, bạn sẽ nhận được
              <span className="ml-1.5 text-[#F0C56B]">•</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {resultItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="group relative flex flex-row items-center gap-4 p-5 rounded-2xl border border-white/5 bg-[#071B42]/20 hover:bg-[#0B245C]/35 hover:border-[#D4A64A]/25 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(212,166,74,0.05)] cursor-default"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-[#F0C56B] to-transparent group-hover:w-1/2 transition-all duration-500 rounded-full" />
                    
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D4A64A]/20 bg-[#D4A64A]/10 text-[#F0C56B] group-hover:scale-105 group-hover:bg-[#D4A64A]/15 transition-all duration-305 shadow-md">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-sm font-semibold leading-snug text-slate-200 md:text-base group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Register Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleStartSurvey}
                className="flex w-full max-w-[20rem] cursor-pointer items-center justify-center gap-3 rounded-full bg-gradient-gold px-6 py-4 font-display text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_0_28px_rgba(240,197,107,0.24)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_38px_rgba(240,197,107,0.38)] active:scale-98 sm:w-auto sm:max-w-[24rem] sm:px-14 sm:text-sm"
              >
                Đăng ký ngay
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </section>

          {/* History list section rendered conditionally inside the same container */}
          {historyList.length > 0 && (
            <div className="relative w-full overflow-hidden rounded-3xl border border-white/5 bg-[#02040a]/95 p-6 shadow-2xl transition-all duration-500 md:p-8">
              <div className="pointer-events-none absolute right-0 top-0 -z-10 h-32 w-32 rounded-full bg-[#D4A64A]/5 blur-2xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-32 w-32 rounded-full bg-[#071B42]/30 blur-2xl" />

              <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/5 pb-4 md:flex-row md:items-center">
                <div>
                  <h2 className="font-display text-xl font-black uppercase tracking-tight text-white">
                    Lịch sử hoàn thiện hồ sơ
                  </h2>
                  <p className="mt-1 text-left text-xs leading-relaxed text-slate-400 md:text-[13px]">
                    Xem lại các lần bạn đã tạo hoặc cập nhật hồ sơ Idol trên OnstageVN.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => router.push("/talent/profile")}
                    className="h-9 cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 text-[11px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white md:text-xs"
                  >
                    Hồ Sơ Cá Nhân
                  </button>
                  <button
                    type="button"
                    onClick={handleStartSurvey}
                    className="h-9 cursor-pointer rounded-lg bg-gradient-gold px-4 text-[11px] font-bold text-slate-950 transition-all hover:brightness-105 md:text-xs"
                  >
                    Cập Nhật Hồ Sơ
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <span className="block text-left text-[11px] font-black uppercase tracking-widest text-slate-500 md:text-xs">Các lượt cập nhật đã thực hiện</span>

                <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#03050c]/60">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/2 text-[10px] font-bold uppercase tracking-wider text-slate-400 md:text-[11px]">
                          <th className="px-4 py-3">Thời gian</th>
                          <th className="px-4 py-3">Nội dung cập nhật</th>
                          <th className="px-4 py-3 text-center">Độ hoàn thiện</th>
                          <th className="px-4 py-3 text-right">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs md:text-[13px]">
                        {historyList.map((entry) => (
                          <tr key={entry.id} className="group transition-colors hover:bg-white/2">
                            <td className="px-4 py-3.5 font-medium text-slate-300">{entry.date}</td>
                            <td className="px-4 py-3.5 text-slate-200">
                              <span className="flex items-center gap-1.5 font-bold">
                                <Star className="h-3 w-3 fill-[#F0C56B] text-[#F0C56B]" />
                                Hồ sơ Idol ban đầu
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center font-bold text-slate-300">{entry.profileScore}/100</td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleViewHistoryDetail(entry)}
                                className="inline-flex cursor-pointer items-center gap-1 text-[10px] font-bold uppercase text-[#F0C56B] transition-colors hover:text-white md:text-[11px]"
                              >
                                Xem lại <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#D4A64A]/10 bg-[#D4A64A]/5 p-4">
                <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#F0C56B]" />
                <div className="text-left text-[11px] leading-relaxed text-slate-400 md:text-xs">
                  <strong className="font-bold text-[#F0C56B]">Gợi ý:</strong> Hồ sơ có ảnh rõ ràng, portfolio đầy đủ và thông tin liên hệ chính xác sẽ giúp đối tác đánh giá nhanh hơn khi tìm kiếm Idol phù hợp.
                </div>
              </div>
            </div>
          )}

          {!isLoggedIn && <Footer />}
        </div>
      )}

      {isSurveyActive && (
        <SurveyForm
          initialHistoryEntry={viewingEntry}
          onBackToDashboard={handleBackToSurveyHome}
        />
      )}
    </div>
  );
}
