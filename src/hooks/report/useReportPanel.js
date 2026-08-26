import { useState, useMemo, useEffect } from "react";
import useResponsivePageSize from "../shared/useResponsivePageSize";
import { STATUS_GROUPS } from "../../data/reports";
import { getReportType } from "../../utils/report";

export default function useReportPanel({
  group = "incident",
  statusFilter = "all",
  reports = [],
  desktopPageSize = 10,
  mobilePageSize = 5,
} = {}) {
  const pageSize = useResponsivePageSize(desktopPageSize, mobilePageSize);
  const [page, setPage] = useState(1);

  const allowedStatuses = STATUS_GROUPS[group] || [];

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (!allowedStatuses.includes(r.status)) return false;
      if (statusFilter === "all") return true;
      if (Array.isArray(statusFilter))
        return statusFilter.includes(getReportType(r));
      return getReportType(r) === statusFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, group, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));

  // Clamp page back in range if data or pageSize shrinks (e.g. resize, filter change)
  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  // Jump back to page 1 whenever the active group/tab or status filter changes
  useEffect(() => {
    setPage(1);
  }, [group, statusFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, page, pageSize]);

  const goToPage = (nextPage) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  const goPrev = () => goToPage(page - 1);
  const goNext = () => goToPage(page + 1);

  return {
    items: paginated,
    totalCount: filteredReports.length,
    page,
    totalPages,
    pageSize,
    goPrev,
    goNext,
    goToPage,
  };
}
