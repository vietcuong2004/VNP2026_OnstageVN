"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  BookmarkCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  UserCheck,
  UserPlus,
  Users2,
  X,
} from "lucide-react";
import TalentCard from "@/components/TalentCard";
import { cn } from "@/lib/utils";
import {
  CITY_VALUES,
  TALENT_TYPE_VALUES,
  normalizeTalentTypeKey,
  normalizeTalentTypeLabel,
} from "@/components/ui/ComboboxOptionValues";
import {
  addTalentToWishlist,
  addBrandRosterTalent,
  createBrandWishlist,
  loadBrandCampaigns,
  loadBrandRosterTalents,
  loadBrandTalentsPage,
  loadBrandWishlists,
  removeBrandRosterTalent,
  removeTalentFromWishlist,
} from "@/lib/brand-api";
import { useGuestActionPrompt } from "@/components/guest-action-prompt";

const TALENTS_PER_PAGE = 24;
const TALENT_PAGES_PER_RESULT_PAGE = 2;
const TALENTS_PER_RESULT_PAGE = TALENTS_PER_PAGE * TALENT_PAGES_PER_RESULT_PAGE;

type TalentSortOption = "name_asc" | "name_desc" | "newest" | "oldest";

const TALENT_SORT_OPTIONS: Array<{ value: TalentSortOption; label: string }> = [
  { value: "name_asc", label: "Theo tên từ A - Z" },
  { value: "name_desc", label: "Theo tên từ Z - A" },
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
];

const allValue = "Tất cả";

function normalizeTalentType(type: string): string {
  return normalizeTalentTypeKey(type);
}

function formatActionError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

const genderOptions = [
  { label: "Tất cả giới tính", value: allValue },
  { label: "Nữ", value: "female" },
  { label: "Nam", value: "male" },
  { label: "Khác", value: "other" },
];

const cityOptions = [
  { label: "Toàn quốc", value: allValue },
  ...CITY_VALUES.map((city: string) => ({ label: city, value: city })),
];

const typeOptions = [
  { label: "Tất cả loại hình Idol", value: allValue },
  ...TALENT_TYPE_VALUES.map((type: string) => ({ label: normalizeTalentTypeLabel(type), value: type })),
];

function normalizeCityName(cityName: string): string {
  return cityName.toLowerCase().replace(/^(tỉnh|thành phố|tp\.?)\s+/i, "").trim();
}

function getTalentTypes(talent: any): string[] {
  if (Array.isArray(talent?.talentTypes) && talent.talentTypes.length) {
    return Array.from(new Set(talent.talentTypes.map((type: unknown) => normalizeTalentTypeLabel(String(type).trim())).filter(Boolean)));
  }

  if (Array.isArray(talent?.talent_types) && talent.talent_types.length) {
    return Array.from(new Set(talent.talent_types.map((type: unknown) => normalizeTalentTypeLabel(String(type).trim())).filter(Boolean)));
  }

  if (Array.isArray(talent?.categories) && talent.categories.length) {
    return talent.categories.map((c: any) => (typeof c === "string" ? c : c.name || c.title || "")).filter(Boolean);
  }

  if (Array.isArray(talent?.categoryNames) && talent.categoryNames.length) {
    return talent.categoryNames.map((type: unknown) => String(type).trim()).filter(Boolean);
  }

  return talent?.type ? [String(talent.type)] : [];
}

function backendGenderValue(gender: string): string | undefined {
  if (gender === "female" || gender === "Nữ") return "female";
  if (gender === "male" || gender === "Nam") return "male";
  if (gender === "other" || gender === "Khác") return "other";
  return undefined;
}

function getVisiblePageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: (number | string)[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("...");
  for (let index = start; index <= end; index += 1) pages.push(index);
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);

  return pages;
}

type FilterDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
};

function FilterDropdown({
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  searchable = true,
  searchPlaceholder = "Tìm kiếm...",
  emptyText = "Không tìm thấy",
  className,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const term = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, search, searchable]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-white/5 bg-slate-950/60 px-3 text-xs text-white outline-none transition-all duration-300 hover:border-[#C9A86A]/40 focus:border-[#C9A86A]/60 shadow-inner cursor-pointer",
          isOpen && "border-[#C9A86A]/60 bg-slate-900/90"
        )}
      >
        <span className="truncate text-left font-medium text-slate-200">
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-300",
            isOpen && "rotate-180 text-[#C9A86A]"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 max-h-60 w-full overflow-hidden rounded-xl border border-[#2B313D] bg-[#12151C] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {searchable && (
            <div className="mb-1.5 px-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-2.5 py-1.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-[#C9A86A]/50"
                autoFocus
              />
            </div>
          )}

          <div className="max-h-44 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-center text-xs text-slate-500">{emptyText}</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer",
                      isSelected
                        ? "bg-[#C9A86A]/20 text-[#C9A86A] font-bold"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#C9A86A]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type ToastItem = {
  id: string;
  message: string;
  tone: "success" | "error";
};

export default function DiscoverTalentsPage() {
  const router = useRouter();
  const { requireAuthAction, GuestActionPrompt } = useGuestActionPrompt();

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function pushToast(message: string, tone: ToastItem["tone"] = "success") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }

  // Draft Search and Filters states (controlled inputs)
  const [searchInput, setSearchInput] = useState("");
  const [selectedGender, setSelectedGender] = useState(allValue);
  const [selectedType, setSelectedType] = useState(allValue);
  const [selectedCity, setSelectedCity] = useState(allValue);

  const [minHeight, setMinHeight] = useState(150);
  const [maxHeight, setMaxHeight] = useState(190);
  const [minWeight, setMinWeight] = useState(40);
  const [maxWeight, setMaxWeight] = useState(90);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Applied Filters state (ONLY updated when user clicks "ÁP DỤNG" or submits search)
  const [appliedFilters, setAppliedFilters] = useState({
    query: "",
    gender: allValue,
    type: allValue,
    city: allValue,
    minHeight: 150,
    maxHeight: 190,
    minWeight: 40,
    maxWeight: 90,
    showAdvancedFilters: false,
  });

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishlistItemIds, setWishlistItemIds] = useState<Record<string, string>>({});
  const [selectedInviteTalent, setSelectedInviteTalent] = useState<any | null>(null);
  const [selectedCampaignForInvite, setSelectedCampaignForInvite] = useState("");
  const [sortOption, setSortOption] = useState<TalentSortOption>("newest");
  const talentRequestRef = useRef(0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [displayTalents, setDisplayTalents] = useState<any[]>([]);
  const [talentPage, setTalentPage] = useState(1);
  const [talentTotal, setTalentTotal] = useState(0);
  const [talentResultPage, setTalentResultPage] = useState(1);
  const [talentResultPageCount, setTalentResultPageCount] = useState(1);
  const [hasMoreTalents, setHasMoreTalents] = useState(false);
  const [isLoadingTalents, setIsLoadingTalents] = useState(true);
  const [isLoadingMoreTalents, setIsLoadingMoreTalents] = useState(false);
  const [brandCampaigns, setBrandCampaigns] = useState<any[]>([]);
  const [brandTalentIds, setBrandTalentIds] = useState<string[]>([]);
  const [brandRosterMap, setBrandRosterMap] = useState<Record<string, string>>({});
  const [addingBrandTalentIds, setAddingBrandTalentIds] = useState<string[]>([]);

  // Function to apply current draft filters
  const applyFilters = useCallback(() => {
    setAppliedFilters({
      query: searchInput,
      gender: selectedGender,
      type: selectedType,
      city: selectedCity,
      minHeight,
      maxHeight,
      minWeight,
      maxWeight,
      showAdvancedFilters,
    });
  }, [searchInput, selectedGender, selectedType, selectedCity, minHeight, maxHeight, minWeight, maxWeight, showAdvancedFilters]);

  const talentQueryOptions = useMemo(() => ({
    q: appliedFilters.query || undefined,
    type: appliedFilters.type !== allValue ? appliedFilters.type : undefined,
    city: appliedFilters.city !== allValue ? appliedFilters.city : undefined,
    gender: appliedFilters.gender !== allValue ? backendGenderValue(appliedFilters.gender) : undefined,
    minHeight: appliedFilters.showAdvancedFilters ? appliedFilters.minHeight : undefined,
    maxHeight: appliedFilters.showAdvancedFilters ? appliedFilters.maxHeight : undefined,
  }), [appliedFilters]);

  const loadTalentPage = useCallback(async (page: number, mode: "replace" | "append", resultPage: number) => {
    const requestId = ++talentRequestRef.current;

    if (mode === "append") setIsLoadingMoreTalents(true);
    else setIsLoadingTalents(true);

    try {
      const response = await loadBrandTalentsPage({
        ...talentQueryOptions,
        page,
        perPage: TALENTS_PER_PAGE,
        sort: sortOption,
      });

      if (requestId !== talentRequestRef.current) return;

      setDisplayTalents((current) => {
        if (mode === "replace") return response.data;

        const seenIds = new Set(current.map((talent) => String(talent.id)));
        const nextItems = response.data.filter((talent) => !seenIds.has(String(talent.id)));
        return [...current, ...nextItems].slice(0, TALENTS_PER_RESULT_PAGE);
      });
      setTalentPage(response.meta.current_page);
      setTalentTotal(response.meta.total);
      setTalentResultPage(resultPage);
      setTalentResultPageCount(Math.max(1, Math.ceil((response.meta.total || response.data.length) / TALENTS_PER_RESULT_PAGE)));
      setHasMoreTalents(response.meta.has_more && response.meta.current_page < resultPage * TALENT_PAGES_PER_RESULT_PAGE);
    } finally {
      if (requestId === talentRequestRef.current) {
        setIsLoadingTalents(false);
        setIsLoadingMoreTalents(false);
      }
    }
  }, [sortOption, talentQueryOptions]);

  useEffect(() => {
    void loadTalentPage(1, "replace", 1);
  }, [loadTalentPage]);

  useEffect(() => {
    if (!hasMoreTalents || isLoadingTalents || isLoadingMoreTalents) return;

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadTalentPage(talentPage + 1, "append", talentResultPage);
        }
      },
      { rootMargin: "420px 0px", threshold: 0 },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMoreTalents, isLoadingMoreTalents, isLoadingTalents, loadTalentPage, talentPage, talentResultPage]);

  useEffect(() => {
    let cancelled = false;

    loadBrandWishlists([]).then((wishlists) => {
      if (cancelled) return;

      const primaryWishlist = wishlists[0];
      if (!primaryWishlist) {
        setSavedIds([]);
        setWishlistId(null);
        setWishlistItemIds({});
        return;
      }

      setWishlistId(primaryWishlist.id);
      setSavedIds(primaryWishlist.savedIds);
      setWishlistItemIds(
        primaryWishlist.items.reduce((acc: Record<string, string>, item: any) => {
          const profileId = String(item.profile_id || item.profile?.id || "");
          if (profileId) acc[profileId] = String(item.id);
          return acc;
        }, {})
      );
    });

    loadBrandCampaigns([]).then((items) => {
      if (!cancelled) setBrandCampaigns(items);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadBrandRosterTalents()
      .then((items) => {
        if (cancelled) return;
        setBrandTalentIds(items.map((item) => String(item.talent_profile_id)));
        const map: Record<string, string> = {};
        items.forEach((item) => {
          map[String(item.talent_profile_id)] = String(item.id);
        });
        setBrandRosterMap(map);
      })
      .catch(() => {
        if (!cancelled) {
          setBrandTalentIds([]);
          setBrandRosterMap({});
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter Algorithm based strictly on appliedFilters
  const filteredTalents = useMemo(() => {
    const keyword = appliedFilters.query.trim().toLowerCase();

    return displayTalents
      .filter((talent) => {
        const talentTypes = getTalentTypes(talent);
        const matchesSearch =
          !keyword ||
          talent.name.toLowerCase().includes(keyword) ||
          talent.skills.some((skill: string) => skill.toLowerCase().includes(keyword)) ||
          talentTypes.some((type) => type.toLowerCase().includes(keyword));

        const matchesGender = appliedFilters.gender === allValue || talent.gender === appliedFilters.gender;
        const matchesType =
          appliedFilters.type === allValue ||
          talentTypes.some((type) => normalizeTalentType(type) === normalizeTalentType(appliedFilters.type));
        const matchesCity =
          appliedFilters.city === allValue ||
          normalizeCityName(talent.city || "") === normalizeCityName(appliedFilters.city);

        const usesAdvancedFilters = appliedFilters.showAdvancedFilters;
        const matchesHeight = !usesAdvancedFilters || !talent.height || (talent.height >= appliedFilters.minHeight && talent.height <= appliedFilters.maxHeight);
        const matchesWeight = !usesAdvancedFilters || !talent.weight || (talent.weight >= appliedFilters.minWeight && talent.weight <= appliedFilters.maxWeight);

        return (
          matchesSearch &&
          matchesGender &&
          matchesType &&
          matchesCity &&
          matchesHeight &&
          matchesWeight
        );
      })
      .sort((a, b) => {
        if (sortOption === "name_asc") {
          return String(a.name || "").localeCompare(String(b.name || ""), "vi", { sensitivity: "base" });
        }

        if (sortOption === "name_desc") {
          return String(b.name || "").localeCompare(String(a.name || ""), "vi", { sensitivity: "base" });
        }

        const aCreatedAt = Date.parse(String(a.createdAt || a.created_at || ""));
        const bCreatedAt = Date.parse(String(b.createdAt || b.created_at || ""));
        const safeA = Number.isFinite(aCreatedAt) ? aCreatedAt : 0;
        const safeB = Number.isFinite(bCreatedAt) ? bCreatedAt : 0;

        return sortOption === "oldest" ? safeA - safeB : safeB - safeA;
      });
  }, [appliedFilters, displayTalents, sortOption]);

  const getTalentStatus = (id: string) => {
    if (id === "tal-1" || id === "tal-2") return "available";
    if (id === "tal-3") return "busy";
    return "maybe";
  };

  const hasClientOnlyFilters =
    appliedFilters.showAdvancedFilters &&
    (appliedFilters.minWeight !== 40 || appliedFilters.maxWeight !== 90);
  const displayedTalentCount = hasClientOnlyFilters ? filteredTalents.length : talentTotal || filteredTalents.length;
  const talentPageNumbers = getVisiblePageNumbers(talentResultPage, talentResultPageCount);

  function goToTalentResultPage(page: number) {
    if (page < 1 || page > talentResultPageCount || page === talentResultPage || isLoadingTalents) return;
    const backendPage = ((page - 1) * TALENT_PAGES_PER_RESULT_PAGE) + 1;
    void loadTalentPage(backendPage, "replace", page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      document.querySelectorAll("[data-app-scroll-root], main").forEach((element) => {
        element.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      });
    }
  }

  async function ensureWishlist() {
    if (wishlistId) return wishlistId;
    const created = await createBrandWishlist("Danh sách đã lưu");
    setWishlistId(created.id);
    return created.id;
  }

  // Toggle Saved Talent
  async function toggleSaved(talentId: string | number) {
    const id = String(talentId);
    if (!requireAuthAction({ actionLabel: "Thêm talent vào danh sách đã lưu" })) return;

    try {
      if (savedIds.includes(id)) {
        const itemId = wishlistItemIds[id];
        if (wishlistId && itemId) {
          await removeTalentFromWishlist(wishlistId, itemId);
        }

        setSavedIds((current) => current.filter((item) => item !== id));
        setWishlistItemIds((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });
        pushToast("Đã xóa khỏi danh sách đã lưu.");
        return;
      }

      const nextWishlistId = await ensureWishlist();
      const created = await addTalentToWishlist(nextWishlistId, id);
      setSavedIds((current) => current.includes(id) ? current : [...current, id]);
      setWishlistItemIds((current) => ({ ...current, [id]: String(created.id) }));
      pushToast("Đã thêm vào danh sách đã lưu.");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Chưa thể cập nhật danh sách đã lưu. Vui lòng thử lại.", "error");
    }
  }

  async function addTalentToBrand(talent: any) {
    const talentId = String(talent?.id || "");
    if (!talentId || brandTalentIds.includes(talentId) || addingBrandTalentIds.includes(talentId)) return;
    if (!requireAuthAction({ actionLabel: "Thêm talent vào Brand" })) return;

    setAddingBrandTalentIds((current) => [...current, talentId]);

    try {
      const res = await addBrandRosterTalent(talentId, `Thêm idol ${talent?.name || ""} vào Brand.`);
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

  async function removeTalentFromBrand(talent: any) {
    const talentId = String(talent?.id || "");
    if (!talentId || addingBrandTalentIds.includes(talentId)) return;
    if (!requireAuthAction({ actionLabel: "Xóa talent khỏi Brand" })) return;

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
      {/* Toast Notification Bar */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-bold shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300",
                toast.tone === "success"
                  ? "border-emerald-500/30 bg-[#07130F]/95 text-emerald-300"
                  : "border-rose-500/30 bg-[#17080A]/95 text-rose-300"
              )}
            >
              {toast.tone === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <X className="h-4 w-4 shrink-0 text-rose-400" />
              )}
              <span className="flex-1">{toast.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0C0F17] via-[#141824] to-[#0A0C13] p-6 md:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#C9A86A]/5 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-md border border-[#C9A86A]/30 bg-[#C9A86A]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
                OnstageVN Idol
              </span>
            </div>
            <h1 className="font-display text-2xl font-black tracking-tight text-white md:text-3xl">
              Khám phá &amp; Tìm kiếm{" "}
              <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Idol Phù Hợp
              </span>
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400 md:text-sm">
              Khám phá hàng trăm hồ sơ Talent, tìm kiếm theo tiêu chí phù hợp và lưu lại để sẵn sàng kết nối trong các chiến dịch tiếp theo.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/brand/shortlists"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <BookmarkCheck className="h-4 w-4 text-[#C9A86A]" />
              <span>Danh sách đã lưu ({savedIds.length})</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Search Input Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="group relative flex-1">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500/30 via-[#C9A86A]/40 to-yellow-600/30 opacity-75 blur-sm transition-all duration-500 group-hover:opacity-100 group-focus-within:opacity-100 group-focus-within:blur-md" />
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#C9A86A] transition-colors group-focus-within:text-amber-300" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters();
                }
              }}
              placeholder="Tìm kiếm idol theo tên, kỹ năng (ví dụ: MC, livestream, catwalk...)"
              className="w-full rounded-2xl border border-amber-500/10 bg-[#0a0c12]/90 py-4 pl-12 pr-10 text-xs text-white outline-none transition-all duration-300 focus:border-[#C9A86A]/60 placeholder:text-slate-500 shadow-2xl"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setAppliedFilters((prev) => ({ ...prev, query: "" }));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-450 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={applyFilters}
          className="flex h-[50px] items-center justify-center rounded-2xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 px-8 text-xs font-black uppercase tracking-wider text-slate-950 transition-all duration-300 active:scale-95 cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(201,168,106,0.3)] shrink-0"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Horizontal Filter Bar */}
      <div className="relative z-40 rounded-2xl border border-[#C9A86A]/30 bg-[#0f121d]/90 p-5 space-y-4 shadow-[0_0_30px_rgba(201,168,106,0.06)] backdrop-blur-md overflow-visible">
        {/* Top Highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A86A] to-transparent" />

        {/* Main Filters Row */}
        <div className="flex flex-wrap items-end gap-3.5 relative z-10">
          {/* Giới tính */}
          <div className="flex-1 min-w-[120px]">
            <span className="block text-[9px] font-black uppercase tracking-widest text-[#C9A86A]/90 mb-1.5 font-display">Giới tính</span>
            <FilterDropdown
              value={selectedGender}
              onChange={setSelectedGender}
              options={genderOptions}
              searchable={false}
            />
          </div>

          {/* Địa điểm */}
          <div className="flex-1 min-w-[180px]">
            <span className="block text-[9px] font-black uppercase tracking-widest text-[#C9A86A]/90 mb-1.5 font-display">Địa điểm</span>
            <FilterDropdown
              value={selectedCity}
              onChange={setSelectedCity}
              options={cityOptions}
              searchPlaceholder="Nhập tỉnh/thành..."
              emptyText="Không tìm thấy địa điểm"
            />
          </div>

          {/* Loại hình Idol */}
          <div className="flex-1 min-w-[140px]">
            <span className="block text-[9px] font-black uppercase tracking-widest text-[#C9A86A]/90 mb-1.5 font-display">Loại hình Idol</span>
            <FilterDropdown
              value={selectedType}
              onChange={setSelectedType}
              options={typeOptions}
              searchable={false}
            />
          </div>

          {/* Buttons Group */}
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={cn(
                "flex h-9 items-center justify-center gap-1.5 rounded-xl border px-4 text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer whitespace-nowrap shadow-md",
                showAdvancedFilters
                  ? "border-[#C9A86A] bg-gradient-to-r from-amber-400/20 to-yellow-600/20 text-[#C9A86A] shadow-[0_0_12px_rgba(201,168,106,0.15)]"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-[#C9A86A]/40 hover:text-white"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Lọc nâng cao</span>
              {showAdvancedFilters ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={applyFilters}
              className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 px-5 text-xs font-black uppercase tracking-wider text-slate-950 hover:brightness-110 transition active:scale-95 cursor-pointer shadow-md"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Áp dụng</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Area */}
        {showAdvancedFilters && (
          <div className="border-t border-white/5 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Chiều cao */}
              <div className="space-y-1.5">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Chiều cao ({minHeight} - {maxHeight}cm)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min={140} max={200} value={minHeight} onChange={(e) => setMinHeight(Number(e.target.value))} className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                  <input type="number" min={140} max={200} value={maxHeight} onChange={(e) => setMaxHeight(Number(e.target.value))} className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                </div>
              </div>

              {/* Cân nặng */}
              <div className="space-y-1.5">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Cân nặng ({minWeight} - {maxWeight}kg)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min={35} max={120} value={minWeight} onChange={(e) => setMinWeight(Number(e.target.value))} className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                  <input type="number" min={35} max={120} value={maxWeight} onChange={(e) => setMaxWeight(Number(e.target.value))} className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Main Results Container */}
      <div className="relative z-0 w-full">
        {/* Content - Flexible */}
        <main className="w-full space-y-4">
          <div className="flex flex-row items-center justify-between gap-3 border-b border-[#2B313D] pb-3">
            <span className="flex min-w-0 flex-1 items-center gap-2 whitespace-nowrap text-[11px] text-slate-400 sm:text-xs">
              <Filter className="h-4 w-4 text-[#C9A86A]" />
              <span className="truncate">Tìm thấy <b className="text-white">{displayedTalentCount}</b> kết quả.</span>
            </span>
            <label className="relative flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-300 transition-colors focus-within:border-[#C9A86A]/70">
              <ArrowUpDown className="h-4 w-4 text-[#C9A86A]" />
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as TalentSortOption)}
                className="w-[112px] cursor-pointer appearance-none bg-transparent pr-5 text-[9px] font-black uppercase tracking-wider text-white outline-none sm:w-[150px] sm:text-[10px]"
              >
                {TALENT_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#080414] text-white">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-slate-500" />
            </label>
          </div>

          {isLoadingTalents ? (
            <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-16 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 animate-pulse text-[#C9A86A]" />
              <h3 className="text-sm font-black text-white">Đang tải danh sách idol</h3>
              <p className="mt-2 text-xs text-slate-500">Một chút thôi, hệ thống đang lấy dữ liệu phù hợp.</p>
            </div>
          ) : filteredTalents.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-12 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-slate-600" />
              <h3 className="text-sm font-black text-white">Không tìm thấy idol phù hợp</h3>
              <p className="mt-2 text-xs text-slate-500">Thử chỉnh lại từ khóa hoặc xóa bớt bộ lọc xem sao.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTalents.map((talent) => {
                const isSaved = savedIds.includes(String(talent.id));
                const isInBrand = brandTalentIds.includes(String(talent.id));
                const isAddingToBrand = addingBrandTalentIds.includes(String(talent.id));

                return (
                  <TalentCard
                    key={talent.id}
                    talent={talent}
                    status={getTalentStatus(String(talent.id))}
                    isSaved={isSaved}
                    messageDisabled={isInBrand}
                    messageLoading={isAddingToBrand}
                    onToggleSaved={() => toggleSaved(talent.id)}
                    onView={(item) => router.push(`/brand/talents/${item.id}?from=/brand/search`)}
                    onMessage={() => addTalentToBrand(talent)}
                    onRemoveFromBrand={() => removeTalentFromBrand(talent)}
                  />
                );
              })}
            </div>
          )}

          {!hasClientOnlyFilters && talentResultPageCount > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
              <button
                type="button"
                onClick={() => goToTalentResultPage(talentResultPage - 1)}
                disabled={talentResultPage === 1 || isLoadingTalents}
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:hover:bg-slate-950/60 cursor-pointer"
              >
                Trang trước
              </button>

              {talentPageNumbers.map((pageNumber, index) =>
                typeof pageNumber === "number" ? (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => goToTalentResultPage(pageNumber)}
                    disabled={isLoadingTalents}
                    className={cn(
                      "min-w-[36px] h-9 rounded-xl border text-xs font-black transition cursor-pointer",
                      pageNumber === talentResultPage
                        ? "border-[#C9A86A] bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 shadow-md"
                        : "border-white/10 bg-slate-950/60 text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {pageNumber}
                  </button>
                ) : (
                  <span key={`ellipsis-${index}`} className="px-1 text-xs font-bold text-slate-500">
                    {pageNumber}
                  </span>
                )
              )}

              <button
                type="button"
                onClick={() => goToTalentResultPage(talentResultPage + 1)}
                disabled={talentResultPage === talentResultPageCount || isLoadingTalents}
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:hover:bg-slate-950/60 cursor-pointer"
              >
                Trang sau
              </button>
            </div>
          )}

          {hasMoreTalents && <div ref={loadMoreRef} className="h-10 w-full" />}
        </main>
      </div>

      <GuestActionPrompt />
    </div>
  );
}
