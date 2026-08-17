"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, ShieldAlert, Award, Sparkles, ArrowRight, ArrowLeft,
  CheckCircle2, Info, Star, ChevronRight, Trophy, Heart,
  Globe, Shield, Upload, FileText, Video, Check, Crown, Loader2, X, ChevronDown, Plus, Trash2, Lock, AlertTriangle,
  Image as ImageIcon, Camera, Link as LinkIcon, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { safeSetLocalStorage } from "@/lib/storage-utils";
import RadarChart from "@/components/ui/RadarChart";
import { SURVEY_QUESTIONS } from "./SurveyQuestion";
import Step3Dialog from "./Step3Dialog";
import {
  completeStep3GuestProfile,
  dataUrlToFile,
  fileToDataUrl,
  splitSkillValues,
} from "./Step3ProfileSave";
import {
  analyzeTalentSurvey,
  loadTalentProfile,
  loadTalentSurveyProgress,
  persistTalentProfile,
  saveTalentProfileOrThrow,
  saveTalentSurveyProgress,
  submitTalentSurvey,
  createTalentVideoLink,
  uploadTalentPhoto,
  uploadTalentVideo,
  type TalentSurveyAnalysis,
  type TalentSurveyHistoryEntry,
} from "@/lib/talent-api";
import { getAuthToken } from "@/lib/api-client";
import { SPECIALTY_PRESET_GROUPS, SOCIAL_HIGHLIGHT_PRESET_GROUPS, flattenTalentPresetOptions } from "@/lib/talent-profile-presets";
import {
  TALENT_TYPE_VALUES,
  normalizeTalentTypeLabel,
  normalizeTalentTypeList,
} from "@/components/ui/ComboboxOptionValues";
import { CityOption, useCityOptions } from "@/hooks/use-location-options";

// Custom SVG Icons to avoid import errors from old lucide version
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

function clampSurveyStep(value: unknown) {
  const step = Number(value);
  if (!Number.isFinite(step)) return 1;
  return Math.min(SURVEY_STEP_COUNT, Math.max(1, Math.trunc(step)));
}

const ORIENTATION_SURVEY_ENABLED = false;
const MEDIA_SURVEY_STEP = 4;
const AI_SURVEY_STEP = 5;
const SURVEY_STEP_COUNT = ORIENTATION_SURVEY_ENABLED ? 5 : 4;
const SURVEY_STEPS = ORIENTATION_SURVEY_ENABLED ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];

const talentTypeOptions = TALENT_TYPE_VALUES;
const GUEST_SURVEY_SYNC_KEY = "vnp_guest_survey_sync";

function portfolioHref(link: string): string {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(url);
}

function makeSurveyMediaId(file: File) {
  const randomPart = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : String(Math.random()).slice(2);

  return `${file.name}-${file.lastModified}-${randomPart}`;
}

function listFromProfileValue(...values: unknown[]) {
  for (const value of values) {
    const list = Array.isArray(value)
      ? value.map((item) => String(item).trim()).filter(Boolean)
      : value && typeof value === "object"
        ? Object.values(value).map((item) => String(item).trim()).filter(Boolean)
        : String(value || "")
          .split(/[\n,;]+/)
          .map((item) => item.trim())
          .filter(Boolean);

    if (list.length) return list;
  }

  return [];
}

function firstProfileText(...values: unknown[]) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }

  return "";
}

function normalizeComboboxLookup(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(tp|tinh|thanh pho|province)\b\.?/gi, "")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();
}

function resolveCityValue(value: unknown, cityOptions: CityOption[]) {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  const exactMatch = cityOptions.find((option) => option.value === rawValue || option.label === rawValue);
  if (exactMatch) return exactMatch.value;

  const normalizedValue = normalizeComboboxLookup(rawValue);
  const softMatch = cityOptions.find((option) => normalizeComboboxLookup(option.value) === normalizedValue);
  if (softMatch) return softMatch.value;

  const includedMatch = cityOptions.find((option) => {
    const normalizedOption = normalizeComboboxLookup(option.value);
    return normalizedOption.includes(normalizedValue) || normalizedValue.includes(normalizedOption);
  });

  return includedMatch?.value || rawValue;
}

function resolveSurveyGender(value: unknown) {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  const normalizedValue = rawValue
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalizedValue === "female" || normalizedValue === "nu") return "Nữ";
  if (normalizedValue === "male" || normalizedValue === "nam") return "Nam";
  return "Khác";
}

function hasSurveyAnswerValue(value: unknown) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function compactSurveyAnswers(answers: { question_code: string; answer_value: unknown }[]) {
  return answers.filter((answer) => hasSurveyAnswerValue(answer.answer_value));
}

function scrollSurveyToTop() {
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => {
    const scrollRoot = document.querySelector<HTMLElement>("[data-app-scroll-root]");
    scrollRoot?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function persistGuestSurveySyncDraft(payload: {
  profile: Record<string, unknown>;
  sectionAAnswers: { question_code: string; answer_value: unknown }[];
  sectionSAnswers: { question_code: string; answer_value: unknown }[];
}) {
  safeSetLocalStorage(GUEST_SURVEY_SYNC_KEY, payload);
}

type GuestSurveySyncPayload = {
  profile: Record<string, unknown>;
  sectionAAnswers: { question_code: string; answer_value: unknown }[];
  sectionSAnswers: { question_code: string; answer_value: unknown }[];
};

type SurveyImageKey = "cover" | "fullBody";
type SurveyPortfolioPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
};
type SurveyPortfolioVideo = {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
};
type SurveyPortfolioVideoLink = {
  id: string;
  url: string;
  title: string;
};

type SurveyImageUploadBlockProps = {
  label: string;
  placeholder: string;
  previewUrl: string | null;
  aspectClassName: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
};

function SurveyImageUploadBlock({
  label,
  placeholder,
  previewUrl,
  aspectClassName,
  onChange,
  onRemove,
}: SurveyImageUploadBlockProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="block text-[11px] text-[#f4c430] font-black uppercase tracking-wider">
          {label}
        </span>
        {previewUrl && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 transition-colors hover:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" /> Xóa
          </button>
        )}
      </div>
      <div className={cn(
        "relative rounded-xl overflow-hidden bg-slate-950/70 border border-dashed border-white/10 hover:border-amber-400/70 transition-colors",
        aspectClassName
      )}>
        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-slate-500 hover:text-amber-400 transition-colors">
          {previewUrl ? (
            <>
              <img src={previewUrl} alt={`Xem trước ${label.toLowerCase()}`} className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute bottom-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[#F0C56B] text-slate-950 shadow-lg">
                <Camera className="h-3.5 w-3.5" />
              </span>
            </>
          ) : (
            <>
              <Upload className="h-7 w-7" />
              <span className="text-[10px] font-black uppercase tracking-wider">{placeholder}</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
          />
        </label>
      </div>
    </div>
  );
}

type SurveyCityComboboxProps = {
  value: string;
  options: CityOption[];
  onChange: (value: string) => void;
};

function SurveyCityCombobox({ value, options, onChange }: SurveyCityComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value || option.label === value);
  const filteredOptions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((option) => option.label.toLowerCase().includes(keyword));
  }, [options, search]);

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
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-white/20 bg-slate-900/60 px-3.5 py-3 text-xs font-medium text-white outline-none transition-all hover:border-white/40 focus:border-amber-400 focus:bg-[#0e122b]",
          isOpen && "border-amber-400 bg-[#0e122b]"
        )}
      >
        <span className={cn("truncate text-left", selectedOption ? "text-white" : "text-slate-400")}>
          {selectedOption?.label || "Chọn khu vực sinh sống"}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", isOpen && "rotate-180 text-amber-400")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 max-h-64 w-full overflow-hidden rounded-xl border border-[#2B313D] bg-[#12151C] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="mb-1.5 px-1">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên tỉnh thành..."
              className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-2.5 py-1.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60"
              autoFocus
            />
          </div>

          <div className="max-h-48 space-y-0.5 overflow-y-auto pr-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-center text-xs text-slate-500">Không tìm thấy tỉnh thành</div>
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
                        ? "bg-amber-400/20 text-amber-300 font-bold"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-amber-300" />}
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

type SurveyOptionComboboxProps = {
  value?: string;
  options: readonly string[];
  placeholder: string;
  onChange: (value: string) => void;
};

function SurveyOptionCombobox({ value = "", options, placeholder, onChange }: SurveyOptionComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((option) => option === value);

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
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-white/20 bg-slate-900/60 px-3.5 py-3 text-xs font-medium text-white outline-none transition-all hover:border-white/40 focus:border-amber-400 focus:bg-[#0e122b]",
          isOpen && "border-amber-400 bg-[#0e122b]"
        )}
      >
        <span className={cn("truncate text-left", selectedLabel ? "text-white" : "text-slate-400")}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", isOpen && "rotate-180 text-amber-400")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 max-h-64 w-full overflow-hidden rounded-xl border border-[#2B313D] bg-[#12151C] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-56 space-y-0.5 overflow-y-auto pr-0.5 custom-scrollbar">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-center text-xs text-slate-500">Đã chọn tất cả loại hình</div>
            ) : (
              options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <span className="truncate">{option}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const JOBS_LIST = [
  { id: 1, title: "Đại sứ thương hiệu", desc: "Gương mặt đại diện thương hiệu luxury", weights: { pageant: 0.4, runway: 0.2, kol: 0.4 } },
  { id: 2, title: "KOLs/Influencer quảng cáo", desc: "Sáng tạo nội dung video ngắn", weights: { pageant: 0.1, runway: 0.1, kol: 0.8 } },
  { id: 3, title: "KOC Livestream bán hàng", desc: "Thực hiện livestream bán hàng trực tiếp", weights: { pageant: 0.05, runway: 0.05, kol: 0.9 } },
  { id: 4, title: "Gương mặt trang bìa", desc: "Chụp ảnh bìa tạp chí, lookbook, ảnh PR", weights: { pageant: 0.3, runway: 0.5, kol: 0.2 } },
  { id: 5, title: "Người mẫu sàn diễn (Runway)", desc: "Trình diễn các bộ sưu tập thời trang cao cấp", weights: { pageant: 0.1, runway: 0.8, kol: 0.1 } },
  { id: 6, title: "Người mẫu quảng cáo", desc: "Diễn xuất trong các TVC quảng cáo", weights: { pageant: 0.2, runway: 0.3, kol: 0.5 } },
  { id: 7, title: "Diễn viên MV ca nhạc", desc: "Đóng vai nữ chính/nam chính MV ca nhạc", weights: { pageant: 0.2, runway: 0.2, kol: 0.6 } },
  { id: 8, title: "KOL sự kiện / Khách mời VIP", desc: "Tham dự thảm đỏ và sự kiện thương hiệu", weights: { pageant: 0.6, runway: 0.2, kol: 0.2 } },
  { id: 9, title: "Người dẫn chương trình (MC)", desc: "Dẫn dắt các sự kiện và chương trình giải trí", weights: { pageant: 0.7, runway: 0.1, kol: 0.2 } },
  { id: 10, title: "VIP Promotion Girl (PG)", desc: "Lễ tân đón tiếp khách tại sự kiện lớn", weights: { pageant: 0.4, runway: 0.3, kol: 0.3 } },
  { id: 11, title: "Huấn luyện viên Catwalk", desc: "Đào tạo kỹ thuật đi catwalk cho học viên", weights: { pageant: 0.1, runway: 0.8, kol: 0.1 } },
  { id: 12, title: "CEO thương hiệu riêng", desc: "Kinh doanh nhãn hàng thời trang, mỹ phẩm", weights: { pageant: 0.5, runway: 0.2, kol: 0.3 } },
  { id: 13, title: "Giám khảo cuộc thi sắc đẹp", desc: "Chấm điểm các cuộc thi hoa hậu, hoa khôi", weights: { pageant: 0.7, runway: 0.2, kol: 0.1 } },
  { id: 14, title: "Giám đốc hình ảnh / Stylist", desc: "Cố vấn định hình phong cách và trang phục", weights: { pageant: 0.1, runway: 0.6, kol: 0.3 } },
  { id: 15, title: "Sứ giả chiến dịch cộng đồng", desc: "Lan tỏa các giá trị nhân văn và dự án từ thiện", weights: { pageant: 0.8, runway: 0.1, kol: 0.1 } },
  { id: 16, title: "Vlogger du lịch & trải nghiệm", desc: "Quảng bá điểm đến, khách sạn, resort cao cấp", weights: { pageant: 0.2, runway: 0.1, kol: 0.7 } },
  { id: 17, title: "Người mẫu ảnh nghệ thuật", desc: "Hợp tác chụp ảnh thời trang Fine-art", weights: { pageant: 0.2, runway: 0.6, kol: 0.2 } },
  { id: 18, title: "Nhà sáng tạo nội dung tri thức", desc: "Chia sẻ kỹ năng mềm, kiến thức làm đẹp", weights: { pageant: 0.4, runway: 0.1, kol: 0.5 } },
  { id: 19, title: "Đại sứ Game / Esports", desc: "Hình ảnh đại diện cho các dự án game lớn", weights: { pageant: 0.1, runway: 0.1, kol: 0.8 } },
  { id: 20, title: "Người mẫu ảo / Metaverse", desc: "Scan 3D hình ảnh số để làm mẫu ảo", weights: { pageant: 0.1, runway: 0.6, kol: 0.3 } }
];

interface SurveyFormProps {
  initialHistoryEntry?: TalentSurveyHistoryEntry | null;
  onBackToDashboard?: () => void;
}

export default function SurveyForm({ initialHistoryEntry, onBackToDashboard }: SurveyFormProps = {}) {
  const router = useRouter();
  const cityOptions = useCityOptions();
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const portfolioInputRef = useRef<HTMLInputElement | null>(null);
  const introVideoInputRef = useRef<HTMLInputElement | null>(null);
  const avatarPreviewUrlRef = useRef<string | null>(null);
  const portfolioPreviewUrlRef = useRef<string | null>(null);
  const introVideoPreviewUrlRef = useRef<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Track max step reached to allow click-to-navigation on header stepper
  React.useEffect(() => {
    setMaxStep((prev) => Math.max(prev, step));
  }, [step]);

  React.useEffect(() => {
    let active = true;
    setIsAuthenticated(!!getAuthToken());
    loadTalentProfile().then((profile) => {
      if (active && profile) {
        const location = resolveCityValue(profile.location || profile.city, cityOptions);
        const talentTypes = normalizeTalentTypeList(profile.talentTypes || profile.talent_types || []);
        const skills = listFromProfileValue(profile.skills, profile.specialSkills);
        const nextSocialHighlights = listFromProfileValue(profile.socialHighlights, profile.social_highlights);
        const nextPortfolioLinks = listFromProfileValue(profile.portfolioLinks, profile.portfolio_links, profile.portfolio_url);
        const nextSocialAccounts = Array.isArray(profile.socialAccounts)
          ? profile.socialAccounts
          : Array.isArray(profile.social_accounts)
            ? profile.social_accounts
            : [];
        const experienceYears = firstProfileText(profile.experience, profile.experience_years);
        const experienceText = firstProfileText(profile.experienceText, profile.profile_experience);

        setFormData((prev) => ({
          ...prev,
          name: profile.name || prev.name,
          email: profile.email || prev.email,
          phone: profile.phone || prev.phone,
          gender: resolveSurveyGender(profile.gender) || prev.gender,
          location: location || prev.location,
          height: profile.height ? String(profile.height) : prev.height,
          weight: profile.weight ? String(profile.weight) : prev.weight,
          bust: profile.bust ? String(profile.bust) : prev.bust,
          waist: profile.waist ? String(profile.waist) : prev.waist,
          hips: profile.hips ? String(profile.hips) : prev.hips,
          price: profile.price || prev.price,
          talentTypes: talentTypes.length ? talentTypes : prev.talentTypes,
          skills: skills.length ? skills.join(", ") : prev.skills,
          experience: experienceYears || prev.experience,
          professionalExperience: experienceText || prev.professionalExperience,
        }));

        setSocialHighlights(nextSocialHighlights);
        setPortfolioLinks(nextPortfolioLinks);
        setSocialAccounts(
          nextSocialAccounts
            .map((account: any) => ({
              platform: String(account.platform || ""),
              url: String(account.url || ""),
            }))
            .filter((account: { platform: string; url: string }) => account.platform && account.url)
        );

        if (profile.avatar) {
          setAvatarPreviewUrl(profile.avatar);
          setMediaUploads((prev) => ({ ...prev, avatar: "current-avatar" }));
        }

        if (profile.cover) {
          setCoverPreviewUrl(profile.cover);
          setMediaUploads((prev) => ({ ...prev, cover: "current-cover" }));
        }

        if (profile.fullBody) {
          setFullBodyPreviewUrl(profile.fullBody);
          setMediaUploads((prev) => ({ ...prev, fullBody: "current-full-body" }));
        }
      }
    });
    return () => {
      active = false;
    };
  }, [cityOptions]);

  // Outer Step 4 (Orientation survey) inner question tracker (0 to 19)
  const [activeSurveyQIdx, setActiveSurveyQIdx] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: "",
    email: "",
    gender: "Nữ",
    height: "",
    weight: "",
    bust: "",
    waist: "",
    hips: "",
    plasticSurgery: "Vẻ đẹp hoàn toàn tự nhiên, chưa từng can thiệp",
    maritalStatus: "Độc thân, chưa từng sinh con",
    education: "",
    languages: [] as string[],
    talentTypes: [] as string[],
    price: "",
    skills: "",
    experience: "",
    professionalExperience: "",
    tiktokUrl: "",
    instagramUrl: "",
    facebookUrl: "",
    youtubeUrl: "",
    tiktokFollowers: "0",
    instagramFollowers: "0",
    facebookFollowers: "0",
    youtubeFollowers: "0"
  });

  // Mock Upload state to feel realistic & premium
  const [mediaUploads, setMediaUploads] = useState({
    avatar: null as string | null,
    portfolio: null as string | null, // Portfolio/CV (required)
    introVideo: null as string | null, // Intro video (optional)
    cover: null as string | null,
    fullBody: null as string | null,
    portfolioPhotos: null as string | null,
    portfolioVideos: null as string | null,
  });
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [portfolioPreviewUrl, setPortfolioPreviewUrl] = useState<string | null>(null);
  const [introVideoPreviewUrl, setIntroVideoPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [fullBodyFile, setFullBodyFile] = useState<File | null>(null);
  const [fullBodyPreviewUrl, setFullBodyPreviewUrl] = useState<string | null>(null);
  const [portfolioPhotoFiles, setPortfolioPhotoFiles] = useState<SurveyPortfolioPhoto[]>([]);
  const [portfolioVideoFiles, setPortfolioVideoFiles] = useState<SurveyPortfolioVideo[]>([]);
  const [portfolioVideoLinks, setPortfolioVideoLinks] = useState<SurveyPortfolioVideoLink[]>([]);
  const [videoLinkInput, setVideoLinkInput] = useState("");
  const surveyMediaCleanupRef = useRef<{
    coverPreviewUrl: string | null;
    fullBodyPreviewUrl: string | null;
    portfolioPhotoFiles: SurveyPortfolioPhoto[];
    portfolioVideoFiles: SurveyPortfolioVideo[];
  }>({
    coverPreviewUrl: null,
    fullBodyPreviewUrl: null,
    portfolioPhotoFiles: [],
    portfolioVideoFiles: [],
  });
  const [socialHighlights, setSocialHighlights] = useState<string[]>([]);
  const [socialHighlightInput, setSocialHighlightInput] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([]);
  const [portfolioLinkInput, setPortfolioLinkInput] = useState("");
  const [socialAccounts, setSocialAccounts] = useState<{ platform: string; url: string }[]>([]);
  const [socialPlatform, setSocialPlatform] = useState("Tiktok");
  const [socialLinkInput, setSocialLinkInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const getCurrentPortfolioLinks = () => {
    const pendingLink = portfolioLinkInput.trim();
    return Array.from(new Set([
      ...portfolioLinks,
      ...(pendingLink ? [pendingLink] : []),
    ]));
  };

  const getTotalFollowers = () => {
    return (
      (parseInt(formData.tiktokFollowers) || 0) +
      (parseInt(formData.instagramFollowers) || 0) +
      (parseInt(formData.facebookFollowers) || 0) +
      (parseInt(formData.youtubeFollowers) || 0)
    );
  };

  const [surveyAnswers, setSurveyAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [guestSurveyUnlocked, setGuestSurveyUnlocked] = useState(false);
  const [showGuestAccountDialog, setShowGuestAccountDialog] = useState(false);
  const [guestAccountReady, setGuestAccountReady] = useState(false);
  const [isCreatingGuestAccount, setIsCreatingGuestAccount] = useState(false);
  const [guestAccountError, setGuestAccountError] = useState("");
  const [pendingGuestSurveySyncPayload, setPendingGuestSurveySyncPayload] = useState<GuestSurveySyncPayload | null>(null);
  const [showCancelSurveyDialog, setShowCancelSurveyDialog] = useState(false);
  const [registeredComp, setRegisteredComp] = useState<Record<string, boolean>>({});
  const [aiAnalysis, setAiAnalysis] = useState<TalentSurveyAnalysis | null>(null);

  const [results, setResults] = useState({
    pageant: 0,
    runway: 0,
    kol: 0,
    mainCategory: "",
    tier: "C" as "S" | "A" | "B" | "C" | "Potential",
    profileScore: 0,
    date: "",
    hardRules: {
      strictPageantAllowed: true,
      runwayAllowed: true,
      hasLanguagePriority: false
    }
  });

  React.useEffect(() => {
    if (initialHistoryEntry) {
      setResults({
        pageant: initialHistoryEntry.pageant,
        runway: initialHistoryEntry.runway,
        kol: initialHistoryEntry.kol,
        mainCategory: initialHistoryEntry.mainCategory,
        tier: initialHistoryEntry.tier,
        profileScore: initialHistoryEntry.profileScore,
        date: initialHistoryEntry.date,
        hardRules: {
          strictPageantAllowed: true,
          runwayAllowed: initialHistoryEntry.runway >= 50,
          hasLanguagePriority: initialHistoryEntry.pageant >= 70
        }
      });
      setAiAnalysis(initialHistoryEntry.aiSurveyAnalysis || null);
      setIsSubmitted(true);
    } else {
      setAiAnalysis(null);
      setIsSubmitted(false);
      setStep(1);
      setMaxStep(1);
      setActiveSurveyQIdx(0);
      setSurveyAnswers({});
    }
  }, [initialHistoryEntry]);

  React.useEffect(() => {
    surveyMediaCleanupRef.current = {
      coverPreviewUrl,
      fullBodyPreviewUrl,
      portfolioPhotoFiles,
      portfolioVideoFiles,
    };
  }, [coverPreviewUrl, fullBodyPreviewUrl, portfolioPhotoFiles, portfolioVideoFiles]);

  React.useEffect(() => {
    return () => {
      if (avatarPreviewUrlRef.current) {
        URL.revokeObjectURL(avatarPreviewUrlRef.current);
        avatarPreviewUrlRef.current = null;
      }
      if (portfolioPreviewUrlRef.current) {
        URL.revokeObjectURL(portfolioPreviewUrlRef.current);
        portfolioPreviewUrlRef.current = null;
      }
      if (introVideoPreviewUrlRef.current) {
        URL.revokeObjectURL(introVideoPreviewUrlRef.current);
        introVideoPreviewUrlRef.current = null;
      }
      const latestMedia = surveyMediaCleanupRef.current;
      [latestMedia.coverPreviewUrl, latestMedia.fullBodyPreviewUrl].forEach((url) => {
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      latestMedia.portfolioPhotoFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      latestMedia.portfolioVideoFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  React.useEffect(() => {
    if (initialHistoryEntry) return;

    let cancelled = false;

    loadTalentSurveyProgress().then((progress) => {
      if (cancelled || !progress) return;
      if (progress.status && progress.status !== "draft") return;

      const savedStep = clampSurveyStep(progress.current_step);
      setStep(savedStep);
      setMaxStep((prev) => Math.max(prev, savedStep));
    });

    return () => {
      cancelled = true;
    };
  }, [initialHistoryEntry]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTalentType = (type: string) => {
    const nextType = normalizeTalentTypeLabel(type);
    if (!nextType) return;
    setFormData((prev) => {
      if (prev.talentTypes.includes(nextType)) return prev;
      return { ...prev, talentTypes: normalizeTalentTypeList([...prev.talentTypes, nextType]) };
    });
  };

  const handleRemoveTalentType = (typeToRemove: string) => {
    const normalizedType = normalizeTalentTypeLabel(typeToRemove);
    setFormData((prev) => ({
      ...prev,
      talentTypes: prev.talentTypes.filter((type) => normalizeTalentTypeLabel(type) !== normalizedType),
    }));
  };

  const handleAddContentSkill = (value: string) => {
    const nextSkill = value.trim();
    if (!nextSkill) return;
    setFormData((prev) => {
      const skills = splitSkillValues(prev.skills);
      if (skills.includes(nextSkill)) return prev;
      return { ...prev, skills: [...skills, nextSkill].join(", ") };
    });
    setSkillInput("");
  };

  const handleRemoveContentSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: splitSkillValues(prev.skills).filter((skill) => skill !== skillToRemove).join(", "),
    }));
  };

  const handleAddSocialHighlight = (value: string) => {
    const nextValue = value.trim();
    if (!nextValue || socialHighlights.includes(nextValue)) return;
    setSocialHighlights((current) => [...current, nextValue]);
    setSocialHighlightInput("");
  };

  const handleAddPortfolioLink = () => {
    const nextLink = portfolioLinkInput.trim();
    if (!nextLink || portfolioLinks.includes(nextLink)) return;
    setPortfolioLinks((current) => [...current, nextLink]);
    setPortfolioLinkInput("");
  };

  const handleAddSocialAccount = () => {
    let nextUrl = socialLinkInput.trim();
    if (!nextUrl) return;
    if (!/^https?:\/\//i.test(nextUrl)) nextUrl = `https://${nextUrl}`;
    setSocialAccounts((current) => [...current, { platform: socialPlatform, url: nextUrl }]);
    setSocialLinkInput("");
  };

  const handlePriceChange = (val: string) => {
    if (!val) {
      setFormData((prev) => ({ ...prev, price: "" }));
      return;
    }

    const isPureNumber = /^[0-9.\s]+$/.test(val);

    if (isPureNumber) {
      const digitsOnly = val.replace(/\D/g, "");
      if (!digitsOnly) {
        setFormData((prev) => ({ ...prev, price: "" }));
        return;
      }
      const formatted = Number(digitsOnly).toLocaleString("vi-VN");
      setFormData((prev) => ({ ...prev, price: formatted }));
      return;
    }

    setFormData((prev) => ({ ...prev, price: val }));
  };

  const handleSurveySelect = (qId: number, optionIdx: number) => {
    setSurveyAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    // Auto advance to next question after short delay for optimal speed & comfort
    if (activeSurveyQIdx < SURVEY_QUESTIONS.length - 1) {
      setTimeout(() => {
        setActiveSurveyQIdx((prev) => prev + 1);
      }, 350);
    }
  };

  // Check completeness and provide real-time feedback: "Hồ sơ của bạn đã hoàn thiện [X]%"
  const getCompletenessPercent = () => {
    if (isSubmitted) return 100;

    let basePct = 0;
    if (step === 1) {
      // Basic info inputs filled ratio
      let count = 0;
      if (formData.name) count++;
      if (formData.location) count++;
      if (formData.phone) count++;
      if (formData.email) count++;
      if (mediaUploads.avatar) count++;
      if (formData.height) count++;
      if (formData.weight) count++;
      if (formData.bust) count++;
      if (formData.waist) count++;
      if (formData.hips) count++;
      basePct = Math.round((count / 10) * 25); // max 25%
    } else if (step === 2) {
      basePct = 25;
      let count = 0;
      if (formData.price) count++;
      if (formData.experience) count++;
      if (formData.talentTypes.length) count++;
      if (splitSkillValues(formData.skills).length) count++;
      if (formData.professionalExperience) count++;
      basePct += Math.round((count / 5) * 25); // max 50%
    } else if (step === 3) {
      basePct = 50;
      let count = 0;
      if (socialHighlights.length) count++;
      if (portfolioLinks.length) count++;
      if (socialAccounts.length) count++;
      basePct += Math.round((count / 3) * 25);
    } else if (step === MEDIA_SURVEY_STEP) {
      basePct = 75;
      let count = 0;
      if (coverPreviewUrl || coverFile || mediaUploads.cover) count++;
      if (fullBodyPreviewUrl || fullBodyFile || mediaUploads.fullBody) count++;
      if (portfolioPhotoFiles.length || mediaUploads.portfolioPhotos) count++;
      if (portfolioVideoFiles.length || portfolioVideoLinks.length || mediaUploads.portfolioVideos) count++;
      basePct += Math.round((count / 4) * (ORIENTATION_SURVEY_ENABLED ? 12 : 25));
    } else if (ORIENTATION_SURVEY_ENABLED && step === AI_SURVEY_STEP) {
      basePct = 75;
      // Survey answered count ratio
      const answeredCount = Object.keys(surveyAnswers).length;
      basePct += Math.round((answeredCount / SURVEY_QUESTIONS.length) * 25); // max 100%
    }
    return Math.min(100, basePct);
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.name.trim().length > 0 && formData.email.trim().length > 0;
    }
    if (step === 2) {
      return true;
    }
    if (step === 3) {
      // Portfolio upload UI is hidden – always valid at step 3
      // return mediaUploads.portfolio !== null;
      return true;
    }
    if (ORIENTATION_SURVEY_ENABLED && step === AI_SURVEY_STEP) {
      // Valid if all 20 questions are answered
      return SURVEY_QUESTIONS.every((q) => surveyAnswers[q.id] !== undefined);
    }
    return true;
  };

  const goToStep = (nextStep: number, status: "draft" | "completed" | "analyzed" = "draft") => {
    const savedStep = clampSurveyStep(nextStep);
    if (!ORIENTATION_SURVEY_ENABLED && savedStep > SURVEY_STEP_COUNT) {
      return;
    }
    if (ORIENTATION_SURVEY_ENABLED && !isAuthenticated && savedStep === AI_SURVEY_STEP && !guestSurveyUnlocked) {
      return;
    }
    setStep(savedStep);
    setMaxStep((prev) => Math.max(prev, savedStep));
    void saveTalentSurveyProgress(savedStep, status);
    scrollSurveyToTop();
  };

  const openGuestAccountDialog = () => {
    setGuestAccountError("");
    setSubmitError("");
    setShowGuestAccountDialog(true);
  };

  const handleGuestDialogLogin = async () => {
    setGuestAccountError("");
    setSubmitError("");
    setIsCreatingGuestAccount(true);

    try {
      await completeStep3GuestProfile({
        formData,
        avatarFile,
        avatarDataUrl,
        avatarPreviewUrl,
        coverFile,
        coverPreviewUrl,
        fullBodyFile,
        fullBodyPreviewUrl,
        portfolioPhotoFiles,
        portfolioVideoFiles,
        portfolioVideoLinks,
        mediaUploads,
        socialHighlights,
        portfolioLinks: getCurrentPortfolioLinks(),
        socialAccounts,
        guestAccountReady,
      });
      if (pendingGuestSurveySyncPayload) {
        persistGuestSurveySyncDraft(pendingGuestSurveySyncPayload);
      }

      setGuestAccountReady(true);
      setSubmitError("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tạo tài khoản OnstageVN. Vui lòng thử lại.";
      setGuestAccountError(message);
      setSubmitError(message);
      throw error;
    } finally {
      setIsCreatingGuestAccount(false);
    }
  };

  const handleContinueGuestSurvey = () => {
    if (!ORIENTATION_SURVEY_ENABLED) {
      setShowGuestAccountDialog(false);
      return;
    }
    setGuestSurveyUnlocked(true);
    setShowGuestAccountDialog(false);
    setStep(AI_SURVEY_STEP);
    setMaxStep((prev) => Math.max(prev, AI_SURVEY_STEP));
    void saveTalentSurveyProgress(AI_SURVEY_STEP, "draft");
    scrollSurveyToTop();
  };

  const handleStopSurvey = () => {
    setShowCancelSurveyDialog(false);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get("from");
      if (fromUrl) {
        router.push(fromUrl);
        return;
      }
    }
    onBackToDashboard?.();
  };

  const nextStep = async () => {
    if (!isStepValid()) return;

    if (step < SURVEY_STEP_COUNT) {
      if (!isAuthenticated && step === MEDIA_SURVEY_STEP && !guestSurveyUnlocked) {
        openGuestAccountDialog();
        return;
      }
      goToStep(step + 1);
      return;
    }

    if (step === SURVEY_STEP_COUNT) {
      if (!isAuthenticated) {
        openGuestAccountDialog();
        return;
      }

      await handleSubmit(new Event("submit") as unknown as React.FormEvent);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      goToStep(step - 1);
    }
  };

  const handleMockUpload = (field: keyof typeof mediaUploads, fileName: string) => {
    setMediaUploads(prev => ({ ...prev, [field]: fileName }));
  };

  const handleFileUploadClick = (field: keyof typeof mediaUploads) => {
    if (field === "avatar") {
      avatarInputRef.current?.click();
      return;
    }

    if (field === "portfolio") {
      portfolioInputRef.current?.click();
      return;
    }

    introVideoInputRef.current?.click();
  };

  const handleSurveyImageSelection = (field: SurveyImageKey, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    if (field === "cover") {
      if (coverPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(coverPreviewUrl);
      setCoverFile(file);
      setCoverPreviewUrl(previewUrl);
      setMediaUploads((prev) => ({ ...prev, cover: file.name }));
      return;
    }

    if (fullBodyPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(fullBodyPreviewUrl);
    setFullBodyFile(file);
    setFullBodyPreviewUrl(previewUrl);
    setMediaUploads((prev) => ({ ...prev, fullBody: file.name }));
  };

  const handlePortfolioPhotoSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, Math.max(0, 8 - portfolioPhotoFiles.length));
    event.target.value = "";
    if (!files.length) return;

    const nextItems = files.map((file) => ({
      id: makeSurveyMediaId(file),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    }));

    setPortfolioPhotoFiles((current) => [...current, ...nextItems].slice(0, 8));
    setMediaUploads((prev) => ({ ...prev, portfolioPhotos: `${portfolioPhotoFiles.length + nextItems.length} ảnh` }));
  };

  const handlePortfolioVideoSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, Math.max(0, 4 - portfolioVideoFiles.length - portfolioVideoLinks.length));
    event.target.value = "";
    if (!files.length) return;

    const nextItems = files.map((file) => ({
      id: makeSurveyMediaId(file),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    }));

    setPortfolioVideoFiles((current) => [...current, ...nextItems].slice(0, 4));
    setMediaUploads((prev) => ({ ...prev, portfolioVideos: `${portfolioVideoFiles.length + nextItems.length} video` }));
  };

  const handleRemoveSurveyImage = (field: SurveyImageKey) => {
    if (field === "cover") {
      if (coverPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(coverPreviewUrl);
      setCoverFile(null);
      setCoverPreviewUrl(null);
      setMediaUploads((prev) => ({ ...prev, cover: null }));
      return;
    }

    if (fullBodyPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(fullBodyPreviewUrl);
    setFullBodyFile(null);
    setFullBodyPreviewUrl(null);
    setMediaUploads((prev) => ({ ...prev, fullBody: null }));
  };

  const handleRemovePortfolioPhoto = (id: string) => {
    setPortfolioPhotoFiles((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = current.filter((item) => item.id !== id);
      setMediaUploads((prev) => ({ ...prev, portfolioPhotos: next.length ? `${next.length} ảnh` : null }));
      return next;
    });
  };

  const handleRemovePortfolioVideo = (id: string) => {
    setPortfolioVideoFiles((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = current.filter((item) => item.id !== id);
      setMediaUploads((prev) => ({ ...prev, portfolioVideos: next.length ? `${next.length} video` : null }));
      return next;
    });
  };

  const normalizeVideoUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const handleAddSurveyVideoLink = () => {
    if (portfolioVideoFiles.length + portfolioVideoLinks.length >= 4) return;

    const url = normalizeVideoUrl(videoLinkInput);
    if (!url || portfolioVideoLinks.some((item) => item.url === url)) return;

    setPortfolioVideoLinks((current) => [
      ...current,
      {
        id: `survey-video-link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        url,
        title: `Video ${current.length + portfolioVideoFiles.length + 1}`,
      },
    ]);
    setVideoLinkInput("");
    setMediaUploads((prev) => ({ ...prev, portfolioVideos: `${portfolioVideoFiles.length + portfolioVideoLinks.length + 1} video` }));
  };

  const handleRemovePortfolioVideoLink = (id: string) => {
    setPortfolioVideoLinks((current) => {
      const next = current.filter((item) => item.id !== id);
      setMediaUploads((prev) => ({ ...prev, portfolioVideos: portfolioVideoFiles.length + next.length ? `${portfolioVideoFiles.length + next.length} video` : null }));
      return next;
    });
  };

  const handleFileSelection = (
    field: keyof typeof mediaUploads,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextPreviewUrl = URL.createObjectURL(file);

    if (field === "avatar") {
      if (avatarPreviewUrlRef.current) {
        URL.revokeObjectURL(avatarPreviewUrlRef.current);
      }

      avatarPreviewUrlRef.current = nextPreviewUrl;
      setAvatarPreviewUrl(nextPreviewUrl);
      setAvatarFile(file);
      void fileToDataUrl(file).then(setAvatarDataUrl).catch(() => setAvatarDataUrl(""));
    } else if (field === "portfolio") {
      if (portfolioPreviewUrlRef.current) {
        URL.revokeObjectURL(portfolioPreviewUrlRef.current);
      }

      portfolioPreviewUrlRef.current = nextPreviewUrl;
      setPortfolioPreviewUrl(nextPreviewUrl);
    } else if (field === "introVideo") {
      if (introVideoPreviewUrlRef.current) {
        URL.revokeObjectURL(introVideoPreviewUrlRef.current);
      }

      introVideoPreviewUrlRef.current = nextPreviewUrl;
      setIntroVideoPreviewUrl(nextPreviewUrl);
    }

    setMediaUploads((prev) => ({
      ...prev,
      [field]: file.name,
    }));

    event.target.value = "";
  };

  const handleClearUploadedFile = (field: keyof typeof mediaUploads) => {
    if (field === "avatar") {
      if (avatarPreviewUrlRef.current) {
        URL.revokeObjectURL(avatarPreviewUrlRef.current);
        avatarPreviewUrlRef.current = null;
      }

      setAvatarPreviewUrl(null);
      setAvatarFile(null);
      setAvatarDataUrl("");
    }

    if (field === "portfolio") {
      if (portfolioPreviewUrlRef.current) {
        URL.revokeObjectURL(portfolioPreviewUrlRef.current);
        portfolioPreviewUrlRef.current = null;
      }
      setPortfolioPreviewUrl(null);
      if (portfolioInputRef.current) {
        portfolioInputRef.current.value = "";
      }
    }

    if (field === "introVideo") {
      if (introVideoPreviewUrlRef.current) {
        URL.revokeObjectURL(introVideoPreviewUrlRef.current);
        introVideoPreviewUrlRef.current = null;
      }
      setIntroVideoPreviewUrl(null);
      if (introVideoInputRef.current) {
        introVideoInputRef.current.value = "";
      }
    }

    setMediaUploads((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  const handleRegisterComp = (compName: string) => {
    setRegisteredComp(prev => ({ ...prev, [compName]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);
    setSubmitError("");

    try {
      // Hard Rules checks (Q1 - Q10)
      // Rule 1: Married or Major Surgery -> Excluded from strict national pageants
      const isMarriedOrChild = formData.maritalStatus === "Đã kết hôn / Đã sinh con";
      const hasMajorSurgery = formData.plasticSurgery === "Đã đại phẫu (Nâng mũi, nâng ngực, gọt hàm...)";
      const strictPageantAllowed = !isMarriedOrChild && !hasMajorSurgery;

      // Rule 2: Height < 165cm -> Excluded from Runway Model
      const heightVal = parseFloat(formData.height) || 0;
      const runwayAllowed = heightVal >= 165;

      // Rule 3: English proficient -> priority points
      const hasLanguagePriority = formData.languages.some((lang) =>
        /thành thạo|lưu loát|ielts|toeic|n1|n2|bản xứ/i.test(lang)
      );

      // Survey grading algorithm
      let countA = 0;
      let countB = 0;
      let countC = 0;

      SURVEY_QUESTIONS.forEach((q) => {
        const answerIdx = surveyAnswers[q.id];
        if (answerIdx !== undefined) {
          const group = q.options[answerIdx].group;
          if (group === "A") countA++;
          if (group === "B") countB++;
          if (group === "C") countC++;
        }
      });

      // 20 questions total. Each A/B/C choice is 3 points. Total maximum is 60.
      const scoreA = countA * 3;
      const scoreB = countB * 3;
      const scoreC = countC * 3;

      let pageantPct = Math.round((scoreA / 60) * 100);
      let runwayPct = Math.round((scoreB / 60) * 100);
      let kolPct = Math.round((scoreC / 60) * 100);

      // Apply Hard Rules to the scores/outcomes
      if (!runwayAllowed) {
        runwayPct = Math.max(0, runwayPct - 30); // Heavily penalize runway if height is insufficient
      }

      if (hasLanguagePriority) {
        pageantPct = Math.min(100, pageantPct + 5); // Add small priority bonus to pageant
      }

      // Determine highest score category
      let mainCategory = "Người đẹp thương hiệu / KOLs / Giải trí & Thế hệ mới";
      if (pageantPct >= runwayPct && pageantPct >= kolPct) {
        mainCategory = "Hoa hậu / Hoa khôi truyền thống & Nhân ái";
      } else if (runwayPct >= pageantPct && runwayPct >= kolPct && runwayAllowed) {
        mainCategory = "Người mẫu Runway chuyên nghiệp";
      }

      // Profile completeness score
      const completeness = getCompletenessPercent();

      // Determine Tier rating based on evaluation score (0-100)
      const evaluationScore = Math.max(pageantPct, runwayPct, kolPct);
      let tier: "S" | "A" | "B" | "C" | "Potential" = "C";

      if (evaluationScore >= 90) {
        tier = "S";
      } else if (evaluationScore >= 70) {
        tier = "A";
      } else if (evaluationScore >= 45) {
        tier = "B";
      } else if (evaluationScore >= 20) {
        tier = "C";
      } else {
        tier = "Potential";
      }

      const computedResults = {
        pageant: pageantPct,
        runway: runwayPct,
        kol: kolPct,
        mainCategory,
        tier,
        profileScore: evaluationScore,
        date: new Date().toLocaleString("vi-VN"),
        hardRules: {
          strictPageantAllowed,
          runwayAllowed,
          hasLanguagePriority
        }
      };

      setResults(computedResults);

      // Save to local storage for other views in the application
      const normalizedTalentTypes = normalizeTalentTypeList(formData.talentTypes);
      const currentPortfolioLinks = getCurrentPortfolioLinks();
      const hasAuth = !!getAuthToken();
      const selectedAvatar = avatarDataUrl || (avatarFile ? await fileToDataUrl(avatarFile).catch(() => "") : "") || (avatarPreviewUrl?.startsWith("data:") ? avatarPreviewUrl : "");
      const selectedCover = coverFile ? await fileToDataUrl(coverFile).catch(() => "") : (coverPreviewUrl?.startsWith("data:") ? coverPreviewUrl : "");
      const selectedFullBody = fullBodyFile ? await fileToDataUrl(fullBodyFile).catch(() => "") : (fullBodyPreviewUrl?.startsWith("data:") ? fullBodyPreviewUrl : "");
      const portfolioPhotoDataUrls = await Promise.all(
        portfolioPhotoFiles.map((item) => fileToDataUrl(item.file).catch(() => ""))
      );
      const selectedCityOption = cityOptions.find((option) => option.value === formData.location || option.label === formData.location);
      const userProfile: Record<string, unknown> = {
        ...formData,
        location: selectedCityOption?.label || formData.location,
        city_id: selectedCityOption?.id,
        cityId: selectedCityOption?.id,
        followersCount: getTotalFollowers().toString(),
        surveyScores: {
          pageant: pageantPct,
          runway: runwayPct,
          kol: kolPct
        },
        mainCategory,
        profileScore: evaluationScore,
        tier,
        isOnboarded: true,
        avatar: selectedAvatar || "/avatar.png",
        skills: splitSkillValues(formData.skills),
        languages: formData.languages,
        talentTypes: normalizedTalentTypes,
        bust: formData.bust,
        waist: formData.waist,
        hips: formData.hips,
        socialHighlights,
        social_highlights: socialHighlights,
        portfolioLinks: currentPortfolioLinks,
        portfolio_links: currentPortfolioLinks,
        portfolio_url: currentPortfolioLinks.join("\n"),
        socialAccounts,
        experienceText: formData.professionalExperience,
        bio: formData.professionalExperience,
        cover: selectedCover || coverPreviewUrl || "",
        fullBody: selectedFullBody || fullBodyPreviewUrl || "",
        photos: portfolioPhotoDataUrls.filter(Boolean),
        videos: portfolioVideoLinks.map((item) => ({
          id: item.id,
          title: item.title,
          url: item.url,
          video_type: "portfolio",
        })),
        mediaUploads
      };
      const savedProfile = hasAuth
        ? await saveTalentProfileOrThrow(userProfile)
        : persistTalentProfile(userProfile);

      if (hasAuth && savedProfile.backendProfileId) {
        const fileToUpload = avatarFile || (typeof selectedAvatar === "string" && selectedAvatar.startsWith("data:image/") ? dataUrlToFile(selectedAvatar, "survey-avatar.png") : null);
        if (fileToUpload) {
          try {
            const uploadedAvatar = await uploadTalentPhoto(Number(savedProfile.backendProfileId), fileToUpload, "avatar");
            if (uploadedAvatar?.url) {
              userProfile.avatar = uploadedAvatar.url;
              savedProfile.avatar = uploadedAvatar.url;
              setAvatarPreviewUrl(uploadedAvatar.url);
              setMediaUploads((prev) => ({ ...prev, avatar: "current-avatar" }));
              persistTalentProfile(savedProfile);
            }
          } catch (err) {
            console.warn("Failed to upload avatar photo on survey submit", err);
          }
        }

        const profileId = Number(savedProfile.backendProfileId);

        if (coverFile) {
          try {
            const uploadedCover = await uploadTalentPhoto(profileId, coverFile, "cover");
            if (uploadedCover?.url) {
              userProfile.cover = uploadedCover.url;
              savedProfile.cover = uploadedCover.url;
              setCoverPreviewUrl(uploadedCover.url);
              setMediaUploads((prev) => ({ ...prev, cover: "current-cover" }));
            }
          } catch (err) {
            console.warn("Failed to upload cover photo on survey submit", err);
          }
        }

        if (fullBodyFile) {
          try {
            const uploadedFullBody = await uploadTalentPhoto(profileId, fullBodyFile, "full_body");
            if (uploadedFullBody?.url) {
              userProfile.fullBody = uploadedFullBody.url;
              savedProfile.fullBody = uploadedFullBody.url;
              setFullBodyPreviewUrl(uploadedFullBody.url);
              setMediaUploads((prev) => ({ ...prev, fullBody: "current-full-body" }));
            }
          } catch (err) {
            console.warn("Failed to upload full body photo on survey submit", err);
          }
        }

        if (portfolioPhotoFiles.length) {
          const uploadedPhotos: string[] = [];
          for (const item of portfolioPhotoFiles) {
            try {
              const uploadedPhoto = await uploadTalentPhoto(profileId, item.file, "portfolio");
              if (uploadedPhoto?.url) uploadedPhotos.push(uploadedPhoto.url);
            } catch (err) {
              console.warn("Failed to upload portfolio photo on survey submit", err);
            }
          }

          if (uploadedPhotos.length) {
            const nextPhotos = [...(Array.isArray(savedProfile.photos) ? savedProfile.photos : []), ...uploadedPhotos].slice(0, 8);
            userProfile.photos = nextPhotos;
            savedProfile.photos = nextPhotos;
            uploadedPhotos.forEach((url, index) => {
              const slot = index + 1;
              if (slot <= 8) {
                userProfile[`lookbook${slot}`] = url;
                savedProfile[`lookbook${slot}`] = url;
              }
            });
            setMediaUploads((prev) => ({ ...prev, portfolioPhotos: `${uploadedPhotos.length} ảnh` }));
          }
        }

        if (portfolioVideoFiles.length) {
          const uploadedVideos: any[] = [];
          for (const item of portfolioVideoFiles) {
            try {
              const uploadedVideo = await uploadTalentVideo(profileId, item.file, item.name.replace(/\.[^.]+$/, ""));
              if (uploadedVideo?.url) uploadedVideos.push(uploadedVideo);
            } catch (err) {
              console.warn("Failed to upload portfolio video on survey submit", err);
            }
          }

          if (uploadedVideos.length) {
            const nextVideos = [...(Array.isArray(savedProfile.videos) ? savedProfile.videos : []), ...uploadedVideos].slice(0, 4);
            userProfile.videos = nextVideos;
            savedProfile.videos = nextVideos;
            setMediaUploads((prev) => ({ ...prev, portfolioVideos: `${uploadedVideos.length} video` }));
          }
        }

        if (portfolioVideoLinks.length) {
          const createdVideos: any[] = [];
          const currentVideos = Array.isArray(savedProfile.videos) ? savedProfile.videos : [];

          for (const item of portfolioVideoLinks) {
            try {
              const createdVideo = await createTalentVideoLink(profileId, item.url, item.title);
              if (createdVideo?.url) createdVideos.push(createdVideo);
            } catch (err) {
              console.warn("Failed to create portfolio video link on survey submit", err);
            }
          }

          if (createdVideos.length) {
            const nextVideos = [...currentVideos, ...createdVideos].slice(0, 4);
            userProfile.videos = nextVideos;
            savedProfile.videos = nextVideos;
            setMediaUploads((prev) => ({ ...prev, portfolioVideos: `${nextVideos.length} video` }));
          }
        }

        persistTalentProfile({ ...savedProfile, ...userProfile });
      }

      const surveyQuestionAnswers = SURVEY_QUESTIONS
        .map((question) => {
          const answerIdx = surveyAnswers[question.id];
          const option = answerIdx !== undefined ? question.options[answerIdx] : null;

          return option
            ? {
              question_code: `Q${question.id}`,
              answer_value: {
                option_index: answerIdx,
                group: option.group,
                text: option.text,
              },
            }
            : null;
        })
        .filter(Boolean) as { question_code: string; answer_value: unknown }[];

      const experienceYears = parseInt(formData.experience.match(/\d+/)?.[0] || "0", 10);

      const sectionAAnswers = compactSurveyAnswers([
        { question_code: "A1", answer_value: parseFloat(formData.height) || 0 },
        { question_code: "B1", answer_value: experienceYears },
        { question_code: "C1", answer_value: getTotalFollowers() },
        { question_code: "D1", answer_value: mainCategory },
        { question_code: "P1", answer_value: formData.price },
        { question_code: "P2", answer_value: normalizedTalentTypes },
        { question_code: "P3", answer_value: formData.professionalExperience },
        { question_code: "P4", answer_value: splitSkillValues(formData.skills) },
        { question_code: "P5", answer_value: socialHighlights },
        { question_code: "P6", answer_value: currentPortfolioLinks },
        { question_code: "P7", answer_value: socialAccounts },
      ]);
      const sectionSAnswers = ORIENTATION_SURVEY_ENABLED
        ? compactSurveyAnswers(surveyQuestionAnswers)
        : [];

      if (hasAuth) {
        await submitTalentSurvey("A", sectionAAnswers);
        if (ORIENTATION_SURVEY_ENABLED) {
          await submitTalentSurvey("S", sectionSAnswers);
        }
      } else {
        setPendingGuestSurveySyncPayload({
          profile: userProfile,
          sectionAAnswers,
          sectionSAnswers,
        });
      }

      const aiResult = hasAuth && ORIENTATION_SURVEY_ENABLED
        ? await analyzeTalentSurvey().catch((error) => {
          console.warn(error);
          return null;
        })
        : null;

      setAiAnalysis(aiResult);

      const finalResults = computedResults;

      if (aiResult) {
        userProfile.aiSurveyAnalysis = aiResult;
        userProfile.recommendedPageants = aiResult.pageants || [];
        userProfile.careerTrends = aiResult.career_trends || [];
      }

      if (aiResult) {
        setResults(finalResults);
        userProfile.surveyScores = {
          pageant: finalResults.pageant,
          runway: finalResults.runway,
          kol: finalResults.kol
        };
        userProfile.profileScore = finalResults.profileScore;
        userProfile.tier = finalResults.tier;
      }

      persistTalentProfile({ ...savedProfile, ...userProfile });

      void saveTalentSurveyProgress(SURVEY_STEP_COUNT + 1, ORIENTATION_SURVEY_ENABLED ? "analyzed" : "completed");
      if (!ORIENTATION_SURVEY_ENABLED && hasAuth) {
        router.push("/talent/profile");
        return;
      }

      setIsSubmitted(true);
      if (!hasAuth) {
        setGuestAccountReady(false);
        setShowGuestAccountDialog(true);
      }
    } catch (error) {
      console.error("Error submitting survey:", error);
      setSubmitError(error instanceof Error ? error.message : "Không lưu được thông tin khảo sát vào cơ sở dữ liệu.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // SVG Radar Points calculation (center at 100, 100, radius 70)
  const calculateRadarPath = () => {
    const cx = 100;
    const cy = 100;
    const maxVal = 100;
    const radius = 70;

    const getCoords = (val: number, angleDeg: number) => {
      const rad = (angleDeg - 90) * (Math.PI / 180);
      const dist = (val / maxVal) * radius;
      return {
        x: cx + dist * Math.cos(rad),
        y: cy + dist * Math.sin(rad)
      };
    };

    const ptPageant = getCoords(results.pageant, 0); // 12 o'clock
    const ptRunway = getCoords(results.runway, 120); // 4 o'clock
    const ptKol = getCoords(results.kol, 240); // 8 o'clock

    return `${ptPageant.x},${ptPageant.y} ${ptRunway.x},${ptRunway.y} ${ptKol.x},${ptKol.y}`;
  };

  // Dynamic Suggest 3 Competitions based on Results
  const getSuggestedCompetitions = () => {
    const isPageantHighest = results.pageant >= results.runway && results.pageant >= results.kol;
    const isRunwayHighest = results.runway >= results.pageant && results.runway >= results.kol && results.hardRules.runwayAllowed;

    if (isPageantHighest) {
      if (results.hardRules.strictPageantAllowed) {
        return [
          { name: "Miss World Vietnam 2026", type: "Pageant Sắc Đẹp Quốc Gia", deadline: "30/08/2026", status: "Đang mở đơn" },
          { name: "Hoa hậu Việt Nam 2026", type: "Pageant Truyền Thống Việt Nam", deadline: "15/10/2026", status: "Đang mở đơn" },
          { name: "Hoa khôi Du lịch Việt Nam 2026", type: "Pageant Quảng Bá Du Lịch", deadline: "20/09/2026", status: "Đang mở đơn" }
        ];
      } else {
        return [
          { name: "Mrs Vietnam Pageant 2026", type: "Hoa Hậu Quý Bà Việt Nam", deadline: "10/09/2026", status: "Đang mở đơn" },
          { name: "Hoa khôi Doanh nhân Việt Nam 2026", type: "Cuộc Thi Sắc Đẹp Doanh Nhân", deadline: "05/11/2026", status: "Đang mở đơn" },
          { name: "Miss Grand Vietnam 2026", type: "Pageant Sắc Đẹp Giải Trí", deadline: "25/08/2026", status: "Đang mở đơn" }
        ];
      }
    } else if (isRunwayHighest) {
      return [
        { name: "The New Mentor 2026", type: "Truyền Hình Thực Tế Runway", deadline: "10/08/2026", status: "Đang mở đơn" },
        { name: "Vietnam's Next Top Model 2026", type: "Người Mẫu Runway Chuyên Nghiệp", deadline: "15/09/2026", status: "Đang mở đơn" },
        { name: "Supermodel Vietnam 2026", type: "Tìm Kiếm Siêu Mẫu Quốc Gia", deadline: "01/10/2026", status: "Đang mở đơn" }
      ];
    } else {
      return [
        { name: "Miss Grand Vietnam 2026", type: "Pageant Sắc Đẹp Giải Trí", deadline: "25/08/2026", status: "Đang mở đơn" },
        { name: "The Face Vietnam 2026", type: "Gương Mặt Thương Hiệu / KOLs", deadline: "05/09/2026", status: "Đang mở đơn" },
        { name: "VNP KOL/KOC Tournament 2026", type: "Đại Sứ Thương Hiệu Thế Hệ Mới", deadline: "12/10/2026", status: "Đang mở đơn" }
      ];
    }
  };

  const activeQuestion = SURVEY_QUESTIONS[activeSurveyQIdx];
  const completenessPercent = getCompletenessPercent();

  // Setup Tier style attributes
  let tierStyles = {
    wrapperBorder: "border-teal-500/30",
    glowBg: "shadow-[0_0_20px_rgba(20,184,166,0.12)]",
    badgeColor: "bg-teal-500/10 text-teal-300 border-teal-500/30",
    gradientText: "text-teal-300",
    aura: "bg-teal-500/5"
  };

  if (results.tier === "S") {
    tierStyles = {
      wrapperBorder: "border-amber-400/40",
      glowBg: "shadow-[0_0_35px_rgba(245,158,11,0.25)]",
      badgeColor: "bg-amber-400/15 text-amber-300 border-amber-400/40",
      gradientText: "bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 bg-clip-text text-transparent font-black",
      aura: "bg-amber-500/10"
    };
  } else if (results.tier === "A") {
    tierStyles = {
      wrapperBorder: "border-slate-300/40",
      glowBg: "shadow-[0_0_30px_rgba(203,213,225,0.22)]",
      badgeColor: "bg-slate-300/10 text-slate-100 border-slate-300/40",
      gradientText: "bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400 bg-clip-text text-transparent font-extrabold",
      aura: "bg-slate-300/5"
    };
  } else if (results.tier === "Potential") {
    tierStyles = {
      wrapperBorder: "border-rose-500/40",
      glowBg: "shadow-[0_0_30px_rgba(244,63,94,0.2)]",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      gradientText: "text-rose-400 font-black tracking-wide",
      aura: "bg-rose-500/5"
    };
  }

  const handleResultPrimaryAction = () => {
    if (isAuthenticated) {
      router.push("/talent/profile");
      return;
    }

    openGuestAccountDialog();
  };

  if (isSubmitted) {
    const selectedSkills = splitSkillValues(formData.skills);
    const currentPortfolioLinks = getCurrentPortfolioLinks();
    const bodyMeasurements = [formData.bust, formData.waist, formData.hips].filter(Boolean).join(" - ");
    const hasAvatar = Boolean(avatarPreviewUrl || avatarFile || mediaUploads.avatar);
    const missingBasicFields = [
      !formData.name && "Họ và tên",
      !formData.email && "Email liên hệ",
      !hasAvatar && "Ảnh đại diện",
      !formData.gender && "Giới tính",
      !formData.location && "Khu vực sinh sống",
      !formData.height && "Chiều cao",
      !formData.weight && "Cân nặng",
      !formData.bust && "Số đo vòng 1",
      !formData.waist && "Số đo vòng 2",
      !formData.hips && "Số đo vòng 3",
    ].filter(Boolean) as string[];
    const missingCareerFields = [
      !formData.price && "Phí booking",
      !formData.talentTypes.length && "Loại hình Idol",
      !selectedSkills.length && "Lĩnh vực nội dung / kỹ năng",
      !formData.experience && "Số năm kinh nghiệm",
      !formData.professionalExperience && "Kinh nghiệm làm việc",
    ].filter(Boolean) as string[];
    const missingSocialFields = [
      !currentPortfolioLinks.length && "Portfolio",
      !socialHighlights.length && "Chỉ số nổi bật",
      !socialAccounts.length && "Liên kết mạng xã hội",
    ].filter(Boolean) as string[];
    const summaryRows = [
      { label: "Họ và tên", value: formData.name },
      { label: "Email liên hệ", value: formData.email },
      { label: "Giới tính", value: formData.gender },
      { label: "Khu vực sinh sống", value: formData.location },
      { label: "Chiều cao", value: formData.height ? `${formData.height} cm` : "" },
      { label: "Cân nặng", value: formData.weight ? `${formData.weight} kg` : "" },
      { label: "Số đo 3 vòng", value: bodyMeasurements ? `${bodyMeasurements} cm` : "" },
      { label: "Phí booking", value: formData.price },
      { label: "Số năm kinh nghiệm", value: formData.experience },
    ].filter((row) => row.value);

    const summaryGroups = [
      {
        title: "Thông tin cơ bản",
        icon: User,
        missing: missingBasicFields,
        content: (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {summaryRows.slice(0, 7).map((row) => (
              <div key={row.label} className="rounded-xl border border-white/5 bg-[#03050c]/70 p-3.5">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">{row.label}</span>
                <span className="mt-1 block text-sm font-bold text-slate-100">{row.value}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Nghề nghiệp",
        icon: Award,
        missing: missingCareerFields,
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {summaryRows.slice(7).map((row) => (
                <div key={row.label} className="rounded-xl border border-white/5 bg-[#03050c]/70 p-3.5">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">{row.label}</span>
                  <span className="mt-1 block text-sm font-bold text-slate-100">{row.value}</span>
                </div>
              ))}
            </div>
            <div>
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Loại hình Idol</span>
              {formData.talentTypes.length ? (
                <div className="flex flex-wrap gap-2">
                  {formData.talentTypes.map((type) => (
                    <span key={type} className="rounded-full border border-[#D4A64A]/25 bg-[#D4A64A]/10 px-3 py-1 text-xs font-black uppercase text-[#F0C56B]">
                      {type}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-slate-500">Chưa chọn loại hình nào</p>
              )}
            </div>
            <div>
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Lĩnh vực nội dung / kỹ năng</span>
              {selectedSkills.length ? (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span key={skill} className="rounded-full border border-white/10 bg-[#071B42]/55 px-3 py-1 text-xs font-bold text-slate-100">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-slate-500">Chưa thêm lĩnh vực nào</p>
              )}
            </div>
            <div className="rounded-xl border border-white/5 bg-[#03050c]/70 p-3.5">
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Kinh nghiệm làm việc</span>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                {formData.professionalExperience || "Chưa nhập kinh nghiệm làm việc"}
              </p>
            </div>
          </div>
        ),
      },
      {
        title: "Portfolio & mạng xã hội",
        icon: Globe,
        missing: missingSocialFields,
        content: (
          <div className="space-y-4">
            <div>
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Portfolio</span>
              {currentPortfolioLinks.length ? (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {currentPortfolioLinks.map((link, index) => (
                    <a
                      key={`${link}-${index}`}
                      href={portfolioHref(link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate rounded-xl border border-white/5 bg-[#03050c]/70 p-3 text-sm font-bold text-[#F0C56B] transition-colors hover:border-[#D4A64A]/30 hover:text-white"
                    >
                      Portfolio {index + 1}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-slate-500">Chưa có portfolio nào được thêm</p>
              )}
            </div>
            <div>
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Chỉ số nổi bật</span>
              {socialHighlights.length ? (
                <div className="flex flex-wrap gap-2">
                  {socialHighlights.map((highlight) => (
                    <span key={highlight} className="rounded-full border border-[#D4A64A]/25 bg-[#D4A64A]/10 px-3 py-1 text-xs font-black uppercase text-[#F0C56B]">
                      {highlight}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-slate-500">Chưa thêm chỉ số nổi bật nào</p>
              )}
            </div>
            <div>
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Liên kết mạng xã hội</span>
              {socialAccounts.length ? (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {socialAccounts.map((account, index) => (
                    <a
                      key={`${account.platform}-${account.url}-${index}`}
                      href={portfolioHref(account.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-white/5 bg-[#03050c]/70 p-3 transition-colors hover:border-[#D4A64A]/30"
                    >
                      <span className="block text-[10px] font-black uppercase tracking-widest text-[#F0C56B]">{account.platform}</span>
                      <span className="mt-1 block truncate text-sm font-semibold text-slate-200">{account.url}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-slate-500">Chưa có liên kết mạng xã hội nào được thêm</p>
              )}
            </div>
          </div>
        ),
      },
    ];

    return (
      <div className="relative w-full animate-in rounded-3xl border border-[#D4A64A]/20 bg-[#02040a]/95 p-5 shadow-[0_0_30px_rgba(212,166,74,0.08)] fade-in slide-in-from-bottom-8 duration-700 md:p-8">
        <div className="pointer-events-none absolute right-0 top-0 -z-10 h-56 w-56 rounded-full bg-[#D4A64A]/5 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-56 w-56 rounded-full bg-[#071B42]/50 blur-[90px]" />

        <div className="mb-6 flex flex-col gap-4 border-b border-white/5 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A64A]/25 bg-[#D4A64A]/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#F0C56B]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Hồ sơ đã được cập nhật
            </div>
            <h2 className="mt-3 font-display text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
              Tóm tắt hồ sơ Idol
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              Thời gian: <span className="font-bold text-slate-200">{results.date || "Vừa thực hiện"}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                if (onBackToDashboard) {
                  onBackToDashboard();
                  return;
                }
                router.back();
              }}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#D4A64A]/30 bg-gradient-gold px-5 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-[0_0_15px_rgba(240,197,107,0.18)] transition-all hover:brightness-105 active:scale-98 md:text-xs"
            >
              <X className="h-3.5 w-3.5 stroke-[3]" /> Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                setAiAnalysis(null);
                setIsSubmitted(false);
                goToStep(1);
                setMaxStep(1);
                setActiveSurveyQIdx(0);
                setSurveyAnswers({});
              }}
              className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-transparent px-5 font-display text-[11px] font-bold text-slate-300 transition-all hover:bg-white/5 hover:text-white md:text-xs"
            >
              Làm lại bài khảo sát
            </button>
            <button
              type="button"
              onClick={handleResultPrimaryAction}
              className="flex h-11 items-center justify-center rounded-xl bg-gradient-gold px-5 font-display text-[11px] font-bold text-slate-950 shadow-lg transition-all hover:brightness-105 active:scale-98 md:text-xs"
            >
              {isAuthenticated ? "Chuyển đến hồ sơ cá nhân" : "Đăng nhập ngay"} <ArrowRight className="ml-1.5 h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-[#03050c]/70 p-4 text-center">
            <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Độ hoàn thiện</span>
            <span className="mt-1 block font-display text-3xl font-black text-[#F0C56B]">{results.profileScore}/100</span>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#03050c]/70 p-4 text-center">
            <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Số bước đã hoàn thành</span>
            <span className="mt-1 block font-display text-3xl font-black text-white">{SURVEY_STEP_COUNT}/{SURVEY_STEP_COUNT}</span>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#03050c]/70 p-4 text-center">
            <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Trạng thái</span>
            <span className="mt-2 inline-flex rounded-full border border-[#D4A64A]/25 bg-[#D4A64A]/10 px-3 py-1 text-xs font-black uppercase text-[#F0C56B]">
              Sẵn sàng hiển thị
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {summaryGroups.map((group) => {
            const Icon = group.icon;
            return (
              <section key={group.title} className="rounded-2xl border border-white/5 bg-[#071B42]/25 p-5">
                <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-black uppercase tracking-wider text-white">
                  <Icon className="h-4.5 w-4.5 text-[#F0C56B]" />
                  {group.title}
                </h3>
                {group.content}
                <div className="mt-5 border-t border-white/5 pt-4">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Còn thiếu</span>
                  {group.missing.length ? (
                    <div className="flex flex-wrap gap-2">
                      {group.missing.map((field) => (
                        <span
                          key={field}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#D4A64A]/25 bg-[#D4A64A]/10 px-3 py-1 text-[11px] font-bold text-[#F0C56B]"
                        >
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          {field}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      Đã đủ thông tin
                    </span>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    const fallbackJobs = JOBS_LIST.map((job) => {
      const matchScore = Math.round(
        results.pageant * job.weights.pageant +
        results.runway * job.weights.runway +
        results.kol * job.weights.kol
      );
      return { ...job, matchScore };
    }).sort((a, b) => b.matchScore - a.matchScore);
    const aiJobs = (aiAnalysis?.career_trends || [])
      .filter((job) => job.title)
      .map((job, index) => ({
        id: `ai-${index}`,
        title: String(job.title),
        desc: job.reasoning || "",
        weights: { pageant: 0, runway: 0, kol: 0 },
        matchScore: Math.round(Number(job.match_score || 0)),
      }));
    const sortedJobs = aiJobs.length
      ? [
        ...aiJobs,
        ...fallbackJobs.filter((job) => !aiJobs.some((aiJob) => aiJob.title === job.title)),
      ].slice(0, 20)
      : fallbackJobs;

    const aiComps = (aiAnalysis?.pageants || [])
      .filter((comp) => comp.name)
      .slice(0, 3)
      .map((comp) => ({
        name: String(comp.name),
        type: comp.reasoning || "AI đề xuất",
        deadline: "Đang cập nhật",
        status: `${Math.round(Number(comp.match_score || 0))}% match`,
      }));
    const suggestedComps = aiComps.length ? aiComps : getSuggestedCompetitions();

    return (
      <div className={cn(
        "w-full bg-[#070913]/90 p-6 md:p-10 rounded-3xl border transition-all duration-700 animate-in fade-in slide-in-from-bottom-8",
        tierStyles.wrapperBorder,
        tierStyles.glowBg
      )}>
        <div className={cn("absolute -top-12 -right-12 h-64 w-64 rounded-full blur-[100px] -z-10 pointer-events-none", tierStyles.aura)} />
        <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full blur-[100px] -z-10 bg-slate-900 pointer-events-none" />

        {/* Back to history button row */}
        {onBackToDashboard && (
          <div className="flex flex-col gap-3 pb-4 border-b border-white/5 mb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex h-11 items-center">
              <div className="text-[10px] md:text-[11px] font-bold text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 leading-none">
                Thời gian: {results.date || "Vừa thực hiện"}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowCancelSurveyDialog(true)}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 px-4 text-[11px] font-black uppercase tracking-wider text-[#070913] shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all hover:scale-[1.02] hover:brightness-105 active:scale-98 md:text-xs"
              >
                <X className="h-3.5 w-3.5 stroke-[3]" /> Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiAnalysis(null);
                  setIsSubmitted(false);
                  goToStep(1);
                  setMaxStep(1);
                  setActiveSurveyQIdx(0);
                  setSurveyAnswers({});
                }}
                className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-transparent px-4 font-display text-[11px] font-bold text-slate-300 transition-all hover:bg-white/5 hover:text-white md:text-xs"
              >
                Làm lại bài khảo sát
              </button>
              <button
                type="button"
                onClick={handleResultPrimaryAction}
                className="flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 px-4 font-display text-[11px] font-bold text-[#070913] shadow-lg transition-all hover:brightness-105 active:scale-98 md:text-xs"
              >
                {isAuthenticated ? "Chuyển đến hồ sơ cá nhân" : "Đăng nhập ngay"} <ArrowRight className="ml-1.5 h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10 items-stretch">
          {/* LEFT SIDE: Radar Chart & Tier & Status checks */}
          <div className="lg:w-[42%] flex flex-col justify-between space-y-8 border-b lg:border-b-0 lg:border-r border-white/5 pb-8 lg:pb-0 lg:pr-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex mb-3.5 items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-[11px] md:text-xs font-bold text-amber-300 uppercase tracking-wider border border-amber-400/25">
                <Sparkles className="h-3 w-3 animate-pulse" /> AI Diagnostic Completed
              </div>
              <h2 className="font-display text-2xl font-black tracking-tight text-white uppercase leading-tight">
                KẾT QUẢ ĐỊNH HƯỚNG
              </h2>
              <p className="text-xs md:text-[13px] text-slate-400 mt-1">
                Thuật toán đã đối soát 10 thông số cơ bản & chấm điểm 20 câu hỏi trắc nghiệm.
              </p>
            </div>

            {/* Radar SVG */}
            <div className="relative mx-auto my-2 flex h-56 w-56 items-center justify-center rounded-2xl border border-white/5 bg-[#03050c]/60 p-4 shadow-inner">
              <RadarChart scores={{ pageant: results.pageant, runway: results.runway, kol: results.kol }} />
            </div>

            <div className="w-full space-y-4">
              <div className="rounded-xl border border-white/5 bg-[#03050c]/80 p-4">
                <span className="block text-[9px] md:text-[10px] text-slate-500 uppercase tracking-widest font-black">Nhóm Định Hướng Cốt Lõi</span>
                <span className="block text-xs font-bold text-white mt-1.5 flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  {results.mainCategory}
                </span>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 rounded-xl border border-white/5 bg-[#03050c]/80 p-3 text-center">
                  <span className="block text-[9px] md:text-[10px] text-slate-500 uppercase tracking-widest font-black">Xếp Hạng Tier</span>
                  <span className={cn("text-lg font-black mt-1 block tracking-wider", tierStyles.gradientText)}>
                    {results.tier === "Potential" ? "Potential" : `Tier ${results.tier}`}
                  </span>
                </div>
                <div className="flex-1 rounded-xl border border-white/5 bg-[#03050c]/80 p-3 text-center">
                  <span className="block text-[9px] md:text-[10px] text-slate-500 uppercase tracking-widest font-black">Độ Hoàn Thiện</span>
                  <span className="text-lg font-black text-slate-200 mt-1 block">
                    {results.profileScore}/100
                  </span>
                </div>
              </div>

              {/* Hard Rules analysis section */}
              <div className="rounded-xl border border-white/5 bg-[#03050c]/40 p-4 space-y-2.5">
                <span className="block text-[9px] md:text-[10px] text-slate-500 uppercase tracking-widest font-black">Đánh Giá Điều Kiện Cần (Hard Rules Check)</span>

                <div className="flex items-start gap-2.5 text-[11px] md:text-xs">
                  {results.hardRules.strictPageantAllowed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      <span className="text-slate-300 leading-normal">Đủ tiêu chuẩn nhân thân / thẩm mỹ cho các cuộc thi Quốc gia chính thống (Hoa hậu VN, Miss World...)</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <span className="text-slate-400 leading-normal">Có can thiệp đại phẫu hoặc tình trạng hôn nhân đặc thù. Khuyên dùng: Mrs Pageant, Hoa khôi du lịch, Model/KOL.</span>
                    </>
                  )}
                </div>

                <div className="flex items-start gap-2.5 text-[11px] md:text-xs">
                  {results.hardRules.runwayAllowed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      <span className="text-slate-300 leading-normal">Chiều cao đạt tiêu chuẩn Catwalk chuyên nghiệp (&ge;1m65).</span>
                    </>
                  ) : (
                    <>
                      <Info className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                      <span className="text-slate-400 leading-normal">Chiều cao dưới 1m65. Phù hợp hướng tới KOL, Photo Model, hoặc Review thương mại.</span>
                    </>
                  )}
                </div>

                {results.hardRules.hasLanguagePriority && (
                  <div className="flex items-start gap-2.5 text-[11px] md:text-xs">
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                    <span className="text-amber-300/90 leading-normal font-medium">Trình độ tiếng Anh xuất sắc. Có điểm ưu tiên đặc cách khi xét duyệt đại diện Việt Nam thi Quốc tế.</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* RIGHT SIDE: 20 Suitable Jobs & Suggest 3 Open Competitions */}
          <div className="flex-1 space-y-6 flex flex-col">
            {/* Suggested Open Competitions */}
            <div>
              <h3 className="font-display font-extrabold text-xs md:text-[13px] text-white uppercase tracking-wider flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                Gợi Ý Cuộc Thi Phù Hợp (Đăng ký nhanh)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                {suggestedComps.map((comp, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-xl border border-white/5 bg-[#03050c]/80 p-3.5 hover:border-amber-400/25 transition-all duration-300 relative group"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-[10px] md:text-[11.5px] font-black text-amber-400 uppercase tracking-wider group-hover:text-amber-300 transition-colors flex-1">{comp.name}</h4>
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping mt-1 shrink-0" />
                      </div>
                      <p className="text-[9px] md:text-[10px] text-slate-500 mt-1">Hạn nộp đơn: {comp.deadline}</p>
                    </div>

                    <button
                      onClick={() => handleRegisterComp(comp.name)}
                      disabled={registeredComp[comp.name]}
                      className={cn(
                        "mt-3.5 w-full h-8 rounded-lg text-[9px] md:text-[10px] font-bold transition-all flex items-center justify-center gap-1",
                        registeredComp[comp.name]
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : "bg-white/5 hover:bg-amber-400/10 border border-white/10 hover:border-amber-400/30 text-slate-300 hover:text-amber-300"
                      )}
                    >
                      {registeredComp[comp.name] ? <>Đã nộp đơn ✔</> : <>Đăng ký</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* List of 20 Career Suitability */}
            <div className="flex-1 flex flex-col min-h-0">
              <div>
                <h3 className="font-display font-extrabold text-xs md:text-[13px] text-white uppercase tracking-wider flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-400" />
                  Mức Độ Phù Hợp 20 Việc Làm Xu Hướng (AI Scored)
                </h3>
                <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5">
                  Xếp hạng các vị trí công việc từ cao xuống thấp dựa trên chỉ số năng lực của bạn:
                </p>
              </div>

              {/* Scroll Container */}
              <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-2 mt-3 custom-scrollbar border-t border-white/5 pt-3">
                {sortedJobs.map((job, idx) => {
                  const isHigh = job.matchScore >= 80;
                  const isMid = job.matchScore >= 50 && job.matchScore < 80;

                  return (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#03050c]/60 p-2.5 hover:bg-slate-900/10 hover:border-white/10 transition-all duration-300 group"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/5 text-[10px] md:text-[11px] font-bold text-slate-500 group-hover:bg-amber-400/10 group-hover:text-amber-400 transition-all">
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs md:text-[13px] font-bold text-slate-200 group-hover:text-amber-400 transition-colors duration-300 truncate">
                            {job.title}
                          </h4>
                          <span className={cn(
                            "font-display text-[11px] md:text-xs font-black tracking-tighter",
                            isHigh ? "text-amber-400" : isMid ? "text-purple-400" : "text-slate-500"
                          )}>
                            {job.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-[10px] md:text-[11px] text-slate-500 truncate mt-0.5">{job.desc}</p>

                        <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isHigh ? "bg-gradient-to-r from-amber-300 to-amber-500" : isMid ? "bg-purple-500" : "bg-slate-700"
                            )}
                            style={{ width: `${job.matchScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh w-full overflow-visible rounded-none border-0 border-white/5 bg-[#070913]/95 p-4 shadow-2xl transition-all duration-500 md:min-h-0 md:overflow-hidden md:rounded-3xl md:border md:p-8">

      {/* Top ambient glow light */}
      <div className="absolute top-0 right-0 -z-10 h-32 w-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-32 w-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Modern Stepper Header Progress */}
      <div className="mb-6 space-y-4 border-b border-white/10 pb-4 md:mb-8 md:space-y-6 md:pb-6">
        <div className="flex items-start justify-between gap-3 w-full min-w-0">
          {/* Left: step badge + step name + progress text – single row on all screens */}
          <div className="flex flex-col min-w-0">
            <h2 className="mb-2 font-display text-base font-black uppercase tracking-wider text-white md:text-lg">
              Tham gia hệ thống
            </h2>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="shrink-0 text-[11px] md:text-xs font-black text-amber-300 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 whitespace-nowrap">
                Bước {step} / {SURVEY_STEP_COUNT}
              </span>
              <span className="min-w-0 text-xs font-black leading-snug text-white">
                {step === 1 && "Thông tin cơ bản"}
                {step === 2 && "Nghề nghiệp"}
                {step === 3 && "Social & Portfolio"}
                {step === MEDIA_SURVEY_STEP && "Hình ảnh & Video"}
                {ORIENTATION_SURVEY_ENABLED && step === AI_SURVEY_STEP && "Khảo sát định hướng"}
              </span>
            </div>
          </div>

          {onBackToDashboard && (
            <button
              type="button"
              onClick={() => setShowCancelSurveyDialog(true)}
              className="shrink-0 flex items-center gap-1 text-[11px] md:text-xs font-black uppercase tracking-wider text-[#070913] bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 hover:brightness-105 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer px-3 py-2 rounded-xl border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] whitespace-nowrap"
            >
              <X className="h-3 w-3 stroke-[3]" /> Hủy
            </button>
          )}
        </div>

        {/* The New Interactive Stepper */}
        <div className="w-full relative px-1 py-3 md:px-4 md:py-4">
          {/* Progress bar container (aligned to bubble centers) */}
          <div className="absolute top-7 left-7 right-7 h-[2px] bg-white/10 -translate-y-1/2 rounded-full overflow-hidden md:top-8 md:left-8 md:right-8">
            <div
              className="h-full bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 transition-all duration-500"
              style={{ width: `${((step - 1) / Math.max(1, SURVEY_STEP_COUNT - 1)) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between w-full relative z-10">
            {SURVEY_STEPS.map((s) => {
              const isCurrent = s === step;
              const isPast = s < step;
              const isLockedGuestSurveyStep = ORIENTATION_SURVEY_ENABLED && !isAuthenticated && !guestSurveyUnlocked && s === 4;
              const isClickable = !isLockedGuestSurveyStep;

              const stepNames = [
                "Thông tin",
                "Nghề nghiệp",
                "Portfolio",
                "Hình ảnh & Video",
                "Khảo sát AI"
              ];

              return (
                <button
                  type="button"
                  key={s}
                  disabled={!isClickable}
                  onClick={() => goToStep(s)}
                  className={cn(
                    "flex flex-col items-center transition-all duration-300 relative group focus:outline-none",
                    isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                  )}
                  style={{ width: `${100 / SURVEY_STEP_COUNT}%` }}
                >
                  {/* Step Bubble */}
                  <div className={cn(
                    "h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all duration-500 relative",
                    isCurrent
                      ? "bg-[#070913] border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-110"
                      : isPast
                        ? "bg-amber-400 border-amber-400 text-[#070913]"
                        : isClickable
                          ? "bg-[#070913] border-amber-400/50 text-amber-300/80 hover:border-amber-400 hover:text-amber-300 hover:scale-105 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                          : "bg-[#070913] border-white/10 text-slate-500"
                  )}>
                    {isLockedGuestSurveyStep ? <Lock className="h-3.5 w-3.5 stroke-[3]" /> : isPast ? <Check className="h-4 w-4 stroke-[3.5]" /> : s}

                    {/* Ring highlight animation on active step */}
                    {isCurrent && (
                      <span className="absolute -inset-1 rounded-full border border-amber-400/30 animate-pulse pointer-events-none" />
                    )}
                  </div>

                  {/* Step Labels */}
                  <span className={cn(
                    "mt-2 block w-full px-0.5 text-center text-[9px] font-bold uppercase leading-tight tracking-wider transition-all duration-300 md:text-[11px]",
                    isCurrent
                      ? "text-amber-300 scale-105 font-extrabold"
                      : isClickable
                        ? "text-slate-300 group-hover:text-amber-300"
                        : "text-slate-500"
                  )}>
                    {stepNames[s - 1]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-24 text-left md:pb-0">

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
            {/* Left: Avatar Dropzone */}
            <div className="md:col-span-4 flex flex-col items-center space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <span className="block text-[11px] md:text-xs text-slate-300 font-extrabold uppercase tracking-wider self-start">Ảnh Đại Diện</span>

              <div
                onClick={() => handleFileUploadClick("avatar")}
                className={cn(
                  "w-full aspect-square max-w-[200px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group",
                  mediaUploads.avatar
                    ? "border-emerald-400 bg-emerald-500/10"
                    : "border-white/20 bg-slate-900/60 hover:border-amber-400 hover:bg-slate-900"
                )}
              >
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleFileSelection("avatar", event)}
                />
                {avatarPreviewUrl && (
                  <img
                    src={avatarPreviewUrl}
                    alt="Xem trước ảnh đại diện"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {avatarPreviewUrl && <div className="absolute inset-0 bg-black/20" />}
                {!avatarPreviewUrl && (
                  <div className="relative z-10 text-center p-4">
                    <Upload className="h-8 w-8 text-slate-400 group-hover:text-amber-300 transition-colors mx-auto mb-2" />
                    <span className="block text-[11px] md:text-xs text-slate-100 font-extrabold">Tải ảnh lên</span>
                    <span className="block text-[9px] md:text-[10px] text-slate-400 mt-1 leading-normal">PNG, JPG tối đa 5MB</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] md:text-xs text-slate-400 text-center font-medium">Chọn ảnh rõ mặt, biểu cảm tự nhiên</p>
            </div>

            {/* Right: Inputs */}
            <div className="md:col-span-8 space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] md:text-xs text-slate-300 font-extrabold uppercase tracking-wider">Họ và tên <span className="text-amber-300">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 px-4 py-3 text-xs text-white focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all placeholder-slate-400 font-medium"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] md:text-xs text-slate-300 font-extrabold uppercase tracking-wider">Email liên hệ <span className="text-amber-300">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isAuthenticated}
                    required
                    className={cn(
                      "w-full rounded-xl border border-white/20 bg-slate-900/60 px-4 py-3 text-xs text-white transition-all placeholder-slate-400 font-medium",
                      isAuthenticated
                        ? "cursor-not-allowed opacity-70"
                        : "hover:border-white/40 focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none"
                    )}
                    placeholder="onstagevn-idol@gmail.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] md:text-xs text-slate-300 font-extrabold uppercase tracking-wider">Giới tính</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-4 py-3 text-xs font-medium text-white transition-all hover:border-white/40 focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none"
                  >
                    <option value="Nữ" className="bg-[#0e142e]">Nữ</option>
                    <option value="Nam" className="bg-[#0e142e]">Nam</option>
                    <option value="Khác" className="bg-[#0e142e]">Khác</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] md:text-xs text-slate-300 font-extrabold uppercase tracking-wider">Khu vực sinh sống</label>
                  <SurveyCityCombobox
                    value={formData.location}
                    options={cityOptions}
                    onChange={(location) => setFormData((prev) => ({ ...prev, location }))}
                  />
                </div>

                <div className="col-span-2 space-y-1 md:col-span-1">
                  <label className="text-[11px] md:text-xs text-slate-300 font-extrabold uppercase tracking-wider">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 px-4 py-3 text-xs text-white focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all placeholder-slate-400 font-medium"
                    placeholder="0912345678"
                  />
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="col-span-2">
                  <span className="block text-[11px] md:text-xs text-slate-300 font-extrabold uppercase tracking-wider">
                    Ngoại hình
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] md:text-xs text-slate-300 font-extrabold uppercase tracking-wider">Chiều cao (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 px-4 py-3 text-xs text-white focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all placeholder-slate-400 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] md:text-xs text-slate-300 font-extrabold uppercase tracking-wider">Cân nặng (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 px-4 py-3 text-xs text-white focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all placeholder-slate-400 font-medium"
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-[11px] md:text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Số đo 3 vòng (cm)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="relative">
                      <span className="absolute right-3 top-3 text-[11px] md:text-xs font-extrabold text-slate-400">V1</span>
                      <input
                        type="number"
                        name="bust"
                        value={formData.bust}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 pl-4 pr-8 py-3 text-xs text-white text-left focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute right-3 top-3 text-[11px] md:text-xs font-extrabold text-slate-400">V2</span>
                      <input
                        type="number"
                        name="waist"
                        value={formData.waist}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 pl-4 pr-8 py-3 text-xs text-white text-left focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute right-3 top-3 text-[11px] md:text-xs font-extrabold text-slate-400">V3</span>
                      <input
                        type="number"
                        name="hips"
                        value={formData.hips}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 pl-4 pr-8 py-3 text-xs text-white text-left focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PROFESSIONAL INFO */}
        {step === 2 && (
          <div className="animate-in fade-in duration-300 w-full max-w-5xl mx-auto">
            <div className="py-3 md:py-5 space-y-6">
              <h3 className="font-display text-base font-black uppercase tracking-wider text-slate-300">
                Thông tin nghề nghiệp
              </h3>

              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">
                    Phí booking (VD: "5.000.000đ/ngày" hoặc "thỏa thuận")
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="Nhập Phí booking dịch vụ của bạn..."
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 px-3.5 py-3 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:bg-[#0e122b] transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="space-y-3">
                    <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">
                      Loại hình Idol
                    </label>
                    <SurveyOptionCombobox
                      value=""
                      placeholder="Thêm loại hình Idol..."
                      options={talentTypeOptions.filter((type) => !formData.talentTypes.includes(type))}
                      onChange={handleAddTalentType}
                    />
                    <div className="flex flex-wrap gap-2 min-h-[52px] p-2.5 rounded-xl border border-white/20 bg-slate-900/60 text-left shadow-inner">
                      {formData.talentTypes.length === 0 ? (
                        <span className="inline-flex items-center gap-2 px-2 py-1 text-xs italic text-amber-300">
                          <AlertTriangle className="h-4 w-4 shrink-0" /> Chưa chọn loại hình nào
                        </span>
                      ) : (
                        formData.talentTypes.map((type) => (
                          <span key={type} className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#F0C56B] shadow-sm">
                            {type}
                            <button
                              type="button"
                              onClick={() => handleRemoveTalentType(type)}
                              className="text-slate-400 hover:text-rose-400 cursor-pointer focus:outline-none flex items-center justify-center"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">
                      Lĩnh vực nội dung / kỹ năng chuyên sâu
                    </label>
                    <SurveyOptionCombobox
                      value=""
                      placeholder="Thêm lĩnh vực / kỹ năng..."
                      options={flattenTalentPresetOptions(SPECIALTY_PRESET_GROUPS, formData.talentTypes).filter((skill) => !splitSkillValues(formData.skills).includes(skill))}
                      onChange={handleAddContentSkill}
                    />
                    <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-12">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(event) => setSkillInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleAddContentSkill(skillInput);
                          }
                        }}
                        placeholder="Nhập lĩnh vực khác nếu chưa có trong danh sách"
                        className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3.5 py-3 text-xs font-semibold text-white shadow-inner transition-all placeholder:text-slate-400 hover:border-white/40 focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none md:col-span-9"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddContentSkill(skillInput)}
                        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-gold px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-sm transition-all md:col-span-3"
                      >
                        <Plus className="h-4 w-4" /> Thêm
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[52px] p-2.5 rounded-xl border border-white/20 bg-slate-900/60 text-left shadow-inner">
                      {splitSkillValues(formData.skills).length === 0 ? (
                        <span className="inline-flex items-center gap-2 px-2 py-1 text-xs italic text-amber-300">
                          <AlertTriangle className="h-4 w-4 shrink-0" /> Chưa thêm lĩnh vực nào
                        </span>
                      ) : (
                        splitSkillValues(formData.skills).map((skill) => (
                          <span key={skill} className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#F0C56B] shadow-sm">
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveContentSkill(skill)}
                              className="text-slate-400 hover:text-rose-400 cursor-pointer focus:outline-none flex items-center justify-center"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">
                    Số năm kinh nghiệm
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={80}
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 px-3.5 py-3 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 focus:bg-[#0e122b] transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1.5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">
                    Nhập một số kinh nghiệm của bạn
                  </label>
                  <textarea
                    name="professionalExperience"
                    value={formData.professionalExperience}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Ví dụ: Đã từng tham gia chụp lookbook, livestream bán hàng, làm mẫu ảnh, tham dự sự kiện..."
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 px-3.5 py-3 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:bg-[#0e122b] transition-colors shadow-inner resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PORTFOLIO & SOCIAL LINKS */}
        {step === 3 && (
          <div className="animate-in fade-in duration-300 w-full max-w-5xl mx-auto">
            <div className="flex flex-col gap-6 py-3 text-left md:py-5">
              <h4 className="font-display text-base font-black uppercase tracking-wider text-slate-300">
                Portfolio & Mạng xã hội
              </h4>

              <div className="order-2 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-200 md:text-[10px]">
                  Chỉ số nổi bật
                </label>
                <div className="order-3 flex min-h-[52px] flex-wrap gap-2 rounded-xl border border-white/20 bg-slate-900/60 p-2.5 text-left shadow-inner">
                  {socialHighlights.length === 0 ? (
                    <span className="inline-flex items-center gap-2 px-2 py-1 text-xs italic text-amber-300">
                      <AlertTriangle className="h-4 w-4 shrink-0" /> Chưa thêm chỉ số nổi bật nào
                    </span>
                  ) : (
                    socialHighlights.map((highlight) => (
                      <span key={highlight} className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-sm">
                        {highlight}
                        <button
                          type="button"
                          onClick={() => setSocialHighlights((current) => current.filter((item) => item !== highlight))}
                          className="flex cursor-pointer items-center justify-center text-slate-400 hover:text-rose-400 focus:outline-none"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="order-1">
                  <SurveyOptionCombobox
                    value=""
                    placeholder="Thêm chỉ số / thành tựu nổi bật..."
                    options={flattenTalentPresetOptions(SOCIAL_HIGHLIGHT_PRESET_GROUPS, formData.talentTypes).filter((item) => !socialHighlights.includes(item))}
                    onChange={handleAddSocialHighlight}
                  />
                  <div className="mt-3 grid grid-cols-1 items-end gap-3 md:grid-cols-12">
                    <input
                      type="text"
                      value={socialHighlightInput}
                      onChange={(event) => setSocialHighlightInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleAddSocialHighlight(socialHighlightInput);
                        }
                      }}
                      placeholder="Nhập chỉ số hoặc thành tựu khác nếu chưa có trong danh sách"
                      className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3.5 py-3 text-xs font-semibold text-white shadow-inner transition-all placeholder:text-slate-400 hover:border-white/40 focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none md:col-span-9"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSocialHighlight(socialHighlightInput)}
                      className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-gold px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-sm transition-all md:col-span-3"
                    >
                      <Plus className="h-4 w-4" /> Thêm
                    </button>
                  </div>
                </div>


              </div>

              <div className="hidden" />

              <div className="order-1 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">

                {portfolioLinks.length === 0 ? (
                  <div className="order-2 inline-flex items-center gap-2 py-1 text-xs italic text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> Chưa có portfolio nào được thêm.
                  </div>
                ) : (
                  <div className="order-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {portfolioLinks.map((link, index) => (
                      <div key={`${link}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/20 bg-slate-900/60 px-3.5 py-2.5 shadow-inner">
                        <div className="min-w-0 flex-1">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-amber-400">Portfolio {index + 1}</span>
                          <a href={portfolioHref(link)} target="_blank" rel="noopener noreferrer" className="block truncate text-xs font-semibold text-slate-200 hover:text-white" title={link}>
                            {link.replace(/https?:\/\/(www\.)?/, "")}
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPortfolioLinks((current) => current.filter((item) => item !== link))}
                          className="cursor-pointer p-1 text-slate-400 transition-colors hover:text-red-400"
                          title="Xóa portfolio"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="order-1 grid grid-cols-1 items-end gap-3 md:grid-cols-12">
                  <div className="space-y-1.5 md:col-span-9">
                    <span className="block text-[9px] font-black uppercase tracking-wider text-slate-200 md:text-[10px]">Đường dẫn Portfolio</span>
                    <input
                      type="url"
                      value={portfolioLinkInput}
                      onChange={(event) => setPortfolioLinkInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleAddPortfolioLink();
                        }
                      }}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3.5 py-3 text-xs font-semibold text-white shadow-inner transition-all placeholder:text-slate-400 hover:border-white/40 focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none"
                    />

                  </div>
                  <div className="md:col-span-3">
                    <button
                      type="button"
                      onClick={handleAddPortfolioLink}
                      className="flex w-full shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-gold px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-sm transition-all hover:shadow-[0_0_15px_rgba(240,197,107,0.3)] active:scale-95"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden" />

              <div className="order-4 space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                {socialAccounts.length === 0 ? (
                  <div className="inline-flex items-center gap-2 py-1 text-xs italic text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> Chưa có liên kết mạng xã hội nào được thêm.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {socialAccounts.map((account, index) => (
                      <div key={`${account.platform}-${account.url}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/20 bg-slate-900/60 px-3.5 py-2.5 shadow-inner">
                        <div className="min-w-0 flex-1">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-amber-400">{account.platform}</span>
                          <a href={account.url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs font-semibold text-slate-200 hover:text-white" title={account.url}>
                            {account.url.replace(/https?:\/\/(www\.)?/, "")}
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSocialAccounts((current) => current.filter((_, idx) => idx !== index))}
                          className="cursor-pointer p-1 text-slate-400 transition-colors hover:text-red-400"
                          title="Xóa liên kết"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="order-3 grid grid-cols-1 items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-12">
                <div className="space-y-1.5 md:col-span-3">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-slate-200 md:text-[10px]">Chọn nền tảng</span>
                  <select
                    value={socialPlatform}
                    onChange={(event) => setSocialPlatform(event.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3.5 py-3 text-xs font-semibold text-white shadow-inner transition-all hover:border-white/40 focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none"
                  >
                    <option value="Tiktok" className="bg-[#0e142e]">Tiktok</option>
                    <option value="Facebook" className="bg-[#0e142e]">Facebook</option>
                    <option value="Instagram" className="bg-[#0e142e]">Instagram</option>
                    <option value="Thread" className="bg-[#0e142e]">Thread</option>
                    <option value="Linkedin" className="bg-[#0e142e]">Linkedin</option>
                  </select>
                </div>
                <div className="space-y-1.5 md:col-span-6">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-slate-200 md:text-[10px]">Đường dẫn (Link)</span>
                  <input
                    type="url"
                    value={socialLinkInput}
                    onChange={(event) => setSocialLinkInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddSocialAccount();
                      }
                    }}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3.5 py-3 text-xs font-semibold text-white shadow-inner transition-all placeholder:text-slate-400 hover:border-white/40 focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={handleAddSocialAccount}
                    className="flex w-full shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-gold px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-sm transition-all hover:shadow-[0_0_15px_rgba(240,197,107,0.3)] active:scale-95"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PHOTOS & VIDEOS */}
        {step === MEDIA_SURVEY_STEP && (
          <div className="animate-in fade-in duration-300 w-full max-w-5xl mx-auto space-y-6">
            <SurveyImageUploadBlock
              label="ẢNH BÌA"
              placeholder="TẢI ẢNH BÌA"
              previewUrl={coverPreviewUrl}
              aspectClassName="aspect-[16/9] w-full"
              onChange={(event) => handleSurveyImageSelection("cover", event)}
              onRemove={() => handleRemoveSurveyImage("cover")}
            />

            <SurveyImageUploadBlock
              label="ẢNH TOÀN THÂN"
              placeholder="TẢI ẢNH LÊN"
              previewUrl={fullBodyPreviewUrl}
              aspectClassName="aspect-[3/4] w-full"
              onChange={(event) => handleSurveyImageSelection("fullBody", event)}
              onRemove={() => handleRemoveSurveyImage("fullBody")}
            />

            <div className="rounded-2xl border border-[#151b2d] bg-[#08090f] p-6 space-y-6">
              <div className="border-b border-[#151b2d] pb-3 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="h-4.5 w-4.5 text-[#f4c430]" /> BỘ SƯU TẬP
                  </h3>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                    HIỂN THỊ BỘ SƯU TẬP ẢNH, VIDEO CỦA IDOL
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="block text-[11px] text-[#f4c430] font-black uppercase tracking-wider">
                  ({portfolioPhotoFiles.length}/8 ẢNH)
                </span>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {portfolioPhotoFiles.map((img) => (
                    <div key={img.id} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 group shadow-md">
                      <img
                        src={img.previewUrl}
                        alt={img.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#08090f]/70 via-transparent to-transparent pointer-events-none" />

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemovePortfolioPhoto(img.id);
                        }}
                        className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-slate-950/80 text-white shadow-lg transition-all hover:border-rose-400/50 hover:bg-rose-500 hover:text-white active:scale-95"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="absolute bottom-3 right-3 z-20">
                        <label className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F0C56B] hover:brightness-110 text-slate-950 active:scale-95 cursor-pointer shadow-lg transition-all border border-slate-950/20">
                          <Camera className="h-3.5 w-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={portfolioPhotoFiles.length >= 8}
                            onChange={handlePortfolioPhotoSelection}
                          />
                        </label>
                      </div>
                    </div>
                  ))}

                  {portfolioPhotoFiles.length < 8 && (
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950/70 border border-dashed border-white/10 hover:border-amber-400/70 transition-colors">
                      <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-slate-500 hover:text-amber-400 transition-colors">
                        <Upload className="h-7 w-7" />
                        <span className="text-[10px] font-black uppercase tracking-wider">TẢI ẢNH LÊN</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handlePortfolioPhotoSelection}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[#151b2d] pt-5 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="block text-[11px] text-[#f4c430] font-black uppercase tracking-wider">
                    ({portfolioVideoFiles.length + portfolioVideoLinks.length}/4 VIDEO)
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    GẮN LINK HOẶC TẢI TRỰC TIẾP TỪ THIẾT BỊ
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {portfolioVideoFiles.map((video) => (
                    <div key={video.id} className="relative aspect-[9/16] overflow-hidden rounded-xl border border-white/5 bg-slate-950 shadow-md group">
                      <video
                        src={video.previewUrl}
                        controls
                        preload="metadata"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08090f]/70 via-transparent to-transparent" />
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemovePortfolioVideo(video.id);
                        }}
                        className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-slate-950/80 text-white shadow-lg transition-all hover:border-rose-400/50 hover:bg-rose-500 hover:text-white active:scale-95"
                        title="Xóa video"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {portfolioVideoLinks.map((video) => (
                    <div key={video.id} className="relative aspect-[9/16] overflow-hidden rounded-xl border border-white/5 bg-slate-950 shadow-md group">
                      {isDirectVideoUrl(video.url) ? (
                        <video
                          src={video.url}
                          controls
                          preload="metadata"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <a href={video.url} target="_blank" rel="noreferrer" className="block h-full w-full bg-slate-950">
                          <img
                            src="/video_thumb.png"
                            alt="Video thumbnail"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </a>
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08090f]/70 via-transparent to-transparent" />
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="absolute left-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-slate-950/80 text-white shadow-lg transition-all hover:border-amber-400/50 hover:text-amber-300 active:scale-95"
                        title="Mở video"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemovePortfolioVideoLink(video.id);
                        }}
                        className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-slate-950/80 text-white shadow-lg transition-all hover:border-rose-400/50 hover:bg-rose-500 hover:text-white active:scale-95"
                        title="Xóa video"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {portfolioVideoFiles.length + portfolioVideoLinks.length < 4 && (
                    <label className="flex aspect-[9/16] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#F0D7D3] bg-[#FFF0EE] text-[#8F0709] transition-colors hover:border-[#8F0709] dark:border-dashed dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-500 dark:hover:border-amber-400/70 dark:hover:text-amber-400">
                      <Upload className="h-7 w-7 text-[#8F0709] dark:text-slate-500" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#8F0709] dark:text-slate-500">TẢI VIDEO</span>
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska"
                        multiple
                        className="hidden"
                        onChange={handlePortfolioVideoSelection}
                      />
                    </label>
                  )}
                </div>

                {portfolioVideoFiles.length + portfolioVideoLinks.length < 4 && (
                  <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-12">
                    <div className="space-y-1.5 md:col-span-10">
                      <label className="block text-[9px] font-black uppercase tracking-wider text-[#574D54] dark:text-slate-400">
                        ĐƯỜNG DẪN VIDEO
                      </label>
                      <div className="relative">
                        <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F0709] dark:text-slate-500" />
                        <input
                          type="url"
                          value={videoLinkInput}
                          onChange={(event) => setVideoLinkInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleAddSurveyVideoLink();
                            }
                          }}
                          placeholder="https://..."
                          className="h-10 w-full rounded-xl border border-[#F0D7D3] bg-white pl-9 pr-3.5 text-xs font-semibold text-[#191116] shadow-sm outline-none transition-colors placeholder:text-[#9A8B88] focus:border-[#8F0709] dark:border-white/20 dark:bg-[#060918] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddSurveyVideoLink}
                        className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white px-4 text-[10px] font-black uppercase tracking-wider text-white shadow-md transition-all hover:brightness-110 active:scale-95 dark:bg-gradient-gold dark:!text-slate-950 dark:text-slate-950"
                      >
                        <Plus className="h-4 w-4" />
                        THÊM LINK
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SOCIAL & PORTFOLIO (Left Socials, Right Upload Zone) */}
        {false && step === 3 && (
          <div className="animate-in fade-in duration-300">
            {/* Left: Social Media Profiles and Followers */}
            <div className="space-y-4 w-full max-w-xl mx-auto">
              <div className="space-y-1">
                <label className="text-[11px] md:text-xs text-slate-300 font-extrabold uppercase tracking-wider">Tổng số lượng Followers</label>
                <div className="relative">
                  <input
                    type="text"
                    value={getTotalFollowers().toLocaleString("vi-VN")}
                    disabled
                    className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-400 font-black focus:outline-none cursor-not-allowed opacity-95"
                  />
                  <span className="absolute right-3.5 top-3 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="block text-[11px] md:text-xs text-slate-300 font-extrabold uppercase tracking-wider">Liên kết nền tảng & Số lượng Followers</span>

                {/* TikTok Row */}
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-7 relative min-w-0">
                    <span className="absolute left-3 top-3 text-slate-400">
                      <TiktokIcon className="h-3.5 w-3.5 text-slate-300" />
                    </span>
                    <input
                      type="url"
                      name="tiktokUrl"
                      value={formData.tiktokUrl}
                      onChange={handleInputChange}
                      className="w-full min-w-0 rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 pl-8 pr-3 py-2.5 text-[11px] md:text-xs text-white focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all placeholder-slate-400 font-medium"
                      placeholder="TikTok Profile URL"
                    />
                  </div>
                  <div className="col-span-5 relative min-w-0">
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[7px] font-bold text-slate-400 uppercase hidden md:inline-block">Followers</span>
                    <input
                      type="number"
                      name="tiktokFollowers"
                      value={formData.tiktokFollowers}
                      onChange={handleInputChange}
                      className="w-full min-w-0 rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 pl-2.5 pr-3 md:pr-14 py-2.5 text-[11px] md:text-xs text-white focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all font-bold"
                      placeholder="Điền số nguyên"
                      min="0"
                    />
                  </div>
                </div>

                {/* Instagram Row */}
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-7 relative min-w-0">
                    <span className="absolute left-3 top-3 text-slate-400">
                      <InstagramIcon className="h-3.5 w-3.5 text-slate-300" />
                    </span>
                    <input
                      type="url"
                      name="instagramUrl"
                      value={formData.instagramUrl}
                      onChange={handleInputChange}
                      className="w-full min-w-0 rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 pl-8 pr-3 py-2.5 text-[11px] md:text-xs text-white focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all placeholder-slate-400 font-medium"
                      placeholder="Instagram Profile URL"
                    />
                  </div>
                  <div className="col-span-5 relative min-w-0">
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[7px] font-bold text-slate-400 uppercase hidden md:inline-block">Followers</span>
                    <input
                      type="number"
                      name="instagramFollowers"
                      value={formData.instagramFollowers}
                      onChange={handleInputChange}
                      className="w-full min-w-0 rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 pl-2.5 pr-3 md:pr-14 py-2.5 text-[11px] md:text-xs text-white focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all font-bold"
                      placeholder="Điền số nguyên"
                      min="0"
                    />
                  </div>
                </div>

                {/* Facebook Row */}
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-7 relative min-w-0">
                    <span className="absolute left-3 top-3 text-slate-400">
                      <FacebookIcon className="h-3.5 w-3.5 text-slate-300" />
                    </span>
                    <input
                      type="url"
                      name="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={handleInputChange}
                      className="w-full min-w-0 rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 pl-8 pr-3 py-2.5 text-[11px] md:text-xs text-white focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all placeholder-slate-400 font-medium"
                      placeholder="Facebook Profile URL"
                    />
                  </div>
                  <div className="col-span-5 relative min-w-0">
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[7px] font-bold text-slate-400 uppercase hidden md:inline-block">Followers</span>
                    <input
                      type="number"
                      name="facebookFollowers"
                      value={formData.facebookFollowers}
                      onChange={handleInputChange}
                      className="w-full min-w-0 rounded-xl border border-white/20 bg-[#070913]/60 hover:border-white/40 pl-2.5 pr-3 md:pr-14 py-2.5 text-[11px] md:text-xs text-white focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all font-bold"
                      placeholder="Điền số nguyên"
                      min="0"
                    />
                  </div>
                </div>

                {/* YouTube Row */}
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-7 relative min-w-0">
                    <span className="absolute left-3 top-3 text-slate-400">
                      <YoutubeIcon className="h-3.5 w-3.5 text-slate-300" />
                    </span>
                    <input
                      type="url"
                      name="youtubeUrl"
                      value={formData.youtubeUrl}
                      onChange={handleInputChange}
                      className="w-full min-w-0 rounded-xl border border-white/20 bg-[#070913]/60 hover:border-white/40 pl-8 pr-3 py-2.5 text-[11px] md:text-xs text-white focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all placeholder-slate-400 font-medium"
                      placeholder="YouTube Channel URL"
                    />
                  </div>
                  <div className="col-span-5 relative min-w-0">
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[7px] font-bold text-slate-400 uppercase hidden md:inline-block">Followers</span>
                    <input
                      type="number"
                      name="youtubeFollowers"
                      value={formData.youtubeFollowers}
                      onChange={handleInputChange}
                      className="w-full min-w-0 rounded-xl border border-white/20 bg-slate-900/60 hover:border-white/40 pl-2.5 pr-3 md:pr-14 py-2.5 text-[11px] md:text-xs text-white focus:border-amber-400 focus:bg-[#0e122b] focus:outline-none transition-all font-bold"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 4: ORIENTATION SURVEY (Single Question Card UI, zero scroll) */}
        {ORIENTATION_SURVEY_ENABLED && step === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto py-2 animate-in fade-in duration-300">
            {/* Left Column: The Question Block */}
            <div className="lg:col-span-8 space-y-6 w-full">
              {/* Header: Question indicator & Inner survey progress */}
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <div>
                  <span className="text-[11px] md:text-xs font-black text-amber-300 uppercase tracking-widest">
                    Định Hướng AI
                  </span>
                  <h4 className="text-[13px] font-black text-white mt-0.5">
                    Câu hỏi {activeSurveyQIdx + 1} / {SURVEY_QUESTIONS.length}
                  </h4>
                </div>
                <div className="text-[11px] md:text-xs font-extrabold text-slate-200 bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-full">
                  Đã trả lời: {Object.keys(surveyAnswers).length} / {SURVEY_QUESTIONS.length}
                </div>
              </div>

              {/* Centered Question Box */}
              <div className="rounded-2xl border border-white/10 bg-[#0c0f24]/50 p-6 space-y-5 text-center">
                <span className="inline-block text-[11px] md:text-xs font-extrabold text-amber-300/80 uppercase tracking-wider">Năng lực ứng xử & Định hướng</span>
                <h3 className="font-display font-extrabold text-base md:text-lg text-white leading-relaxed max-w-xl mx-auto">
                  {activeQuestion.question}
                </h3>

                {/* Stacked Options */}
                <div className="grid grid-cols-1 gap-2.5 max-w-xl mx-auto pt-2">
                  {activeQuestion.options.map((opt, oIdx) => {
                    const isSelected = surveyAnswers[activeQuestion.id] === oIdx;
                    return (
                      <button
                        type="button"
                        key={oIdx}
                        onClick={() => handleSurveySelect(activeQuestion.id, oIdx)}
                        className={cn(
                          "flex items-center gap-3.5 rounded-xl border px-5 py-3.5 text-xs text-left cursor-pointer transition-all duration-300 w-full",
                          isSelected
                            ? "border-amber-400 bg-amber-400/20 text-amber-200 font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                            : "border-white/10 bg-[#070913]/60 hover:bg-white/5 hover:border-white/20 text-slate-200 hover:text-white"
                        )}
                      >
                        <div className={cn(
                          "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                          isSelected ? "border-amber-400 bg-amber-400/10" : "border-slate-500"
                        )}>
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                        </div>
                        <span className="leading-tight">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inner survey navigation */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => {
                    if (activeSurveyQIdx > 0) {
                      setActiveSurveyQIdx(prev => prev - 1);
                      scrollSurveyToTop();
                    } else {
                      // Go back to Step 3
                      goToStep(3);
                    }
                  }}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-lg border border-white/20 px-4 text-[11px] md:text-xs font-bold text-slate-200 hover:text-amber-300 hover:border-amber-400/50 hover:bg-white/5 transition-all gap-1 cursor-pointer",
                    isAnalyzing && "cursor-not-allowed opacity-40"
                  )}
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Quay Lại
                </button>

                {activeSurveyQIdx === SURVEY_QUESTIONS.length - 1 ? (
                  // Câu cuối – nút "Hoàn Thành"
                  <button
                    type="submit"
                    disabled={surveyAnswers[activeQuestion.id] === undefined || !isStepValid() || isAnalyzing}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-lg px-5 text-[11px] md:text-xs font-black transition-all gap-1.5 cursor-pointer",
                      (surveyAnswers[activeQuestion.id] !== undefined && isStepValid() && !isAnalyzing)
                        ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 hover:brightness-110 shadow-[0_0_14px_rgba(52,211,153,0.35)] animate-pulse"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-40"
                    )}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang phân tích...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Hoàn Thành
                      </>
                    )}
                  </button>
                ) : (
                  // Các câu khác – nút "Tiếp Theo"
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSurveyQIdx(prev => prev + 1);
                      scrollSurveyToTop();
                    }}
                    disabled={surveyAnswers[activeQuestion.id] === undefined || isAnalyzing}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-lg px-4 text-[11px] md:text-xs font-black transition-all gap-1 cursor-pointer",
                      (surveyAnswers[activeQuestion.id] !== undefined && !isAnalyzing)
                        ? "bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 hover:brightness-110 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-40"
                    )}
                  >
                    Tiếp Theo <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Progress Grid (Tiến độ trả lời) */}
            <div className="lg:col-span-4 w-full rounded-2xl border border-white/10 bg-[#0c0f24]/60 p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/10 text-left">
                <h4 className="text-xs md:text-[13px] font-black text-slate-200 uppercase tracking-wider">
                  Tiến độ trả lời
                </h4>
                <span className="text-[11px] md:text-xs font-black text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  {Object.keys(surveyAnswers).length}/{SURVEY_QUESTIONS.length}
                </span>
              </div>

              {/* Progress Grid */}
              <div className="grid grid-cols-5 gap-2 pt-2">
                {SURVEY_QUESTIONS.map((q, qIdx) => {
                  const isAnswered = surveyAnswers[q.id] !== undefined;
                  const isActive = qIdx === activeSurveyQIdx;

                  return (
                    <button
                      type="button"
                      key={q.id}
                      disabled={isAnalyzing}
                      onClick={() => {
                        setActiveSurveyQIdx(qIdx);
                        scrollSurveyToTop();
                      }}
                      className={cn(
                        "aspect-square rounded-xl text-xs md:text-[13px] font-bold flex items-center justify-center border transition-all duration-300 cursor-pointer",
                        isActive
                          ? "border-transparent bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-105"
                          : isAnswered
                            ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-200 font-extrabold hover:border-emerald-400 hover:bg-emerald-500/30"
                            : "border-white/10 bg-[#070913]/40 text-slate-300 hover:border-white/20 hover:text-white",
                        isAnalyzing && "cursor-not-allowed opacity-40 pointer-events-none"
                      )}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] md:text-xs text-slate-300 leading-normal space-y-2 text-left font-medium">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/40 inline-block shrink-0" />
                  <span>Đã trả lời</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-gradient-to-r from-amber-300 to-yellow-500 inline-block shrink-0" />
                  <span>Đang trả lời</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-[#070913]/40 border border-white/10 inline-block shrink-0" />
                  <span>Chưa trả lời</span>
                </div>
                <div className="text-[10px] md:text-[11px] italic text-slate-400 mt-2 block leading-relaxed">
                  * Bạn có thể bấm vào số câu bất kỳ để quay lại hoặc chuyển nhanh tới câu hỏi đó.
                </div>
              </div>
            </div>
          </div>
        )}

        {submitError && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-xs font-bold leading-relaxed text-rose-100">
            {submitError}
          </div>
        )}

        {/* Global Navigation Action Bar (Except Step 4 which has its own) */}
        {step <= SURVEY_STEP_COUNT && (
          <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-white/10 bg-[#070913]/98 px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-4 shadow-[0_-14px_30px_rgba(0,0,0,0.55)] backdrop-blur-xl md:static md:border-t md:bg-transparent md:px-0 md:pb-0 md:pt-5 md:shadow-none md:backdrop-blur-none">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex h-11 flex-1 items-center justify-center rounded-xl border border-white/20 bg-transparent font-display text-xs md:text-[13px] font-bold text-slate-200 hover:text-amber-300 hover:border-amber-400/50 hover:bg-white/5 transition-all cursor-pointer"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Quay Lại
              </button>
            )}

            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid() || isCreatingGuestAccount}
              className={cn(
                "flex h-11 flex-1 items-center justify-center rounded-xl font-display text-xs md:text-[13px] font-black transition-all gap-1.5 cursor-pointer shadow-md",
                isStepValid() && !isCreatingGuestAccount
                  ? "bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 hover:brightness-110"
                  : "bg-[#131936] text-slate-450 border border-white/10 cursor-not-allowed"
              )}
            >
              {isCreatingGuestAccount ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang tạo tài khoản...
                </>
              ) : (
                <>
                  {step === SURVEY_STEP_COUNT ? "Hoàn tất" : "Tiếp tục"} <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 4 orientation survey is currently disabled by ORIENTATION_SURVEY_ENABLED. */}

      </form>

      {showGuestAccountDialog && (
        <Step3Dialog
          email={formData.email}
          error={guestAccountError}
          isLoginLoading={isCreatingGuestAccount}
          showContinueSurvey={ORIENTATION_SURVEY_ENABLED && !isSubmitted}
          onClose={() => setShowGuestAccountDialog(false)}
          onContinueSurvey={handleContinueGuestSurvey}
          onLoginNow={handleGuestDialogLogin}
        />
      )}

      {showCancelSurveyDialog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-amber-400/30 bg-[#090a14] p-6 text-left shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="mb-6 flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="pt-0.5">
                <h3 className="font-display text-base font-black uppercase tracking-wider text-white">
                  Dừng hoàn thiện hồ sơ?
                </h3>
                <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-300">
                  Các thông tin hồ sơ chưa hoàn tất sẽ không được lưu. Bạn có muốn dừng lại không?
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setShowCancelSurveyDialog(false)}
                className="flex h-12 w-full items-center justify-center rounded-full border border-white/20 bg-transparent text-xs font-black uppercase tracking-wider text-slate-100 transition-all hover:bg-white/10 active:scale-98 cursor-pointer"
              >
                Tiếp tục điền hồ sơ
              </button>
              <button
                type="button"
                onClick={handleStopSurvey}
                className="flex h-12 w-full items-center justify-center rounded-full bg-[#F5C400] text-xs font-black uppercase tracking-wider text-slate-950 transition-all hover:brightness-110 active:scale-98 cursor-pointer shadow-md"
              >
                Dừng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

