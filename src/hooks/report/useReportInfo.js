import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../data/roles";
import { subscribeToReportByID } from "../../services/report";
import { getReportType } from "../../utils/report";

export function useReportInfo(id) {
  const { role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToReportByID(
      id,
      (data) => {
        setReport(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [id]);

  const openAction = useCallback((status) => setActionModal(status), []);
  const closeAction = useCallback(() => setActionModal(null), []);

  // derived values (safe while report is still null)
  const status = report?.status;
  const isDamaged = status === "damaged";
  const isMissing = status === "missing";
  const isForRepair = status === "for_repair";
  const isResolved = status === "working" || status === "condemned";
  const reportType = report ? getReportType(report) : null;

  // photo from first status_log entry that has an image
  const evidencePhoto = report?.status_log?.find((log) => log.img)?.img ?? null;

  return {
    report,
    loading,
    error,
    reportType,
    evidencePhoto,

    isAdmin,
    isDamaged,
    isMissing,
    isForRepair,
    isResolved,

    actionModal,
    openAction,
    closeAction,
  };
}

export default useReportInfo;
