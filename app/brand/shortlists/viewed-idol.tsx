"use client";

import React from "react";
import { BookmarkCheck } from "lucide-react";
import TalentCard from "@/components/talents/TalentCard";
import TalentCardMobile from "@/components/talents/TalentCardMobile";

type ViewedIdolProps = {
  talents: any[];
  savedIds: string[];
  brandTalentIds: string[];
  addingBrandTalentIds: string[];
  onToggleSaved: (talentId: string) => void;
  onView: (talent: any) => void;
  onAddToBrand: (talentId: string) => void;
  onRemoveFromBrand: (talentId: string) => void;
};

export default function ViewedIdol({
  talents,
  savedIds,
  brandTalentIds,
  addingBrandTalentIds,
  onToggleSaved,
  onView,
  onAddToBrand,
  onRemoveFromBrand,
}: ViewedIdolProps) {
  if (talents.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-10 text-center">
        <BookmarkCheck className="mx-auto mb-3 h-8 w-8 text-slate-600" />
        <h3 className="text-sm font-black text-white">Chưa có idol nào đã xem</h3>
        <p className="mt-2 text-xs text-slate-500">Hãy mở hồ sơ idol từ màn Tìm kiếm Idol để lưu vào lịch sử đã xem.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {talents.map((talent) => {
        const talentId = String(talent.id);
        const isSaved = savedIds.includes(talentId);
        const isInBrand = brandTalentIds.includes(talentId);
        const isAddingToBrand = addingBrandTalentIds.includes(talentId);

        return (
          <React.Fragment key={talent.id}>
            <TalentCard
              talent={talent}
              status={talent.availabilityStatus ?? "maybe"}
              isSaved={isSaved}
              onToggleSaved={(item) => onToggleSaved(String(item.id))}
              onView={onView}
              onMessage={(item) => onAddToBrand(String(item.id))}
              onRemoveFromBrand={(item) => onRemoveFromBrand(String(item.id))}
              messageLabel={isInBrand ? "Đã thêm" : isAddingToBrand ? "Đang thêm" : "Thêm vào danh sách quản lý"}
              messageDisabled={isInBrand}
              messageLoading={isAddingToBrand}
              showMessageIcon
              className="hidden md:flex"
            />
            <TalentCardMobile
              talent={talent}
              status={talent.availabilityStatus ?? "maybe"}
              isSaved={isSaved}
              onToggleSaved={(item) => onToggleSaved(String(item.id))}
              onView={onView}
              onMessage={(item) => onAddToBrand(String(item.id))}
              onRemoveFromBrand={(item) => onRemoveFromBrand(String(item.id))}
              messageLabel={isInBrand ? "Đã thêm" : isAddingToBrand ? "Đang thêm" : "Thêm vào danh sách quản lý"}
              messageDisabled={isInBrand}
              messageLoading={isAddingToBrand}
              showMessageIcon
              className="flex md:hidden"
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}
