"use client";

import { clearGuestBrandProfileDraft, hasGuestBrandProfileDraft, loadGuestBrandProfileDraft, mapBackendPartnerProfile, saveBrandPartnerProfile } from "@/lib/brand-api";
import { analyzeTalentSurvey, saveTalentProfile, saveTalentSurveyProgress, submitTalentSurvey, uploadTalentPhoto } from "@/lib/talent-api";

const TALENT_PROFILE_DRAFT_KEY = "vnp_talent_profile";
const GUEST_PROFILE_SYNC_KEY = "vnp_guest_profile_sync";
const GUEST_SURVEY_SYNC_KEY = "vnp_guest_survey_sync";

type SurveyAnswer = { question_code: string; answer_value: unknown };

function dataUrlToFile(dataUrl: string, filename: string) {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/data:([^;]+)/)?.[1] || "image/png";
  const binary = atob(data || "");
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], filename, { type: mime });
}

function hasUsefulTalentDraft(profile: Record<string, unknown>) {
  const scalarFields = [
    "name",
    "email",
    "phone",
    "location",
    "hometown",
    "education",
    "bio",
    "height",
    "weight",
    "bust",
    "waist",
    "hips",
    "experience",
    "price",
    "portfolio_url",
  ];

  if (scalarFields.some((field) => String(profile[field] ?? "").trim() !== "")) {
    return true;
  }

  const arrayFields = ["talentTypes", "specialSkills", "skills", "languages", "photos", "socialAccounts"];
  return arrayFields.some((field) => Array.isArray(profile[field]) && (profile[field] as unknown[]).length > 0);
}

async function saveTalentProfileWithAvatar(profile: Record<string, unknown>) {
  const { email: _email, phone: _phone, ...profilePayload } = profile;
  const savedProfile = await saveTalentProfile(profilePayload);
  const avatar = String(profile.avatar || "");

  if (avatar.startsWith("data:image/") && savedProfile?.backendProfileId) {
    const file = dataUrlToFile(avatar, "survey-avatar.png");
    await uploadTalentPhoto(Number(savedProfile.backendProfileId), file, "avatar");
  }

  return savedProfile;
}

export async function syncGuestTalentProfileDraft() {
  if (typeof window === "undefined") return false;

  const rawGuestProfileDraft = window.localStorage.getItem(GUEST_PROFILE_SYNC_KEY);
  const raw = rawGuestProfileDraft || window.localStorage.getItem(TALENT_PROFILE_DRAFT_KEY);
  if (!raw) return false;

  try {
    const profile = JSON.parse(raw) as Record<string, unknown>;
    if (!profile || !hasUsefulTalentDraft(profile)) return false;

    await saveTalentProfileWithAvatar(profile);
    if (rawGuestProfileDraft) {
      await saveTalentSurveyProgress(3, "draft");
    }

    window.localStorage.removeItem(GUEST_PROFILE_SYNC_KEY);
    return true;
  } catch (error) {
    console.warn("Cannot sync guest talent draft", error);
    return false;
  }
}

export async function syncGuestTalentSurveyDraft() {
  if (typeof window === "undefined") return false;

  const raw = window.localStorage.getItem(GUEST_SURVEY_SYNC_KEY);
  if (!raw) return false;

  try {
    const draft = JSON.parse(raw) as {
      profile?: Record<string, unknown>;
      sectionAAnswers?: SurveyAnswer[];
      sectionSAnswers?: SurveyAnswer[];
    };
    const sectionAAnswers = Array.isArray(draft.sectionAAnswers) ? draft.sectionAAnswers : [];
    const sectionSAnswers = Array.isArray(draft.sectionSAnswers) ? draft.sectionSAnswers : [];

    if (draft.profile) {
      await saveTalentProfileWithAvatar(draft.profile);
    }

    if (sectionAAnswers.length) {
      await submitTalentSurvey("A", sectionAAnswers);
    }

    if (sectionSAnswers.length) {
      await submitTalentSurvey("S", sectionSAnswers);
    }

    if (sectionAAnswers.length || sectionSAnswers.length) {
      await analyzeTalentSurvey().catch((error) => {
        console.warn("Cannot analyze guest survey draft", error);
        return null;
      });
      await saveTalentSurveyProgress(5, "analyzed");
    }

    window.localStorage.removeItem(GUEST_SURVEY_SYNC_KEY);
    return true;
  } catch (error) {
    console.warn("Cannot sync guest survey draft", error);
    return false;
  }
}


export async function syncGuestBrandProfileDraft() {
  if (typeof window === "undefined" || !hasGuestBrandProfileDraft()) return false;

  try {
    const emptyProfile = mapBackendPartnerProfile(null);
    const draft = loadGuestBrandProfileDraft(emptyProfile);
    await saveBrandPartnerProfile(draft);
    clearGuestBrandProfileDraft();
    return true;
  } catch (error) {
    console.warn("Cannot sync guest brand draft", error);
    return false;
  }
}

export async function syncGuestDraftsAfterNewRegistration() {
  const talentSynced = await syncGuestTalentProfileDraft();
  const surveySynced = await syncGuestTalentSurveyDraft();
  const brandSynced = await syncGuestBrandProfileDraft();

  return talentSynced || surveySynced || brandSynced;
}
