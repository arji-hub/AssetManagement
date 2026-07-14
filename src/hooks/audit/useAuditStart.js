import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchRoom,
  fetchRooms,
  fetchRoomsByLastAudited,
} from "../../services/room";

function useAuditStart() {
  const navigate = useNavigate();
  const roomInputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [roomSearch, setRoomSearch] = useState("");
  const [roomResults, setRoomResults] = useState([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  // full room list, for the autocomplete dropdown (like custodianOptions in TransferModal)
  const [roomOptions, setRoomOptions] = useState([]);

  // top 3 rooms with the oldest last_audited_at
  const [suggestedRooms, setSuggestedRooms] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);

  // load room list + suggested rooms once the modal opens
  useEffect(() => {
    if (!isOpen) return;

    fetchRooms()
      .then(setRoomOptions)
      .catch((err) => console.error("Failed to load room list:", err));

    setSuggestedLoading(true);
    fetchRoomsByLastAudited(false, 3)
      .then(setSuggestedRooms)
      .catch((err) => console.error("Failed to load suggested rooms:", err))
      .finally(() => setSuggestedLoading(false));
  }, [isOpen]);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
    setRoomSearch("");
    setRoomResults([]);
    setRoomError("");
    setSelectedRoom(null);
  }

  async function handleFindRoom() {
    const trimmed = roomSearch.trim();
    if (!trimmed || roomLoading) return;

    setRoomLoading(true);
    setRoomError("");
    setSelectedRoom(null);

    try {
      const room = await fetchRoom(trimmed);

      setRoomResults([
        {
          room_id: room.id,
          room_name: room.name,
          last_audited_at: room.last_audited_at ?? null,
        },
      ]);
    } catch (err) {
      setRoomResults([]);
      setRoomError(
        err.message ?? "No rooms found matching that name or number.",
      );
    } finally {
      setRoomLoading(false);
    }
  }

  function handleRoomSearchKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFindRoom();
    }
  }

  // used by both the autocomplete dropdown and the suggested-rooms list —
  // we already have the room's data, so skip the find-button round trip
  function handleSelectRoom(room) {
    const normalized = {
      room_id: room.id ?? room.room_id,
      room_name: room.name ?? room.room_name,
      last_audited_at: room.last_audited_at ?? null,
    };

    setRoomSearch(normalized.room_name);
    setRoomResults([normalized]);
    setSelectedRoom(normalized);
    setRoomError("");
  }

  function handleProceed() {
    if (!selectedRoom) return;
    navigate(`/audit/room/${selectedRoom.room_id}`);
    handleClose();
  }

  return {
    roomInputRef,
    isOpen,
    roomSearch,
    setRoomSearch,
    roomResults,
    roomLoading,
    roomError,
    selectedRoom,
    setSelectedRoom,
    roomOptions,
    suggestedRooms,
    suggestedLoading,
    handleOpen,
    handleClose,
    handleFindRoom,
    handleRoomSearchKeyDown,
    handleSelectRoom,
    handleProceed,
  };
}

export default useAuditStart;
