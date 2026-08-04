"use client";

import React, { useEffect, useState } from "react";
import {
  Edit3, ShieldCheck, CheckCircle, Upload, Video, Trash2, ChevronDown, ChevronUp,
  X, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuthToken } from "@/lib/api-client";
import { persistTalentProfile, ensureTalentProfile, saveTalentProfile, submitTalentSurvey, uploadTalentPhoto } from "@/lib/talent-api";
import { normalizeBackendAssetUrl } from "@/lib/avatar";
import ProgressBar from "@/components/ui/ProgressBar";
import {
  CITY_VALUES,
  SOCIAL_HIGHLIGHT_PRESET_GROUPS,
  TALENT_TYPE_VALUES,
  normalizeTalentTypeLabel,
  normalizeTalentTypeList,
} from "@/components/ui/ComboboxOptionValues";
import { SPECIALTY_PRESET_GROUPS, flattenTalentPresetOptions } from "@/lib/talent-profile-presets";

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

const cityOptions = CITY_VALUES;

interface CitySelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function CitySelect({ label, value, onChange }: CitySelectProps) {
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const filteredOptions = React.useMemo(() => {
    const keyword = searchInput.trim().toLowerCase();
    if (!keyword) return cityOptions;
    return cityOptions.filter(city => city.toLowerCase().includes(keyword));
  }, [searchInput]);

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
      <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px] mb-1.5">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/20 bg-[#060918] px-3.5 py-2.5 text-left text-xs font-semibold text-white outline-none transition-all hover:border-amber-400 focus:border-amber-400 shadow-inner"
        >
          <span className="truncate">{value || `Chọn ${label.toLowerCase()}...`}</span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-amber-400 transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-[100] mt-1.5 rounded-2xl border border-white/25 bg-[#0e142e] p-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-h-[220px] flex flex-col backdrop-blur-xl">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm thành phố..."
              className="w-full rounded-xl border border-white/20 bg-[#060918] py-2 px-3 mb-2 text-xs text-white outline-none placeholder:text-slate-400 focus:border-amber-400"
              autoFocus
            />

            <div className="overflow-y-auto flex-1 space-y-1 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-400 italic">Không tìm thấy kết quả</div>
              ) : (
                filteredOptions.map((city) => {
                  const isSelected = city === value;
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        onChange(city);
                        setSearchInput("");
                        setIsOpen(false);
                      }}
                      className={cn(
                        "block w-full px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors hover:bg-white/10",
                        isSelected ? "bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30" : "text-slate-200"
                      )}
                    >
                      {city}
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

  // Identity card (CCCD) upload states
  const [cccdFront, setCccdFront] = useState<string | null>(null);
  const [cccdBack, setCccdBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"unverified" | "pending" | "verified">("unverified");
  const [lifestyleServices, setLifestyleServices] = useState<any[]>([]);
  const [isLifestyleExpanded, setIsLifestyleExpanded] = useState(false);
  const [selectedLangName, setSelectedLangName] = useState("");
  const [langProficiency, setLangProficiency] = useState("");
  const [socialPlatform, setSocialPlatform] = useState<"Tiktok" | "Facebook" | "Instagram" | "Thread" | "Linkedin">("Tiktok");
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

  const handleAddLanguage = () => {
    if (selectedLangName) {
      const fullLangString = langProficiency.trim()
        ? `${selectedLangName} (${langProficiency.trim()})`
        : selectedLangName;

      if (!editForm.languages.includes(fullLangString)) {
        setEditForm((prev: any) => ({
          ...prev,
          languages: [...prev.languages, fullLangString]
        }));
      }
      setSelectedLangName("");
      setLangProficiency("");
    }
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
        location: editForm.location,
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-24 md:pb-8">

      {/* SUB-SECTION 1: PERSONAL INFORMATION & METRICS FORM */}
      <div className="rounded-3xl border border-white/10 bg-[#090c1e]/90 p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="border-b border-white/10 pb-4 flex justify-between items-center gap-4">
          <div>
            <h3 className="font-display font-black text-sm md:text-base text-white uppercase tracking-wider flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-[#F0C56B]" /> Cập Nhật Thông Tin Cá Nhân
            </h3>

          </div>
          <button
            type="button"
            onClick={() => handleSave()}
            className="hidden md:block shrink-0 px-5 py-2.5 rounded-xl bg-gradient-gold hover:shadow-[0_0_15px_rgba(240,197,107,0.4)] hover:scale-103 active:scale-95 text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Lưu
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6 text-xs">

          {/* PHÂN NHÓM 1: THÔNG TIN CÁ NHÂN & LIÊN HỆ */}
          <div className="bg-[#0e142e]/80 p-5 md:p-6 rounded-2xl border border-white/10 hover:border-amber-400/20 transition-all space-y-4 text-left shadow-md">
            <h4 className="font-bold text-xs md:text-sm text-[#F0C56B] uppercase tracking-widest border-b border-white/10 pb-2.5 mb-3 flex items-center gap-2">
              Thông tin cá nhân
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Họ tên / Nghệ danh</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 hover:border-white/35 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Giới tính</label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 hover:border-white/35 transition-all shadow-inner cursor-pointer"
                >
                  <option value="Nữ" className="bg-[#0e142e] text-white">Nữ</option>
                  <option value="Nam" className="bg-[#0e142e] text-white">Nam</option>
                  <option value="Khác" className="bg-[#0e142e] text-white">Khác</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Ngày sinh</label>
                <input
                  type="date"
                  value={editForm.dob}
                  onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                  style={{ colorScheme: "dark" }}
                  className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 hover:border-white/35 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 hover:border-white/35 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Số điện thoại</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 hover:border-white/35 transition-all shadow-inner"
                />
              </div>

              <CitySelect
                label="Thành phố"
                value={editForm.location}
                onChange={(val) => setEditForm((prev: any) => ({ ...prev, location: val }))}
              />

              <div className="space-y-1.5 text-left">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px] mb-1.5">
                  Địa chỉ chi tiết
                </label>
                <input
                  type="text"
                  value={editForm.hometown}
                  onChange={(e) => setEditForm((prev: any) => ({ ...prev, hometown: e.target.value }))}
                  placeholder="Nhập địa chỉ chi tiết (ví dụ: 123 Đường ABC, Quận XYZ)"
                  className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 hover:border-white/35 transition-all shadow-inner placeholder:text-slate-400"
                />
              </div>

            </div>
          </div>

          {/* PHÂN NHÓM 2: NGOẠI HÌNH & CHỈ SỐ CƠ THỂ */}
          <div className="bg-[#0e142e]/80 p-5 md:p-6 rounded-2xl border border-white/10 hover:border-amber-400/20 transition-all space-y-4 text-left shadow-md">
            <h4 className="font-bold text-xs md:text-sm text-[#F0C56B] uppercase tracking-widest border-b border-white/10 pb-2.5 mb-3 flex items-center gap-2">
              Ngoại hình
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Chiều cao (cm)</label>
                <input
                  type="number"
                  value={editForm.height}
                  onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                  className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 hover:border-white/35 transition-all shadow-inner"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Cân nặng (kg)</label>
                <input
                  type="number"
                  value={editForm.weight}
                  onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                  className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 hover:border-white/35 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px] mb-1.5">Số đo 3 vòng (cm)</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-300 font-bold block text-left">Vòng 1 (B - Ngực)</span>
                    <input
                      type="number"
                      value={editForm.bust}
                      onChange={(e) => setEditForm({ ...editForm, bust: e.target.value })}
                      className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-300 font-bold block text-left">Vòng 2 (W - Eo)</span>
                    <input
                      type="number"
                      value={editForm.waist}
                      onChange={(e) => setEditForm({ ...editForm, waist: e.target.value })}
                      className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-300 font-bold block text-left">Vòng 3 (H - Hông)</span>
                    <input
                      type="number"
                      value={editForm.hips}
                      onChange={(e) => setEditForm({ ...editForm, hips: e.target.value })}
                      className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PHÂN NHÓM 3: THÔNG TIN NGHỀ NGHIỆP & Phí booking */}
          <div className="order-[90] bg-[#0e142e]/80 p-5 md:p-6 rounded-2xl border border-white/10 hover:border-amber-400/20 transition-all space-y-4 text-left shadow-md">
            <h4 className="font-bold text-xs md:text-sm text-[#F0C56B] uppercase tracking-widest border-b border-white/10 pb-2.5 mb-3 flex items-center gap-2">
              Thông tin nghề nghiệp
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Phí booking (VD: "5.000.000đ/ngày" hoặc "Thỏa thuận")</label>
                <input
                  type="text"
                  value={editForm.price}
                  onChange={(e) => handlePriceChange(e.target.value, editForm.price)}
                  placeholder="Nhập Phí booking dịch vụ của bạn..."
                  className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 hover:border-white/35 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Số năm kinh nghiệm</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={editForm.experience}
                  onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                  className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 hover:border-white/35 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Kinh nghiệm làm việc</label>
                <textarea
                  value={editForm.experienceText || ""}
                  onChange={(e) => setEditForm({ ...editForm, experienceText: e.target.value })}
                  rows={4}
                  placeholder="Nhập một số kinh nghiệm làm việc của bạn..."
                  className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 hover:border-white/35 transition-all resize-none shadow-inner"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">
                  Lĩnh vực nội dung / kỹ năng chuyên sâu
                </label>
                <div className="flex flex-wrap gap-2 min-h-[42px] p-2.5 bg-[#060918] border border-white/15 rounded-xl text-left shadow-inner">
                  {editForm.specialSkills.length === 0 ? (
                    <span className="text-xs text-slate-400 italic px-2 py-1">Chưa thêm lĩnh vực nào</span>
                  ) : (
                    editForm.specialSkills.map((skill: string) => (
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
                <select
                  value=""
                  onChange={(e) => {
                    handleAddContentSkill(e.target.value);
                    e.target.value = "";
                  }}
                  className="w-full bg-[#060918] border border-white/20 rounded-xl px-3 py-2.5 text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-400 cursor-pointer appearance-none shadow-inner"
                  style={{
                    backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23F0C56B%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27/%3e%3c/svg%3e')",
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
                      <option key={item} value={item} className="bg-[#0e142e] text-white py-1">{item}</option>
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
                    className="md:col-span-9 w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 hover:border-white/35 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddContentSkill(contentSkillInput)}
                    className="md:col-span-3 w-full bg-gradient-gold text-slate-950 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Thêm
                  </button>
                </div>
              </div>

              {/* Loại hình Idol */}
              <div className="space-y-3">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Loại hình Idol</label>
                <div className="flex flex-wrap gap-2 min-h-[42px] p-2.5 bg-[#060918] border border-white/15 rounded-xl text-left shadow-inner">
                  {editForm.talentTypes.length === 0 ? (
                    <span className="text-xs text-slate-400 italic px-2 py-1">Chưa chọn loại hình nào</span>
                  ) : (
                    normalizeTalentTypeList(editForm.talentTypes).map((skill: string) => (
                      <span key={skill} className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#F0C56B] shadow-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer focus:outline-none flex items-center justify-center"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <select
                  value=""
                  onChange={(e) => {
                    handleAddSkill(e.target.value);
                    e.target.value = "";
                  }}
                  className="w-full bg-[#060918] border border-white/20 rounded-xl px-3 py-2.5 text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-400 cursor-pointer appearance-none shadow-inner"
                  style={{
                    backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23F0C56B%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27/%3e%3c/svg%3e')",
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
                      <option key={s} value={s} className="bg-[#0e142e] text-white py-1">{s}</option>
                    ))
                  }
                </select>
              </div>

              {/* Ngôn ngữ */}
              <div className="space-y-3">
                <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Trình độ ngoại ngữ</label>

                {/* Active languages list */}
                {editForm.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2.5 bg-[#060918] border border-white/15 rounded-xl text-left shadow-inner">
                    {editForm.languages.map((lang: string) => (
                      <span key={lang} className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#F0C56B] shadow-sm">
                        {lang}
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(lang)}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer focus:outline-none flex items-center justify-center"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Add Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-semibold block">Gợi ý chọn nhanh:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Tiếng Việt", "Tiếng Anh", "Tiếng Trung", "Tiếng Hàn", "Tiếng Nhật", "Tiếng Pháp"].map((lang) => {
                      const isAdded = editForm.languages.some((l: string) => l.includes(lang));
                      if (isAdded) return null;
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            setSelectedLangName(lang);
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${selectedLangName === lang
                            ? "bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                            : "bg-white/5 hover:bg-amber-400/20 border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300"
                            }`}
                        >
                          <Plus className="h-3 w-3" /> {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Inputs with explicit labels */}
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Field 1: Chọn ngôn ngữ */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        Chọn ngôn ngữ <span className="text-amber-400">*</span>
                      </label>
                      <select
                        value={selectedLangName}
                        onChange={(e) => setSelectedLangName(e.target.value)}
                        className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-400 cursor-pointer appearance-none shadow-inner"
                        style={{
                          backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23F0C56B%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27/%3e%3c/svg%3e')",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 0.75rem center",
                          backgroundSize: "0.85em",
                          paddingRight: "2rem"
                        }}
                      >
                        <option value="" disabled hidden>-- Chọn ngôn ngữ --</option>
                        {availableLanguages
                          .filter((l: string) => !editForm.languages.some((added: string) => added.includes(l)))
                          .map((l: string) => (
                            <option key={l} value={l} className="bg-[#0e142e] text-white py-1">{l}</option>
                          ))
                        }
                      </select>
                    </div>

                    {/* Field 2: Trình độ */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        Trình độ <span className="text-slate-400 text-[8px] uppercase font-normal">(tùy chọn)</span>
                      </label>
                      <input
                        type="text"
                        value={langProficiency}
                        onChange={(e) => setLangProficiency(e.target.value)}
                        placeholder="Ví dụ: Bản xứ, IELTS 7.5..."
                        className="w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-white text-xs font-medium placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Add language button */}
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    disabled={!selectedLangName}
                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${selectedLangName
                      ? "bg-gradient-gold text-slate-950 hover:shadow-[0_0_15px_rgba(240,197,107,0.3)] active:scale-95 cursor-pointer"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                  >
                    <Plus className="h-4 w-4" /> Thêm ngoại ngữ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PHÂN NHÓM 4: PORTFOLIO & MẠNG XÃ HỘI */}
          <div className="bg-[#0e142e]/80 p-5 md:p-6 rounded-2xl border border-white/10 hover:border-amber-400/20 transition-all space-y-4 text-left shadow-md">
            <h4 className="font-bold text-xs md:text-sm text-[#F0C56B] uppercase tracking-widest border-b border-white/10 pb-2.5 mb-3 flex items-center gap-2">
              Portfolio & Mạng xã hội
            </h4>

            <div className="space-y-3">
              <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">
                Chỉ số nổi bật
              </label>
              <div className="flex flex-wrap gap-2 min-h-[42px] p-2.5 bg-[#060918] border border-white/15 rounded-xl text-left shadow-inner">
                {editForm.socialHighlights.length === 0 ? (
                  <span className="text-xs text-slate-400 italic px-2 py-1">Chưa thêm chỉ số nổi bật nào</span>
                ) : (
                  editForm.socialHighlights.map((highlight: string) => (
                    <span key={highlight} className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#F0C56B] shadow-sm">
                      {highlight}
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialHighlight(highlight)}
                        className="text-slate-400 hover:text-rose-400 cursor-pointer focus:outline-none flex items-center justify-center"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
              <select
                value=""
                onChange={(e) => {
                  handleAddSocialHighlight(e.target.value);
                  e.target.value = "";
                }}
                className="w-full bg-[#060918] border border-white/20 rounded-xl px-3 py-2.5 text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-400 cursor-pointer appearance-none shadow-inner"
                style={{
                  backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23F0C56B%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27/%3e%3c/svg%3e')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "0.85em",
                  paddingRight: "2rem"
                }}
              >
                <option value="" disabled hidden>Thêm chỉ số / thành tựu nổi bật...</option>
                {flattenTalentPresetOptions(SOCIAL_HIGHLIGHT_PRESET_GROUPS, editForm.talentTypes)
                  .filter((item) => !editForm.socialHighlights.includes(item))
                  .map((item) => (
                    <option key={item} value={item} className="bg-[#0e142e] text-white py-1">{item}</option>
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
                  className="md:col-span-9 w-full bg-[#060918] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 hover:border-white/35 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => handleAddSocialHighlight(socialHighlightInput)}
                  className="md:col-span-3 w-full bg-gradient-gold text-slate-950 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Thêm
                </button>
              </div>
            </div>

            <div className="border-t border-white/10" />

            <div className="space-y-3">
              <label className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Portfolio URL</label>
              {portfolioLinks.length === 0 ? (
                <div className="text-slate-400 italic text-xs py-1">Chưa có portfolio nào được thêm.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {portfolioLinks.map((link, index) => (
                    <div key={`${link}-${index}`} className="flex items-center justify-between gap-3 bg-[#060918] border border-white/15 rounded-xl px-3.5 py-2.5 shadow-inner">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                          Portfolio {index + 1}
                        </span>
                        <a
                          href={portfolioHref(link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-200 hover:text-white truncate block font-semibold"
                          title={link}
                        >
                          {link.replace(/https?:\/\/(www\.)?/, '')}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePortfolioLink(link)}
                        className="text-slate-400 hover:text-red-400 p-1 cursor-pointer transition-colors"
                        title="Xóa portfolio"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="space-y-1.5 md:col-span-9">
                  <span className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Đường dẫn Portfolio</span>
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
                    className="w-full h-[40px] bg-[#060918] border border-white/20 rounded-xl px-3.5 text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={handleAddPortfolioLink}
                    className="w-full bg-gradient-gold hover:shadow-[0_0_15px_rgba(240,197,107,0.3)] active:scale-95 text-slate-950 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider h-[40px] flex items-center justify-center cursor-pointer transition-all shadow-sm shrink-0"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10" />

            {/* List of added accounts */}
            <div className="space-y-2">
              {socialAccounts.length === 0 ? (
                <div className="text-slate-400 italic text-xs py-1">Chưa có liên kết mạng xã hội nào được thêm.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {socialAccounts.map((account, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 bg-[#060918] border border-white/15 rounded-xl px-3.5 py-2.5 shadow-inner">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                          {account.platform}
                        </span>
                        <a
                          href={account.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-200 hover:text-white truncate block font-semibold"
                          title={account.url}
                        >
                          {account.url.replace(/https?:\/\/(www\.)?/, '')}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSocialAccounts(prev => prev.filter((_, idx) => idx !== index));
                        }}
                        className="text-slate-400 hover:text-red-400 p-1 cursor-pointer transition-colors"
                        title="Xóa liên kết"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input to add new account */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end pt-3 border-t border-white/10">
              <div className="space-y-1.5 md:col-span-3">
                <span className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Chọn nền tảng</span>
                <select
                  value={socialPlatform}
                  onChange={(e) => setSocialPlatform(e.target.value as any)}
                  className="w-full h-[40px] bg-[#060918] border border-white/20 rounded-xl px-3 text-white focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
                >
                  <option value="Tiktok" className="bg-[#0e142e]">Tiktok</option>
                  <option value="Facebook" className="bg-[#0e142e]">Facebook</option>
                  <option value="Instagram" className="bg-[#0e142e]">Instagram</option>
                  <option value="Thread" className="bg-[#0e142e]">Thread</option>
                  <option value="Linkedin" className="bg-[#0e142e]">Linkedin</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-7">
                <span className="block font-bold text-slate-200 uppercase tracking-wider text-[9px] md:text-[10px]">Đường dẫn (Link)</span>
                <input
                  type="url"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-[40px] bg-[#060918] border border-white/20 rounded-xl px-3.5 text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!socialLink.trim()) return;
                    let targetUrl = socialLink.trim();
                    if (!/^https?:\/\//i.test(targetUrl)) {
                      targetUrl = `https://${targetUrl}`;
                    }
                    setSocialAccounts(prev => [...prev, { platform: socialPlatform, url: targetUrl }]);
                    setSocialLink("");
                  }}
                  className="w-full bg-gradient-gold hover:shadow-[0_0_15px_rgba(240,197,107,0.3)] active:scale-95 text-slate-950 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider h-[40px] flex items-center justify-center cursor-pointer transition-all shadow-sm shrink-0"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>

          {/* Lifestyle Companion services config editing */}
          {lifestyleServices && lifestyleServices.length > 0 && (
            <div className="border-t border-white/10 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px] text-left">
                  Dịch Vụ Đồng Hành VIP
                </span>
                <button
                  type="button"
                  onClick={() => setIsLifestyleExpanded(!isLifestyleExpanded)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 hover:bg-amber-400/25 hover:border-amber-400/50 text-[10px] font-black uppercase transition-all duration-300 focus:outline-none shadow-sm"
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
                    <label className="flex items-center gap-2 cursor-pointer select-none bg-[#060918] border border-white/15 px-3 py-1.5 rounded-xl hover:border-white/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={lifestyleServices.length > 0 && lifestyleServices.every(s => s.enabled)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const updated = lifestyleServices.map(s => ({ ...s, enabled: checked }));
                          setLifestyleServices(updated);
                        }}
                        className="rounded accent-amber-400 h-4 w-4 cursor-pointer"
                      />
                      <span className="text-[10px] font-black text-slate-300 uppercase">Chọn tất cả</span>
                    </label>
                  </div>

                  {/* Grid of items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lifestyleServices.map((service, index) => {
                      return (
                        <div key={service.id} className="rounded-2xl border border-white/10 bg-[#060918] p-4.5 space-y-3 text-left shadow-inner">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-white">{service.title}</span>
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={service.enabled}
                                onChange={(e) => {
                                  const updated = [...lifestyleServices];
                                  updated[index] = { ...service, enabled: e.target.checked };
                                  setLifestyleServices(updated);
                                }}
                                className="rounded accent-amber-400 h-4 w-4 cursor-pointer"
                              />
                              <span className="text-[9px] font-black text-slate-300 uppercase">Kích hoạt</span>
                            </label>
                          </div>

                          <p className="text-xs text-slate-400 leading-normal">{service.description}</p>

                          {service.enabled && (
                            <div className="space-y-1.5 animate-in fade-in duration-200">
                              <label className="block font-bold text-slate-300 uppercase tracking-wider text-[9px]">Giá dịch vụ đề xuất (VND / {service.unit})</label>
                              <input
                                type="number"
                                value={service.rate}
                                onChange={(e) => {
                                  const updated = [...lifestyleServices];
                                  updated[index] = { ...service, rate: Number(e.target.value) };
                                  setLifestyleServices(updated);
                                }}
                                className="w-full bg-[#0e142e] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
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
              className="w-full h-11 rounded-xl bg-gradient-gold text-slate-950 font-black uppercase tracking-wider hover:shadow-[0_0_20px_rgba(240,197,107,0.4)] hover:scale-[1.01] active:scale-98 transition-all cursor-pointer shadow-lg text-xs"
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
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0c101d]/90 backdrop-blur-md border-t border-white/5 px-6 py-4 flex items-center shadow-[0_-10px_30px_rgba(0,0,0,0.55)]">
        <button
          type="button"
          onClick={() => handleSave()}
          className="w-full py-3.5 rounded-xl font-display text-xs font-black bg-gradient-gold text-slate-950 shadow-[0_0_15px_rgba(240,197,107,0.3)] active:scale-[0.97] cursor-pointer transition-all uppercase tracking-widest text-center justify-center items-center"
        >
          Lưu thông tin
        </button>
      </div>

    </div>
  );
}
