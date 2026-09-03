import { useState, useEffect } from "react";
import { subscribeToAssetsInRoom, fetchRoom } from "../../services/room";
import useRoomOverview from "../audit/room/useRoomOverview";
import { useNavigate } from "react-router-dom";

export function useRoomAssets(roomID) {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [roomName, setRoomName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { topCustodian } = useRoomOverview(roomID);

  useEffect(() => {
    if (!roomID) return;

    setLoading(true);
    setError(null);

    fetchRoom(roomID)
      .then((room) => setRoomName(room.name))
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

  const handleEdit = () => {};

  const handleArchiveRoom = async () => {
    // confirm + Firestore update (e.g. rooms/{roomID}.status = "archived")
    // navigate away afterward if needed
  };

  return {
    assets,
    roomName,
    loading,
    error,
    topCustodian,
    handleAuditLogs,
    handleEdit,
    handleArchiveRoom,
  };
}
