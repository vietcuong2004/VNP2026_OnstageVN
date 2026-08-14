"use client";

import { normalizeTalentTypeList } from "@/components/ui/ComboboxOptionValues";
import { API_BASE_URL } from "@/lib/api-client";
import { saveGuestPortfolioVideoFiles } from "@/lib/guest-video-draft";
import { persistTalentProfile } from "@/lib/talent-api";
import { GUEST_SURVEY_PASSWORD } from "./Step3Dialog";

export const GUEST_PROFILE_SYNC_KEY = "vnp_guest_profile_sync";

type Step3SurveyFormData = {
  name: string;
  location: string;
  phone: string;
  email: string;
  gender: string;
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
  cover?: string | null;
  fullBody?: string | null;
  portfolioPhotos?: string | null;
  portfolioVideos?: string | null;
};

type Step3ProfileSaveInput = {
  formData: Step3SurveyFormData;
  avatarFile: File | null;
  avatarDataUrl: string;
  avatarPreviewUrl: string | null;
  coverFile?: File | null;
  coverPreviewUrl?: string | null;
  fullBodyFile?: File | null;
  fullBodyPreviewUrl?: string | null;
  portfolioPhotoFiles?: { file: File }[];
  portfolioVideoFiles?: { file: File; name?: string }[];
  portfolioVideoLinks?: { id: string; title: string; url: string }[];
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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function fileToDataUrl(file: File) {
  if (typeof window === "undefined" || typeof document === "undefined" || !file.type.startsWith("image/")) {
    return readFileAsDataUrl(file);
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Cannot load image"));
    });
    image.src = objectUrl;
    await loaded;

    const maxSize = 720;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth || 1, image.naturalHeight || 1));
    const width = Math.max(1, Math.round((image.naturalWidth || 1) * scale));
    const height = Math.max(1, Math.round((image.naturalHeight || 1) * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return readFileAsDataUrl(file);

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.86);
  } catch {
    return readFileAsDataUrl(file);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function dataUrlToFile(dataUrl: string, filename: string) {
  const [header, data] = dataUrl.split(",");
  const mime = header?.match(/data:([^;]+)/)?.[1] || "image/png";
  const binary = atob(data || "");
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], filename, { type: mime });
}

import { safeSetLocalStorage } from "@/lib/storage-utils";

export function persistGuestProfileSyncDraft(profile: Record<string, unknown>) {
  safeSetLocalStorage(GUEST_PROFILE_SYNC_KEY, profile);
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
  coverFile,
  coverPreviewUrl,
  fullBodyFile,
  fullBodyPreviewUrl,
  portfolioPhotoFiles = [],
  portfolioVideoFiles = [],
  portfolioVideoLinks = [],
  mediaUploads,
  socialHighlights,
  portfolioLinks,
  socialAccounts,
}: Step3ProfileSaveInput) {
  const selectedAvatar = avatarDataUrl || (avatarFile ? await fileToDataUrl(avatarFile).catch(() => "") : "") || (avatarPreviewUrl?.startsWith("data:") ? avatarPreviewUrl : "");
  const selectedCover = coverFile ? await fileToDataUrl(coverFile).catch(() => "") : (coverPreviewUrl?.startsWith("data:") ? coverPreviewUrl : "");
  const selectedFullBody = fullBodyFile ? await fileToDataUrl(fullBodyFile).catch(() => "") : (fullBodyPreviewUrl?.startsWith("data:") ? fullBodyPreviewUrl : "");
  const selectedPhotos = (await Promise.all(
    portfolioPhotoFiles.map((item) => fileToDataUrl(item.file).catch(() => ""))
  )).filter(Boolean);
  const guestPortfolioVideoFileIds = portfolioVideoFiles.length
    ? await saveGuestPortfolioVideoFiles(portfolioVideoFiles.map((item) => item.file)).catch(() => [])
    : [];
  const normalizedTalentTypes = normalizeTalentTypeList(formData.talentTypes);
  const skills = splitSkillValues(formData.skills);

  const draft: Record<string, unknown> = {
    ...formData,
    avatar: selectedAvatar || "/avatar.png",
    cover: selectedCover || coverPreviewUrl || "",
    fullBody: selectedFullBody || fullBodyPreviewUrl || "",
    photos: selectedPhotos,
    videos: portfolioVideoLinks.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      video_type: "portfolio",
    })),
    guestPortfolioVideoFileIds,
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

  selectedPhotos.slice(0, 8).forEach((photo, index) => {
    draft[`lookbook${index + 1}`] = photo;
  });

  return draft;
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
