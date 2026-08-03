const TALENT_VIEW_HISTORY_KEY = "onstagevn_viewed_talent_ids";

export function loadViewedTalentIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(TALENT_VIEW_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return Array.from(new Set(parsed.map((id) => String(id)).filter(Boolean)));
  } catch {
    return [];
  }
}

export function saveViewedTalentIds(ids: string[]) {
  if (typeof window === "undefined") return;
  const uniqueIds = Array.from(new Set(ids.map((id) => String(id)).filter(Boolean)));
  window.localStorage.setItem(TALENT_VIEW_HISTORY_KEY, JSON.stringify(uniqueIds));
}

export function addViewedTalentId(talentId: string | number) {
  const id = String(talentId);
  if (!id) return [];

  const currentIds = loadViewedTalentIds();
  const nextIds = [id, ...currentIds.filter((item) => item !== id)].slice(0, 100);
  saveViewedTalentIds(nextIds);
  return nextIds;
}
