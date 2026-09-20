import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchRoomTransferByID } from "../../services/transfer";

/**
 * View-only data for a single transfer_room log (one room move, one or
 * many assets). Room moves have no acknowledgment or approval flow, so
 * unlike useTransferInfo there are no actions here — just load + display.
 */
export function useTransferRoomInfo() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRoomTransferByID(id)
      .then((data) => {
        if (!cancelled) setLog(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // ignore a slow response if the user navigated to another log
    return () => {
      cancelled = true;
    };
  }, [id]);

  const items = log?.items ?? [];

  // move_to === null means the assets were taken out of their room
  const isRemoval = !!log && !log.move_to;
  const typeLabel = isRemoval ? "Removed from room" : "Room move";

  const handleAssetClick = (assetId) => {
    navigate(`/asset/info/${assetId}`);
  };

  return {
    log,
    items,
    loading,
    error,
    isRemoval,
    typeLabel,
    handleAssetClick,
  };
}
