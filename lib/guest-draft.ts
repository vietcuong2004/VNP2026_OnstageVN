"use client";

import { clearGuestBrandProfileDraft, hasGuestBrandProfileDraft, loadGuestBrandProfileDraft, mapBackendPartnerProfile, saveBrandPartnerProfile } from "@/lib/brand-api";
import { clearGuestPortfolioVideoFiles, loadGuestPortfolioVideoFiles } from "@/lib/guest-video-draft";
import { analyzeTalentSurvey, createTalentVideoLink, persistTalentProfile, saveTalentProfileOrThrow, saveTalentSurveyProgress, submitTalentSurvey, uploadTalentPhoto, uploadTalentVideo } from "@/lib/talent-api";

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

  const arrayFields = ["talentTypes", "specialSkills", "skills", "languages", "photos", "socialAccounts", "videos", "guestPortfolioVideoFileIds"];
  return arrayFields.some((field) => Array.isArray(profile[field]) && (profile[field] as unknown[]).length > 0);
}

async function saveTalentProfileWithAvatar(profile: Record<string, unknown>) {
  const { email: _email, phone: _phone, ...profilePayload } = profile;
  const savedProfile = await saveTalentProfileOrThrow(profilePayload);
  const profileId = Number(savedProfile?.backendProfileId || 0);

  const uploadDataUrlPhoto = async (dataUrl: string, category: string, filename: string) => {
    if (!dataUrl.startsWith("data:image/") || !profileId) return null;
    try {
      const file = dataUrlToFile(dataUrl, filename);
      return await uploadTalentPhoto(profileId, file, category);
    } catch (err) {
      console.warn(`Failed to upload ${category} photo during guest draft sync`, err);
      return null;
    }
  };

  const avatar = String(profile.avatar || "");
  const uploadedAvatar = await uploadDataUrlPhoto(avatar, "avatar", "survey-avatar.png");
  if (uploadedAvatar?.url) {
    savedProfile.avatar = uploadedAvatar.url;
  }

  const cover = String(profile.cover || "");
  const uploadedCover = await uploadDataUrlPhoto(cover, "cover", "survey-cover.png");
  if (uploadedCover?.url) {
    savedProfile.cover = uploadedCover.url;
  }

  const fullBody = String(profile.fullBody || "");
  const uploadedFullBody = await uploadDataUrlPhoto(fullBody, "full_body", "survey-full-body.png");
  if (uploadedFullBody?.url) {
    savedProfile.fullBody = uploadedFullBody.url;
  }

  const photoDataUrls = Array.isArray(profile.photos)
    ? profile.photos.map((item) => String(item || "")).filter((item) => item.startsWith("data:image/"))
    : [];

  if (photoDataUrls.length && profileId) {
    const uploadedPhotos: string[] = [];

    for (const [index, dataUrl] of photoDataUrls.entries()) {
      const uploadedPhoto = await uploadDataUrlPhoto(dataUrl, "portfolio", `survey-portfolio-${index + 1}.png`);
      if (uploadedPhoto?.url) uploadedPhotos.push(uploadedPhoto.url);
    }

    if (uploadedPhotos.length) {
      savedProfile.photos = [...(Array.isArray(savedProfile.photos) ? savedProfile.photos : []), ...uploadedPhotos].slice(0, 8);
      uploadedPhotos.forEach((url, index) => {
        savedProfile[`lookbook${index + 1}`] = url;
      });
    }
  }

  const createdVideos: any[] = [];
  const videoLinks = Array.isArray(profile.videos)
    ? profile.videos
      .map((item) => item && typeof item === "object" ? item as Record<string, unknown> : null)
      .filter(Boolean)
    : [];

  if (profileId && videoLinks.length) {
    for (const [index, video] of videoLinks.entries()) {
      const url = String(video?.url || "").trim();
      if (!url || url.startsWith("blob:")) continue;

      try {
        const createdVideo = await createTalentVideoLink(
          profileId,
          url,
          String(video?.title || `Video ${index + 1}`)
        );
        if (createdVideo?.url) createdVideos.push(createdVideo);
      } catch (err) {
        console.warn("Failed to create portfolio video link during guest draft sync", err);
      }
    }
  }

  const videoFileIds = Array.isArray(profile.guestPortfolioVideoFileIds)
    ? profile.guestPortfolioVideoFileIds.map((item) => String(item || "")).filter(Boolean)
    : [];

  if (profileId && videoFileIds.length) {
    const videoFileRecords = await loadGuestPortfolioVideoFiles(videoFileIds).catch(() => []);

    for (const record of videoFileRecords) {
      try {
        const uploadedVideo = await uploadTalentVideo(
          profileId,
          record.file,
          record.name.replace(/\.[^.]+$/, "") || "Portfolio video"
        );
        if (uploadedVideo?.url) createdVideos.push(uploadedVideo);
      } catch (err) {
        console.warn("Failed to upload portfolio video during guest draft sync", err);
      }
    }

    await clearGuestPortfolioVideoFiles(videoFileIds).catch(() => undefined);
  }

  if (createdVideos.length) {
    savedProfile.videos = [...(Array.isArray(savedProfile.videos) ? savedProfile.videos : []), ...createdVideos].slice(0, 4);
  }

  persistTalentProfile(savedProfile);
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

export function hasGuestDraftsToSync() {
  if (typeof window === "undefined") return false;

  return Boolean(
    window.localStorage.getItem(GUEST_PROFILE_SYNC_KEY) ||
    window.localStorage.getItem(GUEST_SURVEY_SYNC_KEY) ||
    hasGuestBrandProfileDraft()
  );
}

export async function syncGuestDraftsAfterNewRegistration() {
  const talentSynced = await syncGuestTalentProfileDraft();
  const surveySynced = await syncGuestTalentSurveyDraft();
  const brandSynced = await syncGuestBrandProfileDraft();

  return talentSynced || surveySynced || brandSynced;
}
