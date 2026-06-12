"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Star, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import SurveyForm from "./SurveyForm";
import ModelTiersGrid from "@/components/ui/ModelTiersGrid";

export default function SurveyPage() {
  const router = useRouter();
  const [isSurveyActive, setIsSurveyActive] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<any>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);

  useEffect(() => {
    let existingHistory = localStorage.getItem("vnp_talent_survey_history");
    let parsedHistory = [];
    if (existingHistory) {
      try {
        parsedHistory = JSON.parse(existingHistory);
      } catch (e) {
        console.error(e);
      }
    }
    
    if (!Array.isArray(parsedHistory)) {
      parsedHistory = [];
    }
    
    setHistoryList(parsedHistory);
  }, [isSurveyActive]);

  const handleStartSurvey = () => {
    setViewingEntry(null);
    setIsSurveyActive(true);
  };

  const handleViewHistoryDetail = (entry: any) => {
    setViewingEntry(entry);
    setIsSurveyActive(true);
  };

  return (
    <div className="flex min-h-[85vh] w-full flex-col items-stretch justify-start py-6 space-y-8">
      {!isSurveyActive && (
        <div className="mx-auto mb-2 flex max-w-3xl animate-in fade-in duration-500 flex-col items-center text-center">
          <h1 className="font-display text-3xl font-black text-white tracking-tight uppercase">
            Khám Phá <span className="text-gradient-gold">Bản Thân</span>
          </h1>
          <p className="text-[12px] text-slate-300 mt-3 leading-relaxed max-w-xl">
            Làm bài khảo sát của chúng tôi để xem thứ hạng người mẫu của bạn. Chúng tôi sẽ phân tích và đo lường độ phù hợp với các việc làm, sau đó đề xuất các cuộc thi sắc đẹp phù hợp với bạn.
          </p>
          
          {/* Outstanding Survey Call-To-Action Button */}
          <button
            type="button"
            onClick={handleStartSurvey}
            className="mt-6 px-10 py-4 bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 rounded-full font-display text-xs font-black text-[#070913] shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.45)] hover:scale-[1.04] active:scale-98 transition-all duration-300 cursor-pointer uppercase tracking-widest flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-[#070913] fill-[#070913]/25 animate-pulse" />
            Làm bài khảo sát
          </button>
        </div>
      )}

      {!isSurveyActive && <ModelTiersGrid />}

      {/* History Log list (Rendered only on Dashboard when survey is inactive) */}
      {!isSurveyActive && historyList.length > 0 && (
        <div className="w-full bg-[#070913]/95 p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -z-10 h-32 w-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="border-b border-white/5 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-black text-white uppercase tracking-tight">
                Lịch Sử Khảo Sát & Định Hướng
              </h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed text-left">
                Xem lại kết quả chẩn đoán năng lực sắc đẹp và lịch sử làm khảo sát của bạn.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push("/talent/portfolio")}
                className="h-9 px-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-[10px] font-bold text-slate-300 transition-all cursor-pointer"
              >
                Hồ Sơ Cá Nhân
              </button>
              <button
                type="button"
                onClick={handleStartSurvey}
                className="h-9 px-4 rounded-lg bg-gradient-to-r from-amber-200 to-amber-500 text-[10px] font-bold text-[#070913] hover:brightness-105 transition-all cursor-pointer"
              >
                Làm Khảo Sát Mới
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-black text-left">Các lượt khảo sát đã thực hiện</span>
            
            <div className="rounded-2xl border border-white/5 bg-[#03050c]/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Thời gian</th>
                      <th className="py-3 px-4">Định hướng cốt lõi</th>
                      <th className="py-3 px-4 text-center">Phân hạng (Tier)</th>
                      <th className="py-3 px-4 text-center">Tương thích</th>
                      <th className="py-3 px-4 text-center">Độ hoàn thiện</th>
                      <th className="py-3 px-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    {historyList.map((entry: any) => (
                      <tr key={entry.id} className="hover:bg-white/2 transition-colors group">
                        <td className="py-3.5 px-4 font-medium text-slate-300">{entry.date}</td>
                        <td className="py-3.5 px-4 text-slate-200">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            {entry.mainCategory}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider border",
                            entry.tier === "S" ? "bg-amber-400/10 text-amber-300 border-amber-400/30" :
                            entry.tier === "A" ? "bg-slate-300/10 text-slate-100 border-slate-300/30" :
                            entry.tier === "B" ? "bg-purple-500/10 text-purple-300 border-purple-500/30" :
                            entry.tier === "C" ? "bg-teal-500/10 text-teal-300 border-teal-500/30" :
                            "bg-rose-500/10 text-rose-300 border-rose-500/30"
                          )}>
                            {entry.tier === "Potential" ? "Potential" : `Tier ${entry.tier}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-[10px] text-slate-400">
                          P: <strong className="text-amber-400 font-bold">{entry.pageant}%</strong> | 
                          R: <strong className="text-purple-400 font-bold">{entry.runway}%</strong> | 
                          K: <strong className="text-teal-400 font-bold">{entry.kol}%</strong>
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-300 font-bold">{entry.profileScore}/100</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleViewHistoryDetail(entry)}
                            className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase cursor-pointer"
                          >
                            Xem Lại <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-amber-400/10 bg-amber-400/5 p-4 flex items-start gap-3">
            <Info className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-400 leading-relaxed text-left">
              <strong className="text-amber-300 font-bold">Lời khuyên từ AI:</strong> Định hướng nghề nghiệp của bạn có thể thay đổi dựa trên các số liệu nhân trắc hoặc mức độ phủ sóng truyền thông (Followers) cập nhật mới. Bạn nên làm lại bài khảo sát định kỳ 3 tháng một lần để cập nhật chẩn đoán chính xác nhất từ hệ thống.
            </div>
          </div>
        </div>
      )}

      {isSurveyActive && (
        <SurveyForm 
          initialHistoryEntry={viewingEntry} 
          onBackToDashboard={() => {
            setIsSurveyActive(false);
            setViewingEntry(null);
          }} 
        />
      )}
    </div>
  );
}
