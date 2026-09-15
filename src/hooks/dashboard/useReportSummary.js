import { useEffect, useMemo, useState } from "react";
import { subscribeToReports } from "../../services/report";
import { ROLES } from "../../data/roles";
import { REPORT_STATUS } from "../../data/reports";

const MONTH_LABELS = [
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

function parseReportDate(value) {
  if (!value) return null;
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildEmptyBuckets(range, referenceDate) {
  if (range === "year") {
    return MONTH_LABELS.map((label, index) => ({
      key: index,
      label,
      damaged: 0,
      missing: 0,
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
    damaged: 0,
    missing: 0,
  }));
}

function getPeriodBounds(range, referenceDate, offset = 0) {
  if (range === "year") {
    const year = referenceDate.getFullYear() + offset;
    return { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) };
  }
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() + offset;
  return { start: new Date(year, month, 1), end: new Date(year, month + 1, 1) };
}

function tallyPeriod(reports, start, end) {
  let damaged = 0;
  let missing = 0;

  for (const report of reports) {
    const reportedAt = parseReportDate(
      report.date_reported ?? report.created_at,
    );
    if (!reportedAt || reportedAt < start || reportedAt >= end) continue;

    if (report.type === REPORT_STATUS.DAMAGED) damaged += 1;
    if (report.type === REPORT_STATUS.MISSING) missing += 1;
  }

  return { damaged, missing, all: damaged + missing };
}

export function useReportSummary(user, range = "month", mockReports = null) {
  const [reports, setReports] = useState(mockReports ?? []);
  const [loading, setLoading] = useState(!mockReports);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mockReports) return;
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    const uidFilter = user.role === ROLES.ADMIN ? undefined : user.uid;

    const unsubscribe = subscribeToReports(
      uidFilter,
      (data) => {
        setReports(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid, user?.role, mockReports]);

  return useMemo(() => {
    const now = new Date();
    const buckets = buildEmptyBuckets(range, now);
    const bucketByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    const { start: currentStart, end: currentEnd } = getPeriodBounds(
      range,
      now,
      0,
    );
    const { start: prevStart, end: prevEnd } = getPeriodBounds(range, now, -1);

    let unresolved = 0;

    for (const report of reports) {
      const reportedAt = parseReportDate(
        report.date_reported ?? report.created_at,
      );
      if (!reportedAt || reportedAt < currentStart || reportedAt >= currentEnd)
        continue;

      const bucketKey =
        range === "month" ? reportedAt.getDate() : reportedAt.getMonth();
      const bucket = bucketByKey.get(bucketKey);
      if (!bucket) continue;

      const isDamaged = report.type === REPORT_STATUS.DAMAGED;
      const isMissing = report.type === REPORT_STATUS.MISSING;
      if (isDamaged) bucket.damaged += 1;
      if (isMissing) bucket.missing += 1;
      if ((isDamaged || isMissing) && report.date_resolved === null)
        unresolved += 1;
    }

    const current = tallyPeriod(reports, currentStart, currentEnd);
    const previous = tallyPeriod(reports, prevStart, prevEnd);

    const delta = current.all - previous.all;
    const deltaPercent =
      previous.all === 0
        ? current.all > 0
          ? 100
          : 0
        : Math.round((delta / previous.all) * 100);

    return {
      series: buckets,
      totals: { ...current, unresolved },
      trend: {
        delta,
        deltaPercent,
        direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
      },
      loading,
      error,
    };
  }, [reports, range, loading, error]);
}
