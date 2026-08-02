// src/hooks/room/useRoom.js
import { useState, useEffect } from "react";
import { fetchRooms } from "../../services/room";
import { useRoomFilters } from "./useRoomFilters";
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
  const {
    searchQuery,
    setSearchQuery,
    assetCountFilter,
    setAssetCountFilter,
    filteredRooms,
  } = useRoomFilters(rooms);

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
        { id: savedName, name: savedName, assetCount: 0, roomCustodian: "" },
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

    // filters
    searchQuery,
    setSearchQuery,
    assetCountFilter,
    setAssetCountFilter,
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
