import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function useReportLog() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);

  // TODO: replace with onSnapshot subscription via subscribeToReportLogs()
  const [logs] = useState([]);
  const [logsLoading] = useState(false);
  const [logsError] = useState(null);

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const term = search.toLowerCase();
    return logs.filter(
      (log) =>
        log.log_no?.toLowerCase().includes(term) ||
        log.description?.toLowerCase().includes(term),
    );
  }, [logs, search]);

  const stats = useMemo(() => {
    return logs.reduce(
      (acc, log) => {
        acc.totalLogs += 1;
        acc.damageReports += log.damage_count || 0;
        acc.missingReports += log.missing_count || 0;
        return acc;
      },
      { totalLogs: 0, damageReports: 0, missingReports: 0 },
    );
  }, [logs]);

  const handleNewReport = () => {
    navigate("/audit/report/new");
  };

  return {
    search,
    setSearch,
    filteredLogs,
    logsLoading,
    logsError,
    stats,
    handleNewReport,
  };
}

export default useReportLog;
