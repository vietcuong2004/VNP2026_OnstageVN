"use client";

import { normalizeTalentTypeList } from "@/components/ui/ComboboxOptionValues";
import { API_BASE_URL } from "@/lib/api-client";
import { persistTalentProfile } from "@/lib/talent-api";
import { GUEST_SURVEY_PASSWORD } from "./Step3Dialog";

export const GUEST_PROFILE_SYNC_KEY = "vnp_guest_profile_sync";

type Step3SurveyFormData = {
  name: string;
  location: string;
  phone: string;
  email: string;
  height: string;
  weight: string;
  bust: string;
  waist: string;
  hips: string;
  languages: string[];
  talentTypes: string[];
  price: string;
  skills: string;
  experience: string;
  professionalExperience: string;
  tiktokUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  tiktokFollowers: string;
  instagramFollowers: string;
  facebookFollowers: string;
  youtubeFollowers: string;
  [key: string]: unknown;
};

type Step3MediaUploads = {
  avatar: string | null;
  portfolio: string | null;
  introVideo: string | null;
};

type Step3ProfileSaveInput = {
  formData: Step3SurveyFormData;
  avatarFile: File | null;
  avatarDataUrl: string;
  avatarPreviewUrl: string | null;
  mediaUploads: Step3MediaUploads;
  socialHighlights: string[];
  portfolioLinks: string[];
  socialAccounts: { platform: string; url: string }[];
  guestAccountReady: boolean;
};

export function splitSkillValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function persistGuestProfileSyncDraft(profile: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_PROFILE_SYNC_KEY, JSON.stringify(profile));
}

async function parseSurveyRegisterError(response: Response) {
  try {
    const data = await response.json();
    const firstError = data?.errors && typeof data.errors === "object"
      ? Object.values(data.errors).flat().find(Boolean)
      : null;
    const message = typeof firstError === "string"
      ? firstError
      : typeof data?.message === "string"
        ? data.message
        : "";

    if (/validation\.unique|already been taken|email.*exist|email.*tồn tại|unique/i.test(message)) {
      return "EMAIL_ALREADY_EXISTS";
    }

    if (message) return message;
  } catch {
    // Ignore invalid error payloads and use the generic message below.
  }

  return "Không thể tạo tài khoản OnstageVN. Vui lòng thử lại.";
}

async function createGuestSurveyAccount(formData: Step3SurveyFormData) {
  const email = formData.email.trim().toLowerCase();
  if (!email) {
    throw new Error("Vui lòng nhập email liên hệ ở bước 1 để tạo tài khoản OnstageVN.");
  }

  const response = await fetch(`${API_BASE_URL}/auth/survey-account`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: formData.name.trim() || email.split("@")[0],
      email,
      phone: formData.phone.trim() || undefined,
      password: GUEST_SURVEY_PASSWORD,
      password_confirmation: GUEST_SURVEY_PASSWORD,
      type: "talent",
    }),
  });

  if (!response.ok) {
    const message = await parseSurveyRegisterError(response);
    if (message === "EMAIL_ALREADY_EXISTS") {
      return { existed: true };
    }
    throw new Error(message);
  }

  return response.json();
}

async function buildStep3GuestProfileDraft({
  formData,
  avatarFile,
  avatarDataUrl,
  avatarPreviewUrl,
  mediaUploads,
  socialHighlights,
  portfolioLinks,
  socialAccounts,
}: Step3ProfileSaveInput) {
  const selectedAvatar = avatarFile
    ? avatarDataUrl || await fileToDataUrl(avatarFile).catch(() => "")
    : avatarPreviewUrl || "";
  const normalizedTalentTypes = normalizeTalentTypeList(formData.talentTypes);
  const skills = splitSkillValues(formData.skills);

  return {
    ...formData,
    avatar: selectedAvatar || "/avatar.png",
    skills,
    specialSkills: skills,
    talentTypes: normalizedTalentTypes,
    socialHighlights,
    social_highlights: socialHighlights,
    portfolioLinks,
    portfolio_links: portfolioLinks,
    portfolio_url: portfolioLinks.join("\n"),
    socialAccounts,
    experienceText: formData.professionalExperience,
    bio: formData.professionalExperience,
    isOnboarded: false,
    mediaUploads,
  };
}

export async function saveStep3GuestProfileDraft(input: Step3ProfileSaveInput) {
  const guestProfileDraft = await buildStep3GuestProfileDraft(input);
  persistTalentProfile(guestProfileDraft);
  persistGuestProfileSyncDraft(guestProfileDraft);
  return guestProfileDraft;
}

export async function completeStep3GuestProfile(input: Step3ProfileSaveInput) {
  await saveStep3GuestProfileDraft(input);
  if (!input.guestAccountReady) {
    await createGuestSurveyAccount(input.formData);
  }
}
