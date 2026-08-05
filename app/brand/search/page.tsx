"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpDown,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
  Heart,
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
import TalentCard from "@/components/talents/TalentCard";
import TalentCardMobile from "@/components/talents/TalentCardMobile";
import TalentFilterCityDialog from "@/components/talents/TalentFilterCityDialog";
import TalentFilterDialog from "@/components/talents/TalentFilterDialog";
import KeywordSuggestionsDropdown from "@/components/search/KeywordSuggestionsDropdown";
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
  loadBrandPartnerProfile,
  loadBrandRosterTalents,
  loadBrandTalentsPage,
  loadBrandWishlists,
  mapBackendPartnerProfile,
  removeBrandRosterTalent,
  removeTalentFromWishlist,
} from "@/lib/brand-api";
import { getAuthToken } from "@/lib/api-client";
import { loadGuestSavedTalentIds, notifySavedTalentsUpdated, toggleGuestSavedTalentId } from "@/lib/guest-saved-talents";
import { addViewedTalentId } from "@/lib/talent-view-history";
import { useGuestActionPrompt } from "@/components/guest-action-prompt";
import { buildTalentSearchSuggestions } from "@/lib/search-suggestions.mjs";

const TALENTS_PER_PAGE = 24;
const TALENT_PAGES_PER_RESULT_PAGE = 2;
const TALENTS_PER_RESULT_PAGE = TALENTS_PER_PAGE * TALENT_PAGES_PER_RESULT_PAGE;

type TalentSortOption = "near_me" | "rating" | "newest" | "oldest" | "name_asc" | "name_desc";
type MobileTalentQuickTab = "all" | "top_month" | "newest" | "top_reviewed";

const MOBILE_TALENT_QUICK_TABS: Array<{ value: MobileTalentQuickTab | "more"; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "top_month", label: "Top tháng" },
  { value: "top_reviewed", label: "Top đánh giá" },
  { value: "more", label: "Thêm" },
];

const TALENT_SORT_OPTIONS: Array<{ value: TalentSortOption; label: string }> = [
  { value: "near_me", label: "Gần tôi" },
  { value: "rating", label: "Nổi bật" },
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "name_asc", label: "Tên A - Z" },
  { value: "name_desc", label: "Tên Z - A" },
];

const allValue = "Tất cả";

const TALENT_TYPE_MAP: Record<string, string> = {
  "model": "người mẫu",
  "người mẫu": "người mẫu",
  "actor": "diễn viên",
  "diễn viên": "diễn viên",
  "kol": "kol",
  "koc": "koc",
  "livestreamer": "livestreamer",
  "mc": "mc",
  "pg": "pg/pb",
  "pb": "pg/pb",
  "pg/pb": "pg/pb",
  "pageant": "hoa hậu",
  "hoa hậu": "hoa hậu",
};

function normalizeTalentType(type: string): string {
  const normalized = type.toLowerCase().trim();
  return TALENT_TYPE_MAP[normalized] || normalized;
}

function tierRank(tier: unknown): number {
  const normalized = String(tier || "").trim().toLowerCase();
  if (normalized === "s" || normalized === "tier s" || normalized === "hang s" || normalized === "hạng s") return 0;
  if (normalized === "a" || normalized === "tier a" || normalized === "hang a" || normalized === "hạng a") return 1;
  if (normalized === "b" || normalized === "tier b" || normalized === "hang b" || normalized === "hạng b") return 2;
  if (normalized === "c" || normalized === "tier c" || normalized === "hang c" || normalized === "hạng c") return 3;
  if (normalized === "potential" || normalized === "tiềm năng" || normalized === "tiem nang") return 4;
  return 5;
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

function formatActionError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

const genderOptions = [
  { label: "Tất cả", value: allValue },
  { label: "Nữ", value: "female" },
  { label: "Nam", value: "male" },
  { label: "Khác", value: "other" },
];

function normalizeCityName(cityName: string): string {
  return cityName.toLowerCase().replace(/^(tỉnh|thành phố|tp\.?)\s+/i, "").trim();
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

function matchesTalentLocation(talent: any, filterValue: string) {
  if (filterValue === allValue) return true;

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
  if (value === allValue) return "Toàn quốc";

  const districtFilter = parseDistrictLocationValue(value);
  if (districtFilter) {
    const cityLabel = options.find((option) => option.value === districtFilter.city)?.label || districtFilter.city;
    return `${cityLabel}, ${districtFilter.district}`;
  }

  return options.find((opt) => opt.value === value)?.label || value;
}

const cityOptions = [
  { label: "Toàn quốc", value: allValue },
  ...CITY_VALUES.map((city: string) => ({ label: city, value: normalizeCityName(city) })),
];

const HOT_TALENT_LOCATIONS = [
  { label: "Hà Nội", value: normalizeCityName("Hà Nội"), count: "100+ idol" },
  { label: "Hồ Chí Minh", value: normalizeCityName("TP. Hồ Chí Minh"), count: "100+ idol" },
  { label: "Đà Nẵng", value: normalizeCityName("Đà Nẵng"), count: "40+ idol" },
  { label: "Hải Phòng", value: normalizeCityName("Hải Phòng"), count: "30+ idol" },
  { label: "Cần Thơ", value: normalizeCityName("Cần Thơ"), count: "20+ idol" },
];

const typeOptions = [
  { label: "Tất cả", value: allValue },
  ...TALENT_TYPE_VALUES.map((type: string) => ({ label: normalizeTalentTypeLabel(type), value: type })),
];

function getTalentTypes(talent: any): string[] {
  let rawTypes: any = null;

  if (talent?.talentTypes) rawTypes = talent.talentTypes;
  else if (talent?.talent_types) rawTypes = talent.talent_types;
  else if (talent?.categories) rawTypes = talent.categories;
  else if (talent?.categoryNames) rawTypes = talent.categoryNames;

  // If it's a string, try to parse it as JSON
  if (typeof rawTypes === "string") {
    try {
      const parsed = JSON.parse(rawTypes);
      if (Array.isArray(parsed)) {
        rawTypes = parsed;
      } else {
        rawTypes = [rawTypes];
      }
    } catch {
      // If parsing fails, split by common delimiters
      rawTypes = rawTypes.split(/[,/;]/).map((s: string) => s.trim()).filter(Boolean);
    }
  }

  if (Array.isArray(rawTypes) && rawTypes.length) {
    return Array.from(
      new Set(
        rawTypes
          .map((type: any) => {
            if (typeof type === "string") return normalizeTalentTypeLabel(type.trim());
            return normalizeTalentTypeLabel(String(type?.name || type?.title || type || "").trim());
          })
          .filter(Boolean)
      )
    );
  }

  const singleType = talent?.type || talent?.talentType;
  return singleType ? [normalizeTalentTypeLabel(String(singleType).trim())] : [];
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
  icon?: React.ComponentType<any>;
  variant?: "default" | "pill";
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
  variant = "default",
  align = "left",
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

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

  const isPill = variant === "pill";
  const isDefaultValue = value === "Tất cả" || value === allValue || !value;
  const isActivePill = !isDefaultValue;

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const panelWidth = isPill ? 160 : rect.width;
      const style: React.CSSProperties = {
        position: "fixed",
        top: rect.bottom + 6,
        zIndex: 99999,
      };
      if (align === "right") {
        style.right = window.innerWidth - rect.right;
        style.width = panelWidth;
      } else {
        style.left = rect.left;
        style.width = panelWidth;
      }
      setDropdownStyle(style);
    }
  }, [isOpen, align, variant]);

  const panelContent = isOpen && (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="max-h-60 overflow-hidden rounded-xl border border-[#2B313D] bg-[#12151C] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
    >
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
  );

  return (
    <div ref={undefined} className={cn(isPill ? "relative flex-1 min-w-0" : "relative w-full", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          isPill
            ? cn(
              "flex h-8 w-full items-center justify-between gap-1 rounded-full border text-[10.5px] px-2.5 transition-all cursor-pointer font-semibold",
              isActivePill
                ? "border-[#C9A86A]/50 bg-[#C9A86A]/15 text-[#C9A86A] font-bold"
                : "border-white/10 bg-slate-900/60 text-slate-350 hover:text-white"
            )
            : cn(
              "flex h-[50px] w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-xs text-white outline-none transition-all duration-300 hover:border-[#C9A86A]/40 focus:border-[#C9A86A]/60 shadow-inner cursor-pointer",
              isOpen && "border-[#C9A86A]/60 bg-slate-900/90"
            )
        )}
      >
        <span className="flex items-center gap-1.5 truncate text-left">
          {Icon && <Icon className={cn("h-3.5 w-3.5 shrink-0", isActivePill ? "text-[#C9A86A]" : "text-slate-400")} />}
          <span className="truncate">{isDefaultValue ? placeholder : (selectedOption?.label || placeholder)}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-300",
            isActivePill ? "text-[#C9A86A]" : "text-slate-400",
            isOpen && "rotate-180"
          )}
        />
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
  variant?: "default" | "pill";
  align?: "left" | "right";
};

function MultiFilterDropdown({
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  className,
  variant = "default",
  align = "left",
}: MultiFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDefaultValue = value === allValue || !value;

  const getSelectedLabel = () => {
    if (isDefaultValue) return placeholder;
    const vals = value.split(",").filter(Boolean);
    if (vals.length === 0) return placeholder;
    const labels = vals.map(v => options.find(opt => opt.value === v)?.label).filter(Boolean);
    if (labels.length <= 2) return labels.join(", ");
    return `Đã chọn ${labels.length} loại hình`;
  };

  const isPill = variant === "pill";
  const isActivePill = !isDefaultValue;

  return (
    <div ref={dropdownRef} className={cn(isPill ? "relative flex-1 min-w-0" : "relative w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          isPill
            ? cn(
              "flex h-8 w-full items-center justify-between gap-1 rounded-full border text-[10.5px] px-2.5 transition-all cursor-pointer font-semibold",
              isActivePill
                ? "border-[#C9A86A]/50 bg-[#C9A86A]/15 text-[#C9A86A] font-bold"
                : "border-white/10 bg-slate-900/60 text-slate-355 hover:text-white"
            )
            : cn(
              "flex h-[50px] w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-xs text-white outline-none transition-all duration-300 hover:border-[#C9A86A]/40 focus:border-[#C9A86A]/60 shadow-inner cursor-pointer",
              isOpen && "border-[#C9A86A]/60 bg-slate-900/90"
            )
        )}
      >
        <span className="truncate text-left font-medium">
          {getSelectedLabel()}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-300",
            isActivePill ? "text-[#C9A86A]" : "text-slate-400",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute top-full z-50 mt-1.5 max-h-60 overflow-hidden rounded-xl border border-[#2B313D] bg-[#12151C] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150",
          align === "right" ? "right-0" : "left-0",
          isPill ? "w-[180px]" : "w-full"
        )}>
          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
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
                    } else {
                      const currentList = value === allValue ? [] : value.split(",").filter(Boolean);
                      let newList: string[];
                      if (currentList.includes(opt.value)) {
                        newList = currentList.filter(v => v !== opt.value);
                      } else {
                        newList = [...currentList, opt.value];
                      }
                      if (newList.length === 0) {
                        onChange(allValue);
                      } else {
                        onChange(newList.join(","));
                      }
                    }
                  }}
                  className={cn(
                    "flex w-full items-center rounded-lg px-2.5 py-2 text-xs font-medium transition-colors text-left cursor-pointer",
                    isSelected
                      ? "bg-[#C9A86A]/10 text-[#C9A86A] font-bold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-all mr-2.5",
                    isSelected
                      ? "border-[#C9A86A] bg-[#C9A86A] text-slate-950"
                      : "border-white/20 bg-slate-950/40 text-transparent"
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
  const [isTalentSuggestOpen, setIsTalentSuggestOpen] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [isMobileCitySelectorOpen, setIsMobileCitySelectorOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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
  const [sortOption, setSortOption] = useState<TalentSortOption>("near_me");
  const [mobileQuickTab, setMobileQuickTab] = useState<MobileTalentQuickTab>("all");
  const [brandLocation, setBrandLocation] = useState({ city: "", district: "" });
  const talentRequestRef = useRef(0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    if (!isMobileSearchExpanded) return;

    setIsTalentSuggestOpen(true);
    window.setTimeout(() => {
      mobileSearchInputRef.current?.focus();
    }, 0);
  }, [isMobileSearchExpanded]);

  const closeMobileSearch = useCallback(() => {
    setIsMobileSearchExpanded(false);
    setIsTalentSuggestOpen(false);
  }, []);

  const applyHotTalentLocation = useCallback((city: string) => {
    setSelectedCity(city);
    setAppliedFilters((prev) => ({ ...prev, city }));
  }, []);

  const hasMobileFilterBadge =
    selectedGender !== allValue ||
    selectedType !== allValue ||
    selectedCity !== allValue ||
    minHeight !== 150 ||
    maxHeight !== 190 ||
    minWeight !== 40 ||
    maxWeight !== 90;

  const applyMobileQuickTab = useCallback((tab: MobileTalentQuickTab | "more") => {
    if (tab === "more") {
      setIsMobileFiltersOpen(true);
      return;
    }

    setMobileQuickTab(tab);

    if (tab === "all") {
      setSearchInput("");
      setSelectedGender(allValue);
      setSelectedType(allValue);
      setSelectedCity(allValue);
      setMinHeight(150);
      setMaxHeight(190);
      setMinWeight(40);
      setMaxWeight(90);
      setShowAdvancedFilters(false);
      setSortOption("near_me");
      setAppliedFilters({
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
      return;
    }

    const nextSort: TalentSortOption = tab === "newest" ? "newest" : "rating";
    setSortOption(nextSort);
    setAppliedFilters((prev) => ({ ...prev, query: searchInput }));
  }, [searchInput]);

  const talentQueryOptions = useMemo(() => ({
    q: appliedFilters.query || undefined,
    type: appliedFilters.type !== allValue
      ? appliedFilters.type.split(",").map((type) => type.trim()).filter(Boolean)
      : undefined,
    city: appliedFilters.city !== allValue
      ? parseDistrictLocationValue(appliedFilters.city)?.city || appliedFilters.city
      : undefined,
    gender: appliedFilters.gender !== allValue ? backendGenderValue(appliedFilters.gender) : undefined,
    minHeight: appliedFilters.showAdvancedFilters ? appliedFilters.minHeight : undefined,
    maxHeight: appliedFilters.showAdvancedFilters ? appliedFilters.maxHeight : undefined,
  }), [appliedFilters]);

  const currentCityLabel = useMemo(() => {
    return formatLocationFilterLabel(appliedFilters.city, cityOptions);
  }, [appliedFilters.city]);

  const talentSearchSuggestions = useMemo(
    () => buildTalentSearchSuggestions({
      talents: displayTalents,
      query: searchInput,
      limit: 7,
      isPartial: talentTotal > displayTalents.length,
    }),
    [displayTalents, searchInput, talentTotal],
  );

  const handleTalentSuggestionPick = useCallback((suggestion: any) => {
    const nextInput = String(suggestion.query || suggestion.label || "").trim();
    const nextSearchQuery = String(suggestion.searchQuery ?? nextInput).trim();
    const nextType = suggestion.type || selectedType;
    const nextCity = suggestion.city || selectedCity;

    setSearchInput(nextInput);
    setSelectedType(nextType);
    setSelectedCity(nextCity);
    setAppliedFilters({
      query: nextSearchQuery,
      gender: selectedGender,
      type: nextType,
      city: nextCity,
      minHeight,
      maxHeight,
      minWeight,
      maxWeight,
      showAdvancedFilters,
    });
    setIsTalentSuggestOpen(false);
    setIsMobileSearchExpanded(false);
  }, [maxHeight, maxWeight, minHeight, minWeight, selectedCity, selectedGender, selectedType, showAdvancedFilters]);

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
        nearCity: sortOption === "near_me" ? brandLocation.city : undefined,
        nearDistrict: sortOption === "near_me" ? brandLocation.district : undefined,
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
  }, [brandLocation.city, brandLocation.district, sortOption, talentQueryOptions]);

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

    if (!getAuthToken()) {
      setSavedIds(loadGuestSavedTalentIds());
      setWishlistId(null);
      setWishlistItemIds({});
    } else {
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
    }

    loadBrandCampaigns([]).then((items) => {
      if (!cancelled) setBrandCampaigns(items);
    });

    loadBrandPartnerProfile(mapBackendPartnerProfile(null)).then((profile) => {
      if (!cancelled) {
        setBrandLocation({
          city: profile.city || "",
          district: (profile as any).district || "",
        });
      }
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

        const matchesGender = matchesGenderValue(talent.gender || "", appliedFilters.gender);
        const matchesType =
          appliedFilters.type === allValue ||
          talentTypes.some((type) => {
            const normalizedTalent = normalizeTalentType(type);
            const activeFilterTypes = appliedFilters.type.split(",").map(t => normalizeTalentType(t));
            return activeFilterTypes.includes(normalizedTalent);
          });
        const matchesCity = matchesTalentLocation(talent, appliedFilters.city);

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

        if (sortOption === "rating") {
          return tierRank(a.tier) - tierRank(b.tier);
        }

        if (sortOption === "near_me") {
          return 0;
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

    if (!getAuthToken()) {
      const result = toggleGuestSavedTalentId(id);
      setSavedIds(result.ids);
      pushToast(result.isSaved ? "Đã thêm vào danh sách đã lưu." : "Đã xóa khỏi danh sách đã lưu.");
      return;
    }

    try {
      if (savedIds.includes(id)) {
        const itemId = wishlistItemIds[id];
        if (wishlistId && itemId) {
          await removeTalentFromWishlist(wishlistId, itemId);
        }

        const nextSavedIds = savedIds.filter((item) => item !== id);
        setSavedIds(nextSavedIds);
        notifySavedTalentsUpdated(nextSavedIds.length);
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
      const nextSavedIds = savedIds.includes(id) ? savedIds : [...savedIds, id];
      setSavedIds(nextSavedIds);
      notifySavedTalentsUpdated(nextSavedIds.length);
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

      {/* Mobile-Only Search Header (Hidden on Desktop) */}
      <section className="block md:hidden sticky top-0 z-50 bg-[#070913]/95 backdrop-blur-md space-y-3 pt-3.5 pb-2.5 border-b border-white/5 -mx-4 px-4">
        {/* Row 1: City, Search Input, Search Button */}
        <div className="flex items-center gap-2.5">
          {/* Advanced Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className={cn(
              "flex items-center justify-center h-9 w-9 rounded-full border transition-all shrink-0 cursor-pointer",
              hasMobileFilterBadge
                ? "border-[#C9A86A] bg-[#C9A86A]/20 text-[#C9A86A]"
                : "border-white/10 bg-slate-900/60 text-slate-400"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          {/* City Selection Dropdown (Opens full-screen modal on mobile) */}
          <div
            onClick={() => setIsMobileCitySelectorOpen(true)}
            className="relative flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span className="font-display text-[15px] font-black tracking-tight text-white whitespace-nowrap">
              {currentCityLabel}
            </span>
            <ChevronDown className="h-4 w-4 text-[#C9A86A] pointer-events-none" />
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A86A]" />
            <input
              type="text"
              value={searchInput}
              onFocus={() => {
                setIsMobileSearchExpanded(true);
                setIsTalentSuggestOpen(true);
              }}
              onChange={(e) => {
                const nextQuery = e.target.value;
                setSearchInput(nextQuery);
                setAppliedFilters((prev) => ({ ...prev, query: nextQuery }));
                setIsTalentSuggestOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters();
                  closeMobileSearch();
                }
              }}
              placeholder="Tên idol..."
              className="w-full h-9 rounded-full border border-white/10 bg-slate-950/60 pl-8.5 pr-8 text-xs text-white outline-none focus:border-[#C9A86A]/60 placeholder:text-slate-500"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setAppliedFilters((prev) => ({ ...prev, query: "" }));
                  setIsTalentSuggestOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.push("/brand/shortlists")}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C9A86A]/50 bg-[#C9A86A]/15 text-[#C9A86A] transition-all hover:bg-[#C9A86A]/20 active:scale-95"
            aria-label="Mở danh sách đã lưu"
          >
            <Heart className="h-4 w-4 fill-current" />
            {savedIds.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-[#070913] bg-gradient-to-br from-amber-100 via-[#C9A86A] to-yellow-600 px-1 text-[9px] font-black leading-none text-slate-950 shadow-[0_0_8px_rgba(201,168,106,0.45)]">
                {savedIds.length > 99 ? "99+" : savedIds.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MOBILE_TALENT_QUICK_TABS.map((tab) => {
            const isMore = tab.value === "more";
            const isActive = isMore ? hasMobileFilterBadge : mobileQuickTab === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => applyMobileQuickTab(tab.value)}
                className={cn(
                  "h-8 shrink-0 rounded-full border px-3.5 text-[11px] font-black transition active:scale-95",
                  isActive
                    ? "border-[#C9A86A]/70 bg-[#C9A86A]/15 text-[#F9D66D] shadow-[0_0_14px_rgba(201,168,106,0.14)]"
                    : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-[#C9A86A]/35 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Collapsible Advanced Filters (Mobile Version) */}
        {showAdvancedFilters && (
          <div className="relative z-10 border-t border-white/5 pt-3 mt-1 space-y-3 animate-in slide-in-from-top-2 duration-300 bg-slate-950/40 p-3 rounded-xl border border-white/5">
            {/* Height Slider */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Chiều cao ({minHeight} - {maxHeight}cm)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500">Từ:</span>
                  <input
                    type="number"
                    min={140}
                    max={200}
                    value={minHeight}
                    onChange={(e) => {
                      setMinHeight(Number(e.target.value));
                      setAppliedFilters(prev => ({ ...prev, minHeight: Number(e.target.value) }));
                    }}
                    className="w-full h-8 rounded-lg border border-white/10 bg-slate-950 px-2 text-[11px] text-white outline-none focus:border-[#C9A86A]/60 text-center"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500">Đến:</span>
                  <input
                    type="number"
                    min={140}
                    max={200}
                    value={maxHeight}
                    onChange={(e) => {
                      setMaxHeight(Number(e.target.value));
                      setAppliedFilters(prev => ({ ...prev, maxHeight: Number(e.target.value) }));
                    }}
                    className="w-full h-8 rounded-lg border border-white/10 bg-slate-950 px-2 text-[11px] text-white outline-none focus:border-[#C9A86A]/60 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Weight Slider */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cân nặng ({minWeight} - {maxWeight}kg)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500">Từ:</span>
                  <input
                    type="number"
                    min={35}
                    max={120}
                    value={minWeight}
                    onChange={(e) => {
                      setMinWeight(Number(e.target.value));
                      setAppliedFilters(prev => ({ ...prev, minWeight: Number(e.target.value) }));
                    }}
                    className="w-full h-8 rounded-lg border border-white/10 bg-slate-950 px-2 text-[11px] text-white outline-none focus:border-[#C9A86A]/60 text-center"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500">Đến:</span>
                  <input
                    type="number"
                    min={35}
                    max={120}
                    value={maxWeight}
                    onChange={(e) => {
                      setMaxWeight(Number(e.target.value));
                      setAppliedFilters(prev => ({ ...prev, maxWeight: Number(e.target.value) }));
                    }}
                    className="w-full h-8 rounded-lg border border-white/10 bg-slate-950 px-2 text-[11px] text-white outline-none focus:border-[#C9A86A]/60 text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {isMobileSearchExpanded && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#050711] text-white animate-in fade-in duration-150 md:hidden">
          <button
            type="button"
            className="absolute inset-0 top-[68px] z-0 cursor-default"
            onClick={closeMobileSearch}
            aria-label="Thu nhỏ tìm kiếm"
          />
          <div className="relative z-10 flex items-center gap-3 border-b border-white/5 bg-[#070913]/95 px-4 py-3">
            <button
              type="button"
              onClick={closeMobileSearch}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 text-slate-300 transition active:scale-95"
              aria-label="Đóng tìm kiếm"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="relative min-w-0 flex-1">
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchInput}
                onChange={(e) => {
                  const nextQuery = e.target.value;
                  setSearchInput(nextQuery);
                  setAppliedFilters((prev) => ({ ...prev, query: nextQuery }));
                  setIsTalentSuggestOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilters();
                    closeMobileSearch();
                  }
                  if (e.key === "Escape") {
                    closeMobileSearch();
                  }
                }}
                placeholder="Tìm kiếm Idol..."
                className="h-11 w-full rounded-full border border-[#C9A86A]/40 bg-slate-950/80 px-4 pr-10 text-base font-semibold text-white outline-none placeholder:text-slate-500 focus:border-[#C9A86A]"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setAppliedFilters((prev) => ({ ...prev, query: "" }));
                    setIsTalentSuggestOpen(true);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                  aria-label="Xóa từ khóa"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {talentSearchSuggestions.length > 0 && (
            <div className="relative z-10 px-4 py-4">
              <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#C9A86A]">
                Gợi ý tìm kiếm
              </div>
              <div className="space-y-1.5">
                {talentSearchSuggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.label}-${suggestion.meta || "suggest"}`}
                    type="button"
                    onClick={() => handleTalentSuggestionPick(suggestion)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition active:scale-[0.99]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black text-white">{suggestion.label}</span>
                      {suggestion.meta && (
                        <span className="mt-0.5 block truncate text-xs font-semibold text-slate-400">
                          {suggestion.meta}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Unified Search Card */}
      <section className="hidden md:block relative z-40 overflow-visible rounded-3xl border border-[#C9A86A]/30 bg-[#0f121d]/90 p-6 mb-6 shadow-[0_0_30px_rgba(201,168,106,0.06)] backdrop-blur-md">
        {/* Top Highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A86A] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#C9A86A]/5 blur-3xl opacity-60 pointer-events-none" />

        {/* Header Title block matching image layout */}
        <div className="relative z-10 mb-4">
          <h1 className="font-display text-lg font-black tracking-tight text-white md:text-xl">
            Tìm kiếm Idol - {currentCityLabel}{" "}
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              ({displayedTalentCount})
            </span>
          </h1>
        </div>

        {/* Main Inputs Row */}
        <div className="relative z-10 flex flex-col xl:flex-row gap-3 items-stretch">
          {/* Box 1: Search Input */}
          <div className="group relative flex-1 min-w-[280px]">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#C9A86A]/30 to-yellow-600/20 opacity-75 blur-sm transition-all duration-500 group-hover:opacity-100 group-focus-within:opacity-100 group-focus-within:blur-md" />
            <div className="relative w-full h-full">
              <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#C9A86A] transition-colors group-focus-within:text-amber-300" />
              <input
                value={searchInput}
                onFocus={() => setIsTalentSuggestOpen(true)}
                onBlur={() => setIsTalentSuggestOpen(false)}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setIsTalentSuggestOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilters();
                    setIsTalentSuggestOpen(false);
                  }
                }}
                placeholder="Nhập tên Idol..."
                className="w-full h-[50px] rounded-2xl border border-white/10 bg-slate-950/60 pl-12 pr-10 text-xs text-white outline-none transition-all duration-300 focus:border-[#C9A86A]/60 placeholder:text-slate-500"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setAppliedFilters((prev) => ({ ...prev, query: "" }));
                    setIsTalentSuggestOpen(false);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-450 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <KeywordSuggestionsDropdown
                open={isTalentSuggestOpen}
                suggestions={talentSearchSuggestions}
                onPick={handleTalentSuggestionPick}
              />
            </div>
          </div>

          {/* Box 2: Dropdown Địa điểm */}
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

          {/* Box 3: Dropdown Loại hình Idol */}
          <div className="w-full xl:w-auto xl:min-w-[190px]">
            <MultiFilterDropdown
              value={selectedType}
              onChange={setSelectedType}
              options={typeOptions}
              placeholder="Loại hình Idol"
            />
          </div>

          {/* Buttons container */}
          <div className="flex gap-2 shrink-0 relative z-50">
            {/* Button: Tìm kiếm */}
            <button
              type="button"
              onClick={applyFilters}
              className="flex-1 xl:flex-none h-[50px] px-8 rounded-2xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-xs font-black uppercase tracking-wider text-slate-950 transition-all duration-300 hover:brightness-110 active:scale-95 cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(201,168,106,0.3)] flex items-center justify-center gap-1.5"
            >
              <Search className="h-4 w-4" />
              <span>Tìm kiếm</span>
            </button>

            {/* Button: Bộ lọc */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={cn(
                "flex-1 xl:flex-none h-[50px] px-5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5",
                showAdvancedFilters
                  ? "border-[#C9A86A] bg-[#C9A86A]/20 text-[#C9A86A] shadow-[0_0_12px_rgba(201,168,106,0.15)]"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-[#C9A86A]/40 hover:text-white"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Bộ lọc</span>
            </button>

            {/* Dropdown: Sắp xếp */}
            <div className="relative z-50 overflow-visible w-full xl:w-[160px]">
              <FilterDropdown
                value={sortOption}
                onChange={(val) => setSortOption(val as TalentSortOption)}
                options={TALENT_SORT_OPTIONS}
                searchable={false}
                placeholder="Sắp xếp"
                icon={ArrowUpDown}
                align="right"
                className="[&>button]:!bg-white/5 [&>button]:!border-white/10 [&>button]:!text-slate-300 [&>button]:hover:!bg-white/10 [&>button]:hover:!border-[#C9A86A]/40 [&>button]:hover:!text-white"
              />
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Filters Area */}
        {showAdvancedFilters && (
          <div className="relative z-10 border-t border-white/5 mt-5 pt-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              <span className="mb-3 block text-[10px] font-black uppercase tracking-[0.18em] text-[#C9A86A]">
                Nổi bật
              </span>
              <div className="flex flex-wrap gap-2">
                {HOT_TALENT_LOCATIONS.map((location) => {
                  const isSelected = selectedCity === location.value || appliedFilters.city === location.value;
                  return (
                    <button
                      key={location.label}
                      type="button"
                      onClick={() => applyHotTalentLocation(location.value)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition active:scale-[0.98]",
                        isSelected
                          ? "border-[#C9A86A]/70 bg-[#C9A86A]/15 text-[#C9A86A]"
                          : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-[#C9A86A]/40 hover:text-white"
                      )}
                    >
                      <span>{location.label}</span>
                      <span className="text-[10px] font-semibold text-slate-400">{location.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Giới tính */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
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

              {/* Chiều cao */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Chiều cao ({minHeight} - {maxHeight}cm)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={140}
                    max={200}
                    value={minHeight}
                    onChange={(e) => setMinHeight(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center"
                  />
                  <input
                    type="number"
                    min={140}
                    max={200}
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center"
                  />
                </div>
              </div>

              {/* Cân nặng */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Cân nặng ({minWeight} - {maxWeight}kg)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={35}
                    max={120}
                    value={minWeight}
                    onChange={(e) => setMinWeight(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center"
                  />
                  <input
                    type="number"
                    min={35}
                    max={120}
                    value={maxWeight}
                    onChange={(e) => setMaxWeight(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Main Results Container */}
      <div className="relative z-10 w-full">
        {/* Content - Flexible */}
        <main className="w-full space-y-4">


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
                  <React.Fragment key={talent.id}>
                    {/* Desktop Card */}
                    <TalentCard
                      talent={talent}
                      status={getTalentStatus(String(talent.id))}
                      isSaved={isSaved}
                      messageDisabled={isInBrand}
                      messageLoading={isAddingToBrand}
                      onToggleSaved={() => toggleSaved(talent.id)}
                      onView={(item) => {
                        addViewedTalentId(item.id);
                        router.push(`/brand/talents/${item.id}?from=/brand/search`);
                      }}
                      onMessage={() => addTalentToBrand(talent)}
                      onRemoveFromBrand={() => removeTalentFromBrand(talent)}
                      className="hidden md:flex"
                    />
                    {/* Mobile Landscape Card */}
                    <TalentCardMobile
                      talent={talent}
                      status={getTalentStatus(String(talent.id))}
                      isSaved={isSaved}
                      messageDisabled={isInBrand}
                      messageLoading={isAddingToBrand}
                      onToggleSaved={() => toggleSaved(talent.id)}
                      onView={(item) => {
                        addViewedTalentId(item.id);
                        router.push(`/brand/talents/${item.id}?from=/brand/search`);
                      }}
                      onMessage={() => addTalentToBrand(talent)}
                      onRemoveFromBrand={() => removeTalentFromBrand(talent)}
                      className="flex md:hidden"
                    />
                  </React.Fragment>
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
          setAppliedFilters(prev => ({ ...prev, city }));
          setIsMobileCitySelectorOpen(false);
          setCitySearchQuery("");
        }}
        onRefreshLocation={() => {
          pushToast("Đang cập nhật vị trí...");
        }}
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
          setMinHeight(150);
          setMaxHeight(190);
          setMinWeight(40);
          setMaxWeight(90);
          setSortOption("near_me");
          setAppliedFilters(prev => ({
            query: searchInput,
            gender: allValue,
            type: allValue,
            city: selectedCity,
            minHeight: 150,
            maxHeight: 190,
            minWeight: 40,
            maxWeight: 90,
            showAdvancedFilters: prev.showAdvancedFilters,
          }));
          setMobileQuickTab("all");
          pushToast("Đã đặt lại bộ lọc.");
        }}
        onApply={() => {
          setAppliedFilters(prev => ({
            query: searchInput,
            gender: selectedGender,
            type: selectedType,
            city: selectedCity,
            minHeight,
            maxHeight,
            minWeight,
            maxWeight,
            showAdvancedFilters: prev.showAdvancedFilters,
          }));
          setMobileQuickTab("all");
          setIsMobileFiltersOpen(false);
          pushToast("Đã áp dụng bộ lọc.");
        }}
      />
    </div>
  );
}
