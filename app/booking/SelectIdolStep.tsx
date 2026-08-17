"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import BadgeTier from "@/components/ui/BadgeTier";
import { createInitialAvatarDataUrl } from "@/lib/avatar";
import { loadBrandTalentsPage } from "@/lib/brand-api";
import { cn } from "@/lib/utils";
import {
  getTalentPrimaryBadge,
  getTalentTypes,
  getStringList,
} from "@/components/talents/TalentCard";
import TalentFilterCityDialog from "@/components/talents/TalentFilterCityDialog";
import TalentFilterDialog from "@/components/talents/TalentFilterDialog";
import { normalizeLocationName, useCityFilterOptions } from "@/hooks/use-location-options";

export type SelectIdolStepProps = {
  selectedTalentIds: string[];
  setSelectedTalentIds: React.Dispatch<React.SetStateAction<string[]>>;
  onBack: () => void;
  onNext: () => void;
  handleClose: () => void;
};

type TalentSortOption = "near_me" | "rating" | "newest" | "oldest" | "name_asc" | "name_desc";
type MobileTalentQuickTab = "all" | "top_month" | "featured" | "top_reviewed";

const MOBILE_TALENT_QUICK_TABS: Array<{ value: MobileTalentQuickTab | "more"; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "top_month", label: "Top tháng" },
  { value: "top_reviewed", label: "Top đánh giá" },
  { value: "featured", label: "Nổi bật" },
  { value: "more", label: "Thêm" },
];

const GENDER_OPTIONS = [
  { label: "Tất cả", value: "Tất cả" },
  { label: "Nữ", value: "female" },
  { label: "Nam", value: "male" },
  { label: "Khác", value: "other" },
];

const TYPE_OPTIONS = [
  { label: "Tất cả", value: "Tất cả" },
  { label: "MC", value: "mc" },
  { label: "Model", value: "model" },
  { label: "KOL", value: "kol" },
  { label: "KOC", value: "koc" },
  { label: "PG/PB", value: "pg/pb" },
];

const SORT_OPTIONS: Array<{ label: string; value: TalentSortOption }> = [
  { label: "Gần tôi", value: "near_me" },
  { label: "Nổi bật", value: "rating" },
  { label: "Gương mặt mới", value: "newest" },
  { label: "Cũ nhất", value: "oldest" },
  { label: "Tên A - Z", value: "name_asc" },
  { label: "Tên Z - A", value: "name_desc" },
];

const DEFAULT_MOCK_TALENTS = [
  {
    id: "tal-1",
    name: "Phan Bảo Anh",
    city: "Hải Phòng",
    district: "Hai Bà Trưng",
    tier: "top_50",
    talentTypes: ["KOLS", "NGƯỜI MẪU"],
    skills: ["ACTING", "MAKEUP"],
    description:
      "Mình là mẫu ảnh tự do đang hoạt động tại Hải Phòng. Đã có 6 năm kinh nghiệm hoạt động trong ngành.",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    bookings: 127,
    goodReviews: 1318,
    badge: "TOP 50 KOL",
    gender: "female",
  },
  {
    id: "tal-2",
    name: "An An là Mặt trời nhỏ",
    city: "Hà Nội",
    district: "Tây Hồ",
    tier: "tier_1",
    talentTypes: ["KOL", "NGƯỜI MẪU"],
    skills: ["BEAUTY", "MAKE-UP"],
    description:
      "Đã từng hợp tác với 50+ nhãn hàng mọi phân khúc, phong cách nội dung linh hoạt phù hợp với phần đông người xem.",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    bookings: 64,
    goodReviews: 1190,
    badge: "GƯƠNG MẶT MỚI",
    gender: "female",
  },
  {
    id: "tal-3",
    name: "Linh Chi Model",
    city: "Hà Nội",
    district: "Cầu Giấy",
    tier: "top_50",
    talentTypes: ["MODEL", "KOL"],
    skills: ["POSING", "CATWALK", "LIVESTREAM"],
    description:
      "Talent demo đã hoàn thiện hồ sơ để kiểm tra luồng admin, sẵn sàng nhận booking dự án thời trang & sự kiện.",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    bookings: 121,
    goodReviews: 626,
    badge: "TOP 50 KOL",
    gender: "female",
  },
  {
    id: "tal-4",
    name: "Phương Thảo MC",
    city: "Hà Nội",
    district: "Cầu Giấy",
    tier: "trusted_partner",
    talentTypes: ["MC", "KOL"],
    skills: ["SONG NGỮ", "EVENT", "TVC"],
    description:
      "MC chuyên nghiệp dẫn sự kiện lớn nhỏ, phong thái tự tin, khả năng xử lý tình huống linh hoạt.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    bookings: 62,
    goodReviews: 1280,
    badge: "ĐỐI TÁC TIN CẬY",
    gender: "female",
  },
];

function getTalentStats(talent: any) {
  if (talent.bookings && talent.goodReviews) {
    return { bookings: talent.bookings, goodReviews: talent.goodReviews };
  }
  const key = String(talent?.id || talent?.name || "idol");
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return {
    bookings: 60 + (hash % 120),
    goodReviews: 500 + ((hash >> 3) % 900),
  };
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

function formatLocationFilterLabel(value: string, options: { label: string; value: string }[]) {
  if (value === "Tất cả" || value === "all" || !value) return "Toàn quốc";

  const districtFilter = parseDistrictLocationValue(value);
  if (districtFilter) {
    const cityLabel = options.find((option) => option.value === districtFilter.city)?.label || districtFilter.city;
    return `${cityLabel}, ${districtFilter.district}`;
  }

  return options.find((opt) => opt.value === value)?.label || value;
}

export default function SelectIdolStep({
  selectedTalentIds,
  setSelectedTalentIds,
  onBack,
  onNext,
  handleClose,
}: SelectIdolStepProps) {
  const router = useRouter();
  const cityOptions = useCityFilterOptions();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Tất cả");
  const [selectedGender, setSelectedGender] = useState("Tất cả");
  const [selectedType, setSelectedType] = useState("Tất cả");
  const [selectedSort, setSelectedSort] = useState<TalentSortOption>("rating");
  const [mobileQuickTab, setMobileQuickTab] = useState<MobileTalentQuickTab>("all");
  const [minHeight, setMinHeight] = useState(140);
  const [maxHeight, setMaxHeight] = useState(200);
  const [minWeight, setMinWeight] = useState(35);
  const [maxWeight, setMaxWeight] = useState(120);

  // Dialog States
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");

  // Paginated Data Loading (Lazy Load / Infinite Scroll like brand/search)
  const [talents, setTalents] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);

  const fetchTalentsPage = useCallback(
    async (targetPage: number, mode: "replace" | "append") => {
      const requestId = ++requestRef.current;
      if (mode === "replace") {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const res = await loadBrandTalentsPage({
          page: targetPage,
          perPage: 24,
          q: searchQuery.trim() || undefined,
          gender: selectedGender !== "Tất cả" ? selectedGender : undefined,
          type: selectedType !== "Tất cả" ? selectedType : undefined,
          city: selectedCity !== "Tất cả" ? selectedCity : undefined,
          sort: selectedSort,
        });

        if (requestId !== requestRef.current) return;

        if (res && Array.isArray(res.data) && res.data.length > 0) {
          setTalents((prev) => {
            if (mode === "replace") return res.data;
            const existingIds = new Set(prev.map((item) => String(item.id)));
            const newItems = res.data.filter((item: any) => !existingIds.has(String(item.id)));
            return [...prev, ...newItems];
          });
          setPage(res.meta?.current_page || targetPage);
          setHasMore(Boolean(res.meta?.has_more));
        } else {
          if (mode === "replace") {
            setTalents(DEFAULT_MOCK_TALENTS);
          }
          setHasMore(false);
        }
      } catch (err) {
        if (requestId === requestRef.current && mode === "replace") {
          setTalents(DEFAULT_MOCK_TALENTS);
        }
        setHasMore(false);
      } finally {
        if (requestId === requestRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [searchQuery, selectedGender, selectedType, selectedCity, selectedSort]
  );

  // Initial load or filter change reload
  useEffect(() => {
    fetchTalentsPage(1, "replace");
  }, [fetchTalentsPage]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchTalentsPage(page + 1, "append");
        }
      },
      { rootMargin: "300px 0px", threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, fetchTalentsPage, page]);

  const resetAllFilters = () => {
    setSelectedGender("Tất cả");
    setSelectedType("Tất cả");
    setSelectedCity("Tất cả");
    setSelectedSort("rating");
    setMinHeight(140);
    setMaxHeight(200);
    setMinWeight(35);
    setMaxWeight(120);
    setMobileQuickTab("all");
    setSearchQuery("");
  };

  const applyMobileQuickTab = (tab: MobileTalentQuickTab | "more") => {
    if (tab === "more") {
      setIsFilterDialogOpen(true);
      return;
    }
    setMobileQuickTab(tab);
    if (tab === "all") {
      setSelectedSort("rating");
    } else if (tab === "top_month") {
      setSelectedSort("newest");
    } else if (tab === "top_reviewed") {
      setSelectedSort("rating");
    } else if (tab === "featured") {
      setSelectedSort("rating");
    }
  };

  const filteredTalents = useMemo(() => {
    return talents.filter((t) => {
      // Height / Weight Client Filters
      if (t.height && (t.height < minHeight || t.height > maxHeight)) return false;
      if (t.weight && (t.weight < minWeight || t.weight > maxWeight)) return false;
      return true;
    });
  }, [minHeight, maxHeight, minWeight, maxWeight, talents]);

  const toggleSelectTalent = (id: string) => {
    setSelectedTalentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTalentIds.length > 0) {
      setSelectedTalentIds([]);
    } else {
      setSelectedTalentIds(filteredTalents.map((t) => String(t.id)));
    }
  };

  const handleCardClick = (talentId: string) => {
    router.push(`/brand/talents/${talentId}?from=${encodeURIComponent("/booking?step=9")}`);
  };

  const hasActiveFilters =
    selectedCity !== "Tất cả" ||
    selectedGender !== "Tất cả" ||
    selectedType !== "Tất cả" ||
    minHeight !== 140 ||
    maxHeight !== 200 ||
    minWeight !== 35 ||
    maxWeight !== 120;

  return (
    <div className="h-full w-full animate-in fade-in duration-300">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#FAF7F6] text-[#191116] dark:bg-[#070913] dark:text-white">

        {/* ── HEADER ── */}
        <div className="z-20 shrink-0 border-b border-[#F0D7D3] bg-white px-4 py-3 backdrop-blur-md space-y-2.5 dark:border-white/10 dark:bg-[#070913]/95">
          <div className="flex items-center gap-2">
            {/* ArrowLeft Back Button on Far Left */}
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F0D7D3] bg-[#FFF7F6] text-[#C72524] transition-all hover:bg-[#FFF0EE] active:scale-95 cursor-pointer dark:border-[#C9A86A]/50 dark:bg-[#C9A86A]/15 dark:text-[#C9A86A]"
              title="Quay lại"
              aria-label="Quay lại"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* 1. Filter Button (opens TalentFilterDialog) */}
            <button
              type="button"
              onClick={() => setIsFilterDialogOpen(true)}
              className={cn(
                "flex items-center justify-center h-9 w-9 rounded-full border transition-all shrink-0 cursor-pointer active:scale-95",
                hasActiveFilters
                  ? "border-[#C72524] bg-[#FFF0EE] text-[#C72524] dark:border-[#C9A86A] dark:bg-[#C9A86A]/20 dark:text-[#C9A86A]"
                  : "border-[#F0D7D3] bg-[#FFF7F6] text-[#C72524] hover:border-[#C72524] dark:border-white/10 dark:bg-slate-900/80 dark:text-[#C9A86A]"
              )}
              title="Bộ lọc nâng cao"
              aria-label="Bộ lọc nâng cao"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>

            {/* 2. City Selection Dropdown (opens TalentFilterCityDialog) */}
            <button
              type="button"
              onClick={() => setIsCityDialogOpen(true)}
              className="relative flex items-center gap-1 cursor-pointer shrink-0 border-none bg-transparent outline-none active:scale-95"
              aria-label="Chọn vị trí"
            >
              <span className="font-display text-sm md:text-base font-black tracking-tight text-[#191116] whitespace-nowrap dark:text-white">
                {formatLocationFilterLabel(selectedCity, cityOptions)}
              </span>
              <ChevronDown className="h-4 w-4 text-[#C72524] dark:text-[#C9A86A]" />
            </button>

            {/* Search Input Box */}
            <div className="relative flex min-w-0 flex-1 items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-[#C72524] dark:text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tên idol..."
                className="h-9 w-full rounded-full border border-[#F0D7D3] bg-[#FFFDFC] pl-9 pr-7 text-xs font-semibold text-[#191116] outline-none placeholder:text-[#A08E8C] focus:border-[#C72524] dark:border-white/10 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#C9A86A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFF0EE] text-[#C72524] hover:bg-[#C72524] hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>

            {/* Close X Button on Far Right */}
            <button
              type="button"
              onClick={handleClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F0D7D3] bg-[#FFF7F6] text-[#C72524] transition hover:bg-[#FFF0EE] active:scale-95 cursor-pointer dark:border-white/15 dark:bg-slate-900 dark:text-amber-400"
              title="Thoát"
              aria-label="Thoát"
            >
              <X className="h-4 w-4 text-[#C72524] dark:text-amber-400" />
            </button>
          </div>

          {/* Quick Filter Tabs Row */}
          <div className="relative flex min-w-0 items-center justify-between gap-2">
            <div className="flex flex-1 min-w-0 gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {MOBILE_TALENT_QUICK_TABS.map((tab) => {
                const isMore = tab.value === "more";
                const isActive = isMore ? hasActiveFilters : mobileQuickTab === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => applyMobileQuickTab(tab.value)}
                    className={cn(
                      "h-7 shrink-0 rounded-full border px-3 text-[10px] font-black transition active:scale-95 cursor-pointer",
                      isActive
                        ? "border-[#E8C8C2] bg-[#FFF0EE] text-[#C72524] dark:border-[#C9A86A]/70 dark:bg-[#C9A86A]/15 dark:text-[#F9D66D]"
                        : "border-[#F0D7D3] bg-white text-[#7B6866] hover:border-[#C72524]/40 hover:text-[#C72524] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-[#C9A86A]/35 dark:hover:text-white"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="pointer-events-none absolute right-0 inset-y-0 flex items-center bg-gradient-to-l from-white via-white/80 to-transparent pl-3 pr-0 dark:from-[#070913] dark:via-[#070913]/80">
              <ChevronRight className="h-3.5 w-3.5 animate-pulse text-[#C72524] dark:text-[#C9A86A]/80" />
            </div>
          </div>
        </div>

        {/* ── Selection Counter & Select All Bar ── */}
        <div className="z-10 shrink-0 border-b border-[#F0D7D3] bg-white px-4 py-2.5 sm:px-6 flex items-center justify-between text-xs dark:border-white/5 dark:bg-[#090c17]">
          <span className="font-bold text-[#191116] dark:text-slate-300">
            Đã chọn:{" "}
            <strong className="text-[#C72524] font-black dark:text-amber-400">
              {selectedTalentIds.length} Idol
            </strong>
          </span>

          <button
            type="button"
            onClick={handleSelectAll}
            className="text-[11px] font-black uppercase tracking-wider text-[#C72524] hover:underline cursor-pointer dark:text-slate-400 dark:hover:text-amber-300"
          >
            {selectedTalentIds.length > 0 ? "BỎ CHỌN TẤT CẢ" : "CHỌN TẤT CẢ"}
          </button>
        </div>

        {/* ── Scrollable Body: Idol Cards List ── */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6 pb-8">
          {isLoading && filteredTalents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#C9A86A]" />
              <p className="text-xs font-semibold">Đang tải danh sách Idol...</p>
            </div>
          ) : filteredTalents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-3">
              <Search className="h-10 w-10 text-slate-600" />
              <p className="text-xs font-semibold">Không tìm thấy Idol phù hợp với bộ lọc</p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-400/20"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <>
              {filteredTalents.map((talent) => {
                const talentId = String(talent.id);
                const isChecked = selectedTalentIds.includes(talentId);
                const talentAvatar =
                  talent.avatar ||
                  talent.avatar_url ||
                  createInitialAvatarDataUrl(talent.name || "Idol", "");
                const locationText =
                  [talent.district, talent.city].filter(Boolean).join(", ") || "HÀ NỘI";
                const talentTypes = getTalentTypes(talent);
                const pills = [
                  ...talentTypes,
                  ...getStringList(talent.skills || talent.specialSkills),
                ];
                const bioText =
                  talent.description ||
                  talent.experience ||
                  talent.bio ||
                  "Talent nổi bật chuyên nghiệp";
                const primaryBadge = getTalentPrimaryBadge(talent);
                const stats = getTalentStats(talent);

                return (
                  <article
                    key={talentId}
                    onClick={() => handleCardClick(talentId)}
                    className={cn(
                      "group relative flex min-w-0 flex-col justify-between rounded-3xl border p-4 shadow-xl transition-all duration-300 cursor-pointer active:scale-[0.99]",
                      isChecked
                        ? "border-amber-400/90 bg-[#1a1c26] shadow-[0_0_25px_rgba(245,158,11,0.18)] ring-1 ring-amber-400/50"
                        : "border-[#2B313D] bg-[#171A21] hover:border-amber-400/40"
                    )}
                  >
                    {/* ── TOP BAR: Badge Tier + Stats Pills ── */}
                    <div className="mb-3 grid w-full grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-1 border-b border-white/5 pb-2.5">
                      <div className="min-w-0">
                        <BadgeTier
                          badge={primaryBadge}
                          tier={talent.tier}
                          seed={talentId}
                          variant="gradient"
                          size="xs"
                          className="max-w-full whitespace-nowrap px-2 text-[9px] leading-none [&>svg]:h-3 [&>svg]:w-3"
                        />
                      </div>

                      <div className="contents">
                        {/* Booking Pill */}
                        <div className="flex min-w-0 max-w-full items-center justify-center gap-1 rounded-full border border-amber-500/40 bg-[#16140e] px-1.5 py-0.5 shadow-sm">
                          <CalendarCheck className="h-3 w-3 shrink-0 text-amber-400" />
                          <span className="min-w-0 whitespace-nowrap text-[8px] font-black text-amber-300">
                            {stats.bookings} lượt booking
                          </span>
                        </div>

                        {/* Review Pill */}
                        <div className="flex min-w-0 max-w-full items-center justify-center gap-1 rounded-full border border-purple-500/40 bg-[#191022] px-1.5 py-0.5 shadow-sm">
                          <Star className="h-3.5 w-3.5 shrink-0 fill-purple-300 text-purple-300" />
                          <span className="min-w-0 whitespace-nowrap text-[8.5px] font-black text-purple-300">
                            {stats.goodReviews} đánh giá
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── MIDDLE SECTION: Avatar (with Checkbox button underneath) + Details ── */}
                    <div className="flex flex-row items-start gap-3.5 min-w-0">
                      {/* Left Column: Avatar Squircle + Checkbox Button Underneath */}
                      <div className="flex shrink-0 flex-col items-center gap-2 w-[95px]">
                        <div className="relative h-[95px] w-[95px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-md">
                          <img
                            src={talentAvatar}
                            alt={talent.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = createInitialAvatarDataUrl(talent.name || "Idol", "");
                            }}
                          />
                        </div>

                        {/* Checkbox button directly under Avatar */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectTalent(talentId);
                          }}
                          className={cn(
                            "flex h-7 w-full items-center justify-center gap-1 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95",
                            isChecked
                              ? "border-amber-400 bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                              : "border-white/20 bg-slate-950 text-slate-400 hover:border-amber-400/60 hover:text-amber-300"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-3.5 w-3.5 items-center justify-center rounded-md border transition-all shrink-0",
                              isChecked
                                ? "border-slate-950 bg-slate-950 text-amber-400"
                                : "border-slate-600 bg-slate-900 text-transparent"
                            )}
                          >
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                          <span>{isChecked ? "Đã chọn" : "Chọn"}</span>
                        </button>
                      </div>

                      {/* Right Info Details */}
                      <div className="flex flex-1 flex-col min-w-0 text-left">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="truncate text-sm md:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                                {talent.name}
                              </h3>
                              {/* Verified Check Icon */}
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-sm">
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </span>
                            </div>

                            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                              <MapPin className="h-3 w-3 shrink-0 text-amber-400" />
                              <span className="uppercase tracking-wider">{locationText}</span>
                            </div>
                          </div>
                        </div>

                        {/* Category / Skill Tags */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {pills.slice(0, 4).map((tag, idx) => (
                            <span
                              key={idx}
                              className="rounded-md border border-white/10 bg-slate-950 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Bio Description */}
                        <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-relaxed text-slate-400">
                          {bioText}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Infinite Scroll Lazy Loading Sentinel */}
              <div ref={loadMoreRef} className="py-3 flex justify-center items-center">
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#C9A86A]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang tải thêm Idol...</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="z-20 shrink-0 border-t border-white/10 bg-[#070913]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md sm:p-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 h-13 rounded-2xl border border-white/15 bg-white/5 text-xs md:text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4 text-amber-400" />
              Bước trước
            </button>
            <button
              type="button"
              onClick={onNext}
              className="flex-1 h-13 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_4px_25px_rgba(245,158,11,0.35)] transition-all hover:brightness-110 active:scale-[0.98] md:text-sm"
            >
              {selectedTalentIds.length === 0
                ? "Tiếp tục"
                : `TIẾP TỤC (${selectedTalentIds.length} IDOL)`}
            </button>
          </div>
        </div>
      </div>

      {/* ── DIALOG 1: CITY FILTER DIALOG ── */}
      <TalentFilterCityDialog
        open={isCityDialogOpen}
        cityOptions={cityOptions}
        selectedCity={selectedCity}
        citySearchQuery={citySearchQuery}
        setCitySearchQuery={setCitySearchQuery}
        onClose={() => setIsCityDialogOpen(false)}
        onSelectCity={(val) => {
          setSelectedCity(val);
          setIsCityDialogOpen(false);
        }}
      />

      {/* ── DIALOG 2: ADVANCED FILTER DIALOG ── */}
      <TalentFilterDialog
        open={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        genderOptions={GENDER_OPTIONS}
        typeOptions={TYPE_OPTIONS}
        sortOptions={SORT_OPTIONS}
        allValue="Tất cả"
        selectedGender={selectedGender}
        setSelectedGender={setSelectedGender}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        sortOption={selectedSort}
        setSortOption={setSelectedSort}
        minHeight={minHeight}
        setMinHeight={setMinHeight}
        maxHeight={maxHeight}
        setMaxHeight={setMaxHeight}
        minWeight={minWeight}
        setMinWeight={setMinWeight}
        maxWeight={maxWeight}
        setMaxWeight={setMaxWeight}
        onReset={resetAllFilters}
        onApply={() => setIsFilterDialogOpen(false)}
        cityOptions={cityOptions}
      />
    </div>
  );
}
