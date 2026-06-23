"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkCheck, Briefcase, Eye, FileText, HeartOff, MessageSquare, Plus } from "lucide-react";
import {
  addTalentToBrandCampaign,
  loadBrandCampaigns,
  loadBrandTalents,
  loadBrandWishlists,
  removeTalentFromWishlist,
} from "@/lib/brand-api";
import { createInitialAvatarDataUrl, isUsableAvatarUrl, normalizeBackendAssetUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

function selectExistingCampaignId(current: string, items: Array<{ id: string }>) {
  if (items.some((campaign) => campaign.id === current)) return current;
  return items[0]?.id || "";
}

function shortlistAvatar(talent: any) {
  if (isUsableAvatarUrl(talent?.avatar)) return normalizeBackendAssetUrl(talent.avatar);
  if (isUsableAvatarUrl(talent?.fullBodyImage)) return normalizeBackendAssetUrl(talent.fullBodyImage);
  if (isUsableAvatarUrl(talent?.cover)) return normalizeBackendAssetUrl(talent.cover);
  return createInitialAvatarDataUrl(String(talent?.name || "Talent"), "");
}

type ToastItem = {
  id: string;
  message: string;
  tone: "success" | "error";
};

export default function BrandShortlistsPage() {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [talentList, setTalentList] = useState<any[]>([]);
  const [localCampaigns, setLocalCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishlistItemIds, setWishlistItemIds] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    Promise.all([loadBrandTalents([]), loadBrandWishlists([])]).then(([backendTalents, wishlists]) => {
      const primaryWishlist = wishlists[0];

      if (!primaryWishlist) {
        setWishlistId(null);
        setSavedIds([]);
        setTalentList([]);
        setNotes({});
        setWishlistItemIds({});
        return;
      }

      const talentsById = new Map((backendTalents || []).map((talent: any) => [String(talent.id), talent]));
      const mergedTalents = (primaryWishlist.talents || []).map((talent: any) => {
        const enriched = talentsById.get(String(talent.id));
        return enriched ? { ...talent, ...enriched } : talent;
      });

      setWishlistId(primaryWishlist.id);
      setSavedIds(primaryWishlist.savedIds || []);
      setTalentList(mergedTalents);
      setNotes(primaryWishlist.notes || {});
      setWishlistItemIds(
        primaryWishlist.items.reduce((acc: Record<string, string>, item: any) => {
          const profileId = String(item.profile_id || item.profile?.id || "");
          if (profileId) acc[profileId] = String(item.id);
          return acc;
        }, {}),
      );
    });

    loadBrandCampaigns([]).then((items) => {
      setLocalCampaigns(items);
      setSelectedCampaignId((current) => selectExistingCampaignId(current, items));
    });
  }, []);

  const savedTalents = useMemo(
    () => talentList.filter((talent) => savedIds.includes(talent.id)),
    [savedIds, talentList],
  );
  const selectedCampaign = localCampaigns.find((campaign) => campaign.id === selectedCampaignId);

  function pushToast(message: string, tone: ToastItem["tone"] = "success") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }

  function formatActionError(error: unknown, fallback: string) {
    const message = error instanceof Error ? error.message : fallback;
    const normalized = String(message || "").toLocaleLowerCase("vi-VN");

    if (
      normalized.includes("quyết toán") ||
      normalized.includes("quyet toan") ||
      normalized.includes("đã đóng") ||
      normalized.includes("da dong")
    ) {
      return "Chiến dịch này đã đóng hoặc đã bắt đầu quyết toán nên không thể thêm talent nữa.";
    }

    return message || fallback;
  }

  async function removeTalent(id: string) {
    const itemId = wishlistItemIds[id];
    if (wishlistId && itemId) {
      try {
        await removeTalentFromWishlist(wishlistId, itemId);
      } catch (error) {
        pushToast(formatActionError(error, "Chưa thể xoá talent khỏi danh sách đã lưu."), "error");
        return;
      }
    }

    setSavedIds((current) => current.filter((item) => item !== id));
    setTalentList((current) => current.filter((item) => item.id !== id));
    setWishlistItemIds((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    pushToast("Đã xoá talent khỏi danh sách đã lưu.");
  }

  async function addTalentToCampaign(talentId: string) {
    if (!selectedCampaignId) return;

    try {
      await addTalentToBrandCampaign(selectedCampaignId, talentId, notes[talentId]);
    } catch (error) {
      pushToast(formatActionError(error, "Chưa thể thêm talent vào chiến dịch. Vui lòng thử lại."), "error");
      return;
    }

    setLocalCampaigns((current) =>
      current.map((campaign) => {
        if (campaign.id !== selectedCampaignId) return campaign;
        if (campaign.shortlistedTalentIds.includes(talentId)) return campaign;

        return {
          ...campaign,
          shortlistedTalentIds: [...campaign.shortlistedTalentIds, talentId],
        };
      }),
    );

    pushToast("Đã thêm talent vào chiến dịch.");
  }

  return (
    <div className="space-y-6 pb-16">
      <section className="flex flex-col gap-4 border-b border-white/5 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
              Danh sách đã lưu
            </span>
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight text-white">
            Danh sách{" "}
            <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              người mẫu yêu thích
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Quản lý danh sách talent đã lưu, thêm ghi chú và đưa talent vào chiến dịch đang mở.
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/30 px-4 py-3">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Danh sách yêu thích</span>
          <span className="text-lg font-black text-white">{savedTalents.length} talent</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="h-fit space-y-4 rounded-2xl border border-white/5 bg-slate-950/25 p-5 lg:col-span-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-amber-300" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-300">Thêm vào chiến dịch</h2>
          </div>

          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Chiến dịch mục tiêu</span>
            <select
              value={selectedCampaignId}
              onChange={(event) => setSelectedCampaignId(event.target.value)}
              disabled={localCampaigns.length === 0}
              className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60 disabled:text-slate-500"
            >
              {localCampaigns.length === 0 ? (
                <option value="">Chưa có chiến dịch từ backend</option>
              ) : (
                localCampaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </option>
                ))
              )}
            </select>
          </label>

          {selectedCampaign ? (
            <div className="space-y-3 rounded-2xl border border-white/5 bg-slate-950/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="truncate text-sm font-black text-white">{selectedCampaign.title}</h3>
                <span
                  className={cn(
                    "shrink-0 rounded px-2 py-0.5 text-[9px] font-black uppercase",
                    selectedCampaign.status === "published"
                      ? "bg-emerald-500/10 text-emerald-300"
                      : selectedCampaign.status === "closed"
                        ? "bg-slate-500/10 text-slate-400"
                        : "bg-amber-500/10 text-amber-300",
                  )}
                >
                  {selectedCampaign.status === "published"
                    ? "Đang mở"
                    : selectedCampaign.status === "closed"
                      ? "Đã đóng"
                      : "Nháp"}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{selectedCampaign.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <span className="block text-[9px] font-bold uppercase text-slate-500">Cần tuyển</span>
                  <span className="font-black text-white">{selectedCampaign.talentQuantity} talent</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <span className="block text-[9px] font-bold uppercase text-slate-500">Đã thêm</span>
                  <span className="font-black text-amber-300">{selectedCampaign.shortlistedTalentIds.length} talent</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <span className="mb-2 block text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Talent đã thêm ({selectedCampaign.shortlistedTalentIds.filter((id: string) => savedIds.includes(id)).length})
                </span>

                {selectedCampaign.shortlistedTalentIds.filter((id: string) => savedIds.includes(id)).length === 0 ? (
                  <p className="text-[10px] italic text-slate-500">Chưa có talent nào được thêm.</p>
                ) : (
                  <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                    {selectedCampaign.shortlistedTalentIds
                      .filter((id: string) => savedIds.includes(id))
                      .map((id: string) => {
                        const talent = talentList.find((item) => item.id === id);
                        if (!talent) return null;

                        return (
                          <div key={id} className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/50 p-2 text-xs">
                            <div className="flex min-w-0 items-center gap-2">
                              <img
                                src={shortlistAvatar(talent)}
                                alt={talent.name}
                                onError={(event) => {
                                  event.currentTarget.src = createInitialAvatarDataUrl(talent.name, "");
                                }}
                                className="h-6 w-6 shrink-0 rounded-full object-cover"
                              />
                              <span className="truncate font-extrabold text-white">{talent.name}</span>
                            </div>
                            <span className="shrink-0 rounded border border-amber-400/20 bg-amber-400/10 px-1.5 py-0.5 text-[8px] font-black text-amber-300">
                              Hạng {talent.tier}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs leading-relaxed text-slate-400">
                Chưa có chiến dịch từ backend để gắn talent. Hãy tạo chiến dịch trước, rồi quay lại màn này để thêm
                talent vào.
              </p>
            </div>
          )}
        </aside>

        <main className="space-y-4 lg:col-span-8">
          {savedTalents.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-10 text-center">
              <BookmarkCheck className="mx-auto mb-3 h-8 w-8 text-slate-600" />
              <h3 className="text-sm font-black text-white">Chưa có talent nào trong danh sách yêu thích</h3>
              <p className="mt-2 text-xs text-slate-500">Hãy vào màn Tìm kiếm Talent để lưu talent phù hợp.</p>
            </div>
          ) : (
            savedTalents.map((talent) => {
              const alreadyInCampaign = Boolean(selectedCampaign?.shortlistedTalentIds.includes(talent.id));

              return (
                <article key={talent.id} className="relative rounded-2xl border border-white/5 bg-slate-950/25 p-4">
                  <button
                    onClick={() => removeTalent(talent.id)}
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/5 text-rose-300 transition active:scale-95 hover:bg-rose-500/10"
                    title="Xoá khỏi shortlist"
                  >
                    <HeartOff className="h-4 w-4" />
                  </button>

                  <div className="flex flex-col gap-4 md:flex-row">
                    <img
                      src={shortlistAvatar(talent)}
                      alt={talent.name}
                      onError={(event) => {
                        event.currentTarget.src = createInitialAvatarDataUrl(talent.name, "");
                      }}
                      className="h-28 w-full rounded-2xl object-cover md:w-28"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2 pr-8 md:pr-10">
                        <h3 className="text-base font-black text-white">{talent.name}</h3>
                        <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-400">{talent.type}</span>
                        <span className="rounded bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase text-slate-950">Hạng {talent.tier}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-400">{talent.experience}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {talent.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold text-slate-400"
                          >
                            {skill}
                          </span>
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

                    <div className="flex items-end">
                      <button
                        onClick={() => addTalentToCampaign(talent.id)}
                        disabled={alreadyInCampaign || !selectedCampaignId}
                        className={cn(
                          "flex h-10 w-full items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95",
                          alreadyInCampaign
                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : !selectedCampaignId
                              ? "cursor-not-allowed border border-white/5 bg-white/[0.03] text-slate-500"
                              : "cursor-pointer border border-white/5 bg-white/[0.03] text-white hover:bg-white/10",
                        )}
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        {alreadyInCampaign ? "Đã thêm" : !selectedCampaignId ? "Chưa có chiến dịch" : "Thêm vào chiến dịch"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2 border-t border-white/5 pt-4">
                    <button
                      onClick={() => router.push(`/brand/talents/${talent.id}`)}
                      className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 text-[10px] font-black uppercase tracking-wider text-white transition active:scale-95 hover:bg-white/10"
                    >
                      <Eye className="h-4 w-4" />
                      Xem hồ sơ
                    </button>
                    <button
                      onClick={() => router.push(`/brand/messages?talentId=${talent.id}`)}
                      className="flex h-10 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 px-4 text-[10px] font-black uppercase tracking-wider text-slate-950"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Nhắn tin
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </main>
      </section>

      <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md",
              toast.tone === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                : "border-rose-400/30 bg-rose-500/10 text-rose-100",
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
