"use client";

export type TalentDayStatus = "available" | "busy";

function normalizeDateKey(value: unknown) {
  const text = String(value || "").trim();
  const matched = text.match(/^(\d{4}-\d{2}-\d{2})/);
  return matched ? matched[1] : "";
}

export function normalizeAvailabilityCalendar(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];

  const manualBusyDates = value
    .map((entry) => String(entry || "").trim())
    .filter((entry) => Boolean(entry) && !entry.endsWith(":available") && !entry.endsWith(":maybe"))
    .map((entry) => normalizeDateKey(entry))
    .filter(Boolean);

  return Array.from(new Set(manualBusyDates));
}

export function normalizeBusyDates(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];

  return Array.from(
    new Set(
      value
        .map((entry) => normalizeDateKey(entry))
        .filter(Boolean),
    ),
  );
}

export function busyDatesFromEvents(events: Array<{ starts_at?: string | null }> | null | undefined) {
  if (!Array.isArray(events)) return [] as string[];

  return normalizeBusyDates(events.map((event) => event?.starts_at || ""));
}

export function busyDatesFromTodoLists(todoLists: Record<string, any[]>) {
  return normalizeBusyDates(
    Object.entries(todoLists)
      .filter(([, items]) => Array.isArray(items) && items.length > 0)
      .map(([date]) => date),
  );
}

export function getTalentDayStatus(
  dateStr: string,
  availabilityCalendar: unknown,
  busyDates: unknown,
): TalentDayStatus {
  const normalizedDate = normalizeDateKey(dateStr);
  const blockedDates = normalizeBusyDates(busyDates);
  if (blockedDates.includes(normalizedDate)) return "busy";

  const manualBusyDates = normalizeAvailabilityCalendar(availabilityCalendar);
  return manualBusyDates.includes(normalizedDate) ? "busy" : "available";
}

export function toggleManualBusyDate(
  dateStr: string,
  availabilityCalendar: unknown,
  busyDates: unknown,
) {
  const normalizedDate = normalizeDateKey(dateStr);
  const blockedDates = normalizeBusyDates(busyDates);
  const manualBusyDates = normalizeAvailabilityCalendar(availabilityCalendar);

  if (blockedDates.includes(normalizedDate)) {
    return manualBusyDates;
  }

  if (manualBusyDates.includes(normalizedDate)) {
    return manualBusyDates.filter((entry) => entry !== normalizedDate);
  }

  return [...manualBusyDates, normalizedDate];
}
