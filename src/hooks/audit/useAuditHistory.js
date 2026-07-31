import { useState, useMemo, useEffect } from "react";
import { getTimeValue } from "../../utils/date";
import useResponsivePageSize from "../asset/useResponsivePageSize";

export default function useAuditHistory({
  reportLogs = [],
  auditLogs = [],
  onReportClick,
  onAuditClick,
  desktopPageSize = 10,
  mobilePageSize = 5,
} = {}) {
  const pageSize = useResponsivePageSize(desktopPageSize, mobilePageSize);
  const [page, setPage] = useState(1);

  const combined = useMemo(() => {
    const reports = reportLogs.map((log) => ({ ...log, __type: "report" }));
    const audits = auditLogs.map((log) => ({ ...log, __type: "audit" }));

    return [...reports, ...audits].sort(
      (a, b) => getTimeValue(b.created_at) - getTimeValue(a.created_at),
    );
  }, [reportLogs, auditLogs]);

  const totalPages = Math.max(1, Math.ceil(combined.length / pageSize));

  // Clamp page back in range if data or pageSize shrinks (e.g. resize, filter change)
  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return combined.slice(start, start + pageSize);
  }, [combined, page, pageSize]);

  const goToPage = (nextPage) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  const goPrev = () => goToPage(page - 1);
  const goNext = () => goToPage(page + 1);

  const handleItemClick = (item) => {
    if (item.__type === "report") {
      onReportClick?.(item.id);
    } else {
      onAuditClick?.(item.room_id, item.id);
    }
  };

  const getItemSummary = (item) => {
    const isReport = item.__type === "report";

    const description = isReport
      ? item.log_name
      : `Room ${item.room_id} · ${item.audit_no}`;

    const primaryCount = isReport
      ? (item.report_count ?? 0)
      : (item.audited_count ?? 0);

    const missingCount = item.missing_count ?? 0;
    const damagedCount = item.damaged_count ?? 0;

    const secondaryCount = isReport
      ? Math.max(missingCount, damagedCount)
      : (item.discrepancy_count ?? 0);

    const secondaryLabel = isReport
      ? missingCount >= damagedCount
        ? "missing"
        : "damaged"
      : "discrepancies";

    return {
      isReport,
      description,
      primaryCount,
      secondaryCount,
      secondaryLabel,
    };
  };

  return {
    items: paginated,
    totalCount: combined.length,
    page,
    totalPages,
    pageSize,
    goPrev,
    goNext,
    goToPage,
    handleItemClick,
    getItemSummary,
  };
}
