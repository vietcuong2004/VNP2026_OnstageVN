"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Filter,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { addBrandRosterTalent, addTalentToWishlist, createBrandWishlist, loadBrandRosterTalents, loadBrandTalentsPage, loadBrandWishlists, removeTalentFromWishlist, loadBrandCampaigns } from "@/lib/brand-api";
import { useGuestActionPrompt } from "@/components/guest-action-prompt";
import { cn } from "@/lib/utils";
import TalentCard from "@/components/TalentCard";

const allValue = "all";
const TALENTS_PER_PAGE = 20;
const TALENT_PAGES_PER_RESULT_PAGE = 5;
const TALENTS_PER_RESULT_PAGE = TALENTS_PER_PAGE * TALENT_PAGES_PER_RESULT_PAGE;
const cityOptions = [
  "Tỉnh An Giang",
  "Tỉnh Bắc Ninh",
  "Tỉnh Cà Mau",
  "Tỉnh Cao Bằng",
  "TP. Cần Thơ",
  "TP. Đà Nẵng",
  "Tỉnh Đắk Lắk",
  "Tỉnh Điện Biên",
  "Tỉnh Đồng Nai",
  "Tỉnh Đồng Tháp",
  "Tỉnh Gia Lai",
  "TP. Hà Nội",
  "Tỉnh Hà Tĩnh",
  "TP. Hải Phòng",
  "TP. Hồ Chí Minh",
  "TP. Huế",
  "Tỉnh Hưng Yên",
  "Tỉnh Khánh Hòa",
  "Tỉnh Lai Châu",
  "Tỉnh Lâm Đồng",
  "Tỉnh Lạng Sơn",
  "Tỉnh Lào Cai",
  "Tỉnh Nghệ An",
  "Tỉnh Ninh Bình",
  "Tỉnh Phú Thọ",
  "Tỉnh Quảng Ngãi",
  "Tỉnh Quảng Ninh",
  "Tỉnh Quảng Trị",
  "Tỉnh Sơn La",
  "Tỉnh Tây Ninh",
  "Tỉnh Thái Nguyên",
  "Tỉnh Thanh Hóa",
  "Tỉnh Tuyên Quang",
  "Tỉnh Vĩnh Long",
];
const talentTypeOptions = [
  "Diễn viên",
  "Người mẫu",
  "KOLs",
  "KOCs",
  "Livestreamers",
  "MC",
  "PG",
  "Hoa hậu",
];
const genderOptions = [
  { value: allValue, label: "Tất cả giới tính" },
  { value: "Nữ", label: "Nữ" },
  { value: "Nam", label: "Nam" },
];
const typeOptions = [
  { value: allValue, label: "Tất cả loại hình" },
  ...talentTypeOptions.map((type) => ({ value: type, label: type })),
];
const experienceOptions = [
  { value: allValue, label: "Tất cả kinh nghiệm" },
  { value: "under_1", label: "Dưới 1 năm" },
  { value: "1_3", label: "Từ 1 - 3 năm" },
  { value: "3_5", label: "Từ 3 - 5 năm" },
  { value: "over_5", label: "Trên 5 năm" },
];

function normalizeCityName(value: string) {
  return value.replace(/^(TP\.|Tỉnh)\s*/i, "").trim();
}

const cityDropdownOptions = [
  { value: allValue, label: "Toàn quốc" },
  ...cityOptions.map((city) => ({ value: normalizeCityName(city), label: city })),
];

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function normalizeTalentType(value: string) {
  const normalized = value.trim().toLowerCase();
  const aliases: Record<string, string> = {
    model: "người mẫu",
    "người mẫu": "người mẫu",
    kol: "kols",
    kols: "kols",
    koc: "kocs",
    kocs: "kocs",
    livestreamer: "livestreamers",
    livestreamers: "livestreamers",
    mc: "mc",
    pg: "pg",
    "diễn viên": "diễn viên",
    "hoa hậu": "hoa hậu",
  };

  return aliases[normalized] || normalized;
}

function backendGenderValue(value: string) {
  const normalized = normalizeSearchText(value);
  if (normalized === "nam") return "male";
  if (normalized === "nu") return "female";
  return undefined;
}

function getTalentTypes(talent: unknown) {
  const record = talent && typeof talent === "object" ? talent as Record<string, unknown> : {};

  if (Array.isArray(record.talentTypes) && record.talentTypes.length) {
    return record.talentTypes.map((type: unknown) => String(type).trim()).filter(Boolean);
  }

  if (Array.isArray(record.talent_types) && record.talent_types.length) {
    return record.talent_types.map((type: unknown) => String(type).trim()).filter(Boolean);
  }

  return record.type ? [String(record.type)] : [];
}

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  const maxVisible = 10;
  const safeTotal = Math.max(1, totalPages);
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(safeTotal, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

type FilterDropdownOption = {
  value: string;
  label: string;
};

function FilterDropdown({
  value,
  onChange,
  options,
  searchPlaceholder = "Tìm kiếm...",
  emptyText = "Không tìm thấy lựa chọn",
  searchable = true,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterDropdownOption[];
  searchPlaceholder?: string;
  emptyText?: string;
  searchable?: boolean;
  className?: string;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const selectedOption = options.find((option) => option.value === value) || options[0];
  const filteredOptions = useMemo(() => {
    const keyword = normalizeSearchText(searchInput);
    if (!keyword) return options;

    return options.filter((option) => {
      const label = normalizeSearchText(option.label);
      const optionValue = normalizeSearchText(option.value);

      return label.includes(keyword) || optionValue.includes(keyword);
    });
  }, [options, searchInput]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-left text-xs text-white outline-none transition-all hover:border-[#C9A86A]/40 focus:border-[#C9A86A]/60"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-white transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[100] mt-1 rounded-xl border border-white/10 bg-[#08051d] shadow-2xl">
          {searchable && (
            <div className="border-b border-white/10 p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#C9A86A]" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-[#C9A86A]/60"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-[320px] overflow-y-auto py-1">
            {filteredOptions.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setSearchInput("");
                    setIsOpen(false);
                  }}
                  className={cn(
                    "block w-full px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-[#C9A86A]/15",
                    isSelected ? "bg-[#C9A86A]/25 text-white" : "text-slate-200"
                  )}
                >
                  {option.label}
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              <div className="px-4 py-3 text-xs font-semibold text-slate-500">
                {emptyText}
              </div>
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

  // Search and Filters states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedGender, setSelectedGender] = useState(allValue);
  const [selectedType, setSelectedType] = useState(allValue);
  const [selectedCity, setSelectedCity] = useState(allValue);

  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(40);
  const [minHeight, setMinHeight] = useState(150);
  const [maxHeight, setMaxHeight] = useState(190);
  const [minWeight, setMinWeight] = useState(40);
  const [maxWeight, setMaxWeight] = useState(90);

  const [selectedExperience, setSelectedExperience] = useState(allValue);

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishlistItemIds, setWishlistItemIds] = useState<Record<string, string>>({});
  const [selectedInviteTalent, setSelectedInviteTalent] = useState<any | null>(null);
  const [selectedCampaignForInvite, setSelectedCampaignForInvite] = useState("");
  const talentRequestRef = useRef(0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
  const [addingBrandTalentIds, setAddingBrandTalentIds] = useState<string[]>([]);

  const talentQueryOptions = useMemo(() => ({
    q: searchQuery || undefined,
    type: selectedType !== allValue ? selectedType : undefined,
    city: selectedCity !== allValue ? selectedCity : undefined,
    gender: selectedGender !== allValue ? backendGenderValue(selectedGender) : undefined,
    minAge: showAdvancedFilters ? minAge : undefined,
    maxAge: showAdvancedFilters ? maxAge : undefined,
    minHeight: showAdvancedFilters ? minHeight : undefined,
    maxHeight: showAdvancedFilters ? maxHeight : undefined,
  }), [searchQuery, selectedType, selectedCity, selectedGender, showAdvancedFilters, minAge, maxAge, minHeight, maxHeight]);

  const loadTalentPage = useCallback(async (page: number, mode: "replace" | "append", resultPage: number) => {
    const requestId = ++talentRequestRef.current;

    if (mode === "append") setIsLoadingMoreTalents(true);
    else setIsLoadingTalents(true);

    try {
      const response = await loadBrandTalentsPage({
        ...talentQueryOptions,
        page,
        perPage: TALENTS_PER_PAGE,
        sort: "match",
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
  }, [talentQueryOptions]);

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
      })
      .catch(() => {
        if (!cancelled) setBrandTalentIds([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter Algorithm
  const filteredTalents = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return displayTalents
      .filter((talent) => {
        const talentTypes = getTalentTypes(talent);
        const matchesSearch =
          !keyword ||
          talent.name.toLowerCase().includes(keyword) ||
          talent.skills.some((skill: string) => skill.toLowerCase().includes(keyword)) ||
          talentTypes.some((type) => type.toLowerCase().includes(keyword));

        const matchesGender = selectedGender === allValue || talent.gender === selectedGender;
        const matchesType =
          selectedType === allValue ||
          talentTypes.some((type) => normalizeTalentType(type) === normalizeTalentType(selectedType));
        const matchesCity =
          selectedCity === allValue ||
          normalizeCityName(talent.city || "") === normalizeCityName(selectedCity);

        const usesAdvancedFilters = showAdvancedFilters;
        const matchesAge = !usesAdvancedFilters || !talent.age || (talent.age >= minAge && talent.age <= maxAge);
        const matchesHeight = !usesAdvancedFilters || !talent.height || (talent.height >= minHeight && talent.height <= maxHeight);
        const matchesWeight = !usesAdvancedFilters || !talent.weight || (talent.weight >= minWeight && talent.weight <= maxWeight);

        let matchesExperience = true;
        if (usesAdvancedFilters && selectedExperience !== allValue) {
          if (selectedExperience === "under_1") matchesExperience = talent.yearsOfExperience < 1;
          else if (selectedExperience === "1_3") matchesExperience = talent.yearsOfExperience >= 1 && talent.yearsOfExperience <= 3;
          else if (selectedExperience === "3_5") matchesExperience = talent.yearsOfExperience >= 3 && talent.yearsOfExperience <= 5;
          else if (selectedExperience === "over_5") matchesExperience = talent.yearsOfExperience > 5;
        }

        return (
          matchesSearch &&
          matchesGender &&
          matchesType &&
          matchesCity &&
          matchesAge &&
          matchesHeight &&
          matchesWeight &&
          matchesExperience
        );
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [
    searchQuery,
    selectedGender,
    selectedType,
    selectedCity,
    minAge,
    maxAge,
    minHeight,
    maxHeight,
    minWeight,
    maxWeight,
    selectedExperience,
    showAdvancedFilters,
    displayTalents,
  ]);

  const getTalentStatus = (id: string) => {
    if (id === "tal-1" || id === "tal-2") return "available";
    if (id === "tal-3") return "busy";
    return "maybe";
  };

  const hasClientOnlyFilters =
    showAdvancedFilters &&
    (minWeight !== 40 || maxWeight !== 90 || selectedExperience !== allValue);
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

  function resetFilters() {
    setSearchQuery("");
    setSearchInput("");
    setSelectedGender(allValue);
    setSelectedType(allValue);
    setSelectedCity(allValue);
    setMinAge(18);
    setMaxAge(40);
    setMinHeight(150);
    setMaxHeight(190);
    setMinWeight(40);
    setMaxWeight(90);
    setSelectedExperience(allValue);
  }

  async function ensureWishlist() {
    if (wishlistId) return wishlistId;
    const created = await createBrandWishlist("Talent yêu thích", "Danh sách talent yêu thích của Brand");
    setWishlistId(created.id);
    return created.id;
  }

  async function toggleSaved(id: string) {
    if (!requireAuthAction({ actionLabel: "Lưu talent vào danh sách yêu thích" })) return;

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
        pushToast("Đã xoá khỏi danh sách yêu thích.");
        return;
      }

      const nextWishlistId = await ensureWishlist();
      const created = await addTalentToWishlist(nextWishlistId, id);
      setSavedIds((current) => current.includes(id) ? current : [...current, id]);
      setWishlistItemIds((current) => ({ ...current, [id]: String(created.id) }));
      pushToast("Đã thêm vào danh sách yêu thích.");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Chưa thể cập nhật danh sách yêu thích. Vui lòng thử lại.", "error");
    }
  }

  async function addTalentToBrand(talent: any) {
    const talentId = String(talent?.id || "");
    if (!talentId || brandTalentIds.includes(talentId) || addingBrandTalentIds.includes(talentId)) return;
    if (!requireAuthAction({ actionLabel: "Thêm talent vào Brand" })) return;

    setAddingBrandTalentIds((current) => [...current, talentId]);

    try {
      await addBrandRosterTalent(talentId, "Thêm từ danh sách tìm kiếm talent.");
      setBrandTalentIds((current) => current.includes(talentId) ? current : [...current, talentId]);
      pushToast("Đã thêm talent vào Brand.");
    } catch (error) {
      pushToast("Chưa thể thêm talent vào Brand. Vui lòng thử lại.", "error");
      console.error("Failed to add talent to brand", error);
    } finally {
      setAddingBrandTalentIds((current) => current.filter((id) => id !== talentId));
    }
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <section className="border-b border-[#2B313D] pb-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md border border-[#C9A86A]/30 bg-[#C9A86A]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A86A]">
            TÌM KIẾM TÀI NĂNG
          </span>
        </div>
        <h1 className="font-display text-2xl font-black tracking-tight text-white uppercase">
          DANH SÁCH TÀI NĂNG NỔI BẬT
        </h1>
        <p className="mt-2 max-w-3xl text-xs font-semibold leading-relaxed text-slate-400 uppercase tracking-wide">
          Hãy tìm tài năng phù hợp nhất cho các chiến dịch của bạn
        </p>
      </section>

      {/* Search Bar - First Row */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="relative flex-1 group">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500/30 via-[#C9A86A]/40 to-yellow-600/30 opacity-75 blur-sm transition-all duration-500 group-hover:opacity-100 group-focus-within:opacity-100 group-focus-within:blur-md" />
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#C9A86A] transition-colors group-focus-within:text-amber-300" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchQuery(searchInput);
                }
              }}
              placeholder="Tìm kiếm tài năng theo tên, kỹ năng (ví dụ: MC, livestream, catwalk...)"
              className="w-full rounded-2xl border border-amber-500/10 bg-[#0a0c12]/90 py-4 pl-12 pr-10 text-xs text-white outline-none transition-all duration-300 focus:border-[#C9A86A]/60 placeholder:text-slate-500 shadow-2xl"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-450 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setSearchQuery(searchInput)}
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
              options={cityDropdownOptions}
              searchPlaceholder="Nhập tỉnh/thành..."
              emptyText="Không tìm thấy địa điểm"
            />
          </div>

          {/* Loại hình Talent */}
          <div className="flex-1 min-w-[140px]">
            <span className="block text-[9px] font-black uppercase tracking-widest text-[#C9A86A]/90 mb-1.5 font-display">Loại hình</span>
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
              onClick={resetFilters}
              className="flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-black uppercase tracking-wider text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-white transition active:scale-95 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Area */}
        {showAdvancedFilters && (
          <div className="border-t border-white/5 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

              {/* Độ tuổi */}
              <div className="space-y-1.5">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Độ tuổi ({minAge} - {maxAge})</span>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min={16} max={50} value={minAge} onChange={(e) => setMinAge(Number(e.target.value))} className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                  <input type="number" min={16} max={50} value={maxAge} onChange={(e) => setMaxAge(Number(e.target.value))} className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2 text-xs text-white outline-none focus:border-[#C9A86A]/60 text-center" />
                </div>
              </div>

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

              {/* Kinh nghiệm */}
              <div className="space-y-1.5">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Kinh nghiệm chuyên môn</span>
                <FilterDropdown
                  value={selectedExperience}
                  onChange={setSelectedExperience}
                  options={experienceOptions}
                  searchable={false}
                />
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Main Results Container */}
      <div className="relative z-0 w-full">
        {/* Content - Flexible */}
        <main className="w-full space-y-4">
          <div className="flex flex-col gap-3 border-b border-[#2B313D] pb-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <Filter className="h-4 w-4 text-[#C9A86A]" />
              Tìm thấy <b className="text-white">{displayedTalentCount}</b> talent phù hợp.
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono shrink-0">
              ĐÃ LƯU <b className="text-white">{savedIds.length}</b> talent vào danh sách yêu thích
            </span>
          </div>

          {isLoadingTalents ? (
            <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-16 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 animate-pulse text-[#C9A86A]" />
              <h3 className="text-sm font-black text-white">Đang tải danh sách talent</h3>
              <p className="mt-2 text-xs text-slate-500">Một chút thôi, hệ thống đang lấy dữ liệu phù hợp.</p>
            </div>
          ) : filteredTalents.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-slate-950/25 p-16 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-slate-600" />
              <h3 className="text-sm font-black text-white">Không tìm thấy talent phù hợp</h3>
              <p className="mt-2 text-xs text-slate-500">Hãy thử nới lỏng bộ lọc hoặc điều chỉnh từ khóa tìm kiếm.</p>
            </div>
          ) : (
            /* Result Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredTalents.map((talent) => {
                const isSaved = savedIds.includes(talent.id);
                const status = getTalentStatus(talent.id);
                const isInBrand = brandTalentIds.includes(String(talent.id));
                const isAddingToBrand = addingBrandTalentIds.includes(String(talent.id));

                return (
                  <TalentCard
                    key={talent.id}
                    talent={talent}
                    status={status}
                    isSaved={isSaved}
                    onToggleSaved={(item) => void toggleSaved(item.id)}
                    onView={(item) => router.push(`/brand/talents/${item.id}?from=/brand/search`)}
                    onMessage={(item) => void addTalentToBrand(item)}
                    messageLabel={isInBrand ? "Đã thêm" : isAddingToBrand ? "Đang thêm" : "Thêm vào Brand"}
                    messageDisabled={isInBrand}
                    messageLoading={isAddingToBrand}
                    showMessageIcon
                  />
                );
              })}
            </div>
          )}

          {!isLoadingTalents && hasMoreTalents && (
            <div ref={loadMoreRef} className="flex min-h-16 justify-center pt-3">
              <div className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#C9A86A]/20 bg-[#C9A86A]/5 px-6 text-xs font-black uppercase tracking-wider text-[#C9A86A]">
                <span>{isLoadingMoreTalents ? "Đang tải thêm talent" : "Kéo xuống để tải thêm"}</span>
                <span className="flex items-center gap-1" aria-hidden="true">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C9A86A]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C9A86A] [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C9A86A] [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}

          {!isLoadingTalents && talentResultPageCount > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-8 pb-4">
              <button
                type="button"
                disabled={talentResultPage <= 1 || isLoadingTalents}
                onClick={() => goToTalentResultPage(talentResultPage - 1)}
                className="flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>

              <div className="flex items-center gap-1.5 px-1">
                {talentPageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToTalentResultPage(page)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black transition-all cursor-pointer",
                      page === talentResultPage
                        ? "bg-[#C9A86A] text-slate-950 shadow-md shadow-[#C9A86A]/20"
                        : "border border-white/10 bg-slate-950/80 text-slate-400 hover:border-[#C9A86A]/40 hover:text-white"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={talentResultPage >= talentResultPageCount || isLoadingTalents}
                onClick={() => goToTalentResultPage(talentResultPage + 1)}
                className="flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Tiếp theo
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Invite to Campaign Modal Dialog */}
      <GuestActionPrompt />

      {selectedInviteTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md flex flex-col bg-[#08090f] border border-[#151b2d] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-start justify-between p-6 border-b border-[#151b2d]">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Mời Ứng Tuyển</h3>
                <p className="text-[10px] text-slate-500 mt-1">Gửi lời mời tham gia campaign tới {selectedInviteTalent.name}</p>
              </div>
              <button onClick={() => setSelectedInviteTalent(null)} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-4.5 w-4.5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Chọn chiến dịch tuyển dụng</span>
                <select
                  value={selectedCampaignForInvite}
                  onChange={(e) => setSelectedCampaignForInvite(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400/60"
                >
                  <option value="">-- Chọn chiến dịch --</option>
                  {brandCampaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#151b2d] bg-[#050711]">
              <button onClick={() => setSelectedInviteTalent(null)} className="px-4 py-2 rounded-xl border border-[#151b2d] text-xs font-bold text-slate-400 hover:text-white cursor-pointer">Hủy</button>
              <button
                onClick={() => {
                  if (!requireAuthAction({ actionLabel: "Gửi lời mời talent tham gia campaign" })) return;
                  if (!selectedCampaignForInvite) {
                    window.alert("Vui lòng chọn chiến dịch!");
                    return;
                  }
                  window.alert(`Đã gửi lời mời ứng tuyển tới ${selectedInviteTalent.name} tham gia chiến dịch thành công!`);
                  setSelectedInviteTalent(null);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-100 via-[#C9A86A] to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Gửi lời mời
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300",
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
