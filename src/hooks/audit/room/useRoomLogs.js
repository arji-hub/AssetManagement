// src/hooks/audit/useRoomLogs.js
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuditRooms } from "../../../services/audit";
import { fetchRooms } from "../../../services/room";

function useRoomLogs() {
  const navigate = useNavigate();

  // ── Rooms ─────────────────────────────────────────────────────────────
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");

  // ── Audit records ────────────────────────────────────────────────────
  const [auditRooms, setAuditRooms] = useState([]);

  // ── Search ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // == Data loading ==========================================================
  useEffect(() => {
    setRoomsLoading(true);
    setRoomsError("");

    Promise.all([fetchRooms(), fetchAuditRooms()])
      .then(([fetchedRooms, fetchedAuditRooms]) => {
        setRooms(fetchedRooms);
        setAuditRooms(fetchedAuditRooms);
      })
      .catch((err) => setRoomsError(err.message ?? "Failed to load rooms."))
      .finally(() => setRoomsLoading(false));
  }, []);

  // == Derived state ==========================================================

  // Most recent audit per room. fetchAuditRooms() already orders by
  // created_at desc, so the first match per room_id is the latest.
  const latestAuditByRoom = useMemo(() => {
    const map = new Map();
    for (const audit of auditRooms) {
      if (!map.has(audit.room_id)) {
        map.set(audit.room_id, audit);
      }
    }
    return map;
  }, [auditRooms]);

  const roomsWithAuditInfo = useMemo(() => {
    return rooms.map((room) => {
      const latestAudit = latestAuditByRoom.get(room.id);
      return {
        ...room,
        audited_at:
          latestAudit?.completed_at ?? latestAudit?.created_at ?? null,
        last_audit_status: latestAudit?.status ?? null,
      };
    });
  }, [rooms, latestAuditByRoom]);

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return roomsWithAuditInfo.filter((room) => {
      const assetCount = room.assetCount ?? room.total_assets ?? 0;
      if (assetCount <= 0) return false;

      if (!query) return true;

      const name = (
        room.name ||
        room.room_name ||
        room.room?.name ||
        ""
      ).toLowerCase();
      return name.includes(query);
    });
  }, [roomsWithAuditInfo, search]);

  // ── Stats for AuditCard row ─────────────────────────────────────────
  const qualifyingRooms = useMemo(
    () =>
      roomsWithAuditInfo.filter(
        (room) => (room.assetCount ?? room.total_assets ?? 0) > 0,
      ),
    [roomsWithAuditInfo],
  );

  const totalAudits = auditRooms.length;

  const roomsNotAudited = useMemo(
    () =>
      qualifyingRooms.filter((room) => !latestAuditByRoom.has(room.id)).length,
    [qualifyingRooms, latestAuditByRoom],
  );

  const avgDiscrepancyRate = useMemo(() => {
    const withAssets = auditRooms.filter(
      (audit) => (audit.total_assets ?? 0) > 0,
    );
    if (withAssets.length === 0) return 0;

    const totalRate = withAssets.reduce(
      (sum, audit) => sum + (audit.discrepancy_count ?? 0) / audit.total_assets,
      0,
    );
    return Math.round((totalRate / withAssets.length) * 100);
  }, [auditRooms]);

  // == Actions ==========================================================

  const handleRoomClick = (roomID) => navigate(`/audit/room/${roomID}`);

  return {
    rooms: filteredRooms,
    roomsLoading,
    roomsError,
    search,
    setSearch,
    handleRoomClick,
    totalAudits,
    roomsNotAudited,
    avgDiscrepancyRate,
  };
}

export default useRoomLogs;
