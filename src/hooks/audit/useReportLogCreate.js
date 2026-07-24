import { useState, useEffect, useMemo, useCallback } from "react";
import { subscribeToReports } from "../../services/report";

const PAGE_SIZE = 10;

function getReportType(report) {
  const firstStatus = report.status_log?.[0]?.status;
  if (firstStatus === "damaged") return "damaged";
  if (firstStatus === "missing") return "missing";
  return "unknown";
}

// Firestore Timestamp -> JS Date, safely
function toDateSafe(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function useReportLogCreate() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [logName, setLogName] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToReports(
      undefined,
      (data) => {
        setReports(data);
        setLoading(false);
      },
      (err) => {
        setError(err?.message || "Failed to load reports");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();

    const rangeStart = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const rangeEnd = endDate ? new Date(`${endDate}T23:59:59.999`) : null;

    return reports
      .map((report) => ({ ...report, type: getReportType(report) }))
      .filter((report) => {
        if (typeFilter !== "all" && report.type !== typeFilter) return false;

        if (rangeStart || rangeEnd) {
          const reportDate = toDateSafe(report.created_at);
          if (!reportDate) return false;
          if (rangeStart && reportDate < rangeStart) return false;
          if (rangeEnd && reportDate > rangeEnd) return false;
        }

        if (term) {
          const haystack = [
            report.report_no,
            report.asset_id,
            report.description,
            report.reported_by_name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!haystack.includes(term)) return false;
        }

        return true;
      });
  }, [reports, search, typeFilter, startDate, endDate]);

  // Reset to page 1 whenever filters change the result set
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));

  // Clamp in case filteredReports shrinks (e.g. realtime update) below current page
  const safePage = Math.min(currentPage, totalPages);

  const paginatedReports = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, safePage]);

  const goToPage = useCallback(
    (page) => {
      setCurrentPage(Math.min(Math.max(1, page), totalPages));
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    goToPage(safePage + 1);
  }, [goToPage, safePage]);

  const prevPage = useCallback(() => {
    goToPage(safePage - 1);
  }, [goToPage, safePage]);

  // Select all/deselect all applies to the FULL filtered set, not just the current page
  const allFilteredSelected =
    filteredReports.length > 0 &&
    filteredReports.every((report) => selectedIds.has(report.id));

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredReports.forEach((report) => next.delete(report.id));
      } else {
        filteredReports.forEach((report) => next.add(report.id));
      }
      return next;
    });
  }, [allFilteredSelected, filteredReports]);

  const openGenerateModal = useCallback(() => {
    setIsGenerateModalOpen(true);
  }, []);

  const closeGenerateModal = useCallback(() => {
    setIsGenerateModalOpen(false);
    setLogName("");
  }, []);

  const handleGenerate = useCallback(() => {
    const selectedReportIds = Array.from(selectedIds);
    console.log("Log name:", logName.trim());
    console.log("Selected report IDs:", selectedReportIds);
    console.log("Total selected:", selectedReportIds.length);
    closeGenerateModal();
  }, [selectedIds, logName, closeGenerateModal]);

  return {
    loading,
    error,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredReports,
    paginatedReports,
    currentPage: safePage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    allFilteredSelected,
    isGenerateModalOpen,
    logName,
    setLogName,
    openGenerateModal,
    closeGenerateModal,
    handleGenerate,
  };
}

export default useReportLogCreate;
