const SAVED_JOBS_KEY = "onstagevn_saved_jobs";

export const SAVED_JOBS_UPDATED_EVENT = "onstagevn_saved_jobs_updated";

export type SavedJobRecord = {
  id: string;
  job: any;
  savedAt: string;
};

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
