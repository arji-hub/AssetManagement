import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLastAuditRoomDate } from "../../../services/audit";
import { formatTimeAgo } from "../../../services/audit";

export function useAuditRoom() {
  const navigate = useNavigate();
  const [lastEntry, setLastEntry] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchLastAuditRoomDate()
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
    navigate("/audit/room");
  }

  return { lastEntry, handleClick };
}
