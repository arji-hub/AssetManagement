import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  subscribeToAssetsByCustodian,
  findCustodian,
  archiveCustodian,
  restoreCustodian,
} from "../../services/user";
import { useAuth } from "../../context/AuthContext";

export function useCustodianAssets(username) {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [custodian, setCustodian] = useState(null);
  const [custodianStatus, setCustodianStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Archive/Restore modal state ──
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveSubmitting, setArchiveSubmitting] = useState(false);
  const [archiveError, setArchiveError] = useState("");

  const custodianID = custodian?.id ?? null;
  const isActive = custodianStatus !== "inactive";

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;

    async function start() {
      setLoading(true);
      setError(null);
      setCustodian(null);

      try {
        const found = await findCustodian(username);

        if (cancelled) return;

        if (!found) {
          setError(new Error("Custodian not found."));
          setLoading(false);
          return;
        }

        setCustodian(found);
        setCustodianStatus(found.status ?? "active");

        unsubscribe = subscribeToAssetsByCustodian(
          found.id,
          (assets) => {
            setAssets(assets);
            setLoading(false);
          },
          (err) => {
            setError(err);
            setLoading(false);
          },
        );
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    }

    if (username) start();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [username]);

  // ── Archive/Restore handlers (single button, single modal) ──
  const handleArchiveCustodian = () => {
    setArchiveError("");
    setShowArchiveModal(true);
  };

  const handleArchiveClose = () => {
    setShowArchiveModal(false);
    setArchiveError("");
  };

  const handleArchiveConfirm = async () => {
    setArchiveSubmitting(true);
    setArchiveError("");
    try {
      if (isActive) {
        await archiveCustodian(custodianID, role);
        setCustodianStatus("inactive");
        setShowArchiveModal(false);
        navigate("/custodian");
      } else {
        await restoreCustodian(custodianID, role);
        setCustodianStatus("active");
        setShowArchiveModal(false);
      }
    } catch (err) {
      setArchiveError(
        err.message ||
          `Failed to ${isActive ? "archive" : "restore"} custodian.`,
      );
    } finally {
      setArchiveSubmitting(false);
    }
  };

  return {
    assets,
    custodian,
    isActive,
    loading,
    error,
    handleArchiveCustodian,
    showArchiveModal,
    archiveSubmitting,
    archiveError,
    handleArchiveConfirm,
    handleArchiveClose,
  };
}
