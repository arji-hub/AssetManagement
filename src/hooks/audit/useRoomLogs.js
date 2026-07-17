import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuditRooms } from "../../services/audit";

function useRoomLogs() {
  const navigate = useNavigate();

  // ── Logs ──────────────────────────────────────────────────────────────
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState("");

  // ── Search ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // == Data loading ==========================================================

  useEffect(() => {
    setLogsLoading(true);
    setLogsError("");

    fetchAuditRooms()
      .then(setLogs)
      .catch((err) => setLogsError(err.message ?? "Failed to load audit logs."))
      .finally(() => setLogsLoading(false));
  }, []);

  // == Derived state ==========================================================

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return logs;

    const result = logs.filter((log) =>
      [log.room_id, log.audited_by_name]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term)),
    );

    return result;
  }, [logs, search]);

  const stats = useMemo(() => {
    const totalAudits = logs.length;
    const roomsPending = logs.filter(
      (log) => log.status === "in_progress",
    ).length;

    const discrepancyCount = logs.filter((log) => log.has_discrepancies).length;
    const avgDiscrepancyRate =
      totalAudits === 0
        ? 0
        : Math.round((discrepancyCount / totalAudits) * 100);

    return {
      totalAudits,
      roomsPending,
      avgDiscrepancyRate,
    };
  }, [logs]);

  // == Actions ==========================================================

  const handleLogAction = useCallback(
    (log) => {
      navigate(`/audit/room/${log.room_id}`);
    },
    [navigate],
  );

  const handleHistoryRowClick = (roomID, auditID) =>
    navigate(`/audit/room/${roomID}/${auditID}`);

  return {
    filteredLogs,
    logsLoading,
    logsError,
    search,
    setSearch,
    stats,
    handleLogAction,
    handleHistoryRowClick,
  };
}

export default useRoomLogs;
