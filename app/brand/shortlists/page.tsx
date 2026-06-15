"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkCheck, Briefcase, FileText, HeartOff, Plus, Send, Eye } from "lucide-react";
import { campaigns, savedTalentIds, talents } from "@/lib/brand-mvp-data";
import { addTalentToBrandCampaign, createBrandContactRequest, loadBrandCampaigns, loadBrandTalents, loadBrandWishlists, removeTalentFromWishlist } from "@/lib/brand-api";
import { cn } from "@/lib/utils";

function selectExistingCampaignId(current: string, items: typeof campaigns) {
  if (items.some((campaign) => campaign.id === current)) return current;
  return items[0]?.id || "";
}

export default function BrandShortlistsPage() {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState(savedTalentIds);
  const [talentList, setTalentList] = useState(talents);
  const [localCampaigns, setLocalCampaigns] = useState(campaigns);
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id ?? "");
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishlistItemIds, setWishlistItemIds] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({
    "tal-1": "Phù hợp campaign beauty, ưu tiên mời lịch livestream.",
    "tal-2": "Giữ cho lookbook thời trang.",
  });
  const [requestedIds, setRequestedIds] = useState<string[]>([]);

  useEffect(() => {
    loadBrandTalents(talents).then(async (items) => {
      setTalentList(items);
      const wishlists = await loadBrandWishlists(items);
      const primaryWishlist = wishlists[0];

      if (primaryWishlist) {
        setWishlistId(primaryWishlist.id);
        setSavedIds(primaryWishlist.savedIds);
        setNotes((current) => ({ ...current, ...primaryWishlist.notes }));
        setWishlistItemIds(
          primaryWishlist.items.reduce((acc: Record<string, string>, item) => {
            const profileId = String(item.profile_id || item.profile?.id || "");
            if (profileId) acc[profileId] = String(item.id);
            return acc;
          }, {})
        );
      } else {
        const hasSavedTalent = items.some((talent) => savedTalentIds.includes(talent.id));
        if (!hasSavedTalent) {
          setSavedIds(items.slice(0, 3).map((talent) => talent.id));
        }
      }
    });

    loadBrandCampaigns(campaigns).then((items) => {
      setLocalCampaigns(items);
      setSelectedCampaignId((current) => selectExistingCampaignId(current, items));
    });
  }, []);

  const savedTalents = useMemo(() => talentList.filter((talent) => savedIds.includes(talent.id)), [savedIds, talentList]);
  const selectedCampaign = localCampaigns.find((campaign) => campaign.id === selectedCampaignId);

  async function removeTalent(id: string) {
    const itemId = wishlistItemIds[id];
    if (wishlistId && itemId) {
      try {
        await removeTalentFromWishlist(wishlistId, itemId);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Chưa thể xóa talent khỏi danh sách lưu.");
        return;
      }
    }

    setSavedIds((current) => current.filter((item) => item !== id));
    setWishlistItemIds((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  async function addTalentToCampaign(talentId: string) {
    if (!selectedCampaignId) return;
    try {
      await addTalentToBrandCampaign(selectedCampaignId, talentId, notes[talentId]);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Chưa thể thêm talent vào campaign. Vui lòng thử lại.");
      return;
    }
    setLocalCampaigns((current) => {
      const next = current.map((c) => {
        if (c.id === selectedCampaignId) {
          if (!c.shortlistedTalentIds.includes(talentId)) {
            return {
              ...c,
              shortlistedTalentIds: [...c.shortlistedTalentIds, talentId],
            };
          }
        }
        return c;
      });
      return next;
    });
  }

  async function sendRequest(id: string) {
    try {
      await createBrandContactRequest(id, selectedCampaignId, notes[id]);
      setRequestedIds((current) => current.includes(id) ? current : [...current, id]);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Chưa thể gửi yêu cầu liên hệ. Vui lòng thử lại.");
    }
  }

  return (
    <div className="space-y-6 pb-16">
      <section className="flex flex-col gap-4 border-b border-white/5 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
              DANH SÁCH ĐÃ LƯU
            </span>
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight text-white">
            DANH SÁCH  <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent">NGƯỜI MẪU YÊU THÍCH</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Quản lý danh sách talent đã lưu, thêm ghi chú và thêm vào campaign đang mở.
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/30 px-4 py-3">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Danh sách yêu thích</span>
          <span className="text-lg font-black text-white">{savedTalents.length} talent</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="h-fit rounded-2xl border border-white/5 bg-slate-950/25 p-5 lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-amber-300" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-300">Thêm vào campaign</h2>
          </div>

          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Campaign mục tiêu</span>
            <select
              value={selectedCampaignId}
              onChange={(event) => setSelectedCampaignId(event.target.value)}
              className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60"
            >
              {localCampaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
              ))}
            </select>
          </label>

          {selectedCampaign && (
            <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-white truncate">{selectedCampaign.title}</h3>
                <span className={cn(
                  "rounded px-2 py-0.5 text-[9px] font-black uppercase shrink-0",
                  selectedCampaign.status === "published" ? "bg-emerald-500/10 text-emerald-300" : selectedCampaign.status === "closed" ? "bg-slate-500/10 text-slate-400" : "bg-amber-500/10 text-amber-300"
                )}>
                  {selectedCampaign.status === "published" ? "Đang mở" : selectedCampaign.status === "closed" ? "Đã đóng" : "Nháp"}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-550">{selectedCampaign.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <span className="block text-[9px] font-bold uppercase text-slate-505">Cần tuyển</span>
                  <span className="font-black text-white">{selectedCampaign.talentQuantity} talent</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <span className="block text-[9px] font-bold uppercase text-slate-505">Đã thêm</span>
                  <span className="font-black text-amber-300">{selectedCampaign.shortlistedTalentIds.length} talent</span>
                </div>
              </div>

              {/* Added Wishlist Talents List */}
              <div className="pt-3 border-t border-white/5">
                <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Talent đã thêm ({selectedCampaign.shortlistedTalentIds.filter(id => savedIds.includes(id)).length})
                </span>

                {selectedCampaign.shortlistedTalentIds.filter(id => savedIds.includes(id)).length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">Chưa có talent nào được thêm.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedCampaign.shortlistedTalentIds
                      .filter(id => savedIds.includes(id))
                      .map(id => {
                        const t = talentList.find(talent => talent.id === id);
                        if (!t) return null;
                        return (
                          <div key={id} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-white/5 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={t.avatar} alt={t.name} className="h-6 w-6 rounded-full object-cover shrink-0" />
                              <span className="font-extrabold text-white truncate">{t.name}</span>
                            </div>
                            <span className="rounded bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 text-[8px] font-black text-amber-300 shrink-0">
                              Hạng {t.tier}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        <main className="space-y-4 lg:col-span-8">
          {savedTalents.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-10 text-center">
              <BookmarkCheck className="mx-auto mb-3 h-8 w-8 text-slate-600" />
              <h3 className="text-sm font-black text-white">Chưa có talent nào trong danh sách yêu thích</h3>
              <p className="mt-2 text-xs text-slate-500">Hãy vào màn Tìm tài năng để lưu talent phù hợp.</p>
            </div>
          ) : (
            savedTalents.map((talent) => {
              const alreadyInCampaign = selectedCampaign?.shortlistedTalentIds.includes(talent.id);
              const requested = requestedIds.includes(talent.id);

              return (
                <article key={talent.id} className="rounded-2xl border border-white/5 bg-slate-950/25 p-4">
                  <div className="flex flex-col gap-4 md:flex-row">
                    <img src={talent.avatar} alt={talent.name} className="h-28 w-full rounded-2xl object-cover md:w-28" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black text-white">{talent.name}</h3>
                        <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-400">{talent.type}</span>
                        <span className="rounded bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase text-slate-950">Hạng {talent.tier}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-400">{talent.experience}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {talent.skills.map((skill) => (
                          <span key={skill} className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold text-slate-400">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <label className="md:col-span-2">
                      <span className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <FileText className="h-3.5 w-3.5" />
                        Ghi chú
                      </span>
                      <input
                        value={notes[talent.id] ?? ""}
                        onChange={(event) => setNotes((current) => ({ ...current, [talent.id]: event.target.value }))}
                        placeholder="Lý do lưu talent này..."
                        className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60"
                      />
                    </label>

                    <div className="flex items-end gap-2">
                      <button
                        onClick={() => addTalentToCampaign(talent.id)}
                        disabled={alreadyInCampaign}
                        className={cn(
                          "flex h-10 flex-1 items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition active:scale-95",
                          alreadyInCampaign ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border border-white/5 bg-white/[0.03] text-white hover:bg-white/10"
                        )}
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        {alreadyInCampaign ? "Đã thêm" : "Thêm vào campaign"}
                      </button>
                      <button
                        onClick={() => removeTalent(talent.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                        title="Xóa khỏi shortlist"
                      >
                        <HeartOff className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2 border-t border-white/5 pt-4">
                    <button
                      onClick={() => router.push(`/brand/talents/${talent.id}`)}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition active:scale-95 cursor-pointer text-[10px] font-black uppercase px-4 tracking-wider"
                    >
                      <Eye className="h-4 w-4" />
                      Xem hồ sơ
                    </button>
                    <button
                      onClick={() => sendRequest(talent.id)}
                      disabled={requested}
                      className={cn(
                        "flex h-10 items-center justify-center rounded-xl px-4 text-[10px] font-black uppercase tracking-wider cursor-pointer",
                        requested ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950"
                      )}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {requested ? "Đã gửi yêu cầu" : "Gửi yêu cầu liên hệ"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </main>
      </section>
    </div>
  );
}

