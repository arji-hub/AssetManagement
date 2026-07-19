import { useState, useEffect, useCallback } from "react";
import {
  subscribeToAuditByID,
  updateAuditItem,
  completeAuditSession,
} from "../../services/audit";
import { useRoomAssets } from "../room/useRoomAssets";

function useRoomInfo(auditID) {
  const [audit, setAudit] = useState(null);
  const [auditItems, setAuditItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Modal state for the scan flow
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanModalStatus, setScanModalStatus] = useState("loading"); // "loading" | "success" | "error"
  const [scanModalError, setScanModalError] = useState(null);
  const [scannedItem, setScannedItem] = useState(null);

  const { roomName } = useRoomAssets(audit?.room_id);

  //complete audit
  const [completingAudit, setCompletingAudit] = useState(false);
  const [completeAuditError, setCompleteAuditError] = useState(null);

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

  // Auto-close modal and reopen camera after a success OR duplicate result.
  /*useEffect(() => {
    if (
      (scanModalStatus === "success" || scanModalStatus === "duplicate") &&
      scanModalOpen
    ) {
      const timer = setTimeout(() => {
        setScanModalOpen(false);
        setIsCameraOpen(true);
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [scanModalStatus, scanModalOpen]);*/

  // Handle verify item — modal-agnostic. Writes to Firestore and reports
  // back what happened; callers decide what to do with that (modal, toast, etc).
  const handleVerifyItem = useCallback(
    async (itemId, currentStatus) => {
      if (!auditID) {
        return { ok: false, reason: "no_audit_id" };
      }

      if (currentStatus === "audited") {
        return { ok: false, reason: "already_audited" };
      }

      setVerifyingId(itemId);

      try {
        const updateData = {
          audit_status: "audited",
          audited_at: new Date().toISOString(),
        };

        await updateAuditItem(auditID, itemId, updateData);

        return { ok: true };
      } catch (err) {
        console.error("Failed to verify item:", err);
        return { ok: false, reason: "write_failed", error: err };
      } finally {
        setVerifyingId(null);
      }
    },
    [auditID],
  );

  // Handle scan — owns all modal state transitions for the scan flow.
  const handleScan = useCallback(
    async (scannedData) => {
      const assetId = scannedData.substring(scannedData.lastIndexOf("/") + 1);
      const matchingItem = auditItems.find(
        (item) => item.asset_id === assetId || item.id === assetId,
      );

      // Asset not found in this audit — show modal instead of alert()
      if (!matchingItem) {
        setScannedItem({ id: assetId, asset_id: assetId });
        setScanModalError("This asset was not found in this audit session.");
        setScanModalStatus("error");
        setScanModalOpen(true);
        setIsCameraOpen(false);
        return;
      }

      // Open modal immediately in loading state
      setScannedItem(matchingItem);
      setScanModalError(null);
      setScanModalStatus("loading");
      setScanModalOpen(true);
      setIsCameraOpen(false);

      const result = await handleVerifyItem(
        matchingItem.id,
        matchingItem.audit_status,
      );

      if (result.ok) {
        setScanModalStatus("success");
        return;
      }

      // "Already audited" is a distinct, non-error state — the scan worked
      // fine, there's just nothing new to record.
      if (result.reason === "already_audited") {
        setScanModalStatus("duplicate");
        return;
      }

      // Everything else is a genuine failure
      if (result.reason === "no_audit_id") {
        setScanModalError("No active audit session found.");
      } else {
        setScanModalError("Failed to verify asset. Please try again.");
      }

      setScanModalStatus("error");
    },
    [auditItems, handleVerifyItem],
  );

  const handleScanModalClose = useCallback(() => {
    setScanModalOpen(false);
    setIsCameraOpen(true);
  }, []);

  // Calculate stats
  const totalAssets = audit?.total_assets ?? 0;
  const auditedCount = audit?.audited_count ?? 0;
  const progressPercent =
    totalAssets > 0 ? Math.round((auditedCount / totalAssets) * 100) : 0;

  const hasItems = !loading && auditItems.length > 0;

  const handleCompleteAudit = useCallback(async () => {
    if (!auditID || completingAudit) return;
    if (audit?.status === "completed") return;

    setCompletingAudit(true);
    setCompleteAuditError(null);

    try {
      await completeAuditSession(auditID);
      // No local setAudit needed — the onSnapshot subscription in
      // subscribeToAuditByID will pick up the status change automatically.
    } catch (err) {
      console.error("Failed to complete audit:", err);
      setCompleteAuditError(
        "Failed to save and complete the audit. Please try again.",
      );
    } finally {
      setCompletingAudit(false);
    }
  }, [auditID, audit?.status, completingAudit]);

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
    // Modal state
    scanModalOpen,
    setScanModalOpen,
    scanModalStatus,
    scanModalError,
    scannedItem,
    handleScanModalClose,
    // Complete audit
    completingAudit,
    completeAuditError,
    handleCompleteAudit,
  };
}

export default useRoomInfo;
