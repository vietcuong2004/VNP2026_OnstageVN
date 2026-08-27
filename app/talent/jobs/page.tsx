"use client";

import React, { Suspense, useCallback, useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import jsQR from "jsqr";
import {
  Sparkles, CheckCircle,
  X, Check,
  ArrowLeft, ArrowUpDown, Copy, Users, Briefcase,
  Search, SlidersHorizontal, ChevronDown, ChevronRight, Bookmark, QrCode, Upload, Image as ImageIcon, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SPONSORSHIP_CATEGORIES } from "@/lib/brand-mvp-data";
import {
  applyTalentCampaign,
  getCampaignReferralLink,
  loadTalentCampaignsPage,
  mapCampaignToTalentJob,
  updateTalentCampaignApplicationStatus,
  loadTalentCampaignDetail,
  resolveCampaignReferralLink,
  resolveCampaignReferralLinkBySlug,
} from "@/lib/talent-api";
import { getStoredAuthUser } from "@/lib/api-client";
import { useRouter, useSearchParams } from "next/navigation";
import QRCodeContainer from "@/components/QR_Code";
import { downloadJobPoster } from "@/lib/downloadJobPoster";
import { useGuestActionPrompt } from "@/components/guest-action-prompt";
import JobCard from "@/components/jobs/JobCard";
import JobCardMobile from "@/components/jobs/JobCardMobile";
import JobFilterDialog from "@/components/jobs/JobFilterDialog";
import JobFilterCityDialog from "@/components/jobs/JobFilterCityDialog";
import KeywordSuggestionsDropdown from "@/components/search/KeywordSuggestionsDropdown";
import { loadSavedJobsForSession, SAVED_JOBS_UPDATED_EVENT } from "@/lib/saved-jobs";
import { buildJobSearchSuggestions } from "@/lib/search-suggestions.mjs";
import { normalizeLocationName, useCityFilterOptions } from "@/hooks/use-location-options";
import { getApplicationDeadlineEnd, isApplicationDeadlineExpired } from "@/lib/job-deadline";

type StageFilter = "apply" | "pending" | "approved" | "all";
type SortOrder = "newest" | "oldest" | "deadline_asc" | "near_me" | "selected_city" | string;

const stageFilterLabels: Record<StageFilter, string> = {
  apply: "Đang tuyển",
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  all: "Tất cả",
};

const JOBS_PER_PAGE = 20;
const JOB_PAGES_PER_RESULT_PAGE = 5;
const JOBS_PER_RESULT_PAGE = JOBS_PER_PAGE * JOB_PAGES_PER_RESULT_PAGE;
const JOBS_PAGE_STATE_KEY = "vnp_jobs_page_state";
const allValue = "all";

type MobileJobQuickTab = "all" | "recruiting" | "near_me" | "more";

const MOBILE_JOB_QUICK_TABS: Array<{ value: MobileJobQuickTab; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "recruiting", label: "Đang tuyển" },
  { value: "near_me", label: "Gần tôi" },
  { value: "more", label: "Thêm" },
];

const SORT_DROPDOWN_OPTIONS: FilterDropdownOption[] = [
  { value: "deadline_asc", label: "Hạn tuyển gần nhất" },
  { value: "near_me", label: "Gần vị trí hiện tại" },
  { value: "selected_city", label: "Gần thành phố đã chọn" },
];

function readCurrentTalentLocation() {
  if (typeof window === "undefined") return "Hà Nội";
  try {
    const storedProfile = window.localStorage.getItem("vnp_talent_profile");
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      const loc = parsed.city || parsed.hometown || parsed.location;
      if (loc && typeof loc === "string" && loc.trim()) return loc.trim();
    }
    const storedUser = window.localStorage.getItem("onstagevn_auth_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const loc = parsed.city || parsed.location || parsed.profile?.city || parsed.profile?.location;
      if (loc && typeof loc === "string" && loc.trim()) return loc.trim();
    }
  } catch {
    // ignore
  }
  return "Hà Nội";
}

function normalizeStageFilter(value?: string | null): StageFilter {
  if (value === "executing" || value === "completed" || value === "approved") return "approved";
  if (value === "recruiting" || value === "apply") return "apply";
  if (value === "pending") return "pending";
  return "all";
}

const jobTypeOptions = [
  "Tuyển cộng tác viên",
  "Tuyển đại sứ",
  "Beauty KOL/KOC",
  "KOL livestream",
  "Model lookbook",
  "PG event",
  "MC sự kiện",
  "Dancer performance",
];

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

function isAllLocation(val?: string): boolean {
  if (!val) return true;
  const n = val.toLowerCase().trim();
  return n === "all" || n === "toàn quốc" || n === "toan quoc" || n === "tất cả" || n === "tat ca";
}

function formatLocationFilterLabel(value: string, options: { label: string; value: string }[]) {
  if (isAllLocation(value)) return "Toàn quốc";

  const districtFilter = parseDistrictLocationValue(value);
  if (districtFilter) {
    const cityLabel = options.find((option) => option.value === normalizeCityName(districtFilter.city) || option.value === districtFilter.city)?.label || districtFilter.city;
    return `${cityLabel}, ${districtFilter.district}`;
  }

  return options.find((opt) => opt.value === value)?.label || value;
}


const hotJobLocations = [
  { value: "Hà Nội", label: "Hà Nội", count: 103 },
  { value: "Hồ Chí Minh", label: "Hồ Chí Minh", count: 100 },
  { value: "Thái Hà", label: "Thái Hà", count: 50 },
  { value: "Đà Nẵng", label: "Đà Nẵng", count: 42 },
  { value: "Hồ Tây", label: "Hồ Tây", count: 30 },
];

const jobTypeDropdownOptions = [
  { value: allValue, label: "Tất cả loại hình job" },
  ...jobTypeOptions.map((type) => ({ value: type, label: type })),
];

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  const maxVisible = 10;
  const safeTotal = Math.max(1, totalPages);
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(safeTotal, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function normalizeFilterText(text?: string | null): string {
  if (!text) return "";
  return text.toLowerCase().trim();
}

function parseVNDNumber(val: string): number {
  const digits = val.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function formatVNDNumber(num: number): string {
  if (!num || num <= 0) return "";
  return num.toLocaleString("vi-VN");
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
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterDropdownOption[];
  searchPlaceholder?: string;
  emptyText?: string;
  searchable?: boolean;
  icon?: React.ReactNode;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !dropdownRef.current?.contains(target)
        && !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function updateMenuRect() {
      setMenuRect(dropdownRef.current?.getBoundingClientRect() ?? null);
    }

    updateMenuRect();
    window.addEventListener("resize", updateMenuRect);
    window.addEventListener("scroll", updateMenuRect, true);

    return () => {
      window.removeEventListener("resize", updateMenuRect);
      window.removeEventListener("scroll", updateMenuRect, true);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex h-[50px] w-full items-center justify-between gap-2 rounded-2xl border border-[#F0D7D3] bg-[#FFFDFC] px-4 text-xs text-[#191116] outline-none transition-all duration-300 hover:border-[#C72524]/40 focus:border-[#C72524]/60 shadow-inner cursor-pointer dark:border-white/5 dark:bg-slate-950/60 dark:text-white dark:hover:border-[#C9A86A]/40 dark:focus:border-[#C9A86A]/60",
          isOpen && "border-[#C72524]/60 bg-[#FFF7F6] dark:border-[#C9A86A]/60 dark:bg-slate-900/90"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <span className="truncate text-left font-medium text-[#191116] dark:text-slate-200">{selectedOption?.label}</span>
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-[#9A8581] transition-transform duration-300 dark:text-slate-400", isOpen && "rotate-180 text-[#C72524] dark:text-[#C9A86A]")} />
      </button>

      {mounted && isOpen && menuRect && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] max-h-60 overflow-hidden rounded-xl border border-[#F0D7D3] bg-white p-1.5 shadow-[0_24px_60px_rgba(143,7,9,0.16)] animate-in fade-in zoom-in-95 duration-150 dark:border-[#C9A86A]/25 dark:bg-[#070913] dark:shadow-[0_24px_60px_rgba(0,0,0,0.75)]"
          style={{
            left: menuRect.left,
            top: menuRect.bottom + 6,
            width: menuRect.width,
          }}
        >
          {searchable && (
            <div className="mb-1.5 px-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#C9A86A]" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg border border-[#F0D7D3] bg-[#FFFDFC] py-1.5 pl-8 pr-2.5 text-xs text-[#191116] outline-none placeholder:text-[#B8A2A0] focus:border-[#C72524]/50 dark:border-white/10 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#C9A86A]/50"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-44 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setSearchInput("");
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer",
                  option.value === value
                    ? "bg-[#FFF1EF] text-[#9B1215] font-bold dark:bg-[#C9A86A]/20 dark:text-[#C9A86A]"
                    : "text-[#5F5554] hover:bg-[#FFF7F6] hover:text-[#C72524] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && <Check className="h-3.5 w-3.5 shrink-0 text-[#C9A86A]" />}
              </button>
            ))}

            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-center text-xs text-slate-500">{emptyText}</div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function sentenceCaseText(value: string) {
  const text = String(value || "").trim();
  if (!text) return "";

  const firstLetterIndex = text.search(/\p{L}/u);
  if (firstLetterIndex < 0) return text;

  return `${text.slice(0, firstLetterIndex)}${text.charAt(firstLetterIndex).toLocaleUpperCase("vi-VN")}${text.slice(firstLetterIndex + 1)}`;
}

function displayCampaignDate(value?: string | null) {
  if (!value) return "-";

  const raw = String(value);
  const normalized = raw.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})?$/, ".$1$2");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
    return raw;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function jobPublishTimestamp(job: any) {
  const raw = job?.publishedAt || job?.published_at || job?.createdAt || job?.created_at || job?.startDate || job?.eventDate || "";
  const timestamp = new Date(String(raw).replace(/\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})?$/, ".$1$2")).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function readCurrentTalentIdentity() {
  if (typeof window === "undefined") {
    return { userId: "", profileId: "" };
  }

  const user = getStoredAuthUser<{ id?: number | string }>();
  let profileId = "";

  try {
    const storedProfile = window.localStorage.getItem("vnp_talent_profile");
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile) as { backendProfileId?: number | string };
      profileId = String(parsed.backendProfileId || "");
    }
  } catch {
    profileId = "";
  }

  return {
    userId: String(user?.id || ""),
    profileId,
  };
}

function JobsPageContent() {
  const cityDropdownOptions = useCityFilterOptions("Toàn quốc", allValue);
  const router = useRouter();
  const currentTalent = readCurrentTalentIdentity();
  const currentTalentId = currentTalent.profileId || currentTalent.userId;
  const searchParams = useSearchParams();
  const { requireAuthAction, GuestActionPrompt } = useGuestActionPrompt();
  const campaignIdParam = searchParams.get("campaignId");
  const stageParam = searchParams.get("stage");
  const getSavedJobsState = () => {
    if (typeof window === "undefined") return null;
    try {
      const saved = sessionStorage.getItem(JOBS_PAGE_STATE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  };

  const initialJobsStateRef = useRef<any>(null);
  if (initialJobsStateRef.current === null && typeof window !== "undefined") {
    initialJobsStateRef.current = getSavedJobsState();
  }
  const initialJobsState = initialJobsStateRef.current;

  const [searchQuery, setSearchQuery] = useState(() => initialJobsState?.searchQuery || "");
  const [searchInput, setSearchInput] = useState(() => initialJobsState?.searchInput || "");
  const [selectedCity, setSelectedCity] = useState(() => initialJobsState?.selectedCity || allValue);
  const [appliedCity, setAppliedCity] = useState(() => initialJobsState?.appliedCity || allValue);
  const [selectedJobType, setSelectedJobType] = useState(() => initialJobsState?.selectedJobType || allValue);
  const [appliedJobType, setAppliedJobType] = useState(() => initialJobsState?.appliedJobType || allValue);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(() => initialJobsState?.showAdvancedFilters || false);
  const [isJobSuggestOpen, setIsJobSuggestOpen] = useState(false);
  const [isMobileJobSearchExpanded, setIsMobileJobSearchExpanded] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileCityDialogOpen, setIsMobileCityDialogOpen] = useState(false);

  const [mobileQuickTab, setMobileQuickTab] = useState<MobileJobQuickTab>("all");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrInputValue, setQrInputValue] = useState("");
  const [qrImagePreview, setQrImagePreview] = useState<string | null>(null);
  const [qrScanStatus, setQrScanStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [qrScanMessage, setQrScanMessage] = useState("");
  const qrFileInputRef = useRef<HTMLInputElement | null>(null);
  const [appliedShowAdvancedFilters, setAppliedShowAdvancedFilters] = useState(() => initialJobsState?.appliedShowAdvancedFilters || false);
  const [minBudget, setMinBudget] = useState(() => initialJobsState?.minBudget || 0);
  const [appliedMinBudget, setAppliedMinBudget] = useState(() => initialJobsState?.appliedMinBudget || 0);
  const [maxBudget, setMaxBudget] = useState(() => initialJobsState?.maxBudget || 0);
  const [appliedMaxBudget, setAppliedMaxBudget] = useState(() => initialJobsState?.appliedMaxBudget || 0);
  const [selectedSponsorshipFilter, setSelectedSponsorshipFilter] = useState(() => initialJobsState?.selectedSponsorshipFilter || "all");
  const [selectedStageFilter, setSelectedStageFilter] = useState<StageFilter>(() => stageParam ? normalizeStageFilter(stageParam) : normalizeStageFilter(initialJobsState?.selectedStageFilter));
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => initialJobsState?.sortOrder || "deadline_asc");
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" }[]>([]);
  const [displayJobs, setDisplayJobs] = useState<any[]>([]);
  const [savedJobCount, setSavedJobCount] = useState(0);
  const [activeReferralLink, setActiveReferralLink] = useState<{ [campId: string]: any }>({});
  const [loadingReferral, setLoadingReferral] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState<any>(null);
  const jobRequestRef = useRef(0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const mobileJobSearchInputRef = useRef<HTMLInputElement | null>(null);
  const [jobBackendPage, setJobBackendPage] = useState(() => initialJobsState?.jobBackendPage || 1);
  const [jobTotal, setJobTotal] = useState(0);
  const [jobStageCounts, setJobStageCounts] = useState<Record<StageFilter, number>>({
    all: 0,
    apply: 0,
    pending: 0,
    approved: 0,
  });
  const [jobResultPage, setJobResultPage] = useState(() => initialJobsState?.jobResultPage || 1);
  const [jobResultPageCount, setJobResultPageCount] = useState(1);
  const [hasMoreJobs, setHasMoreJobs] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingMoreJobs, setIsLoadingMoreJobs] = useState(false);
  const isMobileOverlayOpen = isMobileFiltersOpen || isMobileCityDialogOpen || isMobileJobSearchExpanded;

  useEffect(() => {
    async function syncSavedJobCount() {
      const jobs = await loadSavedJobsForSession();
      setSavedJobCount(jobs.length);
    }

    void syncSavedJobCount();
    window.addEventListener(SAVED_JOBS_UPDATED_EVENT, syncSavedJobCount);
    window.addEventListener("storage", syncSavedJobCount);

    return () => {
      window.removeEventListener(SAVED_JOBS_UPDATED_EVENT, syncSavedJobCount);
      window.removeEventListener("storage", syncSavedJobCount);
    };
  }, []);

  useEffect(() => {
    if (stageParam) {
      setSelectedStageFilter(normalizeStageFilter(stageParam));
    }
  }, [stageParam]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.dispatchEvent(new CustomEvent("onstage:mobile-overlay", { detail: { open: isMobileOverlayOpen } }));

    if (!isMobileOverlayOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      window.dispatchEvent(new CustomEvent("onstage:mobile-overlay", { detail: { open: false } }));
    };
  }, [isMobileOverlayOpen]);

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoadingJobs && !isLoadingMoreJobs && displayJobs.length > 0) {
      const saved = sessionStorage.getItem(JOBS_PAGE_STATE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const savedBackendPage = Number(parsed?.jobBackendPage || 1);
          if (jobBackendPage < savedBackendPage) return;

          if (parsed?.scrollY) {
            requestAnimationFrame(() => {
              window.scrollTo(0, parsed.scrollY);
            });
          }
        } catch {
          // ignore
        }
        sessionStorage.removeItem(JOBS_PAGE_STATE_KEY);
      }
    }
  }, [isLoadingJobs, isLoadingMoreJobs, displayJobs.length, jobBackendPage]);

  const handleViewJob = (job: any) => {
    if (typeof window !== "undefined") {
      const stateSnapshot = {
        scrollY: window.scrollY || window.pageYOffset || 0,
        searchQuery,
        searchInput,
        selectedCity,
        appliedCity,
        selectedJobType,
        appliedJobType,
        showAdvancedFilters,
        appliedShowAdvancedFilters,
        minBudget,
        appliedMinBudget,
        maxBudget,
        appliedMaxBudget,
        selectedSponsorshipFilter,
        selectedStageFilter,
        sortOrder,
        jobResultPage,
        jobBackendPage,
      };
      sessionStorage.setItem(JOBS_PAGE_STATE_KEY, JSON.stringify(stateSnapshot));
    }
    router.push(`/talent/jobs/${job.id}?from=/talent/jobs`);
  };

  const handleInviteClick = async (camp: any) => {
    if (!requireAuthAction({ actionLabel: "Tạo link giới thiệu job" })) return;
    setLoadingReferral(camp.id);
    try {
      const res = await getCampaignReferralLink(camp.id);
      setActiveReferralLink(prev => ({ ...prev, [camp.id]: res }));
      setShowInviteModal(camp);
    } catch (err) {
      console.warn("Error getting referral link:", err);
      setActiveReferralLink(prev => ({ ...prev, [camp.id]: null }));
      setShowInviteModal(camp);
      addToast("Chưa tạo được link giới thiệu job. Vui lòng thử lại sau.", "info");
    } finally {
      setLoadingReferral(null);
    }
  };

  const handleCopyLink = (url: string) => {
    if (!url) {
      addToast("Link giới thiệu chưa sẵn sàng. Vui lòng thử lại sau.", "info");
      return;
    }
    navigator.clipboard.writeText(url);
    addToast("Đã sao chép link giới thiệu vào bộ nhớ tạm!", "success");
  };

  const resetQrModal = () => {
    setIsQrModalOpen(false);
    setQrInputValue("");
    setQrImagePreview(null);
    setQrScanStatus("idle");
    setQrScanMessage("");
    if (qrFileInputRef.current) {
      qrFileInputRef.current.value = "";
    }
  };

  const handleQrImageFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      addToast("Vui lòng chọn một tệp hình ảnh hợp lệ (.jpg, .png, .webp)", "info");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      setQrImagePreview(dataUrl);
      setQrScanStatus("scanning");
      setQrScanMessage("Đang quét mã QR từ hình ảnh...");

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setQrScanStatus("error");
            setQrScanMessage("Không thể khởi tạo bộ giải mã hình ảnh.");
            return;
          }

          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && code.data && code.data.trim()) {
            const decodedUrl = code.data.trim();
            setQrInputValue(decodedUrl);
            setQrScanStatus("success");
            setQrScanMessage("Đã trích xuất thành công link QR từ ảnh!");
            addToast("Đã tự động đọc và điền link QR từ ảnh!", "success");
          } else {
            const codeInverted = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "onlyInvert",
            });
            if (codeInverted && codeInverted.data && codeInverted.data.trim()) {
              const decodedUrl = codeInverted.data.trim();
              setQrInputValue(decodedUrl);
              setQrScanStatus("success");
              setQrScanMessage("Đã trích xuất thành công link QR từ ảnh!");
              addToast("Đã tự động đọc và điền link QR từ ảnh!", "success");
            } else {
              setQrScanStatus("error");
              setQrScanMessage("Không tìm thấy mã QR trong ảnh. Hãy chọn ảnh rõ hơn hoặc dán link thủ công.");
            }
          }
        } catch (err) {
          console.error("QR decode error:", err);
          setQrScanStatus("error");
          setQrScanMessage("Không thể đọc mã QR từ tệp này.");
        }
      };
      img.onerror = () => {
        setQrScanStatus("error");
        setQrScanMessage("Không thể tải hình ảnh này.");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyByQrCode = () => {
    const value = qrInputValue.trim();
    if (!value) {
      addToast("Vui lòng nhập link hoặc tải ảnh QR hợp lệ!", "info");
      return;
    }

    let targetUrl = value;

    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      if (targetUrl.startsWith("/")) {
        targetUrl = `${window.location.origin}${targetUrl}`;
      } else if (/^\d+$/.test(targetUrl)) {
        targetUrl = `${window.location.origin}/talent/jobs/${targetUrl}`;
      } else {
        targetUrl = `https://${targetUrl}`;
      }
    }

    window.open(targetUrl, "_blank", "noopener,noreferrer");
    addToast("Đã mở link ứng tuyển ở tab mới!", "success");
    resetQrModal();
  };

  const getSplitBudgetLabel = (budgetStr: string) => {
    const firstPart = budgetStr.split("-")[0]?.trim().toLowerCase() || "";
    const rawNumber = firstPart.match(/\d+([\.\,]\d+)?/)?.[0];
    if (!rawNumber) return "";

    const number = Number(rawNumber.replace(",", "."));
    if (!Number.isFinite(number) || number <= 0) return "";

    const suffix = budgetStr.includes("/giờ")
      ? "/giờ"
      : budgetStr.includes("/job")
        ? "/job"
        : "/ngày";

    const minVal = firstPart.includes("triệu") || firstPart.includes("trieu")
      ? number * 1_000_000
      : firstPart.includes("k")
        ? number * 1_000
        : Number(firstPart.replace(/[^\d]/g, ""));

    const splitVal = Math.round(minVal / 2);
    if (splitVal >= 1_000_000) {
      const millions = splitVal / 1_000_000;
      const formatted = Number.isInteger(millions)
        ? String(millions)
        : millions.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
      return `${formatted} triệu${suffix}`;
    }

    if (splitVal >= 1_000) return `${Math.round(splitVal / 1_000).toLocaleString("vi-VN")}k${suffix}`;

    if (splitVal > 0) return `${splitVal.toLocaleString("vi-VN")}đ${suffix}`;
    return "";
  };

  const addToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const normalizeJobStage = (status?: string | null) => {
    const value = String(status || "").toLowerCase().trim();
    if (!value) return "";
    if (["approved", "accepted", "executing", "completed", "confirmed", "done", "hired", "selected"].includes(value)) {
      return "approved";
    }
    return "pending";
  };

  const getTalentJobStage = (job: any) => {
    if (!job) return "";
    const backendStage = normalizeJobStage(job.application?.status);
    if (backendStage) return backendStage;

    const appItem = job.applicants?.find((a: any) => {
      const talentId = String(a.talentId || a.profileId || a.userId || "");
      return talentId === currentTalent.profileId || talentId === currentTalent.userId;
    });
    return normalizeJobStage(appItem?.stage) || "";
  };

  const stageCountKey = (stage?: string | null): StageFilter | null => {
    const normalized = normalizeJobStage(stage);
    return normalized ? normalized as StageFilter : null;
  };

  const hasTalentApplication = (job: any) => {
    return Boolean(
      job.hasApplied
      || job.application
      || job.applicants?.some((a: any) => {
        const talentId = String(a.talentId || a.profileId || a.userId || "");
        return talentId === currentTalent.profileId || talentId === currentTalent.userId;
      })
    );
  };

  useEffect(() => {
    setShowAllBenefits(false);
  }, [selectedJob?.id]);

  const backendStageFilter = useMemo<"recruiting" | "pending" | "executing" | undefined>(() => {
    if (selectedStageFilter === "apply") return "recruiting";
    if (selectedStageFilter === "approved") return "executing";
    if (selectedStageFilter === "pending") return "pending";
    return undefined;
  }, [selectedStageFilter]);

  const myCityLocation = readCurrentTalentLocation();
  const effectiveSelectedCity = (appliedCity !== allValue && !isAllLocation(appliedCity))
    ? appliedCity
    : (selectedCity !== allValue && !isAllLocation(selectedCity))
      ? selectedCity
      : "";

  const jobQueryOptions = useMemo(() => ({
    q: searchQuery || undefined,
    type: appliedJobType !== allValue ? appliedJobType : undefined,
    city: (appliedCity !== allValue && !isAllLocation(appliedCity)) ? appliedCity : undefined,
    minBudget: appliedShowAdvancedFilters && appliedMinBudget > 0 ? appliedMinBudget : undefined,
    maxBudget: appliedShowAdvancedFilters && appliedMaxBudget > 0 ? appliedMaxBudget : undefined,
    sortOrder: sortOrder || "deadline_asc",
    nearCity: myCityLocation,
    selectedCity: effectiveSelectedCity || undefined,
    stage: backendStageFilter,
  }), [searchQuery, appliedJobType, appliedCity, appliedShowAdvancedFilters, appliedMinBudget, appliedMaxBudget, sortOrder, myCityLocation, effectiveSelectedCity, backendStageFilter]);

  const loadJobsPage = useCallback(async (page: number, mode: "replace" | "append", resultPage: number) => {
    const requestId = ++jobRequestRef.current;

    if (mode === "append") setIsLoadingMoreJobs(true);
    else setIsLoadingJobs(true);

    try {
      const response = await loadTalentCampaignsPage({
        ...jobQueryOptions,
        page,
        perPage: JOBS_PER_PAGE,
      });
      if (requestId !== jobRequestRef.current) return;

      const backendJobs = response.data.map(mapCampaignToTalentJob);
      setDisplayJobs((current) => {
        if (mode === "replace") return backendJobs;

        const seenIds = new Set(current.map((job) => String(job.id)));
        const nextItems = backendJobs.filter((job) => !seenIds.has(String(job.id)));
        return [...current, ...nextItems].slice(0, JOBS_PER_RESULT_PAGE);
      });

      const backendAppliedIds = backendJobs.filter((job) => job.hasApplied).map((job) => String(job.id));
      setAppliedJobs((prev) => {
        const next = Array.from(new Set([...prev, ...backendAppliedIds]));
        return next.length === prev.length ? prev : next;
      });

      setJobBackendPage(response.meta.current_page);
      setJobTotal(response.meta.total);
      setJobStageCounts({
        all: response.meta.stage_counts?.all ?? response.meta.total,
        apply: response.meta.stage_counts?.recruiting ?? 0,
        pending: response.meta.stage_counts?.pending ?? 0,
        approved:
          (response.meta.stage_counts?.approved ?? 0) +
          (response.meta.stage_counts?.accepted ?? 0) +
          (response.meta.stage_counts?.executing ?? 0) +
          (response.meta.stage_counts?.completed ?? 0) +
          (response.meta.stage_counts?.confirmed ?? 0),
      });
      setJobResultPage(resultPage);
      setJobResultPageCount(Math.max(1, Math.ceil((response.meta.total || backendJobs.length) / JOBS_PER_RESULT_PAGE)));
      setHasMoreJobs(response.meta.has_more && response.meta.current_page < resultPage * JOB_PAGES_PER_RESULT_PAGE);
    } catch (error) {
      console.warn("Cannot load talent campaigns from backend", error);
      if (mode === "replace") setDisplayJobs([]);
      setHasMoreJobs(false);
    } finally {
      if (requestId === jobRequestRef.current) {
        setIsLoadingJobs(false);
        setIsLoadingMoreJobs(false);
      }
    }
  }, [jobQueryOptions]);

  const loadJobsResultPage = useCallback(async (resultPage: number, restoreUntilBackendPage?: number) => {
    const safeResultPage = Math.max(1, Number(resultPage) || 1);
    const firstBackendPage = ((safeResultPage - 1) * JOB_PAGES_PER_RESULT_PAGE) + 1;
    const lastBackendPage = Math.min(
      safeResultPage * JOB_PAGES_PER_RESULT_PAGE,
      Math.max(firstBackendPage, Number(restoreUntilBackendPage) || firstBackendPage)
    );

    for (let page = firstBackendPage; page <= lastBackendPage; page += 1) {
      await loadJobsPage(page, page === firstBackendPage ? "replace" : "append", safeResultPage);
    }
  }, [loadJobsPage]);

  useEffect(() => {
    void loadJobsResultPage(initialJobsState?.jobResultPage || 1, initialJobsState?.jobBackendPage);
  }, [loadJobsResultPage, initialJobsState?.jobBackendPage, initialJobsState?.jobResultPage]);

  useEffect(() => {
    if (!hasMoreJobs || isLoadingJobs || isLoadingMoreJobs) return;

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadJobsPage(jobBackendPage + 1, "append", jobResultPage);
        }
      },
      { rootMargin: "300px 0px", threshold: 0 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMoreJobs, isLoadingJobs, isLoadingMoreJobs, jobBackendPage, jobResultPage, loadJobsPage]);

  useEffect(() => {
    if (!campaignIdParam || !displayJobs.length) return;

    const invitedJob = displayJobs.find((job) => String(job.id) === String(campaignIdParam));
    if (invitedJob) {
      setSelectedJob((current: any) => (
        String(current?.id) === String(invitedJob.id) ? current : invitedJob
      ));
    }
  }, [campaignIdParam, displayJobs]);

  const handleApply = async (id: string, title: string) => {
    if (!requireAuthAction({ actionLabel: "Ứng tuyển job" })) return;
    if (appliedJobs.includes(id)) return;

    if (/^\d+$/.test(String(id))) {
      try {
        await applyTalentCampaign(id, "Tôi rất quan tâm và mong muốn ứng tuyển thực hiện chiến dịch này.");
        setDisplayJobs((prev) => prev.map((job) => (
          String(job.id) === String(id)
            ? { ...job, hasApplied: true, application: { ...(job.application || {}), status: "new" } }
            : job
        )));
      } catch (error) {
        console.warn("Cannot apply campaign from backend", error);
        addToast(error instanceof Error ? error.message : "Chưa gửi được ứng tuyển. Vui lòng thử lại.", "info");
        return;
      }
    }

    setAppliedJobs((prev) => [...prev, id]);
    setJobStageCounts((current) => ({
      ...current,
      apply: Math.max(0, current.apply - 1),
      pending: current.pending + 1,
    }));
    addToast(`Ứng tuyển thành công công việc "${title}"!`);
  };

  const handleUpdateStage = async (jobId: string, nextStage: "executing" | "completed") => {
    if (!requireAuthAction({ actionLabel: "Cập nhật trạng thái job" })) return;
    const currentJob = displayJobs.find((job) => String(job.id) === String(jobId)) || selectedJob;
    const previousCountKey = stageCountKey(getTalentJobStage(currentJob));
    const nextCountKey = stageCountKey(nextStage);

    try {
      if (/^\d+$/.test(String(jobId))) {
        await updateTalentCampaignApplicationStatus(jobId, nextStage);
      }
    } catch (error) {
      console.warn("Cannot update campaign application status", error);
      addToast("Chưa cập nhật được trạng thái lên backend. Vui lòng thử lại.", "info");
      return;
    }

    setDisplayJobs(prevJobs => prevJobs.map(job => {
      if (String(job.id) !== String(jobId)) return job;

      return {
        ...job,
        application: job.application ? { ...job.application, status: nextStage } : job.application,
        applicants: (job.applicants || []).map((a: any) =>
          String(a.talentId || a.profileId || a.userId || "") === currentTalentId ? { ...a, stage: nextStage } : a
        )
      };
    }));

    if (selectedJob && String(selectedJob.id) === String(jobId)) {
      setSelectedJob((prev: any) => ({
        ...prev,
        application: prev.application ? { ...prev.application, status: nextStage } : prev.application,
        applicants: (prev.applicants || []).map((a: any) =>
          String(a.talentId || a.profileId || a.userId || "") === currentTalentId ? { ...a, stage: nextStage } : a
        )
      }));
    }

    if (previousCountKey !== nextCountKey && nextCountKey) {
      const decrementKey = previousCountKey || "apply";
      setJobStageCounts((current) => ({
        ...current,
        [decrementKey]: Math.max(0, current[decrementKey] - 1),
        [nextCountKey]: current[nextCountKey] + 1,
      }));
    }

    if (nextStage === "executing") {
      addToast("Bắt đầu thực hiện job (Check-in thành công)!", "success");
    } else if (nextStage === "completed") {
      addToast("Đã báo cáo hoàn thành job (Chờ nghiệm thu)!", "success");
    }
  };

  const filteredCampaigns = displayJobs.filter((camp) => {
    const districtFilter = parseDistrictLocationValue(appliedCity);
    const selectedCityText = normalizeFilterText(districtFilter ? districtFilter.city : appliedCity);
    const selectedTypeText = normalizeFilterText(appliedJobType);

    const isAllCity = isAllLocation(appliedCity);
    const matchesCity = isAllCity || (
      districtFilter
        ? normalizeFilterText(camp.city || "").includes(normalizeFilterText(districtFilter.city)) &&
        normalizeFilterText(camp.district || camp.location || camp.address || camp.title || "").includes(normalizeFilterText(districtFilter.district))
        : normalizeFilterText(camp.city || "").includes(selectedCityText)
    );

    const matchesType = appliedJobType === allValue
      || [
        camp.type,
        camp.jobType,
        camp.campaignType,
        camp.title,
      ].some((value) => normalizeFilterText(value).includes(selectedTypeText));

    const budgetMin = Number(camp.budgetMin ?? camp.budget_min ?? 0);
    const budgetMax = Number(camp.budgetMax ?? camp.budget_max ?? budgetMin);
    const matchesMinBudget = !appliedShowAdvancedFilters || appliedMinBudget <= 0 || budgetMax >= appliedMinBudget;
    const matchesMaxBudget = !appliedShowAdvancedFilters || appliedMaxBudget <= 0 || budgetMin <= appliedMaxBudget;

    // 1. Sponsorship filter
    let matchesSponsorship = true;
    if (selectedSponsorshipFilter === "any") {
      matchesSponsorship = camp.sponsorships && camp.sponsorships.length > 0;
    } else if (selectedSponsorshipFilter !== "all") {
      const selectedCat = SPONSORSHIP_CATEGORIES.find((c: { id: string, label: string }) => c.id === selectedSponsorshipFilter);
      matchesSponsorship = camp.sponsorships && camp.sponsorships.some((s: { category: string }) =>
        s.category.toLowerCase().includes(selectedCat?.label.toLowerCase() || "") ||
        s.category.toLowerCase().includes(selectedSponsorshipFilter.toLowerCase())
      );
    }

    let matchesStage = true;
    if (selectedStageFilter === "apply") {
      const isExpired = isApplicationDeadlineExpired(camp.applicationDeadline);
      const isApplied = appliedJobs.includes(String(camp.id)) || hasTalentApplication(camp);
      matchesStage = !isExpired && !isApplied;
    } else if (selectedStageFilter === "pending") {
      const stage = getTalentJobStage(camp);
      const isApplied = appliedJobs.includes(String(camp.id)) || hasTalentApplication(camp);
      matchesStage = stage === "pending" || (isApplied && stage !== "approved");
    } else if (selectedStageFilter === "approved") {
      const stage = getTalentJobStage(camp);
      matchesStage = stage === "approved";
    }

    return matchesCity && matchesType && matchesMinBudget && matchesMaxBudget && matchesSponsorship && matchesStage;
  });

  const visibleCampaigns = [...filteredCampaigns].sort((a, b) => {
    if (sortOrder === "deadline_asc") {
      const aDate = a.applicationDeadline ? (getApplicationDeadlineEnd(a.applicationDeadline)?.getTime() ?? null) : null;
      const bDate = b.applicationDeadline ? (getApplicationDeadlineEnd(b.applicationDeadline)?.getTime() ?? null) : null;
      const nowTime = Date.now();

      const getPriority = (d: number | null) => {
        if (d === null) return 1;
        if (d >= nowTime) return 0;
        return 2;
      };

      const aPri = getPriority(aDate);
      const bPri = getPriority(bDate);
      if (aPri !== bPri) return aPri - bPri;

      if (aDate !== null && bDate !== null && aDate !== bDate) {
        return aDate - bDate;
      }
    } else if (sortOrder === "near_me") {
      const myCity = normalizeFilterText(readCurrentTalentLocation());
      const aMatch = (normalizeFilterText(a.city || "").includes(myCity) || normalizeFilterText(a.location || "").includes(myCity)) ? 1 : 0;
      const bMatch = (normalizeFilterText(b.city || "").includes(myCity) || normalizeFilterText(b.location || "").includes(myCity)) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
    } else if (sortOrder === "selected_city") {
      const targetCity = normalizeFilterText(effectiveSelectedCity || readCurrentTalentLocation());
      if (targetCity) {
        const aMatch = (normalizeFilterText(a.city || "").includes(targetCity) || normalizeFilterText(a.location || "").includes(targetCity)) ? 1 : 0;
        const bMatch = (normalizeFilterText(b.city || "").includes(targetCity) || normalizeFilterText(b.location || "").includes(targetCity)) ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
      }
    }

    const aTime = jobPublishTimestamp(a);
    const bTime = jobPublishTimestamp(b);
    return sortOrder === "oldest" ? aTime - bTime : bTime - aTime;
  });
  const jobPageNumbers = getVisiblePageNumbers(jobResultPage, jobResultPageCount);

  function goToJobResultPage(page: number) {
    if (page < 1 || page > jobResultPageCount || page === jobResultPage || isLoadingJobs) return;
    const backendPage = ((page - 1) * JOB_PAGES_PER_RESULT_PAGE) + 1;
    void loadJobsPage(backendPage, "replace", page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      document.querySelectorAll("[data-app-scroll-root], main").forEach((element) => {
        element.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      });
    }
  }

  function applyFilters() {
    setSearchQuery(searchInput.trim());
    setAppliedCity(selectedCity);
    setAppliedJobType(selectedJobType);
    setAppliedShowAdvancedFilters(showAdvancedFilters);
    setAppliedMinBudget(minBudget);
    setAppliedMaxBudget(maxBudget);
  }

  useEffect(() => {
    if (!isMobileJobSearchExpanded) return;

    setIsJobSuggestOpen(true);
    window.setTimeout(() => {
      mobileJobSearchInputRef.current?.focus();
    }, 0);
  }, [isMobileJobSearchExpanded]);

  const closeMobileJobSearch = useCallback(() => {
    setIsMobileJobSearchExpanded(false);
    setIsJobSuggestOpen(false);
  }, []);

  const jobSearchSuggestions = useMemo(
    () => buildJobSearchSuggestions({
      jobs: displayJobs,
      query: searchInput,
      limit: 7,
      isPartial: jobTotal > displayJobs.length,
    }),
    [displayJobs, jobTotal, searchInput],
  );

  const handleJobSuggestionPick = useCallback((suggestion: any) => {
    const nextInput = String(suggestion.query || suggestion.label || "").trim();
    const nextSearchQuery = String(suggestion.searchQuery ?? nextInput).trim();
    const nextCity = suggestion.city || selectedCity;
    const nextType = suggestion.type || selectedJobType;

    setSearchInput(nextInput);
    setSearchQuery(nextSearchQuery);
    setSelectedCity(nextCity);
    setAppliedCity(nextCity);
    setSelectedJobType(nextType);
    setAppliedJobType(nextType);
    setAppliedShowAdvancedFilters(showAdvancedFilters);
    setAppliedMinBudget(minBudget);
    setAppliedMaxBudget(maxBudget);
    setIsJobSuggestOpen(false);
    setIsMobileJobSearchExpanded(false);
  }, [maxBudget, minBudget, selectedCity, selectedJobType, showAdvancedFilters]);

  const stageFilterOptions: StageFilter[] = ["all", "apply", "pending", "approved"];
  const stageCounts = jobStageCounts;
  const activeResultTotal = stageCounts[selectedStageFilter] ?? jobTotal;
  const currentCityLabel = useMemo(() => {
    return formatLocationFilterLabel(appliedCity, cityDropdownOptions);
  }, [appliedCity]);
  const isMobileFiltersActive =
    selectedCity !== allValue ||
    selectedJobType !== allValue ||
    selectedStageFilter !== "all" ||
    minBudget > 0 ||
    maxBudget > 0 ||
    sortOrder !== "deadline_asc";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Mobile Search Toolbar */}
      <section className="block md:hidden sticky top-0 z-40 -mx-4 border-b border-[#F4E1DE] bg-white px-4 py-3.5 backdrop-blur-md dark:border-white/5 dark:bg-[#070913]/95">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all cursor-pointer",
              isMobileFiltersActive
                ? "border-[#C72524] bg-[#FFF1EF] text-[#9B1215] dark:border-[#C9A86A] dark:bg-[#C9A86A]/20 dark:text-[#C9A86A]"
                : "border-white/10 bg-slate-900/60 text-slate-400"
            )}
            aria-label="Mở bộ lọc"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsMobileCityDialogOpen(true)}
            className="relative flex shrink-0 items-center gap-1 cursor-pointer"
          >
            <span className="font-display text-[15px] font-black tracking-tight text-[#191116] whitespace-nowrap dark:text-white">
              {currentCityLabel}
            </span>
            <ChevronDown className="h-4 w-4 text-[#C9A86A] pointer-events-none" />
          </button>

          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A86A]" />
            <input
              type="text"
              value={searchInput}
              onFocus={() => {
                setIsMobileJobSearchExpanded(true);
                setIsJobSuggestOpen(true);
              }}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setIsJobSuggestOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters();
                  closeMobileJobSearch();
                }
              }}
              placeholder="Tên job..."
              className="h-9 w-full rounded-full border border-[#F1D8D4] bg-[#FFF7F6] pl-8.5 pr-8 text-xs font-semibold text-[#191116] outline-none focus:border-[#C72524]/60 placeholder:text-[#B8A2A0] dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:focus:border-[#C9A86A]/60 dark:placeholder:text-slate-500"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setIsJobSuggestOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.push("/talent/jobs/saved-jobs")}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F1D8D4] bg-[#FFF7F6] text-[#9B1215] transition hover:border-[#C72524]/45 hover:bg-[#FFF1EF] active:scale-95 dark:border-[#C9A86A]/45 dark:bg-[#C9A86A]/12 dark:text-[#C9A86A] dark:hover:border-[#C9A86A]/70 dark:hover:bg-[#C9A86A]/18 dark:hover:text-amber-200"
            aria-label="Việc làm đã lưu"
            title="Việc làm đã lưu"
          >
            <Bookmark className="h-4 w-4 fill-current" />
            {savedJobCount > 0 && (
              <span className="light-force-white absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-white bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-1 text-[9px] font-black text-white dark:border-[#070913] dark:from-amber-100 dark:via-amber-300 dark:to-yellow-500 dark:text-slate-950">
                {savedJobCount > 99 ? "99+" : savedJobCount}
              </span>
            )}
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          {/* Scrollable Quick Tabs with visual scroll indicator */}
          <div className="relative flex-1 min-w-0">
            <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-5">
              {MOBILE_JOB_QUICK_TABS.map((tab) => {
                const isMore = tab.value === "more";
                const isActive = isMore ? isMobileFiltersActive : mobileQuickTab === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      if (isMore) {
                        setIsMobileFiltersOpen(true);
                        return;
                      }
                      setMobileQuickTab(tab.value);
                      if (tab.value === "all") {
                        setSelectedStageFilter("all");
                        setSelectedCity(allValue);
                        setAppliedCity(allValue);
                      } else if (tab.value === "recruiting") {
                        setSelectedStageFilter("apply");
                      } else if (tab.value === "near_me") {
                        const myCity = readCurrentTalentLocation();
                        setSelectedCity(myCity);
                        setAppliedCity(myCity);
                      }
                    }}
                    className={cn(
                      "h-8 shrink-0 rounded-full border px-3.5 text-[11px] font-black transition active:scale-95 cursor-pointer",
                      isActive
                        ? "border-[#E8C8C2] bg-[#FFF3F1] text-[#9B1215] dark:border-[#C9A86A]/70 dark:bg-[#C9A86A]/15 dark:text-[#F9D66D]"
                        : "border-[#F1D8D4] bg-white text-[#9B1215] hover:border-[#C72524]/35 hover:text-[#C72524] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-[#C9A86A]/35 dark:hover:text-white"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Visual gradient mask + swipe arrow indicator */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-center justify-end pl-5 pr-0.5 bg-gradient-to-l from-white via-white/85 to-transparent dark:from-[#0f121d] dark:via-[#0f121d]/85">
              <ChevronRight className="h-3.5 w-3.5 text-[#C9A86A] animate-pulse" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#F1D8D4] bg-[#FFF7F6] text-[#9B1215] transition hover:border-[#C72524]/45 hover:bg-[#FFF1EF] active:scale-95 cursor-pointer dark:border-[#C9A86A]/45 dark:bg-[#C9A86A]/12 dark:text-[#C9A86A] dark:hover:border-[#C9A86A]/70 dark:hover:bg-[#C9A86A]/20 dark:hover:text-amber-200"
            title="Nhập mã QR Job ứng tuyển"
            aria-label="Nhập mã QR Job ứng tuyển"
          >
            <QrCode className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </section>

      {isMobileJobSearchExpanded && typeof window !== "undefined" && createPortal(
        <div
          style={{ backgroundColor: "#FFFCFA" }}
          className="fixed inset-0 z-[9999] !bg-[#FFFCFA] text-[#191116] dark:!bg-[#050711] dark:text-white animate-in fade-in duration-150 md:hidden overflow-y-auto min-h-screen min-h-dvh flex flex-col"
        >
          <button
            type="button"
            className="absolute inset-0 top-[68px] z-0 cursor-default"
            onClick={closeMobileJobSearch}
            aria-label="Thu nhỏ tìm kiếm"
          />
          <div
            style={{ backgroundColor: "#FFFFFF" }}
            className="relative z-10 flex items-center gap-3 border-b border-[#F0D7D3] !bg-white px-4 py-3 dark:border-white/5 dark:!bg-[#070913]"
          >
            <button
              type="button"
              onClick={closeMobileJobSearch}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] transition active:scale-95 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-300"
              aria-label="Đóng tìm kiếm"
            >
              <ArrowLeft className="h-4 w-4 text-[#8F0709] dark:text-amber-400" />
            </button>
            <div className="relative min-w-0 flex-1">
              <input
                ref={mobileJobSearchInputRef}
                type="text"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setIsJobSuggestOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    applyFilters();
                    closeMobileJobSearch();
                  }
                  if (event.key === "Escape") {
                    closeMobileJobSearch();
                  }
                }}
                placeholder="Tìm kiếm việc làm..."
                className="h-11 w-full rounded-full border border-[#F0D7D3] bg-white px-4 pr-10 text-base font-semibold text-[#191116] outline-none placeholder:text-[#574D54] focus:border-[#8F0709] dark:border-[#C9A86A]/40 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#C9A86A]"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                    setIsJobSuggestOpen(true);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#574D54] transition hover:text-[#191116] dark:text-slate-400 dark:hover:text-white"
                  aria-label="Xóa từ khóa"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {jobSearchSuggestions.length > 0 && (
            <div
              style={{ backgroundColor: "#FFFCFA" }}
              className="relative z-10 px-4 py-4 !bg-[#FFFCFA] dark:!bg-[#050711] flex-1 pb-32"
            >
              <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#8F0709] dark:text-[#C9A86A]">
                Gợi ý tìm kiếm
              </div>
              <div className="space-y-2">
                {jobSearchSuggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.label}-${suggestion.meta || "suggest"}`}
                    type="button"
                    style={{ backgroundColor: "#FFFFFF" }}
                    onClick={() => handleJobSuggestionPick(suggestion)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#F0D7D3] !bg-white px-4 py-3 text-left transition hover:border-[#8F0709] hover:!bg-[#FFF0EE] active:scale-[0.99] dark:border-white/8 dark:!bg-white/[0.03] dark:hover:border-amber-400/50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black text-[#191116] dark:text-white">{suggestion.label}</span>
                      {suggestion.meta && (
                        <span className="mt-0.5 block truncate text-xs font-semibold text-[#574D54] dark:text-slate-400">
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

      {/* Desktop Search Card */}
      <section className="hidden md:block relative z-40 overflow-visible rounded-3xl border border-[#E4C8C2] bg-white p-6 backdrop-blur-md dark:border-[#C9A86A]/30 dark:bg-[#0f121d]/90">
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#C72524] to-transparent pointer-events-none dark:via-[#C9A86A]" />

        <div className="relative z-10 mb-4 flex items-center justify-between gap-4">
          <h1 className="font-display text-lg font-black tracking-tight text-[#191116] md:text-xl dark:text-white">
            Tìm kiếm Job - {currentCityLabel}{" "}
            <span className="bg-gradient-to-r from-[#C72524] via-[#9B1215] to-[#D4AF37] bg-clip-text text-transparent dark:from-amber-200 dark:via-yellow-400 dark:to-amber-500">
              ({activeResultTotal || filteredCampaigns.length})
            </span>
          </h1>

          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="flex h-9 items-center gap-2 rounded-full border border-[#C9A86A]/45 bg-[#C9A86A]/12 px-3.5 text-xs font-bold text-[#C9A86A] transition hover:border-[#C9A86A]/70 hover:bg-[#C9A86A]/20 hover:text-amber-200 active:scale-95 cursor-pointer shrink-0"
            title="Ứng tuyển qua link"
            aria-label="Ứng tuyển qua link"
          >
            <QrCode className="h-4 w-4 stroke-[2.5]" />
            <span>Ứng tuyển qua link</span>
          </button>
        </div>

        <div className="relative z-10 flex flex-col items-stretch gap-2.5 xl:flex-row xl:items-center">
          <div className="group relative min-w-[200px] flex-1">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#C9A86A]/30 to-yellow-600/20 opacity-75 blur-sm transition-all duration-500 group-hover:opacity-100 group-focus-within:opacity-100 group-focus-within:blur-md" />
            <div className="relative h-full w-full">
              <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#C9A86A]" />
              <input
                value={searchInput}
                onFocus={() => setIsJobSuggestOpen(true)}
                onBlur={() => setIsJobSuggestOpen(false)}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setIsJobSuggestOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    applyFilters();
                    setIsJobSuggestOpen(false);
                  }
                }}
                placeholder="Tìm job theo tên, nhà tuyển dụng, loại công việc..."
                className="h-[50px] w-full rounded-2xl border border-[#F0D7D3] bg-[#FFFDFC] pl-12 pr-10 text-xs font-semibold text-[#191116] outline-none transition-all duration-300 focus:border-[#C72524]/60 placeholder:text-[#B8A2A0] dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:focus:border-[#C9A86A]/60 dark:placeholder:text-slate-500"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                    setIsJobSuggestOpen(false);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B8581] hover:text-[#C72524] transition-colors cursor-pointer dark:text-slate-450 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <KeywordSuggestionsDropdown
                open={isJobSuggestOpen}
                suggestions={jobSearchSuggestions}
                onPick={handleJobSuggestionPick}
              />
            </div>
          </div>

          <div className="w-full xl:w-[145px] shrink-0">
            <FilterDropdown
              value={selectedCity}
              onChange={setSelectedCity}
              options={cityDropdownOptions}
              searchPlaceholder="Nhập tỉnh/thành..."
              emptyText="Không tìm thấy địa điểm"
            />
          </div>

          <div className="w-full xl:w-[150px] shrink-0">
            <FilterDropdown
              value={selectedJobType}
              onChange={setSelectedJobType}
              options={jobTypeDropdownOptions}
              searchable={false}
            />
          </div>

          <div className="w-full xl:w-[180px] shrink-0">
            <FilterDropdown
              icon={<ArrowUpDown className="h-3.5 w-3.5 text-[#C9A86A] shrink-0" />}
              value={sortOrder}
              onChange={(val) => setSortOrder(val as SortOrder)}
              options={SORT_DROPDOWN_OPTIONS}
              searchable={false}
            />
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="light-force-white flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] px-5 text-xs font-black uppercase tracking-wider text-white transition-all duration-300 hover:brightness-110 active:scale-95 cursor-pointer shadow-lg xl:flex-none dark:from-amber-100 dark:via-[#C9A86A] dark:to-yellow-600 dark:text-slate-950"
            >
              <Search className="h-4 w-4" />
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((current: boolean) => !current)}
              className={cn(
                "flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-2xl border px-4 text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer xl:flex-none",
                showAdvancedFilters
                  ? "border-[#C72524] bg-[#FFF1EF] text-[#9B1215] dark:border-[#C9A86A] dark:bg-[#C9A86A]/20 dark:text-[#C9A86A]"
                  : "border-[#F0D7D3] bg-[#FFFDFC] text-[#9B1215] hover:bg-[#FFF1EF] hover:border-[#C72524]/40 hover:text-[#C72524] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:border-[#C9A86A]/40 dark:hover:text-white"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="relative z-10 mt-5 grid grid-cols-1 gap-4 border-t border-[#F4E1DE] pt-5 sm:grid-cols-2 dark:border-white/5">
            <div className="sm:col-span-2 rounded-2xl border border-[#F0D7D3] bg-[#FFFDFC] p-3 dark:border-white/8 dark:bg-slate-950/35">
              <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#C9A86A]">
                Đang nhiều công việc
              </div>
              <div className="flex flex-wrap gap-2">
                {hotJobLocations.map((location) => {
                  const isSelected = selectedCity === location.value || appliedCity === location.value;
                  return (
                    <button
                      key={location.label}
                      type="button"
                      onClick={() => {
                        setSelectedCity(location.value);
                        setAppliedCity(location.value);
                      }}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-bold transition active:scale-95",
                        isSelected
                          ? "border-[#C9A86A]/70 bg-[#C9A86A]/15 text-[#F4D77C]"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-[#C9A86A]/40 hover:text-white"
                      )}
                    >
                      <span>{location.label}</span>
                      <span className={cn("font-mono text-[10px]", isSelected ? "text-[#A36C1D] dark:text-amber-200" : "text-[#9A8581] dark:text-slate-500")}>
                        {location.count} việc
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="space-y-2">
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Thù lao tối thiểu
              </span>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={minBudget ? formatVNDNumber(minBudget) : ""}
                  onChange={(event) => setMinBudget(parseVNDNumber(event.target.value))}
                  placeholder="VD: 700.000"
                  className="h-10 w-full rounded-xl border border-[#F0D7D3] bg-[#FFFDFC] px-3 pr-24 text-xs font-semibold text-[#191116] outline-none placeholder:text-[#B8A2A0] focus:border-[#C72524]/60 dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-[#f5c518]/60"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                  VND / ngày
                </span>
              </div>
            </label>

            <label className="space-y-2">
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Thù lao tối đa
              </span>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={maxBudget ? formatVNDNumber(maxBudget) : ""}
                  onChange={(event) => setMaxBudget(parseVNDNumber(event.target.value))}
                  placeholder="VD: 1.000.000"
                  className="h-10 w-full rounded-xl border border-[#F0D7D3] bg-[#FFFDFC] px-3 pr-24 text-xs font-semibold text-[#191116] outline-none placeholder:text-[#B8A2A0] focus:border-[#C72524]/60 dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-[#f5c518]/60"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                  VND / ngày
                </span>
              </div>
            </label>
          </div>
        )}
      </section>

      {/* Filter Tabs - same amber style as brand campaigns page */}
      <div className="hidden md:flex items-center gap-2 pb-1.5 overflow-x-auto scrollbar-none">
        {stageFilterOptions.map((sf) => {
          const count = stageCounts[sf];
          const isNearMeActive = appliedCity !== allValue && appliedCity === readCurrentTalentLocation();
          const isStageActive = selectedStageFilter === sf && (!isNearMeActive || sf !== "all");

          return (
            <button
              key={sf}
              onClick={() => {
                setSelectedStageFilter(sf);
                if (sf === "all") {
                  setSelectedCity(allValue);
                  setAppliedCity(allValue);
                }
              }}
              className={cn(
                "rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border flex items-center gap-1.5 shrink-0",
                isStageActive
                  ? "bg-[#f4c430] border-amber-400/30 text-slate-950 shadow-[0_4px_12px_rgba(244,196,48,0.2)]"
                  : "border-[#F0D7D3] bg-white text-[#9B1215] hover:border-[#C72524]/35 hover:text-[#C72524] dark:bg-[#08090f] dark:border-[#151b2d] dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/2"
              )}
            >
              {stageFilterLabels[sf]}
              {count > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-black min-w-[18px] text-center",
                  isStageActive ? "bg-[#C72524]/12 dark:bg-black/20" : "bg-[#FFF1EF] text-[#9A8581] dark:bg-white/5 dark:text-slate-500"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {(() => {
          const isNearMeActive = appliedCity !== allValue && appliedCity === readCurrentTalentLocation();
          return (
            <button
              type="button"
              onClick={() => {
                if (isNearMeActive) {
                  setSelectedCity(allValue);
                  setAppliedCity(allValue);
                } else {
                  const myCity = readCurrentTalentLocation();
                  setSelectedCity(myCity);
                  setAppliedCity(myCity);
                }
              }}
              className={cn(
                "rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border flex items-center gap-1.5 shrink-0",
                isNearMeActive
                  ? "bg-[#f4c430] border-amber-400/30 text-slate-950 shadow-[0_4px_12px_rgba(244,196,48,0.2)]"
                  : "border-[#F0D7D3] bg-white text-[#9B1215] hover:border-[#C72524]/35 hover:text-[#C72524] dark:bg-[#08090f] dark:border-[#151b2d] dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/2"
              )}
            >
              Gần tôi
            </button>
          );
        })()}
      </div>

      {/* Row 2: Top Pagination centered in its own row */}
      {!isLoadingJobs && jobResultPageCount > 1 && (
        <div className="flex justify-center w-full py-1">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              type="button"
              disabled={jobResultPage <= 1 || isLoadingJobs}
              onClick={() => goToJobResultPage(jobResultPage - 1)}
              className="flex h-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-[11px] font-bold text-slate-300 transition hover:bg-white/10 hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trước
            </button>

            {jobPageNumbers.map((page) => (
              <button
                key={`top-${page}`}
                type="button"
                onClick={() => goToJobResultPage(page)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-black transition-all cursor-pointer",
                  page === jobResultPage
                    ? "bg-[#f5c518] text-slate-950 shadow-md shadow-[#f5c518]/20"
                    : "border border-white/10 bg-slate-950/80 text-slate-400 hover:border-[#f5c518]/40 hover:text-white"
                )}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={jobResultPage >= jobResultPageCount || isLoadingJobs}
              onClick={() => goToJobResultPage(jobResultPage + 1)}
              className="flex h-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-[11px] font-bold text-slate-300 transition hover:bg-white/10 hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Tiếp
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {filteredCampaigns.length === 0 ? (
          <div className="lg:col-span-4 sm:col-span-2 rounded-3xl border border-dashed border-white/10 bg-[#08090f]/60 px-6 py-16 text-center">
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-700" />
            <p className="text-sm font-black uppercase tracking-wider text-slate-300">
              Chưa có chiến dịch phù hợp
            </p>
            <p className="mx-auto mt-2 max-w-md text-xs font-medium leading-relaxed text-slate-500">
              Hiện chưa có chiến dịch tuyển dụng nào khớp với bộ lọc của bạn. Hãy quay lại sau hoặc thử đổi bộ lọc.
            </p>
          </div>
        ) : (
          visibleCampaigns.map((camp) => {
            const isApplied = appliedJobs.includes(camp.id) || hasTalentApplication(camp);
            const stage = getTalentJobStage(camp);
            const commonJobCardProps = {
              job: camp,
              isApplied,
              stage,
              isLoadingReferral: loadingReferral === camp.id,
              formatDate: displayCampaignDate,
              onView: handleViewJob,
              onApply: (job: any) => handleApply(job.id, job.title),
              onUpdateStage: (job: any, nextStage: "executing" | "completed") => handleUpdateStage(job.id, nextStage),
              onInvite: handleInviteClick,
              onInviteBlocked: () => addToast("Vui lòng ứng tuyển chiến dịch trước khi mời thành viên khác.", "info"),
            };

            return (
              <React.Fragment key={camp.id}>
                <div className="md:hidden">
                  <JobCardMobile {...commonJobCardProps} />
                </div>
                <div className="hidden md:block">
                  <JobCard {...commonJobCardProps} />
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Lazy Load Sentinel Indicator */}
      {hasMoreJobs && (
        <div ref={loadMoreRef} className="flex min-h-16 justify-center pt-3">
          <div className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#f5c518]/20 bg-[#f5c518]/5 px-6 text-xs font-black uppercase tracking-wider text-[#f5c518]">
            <span>{isLoadingMoreJobs ? "Đang tải thêm việc làm" : "Kéo xuống để tải thêm"}</span>
            <span className="flex items-center gap-1" aria-hidden="true">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#f5c518]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#f5c518] [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#f5c518] [animation-delay:240ms]" />
            </span>
          </div>
        </div>
      )}

      {!isLoadingJobs && jobResultPageCount > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-8 pb-4">
          <button
            type="button"
            disabled={jobResultPage <= 1 || isLoadingJobs}
            onClick={() => goToJobResultPage(jobResultPage - 1)}
            className="flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Trước
          </button>

          <div className="flex items-center gap-1.5 px-1">
            {jobPageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goToJobResultPage(page)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black transition-all cursor-pointer",
                  page === jobResultPage
                    ? "bg-[#f5c518] text-slate-950 shadow-md shadow-[#f5c518]/20"
                    : "border border-white/10 bg-slate-950/80 text-slate-400 hover:border-[#f5c518]/40 hover:text-white"
                )}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={jobResultPage >= jobResultPageCount || isLoadingJobs}
            onClick={() => goToJobResultPage(jobResultPage + 1)}
            className="flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Tiếp theo
          </button>
        </div>
      )}

      <JobFilterDialog
        open={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        cityOptions={cityDropdownOptions}
        jobTypeOptions={jobTypeDropdownOptions}
        stageFilterOptions={stageFilterOptions}
        stageFilterLabels={stageFilterLabels}
        stageCounts={stageCounts}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedJobType={selectedJobType}
        setSelectedJobType={setSelectedJobType}
        selectedStageFilter={selectedStageFilter}
        setSelectedStageFilter={setSelectedStageFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        minBudget={minBudget}
        setMinBudget={setMinBudget}
        maxBudget={maxBudget}
        setMaxBudget={setMaxBudget}
        onReset={() => {
          setSelectedCity(allValue);
          setSelectedJobType(allValue);
          setSelectedStageFilter("all");
          setSortOrder("deadline_asc");
          setShowAdvancedFilters(false);
          setMinBudget(0);
          setMaxBudget(0);
          setAppliedCity(allValue);
          setAppliedJobType(allValue);
          setAppliedShowAdvancedFilters(false);
          setAppliedMinBudget(0);
          setAppliedMaxBudget(0);
        }}
        onApply={() => {
          setShowAdvancedFilters(minBudget > 0 || maxBudget > 0);
          applyFilters();
          setIsMobileFiltersOpen(false);
        }}
      />
      <JobFilterCityDialog
        open={isMobileCityDialogOpen}
        options={cityDropdownOptions}
        selectedCity={appliedCity}
        onClose={() => setIsMobileCityDialogOpen(false)}
        onSelectCity={(city) => {
          setSelectedCity(city);
          setAppliedCity(city);
          setIsMobileCityDialogOpen(false);
        }}
        currentLocationValue="Hà Nội"
        currentLocationLabel="Hà Nội"
      />

      {/* INVITATION AFFILIATE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col bg-[#08090f] border border-[#D4A64A]/30 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] p-5 sm:p-6 space-y-6 animate-in zoom-in-95 duration-300 scrollbar-thin">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={() => setShowInviteModal(null)}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-xl border border-[#151b2d] bg-[#050711] text-slate-400 hover:text-white transition-all cursor-pointer hover:border-slate-800"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Grid for two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* Left Column: Affiliate Link & referred users */}
              <div className="space-y-6 text-left">
                {/* Modal Header */}
                <div className="relative pr-8 space-y-2">
                  <div className="space-y-1">
                    <h3 className="font-display font-black text-base sm:text-lg text-white uppercase leading-tight tracking-tight">
                      {showInviteModal.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                      THƯƠNG HIỆU: <span className="text-slate-300">{showInviteModal.brand}</span>
                    </p>
                  </div>

                  {getSplitBudgetLabel(showInviteModal.budget) && (
                    <div>
                      <span className="inline-flex rounded-full bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 text-[9px] font-black uppercase text-amber-300 tracking-wider">
                        Thù lao chia đều: {getSplitBudgetLabel(showInviteModal.budget)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Link & referrals generator */}
                {(() => {
                  const url = activeReferralLink[showInviteModal.id]?.url || "";
                  const referrals = showInviteModal.referrals || [];

                  return (
                    <>
                      {/* Affiliate Link Container */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          LINK AFFILIATE GIỚI THIỆU (JOB)
                        </p>
                        <div className="flex items-center gap-3 bg-[#03050c] border border-[#151b2d] rounded-xl p-2.5 min-w-0">
                          <span className="text-xs text-[#F0C56B] font-mono select-all truncate flex-1 pl-1 min-w-0">
                            {url || "Chưa tạo liên kết giới thiệu"}
                          </span>
                          <button
                            onClick={() => handleCopyLink(url)}
                            disabled={!url}
                            className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-gradient-gold text-slate-950 px-3 sm:px-4 text-xs font-black uppercase tracking-widest transition hover:brightness-110 active:scale-[0.98] cursor-pointer shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Copy className="h-3.5 w-3.5" /> Copy Link
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                          * Mẹo: Chia sẻ link này cho người phù hợp trong mạng lưới của bạn. Khi họ đăng ký và được duyệt, hệ thống sẽ ghi nhận bạn là người giới thiệu.
                        </p>
                      </div>

                      {/* List of referred users */}
                      <div className="space-y-3.5 border-t border-[#151b2d] pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Users className="h-4.5 w-4.5 text-amber-400 shrink-0" /> Người được bạn giới thiệu ({referrals.length})
                          </h4>
                        </div>

                        {referrals.length === 0 ? (
                          <div className="py-6 text-center text-slate-500 text-xs font-medium">
                            Bạn chưa mời ai tham gia job này. Hãy chia sẻ link trên để nhận 5% hoa hồng!
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                            {referrals.map((item: any, idx: number) => {
                              const name = item.profile?.display_name || item.profile?.user?.name || "Người được giới thiệu";
                              const avatar = item.profile?.user?.external_avatar_url || item.profile?.logo_url || "";
                              const status = item.status || "new";

                              let statusText = "CHỜ DUYỆT";
                              let statusColor = "text-amber-400 bg-amber-400/10 border-amber-400/20";
                              if (status === "accepted" || status === "executing") {
                                statusText = "ĐANG THAM GIA";
                                statusColor = "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
                              } else if (status === "completed" || status === "confirmed") {
                                statusText = "HOÀN THÀNH";
                                statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                              }

                              return (
                                <div
                                  key={item.id || idx}
                                  className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-white/5 animate-in fade-in duration-200"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-900 border border-[#D4A64A]/30 shrink-0">
                                      {avatar ? (
                                        <img src={avatar} alt={name} className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs font-black uppercase text-amber-300">
                                          {name.charAt(0)}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-xs font-black text-white truncate max-w-[120px] sm:max-w-none">{name}</span>
                                        <span className="rounded bg-cyan-500/10 border border-cyan-500/25 px-1.5 py-0.5 text-[8px] font-black uppercase text-cyan-300 whitespace-nowrap">
                                          Người được giới thiệu
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <span className={cn("rounded border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider self-start sm:self-auto shrink-0", statusColor)}>
                                    {statusText}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Right Column: QR Code Container */}
              <div className="flex flex-col justify-center">
                {(() => {
                  const url = activeReferralLink[showInviteModal.id]?.url || "";
                  const handleDownloadModalQR = async (canvasFromComponent?: HTMLCanvasElement | null) => {
                    try {
                      const qrCanvas = canvasFromComponent || (document.querySelector(".fi-qr-canvas canvas, canvas") as HTMLCanvasElement | null);
                      await downloadJobPoster({
                        title: showInviteModal.title,
                        startDate: showInviteModal.startDate,
                        endDate: showInviteModal.endDate,
                        applicationDeadline: showInviteModal.applicationDeadline || showInviteModal.deadline,
                        budgetMin: showInviteModal.budgetMin,
                        budgetMax: showInviteModal.budgetMax,
                        budget: showInviteModal.budget,
                        budgetUnit: showInviteModal.budgetUnit || showInviteModal.budget_unit,
                        referralLink: url,
                      }, qrCanvas);
                    } catch (err) {
                      console.warn("Failed to download styled QR poster:", err);
                      if (url) {
                        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`, "_blank");
                      }
                    }
                  };
                  return (
                    <QRCodeContainer
                      campaignLink={url}
                      title="Mã QR Tuyển Dụng"
                      subtitle="Quét mã để tham gia ngay"
                      badgeText="Affiliate QR Code"
                      shareButtonLabel="Chia sẻ"
                      onCopyLink={() => handleCopyLink(url)}
                      onDownloadQr={handleDownloadModalQR}
                      className="border-[#D4A64A]/20 bg-gradient-to-br from-[#1a1305]/40 via-[#070913]/80 to-[#070913]/90 shadow-[0_8px_30px_rgba(212,166,74,0.05)]"
                    />
                  );
                })()}
              </div>

            </div>

            {/* Bottom Footer Actions */}
            <div className="flex justify-end pt-4 border-t border-[#151b2d]">
              <button
                onClick={() => setShowInviteModal(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[#151b2d] bg-[#050711] text-xs font-bold text-slate-400 hover:text-white hover:bg-white/2 cursor-pointer transition-colors"
              >
                Đóng lại
              </button>
            </div>

          </div>
        </div>
      )}

      <GuestActionPrompt />

      {previewImageUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-3">
          <button
            type="button"
            onClick={() => setPreviewImageUrl(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={previewImageUrl} alt="Campaign preview" className="max-h-full max-w-full object-contain" />
        </div>
      )}

      {/* QR Campaign / Job Apply Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl border border-[#F0D7D3] bg-white p-6 text-[#191116] shadow-2xl space-y-4 dark:border-[#C9A86A]/40 dark:bg-[#070913] dark:text-white">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F0D7D3] pb-3 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF0EE] text-[#C72524] dark:bg-[#C9A86A]/20 dark:text-[#C9A86A]">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-black uppercase text-[#191116] dark:text-white">Ứng tuyển bằng Link / QR Code</h3>
                  <p className="text-[11px] text-[#7B6866] dark:text-slate-400">Nhập link hoặc tải ảnh QR từ thiết bị</p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetQrModal}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#F0D7D3] text-[#7B6866] hover:bg-[#FFF0EE] hover:text-[#191116] transition cursor-pointer dark:border-white/10 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 1. Input URL field (Move to top) */}
            <div className="space-y-1.5">
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-[#191116] dark:text-slate-300">Nhập link ứng tuyển:</span>
                <input
                  type="text"
                  value={qrInputValue}
                  onChange={(e) => setQrInputValue(e.target.value)}
                  placeholder="Dán link ví dụ: https://onstage.vn/..."
                  className="h-11 w-full rounded-2xl border border-[#F0D7D3] bg-[#FFFDFC] px-4 text-xs text-[#191116] outline-none focus:border-[#C72524] placeholder:text-[#A08E8C] font-mono dark:border-white/15 dark:bg-slate-950/80 dark:text-white dark:focus:border-[#C9A86A] dark:placeholder:text-slate-500"
                />
              </label>
            </div>

            {/* 2. Upload Area for QR Image */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#191116] dark:text-slate-300">Hoặc tải ảnh QR từ máy cá nhân:</span>

              <input
                ref={qrFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleQrImageFile(file);
                }}
              />

              {!qrImagePreview ? (
                <div
                  onClick={() => qrFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleQrImageFile(file);
                  }}
                  className="group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#F0D7D3] bg-[#FFFDFC] p-4 text-center transition hover:border-[#C72524] hover:bg-[#FFF0EE] cursor-pointer dark:border-[#C9A86A]/30 dark:bg-slate-950/60 dark:hover:border-[#C9A86A] dark:hover:bg-[#C9A86A]/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0EE] text-[#C72524] group-hover:scale-110 transition dark:bg-[#C9A86A]/15 dark:text-[#C9A86A]">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#191116] group-hover:text-[#C72524] transition dark:text-slate-200 dark:group-hover:text-[#F9D66D]">
                      Bấm để chọn ảnh mã QR từ thiết bị
                    </p>
                    <p className="text-[10px] text-[#7B6866] dark:text-slate-500">Hỗ trợ JPG, PNG, WEBP — Tự đọc link QR vào ô bên trên</p>
                  </div>
                </div>
              ) : (
                <div className="relative flex items-center gap-3 rounded-2xl border border-[#F0D7D3] bg-white p-3 dark:border-white/15 dark:bg-slate-950/80">
                  <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-[#F0D7D3] bg-black dark:border-[#C9A86A]/40">
                    <img src={qrImagePreview} alt="QR Code Preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {qrScanStatus === "scanning" && (
                      <p className="text-xs font-semibold text-[#C72524] animate-pulse flex items-center gap-1.5 dark:text-amber-300">
                        <Sparkles className="h-3.5 w-3.5 animate-spin" /> Đang quét nhận diện QR...
                      </p>
                    )}
                    {qrScanStatus === "success" && (
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 shrink-0" /> {qrScanMessage}
                      </p>
                    )}
                    {qrScanStatus === "error" && (
                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-start gap-1.5 leading-snug">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {qrScanMessage}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQrImagePreview(null);
                      setQrScanStatus("idle");
                      setQrScanMessage("");
                      if (qrFileInputRef.current) qrFileInputRef.current.value = "";
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#F0D7D3] text-[#7B6866] hover:text-[#191116] transition cursor-pointer dark:border-white/10 dark:text-slate-400 dark:hover:text-white"
                    title="Đổi ảnh khác"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={resetQrModal}
                className="flex-1 py-3 rounded-full border border-[#F0D7D3] bg-white text-xs font-bold text-[#574D54] transition hover:bg-[#FFF0EE] hover:text-[#191116] cursor-pointer whitespace-nowrap dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-white/5"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApplyByQrCode}
                className="light-force-white flex-1 px-4 py-3 rounded-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center whitespace-nowrap cursor-pointer dark:from-amber-100 dark:via-[#C9A86A] dark:to-yellow-600 dark:text-slate-950"
              >
                Ứng tuyển ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification System */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "glass-panel border-l-4 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 min-w-[280px] max-w-[400px]",
              toast.type === "success" ? "border-l-emerald-500" : "border-l-amber-500"
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            ) : (
              <Sparkles className="h-4.5 w-4.5 text-amber-400 shrink-0" />
            )}
            <p className="text-xs font-semibold text-white leading-snug">{toast.message}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense>
      <JobsPageContent />
    </Suspense>
  );
}
