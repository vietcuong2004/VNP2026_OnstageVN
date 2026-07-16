"use client";

import { clearGuestBrandProfileDraft, hasGuestBrandProfileDraft, loadGuestBrandProfileDraft, mapBackendPartnerProfile, saveBrandPartnerProfile } from "@/lib/brand-api";
import { saveTalentProfile } from "@/lib/talent-api";

const TALENT_PROFILE_DRAFT_KEY = "vnp_talent_profile";

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
    "facebook_url",
    "tiktok_url",
    "instagram_url",
    "linkedin_url",
  ];

  if (scalarFields.some((field) => String(profile[field] ?? "").trim() !== "")) {
    return true;
  }

  const arrayFields = ["talentTypes", "specialSkills", "skills", "languages", "photos"];
  return arrayFields.some((field) => Array.isArray(profile[field]) && (profile[field] as unknown[]).length > 0);
}

export async function syncGuestTalentProfileDraft() {
  if (typeof window === "undefined") return false;

  const raw = window.localStorage.getItem(TALENT_PROFILE_DRAFT_KEY);
  if (!raw) return false;

  try {
    const profile = JSON.parse(raw) as Record<string, unknown>;
    if (!profile || !hasUsefulTalentDraft(profile)) return false;

    await saveTalentProfile(profile);
    return true;
  } catch (error) {
    console.warn("Cannot sync guest talent draft", error);
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
  const [talentSynced, brandSynced] = await Promise.all([
    syncGuestTalentProfileDraft(),
    syncGuestBrandProfileDraft(),
  ]);

  return talentSynced || brandSynced;
}
