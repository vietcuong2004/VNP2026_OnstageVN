"use client";

import React from "react";
import { X } from "lucide-react";
import TalentCard from "@/components/TalentCard";

interface AddStaffModalProps {
  selectedCampaign: any;
  displayTalents: any[];
  onClose: () => void;
  onAddDirect: (talentId: string) => void;
  onPreviewTalent: (talent: any, applicantItem: any) => void;
}

const getTalentStatus = (id: string) => {
  if (id === "tal-1" || id === "tal-2") return "available";
  if (id === "tal-3") return "busy";
  return "maybe";
};

export default function AddStaffModal({
  selectedCampaign,
  displayTalents,
  onClose,
  onAddDirect,
  onPreviewTalent,
}: AddStaffModalProps) {
  const applicantIds = selectedCampaign.applicants.map((a: any) => a.talentId);
  const availableTalents = displayTalents.filter((t: any) => !applicantIds.includes(t.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#151b2d] bg-slate-950/45">
          <div className="text-left">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Thêm Nhân Sự Vào Chiến Dịch</h3>
            <p className="text-[10px] text-slate-500 mt-1">Chọn từ danh sách các Talent xuất sắc để đề xuất hoặc thêm trực tiếp</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable grid of talent cards */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-4">
          {availableTalents.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-xs text-slate-500 italic">Tất cả talent đã được thêm vào chiến dịch này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTalents.map((talent) => {
                const status = getTalentStatus(talent.id);

                return (
                  <TalentCard
                    key={talent.id}
                    talent={talent}
                    status={status}
                    viewLabel="Xem hồ sơ"
                    messageLabel="Thêm vào Jobs"
                    showMessageIcon={false}
                    showLifestyleServices
                    showSocialStats
                    onView={(item) => {
                      onPreviewTalent(item, { talentId: item.id, stage: "new", note: "Được đề xuất thêm từ hệ thống." });
                    }}
                    onMessage={(item) => {
                      onAddDirect(item.id);
                    }}
                    className="text-left"
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
