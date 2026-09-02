import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLastReportLogDate, formatTimeAgo } from "../../../services/audit";

export function useReport() {
  const navigate = useNavigate();
  const [lastEntry, setLastEntry] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchLastReportLogDate()
      .then((date) => {
        if (!cancelled) setLastEntry(formatTimeAgo(date));
      })
      .catch(() => {
        if (!cancelled) setLastEntry(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleClick() {
    navigate("/audit/report");
  }

  return { lastEntry, handleClick };
}
