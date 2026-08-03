const GUEST_SAVED_TALENTS_KEY = "onstagevn_guest_saved_talent_ids";

export function loadGuestSavedTalentIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(GUEST_SAVED_TALENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return Array.from(new Set(parsed.map((id) => String(id)).filter(Boolean)));
  } catch {
    return [];
  }
}

export function saveGuestSavedTalentIds(ids: string[]) {
  if (typeof window === "undefined") return;
  const uniqueIds = Array.from(new Set(ids.map((id) => String(id)).filter(Boolean)));
  window.localStorage.setItem(GUEST_SAVED_TALENTS_KEY, JSON.stringify(uniqueIds));
}

export function toggleGuestSavedTalentId(talentId: string) {
  const currentIds = loadGuestSavedTalentIds();
  const isSaved = currentIds.includes(talentId);
  const nextIds = isSaved
    ? currentIds.filter((id) => id !== talentId)
    : [...currentIds, talentId];

  saveGuestSavedTalentIds(nextIds);
  return { isSaved: !isSaved, ids: nextIds };
}
