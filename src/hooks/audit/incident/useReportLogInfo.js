import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchReportLogById } from "../../../services/audit";
import { getName } from "../../../services/user";

function useReportLogInfo() {
  const { logID } = useParams();
  const navigate = useNavigate();

  const [reportLog, setReportLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    async function loadReportLog() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchReportLogById(logID);

        if (!cancelled) {
          const reports = data.reportInfo || [];

          const enrichedReports = await Promise.all(
            reports.map(async (report) => {
              const name = await getName(report.reported_by);
              return {
                ...report,
                reported_by_name: name?.firstname ?? "Unknown",
              };
            }),
          );
          const finalData = {
            ...data,
            reportInfo: enrichedReports,
          };

          setReportLog(finalData);
        }
      } catch (err) {
        if (!cancelled) {
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
    handleRowClick,
  };
}

export default useReportLogInfo;
