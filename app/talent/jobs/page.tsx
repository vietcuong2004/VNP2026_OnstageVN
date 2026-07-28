"use client";

import React, { Suspense, useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  Sparkles, CheckCircle,
  X,
  ArrowUpRight, Copy, Users, Briefcase, Calendar,
  Search, SlidersHorizontal, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SPONSORSHIP_CATEGORIES } from "@/lib/brand-mvp-data";
import {
  applyTalentCampaign,
  getCampaignReferralLink,
  loadTalentCampaignsPage,
  mapCampaignToTalentJob,
  parseCampaignReferralUrl,
  resolveCampaignReferralLink,
  resolveCampaignReferralLinkBySlug,
  updateTalentCampaignApplicationStatus,
} from "@/lib/talent-api";
import { AUTH_USER_UPDATED_EVENT, getAuthToken, getStoredAuthUser } from "@/lib/api-client";
import { useRouter, useSearchParams } from "next/navigation";
import QRCodeContainer from "@/components/QR_Code";
import { useGuestActionPrompt } from "@/components/guest-action-prompt";
import JobCard from "../../../components/JobCard";

type StageFilter = "executing" | "recruiting" | "pending" | "completed" | "all";
type SortOrder = "newest" | "oldest";

const stageFilterLabels: Record<StageFilter, string> = {
  executing: "Đang tham gia",
  recruiting: "Đang tuyển dụng",
  pending: "Chờ duyệt",
  completed: "Đã hoàn thành",
  all: "Tất cả",
};

const JOBS_PER_PAGE = 20;
const JOB_PAGES_PER_RESULT_PAGE = 5;
const JOBS_PER_RESULT_PAGE = JOBS_PER_PAGE * JOB_PAGES_PER_RESULT_PAGE;
const JOBS_PAGE_STATE_KEY = "vnp_jobs_page_state";
const allValue = "all";

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

const jobTypeOptions = [
  "KOL Livestream",
  "Runway Model",
  "Event PG",
  "MC Event",
  "Fashion Shoot",
  "Tuyển KOL",
  "Sự kiện",
  "Chụp hình",
  "Livestream",
  "Ra mắt sản phẩm",
];

function normalizeCityName(value: string) {
  return value.replace(/^(TP\.|Tỉnh)\s*/i, "").trim();
}

const cityDropdownOptions = [
  { value: allValue, label: "Toàn quốc" },
  ...cityOptions.map((city) => ({ value: normalizeCityName(city), label: city })),
];

const jobTypeDropdownOptions = [
  { value: allValue, label: "Tất cả loại job" },
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

function normalizeFilterText(value: unknown) {
  return normalizeSearchText(String(value || ""));
}

function formatVNDNumber(value?: number | string | null): string {
  if (!value && value !== 0) return "";
  const num = typeof value === "number" ? value : Number(String(value).replace(/\D/g, ""));
  if (isNaN(num) || num === 0) return "";
  return num.toLocaleString("vi-VN");
}

function parseVNDNumber(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function formatVNDHint(num: number): string {
  if (!num || num <= 0) return "";
  return `${num.toLocaleString("vi-VN")} VND / ngày`;
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
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterDropdownOption[];
  searchPlaceholder?: string;
  emptyText?: string;
  searchable?: boolean;
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
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-left text-xs text-white outline-none transition-all hover:border-[#f5c518]/40 focus:border-[#f5c518]/60"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-white transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[100] mt-1 rounded-xl border border-white/10 bg-[#08090f] shadow-2xl">
          {searchable && (
            <div className="border-b border-white/10 p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#f5c518]" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-[#f5c518]/60"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-[320px] overflow-y-auto py-1">
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
                  "block w-full px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-[#f5c518]/15",
                  option.value === value ? "bg-[#f5c518]/25 text-white" : "text-slate-200"
                )}
              >
                {option.label}
              </button>
            ))}

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
  const router = useRouter();
  const currentTalent = readCurrentTalentIdentity();
  const currentTalentId = currentTalent.profileId || currentTalent.userId;
  const searchParams = useSearchParams();
  const { requireAuthAction, GuestActionPrompt } = useGuestActionPrompt();
  const campaignIdParam = searchParams.get("campaignId");
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
  const [appliedShowAdvancedFilters, setAppliedShowAdvancedFilters] = useState(() => initialJobsState?.appliedShowAdvancedFilters || false);
  const [minBudget, setMinBudget] = useState(() => initialJobsState?.minBudget || 0);
  const [appliedMinBudget, setAppliedMinBudget] = useState(() => initialJobsState?.appliedMinBudget || 0);
  const [maxBudget, setMaxBudget] = useState(() => initialJobsState?.maxBudget || 0);
  const [appliedMaxBudget, setAppliedMaxBudget] = useState(() => initialJobsState?.appliedMaxBudget || 0);
  const [selectedSponsorshipFilter, setSelectedSponsorshipFilter] = useState(() => initialJobsState?.selectedSponsorshipFilter || "all");
  const [selectedStageFilter, setSelectedStageFilter] = useState<StageFilter>(() => initialJobsState?.selectedStageFilter || "all");
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => initialJobsState?.sortOrder || "newest");
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" }[]>([]);
  const [displayJobs, setDisplayJobs] = useState<any[]>([]);
  const [pastedUrl, setPastedUrl] = useState("");
  const [activeReferralLink, setActiveReferralLink] = useState<{ [campId: string]: any }>({});
  const [loadingReferral, setLoadingReferral] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState<any>(null);
  const jobRequestRef = useRef(0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [jobBackendPage, setJobBackendPage] = useState(() => initialJobsState?.jobBackendPage || 1);
  const [jobTotal, setJobTotal] = useState(0);
  const [jobStageCounts, setJobStageCounts] = useState<Record<StageFilter, number>>({
    all: 0,
    executing: 0,
    recruiting: 0,
    pending: 0,
    completed: 0,
  });
  const [jobResultPage, setJobResultPage] = useState(() => initialJobsState?.jobResultPage || 1);
  const [jobResultPageCount, setJobResultPageCount] = useState(1);
  const [hasMoreJobs, setHasMoreJobs] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingMoreJobs, setIsLoadingMoreJobs] = useState(false);

  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(!!getAuthToken());
    syncAuth();
    window.addEventListener(AUTH_USER_UPDATED_EVENT, syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

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
    if (!requireAuthAction({ actionLabel: "Tạo link giới thiệu campaign" })) return;
    setLoadingReferral(camp.id);
    try {
      const res = await getCampaignReferralLink(camp.id);
      setActiveReferralLink(prev => ({ ...prev, [camp.id]: res }));
      setShowInviteModal(camp);
    } catch (err) {
      console.warn("Error getting referral link:", err);
      setActiveReferralLink(prev => ({ ...prev, [camp.id]: null }));
      setShowInviteModal(camp);
      addToast("Chưa tạo được link giới thiệu campaign. Vui lòng thử lại sau.", "info");
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

  const getSplitBudgetLabel = (budgetStr: string) => {
    const firstPart = budgetStr.split("-")[0]?.trim().toLowerCase() || "";
    const rawNumber = firstPart.match(/\d+([\.\,]\d+)?/)?.[0];
    if (!rawNumber) return "";

    const number = Number(rawNumber.replace(",", "."));
    if (!Number.isFinite(number) || number <= 0) return "";

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
      return `${formatted} triệu/ngày`;
    }

    if (splitVal >= 1_000) return `${Math.round(splitVal / 1_000).toLocaleString("vi-VN")}k/ngày`;

    if (splitVal > 0) return `${splitVal.toLocaleString("vi-VN")}đ/ngày`;
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
    if (!status) return "";
    if (status === "pending") return "new";
    if (status === "approved") return "accepted";
    return status;
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
    if (normalized === "accepted" || normalized === "executing") return "executing";
    if (normalized === "completed" || normalized === "confirmed") return "completed";
    if (normalized === "new") return "pending";
    return null;
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

  const jobQueryOptions = useMemo(() => ({
    q: searchQuery || undefined,
    type: appliedJobType !== allValue ? appliedJobType : undefined,
    city: appliedCity !== allValue ? appliedCity : undefined,
    minBudget: appliedShowAdvancedFilters && appliedMinBudget > 0 ? appliedMinBudget : undefined,
    maxBudget: appliedShowAdvancedFilters && appliedMaxBudget > 0 ? appliedMaxBudget : undefined,
    sortOrder,
    stage: selectedStageFilter !== allValue ? selectedStageFilter : undefined,
  }), [searchQuery, appliedJobType, appliedCity, appliedShowAdvancedFilters, appliedMinBudget, appliedMaxBudget, sortOrder, selectedStageFilter]);

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
        executing: response.meta.stage_counts?.executing ?? 0,
        recruiting: response.meta.stage_counts?.recruiting ?? response.meta.total,
        pending: response.meta.stage_counts?.pending ?? 0,
        completed: response.meta.stage_counts?.completed ?? 0,
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
    if (!requireAuthAction({ actionLabel: "Ứng tuyển campaign" })) return;
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
        addToast("Chưa gửi được ứng tuyển lên backend. Vui lòng thử lại.", "info");
        return;
      }
    }

    setAppliedJobs((prev) => [...prev, id]);
    setJobStageCounts((current) => ({
      ...current,
      recruiting: Math.max(0, current.recruiting - 1),
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
      const decrementKey = previousCountKey || "recruiting";
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

  const handleJoinCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedUrl) return;
    if (!requireAuthAction({ actionLabel: "Đăng ký campaign qua link giới thiệu" })) return;

    try {
      const parsedLink = parseCampaignReferralUrl(pastedUrl);
      let campaignId = parsedLink.mode === "legacy" ? parsedLink.campaignId : "";

      if (parsedLink.mode === "slug") {
        const resolved = await resolveCampaignReferralLinkBySlug(
          parsedLink.campaignSlug,
          parsedLink.referrerSlug,
        );
        const resolvedCampaignId = String(resolved?.campaign?.id || resolved?.campaign_id || "");
        const referralCode = String(resolved?.code || resolved?.referral_code || parsedLink.referralCode || "");

        if (!resolvedCampaignId || !referralCode) {
          addToast("Không đọc được link affiliate chiến dịch. Vui lòng kiểm tra lại.", "info");
          return;
        }

        await applyTalentCampaign(
          resolvedCampaignId,
          "Đăng ký tham gia qua link giới thiệu Affiliate.",
          referralCode,
        );

        await loadJobsPage(((jobResultPage - 1) * JOB_PAGES_PER_RESULT_PAGE) + 1, "replace", jobResultPage);

        setPastedUrl("");
        const referrerName = resolved?.referrer?.name || resolved?.owner?.name || parsedLink.referrerSlug.replace(/-/g, " ");
        addToast(`Đăng ký tham gia thành công qua giới thiệu của ${referrerName}!`, "success");
        return;
      }

      const refId = parsedLink.referralCode;

      if (refId) {
        try {
          const resolved = await resolveCampaignReferralLink(refId);
          const resolvedCampaignId = resolved?.campaign?.id || resolved?.campaign_id || campaignId;

          if (resolvedCampaignId) {
            await applyTalentCampaign(resolvedCampaignId, "Đăng ký tham gia qua link giới thiệu Affiliate.", refId);

            await loadJobsPage(((jobResultPage - 1) * JOB_PAGES_PER_RESULT_PAGE) + 1, "replace", jobResultPage);

            setPastedUrl("");
            const referrerName = resolved?.referrer?.name || resolved?.owner?.name || "KOL đối tác";
            addToast(`Đăng ký tham gia thành công qua giới thiệu của ${referrerName}!`, "success");
            return;
          }
        } catch (error) {
          console.warn("Cannot apply campaign referral via backend", error);
          if (/^\d+$/.test(String(campaignId))) {
            addToast(error instanceof Error ? error.message : "Không thể đăng ký campaign qua link backend.", "info");
            return;
          }
        }
      }

      const allCampaigns = displayJobs;
      const targetCamp = allCampaigns.find(c => c.id === campaignId);
      if (!targetCamp) {
        addToast("Không tìm thấy chiến dịch trong dữ liệu hệ thống.", "info");
        return;
      }

      if (hasTalentApplication(targetCamp)) {
        addToast("Bạn đã ứng tuyển hoặc đang tham gia chiến dịch này rồi.", "info");
        return;
      }

      if (!currentTalentId) {
        addToast("Không xác định được tài khoản Talent hiện tại. Vui lòng đăng nhập lại.", "info");
        return;
      }

      const updatedCampaigns = allCampaigns.map(c => {
        const matchesCurrentId = c.id === campaignId;

        if (matchesCurrentId) {
          if (!currentTalentId) return c;
          const apps = c.applicants || [];
          return {
            ...c,
            hasApplied: true,
            application: { ...(c.application || {}), status: "approved" },
            applicants: [
              ...apps,
              {
                talentId: currentTalentId,
                stage: "approved" as const,
                note: "Đăng ký tham gia qua link giới thiệu Affiliate của đối tác.",
                referredByTalentId: refId || undefined
              }
            ]
          };
        }
        return c;
      });
      setDisplayJobs(updatedCampaigns);
      setAppliedJobs((prev) => [...prev, campaignId]);
      setPastedUrl("");

      const referrerName = "KOL đối tác";
      addToast(`Đăng ký tham gia thành công qua giới thiệu của ${referrerName}!`, "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Đường dẫn không hợp lệ. Vui lòng kiểm tra lại.", "info");
    }
  };

  const filteredCampaigns = displayJobs.filter((camp) => {
    const selectedCityText = normalizeFilterText(appliedCity);
    const selectedTypeText = normalizeFilterText(appliedJobType);

    const matchesCity = appliedCity === allValue
      || normalizeFilterText(camp.city).includes(selectedCityText);

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

    return matchesCity && matchesType && matchesMinBudget && matchesMaxBudget && matchesSponsorship;
  });

  const visibleCampaigns = [...filteredCampaigns].sort((a, b) => {
    const aTime = jobPublishTimestamp(a);
    const bTime = jobPublishTimestamp(b);
    return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
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

  const stageFilterOptions: StageFilter[] = ["all", "executing", "recruiting", "pending", "completed"];
  const stageCounts = jobStageCounts;
  const activeResultTotal = stageCounts[selectedStageFilter] ?? jobTotal;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Title block */}
      <div>
        <h1 className="font-display text-3xl font-black text-white tracking-tight uppercase leading-none">Chợ việc làm</h1>
        <p className="text-xs text-slate-400 mt-2 font-medium">Khám phá và ứng tuyển các job sắc đẹp phù hợp nhất với bản thân.</p>
      </div>

      {isLoggedIn && (
        <div className="rounded-3xl border border-amber-500/15 bg-gradient-to-br from-[#0c0f1d] to-[#07080e] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-4 relative z-10 w-full text-left">
            <div className="space-y-1">
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                Tham gia qua link giới thiệu
              </h2>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-2xl">
                Dán đường dẫn giới thiệu nhận từ đối tác để tham gia trực tiếp chiến dịch và ghi nhận người giới thiệu.
              </p>
            </div>

            <form onSubmit={handleJoinCampaign} className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  value={pastedUrl}
                  onChange={(e) => setPastedUrl(e.target.value)}
                  placeholder="Dán link chiến dịch tại đây..."
                  className="w-full bg-slate-950/80 border border-amber-500/35 hover:border-amber-500/60 focus:border-amber-400 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none pr-10 min-w-0 transition-all"
                />
                {pastedUrl && (
                  <button
                    type="button"
                    onClick={() => setPastedUrl("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[10px] uppercase font-bold"
                  >
                    Xóa
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={!pastedUrl.trim()}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 px-6 text-xs font-black uppercase tracking-wider transition-all hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] cursor-pointer whitespace-nowrap"
              >
                Tham gia ngay <ArrowUpRight className="h-4 w-4 text-slate-950" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="group relative flex-1">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500/30 via-[#f5c518]/40 to-yellow-600/30 opacity-75 blur-sm transition-all duration-500 group-hover:opacity-100 group-focus-within:opacity-100 group-focus-within:blur-md" />
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#f5c518] transition-colors group-focus-within:text-amber-300" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyFilters();
              }}
              placeholder="Tìm kiếm job theo tên, brand, loại chiến dịch, địa điểm..."
              className="w-full rounded-2xl border border-amber-500/10 bg-[#0a0c12]/90 py-4 pl-12 pr-10 text-xs text-white outline-none transition-all duration-300 focus:border-[#f5c518]/60 placeholder:text-slate-500 shadow-2xl"
            />
            {searchInput && (
              <button
                type="button"
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
          onClick={applyFilters}
          className="flex h-[50px] items-center justify-center rounded-2xl bg-gradient-to-r from-amber-100 via-[#f5c518] to-yellow-600 px-8 text-xs font-black uppercase tracking-wider text-slate-950 transition-all duration-300 active:scale-95 cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(245,197,24,0.3)] shrink-0"
        >
          Tìm kiếm
        </button>
      </div>

      <div className="relative z-40 space-y-4 overflow-visible rounded-2xl border border-[#f5c518]/25 bg-[#0f121d]/90 p-5 shadow-[0_0_30px_rgba(245,197,24,0.06)] backdrop-blur-md">
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#f5c518] to-transparent" />
        <div className="relative z-10 flex flex-wrap items-end gap-3.5">
          <div className="min-w-[180px] flex-1">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Địa điểm
            </span>
            <FilterDropdown
              value={selectedCity}
              onChange={setSelectedCity}
              options={cityDropdownOptions}
              searchPlaceholder="Nhập tỉnh/thành..."
              emptyText="Không tìm thấy địa điểm"
            />
          </div>

          <div className="min-w-[180px] flex-1">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Loại job
            </span>
            <FilterDropdown
              value={selectedJobType}
              onChange={setSelectedJobType}
              options={jobTypeDropdownOptions}
              searchable={false}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((current: boolean) => !current)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-colors",
                showAdvancedFilters
                  ? "border-[#f5c518]/50 bg-[#f5c518]/15 text-[#f5c518]"
                  : "border-white/10 bg-slate-950/70 text-slate-300 hover:border-white/20 hover:text-white"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Lọc nâng cao</span>
              {showAdvancedFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            <button
              type="button"
              onClick={applyFilters}
              className="flex h-10 items-center rounded-xl border border-[#f5c518]/40 bg-[#f5c518] px-4 text-xs font-black uppercase tracking-wider text-slate-950 transition-colors hover:bg-amber-300"
            >
              Áp dụng
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="relative z-10 grid grid-cols-1 gap-4 border-t border-white/5 pt-4 sm:grid-cols-2">
            <label className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Thù lao tối thiểu
                </span>
                {minBudget > 0 && (
                  <span className="text-[11px] font-mono font-bold text-amber-400">
                    {formatVNDHint(minBudget)}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={minBudget ? formatVNDNumber(minBudget) : ""}
                  onChange={(event) => setMinBudget(parseVNDNumber(event.target.value))}
                  placeholder="VD: 700.000"
                  className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-[#f5c518]/60 pr-24"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                  VND / ngày
                </span>
              </div>
            </label>

            <label className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Thù lao tối đa
                </span>
                {maxBudget > 0 && (
                  <span className="text-[11px] font-mono font-bold text-amber-400">
                    {formatVNDHint(maxBudget)}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={maxBudget ? formatVNDNumber(maxBudget) : ""}
                  onChange={(event) => setMaxBudget(parseVNDNumber(event.target.value))}
                  placeholder="VD: 1.000.000"
                  className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-[#f5c518]/60 pr-24"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                  VND / ngày
                </span>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Filter Tabs - same amber style as brand campaigns page */}
      <div className="flex items-center gap-2 pb-1.5 overflow-x-auto scrollbar-none">
        {stageFilterOptions.map((sf) => {
          const count = stageCounts[sf];
          return (
            <button
              key={sf}
              onClick={() => setSelectedStageFilter(sf)}
              className={cn(
                "rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border flex items-center gap-1.5 shrink-0",
                selectedStageFilter === sf
                  ? "bg-[#f4c430] border-amber-400/30 text-slate-950 shadow-[0_4px_12px_rgba(244,196,48,0.2)]"
                  : "bg-[#08090f] border-[#151b2d] text-slate-400 hover:text-white hover:bg-white/2"
              )}
            >
              {stageFilterLabels[sf]}
              {count > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-black min-w-[18px] text-center",
                  selectedStageFilter === sf ? "bg-black/20" : "bg-white/5 text-slate-500"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Row 1: Result count on left, Sort button on right */}
      <div className="flex flex-row items-center justify-between gap-3 border-b border-[#151b2d] pb-3">
        <span className="flex items-center gap-2 text-xs font-semibold text-slate-400 shrink-0">
          <Briefcase className="h-4 w-4 text-[#f5c518]" />
          Tìm thấy <b className="text-white">{activeResultTotal || filteredCampaigns.length}</b> job phù hợp
        </span>

        <button
          type="button"
          onClick={() => setSortOrder((current) => current === "newest" ? "oldest" : "newest")}
          className="flex items-center gap-2 rounded-xl border border-[#151b2d] bg-[#08090f] px-3.5 py-2 text-xs font-bold text-slate-300 transition-all hover:border-[#f5c518]/40 hover:text-white cursor-pointer shrink-0"
        >
          <Calendar className="h-4 w-4 text-[#f5c518]" />
          <span>Ngày đăng: {sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}</span>
        </button>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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
        ) : visibleCampaigns.map((camp) => {
          const isApplied = appliedJobs.includes(camp.id) || hasTalentApplication(camp);
          const stage = getTalentJobStage(camp);

          return (
            <JobCard
              key={camp.id}
              job={camp}
              isApplied={isApplied}
              stage={stage}
              isLoadingReferral={loadingReferral === camp.id}
              formatDate={displayCampaignDate}
              onView={handleViewJob}
              onApply={(job) => handleApply(job.id, job.title)}
              onUpdateStage={(job, nextStage) => handleUpdateStage(job.id, nextStage)}
              onInvite={handleInviteClick}
              onInviteBlocked={() => addToast("Vui lòng ứng tuyển chiến dịch trước khi mời thành viên khác.", "info")}
            />
          );
        })}
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
                          LINK AFFILIATE GIỚI THIỆU (CAMPAIGN)
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
                            Bạn chưa mời ai tham gia chiến dịch này. Hãy chia sẻ link trên để nhận 5% hoa hồng!
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
                  return (
                    <QRCodeContainer
                      campaignLink={url}
                      title="Mã QR Tuyển Dụng"
                      subtitle="Quét mã để tham gia ngay"
                      badgeText="Affiliate QR Code"
                      shareButtonLabel="Chia sẻ"
                      onCopyLink={() => handleCopyLink(url)}
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
