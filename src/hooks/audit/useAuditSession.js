import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRoom, subscribeToAssetsInRoom } from "../../services/room";
import { addAuditRoom } from "../../services/audit";
import { fetchAssetByID } from "../../services/asset";
import { useAuth } from "../../context/AuthContext";

function useAuditSession(roomId) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Room ──────────────────────────────────────────────────────────────
  const [room, setRoom] = useState(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState("");

  // ── Assets ────────────────────────────────────────────────────────────
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetsError, setAssetsError] = useState("");

  // ── Audit progress ────────────────────────────────────────────────────
  const [auditedAssetIds, setAuditedAssetIds] = useState(new Set());

  // ── Misplaced assets (scanned but not part of this room) ────────────────
  const [misplacedAssets, setMisplacedAssets] = useState([]);

  // ── Completion ────────────────────────────────────────────────────────
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState("");

  // == Data loading ==========================================================

  useEffect(() => {
    if (!roomId) return;

    setRoomLoading(true);
    setRoomError("");

    fetchRoom(roomId)
      .then(setRoom)
      .catch((err) => setRoomError(err.message ?? "Failed to load room."))
      .finally(() => setRoomLoading(false));
  }, [roomId]);

  useEffect(() => {
    if (!roomId) {
      setAssetsLoading(false);
      return;
    }

    setAssetsLoading(true);

    const unsubscribe = subscribeToAssetsInRoom(
      roomId,
      (result) => {
        setAssets(result);
        setAssetsLoading(false);
      },
      (err) => {
        setAssetsError(err.message ?? "Failed to load assets.");
        setAssetsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [roomId]);

  // == Derived state ==========================================================

  const totalAssets = assets.length;
  const auditedCount = auditedAssetIds.size;
  const isAllAudited = totalAssets > 0 && auditedCount === totalAssets;
  const progressPercent =
    totalAssets === 0 ? 0 : Math.round((auditedCount / totalAssets) * 100);

  const validAssetIds = useMemo(
    () => new Set(assets.map((asset) => asset.id)),
    [assets],
  );

  const assetRows = useMemo(() => {
    const roomRows = assets.map((asset) => ({
      ...asset,
      isAudited: auditedAssetIds.has(asset.id),
      isMisplaced: false,
    }));

    const misplacedRows = misplacedAssets.map((asset) => ({
      ...asset,
      isAudited: true,
      isMisplaced: true,
    }));

    return [...roomRows, ...misplacedRows];
  }, [assets, auditedAssetIds, misplacedAssets]);

  // == Actions ==========================================================

  const handleScanAsset = useCallback((assetId) => {
    setAuditedAssetIds((prev) => new Set(prev).add(assetId));
  }, []);

  const handleAssetDetected = useCallback(
    async (assetId) => {
      // Belongs to this room — normal audit flow.
      if (validAssetIds.has(assetId)) {
        handleScanAsset(assetId);
        return;
      }

      // Already flagged as misplaced earlier in this session — don't re-fetch.
      setMisplacedAssets((prev) => {
        if (prev.some((asset) => asset.id === assetId)) return prev;
        return prev;
      });

      try {
        const asset = await fetchAssetByID(assetId);

        setMisplacedAssets((prev) => {
          if (prev.some((a) => a.id === assetId)) return prev;
          return [...prev, asset];
        });
      } catch (err) {
        console.error(
          "[useAuditSession] failed to fetch misplaced asset:",
          err,
        );
      }
    },
    [validAssetIds, handleScanAsset],
  );

  const handleDiscard = useCallback(() => {
    navigate("/audit/room");
  }, [navigate]);

  const handleProceed = useCallback(async () => {
    setIsCompleting(true);
    setCompleteError("");
    console.log("saving audit...");
    try {
      const result = await addAuditRoom({
        roomId,
        assets,
        auditedAssetIds,
        misplacedAssets,
        auditedBy: user?.uid ?? null,
        auditedByName: user
          ? `${user.firstname} ${user.lastname}`.trim()
          : null,
      });

      console.log("[useAuditSession] audit saved:", result);
      navigate("/audit/room");
    } catch (err) {
      console.error("[useAuditSession] handleProceed error:", err);
      setCompleteError(err.message ?? "Failed to save audit. Try again.");
    } finally {
      setIsCompleting(false);
    }
  }, [
    isAllAudited,
    navigate,
    roomId,
    assets,
    auditedAssetIds,
    misplacedAssets,
  ]);

  return {
    // room
    room,
    roomLoading,
    roomError,
    // assets
    assetRows,
    assetsLoading,
    assetsError,
    totalAssets,
    auditedCount,
    progressPercent,
    validAssetIds,
    isAllAudited,
    // scan
    handleAssetDetected,
    handleScanAsset,
    // completion
    isCompleting,
    completeError,
    handleDiscard,
    handleProceed,
  };
}

export default useAuditSession;
