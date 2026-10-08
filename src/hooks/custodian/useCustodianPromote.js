import { useState, useEffect } from "react";
import { promoteCustodian } from "../../services/user";
import { useNavigate } from "react-router-dom";
import {
  createPromotionTransferRequest,
  getPromotionBlockers,
} from "../../services/transfer";

export function useCustodianPromote(custodian, assetCount = 0) {
  const navigate = useNavigate();
  const [createdRequestIds, setCreatedRequestIds] = useState([]);
  const id = custodian?.id;

  // ── State ──
  const [promoted, setPromoted] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [promoteStatus, setPromoteStatus] = useState(null); // null | "success" | "error"
  const [promoteError, setPromoteError] = useState(null);

  const isPartTime = custodian?.role === "parttime" && !promoted;
  const hasAssets = assetCount > 0; // used for the button label only

  // Reset when switching to a different custodian
  useEffect(() => {
    setPromoted(false);
  }, [id]);

  // ── Modal controls ──
  const openPromoteModal = () => {
    setPromoteError(null);
    setShowPromoteModal(true);
  };
  const closePromoteModal = () => setShowPromoteModal(false);

  const closePromoteStatus = () => {
    const wasSuccess = promoteStatus === "success";
    const ids = createdRequestIds;

    setPromoteStatus(null);
    setPromoteError(null);
    setCreatedRequestIds([]);

    if (!wasSuccess) return;
    if (ids.length === 1) navigate(`/transfer/${ids[0]}`);
    else if (ids.length > 1) navigate("/transfer");
  };

  // ── Core: check blockers, promote, then create the transfer requests ──
  const runPromote = async ({ withTransfer }) => {
    if (promoting) return;

    setPromoting(true);
    setPromoteError(null);
    setCreatedRequestIds([]);

    let step = "promote";
    try {
      const blockers = await getPromotionBlockers(id);
      if (blockers.length > 0) {
        throw new Error(
          `Cannot promote yet: ${blockers.length} asset(s) have an ongoing transfer request (${blockers.join(", ")}). Resolve them first.`,
        );
      }

      await promoteCustodian(id);
      setPromoted(true);

      if (withTransfer) {
        step = "transfer";
        const created = await createPromotionTransferRequest(id);
        setCreatedRequestIds(created.map((r) => r.id));
      }

      setPromoteStatus("success");
    } catch (err) {
      console.error(`Promote flow failed at "${step}":`, err);
      setPromoteError(
        step === "transfer"
          ? `${custodian?.fullname ?? "The custodian"} was promoted, but the transfer request could not be created: ${err.message}`
          : err.message || "Failed to promote custodian.",
      );
      setPromoteStatus("error");
    } finally {
      setPromoting(false);
    }
  };

  // Always attempt the transfer: createPromotionTransferRequest scans the
  // assets itself and returns [] when there is nothing to move.
  const handlePromoteConfirm = () => runPromote({ withTransfer: true });

  return {
    isPartTime,
    hasAssets,
    assetCount,
    promoting,
    promoteStatus,
    promoteError,
    closePromoteStatus,
    showPromoteModal,
    openPromoteModal,
    closePromoteModal,
    handlePromoteConfirm,
  };
}

export default useCustodianPromote;
