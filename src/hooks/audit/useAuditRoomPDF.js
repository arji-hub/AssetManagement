import { useState, useEffect } from "react";
import { subscribeToAuditByID } from "../../services/audit";

function useAuditRoomPDF(auditID) {
  const [audit, setAudit] = useState(null);
  const [items, setItems] = useState([]);
  const [discrepancyItems, setDiscrepancyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auditID) {
      setAudit(null);
      setItems([]);
      setDiscrepancyItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToAuditByID(
        auditID,
        (result) => {
          if (!result) {
            setAudit(null);
            setItems([]);
            setDiscrepancyItems([]);
            setError("Audit not found.");
            setLoading(false);
            return;
          }

          const {
            items: auditItems,
            discrepancyItems: discrepancies,
            ...auditData
          } = result;

          setAudit(auditData);
          setItems(auditItems || []);
          setDiscrepancyItems(discrepancies || []);
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error("Failed to fetch audit for PDF:", err);
          setError("Failed to load audit data.");
          setLoading(false);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Subscription error:", err);
      setError("Failed to subscribe to audit data.");
      setLoading(false);
    }
  }, [auditID]);

  const hookReturn = {
    audit,
    items,
    discrepancyItems,
    loading,
    error,
    roomName: audit?.room_id || "—",
    auditNo: audit?.audit_no || "—",
    auditedByName: audit?.audited_by_name || "—",
    // Convert Firestore Timestamp to ISO string for PDF
    completedAt:
      audit?.completed_at?.toDate?.()?.toISOString?.() ||
      new Date().toISOString(),
    totalAssets: audit?.total_assets ?? 0,
    auditedCount: audit?.audited_count ?? 0,
    discrepancyCount: audit?.discrepancy_count ?? 0,
    // Additional useful data
    hasDiscrepancies: audit?.has_discrepancies ?? false,
    status: audit?.status || "pending",
    roomCustodian: audit?.room_custodian || null,
  };

  return hookReturn;
}

export default useAuditRoomPDF;
