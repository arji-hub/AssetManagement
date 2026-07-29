import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuditRooms } from "../../services/audit";

export function useAuditSummary() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const startNewAudit = () => {
    navigate("/audit");
  };

  return { ongoingAudits: audits, loading, error, startNewAudit };
}
