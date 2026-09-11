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
  const [custodianID, setCustodianID] = useState(null);
  const [fullname, setFullname] = useState(null);
  const [email, setEmail] = useState(null);
  const [custodianStatus, setCustodianStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Archive/Restore modal state ──
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveSubmitting, setArchiveSubmitting] = useState(false);
  const [archiveError, setArchiveError] = useState("");

  const isActive = custodianStatus !== "inactive";

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;

    async function start() {
      setLoading(true);
      setError(null);
      setFullname(null);

      try {
        const custodian = await findCustodian(username);

        if (cancelled) return;

        if (!custodian) {
          setError(new Error("Custodian not found."));
          setLoading(false);
          return;
        }

        setCustodianID(custodian.id);
        setFullname(custodian.fullname);
        setEmail(custodian.email);
        setCustodianStatus(custodian.status ?? "active");

        unsubscribe = subscribeToAssetsByCustodian(
          custodian.id,
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
    fullname,
    email,
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
