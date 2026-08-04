import { apiJson, getAuthToken } from "@/lib/api-client";
import { mapCampaignToTalentJob } from "@/lib/talent-api";

const SAVED_JOBS_KEY = "onstagevn_saved_jobs";

export const SAVED_JOBS_UPDATED_EVENT = "onstagevn_saved_jobs_updated";

export type SavedJobRecord = {
  id: string;
  job: any;
  savedAt: string;
  backendId?: string;
};

type BackendSavedJob = {
  id: string | number;
  campaign_id: string | number;
  saved_at?: string | null;
  created_at?: string | null;
  campaign?: any;
};

let sessionSavedJobsCache: { records: SavedJobRecord[]; expiresAt: number } | null = null;
const SESSION_SAVED_JOBS_CACHE_MS = 3000;

function cacheSessionSavedJobs(records: SavedJobRecord[]) {
  sessionSavedJobsCache = {
    records,
    expiresAt: Date.now() + SESSION_SAVED_JOBS_CACHE_MS,
  };
}

export function notifySavedJobsUpdated(count?: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SAVED_JOBS_UPDATED_EVENT, { detail: { count } }));
}

export function loadSavedJobs(): SavedJobRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SAVED_JOBS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        id: String(item?.id || item?.job?.id || ""),
        backendId: item?.backendId ? String(item.backendId) : undefined,
        job: item?.job || item,
        savedAt: item?.savedAt || new Date().toISOString(),
      }))
      .filter((item) => item.id && item.job)
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  } catch {
    return [];
  }
}

export function loadSavedJobIds(): string[] {
  return loadSavedJobs().map((item) => item.id);
}

export function saveSavedJobs(records: SavedJobRecord[]) {
  if (typeof window === "undefined") return;

  const uniqueRecords = Array.from(
    new Map(records.map((record) => [String(record.id), { ...record, id: String(record.id) }])).values()
  );

  window.localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(uniqueRecords));
  notifySavedJobsUpdated(uniqueRecords.length);
}

export function toggleSavedJob(job: any) {
  const id = String(job?.id || "");
  if (!id) return { isSaved: false, jobs: loadSavedJobs() };

  const currentJobs = loadSavedJobs();
  const isSaved = currentJobs.some((item) => item.id === id);
  const nextJobs = isSaved
    ? currentJobs.filter((item) => item.id !== id)
    : [{ id, job, savedAt: new Date().toISOString() }, ...currentJobs];

  saveSavedJobs(nextJobs);
  return { isSaved: !isSaved, jobs: nextJobs };
}

function mapBackendSavedJob(item: BackendSavedJob): SavedJobRecord | null {
  if (!item?.campaign) return null;

  const job = mapCampaignToTalentJob(item.campaign);
  const id = String(item.campaign_id || job?.id || "");
  if (!id) return null;

  return {
    id,
    backendId: String(item.id),
    job,
    savedAt: item.saved_at || item.created_at || new Date().toISOString(),
  };
}

export async function loadSavedJobsForSession(): Promise<SavedJobRecord[]> {
  if (!getAuthToken()) return loadSavedJobs();

  if (sessionSavedJobsCache && sessionSavedJobsCache.expiresAt > Date.now()) {
    return sessionSavedJobsCache.records;
  }

  try {
    const response = await apiJson<{ data?: BackendSavedJob[] }>("/talent/saved-jobs", {
      clearAuthOnUnauthorized: false,
    });

    const records = (response?.data || [])
      .map(mapBackendSavedJob)
      .filter((item): item is SavedJobRecord => Boolean(item))
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

    cacheSessionSavedJobs(records);
    return records;
  } catch (error) {
    console.warn("Cannot load saved jobs", error);
    return [];
  }
}

export async function loadSavedJobIdsForSession(): Promise<string[]> {
  const jobs = await loadSavedJobsForSession();
  return jobs.map((item) => item.id);
}

export async function toggleSavedJobForSession(job: any): Promise<{ isSaved: boolean; jobs: SavedJobRecord[] }> {
  if (!getAuthToken()) return toggleSavedJob(job);

  const id = String(job?.id || "");
  if (!id) return { isSaved: false, jobs: await loadSavedJobsForSession() };

  const currentJobs = await loadSavedJobsForSession();
  const currentJob = currentJobs.find((item) => item.id === id);

  if (currentJob?.backendId) {
    await apiJson(`/talent/saved-jobs/${currentJob.backendId}`, {
      method: "DELETE",
      clearAuthOnUnauthorized: false,
    });

    const nextJobs = currentJobs.filter((item) => item.id !== id);
    cacheSessionSavedJobs(nextJobs);
    notifySavedJobsUpdated(nextJobs.length);
    return { isSaved: false, jobs: nextJobs };
  }

  const response = await apiJson<{ data?: BackendSavedJob }>("/talent/saved-jobs", {
    method: "POST",
    body: JSON.stringify({ campaign_id: id }),
    clearAuthOnUnauthorized: false,
  });

  const savedJob = response?.data ? mapBackendSavedJob(response.data) : null;
  const nextJobs = [
    savedJob || { id, job, savedAt: new Date().toISOString() },
    ...currentJobs.filter((item) => item.id !== id),
  ];

  cacheSessionSavedJobs(nextJobs);
  notifySavedJobsUpdated(nextJobs.length);
  return { isSaved: true, jobs: nextJobs };
}
