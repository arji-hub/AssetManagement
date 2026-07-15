import { useState, useEffect, useMemo } from "react";
import { fetchRoom, subscribeToAssetsInRoom } from "../../services/room";
import { fetchAuditRoomsByRoomID } from "../../services/audit";

function useRoomOverview(roomId) {
  // ── Room ──────────────────────────────────────────────────────────────
  const [room, setRoom] = useState(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState("");

  // ── Assets ────────────────────────────────────────────────────────────
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetsError, setAssetsError] = useState("");

  // ── Previous audits ───────────────────────────────────────────────────
  const [previousAudits, setPreviousAudits] = useState([]);
  const [auditsLoading, setAuditsLoading] = useState(true);
  const [auditsError, setAuditsError] = useState("");

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

  useEffect(() => {
    if (!roomId) {
      setAuditsLoading(false);
      return;
    }
    setAuditsLoading(true);
    setAuditsError("");

    fetchAuditRoomsByRoomID(roomId)
      .then(setPreviousAudits)
      .catch((err) => setAuditsError(err.message ?? "Failed to load audits."))
      .finally(() => setAuditsLoading(false));
  }, [roomId]);

  // == Derived state ==========================================================

  const totalAssets = assets.length;

  // Custodian holding the most assets in this room
  const topCustodian = useMemo(() => {
    if (assets.length === 0) return null;

    const counts = new Map();
    assets.forEach((asset) => {
      const name = asset.custodian_name || asset.name || "Unassigned";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });

    let best = null;
    for (const [name, count] of counts) {
      if (!best || count > best.count) best = { name, count };
    }
    return best;
  }, [assets]);

  // Last audited date — prefer the most recent completed audit
  const lastAuditedAt = useMemo(() => {
    if (previousAudits.length === 0) return null;
    return previousAudits[0].completed_at ?? previousAudits[0].created_at ?? null;
  }, [previousAudits]);

  return {
    room,
    roomLoading,
    roomError,
    assets,
    assetsLoading,
    assetsError,
    totalAssets,
    topCustodian,
    previousAudits,
    auditsLoading,
    auditsError,
    lastAuditedAt,
  };
}

export default useRoomOverview;