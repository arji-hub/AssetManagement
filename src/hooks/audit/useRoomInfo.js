import { useState, useEffect, useCallback } from "react";
import { fetchAuditByID } from "../../services/audit";

function useRoomInfo(auditID) {
  const [audit, setAudit] = useState(null);
  const [auditItems, setAuditItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAudit = useCallback(async () => {
    if (!auditID) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchAuditByID(auditID);

      if (!result) {
        setAudit(null);
        setAuditItems([]);
        setError("Audit not found.");
        return;
      }

      const { items, ...auditData } = result;
      setAudit(auditData);
      setAuditItems(items);
    } catch (err) {
      console.error("Failed to fetch audit:", err);
      setError("Failed to load audit info.");
    } finally {
      setLoading(false);
    }
  }, [auditID]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  const totalAssets = audit?.total_assets ?? 0;
  const auditedCount = audit?.audited_count ?? 0;
  const progressPercent =
    totalAssets > 0 ? Math.round((auditedCount / totalAssets) * 100) : 0;

  return {
    auditID,
    audit,
    auditItems,
    loading,
    error,
    refetch: loadAudit,
    totalAssets,
    auditedCount,
    progressPercent,
  };
}

export default useRoomInfo;
