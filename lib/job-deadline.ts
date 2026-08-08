export function getApplicationDeadlineEnd(value?: string | null): Date | null {
  const text = String(value || "").trim();
  if (!text) return null;

  if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}/.test(text)) {
    const normalized = text.includes("T") ? text : text.replace(" ", "T");
    const parsedDateTime = new Date(normalized);
    return Number.isNaN(parsedDateTime.getTime()) ? null : parsedDateTime;
  }

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/.exec(text);
  if (isoDate) {
    return new Date(
      Number(isoDate[1]),
      Number(isoDate[2]) - 1,
      Number(isoDate[3]),
      23,
      59,
      59,
      999
    );
  }

  const vietnameseDate = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  if (vietnameseDate) {
    return new Date(
      Number(vietnameseDate[3]),
      Number(vietnameseDate[2]) - 1,
      Number(vietnameseDate[1]),
      23,
      59,
      59,
      999
    );
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isApplicationDeadlineExpired(value?: string | null, now = new Date()): boolean {
  const deadlineEnd = getApplicationDeadlineEnd(value);
  if (!deadlineEnd) return false;

  return deadlineEnd.getTime() < now.getTime();
}
