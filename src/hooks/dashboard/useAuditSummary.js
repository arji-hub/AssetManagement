import { useEffect, useState } from "react";
import { fetchAuditRooms } from "../../services/audit";

export function useAuditSummary() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAuditRooms()
      .then((data) => {
        if (!cancelled) {
          setAudits(data.filter((a) => a.status === "Ongoing"));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ongoingAudits: audits, loading, error };
}