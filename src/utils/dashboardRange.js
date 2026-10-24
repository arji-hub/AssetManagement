// utils/dashboardRange.js
// Shared month/year bucketing helpers for dashboard summary hooks.
// Extracted from useReportSummary.js — you can switch useReportSummary over
// to these too (pass () => ({ damaged: 0, missing: 0 }) as makeBucket).

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function parseDate(value) {
  if (!value) return null;
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** makeBucket returns the zeroed counters for one bucket, e.g. () => ({ completed: 0 }) */
export function buildEmptyBuckets(range, referenceDate, makeBucket) {
  if (range === "year") {
    return MONTH_LABELS.map((label, index) => ({
      key: index,
      label,
      ...makeBucket(),
    }));
  }

  const daysInMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    0,
  ).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => ({
    key: index + 1,
    label: String(index + 1),
    ...makeBucket(),
  }));
}

export function getPeriodBounds(range, referenceDate, offset = 0) {
  if (range === "year") {
    const year = referenceDate.getFullYear() + offset;
    return { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) };
  }
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() + offset;
  return { start: new Date(year, month, 1), end: new Date(year, month + 1, 1) };
}
