"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import TalentCard from "@/components/TalentCard";
import TalentCardMobile from "@/components/TalentCardMobile";
import { loadBrandTalentsPage } from "@/lib/brand-api";

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

function getTalentTypesText(talent: any) {
  if (Array.isArray(talent?.talentTypes)) return talent.talentTypes.join(" ");
  if (Array.isArray(talent?.talent_types)) return talent.talent_types.join(" ");
  return talent?.type || "";
}

export default function AddStaffModal({
  selectedCampaign,
  displayTalents,
  onClose,
  onAddDirect,
  onPreviewTalent,
}: AddStaffModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loadedTalents, setLoadedTalents] = useState<any[]>(displayTalents);
  const [talentPage, setTalentPage] = useState(1);
  const [hasMoreTalents, setHasMoreTalents] = useState(true);
  const [isLoadingTalents, setIsLoadingTalents] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);
  const applicantIds = selectedCampaign.applicants.map((a: any) => a.talentId);
  const applicantIdSet = useMemo(() => new Set(applicantIds.map(String)), [applicantIds]);
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase("vi-VN");
  const searchKeyword = searchQuery.trim();

  const loadTalents = useCallback(async (page: number, mode: "replace" | "append") => {
    const requestId = ++requestRef.current;
    setIsLoadingTalents(true);

    try {
      const response = await loadBrandTalentsPage({
        page,
        perPage: 24,
        sort: "match",
        q: searchKeyword || undefined,
      });
      if (requestId !== requestRef.current) return;

      setLoadedTalents((current) => {
        if (mode === "replace") return response.data;

        const seen = new Set(current.map((talent: any) => String(talent.id)));
        const nextItems = response.data.filter((talent: any) => !seen.has(String(talent.id)));
        return [...current, ...nextItems];
      });
      setTalentPage(response.meta.current_page || page);
      setHasMoreTalents(Boolean(response.meta.has_more) && (response.meta.current_page || page) < (response.meta.last_page || page));
    } catch (error) {
      console.warn("Cannot load campaign talent candidates", error);
      if (mode === "replace") setLoadedTalents(displayTalents);
      setHasMoreTalents(false);
    } finally {
      if (requestId === requestRef.current) setIsLoadingTalents(false);
    }
  }, [displayTalents, searchKeyword]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadTalents(1, "replace");
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [loadTalents]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMoreTalents || isLoadingTalents) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        void loadTalents(talentPage + 1, "append");
      }
    }, { rootMargin: "260px 0px", threshold: 0 });

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreTalents, isLoadingTalents, loadTalents, talentPage]);

  const availableTalents = useMemo(
    () => loadedTalents.filter((talent: any) => !applicantIdSet.has(String(talent.id))),
    [applicantIdSet, loadedTalents]
  );

  const filteredTalents = useMemo(() => {
    if (!normalizedSearch) return availableTalents;

    return availableTalents.filter((talent: any) => {
      const searchableText = [
        talent?.name,
        talent?.fullName,
        talent?.display_name,
        talent?.city,
        talent?.district,
        getTalentTypesText(talent),
      ].filter(Boolean).join(" ").toLocaleLowerCase("vi-VN");

      return searchableText.includes(normalizedSearch);
    });
  }, [availableTalents, normalizedSearch]);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300 sm:items-center sm:p-4">
      <div className="relative flex h-full w-full flex-col overflow-hidden border-[#151b2d] bg-[#08090f] shadow-[0_24px_60px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 sm:h-auto sm:max-h-[85vh] sm:max-w-6xl sm:rounded-3xl sm:border">
        <div className="space-y-4 border-b border-[#151b2d] bg-slate-950/45 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="text-left">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Thêm nhân sự vào chiến dịch</h3>
              <p className="mt-1 text-[10px] text-slate-500">Chọn Talent từ danh sách để thêm trực tiếp vào chiến dịch.</p>
            </div>
            <button onClick={onClose} className="cursor-pointer text-slate-400 hover:text-white" aria-label="Đóng">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A86A]" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm tên Talent..."
              className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/80 pl-10 pr-10 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-[#C9A86A]/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-500 transition hover:text-white"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin sm:p-6">
          {availableTalents.length === 0 && !isLoadingTalents ? (
            <div className="space-y-2 py-12 text-center">
              <p className="text-xs italic text-slate-500">Tất cả Talent đã được thêm vào chiến dịch này.</p>
            </div>
          ) : filteredTalents.length === 0 && !isLoadingTalents ? (
            <div className="space-y-2 py-12 text-center">
              <p className="text-xs italic text-slate-500">Không tìm thấy Talent phù hợp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTalents.map((talent) => (
                <React.Fragment key={talent.id}>
                  <TalentCard
                    talent={talent}
                    status={getTalentStatus(talent.id)}
                    viewLabel="Xem hồ sơ"
                    messageLabel="Thêm vào Jobs"
                    showMessageIcon={false}
                    showLifestyleServices
                    onView={(item) => {
                      onPreviewTalent(item, { talentId: item.id, stage: "new", note: "Được đề xuất thêm từ hệ thống." });
                    }}
                    onMessage={(item) => {
                      onAddDirect(item.id);
                    }}
                    className="text-left hidden md:flex"
                  />
                  <TalentCardMobile
                    talent={talent}
                    status={getTalentStatus(talent.id)}
                    viewLabel="Xem hồ sơ"
                    messageLabel="Thêm vào Jobs"
                    showMessageIcon={false}
                    showLifestyleServices
                    onView={(item) => {
                      onPreviewTalent(item, { talentId: item.id, stage: "new", note: "Được đề xuất thêm từ hệ thống." });
                    }}
                    onMessage={(item) => {
                      onAddDirect(item.id);
                    }}
                    className="text-left flex md:hidden"
                  />
                </React.Fragment>
              ))}
            </div>
          )}

          <div ref={loadMoreRef} className="flex min-h-14 items-center justify-center pt-4">
            {isLoadingTalents ? (
              <span className="rounded-full border border-[#C9A86A]/20 bg-[#C9A86A]/10 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[#C9A86A]">
                Đang tải Talent...
              </span>
            ) : hasMoreTalents ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Kéo xuống để tải thêm</span>
            ) : filteredTalents.length > 0 ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Đã tải hết danh sách</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
