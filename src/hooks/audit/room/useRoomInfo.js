import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  subscribeToAuditByID,
  updateAuditItem,
  completeAuditSession,
  addUnexpectedDiscrepancy,
  reportDamagedAuditItem,
} from "../../../services/audit";
import { useRoomAssets } from "../../room/useRoomAssets";
import { assetNoDuplicateOpenReport } from "../../../services/report";
import { REPORT_STATUS } from "../../../data/reports";
import { fetchAssetByID, isAssetCondemned } from "../../../services/asset";
import { useNavigate } from "react-router-dom";

function useRoomInfo(auditID) {
  const navigate = useNavigate();
  const [audit, setAudit] = useState(null);
  const [rawAuditItems, setAuditItems] = useState([]);
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
  const [topCustodian, setTopCustodian] = useState(null);

  //complete audit
  const [completingAudit, setCompletingAudit] = useState(false);
  const [completeAuditError, setCompleteAuditError] = useState(null);

  //discrepancy
  const [addingDiscrepancy, setAddingDiscrepancy] = useState(false);
  const [discrepancyItems, setDiscrepancyItems] = useState([]);

  //damage report — { item, origin: "scan" | "table" } while the form is open
  const [reportTarget, setReportTarget] = useState(null);

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
          setDiscrepancyItems([]); // NEW
          setError("Audit not found.");
          return;
        }

        const { items, discrepancyItems, ...auditData } = result;
        setAudit(auditData);
        setAuditItems(items);
        setTopCustodian(auditData.room_custodian);
        setDiscrepancyItems(discrepancyItems);
        setLoading(false);
      },
      () => {
        setError("Failed to load audit info.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [auditID]);

  // ── Open damage reports ────────────────────────────────────────────────────
  // asset ids that already have an open damage report (filed here or elsewhere)
  const [openReportAssets, setOpenReportAssets] = useState(() => new Set());
  const checkedAssetsRef = useRef(new Set()); // asset ids already looked up

  // Reuses assetNoDuplicateOpenReport: it throws a plain Error when the asset
  // already has an open report, so a throw WITHOUT a Firebase `code` means
  // "has an open report". Firebase errors (network, permissions) mean unknown.
  const hasOpenDamageReport = useCallback(async (assetId) => {
    try {
      await assetNoDuplicateOpenReport(assetId, REPORT_STATUS.DAMAGED);
      return false;
    } catch (err) {
      return !err?.code;
    }
  }, []);

  const markOpenReport = useCallback((assetId) => {
    checkedAssetsRef.current.add(assetId);
    setOpenReportAssets((prev) => new Set(prev).add(assetId));
  }, []);

  // Look up each audited item that would show a Report button, once per asset.
  useEffect(() => {
    const pending = rawAuditItems
      .filter(
        (i) =>
          i.audit_status === "audited" &&
          !i.report_no &&
          !checkedAssetsRef.current.has(i.asset_id ?? i.id),
      )
      .map((i) => i.asset_id ?? i.id);

    if (pending.length === 0) return;
    pending.forEach((id) => checkedAssetsRef.current.add(id));

    Promise.all(
      pending.map(async (id) => [id, await hasOpenDamageReport(id)]),
    ).then((results) => {
      const open = results.filter(([, isOpen]) => isOpen).map(([id]) => id);
      if (open.length > 0) {
        setOpenReportAssets((prev) => new Set([...prev, ...open]));
      }
    });
  }, [rawAuditItems, hasOpenDamageReport]);

  // Audit items with has_open_report attached when the asset has an open report
  const auditItems = useMemo(
    () =>
      rawAuditItems.map((item) =>
        openReportAssets.has(item.asset_id ?? item.id)
          ? { ...item, has_open_report: true }
          : item,
      ),
    [rawAuditItems, openReportAssets],
  );

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

      if (currentStatus === "audited" || currentStatus === "damaged") {
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

      const matchingDiscrepancy = discrepancyItems.find(
        (item) => item.asset_id === assetId || item.id === assetId,
      );

      if (matchingDiscrepancy) {
        setScannedItem(matchingDiscrepancy);
        setScanModalError(null);
        setScanModalStatus("duplicate");
        setScanModalOpen(true);
        setIsCameraOpen(false);
        return;
      }

      // Not in this audit. Check whether it's condemned before offering
      // to flag it as a discrepancy.
      if (!matchingItem) {
        setScannedItem({ id: assetId, asset_id: assetId });
        setScanModalError(null);
        setScanModalStatus("loading");
        setScanModalOpen(true);
        setIsCameraOpen(false);

        try {
          const asset = await fetchAssetByID(assetId);

          // keep the full asset so the modal can show its details
          const fullItem = {
            ...asset,
            id: assetId,
            asset_id: asset.asset_id ?? assetId,
            registered_room: asset.room_name,
            found_room: roomName,
          };
          setScannedItem(fullItem);

          if (isAssetCondemned(asset)) {
            setScanModalStatus("condemned");
            return;
          }
        } catch {
          // Lookup failed: fall through to the normal not-found flow
        }

        setScanModalError("not_found.");
        setScanModalStatus("error");
        return;
      }

      // Open modal immediately in loading state
      setScannedItem(matchingItem);
      setScanModalError(null);
      setScanModalStatus("loading");
      setScanModalOpen(true);
      setIsCameraOpen(false);

      // Check for an open damage report while the verify write runs
      const assetKey = matchingItem.asset_id ?? matchingItem.id;
      const alreadyHasReport =
        matchingItem.audit_status === "damaged" || !!matchingItem.report_no;
      const openCheck =
        matchingItem.has_open_report || alreadyHasReport
          ? Promise.resolve(!!matchingItem.has_open_report)
          : hasOpenDamageReport(assetKey);

      const result = await handleVerifyItem(
        matchingItem.id,
        matchingItem.audit_status,
      );

      if (await openCheck) {
        markOpenReport(assetKey);
        setScannedItem({ ...matchingItem, has_open_report: true });
      }

      if (result.ok) {
        setScanModalStatus("success");
        return;
      }

      if (result.reason === "already_audited") {
        setScanModalStatus("duplicate");
        return;
      }

      if (result.reason === "no_audit_id") {
        setScanModalError("No active audit session found.");
      } else {
        setScanModalError("Failed to verify asset. Please try again.");
      }

      setScanModalStatus("error");
    },
    [
      auditItems,
      discrepancyItems,
      handleVerifyItem,
      hasOpenDamageReport,
      markOpenReport,
      roomName,
    ],
  );

  const handleScanModalClose = useCallback(() => {
    setScanModalOpen(false);

    if (
      scanModalStatus === "success" ||
      scanModalStatus === "duplicate" ||
      scanModalStatus === "condemned" ||
      scanModalStatus === "discrepancy_added"
    ) {
      setTimeout(() => {
        setIsCameraOpen(true);
      }, 300);
    } else if (scanModalStatus === "error") {
      setTimeout(() => {
        setIsCameraOpen(true);
      }, 500);
    }
  }, [scanModalStatus]);

  const handleCameraClose = useCallback(() => {
    setScanModalOpen(false);
    setIsCameraOpen(false);
  }, []);

  // Calculate stats
  const totalAssets = audit?.total_assets ?? 0;
  const auditedCount = audit?.audited_count ?? 0;
  const progressPercent =
    totalAssets > 0 ? Math.round((auditedCount / totalAssets) * 100) : 0;

  const hasItems = !loading && auditItems.length > 0;

  const handleCompleteAudit = useCallback(async () => {
    if (!auditID || completingAudit) return { ok: false, reason: "blocked" };
    if (audit?.status === "completed")
      return { ok: false, reason: "already_completed" };

    setCompletingAudit(true);
    setCompleteAuditError(null);

    try {
      await completeAuditSession(auditID);
      return { ok: true };
    } catch (err) {
      setCompleteAuditError(
        "Failed to save and complete the audit. Please try again.",
      );
      return { ok: false, error: err };
    } finally {
      setCompletingAudit(false);
    }
  }, [auditID, audit?.status, completingAudit]);

  const handleAddDiscrepancy = useCallback(async () => {
    if (!auditID || !scannedItem) return;

    setAddingDiscrepancy(true);
    try {
      const assetData = await fetchAssetByID(scannedItem.id);

      await addUnexpectedDiscrepancy(auditID, assetData, audit?.room_id);

      setScannedItem((prev) => ({
        ...prev,
        ...assetData,
        room_name: assetData.room_name ?? roomName,
      }));
      setScanModalStatus("discrepancy_added");
    } catch (err) {
      setScanModalError(
        "Failed to record this asset as a discrepancy. Please try again.",
      );
    } finally {
      setAddingDiscrepancy(false);
    }
  }, [auditID, audit?.room_id, scannedItem, roomName]);

  // ── Damage report ──────────────────────────────────────────────────────────
  const isCompleted = audit?.status === "completed";

  // scannedItem is a snapshot taken BEFORE the verify write, so its
  // audit_status is stale. Always look the item up in the live snapshot.
  const scannedAuditItem = useMemo(() => {
    if (!scannedItem) return null;
    return (
      auditItems.find(
        (i) => i.id === scannedItem.id || i.asset_id === scannedItem.asset_id,
      ) ?? null
    );
  }, [scannedItem, auditItems]);

  const canReportScanned =
    !isCompleted &&
    (scanModalStatus === "success" || scanModalStatus === "duplicate") &&
    scannedAuditItem?.audit_status === "audited" &&
    !scannedAuditItem?.report_no &&
    !scannedAuditItem?.has_open_report;

  const handleOpenReport = useCallback((item, origin) => {
    setReportTarget({ item, origin });
    // Close the scan modal directly (NOT via handleScanModalClose, which would
    // reopen the camera). The camera reopens when the report form closes.
    if (origin === "scan") setScanModalOpen(false);
  }, []);

  const handleReportClose = useCallback(() => {
    const origin = reportTarget?.origin;
    setReportTarget(null);
    if (origin === "scan") {
      setTimeout(() => setIsCameraOpen(true), 300);
    }
  }, [reportTarget]);

  const handleSubmitDamageReport = useCallback(
    async ({ narrative, photo }) => {
      if (!auditID || !reportTarget) return { ok: false, reason: "blocked" };

      try {
        const res = await reportDamagedAuditItem({
          auditID,
          itemID: reportTarget.item.id,
          narrative,
          photo,
          reportedBy: audit?.audited_by,
          reportedByName: audit?.audited_by_name,
        });
        return { ok: true, report_no: res.report_no };
      } catch (err) {
        return { ok: false, error: err };
      }
    },
    [auditID, audit?.audited_by, audit?.audited_by_name, reportTarget],
  );

  const handleRowClick = (id) => {
    navigate(`/asset/info/${id}`);
  };

  return {
    audit,
    auditItems,
    loading,
    error,
    totalAssets,
    auditedCount,
    progressPercent,
    roomName,
    topCustodian,
    verifyingId,
    hasItems,
    handleVerifyItem,
    handleRowClick,
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
    handleCameraClose,
    handleAddDiscrepancy,
    addingDiscrepancy,
    discrepancyItems,
    // Complete audit
    completingAudit,
    completeAuditError,
    handleCompleteAudit,
    // Damage report
    reportTarget,
    scannedAuditItem,
    canReportScanned,
    handleOpenReport,
    handleReportClose,
    handleSubmitDamageReport,
  };
}

export default useRoomInfo;
