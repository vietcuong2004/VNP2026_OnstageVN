"use client";

import React, { useEffect, useState } from "react";
import {
  Edit3, ShieldCheck, CheckCircle, Upload, Video, Trash2, ChevronDown, ChevronUp,
  X, Plus
} from "lucide-react";
import { cn, getSocialHandle } from "@/lib/utils";
import { getAuthToken } from "@/lib/api-client";
import { persistTalentProfile, ensureTalentProfile, saveTalentProfile, submitTalentSurvey, uploadTalentPhoto } from "@/lib/talent-api";
import { normalizeBackendAssetUrl } from "@/lib/avatar";
import ProgressBar from "@/components/ui/ProgressBar";
import {
  SOCIAL_HIGHLIGHT_PRESET_GROUPS,
  TALENT_TYPE_VALUES,
  normalizeTalentTypeLabel,
  normalizeTalentTypeList,
} from "@/components/ui/ComboboxOptionValues";
import { SPECIALTY_PRESET_GROUPS, flattenTalentPresetOptions } from "@/lib/talent-profile-presets";
import { CityOption, useCityOptions } from "@/hooks/use-location-options";

const convertToInputDate = (dateStr: string) => {
  if (!dateStr) return "";
  const dateOnly = dateStr.split(/[T ]/)[0];
  if (dateOnly.includes("/")) {
    const parts = dateOnly.split("/");
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  return dateOnly;
};

const convertToDisplayDate = (dateStr: string) => {
  if (!dateStr) return "";
  const dateOnly = dateStr.split(/[T ]/)[0];
  if (dateOnly.includes("-")) {
    const parts = dateOnly.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    }
  }
  return dateOnly;
};

const talentTypeOptions = TALENT_TYPE_VALUES;

const availableLanguages = [
  "Tiếng Việt",
  "Tiếng Anh",
  "Tiếng Trung",
  "Tiếng Hàn",
  "Tiếng Nhật",
  "Tiếng Pháp",
  "Tiếng Đức",
  "Tiếng Nga",
  "Tiếng Tây Ban Nha"
];



function normalizePortfolioLinks(rawLinks: unknown): string[] {
  const links = Array.isArray(rawLinks)
    ? rawLinks
    : String(rawLinks || "").split(/[\n,;]+/);

  return Array.from(new Set(
    links
      .map((link) => String(link).trim())
      .filter(Boolean)
  ));
}

function portfolioHref(link: string): string {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}


interface CitySelectProps {
  label: string;
  value: string;
  options: CityOption[];
  onChange: (value: string) => void;
}

function CitySelect({ label, value, options, onChange }: CitySelectProps) {
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const filteredOptions = React.useMemo(() => {
    const keyword = searchInput.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((city) => city.label.toLowerCase().includes(keyword));
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
    <div ref={dropdownRef} className="space-y-1.5 relative text-left">
      <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] mb-1.5 dark:text-slate-200">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#F0D7D3] bg-white px-3.5 py-2.5 text-left text-xs font-semibold text-[#191116] outline-none transition-all hover:border-[#8F0709] focus:border-[#8F0709] shadow-sm dark:border-white/20 dark:bg-[#060918] dark:text-white dark:hover:border-amber-400"
        >
          <span className="truncate">{options.find((city) => city.value === value || city.label === value)?.label || value || `Chọn ${label.toLowerCase()}...`}</span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#8F0709] transition-transform dark:text-amber-400", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-[100] mt-1.5 rounded-2xl border border-[#F0D7D3] bg-white p-2.5 shadow-xl max-h-[220px] flex flex-col dark:border-white/25 dark:bg-[#0e142e]">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm thành phố..."
              className="w-full rounded-xl border border-[#F0D7D3] bg-white py-2 px-3 mb-2 text-xs text-[#191116] outline-none placeholder:text-[#9A8B88] focus:border-[#8F0709] dark:border-white/20 dark:bg-[#060918] dark:text-white dark:placeholder:text-slate-400 dark:focus:border-amber-400"
              autoFocus
            />

            <div className="overflow-y-auto flex-1 space-y-1 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-[#9A8B88] italic dark:text-slate-400">Không tìm thấy kết quả</div>
              ) : (
                filteredOptions.map((city) => {
                  const isSelected = city.value === value || city.label === value;
                  return (
                    <button
                      key={city.id ?? city.value}
                      type="button"
                      onClick={() => {
                        onChange(city.value);
                        setSearchInput("");
                        setIsOpen(false);
                      }}
                      className={cn(
                        "block w-full px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors hover:bg-[#FFF0EE] hover:text-[#8F0709] dark:hover:bg-white/10",
                        isSelected ? "bg-[#FFF0EE] text-[#8F0709] font-bold border border-[#F0D7D3] dark:bg-amber-400/20 dark:text-amber-300 dark:border-amber-400/30" : "text-[#191116] dark:text-slate-200"
                      )}
                    >
                      {city.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SocialAccountsSectionProps {
  socialAccounts: Array<{ platform: string; url: string; followers_count?: number }>;
  socialPlatform: string;
  setSocialPlatform: (val: any) => void;
  socialLink: string;
  setSocialLink: (val: string) => void;
  onAddAccount: () => void;
  onRemoveAccount: (index: number) => void;
}

export function SocialAccountsSection({
  socialAccounts,
  socialPlatform,
  setSocialPlatform,
  socialLink,
  setSocialLink,
  onAddAccount,
  onRemoveAccount,
}: SocialAccountsSectionProps) {
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#F0D7D3] hover:border-[#8F0709]/30 transition-all space-y-4 text-left shadow-sm dark:bg-[#0e142e]/80 dark:border-white/10">
      <h4 className="font-bold text-xs md:text-sm text-[#8F0709] uppercase tracking-widest border-b border-[#F0D7D3] pb-2.5 mb-3 flex items-center gap-2 dark:text-[#F0C56B] dark:border-white/10">
        Mạng xã hội
      </h4>

      {/* Input to add new account */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="space-y-1.5 md:col-span-3">
          <span className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Chọn nền tảng</span>
          <select
            value={socialPlatform}
            onChange={(e) => setSocialPlatform(e.target.value)}
            className="w-full h-[40px] bg-white border border-[#F0D7D3] rounded-xl px-3 text-[#191116] focus:outline-none focus:border-[#8F0709] transition-colors shadow-sm dark:bg-[#060918] dark:border-white/20 dark:text-white dark:focus:border-amber-400 cursor-pointer"
          >
            <option value="Tiktok" className="bg-white text-[#191116] dark:bg-[#0e142e] dark:text-white">Tiktok</option>
            <option value="Facebook" className="bg-white text-[#191116] dark:bg-[#0e142e] dark:text-white">Facebook</option>
            <option value="Instagram" className="bg-white text-[#191116] dark:bg-[#0e142e] dark:text-white">Instagram</option>
            <option value="Youtube" className="bg-white text-[#191116] dark:bg-[#0e142e] dark:text-white">Youtube</option>
            <option value="Thread" className="bg-white text-[#191116] dark:bg-[#0e142e] dark:text-white">Thread</option>
          </select>
        </div>

        <div className="space-y-1.5 md:col-span-7">
          <span className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Đường dẫn (Link)</span>
          <input
            type="url"
            value={socialLink}
            onChange={(e) => setSocialLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddAccount();
              }
            }}
            placeholder="https://..."
            className="w-full h-[40px] bg-white border border-[#F0D7D3] rounded-xl px-3.5 text-[#191116] placeholder:text-[#9A8B88] focus:outline-none focus:border-[#8F0709] transition-colors shadow-sm dark:bg-[#060918] dark:border-white/20 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-amber-400"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={onAddAccount}
            style={{ color: "#ffffff" }}
            className="light-force-white w-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider h-[40px] flex items-center justify-center cursor-pointer transition-all shadow-md shrink-0"
          >
            Thêm
          </button>
        </div>
      </div>

      {/* List of added accounts */}
      <div className="space-y-2">
        {socialAccounts.length === 0 ? (
          <div className="text-[#9A8B88] italic text-xs py-1 dark:text-slate-400">Chưa có liên kết mạng xã hội nào được thêm.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {socialAccounts.map((account, index) => (
              <div key={index} className="flex items-center justify-between gap-3 bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 shadow-sm dark:bg-[#060918] dark:border-white/15">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black text-[#8F0709] uppercase tracking-wider block dark:text-amber-400">
                    {account.platform}
                  </span>
                  <a
                    href={account.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#191116] hover:text-[#8F0709] truncate block font-semibold dark:text-slate-200 dark:hover:text-white"
                    title={account.url}
                  >
                    {getSocialHandle(account.url, account.platform)}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveAccount(index)}
                  className="text-[#9A8B88] hover:text-red-600 p-1 cursor-pointer transition-colors dark:text-slate-400 dark:hover:text-red-400"
                  title="Xóa liên kết"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface EditInfoTabProps {
  profile: any;
  setProfile: (profile: any) => void;
  addToast: (message: string, type?: "success" | "info") => void;
  setActiveTab?: (tab: any) => void;
}

export default function EditInfoTab({
  profile,
  setProfile,
  addToast,
  setActiveTab
}: EditInfoTabProps) {
  const cityOptions = useCityOptions();

  // Identity card (CCCD) upload states
  const [cccdFront, setCccdFront] = useState<string | null>(null);
  const [cccdBack, setCccdBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"unverified" | "pending" | "verified">("unverified");
  const [lifestyleServices, setLifestyleServices] = useState<any[]>([]);
  const [isLifestyleExpanded, setIsLifestyleExpanded] = useState(false);
  const [languageInput, setLanguageInput] = useState("");
  const [socialPlatform, setSocialPlatform] = useState<"Tiktok" | "Facebook" | "Instagram" | "Thread" | "Youtube">("Tiktok");
  const [socialLink, setSocialLink] = useState("");
  const [socialAccounts, setSocialAccounts] = useState<{ platform: string; url: string }[]>([]);
  const [portfolioLink, setPortfolioLink] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([]);
  const [socialHighlightInput, setSocialHighlightInput] = useState("");
  const [contentSkillInput, setContentSkillInput] = useState("");

  // Form states for profile editing
  const [editForm, setEditForm] = useState<any>({
    name: "",
    email: "",
    phone: "",
    height: "",
    weight: "",
    bust: "",
    waist: "",
    hips: "",
    location: "",
    hometown: "",
    education: "",
    bio: "",
    experienceText: "",
    languages: [],
    rateCard: {},
    plasticSurgery: "false",
    maritalStatus: "",
    gender: "Nữ",
    dob: "",
    skinColor: "",
    hairColor: "",
    tattoo: "Không",
    tattooDesc: "",
    experience: "",
    talentTypes: [],
    specialSkills: [],
    socialHighlights: [],
    price: "",
    portfolio_url: ""
  });

  const handleAddSkill = (skill: string) => {
    const nextSkill = normalizeTalentTypeLabel(skill);
    if (nextSkill && !editForm.talentTypes.includes(nextSkill)) {
      setEditForm((prev: any) => ({
        ...prev,
        talentTypes: normalizeTalentTypeList([...prev.talentTypes, nextSkill])
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const normalizedSkill = normalizeTalentTypeLabel(skillToRemove);
    setEditForm((prev: any) => ({
      ...prev,
      talentTypes: prev.talentTypes.filter((s: string) => normalizeTalentTypeLabel(s) !== normalizedSkill)
    }));
  };

  const handleAddContentSkill = (skill: string) => {
    const nextSkill = skill.trim();
    if (!nextSkill || editForm.specialSkills.includes(nextSkill)) return;

    setEditForm((prev: any) => ({
      ...prev,
      specialSkills: [...prev.specialSkills, nextSkill]
    }));
    setContentSkillInput("");
  };

  const handleRemoveContentSkill = (skillToRemove: string) => {
    setEditForm((prev: any) => ({
      ...prev,
      specialSkills: prev.specialSkills.filter((s: string) => s !== skillToRemove)
    }));
  };

  const handleAddSocialHighlight = (highlight: string) => {
    const nextHighlight = highlight.trim();
    if (!nextHighlight || editForm.socialHighlights.includes(nextHighlight)) return;

    setEditForm((prev: any) => ({
      ...prev,
      socialHighlights: [...prev.socialHighlights, nextHighlight]
    }));
    setSocialHighlightInput("");
  };

  const handleRemoveSocialHighlight = (highlightToRemove: string) => {
    setEditForm((prev: any) => ({
      ...prev,
      socialHighlights: prev.socialHighlights.filter((s: string) => s !== highlightToRemove)
    }));
  };

  const handleAddLanguage = (lang: string) => {
    const nextLang = lang.trim();
    if (!nextLang || editForm.languages.includes(nextLang)) return;

    setEditForm((prev: any) => ({
      ...prev,
      languages: [...prev.languages, nextLang]
    }));
    setLanguageInput("");
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setEditForm((prev: any) => ({
      ...prev,
      languages: prev.languages.filter((l: string) => l !== langToRemove)
    }));
  };

  const handleAddPortfolioLink = () => {
    const rawLink = portfolioLink.trim();
    if (!rawLink) return;

    const nextLink = portfolioHref(rawLink);
    setPortfolioLinks(prev => Array.from(new Set([...prev, nextLink])));
    setPortfolioLink("");
  };

  const handleRemovePortfolioLink = (linkToRemove: string) => {
    setPortfolioLinks(prev => prev.filter(link => link !== linkToRemove));
  };

  const handlePriceChange = (val: string, oldVal: string) => {
    if (!val) {
      setEditForm((prev: any) => ({ ...prev, price: "" }));
      return;
    }

    // Check if the input is meant to be a formatted number:
    // It contains only digits, dots, spaces, and the word "ngày" or "/"
    const cleanText = val.replace(/[0-9.\s/ngàyđđ]/gi, "");
    const isNumeric = cleanText === "";

    if (!isNumeric) {
      setEditForm((prev: any) => ({ ...prev, price: val }));
    } else {
      const oldDigits = oldVal.replace(/[^\d]/g, "");
      let nextDigits = val.replace(/[^\d]/g, "");

      if (oldDigits && nextDigits === oldDigits && val.length < oldVal.length) {
        nextDigits = oldDigits.slice(0, -1);
      }

      if (nextDigits) {
        const formatted = `${Number(nextDigits).toLocaleString("vi-VN")}/ngày`;
        setEditForm((prev: any) => ({ ...prev, price: formatted }));
      } else {
        setEditForm((prev: any) => ({ ...prev, price: "" }));
      }
    }
  };

  // Video upload state simulator
  const [videoForm, setVideoForm] = useState({
    hasUploadedIntro: false,
    hasUploadedCatwalk: false,
    hasUploadedMC: false
  });

  // Upload simulation states
  const [uploadingState, setUploadingState] = useState<{
    [key: string]: {
      progress: number;
      fileName: string;
      status: "uploading" | "done" | "error" | "idle";
    };
  }>({});

  // Sync edit form fields once profile loads
  useEffect(() => {
    if (profile) {
      const onboarded = !!profile.isOnboarded;
      setEditForm({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        height: profile.height || "",
        weight: profile.weight || "",
        bust: profile.bust || "",
        waist: profile.waist || "",
        hips: profile.hips || "",
        location: profile.location || "",
        hometown: profile.hometown || "",
        education: profile.education || "",
        bio: profile.bio || "",
        experienceText: profile.experienceText || profile.experience_text || "",
        languages: Array.isArray(profile.languages) ? profile.languages : (profile.languages ? [profile.languages] : []),
        rateCard: { ...(profile.rateCard || {}) },
        plasticSurgery: profile.plasticSurgery || "false",
        maritalStatus: profile.maritalStatus || "",
        gender: profile.gender || "Nữ",
        dob: convertToInputDate(profile.dob),
        skinColor: profile.skinColor || "",
        hairColor: profile.hairColor || "",
        tattoo: profile.tattoo || "Không",
        tattooDesc: profile.tattooDesc || "",
        experience: profile.experience !== undefined && profile.experience !== null ? profile.experience : "",
        talentTypes: normalizeTalentTypeList(Array.isArray(profile.talentTypes) ? profile.talentTypes : (Array.isArray(profile.talent_types) ? profile.talent_types : [])),
        specialSkills: Array.isArray(profile.specialSkills) ? profile.specialSkills : (Array.isArray(profile.skills) ? profile.skills : []),
        socialHighlights: Array.isArray(profile.socialHighlights) ? profile.socialHighlights : (Array.isArray(profile.social_highlights) ? profile.social_highlights : []),
        price: profile.price || "",
        portfolio_url: profile.portfolio_url || ""
      });
      setPortfolioLinks(normalizePortfolioLinks(profile.portfolioLinks ?? profile.portfolio_links ?? profile.portfolio_url));

      // Parse social accounts
      let accounts: { platform: string; url: string }[] = [];
      if (Array.isArray(profile.socialAccounts) && profile.socialAccounts.length > 0) {
        accounts = profile.socialAccounts
          .map((a: any) => ({ platform: a.platform, url: a.url }))
          .filter((a: any) => a.platform && a.url);
      }
      setSocialAccounts(accounts);
      setVideoForm({
        hasUploadedIntro: onboarded ? (profile.hasUploadedIntro || false) : false,
        hasUploadedCatwalk: onboarded ? (profile.hasUploadedCatwalk || false) : false,
        hasUploadedMC: onboarded ? (profile.hasUploadedMC || false) : false
      });
      setLifestyleServices(onboarded ? (profile.lifestyleServices || []) : []);

      const front = profile.cccdFront || null;
      const back = profile.cccdBack || null;
      const self = profile.cccdSelfie || null;
      setCccdFront(front);
      setCccdBack(back);
      setSelfie(self);

      if (front && back && self) {
        setVerificationStatus(profile.verificationStatus || "pending");
      } else {
        setVerificationStatus(profile.verificationStatus || "unverified");
      }

      if (onboarded && (profile.verifiedLevel === "Elite" || profile.verifiedLevel === "Pro" || profile.verifiedLevel === "Basic")) {
        setVerificationStatus("verified");
      }
    }
  }, [profile]);

  // Real identity card (CCCD) uploader
  const handleCccdUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "cccd_front" | "cccd_back" | "cccd_selfie") => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const fieldMap = {
      cccd_front: "cccdFront",
      cccd_back: "cccdBack",
      cccd_selfie: "cccdSelfie"
    };
    const field = fieldMap[type];
    const previewUrl = URL.createObjectURL(file);
    setProfile((current: any) => ({ ...current, [field]: previewUrl }));
    if (type === "cccd_front") setCccdFront(previewUrl);
    if (type === "cccd_back") setCccdBack(previewUrl);
    if (type === "cccd_selfie") setSelfie(previewUrl);

    setUploadingState(prev => ({
      ...prev,
      [type]: {
        progress: 0,
        fileName: file.name,
        status: "uploading"
      }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 8;
      if (progress > 95) progress = 95;
      setUploadingState(prev => {
        if (!prev[type]) return prev;
        return {
          ...prev,
          [type]: {
            ...prev[type],
            progress
          }
        };
      });
    }, 150);

    try {
      const syncedProfile = await ensureTalentProfile(profile);

      let photoUrl = "";
      if (syncedProfile.backendProfileId) {
        const photo = await uploadTalentPhoto(syncedProfile.backendProfileId, file, type);
        photoUrl = photo.url || photo.path || "";
      }

      if (!photoUrl) {
        // Fallback for unauthenticated or local usage: read as Base64 data URL
        photoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      }

      clearInterval(interval);
      setUploadingState(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          progress: 100,
          status: "done"
        }
      }));

      setTimeout(() => {
        setUploadingState(prev => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
      }, 800);

      const updatedProfile = {
        ...syncedProfile,
        ...profile,
        [field]: photoUrl,
        photos: (profile.photos || []).filter((p: string) => p !== photoUrl && p !== previewUrl),
        ...(syncedProfile.backendProfileId
          ? {
            isOnboarded: true,
            tier: profile.tier || "Potential",
          }
          : {}),
      };

      setProfile(persistTalentProfile(updatedProfile));
      URL.revokeObjectURL(previewUrl);

      if (type === "cccd_front") setCccdFront(photoUrl);
      if (type === "cccd_back") setCccdBack(photoUrl);
      if (type === "cccd_selfie") setSelfie(photoUrl);

      let typeName = "";
      if (type === "cccd_front") typeName = "Mặt trước CCCD";
      else if (type === "cccd_back") typeName = "Mặt sau CCCD";
      else if (type === "cccd_selfie") typeName = "Ảnh Selfie xác thực";

      addToast(`Tải lên tài liệu ${typeName} thành công!`, "success");
    } catch (error) {
      clearInterval(interval);
      setUploadingState(prev => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
      console.error(error);
      addToast(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.", "info");
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleDeleteCccd = (type: "cccd_front" | "cccd_back" | "cccd_selfie") => {
    const fieldMap = {
      cccd_front: "cccdFront",
      cccd_back: "cccdBack",
      cccd_selfie: "cccdSelfie"
    };
    const field = fieldMap[type];
    setProfile((current: any) => ({ ...current, [field]: null }));
    if (type === "cccd_front") setCccdFront(null);
    if (type === "cccd_back") setCccdBack(null);
    if (type === "cccd_selfie") setSelfie(null);
    addToast("Đã xóa ảnh.", "info");
  };

  // Submit Identity Verification Request
  const handleIdentitySubmit = () => {
    if (!cccdFront || !cccdBack || !selfie) {
      addToast("Vui lòng tải lên đầy đủ 3 tài liệu xác thực trước!", "info");
      return;
    }
    setVerificationStatus("pending");
    const updated = {
      ...profile,
      verificationStatus: "pending"
    };
    setProfile(persistTalentProfile(updated));
    addToast("Đã gửi hồ sơ xác minh CCCD lên hệ thống! Tiến trình xét duyệt từ 1-2 tiếng.", "success");
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const selectedCityOption = cityOptions.find((option) => option.value === editForm.location || option.label === editForm.location);
      const updated = {
        ...profile,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        height: Number(editForm.height),
        weight: Number(editForm.weight),
        bust: Number(editForm.bust),
        waist: Number(editForm.waist),
        hips: Number(editForm.hips),
        location: selectedCityOption?.label || editForm.location,
        city_id: selectedCityOption?.id,
        cityId: selectedCityOption?.id,
        hometown: editForm.hometown,
        education: editForm.education,
        bio: editForm.experienceText,
        experienceText: editForm.experienceText,
        languages: editForm.languages,
        rateCard: { ...editForm.rateCard },
        plasticSurgery: editForm.plasticSurgery,
        maritalStatus: editForm.maritalStatus,
        gender: editForm.gender,
        dob: convertToDisplayDate(editForm.dob),
        skinColor: editForm.skinColor,
        hairColor: editForm.hairColor,
        tattoo: editForm.tattoo,
        tattooDesc: editForm.tattoo === "Có" ? editForm.tattooDesc : "",
        experience: Number(editForm.experience),
        talentTypes: normalizeTalentTypeList(editForm.talentTypes),
        specialSkills: editForm.specialSkills,
        skills: editForm.specialSkills,
        socialHighlights: editForm.socialHighlights,
        social_highlights: editForm.socialHighlights,
        lifestyleServices: lifestyleServices,
        price: editForm.price,
        portfolio_url: portfolioLinks.join("\n"),
        portfolioLinks: portfolioLinks,
        portfolio_links: portfolioLinks,
        socialAccounts: socialAccounts
      };
      const syncedProfile = await saveTalentProfile(updated);
      const surveySectionAnswers = [
        Number(editForm.height) > 0 ? { question_code: "A1", answer_value: Number(editForm.height) } : null,
        Number(editForm.experience) >= 0 && String(editForm.experience).trim() !== "" ? { question_code: "B1", answer_value: Number(editForm.experience) } : null,
        editForm.price ? { question_code: "P1", answer_value: editForm.price } : null,
        normalizeTalentTypeList(editForm.talentTypes).length ? { question_code: "P2", answer_value: normalizeTalentTypeList(editForm.talentTypes) } : null,
        editForm.experienceText ? { question_code: "P3", answer_value: editForm.experienceText } : null,
        editForm.specialSkills.length ? { question_code: "P4", answer_value: editForm.specialSkills } : null,
        editForm.socialHighlights.length ? { question_code: "P5", answer_value: editForm.socialHighlights } : null,
        portfolioLinks.length ? { question_code: "P6", answer_value: portfolioLinks } : null,
        socialAccounts.length ? { question_code: "P7", answer_value: socialAccounts } : null,
      ].filter(Boolean) as { question_code: string; answer_value: unknown }[];

      if (surveySectionAnswers.length) {
        await submitTalentSurvey("A", surveySectionAnswers);
      }
      setProfile(syncedProfile);
      addToast(
        getAuthToken()
          ? "Cập nhật thông tin thành công!"
          : "Đã lưu bản nháp hồ sơ trên trình duyệt. Đăng nhập để đồng bộ lên hệ thống.",
        "success"
      );
      if (setActiveTab) {
        setActiveTab("personal-info");
        const scrollRoot = document.querySelector("[data-app-scroll-root]");
        if (scrollRoot) {
          scrollRoot.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    } catch (error) {
      console.error("Error saving talent profile:", error);
      addToast("Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.", "info");
    }
  };

  const handleCancel = () => {
    if (setActiveTab) {
      setActiveTab("personal-info");
      const scrollRoot = document.querySelector("[data-app-scroll-root]");
      if (scrollRoot) {
        scrollRoot.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-24 md:pb-8">

      {/* SUB-SECTION 1: PERSONAL INFORMATION & METRICS FORM */}
      {/* SUB-SECTION 1: PERSONAL INFORMATION & METRICS FORM */}
      <div className="rounded-3xl border border-[#F0D7D3] bg-white p-6 md:p-8 space-y-6 shadow-sm text-[#191116] dark:border-white/10 dark:bg-[#090c1e]/90 dark:text-white">
        <div className="border-b border-[#F0D7D3] pb-4 flex justify-between items-center gap-4 dark:border-white/10">
          <div>
            <h3 className="font-display font-black text-sm md:text-base text-[#7A1114] uppercase tracking-wider flex items-center gap-2 dark:text-white">
              <Edit3 className="h-5 w-5 text-[#8F0709] dark:text-[#F0C56B]" /> Cập Nhật Thông Tin Cá Nhân
            </h3>

          </div>
          <div className="hidden md:flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCancel}
              className="shrink-0 px-5 py-2.5 rounded-xl border border-[#F0D7D3] bg-white text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 dark:border-white/10 dark:bg-[#121827] dark:text-slate-300 dark:hover:bg-white/10"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              style={{ color: "#ffffff" }}
              className="light-force-white shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md hover:scale-103 active:scale-95"
            >
              Lưu thông tin
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6 text-xs">

          {/* PHÂN NHÓM 1: THÔNG TIN CÁ NHÂN & LIÊN HỆ */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#F0D7D3] hover:border-[#8F0709]/30 transition-all space-y-4 text-left shadow-sm dark:bg-[#0e142e]/80 dark:border-white/10">
            <h4 className="font-bold text-xs md:text-sm text-[#8F0709] uppercase tracking-widest border-b border-[#F0D7D3] pb-2.5 mb-3 flex items-center gap-2 dark:text-[#F0C56B] dark:border-white/10">
              Thông tin cá nhân
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <div className="space-y-1.5">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Họ tên / Nghệ danh</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#191116] placeholder:text-[#9A8B88] focus:outline-none focus:border-[#8F0709] shadow-sm transition-all dark:bg-[#060918] dark:border-white/20 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Giới tính</label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#191116] focus:outline-none focus:border-[#8F0709] shadow-sm transition-all cursor-pointer dark:bg-[#060918] dark:border-white/20 dark:text-white"
                >
                  <option value="Nữ" className="bg-white text-[#191116] dark:bg-[#0e142e] dark:text-white">Nữ</option>
                  <option value="Nam" className="bg-white text-[#191116] dark:bg-[#0e142e] dark:text-white">Nam</option>
                  <option value="Khác" className="bg-white text-[#191116] dark:bg-[#0e142e] dark:text-white">Khác</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Ngày sinh</label>
                <input
                  type="date"
                  value={editForm.dob}
                  onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                  className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#191116] focus:outline-none focus:border-[#8F0709] shadow-sm transition-all dark:bg-[#060918] dark:border-white/20 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#191116] placeholder:text-[#9A8B88] focus:outline-none focus:border-[#8F0709] shadow-sm transition-all dark:bg-[#060918] dark:border-white/20 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Số điện thoại</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#191116] placeholder:text-[#9A8B88] focus:outline-none focus:border-[#8F0709] shadow-sm transition-all dark:bg-[#060918] dark:border-white/20 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-amber-400"
                />
              </div>

              <CitySelect
                options={cityOptions}
                label="Thành phố"
                value={editForm.location}
                onChange={(val) => setEditForm((prev: any) => ({ ...prev, location: val }))}
              />

              <div className="space-y-1.5 text-left">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] mb-1.5 dark:text-slate-200">
                  Địa chỉ chi tiết
                </label>
                <input
                  type="text"
                  value={editForm.hometown}
                  onChange={(e) => setEditForm((prev: any) => ({ ...prev, hometown: e.target.value }))}
                  placeholder="Nhập địa chỉ chi tiết (ví dụ: 123 Đường ABC, Quận XYZ)"
                  className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#191116] focus:outline-none focus:border-[#8F0709] shadow-sm transition-all placeholder:text-[#9A8B88] dark:bg-[#060918] dark:border-white/20 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-amber-400"
                />
              </div>

            </div>
          </div>

          {/* PHÂN NHÓM 2: NGOẠI HÌNH & CHỈ SỐ CƠ THỂ */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#F0D7D3] hover:border-[#8F0709]/30 transition-all space-y-4 text-left shadow-sm dark:bg-[#0e142e]/80 dark:border-white/10">
            <h4 className="font-bold text-xs md:text-sm text-[#8F0709] uppercase tracking-widest border-b border-[#F0D7D3] pb-2.5 mb-3 flex items-center gap-2 dark:text-[#F0C56B] dark:border-white/10">
              Ngoại hình
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <div className="space-y-1.5">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Chiều cao (cm)</label>
                <input
                  type="number"
                  value={editForm.height}
                  onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                  className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#191116] focus:outline-none focus:border-[#8F0709] shadow-sm transition-all dark:bg-[#060918] dark:border-white/20 dark:text-white dark:focus:border-amber-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Cân nặng (kg)</label>
                <input
                  type="number"
                  value={editForm.weight}
                  onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                  className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#191116] focus:outline-none focus:border-[#8F0709] shadow-sm transition-all dark:bg-[#060918] dark:border-white/20 dark:text-white dark:focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] mb-1.5 dark:text-slate-200">
                  Số đo 3 vòng (cm)
                </label>
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4 items-end">
                  <div className="flex flex-col space-y-1.5 min-w-0">
                    <span className="text-[10px] text-[#574D54] font-bold block text-center truncate dark:text-slate-300" title="Vòng 1 (B - Ngực)">
                      Vòng 1 (B - Ngực)
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={editForm.bust}
                      onChange={(e) => setEditForm({ ...editForm, bust: e.target.value })}
                      className="w-full bg-white border border-[#F0D7D3] rounded-xl px-2 sm:px-3.5 py-2.5 text-center text-xs font-bold text-[#191116] placeholder:text-[#9A8B88] focus:outline-none focus:border-[#8F0709] focus:ring-1 focus:ring-[#8F0709]/20 shadow-sm transition-all dark:bg-[#060918] dark:border-white/20 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5 min-w-0">
                    <span className="text-[10px] text-[#574D54] font-bold block text-center truncate dark:text-slate-300" title="Vòng 2 (W - Eo)">
                      Vòng 2 (W - Eo)
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={editForm.waist}
                      onChange={(e) => setEditForm({ ...editForm, waist: e.target.value })}
                      className="w-full bg-white border border-[#F0D7D3] rounded-xl px-2 sm:px-3.5 py-2.5 text-center text-xs font-bold text-[#191116] placeholder:text-[#9A8B88] focus:outline-none focus:border-[#8F0709] focus:ring-1 focus:ring-[#8F0709]/20 shadow-sm transition-all dark:bg-[#060918] dark:border-white/20 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5 min-w-0">
                    <span className="text-[10px] text-[#574D54] font-bold block text-center truncate dark:text-slate-300" title="Vòng 3 (H - Hông)">
                      Vòng 3 (H - Hông)
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={editForm.hips}
                      onChange={(e) => setEditForm({ ...editForm, hips: e.target.value })}
                      className="w-full bg-white border border-[#F0D7D3] rounded-xl px-2 sm:px-3.5 py-2.5 text-center text-xs font-bold text-[#191116] placeholder:text-[#9A8B88] focus:outline-none focus:border-[#8F0709] focus:ring-1 focus:ring-[#8F0709]/20 shadow-sm transition-all dark:bg-[#060918] dark:border-white/20 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PHÂN NHÓM 3: THÔNG TIN NGHỀ NGHIỆP & Phí booking */}
          <div className="order-[90] bg-white p-5 md:p-6 rounded-2xl border border-[#F0D7D3] hover:border-[#8F0709]/30 transition-all space-y-4 text-left shadow-sm dark:bg-[#0e142e]/80 dark:border-white/10">
            <h4 className="font-bold text-xs md:text-sm text-[#8F0709] uppercase tracking-widest border-b border-[#F0D7D3] pb-2.5 mb-3 flex items-center gap-2 dark:text-[#F0C56B] dark:border-white/10">
              Thông tin nghề nghiệp
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <div className="space-y-1.5">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Phí booking (VD: "5.000.000đ/ngày" hoặc "Thỏa thuận")</label>
                <input
                  type="text"
                  value={editForm.price}
                  onChange={(e) => handlePriceChange(e.target.value, editForm.price)}
                  placeholder="Nhập Phí booking dịch vụ của bạn..."
                  className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#191116] placeholder:text-[#9A8B88] focus:outline-none focus:border-[#8F0709] shadow-sm transition-all dark:bg-[#060918] dark:border-white/20 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Số năm kinh nghiệm</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={editForm.experience}
                  onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                  className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#191116] focus:outline-none focus:border-[#8F0709] shadow-sm transition-all dark:bg-[#060918] dark:border-white/20 dark:text-white dark:focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Kinh nghiệm làm việc</label>
                <textarea
                  value={editForm.experienceText || ""}
                  onChange={(e) => setEditForm({ ...editForm, experienceText: e.target.value })}
                  rows={4}
                  placeholder="Nhập một số kinh nghiệm làm việc của bạn..."
                  className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#191116] placeholder:text-[#9A8B88] focus:outline-none focus:border-[#8F0709] shadow-sm transition-all resize-none dark:bg-[#060918] dark:border-white/20 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-amber-400"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">
                  Lĩnh vực nội dung / kỹ năng chuyên sâu
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    handleAddContentSkill(e.target.value);
                    e.target.value = "";
                  }}
                  className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3 py-2.5 text-[#191116] text-xs font-semibold focus:outline-none focus:border-[#8F0709] cursor-pointer appearance-none shadow-sm dark:bg-[#060918] dark:border-white/20 dark:text-slate-200 dark:focus:border-amber-400"
                  style={{
                    backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%238F0709%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27/%3e%3c/svg%3e')",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "0.85em",
                    paddingRight: "2rem"
                  }}
                >
                  <option value="" disabled hidden>Thêm lĩnh vực / kỹ năng...</option>
                  {flattenTalentPresetOptions(SPECIALTY_PRESET_GROUPS, editForm.talentTypes)
                    .filter((item) => !editForm.specialSkills.includes(item))
                    .map((item) => (
                      <option key={item} value={item} className="bg-white text-[#191116] py-1 dark:bg-[#0e142e] dark:text-white">{item}</option>
                    ))
                  }
                </select>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <input
                    type="text"
                    value={contentSkillInput}
                    onChange={(e) => setContentSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddContentSkill(contentSkillInput);
                      }
                    }}
                    placeholder="Ví dụ: Beauty, Food, Thời trang..."
                    className="md:col-span-9 w-full bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#191116] placeholder:text-[#9A8B88] focus:outline-none focus:border-[#8F0709] shadow-sm transition-all dark:bg-[#060918] dark:border-white/20 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddContentSkill(contentSkillInput)}
                    style={{ color: "#ffffff" }}
                    className="light-force-white md:col-span-3 w-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md"
                  >
                    <Plus className="h-4 w-4 stroke-[3] !text-white text-white" /> <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">Thêm</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[42px] p-2.5 bg-white border border-[#F0D7D3] rounded-xl text-left shadow-sm dark:bg-[#060918] dark:border-white/15">
                  {editForm.specialSkills.length === 0 ? (
                    <span className="text-xs text-[#9A8B88] italic px-2 py-1 dark:text-slate-400">Chưa thêm lĩnh vực nào</span>
                  ) : (
                    editForm.specialSkills.map((skill: string) => (
                      <span key={skill} className="inline-flex items-center gap-1.5 rounded-full border border-[#F0D7D3] bg-[#FFF0EE] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#8F0709] shadow-sm dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-[#F0C56B]">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveContentSkill(skill)}
                          className="text-[#9A8B88] hover:text-[#8F0709] cursor-pointer focus:outline-none flex items-center justify-center dark:text-slate-400 dark:hover:text-rose-400"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Loại hình Idol */}
              <div className="space-y-3">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Loại hình Idol</label>
                <select
                  value=""
                  onChange={(e) => {
                    handleAddSkill(e.target.value);
                    e.target.value = "";
                  }}
                  className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3 py-2.5 text-[#191116] text-xs font-semibold focus:outline-none focus:border-[#8F0709] cursor-pointer appearance-none shadow-sm dark:bg-[#060918] dark:border-white/20 dark:text-slate-200 dark:focus:border-amber-400"
                  style={{
                    backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%238F0709%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27/%3e%3c/svg%3e')",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "0.85em",
                    paddingRight: "2rem"
                  }}
                >
                  <option value="" disabled hidden>Thêm loại hình Idol...</option>
                  {talentTypeOptions
                    .filter((s: string) => !normalizeTalentTypeList(editForm.talentTypes).includes(normalizeTalentTypeLabel(s)))
                    .map((s: string) => (
                      <option key={s} value={s} className="bg-white text-[#191116] py-1 dark:bg-[#0e142e] dark:text-white">{s}</option>
                    ))
                  }
                </select>
                <div className="flex flex-wrap gap-2 min-h-[42px] p-2.5 bg-white border border-[#F0D7D3] rounded-xl text-left shadow-sm dark:bg-[#060918] dark:border-white/15">
                  {editForm.talentTypes.length === 0 ? (
                    <span className="text-xs text-[#9A8B88] italic px-2 py-1 dark:text-slate-400">Chưa chọn loại hình nào</span>
                  ) : (
                    normalizeTalentTypeList(editForm.talentTypes).map((skill: string) => (
                      <span key={skill} className="inline-flex items-center gap-1.5 rounded-full border border-[#F0D7D3] bg-[#FFF0EE] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#8F0709] shadow-sm dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-[#F0C56B]">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-[#9A8B88] hover:text-[#8F0709] cursor-pointer focus:outline-none flex items-center justify-center dark:text-slate-400 dark:hover:text-rose-400"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Ngôn ngữ */}
              <div className="space-y-3">
                <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Trình độ ngoại ngữ</label>

                {/* Dropdown to add quick preset */}
                <select
                  value=""
                  onChange={(e) => {
                    handleAddLanguage(e.target.value);
                    e.target.value = "";
                  }}
                  className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3 py-2.5 text-[#191116] text-xs font-semibold focus:outline-none focus:border-[#8F0709] cursor-pointer appearance-none shadow-sm dark:bg-[#060918] dark:border-white/20 dark:text-slate-200 dark:focus:border-amber-400"
                  style={{
                    backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%238F0709%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27/%3e%3c/svg%3e')",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "0.85em",
                    paddingRight: "2rem"
                  }}
                >
                  <option value="" disabled hidden>Thêm ngoại ngữ</option>
                  {availableLanguages
                    .filter((l: string) => !editForm.languages.includes(l))
                    .map((l: string) => (
                      <option key={l} value={l} className="bg-white text-[#191116] py-1 dark:bg-[#0e142e] dark:text-white">{l}</option>
                    ))
                  }
                </select>

                {/* Quick Add Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-[#574D54] font-semibold block dark:text-slate-400">Gợi ý chọn nhanh:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableLanguages.slice(0, 6).map((lang) => {
                      const isAdded = editForm.languages.some((l: string) => l === lang || l.startsWith(`${lang} `) || l.startsWith(`${lang}(`));
                      if (isAdded) return null;
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleAddLanguage(lang)}
                          className="px-2.5 py-1 rounded-lg border border-[#F0D7D3] bg-white hover:bg-[#FFF0EE] text-[#574D54] hover:text-[#8F0709] text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer dark:bg-white/5 dark:hover:bg-amber-400/20 dark:border-white/10 dark:text-slate-300 dark:hover:text-amber-300 shadow-2xs"
                        >
                          <Plus className="h-3 w-3" /> {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom language/level input */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddLanguage(languageInput);
                      }
                    }}
                    placeholder="Ví dụ: Tiếng Anh (IELTS 7.5), Tiếng Trung (HSK 5)..."
                    className="md:col-span-9 w-full bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#191116] placeholder:text-[#9A8B88] focus:outline-none focus:border-[#8F0709] shadow-sm transition-all dark:bg-[#060918] dark:border-white/20 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddLanguage(languageInput)}
                    style={{ color: "#ffffff" }}
                    className="light-force-white md:col-span-3 w-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md"
                  >
                    <Plus className="h-4 w-4 stroke-[3] !text-white text-white" /> <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">Thêm</span>
                  </button>
                </div>

                {/* Active languages list */}
                <div className="flex flex-wrap gap-2 min-h-[42px] p-2.5 bg-white border border-[#F0D7D3] rounded-xl text-left shadow-sm dark:bg-[#060918] dark:border-white/15">
                  {editForm.languages.length === 0 ? (
                    <span className="text-xs text-[#9A8B88] italic px-2 py-1 dark:text-slate-400">Chưa thêm ngoại ngữ nào</span>
                  ) : (
                    editForm.languages.map((lang: string) => (
                      <span key={lang} className="inline-flex items-center gap-1.5 rounded-full border border-[#F0D7D3] bg-[#FFF0EE] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#8F0709] shadow-sm dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-[#F0C56B]">
                        {lang}
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(lang)}
                          className="text-[#9A8B88] hover:text-[#8F0709] cursor-pointer focus:outline-none flex items-center justify-center dark:text-slate-400 dark:hover:text-rose-400"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PHÂN NHÓM 5: PORTFOLIO */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#F0D7D3] hover:border-[#8F0709]/30 transition-all space-y-4 text-left shadow-sm dark:bg-[#0e142e]/80 dark:border-white/10">
            <h4 className="font-bold text-xs md:text-sm text-[#8F0709] uppercase tracking-widest border-b border-[#F0D7D3] pb-2.5 mb-3 flex items-center gap-2 dark:text-[#F0C56B] dark:border-white/10">
              Portfolio
            </h4>

            <div className="space-y-3">
              <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">
                Chỉ số nổi bật
              </label>
              <select
                value=""
                onChange={(e) => {
                  handleAddSocialHighlight(e.target.value);
                  e.target.value = "";
                }}
                className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3 py-2.5 text-[#191116] text-xs font-semibold focus:outline-none focus:border-[#8F0709] cursor-pointer appearance-none shadow-sm dark:bg-[#060918] dark:border-white/20 dark:text-slate-200 dark:focus:border-amber-400"
                style={{
                  backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%238F0709%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27/%3e%3c/svg%3e')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "0.85em",
                  paddingRight: "2rem"
                }}
              >
                <option value="" disabled hidden>Thêm chỉ số</option>
                {flattenTalentPresetOptions(SOCIAL_HIGHLIGHT_PRESET_GROUPS, editForm.talentTypes)
                  .filter((item) => !editForm.socialHighlights.includes(item))
                  .map((item) => (
                    <option key={item} value={item} className="bg-white text-[#191116] py-1 dark:bg-[#0e142e] dark:text-white">{item}</option>
                  ))
                }
              </select>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <input
                  type="text"
                  value={socialHighlightInput}
                  onChange={(e) => setSocialHighlightInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSocialHighlight(socialHighlightInput);
                    }
                  }}
                  placeholder="Ví dụ: 50K+ Followers, 11K+ Viewers..."
                  className="md:col-span-9 w-full bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#191116] placeholder:text-[#9A8B88] focus:outline-none focus:border-[#8F0709] shadow-sm transition-all dark:bg-[#060918] dark:border-white/20 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => handleAddSocialHighlight(socialHighlightInput)}
                  style={{ color: "#ffffff" }}
                  className="light-force-white md:col-span-3 w-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md"
                >
                  <Plus className="h-4 w-4 stroke-[3] !text-white text-white" /> <span style={{ color: "#ffffff" }} className="!text-white text-white font-black">Thêm</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[42px] p-2.5 bg-white border border-[#F0D7D3] rounded-xl text-left shadow-sm dark:bg-[#060918] dark:border-white/15">
                {editForm.socialHighlights.length === 0 ? (
                  <span className="text-xs text-[#9A8B88] italic px-2 py-1 dark:text-slate-400">Chưa thêm chỉ số nổi bật nào</span>
                ) : (
                  editForm.socialHighlights.map((highlight: string) => (
                    <span key={highlight} className="inline-flex items-center gap-1.5 rounded-full border border-[#F0D7D3] bg-[#FFF0EE] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#8F0709] shadow-sm dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-[#F0C56B]">
                      {highlight}
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialHighlight(highlight)}
                        className="text-[#9A8B88] hover:text-[#8F0709] cursor-pointer focus:outline-none flex items-center justify-center dark:text-slate-400 dark:hover:text-rose-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-[#F0D7D3] dark:border-white/10" />

            <div className="space-y-3">
              <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Portfolio URL</label>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="space-y-1.5 md:col-span-9">
                  <span className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] md:text-[10px] dark:text-slate-200">Đường dẫn Portfolio</span>
                  <input
                    type="url"
                    value={portfolioLink}
                    onChange={(e) => setPortfolioLink(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPortfolioLink();
                      }
                    }}
                    placeholder="https://..."
                    className="w-full h-[40px] bg-white border border-[#F0D7D3] rounded-xl px-3.5 text-[#191116] placeholder:text-[#9A8B88] focus:outline-none focus:border-[#8F0709] transition-colors shadow-sm dark:bg-[#060918] dark:border-white/20 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-amber-400"
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={handleAddPortfolioLink}
                    style={{ color: "#ffffff" }}
                    className="light-force-white w-full bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider h-[40px] flex items-center justify-center cursor-pointer transition-all shadow-md shrink-0"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {portfolioLinks.length === 0 ? (
                <div className="text-[#9A8B88] italic text-xs py-1 dark:text-slate-400">Chưa có portfolio nào được thêm.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {portfolioLinks.map((link, index) => (
                    <div key={`${link}-${index}`} className="flex items-center justify-between gap-3 bg-white border border-[#F0D7D3] rounded-xl px-3.5 py-2.5 shadow-sm dark:bg-[#060918] dark:border-white/15">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black text-[#8F0709] uppercase tracking-wider block dark:text-amber-400">
                          Portfolio {index + 1}
                        </span>
                        <a
                          href={portfolioHref(link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#191116] hover:text-[#8F0709] truncate block font-semibold dark:text-slate-200 dark:hover:text-white"
                          title={link}
                        >
                          {link.replace(/https?:\/\/(www\.)?/, '')}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePortfolioLink(link)}
                        className="text-[#9A8B88] hover:text-red-600 p-1 cursor-pointer transition-colors dark:text-slate-400 dark:hover:text-red-400"
                        title="Xóa portfolio"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PHÂN NHÓM 6: MẠNG XÃ HỘI */}
          <SocialAccountsSection
            socialAccounts={socialAccounts}
            socialPlatform={socialPlatform}
            setSocialPlatform={setSocialPlatform}
            socialLink={socialLink}
            setSocialLink={setSocialLink}
            onAddAccount={() => {
              if (!socialLink.trim()) return;
              let targetUrl = socialLink.trim();
              if (!/^https?:\/\//i.test(targetUrl)) {
                targetUrl = `https://${targetUrl}`;
              }
              setSocialAccounts(prev => [...prev, { platform: socialPlatform, url: targetUrl }]);
              setSocialLink("");
            }}
            onRemoveAccount={(index) => {
              setSocialAccounts(prev => prev.filter((_, idx) => idx !== index));
            }}
          />

          {/* Lifestyle Companion services config editing */}
          {lifestyleServices && lifestyleServices.length > 0 && (
            <div className="border-t border-[#F0D7D3] dark:border-white/10 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#574D54] uppercase tracking-wider text-[10px] text-left dark:text-slate-200">
                  Dịch Vụ Đồng Hành VIP
                </span>
                <button
                  type="button"
                  onClick={() => setIsLifestyleExpanded(!isLifestyleExpanded)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFF0EE] border border-[#F0D7D3] text-[#8F0709] hover:bg-[#FFE5E2] text-[10px] font-black uppercase transition-all duration-300 focus:outline-none shadow-sm dark:bg-amber-400/15 dark:border-amber-400/30 dark:text-amber-300 dark:hover:bg-amber-400/25"
                >
                  <span>{isLifestyleExpanded ? "Thu gọn" : "Cấu hình"}</span>
                  {isLifestyleExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              {isLifestyleExpanded && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Select All Toggle - shown only when expanded */}
                  <div className="flex justify-end">
                    <label className="flex items-center gap-2 cursor-pointer select-none bg-white border border-[#F0D7D3] px-3 py-1.5 rounded-xl hover:border-[#8F0709]/30 transition-colors dark:bg-[#060918] dark:border-white/15">
                      <input
                        type="checkbox"
                        checked={lifestyleServices.length > 0 && lifestyleServices.every(s => s.enabled)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const updated = lifestyleServices.map(s => ({ ...s, enabled: checked }));
                          setLifestyleServices(updated);
                        }}
                        className="rounded accent-[#8F0709] h-4 w-4 cursor-pointer dark:accent-amber-400"
                      />
                      <span className="text-[10px] font-black text-[#574D54] uppercase dark:text-slate-300">Chọn tất cả</span>
                    </label>
                  </div>

                  {/* Grid of items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lifestyleServices.map((service, index) => {
                      return (
                        <div key={service.id} className="rounded-2xl border border-[#F0D7D3] bg-white p-4.5 space-y-3 text-left shadow-sm dark:border-white/10 dark:bg-[#060918]">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-[#191116] dark:text-white">{service.title}</span>
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={service.enabled}
                                onChange={(e) => {
                                  const updated = [...lifestyleServices];
                                  updated[index] = { ...service, enabled: e.target.checked };
                                  setLifestyleServices(updated);
                                }}
                                className="rounded accent-[#8F0709] h-4 w-4 cursor-pointer dark:accent-amber-400"
                              />
                              <span className="text-[9px] font-black text-[#574D54] uppercase dark:text-slate-300">Kích hoạt</span>
                            </label>
                          </div>

                          <p className="text-xs text-[#574D54] leading-normal dark:text-slate-400">{service.description}</p>

                          {service.enabled && (
                            <div className="space-y-1.5 animate-in fade-in duration-200">
                              <label className="block font-bold text-[#574D54] uppercase tracking-wider text-[9px] dark:text-slate-300">Giá dịch vụ đề xuất (VND / {service.unit})</label>
                              <input
                                type="number"
                                value={service.rate}
                                onChange={(e) => {
                                  const updated = [...lifestyleServices];
                                  updated[index] = { ...service, rate: Number(e.target.value) };
                                  setLifestyleServices(updated);
                                }}
                                className="w-full bg-white border border-[#F0D7D3] rounded-xl px-3 py-2 text-[#191116] focus:outline-none focus:border-[#8F0709] transition-colors dark:bg-[#0e142e] dark:border-white/20 dark:text-white dark:focus:border-amber-400"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="hidden md:block order-[100] pt-3">
            <button
              type="submit"
              style={{ color: "#ffffff" }}
              className="light-force-white w-full h-11 rounded-xl bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white font-black uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-lg text-xs"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>

      {/* SUB-SECTION 2: CCCD IDENTITY DOCUMENT VERIFICATION (Temporarily disabled) */}
      {/*
      <div className="rounded-3xl border border-cyan-500/30 bg-[#081224]/90 p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="border-b border-cyan-500/20 pb-4">
          <h3 className="font-display font-black text-sm md:text-base text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" /> Xác Minh Căn Cước Công Dân (CCCD)
          </h3>
          <span className="block text-[10px] md:text-xs text-slate-300 font-medium uppercase mt-1 tracking-wider">
            Tải lên thông tin bắt buộc để nhận Tích xanh/Tích vàng Elite xác thực tài khoản
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-xs text-slate-200">

          <div className="rounded-2xl bg-[#09152a] p-4.5 border border-cyan-500/20 hover:border-cyan-400/40 transition-all flex flex-col justify-between items-center text-center space-y-3.5 shadow-md">
            <span className="font-bold block uppercase text-[9px] md:text-[10px] text-cyan-300 tracking-wider">CCCD Mặt trước</span>
            <div className="h-28 w-full rounded-xl bg-[#050b18] border border-white/10 flex items-center justify-center text-slate-500 relative overflow-hidden group">
              {cccdFront ? (
                <>
                  <img src={normalizeBackendAssetUrl(cccdFront)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="CCCD Mặt trước" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCccd("cccd_front");
                    }}
                    disabled={verificationStatus === "verified"}
                    className="absolute top-2 right-2 z-30 h-7 w-7 rounded-full bg-slate-950/80 hover:bg-rose-600 border border-white/20 text-white hover:border-rose-400 flex items-center justify-center transition-all shadow-lg cursor-pointer focus:outline-none"
                    title="Xóa ảnh mặt trước"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute inset-0 bg-black/35 sm:bg-black/55 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <label className="flex flex-col items-center gap-1.5 bg-black/80 hover:bg-black/95 border border-white/20 hover:border-amber-400 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-white text-[10px] font-bold cursor-pointer transition-all">
                      <Upload className="h-5 w-5 text-amber-400" />
                      <span>Thay đổi ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!!uploadingState["cccd_front"] || verificationStatus === "verified"}
                        onChange={(e) => handleCccdUpload(e, "cccd_front")}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <span className="text-[10px] text-slate-400 mb-2 font-medium">Chưa chọn ảnh nào</span>
                  <label className="flex items-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 rounded-xl px-3 py-1.5 text-cyan-300 text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all">
                    <Upload className="h-3.5 w-3.5 text-cyan-300" />
                    <span>Tải ảnh lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!!uploadingState["cccd_front"] || verificationStatus === "verified"}
                      onChange={(e) => handleCccdUpload(e, "cccd_front")}
                    />
                  </label>
                </div>
              )}

              {uploadingState["cccd_front"] && (
                <ProgressBar
                  progress={uploadingState["cccd_front"].progress}
                  message="Đang tải ảnh mặt trước CCCD lên..."
                />
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-[#09152a] p-4.5 border border-cyan-500/20 hover:border-cyan-400/40 transition-all flex flex-col justify-between items-center text-center space-y-3.5 shadow-md">
            <span className="font-bold block uppercase text-[9px] md:text-[10px] text-cyan-300 tracking-wider">CCCD Mặt sau</span>
            <div className="h-28 w-full rounded-xl bg-[#050b18] border border-white/10 flex items-center justify-center text-slate-500 relative overflow-hidden group">
              {cccdBack ? (
                <>
                  <img src={normalizeBackendAssetUrl(cccdBack)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="CCCD Mặt sau" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCccd("cccd_back");
                    }}
                    disabled={verificationStatus === "verified"}
                    className="absolute top-2 right-2 z-30 h-7 w-7 rounded-full bg-slate-950/80 hover:bg-rose-600 border border-white/20 text-white hover:border-rose-400 flex items-center justify-center transition-all shadow-lg cursor-pointer focus:outline-none"
                    title="Xóa ảnh mặt sau"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute inset-0 bg-black/35 sm:bg-black/55 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <label className="flex flex-col items-center gap-1.5 bg-black/80 hover:bg-black/95 border border-white/20 hover:border-amber-400 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-white text-[10px] font-bold cursor-pointer transition-all">
                      <Upload className="h-5 w-5 text-amber-400" />
                      <span>Thay đổi ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!!uploadingState["cccd_back"] || verificationStatus === "verified"}
                        onChange={(e) => handleCccdUpload(e, "cccd_back")}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <span className="text-[10px] text-slate-400 mb-2 font-medium">Chưa chọn ảnh nào</span>
                  <label className="flex items-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 rounded-xl px-3 py-1.5 text-cyan-300 text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all">
                    <Upload className="h-3.5 w-3.5 text-cyan-300" />
                    <span>Tải ảnh lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!!uploadingState["cccd_back"] || verificationStatus === "verified"}
                      onChange={(e) => handleCccdUpload(e, "cccd_back")}
                    />
                  </label>
                </div>
              )}

              {uploadingState["cccd_back"] && (
                <ProgressBar
                  progress={uploadingState["cccd_back"].progress}
                  message="Đang tải ảnh mặt sau CCCD lên..."
                />
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-[#09152a] p-4.5 border border-cyan-500/20 hover:border-cyan-400/40 transition-all flex flex-col justify-between items-center text-center space-y-3.5 shadow-md">
            <span className="font-bold block uppercase text-[9px] md:text-[10px] text-cyan-300 tracking-wider">Ảnh chân dung Selfie</span>
            <div className="h-28 w-full rounded-xl bg-[#050b18] border border-white/10 flex items-center justify-center text-slate-500 relative overflow-hidden group">
              {selfie ? (
                <>
                  <img src={normalizeBackendAssetUrl(selfie)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Ảnh chân dung Selfie" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCccd("cccd_selfie");
                    }}
                    disabled={verificationStatus === "verified"}
                    className="absolute top-2 right-2 z-30 h-7 w-7 rounded-full bg-slate-950/80 hover:bg-rose-600 border border-white/20 text-white hover:border-rose-400 flex items-center justify-center transition-all shadow-lg cursor-pointer focus:outline-none"
                    title="Xóa ảnh chân dung"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute inset-0 bg-black/35 sm:bg-black/55 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <label className="flex flex-col items-center gap-1.5 bg-black/80 hover:bg-black/95 border border-white/20 hover:border-amber-400 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-white text-[10px] font-bold cursor-pointer transition-all">
                      <Upload className="h-5 w-5 text-amber-400" />
                      <span>Thay đổi ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!!uploadingState["cccd_selfie"] || verificationStatus === "verified"}
                        onChange={(e) => handleCccdUpload(e, "cccd_selfie")}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <span className="text-[10px] text-slate-400 mb-2 font-medium">Chưa chọn ảnh nào</span>
                  <label className="flex items-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 rounded-xl px-3 py-1.5 text-cyan-300 text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all">
                    <Upload className="h-3.5 w-3.5 text-cyan-300" />
                    <span>Tải ảnh lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!!uploadingState["cccd_selfie"] || verificationStatus === "verified"}
                      onChange={(e) => handleCccdUpload(e, "cccd_selfie")}
                    />
                  </label>
                </div>
              )}

              {uploadingState["cccd_selfie"] && (
                <ProgressBar
                  progress={uploadingState["cccd_selfie"].progress}
                  message="Đang tải ảnh chân dung selfie lên..."
                />
              )}
            </div>
          </div>

        </div>

        <div className="bg-[#050b18] p-4.5 rounded-2xl border border-cyan-500/20 flex justify-between items-center gap-4 text-xs shadow-inner">
          <div className="space-y-1">
            <span className="font-bold text-white block">Trạng thái phê duyệt CCCD</span>
            <span className="text-xs text-slate-300 block font-medium">
              {verificationStatus === "unverified" && "Chưa gửi yêu cầu. Vui lòng tải đủ 3 ảnh trên."}
              {verificationStatus === "pending" && "⏳ Hồ sơ đang chờ quản trị viên phê duyệt trong vòng 120 phút."}
              {verificationStatus === "verified" && "🎉 Tài khoản đã được định danh thật thành công trên hệ thống!"}
            </span>
          </div>
          {verificationStatus !== "verified" && (
            <button
              type="button"
              onClick={handleIdentitySubmit}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shrink-0"
            >
              {verificationStatus === "pending" ? "Đang xử lý..." : "Gửi yêu cầu xác thực"}
            </button>
          )}
        </div>
      </div>
      */}

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-[#F0D7D3] px-4 py-3.5 flex items-center gap-3 shadow-lg dark:bg-[#0c101d]/95 dark:border-white/5">
        <button
          type="button"
          onClick={handleCancel}
          className="w-1/3 py-3.5 rounded-xl font-display text-xs font-black border border-[#F0D7D3] bg-white text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] active:scale-[0.97] cursor-pointer transition-all uppercase tracking-widest text-center justify-center items-center shadow-xs dark:border-white/10 dark:bg-[#171A21] dark:text-slate-300"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={() => handleSave()}
          style={{ color: "#ffffff" }}
          className="light-force-white flex-1 py-3.5 rounded-xl font-display text-xs font-black bg-gradient-to-r from-[#E01B1F] to-[#8F0709] !text-white text-white shadow-md active:scale-[0.97] cursor-pointer transition-all uppercase tracking-widest text-center justify-center items-center"
        >
          Lưu thông tin
        </button>
      </div>

    </div>
  );
}
