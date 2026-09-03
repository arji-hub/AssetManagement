import { useState, useEffect } from "react";
import {
  subscribeToAssetsInRoom,
  fetchRoom,
  archiveRoom,
  restoreRoom,
  editRoom,
} from "../../services/room";
import useRoomOverview from "../audit/room/useRoomOverview";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function useRoomAssets(roomID) {
  const { role } = useAuth();

  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [roomName, setRoomName] = useState(null);
  const [roomStatus, setRoomStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { topCustodian } = useRoomOverview(roomID);

  // ── Edit room name modal state ──
  const [showEditModal, setShowEditModal] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  // ── Archive/Restore modal state ──
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveSubmitting, setArchiveSubmitting] = useState(false);
  const [archiveError, setArchiveError] = useState("");

  const isActive = roomStatus !== "inactive"; // treat missing status as active (pre-migration rooms)

  useEffect(() => {
    if (!roomID) return;

    setLoading(true);
    setError(null);

    fetchRoom(roomID)
      .then((room) => {
        setRoomName(room.name);
        setRoomStatus(room.status ?? "active");
      })
      .catch((err) => setError(err));

    const unsubscribe = subscribeToAssetsInRoom(
      roomID,
      (assets) => {
        setAssets(assets);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [roomID]);

  const handleAuditLogs = () => {
    navigate(`/audit/room/${roomID}`);
  };

  // ── Edit room name handlers ──
  const handleEdit = () => {
    setEditValue(roomName || "");
    setEditError("");
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditError("");
  };

  const handleEditSubmit = async () => {
    setEditSubmitting(true);
    setEditError("");
    try {
      await editRoom(roomID, editValue, role);
      setRoomName(editValue.trim());
      setShowEditModal(false);
    } catch (err) {
      setEditError(err.message || "Failed to update room name.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── Archive/Restore handlers (single button, single modal) ──
  const handleArchiveRoom = () => {
    setArchiveError("");
    setShowArchiveModal(true);
  };

  const handleArchiveClose = () => {
    setShowArchiveModal(false);
    setArchiveError("");
  };

  const handleArchiveConfirm = async () => {
    setArchiveSubmitting(true);
    setArchiveError("");
    try {
      if (isActive) {
        await archiveRoom(roomID, role);
        setRoomStatus("inactive");
        setShowArchiveModal(false);
        navigate("/rooms"); // leave the page since this room is no longer active
      } else {
        await restoreRoom(roomID, role);
        setRoomStatus("active");
        setShowArchiveModal(false);
        // no navigation — stay on page, room is active again
      }
    } catch (err) {
      setArchiveError(
        err.message || `Failed to ${isActive ? "archive" : "restore"} room.`,
      );
    } finally {
      setArchiveSubmitting(false);
    }
  };

  return {
    assets,
    roomName,
    roomStatus,
    isActive,
    loading,
    error,
    topCustodian,
    handleAuditLogs,
    // edit modal
    handleEdit,
    showEditModal,
    editValue,
    setEditValue,
    editSubmitting,
    editError,
    handleEditSubmit,
    handleEditClose,
    // archive/restore modal
    handleArchiveRoom,
    showArchiveModal,
    archiveSubmitting,
    archiveError,
    handleArchiveConfirm,
    handleArchiveClose,
  };
}
