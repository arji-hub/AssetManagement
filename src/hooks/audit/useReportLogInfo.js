import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchReportLogById } from "../../services/audit";

const PAGE_SIZE = 10;

function useReportLogInfo() {
  const { logID } = useParams();
  const navigate = useNavigate();

  const [reportLog, setReportLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function loadReportLog() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchReportLogById(logID);
        if (!cancelled) {
          setReportLog(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load report log.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (logID) {
      loadReportLog();
    } else {
      setError("No report log ID found in the URL.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [logID]);

  const reports = reportLog?.reportInfo ?? [];

  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !term ||
        report.report_no?.toLowerCase().includes(term) ||
        report.description?.toLowerCase().includes(term);

      const matchesType = typeFilter === "all" || report.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [reports, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter]);

  const goToPage = useCallback(
    (page) => {
      setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleRowClick = useCallback(
    (reportId) => {
      navigate(`/report/${reportId}`);
    },
    [navigate],
  );

  return {
    reportLog,
    loading,
    error,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    filteredReports,
    paginatedReports,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    handleRowClick,
  };
}

export default useReportLogInfo;
