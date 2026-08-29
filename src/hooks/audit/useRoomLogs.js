import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuditRooms } from "../../services/audit";
import { fetchRooms } from "../../services/room";

function useRoomLogs() {
  const navigate = useNavigate();

  // ── Rooms ─────────────────────────────────────────────────────────────
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");

  // ── Search ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // == Data loading ==========================================================
  useEffect(() => {
    setRoomsLoading(true);
    setRoomsError("");

    fetchRooms()
      .then(setRooms)
      .catch((err) => setRoomsError(err.message ?? "Failed to load rooms."))
      .finally(() => setRoomsLoading(false));
  }, []);

  // == Derived state ==========================================================

  // == Actions ==========================================================

  const handleRoomClick = (roomID) => navigate(`/audit/room/${roomID}`);

  return {
    rooms,
    roomsLoading,
    roomsError,
    search,
    setSearch,
    handleRoomClick,
  };
}

export default useRoomLogs;
