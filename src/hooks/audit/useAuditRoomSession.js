import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { addAuditRoom } from "../../services/audit";
import { subscribeToAssetsInRoom } from "../../services/room";
import useRoomOverview from "./useRoomOverview";

function useAuditRoomSession(roomID) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetsError, setAssetsError] = useState(null);
  const [creating, setCreating] = useState(false);
  const { topCustodian } = useRoomOverview(roomID);

  useEffect(() => {
    setAssetsLoading(true);
    const unsubscribe = subscribeToAssetsInRoom(
      roomID,
      (data) => {
        setAssets(data);
        setAssetsLoading(false);
      },
      (err) => {
        setAssetsError(err.message ?? "Failed to load assets.");
        setAssetsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [roomID]);

  async function handleCreateAudit() {
    if (!user) {
      window.alert("You must be signed in to start an audit.");
      return;
    }
    if (assets.length === 0) {
      window.alert("No assets found in this room to audit.");
      return;
    }

    const fullname = `${user.firstname} ${user.lastname}`;

    try {
      setCreating(true);
      const { id: auditID } = await addAuditRoom({
        roomId: roomID,
        roomCustodian: topCustodian,
        assets,
        auditedBy: user.uid,
        auditedByName: fullname,
      });
      console.log("audit created", auditID);
      console.log("navigating to:", `/audit/${roomID}/${auditID}`);
      navigate(`/audit/room/${roomID}/${auditID}`);
    } catch (err) {
      window.alert(`Failed to create audit: ${err.message}`);
    } finally {
      setCreating(false);
    }
  }

  return {
    handleCreateAudit,
    assets,
    assetsLoading,
    assetsError,
    creating,
  };
}

export default useAuditRoomSession;
