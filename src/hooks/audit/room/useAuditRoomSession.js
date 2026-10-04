import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { addAuditRoom, assertNoOpenAuditInRoom } from "../../../services/audit";
import { subscribeToAssetsInRoom } from "../../../services/room";
import useRoomOverview from "./useRoomOverview";

function useAuditRoomSession(roomID) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetsError, setAssetsError] = useState(null);
  const [creating, setCreating] = useState(false);
  const { topCustodian } = useRoomOverview(roomID);

  // status modal state
  const [addStatus, setAddStatus] = useState(null);
  const [addError, setAddError] = useState(null);
  const [addErrorTitle, setAddErrorTitle] = useState(undefined);
  const [createdAuditID, setCreatedAuditID] = useState(null);

  useEffect(() => {
    setAssetsLoading(true);
    setAssetsError(null);

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

  function failWith(message) {
    setAddError(message);
    setAddStatus("error");
  }

  async function handleCreateAudit() {
    setAddError(null);
    setAddErrorTitle(undefined);
    setCreatedAuditID(null);

    if (!user) {
      failWith("You must be signed in to start an audit.");
      return;
    }
    if (assetsLoading) {
      failWith("Assets are still loading. Please try again in a moment.");
      return;
    }
    if (assetsError) {
      failWith(assetsError);
      return;
    }

    try {
      setCreating(true);
      setAddStatus("loading");

      // Check for an open audit first so the right message wins
      try {
        await assertNoOpenAuditInRoom(roomID);
      } catch (err) {
        setAddErrorTitle("Ongoing audit session found");
        failWith(
          err.message ?? "An audit is already in progress for this room.",
        );
        return;
      }

      if (assets.length === 0) {
        setAddErrorTitle("Zero assets in room");
        throw new Error("No assets found in this room to audit.");
      }

      const fullname = `${user.firstname} ${user.lastname}`;

      const { id: auditID } = await addAuditRoom({
        roomId: roomID,
        roomCustodian: topCustodian,
        assets,
        auditedBy: user.uid,
        auditedByName: fullname,
      });

      setCreatedAuditID(auditID);
      setAddStatus("success");
    } catch (err) {
      failWith(err.message ?? "Failed to create the audit.");
    } finally {
      setCreating(false);
    }
  }

  // Called by the modal's Done / Return button
  function handleStatusClose() {
    const wasSuccess = addStatus === "success";
    const auditID = createdAuditID;

    setAddStatus(null);
    setAddError(null);
    setAddErrorTitle(undefined);

    if (wasSuccess && auditID) {
      navigate(`/audit/room/${roomID}/${auditID}`);
    }
  }

  return {
    handleCreateAudit,
    handleStatusClose,
    addStatus,
    addError,
    addErrorTitle,
    assets,
    assetsLoading,
    assetsError,
    creating,
  };
}

export default useAuditRoomSession;
