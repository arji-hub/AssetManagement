// src/hooks/audit/room/useRoomLogs.js
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuditRooms } from "../../../services/audit";
import { fetchRooms } from "../../../services/room";

function toMillis(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  if (typeof value?.seconds === "number") return value.seconds * 1000;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

function useRoomLogs() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");

  const [auditRooms, setAuditRooms] = useState([]);

  const [search, setSearch] = useState("");

  // NEW: audit filter mode
  const [auditFilter, setAuditFilter] = useState("recent_desc");
  // "recent_desc" | "recent_asc" | "not_audited"

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

  const roomNameById = useMemo(() => {
    const map = new Map();
    rooms.forEach((room) => {
      map.set(
        room.id,
        room.name || room.room_name || room.room?.name || "Unknown room",
      );
    });
    return map;
  }, [rooms]);

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

    // 1. base filter: has assets + matches search
    let result = roomsWithAuditInfo.filter((room) => {
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

    // 2. apply audit filter mode
    if (auditFilter === "not_audited") {
      result = result.filter((room) => !room.audited_at);
    } else {
      const sorted = [...result].sort((a, b) => {
        const aMs = toMillis(a.audited_at);
        const bMs = toMillis(b.audited_at);

        if (aMs === null && bMs === null) return 0;
        if (aMs === null) return 1;
        if (bMs === null) return -1;

        const diff = bMs - aMs;
        return auditFilter === "recent_asc" ? -diff : diff;
      });
      result = sorted;
    }

    return result;
  }, [roomsWithAuditInfo, search, auditFilter]);

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

  const previousAudits = useMemo(() => {
    return auditRooms
      .map((audit) => ({
        ...audit,
        room_name:
          roomNameById.get(audit.room_id) ?? audit.room_name ?? "Unknown room",
      }))
      .sort(
        (a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0),
      );
  }, [auditRooms, roomNameById]);

  const handleRoomClick = (roomID) => navigate(`/audit/room/${roomID}`);

  return {
    rooms: filteredRooms,
    roomsLoading,
    roomsError,
    search,
    setSearch,
    auditFilter,
    setAuditFilter,
    handleRoomClick,
    totalAudits,
    roomsNotAudited,
    avgDiscrepancyRate,
    previousAudits,
  };
}

export default useRoomLogs;
