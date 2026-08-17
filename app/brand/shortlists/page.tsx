"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpDown, Check, CheckCircle2, ChevronDown, Heart, Search, SlidersHorizontal, X } from "lucide-react";
import {
  addBrandRosterTalent,
  loadBrandRosterTalents,
  loadBrandTalents,
  loadBrandWishlists,
  removeTalentFromWishlist,
  removeBrandRosterTalent,
} from "@/lib/brand-api";
import { getAuthToken } from "@/lib/api-client";
import { loadGuestSavedTalentIds, notifySavedTalentsUpdated, saveGuestSavedTalentIds } from "@/lib/guest-saved-talents";
import { addViewedTalentId, loadViewedTalentIds } from "@/lib/talent-view-history";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { normalizeLocationName, useCityFilterOptions } from "@/hooks/use-location-options";
import { getTalentTypes } from "@/components/talents/TalentCard";
import TalentFilterCityDialog from "@/components/talents/TalentFilterCityDialog";
import TalentFilterDialog from "@/components/talents/TalentFilterDialog";
import SavedIdols from "./saved-idols";
import ViewedIdol from "./viewed-idol";
import {
  TALENT_TYPE_VALUES,
  normalizeTalentTypeLabel,
} from "@/components/ui/ComboboxOptionValues";

type ToastItem = {
  id: string;
  message: string;
  tone: "success" | "error";
};

type TalentSortOption = "near_me" | "rating" | "newest" | "oldest" | "name_asc" | "name_desc";

const SHORTLIST_PAGE_SIZE = 12;
const allValue = "Tất cả";

const TALENT_SORT_OPTIONS: Array<{ value: TalentSortOption; label: string }> = [
  { value: "near_me", label: "Gần tôi" },
  { value: "rating", label: "Nổi bật" },
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "name_asc", label: "Tên A - Z" },
  { value: "name_desc", label: "Tên Z - A" },
];

const genderOptions = [
  { label: "Tất cả", value: allValue },
  { label: "Nữ", value: "female" },
  { label: "Nam", value: "male" },
  { label: "Khác", value: "other" },
];

function normalizeCityName(cityName: string): string {
  return normalizeLocationName(cityName);
}

const DISTRICT_FILTER_PREFIX = "district:";

function parseDistrictLocationValue(value: string) {
  if (!value.startsWith(DISTRICT_FILTER_PREFIX)) return null;
  const [city = "", district = ""] = value.slice(DISTRICT_FILTER_PREFIX.length).split(":");
  if (!city || !district) return null;
  return {
    city: decodeURIComponent(city),
    district: decodeURIComponent(district),
  };
}

function isAllLocation(val?: string): boolean {
  if (!val) return true;
  const n = val.toLowerCase().trim();
  return n === "all" || n === "toàn quốc" || n === "toan quoc" || n === "tất cả" || n === "tat ca";
}

function matchesTalentLocation(talent: any, filterValue: string) {
  if (isAllLocation(filterValue)) return true;

  const districtFilter = parseDistrictLocationValue(filterValue);
  if (districtFilter) {
    return (
      normalizeCityName(talent.city || "") === normalizeCityName(districtFilter.city) &&
      normalizeCityName(talent.district || talent.location || "") === normalizeCityName(districtFilter.district)
    );
  }

  return normalizeCityName(talent.city || "") === normalizeCityName(filterValue);
}

function formatLocationFilterLabel(value: string, options: { label: string; value: string }[]) {
  if (isAllLocation(value)) return "Toàn quốc";

  const districtFilter = parseDistrictLocationValue(value);
  if (districtFilter) {
    const cityLabel = options.find((option) => option.value === districtFilter.city)?.label || districtFilter.city;
    return `${cityLabel}, ${districtFilter.district}`;
  }

  return options.find((option) => option.value === value)?.label || value;
}


const typeOptions = [
  { label: "Tất cả", value: allValue },
  ...TALENT_TYPE_VALUES.map((type: string) => ({ label: normalizeTalentTypeLabel(type), value: type })),
];

type FilterDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  icon?: React.ComponentType<any>;
  align?: "left" | "right";
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
  icon: Icon,
  align = "left",
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const isDefaultValue = value === allValue || !value;

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const term = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, search, searchable]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const style: React.CSSProperties = {
        position: "fixed",
        top: rect.bottom + 6,
        zIndex: 99999,
        width: rect.width,
      };
      if (align === "right") {
        style.right = window.innerWidth - rect.right;
      } else {
        style.left = rect.left;
      }
      setDropdownStyle(style);
    }
  }, [isOpen, align]);

  const panelContent = isOpen && (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="max-h-60 overflow-hidden rounded-xl border border-[#F0D7D3] bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 dark:border-[#2B313D] dark:bg-[#12151C]"
    >
      {searchable && (
        <div className="mb-1.5 px-1">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-[#F0D7D3] bg-white px-2.5 py-1.5 text-xs text-[#191116] outline-none placeholder:text-[#9A8B88] focus:border-[#8F0709] dark:border-white/10 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#C9A86A]/50"
            autoFocus
          />
        </div>
      )}
      <div className="max-h-44 space-y-0.5 overflow-y-auto pr-0.5 custom-scrollbar">
        {filteredOptions.length === 0 ? (
          <div className="px-3 py-2 text-center text-xs text-[#9A8B88] dark:text-slate-500">{emptyText}</div>
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
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                  isSelected
                    ? "bg-[#FFF0EE] font-bold text-[#8F0709] dark:bg-[#C9A86A]/20 dark:text-[#C9A86A]"
                    : "text-[#191116] hover:bg-[#FFF0EE] hover:text-[#8F0709] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#8F0709] dark:text-[#C9A86A]" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("relative w-full", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-[50px] w-full items-center justify-between gap-2 rounded-2xl border border-[#F0D7D3] bg-white px-4 text-xs font-semibold text-[#191116] outline-none transition-all duration-300 hover:border-[#8F0709] shadow-sm dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:hover:border-[#C9A86A]/40",
          isOpen && "border-[#8F0709] bg-[#FFF0EE] dark:border-[#C9A86A]/60 dark:bg-slate-900/90"
        )}
      >
        <span className="flex items-center gap-1.5 truncate text-left">
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-[#8F0709] dark:text-slate-400" />}
          <span className="truncate">{isDefaultValue ? placeholder : (selectedOption?.label || placeholder)}</span>
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-[#8F0709] transition-transform duration-300 dark:text-slate-400", isOpen && "rotate-180")} />
      </button>

      {typeof window !== "undefined" && panelContent && createPortal(panelContent, document.body)}
    </div>
  );
}

type MultiFilterDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
};

function MultiFilterDropdown({
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  className,
}: MultiFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDefaultValue = value === allValue || !value;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = useMemo(() => {
    if (isDefaultValue) return placeholder;
    const values = value.split(",").filter(Boolean);
    const labels = values.map((item) => options.find((option) => option.value === item)?.label).filter(Boolean);
    if (labels.length <= 2) return labels.join(", ");
    return `Đã chọn ${labels.length} loại hình`;
  }, [isDefaultValue, options, placeholder, value]);

  return (
    <div ref={dropdownRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-[50px] w-full items-center justify-between gap-2 rounded-2xl border border-[#F0D7D3] bg-white px-4 text-xs font-semibold text-[#191116] outline-none transition-all duration-300 hover:border-[#8F0709] shadow-sm dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:hover:border-[#C9A86A]/40",
          isOpen && "border-[#8F0709] bg-[#FFF0EE] dark:border-[#C9A86A]/60 dark:bg-slate-900/90"
        )}
      >
        <span className="truncate text-left font-medium">{selectedLabel}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-[#8F0709] transition-transform duration-300 dark:text-slate-400", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 max-h-60 w-full overflow-hidden rounded-xl border border-[#F0D7D3] bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 dark:border-[#2B313D] dark:bg-[#12151C]">
          <div className="max-h-52 space-y-0.5 overflow-y-auto pr-0.5 custom-scrollbar">
            {options.map((opt) => {
              const isAll = opt.value === allValue;
              const isSelected = isAll
                ? value === allValue
                : value !== allValue && value.split(",").includes(opt.value);

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (isAll) {
                      onChange(allValue);
                      return;
                    }
                    const currentList = value === allValue ? [] : value.split(",").filter(Boolean);
                    const nextList = currentList.includes(opt.value)
                      ? currentList.filter((item) => item !== opt.value)
                      : [...currentList, opt.value];
                    onChange(nextList.length ? nextList.join(",") : allValue);
                  }}
                  className={cn(
                    "flex w-full items-center rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors",
                    isSelected
                      ? "bg-[#FFF0EE] font-bold text-[#8F0709] dark:bg-[#C9A86A]/10 dark:text-[#C9A86A]"
                      : "text-[#191116] hover:bg-[#FFF0EE] hover:text-[#8F0709] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                  )}
                >
                  <div className={cn(
                    "mr-2.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-all",
                    isSelected
                      ? "border-[#8F0709] bg-[#8F0709] text-white dark:border-[#C9A86A] dark:bg-[#C9A86A] dark:text-slate-950"
                      : "border-[#F0D7D3] bg-white text-transparent dark:border-white/20 dark:bg-slate-950/40"
                  )}>
                    <Check className="h-2.5 w-2.5 stroke-[3px]" />
                  </div>
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const TALENT_TYPE_MAP: Record<string, string> = {
  model: "người mẫu",
  "người mẫu": "người mẫu",
  actor: "diễn viên",
  "diễn viên": "diễn viên",
  kol: "kol",
  koc: "koc",
  livestreamer: "livestreamer",
  mc: "mc",
  pg: "pg/pb",
  pb: "pg/pb",
  "pg/pb": "pg/pb",
  pageant: "hoa hậu",
  "hoa hậu": "hoa hậu",
};

function normalizeTalentType(type: string): string {
  const normalized = type.toLowerCase().trim();
  return TALENT_TYPE_MAP[normalized] || normalized;
}

function matchesGenderValue(talentGender: string, filterGender: string): boolean {
  if (filterGender === allValue) return true;

  const g1 = String(talentGender || "").toLowerCase().trim();
  const g2 = String(filterGender || "").toLowerCase().trim();

  const isFemale = g1 === "female" || g1 === "nữ" || g1 === "nu";
  const isMale = g1 === "male" || g1 === "nam";
  const isOther = g1 === "other" || g1 === "khác" || g1 === "khac";

  if (g2 === "female") return isFemale;
  if (g2 === "male") return isMale;
  if (g2 === "other") return isOther;

  return g1 === g2;
}

export default function BrandShortlistsPage() {
  const cityOptions = useCityFilterOptions("Toàn quốc", allValue);
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"saved" | "viewed">("saved");
  const [allTalents, setAllTalents] = useState<any[]>([]);
  const [talentList, setTalentList] = useState<any[]>([]);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishlistItemIds, setWishlistItemIds] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [brandTalentIds, setBrandTalentIds] = useState<string[]>([]);
  const [brandRosterMap, setBrandRosterMap] = useState<Record<string, string>>({});
  const [addingBrandTalentIds, setAddingBrandTalentIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedGender, setSelectedGender] = useState(allValue);
  const [selectedType, setSelectedType] = useState(allValue);
  const [selectedCity, setSelectedCity] = useState(allValue);
  const [minHeight, setMinHeight] = useState(150);
  const [maxHeight, setMaxHeight] = useState(190);
  const [minWeight, setMinWeight] = useState(40);
  const [maxWeight, setMaxWeight] = useState(90);
  const [sortOption, setSortOption] = useState<TalentSortOption>("near_me");
  const [isMobileCitySelectorOpen, setIsMobileCitySelectorOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedVisibleCount, setSavedVisibleCount] = useState(SHORTLIST_PAGE_SIZE);
  const [viewedVisibleCount, setViewedVisibleCount] = useState(SHORTLIST_PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!getAuthToken()) {
      loadBrandTalents([]).then((backendTalents) => {
        const guestSavedIds = loadGuestSavedTalentIds();
        setAllTalents(backendTalents || []);
        setViewedIds(loadViewedTalentIds());
        setSavedIds(guestSavedIds);
        setTalentList((backendTalents || []).filter((talent: any) => guestSavedIds.includes(String(talent.id))));
        setWishlistId(null);
        setWishlistItemIds({});
        setBrandTalentIds([]);
        setBrandRosterMap({});
      });
      return;
    }

    Promise.all([
      loadBrandTalents([]),
      loadBrandWishlists([]),
      loadBrandRosterTalents().catch(() => []),
    ]).then(([backendTalents, wishlists, rosterItems]) => {
      setAllTalents(backendTalents || []);
      setViewedIds(loadViewedTalentIds());
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

  const viewedTalents = useMemo(() => {
    const talentsById = new Map((allTalents || []).map((talent: any) => [String(talent.id), talent]));
    return viewedIds.map((id) => talentsById.get(id)).filter(Boolean);
  }, [allTalents, viewedIds]);

  const activeTalents = activeTab === "saved" ? savedTalents : viewedTalents;

  const currentCityLabel = useMemo(() => {
    return formatLocationFilterLabel(selectedCity, cityOptions);
  }, [selectedCity]);

  const filteredSavedTalents = useMemo(() => {
    const keyword = searchInput.trim().toLowerCase();

    return activeTalents
      .filter((talent) => {
        const talentTypes = getTalentTypes(talent);
        const matchesSearch =
          !keyword ||
          String(talent.name || "").toLowerCase().includes(keyword) ||
          (talent.skills || []).some((skill: string) => String(skill).toLowerCase().includes(keyword)) ||
          talentTypes.some((type) => type.toLowerCase().includes(keyword));
        const matchesGender = matchesGenderValue(talent.gender || "", selectedGender);
        const matchesType =
          selectedType === allValue ||
          talentTypes.some((type) => {
            const normalizedTalent = normalizeTalentType(type);
            const activeFilterTypes = selectedType.split(",").map((item) => normalizeTalentType(item));
            return activeFilterTypes.includes(normalizedTalent);
          });
        const matchesCity = matchesTalentLocation(talent, selectedCity);
        const matchesHeight = !talent.height || (talent.height >= minHeight && talent.height <= maxHeight);
        const matchesWeight = !talent.weight || (talent.weight >= minWeight && talent.weight <= maxWeight);

        return matchesSearch && matchesGender && matchesType && matchesCity && matchesHeight && matchesWeight;
      })
      .sort((a, b) => {
        if (sortOption === "name_asc") return String(a.name || "").localeCompare(String(b.name || ""), "vi");
        if (sortOption === "name_desc") return String(b.name || "").localeCompare(String(a.name || ""), "vi");
        if (sortOption === "newest") return Number(b.id || 0) - Number(a.id || 0);
        if (sortOption === "oldest") return Number(a.id || 0) - Number(b.id || 0);
        return 0;
      });
  }, [activeTalents, maxHeight, maxWeight, minHeight, minWeight, searchInput, selectedCity, selectedGender, selectedType, sortOption]);

  const activeVisibleCount = activeTab === "saved" ? savedVisibleCount : viewedVisibleCount;
  const visibleShortlistTalents = useMemo(
    () => filteredSavedTalents.slice(0, activeVisibleCount),
    [activeVisibleCount, filteredSavedTalents]
  );
  const hasMoreShortlistTalents = activeVisibleCount < filteredSavedTalents.length;

  useEffect(() => {
    setSavedVisibleCount(SHORTLIST_PAGE_SIZE);
    setViewedVisibleCount(SHORTLIST_PAGE_SIZE);
  }, [maxHeight, maxWeight, minHeight, minWeight, searchInput, selectedCity, selectedGender, selectedType, sortOption]);

  useEffect(() => {
    if (!hasMoreShortlistTalents) return;

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;

        if (activeTab === "saved") {
          setSavedVisibleCount((current) => current + SHORTLIST_PAGE_SIZE);
        } else {
          setViewedVisibleCount((current) => current + SHORTLIST_PAGE_SIZE);
        }
      },
      { rootMargin: "360px 0px", threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [activeTab, hasMoreShortlistTalents, visibleShortlistTalents.length]);

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
    if (!getAuthToken()) {
      const nextIds = savedIds.filter((id) => id !== talentId);
      saveGuestSavedTalentIds(nextIds);
      setSavedIds(nextIds);
      pushToast("Đã xoá khỏi 'Idol đã lưu'.");
      return;
    }

    const itemId = wishlistItemIds[talentId];
    if (!wishlistId || !itemId) return;

    try {
      await removeTalentFromWishlist(wishlistId, itemId);
    } catch (error) {
      console.warn("Backend remove failed, updating locally", error);
    }

    const nextSavedIds = savedIds.filter((id) => id !== talentId);
    setSavedIds(nextSavedIds);
    notifySavedTalentsUpdated(nextSavedIds.length);
    setWishlistItemIds((current) => {
      const next = { ...current };
      delete next[talentId];
      return next;
    });
    pushToast("Đã xoá khỏi 'Idol đã lưu'.");
  }

  async function addTalentToBrand(talentId: string) {
    if (!talentId || brandTalentIds.includes(talentId) || addingBrandTalentIds.includes(talentId)) return;

    setAddingBrandTalentIds((current) => [...current, talentId]);

    try {
      const res = await addBrandRosterTalent(talentId, "Thêm từ 'Idol đã lưu'.");
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
      <section className="block md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md pt-3.5 pb-2.5 border-b border-[#F0D7D3] -mx-4 px-4 dark:bg-[#070913]/95 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all",
              selectedGender !== allValue || selectedType !== allValue || minHeight !== 150 || maxHeight !== 190 || minWeight !== 40 || maxWeight !== 90
                ? "border-[#8F0709] bg-[#FFF0EE] text-[#8F0709] dark:border-[#C9A86A] dark:bg-[#C9A86A]/20 dark:text-[#C9A86A]"
                : "border-[#F0D7D3] bg-white text-[#574D54] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-400"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsMobileCitySelectorOpen(true)}
            className="relative flex shrink-0 items-center gap-1"
          >
            <span className="font-display text-[15px] font-black tracking-tight text-[#191116] whitespace-nowrap dark:text-white">
              {currentCityLabel}
            </span>
            <ChevronDown className="h-4 w-4 text-[#8F0709] dark:text-[#C9A86A]" />
          </button>

          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F0709] dark:text-[#C9A86A]" />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tên idol..."
              className="h-9 w-full rounded-full border border-[#F0D7D3] bg-white pl-8.5 pr-8 text-xs font-semibold text-[#191116] outline-none placeholder:text-[#9A8B88] focus:border-[#8F0709] shadow-sm dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#C9A86A]/60"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A8B88] hover:text-[#8F0709] dark:text-slate-400 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] transition active:scale-95 dark:border-[#C9A86A]/50 dark:bg-[#C9A86A]/15 dark:text-[#C9A86A]"
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-[#F0D7D3] bg-white p-1 shadow-sm dark:border-white/5 dark:bg-slate-950/45">
          {([
            { key: "saved", label: "Idol đã lưu", count: savedTalents.length },
            { key: "viewed", label: "Idol đã xem", count: viewedTalents.length },
          ] as const).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex h-9 items-center justify-center gap-1.5 rounded-xl text-xs font-black transition cursor-pointer",
                  isActive
                    ? "bg-[#FFF0EE] text-[#8F0709] shadow-sm dark:bg-[#C9A86A]/15 dark:text-[#C9A86A]"
                    : "text-[#574D54] active:text-[#191116] dark:text-slate-400 dark:active:text-white"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none",
                    isActive ? "bg-[#8F0709]/10 text-[#8F0709] dark:bg-[#C9A86A]/20" : "bg-[#F0D7D3]/40 text-[#574D54] dark:bg-white/5"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="hidden md:block relative z-40 overflow-visible rounded-3xl border border-[#F0D7D3] bg-white p-6 shadow-sm dark:border-[#C9A86A]/30 dark:bg-[#0f121d]/90">
        <div className="relative z-10 mb-4">
          <h1 className="font-display text-lg font-black tracking-tight text-[#191116] md:text-xl dark:text-white">
            {activeTab === "saved" ? "Idol đã lưu" : "Idol đã xem"}{" "}
            <span className="text-[#8F0709] dark:bg-gradient-to-r dark:from-amber-200 dark:via-yellow-400 dark:to-amber-500 dark:bg-clip-text dark:text-transparent">
              ({filteredSavedTalents.length})
            </span>
          </h1>
        </div>

        <div className="relative z-10 flex flex-col xl:flex-row gap-3 items-stretch">
          <div className="group relative flex-1 min-w-[280px]">
            <div className="relative h-full w-full">
              <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8F0709] transition-colors dark:text-[#C9A86A]" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Nhập tên Idol..."
                className="h-[50px] w-full rounded-2xl border border-[#F0D7D3] bg-white pl-12 pr-10 text-xs font-semibold text-[#191116] outline-none transition-all duration-300 placeholder:text-[#9A8B88] focus:border-[#8F0709] shadow-sm dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#C9A86A]/60"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A8B88] transition-colors hover:text-[#8F0709] dark:text-slate-450 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="w-full xl:w-auto xl:min-w-[170px]">
            <FilterDropdown
              value={selectedCity}
              onChange={setSelectedCity}
              options={cityOptions}
              searchPlaceholder="Nhập tỉnh/thành..."
              emptyText="Không tìm thấy địa điểm"
              placeholder="Toàn quốc"
            />
          </div>

          <div className="w-full xl:w-auto xl:min-w-[190px]">
            <MultiFilterDropdown
              value={selectedType}
              onChange={setSelectedType}
              options={typeOptions}
              placeholder="Loại hình Idol"
            />
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              style={{ color: "#ffffff" }}
              className="light-force-white flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white px-8 text-xs font-black uppercase tracking-wider shadow-md transition-all duration-300 hover:brightness-110 active:scale-95 xl:flex-none"
            >
              <Search className="h-4 w-4 stroke-[3] !text-white text-white" />
              <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">Tìm kiếm</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAdvancedFilters((current) => !current)}
              className={cn(
                "flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-2xl border px-5 text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 xl:flex-none shadow-sm",
                showAdvancedFilters
                  ? "border-[#8F0709] bg-[#FFF0EE] text-[#8F0709] dark:border-[#C9A86A] dark:bg-[#C9A86A]/20 dark:text-[#C9A86A]"
                  : "border-[#F0D7D3] bg-white text-[#574D54] hover:border-[#8F0709] hover:text-[#8F0709] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-[#C9A86A]/40 dark:hover:bg-white/10 dark:hover:text-white"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Bộ lọc</span>
            </button>

            <div className="relative z-50 w-full xl:w-[160px]">
              <FilterDropdown
                value={sortOption}
                onChange={(value) => setSortOption(value as TalentSortOption)}
                options={TALENT_SORT_OPTIONS}
                searchable={false}
                placeholder="Sắp xếp"
                icon={ArrowUpDown}
                align="right"
                className="[&>button]:!bg-white [&>button]:!border-[#F0D7D3] [&>button]:!text-[#574D54] [&>button]:hover:!border-[#8F0709] [&>button]:hover:!text-[#8F0709] dark:[&>button]:!bg-white/5 dark:[&>button]:!border-white/10 dark:[&>button]:!text-slate-300"
              />
            </div>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="relative z-10 mt-5 space-y-4 border-t border-[#F0D7D3] pt-5 animate-in slide-in-from-top-2 duration-300 dark:border-white/5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#574D54] dark:text-slate-400">
                  Giới tính
                </span>
                <FilterDropdown
                  value={selectedGender}
                  onChange={setSelectedGender}
                  options={genderOptions}
                  searchable={false}
                  placeholder="Giới tính"
                  className="[&>button]:!h-10 [&>button]:!rounded-xl [&>button]:!text-xs"
                />
              </div>

              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#574D54] dark:text-slate-400">
                  Chiều cao ({minHeight} - {maxHeight}cm)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={140}
                    max={200}
                    value={minHeight}
                    onChange={(event) => setMinHeight(Number(event.target.value))}
                    className="h-10 w-full rounded-xl border border-[#F0D7D3] bg-white px-3 text-center text-xs font-bold text-[#191116] outline-none focus:border-[#8F0709] shadow-sm dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:focus:border-[#C9A86A]/60"
                  />
                  <input
                    type="number"
                    min={140}
                    max={200}
                    value={maxHeight}
                    onChange={(event) => setMaxHeight(Number(event.target.value))}
                    className="h-10 w-full rounded-xl border border-[#F0D7D3] bg-white px-3 text-center text-xs font-bold text-[#191116] outline-none focus:border-[#8F0709] shadow-sm dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:focus:border-[#C9A86A]/60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#574D54] dark:text-slate-400">
                  Cân nặng ({minWeight} - {maxWeight}kg)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={35}
                    max={120}
                    value={minWeight}
                    onChange={(event) => setMinWeight(Number(event.target.value))}
                    className="h-10 w-full rounded-xl border border-[#F0D7D3] bg-white px-3 text-center text-xs font-bold text-[#191116] outline-none focus:border-[#8F0709] shadow-sm dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:focus:border-[#C9A86A]/60"
                  />
                  <input
                    type="number"
                    min={35}
                    max={120}
                    value={maxWeight}
                    onChange={(event) => setMaxWeight(Number(event.target.value))}
                    className="h-10 w-full rounded-xl border border-[#F0D7D3] bg-white px-3 text-center text-xs font-bold text-[#191116] outline-none focus:border-[#8F0709] shadow-sm dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:focus:border-[#C9A86A]/60"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="hidden md:block">
        <div className="grid w-full max-w-[460px] grid-cols-2 gap-2 rounded-2xl border border-[#F0D7D3] bg-white p-1 shadow-sm dark:border-white/5 dark:bg-slate-950/45">
          {([
            { key: "saved", label: "Idol đã lưu", count: savedTalents.length },
            { key: "viewed", label: "Idol đã xem", count: viewedTalents.length },
          ] as const).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex h-10 items-center justify-center gap-2 rounded-xl border text-xs font-black transition cursor-pointer",
                  isActive
                    ? "border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] shadow-sm dark:border-[#C9A86A]/35 dark:bg-[#C9A86A]/15 dark:text-[#C9A86A]"
                    : "border-transparent text-[#574D54] hover:bg-[#FFF7F6] hover:text-[#191116] dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold leading-none",
                    isActive ? "bg-[#8F0709]/10 text-[#8F0709] dark:bg-[#C9A86A]/20 dark:text-[#F4D36A]" : "bg-[#F0D7D3]/40 text-[#574D54] dark:bg-white/5 dark:text-slate-500"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        {activeTab === "saved" ? (
          <SavedIdols
            talents={visibleShortlistTalents}
            savedIds={savedIds}
            brandTalentIds={brandTalentIds}
            addingBrandTalentIds={addingBrandTalentIds}
            onToggleSaved={(talentId) => void removeTalent(talentId)}
            onView={(talent) => {
              setViewedIds(addViewedTalentId(talent.id));
              router.push(`/brand/talents/${talent.id}?from=/brand/shortlists`);
            }}
            onAddToBrand={(talentId) => void addTalentToBrand(talentId)}
            onRemoveFromBrand={(talentId) => void removeTalentFromBrand(talentId)}
          />
        ) : (
          <ViewedIdol
            talents={visibleShortlistTalents}
            savedIds={savedIds}
            brandTalentIds={brandTalentIds}
            addingBrandTalentIds={addingBrandTalentIds}
            onToggleSaved={(talentId) => void removeTalent(talentId)}
            onView={(talent) => {
              setViewedIds(addViewedTalentId(talent.id));
              router.push(`/brand/talents/${talent.id}?from=/brand/shortlists`);
            }}
            onAddToBrand={(talentId) => void addTalentToBrand(talentId)}
            onRemoveFromBrand={(talentId) => void removeTalentFromBrand(talentId)}
          />
        )}
        {hasMoreShortlistTalents && <div ref={loadMoreRef} className="h-10 w-full" />}
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
      <TalentFilterCityDialog
        open={isMobileCitySelectorOpen}
        cityOptions={cityOptions}
        selectedCity={selectedCity}
        citySearchQuery={citySearchQuery}
        setCitySearchQuery={setCitySearchQuery}
        onClose={() => {
          setIsMobileCitySelectorOpen(false);
          setCitySearchQuery("");
        }}
        onSelectCity={(city) => {
          setSelectedCity(city);
          setIsMobileCitySelectorOpen(false);
          setCitySearchQuery("");
        }}
        onRefreshLocation={() => pushToast("Đang cập nhật vị trí...")}
      />
      <TalentFilterDialog
        open={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        genderOptions={genderOptions}
        cityOptions={cityOptions}
        typeOptions={typeOptions}
        sortOptions={TALENT_SORT_OPTIONS}
        allValue={allValue}
        selectedGender={selectedGender}
        setSelectedGender={setSelectedGender}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        sortOption={sortOption}
        setSortOption={setSortOption}
        minHeight={minHeight}
        setMinHeight={setMinHeight}
        maxHeight={maxHeight}
        setMaxHeight={setMaxHeight}
        minWeight={minWeight}
        setMinWeight={setMinWeight}
        maxWeight={maxWeight}
        setMaxWeight={setMaxWeight}
        onReset={() => {
          setSelectedGender(allValue);
          setSelectedType(allValue);
          setSelectedCity(allValue);
          setMinHeight(150);
          setMaxHeight(190);
          setMinWeight(40);
          setMaxWeight(90);
          setSortOption("near_me");
          pushToast("Đã đặt lại bộ lọc.");
        }}
        onApply={() => {
          setIsMobileFiltersOpen(false);
          pushToast("Đã áp dụng bộ lọc.");
        }}
      />
    </div>
  );
}
