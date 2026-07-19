import { useState, useEffect, useCallback } from "react";
import { subscribeToAuditByID, updateAuditItem } from "../../services/audit";
import { useRoomAssets } from "../room/useRoomAssets";

function useRoomInfo(auditID) {
  const [audit, setAudit] = useState(null);
  const [auditItems, setAuditItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const { roomName } = useRoomAssets(audit?.room_id);

  // Real-time subscription
  useEffect(() => {
    if (!auditID) {
      setAudit(null);
      setAuditItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToAuditByID(
      auditID,
      (result) => {
        if (!result) {
          setAudit(null);
          setAuditItems([]);
          setError("Audit not found.");
          return;
        }

        const { items, ...auditData } = result;
        setAudit(auditData);
        setAuditItems(items);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch audit:", err);
        setError("Failed to load audit info.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [auditID]);

  // Handle verify item
  const handleVerifyItem = useCallback(
    async (itemId, currentStatus) => {
      console.log("=== handleVerifyItem called ===");
      console.log("itemId:", itemId);
      console.log("currentStatus:", currentStatus);
      console.log("auditID:", auditID);

      // Only return early if already audited or no auditID
      if (!auditID || currentStatus === "audited") {
        console.log("Early return triggered:");
        console.log("  - auditID missing:", !auditID);
        console.log("  - already audited:", currentStatus === "audited");
        return;
      }

      console.log("Proceeding with verification...");
      setVerifyingId(itemId);

      try {
        const updateData = {
          audit_status: "audited",
          audited_at: new Date().toISOString(),
        };
        console.log("Calling updateAuditItem with:", updateData);

        await updateAuditItem(auditID, itemId, updateData);

        console.log("Update successful for itemId:", itemId);
      } catch (err) {
        console.error("Failed to verify item:", err);
      } finally {
        setVerifyingId(null);
        console.log("=== handleVerifyItem completed ===");
      }
    },
    [auditID],
  );

  const handleScan = (scannedData) => {
    const assetId = scannedData.substring(scannedData.lastIndexOf("/") + 1);
    const matchingItem = auditItems.find(
      (item) => item.asset_id === assetId || item.id === assetId,
    );
    if (matchingItem) {
      handleVerifyItem(matchingItem.id, matchingItem.audit_status);
      setIsCameraOpen(false);
    } else {
      alert("Asset ID not found in this audit");
    }
  };

  // Calculate stats
  const totalAssets = audit?.total_assets ?? 0;
  const auditedCount = audit?.audited_count ?? 0;
  const progressPercent =
    totalAssets > 0 ? Math.round((auditedCount / totalAssets) * 100) : 0;

  const hasItems = !loading && auditItems.length > 0;

  return {
    audit,
    auditItems,
    loading,
    error,
    totalAssets,
    auditedCount,
    progressPercent,
    roomName,
    verifyingId,
    hasItems,
    handleVerifyItem,
    handleScan,
    isCameraOpen,
    setIsCameraOpen,
  };
}

export default useRoomInfo;
