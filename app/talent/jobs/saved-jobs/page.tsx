"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowUpDown, Bookmark, Briefcase, Check, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import JobCard from "@/components/jobs/JobCard";
import JobCardMobile from "@/components/jobs/JobCardMobile";
import JobFilterCityDialog from "@/components/jobs/JobFilterCityDialog";
import JobFilterDialog from "@/components/jobs/JobFilterDialog";
import { cn } from "@/lib/utils";
import { loadSavedJobsForSession, SAVED_JOBS_UPDATED_EVENT, type SavedJobRecord } from "@/lib/saved-jobs";
import { normalizeLocationName, useCityFilterOptions } from "@/hooks/use-location-options";

const allValue = "Tất cả";

type StageFilter = "apply" | "pending" | "approved" | "all";
type SortOption = "newest" | "oldest";

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
];

const stageFilterOptions: StageFilter[] = ["all", "apply", "pending", "approved"];

const stageFilterLabels: Record<StageFilter, string> = {
  all: "Tất cả",
  apply: "Đang tuyển",
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
};

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function createSearchRegex(value: string) {
  const keyword = value.trim();
  if (!keyword) return null;

  try {
    return new RegExp(keyword, "i");
  } catch {
    return null;
  }
}

function getJobStage(job: any): StageFilter {
  const status = String(job?.application?.status || "").toLowerCase();
  if (status === "approved") return "approved";
  if (status === "pending" || job?.hasApplied) return "pending";
  return "apply";
}

function getBudgetValue(job: any) {
  const directValues = [job?.budgetMin, job?.budget_min, job?.budgetMax, job?.budget_max]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (directValues.length) return Math.max(...directValues);

  const budgetText = String(job?.budget || job?.salary || "");
  const numbers = budgetText.match(/\d+(?:[.,]\d+)?/g)?.map((value) => Number(value.replace(",", "."))) || [];
  if (!numbers.length) return 0;

  const multiplier = /triệu|trieu/i.test(budgetText) ? 1_000_000 : /k/i.test(budgetText) ? 1_000 : 1;
  return Math.max(...numbers) * multiplier;
}
function normalizeCityName(value: string) {
  return normalizeLocationName(value);
}

const DISTRICT_FILTER_PREFIX = "district:";

function parseDistrictLocationValue(value?: string) {
  if (!value || !value.startsWith(DISTRICT_FILTER_PREFIX)) return null;
  const [city = "", district = ""] = value.slice(DISTRICT_FILTER_PREFIX.length).split(":");
  if (!city || !district) return null;
  return {
    city: decodeURIComponent(city),
    district: decodeURIComponent(district),
  };
}

function formatLocationFilterLabel(value: string, options: { label: string; value: string }[]) {
  if (value === allValue) return "Toàn quốc";

  const districtFilter = parseDistrictLocationValue(value);
  if (districtFilter) {
    const cityLabel = options.find((option) => option.value === normalizeCityName(districtFilter.city) || option.value === districtFilter.city)?.label || districtFilter.city;
    return `${cityLabel}, ${districtFilter.district}`;
  }

  return options.find((opt) => opt.value === value)?.label || value;
}


function formatDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type FilterDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  icon?: ComponentType<any>;
  align?: "left" | "right";
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
  icon: Icon,
  align = "left",
  className,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((option) => option.value === value) || options[0];
  const isDefaultValue = value === allValue || !value;

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const query = search.toLowerCase().trim();
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, search, searchable]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (event: Event) => {
      if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const style: CSSProperties = {
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
  }, [align, isOpen]);

  const panelContent = isOpen && (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="max-h-60 overflow-hidden rounded-xl border border-[#F0D7D3] bg-white p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-[#191116] dark:border-[#2B313D] dark:bg-[#12151C] dark:text-white"
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
          <div className="px-3 py-2 text-center text-xs text-[#574D54] dark:text-slate-500">{emptyText}</div>
        ) : (
          filteredOptions.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                  isSelected
                    ? "bg-[#FFF0EE] font-bold text-[#8F0709] dark:bg-[#C9A86A]/20 dark:text-[#C9A86A]"
                    : "text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                <span className="truncate">{option.label}</span>
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
          isOpen && "border-[#8F0709] bg-[#FFF0EE]/50 dark:border-[#C9A86A]/60 dark:bg-slate-900/90"
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5 truncate text-left">
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-[#8F0709] dark:text-slate-400" />}
          <span className="truncate">{isDefaultValue ? placeholder : selectedOption?.label || placeholder}</span>
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-[#574D54] dark:text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {typeof window !== "undefined" && panelContent && createPortal(panelContent, document.body)}
    </div>
  );
}

export default function SavedJobsPage() {
  const cityOptions = useCityFilterOptions("Toàn quốc", allValue);
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJobRecord[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCity, setSelectedCity] = useState(allValue);
  const [selectedJobType, setSelectedJobType] = useState(allValue);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedStageFilter, setSelectedStageFilter] = useState<StageFilter>("all");
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileCityDialogOpen, setIsMobileCityDialogOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function syncSavedJobs() {
      const jobs = await loadSavedJobsForSession();
      if (active) {
        setSavedJobs(jobs);
      }
    }

    void syncSavedJobs();
    window.addEventListener(SAVED_JOBS_UPDATED_EVENT, syncSavedJobs);
    window.addEventListener("storage", syncSavedJobs);

    return () => {
      active = false;
      window.removeEventListener(SAVED_JOBS_UPDATED_EVENT, syncSavedJobs);
      window.removeEventListener("storage", syncSavedJobs);
    };
  }, []);

  const jobTypeOptions = useMemo(() => {
    const types = Array.from(new Set(savedJobs.map(({ job }) => String(job?.type || "").trim()).filter(Boolean)));
    return [
      { value: allValue, label: "Tất cả loại job" },
      ...types.map((type) => ({ value: type, label: type })),
    ];
  }, [savedJobs]);

  const currentCityLabel = useMemo(() => {
    return formatLocationFilterLabel(selectedCity, cityOptions);
  }, [selectedCity]);

  const filteredJobs = useMemo(() => {
    const rawKeyword = searchInput.trim();
    const keyword = normalizeSearchText(searchInput);
    const keywordRegex = createSearchRegex(searchInput);

    return savedJobs
      .filter(({ job }) => {
        const rawHaystack = [
          job?.title,
          job?.brand,
          job?.type,
          job?.city,
          job?.description,
          job?.brief,
        ].filter(Boolean).join(" ");
        const haystack = normalizeSearchText(rawHaystack);

        const matchesSearch = !rawKeyword || (keywordRegex ? keywordRegex.test(rawHaystack) : haystack.includes(keyword));
        const districtFilter = parseDistrictLocationValue(selectedCity);
        const matchesCity = selectedCity === allValue || (
          districtFilter
            ? normalizeCityName(job?.city || "") === normalizeCityName(districtFilter.city) &&
              normalizeSearchText(job?.district || job?.location || job?.address || "").includes(normalizeSearchText(districtFilter.district))
            : normalizeCityName(job?.city || "") === normalizeCityName(selectedCity)
        );
        const matchesType = selectedJobType === allValue || String(job?.type || "") === selectedJobType;
        const matchesStage = selectedStageFilter === "all" || getJobStage(job) === selectedStageFilter;
        const budgetValue = getBudgetValue(job);
        const matchesMinBudget = !minBudget || (budgetValue > 0 && budgetValue >= minBudget);
        const matchesMaxBudget = !maxBudget || (budgetValue > 0 && budgetValue <= maxBudget);

        return matchesSearch && matchesCity && matchesType && matchesStage && matchesMinBudget && matchesMaxBudget;
      })
      .sort((a, b) => {
        if (sortOption === "oldest") return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      });
  }, [savedJobs, searchInput, selectedCity, selectedJobType, selectedStageFilter, minBudget, maxBudget, sortOption]);

  const stageCounts = useMemo(() => {
    const counts: Record<StageFilter, number> = {
      all: savedJobs.length,
      apply: 0,
      pending: 0,
      approved: 0,
    };

    savedJobs.forEach(({ job }) => {
      counts[getJobStage(job)] += 1;
    });

    return counts;
  }, [savedJobs]);

  const isMobileFiltersActive =
    selectedJobType !== allValue ||
    selectedStageFilter !== "all" ||
    sortOption !== "newest" ||
    minBudget > 0 ||
    maxBudget > 0;

  const handleViewJob = (job: any) => {
    router.push(`/talent/jobs/${job.id}?from=/talent/jobs/saved-jobs`);
  };

  const handleApplyJob = (job: any) => {
    router.push(`/talent/jobs/${job.id}?from=/talent/jobs/saved-jobs&apply=1`);
  };

  const renderJobGrid = () => {
    if (filteredJobs.length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-[#F0D7D3] bg-white px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-[#08090f]/70 dark:shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] dark:border-[#C9A86A]/20 dark:bg-[#C9A86A]/10 dark:text-[#C9A86A]">
            {searchInput ? <Search className="h-7 w-7" /> : <Bookmark className="h-7 w-7" />}
          </div>
          <p className="font-display text-base font-black uppercase tracking-wide text-[#191116] dark:text-white">
            {searchInput ? "Không tìm thấy job đã lưu" : "Chưa có việc làm đã lưu"}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-xs font-semibold leading-relaxed text-[#574D54] dark:text-slate-500">
            {searchInput
              ? "Thử nhập tên job, nhà tuyển dụng hoặc địa điểm khác."
              : "Bấm nút Lưu trên card job để giữ lại những cơ hội bạn muốn xem sau."}
          </p>
          {!searchInput && (
            <button
              type="button"
              onClick={() => router.push("/talent/jobs")}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white px-5 text-xs font-black uppercase tracking-wider shadow-md transition hover:brightness-110 active:scale-95 dark:from-amber-100 dark:via-[#C9A86A] dark:to-yellow-600 dark:!text-slate-950"
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Tìm việc làm
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {filteredJobs.map(({ id, job }) => (
          <div key={id} className="contents">
            <div className="md:hidden">
              <JobCardMobile
                job={job}
                isApplied={Boolean(job?.hasApplied)}
                stage={job?.application?.status || null}
                formatDate={formatDate}
                onView={handleViewJob}
                onApply={handleApplyJob}
                onUpdateStage={() => undefined}
                onInvite={() => undefined}
                onInviteBlocked={() => undefined}
              />
            </div>
            <div className="hidden md:block">
              <JobCard
                job={job}
                isApplied={Boolean(job?.hasApplied)}
                stage={job?.application?.status || null}
                formatDate={formatDate}
                onView={handleViewJob}
                onApply={handleApplyJob}
                onUpdateStage={() => undefined}
                onInvite={() => undefined}
                onInviteBlocked={() => undefined}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-[72px] md:pb-16 md:pt-0">
      <section className="fixed left-0 right-0 top-0 z-50 block border-b border-[#F0D7D3] bg-white/95 px-4 py-3 backdrop-blur-md md:hidden dark:border-white/5 dark:bg-[#070913]/95">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all",
              isMobileFiltersActive
                ? "border-[#8F0709] bg-[#FFF0EE] text-[#8F0709] dark:border-[#C9A86A] dark:bg-[#C9A86A]/20 dark:text-[#C9A86A]"
                : "border-[#F0D7D3] bg-white text-[#574D54] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-400"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileCityDialogOpen(true)}
            className="flex min-w-[104px] shrink-0 items-center gap-1 text-left"
          >
            <span className="truncate font-display text-[15px] font-black tracking-tight text-[#191116] dark:text-white">
              {currentCityLabel}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#8F0709] dark:text-[#C9A86A]" />
          </button>
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F0709] dark:text-[#C9A86A]" />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tên job..."
              className="h-9 w-full rounded-full border border-[#F0D7D3] bg-white pl-8.5 pr-8 text-xs text-[#191116] outline-none placeholder:text-[#9A8B88] focus:border-[#8F0709] shadow-sm dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#C9A86A]/60"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#574D54] hover:text-[#8F0709] dark:text-slate-400 dark:hover:text-white"
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
      </section>

      <section className="hidden md:block relative z-40 overflow-visible rounded-3xl border border-[#F0D7D3] bg-white p-6 shadow-sm dark:border-[#C9A86A]/30 dark:bg-[#0f121d]/90 dark:shadow-[0_0_30px_rgba(201,168,106,0.06)] backdrop-blur-md">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8F0709]/40 to-transparent pointer-events-none dark:via-[#C9A86A]" />
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#FFF0EE] blur-3xl opacity-60 pointer-events-none dark:bg-[#C9A86A]/5" />

        <div className="relative z-10 mb-4">
          <h1 className="font-display text-lg font-black tracking-tight text-[#191116] md:text-xl dark:text-white">
            Việc làm đã lưu{" "}
            <span className="text-[#8F0709] font-black dark:bg-gradient-to-r dark:from-amber-200 dark:via-yellow-400 dark:to-amber-500 dark:bg-clip-text dark:text-transparent">
              ({filteredJobs.length})
            </span>
          </h1>
        </div>

        <div className="relative z-10 flex flex-col xl:flex-row gap-3 items-stretch">
          <div className="group relative flex-1 min-w-[280px]">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#E01B1F]/10 via-[#8F0709]/20 to-[#E01B1F]/10 opacity-75 blur-sm transition-all duration-500 group-hover:opacity-100 group-focus-within:opacity-100 group-focus-within:blur-md dark:from-amber-500/20 dark:via-[#C9A86A]/30 dark:to-yellow-600/20" />
            <div className="relative h-full w-full">
              <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8F0709] transition-colors group-focus-within:text-[#E01B1F] dark:text-[#C9A86A] dark:group-focus-within:text-amber-300" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Nhập tên job..."
                className="h-[50px] w-full rounded-2xl border border-[#F0D7D3] bg-white pl-12 pr-10 text-xs font-semibold text-[#191116] outline-none transition-all duration-300 placeholder:text-[#9A8B88] focus:border-[#8F0709] shadow-sm dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#C9A86A]/60"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#574D54] transition-colors hover:text-[#8F0709] dark:text-slate-450 dark:hover:text-white"
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
            <FilterDropdown
              value={selectedJobType}
              onChange={setSelectedJobType}
              options={jobTypeOptions}
              searchable={false}
              placeholder="Loại job"
            />
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => router.push("/talent/jobs")}
              className="flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white px-8 text-xs font-black uppercase tracking-wider shadow-md transition-all duration-300 hover:brightness-110 active:scale-95 xl:flex-none dark:from-amber-100 dark:via-[#C9A86A] dark:to-yellow-600 dark:!text-slate-950"
            >
              <Briefcase className="h-4 w-4" />
              <span>Tìm job</span>
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-2xl border border-[#F0D7D3] bg-white px-5 text-xs font-black uppercase tracking-wider text-[#574D54] shadow-sm transition-all duration-300 hover:border-[#8F0709] hover:text-[#8F0709] active:scale-95 xl:flex-none dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-[#C9A86A]/40 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </button>

            <div className="relative z-50 w-full xl:w-[160px]">
              <FilterDropdown
                value={sortOption}
                onChange={(value) => setSortOption(value as SortOption)}
                options={SORT_OPTIONS}
                searchable={false}
                placeholder="Sắp xếp"
                icon={ArrowUpDown}
                align="right"
                className="[&>button]:!bg-white [&>button]:!border-[#F0D7D3] [&>button]:!text-[#191116] [&>button]:hover:!border-[#8F0709] [&>button]:hover:!text-[#8F0709] dark:[&>button]:!bg-white/5 dark:[&>button]:!border-white/10 dark:[&>button]:!text-slate-300 dark:[&>button]:hover:!border-[#C9A86A]/40 dark:[&>button]:hover:!text-white"
              />
            </div>
          </div>
        </div>
      </section>

      {renderJobGrid()}

      <JobFilterDialog
        open={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        cityOptions={cityOptions}
        jobTypeOptions={jobTypeOptions}
        stageFilterOptions={stageFilterOptions}
        stageFilterLabels={stageFilterLabels}
        stageCounts={stageCounts}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedJobType={selectedJobType}
        setSelectedJobType={setSelectedJobType}
        selectedStageFilter={selectedStageFilter}
        setSelectedStageFilter={setSelectedStageFilter}
        sortOrder={sortOption}
        setSortOrder={setSortOption as any}
        minBudget={minBudget}
        setMinBudget={setMinBudget}
        maxBudget={maxBudget}
        setMaxBudget={setMaxBudget}
        onReset={() => {
          setSelectedCity(allValue);
          setSelectedJobType(allValue);
          setSelectedStageFilter("all");
          setSortOption("newest");
          setMinBudget(0);
          setMaxBudget(0);
        }}
        onApply={() => setIsMobileFiltersOpen(false)}
      />

      <JobFilterCityDialog
        open={isMobileCityDialogOpen}
        options={cityOptions}
        selectedCity={selectedCity}
        onSelectCity={(value) => {
          setSelectedCity(value);
          setIsMobileCityDialogOpen(false);
        }}
        onClose={() => setIsMobileCityDialogOpen(false)}
        currentLocationValue="Hà Nội"
        currentLocationLabel="Hà Nội"
      />
    </div>
  );
}
