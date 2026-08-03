"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkCheck } from "lucide-react";
import {
  addBrandRosterTalent,
  loadBrandRosterTalents,
  loadBrandTalents,
  loadBrandWishlists,
  removeTalentFromWishlist,
  removeBrandRosterTalent,
} from "@/lib/brand-api";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import TalentCard from "@/components/talents/TalentCard";
import TalentCardMobile from "@/components/talents/TalentCardMobile";

type ToastItem = {
  id: string;
  message: string;
  tone: "success" | "error";
};

export default function BrandShortlistsPage() {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [talentList, setTalentList] = useState<any[]>([]);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishlistItemIds, setWishlistItemIds] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [brandTalentIds, setBrandTalentIds] = useState<string[]>([]);
  const [brandRosterMap, setBrandRosterMap] = useState<Record<string, string>>({});
  const [addingBrandTalentIds, setAddingBrandTalentIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      loadBrandTalents([]),
      loadBrandWishlists([]),
      loadBrandRosterTalents().catch(() => []),
    ]).then(([backendTalents, wishlists, rosterItems]) => {
      setBrandTalentIds(rosterItems.map((item) => String(item.talent_profile_id)));
      const map: Record<string, string> = {};
      rosterItems.forEach((item) => {
        map[String(item.talent_profile_id)] = String(item.id);
      });
      setBrandRosterMap(map);

      const primaryWishlist = wishlists[0];

      if (!primaryWishlist) {
        setWishlistId(null);
        setSavedIds([]);
        setTalentList([]);
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
      setWishlistItemIds(
        primaryWishlist.items.reduce((acc: Record<string, string>, item: any) => {
          const profileId = String(item.profile_id || item.profile?.id || "");
          if (profileId) acc[profileId] = String(item.id);
          return acc;
        }, {})
      );
    });
  }, []);

  const savedTalents = useMemo(() => {
    return talentList.filter((talent) => savedIds.includes(String(talent.id)));
  }, [savedIds, talentList]);

  function pushToast(message: string, tone: "success" | "error" = "success") {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3000);
  }

  function formatActionError(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  }

  async function removeTalent(talentId: string) {
    const itemId = wishlistItemIds[talentId];
    if (!wishlistId || !itemId) return;

    try {
      await removeTalentFromWishlist(wishlistId, itemId);
    } catch (error) {
      console.warn("Backend remove failed, updating locally", error);
    }

    setSavedIds((current) => current.filter((id) => id !== talentId));
    setWishlistItemIds((current) => {
      const next = { ...current };
      delete next[talentId];
      return next;
    });
    pushToast("Đã xoá khỏi danh sách đã lưu.");
  }

  async function addTalentToBrand(talentId: string) {
    if (!talentId || brandTalentIds.includes(talentId) || addingBrandTalentIds.includes(talentId)) return;

    setAddingBrandTalentIds((current) => [...current, talentId]);

    try {
      const res = await addBrandRosterTalent(talentId, "Thêm từ danh sách đã lưu.");
      setBrandTalentIds((current) => current.includes(talentId) ? current : [...current, talentId]);
      if (res?.id) {
        setBrandRosterMap((current) => ({ ...current, [talentId]: String(res.id) }));
      }
      pushToast("Đã thêm talent vào Brand.");
    } catch (error) {
      pushToast(formatActionError(error, "Chưa thể thêm talent vào Brand. Vui lòng thử lại."), "error");
    } finally {
      setAddingBrandTalentIds((current) => current.filter((id) => id !== talentId));
    }
  }

  async function removeTalentFromBrand(talentId: string) {
    if (!talentId || addingBrandTalentIds.includes(talentId)) return;

    setAddingBrandTalentIds((current) => [...current, talentId]);

    try {
      let rosterId = brandRosterMap[talentId];
      if (!rosterId) {
        const rosterItems = await loadBrandRosterTalents();
        const found = rosterItems.find((r) => String(r.talent_profile_id) === talentId || String(r.talent_profile?.id) === talentId);
        if (found?.id) rosterId = String(found.id);
      }

      if (rosterId) {
        await removeBrandRosterTalent(rosterId);
      }
      setBrandTalentIds((current) => current.filter((id) => id !== talentId));
      setBrandRosterMap((current) => {
        const next = { ...current };
        delete next[talentId];
        return next;
      });
      pushToast("Đã xóa talent khỏi Brand.");
    } catch (error) {
      pushToast(formatActionError(error, "Chưa thể xóa talent khỏi Brand. Vui lòng thử lại."), "error");
    } finally {
      setAddingBrandTalentIds((current) => current.filter((id) => id !== talentId));
    }
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
              người mẫu đã lưu
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Quản lý danh sách idol đã lưu và thêm họ trực tiếp vào danh sách hoạt động của Brand.
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/30 px-4 py-3">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Danh sách đã lưu</span>
          <span className="text-lg font-black text-white">{savedTalents.length} idol</span>
        </div>
      </section>

      <section>
        {savedTalents.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-10 text-center">
            <BookmarkCheck className="mx-auto mb-3 h-8 w-8 text-slate-600" />
            <h3 className="text-sm font-black text-white">Chưa có idol nào trong danh sách đã lưu</h3>
            <p className="mt-2 text-xs text-slate-500">Hãy vào màn Tìm kiếm Idol để lưu idol phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {savedTalents.map((talent) => {
              const isSaved = savedIds.includes(String(talent.id));
              const isInBrand = brandTalentIds.includes(String(talent.id));
              const isAddingToBrand = addingBrandTalentIds.includes(String(talent.id));

              return (
                <React.Fragment key={talent.id}>
                  {/* Desktop Card */}
                  <TalentCard
                    talent={talent}
                    status={talent.availabilityStatus ?? "maybe"}
                    isSaved={isSaved}
                    onToggleSaved={(item) => void removeTalent(String(item.id))}
                    onView={(item) => router.push(`/brand/talents/${item.id}?from=/brand/shortlists`)}
                    onMessage={(item) => void addTalentToBrand(String(item.id))}
                    onRemoveFromBrand={(item) => void removeTalentFromBrand(String(item.id))}
                    messageLabel={isInBrand ? "Đã thêm" : isAddingToBrand ? "Đang thêm" : "Thêm vào Brand"}
                    messageDisabled={isInBrand}
                    messageLoading={isAddingToBrand}
                    showMessageIcon
                    className="hidden md:flex"
                  />
                  {/* Mobile Landscape Card */}
                  <TalentCardMobile
                    talent={talent}
                    status={talent.availabilityStatus ?? "maybe"}
                    isSaved={isSaved}
                    onToggleSaved={(item) => void removeTalent(String(item.id))}
                    onView={(item) => router.push(`/brand/talents/${item.id}?from=/brand/shortlists`)}
                    onMessage={(item) => void addTalentToBrand(String(item.id))}
                    onRemoveFromBrand={(item) => void removeTalentFromBrand(String(item.id))}
                    messageLabel={isInBrand ? "Đã thêm" : isAddingToBrand ? "Đang thêm" : "Thêm vào Brand"}
                    messageDisabled={isInBrand}
                    messageLoading={isAddingToBrand}
                    showMessageIcon
                    className="flex md:hidden"
                  />
                </React.Fragment>
              );
            })}
          </div>
        )}
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
