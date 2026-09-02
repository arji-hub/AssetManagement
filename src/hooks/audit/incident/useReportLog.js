import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeToReportLogs } from "../../../services/audit";

function useReportLog() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState(null);

  useEffect(() => {
    setLogsLoading(true);
    setLogsError(null);

    const unsubscribe = subscribeToReportLogs(
      (data) => {
        setLogs(data);
        setLogsLoading(false);
      },
      (err) => {
        setLogsError(err?.message || "Failed to load report logs.");
        setLogsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const term = search.toLowerCase();
    return logs.filter((log) => log.log_name?.toLowerCase().includes(term));
  }, [logs, search]);

  const stats = useMemo(() => {
    return logs.reduce(
      (acc, log) => {
        acc.totalLogs += 1;
        acc.damageReports += log.damaged_count || 0;
        acc.missingReports += log.missing_count || 0;
        return acc;
      },
      { totalLogs: 0, damageReports: 0, missingReports: 0 },
    );
  }, [logs]);

  const handleNewReport = () => {
    navigate("/audit/report/new");
  };

  const handleRowClick = (id) => {
    navigate(`/audit/report/${id}`);
  };

  return {
    search,
    setSearch,
    filteredLogs,
    logsLoading,
    logsError,
    stats,
    handleNewReport,
    handleRowClick,
  };
}

export default useReportLog;
