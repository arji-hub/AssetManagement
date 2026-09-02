import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeToReports } from "../../../services/report";
import { generateReportLog } from "../../../services/audit";

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
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedIds, setSelectedIds] = useState(new Set());

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [logName, setLogName] = useState("");

  // status: null | "loading" | "success" | "error"
  const [generateStatus, setGenerateStatus] = useState(null);
  const [generateErrorMessage, setGenerateErrorMessage] = useState(null);
  const [generatedLogId, setGeneratedLogId] = useState(null);

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

  // Select all/deselect all applies to the FULL filtered set
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

  const clearSelectedReports = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const openGenerateModal = useCallback(() => {
    setIsGenerateModalOpen(true);
  }, []);

  const closeGenerateModal = useCallback(() => {
    setIsGenerateModalOpen(false);
    setLogName("");
  }, []);

  const handleGenerate = useCallback(async () => {
    const selectedReportIds = Array.from(selectedIds);
    const trimmedName = logName.trim();

    // Swap the name-input modal for the status modal
    setIsGenerateModalOpen(false);
    setGenerateStatus("loading");
    setGenerateErrorMessage(null);

    try {
      const logId = await generateReportLog(trimmedName, selectedReportIds);
      setGeneratedLogId(logId);
      setGenerateStatus("success");
    } catch (err) {
      setGenerateErrorMessage(
        err?.message || "An unexpected error occurred. Please try again.",
      );
      setGenerateStatus("error");
    }
  }, [selectedIds, logName]);

  // "Done" on success -> go to the new log. "Try Again" on error -> back to the name modal.
  const closeStatusModal = useCallback(() => {
    if (generateStatus === "success" && generatedLogId) {
      const logId = generatedLogId;
      setGenerateStatus(null);
      setGenerateErrorMessage(null);
      setGeneratedLogId(null);
      setLogName("");
      navigate(`/audit/report/${logId}`);
      return;
    }

    if (generateStatus === "error") {
      setGenerateStatus(null);
      setGenerateErrorMessage(null);
      setIsGenerateModalOpen(true);
      return;
    }

    setGenerateStatus(null);
    setGenerateErrorMessage(null);
  }, [generateStatus, generatedLogId, navigate]);

  const handleReportClick = (reportId) => {
    navigate(`/report/${reportId}`);
  };

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
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelectedReports,
    allFilteredSelected,
    isGenerateModalOpen,
    logName,
    setLogName,
    openGenerateModal,
    closeGenerateModal,
    handleGenerate,
    generateStatus,
    generateErrorMessage,
    closeStatusModal,
    handleReportClick,
  };
}

export default useReportLogCreate;
