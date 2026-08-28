// src/hooks/room/useRoom.js
import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchRooms } from "../../services/room";
import { useRoomRegistration } from "./useRoomRegistration";

export function useRoom() {
  const [showModal, setShowModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRooms()
      .then((data) => setRooms(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Status tabs (Rooms | Archive) ──────────────────────────────
  const [activeFilter, setActiveFilter] = useState("active");

  const handleFilterChange = useCallback((key) => {
    setActiveFilter(key);
  }, []);

  // ── Search ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");

  // ── Asset count filter ─────────────────────────────────────────
  const [assetCountFilter, setAssetCountFilter] = useState("");

  const isActive = (r) => r.status !== "inactive";

  const filteredRooms = useMemo(() => {
    const byTab =
      activeFilter === "archive"
        ? rooms.filter((r) => r.status === "inactive")
        : rooms.filter((r) => isActive(r));

    const bySearch = searchQuery.trim()
      ? byTab.filter((r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : byTab;

    return bySearch.filter((r) => {
      if (assetCountFilter === "none") return r.assetCount === 0;
      if (assetCountFilter === "low")
        return r.assetCount >= 1 && r.assetCount <= 10;
      if (assetCountFilter === "medium")
        return r.assetCount >= 11 && r.assetCount <= 50;
      if (assetCountFilter === "high") return r.assetCount > 50;
      return true;
    });
  }, [rooms, activeFilter, searchQuery, assetCountFilter]);

  const {
    name,
    error: roomError,
    saving,
    handleChange,
    handleSave,
  } = useRoomRegistration({
    existingRooms: rooms.map((r) => r.name),
    onSuccess: (savedName) => {
      setRooms((prev) => [
        ...prev,
        {
          id: savedName,
          name: savedName,
          assetCount: 0,
          roomCustodian: "",
          status: "active",
        },
      ]);
      setShowModal(false);
    },
  });

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return {
    // room list state
    rooms,
    loading,
    error,

    // status tabs
    activeFilter,
    handleFilterChange,

    // search
    searchQuery,
    setSearchQuery,

    // asset count filter
    assetCountFilter,
    setAssetCountFilter,

    // filtered result
    filteredRooms,

    // modal
    showModal,
    openModal,
    closeModal,

    // registration
    name,
    roomError,
    saving,
    handleChange,
    handleSave,
  };
}
